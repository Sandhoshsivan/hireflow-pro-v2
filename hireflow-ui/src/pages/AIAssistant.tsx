import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { ChatMessage } from '../types';

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I\'m your AI career assistant. I can help you with job search strategies, resume tips, interview preparation, and analyzing job matches. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMsg.content });
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response ?? data.message ?? 'I apologize, I could not process that request.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJobMatch = async () => {
    if (!jobAnalysis.trim() || isLoading) return;
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `Analyze this job for me:\n${jobAnalysis}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setJobAnalysis('');

    try {
      const { data } = await api.post('/ai/match-score', { jobDescription: jobAnalysis });
      const content = data.score !== undefined
        ? `**Match Score: ${data.score}%**\n\n**Strengths:**\n${(data.strengths ?? []).map((s: string) => `- ${s}`).join('\n')}\n\n**Gaps:**\n${(data.gaps ?? []).map((g: string) => `- ${g}`).join('\n')}\n\n**Suggestions:**\n${(data.suggestions ?? []).map((s: string) => `- ${s}`).join('\n')}`
        : data.response ?? 'Analysis complete.';

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I could not analyze that job. This feature may require an upgrade.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <TopBar title="AI Assistant" subtitle="Your intelligent career companion" />

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    msg.role === 'user' ? 'bg-blue-100' : 'bg-violet-100'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-violet-600" />
                  )}
                </div>
                <div
                  className={clsx(
                    'max-w-[70%] rounded-xl px-4 py-3 text-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={clsx(
                      'text-xs mt-1',
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-violet-600" />
                </div>
                <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  <span className="text-sm text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-slate-200 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your job search..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Job Analysis Panel */}
        <div className="w-80 bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Analyze Job Match</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Paste a job description or URL to get a match analysis.
          </p>
          <textarea
            value={jobAnalysis}
            onChange={(e) => setJobAnalysis(e.target.value)}
            placeholder="Paste job description here..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
            rows={8}
          />
          <button
            onClick={analyzeJobMatch}
            disabled={isLoading || !jobAnalysis.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Analyze Match
          </button>
        </div>
      </div>
    </div>
  );
}
