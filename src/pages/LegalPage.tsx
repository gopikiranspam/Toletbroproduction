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
    <div className="min-h-screen bg-[var(--bg)] py-20 px-6">
      <SEO 
        title={isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        description={isPrivacy ? 'Our commitment to protecting your personal data.' : 'The terms and conditions for using TOLETBRO services.'}
      />
      
      <div className="mx-auto max-w-3xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-12 shadow-2xl"
        >
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              {isPrivacy ? <Shield size={32} /> : <FileText size={32} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">Last updated: March 24, 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-[var(--text-secondary)]">
            {isPrivacy ? (
              <>
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">1. Information We Collect</h2>
                  <p>We collect information you provide directly to us, such as when you create an account, list a property, or contact us for support. This may include your name, email address, phone number, and property details.</p>
                  <ul className="list-inside list-disc space-y-2">
                    <li>Account Information (Name, Email, Password)</li>
                    <li>Property Details (Address, Photos, Pricing)</li>
                    <li>Communication Data (Messages between users)</li>
                    <li>Usage Data (IP address, browser type, pages visited)</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">2. How We Use Your Information</h2>
                  <p>We use the information we collect to provide, maintain, and improve our services, including:</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      'Facilitating property listings',
                      'Connecting owners and tenants',
                      'Personalizing your experience',
                      'Ensuring platform security',
                      'Communicating updates and offers',
                      'Complying with legal obligations'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-brand" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">3. Data Security</h2>
                  <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We strive to use commercially acceptable means to protect your personal information.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">4. Your Rights</h2>
                  <p>You have the right to access, correct, or delete your personal data. You can manage your privacy settings directly from your profile dashboard.</p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">1. Acceptance of Terms</h2>
                  <p>By accessing or using TOLETBRO, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">2. User Responsibilities</h2>
                  <p>Users are responsible for the accuracy of the information they provide. Property owners must ensure they have the legal right to list the properties they post.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">3. Prohibited Conduct</h2>
                  <p>Users may not use the platform for any illegal purposes, to harass others, or to post fraudulent listings. We reserve the right to terminate accounts that violate these terms.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">4. Limitation of Liability</h2>
                  <p>TOLETBRO is a platform connecting property owners and seekers. We are not responsible for the condition of properties or the conduct of users offline.</p>
                </section>
              </>
            )}
          </div>

          <div className="mt-12 rounded-2xl bg-brand/5 p-6 border border-brand/10">
            <p className="text-sm text-[var(--text-primary)] font-medium">
              Questions about our {isPrivacy ? 'Privacy Policy' : 'Terms'}?
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Contact our legal team at <span className="text-brand font-bold">legal@toletbro.com</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
