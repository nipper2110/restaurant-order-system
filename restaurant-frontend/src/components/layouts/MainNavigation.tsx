import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { NavLink } from "react-router";
import GustoLogo from "@/assets/Gusto.png";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: Icons.dashboard },
  { label: "Orders", href: "/orders", icon: Icons.orders },
  { label: "Menu Items", href: "/menuItems", icon: Icons.menuItems },
];

function MainNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-white shadow-md lg:hidden"
        >
          <Icons.menu className="h-5 w-5" />
        </button>
      )}
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-65 flex-col border-r border-[#fbbf24]/50 bg-[#111111] text-white shadow-xl transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <img
              src={GustoLogo}
              alt="Gusto"
              className="h-10 w-10 rounded-full object-contain"
            />

            <span className="text-lg font-bold tracking-wide">
              {siteConfig.name}
            </span>
          </div>

          {/* Mobile close button */}
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <Icons.close className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#fbbf24] text-black"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4d3a00] text-sm font-semibold text-[#fbbf24]">
              A
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">Admin User</p>
              <p className="truncate text-xs text-white/40">admin@gusto.com</p>
            </div>
          </div>

          <div className="mt-4">
            <button className="flex h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">
              <Icons.logout className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default MainNavigation;
