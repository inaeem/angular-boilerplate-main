import { ROLE } from '../../auth/enums/roles.enum';
import { NavMenuItem } from '@core/interfaces';

// THIS FILE CONTAINS THE NAVIGATION MENU ITEMS FOR THE SIDEBAR AND ALL OTHER NAVIGATION MENUS WHICH ARE USED IN THE APPLICATION AND ARE CONSTANT

/**
 * Navigation menu items for WEB Sidebar
 */
export const webSidebarMenuItems: NavMenuItem[] = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    active: true,
    icon: 'home',
  },
  {
    href: '/users',
    title: 'Users',
    active: false,
    icon: 'users',
    roles: [ROLE.ADMIN],
  },
  {
    href: '/sales',
    title: 'Sales',
    active: false,
    icon: 'currency-dollar',
    roles: [ROLE.ADMIN, ROLE.USER, ROLE.MEMBER],
  },
  {
    href: '/products',
    title: 'Products',
    active: false,
    icon: 'package',
    roles: [ROLE.ADMIN],
    subItems: [
      {
        href: '/products',
        title: 'All Products',
        active: false,
        icon: 'list',
      },
      {
        href: '/products/add',
        title: 'Add Product',
        active: false,
        icon: 'plus',
      },
      {
        href: '/product-categories',
        title: 'Product Categories',
        active: false,
        icon: 'category',
      },
      {
        href: '/product-types',
        title: 'Product Types',
        active: false,
        icon: 'tags',
      },
      {
        href: '/product-attributes',
        title: 'Product Attributes',
        active: false,
        icon: 'list-details',
      },
    ],
  },
  {
    href: '/contact',
    title: 'Contact Us',
    active: false,
    icon: 'mail',
  },
  {
    href: '/settings',
    title: 'Settings',
    active: false,
    icon: 'settings',
    divider: true,
  },
];
