import { useState, useRef, useEffect } from 'react';
import { useFinancial } from '../store/FinancialStore';
import type { ChatResponse } from '../types';
import { X, Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED = [
  'Am I making enough profit?',
  'Show me my overdue invoices',
  'What is my revenue forecast?',
  'What should I focus on this month?',
  'Can I afford to hire someone?',
  'How are my expenses trending?',
];

export default function CopilotPanel({ open, onClose }: Props) {
  const { askAI } = useFinancial();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; data?: ChatResponse }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await askAI(text);
      setMessages((m) => [...m, { role: 'ai', text: res.answer, data: res }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'I was unable to process your request. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface-card shadow-2xl z-50 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-surface-200 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-ai flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-surface-900">Ask Accora</h2>
            <p className="text-[10px] text-surface-400">AI Financial Copilot</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
            <X className="w-4.5 h-4.5 text-surface-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-ai-light flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-ai" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900 mb-1">Ask me anything about your finances</h3>
              <p className="text-xs text-surface-400 mb-6">I analyze your data to give data-grounded answers.</p>

              <div className="space-y-2">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="block w-full text-left text-xs px-3 py-2.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-surface-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={clsx('max-w-[90%]', msg.role === 'user' ? 'ml-auto' : '')}>
              <div
                className={clsx(
                  'px-3.5 py-2.5 rounded-xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-surface-100 text-surface-800 rounded-bl-sm',
                )}
              >
                {msg.text}
              </div>

              {/* Structured response */}
              {msg.data && (
                <div className="mt-2 space-y-2">
                  {msg.data.evidence.length > 0 && (
                    <div className="bg-surface-50 rounded-lg p-2.5">
                      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-1">Evidence</p>
                      {msg.data.evidence.map((e, j) => (
                        <p key={j} className="text-[11px] text-surface-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-surface-300 shrink-0" />
                          {e}
                        </p>
                      ))}
                    </div>
                  )}
                  {msg.data.interpretation && (
                    <div className="bg-brand-50 rounded-lg p-2.5">
                      <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide mb-0.5">Interpretation</p>
                      <p className="text-[11px] text-surface-700">{msg.data.interpretation}</p>
                    </div>
                  )}
                  {msg.data.recommendation && (
                    <div className="bg-positive-light rounded-lg p-2.5">
                      <p className="text-[10px] font-semibold text-positive uppercase tracking-wide mb-0.5">Recommendation</p>
                      <p className="text-[11px] text-surface-700">{msg.data.recommendation}</p>
                    </div>
                  )}
                  {/* Follow-up suggestions */}
                  {msg.data.follow_ups && msg.data.follow_ups.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Follow-up questions
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.data.follow_ups.map((f, j) => (
                          <button
                            key={j}
                            onClick={() => send(f)}
                            className="text-[11px] px-2.5 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors border border-brand/10"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-surface-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing your financial data...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-surface-200 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your business..."
              className="flex-1 px-3.5 py-2.5 bg-surface-50 rounded-lg text-sm border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
