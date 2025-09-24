'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Building,
  DollarSign,
  Github,
  Share2,
  Rocket,
  Layers,
  TrendingUp,
  Database
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnalysisGallery from '@/components/gallery/AnalysisGallery';
import AnalysisModal from '@/components/modal/AnalysisModal';
import ModernAnalysisForm from '@/components/analysis/ModernAnalysisForm';
import ChatInterface from '@/components/chat/ChatInterface';
import ExamplePrompts from '@/components/chat/ExamplePrompts';
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
  getAnalysisChartUrl,
  fixThumbnailUrl,
  keepGCPWarm,
  formatApiError
} from '@/utils/api';
import {
  AnalysisCard,
  AnalysisStatus,
  SessionAnalysis,
  GalleryItem,
  galleryItemToAnalysisCard,
  sessionAnalysisToAnalysisCard
} from '@/types/analysis';
import { sampleAnalyses } from '@/utils/sample-data';
import useToast from '@/hooks/useToast';

// Component that uses searchParams - needs to be wrapped in Suspense
function HomePageContent() {
  // State management
  const [activeTab, setActiveTab] = useState<'create' | 'my-analyses' | 'community' | 'pricing'>('create');
  const [userId, setUserId] = useState<string>('');

  // Gallery state
  const [userAnalyses, setUserAnalyses] = useState<AnalysisCard[]>([]);
  const [communityAnalyses, setCommunityAnalyses] = useState<AnalysisCard[]>(sampleAnalyses);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState<any>(null);

  // Chat interface state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentInput, setCurrentInput] = useState<string>('');

  // Hooks
  const { toasts, showToast, hideToast } = useToast();
  const searchParams = useSearchParams();

  // Initialize user ID and handle URL tab parameter
  useEffect(() => {
    setUserId(getUserId());

    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam && ['my-analyses', 'community', 'pricing'].includes(tabParam)) {
      setActiveTab(tabParam as 'my-analyses' | 'community' | 'pricing');
    }
  }, [searchParams]);

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
      }
    };

    checkApiHealthStatus();
  }, [showToast]);

  // Keep GCP instance warm to prevent cold starts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const isWarm = await keepGCPWarm();
        if (!isWarm && apiHealth?.status === 'healthy') {
          console.warn('GCP instance may be cooling down');
        }
      } catch (error) {
        console.warn('Keep-warm ping failed:', error);
      }
    }, 4 * 60 * 1000); // Ping every 4 minutes

    return () => clearInterval(interval);
  }, [apiHealth]);

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
      const analysisCards = galleryItems.map(item => {
        const card = galleryItemToAnalysisCard(item, userId);
        // Fix thumbnail URL to use backend API
        if (card.session_id) {
          card.thumbnail_url = fixThumbnailUrl(card.session_id);
        }
        return card;
      });
      setUserAnalyses(analysisCards);
    } catch (error) {
      console.error('Failed to load user analyses:', error);
      const errorMessage = formatApiError(error);
      showToast({
        type: 'error',
        title: 'Failed to Load Analyses',
        message: errorMessage,
        duration: 8000
      });
      setUserAnalyses([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleAnalysisComplete = (sessionData: SessionAnalysis) => {
    // Convert session to analysis card for immediate display
    const newAnalysisCard = sessionAnalysisToAnalysisCard(sessionData);
    
    // Fix thumbnail URL
    if (newAnalysisCard.session_id) {
      newAnalysisCard.thumbnail_url = fixThumbnailUrl(newAnalysisCard.session_id);
    }
    
    // Add to user analyses list
    setUserAnalyses(prev => [newAnalysisCard, ...prev]);
    
    // Add to community research (make it available for everyone)
    const communityAnalysis = {
      ...newAnalysisCard,
      category: 'community_research' as const,
      // Anonymize or keep author info as desired
      author: newAnalysisCard.author || 'Anonymous Researcher'
    };
    setCommunityAnalyses(prev => [communityAnalysis, ...prev]);
    
    // Show success with action buttons
    showToast({
      type: 'success',
      title: 'Analysis Complete! 🎉',
      message: 'Your NDVI analysis is ready and shared with the community',
      duration: 8000
    });

    // Switch to gallery view
    setActiveTab('my-analyses');
    
    // Show the analysis in modal
    setSelectedAnalysis(newAnalysisCard);
    setIsModalOpen(true);
  };

  // Gallery handlers
  const handleAnalysisView = (analysis: AnalysisCard) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  const handleAnalysisLike = (analysisId: string) => {
    // Update likes
    setUserAnalyses(prev => prev.map(analysis => 
      analysis.id === analysisId 
        ? { ...analysis, likes: analysis.likes + 1 }
        : analysis
    ));
    setCommunityAnalyses(prev => prev.map(analysis => 
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

  // Chat interface handlers
  const handleChatSubmit = async (query: string, credentialsFile?: File) => {
    if (isAnalyzing || !credentialsFile) return;

    setIsAnalyzing(true);
    setCurrentInput(query);

    try {
      showToast({
        type: 'info',
        title: 'Analysis Started',
        message: 'Processing your geospatial query...',
        duration: 5000
      });

      const sessionData = await submitAnalysis(
        { query, download_data: true },
        credentialsFile,
        userId,
        (progress, message) => {
          // Progress updates could be shown in toast or UI
          console.log(`Progress: ${progress}% - ${message}`);
        }
      );

      // Convert to analysis card and trigger the same flow
      handleAnalysisComplete(sessionData);

    } catch (error) {
      console.error('Chat analysis failed:', error);

      // Use improved error formatting
      const errorMessage = formatApiError(error);
      const isTimeout = errorMessage.includes('timed out') || errorMessage.includes('GCP may be processing');

      showToast({
        type: isTimeout ? 'warning' : 'error',
        title: isTimeout ? 'Processing Takes Time' : 'Analysis Failed',
        message: errorMessage,
        duration: isTimeout ? 12000 : 8000
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentInput('');
    }
  };

  const handleExamplePromptClick = (prompt: string) => {
    setCurrentInput(prompt);

    // Auto-scroll to chat interface and focus
    setTimeout(() => {
      const chatElement = document.querySelector('textarea');
      if (chatElement) {
        chatElement.focus();
        chatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Show toast feedback
    showToast({
      type: 'info',
      title: 'Example Selected',
      message: 'Example prompt added to input. Upload your credentials and submit!',
      duration: 3000
    });
  };

  // Hero section for create tab
  const renderHeroSection = () => (
    <div id="features" className="relative overflow-hidden py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-slate-900">
              Create Insights from 
            </span>
            <br />
            <span className="text-primary-600">
              Satellite Imagery
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-4xl mx-auto mb-8">
            <strong>Transform questions into comprehensive insights</strong> using advanced AI and satellite imagery. 
            Share your discoveries with the global research community.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-700">AI-Powered Analysis</span>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200/50 shadow-lg">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-slate-700">Global Coverage</span>
            </div>
            <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-green-200/50 shadow-lg">
              <Share2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-700">Share & Collaborate</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            variant="primary"
            size="lg"
            className="text-xl px-12 py-6 bg-primary-600 text-white hover:bg-primary-700 shadow-lg transition-all duration-300"
            onClick={() => {
              document.getElementById('analysis-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Rocket className="w-6 h-6 mr-3" />
            Start Your Analysis
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Pricing section
  const renderPricingSection = () => (
    <div id="pricing" className="container mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Choose the plan that fits your research needs. Start free and scale as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <Card className="text-center relative" padding="lg">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Research</h3>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              Free
            </div>
            <p className="text-slate-600">Perfect for academic research</p>
          </div>
          
          <ul className="space-y-4 mb-8 text-left">
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>5 analyses per month</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Community sharing</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Standard resolution</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Email support</span>
            </li>
          </ul>
          
          <Button variant="outline" fullWidth>
            Get Started Free
          </Button>
        </Card>

        {/* Pro Plan */}
        <Card className="text-center relative border-2 border-green-500" padding="lg">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-[#43978D] to-[#F9AD6A] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </span>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Professional</h3>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              $29<span className="text-xl text-slate-600">/month</span>
            </div>
            <p className="text-slate-600">For professional researchers</p>
            <p className="text-sm text-slate-500 mt-1">$39/month if billed monthly</p>
          </div>
          
          <ul className="space-y-4 mb-8 text-left">
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Unlimited analyses</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>High resolution imagery</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Private repositories</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>API access</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Priority support</span>
            </li>
          </ul>
          
          <Button
            variant="primary"
            fullWidth
            className="!bg-gradient-to-r !from-[#43978D] !to-[#43978D] hover:!from-[#264D59] hover:!to-[#264D59]"
          >
            Start Pro Trial
          </Button>
        </Card>

        {/* Enterprise Plan */}
        <Card className="text-center relative" padding="lg">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              Custom
            </div>
            <p className="text-slate-600">For large organizations</p>
          </div>
          
          <ul className="space-y-4 mb-8 text-left">
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Volume pricing</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>On-premise deployment</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Custom integrations</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Dedicated support</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>SLA guarantees</span>
            </li>
          </ul>
          
          <Button variant="outline" fullWidth>
            Contact Sales
          </Button>
        </Card>
      </div>
    </div>
  );

  // Get tab content
  const getTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="min-h-screen flex flex-col">
            {/* Main Hero Section with GeoLLM Branding */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-20">
              <div className="text-center max-w-4xl mx-auto mb-16">
                {/* LLEO Logo/Title */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#43978D] to-[#F9AD6A] rounded-2xl flex items-center justify-center">
                    <Satellite className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#264D59] to-[#D46C4E] bg-clip-text text-transparent">
                    LLEO
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-black mb-4 font-medium">
                  Large Language Models for Earth Observation
                </p>
                <p className="text-lg text-gray-800 max-w-2xl mx-auto mb-12">
                  Transform questions into comprehensive geospatial insights using advanced AI and satellite imagery.
                  Powered by Google Earth Engine.
                </p>

                {/* Main Chat Interface */}
                <div className="mb-16">
                  <ChatInterface
                    onSubmit={handleChatSubmit}
                    loading={isAnalyzing}
                    initialValue={currentInput}
                    onInputChange={setCurrentInput}
                  />
                </div>
              </div>

              {/* Example Prompts */}
              <div className="w-full max-w-6xl mx-auto">
                <ExamplePrompts
                  onPromptClick={handleExamplePromptClick}
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            {/* Resources Section (smaller/simplified) */}
            <div className="bg-gradient-to-r from-slate-100/30 to-orange-100/30 backdrop-blur-sm py-16">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43978D] to-[#F9AD6A] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">AI-Powered</h3>
                    <p className="text-sm text-gray-800">Advanced machine learning models for intelligent analysis</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43978D] to-[#F9AD6A] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Global Coverage</h3>
                    <p className="text-sm text-gray-800">Worldwide satellite imagery and data access</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43978D] to-[#F9AD6A] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Research Sharing</h3>
                    <p className="text-sm text-gray-800">Collaborate and share insights with the community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'my-analyses':
        return (
          <AnalysisGallery
            analyses={userAnalyses}
            title="My Analyses"
            description="Your personal NDVI analysis history and research projects"
            loading={loadingGallery}
            onAnalysisView={handleAnalysisView}
            onAnalysisLike={handleAnalysisLike}
            onAnalysisShare={handleAnalysisShare}
            onRefresh={loadUserAnalyses}
            emptyStateMessage="Create your first analysis to see results here. Click the logo to get started!"
          />
        );
        
      case 'community':
        return (
          <AnalysisGallery
            analyses={communityAnalyses}
            title="Community Research"
            description="Discover and explore analyses shared by researchers worldwide"
            loading={false}
            onAnalysisView={handleAnalysisView}
            onAnalysisLike={handleAnalysisLike}
            onAnalysisShare={handleAnalysisShare}
            emptyStateMessage="No community analyses available at the moment."
          />
        );
        
      case 'pricing':
        return renderPricingSection();
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
      />

      {/* Main Content */}
      <main>
        {getTabContent()}
      </main>

      {/* Footer */}
      <Footer />

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
          apiHealth?.status === 'healthy' 
            ? 'bg-green-100/90 text-green-800 border border-green-200' 
            : 'bg-yellow-100/90 text-yellow-800 border border-yellow-200'
        }`}>
          {apiHealth?.status === 'healthy' ? (
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
      `}</style>
    </div>
  );
}

// Main export with Suspense boundary for useSearchParams
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}