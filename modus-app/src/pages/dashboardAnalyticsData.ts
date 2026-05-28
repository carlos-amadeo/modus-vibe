import type { TooltipProps } from 'recharts';

export type PeriodId = '7d' | '30d' | '90d';

export type ValueFormat = 'currency' | 'number' | 'percent';

type ChartTooltipFormatter = NonNullable<TooltipProps<any, any>['formatter']>;

export interface PeriodData {
  revenue: string;
  revenueChange: string;
  users: string;
  usersChange: string;
  sales: string;
  salesChange: string;
  conversion: string;
  conversionChange: string;
  revenueTrend: { name: string; value: number }[];
  revenueByCategory: { name: string; value: number }[];
  salesOverTime: { name: string; sales: number; orders: number }[];
  revenueVsTarget: { name: string; revenue: number; target: number }[];
  topProducts: { name: string; value: number }[];
  regionalPerformance: { name: string; revenue: number; growth: number }[];
  conversionFunnel: { name: string; value: number }[];
  customerAcquisition: { name: string; new: number; returning: number }[];
  revenueByChannel: { name: string; value: number }[];
}

export const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const CHART_COLORS = [
  'var(--modus-wc-color-primary)',
  'var(--modus-wc-color-warning)',
  'var(--modus-wc-color-success)',
  'var(--modus-wc-color-error)',
  'var(--modus-wc-color-secondary)',
];

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--modus-wc-color-base-100)',
    border: '1px solid var(--modus-wc-color-base-200)',
    borderRadius: 'var(--radius-button, 8px)',
    color: 'var(--modus-wc-color-base-content)',
    padding: '8px 12px',
  },
  itemStyle: { color: 'var(--modus-wc-color-base-content)' },
  labelStyle: { color: 'var(--modus-wc-color-base-content)' },
  cursor: { fill: 'var(--modus-wc-color-base-200)' },
};

export const CHART_HEIGHT_PX = 180;
export const CHART_INITIAL_WIDTH_PX = 480;

export const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

export const formatNumber = (v: number) => new Intl.NumberFormat('en-US').format(v);
export const formatPercent = (v: number) => `${v}%`;

export const createTooltipFormatter =
  (valueFormat: Record<string, ValueFormat>): ChartTooltipFormatter =>
  (value, _name, item) => {
    const dataKey = String(item?.dataKey ?? 'value');
    const type = valueFormat[dataKey] ?? 'number';
    if (typeof value !== 'number') return String(value ?? '');
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percent') return formatPercent(value);
    return formatNumber(value);
  };

