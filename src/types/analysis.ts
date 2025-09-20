export interface Coordinates {
  southwest_lat: number;
  southwest_lon: number;
  northeast_lat: number;
  northeast_lon: number;
}

export interface AreaOfInterest {
  coordinates: Coordinates;
  area_km2?: number;
  center?: {
    lat: number;
    lng: number;
  };
}

export interface AnalysisQuery {
  query: string;
  coordinates?: Coordinates;
  download_data?: boolean;
}

export interface NDVIStatistics {
  label: string;
  value: number;
  color: string;
}

// ===== NEW SESSION-BASED TYPES =====

/**
 * Response from the enhanced backend /analyze endpoint
 */
export interface SessionAnalysis {
  session_id: string;
  user_id: string;
  analysis: {
    location: {
      name: string;
      latitude: {
        min: number;
        max: number;
      };
      longitude: {
        min: number;
        max: number;
      };
    };
    start_year: number;
    end_year: number;
  };
  files: {
    preview_url: string;      // /results/{session_id}/preview
    map_url: string;          // /results/{session_id}/map
    chart_url: string;        // /results/{session_id}/chart
    download_url: string;     // /results/{session_id}/download
    metadata_url: string;     // /results/{session_id}/metadata
  };
  created_at: string;
  status: string;
}

/**
 * Gallery item from /gallery/{user_id} endpoint
 */
export interface GalleryItem {
  session_id: string;
  location_name: string;
  query: string;
  start_year: number;
  end_year: number;
  created_at: string;
  thumbnail_url: string;    // Preview image URL
  map_url: string;          // Interactive map URL
  chart_url: string;        // Chart image URL
  download_url: string;     // ZIP download URL
}

/**
 * Analysis metadata from /results/{session_id}/metadata
 */
export interface AnalysisMetadata {
  session_id: string;
  user_id: string;
  query: string;
  location_name: string;
  coordinates: {
    latitude: {
      min: number;
      max: number;
    };
    longitude: {
      min: number;
      max: number;
    };
  };
  start_year: number;
  end_year: number;
  created_at: string;
  status: string;
}

// ===== LEGACY TYPES (Updated for compatibility) =====

export interface AnalysisResults {
  timestamp: string;
  query: string;
  extracted_data: {
    location: {
      name: string;
      latitude: {
        min: number;
        max: number;
      };
      longitude: {
        min: number;
        max: number;
      };
    };
    start_year: number;
    end_year: number;
  };
  statistics: {
    start_year: NDVIStatistics[];
    end_year: NDVIStatistics[];
    start_year_num: number;
    end_year_num: number;
  };
  files_included: {
    [key: string]: string;
  };
}

/**
 * Enhanced analysis card for gallery display
 * Combines session data with display metadata
 */
export interface AnalysisCard {
  id: string;                 // session_id
  title: string;              // Generated from query
  description: string;        // Short description
  query: string;              // Original query
  coordinates: Coordinates;   // Converted from backend format
  location_name: string;
  start_year: number;
  end_year: number;
  created_at: string;
  author: string;             // user_id or display name
  likes: number;              // For future implementation
  shares: number;             // For future implementation
  views: number;              // For future implementation
  tags: string[];             // Generated from query/location
  thumbnail_url?: string;     // From backend preview_url
  map_url?: string;           // From backend map_url  
  chart_url?: string;         // From backend chart_url
  download_url?: string;      // From backend download_url
  category: 'recently_published' | 'community_research' | 'enterprise_repository' | 'user_analyses';
  is_public: boolean;
  session_id: string;         // Backend session identifier
  analysis_results?: AnalysisResults;
}

export interface AnalysisFormData {
  query: string;
  coordinates?: Coordinates;
  credentials_file?: File;
  download_data: boolean;
  user_id?: string;           // Added for enhanced backend
}

export interface AnalysisStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  results?: SessionAnalysis;  // Changed from AnalysisResults
  error?: string;
}

export interface MapBounds {
  _southWest: {
    lat: number;
    lng: number;
  };
  _northEast: {
    lat: number;
    lng: number;
  };
}

export interface DrawEvent {
  layerType: string;
  layer: any;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: AnalysisCard['category'] | 'create';
}

