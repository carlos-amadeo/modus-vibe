---
name: modus-wc-side-navigation
description: >-
  Implements Trimble Modus Web Components side navigation (modus-wc-side-navigation)
  with responsive mode (overlay on narrow, push on wide), targetContent and margin
  sync, navbar hamburger (**mainMenuOpen**: mirror vs **push**/desktop decouple when
  **slot="main-menu"** is empty — empty **.main-menu** can block **main** clicks),
  collapseOnClickOutside, z-index stacking, **Pattern A** fixed wrapper width that
  tracks **minWidth**/**maxWidth** (avoid ~256px hit slab when **push** collapsed),
  and resize/route edge cases. Menu items must be wrapped in modus-wc-menu / ModusWcMenu.
  Overlay full-bleed **targetContent**, collapsed rail **pointer-events**.
  Primary rail icons **md** in **start-icon** by default.
---

# Modus side navigation — layout and integration

## Why this skill exists

`modus-wc-side-navigation` applies **`position: absolute`** to its **inner** `.modus-wc-side-navigation` panel. That panel does **not** consume width in a flex row unless you add a **shell** or **explicit main margin**. **`targetContent`** + **`setTargetContentMargin`** set **`margin-left`** on a selector (behavior depends on **`mode`** and **`expanded`**—confirm with **Modus Docs MCP** for your package **`version`**). Combining **`targetContent` margin** with a **flex shell that already reserves rail width** can **double-offset** main content. **`targetContent=""`** makes Modus call **`document.querySelector("")`** and throw on expand—never bind an empty string.

Use this skill when wiring **push** rail + **main**, **overlay drawer** on small screens, **hamburger ↔ expanded**, **resize/route** desync, or **first-paint margin** glitches.

## Modus `mode`: overlay vs push (read this first)

Modus documents **`mode`** as **`'overlay' | 'push'`** on **`modus-wc-side-navigation`** (see **Modus Docs MCP** → **`get_modus_component_data`** → **`modus-wc-side-navigation`**). The component’s **default `mode` is `overlay`**.

### Required default for new apps (breakpoint-driven)

- **Narrow / mobile / drawer UX:** set **`mode="overlay"`** so **Modus** owns overlay semantics (stacking, target margin rules, interaction contract). Do **not** simulate an overlay while leaving **`mode="push"`** unless you have a documented exception (see **Alternate: blueprint-style CSS overlay** below).
- **Desktop / wide:** set **`mode="push"`** when the rail should **push** the main column and **`targetContent`** should apply the **expanded → maxWidth** margin (see implementation: `setTargetContentMargin` only applies **`maxWidth`** when **`mode === 'push'`** and **`expanded`**; otherwise it uses **`minWidth`**—verify on your **`version`** via MCP).

Bind from one breakpoint (e.g. **`matchMedia('(min-width: 768px)')`**) so **JS and CSS breakpoints stay aligned**:

```tsx
// Illustrative — confirm prop names on your framework wrapper
const isDesktop = useMediaQuery('(min-width: 768px)');
<ModusWcSideNavigation
  mode={isDesktop ? 'push' : 'overlay'}
  expanded={sideNavExpanded}
  targetContent="#main-content"
  collapseOnClickOutside={!isDesktop}
  …
/>
```

Point **`targetContent`** at a **real** main column selector (e.g. **`#main-content`** / **`#app-main-content`**) unless you are explicitly in **Pattern B sentinel** territory (see **`targetContent` and double offset**).

### Preferred default: expanded rail on **XL** (1280px)

For **dashboard / app-shell** layouts, **prefer** a **wider desktop** breakpoint for **default expanded** rail, distinct from the **`push` / `overlay`** breakpoint:

- **`isDesktop`** (e.g. **`matchMedia('(min-width: 768px)')`**) → drives **`mode`**: **`push`** when true, **`overlay`** when false. Align with global CSS (e.g. **`#main-content { margin-left: 4rem }`** only from the **`push`** breakpoint up; **`margin-left: 0 !important`** on **`targetContent` for the entire viewport band where `mode === 'overlay'`** — drawer open **and** closed — see **Overlay mode — full-bleed `targetContent` + collapsed rail shell** below).
- **`isXl`** (e.g. **`matchMedia('(min-width: 1280px)')`**, same as **Tailwind `xl`**) → drives **default** **`sideNavExpanded`**: **expanded on XL+**, **collapsed below XL** on the **resize axis**.

**Implementation (reference pattern):**

1. **Constants:** one string for **`maxWidth`** / expanded main inset (e.g. **`'256px'`**) shared by **`ModusWcSideNavigation`** **`maxWidth`** and any imperative nudge.
2. **Initial state:** `useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches)` so the **first client frame** matches “open on wide desktop” without waiting for **`useEffect`**.
3. **Resize sync:** `useEffect(() => { setSideNavExpanded(isXl); }, [isXl])` so crossing **below** XL **collapses** the rail (pairs with **`push`** only on **`md`+** and overlay on narrow) and crossing **to** XL **restores** the expanded default. **While `isXl` stays true**, the user can still **toggle** the rail; the effect does **not** re-run on toggle alone—only when **`isXl`** changes (so a manual collapse on XL persists until the viewport crosses **below** XL and back).
4. **Required nudge when expanded on push:** `useLayoutEffect` that runs when **`isDesktop && sideNavExpanded`**, finds **`#main-content`**, and applies **`marginLeft = maxWidthConstant`** inside **double `requestAnimationFrame`**, with cleanup that **cancels** the outer frame id. This addresses **`setTargetContentMargin`** racing Stencil / React on **expanded first paint** (see **First paint: `expanded={true}` on push** below). **Do not** skip this when shipping **XL-default-expanded**.

**Alternate:** drawer-first products may keep **`expanded === false`** on first load at **all** breakpoints and omit **`isXl`** sync; document that choice explicitly.

### Anti-patterns (do not ship to production)

1. **`mode="push"` on all breakpoints** plus a **custom backdrop**, **manual `main.style.marginLeft = 0` on mobile**, and/or **document scroll lock** to mimic a drawer—that **reimplements Modus overlay** and drifts from the documented API.
2. **Sentinel / fake `targetContent`** (selector that matches no element) **as the default** to disable Modus margins, then **hand-maintaining** the same **`4rem` / `256px`** rules Modus already encodes—use only when **Pattern B** requires avoiding double offset, not to avoid learning **`mode`**.
3. **Two booleans** for navbar **`mainMenuOpen`** and rail **`expanded`** that can drift—use **one** app boolean mirrored to both (see **Navbar — main menu**).
4. **Custom hamburger** in **`slot="start"`** while **`visibility.mainMenu: false`**—forbidden; use the built-in control.
5. **Rail `modus-wc-menu-item` without `modus-wc-menu`:** Placing **`modus-wc-menu-item`** (or **`ModusWcMenuItem`**) **directly** as children of **`modus-wc-side-navigation`**, with **no** **`modus-wc-menu`** / **`ModusWcMenu`** wrapper. Modus Storybook and **modus-blueprint** wrap the list in **`modus-wc-menu`**, which renders **`<ul class="modus-wc-menu">`**. That **`ul`** gets **`list-style: none`** (see **`modus-wc-menu`** global styles). Each **`modus-wc-menu-item`** hosts an internal **`<li>`**; if the **`<ul>`** is missing, the expected list reset may not apply and **browsers can show spurious list markers (bullets)** to the left of row icons. **Fix:** always wrap the rail’s items in **`ModusWcMenu`** (or native **`<modus-wc-menu>`**) and set **`size`** to match the menu items (e.g. both **`md`**).

### Alternate: blueprint-style “push + CSS overlay”

Some production apps (e.g. **modus-blueprint**) keep **`mode="push"`** at all breakpoints and **simulate** mobile overlay with **CSS** (translate, backdrop, z-index). That is **valid only when** the team intentionally chooses one **`mode`** for simplicity and **keeps breakpoint CSS and JS aligned**. It is **not** the same as **`mode="overlay"`** and must **not** be confused with “using Modus overlay mode.” Prefer **`mode` switching** for new apps unless product explicitly matches blueprint’s single-mode approach.

### `collapseOnClickOutside` and scroll

- **Desktop push:** **`collapseOnClickOutside={false}`** is common so clicks in main do not close the rail.
- **Mobile overlay:** prefer **`collapseOnClickOutside={true}`** when it matches product UX; **add scroll lock only if** Modus overlay + your shell still allow background scroll (measure; do not add lock by default on top of **`overlay`** without verifying).

### Route / URL changes — close the overlay drawer (SPA)

**`collapseOnClickOutside`** fires when the user taps outside the rail. It does **not** run when the **main content swaps** because of **client-side routing**: the user may activate a **`modus-wc-menu-item`** or an in-app link, **`navigate()`** runs, and the drawer never receives an “outside” click—so **`expanded`** can stay **`true`** and cover the new page.

**Do:** when the route identity changes, set **`expanded`** (your **`sideNavExpanded`** / single boolean mirrored to the navbar) to **`false`** **only while `mode === 'overlay'`** (same breakpoint gate as **`mode`**, e.g. **`!isDesktop`**). Leave **push** / desktop behavior alone unless the product explicitly collapses the rail on every navigation.

**Examples:**

- **React Router:** **`useEffect`** depending on **`useLocation().pathname`** (add **`search` / `hash`** if those navigations should also dismiss the drawer), body gated with **`if (!isDesktop)`** or **`if (mode === 'overlay')`** before **`setSideNavExpanded(false)`**. Prefer **`requestAnimationFrame`** (or **`queueMicrotask`**) if your linter flags synchronous **`setState`** in an effect.
- **Angular:** **`NavigationEnd`** / **`Router.events`** with the same overlay-only gate.
- **Vue:** **`router.afterEach`** with the same gate.

After **`expanded`** becomes **`false`**, **`mainMenuOpen`** stays consistent **per** **Navbar — main menu §3** (**mirror vs decouple**) on your breakpoint; still apply **Navbar — main menu §6** (**`mainMenuOpen`** resync on the host after navigation) if **`handleClickOutside`** desynced internal navbar state.

## Default positioning (match modus-blueprint)

**Prefer this shell** unless product constraints force something else:

1. **`modus-wc-navbar`** — **`position: sticky`**, **`top: 0`**, and an explicit **`z-index`** on the **host** (blueprint often uses **`customClass`** such as **`sticky top-0 z-[120] flex-shrink-0`** on **`ModusWcNavbar`**). The navbar stays pinned while **`#main-content`** scrolls.
2. **Side rail wrapper** around **`modus-wc-side-navigation`** — **`position: fixed`**, **`left: 0`**, measured **`top`** / **`height`** (see **Measure** below). **Width must track the rail, not assume expanded width:** on **`push`**, Modus renders **`minWidth`** (**`4rem`** by default) when **`expanded`** is **`false`** and **`maxWidth`** when **`true`**. A **fixed wrapper** glued to **`maxWidth`** (**e.g. always `256px` / Tailwind **`w-[256px]`**) while **`push` + collapsed** leaves a **tall transparent column** (**wrapper width minus **`4rem`**) sitting **above** **`#main-content`** (**lower `z-index`**) once inset margins reserve only **`4rem`**—**pointer events disappear** (“page dead,” “overlay blocking”) with **no visible menu**. Tie wrapper width (& **`overflow`**) to **`expanded`** **`+`** **`mode`**: **`minWidth`** (**`w-16`**) when **`push` + collapsed**, **`maxWidth`** when **`push` + expanded** or **overlay drawer open** (overlay **closed** strip still follows **Collapsed drawer** § in **Overlay mode**). **`z-index`:** when **`mainMenuOpen`** is **mirror-coupled** to **`expanded`**, set the rail **above** the navbar host per **Stacking — navbar host vs `.main-menu.visible` vs fixed side rail** (e.g. rail **`130`**, navbar **`120`**); do not assume the rail is always **`z-index`**-below the navbar host. Set **`top`** to the **combined height** of everything above the body row (sticky navbar + any bars above it), and **`height: calc(100dvh - top)`** so the rail fills the viewport **below** the top bar without sliding under it. Main content scrolls independently; the rail does not scroll away with the document.

That pairing is what **modus-blueprint** ships: **sticky** top nav + **fixed** rail (not `sticky` on the custom element itself—the wrapper is **`fixed`** so the rail column behaves like pinned app chrome).

**Measure, do not hardcode:** derive **`top`** / **`height`** from **`navbar.getBoundingClientRect().height`** or **`offsetHeight`** after layout (`useLayoutEffect`, **`ResizeObserver`**), or a CSS variable such as **`--app-navbar-height`**, and add any secondary top bars (inspector toolbar, banners). Re-run on resize when the navbar wraps.

**Escape hatch — static / in-flow top nav:** If the navbar must stay in normal document flow (no **`sticky`**), you can still use a **fixed** rail with **`top`** equal to the **measured** block height of the header area, or switch to **Pattern B** (flex shell, in-flow rail) so you are not maintaining **`fixed`** offsets.

**Overlay + fixed rail wrapper:** When **`mode="overlay"`** on mobile, **reconcile** the fixed wrapper width/position with Modus’s overlay panel so you do not stack **two** competing overlays (custom backdrop + Modus). Prefer **Modus `overlay`** first; add **minimal** shell CSS only if MCP or Storybook for your **`version`** shows a gap.

## Stacking — navbar host vs `.main-menu.visible` vs fixed side rail

When **`mainMenuOpen`** is **mirror-bound** to **`expanded`** (**Navbar — main menu §3.A**), opening the rail sets **`mainMenuOpen` to `true`**. In current **`modus-wc-navbar`** builds, the **`.main-menu`** wrapper then uses classes such as **`visible`** / **`hidden`**; when **visible**, it is typically **`position: absolute`**, full viewport height under the bar (**`height: calc(100dvh - 56px)`**-class rules), **`min-width: 256px`**, with an inner **`z-index`** in the **90s**—confirm exact rules with **Modus Docs MCP** → **`get_modus_component_data`** → **`modus-wc-navbar`** for your **`version`**.

That panel is still painted **inside the navbar custom element’s stacking context**. If the **navbar host** uses **`z-index: 120`** (common) and your **fixed rail wrapper** uses **`z-index: 110`**, the **entire navbar subtree stacks above the rail** in the viewport: **pointer events hit the (often empty) `.main-menu` region** instead of **`modus-wc-side-navigation`**, so rail **menu items feel dead** even though the rail looks on-screen.

**Preferred fix (Pattern A, sibling rail + **`mainMenuOpen` mirror — §3.A only):**

- Set the **fixed rail wrapper** **`z-index` strictly higher than the `modus-wc-navbar` host** (e.g. navbar **`120`**, rail **`130`**). The rail’s **`top`** offset already clears the **56px-class** top bar, so the hamburger row normally stays clickable; only the **left column overlap** with the main-menu surface is corrected.

**Primary fix when **`slot="main-menu"`** is empty** on **`push`/desktop:** use **§3.B** (**decouple **`mainMenuOpen`**) so **`.main-menu`** stays closed—see **Navbar — main menu §3**.

**Avoid as primary mitigation:** appending **`display: none !important`** on **`.main-menu`** into **`navbar.shadowRoot`**. The DOM under the host can include **`modus-wc-toolbar`** (or other inner trees) depending on **`version`**, so selectors may not apply; **`handleClickOutside`** still uses **`menuRef`** on that shell—prefer **stacking** over shadow piercing.

**`slot="main-menu"` product trade-off (MCP):**

- **MCP** documents **`slot="main-menu"`** for panel body content.
- Mounting **`modus-wc-side-navigation` only** in that slot ties visibility to **`mainMenuOpen`**; when **`false`**, Modus hides the **whole** main-menu shell—**no persistent collapsed (`minWidth`) rail** on desktop. The **Side Navigation** Storybook layout keeps **navbar + rail + main as siblings** for push/collapsed chrome. Use slot-only when the product is **drawer-only** (no always-on collapsed rail).

### First paint: `expanded={true}` on **push** — guarantee **`maxWidth`** margin

On **`mode="push"`** with **`expanded={true}`**, **`setTargetContentMargin`** must set **`targetContent`** **`margin-left`** to **`maxWidth`** (e.g. **`256px`**). If **`expanded`** is **true** on first paint while the shell uses a **`fixed`** rail wrapper, **one bad frame** where **`margin-left` is still **`4rem`** from stylesheet reserve (or unset) makes the rail **cover** the main column—it reads like a broken **overlay** even though **`mode` is `push`**. The common **desktop CSS `margin-left: 4rem`** mitigation for **collapsed** push does **not** reserve **`maxWidth`**; it is **wrong** for expanded until Modus applies the **inline** **`maxWidth`** margin.

**Preferred product default (see § Preferred default: expanded rail on XL):**

1. **XL+ (`min-width: 1280px`):** default **`expanded` to `true`** via **`useState` initializer** + **`useEffect`** on **`isXl`** as in that section.
2. **Always ship** a **`useLayoutEffect`** that sets **`#main-content.style.marginLeft`** to **`maxWidth`** or **`4rem`** in **sync** (same tick as layout, before paint) whenever **`isDesktop`**, **not only inside `requestAnimationFrame`**: if the margin is applied only in a **double-rAF** callback, the **first paint** can still run with stylesheet **`4rem`** while the shell is **`256px` expanded**—the rail reads as an overlay. After the sync assignment, keep the **double-rAF** nudge to re-apply after **`setTargetContentMargin`** / Stencil may overwrite. Optionally add **CSS** **`.shell:has(.rail-expanded) #main-content { margin-left: <maxWidth>; }`** at the same **`min-width`** as **`push`** so the first frame matches even before effects.

**Alternate (drawer-first / minimal shell):** initialize **`expanded` to `false`** on first load at all breakpoints; open from **navbar main menu** or **persisted preference** only. You may still add the **double-rAF** nudge if you ever default **expanded** on **`push`** (e.g. restored user setting).

Also keep **JS breakpoint** (`min-width: 768px`) aligned with **CSS** if you use **`max-width: 767px`** for mobile-only overrides—off-by-one at **`768px`** causes subtle bugs.

### First paint: push + **collapsed** — `setTargetContentMargin` can miss entirely (SPA / React / Vite)

**Symptom:** On **desktop `push`** with **`expanded={false}`**, the collapsed rail ( **`minWidth`**, default **`4rem`**) appears **on top of** the main column—headings and cards are clipped on the left—**especially on initial load** or right after a hard refresh.

**Why:** The inner rail is **`position: absolute`**. Modus applies **`margin-left`** on **`targetContent`** only from **`setTargetContentMargin`**, which runs from **Stencil property watchers** (`expanded`, `mode`, `targetContent`). On the **first commit**, watchers can run **before** `document.querySelector(targetContent)` finds **`main`** (framework ordering, lazy custom-element upgrade, or **`key`** remount on `mode`). If **`querySelector` returns `null` once**, **no margin** is set until some later prop churn—so the main column stays **full width** under the rail.

**Mitigation (recommended stack — not a second overlay system):**

1. **CSS reserve at the desktop breakpoint** (same **`min-width`** as your JS `push` breakpoint, e.g. **`768px`**): set **`#your-main-id { margin-left: 4rem; }`** so the **collapsed** rail width is reserved **before** any framework or Stencil tick. This matches Modus’s default **`minWidth`** (**`4rem`**); confirm **`minWidth`** / **`maxWidth`** for your **`version`** via **MCP** if you override props.
   - **Container-sized shells (embeds, MCP panels, `ResizeObserver` on a root):** Key the reserve off **shell width**, not the viewport — e.g. **`container-type: size`** on the shell root and **`@container (min-width: 768px)`** for **`#your-main-id { margin-left: 4rem }`**, using the **same pixel threshold** as the JS that flips **`mode`** between **`push`** and **`overlay`**. If you set **`margin-left` imperatively**, apply **`'4rem'`** whenever **`isDesktop && !sideNavExpanded`** on **`push`**; **`removeProperty('margin-left')`** only when switching to **`overlay`**. Clearing margin on **push + collapsed** reproduces the overlap: **`main`** stays full-bleed under an absolutely positioned rail until **`setTargetContentMargin`** runs.
2. **Expanded still uses Modus inline margin:** when **`expanded`** and **`mode === 'push'`**, Modus sets **`main.style.marginLeft = maxWidth`** (**inline**), which **overrides** the stylesheet **`4rem`**—no conflict.
3. **Imperative mirror:** when using **§ Preferred default: expanded rail on XL** (or any **`expanded={true}`** on **`push`** at first paint), set **`main.style.marginLeft`** **synchronously** in **`useLayoutEffect`** to **`maxWidth`** / **`4rem`**, then **double-rAF** re-apply (same constants as **`ModusWcSideNavigation`**). For **collapsed-only** races, the **4rem** CSS reserve alone is often enough; expanded-first-paint needs the **sync** write and/or **`:has()`** expanded reserve CSS.
4. **Mobile / overlay band:** **`clear` `main.style.marginLeft`** when **`mode === 'overlay'`** (or when leaving desktop) so stale inline values do not fight **`margin-left: 0 !important`** — those rules must apply for the **whole** overlay breakpoint, not only when the drawer is closed (see **Overlay mode — full-bleed `targetContent` + collapsed rail shell** below).
5. **Do not** stack this with **Pattern B** in-flow width **and** full **`targetContent`** margins without checking for **double offset**—see **Pattern B** and **Main margin sync** below.

This section complements **§ First paint: `expanded={true}` on push — guarantee `maxWidth` margin** above: **collapsed** **`push`** ( **`md`–`lg`** with **XL-default-expanded**, or user-collapsed) needs the same **“guaranteed offset before first paint”** discipline for **`minWidth`** / **4rem**.

### Overlay mode — full-bleed `targetContent` + collapsed rail shell (required on narrow viewports)

Two separate shell concerns apply whenever **`mode === 'overlay'`** (narrow band): hiding the **collapsed** rail chrome, and keeping **`targetContent`** **full-bleed** whenever **`expanded`** toggles.

#### Why full-bleed must apply for the **whole** overlay band (not only when the drawer is closed)

**`targetContent`** + **`setTargetContentMargin`** can still write **`margin-left`** on **`main`** under **`overlay`** as **`expanded`** changes (confirm behavior on your **`version`** via **Modus Docs MCP**). If global CSS only sets **`margin-left: 0 !important`** when **`expanded === false`** (e.g. a **`side-nav-overlay-collapsed`** class on the shell), then **opening** the drawer can let Modus apply a **non-zero** inset on **`main`**, and **closing** removes it — the main column **jumps horizontally**. Overlay UX expects the drawer to **float over** a **stable**, **full-width** main column.

**Required:** under the **same `max-width`** (or container query) breakpoint where JS sets **`mode === 'overlay'`**, scope **`targetContent`** (e.g. **`#main-content`**) so **`main` stays full-bleed for drawer open and closed:**

```css
@media (max-width: /* matches PUSH_LAYOUT_MIN_PX - 1, e.g. 1023px */) {
  .app-shell #main-content {
    margin-left: 0 !important;
  }
}
```

Use your real shell scope class (e.g. **`.app-shell`**) — see **`modus-side-nav`** for the root-class contract. **`!important`** overrides Modus **inline** margins when they are set without `!important`. **Do not** apply this rule on viewports where **`mode === 'push'`** — desktop **`push`** still relies on **`4rem` / `maxWidth`** inset via Modus + stylesheet reserve.

**Optional:** on the scrolling **`targetContent`** element, **`scrollbar-gutter: stable`** reduces residual **horizontal** jitter when the vertical scrollbar appears or disappears during drawer toggle.

#### Collapsed drawer — hide the persistent rail strip

With **`mode="overlay"`** and **`expanded={false}`**, Modus still sizes the inner panel to **`minWidth`** (**`4rem`**) and **`setTargetContentMargin`** behavior can leave a **persistent collapsed strip** / gutter — which is **not** “overlay only when the user opens the menu.”

**Apps must add thin shell rules** (this is **not** a second overlay system; it corrects collapsed overlay chrome):

1. **Rail wrapper width:** when **`mode === 'overlay'`** and **`!expanded`** at your **overlay breakpoint**, set the **fixed rail wrapper** width to **`0`** (with **`overflow: hidden`**, **`pointer-events: none`**) so the collapsed rail does **not** reserve horizontal space or steal hits. **Accessibility:** set **`inert`** on this wrapper when collapsed — **do not** use **`aria-hidden="true"`** on the wrapper unless focus is guaranteed outside the subtree; otherwise Chrome logs *Blocked aria-hidden on an element because its descendant retained focus* (focus often appears on **`i.modus-wc-icon`** inside a menu row). When collapsing, **`useLayoutEffect`**: if **`wrapper.contains(document.activeElement)`**, **`focus()`** **`#main-content`** (add **`tabIndex={-1}`** on **`main`** only if needed) or the navbar control, then apply **`inert`**. When **`expanded`**, remove **`inert`** and set wrapper width back to **`maxWidth`** (e.g. **`256px`**) so the drawer paints above content. See **`.cursor/rules/modus-accessibility.mdc`** → **Collapsed overlay rail shell** (or your workspace copy of the Modus accessibility rule).
2. **Breakpoint parity:** the **`max-width`** (or container query) for the rail-wrapper rule must match the JS breakpoint where **`mode`** is **`overlay`** (e.g. **`1023px`** when **`PUSH_LAYOUT_MIN_PX` is `1024`**).

