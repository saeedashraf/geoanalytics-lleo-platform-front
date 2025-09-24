'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, StopCircle, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  onSubmit: (query: string, file?: File) => void;
  loading?: boolean;
  onStopGeneration?: () => void;
  initialValue?: string; // For setting value from example prompts
  onInputChange?: (value: string) => void; // To sync with parent state
}

export default function ChatInterface({ onSubmit, loading = false, onStopGeneration, initialValue = '', onInputChange }: ChatInterfaceProps) {
  const [input, setInput] = useState(initialValue);
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with parent state when initialValue changes
  useEffect(() => {
    if (initialValue !== input) {
      setInput(initialValue);
      // Auto-resize textarea after setting value
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    onSubmit(input.trim(), credentialsFile || undefined);
    setInput('');
    onInputChange?.(''); // Clear parent state too
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setCredentialsFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setCredentialsFile(file);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Credentials Upload Area */}
      {!credentialsFile && (
        <div
          className={`mb-6 p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${
            dragActive
              ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Upload your Google Earth Engine credentials (JSON file)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Drag and drop or click to browse
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm"
            >
              Choose File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Credentials Status */}
      {credentialsFile && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 dark:text-green-300">
                Credentials: {credentialsFile.name}
              </span>
            </div>
            <button
              onClick={() => setCredentialsFile(null)}
              className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onInputChange?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe your geospatial analysis request..."
            className="w-full px-6 py-4 pr-16 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg leading-relaxed min-h-[60px] max-h-[200px]"
            rows={1}
            disabled={loading}
          />

          {/* Submit Button */}
          <div className="absolute bottom-3 right-3">
            {loading ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onStopGeneration}
                className="h-10 w-10 rounded-full p-0 bg-red-500 hover:bg-red-600"
                disabled={!onStopGeneration}
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!input.trim() || !credentialsFile}
                className="h-10 w-10 rounded-full p-0 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-3 px-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Press Enter to send, Shift + Enter for new line</span>
          {!credentialsFile && (
            <span className="text-orange-500 dark:text-orange-400">
              ⚠ Credentials required for analysis
            </span>
          )}
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="mt-6 flex items-center justify-center space-x-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Analyzing with GeoLLM...</span>
        </div>
      )}
    </div>
  );
}