import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ModusWcNavbar,
  ModusWcSideNavigation,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'
import {
  GlobalSearchProvider,
  useGlobalSearch,
} from '../context/GlobalSearchContext'

const MOBILE_SHELL_MAX_PX = 640

export interface NavbarVisibilityConfig {
  logo?: boolean
  mainMenu?: boolean
  apps?: boolean
  search?: boolean
  searchInput?: boolean
  notifications?: boolean
  help?: boolean
  user?: boolean
  ai?: boolean
}

interface AppShellLayoutProps {
  children: ReactNode
  contentId: string
  className?: string
  constrainMainContentWidth?: boolean
  contentClassName?: string
  selectedMenuItem?: string
  onMenuItemSelect?: (e: CustomEvent<{ value: string }>) => void
  navbarCenter?: ReactNode
  navbarVisibility?: NavbarVisibilityConfig
  useContainerWidth?: boolean
}

function AppShellLayoutInner({
  children,
  contentId,
  className = '',
  constrainMainContentWidth = false,
  contentClassName = '',
  selectedMenuItem = 'home',
  onMenuItemSelect,
  navbarCenter,
  navbarVisibility,
  useContainerWidth = false,
}: AppShellLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isNarrowShell, setIsNarrowShell] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const navbarRef = useRef<HTMLElement | null>(null)
  const { setQuery, searchInputOpen, setSearchInputOpen, openSearch } =
    useGlobalSearch()

  useEffect(() => {
    if (!useContainerWidth || !shellRef.current) return

    const node = shellRef.current
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setIsNarrowShell(width < MOBILE_SHELL_MAX_PX)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [useContainerWidth])

  /** Push + empty `slot="main-menu"`: keep navbar flyout closed (§3.B). */
  const syncNavbarMainMenuClosed = useCallback(() => {
    const host = navbarRef.current as (HTMLElement & { mainMenuOpen?: boolean }) | null
    if (host) host.mainMenuOpen = false
  }, [])

  useEffect(() => {
    syncNavbarMainMenuClosed()
  }, [sidebarExpanded, selectedMenuItem, searchInputOpen, syncNavbarMainMenuClosed])

  const handleHamburgerToggle = useCallback(() => {
    setSidebarExpanded((prev) => !prev)
  }, [])

  const handleSideNavExpandedChange = useCallback((e: CustomEvent<boolean>) => {
    setSidebarExpanded(Boolean(e.detail))
  }, [])

  const handleMenuItemClick = (value: string) => {
    onMenuItemSelect?.(
      { detail: { value } } as CustomEvent<{ value: string }>,
    )
  }

  const visibility = {
    logo: true,
    mainMenu: true,
    user: true,
    search: true,
    searchInput: true,
    apps: false,
    notifications: false,
    help: false,
    ai: false,
    ...navbarVisibility,
  }

  const showNavbarCenter = Boolean(navbarCenter) && !isNarrowShell

  return (
    <div
      ref={useContainerWidth ? shellRef : undefined}
      className={`app-shell-layout flex h-screen flex-col ${className}`.trim()}
      data-mobile={useContainerWidth && isNarrowShell ? 'true' : undefined}
      data-side-nav-expanded={sidebarExpanded ? 'true' : 'false'}
    >
      <ModusWcNavbar
        ref={navbarRef as never}
        mainMenuOpen={false}
        visibility={visibility}
        searchInputOpen={searchInputOpen}
        userCard={{
          name: 'User Name',
          email: 'user@trimble.com',
        }}
        textOverrides={{ search: 'Search' }}
        onMainMenuOpenChange={handleHamburgerToggle}
        onSearchClick={openSearch}
        onSearchInputOpenChange={(e: CustomEvent<boolean>) => {
          setSearchInputOpen(Boolean(e.detail))
        }}
        onSearchChange={(e: CustomEvent<{ value: string }>) => {
          setQuery(e.detail?.value ?? '')
        }}
        onUserMenuOpenChange={() => {
          syncNavbarMainMenuClosed()
        }}
      >
        {navbarCenter ? (
          <div
            slot="center"
            className={
              showNavbarCenter
                ? 'file-storage-navbar-search w-full max-w-md min-w-0'
                : 'file-storage-navbar-search'
            }
            hidden={!showNavbarCenter}
          >
            {navbarCenter}
          </div>
        ) : null}
      </ModusWcNavbar>

      <div className="flex flex-1 min-h-0" style={{ position: 'relative' }}>
        <ModusWcSideNavigation
          expanded={sidebarExpanded}
          maxWidth="256px"
          mode="push"
          collapseOnClickOutside={false}
          targetContent={`#${contentId}`}
          onExpandedChange={handleSideNavExpandedChange}
        >
          <ModusWcMenu>
            <ModusWcMenuItem
              label="Home"
              value="home"
              selected={selectedMenuItem === 'home'}
              onItemSelect={() => handleMenuItemClick('home')}
            >
              <ModusWcIcon slot="start-icon" name="home" variant="outlined" decorative />
            </ModusWcMenuItem>
            <ModusWcMenuItem
              label="Dashboard"
              value="dashboard"
              selected={selectedMenuItem === 'dashboard'}
              onItemSelect={() => handleMenuItemClick('dashboard')}
            >
              <ModusWcIcon slot="start-icon" name="dashboard" variant="outlined" decorative />
            </ModusWcMenuItem>
            <ModusWcMenuItem
              label="Activities"
              value="activities"
              selected={selectedMenuItem === 'activities'}
              onItemSelect={() => handleMenuItemClick('activities')}
            >
              <ModusWcIcon slot="start-icon" name="bar_graph" variant="outlined" decorative />
            </ModusWcMenuItem>
            <ModusWcMenuItem
              label="Cost"
              value="cost"
              selected={selectedMenuItem === 'cost'}
              onItemSelect={() => handleMenuItemClick('cost')}
            >
              <ModusWcIcon slot="start-icon" name="costs" variant="outlined" decorative />
            </ModusWcMenuItem>
            <ModusWcMenuItem
              label="Documents"
              value="documents"
              selected={selectedMenuItem === 'documents'}
              onItemSelect={() => handleMenuItemClick('documents')}
            >
              <ModusWcIcon slot="start-icon" name="document" variant="outlined" decorative />
            </ModusWcMenuItem>
          </ModusWcMenu>
        </ModusWcSideNavigation>

        <main
          id={contentId}
          className="flex-1 min-h-0 min-w-0 overflow-auto bg-[var(--modus-wc-color-base-page)]"
        >
          <div
            className={`app-shell-main-inner ${contentClassName}`.trim()}
            style={{
              maxWidth: constrainMainContentWidth ? '100%' : 'none',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function AppShellLayout(props: AppShellLayoutProps) {
  return (
    <GlobalSearchProvider>
      <AppShellLayoutInner {...props} />
    </GlobalSearchProvider>
  )
}
