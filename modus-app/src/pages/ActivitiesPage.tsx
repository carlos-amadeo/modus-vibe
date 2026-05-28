import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ModusWcBadge,
  ModusWcBreadcrumbs,
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcTypography,
  ModusWcUtilityPanel,
} from '@trimble-oss/moduswebcomponents-react';

type Health = 'healthy' | 'watch' | 'at_risk';

const HEALTH_META: Record<
  Health,
  { label: string; tone: 'success' | 'warning' | 'danger'; icon: string }
> = {
  healthy: { label: 'Healthy', tone: 'success', icon: 'check_circle' },
  watch: { label: 'Watch', tone: 'warning', icon: 'alert' },
  at_risk: { label: 'At risk', tone: 'danger', icon: 'alert_outlined' },
};

type Direction = 'higher_is_better' | 'lower_is_better';

type KpiSpec = {
  id: string;
  icon: string;
  label: string;
  value: number;
  unit: '%' | '';
  target: number;
  warn: number;
  direction: Direction;
  context: string;
};

function computeHealth(spec: KpiSpec): Health {
  const { value, target, warn, direction } = spec;
  if (direction === 'higher_is_better') {
    if (value >= target) return 'healthy';
    if (value >= warn) return 'watch';
    return 'at_risk';
  }
  if (value <= target) return 'healthy';
  if (value <= warn) return 'watch';
  return 'at_risk';
}

function formatKpi(spec: KpiSpec): string {
  return spec.unit === '%' ? `${spec.value.toFixed(1)}%` : `${spec.value}`;
}

const KPIS: KpiSpec[] = [
  {
    id: 'sla',
    icon: 'clock',
    label: 'SLA hit rate',
    value: 97.2,
    unit: '%',
    target: 95,
    warn: 90,
    direction: 'higher_is_better',
    context: 'Rolling 30 days',
  },
  {
    id: 'backlog',
    icon: 'view_list',
    label: 'Queue aging',
    value: 1.4,
    unit: '',
    target: 2,
    warn: 4,
    direction: 'lower_is_better',
    context: 'Median days open',
  },
  {
    id: 'quality',
    icon: 'shield',
    label: 'First-pass quality',
    value: 92,
    unit: '%',
    target: 90,
    warn: 85,
    direction: 'higher_is_better',
    context: 'Last pay period',
  },
  {
    id: 'volume',
    icon: 'bar_graph',
    label: 'Throughput',
    value: 148,
    unit: '',
    target: 120,
    warn: 100,
    direction: 'higher_is_better',
    context: 'Cases closed / week',
  },
];

type AttentionItem = {
  id: string;
  icon: string;
  tone: 'warning' | 'danger' | 'secondary' | 'tertiary';
  title: string;
  subtitle: string;
  count: number;
};

const ATTENTION: AttentionItem[] = [
  {
    id: 'escalations',
    icon: 'alert',
    tone: 'warning',
    title: 'Approvals past due',
    subtitle: 'Waiting on manager sign-off beyond policy window',
    count: 4,
  },
  {
    id: 'integrations',
    icon: 'key_api',
    tone: 'warning',
    title: 'Integration retries',
    subtitle: 'HRIS webhook backlog — auto-retry scheduled',
    count: 2,
  },
];

type AuditRow = {
  id: string;
  action: string;
  category: string;
  actor: string;
  target: string;
  timestamp: string;
  automated?: boolean;
};

const RECENT_ACTIVITY: AuditRow[] = [
  {
    id: 'a1',
    action: 'Case #4821 reassigned to Tier 2',
    category: 'Workflow',
    actor: 'Jordan Lee',
    target: 'Support queue',
    timestamp: '2026-04-29 14:02Z',
  },
  {
    id: 'a2',
    action: 'Bulk export generated — Regional roster',
    category: 'Export',
    actor: 'System',
    target: 'Reports',
    timestamp: '2026-04-29 13:41Z',
    automated: true,
  },
  {
    id: 'a3',
    action: 'Policy acknowledgement recorded',
    category: 'Compliance',
    actor: 'Sam Rivera',
    target: 'Employee profile',
    timestamp: '2026-04-29 11:18Z',
  },
  {
    id: 'a4',
    action: 'Webhook delivery succeeded after retry',
    category: 'Integration',
    actor: 'API',
    target: 'Acme HRIS',
    timestamp: '2026-04-29 09:55Z',
    automated: true,
  },
];

