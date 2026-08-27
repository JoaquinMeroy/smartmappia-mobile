import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Wifi } from "lucide-react";
import { useNotifications } from "../lib/useNotifications";
import { notificationMeta, relativeTime } from "../lib/notifications";
import { MobilePortalShell } from "../components/mobile/MobilePortalShell";
import { Card, Spinner } from "../components/ui";
import { TONE_CLASSES } from "../lib/constants";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { items, loading, unreadCount, connected, markAllRead, seenAt } =
    useNotifications();

  useEffect(() => {
    if (unreadCount > 0) markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUnread = (item) => {
    if (item.read_at !== undefined) return !item.read_at;
    const at = item.created_at || item.sent_at;
    if (!seenAt) return true;
    return at && new Date(at) > new Date(seenAt);
  };

  return (
    <MobilePortalShell
      variant="tabs"
      title="Notifications"
      subtitle={connected ? "Live updates on" : "Your recent alerts"}
      right={
        connected ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider px-1.5">
            <Wifi className="w-3.5 h-3.5" /> Live
          </span>
        ) : null
      }
    >
      <div className="space-y-3">
        {items.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-bold text-brand-orange flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>
        )}

        {loading && items.length === 0 && (
          <div className="flex justify-center py-20">
            <Spinner className="!w-8 !h-8" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-10 h-10 text-brand-grey/30 mx-auto mb-3" />
            <p className="font-bold text-brand-dark">No notifications yet</p>
            <p className="text-sm text-brand-grey mt-1">
              We'll alert you here the moment your driver accepts, arrives, or
              your order is on the way.
            </p>
          </Card>
        )}

        {items.map((item) => {
          const meta = notificationMeta(item.type, item.code);
          const Icon = meta.icon;
          const unread = isUnread(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(meta.href)}
              className={`w-full text-left flex gap-3 p-4 rounded-2xl border transition-colors ${
                unread
                  ? "bg-brand-orange/5 border-brand-orange/30"
                  : "bg-white border-brand-border active:border-brand-orange/40"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                  TONE_CLASSES[meta.tone] || TONE_CLASSES.grey
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-brand-dark">
                    {meta.title}
                  </span>
                  {unread && (
                    <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                  )}
                </span>
                {meta.body && (
                  <span className="block text-sm text-brand-grey mt-0.5">
                    {meta.body}
                  </span>
                )}
                <span className="block text-xs text-brand-grey/80 mt-1">
                  {relativeTime(item.created_at || item.sent_at)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </MobilePortalShell>
  );
}
