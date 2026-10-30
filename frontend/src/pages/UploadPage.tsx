import { useState } from 'react';
import { Download, Check, UploadCloud, AlertCircle, Camera } from 'lucide-react';
import { useMoneyStore } from '../store/moneyStore';
import { guessCategory } from '../utils/calculations';

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
  const { transactions, addTransaction, showToast } = useMoneyStore();
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [receiptImageName, setReceiptImageName] = useState<string | null>(null);

  const categories = [
    'Groceries',
    'Rent',
    'Utilities',
    'Transport',
    'School fees',
    'Medical',
    'Stock',
    'Salaries',
    'Ads',
    'Software',
    'Eating out',
    'Shopping',
    'Sales & Earnings',
    'Other',
  ];

  const handleParse = (text: string) => {
    setImportSuccess(null);
    const lines = text.trim().split(/\r?\n/);
    const rows: ParsedRow[] = [];

    lines.forEach((line, idx) => {
      // Ignore comments or empty lines
      if (!line.trim() || line.startsWith('#')) return;

      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 3) return;

      const dateStr = parts[0];
      // Middle parts may have commas inside quotes
      const note = parts.slice(1, -1).join(' ').replace(/["']/g, '');
      const rawAmt = parseFloat(parts[parts.length - 1]);

      if (isNaN(rawAmt)) return;

      const isOut = rawAmt < 0;
      const absAmt = Math.abs(rawAmt);

      // Duplicate check: same date and amount and note
      const isDup = transactions.some(
        (t) =>
          t.date === dateStr &&
          t.amount === absAmt &&
          t.note.toLowerCase().includes(note.toLowerCase().slice(0, 10))
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

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImageName(file.name);
      showToast({
        message: `Attached receipt photo "${file.name}".`,
      });
    }
  };

  const handleImportAll = async () => {
    let count = 0;
    const cleanRows = parsedRows.filter((r) => !r.isDuplicate);

    for (const r of cleanRows) {
      await addTransaction({
        amount: r.amount,
        type: r.type,
        category: r.category,
        note: r.note,
        date: r.date,
        account: 'bank',
      });
      count++;
    }

    setImportSuccess(`Successfully imported ${count} entries into your shared records!`);
    showToast({
      message: `Imported ${count} statement transactions.`,
      nextStepPrompt: 'See updated dashboard ->',
      nextStepRoute: '/app',
    });
    setParsedRows([]);
    setRawText('');
  };

  const sampleCsvData = `2026-10-05,Groceries from Imtiaz Super Market,-4850
2026-10-06,Client Web Project Advance Payment,75000
2026-10-08,PSO Fuel Station Petrol,-3500
2026-10-10,Shop wholesale inventory restock,-28000
2026-10-12,K-Electric Bill Payment,-9400
2026-10-15,Nayapay Wallet Transfer,15000`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accora-sample-bank-statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cleanCount = parsedRows.filter((r) => !r.isDuplicate).length;
  const dupCount = parsedRows.length - cleanCount;

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
          Upload a CSV bank or mobile wallet statement. We parse the columns, auto-categorize notes, detect duplicates, and import into your money store.
        </p>
      </div>

      {importSuccess && (
        <div className="p-4 rounded-xl bg-[#f3fbd9] border border-[#A3D508] text-[#1D2839] text-sm font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-[#1D2839]" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F7]">
          <div>
            <h2 className="text-base font-bold text-[#1D2839]">
              1. Choose a Bank or Wallet CSV Statement
            </h2>
            <p className="text-xs text-[#5B6785]">
              Format: Date (YYYY-MM-DD), Description / Note, Amount (Negative for money out, positive for money in)
            </p>
          </div>
          <button
            onClick={downloadSampleCsv}
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#E2E8F7] hover:border-[#0B5CE6] rounded-xl p-6 text-center transition-colors bg-[#F4F7FC]/50">
            <UploadCloud className="w-10 h-10 text-[#0B5CE6] mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-[#1D2839]">Click to select CSV file from computer</p>
            <p className="text-[11px] text-[#5B6785] mt-0.5">Supports HBL, Meezan, JazzCash, Nayapay, or any CSV export</p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="mt-3 inline-block text-xs text-[#5B6785] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0B5CE6] file:text-white hover:file:bg-[#094bbd] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1D2839]">
                Or paste statement rows directly:
              </label>
              <button
                onClick={() => {
                  setRawText(sampleCsvData);
                  handleParse(sampleCsvData);
                }}
                className="text-[11px] font-bold text-[#0B5CE6] hover:underline"
              >
                Paste Sample Rows
              </button>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder={sampleCsvData}
              className="w-full p-3 text-xs font-mono border border-[#E2E8F7] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5CE6]"
            />
          </div>
        </div>
      </div>

      {/* Stretch Goal: Receipt Photo Attachment demo */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#0B5CE6]" />
            <h3 className="font-bold text-sm text-[#1D2839]">Attach Receipt Image (Optional)</h3>
          </div>
          <span className="text-[11px] text-[#5B6785]">Quick paper receipt snapshot</span>
        </div>
        <p className="text-xs text-[#5B6785]">
          Snap a photo of paper petrol slips, grocery receipts, or challans to store with your records.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            className="text-xs text-[#5B6785] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e8f0fe] file:text-[#0B5CE6] cursor-pointer"
          />
          {receiptImageName && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              ✓ Attached: {receiptImageName}
            </span>
          )}
        </div>
      </div>

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F7]">
            <div>
              <h3 className="font-bold text-base text-[#1D2839]">
                Statement Preview ({parsedRows.length} rows parsed)
              </h3>
              <p className="text-xs text-[#5B6785]">
                {cleanCount} ready to import • {dupCount} duplicate(s) will be skipped
              </p>
            </div>
            <button
              onClick={handleImportAll}
              disabled={cleanCount === 0}
              className="btn-lime text-xs py-2 px-5 cursor-pointer font-bold disabled:opacity-50"
            >
              Import {cleanCount} Clean Rows
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Category (Editable)</th>
                  <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-[#E2E8F7]/60 hover:bg-[#F4F7FC]/30 ${
                      r.isDuplicate ? 'opacity-50 bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">{r.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1D2839]">{r.note}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.type === 'in'
                            ? 'bg-[#f3fbd9] text-[#1D2839]'
                            : 'bg-[#ffefed] text-[#FD614F]'
                        }`}
                      >
                        {r.type === 'in' ? 'Income' : 'Spending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={r.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParsedRows((prev) =>
                            prev.map((p) => (p.id === r.id ? { ...p, category: val } : p))
                          );
                        }}
                        className="px-2 py-1 border border-[#E2E8F7] rounded text-xs bg-white text-[#1D2839]"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={r.type === 'in' ? 'text-emerald-700' : 'text-[#FD614F]'}>
                        {r.type === 'in' ? '+' : '-'}PKR {r.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {r.isDuplicate ? (
                        <span className="text-[#FD614F] font-bold text-[10px] bg-[#ffefed] px-2 py-0.5 rounded-full border border-[#ffd4cf] inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Duplicate
                        </span>
                      ) : (
                        <span className="text-[#1D2839] font-bold text-[10px] bg-[#f3fbd9] px-2 py-0.5 rounded-full border border-[#A3D508] inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready
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
