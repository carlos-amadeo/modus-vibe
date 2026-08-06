import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ModusWcTypography,
  ModusWcIcon,
  ModusWcButton,
  ModusWcCard,
  ModusWcBadge,
  ModusWcAvatar,
  ModusWcTextInput,
  ModusWcTextarea,
  ModusWcDropdownMenu,
  ModusWcMenuItem,
  ModusWcDivider,
} from '@trimble-oss/moduswebcomponents-react'
import {
  FILE_LABELS,
  getLabelColor,
  type FileItem,
  type FileLabel,
} from './fileStorageData'
import {
  enrichFileProperties,
  type FileAttachment,
  type FileAttachmentKind,
  type FileCustomField,
  type FileItemWithProperties,
} from './fileStorageProperties'

type DrillView = 'info' | 'history' | 'access' | 'location' | 'attachments'

export const FILE_INFO_PANEL_HEADING_ID = 'file-info-panel-heading'

const DRILL_PANEL_HEADINGS: Record<Exclude<DrillView, 'info'>, string> = {
  history: 'History',
  access: 'Access',
  location: 'Location',
  attachments: 'Attached to',
}

const ATTACHMENT_GROUP_HEADINGS: Record<FileAttachmentKind, string> = {
  commitments: 'Commitments',
  forms: 'Forms',
  processes: 'Processes',
}

const ATTACHMENT_GROUP_ORDER: FileAttachmentKind[] = ['commitments', 'forms', 'processes']

const INFO_PANEL_ATTACHMENT_PREVIEW_PER_GROUP = 2

interface FileInfoPanelProps {
  open: boolean
  file: FileItem | null
  onClose: () => void
  onFileUpdated?: (file: FileItem) => void
}

interface FileInfoPanelBodyProps {
  enriched: FileItemWithProperties
  file: FileItem
  onClose: () => void
  onFileUpdated?: (file: FileItem) => void
}

function closeDropdownMenuFromEvent(e: CustomEvent) {
  const host = (e.target as HTMLElement | null)?.closest('modus-wc-dropdown-menu')
  if (host) {
    ;(host as HTMLElement & { menuVisible: boolean }).menuVisible = false
  }
}

function ClassificationBadgeDropdown({
  value,
  onChange,
}: {
  value: FileLabel | undefined
  onChange: (label: FileLabel) => void
}) {
  return (
    <ModusWcDropdownMenu
      buttonAriaLabel={
        value ? `Classification: ${value}. Click to change` : 'Set classification'
      }
      buttonVariant="borderless"
      buttonColor="tertiary"
      buttonSize="sm"
      menuPlacement="bottom-start"
      customClass="file-info-classification-dropdown shrink-0"
    >
      <div slot="button" className="file-info-classification-trigger">
        <ModusWcBadge
          variant={value ? 'filled' : 'outlined'}
          color={value ? getLabelColor(value) : 'tertiary'}
          size="sm"
          customClass="file-info-classification-badge !m-0"
        >
          <span className="file-info-classification-badge-inner">
            {value ?? 'Set classification'}
            <ModusWcIcon name="caret_down" size="xs" decorative />
          </span>
        </ModusWcBadge>
      </div>
      {FILE_LABELS.map((option) => (
        <ModusWcMenuItem
          key={option}
          slot="menu"
          label={option}
          value={option}
          onItemSelect={(e: CustomEvent) => {
            onChange(option)
            closeDropdownMenuFromEvent(e)
          }}
        />
      ))}
    </ModusWcDropdownMenu>
  )
}

