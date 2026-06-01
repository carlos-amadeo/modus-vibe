import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface GlobalSearchContextValue {
  query: string
  setQuery: (value: string) => void
  searchInputOpen: boolean
  setSearchInputOpen: (open: boolean) => void
  openSearch: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  const [searchInputOpen, setSearchInputOpen] = useState(false)

  const openSearch = useCallback(() => {
    setSearchInputOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      query,
      setQuery,
      searchInputOpen,
      setSearchInputOpen,
      openSearch,
    }),
    [query, searchInputOpen, openSearch],
  )

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearch(): GlobalSearchContextValue {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider')
  }
  return ctx
}
