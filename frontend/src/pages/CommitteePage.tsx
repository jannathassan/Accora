import { useState } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { useFinancial } from '../store/FinancialStore';

export default function CommitteePage() {
  const { addTransaction } = useFinancial();
  const [committees, setCommittees] = useState([
    {
      id: 'bc-1',
      name: 'Family Kameti',
      monthlyAmount: 10000,
      members: 10,
      startMonth: '2026-08',
      myTurn: 5,
      paidMonths: [1, 2, 3],
      receivedPayout: false,
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('10000');
  const [members, setMembers] = useState('10');
  const [startMonth, setStartMonth] = useState('2026-09');
  const [myTurn, setMyTurn] = useState('4');

  const handleAddCommittee = () => {
    const amt = parseFloat(amount) || 0;
    const mem = parseInt(members) || 10;
    const turn = parseInt(myTurn) || 1;
    if (!name || amt <= 0) return;

    setCommittees(prev => [
      ...prev,
      {
        id: `bc-${Date.now()}`,
        name,
        monthlyAmount: amt,
        members: mem,
        startMonth,
        myTurn: turn,
        paidMonths: [],
        receivedPayout: false,
      }
    ]);

    setName('');
    setShowAdd(false);
  };

  const handleMarkPaid = async (bcId: string, monthIdx: number) => {
    const bc = committees.find(c => c.id === bcId);
    if (!bc) return;

    setCommittees(prev => prev.map(c => {
      if (c.id === bcId && !c.paidMonths.includes(monthIdx)) {
        return { ...c, paidMonths: [...c.paidMonths, monthIdx] };
      }
      return c;
    }));

    // Auto-create a spending entry per spec!
    await addTransaction({
      amount: bc.monthlyAmount,
      type: 'expense',
      category: 'Committee',
      description: `Committee payment (Month ${monthIdx}): ${bc.name}`,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const handleMarkReceived = async (bcId: string) => {
    const bc = committees.find(c => c.id === bcId);
    if (!bc) return;

    const totalPayout = bc.monthlyAmount * bc.members;
    setCommittees(prev => prev.map(c => c.id === bcId ? { ...c, receivedPayout: true } : c));

    // Auto-create income entry per spec!
    await addTransaction({
      amount: totalPayout,
      type: 'income',
      category: 'Committee',
      description: `Committee lump-sum payout received: ${bc.name}`,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #8</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Committee (BC) Tracker
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Keep track of your traditional Pakistani kameti / committees: payments due, payout turn, and progress. (Tracker only, not a payment handler).
        </p>
      </div>

      {/* Action to Add Committee */}
      <div className="flex justify-between items-center">
        <div className="p-3 bg-[#f3fbd9] border border-[#A3D508] rounded-xl text-xs text-[#1D2839] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#1D2839] shrink-0" />
          <span>Marking a payment adds a spending entry; receiving payout records income automatically.</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary text-xs py-2 px-4 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Committee</span>
        </button>
      </div>

      {showAdd && (
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <h3 className="font-bold text-sm text-[#1D2839]">Add New Committee</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Name</label>
              <input
                type="text"
                placeholder="e.g. Office Kameti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Monthly Amount (PKR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Total Members</label>
              <input
                type="number"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Start Month</label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">My Payout Month #</label>
              <input
                type="number"
                min="1"
                max={members}
                value={myTurn}
                onChange={(e) => setMyTurn(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleAddCommittee}
            className="btn-lime text-xs py-2 px-5"
          >
            Create Schedule
          </button>
        </div>
      )}

      {/* Committees List */}
      <div className="space-y-6">
        {committees.map((bc) => {
          const totalPaid = bc.paidMonths.length * bc.monthlyAmount;
          const totalExpected = bc.monthlyAmount * bc.members;

          return (
            <div key={bc.id} className="accora-card bg-white border-[#E2E8F7] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F7]">
                <div>
                  <h2 className="text-lg font-bold text-[#1D2839]">{bc.name}</h2>
                  <p className="text-xs text-[#5B6785]">
                    Monthly: <strong>PKR {bc.monthlyAmount.toLocaleString()}</strong> • {bc.members} members • Payout turn: <strong>Month #{bc.myTurn}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="px-3 py-1.5 bg-[#F4F7FC] rounded-lg border border-[#E2E8F7]">
                    <span className="text-[#5B6785]">Paid: </span>
                    <strong className="text-[#1D2839]">PKR {totalPaid.toLocaleString()}</strong>
                  </div>
                  <div className="px-3 py-1.5 bg-[#F4F7FC] rounded-lg border border-[#E2E8F7]">
                    <span className="text-[#5B6785]">Expected Payout: </span>
                    <strong className="text-[#0B5CE6]">PKR {totalExpected.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Month-by-month Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                      <th className="py-2.5 px-3">Month #</th>
                      <th className="py-2.5 px-3">My Contribution</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Payout Turn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: bc.members }).map((_, i) => {
                      const monthNum = i + 1;
                      const isPaid = bc.paidMonths.includes(monthNum);
                      const isMyPayout = monthNum === bc.myTurn;

                      return (
                        <tr key={monthNum} className="border-b border-[#E2E8F7]/60 hover:bg-[#F4F7FC]/40">
                          <td className="py-2.5 px-3 font-semibold text-[#1D2839]">
                            Month {monthNum}
                          </td>
                          <td className="py-2.5 px-3">
                            PKR {bc.monthlyAmount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[#1D2839] font-bold bg-[#A3D508] px-2 py-0.5 rounded-full text-[10px]">
                                <Check className="w-3 h-3" /> Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkPaid(bc.id, monthNum)}
                                className="btn-outline text-[11px] py-1 px-2.5"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {isMyPayout ? (
                              bc.receivedPayout ? (
                                <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[10px] border border-blue-200">
                                  ✓ Payout of PKR {totalExpected.toLocaleString()} Received
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarkReceived(bc.id)}
                                  className="btn-lime text-[11px] py-1 px-3"
                                >
                                  I got PKR {totalExpected.toLocaleString()}
                                </button>
                              )
                            ) : (
                              <span className="text-[#5B6785]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
