'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  Satellite, 
  Search, 
  AlertCircle, 
  FileText, 
  Download,
  Zap,
  Clock
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
// import InteractiveMap from '../map/InteractiveMap';
import { AnalysisFormData, AreaOfInterest, AnalysisStatus } from '@/types/analysis';
import { submitAnalysis } from '@/utils/api';

import dynamic from 'next/dynamic';

// Dynamic import with no SSR
const InteractiveMap = dynamic(
  () => import('../map/InteractiveMap'),
  { 
    ssr: false,
    loading: () => <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
  }
);


{/* Right Column - Temporarily removed map */}
<div className="space-y-6">
  <Card padding="sm">
    <div className="h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-900">Interactive Map</h3>
        <p className="text-gray-600 mt-2">Coming soon! For now, specify location in your query.</p>
        <div className="mt-4 p-4 bg-white rounded-lg text-left max-w-sm">
          <h4 className="font-medium text-gray-900 mb-2">Example queries:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Vegetation change in Zurich from 2020 to 2024"</li>
            <li>• "NDVI analysis for London 2018-2023"</li>
            <li>• "Forest cover change in Amazon basin"</li>
          </ul>
        </div>
      </div>
    </div>
  </Card>
</div>


interface AnalysisFormProps {
  onAnalysisComplete?: (results: any) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState<AnalysisFormData>({
    query: '',
    download_data: true,
  });
  const [selectedArea, setSelectedArea] = useState<AreaOfInterest | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>({ status: 'idle' });
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, query: e.target.value }));
  };

  const handleAreaSelect = (area: AreaOfInterest) => {
    setSelectedArea(area);
    setFormData(prev => ({ ...prev, coordinates: area.coordinates }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setStatus({
          status: 'error',
          error: 'Please select a JSON credentials file'
        });
        return;
      }
      setCredentialsFile(file);
      setStatus({ status: 'idle' });
    }
  };

  const enhanceQueryWithCoordinates = (originalQuery: string, coordinates?: any): string => {
    if (!coordinates || coordinates.northeast_lat === 0) {
      return originalQuery;
    }

    const coordsText = ` in the area with coordinates: southwest (${coordinates.southwest_lat.toFixed(4)}, ${coordinates.southwest_lon.toFixed(4)}) to northeast (${coordinates.northeast_lat.toFixed(4)}, ${coordinates.northeast_lon.toFixed(4)})`;
    
    // Check if query already mentions location
    if (originalQuery.toLowerCase().includes(' in ') || originalQuery.toLowerCase().includes(' for ')) {
      return originalQuery + coordsText;
    } else {
      return originalQuery + coordsText;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.query.trim()) {
      setStatus({
        status: 'error',
        error: 'Please enter an analysis query'
      });
      return;
    }

    if (!credentialsFile) {
      setStatus({
        status: 'error',
        error: 'Please upload your Google Cloud credentials file'
      });
      return;
    }

    try {
      setStatus({ 
        status: 'processing', 
        message: 'Starting analysis...',
        progress: 0
      });

      // Enhance query with coordinates if area is selected
      const enhancedQuery = enhanceQueryWithCoordinates(formData.query, formData.coordinates);

      const submissionData = {
        query: enhancedQuery,
        coordinates: formData.coordinates,
        download_data: formData.download_data,
      };

      // Submit analysis
      const results = await submitAnalysis(submissionData, credentialsFile, (progress, message) => {
        setStatus({
          status: 'processing',
          progress,
          message
        });
      });

      setStatus({
        status: 'completed',
        message: 'Analysis completed successfully!',
        results
      });

      onAnalysisComplete?.(results);

    } catch (error) {
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  };

  const isProcessing = status.status === 'processing';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl shadow-lg mb-4 animate-glow">
          <Satellite className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Create NDVI Analysis</h1>
        <p className="text-primary-600 max-w-2xl mx-auto">
          Analyze vegetation changes using satellite imagery. Enter your research question and select an area on the map to begin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Inputs */}
          <div className="space-y-6">
            {/* Query Input */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-accent-600" />
                  <h3 className="text-lg font-semibold text-primary-900">Research Query</h3>
                </div>
                
                <div>
                  <label className="form-label">
                    What do you want to analyze? *
                  </label>
                  <textarea
                    value={formData.query}
                    onChange={handleQueryChange}
                    placeholder="e.g., What is the vegetation change from 2015 to 2024 in Zurich?"
                    className="form-textarea"
                    rows={4}
                    disabled={isProcessing}
                  />
                  <p className="form-help">
                    Describe your analysis in natural language. You can specify time periods, locations, and what you want to study.
                  </p>
                </div>

                {/* Enhanced query preview */}
                {selectedArea && selectedArea.coordinates.northeast_lat !== 0 && formData.query && (
                  <div className="p-3 bg-accent-50 rounded-lg border border-accent-200">
                    <p className="text-sm font-medium text-accent-800 mb-1">Enhanced Query (with coordinates):</p>
                    <p className="text-sm text-accent-700">
                      "{enhanceQueryWithCoordinates(formData.query, selectedArea.coordinates)}"
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Credentials Upload */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-accent-600" />
                  <h3 className="text-lg font-semibold text-primary-900">Google Cloud Credentials</h3>
                </div>
                
                <div>
                  <label className="form-label">
                    Service Account JSON File *
                  </label>
                  <div 
                    className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center hover:border-accent-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    
                    {credentialsFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-6 h-6 text-success-600" />
                        <span className="text-success-700 font-medium">{credentialsFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                        <p className="text-primary-600">Click to upload your credentials file</p>
                        <p className="text-sm text-primary-500 mt-1">JSON format only</p>
                      </div>
                    )}
                  </div>
                  <p className="form-help">
                    Upload your Google Cloud service account JSON file for Earth Engine access.
                  </p>
                </div>
              </div>
            </Card>

            {/* Options */}
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Analysis Options</h3>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="download_data"
                    checked={formData.download_data}
                    onChange={(e) => setFormData(prev => ({ ...prev, download_data: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-300 rounded"
                    disabled={isProcessing}
                  />
                  <div>
                    <label htmlFor="download_data" className="text-sm font-medium text-primary-900 cursor-pointer">
                      Include raster data download
                    </label>
                    <p className="text-sm text-primary-600">
                      Download NDVI data as GeoTIFF files for further analysis
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isProcessing}
              disabled={!formData.query.trim() || !credentialsFile}
              className="btn-glow"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Processing Analysis...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Interactive Map */}
          <div className="space-y-6">
            <Card padding="sm">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Satellite className="w-5 h-5 text-accent-600" />
                  <h3 className="text-lg font-semibold text-primary-900">Select Area of Interest</h3>
                </div>
                <p className="text-sm text-primary-600">
                  Draw a rectangle on the map to define your analysis area, or leave empty to use the location from your query.
                </p>
              </div>
              
              <InteractiveMap
                onAreaSelect={handleAreaSelect}
                selectedArea={selectedArea}
                className="h-[500px]"
              />
            </Card>
          </div>
        </div>

        {/* Status Display */}
        {status.status !== 'idle' && (
          <Card className="mt-8">
            <div className="text-center">
              {status.status === 'processing' && (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" className="mx-auto text-accent-600" />
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900">{status.message}</h4>
                    {status.progress !== undefined && (
                      <div className="mt-3 max-w-md mx-auto">
                        <div className="bg-primary-100 rounded-full h-2">
                          <div 
                            className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${status.progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-primary-600 mt-1">{status.progress}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {status.status === 'completed' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                    <Download className="w-8 h-8 text-success-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-success-900">{status.message}</h4>
                    <p className="text-success-700">Your analysis is ready for download.</p>
                  </div>
                </div>
              )}

              {status.status === 'error' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-error-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-error-900">Analysis Failed</h4>
                    <p className="text-error-700">{status.error}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </form>
    </div>
  );
};

export default AnalysisForm;