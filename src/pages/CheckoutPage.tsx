import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, CreditCard, Lock, CheckCircle2, Loader2, IndianRupee, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('UPI');

  const plans: Record<string, { title: string; price: number; features: string[] }> = {
    'smart-board': {
      title: 'Smart Tolet Board',
      price: 999,
      features: ['Physical QR Board', 'Real-time Analytics', 'Priority Support', 'Verified Badge']
    },
    'promotion': {
      title: 'Property Promotion',
      price: 49,
      features: ['Top of Search Results', 'Featured Badge', 'Social Media Shoutout', '7 Days Duration']
    },
    'premium': {
      title: 'Premium Package',
      price: 1499,
      features: ['Smart Tolet Board', 'Privacy Features', 'Unlimited Posts', 'Lifetime Support']
    }
  };

  const plan = plans[planId || ''] || plans['smart-board'];

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment process
    setTimeout(() => {
      setIsProcessing(false);
      alert("Payment gateway is temporarily under maintenance. Please try again later.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 pt-24 px-6">
      <div className="mx-auto max-w-5xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-brand"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-12 shadow-xl">
              <h1 className="mb-8 text-3xl font-bold text-[var(--text-primary)]">Checkout</h1>
              
              <div className="space-y-8">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-black">1</span>
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Phone Number</label>
                      <input 
                        type="tel" 
                        defaultValue={user?.phone}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-black">2</span>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      { id: 'UPI', icon: Zap, label: 'UPI / GPay' },
                      { id: 'CARD', icon: CreditCard, label: 'Card' },
                      { id: 'NETBANKING', icon: Lock, label: 'Net Banking' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                          paymentMethod === method.id 
                            ? 'border-brand bg-brand/5 text-brand' 
                            : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:border-brand/50'
                        }`}
                      >
                        <method.icon size={24} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 rounded-2xl bg-[var(--bg)] p-6 border border-[var(--border)]">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                      <ShieldCheck size={20} className="text-emerald-500" />
                      <p className="text-xs font-medium">Your payment is secured with 128-bit SSL encryption. We never store your full card details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <section className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{plan.title}</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">₹{plan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">GST (18%)</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">₹{(plan.price * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[var(--text-primary)]">Total</span>
                    <span className="text-lg font-bold text-brand">₹{(plan.price * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Plan Features:</h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 size={14} className="text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-brand py-5 text-sm font-bold text-black shadow-xl shadow-brand/20 transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Pay Now Securely
                    <CreditCard size={18} />
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-4 opacity-40 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay_logo.svg/1200px-RuPay_logo.svg.png" alt="RuPay" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
              </div>
            </section>

            <div className="rounded-3xl border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Need help?</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Contact support at <span className="text-brand">support@toletbro.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
