/**
 * Preview images from the Modus File Storage template
 * (https://modus.trimble.com/templates/file-storage/overview).
 * Copied locally from https://modus.trimble.com/assets/brandImages/
 */
export const FILE_PREVIEW_IMAGES = [
  '/assets/brandImages/25-Deck-Field-01-0J8A2931.jpg',
  '/assets/brandImages/25-Deck-Field-02.jpg',
  '/assets/brandImages/25-Deck-Field-03-BCFS-0759.jpg',
  '/assets/brandImages/25-Deck-Field-04-AdobeStock_449340054.jpg',
  '/assets/brandImages/25-Deck-Field-05-MX60_0Z8A9355.jpg',
  '/assets/brandImages/25-Deck-Field-06-R780_TSC5_Const_1550.jpg',
] as const

export type FileLabel = 'Internal' | 'Confidential' | 'Restricted'

export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  label?: FileLabel
  previewUrl?: string
  previewAlt?: string
  location: string
  owner: string
  ownerInitials: string
  activity: string
}

export interface FolderItem {
  id: string
  name: string
  location: string
  previewUrl?: string
  previewAlt?: string
}

/** Map a suggested-folder card to a file item for the details drawer. */
export function folderItemToFileItem(folder: FolderItem): FileItem {
  return {
    id: folder.id,
    name: folder.name,
    type: 'folder',
    previewUrl: folder.previewUrl,
    previewAlt: folder.previewAlt,
    location: folder.location.replace(/^in /i, ''),
    owner: 'me',
    ownerInitials: 'me',
    activity: folder.location,
  }
}

export const SUGGESTED_FOLDERS: FolderItem[] = [
  { id: 'f1', name: 'Design Assets', location: 'in My Files' },
  { id: 'f2', name: 'User Profiles', location: 'in My Files' },
  { id: 'f3', name: 'Design System', location: 'in Shared with me' },
  {
    id: 'f4',
    name: 'Project Assets',
    location: 'in My Files',
    previewUrl: FILE_PREVIEW_IMAGES[0],
    previewAlt: 'Construction field photo — project asset library',
  },
]

export const SUGGESTED_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Product Catalog',
    type: 'file',
    label: 'Internal',
    previewUrl: FILE_PREVIEW_IMAGES[0],
    previewAlt: 'Construction field photo — deck site overview',
    location: 'Shared with me',
    owner: 'me',
    ownerInitials: 'me',
    activity: 'Product list and descriptions',
  },
  {
    id: '2',
    name: 'Program Roadmap Q1 2025',
    type: 'file',
    previewUrl: FILE_PREVIEW_IMAGES[1],
    previewAlt: 'Construction field photo — jobsite progress',
    location: 'My Files',
    owner: 'James Tran',
    ownerInitials: 'JT',
    activity: 'James Tran edited · Mar 2',
  },
  {
    id: '3',
    name: 'Authentication Redesign',
    type: 'folder',
    label: 'Confidential',
    previewUrl: FILE_PREVIEW_IMAGES[2],
    previewAlt: 'Construction field photo — site documentation',
    location: 'Shared with me',
    owner: 'me',
    ownerInitials: 'me',
    activity: 'You opened · Feb 26',
  },
  {
    id: '4',
    name: 'Weekly Engineering Notes',
    type: 'file',
    previewUrl: FILE_PREVIEW_IMAGES[3],
    previewAlt: 'Construction field photo — infrastructure work',
    location: 'My Files',
    owner: 'Sarah Chen',
    ownerInitials: 'SC',
    activity: 'Sarah Chen edited · Mar 1',
  },
  {
    id: '5',
    name: '1:1 Meeting Notes',
    type: 'file',
    label: 'Confidential',
    previewUrl: FILE_PREVIEW_IMAGES[4],
    previewAlt: 'Construction field photo — machine control on site',
    location: 'Shared with me',
    owner: 'me',
    ownerInitials: 'me',
    activity: 'You opened · Feb 5',
  },
  {
    id: '6',
    name: 'Design System 2025 Update',
    type: 'folder',
    label: 'Internal',
    previewUrl: FILE_PREVIEW_IMAGES[5],
    previewAlt: 'Construction field photo — survey and construction technology',
    location: 'My Files',
    owner: 'Alex Kim',
    ownerInitials: 'AK',
    activity: 'James Tran edited · Mar 2',
  },
]

export function getLabelColor(
  label: FileLabel,
): 'success' | 'warning' | 'danger' | 'tertiary' {
  if (label === 'Internal') return 'success'
  if (label === 'Confidential') return 'warning'
  if (label === 'Restricted') return 'danger'
  return 'tertiary'
}
