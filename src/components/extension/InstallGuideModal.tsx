import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, FileArchive, ToggleRight, FolderOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { ChromeIcon } from '../common/ChromeIcon';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl?: string;
  zipFileName?: string;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  downloadUrl = "/downloads/chrome-mv3-prod.zip",
  zipFileName = "PRAMAAN-Chrome-Extension.zip"
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("chrome://extensions");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-2xl rounded-3xl bg-[#111113] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 z-10 font-sans text-white my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Package Downloaded Successfully
            </div>
            <h2 className="text-3xl font-serif-editorial text-white flex items-center gap-3 pt-1">
              Install PRAMAAN Extension
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Follow these 5 simple steps to load <span className="text-purple-300 font-mono font-medium">{zipFileName}</span> into Google Chrome.
            </p>
          </div>

          {/* 5-Step Instructions List */}
          <div className="space-y-3 font-sans">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.08] flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono shrink-0 mt-0.5">
                01
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-purple-400" />
                  Extract the downloaded ZIP
                </h3>
                <p className="text-xs text-zinc-400">
                  Unzip <span className="font-mono text-zinc-200">{zipFileName}</span> to any convenient directory on your desktop or local folder.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.08] flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono shrink-0 mt-0.5">
                02
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ChromeIcon size={16} />
                  Open Chrome Extensions page
                </h3>
                <p className="text-xs text-zinc-400">
                  Open Google Chrome and navigate to <code className="px-2 py-0.5 rounded bg-zinc-900 text-purple-300 border border-white/10 font-mono text-[11px]">chrome://extensions</code>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied URL!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-purple-400" />
                        Copy chrome://extensions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.08] flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono shrink-0 mt-0.5">
                03
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ToggleRight className="w-4 h-4 text-emerald-400" />
                  Enable Developer Mode
                </h3>
                <p className="text-xs text-zinc-400">
                  Toggle the <span className="font-semibold text-white">Developer mode</span> switch in the top-right corner of the Extensions page.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.08] flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono shrink-0 mt-0.5">
                04
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-purple-400" />
                  Click "Load Unpacked"
                </h3>
                <p className="text-xs text-zinc-400">
                  Click the <span className="font-semibold text-white font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10 text-[11px]">Load unpacked</span> button in the top-left toolbar.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.08] flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono shrink-0 mt-0.5">
                05
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Select Extracted Folder
                </h3>
                <p className="text-xs text-zinc-400">
                  Select your extracted folder. PRAMAAN will instantly attach to ChatGPT, Gemini, Claude, and Perplexity!
                </p>
              </div>
            </div>
          </div>

          {/* Footer & Fallback Link */}
          <div className="border-t border-white/[0.08] pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span>Your download didn't start?</span>
              <a
                href={downloadUrl}
                download={zipFileName}
                className="text-purple-300 underline hover:text-white transition-colors inline-flex items-center gap-1 font-semibold"
              >
                Click here <Download className="w-3 h-3" />
              </a>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5"
            >
              Done & Close
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
