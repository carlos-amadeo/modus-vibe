import type { FileItem } from './fileStorageData'

export interface FileAccessUser {
  initials: string
  name: string
}

export interface FileHistoryEntry {
  id: string
  action: string
  user: string
  timestamp: string
}

export type FileAttachmentKind = 'commitments' | 'forms' | 'processes'

export interface FileAttachment {
  id: string
  label: string
  projectName: string
  href: string
  kind: FileAttachmentKind
}

export interface FileCustomField {
  id: string
  label: string
  value: string
}

export interface FileProperties {
  description: string
  fileType: string
  path: string
  sizeDisplay: string
  itemCount?: number
  totalSize?: string
  createdBy: string
  createdOn: string
  modifiedBy: string
  modifiedOn: string
  versionCount: number
  checkedOutBy: string | null
  checkedOutOn: string | null
  privateFileUrl?: string
  accessUsers: FileAccessUser[]
  accessOverflow: number
  history: FileHistoryEntry[]
  attachments: FileAttachment[]
  customFields: FileCustomField[]
  securityLimitations: string
}

export type FileItemWithProperties = FileItem & FileProperties

const SAMPLE_ACCESS: FileAccessUser[] = [
  { initials: 'PK', name: 'Priya Kumar' },
  { initials: 'SP', name: 'Sarah Chen' },
  { initials: 'ST', name: 'James Tran' },
  { initials: 'DS', name: 'Dana Smith' },
  { initials: 'AC', name: 'Alex Kim' },
  { initials: 'TK', name: 'Taylor Kim' },
]

const SAMPLE_HISTORY: FileHistoryEntry[] = [
  {
    id: 'h1',
    action: 'File modified',
    user: 'Gunnar Hámundarson',
    timestamp: '8 Jun 2023 11:04',
  },
  {
    id: 'h2',
    action: 'File created',
    user: 'Julian Oczkowski',
    timestamp: '8 Jun 2023 11:04',
  },
  {
    id: 'h3',
    action: 'Permission updated',
    user: 'Julian Oczkowski',
    timestamp: '7 Jun 2023 16:22',
  },
]

const SAMPLE_ATTACHMENTS: FileAttachment[] = [
  {
    id: 'a1',
    label: 'CP-2025-04 Structural Package',
    projectName: 'Harbor Tower Renovation',
    href: '#',
    kind: 'commitments',
  },
  {
    id: 'a2',
    label: 'RFI #1042 Response',
    projectName: 'West Campus Expansion',
    href: '#',
    kind: 'commitments',
  },
  {
    id: 'a3',
    label: 'Weekly report — W12',
    projectName: 'Harbor Tower Renovation',
    href: '#',
    kind: 'forms',
  },
  {
    id: 'a4',
    label: 'Safety inspection checklist',
    projectName: 'Metro Line 4 — Phase 2',
    href: '#',
    kind: 'forms',
  },
  {
    id: 'a5',
    label: 'Submittal review workflow',
    projectName: 'West Campus Expansion',
    href: '#',
    kind: 'processes',
  },
  {
    id: 'a6',
    label: 'Building A — Level 2',
    projectName: 'Harbor Tower Renovation',
    href: '#',
    kind: 'processes',
  },
]

const SAMPLE_CUSTOM_FIELDS: FileCustomField[] = [
  { id: 'cf1', label: 'Discipline', value: 'Structural' },
  { id: 'cf2', label: 'Contract package', value: 'CP-2025-04' },
]

const DEFAULT_PROPERTIES: FileProperties = {
  description: '',
  fileType: 'Document',
  path: 'Documents \\',
  sizeDisplay: '4.5 KB',
  createdBy: 'Julian Oczkowski',
  createdOn: '8 Jun 2023 11:04',
  modifiedBy: 'Gunnar Hámundarson',
  modifiedOn: '8 Jun 2023 11:04',
  versionCount: 1,
  checkedOutBy: null,
  checkedOutOn: null,
  accessUsers: SAMPLE_ACCESS,
  accessOverflow: 200,
  history: SAMPLE_HISTORY,
  attachments: SAMPLE_ATTACHMENTS,
  customFields: SAMPLE_CUSTOM_FIELDS,
  securityLimitations: 'No limitations applied.',
}

const FILE_OVERRIDES: Record<string, Partial<FileProperties>> = {
  '1': {
    description: 'Product list and descriptions',
    fileType: '.pdf File',
    path: 'Documents \\ Shared with me \\',
    sizeDisplay: '2.1 MB',
    privateFileUrl:
      'https://example.trimble.com/files/product-catalog-v1.pdf',
  },
  '2': {
    description: 'Quarterly program milestones and dependencies',
    fileType: '.xlsx File',
    path: 'Documents \\ My Files \\',
    sizeDisplay: '934 KB',
    versionCount: 3,
    checkedOutBy: 'James Tran',
    checkedOutOn: '13 Aug 2023',
  },
  '4': {
    description: 'Engineering standup notes',
    fileType: '.docx File',
    path: 'Documents \\ My Files \\',
    sizeDisplay: '128 KB',
  },
  f4: {
    description: 'Construction photos and field documentation',
    fileType: 'Folder',
    path: 'Documents \\ My Files \\ Project Assets \\',
    itemCount: 27000,
    totalSize: '500 Mb',
    versionCount: 1,
  },
}

/** Enrich a file/folder row with Connect-style Info panel fields. */
export function enrichFileProperties(item: FileItem): FileItemWithProperties {
  const overrides = FILE_OVERRIDES[item.id] ?? {}
  const isFolder = item.type === 'folder'

  return {
    ...item,
    ...DEFAULT_PROPERTIES,
    description: item.activity ?? DEFAULT_PROPERTIES.description,
    fileType: isFolder ? 'Folder' : DEFAULT_PROPERTIES.fileType,
    path: `Documents \\ ${item.location.replace(/^in /i, '')} \\`,
    modifiedBy: item.owner === 'me' ? 'You' : item.owner,
    modifiedOn: item.activity.includes('·')
      ? item.activity.split('·').pop()?.trim() ?? DEFAULT_PROPERTIES.modifiedOn
      : DEFAULT_PROPERTIES.modifiedOn,
    createdBy: item.owner === 'me' ? 'You' : item.owner,
    ...(isFolder
      ? {
          itemCount: overrides.itemCount ?? 1240,
          totalSize: overrides.totalSize ?? '48 Mb',
          sizeDisplay: '',
        }
      : {}),
    ...overrides,
  }
}
