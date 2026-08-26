// ---------------------------------------------------------------------
// Create an account as a User (passenger) or Driver. Restaurant owners
// cannot self-register — they contact Smart Mappia and admins provision
// their account after partnership approval.
// ---------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  daysInMonth,
  buildDateOfBirth,
  buildFullPhone,
  isValidLocalPhone,
} from "./authHelpers";
import { useAuth } from "../lib/AuthProvider";
import { roleHome } from "../lib/constants";
import {
  isPasswordValid,
  getPasswordValidationError,
} from "../lib/passwordValidation";
import MobileSignUpScreen from "./mobile/screens/SignUpScreen";
import MobileConfirmationSentScreen from "./mobile/screens/ConfirmationSentScreen";

export default function SignupPage() {
  const { signUp, session, role: authRole } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  useEffect(() => {
    if (session && authRole)
      navigate(roleHome(authRole, next), { replace: true });
  }, [session, authRole, next, navigate]);

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("passenger");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileRegion, setMobileRegion] = useState("+966");
  const [mobileLocal, setMobileLocal] = useState("");
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState(true);
  const [whatsappRegion, setWhatsappRegion] = useState("+966");
  const [whatsappLocal, setWhatsappLocal] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [partnerPanel, setPartnerPanel] = useState(false);
  const [error, setError] = useState(null);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const mobile = buildFullPhone(mobileRegion, mobileLocal);
  const effectiveWhatsapp = whatsappSameAsMobile
    ? mobile
    : buildFullPhone(whatsappRegion, whatsappLocal);
  const dateOfBirth = buildDateOfBirth(birthDay, birthMonth, birthYear);

  const step2Complete =
    !!firstName.trim() &&
    !!lastName.trim() &&
    isValidLocalPhone(mobileLocal) &&
    (whatsappSameAsMobile || isValidLocalPhone(whatsappLocal)) &&
    !!birthDay &&
    !!birthMonth &&
    !!birthYear &&
    !!gender;

  const step3Complete =
    !!email.trim() &&
    isPasswordValid(password) &&
    password === confirmPassword &&
    acceptedTerms &&
    (role !== "driver" ||
      (!!nationalId.trim() && !!vehicleType && !!vehiclePlate.trim()));

  function validateStep(n) {
    if (n === 1) return null;

    if (n === 2) {
      if (!firstName.trim() || !lastName.trim())
        return "Please enter your first and last name.";
      if (!isValidLocalPhone(mobileLocal))
        return "Please enter a valid mobile number.";
      if (!whatsappSameAsMobile && !isValidLocalPhone(whatsappLocal)) {
        return "Please enter a valid WhatsApp number.";
      }
      if (!dateOfBirth) return "Please enter your date of birth.";
      if (!gender) return "Please select your gender.";
      return null;
    }

    if (n === 3) {
      if (!email.trim()) return "Please enter your email address.";
      const passwordError = getPasswordValidationError(password);
      if (passwordError) return passwordError;
      if (password !== confirmPassword) return "Passwords do not match.";
      if (role === "driver") {
        if (!nationalId.trim())
          return "Please enter your National ID / Iqama number.";
        if (!vehicleType) return "Please select your vehicle type.";
        if (!vehiclePlate.trim())
          return "Please enter your vehicle plate number.";
      }
      if (!acceptedTerms)
        return "Please accept the Terms of Service and Privacy Policy.";
      return null;
    }

    return null;
  }

  function goNext() {
    setError(null);
    const err = validateStep(step);
    if (err) {
      setShowStepErrors(true);
      return setError(err);
    }
    setShowStepErrors(false);
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setError(null);
    setShowStepErrors(false);
    if (step === 1 && partnerPanel) {
      setPartnerPanel(false);
      return;
    }
    if (step > 1) setStep((s) => s - 1);
    else navigate("/login");
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const err = validateStep(3);
    if (err) {
      setShowStepErrors(true);
      return setError(err);
    }
    setShowStepErrors(false);

    setBusy(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const { needsConfirmation } = await signUp(email.trim(), password, {
        role,
        full_name: fullName,
        mobile_number: mobile,
        whatsapp_number: effectiveWhatsapp,
        date_of_birth: dateOfBirth,
        gender,
        ...(role === "driver"
          ? {
              national_id: nationalId.trim(),
              vehicle_type: vehicleType,
              vehicle_plate: vehiclePlate.trim(),
            }
          : {}),
      });
      if (needsConfirmation) {
        setConfirmSent(true);
      } else {
        navigate(roleHome(role, next), { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (confirmSent) {
    return (
      <MobileConfirmationSentScreen
        email={email}
        onGoToLogin={() => navigate(`/login?next=${encodeURIComponent(next)}`)}
      />
    );
  }

  return (
    <MobileSignUpScreen
      step={step}
      values={{
        role,
        firstName,
        lastName,
        mobileRegion,
        mobileLocal,
        whatsappSameAsMobile,
        whatsappRegion,
        whatsappLocal,
        birthDay,
        birthMonth,
        birthYear,
        gender,
        email,
        password,
        confirmPassword,
        nationalId,
        vehicleType,
        vehiclePlate,
        acceptedTerms,
        partnerPanel,
      }}
      handlers={{
        setRole,
        setFirstName,
        setLastName,
        setMobileRegion,
        setMobileLocal,
        setWhatsappSameAsMobile,
        setWhatsappRegion,
        setWhatsappLocal,
        setBirthDay,
        setBirthMonth,
        setBirthYear,
        setGender,
        setEmail,
        setPassword,
        setConfirmPassword,
        setNationalId,
        setVehicleType,
        setVehiclePlate,
        setAcceptedTerms,
        setPartnerPanel,
        goNext,
        goBack,
        submit,
      }}
      meta={{ error, busy, showStepErrors, step2Complete, step3Complete }}
      onGoToLogin={() => navigate(`/login?next=${encodeURIComponent(next)}`)}
    />
  );
}
