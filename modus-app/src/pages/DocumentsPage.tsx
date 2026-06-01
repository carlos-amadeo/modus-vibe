import { useCallback, useMemo, useState } from 'react'
import {
  ModusWcTypography,
  ModusWcIcon,
  ModusWcButton,
  ModusWcCard,
  ModusWcBadge,
  ModusWcTabs,
  ModusWcTable,
} from '@trimble-oss/moduswebcomponents-react'
import { useGlobalSearch } from '../context/GlobalSearchContext'
import type { ITableColumn } from '@trimble-oss/moduswebcomponents'
import {
  SUGGESTED_FILES,
  SUGGESTED_FOLDERS,
  folderItemToFileItem,
  getLabelColor,
  type FileItem,
  type FolderItem,
} from './fileStorageData'
import {
  createActionsCell,
  createNameCell,
  createOwnerCell,
} from './fileStorageTableCells'
import './DocumentsPage.css'

export function DocumentsPage() {
  const { query: searchQuery } = useGlobalSearch()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [drawerTabIndex, setDrawerTabIndex] = useState(0)

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredFolders = useMemo(() => {
    if (!normalizedQuery) return SUGGESTED_FOLDERS
    return SUGGESTED_FOLDERS.filter((folder) =>
      folder.name.toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  const filteredFiles = useMemo(() => {
    if (!normalizedQuery) return SUGGESTED_FILES
    return SUGGESTED_FILES.filter((file) =>
      file.name.toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  const openDrawer = useCallback((file: FileItem) => {
    setSelectedFile(file)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedFile(null)
  }, [])

  const handleFileClick = useCallback(
    (file: FileItem) => {
      openDrawer(file)
    },
    [openDrawer],
  )

  const handleFolderClick = useCallback(
    (folder: FolderItem) => {
      openDrawer(folderItemToFileItem(folder))
    },
    [openDrawer],
  )

  const fileTableColumns: ITableColumn[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessor: 'name',
        sortable: false,
        cellRenderer: (_v, row) => createNameCell(row as unknown as FileItem),
      },
      {
        id: 'activity',
        header: 'Details',
        accessor: 'activity',
        sortable: false,
      },
      {
        id: 'owner',
        header: 'Owner',
        accessor: 'owner',
        sortable: false,
        cellRenderer: (_v, row) => createOwnerCell(row as unknown as FileItem),
      },
      {
        id: 'actions',
        header: '',
        accessor: 'id',
        sortable: false,
        cellRenderer: (_v, row) =>
          createActionsCell(row as unknown as FileItem, handleFileClick),
      },
    ],
    [handleFileClick],
  )

  return (
    <div
      data-file-storage
      className="file-storage-wrapper relative flex flex-1 min-h-0 min-w-0 overflow-hidden"
    >
      <div className="file-storage-main flex-1 min-w-0 overflow-auto flex flex-col">
        <div className="file-storage-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 shrink-0">
          <div className="flex items-center gap-1 min-w-0">
            <ModusWcIcon
              name="folder_open"
              size="md"
              customClass="text-[var(--modus-wc-color-base-content)] shrink-0"
              decorative
            />
            <ModusWcTypography
              hierarchy="h1"
              size="3xl"
              weight="light"
              label="Trimble Files"
            />
          </div>
          <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              <ModusWcButton
                variant={viewMode === 'list' ? 'filled' : 'borderless'}
                color="tertiary"
                shape="square"
                size="sm"
                onButtonClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <ModusWcIcon name="view_list" size="xs" decorative />
              </ModusWcButton>
              <ModusWcButton
                variant={viewMode === 'grid' ? 'filled' : 'borderless'}
                color="tertiary"
                shape="square"
                size="sm"
                onButtonClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <ModusWcIcon name="view_grid" size="xs" decorative />
              </ModusWcButton>
              <ModusWcButton variant="filled" color="primary" size="sm">
                <ModusWcIcon name="add" size="xs" decorative />
                New
              </ModusWcButton>
            </div>
        </div>

        <section className="mb-6" aria-labelledby="suggested-folders-heading">
          <div className="mb-2">
            <ModusWcTypography
              id="suggested-folders-heading"
              hierarchy="h2"
              size="md"
              weight="semibold"
              label="Suggested folders"
              customClass="text-[var(--modus-wc-color-base-content)]"
            />
          </div>
          <div className="file-storage-folders-grid grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                role="button"
                tabIndex={0}
                className={`file-storage-folder-host min-w-0 ${
                  selectedFile?.id === folder.id ? 'file-storage-card-host--selected' : ''
                }`}
                onClick={() => handleFolderClick(folder)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleFolderClick(folder)
                  }
                }}
                aria-label={`Open folder ${folder.name}`}
              >
                <ModusWcCard
                  bordered={false}
                  padding="compact"
                  customClass="file-storage-folder-card transition-colors hover:bg-[var(--modus-wc-color-base-200)]"
                >
                  <div
                    slot="title"
                    className="flex w-full min-w-0 items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <ModusWcIcon
                        name="folder_open"
                        size="sm"
                        customClass="text-[var(--modus-wc-color-base-content)] shrink-0"
                        decorative
                      />
                      <ModusWcTypography
                        hierarchy="p"
                        size="sm"
                        weight="semibold"
                        label={folder.name}
                        customClass="truncate min-w-0"
                      />
                    </div>
                    <ModusWcButton
                      variant="borderless"
                      color="tertiary"
                      size="xs"
                      shape="square"
                      customClass="shrink-0"
                      aria-label={`More options for ${folder.name}`}
                      onButtonClick={(e) => {
                        e.stopPropagation()
                        handleFolderClick(folder)
                      }}
                    >
                      <ModusWcIcon name="more_vertical" size="xs" decorative />
                    </ModusWcButton>
                  </div>
                  <ModusWcTypography
                    slot="subtitle"
                    hierarchy="p"
                    size="xs"
                    customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label={folder.location}
                  />
                </ModusWcCard>
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1 min-h-0" aria-labelledby="suggested-files-heading">
          <div className="mb-2">
            <ModusWcTypography
              id="suggested-files-heading"
              hierarchy="h2"
              size="md"
              weight="semibold"
              label="Suggested files"
              customClass="text-[var(--modus-wc-color-base-content)]"
            />
          </div>
          {viewMode === 'grid' ? (
            <div className="file-storage-files-grid grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  className={`file-storage-card-host min-w-0 ${
                    selectedFile?.id === file.id ? 'file-storage-card-host--selected' : ''
                  }`}
                  onClick={() => handleFileClick(file)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFileClick(file)
                    }
                  }}
                  aria-label={`Open ${file.name}`}
                >
                  <ModusWcCard
                    bordered={false}
                    padding="compact"
                    customClass="file-storage-card overflow-hidden p-0 transition-colors hover:bg-[var(--modus-wc-color-base-200)]"
                  >
                    <div slot="header" className="file-storage-card-preview">
                      {file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt={file.previewAlt ?? file.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ModusWcIcon
                            name={file.type === 'folder' ? 'folder_open' : 'file_text'}
                            size="lg"
                            customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                            decorative
                          />
                        </div>
                      )}
                    </div>
                    <ModusWcTypography
                      slot="title"
                      hierarchy="p"
                      size="sm"
                      weight="semibold"
                      label={file.name}
                      customClass="truncate block"
                    />
                    <div
                      slot="actions"
                      className="flex w-full min-w-0 items-center justify-between gap-2"
                    >
                      {file.label ? (
                        <ModusWcBadge
                          variant="filled"
                          color={getLabelColor(file.label)}
                          size="sm"
                        >
                          {file.label}
                        </ModusWcBadge>
                      ) : (
                        <span aria-hidden="true" />
                      )}
                      <ModusWcButton
                        variant="borderless"
                        color="tertiary"
                        size="xs"
                        shape="square"
                        aria-label={`More options for ${file.name}`}
                        onButtonClick={(e: CustomEvent) => {
                          e.stopPropagation()
                          handleFileClick(file)
                        }}
                      >
                        <ModusWcIcon name="more_vertical" size="xs" decorative />
                      </ModusWcButton>
                    </div>
                    <ModusWcTypography
                      slot="subtitle"
                      hierarchy="p"
                      size="xs"
                      customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                      label={file.activity}
                    />
                  </ModusWcCard>
                </div>
              ))}
            </div>
          ) : (
            <div
              data-data-table-view
              className="data-table-scroll-wrapper w-full min-w-0 overflow-x-auto"
            >
              <ModusWcTable
                columns={fileTableColumns}
                data={filteredFiles as unknown as Record<string, unknown>[]}
                density="compact"
                sortable={false}
                hover={true}
                paginated={false}
                zebra={true}
                customClass="w-full"
                onRowClick={(e: CustomEvent<{ row: Record<string, unknown> }>) => {
                  const row = e.detail?.row
                  if (row?.id) {
                    const file = filteredFiles.find((f) => f.id === String(row.id))
                    if (file) handleFileClick(file)
                  }
                }}
              />
            </div>
          )}
        </section>
      </div>

      <aside
        className={`file-storage-drawer absolute right-0 top-0 bottom-0 z-10 overflow-hidden transition-all duration-300 ease-in-out bg-[var(--modus-wc-color-base-page)] ${
          drawerOpen ? 'file-storage-drawer-panel w-[320px]' : 'w-0'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="file-storage-drawer-inner w-[320px] min-w-[320px] h-full flex flex-col overflow-hidden">
          <div className="file-storage-drawer-header flex items-center justify-between p-4 border-b border-[var(--modus-wc-color-base-200)] shrink-0">
            {selectedFile ? (
              <>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ModusWcIcon
                    name={selectedFile.type === 'folder' ? 'folder_open' : 'file_text'}
                    size="md"
                    customClass={
                      selectedFile.type === 'folder'
                        ? 'text-[var(--modus-wc-color-warning)] shrink-0'
                        : 'text-[var(--modus-wc-color-primary)] shrink-0'
                    }
                    decorative
                  />
                  <ModusWcTypography
                    hierarchy="h4"
                    size="md"
                    weight="semibold"
                    label={selectedFile.name}
                    customClass="truncate"
                  />
                </div>
                <ModusWcButton
                  variant="borderless"
                  color="tertiary"
                  size="sm"
                  shape="square"
                  onButtonClick={closeDrawer}
                  aria-label="Close details"
                >
                  <ModusWcIcon name="close" size="xs" decorative />
                </ModusWcButton>
              </>
            ) : (
              <ModusWcTypography
                hierarchy="h4"
                size="md"
                weight="semibold"
                label="Details"
              />
            )}
          </div>
          <div className="file-storage-drawer-body flex-1 overflow-auto p-4">
            {selectedFile ? (
              <>
                <ModusWcTabs
                  tabs={[
                    { label: 'Details' },
                    { label: 'Activity' },
                  ]}
                  activeTabIndex={drawerTabIndex}
                  onTabChange={(e: CustomEvent<{ newTab: number }>) =>
                    setDrawerTabIndex(e.detail.newTab)
                  }
                />
                <div className="mt-4 flex flex-col gap-4">
                  <ModusWcCard bordered={false} padding="compact" customClass="mb-3">
                    <div className="file-storage-drawer-preview">
                      {selectedFile.previewUrl ? (
                        <img
                          src={selectedFile.previewUrl}
                          alt={selectedFile.previewAlt ?? selectedFile.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center min-h-[120px]">
                          <ModusWcIcon
                            name={
                              selectedFile.type === 'folder' ? 'folder_open' : 'file_text'
                            }
                            size="lg"
                            customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                            decorative
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <ModusWcTypography
                        hierarchy="h3"
                        size="sm"
                        weight="semibold"
                        label={selectedFile.name}
                      />
                      <ModusWcTypography
                        hierarchy="p"
                        size="xs"
                        customClass="text-[var(--modus-wc-color-base-content-low-contrast)] mt-1"
                        label={
                          selectedFile.type === 'folder'
                            ? 'Folder'
                            : 'Document description'
                        }
                      />
                    </div>
                  </ModusWcCard>

                  <div>
                    <ModusWcTypography
                      hierarchy="h3"
                      size="sm"
                      weight="semibold"
                      label="Who has access"
                      customClass="mb-2"
                    />
                    <ModusWcTypography
                      hierarchy="p"
                      size="sm"
                      customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                      label="You do not have permission to view the list of people with access."
                    />
                  </div>

                  <div>
                    <ModusWcTypography
                      hierarchy="h3"
                      size="sm"
                      weight="semibold"
                      label="Security limitations"
                      customClass="mb-2"
                    />
                    <ModusWcTypography
                      hierarchy="p"
                      size="sm"
                      customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                      label="No limitations applied."
                    />
                  </div>

                  <div>
                    <ModusWcTypography
                      hierarchy="h3"
                      size="sm"
                      weight="semibold"
                      label="Labels"
                      customClass="mb-2"
                    />
                    <ModusWcTypography
                      hierarchy="p"
                      size="sm"
                      customClass="text-[var(--modus-wc-color-base-content-low-contrast)] mb-2"
                      label="Read-only"
                    />
                    <ModusWcButton variant="outlined" color="tertiary" size="sm">
                      Apply label
                    </ModusWcButton>
                  </div>

                  <div>
                    <ModusWcTypography
                      hierarchy="h3"
                      size="sm"
                      weight="semibold"
                      label="Data Classification"
                      customClass="mb-2"
                    />
                    {selectedFile.label ? (
                      <ModusWcBadge
                        variant="filled"
                        color={getLabelColor(selectedFile.label)}
                        size="sm"
                      >
                        {selectedFile.label}
                      </ModusWcBadge>
                    ) : (
                      <ModusWcTypography
                        hierarchy="p"
                        size="sm"
                        customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                        label="Not classified"
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                label="Select a file or folder to view details."
              />
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
