'use client';

import Link from 'next/link';
import { Shield, Lock, Eye, Database, FileText } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <Header />

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#43978D] to-[#F9AD6A] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#264D59] to-[#D46C4E] bg-clip-text text-transparent">
                Privacy Policy
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Your privacy is important to us. This policy explains how LLEO collects, uses, and protects your data.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-8">

            {/* Information We Collect */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Account Information:</strong> User ID, email address, and preferences</li>
                  <li><strong>Analysis Data:</strong> Geospatial queries, uploaded credentials, and analysis results</li>
                  <li><strong>Usage Information:</strong> How you interact with our platform and services</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, and session data</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use the information we collect to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Provide, maintain, and improve our earth observation analysis services</li>
                  <li>Process your geospatial analysis requests using Google Earth Engine</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Ensure the security and integrity of our platform</li>
                  <li>Comply with legal obligations and resolve disputes</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Data Security</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure handling of Google Earth Engine credentials</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Third-Party Services</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>LLEO integrates with the following third-party services:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Google Earth Engine:</strong> For satellite imagery analysis and processing</li>
                  <li><strong>Cloud Storage:</strong> For secure storage of analysis results</li>
                  <li><strong>Analytics Services:</strong> To improve our platform performance</li>
                </ul>
                <p>These services have their own privacy policies, and we encourage you to review them.</p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-2xl font-bold text-black">Your Rights</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Access, update, or delete your personal information</li>
                  <li>Export your analysis data and results</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request information about how your data is processed</li>
                  <li>File a complaint with relevant data protection authorities</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Account data: Until you delete your account</li>
                  <li>Analysis results: 2 years from creation date</li>
                  <li>Usage logs: 1 year for security and performance analysis</li>
                  <li>Financial records: As required by applicable law</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-black mb-4">Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about this Privacy Policy, please contact us:</p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@lleo.ai</p>
                  <p><strong>Address:</strong> LLEO Privacy Team</p>
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