function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="file-info-prop-row grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
      <ModusWcTypography
        hierarchy="p"
        size="sm"
        weight="semibold"
        label={label}
        customClass="text-[var(--modus-wc-color-base-content)]"
      />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function AttachedToCategoryLists({
  attachments,
  limitPerGroup,
}: {
  attachments: FileAttachment[]
  limitPerGroup?: number
}) {
  return (
    <div className="file-info-attached-groups flex flex-col gap-3">
      {ATTACHMENT_GROUP_ORDER.map((kind) => {
        const items = attachments.filter((att) => att.kind === kind)
        const visible = limitPerGroup != null ? items.slice(0, limitPerGroup) : items
        const headingId = `file-info-attached-${kind}-heading`

        return (
          <div key={kind} className="file-info-attached-group min-w-0">
            <ModusWcTypography
              id={headingId}
              hierarchy="h6"
              size="sm"
              weight="semibold"
              label={ATTACHMENT_GROUP_HEADINGS[kind]}
              customClass="!mb-1"
            />
            {visible.length > 0 ? (
              <ul className="file-info-attached-list" aria-labelledby={headingId}>
                {visible.map((att) => (
                  <li key={att.id}>
                    <div className="file-info-attached-item">
                      <a
                        href={att.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-info-attached-link file-info-text-link"
                        onClick={(e) => {
                          if (att.href === '#') e.preventDefault()
                        }}
                      >
                        <span className="file-info-attached-link-label">{att.label}</span>
                        <ModusWcIcon name="launch" size="xs" decorative />
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                      <ModusWcTypography
                        hierarchy="p"
                        size="xs"
                        customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                        label={att.projectName}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                label="None"
                aria-labelledby={headingId}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AccessAvatarStack({
  users,
  overflow,
}: {
  users: FileItemWithProperties['accessUsers']
  overflow: number
}) {
  const visible = users.slice(0, 6)
  return (
    <div
      className="modus-wc-avatar-group file-info-access-avatars flex flex-wrap items-center gap-[4px] overflow-visible"
      role="group"
      aria-label="People with access"
    >
      {visible.map((user) => (
        <ModusWcAvatar
          key={user.initials}
          alt={user.name}
          initials={user.initials}
          shape="circle"
          size="xs"
        />
      ))}
      {overflow > 0 ? (
        <div
          className="modus-wc-avatar modus-wc-placeholder shrink-0"
          role="img"
          aria-label={`${overflow} more people with access`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--modus-wc-color-blue-pale)] text-xs font-semibold text-[var(--modus-wc-color-primary)]">
            +{overflow}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FileInfoPanelBody({
  enriched,
  file,
  onClose,
  onFileUpdated,
}: FileInfoPanelBodyProps) {
  const [drillView, setDrillView] = useState<DrillView>('info')
  const [customFieldsOpen, setCustomFieldsOpen] = useState(false)
  const [attachedToOpen, setAttachedToOpen] = useState(false)
  const [draftName, setDraftName] = useState(enriched.name)
  const [draftLabel, setDraftLabel] = useState<FileLabel | undefined>(file.label)
  const [draftDescription, setDraftDescription] = useState(enriched.description)
  const [draftCustomFields, setDraftCustomFields] = useState<FileCustomField[]>(() =>
    enriched.customFields.map((f) => ({ ...f })),
  )
  const [copyFeedback, setCopyFeedback] = useState(false)

  useEffect(() => {
    setDrillView('info')
    setDraftName(enriched.name)
    setDraftLabel(file.label)
    setDraftDescription(enriched.description)
    setDraftCustomFields(enriched.customFields.map((f) => ({ ...f })))
  }, [file.id, enriched])

  const isDirty = useMemo(() => {
    if (!enriched) return false
    const nameChanged = draftName.trim() !== enriched.name
    const labelChanged = draftLabel !== file.label
    const descChanged = draftDescription !== enriched.description
    const fieldsChanged = draftCustomFields.some(
      (f, i) => f.value !== enriched.customFields[i]?.value,
    )
    return nameChanged || labelChanged || descChanged || fieldsChanged
  }, [enriched, file.label, draftName, draftLabel, draftDescription, draftCustomFields])

  const handleSave = useCallback(() => {
    if (!enriched || !file) return
    const updated: FileItem = {
      ...file,
      name: draftName.trim() || enriched.name,
      label: draftLabel,
      activity: draftDescription || enriched.activity,
    }
    onFileUpdated?.(updated)
    setDrillView('info')
  }, [enriched, file, draftName, draftLabel, draftDescription, onFileUpdated])

  const handleCancel = useCallback(() => {
    if (!enriched) return
    setDraftName(enriched.name)
    setDraftLabel(file.label)
    setDraftDescription(enriched.description)
    setDraftCustomFields(enriched.customFields.map((f) => ({ ...f })))
  }, [enriched])

  const handleCopyLink = useCallback(async () => {
    if (!enriched?.privateFileUrl) return
    try {
      await navigator.clipboard.writeText(enriched.privateFileUrl)
      setCopyFeedback(true)
      window.setTimeout(() => setCopyFeedback(false), 2000)
    } catch {
      setCopyFeedback(false)
    }
  }, [enriched])

  const panelHeadingLabel =
    drillView === 'info' ? 'Info' : DRILL_PANEL_HEADINGS[drillView]

  const renderPanelHeader = () => (
    <div className="modus-wc-utility-panel-header flex w-full min-w-0 shrink-0 items-center justify-between gap-3 border-b border-[var(--modus-wc-color-base-200)] px-4 py-3">
      <div className="file-info-panel-header-title flex min-w-0 flex-1 items-center gap-2">
        {drillView !== 'info' ? (
          <ModusWcButton
            variant="borderless"
            color="tertiary"
            size="sm"
            shape="square"
            aria-label="Back to Info"
            onButtonClick={() => setDrillView('info')}
          >
            <ModusWcIcon name="chevron_left" size="sm" decorative />
          </ModusWcButton>
        ) : null}
        <ModusWcTypography
          hierarchy="h4"
          size="lg"
          weight="semibold"
          id={FILE_INFO_PANEL_HEADING_ID}
          customClass="!m-0 min-w-0"
          label={panelHeadingLabel}
        />
        {drillView === 'info' ? (
          <ClassificationBadgeDropdown value={draftLabel} onChange={setDraftLabel} />
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {drillView === 'info' ? (
          <ModusWcDropdownMenu
            buttonAriaLabel="More actions"
            buttonVariant="borderless"
            buttonColor="tertiary"
            buttonSize="sm"
            menuPlacement="bottom-end"
          >
            <div slot="button" className="flex items-center justify-center">
              <ModusWcIcon name="more_vertical" size="sm" decorative />
            </div>
            <ModusWcMenuItem slot="menu" label="View" value="view" onItemSelect={() => undefined} />
            {enriched.type === 'file' ? (
              <>
                <ModusWcMenuItem
                  slot="menu"
                  label="Redline"
                  value="redline"
                  onItemSelect={() => undefined}
                />
                <ModusWcMenuItem
                  slot="menu"
                  label="Check out"
                  value="checkout"
                  onItemSelect={() => undefined}
                />
              </>
            ) : null}
            <ModusWcMenuItem slot="menu" label="Move" value="move" onItemSelect={() => undefined} />
            <ModusWcMenuItem slot="menu" label="Copy" value="copy" onItemSelect={() => undefined} />
            <ModusWcMenuItem
              slot="menu"
              label="Delete"
              value="delete"
              onItemSelect={() => undefined}
            />
          </ModusWcDropdownMenu>
        ) : null}
        <ModusWcButton
          variant="borderless"
          color="tertiary"
          size="sm"
          shape="square"
          onButtonClick={onClose}
          aria-label={`Close ${panelHeadingLabel} panel`}
        >
          <ModusWcIcon name="close" size="xs" decorative />
        </ModusWcButton>
      </div>
    </div>
  )

  const renderInfoBody = () => {
    if (!enriched) return null
    const isFolder = enriched.type === 'folder'
    const isFile = !isFolder

    return (
      <div className="flex flex-col gap-5 pb-4">
        <ModusWcCard bordered padding="compact" customClass="file-info-summary-card overflow-hidden">
          <div className="file-storage-drawer-preview">
            {enriched.previewUrl ? (
              <img src={enriched.previewUrl} alt={enriched.previewAlt ?? enriched.name} />
            ) : (
              <div className="flex min-h-[100px] w-full items-center justify-center">
                <ModusWcIcon
                  name={isFolder ? 'folder_open' : 'file_text'}
                  size="lg"
                  customClass={
                    isFolder
                      ? 'text-[var(--modus-wc-color-warning)]'
                      : 'text-[var(--modus-wc-color-primary)]'
                  }
                  decorative
                />
              </div>
            )}
          </div>
          <div className="file-info-summary-card-body flex flex-col gap-2">
            <ModusWcTextInput
              label="Name"
              required
              size="sm"
              value={draftName}
              onInputChange={(e: CustomEvent) => {
                setDraftName(String(e.detail?.target?.value ?? ''))
              }}
            />
            <div className="flex items-center justify-between gap-2 text-[var(--modus-wc-color-base-content-low-contrast)]">
              <div className="flex min-w-0 flex-col gap-1 text-xs">
                {isFolder && enriched.itemCount != null ? (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <ModusWcIcon name="documents" size="xs" decorative />
                    <span className="truncate">
                      {enriched.itemCount.toLocaleString()} items
                    </span>
                  </span>
                ) : null}
                {(isFolder && enriched.totalSize) || (isFile && enriched.sizeDisplay) ? (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <ModusWcIcon name="package" size="xs" decorative />
                    <span className="truncate">
                      {isFolder ? enriched.totalSize : enriched.sizeDisplay}
                    </span>
                  </span>
                ) : null}
              </div>
              {isFile ? (
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  size="sm"
                  shape="square"
                  aria-label="Download file"
                  onButtonClick={() => undefined}
                >
                  <ModusWcIcon name="download" size="sm" decorative />
                </ModusWcButton>
              ) : null}
            </div>
          </div>
        </ModusWcCard>

        <div className="file-info-description min-w-0 w-full">
          <ModusWcTextarea
            label="Description"
            size="sm"
            value={draftDescription}
            onInputChange={(e: CustomEvent) => {
              setDraftDescription(String(e.detail?.target?.value ?? ''))
            }}
          />
        </div>

        <section
          aria-labelledby="file-info-access-heading"
          className="file-info-access-section flex flex-col"
        >
          <ModusWcTypography
            id="file-info-access-heading"
            hierarchy="h5"
            size="md"
            weight="semibold"
            label="Who has access"
            customClass="!mb-0"
          />
          <div className="file-info-access-avatars-row mt-[8px]">
            <AccessAvatarStack
              users={enriched.accessUsers}
              overflow={enriched.accessOverflow}
            />
          </div>
          <div className="file-info-access-action mt-[16px] w-full min-w-0">
            <ModusWcButton
              variant="outlined"
              color="tertiary"
              size="sm"
              customClass="w-full max-w-full"
              onButtonClick={() => setDrillView('access')}
            >
              <ModusWcIcon name="user_edit" size="xs" decorative />
              Access
            </ModusWcButton>
          </div>
        </section>

        <section aria-labelledby="file-info-properties-heading">
          <ModusWcTypography
            id="file-info-properties-heading"
            hierarchy="h3"
            size="sm"
            weight="semibold"
            label="Properties"
            customClass="mb-1 sr-only"
          />
          <div className="file-info-properties m-0 p-0 flex flex-col">
            <div className="file-info-properties-fields flex flex-col gap-[8px]">
              <PropertyRow label="Created by">
                <ModusWcTypography hierarchy="p" size="sm" label={enriched.createdBy} />
              </PropertyRow>
              <PropertyRow label="Created on">
                <ModusWcTypography hierarchy="p" size="sm" label={enriched.createdOn} />
              </PropertyRow>
              <PropertyRow label="Modified by">
                <ModusWcTypography hierarchy="p" size="sm" label={enriched.modifiedBy} />
              </PropertyRow>
              <PropertyRow label="Modified on">
                <ModusWcTypography hierarchy="p" size="sm" label={enriched.modifiedOn} />
              </PropertyRow>
              <PropertyRow label="Versions">
                <div className="flex flex-wrap items-center gap-2">
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    label={String(enriched.versionCount)}
                  />
                  <a
                    href="#"
                    className="file-info-text-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setDrillView('history')
                    }}
                  >
                    See history
                  </a>
                </div>
              </PropertyRow>
              {enriched.checkedOutBy ? (
                <PropertyRow label="Checked out by">
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    label={
                      enriched.checkedOutOn
                        ? `${enriched.checkedOutOn} by ${enriched.checkedOutBy}`
                        : enriched.checkedOutBy
                    }
                  />
                </PropertyRow>
              ) : null}
              <PropertyRow label="Type">
                <ModusWcTypography hierarchy="p" size="sm" label={enriched.fileType} />
              </PropertyRow>
              {enriched.privateFileUrl ? (
                <div className="file-info-prop-stacked flex flex-col gap-1">
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    weight="semibold"
                    label="Private link"
                    customClass="text-[var(--modus-wc-color-base-content)]"
                  />
                  <ModusWcTypography
                    hierarchy="p"
                    size="xs"
                    customClass="break-all text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label={enriched.privateFileUrl}
                  />
                  <ModusWcButton
                    variant="borderless"
                    color="primary"
                    size="xs"
                    customClass="!justify-start"
                    onButtonClick={handleCopyLink}
                  >
                    {copyFeedback ? 'Copied' : 'Copy to clipboard'}
                  </ModusWcButton>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="file-info-custom-fields-section flex flex-col border-b border-[var(--modus-wc-color-base-200)]"
          data-expanded={customFieldsOpen ? 'true' : 'false'}
        >
          <button
            type="button"
            className="file-info-custom-fields-toggle flex w-full min-w-0 items-center justify-between gap-2 border-0 bg-transparent p-0 text-left"
            aria-expanded={customFieldsOpen}
            aria-controls="file-info-custom-fields-content"
            id="file-info-custom-fields-heading"
            onClick={() => setCustomFieldsOpen((open) => !open)}
          >
            <ModusWcTypography
              hierarchy="h5"
              size="md"
              weight="semibold"
              label="Custom fields"
              customClass="!m-0"
            />
            <ModusWcIcon
              name="caret_down"
              size="sm"
              decorative
              customClass="file-info-custom-fields-chevron shrink-0"
            />
          </button>
          <div
            id="file-info-custom-fields-content"
            role="region"
            aria-labelledby="file-info-custom-fields-heading"
            hidden={!customFieldsOpen}
            className="file-info-custom-fields-content flex flex-col gap-3 pb-3 pt-2"
          >
            {draftCustomFields.map((field, index) => (
              <ModusWcTextInput
                key={field.id}
                label={field.label}
                size="sm"
                value={field.value}
                onInputChange={(e: CustomEvent) => {
                  const value = String(e.detail?.target?.value ?? '')
                  setDraftCustomFields((prev) =>
                    prev.map((f, i) => (i === index ? { ...f, value } : f)),
                  )
                }}
              />
            ))}
          </div>
        </section>

        <section
          className="file-info-attached-section flex flex-col border-b border-[var(--modus-wc-color-base-200)]"
          data-expanded={attachedToOpen ? 'true' : 'false'}
        >
          <button
            type="button"
            className="file-info-attached-toggle flex w-full min-w-0 items-center justify-between gap-2 border-0 bg-transparent p-0 text-left"
            aria-expanded={attachedToOpen}
            aria-controls="file-info-attached-content"
            id="file-info-attached-heading"
            onClick={() => setAttachedToOpen((open) => !open)}
          >
            <ModusWcTypography
              hierarchy="h5"
              size="md"
              weight="semibold"
              label="Attached to"
              customClass="!m-0"
            />
            <ModusWcIcon
              name="caret_down"
              size="sm"
              decorative
              customClass="file-info-attached-chevron shrink-0"
            />
          </button>
          <div
            id="file-info-attached-content"
            role="region"
            aria-labelledby="file-info-attached-heading"
            hidden={!attachedToOpen}
            className="file-info-attached-content flex flex-col gap-3 pb-3 pt-2"
          >
            <AttachedToCategoryLists
              attachments={enriched.attachments}
              limitPerGroup={INFO_PANEL_ATTACHMENT_PREVIEW_PER_GROUP}
            />
            {ATTACHMENT_GROUP_ORDER.some(
              (kind) =>
                enriched.attachments.filter((att) => att.kind === kind).length >
                INFO_PANEL_ATTACHMENT_PREVIEW_PER_GROUP,
            ) ? (
              <ModusWcButton
                variant="borderless"
                color="primary"
                size="sm"
                customClass="!justify-start"
                onButtonClick={() => setDrillView('attachments')}
              >
                View all
              </ModusWcButton>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="file-info-path-heading">
          <ModusWcTypography
            id="file-info-path-heading"
            hierarchy="h5"
            size="md"
            weight="semibold"
            label="Path"
            customClass="mb-2"
          />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="break-all text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={enriched.path}
          />
          <div className="file-info-path-action w-full min-w-0">
            <ModusWcButton
              variant="outlined"
              color="tertiary"
              size="sm"
              customClass="w-full max-w-full"
              onButtonClick={() => setDrillView('location')}
            >
              <ModusWcIcon name="location" size="xs" decorative />
              Location
            </ModusWcButton>
          </div>
        </section>
      </div>
    )
  }

  const renderHistoryDrill = () => {
    if (!enriched) return null
    return (
      <ul className="file-info-history-list m-0 list-disc flex flex-col gap-0 pb-4 pt-2">
          {enriched.history.map((entry) => (
            <li
              key={entry.id}
              className="border-b border-[var(--modus-wc-color-base-200)] py-3 last:border-b-0"
            >
              <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label={entry.action} />
              <ModusWcTypography
                hierarchy="p"
                size="xs"
                customClass="text-[var(--modus-wc-color-base-content-low-contrast)] mt-1"
                label={`${entry.user} · ${entry.timestamp}`}
              />
            </li>
          ))}
      </ul>
    )
  }

  const renderAccessDrill = () => {
    if (!enriched) return null
    return (
      <div className="file-info-drill-body flex flex-col gap-4 pb-4">
          <AccessAvatarStack
            users={enriched.accessUsers}
            overflow={enriched.accessOverflow}
          />
          <ModusWcDivider />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={`${enriched.accessUsers.length + enriched.accessOverflow} people and groups can access this item.`}
          />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="semibold"
            label="Security limitations"
            customClass="mt-2"
          />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={enriched.securityLimitations}
          />
      </div>
    )
  }

  const renderLocationDrill = () => {
    if (!enriched) return null
    return (
      <div className="file-info-drill-body flex flex-col gap-3 pb-4">
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="break-all"
            label={enriched.path}
          />
          <ModusWcButton variant="outlined" color="tertiary" size="sm">
            <ModusWcIcon name="launch" size="xs" decorative />
            Open in file browser
          </ModusWcButton>
      </div>
    )
  }

  const renderAttachmentsDrill = () => {
    if (!enriched) return null
    return (
      <div className="file-info-drill-body pb-4 pt-2">
        <AttachedToCategoryLists attachments={enriched.attachments} />
      </div>
    )
  }

  const showSaveFooter = isDirty && drillView === 'info'

  return (
    <div className="file-info-utility-panel flex h-full min-h-0 w-full flex-col">
      {renderPanelHeader()}
      <div className="file-info-utility-panel-body flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto">
          <div hidden={drillView !== 'info'} aria-hidden={drillView !== 'info' ? true : undefined}>
            {renderInfoBody()}
          </div>
          <div
            hidden={drillView !== 'history'}
            aria-hidden={drillView !== 'history' ? true : undefined}
          >
            {renderHistoryDrill()}
          </div>
          <div
            hidden={drillView !== 'access'}
            aria-hidden={drillView !== 'access' ? true : undefined}
          >
            {renderAccessDrill()}
          </div>
          <div
            hidden={drillView !== 'location'}
            aria-hidden={drillView !== 'location' ? true : undefined}
          >
            {renderLocationDrill()}
          </div>
          <div
            hidden={drillView !== 'attachments'}
            aria-hidden={drillView !== 'attachments' ? true : undefined}
          >
            {renderAttachmentsDrill()}
          </div>
        </div>
      </div>
      <div
        hidden={!showSaveFooter}
        aria-hidden={!showSaveFooter ? true : undefined}
        className="modus-wc-utility-panel-footer file-info-utility-panel-footer flex shrink-0 items-center justify-end gap-2 border-t border-[var(--modus-wc-color-base-200)] px-4 py-3"
      >
        <ModusWcButton
          variant="outlined"
          color="tertiary"
          size="sm"
          onButtonClick={handleCancel}
        >
          Cancel
        </ModusWcButton>
        <ModusWcButton variant="filled" color="primary" size="sm" onButtonClick={handleSave}>
          Save
        </ModusWcButton>
      </div>
    </div>
  )
}

export function FileInfoPanel({ open, file, onClose, onFileUpdated }: FileInfoPanelProps) {
  const enriched = useMemo(
    () => (file ? enrichFileProperties(file) : null),
    [file],
  )

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const hasSelection = Boolean(enriched && file)

  return (
    <aside
      className={`file-storage-drawer absolute right-0 top-0 bottom-0 z-10 overflow-hidden transition-all duration-300 ease-in-out bg-[var(--modus-wc-color-base-page)] ${
        open ? 'file-storage-drawer-panel w-[320px]' : 'w-0'
      }`}
      aria-hidden={!open}
      role="region"
      aria-labelledby={FILE_INFO_PANEL_HEADING_ID}
    >
      <div className="file-info-panel-inner flex h-full w-[320px] min-w-[320px] flex-col overflow-hidden">
        <div hidden={!hasSelection} className="flex h-full min-h-0 flex-col">
          {hasSelection && enriched && file ? (
            <FileInfoPanelBody
              enriched={enriched}
              file={file}
              onClose={onClose}
              onFileUpdated={onFileUpdated}
            />
          ) : null}
        </div>
        <div
          hidden={hasSelection}
          aria-hidden={hasSelection ? true : undefined}
          className="file-info-utility-panel flex h-full min-h-0 w-full flex-col"
        >
          <div className="modus-wc-utility-panel-header flex w-full min-w-0 shrink-0 items-center justify-between gap-3 border-b border-[var(--modus-wc-color-base-200)] px-4 py-3">
            <ModusWcTypography
              hierarchy="h4"
              size="lg"
              weight="semibold"
              id={FILE_INFO_PANEL_HEADING_ID}
              customClass="!m-0 min-w-0"
              label="Info"
            />
            <ModusWcButton
              variant="borderless"
              color="tertiary"
              size="sm"
              shape="square"
              onButtonClick={onClose}
              aria-label="Close Info panel"
            >
              <ModusWcIcon name="close" size="xs" decorative />
            </ModusWcButton>
          </div>
          <div className="file-info-utility-panel-body min-h-0 flex-1 overflow-auto">
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
              label="Select a file or folder to view details."
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
