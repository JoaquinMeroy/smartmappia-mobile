import { Link } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { useAuth } from "../../lib/AuthProvider";
import MobileBottomNav from "./MobileBottomNav";

// variant: 'tabs' (top-level hub screens — logo header, bottom nav visible)
//          'detail' (drilled-in screens — back-arrow header, no bottom nav)
export function MobilePortalShell({
  title,
  subtitle,
  onBack,
  variant = "detail",
  right,
  children,
}) {
  const { user } = useAuth();
  const showTabs = variant === "tabs";

  return (
    <div className="min-h-screen bg-brand-muted flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-brand-border">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {!showTabs && onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg active:bg-brand-surface text-brand-dark shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {showTabs && (
              <img
                src="/mappia-new-logo.png"
                alt=""
                className="w-7 h-7 object-contain shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="font-black text-brand-black text-sm truncate">
                {title}
              </div>
              {subtitle && (
                <div className="text-[11px] text-brand-grey truncate">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {right}
            {showTabs && user && (
              <Link
                to="/notifications"
                className="p-2 rounded-lg active:bg-brand-surface text-brand-dark"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-1 px-4 py-4 ${showTabs ? "pb-24" : "pb-6"}`}>
        {children}
      </main>

      {showTabs && <MobileBottomNav />}
    </div>
  );
}
