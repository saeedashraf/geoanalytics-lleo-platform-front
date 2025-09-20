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
  Clock,
  MapPin,
  Sparkles,
  CheckCircle,
  Globe,
  Calendar,
  Target
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AnalysisFormData, AreaOfInterest, AnalysisStatus } from '@/types/analysis';
import { submitAnalysis } from '@/utils/api';

interface ModernAnalysisFormProps {
  onAnalysisComplete?: (results: any) => void;
}

const ModernAnalysisForm: React.FC<ModernAnalysisFormProps> = ({ onAnalysisComplete }) => {
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
        message: 'Initializing AI analysis...',
        progress: 0
      });

      const enhancedQuery = enhanceQueryWithCoordinates(formData.query, formData.coordinates);

      const submissionData = {
        query: enhancedQuery,
        coordinates: formData.coordinates,
        download_data: formData.download_data,
      };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl shadow-2xl mb-8 animate-float">
              <Satellite className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Create NDVI Analysis
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Harness the power of <strong>artificial intelligence</strong> and <strong>satellite imagery</strong> to analyze 
              vegetation changes across any location on Earth. Simply describe your research question in natural language.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Global Coverage</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200/50 shadow-lg">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Time Series Analysis</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-green-200/50 shadow-lg">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">High Precision</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="container mx-auto px-6 pb-16">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Form Inputs */}
            <div className="space-y-8">
              
              {/* Research Query Card */}
              <Card variant="elevated" hover className="group">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Research Query</h3>
                      <p className="text-slate-600">Describe your analysis in natural language</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-800">
                      What do you want to analyze? *
                    </label>
                    <div className="relative group">
                      <textarea
                        value={formData.query}
                        onChange={handleQueryChange}
                        placeholder="e.g., Analyze vegetation changes in the Amazon rainforest from 2020 to 2024 and identify areas of deforestation..."
                        className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 resize-none bg-white/90 backdrop-blur-sm group-hover:border-slate-300"
                        rows={5}
                        disabled={isProcessing}
                      />
                      <div className="absolute bottom-3 right-3 opacity-60">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    
                    {/* AI Enhancement Notice */}
                    <div className="flex items-start space-x-3 text-sm bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200/50">
                      <div className="p-1 bg-blue-500 rounded-full">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 mb-1">AI-Enhanced Processing</p>
                        <p className="text-blue-700">
                          Our advanced AI will automatically extract locations, time periods, and analysis parameters 
                          from your description, then generate the optimal Earth Engine queries.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Credentials Upload Card */}
              <Card variant="elevated" hover>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Authentication</h3>
                      <p className="text-slate-600">Secure Google Earth Engine access</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-800">
                      Service Account JSON File *
                    </label>
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                        credentialsFile 
                          ? 'border-green-400 bg-green-50/80' 
                          : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
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
                        <div className="space-y-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-800">{credentialsFile.name}</p>
                            <p className="text-sm text-green-600">Credentials file ready for secure analysis</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-200 rounded-full group-hover:bg-blue-200 transition-colors shadow-lg">
                            <Upload className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Upload Credentials File</p>
                            <p className="text-sm text-slate-600">Click to select your Google Cloud JSON file</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Analysis Options Card */}
              <Card variant="gradient" className="backdrop-blur-xl">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Analysis Configuration</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-start space-x-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.download_data}
                        onChange={(e) => setFormData(prev => ({ ...prev, download_data: e.target.checked }))}
                        className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-colors"
                        disabled={isProcessing}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-900">Include Raster Data Download</div>
                        <p className="text-sm text-slate-600 mt-1">
                          Download NDVI data as GeoTIFF files for advanced analysis in GIS software like QGIS or ArcGIS
                        </p>
                      </div>
                      <Download className="w-5 h-5 text-blue-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </label>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <Card variant="gradient" className="backdrop-blur-xl">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isProcessing}
                  disabled={!formData.query.trim() || !credentialsFile}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-6 h-6 mr-3" />
                      Processing Analysis...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 mr-3" />
                      Start AI-Powered Analysis
                    </>
                  )}
                </Button>
              </Card>
            </div>

            {/* Right Column - Interactive Area */}
            <div className="space-y-8">
              <Card variant="elevated" className="h-full min-h-[700px]">
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-float">
                    <MapPin className="w-16 h-16 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    Interactive Map
                  </h3>
                  
                  <div className="space-y-6 max-w-md">
                    <p className="text-slate-600 leading-relaxed">
                      Advanced area selection with <strong>satellite imagery</strong>, drawing tools, 
                      and real-time coordinate extraction coming soon.
                    </p>
                    
                    <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl border border-blue-200/50">
                      <h4 className="font-semibold text-slate-900 mb-3">For now, specify location in your query:</h4>
                      <div className="space-y-3 text-left">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <span className="text-sm text-slate-700">
                            "Vegetation change in <strong>Zurich, Switzerland</strong> from 2020 to 2024"
                          </span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                          <span className="text-sm text-slate-700">
                            "NDVI analysis for <strong>Amazon rainforest, Brazil</strong>"
                          </span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <span className="text-sm text-slate-700">
                            "Forest cover in <strong>northern Canada</strong> 2015-2023"
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 italic">
                      💡 Our AI can understand locations like cities, countries, regions, or geographic features
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Status Display */}
          {status.status !== 'idle' && (
            <div className="mt-12 max-w-3xl mx-auto">
              <Card variant="elevated" className="backdrop-blur-xl">
                <div className="text-center p-8">
                  {status.status === 'processing' && (
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl">
                        <LoadingSpinner size="lg" className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 mb-3">{status.message}</h4>
                        {status.progress !== undefined && (
                          <div className="space-y-4 max-w-md mx-auto">
                            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                                style={{ width: `${status.progress}%` }}
                              />
                            </div>
                            <p className="text-slate-700 font-semibold text-lg">{status.progress}% complete</p>
                            <p className="text-sm text-slate-600">
                              Processing with Google Earth Engine and Vertex AI...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {status.status === 'completed' && (
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full shadow-2xl">
                        <Download className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-green-900 mb-3">Analysis Complete! 🎉</h4>
                        <p className="text-green-700 text-lg">Your comprehensive NDVI analysis is ready for download.</p>
                        <p className="text-sm text-green-600 mt-2">
                          The ZIP file contains interactive maps, statistical charts, and raw data files.
                        </p>
                      </div>
                    </div>
                  )}

                  {status.status === 'error' && (
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-2xl">
                        <AlertCircle className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-red-900 mb-3">Analysis Failed</h4>
                        <p className="text-red-700 text-lg">{status.error}</p>
                        <p className="text-sm text-red-600 mt-2">
                          Please check your credentials and query, then try again.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </form>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ModernAnalysisForm;