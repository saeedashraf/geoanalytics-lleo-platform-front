import { AnalysisQuery, AnalysisResults, GalleryItem, SessionAnalysis } from '@/types/analysis';

// API configuration - MUST BE FIRST!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configuration based on environment
const isGCP = API_BASE_URL.includes('run.app');
const API_TIMEOUT = 600000; // 10 minutes for both GCP and local
const MAX_RETRIES = isGCP ? 3 : 1;

interface ProgressCallback {
  (progress: number, message: string): void;
}

// Utility function for retrying API calls
async function fetchWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryableError = error.message.includes('fetch') ||
                              error.message.includes('timeout') ||
                              error.message.includes('network') ||
                              (error.message.includes('HTTP 5') && !error.message.includes('HTTP 404'));

      if (isLastAttempt || !isRetryableError) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.warn(`API call failed (attempt ${attempt + 1}), retrying in ${delay}ms...`, error.message);
      await sleep(delay);
    }
  }

  throw new Error('This should never be reached');
}

// ===== NEW SESSION-BASED ANALYSIS =====

/**
 * Submit analysis request to the enhanced backend API
 * Returns session information instead of direct download
 */
export async function submitAnalysis(
  data: AnalysisQuery,
  credentialsFile: File,
  userId: string = 'default_user',
  onProgress?: ProgressCallback
): Promise<SessionAnalysis> {
  try {
    onProgress?.(10, 'Preparing request...');

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('query', data.query);
    formData.append('user_id', userId);
    formData.append('credentials_file', credentialsFile);
    formData.append('download_data', data.download_data?.toString() || 'true');

    onProgress?.(20, 'Sending to AI-powered backend...');

    // Create abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, API_TIMEOUT);

    try {
      // Submit to enhanced backend with timeout
      console.log('Submitting request to:', `${API_BASE_URL}/analyze`);
      console.log('Request details:', {
        method: 'POST',
        hasCredentialsFile: !!credentialsFile,
        query: data.query.substring(0, 100),
        userId: userId,
        timeout: API_TIMEOUT
      });

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Add explicit headers that might help with CORS/network issues
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData - browser sets it automatically with boundary
        },
        // For GCP, we might need credentials
        credentials: isGCP ? 'omit' : 'same-origin'
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If response is not JSON, use status text
        }

        throw new Error(errorMessage);
      }

      onProgress?.(80, 'Analysis complete, preparing results...');

      // Parse JSON response with session information
      let sessionData: SessionAnalysis;
      try {
        const responseText = await response.text();
        console.log('Raw response from GCP:', responseText.substring(0, 500)); // Log first 500 chars
        sessionData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error('Invalid response format from server. The analysis may have completed but the response is malformed.');
      }

      onProgress?.(100, 'Analysis ready!');

      return sessionData;

    } catch (error) {
      clearTimeout(timeoutId);

      // Log the full error for debugging
      console.error('Fetch error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      if (error.name === 'AbortError') {
        throw new Error('Analysis timed out. GCP may be processing a large request - please try again.');
      }

      // More specific error handling
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }

      if (error.message.includes('NetworkError')) {
        throw new Error('Network error occurred. This may be due to CORS or connectivity issues.');
      }

      throw error;
    }

  } catch (error) {
    console.error('Analysis submission failed:', error);
    throw error;
  }
}

// ===== GALLERY FUNCTIONS =====

/**
 * Get gallery of analyses for a specific user
 */
export async function getUserGallery(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GalleryItem[]> {
  return fetchWithRetry(async () => {
    const url = new URL(`${API_BASE_URL}/gallery/${encodeURIComponent(userId)}`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch gallery: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Gallery request timed out');
      }
      throw error;
    }
  });
}

// ===== INDIVIDUAL FILE ACCESS =====

/**
 * Get thumbnail preview URL for an analysis
 */
export function getAnalysisPreviewUrl(sessionId: string): string {
  return `${API_BASE_URL}/results/${sessionId}/preview`;
}

/**
 * Get interactive map URL for an analysis
 */
export function getAnalysisMapUrl(sessionId: string): string {
  return `${API_BASE_URL}/results/${sessionId}/map`;
}

/**
 * Get chart image URL for an analysis - FIXED TO USE BACKEND
 */
export function getAnalysisChartUrl(sessionId: string): string {
  return `${API_BASE_URL}/results/${sessionId}/chart`;
}

/**
 * Get download ZIP URL for an analysis
 */
export function getAnalysisDownloadUrl(sessionId: string): string {
  // Add timestamp to prevent caching issues that might cause intermittent failures
  return `${API_BASE_URL}/results/${sessionId}/download?t=${Date.now()}`;
}