Desktop **`push`** + collapsed should **keep** the **`minWidth`** strip and Modus margins—do not apply the collapsed-overlay rail-wrapper dismiss rules on wide layouts.

## Recommended page structure

**Column shell** (fills viewport, no double scroll):

```text
app-root (e.g. h-dvh min-h-0 flex flex-col overflow-hidden)
├── modus-wc-navbar                    ← default: sticky top-0 + host z (e.g. 120)
├── (optional) secondary top bars      ← include in rail top/height math
└── app-body-row (flex-1 min-h-0 flex overflow-hidden relative)
    ├── side-rail-wrapper              ← fixed left-0; z vs navbar per Stacking §
    │   └── modus-wc-side-navigation
    └── main#main-content (flex-1 min-w-0 overflow-auto)
```

If the rail is **in-flow** in a flex row (Pattern B), you skip **`fixed`** **`top`** / **`height`** on the wrapper—see **Pattern B**.

## Modus navbar — main menu (hamburger) button

The top **`modus-wc-navbar`** can expose a **main menu** control (hamburger). Use it to open/close the side rail **only if** you turn that slot on and wire props + events.

### 1) Show the control

Set **`visibility.mainMenu: true`** (or the framework equivalent on **`ModusWcNavbar`**) so the hamburger is rendered. Other **`visibility`** flags stay off unless you need those slots.

