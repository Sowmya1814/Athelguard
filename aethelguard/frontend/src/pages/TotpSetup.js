import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./TotpSetup.css";
import { useNavigate } from "react-router-dom";
import { registerUserTotp, registerNomineeTotp } from "../api/api";

function TotpSetup() {
  const navigate = useNavigate();
  const inputs = useRef([]);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // All values from localStorage — set by RegisterUser.js or NomineeRegister.js
  const totpFlow  = localStorage.getItem("totpFlow");         // "user-register" | "nominee-register"
  const qrCode    = localStorage.getItem("reg_qr_code");      // base64 PNG from backend
  const secret    = localStorage.getItem("reg_totp_secret");  // raw secret string
  const userId    = localStorage.getItem("reg_user_id");      // string → convert to int before sending
  const nomineeId = localStorage.getItem("reg_nominee_id");   // string → convert to int before sending

  // Fallback QR using qrcode.react if backend QR unavailable
  const regEmail = localStorage.getItem("reg_email") || "user@example.com";
  const otpAuthUrl = secret
    ? `otpauth://totp/AetherGuard:${regEmail}?secret=${secret}&issuer=AetherGuard`
    : null;

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const newOtp = [...otp];
    pasteData.forEach((num, i) => {
      newOtp[i] = num;
      if (inputs.current[i]) inputs.current[i].value = num;
    });
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setApiError("Enter complete 6-digit OTP");
      return;
    }

    // Guard: make sure we have the right ID
    if (totpFlow === "nominee-register" && !nomineeId) {
      setApiError("Registration session expired. Please start registration again.");
      return;
    }
    if (totpFlow !== "nominee-register" && !userId) {
      setApiError("Registration session expired. Please start registration again.");
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      let result;
      if (totpFlow === "nominee-register") {
        // Parse to integer — localStorage always stores strings
        result = await registerNomineeTotp(parseInt(nomineeId, 10), code);
      } else {
        result = await registerUserTotp(parseInt(userId, 10), code);
      }

      if (!result.ok) {
        setApiError(result.data.error || "Invalid OTP. Please try again.");
        return;
      }

      // Clear all temp registration keys
      ["reg_user_id", "reg_nominee_id", "reg_qr_code", "reg_totp_secret", "totpFlow", "reg_email"]
        .forEach((k) => localStorage.removeItem(k));

      setSuccessMsg("Verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);

    } catch (err) {
      setApiError("Network error. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(Array(6).fill(""));
    setApiError("");
    inputs.current.forEach((input) => { if (input) input.value = ""; });
    inputs.current[0]?.focus();
  };

  return (
    <div className="totp-container">
      <div className="totp-card">
        <h2 className="totp-title">Setup Two-Factor Authentication</h2>
        <p className="totp-text">Scan this QR code using Google Authenticator</p>

        <div className="qr-box">
          {qrCode ? (
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="TOTP QR Code"
              style={{ width: 180, height: 180 }}
            />
          ) : otpAuthUrl ? (
            <QRCodeCanvas value={otpAuthUrl} size={180} />
          ) : (
            <p style={{ color: "#888", fontSize: "13px" }}>
              QR Code unavailable — use the secret key below manually.
            </p>
          )}
        </div>

        {secret && (
          <p className="secret-text">
            Secret Key: <strong>{secret}</strong>
          </p>
        )}

        <p className="setup-note">
          If you cannot scan the QR code, manually enter the secret key in Google Authenticator.
        </p>

        {apiError   && <p className="error"   style={{ textAlign:"center", marginBottom:"10px" }}>{apiError}</p>}
        {successMsg && <p className="success" style={{ textAlign:"center", marginBottom:"10px" }}>{successMsg}</p>}

        <p className="otp-title">Enter OTP from Authenticator</p>

        <div className="otp-box-container">
          {otp.map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otp-box"
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button
          className="verify-button"
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="otp-footer">
          {timer > 0 ? (
            <p>Resend OTP in {timer}s</p>
          ) : (
            <button className="resend-button" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotpSetup;



// import React, { useState, useRef, useEffect } from "react";
// import { QRCodeCanvas } from "qrcode.react";
// import "./TotpSetup.css";
// import { useNavigate } from "react-router-dom";
// import { registerUserTotp, registerNomineeTotp } from "../api/api";

// function TotpSetup() {
//   const navigate = useNavigate();
//   const inputs = useRef([]);

//   const [otp, setOtp] = useState(Array(6).fill(""));
//   const [timer, setTimer] = useState(30);
//   const [apiError, setApiError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Pulled from localStorage (set by RegisterUser or NomineeRegister pages)
//   const totpFlow    = localStorage.getItem("totpFlow");       // "user-register" | "nominee-register"
//   const qrCode      = localStorage.getItem("reg_qr_code");   // base64 QR image from backend
//   const secret      = localStorage.getItem("reg_totp_secret");
//   const userId      = localStorage.getItem("reg_user_id");
//   const nomineeId   = localStorage.getItem("reg_nominee_id");

//   // Build the otpauth URL from secret for QRCodeCanvas fallback
//   const email =
//     totpFlow === "nominee-register"
//       ? (JSON.parse(localStorage.getItem("nomineeProfile") || "{}").email || "nominee@example.com")
//       : (JSON.parse(localStorage.getItem("userProfile") || "{}").email || "user@example.com");

//   const otpAuthUrl = secret
//     ? `otpauth://totp/AetherGuard:${email}?secret=${secret}&issuer=AetherGuard`
//     : null;

//   useEffect(() => {
//     inputs.current[0]?.focus();
//   }, []);

//   useEffect(() => {
//     if (timer === 0) return;
//     const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//     return () => clearInterval(interval);
//   }, [timer]);

//   const handleChange = (value, index) => {
//     if (!/^[0-9]?$/.test(value)) return;
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);
//     if (value && index < 5) inputs.current[index + 1]?.focus();
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
//     if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
//     if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
//     const newOtp = [...otp];
//     pasteData.forEach((num, i) => {
//       newOtp[i] = num;
//       if (inputs.current[i]) inputs.current[i].value = num;
//     });
//     setOtp(newOtp);
//   };

//   const handleVerify = async () => {
//     const code = otp.join("");
//     if (code.length !== 6) {
//       setApiError("Enter complete 6-digit OTP");
//       return;
//     }

//     setLoading(true);
//     setApiError("");
//     try {
//       let result;
//       if (totpFlow === "nominee-register") {
//         result = await registerNomineeTotp(nomineeId, code);
//       } else {
//         result = await registerUserTotp(userId, code);
//       }

//       if (!result.ok) {
//         setApiError(result.data.error || "Invalid OTP. Try again.");
//         return;
//       }

//       // Clean up temp keys
//       localStorage.removeItem("reg_user_id");
//       localStorage.removeItem("reg_nominee_id");
//       localStorage.removeItem("reg_qr_code");
//       localStorage.removeItem("reg_totp_secret");
//       localStorage.removeItem("totpFlow");

//       if (totpFlow === "nominee-register") {
//         navigate("/login");
//       } else {
//         navigate("/login");
//       }
//     } catch {
//       setApiError("Network error. Is the backend running?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = () => {
//     setTimer(30);
//     setOtp(Array(6).fill(""));
//     setApiError("");
//     inputs.current.forEach((input) => { if (input) input.value = ""; });
//     inputs.current[0]?.focus();
//   };

//   return (
//     <div className="totp-container">
//       <div className="totp-card">
//         <h2 className="totp-title">Setup Two-Factor Authentication</h2>
//         <p className="totp-text">Scan this QR code using Google Authenticator</p>

//         <div className="qr-box">
//           {qrCode ? (
//             // Backend returns base64 PNG of QR
//             <img
//               src={`data:image/png;base64,${qrCode}`}
//               alt="TOTP QR Code"
//               style={{ width: 180, height: 180 }}
//             />
//           ) : otpAuthUrl ? (
//             <QRCodeCanvas value={otpAuthUrl} size={180} />
//           ) : (
//             <p style={{ color: "#888" }}>QR Code not available. Use the secret key below.</p>
//           )}
//         </div>

//         {secret && (
//           <p className="secret-text">
//             Secret Key: <strong>{secret}</strong>
//           </p>
//         )}

//         <p className="setup-note">
//           If you cannot scan the QR code, manually enter the secret key.
//         </p>

//         {apiError && <p className="error" style={{ textAlign: "center" }}>{apiError}</p>}

//         <p className="otp-title">Enter OTP from Authenticator</p>

//         <div className="otp-box-container">
//           {otp.map((_, index) => (
//             <input
//               key={index}
//               type="text"
//               maxLength="1"
//               className="otp-box"
//               ref={(el) => (inputs.current[index] = el)}
//               onChange={(e) => handleChange(e.target.value, index)}
//               onKeyDown={(e) => handleKeyDown(e, index)}
//               onPaste={handlePaste}
//             />
//           ))}
//         </div>

//         <button className="verify-button" onClick={handleVerify} disabled={loading || otp.join("").length !== 6}>
//           {loading ? "Verifying..." : "Verify OTP"}
//         </button>

//         <div className="otp-footer">
//           {timer > 0 ? (
//             <p>Resend OTP in {timer}s</p>
//           ) : (
//             <button className="resend-button" onClick={handleResend}>
//               Resend OTP
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TotpSetup;