function categoryTone(
  cat: string,
): 'secondary' | 'success' | 'warning' | 'tertiary' {
  if (cat === 'Compliance') return 'success';
  if (cat === 'Workflow') return 'warning';
  if (cat === 'Export') return 'secondary';
  return 'tertiary';
}

function useViewportMatchesMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function HeroKpi({ spec }: { spec: KpiSpec }) {
  const health = computeHealth(spec);
  const meta = HEALTH_META[health];
  return (
    <ModusWcCard
      bordered
      padding="compact"
      customClass="box-border flex h-full min-h-0 w-full min-w-0 flex-col"
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--modus-wc-color-primary)_14%,transparent)]">
            <ModusWcIcon
              name={spec.icon}
              decorative
              size="sm"
              customClass="!text-[color:var(--modus-wc-color-primary)]"
            />
          </span>
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            weight="semibold"
            customClass="!m-0 uppercase tracking-wide text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={spec.label}
          />
        </div>
        <div className="flex-1 min-h-0" aria-hidden />
        <div className="flex flex-wrap items-center gap-1.5">
          <ModusWcTypography
            hierarchy="p"
            size="2xl"
            weight="bold"
            customClass="!m-0 text-[var(--modus-wc-color-base-content)]"
            label={formatKpi(spec)}
          />
          <ModusWcBadge color={meta.tone} size="sm">
            {meta.label}
          </ModusWcBadge>
        </div>
        <ModusWcTypography
          hierarchy="p"
          size="xs"
          customClass="!m-0 leading-snug text-[var(--modus-wc-color-base-content-low-contrast)]"
          label={`Target ${spec.direction === 'higher_is_better' ? `≥${spec.target}` : `≤${spec.target}`}${spec.unit} · ${spec.context}`}
        />
      </div>
    </ModusWcCard>
  );
}

function AttentionRow({
  item,
  narrow,
}: {
  item: AttentionItem;
  narrow: boolean;
}) {
  const dotColor =
    item.tone === 'danger'
      ? 'var(--modus-wc-color-error)'
      : item.tone === 'warning'
        ? 'var(--modus-wc-color-warning)'
        : item.tone === 'secondary'
          ? 'var(--modus-wc-color-secondary)'
          : 'var(--modus-wc-color-base-content-low-contrast)';
  const openButton = (
    <ModusWcButton
      color="primary"
      variant="borderless"
      size="sm"
      aria-label={`Open ${item.title}`}
    >
      Open
    </ModusWcButton>
  );
  const iconAndBody = (
    <>
      <span
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: `color-mix(in srgb, ${dotColor} 14%, transparent)`,
        }}
      >
        <ModusWcIcon
          name={item.icon}
          decorative
          size="md"
          customClass={`!text-[color:${dotColor}]`}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <ModusWcTypography
            hierarchy="h4"
            size="sm"
            weight="semibold"
            customClass={
              narrow
                ? '!m-0 min-w-0 break-words'
                : '!m-0 min-w-0 flex-1 truncate'
            }
            label={item.title}
          />
          <ModusWcBadge color={item.tone} size="sm" customClass="!shrink-0">
            {item.count}
          </ModusWcBadge>
        </div>
        <ModusWcTypography
          hierarchy="p"
          size="xs"
          customClass={
            narrow
              ? '!m-0 break-words text-[var(--modus-wc-color-base-content-low-contrast)]'
              : '!m-0 truncate text-[var(--modus-wc-color-base-content-low-contrast)]'
          }
          label={item.subtitle}
        />
      </div>
    </>
  );
  return (
    <ModusWcCard bordered customClass="w-full">
      {narrow ? (
        <div className="flex flex-col gap-3 p-1">
          <div className="flex min-w-0 items-start gap-3">{iconAndBody}</div>
          <div className="flex justify-end">{openButton}</div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-1">
          {iconAndBody}
          {openButton}
        </div>
      )}
    </ModusWcCard>
  );
}

