import { AnalysisQuery, AnalysisResults } from '@/types/analysis';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProgressCallback {
  (progress: number, message: string): void;
}

/**
 * Submit analysis request to the backend API
 */
export async function submitAnalysis(
  data: AnalysisQuery,
  credentialsFile: File,
  onProgress?: ProgressCallback
): Promise<AnalysisResults> {
  try {
    // Update progress
    onProgress?.(10, 'Preparing request...');

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('query', data.query);
    formData.append('credentials_file', credentialsFile);
    formData.append('download_data', data.download_data?.toString() || 'true');

    onProgress?.(20, 'Sending request to server...');

    // Submit to backend
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    onProgress?.(40, 'Processing by backend...');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Try to get more detailed error from response
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }
      
      throw new Error(errorMessage);
    }

    onProgress?.(80, 'Analysis complete, preparing download...');

    // Check if response is a ZIP file
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/zip')) {
      // Handle ZIP file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'ndvi_analysis.zip';
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

      onProgress?.(100, 'Download started!');

      // Return mock results for UI purposes
      return {
        timestamp: new Date().toISOString(),
        query: data.query,
        extracted_data: {
          location: {
            name: 'Analysis Area',
            latitude: { min: 0, max: 0 },
            longitude: { min: 0, max: 0 }
          },
          start_year: 2018,
          end_year: 2023
        },
        statistics: {
          start_year: [],
          end_year: [],
          start_year_num: 2018,
          end_year_num: 2023
        },
        files_included: {
          'ndvi_map.html': 'Interactive map with NDVI layers',
          'ndvi_charts.png': 'Statistical charts and analysis',
          'analysis_mapping.json': 'Analysis metadata'
        }
      };
    } else {
      // Handle JSON response (error case or metadata)
      const results = await response.json();
      onProgress?.(100, 'Analysis completed!');
      return results;
    }

  } catch (error) {
    console.error('Analysis submission failed:', error);
    throw error;
  }
}

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
  main_endpoint: string;
  method: string;
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