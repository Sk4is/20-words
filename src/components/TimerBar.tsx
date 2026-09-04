import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { sound } from '../services/sound';
import { useLanguage } from '../i18n/LanguageContext';

interface TimerBarProps {
  roundEndTimestamp: number | null | undefined;
  totalDurationSeconds?: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  roundEndTimestamp,
  totalDurationSeconds = 30
}) => {
  const { t } = useLanguage();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalDurationSeconds);
  const lastTickRef = useRef<number>(-1);

  useEffect(() => {
    if (!roundEndTimestamp) {
      setSecondsRemaining(totalDurationSeconds);
      return;
    }

    const check = () => {
      const remainingMs = Math.max(0, roundEndTimestamp - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);
      setSecondsRemaining(remainingSec);

      // Play tick sound in final 5 seconds
      if (remainingSec > 0 && remainingSec <= 5 && remainingSec !== lastTickRef.current) {
        lastTickRef.current = remainingSec;
        sound.playTick();
      }
    };

    check();
    const interval = setInterval(check, 200);
    return () => clearInterval(interval);
  }, [roundEndTimestamp, totalDurationSeconds]);

  const percentage = Math.min(100, Math.max(0, (secondsRemaining / totalDurationSeconds) * 100));
  const isUrgent = secondsRemaining <= 5;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-bold px-1">
        <span className="flex items-center gap-1.5 text-[#4cc9f0] tracking-wider uppercase">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-[#f72585] animate-pulse' : 'text-[#4cc9f0]'}`} />
          <span>{t('cluePhase.timeRemaining') || 'TIEMPO RESTANTE'}</span>
        </span>
        <span
          className={`font-mono text-lg font-black tracking-wider transition-colors ${
            isUrgent ? 'text-[#f72585] scale-110 animate-pulse' : 'text-[#4cc9f0]'
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-[#1a1b4b] overflow-hidden border border-[#4cc9f0]/30 relative shadow-inner">
        <div
          className={`h-full transition-all duration-200 rounded-full ${
            isUrgent
              ? 'bg-[#f72585] shadow-[0_0_16px_rgba(247,37,133,0.8)]'
              : 'bg-gradient-to-r from-[#4cc9f0] to-[#f72585] shadow-[0_0_12px_rgba(76,201,240,0.6)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
