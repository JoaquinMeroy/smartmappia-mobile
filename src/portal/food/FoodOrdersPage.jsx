// ---------------------------------------------------------------------
// Food Delivery — order history: /food/orders
// Past + live orders with status badges, Track, and Order again.
// ---------------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UtensilsCrossed, RefreshCw, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { fmtSAR, foodStatusMeta, foodPaymentMeta } from "../lib/constants";
import { MobilePortalShell } from "../components/mobile/MobilePortalShell";
import { Card, Badge, Spinner, btnPrimary, btnGhost } from "../components/ui";

export default function FoodOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    try {
      setOrders((await api.foodOrders()).orders || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <MobilePortalShell
      variant="detail"
      title="My food orders"
      onBack={() => {
        if (location.key !== "default") navigate(-1);
        else navigate("/food");
      }}
    >
      <div className="space-y-3">
        {error && (
          <Card className="p-6 text-center">
            <p className="text-brand-dark font-bold mb-1">
              Could not load your orders
            </p>
            <p className="text-sm text-brand-grey mb-4">{error}</p>
            <button type="button" onClick={load} className={btnPrimary}>
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </Card>
        )}

        {!orders && !error && (
          <div className="flex justify-center py-20">
            <Spinner className="!w-8 !h-8" />
          </div>
        )}

        {orders && orders.length === 0 && (
          <Card className="p-10 text-center">
            <UtensilsCrossed className="w-10 h-10 text-brand-grey/40 mx-auto mb-3" />
            <p className="font-bold text-brand-dark">No orders yet</p>
            <p className="text-sm text-brand-grey mt-1 mb-4">
              Hungry? Your first order is a tap away.
            </p>
            <Link to="/food" className={btnPrimary}>
              Browse restaurants
            </Link>
          </Card>
        )}

        {(orders || []).map((order) => {
          const status = foodStatusMeta(order.status);
          const pay = foodPaymentMeta(order.payment_status);
          const live = !["delivered", "cancelled", "rejected"].includes(
            order.status,
          );
          return (
            <Card key={order.order_code} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black text-brand-black truncate">
                    {order.merchants?.name || "Restaurant"}
                  </p>
                  <p className="text-xs text-brand-grey font-mono">
                    {order.order_code}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-brand-orange tabular-nums">
                    {fmtSAR(order.total)}
                  </p>
                  <p className="text-[11px] text-brand-grey">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                <Badge tone={status.tone}>{status.label}</Badge>
                <Badge tone={pay.tone}>{pay.label}</Badge>
              </div>
              <div className="flex gap-2 mt-2.5">
                {order.merchants?.id && (
                  <Link
                    to={`/food/r/${order.merchants.id}`}
                    className={btnGhost + " flex-1 !py-2 !text-xs"}
                  >
                    Order again
                  </Link>
                )}
                <Link
                  to={`/food/track/${order.order_code}`}
                  className={
                    (live ? btnPrimary : btnGhost) + " flex-1 !py-2 !text-xs"
                  }
                >
                  {live ? "Track" : "View"}{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </MobilePortalShell>
  );
}
