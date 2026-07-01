// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { QRCodeCanvas } from "qrcode.react";
// import "./NomineeTotp.css";

// function NomineeTotp() {
//   const navigate = useNavigate();
//   const inputsRef = useRef([]);
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [timer, setTimer] = useState(30);

//   const nomineeData = JSON.parse(localStorage.getItem("nomineeData")) || {};
//   const nomineeEmail = nomineeData.nomineeEmail || "nominee@example.com";
//   const nomineeName = nomineeData.nomineeName || "Nominee";

//   const secretKey = "NOMINEEATHELGUARD123456";
//   const qrValue = `otpauth://totp/AthelGuard:${nomineeEmail}?secret=${secretKey}&issuer=AthelGuard-Nominee`;

//   useEffect(() => {
//     if (timer === 0) return;

//     const interval = setInterval(() => {
//       setTimer((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [timer]);

//   const handleChange = (value, index) => {
//     if (!/^\d?$/.test(value)) return;

//     const updatedOtp = [...otp];
//     updatedOtp[index] = value;
//     setOtp(updatedOtp);

//     if (value && index < 5) {
//       inputsRef.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputsRef.current[index - 1]?.focus();
//     }
//   };

//   const handleVerify = () => {
//     const code = otp.join("");

//     if (code.length !== 6) {
//       alert("Please enter complete OTP");
//       return;
//     }

//     localStorage.setItem("loginRole", "nominee");
//     navigate("/nominee-dashboard");
//   };

//   const handleResend = () => {
//     setOtp(["", "", "", "", "", ""]);
//     setTimer(30);
//     inputsRef.current[0]?.focus();
//   };

//   return (
//     <div className="nomineeTotpContainer">
//       <div className="nomineeTotpCard">
//         <h2>Nominee Two-Factor Authentication</h2>
//         <p className="nomineeTotpSubText">
//           Hello {nomineeName}, scan this QR code using Google Authenticator.
//         </p>

//         <div className="nomineeQrBox">
//           <QRCodeCanvas value={qrValue} size={220} />
//         </div>

//         <p className="nomineeSecretText">
//           Secret Key: <strong>{secretKey}</strong>
//         </p>

//         <p className="nomineeHelpText">
//           If you cannot scan the QR code, manually enter the secret key.
//         </p>

//         <h4 className="otpHeading">Enter OTP</h4>

//         <div className="otpInputRow">
//           {otp.map((digit, index) => (
//             <input
//               key={index}
//               type="text"
//               maxLength="1"
//               className="otpInputBox"
//               value={digit}
//               onChange={(e) => handleChange(e.target.value, index)}
//               onKeyDown={(e) => handleKeyDown(e, index)}
//               ref={(el) => (inputsRef.current[index] = el)}
//             />
//           ))}
//         </div>

//         <button className="nomineeVerifyBtn" onClick={handleVerify}>
//           Verify OTP
//         </button>

//         <div className="nomineeOtpFooter">
//           {timer > 0 ? (
//             <span>Resend OTP in {timer}s</span>
//           ) : (
//             <button className="nomineeResendBtn" onClick={handleResend}>
//               Resend OTP
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default NomineeTotp;


import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NomineeTotp.css";
import { loginStep2 } from "../api/api";

// This page handles TOTP for NOMINEE LOGIN (not registration).
// It receives nominee_id from location state (set by Login.js).
function NomineeTotp() {
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // nominee_id is passed via navigate state from Login page
  const nomineeId = localStorage.getItem("pending_nominee_id");
  const nomineeEmail = localStorage.getItem("pending_email") || "nominee@example.com";

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setApiError("Please enter complete OTP");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const { ok, data } = await loginStep2({
        nominee_id: nomineeId,
        totp_token: code,
        role: "nominee",
      });
      if (!ok) {
        setApiError(data.error || "Invalid OTP");
        return;
      }
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("loginRole", "nominee");
      if (data.nominee) localStorage.setItem("nomineeProfile", JSON.stringify(data.nominee));
      localStorage.removeItem("pending_nominee_id");
      localStorage.removeItem("pending_email");
      navigate("/nominee-dashboard");
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setApiError("");
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="nomineeTotpContainer">
      <div className="nomineeTotpCard">
        <h2>Nominee Two-Factor Authentication</h2>
        <p className="nomineeTotpSubText">
          Open Google Authenticator and enter the 6-digit code for{" "}
          <strong>{nomineeEmail}</strong>.
        </p>

        {apiError && <p className="error" style={{ textAlign: "center" }}>{apiError}</p>}

        <h4 className="otpHeading">Enter OTP</h4>

        <div className="otpInputRow">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otpInputBox"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
            />
          ))}
        </div>

        <button
          className="nomineeVerifyBtn"
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="nomineeOtpFooter">
          {timer > 0 ? (
            <span>Resend OTP in {timer}s</span>
          ) : (
            <button className="nomineeResendBtn" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NomineeTotp;