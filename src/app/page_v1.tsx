'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Satellite, 
  Globe, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  MapPin,
  BarChart3,
  Download,
  Sparkles,
  Target,
  Brain,
  Upload,
  Search,
  AlertCircle,
  FileText,
  Clock,
  Menu,
  X,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react';

// Types
interface AnalysisFormData {
  query: string;
  download_data: boolean;
}

interface AnalysisStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

interface ApiHealth {
  status: string;
  analyzer_initialized: boolean;
  gemini_model_initialized: boolean;
  project_id?: string;
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'landing' | 'analysis'>('landing');
  const [formData, setFormData] = useState<AnalysisFormData>({
    query: '',
    download_data: true,
  });
  const [status, setStatus] = useState<AnalysisStatus>({ status: 'idle' });
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/health`);
        if (response.ok) {
          const health = await response.json();
          setApiHealth(health);
        } else {
          throw new Error('API not responding');
        }
      } catch (error) {
        console.warn('API health check failed:', error);
        setApiHealth(null);
      } finally {
        setIsCheckingApi(false);
      }
    };

    checkApiHealth();
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning extracts insights from your natural language queries"
    },
    {
      icon: Globe,
      title: "Global Coverage", 
      description: "Analyze any location on Earth with high-resolution satellite imagery"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive NDVI analysis in minutes, not days"
    }
  ];

  const stats = [
    { label: "Analyses Completed", value: "10,000+" },
    { label: "Countries Covered", value: "195" },
    { label: "Research Papers", value: "500+" },
    { label: "Active Users", value: "2,500+" }
  ];

  // Form handlers
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

      // Create FormData for API submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('query', formData.query);
      formDataToSubmit.append('credentials_file', credentialsFile);
      formDataToSubmit.append('download_data', formData.download_data.toString());

      // Update progress
      setStatus(prev => ({ ...prev, progress: 20, message: 'Connecting to Google Earth Engine...' }));

      // Submit to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formDataToSubmit,
      });

      setStatus(prev => ({ ...prev, progress: 60, message: 'Processing satellite imagery...' }));

      if (!response.ok) {
        let errorMessage = `Analysis failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Use status text if response is not JSON
        }
        throw new Error(errorMessage);
      }

      setStatus(prev => ({ ...prev, progress: 90, message: 'Preparing results...' }));

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

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus({
        status: 'completed',
        message: 'Analysis completed successfully!',
        progress: 100
      });

    } catch (error) {
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  };

  const isProcessing = status.status === 'processing';

  // Landing Page View
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-orange-100">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/80 border-b border-white/20 sticky top-0 z-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Satellite className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">GeoAnalytics</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => setCurrentView('analysis')}
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  Platform
                </button>
                <a href="#features" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">Features</a>
                <a href="#" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">Pricing</a>
                <a href="#" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">Enterprise</a>
              </nav>

              {/* CTA Button */}
              <button 
                onClick={() => setCurrentView('analysis')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Analyzing
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200/50 shadow-lg mb-8">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-slate-700">AI-Powered Geospatial Analysis</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-slate-900">Analyze Earth's </span>
              <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent">
                vegetation
              </span>
              <br />
              <span className="text-slate-900">with </span>
              <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI precision.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform satellite imagery into actionable insights. Our platform uses advanced AI to analyze 
              vegetation changes, deforestation patterns, and environmental trends across any location on Earth.
            </p>

            {/* Main CTA Card */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/40">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">What do you want to analyze?</h3>
                  
                  <div className="relative">
                    <textarea
                      value={formData.query}
                      onChange={handleQueryChange}
                      placeholder="e.g., Analyze deforestation in the Amazon rainforest from 2020 to 2024..."
                      className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
                      rows={3}
                    />
                  </div>

                  <button 
                    onClick={() => setCurrentView('analysis')}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                  >
                    <span>Start Analysis</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-3">
                      Not sure where to start? Try one of these:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "Vegetation Analysis",
                        "Forest Monitoring", 
                        "Urban Green Space",
                        "Agricultural Assessment",
                        "Climate Impact Study"
                      ].map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, query: `${tag} analysis from 2020 to 2024` }));
                            setCurrentView('analysis');
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 mb-20">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white shadow-lg" />
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full border-2 border-white shadow-lg" />
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full border-2 border-white shadow-lg" />
                </div>
                <span className="text-slate-600 font-medium">Trusted by 2,500+ researchers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Why Choose GeoAnalytics?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Cutting-edge technology meets intuitive design for the world's most advanced vegetation analysis platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/40"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Research?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of researchers, scientists, and organizations using GeoAnalytics 
                to unlock insights from satellite imagery.
              </p>
              <button 
                onClick={() => setCurrentView('analysis')}
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2"
              >
                <span>Start Your First Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* API Status Indicator */}
        <div className="fixed bottom-6 left-6 z-50">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm ${
            !isCheckingApi && apiHealth?.status === 'healthy' 
              ? 'bg-green-100/90 text-green-800 border border-green-200' 
              : 'bg-yellow-100/90 text-yellow-800 border border-yellow-200'
          }`}>
            {!isCheckingApi && apiHealth?.status === 'healthy' ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span>Backend Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-600" />
                <span>Demo Mode</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Analysis View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => setCurrentView('landing')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Satellite className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">GeoAnalytics</span>
                <div className="text-xs text-slate-600">AI-Powered NDVI Platform</div>
              </div>
            </button>

            {/* Navigation & Status */}
            <div className="flex items-center space-x-4">
              {/* API Status */}
              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                !isCheckingApi && apiHealth?.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {!isCheckingApi && apiHealth?.status === 'healthy' ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Backend Online</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Demo Mode</span>
                  </>
                )}
              </div>

              {/* Back to Landing */}
              <button
                onClick={() => setCurrentView('landing')}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Analysis Form */}
      <div className="container mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl shadow-2xl mb-8 animate-float">
            <Satellite className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Create NDVI Analysis
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform your research questions into comprehensive vegetation analysis using AI and satellite imagery.
          </p>

          {/* Backend Status Banner */}
          {!isCheckingApi && (
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mt-6 ${
              apiHealth?.status === 'healthy' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {apiHealth?.status === 'healthy' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Connected to Google Earth Engine • Project: {apiHealth.project_id}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span>Backend Offline - Check your API server at http://127.0.0.1:8000</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="space-y-8">
            
            {/* Query Input */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/40">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Research Query</h3>
                  <p className="text-slate-600">Describe your analysis in natural language</p>
                </div>
              </div>
              
              <textarea
                value={formData.query}
                onChange={handleQueryChange}
                placeholder="e.g., Analyze vegetation changes in the Amazon rainforest from 2020 to 2024 and identify areas of deforestation..."
                className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 resize-none bg-white/90 backdrop-blur-sm"
                rows={4}
                disabled={isProcessing}
              />
            </div>

            {/* Credentials Upload */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/40">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Authentication</h3>
                  <p className="text-slate-600">Secure Google Earth Engine access</p>
                </div>
              </div>
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
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
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="font-bold text-green-800">{credentialsFile.name}</p>
                      <p className="text-sm text-green-600">Ready for secure analysis</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-800">Upload Credentials File</p>
                      <p className="text-sm text-slate-600">Click to select your Google Cloud JSON file</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/40">
              <label className="flex items-center space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.download_data}
                  onChange={(e) => setFormData(prev => ({ ...prev, download_data: e.target.checked }))}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  disabled={isProcessing}
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Include Raster Data Download</div>
                  <p className="text-sm text-slate-600">Download NDVI data as GeoTIFF files for advanced analysis</p>
                </div>
                <Download className="w-5 h-5 text-blue-600" />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!formData.query.trim() || !credentialsFile || isProcessing || apiHealth?.status !== 'healthy'}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 text-white px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Analysis...</span>
                </>
              ) : apiHealth?.status !== 'healthy' ? (
                <>
                  <WifiOff className="w-6 h-6" />
                  <span>Backend Offline - Please Start Your API Server</span>
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  <span>Start AI-Powered Analysis</span>
                </>
              )}
            </button>

            {/* Backend Instructions */}
            {!isCheckingApi && apiHealth?.status !== 'healthy' && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-yellow-900 mb-2">Backend Connection Required</h4>
                    <p className="text-yellow-800 mb-3">
                      To run analyses, make sure your FastAPI backend is running:
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-3 font-mono text-sm text-yellow-900">
                      uvicorn api3-combined_ndvi_complete_api:app --reload --port 8000
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                      Then refresh this page to connect to the backend.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Display */}
          {status.status !== 'idle' && (
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/40 text-center">
                {status.status === 'processing' && (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{status.message}</h4>
                      {status.progress !== undefined && (
                        <div className="space-y-3">
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${status.progress}%` }}
                            />
                          </div>
                          <p className="text-slate-600 font-medium">{status.progress}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {status.status === 'completed' && (
                  <div className="space-y-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <div>
                      <h4 className="text-xl font-bold text-green-900">{status.message}</h4>
                      <p className="text-green-700">Your analysis results have been downloaded.</p>
                    </div>
                  </div>
                )}

                {status.status === 'error' && (
                  <div className="space-y-6">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                    <div>
                      <h4 className="text-xl font-bold text-red-900">Analysis Failed</h4>
                      <p className="text-red-700">{status.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}