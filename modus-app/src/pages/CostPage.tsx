import { useMemo, useState, type ReactElement } from 'react';
import {
  ModusWcTypography,
  ModusWcCard,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTable,
  ModusWcTabs,
} from '@trimble-oss/moduswebcomponents-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  createTooltipFormatter,
} from './dashboardAnalyticsData';
import {
  type FinancialPeriodId,
  FINANCIAL_PERIOD_OPTIONS,
  FINANCIAL_OVERVIEW_TABS,
  PERIOD_DATA,
  transactionColumns,
  FINANCIAL_CHART_HEIGHT_PX,
  FINANCIAL_OVERVIEW_CHART_HEIGHT_PX,
  FINANCIAL_CHART_INITIAL_WIDTH_PX,
} from './financialDashboardData';

function ChartFrame({
  heightPx,
  initialWidthPx = FINANCIAL_CHART_INITIAL_WIDTH_PX,
  children,
}: {
  heightPx: number;
  initialWidthPx?: number;
  children: ReactElement;
}) {
  return (
    <div
      className="financial-dashboard-chart min-h-0 w-full min-w-0 pt-2"
      style={{ height: heightPx }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: initialWidthPx, height: heightPx }}
        minWidth={0}
        minHeight={heightPx}
        debounce={150}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  valueClassName,
}: {
  title: string;
  value: string;
  change: string;
  valueClassName?: string;
}) {
  return (
    <ModusWcCard bordered padding="compact">
      <ModusWcTypography
        slot="title"
        hierarchy="h4"
        size="sm"
        weight="semibold"
        label={title}
      />
      <ModusWcTypography
        hierarchy="p"
        size="3xl"
        weight="light"
        label={value}
        customClass={
          valueClassName ?? 'text-[var(--modus-wc-color-base-content)] !text-3xl'
        }
      />
      <div slot="footer">
        <ModusWcTypography
          hierarchy="p"
          size="xs"
          customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
          label={change}
        />
      </div>
    </ModusWcCard>
  );
}

export function CostPage() {
  const [period, setPeriod] = useState<FinancialPeriodId>('30d');
  const [overviewTabIndex, setOverviewTabIndex] = useState(0);

  const data = useMemo(() => PERIOD_DATA[period], [period]);

  const formatters = useMemo(
    () => ({
      currency: createTooltipFormatter({ value: 'currency' }),
      inflowOutflow: createTooltipFormatter({ inflow: 'currency', outflow: 'currency' }),
      revenueExpense: createTooltipFormatter({ revenue: 'currency', expense: 'currency' }),
    }),
    [],
  );

  const revenueVsExpenseData = useMemo(
    () =>
      data.revenueTrend.map((r, i) => ({
        name: r.name,
        revenue: r.value,
        expense: data.expenseTrend[i]?.value ?? 0,
      })),
    [data.revenueTrend, data.expenseTrend],
  );

  const chartMargin = useMemo(() => ({ left: 0, right: 8, top: 5, bottom: 5 }), []);
  const showRevenueOverview = overviewTabIndex === 0;

  return (
    <div className="financial-dashboard-wrapper w-full min-w-0" data-financial-dashboard>
      <div className="financial-dashboard-header mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <ModusWcIcon
            name="costs"
            size="md"
            customClass="text-[var(--modus-wc-color-base-content)]"
            decorative
          />
          <ModusWcTypography
            hierarchy="h1"
            size="3xl"
            weight="light"
            label="Financial Dashboard"
          />
        </div>
        <ModusWcSelect
          size="sm"
          options={FINANCIAL_PERIOD_OPTIONS}
          value={period}
          onInputChange={(e: CustomEvent) => {
            const val = e.detail?.target?.value ?? '';
            if (val === '7d' || val === '30d' || val === '90d') {
              setPeriod(val);
            }
          }}
          customClass="min-w-[140px]"
        />
      </div>

      <div className="financial-dashboard-stats-scroll my-3 -mx-1 overflow-x-auto overflow-y-hidden px-1">
        <div className="financial-dashboard-stats-grid grid min-w-0 grid-cols-4 gap-3">
          <StatCard title="Revenue" value={data.revenue} change={data.revenueChange} />
          <StatCard title="Expenses" value={data.expenses} change={data.expensesChange} />
          <StatCard title="Cash Flow" value={data.cashFlow} change={data.cashFlowChange} />
          <StatCard
            title="Net Profit"
            value={data.netProfit}
            change={data.netProfitChange}
            valueClassName="text-[var(--modus-wc-color-success)] !text-3xl"
          />
        </div>
      </div>

      <div className="financial-dashboard-revenue-section mb-3">
        <ModusWcCard bordered padding="compact">
          <div slot="title" className="w-full min-w-0">
            <ModusWcTabs
              tabs={FINANCIAL_OVERVIEW_TABS}
              activeTabIndex={overviewTabIndex}
              onTabChange={(e: CustomEvent<{ previousTab: number; newTab: number }>) => {
                setOverviewTabIndex(e.detail?.newTab ?? 0);
              }}
              tabStyle="boxed"
              customClass="w-full"
            />
          </div>
          <div
            hidden={!showRevenueOverview}
            aria-hidden={!showRevenueOverview}
            className="min-h-0 w-full min-w-0"
          >
            <ChartFrame heightPx={FINANCIAL_OVERVIEW_CHART_HEIGHT_PX}>
              <AreaChart data={data.revenueTrend} margin={chartMargin}>
                <defs>
                  <linearGradient id="financialRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--modus-wc-color-primary)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--modus-wc-color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--modus-wc-color-base-200)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--modus-wc-color-base-content-low-contrast)"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  width={40}
                  stroke="var(--modus-wc-color-base-content-low-contrast)"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.currency} />
                <Area
                  type="monotone"
                  dataKey="value"
                  fill="url(#financialRevenueGradient)"
                  stroke="var(--modus-wc-color-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                  name="Revenue"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartFrame>
          </div>
          <div
            hidden={showRevenueOverview}
            aria-hidden={showRevenueOverview}
            className="min-h-0 w-full min-w-0"
          >
            <ChartFrame heightPx={FINANCIAL_OVERVIEW_CHART_HEIGHT_PX}>
              <LineChart data={data.cashFlowTrend} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--modus-wc-color-base-200)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--modus-wc-color-base-content-low-contrast)"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  width={40}
                  stroke="var(--modus-wc-color-base-content-low-contrast)"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.inflowOutflow} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inflow"
                  stroke="var(--modus-wc-color-success)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                  name="Inflow"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="outflow"
                  stroke="var(--modus-wc-color-error)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                  name="Outflow"
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartFrame>
          </div>
        </ModusWcCard>
      </div>

      <div className="financial-dashboard-transactions mb-3">
        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Recent Transactions"
            customClass="mb-4"
          />
          <div className="data-table-scroll-wrapper min-w-0 w-full overflow-x-auto">
            <ModusWcTable
              columns={transactionColumns}
              data={data.transactions as Record<string, unknown>[]}
              sortable={false}
              hover
              paginated={false}
              zebra
              customClass="w-full"
            />
          </div>
        </ModusWcCard>
      </div>

      <div className="financial-dashboard-charts-grid grid min-w-0 grid-cols-1 gap-3 [&>*]:min-w-0">
        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Expense Breakdown"
          />
          <ChartFrame heightPx={FINANCIAL_CHART_HEIGHT_PX}>
            <PieChart>
              <Pie
                data={data.expenseBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                stroke="var(--modus-wc-color-base-100)"
              >
                {data.expenseBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.currency} />
            </PieChart>
          </ChartFrame>
        </ModusWcCard>

        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Profit by Category"
          />
          <ChartFrame heightPx={FINANCIAL_CHART_HEIGHT_PX}>
            <BarChart data={data.profitByCategory} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--modus-wc-color-base-200)" />
              <XAxis
                dataKey="name"
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                width={32}
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                tick={{ fontSize: 11 }}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.currency} />
              <Bar
                dataKey="value"
                fill="var(--modus-wc-color-success)"
                isAnimationActive={false}
              />
            </BarChart>
          </ChartFrame>
        </ModusWcCard>

        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Revenue vs Expenses"
          />
          <ChartFrame heightPx={FINANCIAL_CHART_HEIGHT_PX}>
            <BarChart data={revenueVsExpenseData} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--modus-wc-color-base-200)" />
              <XAxis
                dataKey="name"
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                width={32}
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                tick={{ fontSize: 11 }}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.revenueExpense} />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="var(--modus-wc-color-primary)"
                name="Revenue"
                isAnimationActive={false}
              />
              <Bar
                dataKey="expense"
                fill="var(--modus-wc-color-error)"
                name="Expenses"
                isAnimationActive={false}
              />
            </BarChart>
          </ChartFrame>
        </ModusWcCard>
      </div>
    </div>
  );
}
