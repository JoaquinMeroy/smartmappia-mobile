// ---------------------------------------------------------------------
// Choose a new password from a reset link: /reset-password
//
// THE GATE IS THE POINT OF THIS FILE.
//
// supabaseClient leaves `detectSessionInUrl` at its default of true, so the
// SDK consumes a recovery link and establishes a session on whatever page it
// lands on. If this screen simply rendered a password form, then:
//
//   * someone already signed in on the device who happens to open
//     /reset-password directly would change THEIR OWN password believing
//     they were completing a reset for the link they were sent, and
//   * a stale or already-used link would show a working-looking form whose
//     submit silently applies to whoever the current session belongs to.
//
// So the form only renders once we have positively seen a PASSWORD_RECOVERY
// event (or, on a reload, a recovery session we recorded from one). An
// ordinary signed-in session is NOT sufficient and is refused.
//
// PKCE (see supabaseClient.js) adds one honest failure mode: the verifier
// lives in the localStorage of the browser that REQUESTED the reset, so
// opening the mail elsewhere cannot complete. That surfaces below as an
// expired link with a route back to request a fresh one, not a dead end.
// ---------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { getPasswordValidationError } from "../lib/passwordValidation";
import { btnPrimary, Spinner } from "../components/ui";
import MobileNewPasswordScreen from "./mobile/screens/NewPasswordScreen";

const RECOVERY_FLAG = "sm_password_recovery";
const EXCHANGE_TIMEOUT_MS = 12000;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(() => {
    if (!supabase) return "invalid";
    if (sessionStorage.getItem(RECOVERY_FLAG) === "1") return "ready";
    return "verifying";
  });
  const [error, setError] = useState(() =>
    supabase
      ? null
      : "Sign-in is not configured. Please contact Smart Mappia support.",
  );
  const [busy, setBusy] = useState(false);
  const settled = useRef(phase !== "verifying");

  const markReady = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    sessionStorage.setItem(RECOVERY_FLAG, "1");
    setPhase("ready");
  }, []);

  useEffect(() => {
    if (!supabase || settled.current) return undefined;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const cameFromRecoveryLink =
      url.searchParams.has("code") ||
      hash.get("type") === "recovery" ||
      url.searchParams.get("type") === "recovery";

    if (cameFromRecoveryLink) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) markReady();
      });
    }

    const timer = setTimeout(
      () => {
        if (settled.current) return;
        settled.current = true;
        setPhase("invalid");
      },
      cameFromRecoveryLink ? EXCHANGE_TIMEOUT_MS : 0,
    );

    return () => {
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [markReady]);

  async function submit(password) {
    const validationError = getPasswordValidationError(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      sessionStorage.removeItem(RECOVERY_FLAG);
      settled.current = true;
      setPhase("done");
    } catch (err) {
      setError(
        err.message ||
          "Could not update your password. Request a new link and try again.",
      );
      setBusy(false);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch {
      /* best effort */
    }
    setBusy(false);
  }

  if (phase === "ready") {
    return (
      <MobileNewPasswordScreen
        onBack={() => navigate("/login")}
        onSubmit={submit}
        serverError={error}
        busy={busy}
      />
    );
  }

  return (
    <div className="auth-mobile-layout">
      <div className="auth-mobile-content">
        <div className="auth-card">
          <Outcome
            phase={phase}
            error={error}
            onLogin={() => navigate("/login")}
          />
        </div>
      </div>
    </div>
  );
}

function Outcome({ phase, error, onLogin }) {
  if (phase === "verifying") {
    return (
      <div className="py-6 text-center">
        <Spinner className="!w-7 !h-7 mx-auto" />
        <p className="text-sm text-brand-grey mt-4">
          Checking your reset link…
        </p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-brand-black tracking-tight">
          Password updated
        </h1>
        <p className="text-sm text-brand-grey mt-2 mb-6">
          Sign in with your new password.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className={btnPrimary + " w-full"}
        >
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-black text-brand-black tracking-tight">
        This link cannot be used
      </h1>
      <p className="text-sm text-brand-grey mt-2">
        {error ||
          "It may have expired, been used already, or been opened in a different browser from the one that requested it."}
      </p>
      <p className="text-xs text-brand-grey mt-3 mb-6">
        Reset links last one hour and must be opened in the browser that
        requested them.
      </p>
      <Link
        to="/forgot-password"
        className={btnPrimary + " w-full block text-center"}
      >
        Request a new link
      </Link>
      <button
        type="button"
        onClick={onLogin}
        className="w-full mt-3 text-sm font-bold text-brand-grey hover:text-brand-orange transition-colors cursor-pointer"
      >
        Back to sign in
      </button>
    </div>
  );
}
