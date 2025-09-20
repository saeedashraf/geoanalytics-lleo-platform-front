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
  RefreshCw
} from 'lucide-react';
import { AnalysisCard as AnalysisCardType } from '@/types/analysis';
import AnalysisCard from './AnalysisCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { cn } from '@/utils/cn';

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
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'title';
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
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
        analysis.tags.some(tag => tag.toLowerCase().includes(query))
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
        return sortBy === 'title' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
      default:
        return <SortAsc className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center py-12">
          <LoadingSpinner size="lg" className="mx-auto text-accent-600 mb-4" />
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Loading Analyses</h3>
          <p className="text-primary-600">Fetching the latest research data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">{title}</h2>
          {description && (
            <p className="text-primary-600 mt-1">{description}</p>
          )}
          <p className="text-sm text-primary-500 mt-2">
            {filteredAndSortedAnalyses.length} of {analyses.length} analyses
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder="Search analyses, locations, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
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
                className="appearance-none bg-white border border-primary-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {getSortIcon()}
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex border border-primary-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-white text-primary-600 hover:bg-primary-50'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-white text-primary-600 hover:bg-primary-50'
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
              <Filter className="w-4 h-4 mr-1" />
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
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-primary-900">Filter by Tags</h4>
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
              
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-full border transition-all duration-200',
                      selectedTags.includes(tag)
                        ? 'bg-accent-500 text-white border-accent-500'
                        : 'bg-white text-primary-700 border-primary-200 hover:border-accent-500 hover:text-accent-600'
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {filteredAndSortedAnalyses.length === 0 ? (
        <Card className="text-center py-12">
          <Search className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary-900 mb-2">No Analyses Found</h3>
          <p className="text-primary-600 mb-4">
            {searchQuery || selectedTags.length > 0
              ? 'Try adjusting your search criteria or clearing filters.'
              : 'No analyses available in this category yet.'
            }
          </p>
          {(searchQuery || selectedTags.length > 0) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
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
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}

      {/* Load more button (for future pagination) */}
      {filteredAndSortedAnalyses.length > 0 && filteredAndSortedAnalyses.length % 12 === 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Load More Analyses
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnalysisGallery;