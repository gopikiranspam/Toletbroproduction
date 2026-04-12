import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  RefreshCcw, 
  CheckCircle2, 
  Package,
  ShieldAlert,
  Clock,
  MapPin,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const OrderBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrder = async () => {
    if (!user) {
      openAuth('USER');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const txnid = `TB${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const amount = "499.00";
      const productinfo = "Smart Tolet Board";
      const firstname = user.name || "Customer";
      const email = user.email || "";
      const phone = user.phone || "";

      // 1. Get Hash from Backend
      const response = await fetch('/api/payu/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnid,
          amount,
          productinfo,
          firstname,
          email,
          udf1: user.id // Store userId in udf1
        })
      });

      if (!response.ok) throw new Error('Failed to generate payment hash');
      const { hash, key, payuUrl } = await response.json();

      // 2. Create and Submit PayU Form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuUrl;

      const fields: Record<string, string> = {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        hash,
        surl: `${window.location.origin}/api/payu/response`,
        furl: `${window.location.origin}/api/payu/response`,
        udf1: user.id,
        service_provider: "payu_paisa"
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const benefits = [
    { icon: ShieldCheck, title: 'Hide your number & avoid unnecessary calls', desc: 'Hide your personal number and avoid unnecessary calls from non-serious people.' },
    { icon: Package, title: 'See how many people viewed your property', desc: 'See how many people viewed your property through the unique QR code on the board.' },
    { icon: CheckCircle2, title: 'Get only interested tenants calling you', desc: 'Get only interested tenants calling you directly through our smart routing.' },
    { icon: Clock, title: 'Promote your listing & get tenants faster', desc: 'Promote your listing physically and digitally to get tenants 3x faster.' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 pt-24 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-brand"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="flex flex-col gap-12">
          {/* Order Details Section - Moved to First */}
          <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Order Details</h2>
            
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                {/* Pricing */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest font-bold">Price</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[var(--text-primary)]">₹499</span>
                      <span className="text-sm text-[var(--text-secondary)] line-through">₹999</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-bold text-emerald-500">
                    50% OFF
                  </div>
                </div>

                {/* Delivery & Payment Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Truck size={18} className="mt-1 text-brand" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Fast Delivery</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">3-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard size={18} className="mt-1 text-brand" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Payment</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Online & COD available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCcw size={18} className="mt-1 text-brand" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Refund Policy</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">100% if not received</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={18} className="mt-1 text-brand" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Secure</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Encrypted transactions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center border-t border-[var(--border)] pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                {error && (
                  <p className="mb-4 text-center text-xs font-bold text-red-500">{error}</p>
                )}
                <button 
                  onClick={handleOrder}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    user ? 'Proceed to Order' : 'Login to Order'
                  )}
                </button>
                <p className="mt-4 text-center text-[10px] text-[var(--text-secondary)]">
                  Secure checkout powered by PayU
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section - Single Line Minimal */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-6">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <ShieldCheck size={18} className="text-brand" />
              <span>Hide your number & avoid unnecessary calls</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <Package size={18} className="text-brand" />
              <span>See how many people viewed your property</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <CheckCircle2 size={18} className="text-brand" />
              <span>Get only interested tenants calling you</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <Clock size={18} className="text-brand" />
              <span>Promote your listing & get tenants faster</span>
            </div>
          </div>

          {/* Premium QR Board Section - Moved to Last */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Premium <span className="text-brand">QR Board</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                The ultimate physical-to-digital connection for your property. Professional, durable, and smart. Weather-proof material with high visibility design.
              </p>
            </div>
            <div className="aspect-video overflow-hidden rounded-[2.5rem] bg-brand/5 border border-brand/20 flex items-center justify-center p-12">
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-3xl bg-brand/10 p-6 text-brand">
                  <Package size={64} />
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-[var(--text-primary)]">Smart Tolet Board</div>
                  <div className="text-xs text-[var(--text-secondary)] tracking-widest uppercase">Official Merchandise</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
