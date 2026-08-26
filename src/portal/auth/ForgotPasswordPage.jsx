// ---------------------------------------------------------------------
// Request a password reset link: /forgot-password
//
// FOR SELF-REGISTERED CUSTOMERS. Merchant and admin passwords are issued by
// an admin in the Admin tab and this page is not their recovery path — but
// nothing blocks them from using it either, since holding the mailbox is
// proof enough. See docs/engineering/13-authentication-and-security.md.
//
// Sends via Supabase -> Resend SMTP. `redirectTo` MUST be listed under
// Authentication -> URL Configuration -> Redirect URLs in the Supabase
// dashboard; an unlisted value does not error, it silently falls back to
// Site URL and drops the user on the homepage holding a recovery token.
//
// Platform split mirrors LoginPage: the native app gets the mobile screen,
// the web gets the branded form below.
// ---------------------------------------------------------------------

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import MobileForgotPasswordScreen from "./mobile/screens/ForgotPasswordScreen";

function resetRedirectUrl() {
  return `${window.location.origin}/reset-password`;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function submit(address) {
    const target = String(address || "").trim();
    if (!target) {
      setError("Enter the email address you signed up with.");
      return;
    }
    if (!supabase) {
      setError(
        "Sign-in is not configured. Please contact Smart Mappia support.",
      );
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: resetRedirectUrl(),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <MobileSentConfirmation
        email={email}
        onGoToLogin={() => navigate("/login")}
      />
    );
  }

  return (
    <MobileForgotPasswordScreen
      onBack={() => navigate("/login")}
      onSubmit={(value) => {
        setEmail(value);
        submit(value);
      }}
    />
  );
}

function MobileSentConfirmation({ email, onGoToLogin }) {
  return (
    <div className="auth-mobile-layout">
      <div className="auth-mobile-content">
        <div className="auth-card">
          <div className="auth-icon-header">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="auth-title auth-title-center">Check your email</h1>
          <p className="auth-subtitle auth-subtitle-center">
            If an account exists for <strong>{email}</strong>, we have sent a
            link to reset your password. Open it on this device — the reset can
            only be completed where it was started.
          </p>
          <button type="button" className="auth-button" onClick={onGoToLogin}>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
