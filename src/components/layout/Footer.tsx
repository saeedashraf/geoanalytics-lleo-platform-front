'use client';

import { 
  Github, 
  Mail, 
  Globe, 
  MapPin, 
  Phone,
  ExternalLink
} from 'lucide-react';
import Button from '../ui/Button';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleGitHubClick = () => {
    window.open('https://github.com/yourusername/geoanalytics-platform', '_blank');
  };

  const handleContactClick = () => {
    // This will be handled by the parent component to show contact page
    window.location.href = '/contact';
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GeoAnalytics
                </h3>
                <p className="text-slate-400 text-sm">Create Insights from Satellite Imagery</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              Advanced geospatial analysis platform powered by AI. Transform satellite imagery into actionable insights for research, agriculture, and environmental monitoring.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGitHubClick}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#create" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Create Analysis
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#community" 
                  className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <Mail className="w-4 h-4 mr-3 text-blue-400" />
                <a href="mailto:contact@geoanalytics.com" className="hover:text-white transition-colors">
                  contact@geoanalytics.com
                </a>
              </li>
              <li className="flex items-center text-slate-300">
                <Globe className="w-4 h-4 mr-3 text-purple-400" />
                <a href="https://geoanalytics.com" className="hover:text-white transition-colors flex items-center">
                  geoanalytics.com
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleContactClick}
              className="mt-4 w-full"
            >
              Contact Us
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {currentYear} GeoAnalytics Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 