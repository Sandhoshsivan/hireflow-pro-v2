import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Zap, Loader2, Sparkles, ArrowUpRight } from 'lucide-react';
import api from '../lib/api';
import TopBar from '../components/TopBar';
import type { ChatMessage, MatchScoreResponse } from '../types';

const EXAMPLE_PROMPTS = [
  {
    emoji: '🏢',
    title: 'UAE Job Market',
    description: 'Active roles in UAE/Gulf with salary ranges',
    prompt: 'What roles are actively hiring in UAE/Gulf right now? Include specific company names, salary ranges, and what skills they prioritize.',
  },
  {
    emoji: '💰',
    title: 'Salary Benchmark',
    description: 'What package should you demand with your skills?',
    prompt: 'What exact salary should I demand for senior backend roles? Give specific numbers and negotiation tips.',
  },
  {
    emoji: '✉️',
    title: 'Cold Outreach',
    description: 'LinkedIn message template for target companies',
    prompt: 'Write a compelling cold LinkedIn message for a company hiring backend integration developers. Keep it under 150 words and personalizable.',
  },
  {
    emoji: '🎯',
    title: 'Interview Prep',
    description: 'Common interview questions with answers',
    prompt: 'What are the most common senior backend developer interview questions in 2026? Focus on system design, microservices, and cloud architecture. Give expected answers too.',
  },
  {
    emoji: '⚡',
    title: 'Target Companies',
    description: 'Top companies to target right now',
    prompt: 'List the top companies in my target area that actively hire backend developers. Include company size, culture, and interview process if known.',
  },
  {
    emoji: '📈',
    title: 'Strategy Review',
    description: 'Analyze your application strategy & get advice',
    prompt: 'Review my job search strategy and give me specific, honest assessment. What patterns are concerning? What should I change immediately? What are my top 3 action items this week?',
  },
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={112} height={112} viewBox="0 0 112 112">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
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
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: '#111827' }}>
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: '#4B5563' }}>
          / 100
        </text>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

function SkillChip({ label, type }: { label: string; type: 'match' | 'missing' }) {
  const isMatch = type === 'match';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        border: `1px solid ${isMatch ? '#6ee7b7' : '#fca5a5'}`,
        background: isMatch ? '#ecfdf5' : '#fef2f2',
        color: isMatch ? '#065f46' : '#991b1b',
      }}
    >
      {isMatch ? '✓' : '✗'} {label}
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
  const [showAnalyzer, setShowAnalyzer] = useState(false);

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

  const clearChat = () => {
    setMessages([]);
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TopBar title="AI Assistant" subtitle="Your intelligent career companion" />

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>

        {/* Quick Action Cards */}
        <div className="grid-3">
          {EXAMPLE_PROMPTS.map((item) => (
            <div
              key={item.title}
              className="card"
              style={{ cursor: 'pointer', transition: 'all .2s' }}
              onClick={() => sendMessage(item.prompt)}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--blue-md)';
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = '';
                el.style.transform = '';
                el.style.boxShadow = '';
              }}
            >
              <div className="card-body" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-header">
            <div className="card-title">
              <span className="card-icon">💬</span> Chat
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAnalyzer((v) => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Zap size={13} />
                {showAnalyzer ? 'Hide Analyzer' : 'Match Analyzer'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={clearChat}>
                Clear chat
              </button>
            </div>
          </div>

          <div className="ai-messages" id="ai-messages">
            {messages.length === 0 && (
              <div className="ai-msg">
                <div className="ai-avatar bot">🤖</div>
                <div className="ai-bubble bot">
                  Hey! I'm your AI career assistant. I can help with job search strategies, resume tips,
                  interview prep, cold outreach templates, and more. Click a quick action above or ask
                  me anything below!
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`ai-msg${msg.role === 'user' ? ' user' : ''}`}>
                <div className={`ai-avatar${msg.role === 'user' ? ' user' : ' bot'}`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`ai-bubble${msg.role === 'user' ? ' user' : ' bot'}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="ai-msg">
                <div className="ai-avatar bot">🤖</div>
                <div className="ai-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--text3)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text3)' }}>Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="ai-input-row">
              <textarea
                ref={textareaRef}
                className="ai-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your job search… (Shift+Enter for new line)"
                rows={2}
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isChatLoading || !input.trim()}
              >
                {isChatLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Send size={14} /> Send</>}
              </button>
            </div>
          </form>
        </div>

        {/* Match Analyzer — collapsible */}
        {showAnalyzer && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="card-icon"><Zap size={15} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>{' '}
                Job Match Analyzer
              </div>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Analyze your fit for a role</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!matchResult ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text2)', marginBottom: 6 }}>
                      Job Description <span style={{ color: 'var(--red)', fontWeight: 400, textTransform: 'none' }}>*</span>
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--surf2)',
                        color: 'var(--text)',
                        fontSize: 13,
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color var(--dur-fast)',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text2)', marginBottom: 6 }}>
                      Your Resume <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                    </label>
                    <textarea
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="Paste your resume or key skills here..."
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--surf2)',
                        color: 'var(--text)',
                        fontSize: 13,
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color var(--dur-fast)',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {upgradeRequired && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <Sparkles size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: 0 }}>Upgrade Required</p>
                        <p style={{ fontSize: 12, color: '#b45309', margin: '4px 0 6px' }}>Job match analysis requires a Pro or Premium plan.</p>
                        <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#92400e', textDecoration: 'underline' }}>
                          View plans <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={analyzeMatch}
                    disabled={isAnalyzing || !jobDescription.trim()}
                    style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '12px 16px' }}
                  >
                    {isAnalyzing ? (
                      <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
                    ) : (
                      <><Zap size={16} /> Analyze Match</>
                    )}
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
                    <ScoreDonut score={matchResult.score} />
                  </div>

                  {matchResult.strengths?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        Matched Skills ({matchResult.strengths.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {matchResult.strengths.map((s, i) => (
                          <SkillChip key={i} label={s} type="match" />
                        ))}
                      </div>
                    </div>
                  )}

                  {matchResult.gaps?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        Missing Skills ({matchResult.gaps.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {matchResult.gaps.map((g, i) => (
                          <SkillChip key={i} label={g} type="missing" />
                        ))}
                      </div>
                    </div>
                  )}

                  {matchResult.suggestions?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={12} style={{ color: 'var(--violet)' }} />
                        AI Suggestions
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {matchResult.suggestions.map((s, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text2)' }}>
                            <span style={{ flexShrink: 0, marginTop: 2, width: 18, height: 18, borderRadius: '50%', background: 'var(--blue)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                              {i + 1}
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    className="btn btn-secondary"
                    onClick={() => setMatchResult(null)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Analyze Another Job
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
