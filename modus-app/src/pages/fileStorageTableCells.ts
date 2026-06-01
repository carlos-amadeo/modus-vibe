import type { FileItem, FileLabel } from './fileStorageData'
import { getLabelColor } from './fileStorageData'

export function createNameCell(row: FileItem): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'file-storage-table-cell file-storage-table-cell--name'

  const icon = document.createElement('modus-wc-icon')
  icon.setAttribute('name', row.type === 'folder' ? 'folder_open' : 'file_text')
  icon.setAttribute('size', 'sm')
  icon.setAttribute('decorative', 'true')
  icon.className =
    row.type === 'folder'
      ? 'file-storage-table-icon file-storage-table-icon--folder'
      : 'file-storage-table-icon file-storage-table-icon--file'

  const nameSpan = document.createElement('span')
  nameSpan.className = 'file-storage-table-name'
  nameSpan.textContent = row.name

  wrapper.appendChild(icon)
  wrapper.appendChild(nameSpan)

  if (row.label) {
    const badge = document.createElement('modus-wc-badge')
    badge.setAttribute('variant', 'filled')
    badge.setAttribute('color', getLabelColor(row.label as FileLabel))
    badge.setAttribute('size', 'sm')
    badge.textContent = row.label
    wrapper.appendChild(badge)
  }

  return wrapper
}

export function createOwnerCell(row: FileItem): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'file-storage-table-cell file-storage-table-cell--owner'

  const avatar = document.createElement('modus-wc-avatar')
  avatar.setAttribute('initials', row.ownerInitials)
  avatar.setAttribute('size', 'xs')

  const ownerSpan = document.createElement('span')
  ownerSpan.className = 'file-storage-table-owner'
  ownerSpan.textContent = row.owner

  wrapper.appendChild(avatar)
  wrapper.appendChild(ownerSpan)

  return wrapper
}

export function createActionsCell(
  file: FileItem,
  onOpen: (file: FileItem) => void,
): HTMLElement {
  const btn = document.createElement('modus-wc-button')
  btn.setAttribute('variant', 'borderless')
  btn.setAttribute('color', 'tertiary')
  btn.setAttribute('size', 'sm')
  btn.setAttribute('shape', 'square')
  btn.setAttribute('aria-label', 'More options')

  const icon = document.createElement('modus-wc-icon')
  icon.setAttribute('name', 'more_vertical')
  icon.setAttribute('size', 'xs')
  icon.setAttribute('decorative', 'true')
  btn.appendChild(icon)

  btn.addEventListener('buttonClick', (e) => {
    e.stopPropagation()
    onOpen(file)
  })

  return btn
}
