'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  HelpCircle,
  Globe,
  ChevronDown,
  Menu,
  X,
  Satellite,
  History,
  Database,
  DollarSign,
  Github,
  Sparkles,
  LogOut,
  Settings
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getUserId } from '@/utils/api';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();

  // Initialize user ID on client side only
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  // Simplified navigation - only core features
  const navigationItems = [
    {
      id: 'my-analyses',
      label: 'My Analyses',
      icon: History,
      description: 'Your analysis history',
      color: 'from-green-400 to-amber-500'
    },
    {
      id: 'community',
      label: 'Community Research',
      icon: Globe,
      description: 'Shared scientific repository',
      color: 'from-green-400 to-amber-500'
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: DollarSign,
      description: 'Plans and pricing',
      color: 'from-green-400 to-amber-500'
    },
  ];

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      // If we have onTabChange, use it (on main page)
      onTabChange(tabId);
    } else {
      // Otherwise, navigate to home page and trigger tab change
      router.push(`/?tab=${tabId}`);
    }
    setIsMobileMenuOpen(false);
  };

  const handleClearUserData = () => {
    localStorage.removeItem('geoanalytics_user_id');
    window.location.reload();
  };

  const handleGitHubClick = () => {
    window.open('https://github.com/yourusername/geoanalytics-platform', '_blank');
  };

  return (
    <header className="relative">
      {/* Main header */}
      <div className="bg-gradient-to-r from-green-600/90 to-amber-600/90 backdrop-blur-xl border-b border-amber-500/50 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-400/20 to-amber-400/20 rounded-full px-4 py-2 flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('create')}>
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Satellite className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">LLEO</span>
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`text-green-200 hover:text-white transition-colors duration-200 font-medium ${
                      isActive ? 'text-white' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Globe Icon */}
              <button className="p-2 text-green-200 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-green-200 transition-transform duration-200 ${
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
                    <Card className="absolute right-0 top-full mt-3 w-72 z-20 backdrop-blur-xl bg-white/90" padding="none">
                      <div className="p-6">
                        {/* User info */}
                        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200/50">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Research User</p>
                            <p className="text-sm text-slate-600 font-mono">{userId || 'Loading...'}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-xs text-green-600 font-medium">Session Active</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu items */}
                        <div className="pt-4 space-y-2">
                          <button 
                            onClick={() => {
                              handleTabClick('my-analyses');
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-3 text-left text-slate-700 hover:bg-slate-100/80 rounded-lg transition-all duration-200 group"
                          >
                            <div className="p-1.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                              <Database className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium group-hover:text-slate-900">My Analyses</div>
                              <div className="text-xs text-slate-500">View your analysis history</div>
                            </div>
                          </button>
                          
                          <button className="w-full flex items-center space-x-3 px-3 py-3 text-left text-slate-700 hover:bg-slate-100/80 rounded-lg transition-all duration-200 group">
                            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                              <Settings className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium group-hover:text-slate-900">Settings</div>
                              <div className="text-xs text-slate-500">Configure preferences</div>
                            </div>
                          </button>
                          
                          {/* Clear user data */}
                          <hr className="my-2 border-slate-200" />
                          <button 
                            onClick={handleClearUserData}
                            className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                          >
                            <div className="p-1.5 bg-red-100 rounded-lg">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium">Reset Session</div>
                              <div className="text-xs text-red-600">Clear user data & reload</div>
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
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
          <Card className="absolute top-full left-4 right-4 z-40 bg-white/95 backdrop-blur-xl lg:hidden" padding="sm">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile user info */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="px-4 py-3 text-sm text-slate-600">
                User ID: {userId ? userId.substring(0, 12) + '...' : 'Loading...'}
              </div>
            </div>
          </Card>
        </>
      )}
    </header>
  );
};

export default Header;