### 2) One source of truth for the rail

Keep **`expanded`** on **`modus-wc-side-navigation`** bound to the same boolean as the rest of the app (e.g. **`sidebarOpen`** / **`sideNavExpanded`**). **`onExpandedChange`** should update that boolean from **`event.detail`** so collapsing the rail from the rail’s own UI, keyboard, or **`collapseOnClickOutside`** stays consistent.

### 3) Required — built-in hamburger; mirror vs decouple `mainMenuOpen` from the rail

**Always** use Modus’s **built-in** main-menu control (**`visibility.mainMenu: true`**). **Never** replace it with a **custom** **`ModusWcButton`** (or similar) in **`slot="start"`** whose only job is to open the rail—that duplicates chrome and drifts from Modus behavior (accessibility, condensed layout, focus).

Use **one boolean** (**`sideNavExpanded`**) for **`expanded`** plus **`onExpandedChange`** syncing that state. **`mainMenuOpen` wiring depends on architecture:**

#### A — Mirror (**default** when the navbar **`slot="main-menu"`** holds real flyout UI, or **`mode === 'overlay'`** only)

Treat the hamburger-driven flyout as the same **`open`** as the rail drawer:

- **`mainMenuOpen={sideNavExpanded}`**
- **`onMainMenuOpenChange={(e) => setSideNavExpanded(Boolean(e.detail))}`**
- **`expanded={sideNavExpanded}`**, **`onExpandedChange`** → same setter

