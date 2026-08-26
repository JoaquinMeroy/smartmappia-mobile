import { NavLink } from "react-router-dom";
import { Home, Plane, UtensilsCrossed, Bell, User } from "lucide-react";

const TABS = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/book", icon: Plane, label: "Book" },
  { to: "/food", icon: UtensilsCrossed, label: "Food" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-brand-border">
      <div className="flex items-stretch justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 text-[11px] font-bold transition-colors ${
                isActive ? "text-brand-orange" : "text-brand-grey"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
