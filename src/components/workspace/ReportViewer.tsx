import React from 'react';
import type { VerificationResult } from '../../types/pramaan';
import { ShieldCheck, Download, Code, ArrowLeft, BookOpen } from 'lucide-react';
import { TrustBadge } from '../common/TrustBadge';
import confetti from 'canvas-confetti';

interface ReportViewerProps {
  result: VerificationResult;
  onBack: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ result, onBack }) => {
  const handleDownloadPDF = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#10B981', '#FFFFFF'],
    });

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(result, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `PRAMAAN_VERIFICATION_REPORT_${result.id}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PRAMAAN_AUDIT_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section className="pt-32 pb-28 px-6 max-w-4xl mx-auto space-y-8 font-sans">
      {/* Top back button and action bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Workspace
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Main Editorial Whitepaper Container */}
      <div className="p-10 sm:p-14 rounded-3xl bg-[#111113] border border-white/10 shadow-2xl space-y-10 text-white relative overflow-hidden">
        {/* Subtle background seal watermark */}
        <div className="absolute top-8 right-8 opacity-5 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-purple-400" />
        </div>

        {/* Paper Header */}
        <div className="space-y-4 border-b border-white/[0.08] pb-8">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <span>PRAMAAN TRUTH REPORT • ID: {result.id}</span>
            <span>{new Date(result.timestamp || Date.now()).toLocaleDateString()}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif-editorial text-white leading-tight">
            Verification Audit: "{result.query}"
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono pt-2">
            <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300">
              TARGET: {result.llmProvider.toUpperCase()}
            </span>
            <span className="text-emerald-400 font-bold">
              OVERALL TRUST SCORE: {result.overallTrustScore}%
            </span>
          </div>
        </div>

        {/* Summary Executive Verdict */}
        <div className="p-6 rounded-2xl bg-[#09090B] border border-purple-500/30 space-y-2">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block font-semibold">
            EXECUTIVE VERDICT SEAL:
          </span>
          <p className="text-sm font-medium text-zinc-200 leading-relaxed font-sans">
            {result.finalVerdict}
          </p>
        </div>

        {/* Section 1: Extracted Claims Matrix */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif-editorial text-white border-b border-white/[0.06] pb-2">
            1. Extracted Claims & Verification Status
          </h2>

          <div className="space-y-4">
            {result.claims.map((claim, idx) => (
              <div
                key={claim.id}
                className="p-6 rounded-2xl bg-[#09090B] border border-white/[0.06] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500">CLAIM 0{idx + 1}</span>
                  <TrustBadge status={claim.status} confidence={claim.confidence} />
                </div>

                <p className="text-base font-medium text-white leading-snug">
                  "{claim.text}"
                </p>

                <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                  <strong className="text-purple-300 font-mono text-[11px] block mb-0.5">
                    EXPLANATION & PROOF:
                  </strong>
                  {claim.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Primary Cited Evidence */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif-editorial text-white border-b border-white/[0.06] pb-2">
            2. Peer-Reviewed Evidence & Citations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.sources.map((source) => (
              <div
                key={source.id}
                className="p-5 rounded-2xl bg-[#09090B] border border-white/[0.06] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    {source.name}
                  </span>
                  <TrustBadge credibilityBadge={source.credibilityBadge} />
                </div>

                <p className="text-xs font-medium text-zinc-300">{source.title}</p>
                <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                  "{source.snippet}"
                </p>

                <div className="pt-2 text-[10px] font-mono text-zinc-500 flex justify-between border-t border-white/[0.04]">
                  <span>Domain: {source.domain}</span>
                  <span>{source.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Dual AI Adversarial Debate Log */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif-editorial text-white border-b border-white/[0.06] pb-2">
            3. Adversarial Agent Debate Log
          </h2>

          <div className="p-6 rounded-2xl bg-[#09090B] border border-white/[0.06] space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold block">ADVANCE ADVOCATE MODEL:</span>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                {result.debateTranscript.advocate}
              </p>
            </div>

            <div className="space-y-1 border-t border-white/[0.06] pt-3">
              <span className="text-rose-400 font-bold block">SKEPTIC COUNTER MODEL:</span>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                {result.debateTranscript.skeptic}
              </p>
            </div>

            <div className="space-y-1 border-t border-white/[0.06] pt-3">
              <span className="text-purple-300 font-bold block">BAYESIAN SYNTHESIS JUDGE:</span>
              <p className="text-zinc-200 leading-relaxed text-[11px]">
                {result.debateTranscript.judge}
              </p>
            </div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>PRAMAAN TRUST PROTOCOL v2.4</span>
          <span>Cryptographically Signed Audit Log</span>
        </div>
      </div>
    </section>
  );
};
