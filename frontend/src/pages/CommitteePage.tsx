import { useState } from 'react';
import { Plus, Check, Calendar, ShieldCheck, Users } from 'lucide-react';
import { useMoneyStore } from '../store/moneyStore';

export default function CommitteePage() {
  const {
    committees,
    addCommittee,
    markCommitteeMonthPaid,
    markCommitteePayoutReceived,
  } = useMoneyStore();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('10000');
  const [members, setMembers] = useState('10');
  const [startMonth, setStartMonth] = useState('2026-09');
  const [myTurn, setMyTurn] = useState('4');

  const handleAddCommittee = async () => {
    const amt = parseFloat(amount) || 0;
    const mem = parseInt(members) || 10;
    const turn = parseInt(myTurn) || 1;
    if (!name.trim() || amt <= 0) return;

    await addCommittee({
      name: name.trim(),
      monthlyAmount: amt,
      members: mem,
      startMonth,
      myTurn: turn,
      receivedPayout: false,
    });

    setName('');
    setShowAdd(false);
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
          Keep track of traditional Pakistani kametis: installments, payout turn, and payouts received.
        </p>
      </div>

      {/* Tracker Notice per spec */}
      <div className="p-4 rounded-xl bg-[#f3fbd9] border border-[#A3D508] text-xs text-[#1D2839] flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1D2839] shrink-0" />
          <span>
            <strong>Tracker only, not a payment handler.</strong> Marking a monthly turn as paid records a spending entry; receiving your payout records lump-sum income.
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-lime text-xs py-2 px-4 shrink-0 font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Committee</span>
        </button>
      </div>

      {/* Add New Committee Form */}
      {showAdd && (
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F7]">
            <Users className="w-4 h-4 text-[#0B5CE6]" />
            <h3 className="font-bold text-sm text-[#1D2839]">Add New Kameti / Committee</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Committee Name</label>
              <input
                type="text"
                placeholder="e.g. Office Kameti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Monthly Amount (PKR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839] font-bold"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Total Members</label>
              <input
                type="number"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#5B6785] mb-1 font-semibold">Start Month</label>
              <input
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839] font-medium"
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
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839] font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAdd(false)}
              className="btn-outline text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCommittee}
              className="btn-primary text-xs py-2 px-5 font-bold"
            >
              Create Schedule
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {committees.length === 0 && (
        <div className="accora-card bg-white border-[#E2E8F7] text-center py-12 space-y-3">
          <Calendar className="w-10 h-10 text-[#5B6785] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#1D2839]">No Committees Added Yet</h3>
          <p className="text-xs text-[#5B6785] max-w-md mx-auto">
            Traditional Pakistani BCs / kametis help pool savings with friends or family. Add one to schedule your monthly installments and track your payout month.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary text-xs py-2 px-4 font-bold"
          >
            Add Your First Committee
          </button>
        </div>
      )}

      {/* Committees List */}
      <div className="space-y-6">
        {committees.map((bc) => {
          const totalPaid = (bc.paidMonths?.length || 0) * bc.monthlyAmount;
          const totalExpected = bc.monthlyAmount * bc.members;
          const remainingToPay = Math.max(0, totalExpected - totalPaid);

          return (
            <div key={bc.id} className="accora-card bg-white border-[#E2E8F7] space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#E2E8F7]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#1D2839]">{bc.name}</h2>
                    {bc.receivedPayout && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f3fbd9] text-[#1D2839] border border-[#A3D508]">
                        Payout Collected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5B6785] mt-1">
                    Monthly: <strong>PKR {bc.monthlyAmount.toLocaleString()}</strong> • {bc.members} members • Payout Turn: <strong>Month #{bc.myTurn}</strong> • Starts: {bc.startMonth}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="px-3 py-1.5 bg-[#F4F7FC] rounded-lg border border-[#E2E8F7]">
                    <span className="text-[#5B6785]">Paid: </span>
                    <strong className="text-[#1D2839]">PKR {totalPaid.toLocaleString()}</strong>
                  </div>
                  <div className="px-3 py-1.5 bg-[#F4F7FC] rounded-lg border border-[#E2E8F7]">
                    <span className="text-[#5B6785]">Still to pay: </span>
                    <strong className="text-[#FD614F]">PKR {remainingToPay.toLocaleString()}</strong>
                  </div>
                  <div className="px-3 py-1.5 bg-[#e8f0fe] rounded-lg border border-[#0B5CE6]/20">
                    <span className="text-[#0B5CE6]">Expected Payout: </span>
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
                      <th className="py-2.5 px-3">Contribution</th>
                      <th className="py-2.5 px-3">Payment Status</th>
                      <th className="py-2.5 px-3">Your Payout Turn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: bc.members }).map((_, i) => {
                      const monthNum = i + 1;
                      const isPaid = (bc.paidMonths || []).includes(monthNum);
                      const isMyPayout = monthNum === bc.myTurn;

                      return (
                        <tr key={monthNum} className="border-b border-[#E2E8F7]/60 hover:bg-[#F4F7FC]/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#1D2839]">
                            Month {monthNum}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium">
                            PKR {bc.monthlyAmount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[#1D2839] font-bold bg-[#A3D508] px-2.5 py-0.5 rounded-full text-[11px]">
                                <Check className="w-3 h-3" /> Paid
                              </span>
                            ) : (
                              <button
                                onClick={() => markCommitteeMonthPaid(bc.id, monthNum)}
                                className="btn-outline text-[11px] py-1 px-3"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {isMyPayout ? (
                              bc.receivedPayout ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200">
                                  ✓ Payout of PKR {totalExpected.toLocaleString()} Received
                                </span>
                              ) : (
                                <button
                                  onClick={() => markCommitteePayoutReceived(bc.id)}
                                  className="btn-lime text-[11px] py-1 px-3 shadow-2xs font-bold"
                                >
                                  Collect PKR {totalExpected.toLocaleString()}
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
