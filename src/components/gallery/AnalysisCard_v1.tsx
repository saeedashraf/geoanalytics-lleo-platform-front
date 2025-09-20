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
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { AnalysisCard as AnalysisCardType } from '@/types/analysis';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '@/utils/cn';

interface AnalysisCardProps {
  analysis: AnalysisCardType;
  onView?: (analysis: AnalysisCardType) => void;
  onLike?: (analysisId: string) => void;
  onShare?: (analysis: AnalysisCardType) => void;
  className?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onView,
  onLike,
  onShare,
  className
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(analysis.likes);
  const [showMenu, setShowMenu] = useState(false);

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
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryColor = () => {
    switch (analysis.category) {
      case 'community_research':
        return 'text-blue-600 bg-blue-100';
      case 'enterprise_repository':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-accent-600 bg-accent-100';
    }
  };

  return (
    <Card 
      hover 
      className={cn('group cursor-pointer overflow-hidden', className)}
      padding="none"
      onClick={handleView}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden">
        {analysis.thumbnail_url ? (
          <img
            src={analysis.thumbnail_url}
            alt={analysis.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-primary-400" />
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <div className={cn('inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium', getCategoryColor())}>
            {getCategoryIcon()}
            <span className="capitalize">
              {analysis.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Privacy indicator */}
        <div className="absolute top-3 right-3">
          {analysis.is_public ? (
            <div className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm">
              <Globe className="w-4 h-4 text-success-600" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm">
              <Lock className="w-4 h-4 text-warning-600" />
            </div>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="primary"
            size="sm"
            className="transform scale-95 group-hover:scale-100 transition-transform duration-200"
            onClick={(e) => {
              e?.stopPropagation();
              handleView();
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Analysis
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and menu */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-primary-900 line-clamp-2 flex-1 pr-2 group-hover:text-accent-600 transition-colors">
            {analysis.title}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-md hover:bg-primary-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-primary-500" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <Card className="absolute right-0 top-full mt-1 w-36 z-20 py-1" padding="none">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement download
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-primary-600 line-clamp-2">
          {analysis.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2">
          {/* Location and time */}
          <div className="flex items-center justify-between text-xs text-primary-500">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{analysis.location_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{analysis.start_year}-{analysis.end_year}</span>
            </div>
          </div>

          {/* Author and date */}
          <div className="flex items-center justify-between text-xs text-primary-500">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="truncate">{analysis.author}</span>
            </div>
            <span>{format(new Date(analysis.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Tags */}
        {analysis.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {analysis.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {analysis.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-500 rounded-md">
                +{analysis.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between pt-2 border-t border-primary-100">
          <div className="flex items-center space-x-4 text-xs text-primary-500">
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
              'flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200',
              isLiked 
                ? 'text-error-600 bg-error-50 hover:bg-error-100' 
                : 'text-primary-500 hover:text-error-600 hover:bg-error-50'
            )}
          >
            <Heart className={cn('w-3 h-3', isLiked && 'fill-current')} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AnalysisCard;