Confirm **Modus Docs MCP** (**`modus-wc-navbar`**, **`version`**) so **`detail`** is **`boolean`** in your bundle.

#### B — **`push`/desktop sibling rail (`Pattern A`), empty `slot="main-menu"`** (recommended for dashboard shells)

Mirroring **`mainMenuOpen={sideNavExpanded}`** (**true whenever the left rail expands**, e.g. **XL-default-expanded**) keeps **`modus-wc-navbar`'s** internal **`.main-menu`** shell in **`visible`** / **`display: block`** even with **no** slotted menu body. Modus styles that wrapper with **full viewport minus navbar height** + **`min-width: 256px`**—an **opaque-to-clicks slab** stacking **above** **`main`** (confirm exact rules via **Modus Docs MCP → `modus-wc-navbar`** for your **`version`**).

**Prefer decoupling on `push`/desktop:**

- **`mainMenuOpen={isDesktop ? false : sideNavExpanded}`** (or equivalent **`mode === 'push'`** gate).
- **`onMainMenuOpenChange`:** **`push`** → **`setSideNavExpanded((prev) => !prev)`** (each hamburger press toggles rail; declarative **`false`** resets internal flyout immediately); **`overlay`** → **`setSideNavExpanded(Boolean(e.detail))`** (**mirror**, same as §A).
- Resync **`navbarHost.mainMenuOpen`** after **`location`** / **`sideNavExpanded`** / breakpoint changes: **`overlay`** → **`sideNavExpanded`**; **`push`** → **`false`**.

