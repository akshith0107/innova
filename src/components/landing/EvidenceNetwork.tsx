import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NETWORK_NODES } from '../../data/mockData';
import { Database } from 'lucide-react';

export const EvidenceNetwork: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('nature');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeNode = NETWORK_NODES.find((n) => n.id === selectedNodeId) || NETWORK_NODES[3];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 450);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines between nodes
      for (let i = 0; i < NETWORK_NODES.length; i++) {
        for (let j = i + 1; j < NETWORK_NODES.length; j++) {
          const nodeA = NETWORK_NODES[i];
          const nodeB = NETWORK_NODES[j];

          const ax = (nodeA.x / 100) * width;
          const ay = (nodeA.y / 100) * height;
          const bx = (nodeB.x / 100) * width;
          const by = (nodeB.y / 100) * height;

          const isConnectedToSelected = nodeA.id === selectedNodeId || nodeB.id === selectedNodeId;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = isConnectedToSelected
            ? 'rgba(124, 58, 237, 0.4)'
            : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = isConnectedToSelected ? 1.5 : 1;
          ctx.stroke();

          // Animated particle beam along active connections
          if (isConnectedToSelected) {
            const progress = (time + i) % 1;
            const px = ax + (bx - ax) * progress;
            const py = ay + (by - ay) * progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#7C3AED';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#7C3AED';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedNodeId]);

  return (
    <section className="py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
          GLOBAL REPOSITORY GRAPH
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-editorial text-white">
          Evidence Network
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm">
          PRAMAAN cross-examines factual assertions against 40,000+ indexed academic journals, public datasets, and global news wires.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Node Canvas Area */}
        <div className="lg:col-span-2 relative rounded-3xl bg-[#111113] border border-white/10 p-6 min-h-[480px] shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>LIVE EVIDENCE TOPOLOGY</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
              99.8% Index Coverage
            </span>
          </div>

          {/* Interactive HTML Node Markers floating over canvas */}
          <div className="relative w-full h-[380px]">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {NETWORK_NODES.map((node) => {
              const isSelected = node.id === selectedNodeId;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.6)] font-bold'
                        : 'bg-[#111113]/90 text-zinc-300 border-white/10 hover:border-purple-500/40'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                    <span>{node.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Card */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 rounded-3xl bg-[#111113] border border-white/10 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <span className="text-xs font-mono text-zinc-500 uppercase">
                    {activeNode.category}
                  </span>
                  <h3 className="text-2xl font-serif-editorial text-white mt-0.5">
                    {activeNode.fullName}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono text-sm font-bold">
                  {activeNode.credibility}%
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                  Active Query Matches:
                </span>
                <p className="text-xs text-zinc-300 italic leading-relaxed bg-[#09090B] p-4 rounded-xl border border-white/[0.06]">
                  "{activeNode.queryMatch}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06]">
                  <span className="text-zinc-500 text-[10px] block">AUTHORITY RATING</span>
                  <span className="text-emerald-400 font-semibold">Tier 1 Academic</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06]">
                  <span className="text-zinc-500 text-[10px] block">SYNC FREQUENCY</span>
                  <span className="text-purple-300 font-semibold">Real-Time Webhook</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
