import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import {
  Send, Bot, User, Zap, Loader2, Sparkles, ArrowUpRight, MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';
import api from '../lib/api';
import TopBar from '../components/TopBar';
import type { ChatMessage, MatchScoreResponse } from '../types';

const EXAMPLE_PROMPTS = [
  'How do I negotiate salary effectively?',
  'Write me a cold outreach email to a recruiter',
  'What are common behavioral interview questions?',
  'How can I improve my LinkedIn profile?',
];

function ScoreDonut({ score }: { score: number }) {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  const color =
    score >= 70 ? '#10b981' :
    score >= 40 ? '#f59e0b' :
    '#ef4444';

  const label =
    score >= 70 ? 'Strong Match' :
    score >= 40 ? 'Moderate Match' :
    'Weak Match';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={112} height={112} viewBox="0 0 112 112">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: '#0f172a' }}>
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: '#64748b' }}>
          / 100
        </text>
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function SkillChip({ label, type }: { label: string; type: 'match' | 'missing' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
        type === 'match'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-red-50 text-red-700 border-red-200'
      )}
    >
      {type === 'match' ? '✓' : '✗'} {label}
    </span>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchScoreResponse | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { message: content, history });
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response ?? data.message ?? 'I could not process that request.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      const isUpgrade = axiosErr?.response?.status === 403;
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: isUpgrade
          ? 'You have reached your AI query limit. Upgrade to Pro or Premium for more queries.'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const analyzeMatch = async () => {
    if (!jobDescription.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setMatchResult(null);
    setUpgradeRequired(false);

    try {
      const { data } = await api.post('/ai/match-score', {
        jobDescription: jobDescription.trim(),
        resume: resume.trim() || undefined,
      });
      setMatchResult(data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 403) {
        setUpgradeRequired(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <TopBar title="AI Assistant" subtitle="Your intelligent career companion" />

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 24,
          minHeight: 0,
        }}
      >
        {/* ===== Chat Panel ===== */}
        <div
          className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden"
          style={{
            minHeight: 0,
            flex: 1,
            boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                  AI Assistant
                </h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
              style={{ background: '#faf5ff', borderColor: '#ede9fe' }}
            >
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span className="text-xs font-semibold text-violet-600">Powered by Claude</span>
            </div>
          </div>

          {/* Messages area — flex-1 + overflow-y-auto is the key scroll fix */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-5 py-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}
                >
                  <MessageSquare className="w-7 h-7 text-indigo-500" />
                </div>
                <div className="text-center max-w-xs">
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#0f172a' }}>
                    Hello! I'm your AI career assistant
                  </h3>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    I can help with job search strategies, resume tips, interview prep, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-xs text-slate-600 transition-all flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <ArrowUpRight className="w-3 h-3 shrink-0 ml-2 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx('flex gap-3 max-w-full', msg.role === 'user' && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={
                    msg.role === 'user'
                      ? { background: '#eef2ff' }
                      : { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
                  }
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={clsx(
                    'flex flex-col gap-1 max-w-[75%]',
                    msg.role === 'user' && 'items-end'
                  )}
                >
                  <div
                    className="px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white',
                            borderRadius: '16px',
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: '#f1f5f9',
                            color: '#0f172a',
                            borderRadius: '16px',
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span
                    className={clsx('text-xs px-1', msg.role === 'user' && 'text-right')}
                    style={{ color: '#94a3b8' }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-2"
                  style={{ background: '#f1f5f9', borderBottomLeftRadius: 4 }}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#94a3b8' }} />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area — fixed at bottom of chat panel */}
          <form
            onSubmit={handleFormSubmit}
            className="border-t border-slate-100 p-4 flex-shrink-0"
          >
            <div
              className="flex items-end gap-3 rounded-xl border px-4 py-3 bg-slate-50 transition-all"
              style={{ borderColor: '#e2e8f0' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                className="flex-1 bg-transparent text-sm resize-none outline-none text-slate-900"
                style={{ minHeight: 20, maxHeight: 120, lineHeight: '1.5' }}
                disabled={isChatLoading}
                rows={1}
              />
              <button
                type="submit"
                disabled={isChatLoading || !input.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                {isChatLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: '#94a3b8' }}>
              AI responses are for guidance only. Always verify important information.
            </p>
          </form>
        </div>

        {/* ===== Match Analyzer Panel ===== */}
        <div
          className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden"
          style={{
            minHeight: 0,
            boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
          }}
        >
          {/* Analyzer Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                Job Match Analyzer
              </h2>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Analyze your fit for a role
              </p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!matchResult ? (
              <>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    style={{ color: '#475569' }}
                  >
                    Job Description{' '}
                    <span className="text-red-400 normal-case font-normal">*</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none transition-all"
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#334155',
                    }}
                    rows={6}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    style={{ color: '#475569' }}
                  >
                    Your Resume{' '}
                    <span className="normal-case font-normal" style={{ color: '#94a3b8' }}>
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste your resume or key skills here..."
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none transition-all"
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#334155',
                    }}
                    rows={6}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {upgradeRequired && (
                  <div
                    className="flex items-start gap-3 p-3.5 rounded-xl border"
                    style={{ background: '#fffbeb', borderColor: '#fde68a' }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Upgrade Required</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Job match analysis requires a Pro or Premium plan.
                      </p>
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 underline mt-1.5 hover:text-amber-900"
                      >
                        View plans <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                <button
                  onClick={analyzeMatch}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Analyze Match
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-5">
                {/* Score donut */}
                <div className="flex flex-col items-center py-4">
                  <ScoreDonut score={matchResult.score} />
                </div>

                {/* Matched Skills */}
                {matchResult.strengths?.length > 0 && (
                  <div>
                    <h4
                      className="text-xs font-semibold mb-2.5 flex items-center gap-1.5"
                      style={{ color: '#475569' }}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Matched Skills ({matchResult.strengths.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.strengths.map((s, i) => (
                        <SkillChip key={i} label={s} type="match" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {matchResult.gaps?.length > 0 && (
                  <div>
                    <h4
                      className="text-xs font-semibold mb-2.5 flex items-center gap-1.5"
                      style={{ color: '#475569' }}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Missing Skills ({matchResult.gaps.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.gaps.map((g, i) => (
                        <SkillChip key={i} label={g} type="missing" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {matchResult.suggestions?.length > 0 && (
                  <div>
                    <h4
                      className="text-xs font-semibold mb-2.5 flex items-center gap-1.5"
                      style={{ color: '#475569' }}
                    >
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      AI Suggestions
                    </h4>
                    <ul className="space-y-2.5">
                      {matchResult.suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs"
                          style={{ color: '#475569' }}
                        >
                          <span
                            className="font-bold shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                            style={{ background: '#6366f1' }}
                          >
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setMatchResult(null)}
                  className="w-full py-2.5 text-xs font-medium rounded-xl transition-colors hover:bg-slate-100 border border-slate-200"
                  style={{ color: '#64748b' }}
                >
                  Analyze Another Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
