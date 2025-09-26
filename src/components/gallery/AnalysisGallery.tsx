'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  Calendar,
  Heart,
  Eye,
  RefreshCw,
  ExternalLink,
  Download,
  BarChart3,
  MapPin,
  Clock,
  User,
  Globe,
  Building,
  Sparkles
} from 'lucide-react';
import { AnalysisCard as AnalysisCardType } from '@/types/analysis';
import AnalysisCard from './AnalysisCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { cn } from '@/utils/cn';
import { 
  openAnalysisMap, 
  downloadAnalysisZip, 
  getAnalysisPreviewUrl, 
  getAnalysisChartUrl 
} from '@/utils/api';
import useToast from '@/hooks/useToast';

interface AnalysisGalleryProps {
  analyses: AnalysisCardType[];
  title: string;
  description?: string;
  loading?: boolean;
  onAnalysisView?: (analysis: AnalysisCardType) => void;
  onAnalysisLike?: (analysisId: string) => void;
  onAnalysisShare?: (analysis: AnalysisCardType) => void;
  onRefresh?: () => void;
  className?: string;
  showControls?: boolean;
  emptyStateMessage?: string;
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'title' | 'location';
type ViewMode = 'grid' | 'list';

const AnalysisGallery: React.FC<AnalysisGalleryProps> = ({
  analyses,
  title,
  description,
  loading = false,
  onAnalysisView,
  onAnalysisLike,
  onAnalysisShare,
  onRefresh,
  className,
  showControls = true,
  emptyStateMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { showToast } = useToast();

  // Extract unique tags from all analyses
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    analyses.forEach(analysis => {
      analysis.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [analyses]);

  // Filter and sort analyses
  const filteredAndSortedAnalyses = useMemo(() => {
    let filtered = analyses;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(analysis => 
        analysis.title.toLowerCase().includes(query) ||
        analysis.description.toLowerCase().includes(query) ||
        analysis.location_name.toLowerCase().includes(query) ||
        analysis.author.toLowerCase().includes(query) ||
        analysis.tags.some(tag => tag.toLowerCase().includes(query)) ||
        analysis.query.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(analysis =>
        selectedTags.some(tag => analysis.tags.includes(tag))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'popular':
          return (b.likes + b.views / 10) - (a.likes + a.views / 10);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'location':
          return a.location_name.localeCompare(b.location_name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [analyses, searchQuery, sortBy, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('newest');
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'newest':
      case 'oldest':
        return <Calendar className="w-4 h-4" />;
      case 'popular':
        return <Heart className="w-4 h-4" />;
      case 'title':
        return <SortAsc className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      default:
        return <SortAsc className="w-4 h-4" />;
    }
  };

  // Enhanced analysis actions
  const handleQuickView = (analysis: AnalysisCardType, type: 'map' | 'chart') => {
    try {
      if (type === 'map' && analysis.map_url) {
        openAnalysisMap(analysis.session_id);
        showToast({
          type: 'info',
          title: 'Opening Map',
          message: `Interactive map for ${analysis.location_name}`
        });
      } else if (type === 'chart' && analysis.chart_url) {
        window.open(analysis.chart_url, '_blank');
        showToast({
          type: 'info',
          title: 'Opening Chart',
          message: `Statistical charts for ${analysis.location_name}`
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to Open',
        message: 'Could not access the requested file'
      });
    }
  };

  const handleQuickDownload = async (analysis: AnalysisCardType) => {
    try {
      showToast({
        type: 'info',
        title: 'Download Starting',
        message: 'Preparing your analysis files...'
      });

      await downloadAnalysisZip(analysis.session_id);
      
      showToast({
        type: 'success',
        title: 'Download Complete',
        message: `${analysis.location_name} analysis downloaded`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download analysis files'
      });
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-[#43978D] to-[#F9AD6A] rounded-full flex items-center justify-center mx-auto mb-6">
            <LoadingSpinner size="lg" className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Loading Your Analyses</h3>
          <p className="text-gray-600">Fetching your NDVI analysis history...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
          {description && (
            <p className="text-slate-600 mb-4">{description}</p>
          )}
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <span>{filteredAndSortedAnalyses.length} of {analyses.length} analyses</span>
            {filteredAndSortedAnalyses.length !== analyses.length && (
              <span className="text-[#43978D] font-medium">• Filtered</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="shrink-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {showControls && (
        <Card padding="sm" className="backdrop-blur-xl bg-white/90">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search analyses, locations, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">Alphabetical</option>
                  <option value="location">By Location</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {getSortIcon()}
                </div>
              </div>

              {/* View mode toggle */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-3 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-3 transition-colors',
                    viewMode === 'list'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filters toggle */}
              <Button
                variant={showFilters ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {selectedTags.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                    Filter by Tags
                  </h4>
                  {(selectedTags.length > 0 || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          'px-3 py-2 text-sm rounded-xl border transition-all duration-200 hover:scale-105',
                          selectedTags.includes(tag)
                            ? 'bg-green-500 text-white border-green-500 shadow-lg'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-green-300 hover:text-green-600'
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No tags available</p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Results */}
      {filteredAndSortedAnalyses.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            {analyses.length === 0 ? 'No analyses yet' : 'No matching analyses'}
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            {emptyStateMessage || 
             (searchQuery || selectedTags.length > 0
              ? 'Try adjusting your search criteria or clearing filters.'
              : 'Create your first NDVI analysis to see results here.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(searchQuery || selectedTags.length > 0) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            {analyses.length === 0 && (
              <Button variant="primary" onClick={() => window.location.reload()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Analysis
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Gallery Grid */}
          <div 
            className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            )}
          >
            {filteredAndSortedAnalyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onView={onAnalysisView}
                onLike={onAnalysisLike}
                onShare={onAnalysisShare}
                className={cn(
                  'group relative',
                  viewMode === 'list' ? 'max-w-none' : ''
                )}
                // Enhanced with quick actions
                quickActions={[
                  {
                    icon: ExternalLink,
                    label: 'View Map',
                    action: () => handleQuickView(analysis, 'map'),
                    color: 'blue'
                  },
                  {
                    icon: BarChart3,
                    label: 'View Chart',
                    action: () => handleQuickView(analysis, 'chart'),
                    color: 'purple'
                  },
                  {
                    icon: Download,
                    label: 'Download',
                    action: () => handleQuickDownload(analysis),
                    color: 'green'
                  }
                ]}
              />
            ))}
          </div>

          {/* Load more hint (for future pagination) */}
          {filteredAndSortedAnalyses.length >= 20 && (
            <Card className="text-center py-8 bg-gradient-to-r from-slate-50 to-orange-50 border-[#43978D]/30">
              <p className="text-slate-600 mb-4">
                Showing {filteredAndSortedAnalyses.length} analyses
              </p>
              <p className="text-sm text-slate-500">
                💡 Use filters to narrow down results or create more targeted searches
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisGallery;