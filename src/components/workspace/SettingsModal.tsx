import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const [sensitivity, setSensitivity] = useState(88);
  const [autoTag, setAutoTag] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="pt-32 pb-28 px-6 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="border-b border-white/[0.08] pb-6 space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-purple-400 block">
          SYSTEM PREFERENCES & RULES
        </span>
        <h2 className="text-4xl font-serif-editorial text-white">
          Settings & Integration
        </h2>
      </div>

      <div className="space-y-6">
        {/* Verification Strictness Slider */}
        <div className="p-6 rounded-3xl bg-[#111113] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Verification Strictness Threshold
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sets the confidence threshold required before flagging a claim as Verified.
              </p>
            </div>
            <span className="text-2xl font-serif-editorial text-purple-300 font-bold font-mono">
              {sensitivity}%
            </span>
          </div>

          <input
            type="range"
            min="60"
            max="99"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full accent-purple-500 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>Relaxed (60%)</span>
            <span>Standard (85%)</span>
            <span>Strict Scientific (95%+)</span>
          </div>
        </div>

        {/* Source Priorities */}
        <div className="p-6 rounded-3xl bg-[#111113] border border-white/10 space-y-4">
          <h3 className="text-base font-semibold text-white">
            Primary Source Authority Weightings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.06] flex items-center justify-between">
              <span>Academic Peer Journals (Nature, Science)</span>
              <span className="text-purple-300 font-bold">1.00 Weight</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.06] flex items-center justify-between">
              <span>Government Repositories (NASA, WHO)</span>
              <span className="text-purple-300 font-bold">0.98 Weight</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.06] flex items-center justify-between">
              <span>International Wire Services (Reuters, AP)</span>
              <span className="text-purple-300 font-bold">0.92 Weight</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.06] flex items-center justify-between">
              <span>Public Encyclopedia (Wikipedia)</span>
              <span className="text-zinc-500 font-bold">0.75 Weight</span>
            </div>
          </div>
        </div>

        {/* Extension Auto-Hook */}
        <div className="p-6 rounded-3xl bg-[#111113] border border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Auto-Inject Overlay on LLM Stream
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automatically highlight claims word-by-word inside ChatGPT, Gemini & Claude.
            </p>
          </div>
          <button
            onClick={() => setAutoTag(!autoTag)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
              autoTag ? 'bg-purple-600' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                autoTag ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-2 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Settings Applied
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