Rail **still** uses **`expanded={sideNavExpanded}`**—only the **navbar flyout** stays **closed**.

**Duplicate flyout / empty shell — secondary mitigations (after §B or real `slot="main-menu"`):** **Rail `z-index` above navbar** when overlaps matter (**Stacking** §). Optionally hide visuals via shadow-only **`display: none`**—fragile across **`version`** bumps; MCP first.

**Forbidden:** **`mainMenu: false`** plus a **custom** hamburger in **`slot="start"`**. **Forbidden:** silent **`visibility.mainMenu: true`** with **no** **`onMainMenuOpenChange`** handler that toggles or drives **`sideNavExpanded`**.

**Allowed (not stale “legacy blueprint”):** controlled **`mainMenuOpen={false}`** on **`push`** **with** **`onMainMenuOpenChange`** that updates **`sideNavExpanded`** (**§B**) when **`slot="main-menu"`** is intentionally empty.

### 4) Legacy blueprint note

Samples that omitted **`visibility.mainMenu`**, **`onMainMenuOpenChange`**, or user-facing sync—**avoid**. **§3.B** (**decouple on `push`**, toggle rail in **`onMainMenuOpenChange`**) **is deliberate** when the **rail is a sibling** and the **navbar **`main-menu`** flyout unused**—not **`mainMenuOpen` stuck **`false`** with handlers missing**.

### 5) Breakpoints and the hamburger

If you **auto-close** the rail on mobile/medium resize or **on route change**, updating **`sideNavExpanded`** stays aligned with **`mainMenuOpen`** per **§3.A** (**mirror**) or **§3.B** (**resync **`false`** on `push`**). When **`mode`** switches at a breakpoint, re-read **`targetContent`** / margin behavior via MCP so the first frame after resize does not flash wrong layout.

