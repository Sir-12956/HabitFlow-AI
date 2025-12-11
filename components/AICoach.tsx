import React, { useState } from 'react';
import { analyzeHabits } from '../services/geminiService';
import { Habit, Todo, Language } from '../types';
import { Sparkles, Loader2, Trophy, Quote, AlertCircle } from 'lucide-react';

interface AICoachProps {
  habits: Habit[];
  todos: Todo[];
  language: Language;
}

const TRANSLATIONS = {
  en: {
    coachTitle: "AI Productivity Coach",
    analyzeBtn: "Analyze My Progress",
    consulting: "Consulting the productivity algorithms...",
    scoreLabel: "Consistency Score",
    scoreOutstanding: "Outstanding!",
    scoreSteady: "Keeping it steady.",
    scoreNeedsAttention: "Needs attention.",
    summaryTitle: "Summary",
    adviceTitle: "Coach's Advice",
    resetBtn: "Reset Analysis",
    error: "Failed to contact AI Coach. Check your API Key."
  },
  zh: {
    coachTitle: "AI 效率教练",
    analyzeBtn: "分析我的进度",
    consulting: "正在咨询效率算法...",
    scoreLabel: "一致性评分",
    scoreOutstanding: "太棒了！",
    scoreSteady: "保持稳定。",
    scoreNeedsAttention: "需要注意。",
    summaryTitle: "摘要",
    adviceTitle: "教练建议",
    resetBtn: "重置分析",
    error: "无法联系AI教练。请检查API密钥。"
  }
};

const AICoach: React.FC<AICoachProps> = ({ habits, todos, language }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    score: number;
    summary: string;
    advice: string;
    motivationalQuote: string;
  } | null>(null);

  const t = TRANSLATIONS[language];

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeHabits(habits, todos);
      setAnalysis(result);
    } catch (e) {
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          {t.coachTitle}
        </h2>
        {!analysis && (
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t.analyzeBtn}
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-8 text-indigo-300 animate-pulse">
           {t.consulting}
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="flex items-center gap-4">
            <div className={`
              flex items-center justify-center w-16 h-16 rounded-full border-4 font-bold text-xl
              ${analysis.score >= 80 ? 'border-green-500 text-green-400' : analysis.score >= 50 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}
            `}>
              {analysis.score}
            </div>
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{t.scoreLabel}</div>
              <div className="text-lg font-medium text-slate-200">
                {analysis.score >= 80 ? t.scoreOutstanding : analysis.score >= 50 ? t.scoreSteady : t.scoreNeedsAttention}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-sm font-semibold text-indigo-300 mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> {t.summaryTitle}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-sm font-semibold text-amber-300 mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {t.adviceTitle}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.advice}</p>
          </div>

          <div className="italic text-slate-400 text-sm text-center border-t border-slate-800 pt-4 mt-2 flex justify-center gap-2">
            <Quote className="w-4 h-4 rotate-180" />
            {analysis.motivationalQuote}
            <Quote className="w-4 h-4" />
          </div>

          <button 
             onClick={() => setAnalysis(null)}
             className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {t.resetBtn}
          </button>
        </div>
      )}
    </div>
  );
};

export default AICoach;