// ===== UTILITY TYPES =====

/**
 * Convert backend coordinates to frontend format
 */
export function convertBackendCoordinates(backendCoords: {
  latitude: { min: number; max: number };
  longitude: { min: number; max: number };
}): Coordinates {
  return {
    southwest_lat: backendCoords.latitude.min,
    southwest_lon: backendCoords.longitude.min,
    northeast_lat: backendCoords.latitude.max,
    northeast_lon: backendCoords.longitude.max,
  };
}

/**
 * Convert frontend coordinates to backend format
 */
export function convertFrontendCoordinates(frontendCoords: Coordinates): {
  latitude: { min: number; max: number };
  longitude: { min: number; max: number };
} {
  return {
    latitude: {
      min: frontendCoords.southwest_lat,
      max: frontendCoords.northeast_lat,
    },
    longitude: {
      min: frontendCoords.southwest_lon,
      max: frontendCoords.northeast_lon,
    },
  };
}

/**
 * Convert gallery item to analysis card for display
 */
export function galleryItemToAnalysisCard(item: GalleryItem, userId?: string): AnalysisCard {
  // Generate title from query (first 60 characters)
  const title = item.query.length > 60 
    ? item.query.substring(0, 57) + '...' 
    : item.query;
    
  // Generate tags from location and query
  const tags: string[] = [];
  const locationWords = item.location_name.toLowerCase().split(/[\s,]+/);
  locationWords.forEach(word => {
    if (word.length > 2) tags.push(word);
  });
  
  // Extract potential tags from query
  const queryWords = item.query.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  queryWords.slice(0, 3).forEach(word => {
    if (!tags.includes(word) && word !== 'ndvi' && word !== 'analysis') {
      tags.push(word);
    }
  });

  // Determine category (simple heuristic)
  const isRecent = new Date(item.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const category = isRecent ? 'recently_published' : 'user_analyses';

  return {
    id: item.session_id,
    title,
    description: `NDVI analysis for ${item.location_name} (${item.start_year}-${item.end_year})`,
    query: item.query,
    coordinates: {
      southwest_lat: 0, // Will need to fetch from metadata if needed
      southwest_lon: 0,
      northeast_lat: 0,
      northeast_lon: 0,
    },
    location_name: item.location_name,
    start_year: item.start_year,
    end_year: item.end_year,
    created_at: item.created_at,
    author: userId || 'User',
    likes: Math.floor(Math.random() * 100), // Mock data
    shares: Math.floor(Math.random() * 25),
    views: Math.floor(Math.random() * 1000),
    tags,
    thumbnail_url: item.thumbnail_url,
    map_url: item.map_url,
    chart_url: item.chart_url,
    download_url: item.download_url,
    category,
    is_public: true,
    session_id: item.session_id,
  };
}

/**
 * Convert session analysis to analysis card for immediate display
 */
export function sessionAnalysisToAnalysisCard(session: SessionAnalysis): AnalysisCard {
  const title = session.analysis.location.name && session.analysis.start_year 
    ? `${session.analysis.location.name} NDVI Analysis (${session.analysis.start_year}-${session.analysis.end_year})`
    : 'NDVI Analysis';

  const coordinates = convertBackendCoordinates(session.analysis.location);
  
  const tags = [
    'ndvi',
    'vegetation',
    session.analysis.location.name.toLowerCase().replace(/\s+/g, '-'),
    `${session.analysis.start_year}-${session.analysis.end_year}`
  ];

  return {
    id: session.session_id,
    title,
    description: `Vegetation analysis for ${session.analysis.location.name} from ${session.analysis.start_year} to ${session.analysis.end_year}`,
    query: 'Analysis in progress...',
    coordinates,
    location_name: session.analysis.location.name,
    start_year: session.analysis.start_year,
    end_year: session.analysis.end_year,
    created_at: session.created_at,
    author: session.user_id,
    likes: 0,
    shares: 0,
    views: 1,
    tags,
    thumbnail_url: session.files.preview_url,
    map_url: session.files.map_url,
    chart_url: session.files.chart_url,
    download_url: session.files.download_url,
    category: 'recently_published',
    is_public: true,
    session_id: session.session_id,
  };
}