If you use **§ Preferred default: expanded rail on XL**, **`isXl`** drives **default** **`expanded`** on resize; **`isDesktop`** still drives **`mode`** and **overlay** shell rules—keep both breakpoints in sync with CSS (**`768px`** vs **`1280px`**).

### 6) Navbar `handleClickOutside` vs mirrored rail (double hamburger click)

With **`mainMenuOpen`** **mirror-bound** (**§3.A**) or **`mobile` overlay**, **`modus-wc-navbar`** listens for **document `click`**. Clicks on **items in `modus-wc-side-navigation`** are “outside” the navbar’s **`.main-menu`** shell. In current Modus builds, that path sets **`mainMenuOpen = false` internally** but **does not emit `mainMenuOpenChange`**, so app state can stay **`true`** while the navbar toggle thinks **`false`**. The next hamburger press does **`!false → true`** (no collapse); the **second** press collapses.

**Fix:** after **`NavigationEnd`** / route change (and optionally after **`navigateByUrl`**), **`setTimeout(..., 0)`** then assign **`navbarHost.mainMenuOpen = sideNavExpanded`** when **mirror coupling** (**§3.A**) or assign **`false`** when using **§3.B** **`push`** decouple (same **`syncNavbarMainMenuOpenFromState`** rhythm—values differ).

## Pattern A — Fixed rail under sticky navbar (**default**, blueprint-style)

Use this as the **default**: top navbar is **sticky**, side rail wrapper is **`fixed`** so both stay as pinned chrome while **`#main-content`** scrolls.

1. Give **`modus-wc-navbar`** **`sticky top-0`** (and **`flex-shrink-0`**) via **`customClass`** or equivalent global styles.
2. Wrap **`ModusWcSideNavigation`** in a positioned wrapper (`fixed` or `absolute` in a constrained preview) with:
   - **`left: 0`**, **width keyed to **`expanded`** and **`mode`** (see **Default positioning**, bullet **2**—no constant **`maxWidth`** wrapper on **`push` + collapsed**).
   - **`z-index`** per **Stacking — navbar host vs `.main-menu.visible` vs fixed side rail** (when **`mainMenuOpen`** is **mirror-bound** (**§3.A**), rail **above** navbar host, e.g. rail **`130`**, navbar **`120`**).
   - **`top`** = measured navbar (+ optional bars) height.
   - **`height: calc(100dvh - top)`** so the rail fills the viewport below the nav.
3. **`main#main-content`**: `flex: 1; min-width: 0; overflow: auto;` and **synchronize horizontal offset** with **`expanded`** and **`mode`** (see **Main margin sync** and **Modus `mode`** above).

**Mobile:** use **`mode="overlay"`** first. Only if the product standard is blueprint-compatible **push + CSS**, add a **single** coordinated layer (translate / backdrop) aligned to the **same breakpoint** as your **`isDesktop`** flag—**do not** add a custom overlay stack on top of **`push`** while claiming “Modus overlay.”

## Pattern B — Flex shell + reserved width (no fixed rail)

**Alternative** to Pattern A when nav + main are **siblings** in a **horizontal flex row** and the rail should participate in layout (in-flow rail; navbar may still be **sticky** on the column, but the rail is not **`fixed`**).

1. **`app-body-row`**: `display: flex; flex: 1; min-height: 0; overflow: hidden; position: relative;`
2. **Shell** around `modus-wc-side-navigation`: toggles classes for **collapsed vs expanded width** on desktop (e.g. `4rem` / `256px` aligned with **`minWidth`** / **`maxWidth`** on the component).
3. **`main`**: `flex: 1; min-width: 0; overflow: auto;`

**`targetContent`:** If the shell already reserves width, **do not** also point `targetContent` at `#main-content`—you get **rail + margin**. Prefer a **sentinel id** that matches no element (e.g. `#__modus_side_nav_no_margin__`) **only for this double-offset case**, then own margins deliberately. Clear stale **`margin-left`** on main when switching patterns. **Do not** use a sentinel **only** to avoid using **`mode="overlay"`** on mobile.

### Pattern B — invisible rail and theme provider (Angular / Vite / Webpack)

These issues are **layout/CSS**, not missing Modus props:

1. **Host `height: 100%` collapses the menu** — The inner **`.modus-wc-side-navigation`** panel is **`position: absolute; height: 100%`** of the **`modus-wc-side-navigation` host**. The package sets the host to **`height: 100vh`**. If app CSS sets **`height: 100%`** on the host while the shell sits in a **flex** row with **`min-height: 0`** (scroll-lock pattern), the percentage can resolve to **`0`**, so the inner panel height is **0** → **empty gutter**, icons never paint. **Fix:** remove host **`height: 100%`**; keep **`width: 100%`** on the host; use shell **`align-self: stretch`** + **`display: flex; flex-direction: column`**. Prefer package **`100vh`** or an explicit **`calc(100dvh - …)`** if you must override.

2. **`modus-wc-theme-provider` breaks the flex chain** — The provider renders only a **slot** and often defaults to **`display: inline`**. If it wraps **`.app-shell`**, add **`display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; min-width: 0`** on the provider and make **`app-root` / `#root`** a **column flex** viewport fill (same idea as **`modus-wc-integration`** for React **`#root > modus-wc-theme-provider`**).

For **navbar `shadowRoot`** flyout tweaks (empty **`slot="main-menu"`**), prefer **z-index stacking** (**Stacking — navbar host vs `.main-menu.visible` vs fixed side rail**) before shadow-only **`display: none`** hacks; confirm inner DOM with **Modus Docs MCP** for your **`version`**.

## Main margin sync (`targetContent` + imperative nudge)

**Default (push on desktop):** use **`targetContent="#main-content"`** (or your main id) and let **`setTargetContentMargin`** run when **`expanded`** / **`mode`** / **`targetContent`** change.

**Overlay band:** do **not** rely on Modus margins to “push” **`main`** — force **full-bleed** **`main`** with scoped **`margin-left: 0 !important`** for the whole viewport band where **`mode === 'overlay'`** (see **Overlay mode — full-bleed `targetContent` + collapsed rail shell**). Otherwise **`expanded`** toggles can change **`targetContent`** inset and the layout **jumps**.