function ActivityRow({ row }: { row: AuditRow }) {
  const warning = 'var(--modus-wc-color-warning)';
  return (
    <ModusWcCard bordered customClass="w-full">
      <div className="flex items-start gap-3 p-1">
        {row.automated ? (
          <span
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `color-mix(in srgb, ${warning} 14%, transparent)`,
            }}
          >
            <ModusWcIcon
              name="key_api"
              decorative
              size="md"
              customClass={`!text-[color:${warning}]`}
            />
          </span>
        ) : (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--modus-wc-color-base-200)]">
            <ModusWcIcon
              name="person"
              decorative
              size="md"
              customClass="!text-[color:var(--modus-wc-color-base-content-low-contrast)]"
            />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              customClass="!m-0 min-w-0 flex-1 basis-full line-clamp-2 sm:basis-0"
              label={row.action}
            />
            <ModusWcBadge
              color={categoryTone(row.category)}
              size="sm"
              customClass="!shrink-0"
            >
              {row.category}
            </ModusWcBadge>
          </div>
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={`${row.actor} · ${row.target} · ${row.timestamp.replace('T', ' ').replace('Z', '')}`}
          />
        </div>
      </div>
    </ModusWcCard>
  );
}

function AtAGlanceRow({
  label,
  value,
  tone = 'tertiary',
  help,
}: {
  label: string;
  value: string;
  tone?: 'tertiary' | 'success' | 'warning' | 'danger' | 'secondary';
  help?: string;
}) {
  const dotColor =
    tone === 'danger'
      ? 'var(--modus-wc-color-error)'
      : tone === 'warning'
        ? 'var(--modus-wc-color-warning)'
        : tone === 'success'
          ? 'var(--modus-wc-color-success)'
          : tone === 'secondary'
            ? 'var(--modus-wc-color-secondary)'
            : 'var(--modus-wc-color-base-content-low-contrast)';
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--modus-wc-color-base-200)] py-2.5 last:border-b-0">
      <div className="min-w-0">
        <ModusWcTypography
          hierarchy="p"
          size="sm"
          weight="semibold"
          customClass="!m-0"
          label={label}
        />
        {help ? (
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={help}
          />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: dotColor }}
        />
        <ModusWcTypography
          hierarchy="p"
          size="sm"
          weight="semibold"
          customClass="!m-0 font-mono"
          label={value}
        />
      </div>
    </div>
  );
}

function StatusBanner({
  summary,
  subtext,
  status,
  attentionCount,
  onReview,
  tight,
}: {
  summary: string;
  subtext: string;
  status: Health;
  attentionCount: number;
  onReview: () => void;
  tight: boolean;
}) {
  const meta = HEALTH_META[status];
  const bg =
    status === 'healthy'
      ? 'color-mix(in srgb, var(--modus-wc-color-success) 12%, transparent)'
      : status === 'watch'
        ? 'color-mix(in srgb, var(--modus-wc-color-warning) 14%, transparent)'
        : 'color-mix(in srgb, var(--modus-wc-color-error) 14%, transparent)';
  const accent =
    status === 'healthy'
      ? 'var(--modus-wc-color-success)'
      : status === 'watch'
        ? 'var(--modus-wc-color-warning)'
        : 'var(--modus-wc-color-error)';
  const contentColor =
    status === 'healthy'
      ? 'var(--modus-wc-color-success-content)'
      : status === 'watch'
        ? 'var(--modus-wc-color-warning-content)'
        : 'var(--modus-wc-color-error-content)';
  const ctaColor: 'primary' | 'danger' | 'warning' =
    status === 'at_risk' ? 'danger' : status === 'watch' ? 'warning' : 'primary';
  return (
    <div
      role="status"
      className={`flex border p-4 ${tight ? 'flex-col gap-4' : 'flex-row flex-wrap items-center gap-4'}`}
      style={{
        background: bg,
        borderColor: accent,
        borderRadius: 'var(--modus-wc-border-radius-box, 1rem)',
      }}
    >
      <div
        className={`flex min-w-0 flex-1 gap-4 ${tight ? 'items-start' : 'items-center'}`}
      >
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: accent, color: contentColor }}
        >
          <ModusWcIcon name={meta.icon} decorative size="md" />
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            weight="semibold"
            customClass="!m-0 uppercase tracking-wide text-[var(--modus-wc-color-base-content-low-contrast)]"
            label="System status"
          />
          <ModusWcTypography
            hierarchy="h2"
            size="xl"
            weight="semibold"
            customClass="!m-0 break-words"
            label={summary}
          />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="!m-0 mt-1 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={subtext}
          />
        </div>
      </div>
      <div
        className={`flex gap-2 ${tight ? 'w-full flex-col' : 'shrink-0 flex-wrap justify-end'}`}
      >
        {attentionCount > 0 ? (
          <ModusWcButton
            color={ctaColor}
            fullWidth={tight}
            onButtonClick={onReview}
            aria-label={`Review ${attentionCount} items that need attention`}
          >
            <ModusWcIcon name="clipboard_actions" decorative />
            Review {attentionCount} items
          </ModusWcButton>
        ) : (
          <ModusWcBadge color={meta.tone} size="md">
            {meta.label}
          </ModusWcBadge>
        )}
      </div>
    </div>
  );
}

