import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { FinancialProvider } from './store/FinancialStore';
import { ThemeProvider } from './store/ThemeProvider';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TransactionsPage from './pages/TransactionsPage';
import InvoicesPage from './pages/InvoicesPage';
import IntelligencePage from './pages/IntelligencePage';
import ForecastPage from './pages/ForecastPage';
import ScenariosPage from './pages/ScenariosPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated app shell — FinancialProvider wraps layout + all pages */}
        <Route element={<FinancialProvider><Outlet /></FinancialProvider>}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="intelligence" element={<IntelligencePage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}
