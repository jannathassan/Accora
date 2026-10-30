import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([
    { category: 'Groceries & Food', limit: 40000, spent: 32000 },
    { category: 'Shop Rent / Utilities', limit: 35000, spent: 35000 },
    { category: 'Fuel & Transport', limit: 15000, spent: 8500 },
    { category: 'Marketing & Ads', limit: 12000, spent: 4000 },
  ]);

  const [goals, setGoals] = useState([
    { id: '1', name: 'Emergency Reserve Fund', target: 300000, saved: 85000, byDate: '2027-04' },
    { id: '2', name: 'Annual Shop Inventory Advance', target: 150000, saved: 60000, byDate: '2026-12' },
  ]);

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newCat, setNewCat] = useState('Groceries & Food');
  const [newLimit, setNewLimit] = useState('');

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('2027-06');

  const handleAddBudget = () => {
    const lim = parseFloat(newLimit) || 0;
    if (lim <= 0) return;
    setBudgets(prev => [...prev, { category: newCat, limit: lim, spent: 0 }]);
    setNewLimit('');
    setShowAddBudget(false);
  };

  const handleAddGoal = () => {
    const tgt = parseFloat(goalTarget) || 0;
    if (!goalName || tgt <= 0) return;
    setGoals(prev => [
      ...prev,
      { id: String(Date.now()), name: goalName, target: tgt, saved: 0, byDate: goalDate }
    ]);
    setGoalName('');
    setGoalTarget('');
    setShowAddGoal(false);
  };

  const handleAddSavings = (id: string) => {
    const amtStr = prompt('How much did you save for this goal (PKR)?', '5000');
    const amt = parseFloat(amtStr || '0');
    if (amt > 0) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: g.saved + amt } : g));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #7</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Budget &amp; Savings Goals
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Set monthly limits per category and track your savings goals with progress alerts at 80% and 100%.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budgets */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1D2839]">
              Monthly Budgets
            </h2>
            <button
              onClick={() => setShowAddBudget(!showAddBudget)}
              className="text-xs font-bold text-[#0B5CE6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Limit</span>
            </button>
          </div>

          {showAddBudget && (
            <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-3">
              <input
                type="text"
                placeholder="Category name"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F7] text-xs bg-white"
              />
              <input
                type="number"
                placeholder="Monthly Limit (PKR)"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F7] text-xs bg-white"
              />
              <button
                onClick={handleAddBudget}
                className="btn-primary text-xs py-2 px-3 w-full"
              >
                Save Budget Limit
              </button>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {budgets.map((b, idx) => {
              const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const isOver = pct >= 100;
              const isWarning = pct >= 80 && !isOver;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1D2839]">{b.category}</span>
                    <span className="text-[#5B6785]">
                      <strong>PKR {b.spent.toLocaleString()}</strong> of PKR {b.limit.toLocaleString()} ({pct}%)
                    </span>
                  </div>

                  {/* Progress Bar: Lime -> Amber at 80% -> Coral at 100% */}
                  <div className="w-full h-3 rounded-full bg-[#E2E8F7] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver
                          ? 'bg-[#FD614F]'
                          : isWarning
                          ? 'bg-[#f79009]'
                          : 'bg-[#A3D508]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {isOver && (
                    <p className="text-[11px] font-semibold text-[#FD614F] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      100% budget reached for this month!
                    </p>
                  )}
                  {isWarning && (
                    <p className="text-[11px] font-semibold text-[#f79009] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      80% limit warning: slow down spending.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Savings Goals */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1D2839]">
              Savings Goals
            </h2>
            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="text-xs font-bold text-[#0B5CE6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          {showAddGoal && (
            <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-3">
              <input
                type="text"
                placeholder="Goal name (e.g. Laptop upgrade, Emergency fund)"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F7] text-xs bg-white"
              />
              <input
                type="number"
                placeholder="Target PKR (e.g. 150000)"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F7] text-xs bg-white"
              />
              <input
                type="month"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F7] text-xs bg-white"
              />
              <button
                onClick={handleAddGoal}
                className="btn-primary text-xs py-2 px-3 w-full"
              >
                Create Goal
              </button>
            </div>
          )}

          <div className="space-y-5 pt-2">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
              const remaining = Math.max(0, g.target - g.saved);
              const monthsLeft = 6;
              const perMonthTarget = Math.round(remaining / monthsLeft);

              return (
                <div key={g.id} className="p-4 rounded-xl border border-[#E2E8F7] bg-[#F4F7FC]/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#1D2839] text-sm">{g.name}</h3>
                      <p className="text-xs text-[#5B6785]">Target date: {g.byDate}</p>
                    </div>
                    <button
                      onClick={() => handleAddSavings(g.id)}
                      className="btn-lime text-xs py-1.5 px-3"
                    >
                      + Add savings
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#1D2839] pt-1">
                    <span>PKR {g.saved.toLocaleString()} saved</span>
                    <span>Target: PKR {g.target.toLocaleString()} ({pct}%)</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#E2E8F7] overflow-hidden">
                    <div className="h-full bg-[#0B5CE6] transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>

                  <p className="text-[11px] text-[#5B6785]">
                    Save about <strong>PKR {perMonthTarget.toLocaleString()} / month</strong> to reach this goal on time.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
