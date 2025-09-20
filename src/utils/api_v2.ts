import { AnalysisQuery, AnalysisResults, GalleryItem, SessionAnalysis } from '@/types/analysis';


// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProgressCallback {
  (progress: number, message: string): void;
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

    // Submit to enhanced backend
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    onProgress?.(40, 'Processing with Google Earth Engine...');

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
    const sessionData: SessionAnalysis = await response.json();
    
    onProgress?.(100, 'Analysis ready!');
    
    return sessionData;

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
  try {
    const url = new URL(`${API_BASE_URL}/gallery/${encodeURIComponent(userId)}`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch gallery: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Gallery fetch failed:', error);
    throw error;
  }
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
 * Get chart image URL for an analysis
 */
export function getAnalysisChartUrl(sessionId: string): string {
  return `${API_BASE_URL}/results/${sessionId}/chart`;
}

/**
 * Get download ZIP URL for an analysis
 */
export function getAnalysisDownloadUrl(sessionId: string): string {
  return `${API_BASE_URL}/results/${sessionId}/download`;
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
 * Download analysis as ZIP file
 */
export async function downloadAnalysisZip(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${sessionId}/download`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    // Handle ZIP file download
    const blob = await response.blob();
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
    
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
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