When **`expanded`** is **true** on **`push`** (especially **XL-default-expanded**), **always** add the **`useLayoutEffect` + double `requestAnimationFrame`** **`maxWidth`** nudge on **`#main-content`** in addition to **`targetContent`** — **`setTargetContentMargin`** can still **lag** first paint or race framework render. Keep **`maxWidth`** in **one constant** with the component prop.

**First-paint / SPA:** Prefer a **desktop-only CSS `margin-left: minWidth`** on **`#main-content`** (see **Push + collapsed — `setTargetContentMargin` can miss entirely**) so **`collapsed` + `push`** never covers the main column before Stencil runs. The **double-rAF `maxWidth`** nudge covers the **expanded** case; add a **`minWidth`** mirror only if you still measure a **collapsed** race after that.

**Do:**

- Drive **`expanded`** and **`mode`** from app state (**dashboard shells:** **`isXl`** for default **expanded** on **XL+**, **`isDesktop`** for **`push` / `overlay`** — see **§ Preferred default: expanded rail on XL**); confirm margin rules with **MCP** for your **`version`**.
- Keep a **ref** with the **latest breakpoint** (`mobile` / `desktop`) so delayed handlers do not close over a stale **`isMobile`** after resize.
- On **viewport `useLayoutEffect`**, update breakpoint **before paint** when **`mode`** or widths change.
- **`useEffect` on `location.pathname`** (and optionally **`search`**): when **`mode === 'overlay'`**, **set `expanded` to `false`** so the drawer closes after in-app navigation (see **Route / URL changes — close the overlay drawer**); then **resync margins** / navbar **`mainMenuOpen`** so layout does not desync on the next route.

**Optional:** after `customElements.whenDefined('modus-wc-side-navigation')`, if expanded and margin is still wrong, **nudge** once (guard so you do not fight the user forever).

## Navbar ↔ side nav state (summary)

- **Rail:** **`expanded={sideNavExpanded}`**, **`mode={…}`**, **`onExpandedChange`** → **`setSideNavExpanded(detail)`**.
- **Navbar:** **`visibility.mainMenu: true`**; **`mainMenuOpen` / **`onMainMenuOpenChange`** per **§3** (**mirror overlay + optional slot content** vs **`push` sibling + empty **`main-menu`** decouple**). **Never** a custom-only menu button in **`slot="start"`**.

## Mobile: body scroll lock

When the drawer is open on small/medium breakpoints, **lock** document scroll **only if** background scroll still occurs after **`mode="overlay"`** and your shell CSS (measure in target browsers).

If you add lock:

- Set **`overflow: hidden`** on **`html`**, **`position: fixed`** on **`body`** with **`top: -scrollY`** to preserve scroll position; restore on close.
- Optionally set **`overflow: hidden`** on **`#main-content`** while open; restore when closed.
- Restore **`window.scrollTo`** saved Y on teardown.

## Menu content and submenus

**Required: wrap items in `modus-wc-menu` (or `ModusWcMenu`).** The **`modus-wc-side-navigation`** default slot should contain a **single** **`modus-wc-menu`** whose slotted children are the **`modus-wc-menu-item`** rows—not bare **`modus-wc-menu-item`** nodes as direct children of the side nav. **Modus** implements **`modus-wc-menu`** with a **`<ul class="modus-wc-menu">`**; package CSS sets **`list-style: none`** on that list. Each **`modus-wc-menu-item`** renders an internal **`<li>`**; without the parent **`ul`** from **`modus-wc-menu`**, list semantics and styles are wrong and **stray bullet markers** can appear beside rail icons in some engines. Copy the **“Side Navigation”** story structure: **`<modus-wc-side-navigation> → <modus-wc-menu size="…"> → <modus-wc-menu-item>…`**.

```tsx
<ModusWcSideNavigation /* … */>
  <ModusWcMenu size="md" customClass="w-full">
    <ModusWcMenuItem label="Home" value="home" /* … */>
      <ModusWcIcon slot="start-icon" name="home" size="md" />
    </ModusWcMenuItem>
  </ModusWcMenu>
</ModusWcSideNavigation>
```

- Use **`modus-wc-menu`** + **`modus-wc-menu-item`**; **`itemSelect`** / **`onItemSelect`** for navigation.
- **Icons (`slot="start-icon"`):** use **`modus-wc-icon`** / **`ModusWcIcon`** at **`size="md"`** by default for every primary rail item (collapsed and expanded). This matches readable chrome in the rail; **`xs`** / **`sm`** are for denser **card title rows** or **toolbar** patterns, not the main side nav list. Confirm allowed **`size`** values with **Modus Docs MCP** for your **`version`**. Use only valid Modus icon **`name`** strings (see **modus-wc-icons-setup**).
- **Do not** add horizontal **`padding`** on **`modus-wc-menu-item`** hosts inside **`modus-wc-side-navigation`**: Modus already applies horizontal inset on the inner **button**; host padding **stacks** and widens the gutter. Use **`padding-inline: 0`** on the host; change **button** padding only if you need a tighter rail.
- **Submenus:** set **`hasSubmenu`** / **`isSubMenu`** after **`whenDefined`** if Modus omits them for dynamic trees; **`collapseSubmenu()`** when collapsing the rail so nested dropdowns do not stay open.
- **Spacer** row at bottom of menu (`flex-shrink-0`) can help **footer actions** stay reachable in short viewports.

## Submenu / active styling (optional)

If you need **“expanded parent ≠ active route”**, use a **custom class** on parents that match the route (e.g. `blueprint-side-nav-parent-active`) and style separately from **`.modus-wc-menu-item-expanded`**.

## Integrating into an existing app (checklist)

