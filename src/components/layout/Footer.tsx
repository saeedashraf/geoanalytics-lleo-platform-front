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
    <footer className="bg-gradient-to-r from-green-600 to-amber-600 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-200 to-amber-200 bg-clip-text text-transparent">
                  LLEO
                </h3>
                <p className="text-green-200 text-sm">Large Language Models for Earth Observation</p>
              </div>
            </div>
            <p className="text-green-100 mb-6 max-w-md">
              Advanced geospatial analysis platform powered by AI. Transform satellite imagery into actionable insights for research, agriculture, and environmental monitoring.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGitHubClick}
                className="text-green-200 hover:text-white hover:bg-green-700"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-200 hover:text-white hover:bg-green-700"
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
                  className="text-green-200 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Create Analysis
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-green-200 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="text-green-200 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-green-200">
                <Mail className="w-4 h-4 mr-3 text-green-400" />
                <a href="mailto:contact@lleo.ai" className="hover:text-white transition-colors">
                  contact@lleo.ai
                </a>
              </li>
              <li className="flex items-center text-green-200">
                <Globe className="w-4 h-4 mr-3 text-green-400" />
                <a href="https://lleo.ai" className="hover:text-white transition-colors flex items-center">
                  lleo.ai
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>

            <Button
              variant="primary"
              size="sm"
              onClick={handleContactClick}
              className="mt-4 w-full !bg-green-500 hover:!bg-green-600 !bg-gradient-to-r !from-green-500 !to-green-500 hover:!from-green-600 hover:!to-green-600"
            >
              Contact Us
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-amber-500 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-300 text-sm">
              © {currentYear} LLEO Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-green-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-green-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="text-green-300 hover:text-white text-sm transition-colors">
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