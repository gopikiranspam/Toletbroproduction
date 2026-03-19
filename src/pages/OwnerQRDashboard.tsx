import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { QRCodeData } from '../types';
import { QRGenerator } from '../components/QRGenerator';
import { motion } from 'motion/react';
import { 
  QrCode, 
  Camera, 
  Plus, 
  CheckCircle, 
  ExternalLink, 
  Info, 
  Smartphone,
  ChevronRight,
  Loader2,
  Download,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const OwnerQRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      if (!user || !isAuthReady) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await api.getQRByOwnerId(user.id);
        setQrData(data || null);
      } catch (err) {
        console.error("Failed to fetch QR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [user, isAuthReady]);

  const handleGenerateSelf = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const success = await api.generateSelfQR(user.id);
      if (success) {
        const data = await api.getQRByOwnerId(user.id);
        setQrData(data || null);
      }
    } catch (err) {
      console.error("Failed to generate QR:", err);
    } finally {
      setGenerating(false);
    }
  };

  const getPublicUrl = (qrId: string) => `${window.location.origin}/scan/${qrId}`;

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code-container svg') as SVGElement;
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `ToLetBro-QR-${qrData?.qrId || 'code'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (loading || !isAuthReady) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <Loader2 size={48} className="animate-spin text-brand mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Loading Dashboard...</h2>
      </div>
    );
  }
  
  if (!user || user.role !== 'OWNER') {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="mt-2 text-[var(--text-secondary)]">This dashboard is only available for Property Owners.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">Smart Tolet Board</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Manage your property's digital identity and physical board connectivity.</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          {qrData ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] border border-brand/20 bg-brand/5 p-12 text-center"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-black">
                <QrCode size={40} />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">Your Active QR Code</h2>
              <p className="mb-12 text-[var(--text-secondary)]">This QR code is permanently linked to your profile and listings.</p>
              
              <div id="qr-code-container" className="mx-auto max-w-[280px]">
                <QRGenerator value={getPublicUrl(qrData.qrId)} size={240} />
              </div>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button 
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
                >
                  <Download size={20} />
                  Download QR
                </button>
                <a 
                  href={getPublicUrl(qrData.qrId)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
                >
                  <ExternalLink size={20} />
                  <span>View Public Page</span>
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/scan')}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Camera size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--text-primary)]">Link Physical Board</p>
                    <p className="text-sm text-[var(--text-secondary)]">Scan your physical board to link it to your account.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-secondary)]/40" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleGenerateSelf}
                disabled={generating}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    {generating ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--text-primary)]">Generate Digital QR</p>
                    <p className="text-sm text-[var(--text-secondary)]">Create a QR code for your own marketing materials.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-secondary)]/40" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/list-property')}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Building2 size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--text-primary)]">List New Property</p>
                    <p className="text-sm text-[var(--text-secondary)]">Add a new property to your portfolio.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-secondary)]/40" />
              </motion.button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Info size={24} />
            </div>
            <h3 className="mb-6 text-xl font-bold text-[var(--text-primary)]">How it works</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">1</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Scan or generate a unique QR code that links permanently to your profile.</p>
              </li>
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">2</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Tenants scanning your QR will be directed to your listings page automatically.</p>
              </li>
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">3</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">If you have only one property, tenants go straight to that property's details.</p>
              </li>
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">4</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Once linked, the QR cannot be reassigned or deleted for security.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
