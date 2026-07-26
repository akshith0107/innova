import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AddExtensionButton } from '../common/AddExtensionButton';

interface LandingCTAProps {
  onOpenWorkspace: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onOpenWorkspace: _onOpenWorkspace }) => {
  return (
    <section className="py-32 px-6 max-w-5xl mx-auto text-center relative">
      <div className="absolute inset-0 radial-beam-hero pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6 relative z-10"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-purple-400 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          Zero Setup Required
        </span>

        <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif-editorial text-white leading-tight">
          Trust what AI says. <br />
          <span className="italic bg-gradient-to-r from-purple-200 via-purple-400 to-white bg-clip-text text-transparent">
            Only after verification.
          </span>
        </h2>

        <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg">
          Join thousands of researchers, journalists, and engineers who never publish or cite AI outputs without PRAMAAN's real-time truth seal.
        </p>

        <div className="pt-6 flex justify-center">
          <AddExtensionButton size="lg" variant="primary" showFallbackText={true} />
        </div>
      </motion.div>
    </section>
  );
};
