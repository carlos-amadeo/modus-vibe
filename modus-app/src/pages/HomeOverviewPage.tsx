import { useMemo } from 'react'
import {
  ModusWcTypography,
  ModusWcIcon,
  ModusWcBreadcrumbs,
  ModusWcTabs,
  ModusWcButton,
  ModusWcCard,
  ModusWcModal,
  ModusWcTextInput,
  ModusWcInputLabel,
} from '@trimble-oss/moduswebcomponents-react'
import { useGlobalSearch } from '../context/GlobalSearchContext'

export interface OverviewItem {
  id: string
  label: string
  description: string
}

interface HomeOverviewPageProps {
  items: OverviewItem[]
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onNavigateHome: () => void
  modalId: string
  newItemLabel: string
  newItemDescription: string
  onNewItemLabelChange: (value: string) => void
  onNewItemDescriptionChange: (value: string) => void
  onOpenCreateModal: () => void
  onCloseCreateModal: () => void
  onCreateItem: () => void
}

export function HomeOverviewPage({
  items,
  viewMode,
  onViewModeChange,
  onNavigateHome,
  modalId,
  newItemLabel,
  newItemDescription,
  onNewItemLabelChange,
  onNewItemDescriptionChange,
  onOpenCreateModal,
  onCloseCreateModal,
  onCreateItem,
}: HomeOverviewPageProps) {
  const { query } = useGlobalSearch()

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <>
      <ModusWcBreadcrumbs
        size="sm"
        items={[{ label: 'Home', url: '#' }, { label: 'Overview' }]}
        onBreadcrumbClick={(e: CustomEvent<{ label: string }>) => {
          if (e.detail?.label === 'Home') onNavigateHome()
        }}
      />
      <div data-app-shell-preview className="app-shell-preview-wrapper">
        <div className="app-shell-preview-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-1">
            <ModusWcIcon
              name="cube"
              size="md"
              customClass="text-[var(--modus-wc-color-base-content)]"
              decorative
            />
            <ModusWcTypography
              hierarchy="h1"
              size="3xl"
              weight="light"
              label="Overview"
            />
          </div>
          <div className="flex items-center gap-2">
            <ModusWcButton
              variant={viewMode === 'grid' ? 'filled' : 'borderless'}
              color="tertiary"
              shape="square"
              size="sm"
              onButtonClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
            >
              <ModusWcIcon name="view_grid" decorative />
            </ModusWcButton>
            <ModusWcButton
              variant={viewMode === 'list' ? 'filled' : 'borderless'}
              color="tertiary"
              shape="square"
              size="sm"
              onButtonClick={() => onViewModeChange('list')}
              aria-label="List view"
            >
              <ModusWcIcon name="view_list" decorative />
            </ModusWcButton>
            <ModusWcButton
              variant="filled"
              color="primary"
              size="sm"
              onButtonClick={onOpenCreateModal}
            >
              <ModusWcIcon name="add" size="xs" decorative />
              Create Item
            </ModusWcButton>
          </div>
        </div>
        <div className="tabs-scroll-wrapper">
          <ModusWcTabs
            tabs={[
              { label: 'Overview' },
              { label: 'Analytics' },
              { label: 'Reports' },
            ]}
            activeTabIndex={0}
          />
        </div>
        <div
          className={`app-shell-preview-grid flex-1 overflow-auto gap-3 mt-3 ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col'
          }`}
        >
          {viewMode === 'grid' ? (
            <>
              {filteredItems.map((item) => (
                <ModusWcCard key={item.id} bordered={false} padding="compact">
                  <ModusWcTypography
                    slot="title"
                    hierarchy="p"
                    size="sm"
                    weight="semibold"
                    label={item.label}
                  />
                  <ModusWcTypography
                    slot="subtitle"
                    hierarchy="p"
                    size="xs"
                    customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label={item.description}
                  />
                </ModusWcCard>
              ))}
            </>
          ) : (
            <>
              {filteredItems.map((item) => (
                <ModusWcCard
                  key={item.id}
                  bordered={false}
                  padding="compact"
                  customClass="app-shell-list-card w-full min-w-full flex items-center gap-4 justify-start text-left"
                >
                  <ModusWcTypography
                    slot="title"
                    hierarchy="p"
                    size="sm"
                    weight="semibold"
                    label={item.label}
                  />
                  <ModusWcTypography
                    slot="subtitle"
                    hierarchy="p"
                    size="xs"
                    customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label={item.description}
                  />
                </ModusWcCard>
              ))}
            </>
          )}
        </div>
      </div>
      <ModusWcModal modalId={modalId} customClass="sm:max-w-[425px]">
        <ModusWcTypography
          slot="header"
          hierarchy="h2"
          size="lg"
          weight="semibold"
          label="Create Item"
        />
        <div slot="content" className="flex flex-col gap-2 py-4">
          <div className="flex flex-col gap-2">
            <ModusWcInputLabel forId="create-item-label" labelText="Name" />
            <ModusWcTextInput
              inputId="create-item-label"
              value={newItemLabel}
              onInputChange={(e: CustomEvent) => {
                onNewItemLabelChange(e.detail?.target?.value ?? '')
              }}
              customClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <ModusWcInputLabel
              forId="create-item-description"
              labelText="Description"
            />
            <ModusWcTextInput
              inputId="create-item-description"
              value={newItemDescription}
              onInputChange={(e: CustomEvent) => {
                onNewItemDescriptionChange(e.detail?.target?.value ?? '')
              }}
              customClass="w-full"
            />
          </div>
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            onButtonClick={onCloseCreateModal}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton variant="filled" color="primary" onButtonClick={onCreateItem}>
            Create
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </>
  )
}
