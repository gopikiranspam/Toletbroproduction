import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Target, Users, Mail, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white py-20 px-6 text-black">
      <SEO 
        title="About Us | TOLETBRO"
        description="The story behind TOLETBRO - Solving the struggle of finding direct rentals in metropolitan cities."
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
          className="space-y-16"
        >
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tighter md:text-7xl">
              Our <span className="italic">Story</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
              Built by a tenant, for the tenants. A journey from frustration to innovation.
            </p>
          </section>

          {/* Emotional Narrative */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                It all started with a simple search for a home in a busy metropolitan city. Like thousands of others, I walked through countless lanes, staring at faded "To-Let" boards, only to find they were either already taken or belonged to a broker demanding a month's rent as fee.
              </p>
              <p>
                I spent weeks juggling calls, facing the same repetitive questions from owners: "What's your rent budget?", "How much advance can you pay?", "When can you move in?". Every time I wanted to see a house, I had to coordinate schedules, only to realize the interior didn't match my needs at all.
              </p>
              <p>
                The frustration of paying platform fees just to get a phone number, or broker fees for a 10-minute tour, felt like a tax on being a newcomer in the city.
              </p>
            </div>
            <div className="bg-gray-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
              <Heart size={120} className="text-gray-300" strokeWidth={1} />
            </div>
          </section>

          {/* The Innovation */}
          <section className="bg-black text-white rounded-[3rem] p-12 md:p-20 space-y-8">
            <div className="flex items-center gap-4 text-brand">
              <Target size={32} />
              <h2 className="text-3xl font-bold">The Smart Tolet Board</h2>
            </div>
            <p className="text-xl md:text-2xl leading-relaxed opacity-90">
              That's when the idea of <span className="text-brand font-bold">Smart Tolet Boards</span> was born. Why should a tenant have to call an owner just to know the rent or see the rooms? 
            </p>
            <p className="text-lg opacity-80">
              By placing a QR-enabled board on the property, we allow tenants to scan and instantly see photos, rent details, and amenities without even knocking on the door. It saves the owner from repetitive calls and gives the tenant total transparency instantly.
            </p>
            <div className="pt-8 border-t border-white/10 italic text-gray-400">
              "We don't call ourselves 'NoBroker' like others who eventually charge like brokers. We built this to help struggling tenants in metropolitan cities, and we charge very minimal to keep the lights on."
            </div>
          </section>

          {/* Founder Section */}
          <section className="border-t border-gray-200 pt-16">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden grayscale">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" 
                  alt="Gopikiran Cherukupally"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-bold">Gopikiran Cherukupally</h3>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Founder & Visionary</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                  <a href="https://instagram.com/gopikiran1811" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand transition-colors">
                    <Instagram size={20} />
                    <span>@gopikiran1811</span>
                  </a>
                  <a href="mailto:gopikiran1811@gmail.com" className="flex items-center gap-2 hover:text-brand transition-colors">
                    <Mail size={20} />
                    <span>gopikiran1811@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="text-center py-12 border-t border-gray-200">
            <div className="flex justify-center mb-6">
              <Users size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              To eliminate the middleman and bring transparency to the rental market, one smart board at a time.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
