import React, { useState } from 'react';
import { Download, Smartphone, Check, ExternalLink, ShieldCheck, X, Sprout } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const InstallPwaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [hasTriggeredInstall, setHasTriggeredInstall] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-qa7dz6xdpsxaq3o4xqtweh-128448961767.asia-southeast1.run.app';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B4D3E] text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#DD9F2F] text-[#1B4D3E] flex items-center justify-center font-black text-2xl shadow-md">
                <Sprout className="w-7 h-7 text-[#1B4D3E]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Install Mandi Ledger (APK / PWA)</h3>
                <p className="text-xs text-emerald-200">APMC & Agricultural Wholesale Mandi Mobile App</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-950">App is Already Installed!</h4>
              <p className="text-xs text-emerald-800">
                You are currently running Mandi Ledger in standalone mobile mode with full offline cache and home screen launcher access.
              </p>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] space-y-3">
              <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-sm">
                <Smartphone className="w-4 h-4 text-[#DD9F2F]" />
                <span>One-Tap Direct Android Installation</span>
              </div>
              <p className="text-xs text-[#6B5E57] leading-relaxed">
                Click below to add Mandi Ledger to your Android home screen as a standalone app. It will launch full-screen without browser address bars, work offline, and provide instant APMC ledger access.
              </p>
              <button
                onClick={async () => {
                  setHasTriggeredInstall(true);
                  await install();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#14392e] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#DD9F2F]" />
                <span>{hasTriggeredInstall ? 'Complete Prompt on Device...' : 'Install App on Device Now'}</span>
              </button>
            </div>
          ) : isIOS ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <Smartphone className="w-4 h-4 text-amber-700" />
                <span>Install on Apple iOS (Safari)</span>
              </div>
              <ol className="text-xs text-amber-900 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Tap the <strong>Share button</strong> (square icon with arrow) in Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> at top right to place the app on your home screen.</li>
              </ol>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#FCFBF9] border border-[#E8E2D9] space-y-3">
              <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-sm">
                <Smartphone className="w-4 h-4 text-[#DD9F2F]" />
                <span>Mobile Installation Guide</span>
              </div>
              <p className="text-xs text-[#6B5E57] leading-relaxed">
                Open this application URL in Google Chrome on your Android mobile device:
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-[#E8E2D9] font-mono text-[11px] text-[#2A1F1A] break-all select-all">
                {currentUrl}
              </div>
              <p className="text-xs text-[#6B5E57]">
                Then tap <strong>Chrome Menu (⋮) → &quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
              </p>
            </div>
          )}

          {/* Android APK Generation Instructions */}
          <div className="border-t border-[#E8E2D9] pt-4 space-y-3">
            <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#2E6349]" />
              <span>Packaging into standalone .APK / Google Play (TWA)</span>
            </div>
            <p className="text-xs text-[#6B5E57] leading-relaxed">
              Because this app is now fully PWA-configured with a Web App Manifest, Service Worker precache, and responsive UI, you can generate a signed <strong>.apk</strong> or <strong>.aab</strong> in 2 minutes:
            </p>

            <div className="space-y-2 text-xs text-[#2A1F1A]">
              <div className="p-3 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9]">
                <strong className="text-[#1B4D3E] block mb-1">Option 1: PWABuilder (Official Microsoft / Google TWA builder - Free)</strong>
                <p className="text-[#6B5E57] mb-2">1. Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">PWABuilder.com</a>.</p>
                <p className="text-[#6B5E57] mb-2">2. Enter your live app URL:</p>
                <div className="p-1.5 rounded bg-white border font-mono text-[10px] break-all select-all text-[#1B4D3E]">
                  {currentUrl}
                </div>
                <p className="text-[#6B5E57] mt-2">3. Click <strong>Package for Android</strong> to instantly download your signed <strong>.apk</strong> and Google Play <strong>.aab</strong> bundle.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FCFBF9] border border-[#E8E2D9]">
                <strong className="text-[#1B4D3E] block mb-1">Option 2: Bubblewrap CLI (Google Official)</strong>
                <p className="font-mono text-[10px] bg-black/5 p-1.5 rounded text-[#2A1F1A]">
                  npm install -g @bubblewrap/cli<br />
                  bubblewrap init --manifest={currentUrl}manifest.webmanifest<br />
                  bubblewrap build
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FCFBF9] border-t border-[#E8E2D9] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2E6349] hover:bg-[#1B4D3E] text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