1. [ ] **Responsive `mode`:** **`overlay`** narrow / **`push`** wide (or explicit product decision for blueprint-style push-only + CSS—document which). Confirm props with **Modus Docs MCP** (**`version`**).
2. [ ] **First paint (`push`):** (a) for **collapsed** rail, add **desktop CSS `margin-left: 4rem`** (or your **`minWidth`**) on **`targetContent`**; optionally add **`useLayoutEffect` + double `requestAnimationFrame`** with **`minWidth`** if **`setTargetContentMargin`** still misses **`main` on frame zero** (see **Push + collapsed — `setTargetContentMargin` can miss entirely**). (b) **Preferred:** **XL (`min-width: 1280px`)** default **expanded** — **`useState` initializer** + **`useEffect` on `isXl`** per **§ Preferred default: expanded rail on XL**, plus **required** **`useLayoutEffect` + double `requestAnimationFrame`** **`maxWidth`** nudge on **`#main-content`** whenever **`isDesktop && sideNavExpanded`** (see **First paint: `expanded={true}` on push**). **Alternate:** all-breakpoints **closed** on first load if the product is drawer-first.
3. [ ] **Overlay band (`mode === 'overlay'`):** (a) **`targetContent`** **`margin-left: 0 !important`** for the **entire** narrow breakpoint (drawer open **and** closed) so **`expanded`** toggles do not jog **`main`** horizontally; optional **`scrollbar-gutter: stable`** on the scroll owner. (b) When **`!expanded`**, rail wrapper **`width: 0`**, **`overflow` / `pointer-events`**, **`inert`** when collapsed — **no** **`aria-hidden="true"`** on the wrapper while focus may remain inside; **`useLayoutEffect`** moves focus out when **`wrapper.contains(document.activeElement)`** (see **Collapsed drawer — hide the persistent rail strip**). Same **`max-width`** / JS threshold as **`mode`** flip.
4. [ ] Default **Pattern A**: **sticky** **`modus-wc-navbar`**, **`fixed`** side-rail wrapper, measured **`top`** / **`height`**. Reconcile wrapper with **`overlay`** so there is no duplicate custom overlay. Use **Pattern B** only if in-flow rail fits better; **sentinel `targetContent`** only for double-offset, not to bypass **`mode`**.
5. [ ] **Measure** chrome height for rail **`top`** / **`height`**; re-measure on resize.
6. [ ] **Z-index / stacking:** overlay / rail / backdrop tuned to your app. If using **§3.A** (mirror **`mainMenuOpen`** to **`expanded`**), fixed rail **`z-index` must exceed **`modus-wc-navbar`** host so **`.main-menu.visible`** does not steal pointer events (**Stacking — navbar host vs `.main-menu.visible` vs fixed side rail**). Prefer **§3.B** (**`push` + empty **`main-menu`**) rather than stacking alone when the flyout slot is unused. Do **not** assume “rail below navbar” under **§3.A**.
7. [ ] One **`sideNavExpanded`** state wired to **`expanded`** / **`onExpandedChange`**; **`mainMenuOpen`** / **`onMainMenuOpenChange`** per **Navbar — main menu §3** (**§3.A mirror** vs **§3.B `push`/desktop decouple**). After route navigation, collapse overlay only when **`mode="overlay"`**; **§6** resync **`navbarHost.mainMenuOpen`**: mirrored value when **`overlay`**, or **`false`** on **`push`** when using **§3.B**.
8. [ ] **`targetContent`** points at real **`main`** unless Pattern B sentinel is required; never **`""`**.
9. [ ] **`collapseOnClickOutside`** matches desktop vs mobile product rules; **overlay SPAs** also **collapse `expanded` on route changes** (see **Route / URL changes — close the overlay drawer**).
10. [ ] **Scroll lock** only if still needed after **`overlay`**; remove redundant custom backdrops when **`mode="overlay"`** covers the UX.
11. [ ] **React:** avoid unmounting **`slot="..."`** nodes for toggles—prefer **`hidden`** / classes on stable trees (see slotted-hosts skill).
12. [ ] **Menu wrapper:** side nav slot contains **`modus-wc-menu`** (or **`ModusWcMenu`**) **wrapping** all **`modus-wc-menu-item`** nodes—**never** bare menu items as direct children of **`modus-wc-side-navigation`** (prevents spurious list bullets; see **Menu content and submenus**).
13. [ ] **Rail icons:** each **`modus-wc-menu-item`** includes **`modus-wc-icon`** in **`slot="start-icon"`** at **`size="md"`** by default (unless product spec says otherwise); valid **`name`** per Modus Icons.
14. [ ] **`Pattern A` fixed rail wrapper** width (**Default positioning**, bullet **2**): on **`push` + collapsed**, match **`minWidth`** (~**4rem**)—never a **`maxWidth`-only** (**e.g.** 256px) **fixed** column over **`main`**. Overlay **expanded**: **`maxWidth`**; overlay **collapsed**: **0-width** + **`pointer-events: none`** (skill **Overlay mode**).
15. [ ] **`mainMenuOpen` coupling:** **`push`/desktop sibling rail + unused `slot="main-menu"`** → **§3.B** (**decouple**). Avoid **§3.A** mirror unless the navbar flyout is real overlay content or **`mode`** is **`overlay`** only.

## Reference implementation

The **modus-blueprint** app implements **Pattern A** with **`sticky`** navbar, **`fixed`** rail, **`targetContent`**, optional manual margin nudge, scroll lock, and route-collapse—see blueprint **`App.tsx`** / **`#main-content`**. Blueprint may use **push + CSS** for small viewports; **new apps should prefer `mode="overlay"` on mobile** unless explicitly matching blueprint.

**Rail chrome — default is token fill only:** `modus-wc-side-navigation` already paints the inner panel with **`background: var(--modus-wc-color-base-page)`**. **Do not** copy blueprint/demo **decorative rail treatments** — e.g. global rules that set **`background-image`** on **`.modus-wc-side-navigation`** (often SVG “wave” / mesh assets such as **`Sidenavpattern.svg`** / **`Sidenavdarkpattern.svg`**) — unless the **product explicitly** asks for that marketing texture. Those files are **not** part of the Modus package contract; omit them in greenfield scaffolds.

From blueprint **`globals.css`** (and similar), borrow **layout/behavior only** (margins, rail wrapper width, breakpoints, stacking, scroll lock)—**not** rail **background-image** branding.

**This skill’s preferred XL-expanded stack** is exemplified in the **Modus Analytics** reference app: **`AppShell.tsx`** (**`isDesktop` / `isXl`**, **`sideNavExpanded`**, overlay close on **`location.pathname`**, double-rAF **`#main-content`** margin, navbar **`mainMenuOpen`** resync), **`globals.css`** (**`#main-content`** desktop **`4rem` / expanded **`256px`**; **overlay breakpoint** **`margin-left: 0 !important`** on **`main` for the whole band**, rail **`z-index`** above the navbar host), and **`main.tsx`** (app bootstrap / providers as needed for your stack).

Start from **sticky navbar + fixed rail** + **breakpoint `mode`**; only fall back to single-mode push + CSS overlay when the product requires blueprint parity.
