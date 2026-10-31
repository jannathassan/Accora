import { useState, useRef, useEffect } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import { chatWithAI, getAIStatus, type AIStatusResponse } from '../services/api';
import type { ChatResponse } from '../types';
import CopilotResponse from './CopilotResponse';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
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
  const moneyStore = useMoneyStore();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; data?: ChatResponse }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      getAIStatus()
        .then((s) => setAiStatus(s))
        .catch(() => setAiStatus(null));
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildContext = () => {
    const { userName, userRole, balance, monthIn, monthOut, taxRate, transactions, invoices, bills } = moneyStore;
    const lines = [
      `User Profile: ${userName} (${userRole})`,
      `Currency: PKR`,
      `Current Cash Balance: PKR ${balance.toLocaleString()}`,
      `This Month Income: PKR ${monthIn.toLocaleString()}`,
      `This Month Spending: PKR ${monthOut.toLocaleString()}`,
      `Tax Rate: ${taxRate}%`,
    ];
    if (invoices && invoices.length > 0) {
      const unpaidInvs = invoices.filter((i) => !i.paid);
      lines.push(`Unpaid Invoices (${unpaidInvs.length}):`);
      unpaidInvs.slice(0, 5).forEach((i) => {
        lines.push(`  - ${i.client}: PKR ${i.amount.toLocaleString()} (Due: ${i.dueDate})`);
      });
    }
    if (bills && bills.length > 0) {
      const unpaidBills = bills.filter((b) => !b.paid);
      lines.push(`Unpaid Bills (${unpaidBills.length}):`);
      unpaidBills.slice(0, 5).forEach((b) => {
        lines.push(`  - ${b.name}: PKR ${b.amount.toLocaleString()} (Due: ${b.dueDate})`);
      });
    }
    if (transactions && transactions.length > 0) {
      lines.push(`Recent Transactions:`);
      transactions.slice(-5).forEach((t) => {
        lines.push(`  - ${t.date}: ${t.type.toUpperCase()} PKR ${t.amount.toLocaleString()} [${t.category}] ${t.note}`);
      });
    }
    return lines.join('\n');
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user' as const, text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn Gemini reasoning
      const history = messages.map((m) => ({
        role: (m.role === 'ai' ? 'model' : 'user') as 'user' | 'model',
        content: m.text,
      }));

      const res = await chatWithAI({
        message: text,
        context: buildContext(),
        history,
      });

      setMessages((m) => [...m, { role: 'ai', text: res.answer, data: res }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'I was unable to process your request at this moment. Please check your backend connection and try again.' },
      ]);
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
          'fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 border-l border-[#E2E8F7]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[#E2E8F7] shrink-0 bg-[#F4F7FC]">
          <div className="w-9 h-9 rounded-xl bg-[#0B5CE6] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1D2839]">Ask Accora AI Co-Pilot</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-[#5B6785]">
              {aiStatus?.provider === 'gemini' ? `Powered by Gemini (${aiStatus.model})` : 'AI Financial Intelligence'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-[#5B6785] hover:text-[#1D2839] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFBFF]">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#0B5CE6]" />
              </div>
              <h3 className="text-sm font-bold text-[#1D2839] mb-1">Ask me anything about your finances</h3>
              <p className="text-xs text-[#5B6785] mb-6">Powered by Google Gemini and grounded in your active records.</p>

              <div className="space-y-2">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="block w-full text-left text-xs px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#e8f0fe] text-[#1D2839] hover:text-[#0B5CE6] border border-[#E2E8F7] transition-colors shadow-2xs cursor-pointer font-medium"
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
                  'px-3.5 py-2.5 rounded-xl text-sm leading-relaxed shadow-2xs',
                  msg.role === 'user'
                    ? 'bg-[#0B5CE6] text-white rounded-br-xs'
                    : 'bg-white text-[#1D2839] border border-[#E2E8F7] rounded-bl-xs',
                )}
              >
                {msg.text}
              </div>

              {/* Structured response */}
              {msg.data && (
                <CopilotResponse data={msg.data} onFollowUp={send} />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#5B6785] bg-white p-3 rounded-xl border border-[#E2E8F7] shadow-2xs w-fit">
              <Loader2 className="w-3.5 h-3.5 text-[#0B5CE6] animate-spin" />
              <span>Analyzing financial data with Gemini AI…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#E2E8F7] bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about revenue, bills, or runway…"
              aria-label="Ask Accora AI Co-Pilot"
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-[#F4F7FC] rounded-xl text-sm text-[#1D2839] border border-[#E2E8F7] focus:outline-none focus:border-[#0B5CE6] transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-[#0B5CE6] text-white flex items-center justify-center hover:bg-[#094bbd] active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
