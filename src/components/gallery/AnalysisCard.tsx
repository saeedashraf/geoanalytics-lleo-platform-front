'use client';

import { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  User, 
  Heart, 
  Share2, 
  Eye, 
  Download,
  Lock,
  Globe,
  Building,
  ExternalLink,
  MoreVertical,
  BarChart3,
  Clock,
  Sparkles,
  FileText,
  ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { AnalysisCard as AnalysisCardType } from '@/types/analysis';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '@/utils/cn';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

interface AnalysisCardProps {
  analysis: AnalysisCardType;
  onView?: (analysis: AnalysisCardType) => void;
  onLike?: (analysisId: string) => void;
  onShare?: (analysis: AnalysisCardType) => void;
  className?: string;
  quickActions?: QuickAction[];
  showQuickActions?: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onView,
  onLike,
  onShare,
  className,
  quickActions = [],
  showQuickActions = true
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(analysis.likes);
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(analysis.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(analysis);
  };

  const handleView = () => {
    onView?.(analysis);
  };

  const getCategoryIcon = () => {
    switch (analysis.category) {
      case 'community_research':
        return <Globe className="w-4 h-4" />;
      case 'enterprise_repository':
        return <Building className="w-4 h-4" />;
      case 'recently_published':
        return <Clock className="w-4 h-4" />;
      case 'user_analyses':
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  const getActionColor = (color: QuickAction['color']) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'green':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      default:
        return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };

  return (
    <Card 
      hover 
      className={cn('group cursor-pointer overflow-hidden relative', className)}
      padding="none"
      onClick={handleView}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-blue-100 overflow-hidden">
        {analysis.thumbnail_url ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {!imageError ? (
              <img
                src={analysis.thumbnail_url}
                alt={analysis.title}
                className={cn(
                  "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-sm">Preview not available</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 font-medium">{analysis.location_name}</p>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <div className={cn('inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm', getCategoryColor())}>
            {getCategoryIcon()}
            <span className="capitalize">
              {analysis.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Privacy indicator */}
        <div className="absolute top-3 right-3">
          {analysis.is_public ? (
            <div className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
              <Globe className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
              <Lock className="w-4 h-4 text-orange-600" />
            </div>
          )}
        </div>

        {/* Session ID indicator (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {analysis.session_id?.substring(0, 8)}...
          </div>
        )}

        {/* Quick actions overlay */}
        {showQuickActions && quickActions.length > 0 && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    className={cn(
                      'p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg',
                      getActionColor(action.color)
                    )}
                    title={action.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
              
              {/* Main view button */}
              <Button
                variant="primary"
                size="sm"
                className="transform scale-95 group-hover:scale-100 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView();
                }}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title and menu */}
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-slate-900 line-clamp-2 flex-1 pr-2 group-hover:text-blue-600 transition-colors leading-tight">
            {analysis.title}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <Card className="absolute right-0 top-full mt-1 w-40 z-20 py-1 shadow-xl" padding="none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(e);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  
                  {analysis.download_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(analysis.download_url, '_blank');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                  
                  {analysis.map_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(analysis.map_url, '_blank');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Map</span>
                    </button>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2">
          {analysis.description}
        </p>

        {/* Query Preview */}
        {analysis.query && (
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200/50">
            <p className="text-xs text-blue-800 font-medium mb-1 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Research Query
            </p>
            <p className="text-xs text-blue-700 line-clamp-2 italic">
              "{analysis.query}"
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Location and time */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate font-medium">{analysis.location_name}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <Calendar className="w-3 h-3" />
              <span className="font-medium">{analysis.start_year}-{analysis.end_year}</span>
            </div>
          </div>

          {/* Author and date */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{analysis.author}</span>
            </div>
            <span className="flex-shrink-0 ml-2">
              {format(new Date(analysis.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Tags */}
        {analysis.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {analysis.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {analysis.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-md">
                +{analysis.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{analysis.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="w-3 h-3" />
              <span>{analysis.shares}</span>
            </div>
          </div>
          
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105',
              isLiked 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
            )}
          >
            <Heart className={cn('w-3 h-3', isLiked && 'fill-current')} />
            <span>{likeCount}</span>
          </button>
        </div>

        {/* Session info for development */}
        {process.env.NODE_ENV === 'development' && analysis.session_id && (
          <div className="text-xs font-mono text-slate-400 border-t pt-2">
            Session: {analysis.session_id}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};

export default AnalysisCard;