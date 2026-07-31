export interface NavItem {
  label: string;
  href: string;
}

/** Public marketing nav — (marketing) route group. */
export const marketingNav: NavItem[] = [
  { label: "Destinations", href: "/destinations" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Signed-in traveler nav — (dashboard) route group. */
export const dashboardNav: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Trips", href: "/trips" },
  { label: "Bookings", href: "/bookings" },
  { label: "Profile", href: "/profile" },
];

/** Admin/staff nav — (admin) route group. */
export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin" },
  { label: "Trips", href: "/admin/trips" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Users", href: "/admin/users" },
];
