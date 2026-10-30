/**
 * Accora UI Text Dictionary.
 * English strings localized and prepared for Urdu translations.
 */

export const STRINGS = {
  brandName: 'ACCORA',
  tagline: 'Your AI money helper',
  pitchHeadline: 'Where did your money go this month?',
  heroSubheadline:
    'ACCORA is an AI helper that makes money simple to see, plan, and control. For shops, freelancers, employees, and homemakers in Pakistan.',
  tryDemo: 'Try the demo (no sign-up)',
  createAccount: 'Create free account',
  startOwnData: 'Or start with my own data',
  sampleDataBanner: 'You are viewing demo data',
  resetDemo: 'Reset demo',
  toolsTitle: '10 simple tools in one app',
  howItWorksTitle: 'How it works',
  howItWorksStep1Title: '1. Add your money',
  howItWorksStep1Desc: 'Type it in or upload a bank or wallet statement.',
  howItWorksStep2Title: '2. See the picture',
  howItWorksStep2Desc: 'Dashboard, forecast, health score, and alerts update instantly.',
  howItWorksStep3Title: '3. Get clear answers',
  howItWorksStep3Desc: 'Ask in plain words: "Can I afford this?" or "How much can I save?"',
  yourDataTitle: 'Your data',
  yourDataDesc:
    'In this demo, your financial data is kept securely in your browser on this device. We do not sell your data or use it for advertising. Tax estimates are for informational planning and are not legal tax advice.',
  
  // Navigation Services (Exact 10 items)
  nav: {
    dashboard: 'My Money Dashboard',
    tracker: 'Income & Spending Tracker',
    invoices: 'Bills & Invoices',
    forecast: 'Future Forecast',
    affordability: '“Can I Afford It?”',
    askAccora: 'Ask ACCORA',
    budgets: 'Budget & Savings Goals',
    committee: 'Committee (BC) Tracker',
    taxHelper: 'Tax Helper',
    easyUpload: 'Easy Upload',
  },

  // Personas
  personas: {
    shop: {
      name: 'Ali, shop owner',
      role: 'Shop & online seller',
      pain: 'Hard to track cash vs. bank sales and keep enough stock money.',
    },
    free: {
      name: 'Sara, freelancer',
      role: 'Freelancer & side-hustler',
      pain: 'Irregular client payments and not knowing how much tax to set aside.',
    },
    pro: {
      name: 'Usman, employee',
      role: 'Working professional',
      pain: 'Salary vanishes within 15 days; unable to save for goals.',
    },
    home: {
      name: 'Ayesha, homemaker',
      role: 'Homemaker',
      pain: 'Managing monthly household budget, committee turns, and emergency savings.',
    },
  },
} as const;

export type TranslationKey = keyof typeof STRINGS;
