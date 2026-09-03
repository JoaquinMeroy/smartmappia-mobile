// ---------------------------------------------------------------------
// Signed-in user home: /home — the multi-service hub.
// Users land here after sign-in (not directly in Pick & Drop) and choose
// a service. Add new services here as the platform grows.
// ---------------------------------------------------------------------

import { Link } from "react-router-dom";
import {
  Plane,
  UtensilsCrossed,
  ShoppingBag,
  ReceiptText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../lib/AuthProvider";
import { MobilePortalShell } from "../components/mobile/MobilePortalShell";
import { Card } from "../components/ui";

function QuickLink({ to, icon: Icon, title, subtitle }) {
  return (
    <Link to={to}>
      <Card className="p-4 flex items-center justify-between gap-3 active:border-brand-orange/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-brand-grey" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-brand-dark text-sm">{title}</p>
            <p className="text-xs text-brand-grey truncate">{subtitle}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-brand-orange shrink-0" />
      </Card>
    </Link>
  );
}

function ServiceCard({ to, icon: Icon, title, description, cta }) {
  return (
    <Link
      to={to}
      className="block bg-white border border-brand-border rounded-2xl shadow-sm p-5 active:border-brand-orange/50 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-red text-white flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-black text-brand-black">{title}</p>
      <p className="text-sm text-brand-grey mt-1">{description}</p>
      <p className="text-sm font-bold text-brand-orange mt-3 flex items-center gap-1.5">
        {cta} <ArrowRight className="w-4 h-4" />
      </p>
    </Link>
  );
}

export default function HomePage() {
  const { profile } = useAuth();
  const firstName = (profile?.fullName || "").split(" ")[0];

  return (
    <MobilePortalShell
      variant="tabs"
      title="Smart Mappia"
      subtitle={
        firstName ? `Welcome back, ${firstName}` : "What do you need today?"
      }
    >
      <h2 className="text-lg font-black text-brand-black mb-3">
        Choose a service
      </h2>
      <div className="space-y-3">
        <ServiceCard
          to="/book"
          icon={Plane}
          title="Airport Pick & Drop"
          description="Book a ride to or from the airport with a verified driver."
          cta="Book a ride"
        />
        <ServiceCard
          to="/food"
          icon={UtensilsCrossed}
          title="Food Delivery"
          description="Order from local restaurants, delivered to your door."
          cta="Browse restaurants"
        />
        <ServiceCard
          to="/shop"
          icon={ShoppingBag}
          title="Shop"
          description="Groceries, household and everyday essentials, delivered."
          cta="Browse stores"
        />
      </div>

      <div className="mt-4 space-y-3">
        <QuickLink
          to="/transactions"
          icon={ShieldCheck}
          title="Transaction records"
          subtitle="Secure history & PDF receipts for every order and trip"
        />
        <QuickLink
          to="/food/orders"
          icon={ReceiptText}
          title="My food orders"
          subtitle="Track live orders and reorder favorites"
        />
      </div>
    </MobilePortalShell>
  );
}
