# Tabler.io Bootstrap 5 Dashboard Integration

This document describes the integration of Tabler.io, an open-source Bootstrap 5 admin dashboard template, into the Angular boilerplate.

## Overview

Tabler is a fully responsive, modern admin dashboard built on Bootstrap 5. It provides a comprehensive set of UI components, layouts, and utilities for building professional web applications.

**Official Website**: https://tabler.io
**GitHub Repository**: https://github.com/tabler/tabler
**Documentation**: https://preview.tabler.io/docs/

## Packages Installed

The following packages have been installed:

```bash
npm install @tabler/core @tabler/icons @tabler/icons-webfont --legacy-peer-deps
```

- **@tabler/core** (v1.0.0-beta22) - Core Tabler CSS and JavaScript
- **@tabler/icons** - SVG icon set (5,000+ icons)
- **@tabler/icons-webfont** - Webfont version of Tabler icons for easier use

## Configuration

### 1. Styles (src/styles.scss)

Tabler CSS has been imported in the global styles:

```scss
// Tabler.io - Bootstrap 5 Dashboard (must be imported after @use rules)
@import '@tabler/core/dist/css/tabler.min.css';
@import '@tabler/icons-webfont/dist/tabler-icons.min.css';
```

**Important**: These imports must come after all `@use` rules due to SCSS requirements.

### 2. Scripts (angular.json)

Tabler JavaScript has been added to the build configuration:

```json
"scripts": [
  "node_modules/@tabler/core/dist/js/tabler.min.js"
]
```

This enables interactive components like dropdowns, modals, tooltips, etc.

### 3. Build Budgets (angular.json)

Bundle size budgets have been increased to accommodate Tabler assets:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "2MB",
    "maximumError": "4MB"
  }
]
```

## Updated Templates

All major templates have been updated with Tabler components and styling:

### 1. Login Page (`src/app/auth/login/login.component.html`)

Features:
- Centered authentication card
- Loading state with spinner
- OAuth2 integration support
- Language selector
- Responsive design

Key Tabler classes used:
- `page page-center` - Centered page layout
- `container container-tight` - Narrow container
- `card card-md` - Medium-sized card
- `form-control`, `form-label` - Form components
- `btn btn-primary` - Primary button
- `spinner-border` - Loading spinner

### 2. Shell Layout (`src/app/shell/shell.component.html`)

Features:
- Vertical sidebar navigation
- Horizontal top header
- Responsive page wrapper
- Dark theme sidebar

Key Tabler classes used:
- `page` - Main page wrapper
- `navbar navbar-vertical navbar-expand-lg` - Vertical sidebar
- `page-wrapper` - Content wrapper
- `page-body` - Main content area
- `container-xl` - Extra-large container

### 3. Header (`src/app/shell/components/header/header.component.html`)

Features:
- Top navigation bar
- Language selector
- Notification dropdown
- User profile dropdown with avatar
- Responsive toggler for mobile

Key Tabler components:
- `navbar navbar-expand-md` - Horizontal navbar
- `dropdown` - Dropdown menus
- `avatar` - User avatars
- `badge` - Notification badges
- `nav-link` - Navigation links

### 4. Sidebar (`src/app/shell/components/sidebar/sidebar.component.html`)

Features:
- Collapsible navigation menu
- Icon support (Tabler Icons)
- Active state highlighting
- Nested menu items (dropdowns)
- Permission-based menu display

Key Tabler components:
- `navbar-nav` - Navigation list
- `nav-item` - Menu items
- `nav-link` - Menu links
- `nav-link-icon` - Icon container
- `dropdown-menu` - Submenu dropdown
- `navbar-divider` - Menu dividers

### 5. Dashboard (`src/app/pages/dashboard/dashboard.component.html`)

Features:
- Page header with title and actions
- Statistics cards with trends
- Progress indicators
- Recent activity feed
- Responsive grid layout

Key Tabler components:
- `page-header` - Page title section
- `page-title` - Main heading
- `card` - Content cards
- `row row-deck row-cards` - Card grid
- `progress` - Progress bars
- `badge` - Status badges
- `subheader` - Card subtitles
- `btn-list` - Button groups

### 6. Users List (`src/app/pages/users/list/list.component.html`)

Features:
- Data table with pagination
- Search and filtering
- Bulk actions (checkboxes)
- Per-row action buttons
- Dropdown actions menu
- Avatar display
- Loading state
- Responsive table

Key Tabler components:
- `table table-vcenter` - Vertical-aligned table
- `card-table` - Table inside card
- `form-check-input` - Checkboxes
- `avatar` - User avatars
- `badge` - Status indicators
- `pagination` - Page navigation
- `input-icon` - Search input with icon
- `form-select` - Dropdown selects

## Tabler Icons Usage

Tabler includes 5,000+ icons that can be used with the `ti` class prefix:

### Icon Syntax

```html
<i class="ti ti-home icon"></i>
<i class="ti ti-users icon"></i>
<i class="ti ti-settings icon"></i>
```

### Common Icons Used

- `ti-home` - Home/Dashboard
- `ti-users` - Users
- `ti-settings` - Settings
- `ti-bell` - Notifications
- `ti-logout` - Logout
- `ti-login` - Login
- `ti-plus` - Add/Create
- `ti-download` - Download/Export
- `ti-search` - Search
- `ti-eye` - View
- `ti-edit` - Edit
- `ti-trash` - Delete
- `ti-package` - Products
- `ti-currency-dollar` - Sales/Money
- `ti-chevron-left/right` - Navigation arrows
- `ti-trending-up/down` - Trends

### Icon Browser

Browse all available icons at: https://tabler.io/icons

### Menu Icons Configuration

Icons in the navigation menu are configured in `src/app/@core/constants/nav-menu-items.ts`:

```typescript
export const webSidebarMenuItems: NavMenuItem[] = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    icon: 'home', // Tabler icon name (without 'ti-' prefix)
  },
  {
    href: '/users',
    title: 'Users',
    icon: 'users',
  },
];
```

The icon names are automatically prefixed with `ti-` in the template.

## Key Tabler Components

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    Card content
  </div>
  <div class="card-footer">
    Footer content
  </div>
</div>
```

