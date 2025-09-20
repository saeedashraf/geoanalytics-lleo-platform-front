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
  WifiOff,
  ExternalLink,
  Eye,
  Building
} from 'lucide-react';
import Header from '@/components/layout/Header';
import AnalysisGallery from '@/components/gallery/AnalysisGallery';
import AnalysisModal from '@/components/modal/AnalysisModal';
import ModernAnalysisForm from '@/components/analysis/ModernAnalysisForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  checkApiHealth, 
  getUserGallery, 
  submitAnalysis,
  getUserId,
  downloadAnalysisZip,
  openAnalysisMap,
  getAnalysisPreviewUrl,
  getAnalysisChartUrl
} from '@/utils/api';
import { 
  AnalysisCard, 
  AnalysisStatus, 
  SessionAnalysis,
  GalleryItem,
  galleryItemToAnalysisCard,
  sessionAnalysisToAnalysisCard
} from '@/types/analysis';
import useToast from '@/hooks/useToast';

// Types
interface AnalysisFormData {
  query: string;
  download_data: boolean;
}

interface ApiHealth {
  status: string;
  analyzer_initialized: boolean;
  gemini_model_initialized: boolean;
  project_id?: string;
}

export default function HomePage() {
  // State management
  const [activeTab, setActiveTab] = useState<'create' | 'recent' | 'community' | 'enterprise' | 'my-analyses'>('create');
  const [formData, setFormData] = useState<AnalysisFormData>({
    query: '',
    download_data: true,
  });
  const [status, setStatus] = useState<AnalysisStatus>({ status: 'idle' });
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(true);
  const [userId, setUserId] = useState<string>('');

  // Initialize user ID on client side only
  useEffect(() => {
    setUserId(getUserId());
  }, []);
  
  // Gallery state
  const [userAnalyses, setUserAnalyses] = useState<AnalysisCard[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const { toasts, showToast, hideToast } = useToast();

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealthStatus = async () => {
      try {
        const response = await checkApiHealth();
        setApiHealth(response);
        
        if (response.status === 'healthy') {
          showToast({
            type: 'success',
            title: 'Backend Connected',
            message: `Connected to project: ${response.project_id}`,
            duration: 3000
          });
        }
      } catch (error) {
        console.warn('API health check failed:', error);
        setApiHealth(null);
        showToast({
          type: 'warning',
          title: 'Backend Offline',
          message: 'Running in demo mode - start your API server',
          duration: 5000
        });
      } finally {
        setIsCheckingApi(false);
      }
    };

    checkApiHealthStatus();
  }, [showToast]);

  // Load user's analyses when switching to "My Analyses" tab
  useEffect(() => {
    if (activeTab === 'my-analyses' && userId) {
      loadUserAnalyses();
    }
  }, [activeTab, userId]);

  const loadUserAnalyses = async () => {
    if (!userId) return;
    
    setLoadingGallery(true);
    try {
      const galleryItems: GalleryItem[] = await getUserGallery(userId);
      const analysisCards = galleryItems.map(item => galleryItemToAnalysisCard(item, userId));
      setUserAnalyses(analysisCards);
    } catch (error) {
      console.error('Failed to load user analyses:', error);
      showToast({
        type: 'error',
        title: 'Failed to Load Analyses',
        message: 'Could not load your analysis history',
        duration: 5000
      });
      setUserAnalyses([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Feature data
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
      title: "Session-Based Results",
      description: "Get immediate access to maps, charts, and data through shareable URLs"
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
        showToast({
          type: 'error',
          title: 'Invalid File',
          message: 'Please select a JSON credentials file'
        });
        return;
      }
      setCredentialsFile(file);
      setStatus({ status: 'idle' });
      showToast({
        type: 'success',
        title: 'File Selected',
        message: `${file.name} ready for analysis`
      });
    }
  };

  const handleAnalysisComplete = (sessionData: SessionAnalysis) => {
    // Convert session to analysis card for immediate display
    const newAnalysisCard = sessionAnalysisToAnalysisCard(sessionData);
    
    // Add to user analyses list
    setUserAnalyses(prev => [newAnalysisCard, ...prev]);
    
    // Show success with action buttons
    showToast({
      type: 'success',
      title: 'Analysis Complete! 🎉',
      message: 'Your NDVI analysis is ready',
      duration: 8000
    });

    // Switch to gallery view
    setActiveTab('my-analyses');
    
    // Show the analysis in modal
    setSelectedAnalysis(newAnalysisCard);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.query.trim()) {
      setStatus({
        status: 'error',
        error: 'Please enter an analysis query'
      });
      showToast({
        type: 'error',
        title: 'Missing Query',
        message: 'Please enter an analysis query'
      });
      return;
    }

    if (!credentialsFile) {
      setStatus({
        status: 'error',
        error: 'Please upload your Google Cloud credentials file'
      });
      showToast({
        type: 'error',
        title: 'Missing Credentials',
        message: 'Please upload your Google Cloud credentials file'
      });
      return;
    }

    if (apiHealth?.status !== 'healthy') {
      showToast({
        type: 'error',
        title: 'Backend Offline',
        message: 'Please start your API server first'
      });
      return;
    }

    try {
      setStatus({ 
        status: 'processing', 
        message: 'Initializing AI analysis...',
        progress: 0
      });

      const submissionData = {
        query: formData.query,
        download_data: formData.download_data,
      };

      // Submit analysis using enhanced API
      const sessionData = await submitAnalysis(
        submissionData, 
        credentialsFile, 
        userId || getUserId(), // Fallback to getUserId() if userId is not yet set
        (progress, message) => {
          setStatus({
            status: 'processing',
            progress,
            message
          });
        }
      );

      setStatus({
        status: 'completed',
        message: 'Analysis completed successfully!',
        results: sessionData
      });

      // Handle completion
      handleAnalysisComplete(sessionData);

    } catch (error) {
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
      
      showToast({
        type: 'error',
        title: 'Analysis Failed',
        message: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  };

  // Gallery handlers
  const handleAnalysisView = (analysis: AnalysisCard) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  const handleAnalysisLike = (analysisId: string) => {
    // Update likes (mock for now)
    setUserAnalyses(prev => prev.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, likes: analysis.likes + 1 }
        : analysis
    ));
    
    showToast({
      type: 'info',
      title: 'Liked!',
      message: 'Analysis added to your favorites'
    });
  };

  const handleAnalysisShare = (analysis: AnalysisCard) => {
    // Copy analysis URL to clipboard
    const shareUrl = `${window.location.origin}/?analysis=${analysis.session_id}`;
    navigator.clipboard.writeText(shareUrl);
    
    showToast({
      type: 'success',
      title: 'Link Copied!',
      message: 'Analysis link copied to clipboard'
    });
  };

  const handleAnalysisDownload = async (analysis: AnalysisCard) => {
    try {
      showToast({
        type: 'info',
        title: 'Download Starting...',
        message: 'Preparing your NDVI analysis files'
      });

      await downloadAnalysisZip(analysis.session_id);
      
      showToast({
        type: 'success',
        title: 'Download Complete!',
        message: 'Your analysis files have been downloaded'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download analysis files'
      });
    }
  };

  const isProcessing = status.status === 'processing';

  // Get tab content
  const getTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <ModernAnalysisForm 
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
        
      case 'my-analyses':
        return (
          <AnalysisGallery
            analyses={userAnalyses}
            title="My Analyses"
            description="Your personal NDVI analysis history"
            loading={loadingGallery}
            onAnalysisView={handleAnalysisView}
            onAnalysisLike={handleAnalysisLike}
            onAnalysisShare={handleAnalysisShare}
            onRefresh={loadUserAnalyses}
          />
        );
        
      case 'recent':
      case 'community':
      case 'enterprise':
        return (
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {activeTab === 'recent' && 'Recently Published'}
              {activeTab === 'community' && 'Community Research'}
              {activeTab === 'enterprise' && 'Enterprise Repository'}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              This gallery will show shared analyses from the community. 
              Currently showing your personal analyses.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveTab('my-analyses')}
            >
              View My Analyses
            </Button>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <Header 
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {getTabContent()}
      </main>

      {/* Analysis Modal */}
      <AnalysisModal
        analysis={selectedAnalysis}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLike={handleAnalysisLike}
        onShare={handleAnalysisShare}
        onDownload={handleAnalysisDownload}
      />

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-sm max-w-sm transition-all duration-300 transform animate-slide-up ${
              toast.type === 'success' ? 'bg-green-100 text-green-900 border border-green-200' :
              toast.type === 'error' ? 'bg-red-100 text-red-900 border border-red-200' :
              toast.type === 'warning' ? 'bg-yellow-100 text-yellow-900 border border-yellow-200' :
              'bg-blue-100 text-blue-900 border border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{toast.title}</h4>
                {toast.message && (
                  <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => hideToast(toast.id)}
                className="ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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

      {/* User Info (Debug) */}
      {process.env.NODE_ENV === 'development' && userId && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg">
            User: {userId.substring(0, 12)}...
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
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
}