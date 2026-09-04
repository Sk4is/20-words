import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, EyeOff } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#2d3282] border-4 border-[#3e46b1] rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#f72585] text-white flex items-center justify-center font-black text-sm shadow">
                20
              </div>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                {t('rules.title')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1a1b4b] text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-white/90">
            {/* Overview */}
            <div className="p-3.5 rounded-2xl bg-[#1a1b4b] border-2 border-white/10">
              <span className="font-black text-[#4cc9f0] block mb-1 uppercase tracking-wider">
                {t('rules.coreConceptTitle')}
              </span>
              {t('rules.coreConceptDesc')}
            </div>

            {/* Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#4cc9f0]/15 border-2 border-[#4cc9f0]">
                <div className="flex items-center gap-1.5 font-black text-[#4cc9f0] mb-1 uppercase">
                  <Shield className="w-4 h-4" />
                  <span>{t('rules.innocentsTitle')}</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {t('rules.innocentsDesc')}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f72585]/15 border-2 border-[#f72585]">
                <div className="flex items-center gap-1.5 font-black text-[#f72585] mb-1 uppercase">
                  <EyeOff className="w-4 h-4" />
                  <span>{t('rules.impostorTitle')}</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {t('rules.impostorDesc')}
                </p>
              </div>
            </div>

            {/* Round Phases */}
            <div className="space-y-2.5 pt-1">
              <span className="font-black text-[#4cc9f0] uppercase tracking-wider block">
                {t('rules.phasesTitle')}
              </span>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f72585] flex items-center justify-center font-black text-[10px] text-white shrink-0 mt-0.5 shadow">
                  1
                </div>
                <div>
                  <strong className="text-white font-extrabold">{t('rules.phase1Title')} </strong>
                  {t('rules.phase1Desc')}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f72585] flex items-center justify-center font-black text-[10px] text-white shrink-0 mt-0.5 shadow">
                  2
                </div>
                <div>
                  <strong className="text-white font-extrabold">{t('rules.phase2Title')} </strong>
                  {t('rules.phase2Desc')}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f72585] flex items-center justify-center font-black text-[10px] text-white shrink-0 mt-0.5 shadow">
                  3
                </div>
                <div>
                  <strong className="text-white font-extrabold">{t('rules.phase3Title')} </strong>
                  {t('rules.phase3Desc')}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f72585] flex items-center justify-center font-black text-[10px] text-white shrink-0 mt-0.5 shadow">
                  4
                </div>
                <div>
                  <strong className="text-white font-extrabold">{t('rules.phase4Title')} </strong>
                  {t('rules.phase4Desc')}
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="p-3.5 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0]/40 text-xs text-white/90">
              <strong className="text-[#4cc9f0] block mb-1 uppercase font-black tracking-wider">
                {t('rules.scoringTitle')}
              </strong>
              {t('rules.scoreInnocent')}<br />
              {t('rules.scoreImpostor')}<br />
              {t('rules.scoreImpostorSteal')}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-5 py-3.5 rounded-2xl bg-[#f72585] hover:brightness-110 text-white font-black uppercase text-xs tracking-widest transition-all shadow-[0_4px_0_#b5179e] active:translate-y-[2px] active:shadow-none cursor-pointer"
          >
            {t('rules.gotIt')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