export const PERIOD_DATA: Record<PeriodId, PeriodData> = {
  '7d': {
    revenue: '$12,450',
    revenueChange: '+8.2% from previous week',
    users: '892',
    usersChange: '+12.4% from previous week',
    sales: '3,421',
    salesChange: '+5.1% from previous week',
    conversion: '2.8%',
    conversionChange: '-0.3% from previous week',
    revenueTrend: [
      { name: 'Mon', value: 120 },
      { name: 'Tue', value: 180 },
      { name: 'Wed', value: 150 },
      { name: 'Thu', value: 220 },
      { name: 'Fri', value: 190 },
      { name: 'Sat', value: 140 },
      { name: 'Sun', value: 90 },
    ],
    revenueByCategory: [
      { name: 'Software', value: 4200 },
      { name: 'Hardware', value: 3800 },
      { name: 'Services', value: 2450 },
      { name: 'Support', value: 2000 },
    ],
    salesOverTime: [
      { name: 'Mon', sales: 420, orders: 48 },
      { name: 'Tue', sales: 580, orders: 62 },
      { name: 'Wed', sales: 520, orders: 55 },
      { name: 'Thu', sales: 680, orders: 71 },
      { name: 'Fri', sales: 590, orders: 64 },
      { name: 'Sat', sales: 410, orders: 45 },
      { name: 'Sun', sales: 380, orders: 42 },
    ],
    revenueVsTarget: [
      { name: 'Mon', revenue: 120, target: 150 },
      { name: 'Tue', revenue: 180, target: 150 },
      { name: 'Wed', revenue: 150, target: 150 },
      { name: 'Thu', revenue: 220, target: 150 },
      { name: 'Fri', revenue: 190, target: 150 },
      { name: 'Sat', revenue: 140, target: 120 },
      { name: 'Sun', revenue: 90, target: 100 },
    ],
    topProducts: [
      { name: 'Product A', value: 1850 },
      { name: 'Product B', value: 1620 },
      { name: 'Product C', value: 1280 },
      { name: 'Product D', value: 980 },
      { name: 'Product E', value: 720 },
    ],
    regionalPerformance: [
      { name: 'North', revenue: 4200, growth: 12 },
      { name: 'South', revenue: 3800, growth: 8 },
      { name: 'East', revenue: 2450, growth: 15 },
      { name: 'West', revenue: 2000, growth: 5 },
    ],
    conversionFunnel: [
      { name: 'Visitors', value: 12000 },
      { name: 'Leads', value: 4200 },
      { name: 'Trials', value: 1800 },
      { name: 'Customers', value: 892 },
    ],
    customerAcquisition: [
      { name: 'Mon', new: 45, returning: 120 },
      { name: 'Tue', new: 62, returning: 145 },
      { name: 'Wed', new: 38, returning: 110 },
      { name: 'Thu', new: 71, returning: 165 },
      { name: 'Fri', new: 55, returning: 130 },
      { name: 'Sat', new: 42, returning: 95 },
      { name: 'Sun', new: 35, returning: 88 },
    ],
    revenueByChannel: [
      { name: 'Direct', value: 4200 },
      { name: 'Organic', value: 3100 },
      { name: 'Paid', value: 2800 },
      { name: 'Referral', value: 1350 },
      { name: 'Email', value: 1000 },
    ],
  },
  '30d': {
    revenue: '$45,232',
    revenueChange: '+20.1% from last month',
    users: '2,350',
    usersChange: '+180.1% from last month',
    sales: '12,234',
    salesChange: '+19% from last month',
    conversion: '3.2%',
    conversionChange: '+4.1% from last month',
    revenueTrend: [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 300 },
      { name: 'Mar', value: 600 },
      { name: 'Apr', value: 800 },
      { name: 'May', value: 500 },
    ],
    revenueByCategory: [
      { name: 'Software', value: 15200 },
      { name: 'Hardware', value: 13800 },
      { name: 'Services', value: 9231 },
      { name: 'Support', value: 7000 },
    ],
    salesOverTime: [
      { name: 'W1', sales: 1200, orders: 280 },
      { name: 'W2', sales: 1450, orders: 320 },
      { name: 'W3', sales: 1100, orders: 260 },
      { name: 'W4', sales: 1680, orders: 380 },
      { name: 'W5', sales: 1320, orders: 295 },
    ],
    revenueVsTarget: [
      { name: 'Jan', revenue: 400, target: 450 },
      { name: 'Feb', revenue: 300, target: 420 },
      { name: 'Mar', revenue: 600, target: 480 },
      { name: 'Apr', revenue: 800, target: 520 },
      { name: 'May', revenue: 500, target: 550 },
    ],
    topProducts: [
      { name: 'Product A', value: 8200 },
      { name: 'Product B', value: 7100 },
      { name: 'Product C', value: 5800 },
      { name: 'Product D', value: 4200 },
      { name: 'Product E', value: 3100 },
    ],
    regionalPerformance: [
      { name: 'North', revenue: 15200, growth: 18 },
      { name: 'South', revenue: 13800, growth: 12 },
      { name: 'East', revenue: 9231, growth: 22 },
      { name: 'West', revenue: 7000, growth: 8 },
    ],
    conversionFunnel: [
      { name: 'Visitors', value: 45000 },
      { name: 'Leads', value: 15800 },
      { name: 'Trials', value: 6800 },
      { name: 'Customers', value: 2350 },
    ],
    customerAcquisition: [
      { name: 'W1', new: 180, returning: 420 },
      { name: 'W2', new: 220, returning: 510 },
      { name: 'W3', new: 165, returning: 380 },
      { name: 'W4', new: 280, returning: 620 },
      { name: 'W5', new: 195, returning: 430 },
    ],
    revenueByChannel: [
      { name: 'Direct', value: 15200 },
      { name: 'Organic', value: 11200 },
      { name: 'Paid', value: 9800 },
      { name: 'Referral', value: 5800 },
      { name: 'Email', value: 3231 },
    ],
  },
  '90d': {
    revenue: '$128,450',
    revenueChange: '+15.3% from previous quarter',
    users: '5,892',
    usersChange: '+22.1% from previous quarter',
    sales: '34,521',
    salesChange: '+18.7% from previous quarter',
    conversion: '3.8%',
    conversionChange: '+0.6% from previous quarter',
    revenueTrend: [
      { name: 'Week 1', value: 1200 },
      { name: 'Week 2', value: 1800 },
      { name: 'Week 3', value: 1500 },
      { name: 'Week 4', value: 2200 },
      { name: 'Week 5', value: 1900 },
      { name: 'Week 6', value: 2400 },
    ],
    revenueByCategory: [
      { name: 'Software', value: 45200 },
      { name: 'Hardware', value: 39800 },
      { name: 'Services', value: 26450 },
      { name: 'Support', value: 17000 },
    ],
    salesOverTime: [
      { name: 'M1', sales: 4200, orders: 920 },
      { name: 'M2', sales: 3800, orders: 850 },
      { name: 'M3', sales: 5100, orders: 1100 },
      { name: 'M4', sales: 4800, orders: 1050 },
      { name: 'M5', sales: 5200, orders: 1150 },
      { name: 'M6', sales: 5600, orders: 1220 },
    ],
    revenueVsTarget: [
      { name: 'M1', revenue: 1200, target: 1100 },
      { name: 'M2', revenue: 1800, target: 1500 },
      { name: 'M3', revenue: 1500, target: 1600 },
      { name: 'M4', revenue: 2200, target: 1900 },
      { name: 'M5', revenue: 1900, target: 2000 },
      { name: 'M6', revenue: 2400, target: 2100 },
    ],
    topProducts: [
      { name: 'Product A', value: 24200 },
      { name: 'Product B', value: 21100 },
      { name: 'Product C', value: 16800 },
      { name: 'Product D', value: 12200 },
      { name: 'Product E', value: 9100 },
    ],
    regionalPerformance: [
      { name: 'North', revenue: 45200, growth: 18 },
      { name: 'South', revenue: 39800, growth: 14 },
      { name: 'East', revenue: 26450, growth: 24 },
      { name: 'West', revenue: 17000, growth: 10 },
    ],
    conversionFunnel: [
      { name: 'Visitors', value: 125000 },
      { name: 'Leads', value: 42000 },
      { name: 'Trials', value: 18500 },
      { name: 'Customers', value: 5892 },
    ],
    customerAcquisition: [
      { name: 'M1', new: 520, returning: 1250 },
      { name: 'M2', new: 680, returning: 1420 },
      { name: 'M3', new: 550, returning: 1180 },
      { name: 'M4', new: 720, returning: 1580 },
      { name: 'M5', new: 610, returning: 1320 },
      { name: 'M6', new: 810, returning: 1680 },
    ],
    revenueByChannel: [
      { name: 'Direct', value: 45200 },
      { name: 'Organic', value: 32200 },
      { name: 'Paid', value: 28800 },
      { name: 'Referral', value: 13500 },
      { name: 'Email', value: 8750 },
    ],
  },
};