### Buttons

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-ghost-primary">Ghost</button>
```

### Forms

```html
<div class="mb-3">
  <label class="form-label">Email</label>
  <input type="email" class="form-control" placeholder="Enter email">
</div>

<div class="mb-3">
  <label class="form-check">
    <input type="checkbox" class="form-check-input">
    <span class="form-check-label">Remember me</span>
  </label>
</div>
```

### Avatars

```html
<!-- Image avatar -->
<span class="avatar" style="background-image: url(./path/to/image.jpg)"></span>

<!-- Initials avatar -->
<span class="avatar">JD</span>

<!-- Sizes -->
<span class="avatar avatar-sm">JD</span>
<span class="avatar avatar-md">JD</span>
<span class="avatar avatar-lg">JD</span>
<span class="avatar avatar-xl">JD</span>
```

### Badges

```html
<span class="badge bg-primary">Primary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-danger">Danger</span>
<span class="badge bg-warning">Warning</span>
<span class="badge bg-info">Info</span>
```

### Dropdowns

```html
<div class="dropdown">
  <button class="btn dropdown-toggle" data-bs-toggle="dropdown">
    Dropdown
  </button>
  <div class="dropdown-menu">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" href="#">Separated link</a>
  </div>
</div>
```

### Progress Bars

```html
<div class="progress">
  <div class="progress-bar" style="width: 75%" role="progressbar">
    <span class="visually-hidden">75% Complete</span>
  </div>
</div>

<div class="progress progress-sm">
  <div class="progress-bar bg-primary" style="width: 75%"></div>
</div>
```

### Spinners

```html
<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>

<div class="spinner-border text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

## Layout Classes

### Container Sizes

- `container` - Responsive container
- `container-tight` - Narrow container (authentication pages)
- `container-xl` - Extra-large container
- `container-fluid` - Full-width container

### Grid System

Tabler uses Bootstrap 5's 12-column grid:

```html
<div class="row">
  <div class="col-sm-6 col-lg-3">Column 1</div>
  <div class="col-sm-6 col-lg-3">Column 2</div>
  <div class="col-sm-6 col-lg-3">Column 3</div>
  <div class="col-sm-6 col-lg-3">Column 4</div>
</div>
```