function AttentionPanel({
  open,
  items,
  onClose,
}: {
  open: boolean;
  items: AttentionItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const totalCount = items.reduce((sum, a) => sum + a.count, 0);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1000] ${open ? 'visible' : 'invisible'}`}
      aria-hidden={!open}
    >
      {open ? (
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="pointer-events-auto absolute inset-0 bg-black/30"
        />
      ) : null}
      <ModusWcUtilityPanel
        expanded={open}
        pushContent={false}
        onPanelClosed={onClose}
        customClass="pointer-events-auto"
      >
        <div
          slot="header"
          className="flex w-full items-center justify-between gap-3 border-b border-[var(--modus-wc-color-base-200)] p-4"
        >
          <ModusWcTypography
            hierarchy="h2"
            size="xl"
            weight="semibold"
            customClass="!m-0"
            label="Action queue"
          />
          <ModusWcButton
            color="tertiary"
            variant="borderless"
            shape="square"
            size="sm"
            onButtonClick={onClose}
            aria-label="Close panel"
          >
            <ModusWcIcon name="close" decorative size="sm" />
          </ModusWcButton>
        </div>
        <div slot="body" className="flex flex-col gap-3 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ModusWcIcon
                name="check_circle"
                decorative
                size="lg"
                customClass="!text-[color:var(--modus-wc-color-success)]"
              />
              <ModusWcTypography
                hierarchy="p"
                size="md"
                weight="semibold"
                customClass="!m-0"
                label="All clear"
              />
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                label="Nothing needs attention right now."
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <ModusWcTypography
                  hierarchy="h3"
                  size="lg"
                  weight="semibold"
                  customClass="!m-0"
                  label="Items needing attention"
                />
                <ModusWcTypography
                  hierarchy="p"
                  size="xs"
                  customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                  label={`${items.length} categories · ${totalCount} total items`}
                />
              </div>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <ModusWcCard bordered key={item.id} customClass="w-full">
                    <div className="flex flex-col gap-2 p-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <ModusWcTypography
                          hierarchy="h4"
                          size="sm"
                          weight="semibold"
                          customClass="!m-0 min-w-0 flex-1"
                          label={item.title}
                        />
                        <ModusWcBadge color={item.tone} size="sm">
                          {item.count}
                        </ModusWcBadge>
                      </div>
                      <ModusWcTypography
                        hierarchy="p"
                        size="xs"
                        customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                        label={item.subtitle}
                      />
                      <div className="flex justify-end">
                        <ModusWcButton color="primary" variant="borderless" size="sm">
                          Open{' '}
                          <ModusWcIcon name="chevron_right" decorative size="sm" />
                        </ModusWcButton>
                      </div>
                    </div>
                  </ModusWcCard>
                ))}
              </div>
            </>
          )}
        </div>
      </ModusWcUtilityPanel>
    </div>
  );
}

export function ActivitiesPage({ onNavigateHome }: { onNavigateHome?: () => void }) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const narrow = useViewportMatchesMedia('(max-width: 767px)');
  const mainSplit = useViewportMatchesMedia('(min-width: 1024px)');
  const tight = narrow;
  const [reviewOpen, setReviewOpen] = useState(false);

  const overall = useMemo(() => {
    const kpiWorst = KPIS.map(computeHealth).reduce<Health>((acc, h) => {
      if (acc === 'at_risk' || h === 'at_risk') return 'at_risk';
      if (acc === 'watch' || h === 'watch') return 'watch';
      return 'healthy';
    }, 'healthy');
    const attentionTotal = ATTENTION.reduce((s, a) => s + a.count, 0);
    const status: Health =
      attentionTotal > 0
        ? 'watch'
        : kpiWorst === 'healthy'
          ? 'healthy'
          : kpiWorst;
    return {
      status,
      summary:
        attentionTotal === 0
          ? 'All workflows are within targets'
          : `${attentionTotal} items need attention`,
      subtext:
        attentionTotal === 0
          ? 'Queues, integrations, and SLAs are green.'
          : 'Prioritize approvals and integration retries.',
    };
  }, []);

  return (
    <div
      data-activity-dashboard
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto"
    >
      <div className="relative isolate min-h-0 w-full min-w-0 overflow-hidden">
        <div
          ref={measureRef}
          className="mx-auto flex w-full max-w-7xl min-w-0 flex-col overflow-x-hidden"
        >
          <ModusWcBreadcrumbs
            size="sm"
            items={[
              { label: 'Home', url: '#' },
              { label: 'Activities' },
            ]}
            customClass="pb-2"
            onBreadcrumbClick={(e: CustomEvent<{ label: string }>) => {
              if (e.detail?.label === 'Home') onNavigateHome?.();
            }}
          />
          <header className="border-b border-[var(--modus-wc-color-base-200)] bg-[var(--modus-wc-color-base-page)] py-4 sm:py-5">
            <div
              className={`grid w-full min-w-0 items-start gap-4 ${
                narrow
                  ? 'grid-cols-1'
                  : 'grid-cols-[minmax(0,1fr)_max-content] items-center gap-6'
              }`}
            >
              <div
                className={`flex min-w-0 items-start ${narrow ? 'gap-3' : 'gap-4'}`}
              >
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--modus-wc-color-base-100)]"
                  aria-hidden
                >
                  <ModusWcIcon
                    name="bar_graph"
                    decorative
                    size="lg"
                    customClass="!text-[color:var(--modus-wc-color-base-content)]"
                  />
                </span>
                <div className="min-w-0">
                  <ModusWcTypography
                    hierarchy="p"
                    size="xs"
                    weight="semibold"
                    customClass="!m-0 uppercase tracking-wide text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label="Operations"
                  />
                  <ModusWcTypography
                    hierarchy="h1"
                    size="2xl"
                    weight="semibold"
                    customClass={`!m-0 ${narrow ? '!text-xl !leading-snug' : ''}`}
                    label="Activity dashboard"
                  />
                </div>
              </div>
              <div
                className={`flex min-w-0 max-w-full flex-wrap gap-2 ${
                  narrow
                    ? 'w-full flex-col [&>modus-wc-button]:w-full'
                    : 'shrink-0 justify-end'
                }`}
              >
                <ModusWcButton
                  color="tertiary"
                  variant="outlined"
                  size="sm"
                  fullWidth={narrow}
                >
                  <ModusWcIcon name="view_list" decorative size="sm" />
                  <span className="ml-1">View queue</span>
                </ModusWcButton>
                <ModusWcButton color="primary" size="sm" fullWidth={narrow}>
                  <ModusWcIcon name="add" decorative size="sm" />
                  <span className="ml-1">New case</span>
                </ModusWcButton>
              </div>
            </div>
          </header>

          <div className="flex min-w-0 w-full flex-col gap-4 pb-6">
            <StatusBanner
              summary={overall.summary}
              subtext={overall.subtext}
              status={overall.status}
              attentionCount={ATTENTION.reduce((s, a) => s + a.count, 0)}
              onReview={() => setReviewOpen(true)}
              tight={tight}
            />

            <div className="activity-dashboard-kpi-scroll w-full min-w-0 overflow-x-auto">
              <div className="activity-dashboard-kpi-grid grid min-w-[720px] grid-cols-4 items-stretch gap-2">
                {KPIS.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex h-full min-h-0 min-w-0 flex-col"
                  >
                    <HeroKpi spec={spec} />
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`grid gap-3 ${mainSplit ? 'grid-cols-3' : 'grid-cols-1'}`}
            >
              <div
                className={`flex min-w-0 flex-col gap-3 ${mainSplit ? 'col-span-2' : ''}`}
              >
                <ModusWcCard bordered>
                  <ModusWcTypography
                    slot="title"
                    hierarchy="h4"
                    size="md"
                    weight="semibold"
                    label="Needs attention"
                  />
                  <ModusWcTypography
                    slot="subtitle"
                    hierarchy="p"
                    size="sm"
                    customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label="Prioritized by policy impact"
                  />
                  <div className="flex flex-col gap-2">
                    {ATTENTION.map((a) => (
                      <AttentionRow key={a.id} item={a} narrow={narrow} />
                    ))}
                  </div>
                </ModusWcCard>
                <ModusWcCard bordered>
                  <div
                    slot="title"
                    className={`flex w-full min-w-0 gap-3 ${narrow ? 'flex-col items-start' : 'flex-row items-center justify-between'}`}
                  >
                    <ModusWcTypography
                      hierarchy="h4"
                      size="md"
                      weight="semibold"
                      customClass="!m-0"
                      label="Recent activity"
                    />
                    <ModusWcButton
                      color="primary"
                      variant="borderless"
                      size="sm"
                      aria-label="Open full audit trail"
                    >
                      Open audit trail
                    </ModusWcButton>
                  </div>
                  <div className="flex flex-col gap-2">
                    {RECENT_ACTIVITY.map((e) => (
                      <ActivityRow key={e.id} row={e} />
                    ))}
                  </div>
                </ModusWcCard>
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <ModusWcCard bordered>
                  <ModusWcTypography
                    slot="title"
                    hierarchy="h4"
                    size="md"
                    weight="semibold"
                    label="At a glance"
                  />
                  <ModusWcCard bordered padding="compact" customClass="w-full">
                    <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { k: 'New', v: '18' },
                        { k: 'Active', v: '42' },
                        { k: 'Done', v: '126' },
                      ].map((x) => (
                        <div
                          key={x.k}
                          className="flex min-h-[4.25rem] min-w-0 flex-col items-center justify-center gap-1 rounded-md bg-[var(--modus-wc-color-base-200)] px-2 py-3 text-center sm:px-3"
                        >
                          <ModusWcTypography
                            hierarchy="p"
                            size="xs"
                            customClass="!m-0 leading-tight text-[var(--modus-wc-color-base-content-low-contrast)]"
                            label={x.k}
                          />
                          <ModusWcTypography
                            hierarchy="p"
                            size="lg"
                            weight="bold"
                            customClass="!m-0 leading-none"
                            label={x.v}
                          />
                        </div>
                      ))}
                    </div>
                  </ModusWcCard>
                  <div className="flex flex-col pt-3">
                    <AtAGlanceRow
                      label="Open cases"
                      value="42"
                      tone="success"
                      help="In progress this week"
                    />
                    <AtAGlanceRow
                      label="Breaches (30d)"
                      value="0"
                      tone="success"
                    />
                    <AtAGlanceRow
                      label="Avg. resolution"
                      value="1.6d"
                      tone="tertiary"
                      help="Business days"
                    />
                  </div>
                </ModusWcCard>
                <ModusWcCard bordered>
                  <ModusWcTypography
                    slot="title"
                    hierarchy="h4"
                    size="md"
                    weight="semibold"
                    label="Latest intake"
                  />
                  <div className="flex flex-col gap-2">
                    {[
                      'Benefits update — ACME',
                      'Remote work attestation',
                      'Payroll variance review',
                    ].map((t, i) => (
                      <div
                        key={t}
                        className="flex items-center justify-between gap-2 border-b border-[var(--modus-wc-color-base-200)] py-2 last:border-b-0"
                      >
                        <ModusWcTypography
                          hierarchy="p"
                          size="sm"
                          customClass="!m-0 truncate"
                          label={t}
                        />
                        <ModusWcBadge color="tertiary" size="sm">{`+${3 - i}h`}</ModusWcBadge>
                      </div>
                    ))}
                  </div>
                </ModusWcCard>
              </div>
            </div>
          </div>
        </div>

        <AttentionPanel
          open={reviewOpen}
          items={ATTENTION}
          onClose={() => setReviewOpen(false)}
        />
      </div>
    </div>
  );
}
