'use client';

import Link from 'next/link';
import { FileText, Users, Shield, AlertTriangle, Scale, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <Header />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-amber-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                Terms of Service
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              These terms govern your use of LLEO's earth observation and geospatial analysis platform.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-8">

            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing or using LLEO (Large Language Models for Earth Observation), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
                </p>
                <p>
                  We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Service Description</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>LLEO provides:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>AI-powered geospatial analysis using satellite imagery</li>
                  <li>Integration with Google Earth Engine for earth observation data</li>
                  <li>NDVI analysis and vegetation monitoring tools</li>
                  <li>Data visualization and export capabilities</li>
                  <li>Community sharing platform for research collaboration</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">User Responsibilities</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>You agree to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Provide accurate information when using our services</li>
                  <li>Use the platform only for lawful research and analysis purposes</li>
                  <li>Respect intellectual property rights and data usage policies</li>
                  <li>Maintain the security of your Google Earth Engine credentials</li>
                  <li>Not attempt to reverse engineer or exploit our systems</li>
                  <li>Follow community guidelines when sharing research</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-2xl font-bold text-black">Prohibited Uses</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>You may not use LLEO for:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Military surveillance or intelligence gathering</li>
                  <li>Illegal monitoring of private property</li>
                  <li>Commercial espionage or competitive intelligence</li>
                  <li>Violating privacy rights or applicable laws</li>
                  <li>Creating false or misleading analysis reports</li>
                  <li>Overwhelming our systems with excessive requests</li>
                </ul>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Data and Privacy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Regarding your data:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>You retain ownership of data you upload to our platform</li>
                  <li>Analysis results may be shared in the community research section</li>
                  <li>We implement security measures to protect your credentials</li>
                  <li>Google Earth Engine data is subject to Google's terms and policies</li>
                  <li>You can delete your data at any time through your account settings</li>
                </ul>
              </div>
            </section>

            {/* Billing and Payments */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Billing and Payments</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>For paid subscriptions:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Professional plan: $29/month (annual) or $39/month (monthly)</li>
                  <li>Billing occurs automatically on your chosen cycle</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>Usage limits apply based on your subscription tier</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  LLEO and its original content, features, and functionality are owned by LLEO and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, or create derivative works of our platform without explicit written permission.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  LLEO is provided "as is" without warranties of any kind. We are not liable for:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Accuracy of analysis results or satellite data</li>
                  <li>Decisions made based on our analysis</li>
                  <li>Service interruptions or data loss</li>
                  <li>Third-party content or services</li>
                  <li>Indirect or consequential damages</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account and access to the service at our discretion, without prior notice, for violations of these terms or other harmful conduct.
                </p>
                <p>
                  Upon termination, your right to use the service will cease, but these terms will remain in effect regarding your prior use.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Governing Law</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  These terms are governed by and construed in accordance with applicable laws. Any disputes will be resolved through binding arbitration or in competent courts.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions about these Terms of Service, please contact us:</p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@lleo.ai</p>
                  <p><strong>Address:</strong> LLEO Legal Team</p>
                </div>
              </div>
            </section>
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