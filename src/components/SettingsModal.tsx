'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Check, Sparkles, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  model: string;
  onSaveModel: (model: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  model,
  onSaveModel,
}: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(model);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setTempKey(apiKey);
    setTempModel(model);
  }, [apiKey, model, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    onSaveModel(tempModel);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Engine Configuration</h3>
            <p className="text-xs text-slate-400">
              Bring Your Own Key (BYOK) • 100% Private & Local to your browser
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <span>Google Gemini API Key</span>
                <span className="text-cyan-400 text-[10px] font-normal uppercase bg-cyan-500/10 px-1.5 py-0.5 rounded">
                  Free Tier
                </span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline"
              >
                <span>Get Free Key (Google AI Studio)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Google provides 15 requests/minute completely free on Gemini 2.0 Flash with live Google Search grounding. Keys are saved in your local browser storage only.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Intelligence Model
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fastest & Native Search Grounding (Recommended)' },
                { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: '1M Context Window, Ultra Reliable' },
                { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Maximum Reasoning & Complex Logic' },
                { id: 'simulator', label: 'Autonomous Simulator', desc: 'No API Key Needed (Built-in Demo Mode)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTempModel(m.id)}
                  className={`text-left p-3 rounded-xl border transition ${
                    tempModel === m.id
                      ? 'border-cyan-500/80 bg-cyan-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200 flex items-center justify-between">
                    <span>{m.label}</span>
                    {tempModel === m.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-400 text-xs">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              NexusDeep runs 100% client-to-API or on your local instance. Your research queries, extracted data, and API keys are never stored on any remote cloud or sold.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition active:scale-95"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Config Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
