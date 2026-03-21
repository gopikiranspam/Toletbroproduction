import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  BellOff, 
  MessageSquare, 
  Lock, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrivacySettings, DNDReason } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { safeLog } from '../utils/logger';

const TENANT_PREFERENCES = [
  "Only Vegetarians",
  "No Pets",
  "Only for family",
  "Only for bachelors",
  "Only for office purpose",
  "Not Bachelors",
  "No alcohol"
];

const DND_REASONS: DNDReason[] = ["Busy", "Out of station", "Not available"];

export const PrivacyControls: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState<PrivacySettings>({
    doNotDisturb: {
      enabled: false,
      startTime: "09:00",
      endTime: "21:00",
      reason: "Busy"
    },
    onlyMessage: false,
    preDisclosure: {
      enabled: true,
      message: "Serious tenants only, Please contact me only when you agree below terms & conditions",
      options: []
    }
  });

  useEffect(() => {
    if (user?.privacy) {
      setSettings(user.privacy);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        privacy: settings
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      safeLog.error("Failed to save privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (option: string) => {
    setSettings(prev => {
      const options = prev.preDisclosure.options || [];
      const newOptions = options.includes(option)
        ? options.filter(o => o !== option)
        : [...options, option];
      
      return {
        ...prev,
        preDisclosure: {
          ...prev.preDisclosure,
          options: newOptions
        }
      };
    });
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Save Button - Prominent at top */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all active:scale-95 ${
          saved 
            ? 'bg-emerald-500 text-white' 
            : 'bg-brand text-black shadow-lg shadow-brand/20'
        }`}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
        <span>{saved ? 'Saved' : 'Save Changes'}</span>
      </button>

      <div className="space-y-3">
        {/* Do Not Disturb Section */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <BellOff size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Do Not Disturb</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">Pause calls and messages.</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={settings.doNotDisturb.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  doNotDisturb: { ...prev.doNotDisturb, enabled: e.target.checked }
                }))}
              />
              <div className="peer h-6 w-11 rounded-full bg-[var(--bg)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>

          {settings.doNotDisturb.enabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 border-t border-[var(--border)] bg-[var(--bg)]/30 p-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
                    <input 
                      type="time" 
                      value={settings.doNotDisturb.startTime}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        doNotDisturb: { ...prev.doNotDisturb, startTime: e.target.value }
                      }))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-2.5 pl-9 pr-3 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={14} />
                    <input 
                      type="time" 
                      value={settings.doNotDisturb.endTime}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        doNotDisturb: { ...prev.doNotDisturb, endTime: e.target.value }
                      }))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-2.5 pl-9 pr-3 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Reason</label>
                <div className="flex flex-wrap gap-2">
                  {DND_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        doNotDisturb: { ...prev.doNotDisturb, reason }
                      }))}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all ${
                        settings.doNotDisturb.reason === reason
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Only Message Section */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Only Message Mode</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">Disable calls, accept WhatsApp only.</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={settings.onlyMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, onlyMessage: e.target.checked }))}
              />
              <div className="peer h-6 w-11 rounded-full bg-[var(--bg)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>

          {settings.onlyMessage && (
            <div className="border-t border-[var(--border)] bg-[var(--bg)]/30 p-5">
              <div className="rounded-xl bg-indigo-500/5 p-3 text-[11px] text-indigo-500 flex gap-2 items-start border border-indigo-500/10">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p><strong>Status:</strong> Not accepting calls, please message on WhatsApp.</p>
              </div>
            </div>
          )}
        </div>

        {/* Pre-disclosure Section */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Contact Disclosure</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">Terms before revealing number.</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={settings.preDisclosure.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preDisclosure: { ...prev.preDisclosure, enabled: e.target.checked }
                }))}
              />
              <div className="peer h-6 w-11 rounded-full bg-[var(--bg)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>

          {settings.preDisclosure.enabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 border-t border-[var(--border)] bg-[var(--bg)]/30 p-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Instructions</label>
                <textarea 
                  value={settings.preDisclosure.message}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    preDisclosure: { ...prev.preDisclosure, message: e.target.value }
                  }))}
                  rows={2}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 text-xs focus:border-brand focus:outline-none"
                  placeholder="Enter instructions..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Tenant Terms</label>
                <div className="grid grid-cols-1 gap-2">
                  {TENANT_PREFERENCES.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleOption(option)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                        settings.preDisclosure.options?.includes(option)
                          ? 'border-brand bg-brand/5 text-brand'
                          : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                        settings.preDisclosure.options?.includes(option)
                          ? 'border-brand bg-brand text-black'
                          : 'border-[var(--border)] bg-white/10'
                      }`}>
                        {settings.preDisclosure.options?.includes(option) && <CheckCircle2 size={12} />}
                      </div>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
