import { Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMoneyStore } from '../store/moneyStore';

export default function NotificationsPage() {
  const { alerts } = useMoneyStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F7]">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0B5CE6]" />
          <h1 className="text-xl md:text-2xl font-extrabold text-[#1D2839] tracking-tight">
            Financial Alerts &amp; Notifications
          </h1>
          {alerts.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ffefed] text-[#FD614F] border border-[#ffd4cf]">
              {alerts.length} Active
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="accora-card bg-white border-[#E2E8F7] text-center py-12 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#A3D508] mx-auto" />
          <h2 className="text-base font-bold text-[#1D2839]">All Clear!</h2>
          <p className="text-xs text-[#5B6785] max-w-md mx-auto">
            You have no pending alerts. Upcoming bills, invoice reminders, and budget warnings will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="accora-card bg-white border-[#E2E8F7] p-4 flex items-start gap-3 hover:border-[#0B5CE6] transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-[#FD614F] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#1D2839] leading-relaxed">
                  {alert}
                </p>
                <span className="text-[10px] text-[#5B6785]">Priority Money Notice</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
