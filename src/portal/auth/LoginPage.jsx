// ---------------------------------------------------------------------
// Sign in (shared by passengers, drivers and admins — role comes from the
// profile, not the login form).
// ---------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/AuthProvider";
import { roleHome } from "../lib/constants";
import MobileLoginScreen from "./mobile/screens/LoginScreen";
import { getAuthErrorMessage } from "./mobile/authErrorMessages";

export default function LoginPage() {
  const { signIn, session, role, profileError, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [bannerError, setBannerError] = useState(null);

  useEffect(() => {
    if (session && role) navigate(roleHome(role, next), { replace: true });
  }, [session, role, next, navigate]);

  useEffect(() => {
    if (session && !profileLoading && profileError) {
      setBannerError(profileError);
      setBusy(false);
    }
  }, [session, profileLoading, profileError]);

  async function submit(e) {
    e.preventDefault();
    setFieldErrors({});
    setBannerError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      // The effect above redirects once the role is known.
    } catch (err) {
      const { field, text } = getAuthErrorMessage(err);
      if (field === "banner") {
        setBannerError(text);
      } else {
        setFieldErrors({ [field]: text });
      }
      setBusy(false);
    }
  }

  return (
    <MobileLoginScreen
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      fieldErrors={fieldErrors}
      bannerError={bannerError}
      busy={busy}
      onSubmit={submit}
      onGoToSignUp={() => navigate(`/signup?next=${encodeURIComponent(next)}`)}
      onForgotPassword={() => navigate("/forgot-password")}
    />
  );
}
