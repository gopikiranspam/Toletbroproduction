import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-white py-20 px-6 text-black">
      <SEO 
        title={isPrivacy ? 'Privacy Policy | TOLETBRO' : 'Terms of Service | TOLETBRO'}
        description={isPrivacy ? 'Our commitment to protecting your personal data.' : 'The terms and conditions for using TOLETBRO services.'}
      />
      
      <div className="mx-auto max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-12 flex items-center gap-2 text-sm font-bold hover:underline"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="border-b border-black pb-8">
            <h1 className="text-5xl font-bold tracking-tighter md:text-7xl">
              {isPrivacy ? 'Privacy' : 'Terms'} <span className="italic">Policy</span>
            </h1>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest text-gray-500">Last updated: March 25, 2026</p>
          </div>

          <div className="prose prose-neutral max-w-none space-y-12 text-lg leading-relaxed text-gray-800">
            {isPrivacy ? (
              <>
                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">1. Information We Collect</h2>
                  <p>We collect information that you provide directly to us when you use our services. This includes:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and profile picture when you register.</li>
                    <li><strong>Property Information:</strong> Address, photos, pricing, and descriptions of properties you list.</li>
                    <li><strong>Location Data:</strong> We collect precise or approximate location information from your mobile device if you grant us permission.</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our platform, including search queries and pages visited.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">2. How We Use Your Information</h2>
                  <p>We use the collected information for various purposes, including:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li>To provide and maintain our Service, including connecting tenants with property owners.</li>
                    <li>To notify you about changes to our Service or new property listings.</li>
                    <li>To provide customer support and gather analysis or valuable information to improve our Service.</li>
                    <li>To monitor the usage of our Service and detect, prevent, and address technical issues.</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">3. Sharing of Information</h2>
                  <p>We may share your information in the following situations:</p>
                  <ul className="list-inside list-disc space-y-4 marker:text-black">
                    <li><strong>With Other Users:</strong> When you express interest in a property or list a property, certain information (like your name and phone number) may be shared with the other party to facilitate the rental process.</li>
                    <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
                  </ul>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">4. Data Security</h2>
                  <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">5. Your Data Rights</h2>
                  <p>Under Indian data protection laws, you have the right to access, update, or delete the information we have on you. You can perform these actions within your account settings or by contacting us.</p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">1. Acceptance of Terms</h2>
                  <p>By accessing or using TOLETBRO, you agree to be bound by these Terms of Service, all applicable laws and regulations in India, and agree that you are responsible for compliance with any applicable local laws.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">2. Use License</h2>
                  <p>Permission is granted to temporarily download one copy of the materials (information or software) on TOLETBRO's website for personal, non-commercial transitory viewing only.</p>
                  <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by TOLETBRO at any time.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">3. Property Listings</h2>
                  <p>Property owners are solely responsible for the accuracy and legality of their listings. TOLETBRO does not verify the ownership of properties or the truthfulness of descriptions. Users are advised to perform their own due diligence before entering into any rental agreement.</p>
                  <p>Fake listings, duplicate listings, or listings with misleading information will be removed without notice, and the user account may be suspended.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">4. Fees and Payments</h2>
                  <p>TOLETBRO charges minimal fees for certain premium features like Smart Tolet Boards. These fees are non-refundable unless otherwise stated. We do not charge traditional brokerage fees based on rent amount.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">5. Limitation of Liability</h2>
                  <p>In no event shall TOLETBRO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TOLETBRO's website.</p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-bold text-black">6. Governing Law</h2>
                  <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                </section>
              </>
            )}
          </div>

          <div className="mt-20 border-t border-black pt-12">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Contact Information</p>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold">Gopikiran Cherukupally</p>
              <p className="text-gray-600">gopikiran1811@gmail.com</p>
              <p className="text-gray-600">Instagram: @gopikiran1811</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