/**
 * ADDED: Fix thumbnail URL for analysis cards
 */
export function fixThumbnailUrl(sessionId: string): string {
  return `${API_BASE_URL}/results/${sessionId}/preview`;
}

/**
 * Check if preview image is available (non-blocking check)
 */
export async function checkPreviewAvailability(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${sessionId}/preview`, {
      method: 'HEAD',  // Only check headers, don't download image
    });
    return response.ok;
  } catch (error) {
    console.log(`Preview not yet available for ${sessionId}`);
    return false;
  }
}

/**
 * Get analysis metadata
 */
export async function getAnalysisMetadata(sessionId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${sessionId}/metadata`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Metadata fetch failed:', error);
    throw error;
  }
}

/**
 * Download analysis as ZIP file with retry logic
 */
export async function downloadAnalysisZip(sessionId: string): Promise<void> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timestamp to prevent caching issues
      const downloadUrl = `${API_BASE_URL}/results/${sessionId}/download?t=${Date.now()}`;

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Handle ZIP file download
      const blob = await response.blob();

      // Verify we got a proper file
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const url = window.URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `ndvi_analysis_${sessionId}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return; // Success - exit the retry loop

    } catch (error) {
      lastError = error as Error;
      console.warn(`Download attempt ${attempt + 1} failed:`, error);

      // If this isn't the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Progressive delay
      }
    }
  }

  // If we get here, all attempts failed
  console.error('All download attempts failed:', lastError);
  throw lastError || new Error('Download failed after multiple attempts');
}

/**
 * Open analysis map in new window
 */
export function openAnalysisMap(sessionId: string): void {
  const mapUrl = getAnalysisMapUrl(sessionId);
  window.open(mapUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}

/**
 * Delete an analysis (user must own it)
 */
export async function deleteAnalysis(sessionId: string, userId: string): Promise<void> {
  try {
    const url = new URL(`${API_BASE_URL}/results/${sessionId}`);
    url.searchParams.set('user_id', userId);
    
    const response = await fetch(url.toString(), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Delete failed: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

// ===== LEGACY FUNCTIONS (Updated) =====

/**
 * Health check for the API
 */
export async function checkApiHealth(): Promise<{
  status: string;
  analyzer_initialized: boolean;
  gemini_model_initialized: boolean;
  project_id?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s for health check

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Health check timed out');
    }

    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Get API information
 */
export async function getApiInfo(): Promise<{
  service: string;
  version: string;
  description: string;
  endpoints: any;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) {
      throw new Error(`API info request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API info request failed:', error);
    throw error;
  }
}

/**
 * Validate credentials file before upload
 */
export function validateCredentialsFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'File must be a JSON file'
    };
  }

  // Check file size (should be reasonable for a credentials file)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Credentials files should be under 10MB.'
    };
  }

  if (file.size < 100) {
    return {
      valid: false,
      error: 'File is too small to be a valid credentials file.'
    };
  }

  return { valid: true };
}

/**
 * Format error messages for display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    // Handle timeout errors
    if (error.message.includes('timed out') || error.message.includes('AbortError')) {
      return isGCP
        ? 'Request timed out. GCP may be processing a complex analysis - this is normal for the first request. Please try again.'
        : 'Request timed out. Please check your connection and try again.';
    }

    // Handle common HTTP errors
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the analysis server. Please check your internet connection and try again.';
    }

    if (error.message.includes('HTTP 422')) {
      return 'Invalid request data. Please check your inputs and try again.';
    }

    if (error.message.includes('HTTP 413')) {
      return 'File too large. Please use a smaller credentials file.';
    }

    if (error.message.includes('HTTP 500')) {
      return 'Server error occurred during analysis. Please try again later.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Keep GCP instance warm by pinging health endpoint
 */
export async function keepGCPWarm(): Promise<boolean> {
  if (!isGCP) return true; // No need for local backend

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Short timeout for keep-alive

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Keep-alive ping failed:', error.message);
    return false;
  }
}

// ===== USER MANAGEMENT =====

/**
 * Generate or get user ID (simple implementation)
 * In production, this would integrate with your auth system
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Return a temporary ID for server-side rendering
    return 'temp_user_ssr';
  }
  
  // Try to get from localStorage first
  const stored = localStorage.getItem('geoanalytics_user_id');
  if (stored) {
    return stored;
  }
  
  // Generate new user ID
  const userId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  localStorage.setItem('geoanalytics_user_id', userId);
  
  return userId;
}

/**
 * Set user ID (for custom user identification)
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('geoanalytics_user_id', userId);
  }
}

/**
 * Clear user data
 */
export function clearUserData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('geoanalytics_user_id');
  }
}