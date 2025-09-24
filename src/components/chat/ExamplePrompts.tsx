'use client';

import { TreePine, Wind, Coffee, Droplets, Cloud, AlertTriangle, Sparkles, Satellite, BarChart3 } from 'lucide-react';

interface ExamplePrompt {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: 'environmental' | 'urban' | 'weather' | 'risk';
  description: string;
}

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void;
  disabled?: boolean;
}

const examplePrompts: ExamplePrompt[] = [
  {
    id: '1',
    text: 'Analyze vegetation changes in Amazon rainforest 2020 vs 2024',
    icon: <TreePine className="h-5 w-5" />,
    category: 'environmental',
    description: 'NDVI analysis of deforestation patterns'
  },
  {
    id: '2',
    text: 'Show air quality in Los Angeles over the past year',
    icon: <Wind className="h-5 w-5" />,
    category: 'environmental',
    description: 'Air pollution monitoring and trends'
  },
  {
    id: '3',
    text: 'Find all coffee shops in downtown San Francisco',
    icon: <Coffee className="h-5 w-5" />,
    category: 'urban',
    description: 'POI detection and mapping'
  },
  {
    id: '4',
    text: "What's the water quality of Lake Tahoe?",
    icon: <Droplets className="h-5 w-5" />,
    category: 'environmental',
    description: 'Water quality assessment using satellite data'
  },
  {
    id: '5',
    text: 'Weather forecast for Tokyo next 5 days',
    icon: <Cloud className="h-5 w-5" />,
    category: 'weather',
    description: 'Meteorological analysis and prediction'
  },
  {
    id: '6',
    text: 'Assess flooding risk in Miami',
    icon: <AlertTriangle className="h-5 w-5" />,
    category: 'risk',
    description: 'Climate risk assessment and vulnerability mapping'
  }
];

const categoryColors = {
  environmental: 'from-green-400 to-amber-500 border-green-200',
  urban: 'from-green-400 to-amber-500 border-green-200',
  weather: 'from-green-400 to-amber-500 border-green-200',
  risk: 'from-green-400 to-amber-500 border-green-200'
};

const categoryHoverColors = {
  environmental: 'hover:border-amber-300',
  urban: 'hover:border-amber-300',
  weather: 'hover:border-amber-300',
  risk: 'hover:border-amber-300'
};

export default function ExamplePrompts({ onPromptClick, disabled = false }: ExamplePromptsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
            Try these examples
          </h3>
        </div>
        <p className="text-gray-800 max-w-2xl mx-auto">
          Get started with these sample queries to explore LLEO's capabilities in environmental monitoring,
          urban analysis, weather forecasting, and risk assessment.
        </p>
      </div>

      {/* Example Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => !disabled && onPromptClick(prompt.text)}
            disabled={disabled}
            className={`group relative p-4 bg-white/70 backdrop-blur-sm border-2 rounded-xl
                       transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left
                       ${categoryHoverColors[prompt.category]}
                       ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/90'}
                       border-green-200`}
          >
            {/* Icon Background */}
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${categoryColors[prompt.category]} text-white mb-3`}>
              {prompt.icon}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h4 className="font-semibold text-black text-sm leading-tight line-clamp-2 group-hover:text-gray-800 transition-colors">
                {prompt.text}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {prompt.description}
              </p>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 flex items-center justify-center space-x-2">
          <Satellite className="h-4 w-4" />
          <span>Powered by Google Earth Engine and advanced AI models</span>
        </p>
      </div>
    </div>
  );
}