### Spacing Utilities

- `m-0` to `m-5` - Margin
- `p-0` to `p-5` - Padding
- `mt-`, `mb-`, `ms-`, `me-` - Margin top, bottom, start, end
- `pt-`, `pb-`, `ps-`, `pe-` - Padding top, bottom, start, end

### Display Utilities

- `d-none` - Hide element
- `d-block` - Display as block
- `d-flex` - Display as flex
- `d-inline-block` - Display as inline-block
- `d-md-none` - Hide on medium screens and up
- `d-print-none` - Hide when printing

## Color System

### Background Colors

- `bg-primary` - Primary blue
- `bg-secondary` - Secondary gray
- `bg-success` - Success green
- `bg-danger` - Danger red
- `bg-warning` - Warning yellow
- `bg-info` - Info cyan

### Text Colors

- `text-primary`
- `text-secondary`
- `text-success`
- `text-danger`
- `text-warning`
- `text-info`
- `text-muted`
- `text-white`
- `text-body`

## Responsive Design

Tabler is fully responsive with breakpoints:

- `xs` - Extra small (<576px)
- `sm` - Small (≥576px)
- `md` - Medium (≥768px)
- `lg` - Large (≥992px)
- `xl` - Extra large (≥1200px)
- `xxl` - Extra extra large (≥1400px)

## Dark Mode

Tabler supports dark mode. To enable dark mode on the sidebar:

```html
<aside class="navbar navbar-vertical" [attr.data-bs-theme]="'dark'">
  <!-- Sidebar content -->
</aside>
```

To enable dark mode globally:

```html
<html data-bs-theme="dark">
```

## Customization

### Custom Styles

Add custom styles in component-specific SCSS files or in `src/theme/` directory to override Tabler defaults.

### Tabler Variables

Tabler variables can be customized by importing Tabler SCSS instead of the compiled CSS:

```scss
// Override Tabler variables
$primary: #206bc4;
$border-radius: 4px;

// Import Tabler SCSS
@import '@tabler/core/src/scss/tabler';
```

## Performance Considerations

### Bundle Size

Tabler adds approximately:
- **CSS**: ~550KB raw (~51KB gzipped)
- **Icons CSS**: ~205KB raw (~28KB gzipped)
- **JS**: ~83KB raw (~22KB gzipped)

Total: ~840KB raw (~101KB gzipped)

### Optimization Tips

1. **Use only needed icons**: Consider using individual SVG icons instead of the full icon font
2. **Lazy load pages**: Already implemented with lazy-loaded modules
3. **Enable production optimizations**: Built-in with `ng build --configuration=production`
4. **Consider PurgeCSS**: Remove unused CSS in production builds

## Resources

- **Official Documentation**: https://preview.tabler.io/docs/
- **Components**: https://preview.tabler.io/
- **Icons**: https://tabler.io/icons
- **GitHub**: https://github.com/tabler/tabler
- **License**: MIT (free for commercial use)

## Examples

Check the updated templates for complete examples:

- Login: `src/app/auth/login/login.component.html`
- Dashboard: `src/app/pages/dashboard/dashboard.component.html`
- Users List: `src/app/pages/users/list/list.component.html`
- Header: `src/app/shell/components/header/header.component.html`
- Sidebar: `src/app/shell/components/sidebar/sidebar.component.html`

## Troubleshooting

### Icons not displaying

Make sure `@tabler/icons-webfont` is installed and imported in `styles.scss`:

```scss
@import '@tabler/icons-webfont/dist/tabler-icons.min.css';
```

### Dropdowns not working

Ensure Tabler JS is loaded in `angular.json`:

```json
"scripts": [
  "node_modules/@tabler/core/dist/js/tabler.min.js"
]
```

### Styles not applying

Check that Tabler CSS is imported in `styles.scss` and comes after all `@use` rules:

```scss
@import '@tabler/core/dist/css/tabler.min.css';
```

### Build errors

If you encounter SCSS errors, ensure all `@use` rules come before `@import` rules in `styles.scss`.

## Next Steps

1. Customize color scheme to match your brand
2. Add more Tabler components as needed
3. Implement responsive images and tables
4. Add charts using Tabler-compatible libraries
5. Explore Tabler plugins and extensions
