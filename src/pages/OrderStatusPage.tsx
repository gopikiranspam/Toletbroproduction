import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ArrowLeft, Package, Clock, ShieldCheck } from 'lucide-react';

export const OrderStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const txnid = searchParams.get('txnid');
  const amount = searchParams.get('amount');
  const reason = searchParams.get('reason');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 pt-32 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-12 shadow-2xl"
        >
          {isSuccess ? (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Order Successful!</h1>
              <p className="text-[var(--text-secondary)]">
                Thank you for your order. Your Smart Tolet Board will be delivered within 3-5 business days.
              </p>
              
              <div className="rounded-2xl bg-[var(--bg)] p-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Transaction ID:</span>
                  <span className="font-bold text-[var(--text-primary)]">{txnid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Amount Paid:</span>
                  <span className="font-bold text-[var(--text-primary)]">₹{amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Status:</span>
                  <span className="font-bold text-emerald-500 uppercase">Confirmed</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2">
                  <Package size={24} className="text-brand" />
                  <span className="text-[10px] font-bold uppercase">Packed</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <Clock size={24} />
                  <span className="text-[10px] font-bold uppercase">Shipped</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <ShieldCheck size={24} />
                  <span className="text-[10px] font-bold uppercase">Delivered</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <XCircle size={48} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Payment Failed</h1>
              <p className="text-[var(--text-secondary)]">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>
              
              {txnid && (
                <div className="rounded-2xl bg-[var(--bg)] p-4">
                  <p className="text-xs text-[var(--text-secondary)]">Transaction ID: {txnid}</p>
                </div>
              )}

              <div className="pt-6">
                <button 
                  onClick={() => navigate('/order-board')}
                  className="w-full rounded-2xl bg-brand py-4 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 flex items-center justify-center gap-2 mx-auto text-sm font-bold text-[var(--text-secondary)] hover:text-brand transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};
