import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../i18n/types';

interface LanguageSelectorProps {
  variant?: 'compact' | 'pill' | 'large';
  align?: 'left' | 'right';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  align = 'right',
  className = '',
}) => {
  const { currentLanguage, languageInfo, setLanguage, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      {variant === 'large' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-[#2d3282] hover:bg-[#3e46b1] text-white rounded-2xl border border-[#4cc9f0]/40 hover:border-[#4cc9f0] shadow-md transition-all active:scale-95"
          aria-label={t('header.language')}
          aria-expanded={isOpen}
        >
          <span className="text-xl">🌐</span>
          <span className="font-extrabold text-sm uppercase tracking-wider text-[#4cc9f0]">
            {languageInfo.code.toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-white/90 hidden sm:inline">
            {languageInfo.nativeName}
          </span>
        </button>
      ) : variant === 'pill' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d3282]/80 hover:bg-[#3e46b1] text-white rounded-full border border-white/20 hover:border-[#4cc9f0] transition-all text-xs font-bold active:scale-95"
          aria-label={t('header.language')}
          aria-expanded={isOpen}
        >
          <span>{languageInfo.flag}</span>
          <span className="text-[#4cc9f0] uppercase">{languageInfo.code}</span>
        </button>
      ) : (
        /* Compact Default: "🌐 ES" */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1b4b]/80 hover:bg-[#2d3282] border border-white/20 hover:border-[#4cc9f0] text-white rounded-xl transition-all font-mono text-xs font-bold tracking-wider active:scale-95 shadow-sm"
          aria-label={t('header.language')}
          aria-expanded={isOpen}
        >
          <Globe className="w-3.5 h-3.5 text-[#4cc9f0]" />
          <span className="text-white text-xs font-black uppercase">{languageInfo.code}</span>
        </button>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-60 rounded-2xl bg-[#1a1b4b] border-2 border-[#4cc9f0] shadow-2xl p-2 backdrop-blur-xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {/* Header in dropdown */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#4cc9f0]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#4cc9f0]">
                  {t('lang.title')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="space-y-1">
              {supportedLanguages.map((lang) => {
                const isSelected = lang.code === currentLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#2d3282] text-white font-bold border border-[#f72585]'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold truncate">{lang.nativeName}</span>
                        {lang.isDefault && (
                          <span className="text-[10px] text-[#4cc9f0] uppercase tracking-wider font-semibold">
                            {t('lang.default')}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#f72585] shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
