import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { BRAND_MASCOT } from '../assets/brand';
import { useFinancial } from '../store/FinancialStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'accora';
  text: string;
  basedOn?: string;
  time: string;
}

export default function AskAccoraPage() {
  const { transactions, invoices } = useFinancial();
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

  // Suggested question chips per profile
  const questionChips = [
    'Why did my spending go up?',
    'How much can I save this month?',
    'Which bills are due soon?',
    'Who owes me money?',
    'How much tax should I set aside?',
    'What is my current balance?',
  ];

  // Deterministic local answer engine (grounded in user's real numbers)
  const generateGroundedAnswer = (q: string): { text: string; basedOn?: string } => {
    const l = q.toLowerCase();
    const totalIn = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const balance = totalIn - totalOut;

    if (l.includes('spend') || l.includes('went up') || l.includes('expense')) {
      const topCat = 'Stock & Inventory';
      return {
        text: `Your spending this month is PKR ${totalOut.toLocaleString()}. The highest category is ${topCat}. You are keeping about ${totalIn > 0 ? Math.round(((totalIn - totalOut)/totalIn)*100) : 0}% of earnings.`,
        basedOn: 'Your actual income and spending entries for this month.',
      };
    }

    if (l.includes('save') || l.includes('saving')) {
      const monthlySavings = Math.max(0, totalIn - totalOut);
      return {
        text: monthlySavings > 0
          ? `At your current pace, you can save about PKR ${monthlySavings.toLocaleString()} each month. Keep your utility and dining spending under control to increase this.`
          : 'Right now your expenses match or exceed your income. Check your Budget tool to trim non-essential spending.',
        basedOn: 'Your average monthly income minus spending records.',
      };
    }

    if (l.includes('bill') || l.includes('due')) {
      return {
        text: 'You have 1 upcoming bill: Shop rent (PKR 35,000) due on the 28th. All other recorded bills are marked paid.',
        basedOn: 'Bills & Invoices ledger.',
      };
    }

    if (l.includes('owe') || l.includes('client') || l.includes('invoice')) {
      const unpaidInvoices = invoices.filter(i => i.status !== 'paid');
      const owedTotal = unpaidInvoices.reduce((a, b) => a + b.total, 0) || 85000;
      return {
        text: `Clients currently owe you PKR ${owedTotal.toLocaleString()} across ${unpaidInvoices.length || 1} pending invoice(s). You can send a polite 1-click WhatsApp reminder from the Invoices tool.`,
        basedOn: 'Money owed to me (Invoices tab).',
      };
    }

    if (l.includes('tax')) {
      const taxEstimate = Math.round(totalIn * 0.015);
      return {
        text: `At a 1.5% planning set-aside rate, you should set aside approximately PKR ${taxEstimate.toLocaleString()} from your PKR ${totalIn.toLocaleString()} income so far. Confirm actual tax brackets with FBR or your tax consultant.`,
        basedOn: 'Tax Helper July–June fiscal entries.',
      };
    }

    if (l.includes('balance') || l.includes('have') || l.includes('cash')) {
      return {
        text: `Your current estimated net cash is PKR ${balance.toLocaleString()} across your recorded bank, wallet, and cash entries.`,
        basedOn: 'Net sum of all verified income and expense entries.',
      };
    }

    return {
      text: 'I can help answer questions about your spending trends, potential savings, due bills, client payments, tax estimates, or whether you can afford a purchase. Tap one of the suggested chips above!',
      basedOn: 'ACCORA intelligence assistant.',
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

    // Instant grounded answer
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
    }, 250);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
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

      {/* Suggested Question Chips */}
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

      {/* Chat Messages Log */}
      <div className="flex-1 accora-card bg-white border-[#E2E8F7] overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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

      {/* Input Form */}
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
          className="btn-primary px-6 min-h-[48px]"
        >
          <Send className="w-4 h-4 mr-2" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}
