// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./ResetPassword.css";

// function ResetPassword() {

//   const navigate = useNavigate();

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleSubmit = (e) => {

//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     console.log("Password Reset:", password);

//    <p className="success-msg">Password updated successfully!</p>
//     // redirect to login
//     navigate("/login");
//   };

//   return (

//     <div className="reset-container">

//       <div className="reset-card">

//         <h2 className="reset-title">
//           Reset Password
//         </h2>

//         <p className="reset-text">
//           Enter your new password
//         </p>

//         <form onSubmit={handleSubmit}>

//           <input
//             type="password"
//             placeholder="New Password"
//             className="reset-input"
//             onChange={(e)=>setPassword(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Confirm Password"
//             className="reset-input"
//             onChange={(e)=>setConfirmPassword(e.target.value)}
//             required
//           />

//           <button className="reset-btn">
//             Update Password
//           </button>

//         </form>

//       </div>

//     </div>
//   );
// }

// export default ResetPassword;


import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResetPassword.css";
import { resetPassword } from "../api/api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Token comes from the URL: /reset-password?token=xxx
  const token = new URLSearchParams(location.search).get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setApiError("Passwords do not match");
      return;
    }
    if (!token) {
      setApiError("Invalid or missing reset token. Please request a new link.");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const { ok, data } = await resetPassword(token, password);
      if (!ok) {
        setApiError(data.error || "Reset failed. Link may have expired.");
        return;
      }
      alert("Password updated successfully!");
      navigate("/login");
    } catch {
      setApiError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-text">Enter your new password</p>

        {apiError && <p style={{ color: "#f87171", marginBottom: "12px" }}>{apiError}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            className="reset-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="reset-input"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className="reset-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;