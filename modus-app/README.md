# Modus App Shell

A complete Modus Web Components application shell built with React + Vite + TypeScript.

## Features

- ✅ Modus Web Components setup with proper theme provider
- ✅ Responsive navbar with main menu toggle
- ✅ Side navigation with push layout (desktop) and overlay (mobile)
- ✅ Proper FOUC (Flash of Unstyled Content) prevention
- ✅ Modus Icons configured with CDN fonts
- ✅ Theme switcher support (light/dark mode)
- ✅ Tailwind CSS v4 integrated with Modus styles
- ✅ Semantic HTML structure with proper accessibility
- ✅ Responsive card grid layout
- ✅ Production-ready architecture

## Project Structure

```
modus-app/
├── public/
│   └── modus-web-components/
│       └── modus-icons.css         # Modus icon fonts configuration
├── src/
│   ├── App.tsx                     # Main app shell with navbar + side nav
│   ├── App.css                     # App-specific styles
│   ├── index.css                   # Global styles (Modus → Tailwind order)
│   └── main.tsx                    # Entry point with theme provider
├── index.html                      # HTML entry with FOUC script
├── package.json
├── postcss.config.js               # PostCSS with Tailwind v4 plugin
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Development

```bash
npm run dev
```

Server will start at `http://localhost:5174/` (or next available port)

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Key Implementation Details

### 1. FOUC Prevention

The `index.html` includes an inline script that sets theme attributes before first paint:
- `data-theme` on `<html>` (modus-modern-light | modus-modern-dark)
- `data-mode` (light | dark | system)
- Resolved `light` or `dark` class

### 2. CSS Import Order

Critical for Modus to work correctly:

```css
/* index.css */
@import '@trimble-oss/moduswebcomponents/modus-wc-styles.css';  /* MUST be first */
@import 'tailwindcss';                                            /* After Modus */
```

### 3. Modus Icons Setup

- Font files loaded from jsDelivr CDN
- Preloaded in `<head>` for optimal performance
- Configured in `/public/modus-web-components/modus-icons.css`

### 4. Side Navigation

- **Desktop (≥1024px)**: Push layout - main content margin adjusts
- **Mobile (<1024px)**: Overlay layout - drawer over content
- `targetContent="#main-content"` syncs with `<main id="main-content">`
- Icons in `slot="start-icon"` for each menu item

### 5. Theme Provider Chain

Proper scroll ownership and viewport height:

```css
#root {
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

#root > modus-wc-theme-provider {
  display: flex;
  flex: 1;
  min-height: 0;
}
```

## Package Versions

- **@trimble-oss/moduswebcomponents**: Latest (1.4.x)
- **@trimble-oss/moduswebcomponents-react**: 1.4.0-react19
- **React**: 19.x
- **Tailwind CSS**: 4.x
- **Vite**: 8.x

## Customization

### Adding New Routes

1. Add new menu item to `ModusWcMenu` in `App.tsx`:

```tsx
<ModusWcMenuItem
  label="New Route"
  value="new-route"
  selected={activeRoute === 'new-route'}
  onMenuItemSelect={() => setActiveRoute('new-route')}
>
  <ModusWcIcon slot="start-icon" name="your_icon" decorative />
</ModusWcMenuItem>
```

2. Add route content to main area based on `activeRoute` state

### Changing Theme Colors

Modus uses CSS custom properties for theming. Override in your CSS:

```css
:root {
  --modus-wc-color-primary: your-color;
}
```

### Adding Cards

Use the Modus card component pattern:

```tsx
<ModusWcCard bordered={false} padding="compact">
  <div slot="title" className="flex w-full min-w-0 items-center justify-start gap-2">
    <ModusWcIcon name="icon_name" decorative />
    <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Title" />
  </div>
  <ModusWcTypography hierarchy="p" size="sm" label="Content here" />
</ModusWcCard>
```

## Modus Component Usage

### Button Hierarchy

- **Primary**: `variant="filled" color="primary"` (one per section)
- **Secondary**: `variant="outlined"`
- **Tertiary**: `variant="borderless" color="tertiary"` (default for most actions)

### Typography

Always use `ModusWcTypography` for text:
- `hierarchy`: Semantic element (h1-h6, p)
- `size`: Visual scale (xs, sm, md, lg, xl, 2xl, etc.)
- `weight`: Font weight (regular, semibold, bold)

### Icons

Use valid Modus icon names:
- Set `decorative` for visual-only icons
- Use `decorative={false}` with `aria-label` for accessible icons
- Check available icons at Modus documentation

## Production Checklist

Before deploying:

- [ ] Test light and dark theme
- [ ] Verify responsive behavior (mobile → desktop)
- [ ] Check side navigation push/overlay transitions
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Verify all icons render (no blank spaces)
- [ ] Run `npm run build` successfully
- [ ] Check console for errors/warnings
- [ ] Lighthouse accessibility score ≥ 95

## Resources

- [Modus Web Components](https://modus.trimble.com/)
- [Modus Icons](https://modus-icons.trimble.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## License

MIT
