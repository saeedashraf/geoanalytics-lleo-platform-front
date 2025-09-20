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

export interface AnalysisCard {
  id: string;
  title: string;
  description: string;
  query: string;
  coordinates: Coordinates;
  location_name: string;
  start_year: number;
  end_year: number;
  created_at: string;
  author: string;
  likes: number;
  shares: number;
  views: number;
  tags: string[];
  thumbnail_url?: string;
  category: 'recently_published' | 'community_research' | 'enterprise_repository';
  is_public: boolean;
  analysis_results?: AnalysisResults;
}

export interface AnalysisFormData {
  query: string;
  coordinates?: Coordinates;
  credentials_file?: File;
  download_data: boolean;
}

export interface AnalysisStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  results?: AnalysisResults;
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