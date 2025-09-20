'use client';

import { useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { AnalysisCard } from '@/types/analysis';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '@/utils/cn';

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
  // Handle escape key
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
    };
  }, [isOpen, onClose]);

  if (!isOpen || !analysis) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLike = () => {
    onLike?.(analysis.id);
  };

  const handleShare = () => {
    onShare?.(analysis);
  };

  const handleDownload = () => {
    onDownload?.(analysis);
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
        <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-primary-200">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                {analysis.title}
              </h2>
              <p className="text-primary-600">
                {analysis.description}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <X className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Thumbnail and basic info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                    {analysis.thumbnail_url ? (
                      <img
                        src={analysis.thumbnail_url}
                        alt={analysis.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-primary-400" />
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <Eye className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-primary-900">
                        {analysis.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-primary-600">Views</div>
                    </div>
                    <div className="text-center p-3 bg-accent-50 rounded-lg">
                      <Heart className="w-5 h-5 text-accent-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-accent-900">
                        {analysis.likes}
                      </div>
                      <div className="text-xs text-accent-600">Likes</div>
                    </div>
                    <div className="text-center p-3 bg-success-50 rounded-lg">
                      <Share2 className="w-5 h-5 text-success-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-success-900">
                        {analysis.shares}
                      </div>
                      <div className="text-xs text-success-600">Shares</div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-6">
                  {/* Research Query */}
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-accent-600" />
                      Research Query
                    </h3>
                    <div className="p-3 bg-accent-50 rounded-lg border border-accent-200">
                      <p className="text-accent-900 italic">"{analysis.query}"</p>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-3">Analysis Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-primary-100">
                        <div className="flex items-center space-x-2 text-primary-600">
                          <MapPin className="w-4 h-4" />
                          <span>Location</span>
                        </div>
                        <span className="font-medium text-primary-900">{analysis.location_name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-primary-100">
                        <div className="flex items-center space-x-2 text-primary-600">
                          <Calendar className="w-4 h-4" />
                          <span>Time Period</span>
                        </div>
                        <span className="font-medium text-primary-900">
                          {analysis.start_year} - {analysis.end_year}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-primary-100">
                        <div className="flex items-center space-x-2 text-primary-600">
                          <User className="w-4 h-4" />
                          <span>Author</span>
                        </div>
                        <span className="font-medium text-primary-900">{analysis.author}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2 text-primary-600">
                          <Calendar className="w-4 h-4" />
                          <span>Published</span>
                        </div>
                        <span className="font-medium text-primary-900">
                          {format(new Date(analysis.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-2">Study Area Coordinates</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-primary-50 rounded">
                        <div className="text-primary-600">Southwest</div>
                        <div className="text-primary-900">
                          {analysis.coordinates.southwest_lat.toFixed(4)}, {analysis.coordinates.southwest_lon.toFixed(4)}
                        </div>
                      </div>
                      <div className="p-2 bg-primary-50 rounded">
                        <div className="text-primary-600">Northeast</div>
                        <div className="text-primary-900">
                          {analysis.coordinates.northeast_lat.toFixed(4)}, {analysis.coordinates.northeast_lon.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {analysis.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-primary-900 mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-accent-600" />
                    Research Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium bg-accent-100 text-accent-800 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Results (if available) */}
              {analysis.analysis_results && (
                <div>
                  <h3 className="font-semibold text-primary-900 mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-accent-600" />
                    Analysis Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card padding="sm" className="bg-success-50 border-success-200">
                      <h4 className="font-medium text-success-900 mb-2">Available Files</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(analysis.analysis_results.files_included).map(([file, description]) => (
                          <div key={file} className="flex items-start space-x-2">
                            <div className="w-1 h-1 bg-success-600 rounded-full mt-2 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-success-900">{file}</div>
                              <div className="text-success-700">{description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    <Card padding="sm" className="bg-primary-50 border-primary-200">
                      <h4 className="font-medium text-primary-900 mb-2">Analysis Period</h4>
                      <div className="text-sm text-primary-700">
                        <div>Start Year: {analysis.analysis_results.extracted_data.start_year}</div>
                        <div>End Year: {analysis.analysis_results.extracted_data.end_year}</div>
                        <div className="mt-2 text-xs text-primary-600">
                          Location: {analysis.analysis_results.extracted_data.location.name}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-primary-200 bg-primary-25">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="flex items-center space-x-2"
              >
                <Heart className="w-4 h-4" />
                <span>Like ({analysis.likes})</span>
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

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // TODO: Open in new analysis view
                  window.open('#', '_blank');
                }}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Full View</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisModal;