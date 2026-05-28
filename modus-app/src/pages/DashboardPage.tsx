import { useMemo, useState, type ReactElement } from 'react';
import {
  ModusWcTypography,
  ModusWcCard,
  ModusWcIcon,
  ModusWcSelect,
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
  type PeriodId,
  PERIOD_OPTIONS,
  PERIOD_DATA,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_HEIGHT_PX,
  CHART_INITIAL_WIDTH_PX,
  createTooltipFormatter,
} from './dashboardAnalyticsData';

function ChartFrame({ children }: { children: ReactElement }) {
  return (
    <div
      className="analytics-dashboard-chart min-h-0 w-full min-w-0 pt-2"
      style={{ height: CHART_HEIGHT_PX }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: CHART_INITIAL_WIDTH_PX, height: CHART_HEIGHT_PX }}
        minWidth={0}
        minHeight={CHART_HEIGHT_PX}
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
}: {
  title: string;
  value: string;
  change: string;
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
        customClass="text-[var(--modus-wc-color-base-content)] !text-3xl"
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

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodId>('30d');

  const data = useMemo(() => PERIOD_DATA[period], [period]);

  const formatters = useMemo(
    () => ({
      currency: createTooltipFormatter({ value: 'currency' }),
      salesOrders: createTooltipFormatter({ sales: 'number', orders: 'number' }),
      revenueTarget: createTooltipFormatter({ revenue: 'currency', target: 'currency' }),
      revenueGrowth: createTooltipFormatter({ revenue: 'currency', growth: 'percent' }),
      number: createTooltipFormatter({ value: 'number' }),
      newReturning: createTooltipFormatter({ new: 'number', returning: 'number' }),
    }),
    [],
  );

  const chartMargin = useMemo(() => ({ left: 0, right: 8, top: 5, bottom: 5 }), []);

  return (
    <div className="analytics-dashboard-wrapper w-full min-w-0" data-analytics-dashboard>
      <div className="analytics-dashboard-header mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <ModusWcIcon
            name="dashboard"
            size="md"
            customClass="text-[var(--modus-wc-color-base-content)]"
            decorative
          />
          <ModusWcTypography
            hierarchy="h1"
            size="3xl"
            weight="light"
            label="Analytics Dashboard"
          />
        </div>
        <ModusWcSelect
          size="sm"
          options={PERIOD_OPTIONS}
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

      <div className="analytics-dashboard-stats-scroll my-3 -mx-1 overflow-x-auto overflow-y-hidden px-1">
        <div className="analytics-dashboard-stats-grid grid min-w-0 grid-cols-4 gap-3">
          <StatCard title="Total Revenue" value={data.revenue} change={data.revenueChange} />
          <StatCard title="Active Users" value={data.users} change={data.usersChange} />
          <StatCard title="Sales" value={data.sales} change={data.salesChange} />
          <StatCard
            title="Conversion Rate"
            value={data.conversion}
            change={data.conversionChange}
          />
        </div>
      </div>

      <div className="analytics-dashboard-charts-grid grid min-w-0 grid-cols-1 gap-3 [&>*]:min-w-0">
        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Revenue Trend"
          />
          <ChartFrame>
            <BarChart data={data.revenueTrend} margin={chartMargin}>
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
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.currency} />
              <Bar
                dataKey="value"
                fill="var(--modus-wc-color-primary)"
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
            label="Revenue by Category"
          />
          <ChartFrame>
            <PieChart>
              <Pie
                data={data.revenueByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                stroke="var(--modus-wc-color-base-100)"
              >
                {data.revenueByCategory.map((_, i) => (
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
            label="Sales Over Time"
          />
          <ChartFrame>
            <LineChart data={data.salesOverTime} margin={chartMargin}>
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
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.salesOrders} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="var(--modus-wc-color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                name="Sales"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--modus-wc-color-warning)"
                strokeWidth={2}
                dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                name="Orders"
                isAnimationActive={false}
              />
            </LineChart>
          </ChartFrame>
        </ModusWcCard>

        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Revenue vs Target"
          />
          <ChartFrame>
            <AreaChart data={data.revenueVsTarget} margin={chartMargin}>
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
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.revenueTarget} />
              <Area
                type="monotone"
                dataKey="revenue"
                fill="var(--modus-wc-color-primary)"
                fillOpacity={0.6}
                stroke="var(--modus-wc-color-primary)"
                dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                name="Revenue"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="target"
                fill="var(--modus-wc-color-base-200)"
                fillOpacity={0.4}
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                name="Target"
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartFrame>
        </ModusWcCard>

        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Top Products"
          />
          <ChartFrame>
            <BarChart data={data.topProducts} layout="vertical" margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--modus-wc-color-base-200)" />
              <XAxis
                type="number"
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--modus-wc-color-base-content-low-contrast)"
                tick={{ fontSize: 11 }}
                width={50}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.currency} />
              <Bar
                dataKey="value"
                fill="var(--modus-wc-color-warning)"
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
            label="Regional Performance"
          />
          <ChartFrame>
            <BarChart data={data.regionalPerformance} margin={chartMargin}>
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
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.revenueGrowth} />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="var(--modus-wc-color-primary)"
                name="Revenue"
                isAnimationActive={false}
              />
              <Bar
                dataKey="growth"
                fill="var(--modus-wc-color-success)"
                name="Growth %"
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
            label="Conversion Funnel"
          />
          <ChartFrame>
            <BarChart data={data.conversionFunnel} margin={chartMargin}>
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
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.number} />
              <Bar
                dataKey="value"
                fill="var(--modus-wc-color-error)"
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
            label="Customer Acquisition"
          />
          <ChartFrame>
            <AreaChart data={data.customerAcquisition} margin={chartMargin}>
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
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.newReturning} />
              <Legend />
              <Area
                type="monotone"
                dataKey="new"
                stackId="1"
                fill="var(--modus-wc-color-primary)"
                fillOpacity={0.7}
                stroke="var(--modus-wc-color-primary)"
                dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                name="New"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="returning"
                stackId="1"
                fill="var(--modus-wc-color-warning)"
                fillOpacity={0.7}
                stroke="var(--modus-wc-color-warning)"
                dot={{ fill: 'var(--modus-wc-color-base-100)' }}
                name="Returning"
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartFrame>
        </ModusWcCard>

        <ModusWcCard bordered padding="compact">
          <ModusWcTypography
            slot="title"
            hierarchy="h4"
            size="sm"
            weight="semibold"
            label="Revenue by Channel"
          />
          <ChartFrame>
            <PieChart>
              <Pie
                data={data.revenueByChannel}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                stroke="var(--modus-wc-color-base-100)"
              >
                {data.revenueByChannel.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={formatters.currency} />
            </PieChart>
          </ChartFrame>
        </ModusWcCard>
      </div>
    </div>
  );
}
