import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  Check,
  FileArchive,
  ToggleRight,
  FolderOpen,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Play,
  RotateCw,
  HelpCircle,
  AlertTriangle,
  Puzzle,
  Pin
} from 'lucide-react';
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
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("chrome://extensions");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenChromeExtensions = () => {
    try {
      window.open("chrome://extensions", "_blank");
    } catch {
      handleCopyUrl();
    }
  };

  const toggleStepCompleted = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  if (!isOpen) return null;

  const stepsData = [
    {
      number: 1,
      title: "Download Completed",
      description: "Your extension ZIP has been downloaded successfully.",
      badge: "Completed",
      icon: Check,
      content: (
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Downloaded file: <strong className="text-white">{zipFileName}</strong></span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold">
              Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Locate <code className="px-1.5 py-0.5 bg-zinc-900 rounded border border-white/10 text-purple-300">{zipFileName}</code> in your computer's <strong>Downloads</strong> folder.
          </p>
        </div>
      )
    },
    {
      number: 2,
      title: "Extract the ZIP",
      description: "Right-click the ZIP file and select 'Extract All' or 'Extract Here' depending on your operating system.",
      badge: "Required",
      icon: FileArchive,
      content: (
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase font-mono text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" /> IMPORTANT NOTE
            </div>
            <p className="leading-relaxed">
              Do <strong>NOT</strong> select the ZIP directly inside Chrome. Chrome requires the unzipped folder containing <code className="text-white font-mono">manifest.json</code>.
            </p>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: "Open Chrome Extensions",
      description: "Open Google Chrome and navigate to chrome://extensions in your address bar.",
      badge: "Chrome Tab",
      icon: ChromeIcon,
      content: (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied chrome://extensions!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={handleOpenChromeExtensions}
              className="px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-xs font-mono text-purple-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
              Open Chrome Extensions
            </button>
          </div>
        </div>
      )
    },
    {
      number: 4,
      title: "Enable Developer Mode",
      description: "Turn ON Developer Mode using the toggle switch in the upper-right corner of Chrome.",
      badge: "Toggle Switch",
      icon: ToggleRight,
      content: (
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#09090B] border border-purple-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Developer mode</span>
              <span className="text-[10px] text-zinc-500 font-mono">(Top-Right of chrome://extensions)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">ON</span>
              <div className="w-10 h-5 rounded-full bg-purple-600 p-0.5 flex items-center justify-end shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: 5,
      title: "Load the Extension",
      description: "Click 'Load unpacked' in the top-left toolbar and select the extracted PRAMAAN extension folder.",
      badge: "Folder Selection",
      icon: FolderOpen,
      content: (
        <div className="space-y-3 pt-1 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
            <span className="font-mono text-white font-semibold">1. Click "Load unpacked" button</span>
            <span className="font-mono text-purple-400 font-semibold">2. Select extracted folder</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Wait a few seconds after selection while Chrome installs PRAMAAN.
          </p>
        </div>
      )
    },
    {
      number: 6,
      title: "Installation Complete!",
      description: "The PRAMAAN icon should now appear in your Chrome toolbar.",
      badge: "Pin & Active",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <Puzzle className="w-4 h-4 text-purple-400" />
              Pin PRAMAAN for 1-Click Access
            </div>
            <p className="text-zinc-300 leading-relaxed">
              If the PRAMAAN icon is hidden, click Chrome's Extensions puzzle icon (<Puzzle className="w-3.5 h-3.5 inline text-zinc-400" />) in the top toolbar and click <strong className="text-white">Pin (<Pin className="w-3 h-3 inline text-purple-300" />)</strong> next to PRAMAAN.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRefreshPage}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              Refresh this page to initialize PRAMAAN immediately
            </button>
          </div>
        </div>
      )
    }
  ];

  const faqs = [
    {
      question: "I selected the ZIP file directly.",
      answer: "Chrome cannot load raw .zip files directly. Right-click the PRAMAAN-Chrome-Extension.zip file, choose 'Extract All' or 'Extract Here', and then select the resulting unzipped folder inside Chrome."
    },
    {
      question: "Developer Mode is missing on chrome://extensions.",
      answer: "Open Chrome, navigate to chrome://extensions in your address bar, and look for the 'Developer mode' toggle switch in the very top-right corner of the page."
    },
    {
      question: "The extension failed to load or showed an error.",
      answer: "Delete the unzipped folder, download the ZIP package again using the button below, extract it to a new location, and click 'Load unpacked' to select the newly extracted folder."
    },
    {
      question: "I don't see the PRAMAAN shield icon in Chrome.",
      answer: "Click the Extensions puzzle icon (🧩) in your Chrome top toolbar, scroll down to PRAMAAN, and click the Pin pin icon so the PRAMAAN badge stays visible."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Main Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[#111113] border border-white/15 shadow-2xl z-10 font-sans text-white my-6 flex flex-col overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="p-6 sm:p-8 border-b border-white/[0.08] bg-[#09090B]/90 space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Live Chrome Onboarding Flow
              </span>

              {/* Progress counter */}
              <span className="text-xs font-mono text-zinc-400">
                Step <span className="text-purple-300 font-bold">{completedSteps.length}</span> of {stepsData.length} Completed
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif-editorial text-white tracking-tight">
              Install PRAMAAN Chrome Extension
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Follow these simple steps to complete the installation.
            </p>
          </div>

          {/* Scrollable Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

            {/* Optional Video Guide Banner */}
            <div
              onClick={() => setIsVideoModalOpen(!isVideoModalOpen)}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center justify-between cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current text-purple-400 ml-0.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    Watch Installation Guide
                    <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px]">
                      1:30 Video
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Prefer a quick visual walkthrough? Watch our step-by-step video tutorial.
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform ${isVideoModalOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Expandable Video Player Modal / Container */}
            <AnimatePresence>
              {isVideoModalOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-2xl bg-black border border-white/10 p-4 space-y-3"
                >
                  <div className="aspect-video w-full rounded-xl bg-zinc-900 flex flex-col items-center justify-center border border-white/10 text-center p-6 space-y-3 relative overflow-hidden">
                    <div className="absolute inset-0 radial-beam-hero opacity-50" />
                    <Play className="w-12 h-12 text-purple-400 animate-pulse relative z-10" />
                    <span className="text-xs font-mono text-zinc-300 relative z-10 font-bold uppercase tracking-wider">
                      PRAMAAN 6-Step Installation Guide (Video Placeholder)
                    </span>
                    <p className="text-xs text-zinc-500 max-w-sm relative z-10">
                      Video stream ready. Configurable embed URL source can be assigned in settings.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vertical Stepper Component */}
            <div className="space-y-4 relative">
              {/* Connected vertical line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-600 via-purple-500/40 to-zinc-800 pointer-events-none" />

              {stepsData.map((step) => {
                const isCompleted = completedSteps.includes(step.number);
                const isActive = activeStep === step.number;
                const IconComponent = step.icon;

                return (
                  <div
                    key={step.number}
                    className={`relative z-10 rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isActive
                        ? 'bg-[#09090B] border-purple-500/60 shadow-[0_0_25px_rgba(124,58,237,0.15)]'
                        : isCompleted
                        ? 'bg-[#09090B]/60 border-emerald-500/30'
                        : 'bg-[#09090B]/40 border-white/[0.06]'
                    }`}
                  >
                    {/* Stepper Header Button */}
                    <div
                      onClick={() => {
                        setActiveStep(step.number);
                        toggleStepCompleted(step.number);
                      }}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 flex-1">
                        {/* Number / Check Circle */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : isActive
                              ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]'
                              : 'bg-zinc-900 text-zinc-400 border border-white/10'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : `0${step.number}`}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-purple-400" />
                              Step {step.number}: {step.title}
                            </h3>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              isCompleted
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                : 'bg-zinc-900 text-zinc-400 border-white/10'
                            }`}>
                              {step.badge}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 transition-transform duration-300 shrink-0 ${
                          isActive ? 'rotate-180 text-purple-400' : 'group-hover:text-zinc-300'
                        }`}
                      />
                    </div>

                    {/* Step Expanded Content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="px-4 pb-4 border-t border-white/[0.06] ml-12"
                        >
                          {step.content}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Troubleshooting FAQ Section */}
            <div className="space-y-4 border-t border-white/[0.08] pt-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
                  Troubleshooting FAQ
                </h3>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/[0.06] bg-[#09090B]/60 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-3.5 flex items-center justify-between text-left gap-3 text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-purple-400 font-mono font-bold">Q:</span>
                          {faq.question}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04]"
                          >
                            <span className="text-emerald-400 font-mono font-bold">A: </span>
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-white/[0.08] bg-[#09090B]/90 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400 shrink-0">
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

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshPage}
                className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                Refresh Page
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
