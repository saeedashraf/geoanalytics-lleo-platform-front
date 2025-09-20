'use client';

import { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Heart, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  FileText,
  BarChart3,
  Map,
  ExternalLink,
  Tag,
  Clock,
  Globe,
  Lock,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { AnalysisCard } from '@/types/analysis';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '@/utils/cn';
import { 
  downloadAnalysisZip, 
  openAnalysisMap, 
  getAnalysisMetadata,
  getAnalysisPreviewUrl,
  getAnalysisChartUrl,
  getAnalysisMapUrl,
  getAnalysisDownloadUrl,
  checkPreviewAvailability
} from '@/utils/api';
import useToast from '@/hooks/useToast';

interface AnalysisModalProps {
  analysis: AnalysisCard | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (analysisId: string) => void;
  onShare?: (analysis: AnalysisCard) => void;
  onDownload?: (analysis: AnalysisCard) => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onLike,
  onShare,
  onDownload
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [imageRetryTimer, setImageRetryTimer] = useState<NodeJS.Timeout | null>(null);
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { showToast } = useToast();

  // Update local state when analysis changes
  useEffect(() => {
    if (analysis) {
      setIsLiked(false);
      setLikeCount(analysis.likes);
      setImageLoading(true);
      setImageError(false);
      setImageRetryCount(0);
      setImageLoaded(false);
      
      // Clear any existing timers
      if (imageRetryTimer) {
        clearTimeout(imageRetryTimer);
        setImageRetryTimer(null);
      }
      if (pollTimer) {
        clearTimeout(pollTimer);
        setPollTimer(null);
      }
      
      // Load metadata if session_id is available
      if (analysis.session_id) {
        loadAnalysisMetadata(analysis.session_id);
        // Start polling for preview availability if image fails to load initially
        startPreviewPolling(analysis.session_id);
      }
    }
  }, [analysis]);

  // Handle escape key and cleanup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      // Clear all timers on cleanup
      if (imageRetryTimer) {
        clearTimeout(imageRetryTimer);
      }
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [isOpen, onClose, imageRetryTimer, pollTimer]);

  const loadAnalysisMetadata = async (sessionId: string) => {
    setLoadingMetadata(true);
    try {
      const meta = await getAnalysisMetadata(sessionId);
      setMetadata(meta);
    } catch (error) {
      console.warn('Could not load metadata:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const startPreviewPolling = (sessionId: string) => {
    let pollCount = 0;
    const maxPolls = 30; // Poll for up to 1 minute (2s intervals)
    
    const pollForPreview = async () => {
      // Stop if image has already loaded
      if (imageLoaded) {
        console.log('Image loaded, stopping polling');
        return;
      }
      
      pollCount++;
      console.log(`Polling for preview availability (attempt ${pollCount}/${maxPolls})`);
      
      const isAvailable = await checkPreviewAvailability(sessionId);
      
      if (isAvailable && imageError && !imageLoaded) {
        console.log('Preview became available, retrying image load');
        setImageError(false);
        setImageLoading(true);
        setImageRetryCount(0);
        return; // Stop polling
      }
      
      if (pollCount < maxPolls && !imageLoaded) {
        const timer = setTimeout(pollForPreview, 2000); // Poll every 2 seconds
        setPollTimer(timer);
      } else {
        console.log('Stopped polling for preview availability');
      }
    };
    
    // Start polling after a short delay (give the initial load attempt a chance)
    const timer = setTimeout(pollForPreview, 3000);
    setPollTimer(timer);
  };

  const handleImageError = () => {
    // Don't retry if image has already loaded successfully
    if (imageLoaded) {
      return;
    }
    
    const maxRetries = 5;
    const retryDelay = Math.min(2000 * (imageRetryCount + 1), 10000); // Exponential backoff, max 10s
    
    if (imageRetryCount < maxRetries) {
      console.log(`Image load failed, retrying in ${retryDelay}ms (attempt ${imageRetryCount + 1}/${maxRetries})`);
      
      const timer = setTimeout(() => {
        if (!imageLoaded) { // Double-check before retrying
          setImageRetryCount(prev => prev + 1);
          setImageError(false);
          setImageLoading(true);
        }
      }, retryDelay);
      
      setImageRetryTimer(timer);
    } else {
      console.warn('Max image retry attempts reached');
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoading(false);
    setImageError(false);
    setImageLoaded(true);
    
    // Clear any pending timers
    if (imageRetryTimer) {
      clearTimeout(imageRetryTimer);
      setImageRetryTimer(null);
    }
    if (pollTimer) {
      clearTimeout(pollTimer);
      setPollTimer(null);
    }
  };

  if (!isOpen || !analysis) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(analysis.id);
    
    showToast({
      type: isLiked ? 'info' : 'success',
      title: isLiked ? 'Like Removed' : 'Analysis Liked!',
      message: isLiked ? 'Removed from favorites' : 'Added to your favorites'
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?analysis=${analysis.session_id}`;
    navigator.clipboard.writeText(shareUrl);
    
    showToast({
      type: 'success',
      title: 'Link Copied!',
      message: 'Analysis link copied to clipboard'
    });
    
    onShare?.(analysis);
  };

  const handleDownload = async () => {
    try {
      showToast({
        type: 'info',
        title: 'Download Starting...',
        message: 'Preparing your analysis files'
      });

      if (analysis.session_id) {
        await downloadAnalysisZip(analysis.session_id);
      }
      
      showToast({
        type: 'success',
        title: 'Download Complete!',
        message: 'Your analysis files have been downloaded'
      });
      
      onDownload?.(analysis);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download analysis files'
      });
    }
  };

  const handleOpenMap = () => {
    if (analysis.session_id) {
      openAnalysisMap(analysis.session_id);
      showToast({
        type: 'info',
        title: 'Opening Interactive Map',
        message: `${analysis.location_name} analysis map`
      });
    }
  };

  const handleCopyUrl = async (type: 'map' | 'chart' | 'download') => {
    if (!analysis.session_id) return;
    
    let url = '';
    let label = '';
    
    switch (type) {
      case 'map':
        url = getAnalysisMapUrl(analysis.session_id);
        label = 'Map URL';
        break;
      case 'chart':
        url = getAnalysisChartUrl(analysis.session_id);
        label = 'Chart URL';
        break;
      case 'download':
        url = getAnalysisDownloadUrl(analysis.session_id);
        label = 'Download URL';
        break;
    }
    
    await navigator.clipboard.writeText(url);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
    
    showToast({
      type: 'success',
      title: 'URL Copied!',
      message: `${label} copied to clipboard`
    });
  };

  const getCategoryIcon = () => {
    switch (analysis.category) {
      case 'community_research':
        return <Globe className="w-5 h-5" />;
      case 'enterprise_repository':
        return <Lock className="w-5 h-5" />;
      case 'recently_published':
        return <Clock className="w-5 h-5" />;
      case 'user_analyses':
        return <User className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = () => {
    switch (analysis.category) {
      case 'community_research':
        return 'text-blue-600 bg-blue-100';
      case 'enterprise_repository':
        return 'text-purple-600 bg-purple-100';
      case 'recently_published':
        return 'text-green-600 bg-green-100';
      case 'user_analyses':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Card className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={cn('inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium', getCategoryColor())}>
                  {getCategoryIcon()}
                  <span className="capitalize">
                    {analysis.category.replace('_', ' ')}
                  </span>
                </div>
                {analysis.session_id && (
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-sm font-mono text-slate-600">
                    {analysis.session_id.substring(0, 8)}...
                  </div>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                {analysis.title}
              </h2>
              <p className="text-slate-600 text-lg">
                {analysis.description}
              </p>

              {/* Quick stats */}
              <div className="flex items-center space-x-6 mt-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{analysis.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{likeCount} likes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span>{analysis.shares} shares</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="p-6 space-y-8">
              
              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left column - Visual content */}
                <div className="space-y-6">
                  {/* Thumbnail/Preview */}
                  <Card padding="none" className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-blue-100 relative">
                      {analysis.thumbnail_url ? (
                        <>
                          {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm">
                              <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                <div className="text-sm text-slate-600">
                                  {imageRetryCount > 0 
                                    ? `Loading preview... (attempt ${imageRetryCount + 1})` 
                                    : 'Loading preview...'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {!imageError ? (
                            <img
                              src={imageRetryCount > 0 ? `${analysis.thumbnail_url}?retry=${imageRetryCount}&t=${Date.now()}` : analysis.thumbnail_url}
                              alt={analysis.title}
                              className={cn(
                                "w-full h-full object-cover",
                                imageLoading ? "opacity-0" : "opacity-100"
                              )}
                              onLoad={handleImageLoad}
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                              <ImageIcon className="w-16 h-16 mb-4" />
                              <div className="text-center">
                                <span className="block mb-2">Preview not available</span>
                                <span className="text-xs text-slate-400">
                                  The backend may still be processing your analysis
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <MapPin className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">{analysis.location_name}</h3>
                            <p className="text-slate-600">NDVI Analysis Preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="primary"
                      onClick={handleOpenMap}
                      className="flex items-center justify-center space-x-2"
                      disabled={!analysis.session_id}
                    >
                      <Map className="w-5 h-5" />
                      <span>Open Interactive Map</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => analysis.session_id && window.open(getAnalysisChartUrl(analysis.session_id), '_blank')}
                      className="flex items-center justify-center space-x-2"
                      disabled={!analysis.session_id}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>View Charts</span>
                    </Button>
                  </div>

                  {/* File URLs */}
                  {analysis.session_id && (
                    <Card padding="sm" className="bg-slate-50">
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Direct File Access
                      </h4>
                      <div className="space-y-2 text-sm">
                        {[
                          { type: 'map' as const, label: 'Interactive Map', icon: Map },
                          { type: 'chart' as const, label: 'Statistical Charts', icon: BarChart3 },
                          { type: 'download' as const, label: 'ZIP Download', icon: Download }
                        ].map(({ type, label, icon: Icon }) => (
                          <div key={type} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-slate-600" />
                              <span className="text-slate-700">{label}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyUrl(type)}
                              className="flex items-center space-x-1"
                            >
                              {copiedUrl === type ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  <span className="text-green-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Right column - Metadata */}
                <div className="space-y-6">
                  
                  {/* Research Query */}
                  {analysis.query && (
                    <Card>
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                        Original Research Query
                      </h3>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-purple-900 italic leading-relaxed">"{analysis.query}"</p>
                      </div>
                    </Card>
                  )}

                  {/* Key Details */}
                  <Card>
                    <h3 className="font-semibold text-slate-900 mb-4">Analysis Details</h3>
                    <div className="space-y-4">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-blue-600 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">Location</span>
                          </div>
                          <p className="font-semibold text-blue-900">{analysis.location_name}</p>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Time Period</span>
                          </div>
                          <p className="font-semibold text-green-900">
                            {analysis.start_year} - {analysis.end_year}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-orange-600 mb-1">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">Author</span>
                          </div>
                          <p className="font-semibold text-orange-900">{analysis.author}</p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-slate-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Created</span>
                          </div>
                          <p className="font-semibold text-slate-900">
                            {format(new Date(analysis.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Coordinates */}
                  {metadata && (
                    <Card>
                      <h3 className="font-semibold text-slate-900 mb-3">Study Area Coordinates</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-600 mb-1">Southwest</div>
                          <div className="text-slate-900 font-semibold">
                            {metadata.coordinates?.latitude?.min?.toFixed(4)}, {metadata.coordinates?.longitude?.min?.toFixed(4)}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-600 mb-1">Northeast</div>
                          <div className="text-slate-900 font-semibold">
                            {metadata.coordinates?.latitude?.max?.toFixed(4)}, {metadata.coordinates?.longitude?.max?.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Tags */}
                  {analysis.tags.length > 0 && (
                    <Card>
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600" />
                        Research Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Session Information */}
                  {analysis.session_id && (
                    <Card>
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                        Session Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Session ID:</span>
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-800">{analysis.session_id}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                        {metadata && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Backend Status:</span>
                            <span className="text-green-600 font-medium">{metadata.status}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                  
                  {/* Loading metadata indicator */}
                  {loadingMetadata && (
                    <Card className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-slate-600">Loading additional metadata...</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  'flex items-center space-x-2',
                  isLiked ? 'text-red-600' : 'text-slate-600'
                )}
              >
                <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                <span>{isLiked ? 'Liked' : 'Like'} ({likeCount})</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP</span>
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenMap}
                className="flex items-center space-x-2"
                disabled={!analysis.session_id}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Full Analysis</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AnalysisModal;