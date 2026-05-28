import { type ReactNode, useState } from 'react'
import {
  ModusWcNavbar,
  ModusWcSideNavigation,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'

interface AppShellLayoutProps {
  children: ReactNode
  contentId: string
  className?: string
  constrainMainContentWidth?: boolean
  contentClassName?: string
  selectedMenuItem?: string
  onMenuItemSelect?: (e: CustomEvent<{ value: string }>) => void
}

export function AppShellLayout({
  children,
  contentId,
  className = '',
  constrainMainContentWidth = false,
  contentClassName = '',
  selectedMenuItem = 'home',
  onMenuItemSelect,
}: AppShellLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleMainMenuToggle = () => {
    // Push + sibling rail without slot="main-menu": decouple mainMenuOpen so the
    // navbar flyout slab does not block pointer events on the side nav (§3.B).
    setSidebarOpen((prev) => !prev)
  }

  const handleMenuItemClick = (value: string) => {
    if (onMenuItemSelect) {
      onMenuItemSelect(new CustomEvent('menuItemSelect', { detail: { value } }) as any)
    }
  }

  return (
    <div className={`flex h-screen flex-col ${className}`}>
      <ModusWcNavbar
        mainMenuOpen={false}
        visibility={{
          logo: true,
          mainMenu: true,
          user: true,
        }}
        userCard={{
          name: 'User Name',
          email: 'user@trimble.com',
        }}
        onMainMenuOpenChange={handleMainMenuToggle}
      />

      <div className="flex flex-1 min-h-0" style={{ position: 'relative' }}>
        <ModusWcSideNavigation
          expanded={sidebarOpen}
          maxWidth="256px"
          mode="push"
          targetContent={`#${contentId}`}
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
          </ModusWcMenu>
        </ModusWcSideNavigation>

        <main
          id={contentId}
          className="overflow-auto"
          style={{ 
            backgroundColor: 'var(--modus-wc-color-base-page)',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            className={contentClassName}
            style={{
              maxWidth: constrainMainContentWidth ? '100%' : 'none',
              margin: '0 auto',
              width: '100%',
              padding: '0 1.5rem 1.5rem',
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
