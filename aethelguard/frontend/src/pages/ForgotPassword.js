// import React, { useState } from "react";
// import "./ForgotPassword.css";

// function ForgotPassword() {
//   const [email, setEmail] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Reset link sent to:", email);
//     alert("Password reset link sent to your email!");
//   };

//   return (
//     <div className="forgot-container">
//       <div className="forgot-card">
//         <h2>Forgot Password</h2>
//         <p>Enter your email to receive password reset link</p>

//         <form onSubmit={handleSubmit}>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <button className="forgot-btn">
//             Send Reset Link
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ForgotPassword;

import React, { useState } from "react";
import "./ForgotPassword.css";
import { forgotPassword } from "../api/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");
    setMessage("");
    try {
      const { data } = await forgotPassword(email);
      // Backend always returns 200 with a generic message (for security)
      setMessage(data.message || "If this email exists, a reset link has been sent.");
    } catch {
      setApiError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link</p>

        {message && <p style={{ color: "#4ade80", marginBottom: "12px" }}>{message}</p>}
        {apiError && <p style={{ color: "#f87171", marginBottom: "12px" }}>{apiError}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="forgot-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;