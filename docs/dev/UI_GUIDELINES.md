# UI Guidelines

## Mobile-First Requirement

**All screens in AFSYS must be fully functional and visually correct on mobile devices.**

This is a hard requirement — every screen must be tested at both desktop and mobile widths before it is considered done.

---

## Breakpoints (Ant Design)

| Breakpoint | Token | Width |
|---|---|---|
| Extra Small | `xs` | < 576px (phones) |
| Small | `sm` | ≥ 576px |
| Medium | `md` | ≥ 768px (tablets) |
| Large | `lg` | ≥ 992px (laptops) |
| Extra Large | `xl` | ≥ 1200px (desktops) |

Use the `useBreakpoint()` hook from `antd/es/grid/hooks/useBreakpoint` to read the current breakpoint in components.

---

## Rules for Every Screen

### Tables
- Always set `scroll={{ x: 'max-content' }}` so tables scroll horizontally on small screens.
- On mobile (`xs`), hide non-essential columns and keep only the primary identifier and action buttons.
- Use `size="small"` on mobile.

### Modals / Drawers
- Modal `width` must be responsive: `90vw` on mobile, fixed pixels on desktop.
- Prefer `Drawer` over `Modal` for forms on mobile — it feels more natural.
- Form labels use `layout="vertical"` always (horizontal layouts break on narrow screens).

### Buttons
- Action buttons (`Add`, `Save`, etc.) must be full-width on mobile.
- Table row action buttons (Edit / Delete) must remain accessible — do not hide them on mobile.

### Layout
- The sidebar collapses to a drawer on mobile using `breakpoint="lg"` on the `Sider`.
- Content padding: `24px` on desktop, `12px` on mobile.
- Never use fixed pixel widths on containers — use `100%` or Ant Design `Col` spans.

### Typography
- Font sizes scale down on mobile — use Ant Design's `Typography` components, not raw `<h1>` tags.

---

## Implementation Pattern

```jsx
import { Grid } from 'antd';
const { useBreakpoint } = Grid;

export default function MyPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      <Table
        scroll={{ x: 'max-content' }}
        size={isMobile ? 'small' : 'middle'}
        ...
      />
      <Modal width={isMobile ? '95vw' : 600} ... />
    </div>
  );
}
```

---

## Definition of Done — UI

A screen is considered mobile-ready when:
- [ ] Renders correctly at 375px width (iPhone SE)
- [ ] Renders correctly at 768px width (tablet)
- [ ] Table scrolls horizontally without overflow clipping
- [ ] Forms are fully usable with a touch keyboard
- [ ] Buttons are at least 44px tall (touch target minimum)
- [ ] No horizontal page scroll on mobile (only table scroll inside its container)
- [ ] Sidebar collapses on mobile
