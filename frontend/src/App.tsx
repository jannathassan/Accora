import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import { FinancialProvider } from './store/FinancialStore';
import { ThemeProvider } from './store/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

// The 10 Pitch-Deck Tools (Section 3)
import DashboardPage from './pages/DashboardPage';          // Tool 1: My Money Dashboard
import TransactionsPage from './pages/TransactionsPage';    // Tool 2: Income & Spending Tracker
import InvoicesPage from './pages/InvoicesPage';            // Tool 3: Bills & Invoices
import ForecastPage from './pages/ForecastPage';            // Tool 4: Future Forecast
import AffordabilityPage from './pages/AffordabilityPage';  // Tool 5: "Can I Afford It?"
import AskAccoraPage from './pages/AskAccoraPage';          // Tool 6: Ask ACCORA (AI Chat)
import BudgetsPage from './pages/BudgetsPage';              // Tool 7: Budget & Savings Goals
import CommitteePage from './pages/CommitteePage';          // Tool 8: Committee (BC) Tracker
import TaxPage from './pages/TaxPage';                      // Tool 9: Tax Helper
import UploadPage from './pages/UploadPage';                // Tool 10: Easy Upload

// Ancillary Pages
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            {/* Public Landing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Authenticated / Demo App Shell */}
            <Route element={<FinancialProvider><Outlet /></FinancialProvider>}>
              <Route path="/app" element={<AppLayout />}>
                {/* 10 Tools in Exact Pitch Order */}
                <Route index element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="tracker" element={<TransactionsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="forecast" element={<ForecastPage />} />
                <Route path="affordability" element={<AffordabilityPage />} />
                <Route path="scenarios" element={<AffordabilityPage />} />
                <Route path="ask" element={<AskAccoraPage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="committee" element={<CommitteePage />} />
                <Route path="tax" element={<TaxPage />} />
                <Route path="upload" element={<UploadPage />} />

                {/* Additional Settings & Notifications */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
