import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { QRCodeData } from '../types';
import { QRGenerator } from '../components/QRGenerator';
import { motion } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
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
  Building2,
  Printer,
  Layout,
  Search,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const OwnerQRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  
  // Board configuration state
  const [bhk, setBhk] = useState('');
  const [floor, setFloor] = useState('');
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `ToLetBro-Board-${qrData?.qrId || 'code'}`,
  });

  const downloadBoardImage = async () => {
    if (!componentRef.current) return;
    
    try {
      // Temporarily show the hidden board to capture it
      const board = componentRef.current;
      board.parentElement?.classList.remove('hidden');
      
      const dataUrl = await toPng(board, {
        quality: 1,
        pixelRatio: 2,
        width: 1122, // A4 landscape at 96dpi
        height: 794,
      });
      
      board.parentElement?.classList.add('hidden');

      const link = document.createElement('a');
      link.download = `ToLetBro-Board-${qrData?.qrId || 'code'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download board image:', err);
    }
  };

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
                  onClick={() => setShowBoardModal(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
                >
                  <Layout size={20} />
                  Generate Smart Board
                </button>
                <button 
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
                >
                  <Download size={20} />
                  Download QR
                </button>
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

      {/* Smart Board Generation Modal */}
      {showBoardModal && qrData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[var(--bg-primary)] p-8 shadow-2xl md:p-12"
          >
            <button 
              onClick={() => setShowBoardModal(false)}
              className="absolute right-8 top-8 rounded-full bg-[var(--bg-secondary)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Plus size={24} className="rotate-45" />
            </button>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">Generate Smart To-Let Board</h2>
              <p className="mt-2 text-[var(--text-secondary)]">Customize your board details before printing or downloading.</p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">BHK (e.g., 2 BHK)</label>
                    <input 
                      type="text" 
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      placeholder="Enter BHK"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Floor (e.g., 2nd Floor)</label>
                    <input 
                      type="text" 
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="Enter Floor"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button 
                    onClick={() => handlePrint()}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
                  >
                    <Printer size={20} />
                    Print / Save PDF
                  </button>
                  <button 
                    onClick={downloadBoardImage}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
                  >
                    <Download size={20} />
                    Download Image
                  </button>
                </div>

                <div className="rounded-2xl bg-brand/5 p-6 border border-brand/10">
                  <h4 className="mb-3 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                    <Info size={18} className="text-brand" />
                    Printing Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li>• Use A4 size paper for best results.</li>
                    <li>• Set orientation to "Landscape" in print settings.</li>
                    <li>• Enable "Background Graphics" if colors don't appear.</li>
                    <li>• Use "Save as PDF" to keep a digital copy.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Live Preview</h4>
                <div className="relative aspect-[297/210] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-inner">
                  <div className="absolute inset-0 origin-top-left scale-[0.35] sm:scale-[0.45] md:scale-[0.55] lg:scale-[0.4] xl:scale-[0.5]">
                    <BoardPreview bhk={bhk} floor={floor} qrUrl={getPublicUrl(qrData.qrId)} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hidden Printable Board */}
      <div className="hidden">
        <div ref={componentRef} className="print-board-container">
          {qrData && <BoardPreview bhk={bhk} floor={floor} qrUrl={getPublicUrl(qrData.qrId)} isPrint />}
        </div>
      </div>
    </div>
  );
};

const BoardPreview: React.FC<{ bhk: string; floor: string; qrUrl: string; isPrint?: boolean }> = ({ bhk, floor, qrUrl, isPrint }) => {
  return (
    <div className="flex flex-col h-full w-full bg-white text-black font-sans overflow-hidden border-[12px] border-black rounded-[2rem] p-8 relative">
      {/* Top Section */}
      <div className="flex w-full border-b-4 border-black pb-6 mb-8">
        <div className="w-2/3 flex items-center">
          <h1 className="text-[12rem] font-[900] leading-none text-[#FF0000] tracking-tighter">TO-LET</h1>
        </div>
        <div className="w-1/3 border-l-4 border-black pl-8 flex flex-col justify-center gap-8">
          <div className="flex items-end gap-4">
            <div className="flex-1 border-b-4 border-black pb-1 text-center">
              <span className="text-6xl font-black">{bhk || ""}</span>
            </div>
            <span className="text-6xl font-black text-[#FF0000]">BHK</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1 border-b-4 border-black pb-1 text-center">
              <span className="text-6xl font-black">{floor || ""}</span>
            </div>
            <span className="text-6xl font-black text-[#FF0000]">FLOOR</span>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-10">
          <h2 className="text-6xl font-black tracking-tight mb-2">
            Scan, See Inside and <span className="underline decoration-8 underline-offset-8">Contact Owner</span>
          </h2>
          <p className="text-4xl font-bold text-gray-800 mt-4">
            స్కాన్ చేయండి, లోపల ఎలా ఉందో చూడండి, మీకు నచ్చితేనే ఓనర్ కి కాల్ చేయండి
          </p>
        </div>

        <div className="flex flex-1 items-center justify-between px-4">
          {/* Left Column */}
          <div className="w-[30%] space-y-8">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Use Any of below:</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black rounded-full">
                  <Smartphone size={32} />
                </div>
                <p className="text-2xl font-bold">Use your Mobile Camera (or)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black rounded-full">
                  <Layout size={32} />
                </div>
                <p className="text-2xl font-bold">Open Google Lense & Scan (or)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black rounded-full">
                  <Search size={32} />
                </div>
                <p className="text-2xl font-bold">Visit : www.toletbro.com</p>
              </div>
            </div>
          </div>

          {/* Center QR Section */}
          <div className="relative flex flex-col items-center">
            {/* Scan Me Bubble */}
            <div className="absolute -top-16 -left-16 z-10">
              <div className="bg-black text-white px-6 py-3 rounded-2xl font-black text-3xl flex flex-col items-center relative">
                <span>SCAN</span>
                <span>ME!</span>
                <div className="absolute -bottom-3 right-4 w-6 h-6 bg-black rotate-45"></div>
              </div>
            </div>

            <div className="relative p-12">
              {/* Corners */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-[12px] border-l-[12px] border-black rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-24 h-24 border-t-[12px] border-r-[12px] border-black rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[12px] border-l-[12px] border-black rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[12px] border-r-[12px] border-black rounded-br-3xl"></div>
              
              <div className="bg-white p-2">
                <QRCodeSVG value={qrUrl} size={isPrint ? 320 : 240} level="H" includeMargin={false} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[30%] space-y-8">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">You will quickly find below :</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black rounded-full">
                  <Camera size={32} />
                </div>
                <p className="text-2xl font-bold">See Inside house images</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black rounded-full">
                  <Download size={32} />
                </div>
                <p className="text-2xl font-bold">Rent & Deposite Amount details</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black rounded-full">
                  <MapPin size={32} />
                </div>
                <p className="text-2xl font-bold">Find more To-lets near you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 border-t-4 border-black pt-6 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-6xl font-[900] tracking-tighter">SMART TOLET BOARDS</h2>
          <span className="text-2xl font-bold text-gray-600">Powered by Toletbro.com</span>
        </div>
        
        <div className="w-full bg-[#444444] rounded-2xl py-4 px-8 flex justify-center items-center text-white">
          <p className="text-3xl font-bold">
            If you want to order "Smart Tolet Board" Visit to www.toletbro.com | Contact: +91 8500482405
          </p>
        </div>
      </div>
    </div>
  );
};
