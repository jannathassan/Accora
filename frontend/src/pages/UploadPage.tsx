import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { useFinancial } from '../store/FinancialStore';

interface ParsedRow {
  id: string;
  date: string;
  note: string;
  amount: number;
  type: 'in' | 'out';
  category: string;
  isDuplicate: boolean;
}

export default function UploadPage() {
  const { transactions, addTransaction } = useFinancial();
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const categories = [
    'Groceries', 'Rent', 'Utilities', 'Transport', 'School fees',
    'Medical', 'Stock', 'Salaries', 'Ads', 'Software', 'Eating out', 'Shopping', 'Other'
  ];

  // Auto-category guesser
  const guessCategory = (note: string): string => {
    const l = note.toLowerCase();
    if (/grocer|sabzi|ration|mart|store/.test(l)) return 'Groceries';
    if (/rent|kiraya/.test(l)) return 'Rent';
    if (/electric|gas|water|bill|internet|wifi|phone/.test(l)) return 'Utilities';
    if (/fuel|petrol|uber|careem|bus|van/.test(l)) return 'Transport';
    if (/school|fee|college|tuition/.test(l)) return 'School fees';
    if (/medic|doctor|pharm|clinic/.test(l)) return 'Medical';
    if (/stock|goods|wholesale|supplier/.test(l)) return 'Stock';
    if (/salary|salaries|wage/.test(l)) return 'Salaries';
    if (/ad |ads|facebook|instagram/.test(l)) return 'Ads';
    if (/software|subscription|tool/.test(l)) return 'Software';
    if (/food|kfc|restaurant|cafe|dinner/.test(l)) return 'Eating out';
    return 'Other';
  };

  const handleParse = (text: string) => {
    setImportSuccess(null);
    const lines = text.trim().split(/\r?\n/);
    const rows: ParsedRow[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 3) return;

      const dateStr = parts[0];
      const note = parts.slice(1, -1).join(' ').replace(/["']/g, '');
      const rawAmt = parseFloat(parts[parts.length - 1]);

      if (isNaN(rawAmt)) return;

      const isOut = rawAmt < 0;
      const absAmt = Math.abs(rawAmt);

      // Check duplicates against existing store
      const isDup = transactions.some(
        t => t.date === dateStr && t.amount === absAmt && t.description?.toLowerCase() === note.toLowerCase()
      );

      rows.push({
        id: `row-${idx}`,
        date: dateStr,
        note: note || (isOut ? 'Spending' : 'Income'),
        amount: absAmt,
        type: isOut ? 'out' : 'in',
        category: isOut ? guessCategory(note) : 'Sales & Earnings',
        isDuplicate: isDup,
      });
    });

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleImportAll = async () => {
    let count = 0;
    for (const r of parsedRows) {
      if (!r.isDuplicate) {
        await addTransaction({
          amount: r.amount,
          type: r.type === 'in' ? 'income' : 'expense',
          category: r.category,
          description: r.note,
          date: r.date,
        });
        count++;
      }
    }
    setImportSuccess(`Successfully imported ${count} entries into your records!`);
    setParsedRows([]);
    setRawText('');
  };

  const sampleCsvData =
    '2026-10-05,Groceries from Mart,-4500\n2026-10-06,Client project payment,60000\n2026-10-08,Petrol fuel,-3000\n2026-10-10,Shop inventory stock,-25000\n2026-10-12,Electricity bill,-8500';

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accora-sample-statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #10</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Easy Upload (Statement Import)
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Upload a CSV statement from your bank or mobile wallet. We map columns, auto-categorize notes, detect duplicates, and import at once.
        </p>
      </div>

      {importSuccess && (
        <div className="p-4 rounded-xl bg-[#f3fbd9] border border-[#A3D508] text-[#1D2839] text-sm font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-[#1D2839]" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F7]">
          <div>
            <h2 className="text-base font-bold text-[#1D2839]">
              Upload CSV Statement File
            </h2>
            <p className="text-xs text-[#5B6785]">Format: Date (YYYY-MM-DD), Description / Note, Amount (Negative for money out)</p>
          </div>
          <button
            onClick={downloadSampleCsv}
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-xs text-[#5B6785] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#e8f0fe] file:text-[#0B5CE6] hover:file:bg-[#0B5CE6] hover:file:text-white cursor-pointer"
          />

          <div>
            <label className="block text-xs font-semibold text-[#1D2839] mb-1">
              Or paste statement rows directly here:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder={sampleCsvData}
              className="w-full p-3 text-xs font-mono border border-[#E2E8F7] rounded-xl bg-[#F4F7FC]"
            />
          </div>
        </div>
      </div>

      {/* Preview Table with Duplicates and Auto-category */}
      {parsedRows.length > 0 && (
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1D2839]">
              Statement Preview ({parsedRows.length} rows found)
            </h3>
            <button
              onClick={handleImportAll}
              className="btn-lime text-xs py-2 px-5 cursor-pointer font-bold"
            >
              Import {parsedRows.filter(r => !r.isDuplicate).length} Clean Rows
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Assigned Category</th>
                  <th className="py-2.5 px-3">Amount (PKR)</th>
                  <th className="py-2.5 px-3">Duplicate Check</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((r) => (
                  <tr key={r.id} className="border-b border-[#E2E8F7]/60 hover:bg-[#F4F7FC]/30">
                    <td className="py-2.5 px-3 font-mono">{r.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1D2839]">{r.note}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.type === 'in' ? 'bg-[#f3fbd9] text-[#1D2839]' : 'bg-[#ffefed] text-[#FD614F]'
                      }`}>
                        {r.type === 'in' ? 'Income' : 'Spending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={r.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParsedRows(prev => prev.map(p => p.id === r.id ? { ...p, category: val } : p));
                        }}
                        className="px-2 py-1 border border-[#E2E8F7] rounded text-xs bg-white"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {r.type === 'in' ? '+' : '-'}PKR {r.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.isDuplicate ? (
                        <span className="text-[#FD614F] font-bold text-[10px] bg-[#ffefed] px-2 py-0.5 rounded-full border border-[#ffd4cf]">
                          Duplicate (will skip)
                        </span>
                      ) : (
                        <span className="text-[#1D2839] font-bold text-[10px] bg-[#f3fbd9] px-2 py-0.5 rounded-full border border-[#A3D508]">
                          Clean
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
