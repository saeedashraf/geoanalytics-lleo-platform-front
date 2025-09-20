'use client';

import { useState } from 'react';
import { 
  Settings, 
  User, 
  HelpCircle, 
  Globe, 
  ChevronDown,
  Menu,
  X,
  Satellite,
  BarChart3,
  Building,
  Clock,
  Sparkles
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { 
      id: 'create', 
      label: 'Create Analysis', 
      icon: Satellite,
      description: 'AI-powered NDVI analysis',
      color: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'recent', 
      label: 'Recently Published', 
      icon: Clock,
      description: 'Latest community research',
      color: 'from-green-500 to-teal-600'
    },
    { 
      id: 'community', 
      label: 'Community Research', 
      icon: Globe,
      description: 'Public scientific repository',
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'enterprise', 
      label: 'Enterprise Repository', 
      icon: Building,
      description: 'Private company analyses',
      color: 'from-purple-500 to-pink-600'
    },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative">
      {/* Main header */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo and brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                  <Satellite className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  GeoAnalytics
                </h1>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <p className="text-xs text-slate-600 font-medium">AI-Powered NDVI Platform</p>
                </div>
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`group relative flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 hover:scale-105'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-r ${item.color} text-white group-hover:scale-110`
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className={`text-xs opacity-75 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Help button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center space-x-2 hover:bg-blue-50"
                onClick={() => {/* TODO: Open help modal */}}
              >
                <HelpCircle className="w-4 h-4" />
                <span>About</span>
              </Button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-slate-900">Research User</div>
                    <div className="text-xs text-slate-600">researcher@geo.com</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Profile dropdown menu */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <Card className="absolute right-0 top-full mt-3 w-64 z-20 backdrop-blur-xl bg-white/90" padding="none">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200/50">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Research User</p>
                            <p className="text-sm text-slate-600">researcher@geo.com</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 space-y-2">
                          <button className="w-full flex items-center space-x-3 px-3 py-3 text-left text-slate-700 hover:bg-slate-100/80 rounded-lg transition-all duration-200 group">
                            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                              <Settings className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium group-hover:text-slate-900">Profile Settings</div>
                              <div className="text-xs text-slate-500">Manage your account</div>
                            </div>
                          </button>
                          <button className="w-full flex items-center space-x-3 px-3 py-3 text-left text-slate-700 hover:bg-slate-100/80 rounded-lg transition-all duration-200 group">
                            <div className="p-1.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                              <HelpCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium group-hover:text-slate-900">Help & Support</div>
                              <div className="text-xs text-slate-500">Documentation & guides</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Card className="absolute top-full left-4 right-4 z-40 backdrop-blur-xl bg-white/90 lg:hidden" padding="sm">
            <nav className="space-y-3">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-r ${item.color} text-white`
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{item.label}</div>
                      <div className={`text-xs opacity-75 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </>
      )}
    </header>
  );
};

export default Header;