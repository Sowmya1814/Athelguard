import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginStep1, loginStep2 } from "../api/api";

function Login() {
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const [formData, setFormData] = useState({ email: "", password: "", role: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Step 2 — TOTP
  const [showTotp, setShowTotp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [pendingAuth, setPendingAuth] = useState(null);

  const checkPasswordStrength = (pw) => {
    if (pw.length < 6) setPasswordStrength("Weak");
    else if (pw.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)) setPasswordStrength("Strong");
    else setPasswordStrength("Medium");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setApiError("");
    if (name === "password") checkPasswordStrength(value);
  };

  const validate = () => {
    let errs = {};
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter valid email address";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!formData.role) errs.role = "Please select role";
    return errs;
  };

  // ── Step 1: verify credentials ───────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    setApiError("");
    try {
      const { ok, data } = await loginStep1(formData.email, formData.password, formData.role);
      if (!ok) { setApiError(data.error || "Login failed"); return; }
      setPendingAuth({ user_id: data.user_id, nominee_id: data.nominee_id, role: data.role });
      setOtpDigits(Array(6).fill(""));
      setShowTotp(true);
      // Focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setApiError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box handlers ────────────────────────────────────
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setApiError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft"  && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const updated = [...otpDigits];
    digits.forEach((d, i) => { updated[i] = d; if (otpRefs.current[i]) otpRefs.current[i].value = d; });
    setOtpDigits(updated);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  // ── Step 2: verify TOTP ─────────────────────────────────
  const handleTotpSubmit = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) { setApiError("Enter all 6 digits"); return; }

    setLoading(true);
    setApiError("");
    try {
      const { ok, data } = await loginStep2({
        user_id: pendingAuth.user_id,
        nominee_id: pendingAuth.nominee_id,
        totp_token: code,
        role: pendingAuth.role,
      });
      if (!ok) { setApiError(data.error || "Invalid OTP"); return; }

      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("loginRole",      data.role);
      if (data.user)    localStorage.setItem("userProfile",    JSON.stringify(data.user));
      if (data.nominee) localStorage.setItem("nomineeProfile", JSON.stringify(data.nominee));

      setSuccess("Login Successful!");
      setTimeout(() => {
        if (data.role === "admin")   navigate("/admin-dashboard");
        else if (data.role === "nominee") navigate("/nominee-dashboard");
        else navigate("/dashboard");
      }, 1000);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.email && /\S+@\S+\.\S+/.test(formData.email) &&
    formData.password.length >= 8 && formData.role;

  // ── TOTP Screen ─────────────────────────────────────────
  if (showTotp) {
    const allFilled = otpDigits.join("").length === 6;
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Verify Identity</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
            Enter the 6-digit code from your Google Authenticator app
          </p>

          {success  && <p className="success">{success}</p>}
          {apiError && <p className="error">{apiError}</p>}

          {/* 6-box OTP — same style as TotpSetup */}
          <div className="otp-box-container" style={{ justifyContent: "center", marginBottom: "24px" }}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-box"
                value={digit}
                ref={(el) => (otpRefs.current[index] = el)}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                onPaste={handleOtpPaste}
              />
            ))}
          </div>

          <button
            className="login-button"
            onClick={handleTotpSubmit}
            disabled={loading || !allFilled}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <p className="login-text" style={{ marginTop: "14px", textAlign: "center" }}>
            <span
              style={{ cursor: "pointer", color: "#6366f1", fontWeight: 600 }}
              onClick={() => { setShowTotp(false); setApiError(""); setOtpDigits(Array(6).fill("")); }}
            >
              ← Back
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ── Main Login Screen ───────────────────────────────────
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {success  && <p className="success">{success}</p>}
        {apiError && <p className="error">{apiError}</p>}

        <input
          type="email" name="email" placeholder="Email Address"
          className="login-input" value={formData.email} onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <div className="password-box">
          <input
            type={showPassword ? "text" : "password"} name="password"
            placeholder="Password" className="login-input"
            value={formData.password} onChange={handleChange}
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </div>

        {formData.password && (
          <p className={`password-strength ${passwordStrength.toLowerCase()}`}>{passwordStrength}</p>
        )}
        {errors.password && <p className="error">{errors.password}</p>}

        <select name="role" className="login-input" value={formData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="nominee">Nominee</option>
        </select>
        {errors.role && <p className="error">{errors.role}</p>}

        <div className="login-options">
          <label className="remember-me"><input type="checkbox" /> Remember Me</label>
          <p className="forgot-password"><Link to="/forgot-password">Forgot Password?</Link></p>
        </div>

        <button
          className="login-button"
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? "Checking..." : "Continue"}
        </button>

        <p className="login-text">
          Not registered?{" "}
          <Link to="/register" className="login-link">Click here to register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;





// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "./Login.css";
// import { loginStep1, loginStep2 } from "../api/api";

// function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({ email: "", password: "", role: "" });
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const [apiError, setApiError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState("");

//   // ── Step-2 TOTP state ──────────────────────────────────────
//   const [showTotp, setShowTotp] = useState(false);
//   const [totpCode, setTotpCode] = useState("");
//   const [pendingAuth, setPendingAuth] = useState(null); // { user_id/nominee_id, role }

//   const checkPasswordStrength = (password) => {
//     if (password.length < 6) setPasswordStrength("Weak");
//     else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)) setPasswordStrength("Strong");
//     else setPasswordStrength("Medium");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     setErrors({ ...errors, [name]: "" });
//     setApiError("");
//     if (name === "password") checkPasswordStrength(value);
//   };

//   const validate = () => {
//     let newErrors = {};
//     if (!formData.email.trim()) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter valid email address";
//     if (!formData.password) newErrors.password = "Password is required";
//     else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
//     if (!formData.role) newErrors.role = "Please select role";
//     return newErrors;
//   };

//   // ── Step 1: verify email + password + role ──────────────────
//   const handleSubmit = async () => {
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setLoading(true);
//     setApiError("");
//     try {
//       const { ok, data } = await loginStep1(formData.email, formData.password, formData.role);
//       if (!ok) {
//         setApiError(data.error || "Login failed");
//         return;
//       }
//       // Backend returns user_id or nominee_id depending on role
//       setPendingAuth({
//         user_id: data.user_id,
//         nominee_id: data.nominee_id,
//         role: data.role,
//       });
//       setShowTotp(true);
//     } catch {
//       setApiError("Network error. Is the backend running?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Step 2: verify TOTP ─────────────────────────────────────
//   const handleTotpSubmit = async () => {
//     if (totpCode.length !== 6) {
//       setApiError("Enter 6-digit OTP");
//       return;
//     }
//     setLoading(true);
//     setApiError("");
//     try {
//       const { ok, data } = await loginStep2({
//         user_id: pendingAuth.user_id,
//         nominee_id: pendingAuth.nominee_id,
//         totp_token: totpCode,
//         role: pendingAuth.role,
//       });
//       if (!ok) {
//         setApiError(data.error || "Invalid OTP");
//         return;
//       }
//       // Save tokens + user info
//       localStorage.setItem("access_token", data.access_token);
//       localStorage.setItem("refresh_token", data.refresh_token);
//       localStorage.setItem("loginRole", data.role);
//       if (data.user) localStorage.setItem("userProfile", JSON.stringify(data.user));
//       if (data.nominee) localStorage.setItem("nomineeProfile", JSON.stringify(data.nominee));

//       setSuccess("Login Successful!");
//       setTimeout(() => {
//         if (data.role === "admin") navigate("/admin-dashboard");
//         else if (data.role === "nominee") navigate("/nominee-dashboard");
//         else navigate("/dashboard");
//       }, 1000);
//     } catch {
//       setApiError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isFormValid =
//     formData.email &&
//     /\S+@\S+\.\S+/.test(formData.email) &&
//     formData.password.length >= 8 &&
//     formData.role;

//   // ── TOTP screen ─────────────────────────────────────────────
//   if (showTotp) {
//     return (
//       <div className="login-container">
//         <div className="login-card">
//           <h2 className="login-title">Enter TOTP Code</h2>
//           <p style={{ marginBottom: "16px", color: "#aaa", fontSize: "14px" }}>
//             Open Google Authenticator and enter the 6-digit code.
//           </p>
//           {success && <p className="success">{success}</p>}
//           {apiError && <p className="error">{apiError}</p>}
//           <input
//             type="text"
//             maxLength="6"
//             placeholder="6-digit OTP"
//             className="login-input"
//             value={totpCode}
//             onChange={(e) => { setTotpCode(e.target.value.replace(/\D/g, "")); setApiError(""); }}
//           />
//           <button
//             className="login-button"
//             onClick={handleTotpSubmit}
//             disabled={loading || totpCode.length !== 6}
//           >
//             {loading ? "Verifying..." : "Verify & Login"}
//           </button>
//           <p className="login-text" style={{ marginTop: "12px" }}>
//             <span style={{ cursor: "pointer", color: "#7c3aed" }} onClick={() => { setShowTotp(false); setApiError(""); }}>
//               ← Back
//             </span>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ── Main login screen ───────────────────────────────────────
//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <h2 className="login-title">Login</h2>

//         {success && <p className="success">{success}</p>}
//         {apiError && <p className="error">{apiError}</p>}

//         <input
//           type="email"
//           name="email"
//           placeholder="Email Address"
//           className="login-input"
//           value={formData.email}
//           onChange={handleChange}
//         />
//         {errors.email && <p className="error">{errors.email}</p>}

//         <div className="password-box">
//           <input
//             type={showPassword ? "text" : "password"}
//             name="password"
//             placeholder="Password"
//             className="login-input"
//             value={formData.password}
//             onChange={handleChange}
//           />
//           <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
//             {showPassword ? "visibility_off" : "visibility"}
//           </span>
//         </div>

//         {formData.password && (
//           <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
//             {passwordStrength}
//           </p>
//         )}
//         {errors.password && <p className="error">{errors.password}</p>}

//         <select name="role" className="login-input" value={formData.role} onChange={handleChange}>
//           <option value="">Select Role</option>
//           <option value="user">User</option>
//           <option value="nominee">Nominee</option>
//         </select>
//         {errors.role && <p className="error">{errors.role}</p>}

//         <div className="login-options">
//           <label className="remember-me">
//             <input type="checkbox" />
//             Remember Me
//           </label>
//           <p className="forgot-password">
//             <Link to="/forgot-password">Forgot Password?</Link>
//           </p>
//         </div>

//         <button
//           className="login-button"
//           onClick={handleSubmit}
//           disabled={!isFormValid || loading}
//         >
//           {loading ? "Checking..." : "Continue"}
//         </button>

//         <p className="login-text">
//           Not registered?{" "}
//           <Link to="/register" className="login-link">
//             Click here to register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;