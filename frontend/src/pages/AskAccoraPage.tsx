import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  Lightbulb,
  CheckCircle2,
  Loader2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { BRAND_MASCOT } from '../assets/brand';
import { useMoneyStore } from '../store/moneyStore';
import { chatWithAI, getAIStatus, type AIStatusResponse } from '../services/api';
import type { ChatResponse } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'accora';
  text: string;
  basedOn?: string;
  time: string;
  data?: ChatResponse;
}

export default function AskAccoraPage() {
  const {
    userName,
    userRole,
    transactions,
    invoices,
    bills,
    committees,
    balance,
    monthIn,
    monthOut,
    taxRate,
    health,
  } = useMoneyStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'accora',
      text: 'Salam! I am your Accora AI Co-Pilot. Ask me anything in plain words about your cash flow, profit margins, spending patterns, pending invoices, or affordability decisions.',
      time: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll / fetch AI provider status on mount
  useEffect(() => {
    getAIStatus()
      .then((status) => setAiStatus(status))
      .catch(() => setAiStatus({ status: 'offline', provider: 'local', model: 'deterministic', configured: false }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Suggested question chips per profile
  const questionChips = [
    'Why did my spending go up?',
    'Who owes me money right now?',
    'How much can I safely save this month?',
    'Can I afford to hire someone?',
    'Which bills are due soon?',
    'What should I focus on next month?',
  ];

  // Helper to compile live data snapshot into rich financial context
  const buildFinancialContext = (): string => {
    const lines: string[] = [
      `User Profile: ${userName} (${userRole})`,
      `Currency: PKR`,
      `Current Cash Balance: PKR ${balance.toLocaleString()}`,
      `This Month Income: PKR ${monthIn.toLocaleString()}`,
      `This Month Spending: PKR ${monthOut.toLocaleString()}`,
      `Monthly Net Savings: PKR ${(monthIn - monthOut).toLocaleString()}`,
      `Tax Set-aside Rate: ${taxRate}%`,
      `Health Score: ${health?.score ?? 'N/A'}/100 (${health?.verdict ?? 'healthy'})`,
    ];

    // Top categories
    const catTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'out')
      .forEach((t) => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });
    const sortedCats = Object.entries(catTotals).sort(([, a], [, b]) => b - a);
    if (sortedCats.length > 0) {
      lines.push('Top Expense Categories:');
      sortedCats.slice(0, 5).forEach(([cat, amt]) => {
        const pct = monthOut > 0 ? Math.round((amt / monthOut) * 100) : 0;
        lines.push(`  - ${cat}: PKR ${amt.toLocaleString()} (${pct}%)`);
      });
    }

    // Unpaid invoices
    const unpaidInvoices = invoices.filter((i) => !i.paid);
    if (unpaidInvoices.length > 0) {
      const totalOwed = unpaidInvoices.reduce((a, b) => a + b.amount, 0);
      lines.push(`Uncollected Invoices: ${unpaidInvoices.length} totaling PKR ${totalOwed.toLocaleString()}:`);
      unpaidInvoices.slice(0, 6).forEach((i) => {
        lines.push(`  - ${i.client}: PKR ${i.amount.toLocaleString()} (Due: ${i.dueDate})`);
      });
    } else {
      lines.push('Invoices: All recorded customer invoices are fully paid.');
    }

    // Unpaid bills
    const unpaidBills = bills.filter((b) => !b.paid);
    if (unpaidBills.length > 0) {
      lines.push(`Upcoming Unpaid Bills (${unpaidBills.length}):`);
      unpaidBills.slice(0, 6).forEach((b) => {
        lines.push(`  - ${b.name}: PKR ${b.amount.toLocaleString()} (Due: ${b.dueDate})`);
      });
    }

    // Committees / Kametis
    if (committees && committees.length > 0) {
      lines.push(`Active Kametis/Committees (${committees.length}):`);
      committees.forEach((c) => {
        lines.push(`  - ${c.name}: PKR ${c.monthlyAmount.toLocaleString()}/month (${c.paidMonths.length}/${c.members} months paid)`);
      });
    }

    // Recent transactions
    if (transactions.length > 0) {
      lines.push('Recent Transaction Records:');
      transactions.slice(-6).forEach((t) => {
        lines.push(`  - ${t.date}: ${t.type.toUpperCase()} PKR ${t.amount.toLocaleString()} [${t.category}] ${t.note}`);
      });
    }

    return lines.join('\n');
  };

  // Deterministic local fallback in case network/backend is unreachable
  const generateLocalFallbackAnswer = (q: string): { text: string; basedOn?: string } => {
    const l = q.toLowerCase();

    if (/spend|spent|expens|up/.test(l) && !/afford/.test(l)) {
      const catTotals: Record<string, number> = {};
      transactions
        .filter((t) => t.type === 'out')
        .forEach((t) => {
          catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        });
      const topCatEntry = Object.entries(catTotals).sort(([, a], [, b]) => b - a)[0];
      const topCat = topCatEntry ? topCatEntry[0] : 'General spending';
      const topAmt = topCatEntry ? topCatEntry[1] : 0;

      return {
        text: `Your recorded spending this month is PKR ${monthOut.toLocaleString()}. Your highest expense category is ${topCat} (PKR ${topAmt.toLocaleString()}). You keep about ${monthIn > 0 ? Math.round(((monthIn - monthOut) / monthIn) * 100) : 0}% of earnings.`,
        basedOn: 'Your actual income and spending entries for this month.',
      };
    }

    if (/save|saving/.test(l)) {
      const netSavings = monthIn - monthOut;
      return {
        text: netSavings > 0
          ? `At your current pace, you can save about PKR ${netSavings.toLocaleString()} each month. You can allocate this toward your savings goals in the Budget & Goals tool.`
          : 'Right now your recorded expenses match or exceed your income. Check your Budget tool to trim non-essential categories.',
        basedOn: 'Your current monthly income minus spending records.',
      };
    }

    if (/bill|due/.test(l)) {
      const unpaidBills = bills.filter((b) => !b.paid);
      return {
        text: unpaidBills.length > 0
          ? `You have ${unpaidBills.length} unpaid bill(s): ${unpaidBills.map((b) => `${b.name} (PKR ${b.amount.toLocaleString()} due ${b.dueDate})`).join(', ')}.`
          : 'All clear! You have no unpaid bills due right now. 🎉',
        basedOn: 'Bills I Must Pay ledger.',
      };
    }

    if (/owe|owed|invoice|client/.test(l)) {
      const unpaidInvoices = invoices.filter((i) => !i.paid);
      const totalOwed = unpaidInvoices.reduce((a, b) => a + b.amount, 0);

      return {
        text: unpaidInvoices.length > 0
          ? `Clients currently owe you PKR ${totalOwed.toLocaleString()} across ${unpaidInvoices.length} invoice(s): ${unpaidInvoices.map((i) => `${i.client} (PKR ${i.amount.toLocaleString()})`).join(', ')}.`
          : 'Nobody owes you money right now. All recorded invoices are marked paid.',
        basedOn: 'Money Owed to Me (Invoices tab).',
      };
    }

    if (/tax/.test(l)) {
      const taxEstimate = Math.round(monthIn * (taxRate / 100));
      return {
        text: `At a ${taxRate}% set-aside rate, you should set aside approximately PKR ${taxEstimate.toLocaleString()} from your PKR ${monthIn.toLocaleString()} monthly income. Always confirm actual tax brackets with FBR.`,
        basedOn: 'Tax Helper estimate.',
      };
    }

    if (/balance|have|cash/.test(l)) {
      return {
        text: `You have approximately PKR ${balance.toLocaleString()} in net cash across your recorded cash, bank, and wallet entries.`,
        basedOn: 'Net sum of verified entries.',
      };
    }

    if (/afford/.test(l)) {
      return {
        text: 'Use the “Can I Afford It?” tool in the sidebar to simulate major purchases against your buffer.',
        basedOn: 'ACCORA Affordability Evaluator.',
      };
    }

    return {
      text: `Your current cash balance is PKR ${balance.toLocaleString()} with income of PKR ${monthIn.toLocaleString()} and spending of PKR ${monthOut.toLocaleString()}. Ask me anything specific about your bills, taxes, or invoices!`,
      basedOn: 'Live workspace financial records.',
    };
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn Gemini reasoning
      const history = messages
        .filter((m) => m.id !== 'init-1')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: m.text,
        }));

      const context = buildFinancialContext();
      const res = await chatWithAI({
        message: q,
        context,
        history,
      });

      const accoraMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'accora',
        text: res.answer,
        data: res,
        basedOn: res.evidence && res.evidence.length > 0 ? res.evidence.slice(0, 2).join(' • ') : 'Verified financial records',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, accoraMsg]);
    } catch {
      // Graceful offline fallback
      const fallback = generateLocalFallbackAnswer(q);
      const accoraMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'accora',
        text: fallback.text,
        basedOn: fallback.basedOn,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, accoraMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 flex flex-col h-[calc(100vh-140px)] font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Tool #6</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B5CE6]" />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0B5CE6]" />
              {aiStatus?.provider === 'gemini' ? `Gemini AI (${aiStatus.model})` : 'AI Co-Pilot'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
            Ask ACCORA AI Co-Pilot
          </h1>
          <p className="text-sm text-[#5B6785] mt-1">
            Intelligent, context-aware financial co-pilot powered by Google Gemini and grounded strictly in your records.
          </p>
        </div>

        {/* Live Provider Status Pill */}
        <div className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F7] text-xs shadow-2xs">
          <span className={`w-2.5 h-2.5 rounded-full ${aiStatus?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          <span className="font-semibold text-[#1D2839]">
            {aiStatus?.configured ? 'Gemini 1.5 Flash Connected' : 'Accora Intelligence Ready'}
          </span>
        </div>
      </div>

      {/* ── Suggested Question Chips ── */}
      <div className="flex flex-wrap gap-2">
        {questionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#E2E8F7] text-[#1D2839] hover:border-[#0B5CE6] hover:text-[#0B5CE6] transition-colors shadow-2xs cursor-pointer min-h-[36px] disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Chat Messages Container ── */}
      <div className="flex-1 accora-card bg-white border-[#E2E8F7] overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'accora' && (
              <div className="w-8 h-8 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex items-center justify-center shrink-0 p-1">
                <img src={BRAND_MASCOT} alt="Mascot" className="w-full h-full object-contain" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#0B5CE6] text-white rounded-br-xs shadow-xs'
                  : 'bg-[#F4F7FC] text-[#1D2839] border border-[#E2E8F7] rounded-bl-xs shadow-2xs space-y-3'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>

              {/* Structured AI response sections */}
              {m.data && (
                <div className="space-y-2.5 pt-2 border-t border-[#E2E8F7]/80 text-xs">
                  {/* Evidence / Findings */}
                  {m.data.evidence && m.data.evidence.length > 0 && (
                    <div className="bg-white/80 rounded-xl p-3 border border-[#E2E8F7]">
                      <p className="text-[10px] font-bold text-[#5B6785] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#0B5CE6]" />
                        <span>What I Found in Your Records</span>
                      </p>
                      <ul className="space-y-1">
                        {m.data.evidence.map((e, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[#1D2839]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B5CE6] shrink-0 mt-1.5" />
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strategic Interpretation */}
                  {m.data.interpretation && (
                    <div className="bg-[#e8f0fe]/60 rounded-xl p-3 border border-[#0B5CE6]/20">
                      <p className="text-[10px] font-bold text-[#0B5CE6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-[#0B5CE6]" />
                        <span>Why It Matters</span>
                      </p>
                      <p className="text-[#1D2839] leading-relaxed">{m.data.interpretation}</p>
                    </div>
                  )}

                  {/* Recommendation */}
                  {m.data.recommendation && (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recommended Next Step</span>
                      </p>
                      <p className="text-[#1D2839] leading-relaxed">{m.data.recommendation}</p>
                    </div>
                  )}

                  {/* Interactive Follow-ups */}
                  {m.data.follow_ups && m.data.follow_ups.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-[#5B6785] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Suggested Follow-Ups (Click to Ask)</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.data.follow_ups.map((fu, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(fu)}
                            disabled={loading}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-[#0B5CE6]/30 text-[#0B5CE6] hover:bg-[#e8f0fe] transition-colors text-left flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <span>{fu}</span>
                            <ArrowRight className="w-3 h-3 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp / Source */}
              {m.basedOn && !m.data && (
                <p className="text-[11px] text-[#5B6785] pt-1.5 border-t border-[#E2E8F7]">
                  <strong>Based on:</strong> {m.basedOn}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Loading / Thinking Indicator */}
        {loading && (
          <div className="flex items-start gap-3 justify-start animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex items-center justify-center shrink-0 p-1">
              <img src={BRAND_MASCOT} alt="Mascot" className="w-full h-full object-contain animate-bounce" />
            </div>
            <div className="bg-[#F4F7FC] border border-[#E2E8F7] rounded-2xl rounded-bl-xs p-3.5 flex items-center gap-2.5 text-xs text-[#5B6785]">
              <Loader2 className="w-4 h-4 text-[#0B5CE6] animate-spin" />
              <span>Analyzing your financial data with Gemini AI…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Box ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or follow up in plain words…"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6] min-h-[48px] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary px-6 min-h-[48px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          <span>{loading ? 'Thinking…' : 'Ask'}</span>
        </button>
      </form>

    </div>
  );
}
