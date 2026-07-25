import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, RotateCcw, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { MOCK_VERIFICATION_APPLES } from '../../data/mockData';
import type { Claim } from '../../types/pramaan';

export const LiveDemoSection: React.FC = () => {
  const [streamIndex, setStreamIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredClaim, setHoveredClaim] = useState<Claim | null>(null);

  const textSegments = [
    { text: 'Eating apples regularly provides significant cardiovascular health benefits. ', type: 'plain' },
    {
      text: 'Eating an apple daily reduces risk of cardiovascular disease by 13-15%.',
      claimId: 'c1',
      status: 'verified' as const,
      confidence: 98,
    },
    { text: ' High levels of pectin fiber and flavonoids like epicatechin improve blood pressure. However, ', type: 'plain' },
    {
      text: 'Apples completely eliminate the need for physician visits and pharmaceutical prescriptions.',
      claimId: 'c2',
      status: 'contradicted' as const,
      confidence: 99,
    },
    { text: ' This common aphorism is exaggerated, though ', type: 'plain' },
    {
      text: 'Pectin fiber in apple skins binds with dietary cholesterol in the gut.',
      claimId: 'c3',
      status: 'verified' as const,
      confidence: 94,
    },
    { text: ' Overall, while apples support systemic metabolic health, regular medical checkups remain essential.', type: 'plain' }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setStreamIndex((prev) => {
        if (prev < textSegments.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, textSegments.length]);

  const handleRestart = () => {
    setStreamIndex(0);
    setIsPlaying(true);
    setHoveredClaim(null);
  };

  const getClaimData = (id: string) => {
    return MOCK_VERIFICATION_APPLES.claims.find((c) => c.id === id);
  };

  return (
    <section id="demo" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive ChatGPT Simulation
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif-editorial text-white">
          Real-Time Fact Verification Stream
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm">
          As the LLM streams words, PRAMAAN isolates factual assertions, queries academic consensus, and tags claim integrity inline.
        </p>
      </div>

      {/* Main ChatGPT frame container */}
      <div className="relative rounded-3xl bg-[#111113] border border-white/10 shadow-2xl overflow-hidden">
        {/* ChatGPT Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-[#09090B]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-zinc-400 ml-2">
              ChatGPT-4o + PRAMAAN Trust Overlay
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>Trust Engine Active</span>
            </div>
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay
            </button>
          </div>
        </div>

        {/* Conversation Body */}
        <div className="p-8 space-y-8 min-h-[420px] font-sans">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-xl bg-zinc-800/80 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-sm border border-white/10 shadow-md">
              Is it true eating one apple a day keeps the doctor away?
            </div>
          </div>

          {/* ChatGPT Response Stream */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-700/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
              GPT
            </div>

            <div className="flex-1 bg-zinc-900/60 border border-white/[0.06] p-6 rounded-2xl text-sm leading-relaxed text-zinc-200 relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PRAMAAN Verifying Stream...
                </span>
                <span>3 Claims Evaluated</span>
              </div>

              {/* Streaming Content */}
              <div className="space-y-1">
                {textSegments.slice(0, streamIndex).map((seg, idx) => {
                  if (seg.type === 'plain') {
                    return <span key={idx}>{seg.text}</span>;
                  }

                  const claim = getClaimData(seg.claimId!);
                  const isVerified = seg.status === 'verified';

                  return (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      onMouseEnter={() => claim && setHoveredClaim(claim)}
                      className={`relative inline-block mx-1 px-2 py-0.5 rounded cursor-pointer transition-all duration-300 font-medium ${
                        isVerified
                          ? 'bg-emerald-950/60 text-emerald-200 border-b-2 border-emerald-500 hover:bg-emerald-900/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/60 text-rose-200 border-b-2 border-rose-500 hover:bg-rose-900/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      }`}
                    >
                      {seg.text}
                      <span
                        className={`ml-1.5 inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.2 rounded ${
                          isVerified ? 'bg-emerald-900/90 text-emerald-300' : 'bg-rose-900/90 text-rose-300'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5" /> 98% Verified
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5" /> Contradicted
                          </>
                        )}
                      </span>
                    </motion.span>
                  );
                })}

                {streamIndex < textSegments.length && isPlaying && (
                  <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 align-middle" />
                )}
              </div>

              {/* Hover Popover Preview */}
              <AnimatePresence>
                {hoveredClaim && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-6 right-6 bottom-full mb-3 z-30 p-5 rounded-2xl bg-[#111113] border border-white/20 shadow-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
                          PRAMAAN Evidence Citation
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                          hoveredClaim.status === 'verified'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {hoveredClaim.confidence}% Confidence
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{hoveredClaim.explanation}"
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                        Primary Peer-Reviewed Sources:
                      </span>
                      {hoveredClaim.sources.map((src) => (
                        <div
                          key={src.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-white/[0.06] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-medium text-white">{src.name}</span>
                            <span className="text-zinc-500 text-[11px]">({src.date})</span>
                          </div>
                          <span className="text-purple-300 text-[11px] font-mono flex items-center gap-1">
                            {src.domain} <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stream progress bar */}
        <div className="h-1 bg-zinc-900 w-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-emerald-400"
            initial={{ width: '0%' }}
            animate={{ width: `${(streamIndex / textSegments.length) * 100}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>
    </section>
  );
};
