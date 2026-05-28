import type { ITableColumn } from '@trimble-oss/moduswebcomponents';

export type FinancialPeriodId = '7d' | '30d' | '90d';

export interface FinancialPeriodData {
  revenue: string;
  revenueChange: string;
  expenses: string;
  expensesChange: string;
  netProfit: string;
  netProfitChange: string;
  cashFlow: string;
  cashFlowChange: string;
  revenueTrend: { name: string; value: number }[];
  expenseTrend: { name: string; value: number }[];
  expenseBreakdown: { name: string; value: number }[];
  profitByCategory: { name: string; value: number }[];
  cashFlowTrend: { name: string; inflow: number; outflow: number }[];
  transactions: {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: string;
    status: string;
  }[];
}

export const FINANCIAL_PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const FINANCIAL_OVERVIEW_TABS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'cash-flow', label: 'Cash Flow' },
];

export const FINANCIAL_CHART_HEIGHT_PX = 180;
export const FINANCIAL_OVERVIEW_CHART_HEIGHT_PX = 220;
export const FINANCIAL_CHART_INITIAL_WIDTH_PX = 480;

export const PERIOD_DATA: Record<FinancialPeriodId, FinancialPeriodData> = {
  '7d': {
    revenue: '$24,850',
    revenueChange: '+12.4% from previous week',
    expenses: '$18,200',
    expensesChange: '+3.2% from previous week',
    netProfit: '$6,650',
    netProfitChange: '+28.1% from previous week',
    cashFlow: '$8,420',
    cashFlowChange: '+15.2% from previous week',
    revenueTrend: [
      { name: 'Mon', value: 3200 },
      { name: 'Tue', value: 4100 },
      { name: 'Wed', value: 3500 },
      { name: 'Thu', value: 4800 },
      { name: 'Fri', value: 4200 },
      { name: 'Sat', value: 2100 },
      { name: 'Sun', value: 2950 },
    ],
    expenseTrend: [
      { name: 'Mon', value: 2400 },
      { name: 'Tue', value: 3100 },
      { name: 'Wed', value: 2800 },
      { name: 'Thu', value: 3500 },
      { name: 'Fri', value: 3200 },
      { name: 'Sat', value: 1600 },
      { name: 'Sun', value: 2000 },
    ],
    expenseBreakdown: [
      { name: 'Payroll', value: 8200 },
      { name: 'Operations', value: 4200 },
      { name: 'Marketing', value: 2800 },
      { name: 'R&D', value: 2000 },
      { name: 'Other', value: 1000 },
    ],
    profitByCategory: [
      { name: 'Product Sales', value: 14200 },
      { name: 'Services', value: 6850 },
      { name: 'Subscriptions', value: 3800 },
    ],
    cashFlowTrend: [
      { name: 'Mon', inflow: 4200, outflow: 3100 },
      { name: 'Tue', inflow: 5100, outflow: 2800 },
      { name: 'Wed', inflow: 3800, outflow: 3500 },
      { name: 'Thu', inflow: 6200, outflow: 2900 },
      { name: 'Fri', inflow: 4500, outflow: 4100 },
      { name: 'Sat', inflow: 2200, outflow: 1200 },
      { name: 'Sun', inflow: 3100, outflow: 1800 },
    ],
    transactions: [
      {
        id: 1,
        date: 'Mar 4',
        description: 'Invoice #10234 - Acme Corp',
        category: 'Revenue',
        amount: '$4,200.00',
        status: 'Completed',
      },
      {
        id: 2,
        date: 'Mar 4',
        description: 'Payroll - Bi-weekly',
        category: 'Expense',
        amount: '-$8,200.00',
        status: 'Completed',
      },
      {
        id: 3,
        date: 'Mar 3',
        description: 'Subscription renewal - Cloud Services',
        category: 'Expense',
        amount: '-$1,200.00',
        status: 'Completed',
      },
      {
        id: 4,
        date: 'Mar 3',
        description: 'Payment received - Tech Solutions Ltd',
        category: 'Revenue',
        amount: '$6,500.00',
        status: 'Completed',
      },
      {
        id: 5,
        date: 'Mar 2',
        description: 'Office supplies',
        category: 'Expense',
        amount: '-$340.00',
        status: 'Pending',
      },
    ],
  },
  '30d': {
    revenue: '$89,450',
    revenueChange: '+18.2% from last month',
    expenses: '$62,300',
    expensesChange: '+5.1% from last month',
    netProfit: '$27,150',
    netProfitChange: '+42.3% from last month',
    cashFlow: '$31,200',
    cashFlowChange: '+22.8% from last month',
    revenueTrend: [
      { name: 'Jan', value: 24500 },
      { name: 'Feb', value: 28200 },
      { name: 'Mar', value: 31200 },
      { name: 'Apr', value: 28900 },
      { name: 'May', value: 33500 },
    ],
    expenseTrend: [
      { name: 'Jan', value: 18200 },
      { name: 'Feb', value: 19800 },
      { name: 'Mar', value: 21500 },
      { name: 'Apr', value: 20100 },
      { name: 'May', value: 22800 },
    ],
    expenseBreakdown: [
      { name: 'Payroll', value: 35200 },
      { name: 'Operations', value: 12800 },
      { name: 'Marketing', value: 8200 },
      { name: 'R&D', value: 4100 },
      { name: 'Other', value: 2000 },
    ],
    profitByCategory: [
      { name: 'Product Sales', value: 48200 },
      { name: 'Services', value: 26800 },
      { name: 'Subscriptions', value: 14450 },
    ],
    cashFlowTrend: [
      { name: 'W1', inflow: 18200, outflow: 14200 },
      { name: 'W2', inflow: 22100, outflow: 15800 },
      { name: 'W3', inflow: 19500, outflow: 16500 },
      { name: 'W4', inflow: 24800, outflow: 15800 },
      { name: 'W5', inflow: 4850, outflow: 2000 },
    ],
    transactions: [
      {
        id: 1,
        date: 'Mar 4',
        description: 'Invoice #10234 - Acme Corp',
        category: 'Revenue',
        amount: '$4,200.00',
        status: 'Completed',
      },
      {
        id: 2,
        date: 'Mar 4',
        description: 'Payroll - Bi-weekly',
        category: 'Expense',
        amount: '-$8,200.00',
        status: 'Completed',
      },
      {
        id: 3,
        date: 'Mar 3',
        description: 'Subscription renewal - Cloud Services',
        category: 'Expense',
        amount: '-$1,200.00',
        status: 'Completed',
      },
      {
        id: 4,
        date: 'Mar 3',
        description: 'Payment received - Tech Solutions Ltd',
        category: 'Revenue',
        amount: '$6,500.00',
        status: 'Completed',
      },
      {
        id: 5,
        date: 'Mar 2',
        description: 'Office supplies',
        category: 'Expense',
        amount: '-$340.00',
        status: 'Pending',
      },
      {
        id: 6,
        date: 'Mar 2',
        description: 'Consulting fee - Project Alpha',
        category: 'Revenue',
        amount: '$2,800.00',
        status: 'Completed',
      },
      {
        id: 7,
        date: 'Mar 1',
        description: 'Software license - Annual',
        category: 'Expense',
        amount: '-$4,500.00',
        status: 'Completed',
      },
    ],
  },
  '90d': {
    revenue: '$268,200',
    revenueChange: '+15.8% from previous quarter',
    expenses: '$186,400',
    expensesChange: '+8.2% from previous quarter',
    netProfit: '$81,800',
    netProfitChange: '+31.4% from previous quarter',
    cashFlow: '$94,500',
    cashFlowChange: '+18.6% from previous quarter',
    revenueTrend: [
      { name: 'M1', value: 78200 },
      { name: 'M2', value: 85200 },
      { name: 'M3', value: 104800 },
    ],
    expenseTrend: [
      { name: 'M1', value: 58400 },
      { name: 'M2', value: 61200 },
      { name: 'M3', value: 66800 },
    ],
    expenseBreakdown: [
      { name: 'Payroll', value: 105600 },
      { name: 'Operations', value: 38400 },
      { name: 'Marketing', value: 24600 },
      { name: 'R&D', value: 12300 },
      { name: 'Other', value: 5500 },
    ],
    profitByCategory: [
      { name: 'Product Sales', value: 144200 },
      { name: 'Services', value: 80200 },
      { name: 'Subscriptions', value: 43800 },
    ],
    cashFlowTrend: [
      { name: 'M1', inflow: 85200, outflow: 62100 },
      { name: 'M2', inflow: 91200, outflow: 65800 },
      { name: 'M3', inflow: 91800, outflow: 58500 },
    ],
    transactions: [
      {
        id: 1,
        date: 'Mar 4',
        description: 'Invoice #10234 - Acme Corp',
        category: 'Revenue',
        amount: '$4,200.00',
        status: 'Completed',
      },
      {
        id: 2,
        date: 'Mar 4',
        description: 'Payroll - Bi-weekly',
        category: 'Expense',
        amount: '-$8,200.00',
        status: 'Completed',
      },
      {
        id: 3,
        date: 'Mar 3',
        description: 'Subscription renewal - Cloud Services',
        category: 'Expense',
        amount: '-$1,200.00',
        status: 'Completed',
      },
      {
        id: 4,
        date: 'Mar 3',
        description: 'Payment received - Tech Solutions Ltd',
        category: 'Revenue',
        amount: '$6,500.00',
        status: 'Completed',
      },
      {
        id: 5,
        date: 'Mar 2',
        description: 'Office supplies',
        category: 'Expense',
        amount: '-$340.00',
        status: 'Pending',
      },
    ],
  },
};

function createBadgeCell(value: unknown, color: 'primary' | 'warning' | 'success'): HTMLElement {
  const badge = document.createElement('modus-wc-badge');
  badge.setAttribute('variant', 'filled');
  badge.setAttribute('color', color);
  badge.setAttribute('size', 'sm');
  badge.textContent = String(value ?? '');
  return badge;
}

function createAmountCell(value: unknown): HTMLElement {
  const span = document.createElement('span');
  const str = String(value ?? '');
  span.textContent = str;
  if (str.startsWith('-')) {
    span.className = 'financial-dashboard-amount-negative';
  }
  return span;
}

export const transactionColumns: ITableColumn[] = [
  { id: 'date', header: 'Date', accessor: 'date', sortable: false },
  { id: 'description', header: 'Description', accessor: 'description', sortable: false },
  { id: 'category', header: 'Category', accessor: 'category', sortable: false },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    sortable: false,
    cellRenderer: createAmountCell,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: false,
    cellRenderer: (v) => createBadgeCell(v, v === 'Completed' ? 'success' : 'warning'),
  },
];
