import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { ChromeIcon } from './ChromeIcon';
import { InstallGuideModal } from '../extension/InstallGuideModal';

interface AddExtensionButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'glass';
  showFallbackText?: boolean;
}

export const AddExtensionButton: React.FC<AddExtensionButtonProps> = ({
  className = "",
  size = 'md',
  variant = 'primary',
  showFallbackText = false,
}) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'downloaded' | 'error'>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const downloadUrl = "/downloads/chrome-mv3-prod.zip";
  const zipFileName = "PRAMAAN-Chrome-Extension.zip";

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloadState === 'loading') return;

    setDownloadState('loading');

    try {
      // Programmatic download without navigating away or opening new tab
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = zipFileName;
      link.setAttribute('target', '_self');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloadState('downloaded');
        setIsModalOpen(true);
      }, 600);
    } catch (err) {
      console.error("Automatic download failed:", err);
      setDownloadState('error');
    }
  };

  // Size styling
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-2",
    md: "px-5 py-2.5 text-sm gap-2.5",
    lg: "px-7 py-3.5 text-base gap-3 font-semibold",
  }[size];

  // Variant styling
  const variantClasses = {
    primary: "bg-white text-black hover:bg-purple-100 shadow-[0_0_30px_rgba(255,255,255,0.25)] border border-white/20",
    secondary: "bg-[#111113]/90 text-white hover:bg-zinc-800 border border-white/15 shadow-xl backdrop-blur-xl",
    glass: "bg-purple-950/60 text-purple-200 hover:bg-purple-900/80 border border-purple-500/40 shadow-[0_0_20px_rgba(124,58,237,0.3)] backdrop-blur-md"
  }[variant];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        className={`relative inline-flex items-center justify-center rounded-full font-mono transition-all duration-300 cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      >
        {/* Chrome brand icon */}
        <ChromeIcon className={size === 'lg' ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0"} />

        {/* State text & indicators */}
        {downloadState === 'idle' && (
          <span className="flex items-center gap-1.5">
            Add Extension
            <Download className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </span>
        )}

        {downloadState === 'loading' && (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Preparing ZIP...
          </span>
        )}

        {downloadState === 'downloaded' && (
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Check className="w-4 h-4" />
            Downloaded!
          </span>
        )}

        {downloadState === 'error' && (
          <span className="flex items-center gap-1.5 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            Retry Download
          </span>
        )}
      </motion.button>

      {/* Optional fallback message */}
      {(showFallbackText || downloadState === 'error') && (
        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
          <span>Your download didn't start?</span>
          <a
            href={downloadUrl}
            download={zipFileName}
            className="text-purple-300 underline hover:text-white transition-colors font-medium"
          >
            Click here.
          </a>
        </div>
      )}

      {/* Installation Guide Modal */}
      <InstallGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        downloadUrl={downloadUrl}
        zipFileName={zipFileName}
      />
    </div>
  );
};
