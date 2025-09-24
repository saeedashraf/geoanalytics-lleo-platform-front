'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Award,
  Zap,
  ArrowLeft,
  Send,
  Building,
  Lightbulb,
  Shield,
  MessageSquare,
  HelpCircle,
  Bug,
  Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Header />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-amber-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                Contact Us
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Have questions about LLEO? Need help with your earth observation analysis? We're here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              {/* Contact Cards */}
              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-amber-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Email Support</h3>
                    <p className="text-gray-600 text-sm mb-2">Get help with technical issues</p>
                    <a href="mailto:support@lleo.ai" className="text-green-600 hover:text-green-700 font-medium">
                      support@lleo.ai
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-amber-500 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">General Inquiries</h3>
                    <p className="text-gray-600 text-sm mb-2">Questions about our platform</p>
                    <a href="mailto:hello@lleo.ai" className="text-green-600 hover:text-green-700 font-medium">
                      hello@lleo.ai
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-amber-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Response Times</h3>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>General: 24-48 hours</p>
                      <p>Technical: 4-8 hours</p>
                      <p>Urgent: 1-2 hours</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-white/70 backdrop-blur-sm">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-4">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. We'll get back to you as soon as possible.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="!bg-gradient-to-r !from-green-500 !to-green-500 hover:!from-green-600 hover:!to-green-600"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-black mb-6">Send us a Message</h2>

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-black mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="partnership">Partnerships</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-vertical"
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="w-full md:w-auto !bg-gradient-to-r !from-green-500 !to-green-500 hover:!from-green-600 hover:!to-green-600"
                      disabled={isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-black mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <h3 className="font-semibold text-black mb-3">How do I get started with LLEO?</h3>
                <p className="text-gray-600 text-sm">
                  Simply create an account, upload your Google Earth Engine credentials, and start making geospatial analysis queries through our AI-powered interface.
                </p>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <h3 className="font-semibold text-black mb-3">What data sources does LLEO use?</h3>
                <p className="text-gray-600 text-sm">
                  LLEO primarily uses Google Earth Engine's extensive satellite imagery database, including Landsat, Sentinel, and MODIS data for comprehensive earth observation analysis.
                </p>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <h3 className="font-semibold text-black mb-3">Can I share my analysis results?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! LLEO includes a community research platform where you can share your findings with other researchers and access publicly shared analyses.
                </p>
              </Card>

              <Card className="p-6 bg-white/70 backdrop-blur-sm">
                <h3 className="font-semibold text-black mb-3">Is there a free trial?</h3>
                <p className="text-gray-600 text-sm">
                  We offer a free research tier with 5 analyses per month. Professional users can start with a free trial of our premium features.
                </p>
              </Card>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to LLEO
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 