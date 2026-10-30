import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { BRAND_MASCOT } from '../assets/brand';
import { useMoneyStore } from '../store/moneyStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'accora';
  text: string;
  basedOn?: string;
  time: string;
}

export default function AskAccoraPage() {
  const {
    transactions,
    invoices,
    bills,
    balance,
    monthIn,
    monthOut,
    taxRate,
  } = useMoneyStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'accora',
      text: 'Salam! I am your ACCORA money helper. Ask me any question in plain words about your spending, savings, bills, or taxes.',
      time: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Suggested question chips per profile (Section 6)
  const questionChips = [
    'Why did my spending go up?',
    'How much can I save this month?',
    'Which bills are due soon?',
    'Who owes me money?',
    'How much tax should I set aside?',
    'What is my current balance?',
  ];

  // Deterministic calculation engine grounded strictly in user data
  const generateGroundedAnswer = (q: string): { text: string; basedOn?: string } => {
    const l = q.toLowerCase();

    if (/spend|spent|expens|up/.test(l) && !/afford/.test(l)) {
      // Find top expense category
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
          ? `Clients currently owe you PKR ${totalOwed.toLocaleString()} across ${unpaidInvoices.length} invoice(s): ${unpaidInvoices.map((i) => `${i.client} (PKR ${i.amount.toLocaleString()})`).join(', ')}. You can copy a polite WhatsApp reminder from Bills & Invoices.`
          : 'Nobody owes you money right now. All recorded invoices are marked paid.',
        basedOn: 'Money Owed to Me (Invoices tab).',
      };
    }

    if (/tax/.test(l)) {
      const taxEstimate = Math.round(monthIn * (taxRate / 100));
      return {
        text: `At a ${taxRate}% set-aside rate, you should set aside approximately PKR ${taxEstimate.toLocaleString()} from your PKR ${monthIn.toLocaleString()} monthly income. Always confirm actual tax brackets with FBR or your tax consultant.`,
        basedOn: 'Tax Helper July–June fiscal estimate.',
      };
    }

    if (/balance|have|cash/.test(l)) {
      return {
        text: `You have approximately PKR ${balance.toLocaleString()} in net cash across your recorded cash, bank, and wallet entries.`,
        basedOn: 'Net sum of all verified income and expense entries.',
      };
    }

    if (/afford/.test(l)) {
      return {
        text: 'Use the “Can I Afford It?” tool in the sidebar. It tests purchases against your emergency cash buffer and monthly savings rate.',
        basedOn: 'ACCORA Affordability Evaluator.',
      };
    }

    return {
      text: 'I can answer questions about your spending, savings, due bills, client payments, tax estimates, or current balance. Try tapping one of the suggested question chips above!',
      basedOn: 'ACCORA Intelligence helper.',
    };
  };

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const ans = generateGroundedAnswer(q);
      const accoraMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'accora',
        text: ans.text,
        basedOn: ans.basedOn,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, accoraMsg]);
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 flex flex-col h-[calc(100vh-140px)] font-sans">
      
      {/* ── Header ── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #6</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Ask ACCORA (AI Chat)
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Ask in plain words. Every number comes directly from your records with zero invented data.
        </p>
      </div>

      {/* ── Suggested Question Chips ── */}
      <div className="flex flex-wrap gap-2">
        {questionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#E2E8F7] text-[#1D2839] hover:border-[#0B5CE6] hover:text-[#0B5CE6] transition-colors shadow-2xs cursor-pointer min-h-[36px]"
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
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#0B5CE6] text-white rounded-br-xs'
                  : 'bg-[#F4F7FC] text-[#1D2839] border border-[#E2E8F7] rounded-bl-xs'
              }`}
            >
              <p>{m.text}</p>
              {m.basedOn && (
                <p className="text-[11px] text-[#5B6785] mt-2 pt-2 border-t border-[#E2E8F7]">
                  <strong>Based on:</strong> {m.basedOn}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Box ── */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your money in plain words…"
          className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6] min-h-[48px]"
        />
        <button
          onClick={() => handleSend()}
          className="btn-primary px-6 min-h-[48px] cursor-pointer"
        >
          <Send className="w-4 h-4 mr-2" />
          <span>Ask</span>
        </button>
      </div>

    </div>
  );
}
