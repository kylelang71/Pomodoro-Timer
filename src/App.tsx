import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings2, X, Volume2, VolumeX, Check, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';
type ThemeName = 'modern' | 'cyberpunk' | 'pocketWatch' | 'brutalist' | 'typewriter' | 'zen';

interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SETTINGS: Settings = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS = {
  pomodoro: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

interface ThemeConfig {
  name: string;
  id: ThemeName;
  font: string;
  bg: string;
  text: string;
  textMuted: string;
  textHover: string;
  cardBg: string;
  cardBorder: string;
  cardRadius: string;
  cardShadow: string;
  buttonRadius: string;
  modes: {
    pomodoro: { color: string; bg: string; shadow?: string };
    shortBreak: { color: string; bg: string; shadow?: string };
    longBreak: { color: string; bg: string; shadow?: string };
  };
  circleStroke: string;
  extraClasses?: string;
}

const THEMES: Record<ThemeName, ThemeConfig> = {
  modern: {
    name: 'Modern',
    id: 'modern',
    font: 'font-sans',
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    textHover: 'hover:text-zinc-100',
    cardBg: 'bg-zinc-900/50',
    cardBorder: 'border-zinc-800/50',
    cardRadius: 'rounded-2xl',
    cardShadow: 'shadow-none',
    buttonRadius: 'rounded-xl',
    modes: {
      pomodoro: { color: 'text-rose-500', bg: 'bg-rose-500', shadow: '0 10px 25px -5px rgba(244, 63, 94, 0.4)' },
      shortBreak: { color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' },
      longBreak: { color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' },
    },
    circleStroke: 'stroke-zinc-900',
  },
  cyberpunk: {
    name: '80s Cyberpunk',
    id: 'cyberpunk',
    font: 'font-tech',
    bg: 'bg-black',
    text: 'text-cyan-400',
    textMuted: 'text-pink-500',
    textHover: 'hover:text-cyan-400',
    cardBg: 'bg-gray-900',
    cardBorder: 'border-pink-500 border-2',
    cardRadius: 'rounded-none',
    cardShadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]',
    buttonRadius: 'rounded-none',
    modes: {
      pomodoro: { color: 'text-yellow-400', bg: 'bg-yellow-400', shadow: '0 0 15px rgba(250, 204, 21, 0.6)' },
      shortBreak: { color: 'text-cyan-400', bg: 'bg-cyan-400', shadow: '0 0 15px rgba(34, 211, 238, 0.6)' },
      longBreak: { color: 'text-pink-500', bg: 'bg-pink-500', shadow: '0 0 15px rgba(236, 72, 153, 0.6)' },
    },
    circleStroke: 'stroke-gray-800',
    extraClasses: 'drop-shadow-[0_0_2px_currentColor]',
  },
  pocketWatch: {
    name: 'Pocket Watch',
    id: 'pocketWatch',
    font: 'font-serif',
    bg: 'bg-[#f4ebd8]',
    text: 'text-[#2c1e16]',
    textMuted: 'text-[#5c4a3d]',
    textHover: 'hover:text-[#2c1e16]',
    cardBg: 'bg-[#eaddc5]',
    cardBorder: 'border-[#b59a72] border-2',
    cardRadius: 'rounded-3xl',
    cardShadow: 'shadow-inner',
    buttonRadius: 'rounded-full',
    modes: {
      pomodoro: { color: 'text-[#8b0000]', bg: 'bg-[#8b0000]', shadow: '0 4px 6px -1px rgba(139, 0, 0, 0.2)' },
      shortBreak: { color: 'text-[#2f4f4f]', bg: 'bg-[#2f4f4f]', shadow: '0 4px 6px -1px rgba(47, 79, 79, 0.2)' },
      longBreak: { color: 'text-[#483d8b]', bg: 'bg-[#483d8b]', shadow: '0 4px 6px -1px rgba(72, 61, 139, 0.2)' },
    },
    circleStroke: 'stroke-[#d1c0a8]',
  },
  brutalist: {
    name: 'Brutalist',
    id: 'brutalist',
    font: 'font-brutal',
    bg: 'bg-white',
    text: 'text-black',
    textMuted: 'text-black font-bold',
    textHover: 'hover:text-black',
    cardBg: 'bg-white',
    cardBorder: 'border-black border-4',
    cardRadius: 'rounded-none',
    cardShadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    buttonRadius: 'rounded-none',
    modes: {
      pomodoro: { color: 'text-red-600', bg: 'bg-red-600', shadow: '4px 4px 0px 0px rgba(0,0,0,1)' },
      shortBreak: { color: 'text-blue-600', bg: 'bg-blue-600', shadow: '4px 4px 0px 0px rgba(0,0,0,1)' },
      longBreak: { color: 'text-yellow-400', bg: 'bg-yellow-400', shadow: '4px 4px 0px 0px rgba(0,0,0,1)' },
    },
    circleStroke: 'stroke-gray-200',
    extraClasses: 'uppercase tracking-tighter',
  },
  typewriter: {
    name: 'Typewriter',
    id: 'typewriter',
    font: 'font-typewriter',
    bg: 'bg-[#f0f0f0]',
    text: 'text-[#111]',
    textMuted: 'text-[#666]',
    textHover: 'hover:text-[#111]',
    cardBg: 'bg-[#fafafa]',
    cardBorder: 'border-[#ccc] border',
    cardRadius: 'rounded-sm',
    cardShadow: 'shadow-sm',
    buttonRadius: 'rounded-sm',
    modes: {
      pomodoro: { color: 'text-[#d9534f]', bg: 'bg-[#d9534f]' },
      shortBreak: { color: 'text-[#5cb85c]', bg: 'bg-[#5cb85c]' },
      longBreak: { color: 'text-[#0275d8]', bg: 'bg-[#0275d8]' },
    },
    circleStroke: 'stroke-[#e0e0e0]',
  },
  zen: {
    name: 'Zen',
    id: 'zen',
    font: 'font-zen',
    bg: 'bg-[#eef2e6]',
    text: 'text-[#2b362c]',
    textMuted: 'text-[#7a8a7b]',
    textHover: 'hover:text-[#2b362c]',
    cardBg: 'bg-[#ffffff]',
    cardBorder: 'border-[#d4e0d5] border',
    cardRadius: 'rounded-3xl',
    cardShadow: 'shadow-lg',
    buttonRadius: 'rounded-2xl',
    modes: {
      pomodoro: { color: 'text-[#d4a373]', bg: 'bg-[#d4a373]', shadow: '0 10px 15px -3px rgba(212, 163, 115, 0.3)' },
      shortBreak: { color: 'text-[#a3b18a]', bg: 'bg-[#a3b18a]', shadow: '0 10px 15px -3px rgba(163, 177, 138, 0.3)' },
      longBreak: { color: 'text-[#588157]', bg: 'bg-[#588157]', shadow: '0 10px 15px -3px rgba(88, 129, 87, 0.3)' },
    },
    circleStroke: 'stroke-[#e2e8e3]',
  },
};

export default function App() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [themeId, setThemeId] = useState<ThemeName>('brutalist');
  
  const timerRef = useRef<number | null>(null);

  const theme = THEMES[themeId];
  const modeTheme = theme.modes[mode];

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playTone(880, now, 0.2);
      playTone(1108.73, now + 0.2, 0.2);
      playTone(1318.51, now + 0.4, 0.4);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      playNotificationSound();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, playNotificationSound]);

  useEffect(() => {
    setTimeLeft(settings[mode]);
    setIsActive(false);
  }, [mode, settings]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  const progress = 1 - timeLeft / settings[mode];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${theme.bg} ${theme.text} ${theme.font} ${theme.extraClasses || ''}`}>
      <div className="w-full max-w-md p-6 relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-xl font-medium tracking-tight flex items-center gap-3">
            <div 
              className={`w-3 h-3 rounded-full ${modeTheme.bg}`} 
              style={{ boxShadow: modeTheme.shadow }} 
            />
            LANG'S POMODORO
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-full transition-colors ${theme.textMuted} ${theme.textHover}`}
              title={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-full transition-colors ${theme.textMuted} ${theme.textHover}`}
              title="Settings"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </header>

        {/* Mode Selector */}
        <div className="flex justify-center mb-12">
          <div className={`flex gap-1 p-1 backdrop-blur-sm ${theme.cardBg} ${theme.cardBorder} ${theme.cardRadius} ${theme.cardShadow}`}>
            {(['pomodoro', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${theme.buttonRadius} ${
                  mode === m ? theme.text : theme.textMuted
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="activeMode"
                    className={`absolute inset-0 ${theme.bg} ${theme.buttonRadius}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{MODE_LABELS[m]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative flex justify-center items-center mb-16">
          <svg className="w-72 h-72 transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="136"
              className={theme.circleStroke}
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="144"
              cy="144"
              r="136"
              className={`stroke-current ${modeTheme.color}`}
              strokeWidth="4"
              fill="none"
              strokeLinecap={themeId === 'brutalist' ? 'square' : 'round'}
              initial={{ strokeDasharray: 2 * Math.PI * 136, strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 136 * (1 - progress) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-7xl font-light tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className={`mt-2 font-medium tracking-wide uppercase text-xs ${theme.textMuted}`}>
              {isActive ? 'Running' : timeLeft === 0 ? 'Finished' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={resetTimer}
            className={`p-4 rounded-full transition-all active:scale-95 ${theme.textMuted} ${theme.textHover}`}
            title="Reset Timer"
          >
            <RotateCcw size={24} />
          </button>
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 flex items-center justify-center transition-all active:scale-95 ${theme.buttonRadius} ${
              isActive 
                ? `${theme.cardBg} ${theme.cardBorder} ${theme.text}` 
                : `${modeTheme.bg} text-white hover:opacity-90`
            }`}
            style={!isActive ? { boxShadow: modeTheme.shadow } : {}}
            title={isActive ? "Pause" : "Start"}
          >
            {isActive ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-2" />}
          </button>
          <div className="w-[56px]" /> {/* Spacer to balance the reset button */}
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <SettingsModal
              settings={settings}
              theme={theme}
              onSave={handleSaveSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Theme Selector Floating Panel */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <AnimatePresence>
            {showThemes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`absolute bottom-full right-0 mb-4 w-48 p-2 ${theme.cardBg} ${theme.cardBorder} ${theme.cardRadius} ${theme.cardShadow} backdrop-blur-md`}
              >
                <div className="flex flex-col gap-1">
                  {(Object.keys(THEMES) as ThemeName[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setThemeId(t);
                        setShowThemes(false);
                      }}
                      className={`text-left px-4 py-2 text-sm transition-colors ${theme.buttonRadius} ${
                        themeId === t ? `${theme.bg} ${theme.text}` : `${theme.textMuted} ${theme.textHover}`
                      }`}
                    >
                      {THEMES[t].name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setShowThemes(!showThemes)}
            className={`p-4 ${theme.cardBg} ${theme.cardBorder} ${theme.cardRadius} ${theme.cardShadow} ${theme.text} hover:opacity-80 transition-opacity flex items-center justify-center backdrop-blur-md`}
            title="Change Theme"
          >
            <Palette size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ 
  settings, 
  theme,
  onSave, 
  onClose 
}: { 
  settings: Settings; 
  theme: ThemeConfig;
  onSave: (s: Settings) => void; 
  onClose: () => void;
}) {
  const [localSettings, setLocalSettings] = useState({
    pomodoro: { m: Math.floor(settings.pomodoro / 60), s: settings.pomodoro % 60 },
    shortBreak: { m: Math.floor(settings.shortBreak / 60), s: settings.shortBreak % 60 },
    longBreak: { m: Math.floor(settings.longBreak / 60), s: settings.longBreak % 60 },
  });

  const handleChange = (mode: keyof Settings, field: 'm' | 's', value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setLocalSettings(prev => ({
        ...prev,
        [mode]: { ...prev[mode], [field]: num }
      }));
    } else if (value === '') {
      setLocalSettings(prev => ({
        ...prev,
        [mode]: { ...prev[mode], [field]: '' as any }
      }));
    }
  };

  const handleSave = () => {
    const finalSettings = {
      pomodoro: ((localSettings.pomodoro.m || 0) * 60) + (localSettings.pomodoro.s || 0) || DEFAULT_SETTINGS.pomodoro,
      shortBreak: ((localSettings.shortBreak.m || 0) * 60) + (localSettings.shortBreak.s || 0) || DEFAULT_SETTINGS.shortBreak,
      longBreak: ((localSettings.longBreak.m || 0) * 60) + (localSettings.longBreak.s || 0) || DEFAULT_SETTINGS.longBreak,
    };
    onSave(finalSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-sm ${theme.cardBg} ${theme.cardBorder} ${theme.cardRadius} ${theme.cardShadow} p-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-medium ${theme.text}`}>Settings</h2>
          <button onClick={onClose} className={`p-2 -mr-2 ${theme.textMuted} ${theme.textHover} rounded-full transition-colors`}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className={`text-sm font-medium ${theme.textMuted} mb-4 uppercase tracking-wider`}>Time (Min : Sec)</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme.textMuted} font-medium w-24`}>Focus</label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={localSettings.pomodoro.m}
                    onChange={(e) => handleChange('pomodoro', 'm', e.target.value)}
                    className={`w-full ${theme.bg} ${theme.cardBorder} ${theme.buttonRadius} px-3 py-2 text-center ${theme.text} focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                  />
                  <span className={theme.textMuted}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={localSettings.pomodoro.s}
                    onChange={(e) => handleChange('pomodoro', 's', e.target.value)}
                    className={`w-full ${theme.bg} ${theme.cardBorder} ${theme.buttonRadius} px-3 py-2 text-center ${theme.text} focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme.textMuted} font-medium w-24`}>Short Break</label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={localSettings.shortBreak.m}
                    onChange={(e) => handleChange('shortBreak', 'm', e.target.value)}
                    className={`w-full ${theme.bg} ${theme.cardBorder} ${theme.buttonRadius} px-3 py-2 text-center ${theme.text} focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                  />
                  <span className={theme.textMuted}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={localSettings.shortBreak.s}
                    onChange={(e) => handleChange('shortBreak', 's', e.target.value)}
                    className={`w-full ${theme.bg} ${theme.cardBorder} ${theme.buttonRadius} px-3 py-2 text-center ${theme.text} focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm ${theme.textMuted} font-medium w-24`}>Long Break</label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={localSettings.longBreak.m}
                    onChange={(e) => handleChange('longBreak', 'm', e.target.value)}
                    className={`w-full ${theme.bg} ${theme.cardBorder} ${theme.buttonRadius} px-3 py-2 text-center ${theme.text} focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                  />
                  <span className={theme.textMuted}>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={localSettings.longBreak.s}
                    onChange={(e) => handleChange('longBreak', 's', e.target.value)}
                    className={`w-full ${theme.bg} ${theme.cardBorder} ${theme.buttonRadius} px-3 py-2 text-center ${theme.text} focus:outline-none focus:ring-1 focus:ring-current transition-all`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSave}
            className={`w-full ${theme.text === 'text-black' ? 'bg-black text-white' : 'bg-white text-black'} font-medium py-3 ${theme.buttonRadius} hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
          >
            <Check size={18} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
