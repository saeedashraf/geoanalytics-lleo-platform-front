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
    <footer className="bg-gradient-to-r from-[#43978D] to-[#F9AD6A] text-black">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#264D59] to-[#D46C4E] rounded-2xl flex items-center justify-center shadow-xl">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#264D59] to-[#D46C4E] bg-clip-text text-transparent">
                  LLEO
                </h3>
                <p className="text-black/80 text-sm">Large Language Models for Earth Observation</p>
              </div>
            </div>
            <p className="text-black/80 mb-6 max-w-md">
              Advanced geospatial analysis platform powered by AI. Transform satellite imagery into actionable insights for research, agriculture, and environmental monitoring.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGitHubClick}
                className="text-black/80 hover:text-black hover:bg-black/10"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-black/80 hover:text-black hover:bg-black/10"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#create"
                  className="text-black/80 hover:text-black transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-[#43978D] rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Create Analysis
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-black/80 hover:text-black transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-[#43978D] rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="text-black/80 hover:text-black transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-[#43978D] rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-black/80">
                <Mail className="w-4 h-4 mr-3 text-[#264D59]" />
                <a href="mailto:contact@lleo.ai" className="hover:text-black transition-colors">
                  contact@lleo.ai
                </a>
              </li>
              <li className="flex items-center text-black/80">
                <Globe className="w-4 h-4 mr-3 text-[#264D59]" />
                <a href="https://lleo.ai" className="hover:text-black transition-colors flex items-center">
                  lleo.ai
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>

            <Button
              variant="primary"
              size="sm"
              onClick={handleContactClick}
              className="mt-4 w-full !bg-[#43978D] hover:!bg-[#264D59] !bg-gradient-to-r !from-[#43978D] !to-[#43978D] hover:!from-[#264D59] hover:!to-[#264D59]">
            >
              Contact Us
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#D46C4E] mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-black/70 text-sm">
              © {currentYear} LLEO Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-black/70 hover:text-black text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-black/70 hover:text-black text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="text-black/70 hover:text-black text-sm transition-colors">
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