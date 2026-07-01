// import React, { useState } from "react";
// import "./NomineeRegister.css";
// import { useNavigate } from "react-router-dom";

// function NomineeRegister() {

// const navigate = useNavigate();

// const [formData, setFormData] = useState({
//   name: "",
//   email: "",
//   phone: "",
//   relationship: "",
//   otherRelationship: "",
//   emergencyCode: "",
// });

// const handleChange = (e) => {

//   const { name, value } = e.target;

//   setFormData({
//     ...formData,
//     [name]: value
//   });

// };

// const handleSubmit = (e) => {

//   e.preventDefault();

//   const finalRelationship =
//     formData.relationship === "Other"
//       ? formData.otherRelationship
//       : formData.relationship;

//   const dataToSave = {
//     ...formData,
//     relationship: finalRelationship
//   };

//   console.log("Nominee Registered:", dataToSave);

//   navigate("/totp-setup");

// };

// return (

// <div className="nominee-container">

//   <div className="nominee-card">

//     <h2 className="nominee-title">
//       Nominee Registration
//     </h2>

//     <p className="nominee-text">
//       Add a trusted person for emergency access
//     </p>

//     <form onSubmit={handleSubmit}>

//       <input
//         type="text"
//         name="name"
//         placeholder="Full Name"
//         className="nominee-input"
//         onChange={handleChange}
//         required
//       />

//       <input
//         type="email"
//         name="email"
//         placeholder="Email Address"
//         className="nominee-input"
//         onChange={handleChange}
//         required
//       />

//       <input
//         type="tel"
//         name="phone"
//         placeholder="Phone Number"
//         className="nominee-input"
//         onChange={handleChange}
//         required
//       />

//       <select
//         name="relationship"
//         value={formData.relationship}
//         className="nominee-input"
//         onChange={handleChange}
//         required
//       >
//         <option value="">Select Relationship</option>
//         <option value="Father">Father</option>
//         <option value="Mother">Mother</option>
//         <option value="Wife">Wife</option>
//         <option value="Husband">Husband</option>
//         <option value="Son">Son</option>
//         <option value="Daughter">Daughter</option>
//         <option value="Brother">Brother</option>
//         <option value="Sister">Sister</option>
//         <option value="Other">Other</option>
//       </select>

//       {formData.relationship === "Other" && (

//         <input
//           type="text"
//           name="otherRelationship"
//           placeholder="Enter Relationship"
//           className="nominee-input"
//           onChange={handleChange}
//           required
//         />

//       )}

//       <input
//         type="text"
//         name="emergencyCode"
//         placeholder="Emergency Access Code"
//         className="nominee-input"
//         onChange={handleChange}
//         required
//       />

//       <button className="nominee-btn">
//         Register Nominee
//       </button>

//     </form>

//   </div>

// </div>

// );
// }

// export default NomineeRegister;


import React, { useState } from "react";
import "./NomineeRegister.css";
import { useNavigate, useLocation } from "react-router-dom";
import { registerNominee } from "../api/api";

function NomineeRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  // Token comes from email link: /nominee-register?token=xxx
  const token = new URLSearchParams(location.search).get("token");

  const [formData, setFormData] = useState({
    emergency_code: "",
    password: "",
    confirmPassword: "",
    relationship: "",
    otherRelationship: "",
  });

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setApiError("Invalid registration link. Please check your email for the correct link.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setApiError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setApiError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const { ok, data } = await registerNominee(
        token,
        formData.emergency_code,
        formData.password
      );
      if (!ok) {
        setApiError(data.error || "Registration failed");
        return;
      }

      // Save nominee_id + qr_code for TotpSetup page
      localStorage.setItem("reg_nominee_id", data.nominee_id);
      localStorage.setItem("reg_qr_code", data.qr_code);
      localStorage.setItem("reg_totp_secret", data.totp_secret);
      localStorage.setItem("totpFlow", "nominee-register");

      navigate("/totp-setup");
    } catch {
      setApiError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nominee-container">
      <div className="nominee-card">
        <h2 className="nominee-title">Nominee Registration</h2>
        <p className="nominee-text">Complete your registration to access the vault</p>

        {!token && (
          <p style={{ color: "#f87171", marginBottom: "16px" }}>
            ⚠️ No registration token found. Please use the link from your email.
          </p>
        )}

        {apiError && <p className="error" style={{ marginBottom: "12px" }}>{apiError}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="emergency_code"
            placeholder="Emergency Access Code (given by vault owner)"
            className="nominee-input"
            value={formData.emergency_code}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create your password"
            className="nominee-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            className="nominee-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <select
            name="relationship"
            value={formData.relationship}
            className="nominee-input"
            onChange={handleChange}
          >
            <option value="">Select Relationship (optional)</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Wife">Wife</option>
            <option value="Husband">Husband</option>
            <option value="Son">Son</option>
            <option value="Daughter">Daughter</option>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
            <option value="Other">Other</option>
          </select>

          {formData.relationship === "Other" && (
            <input
              type="text"
              name="otherRelationship"
              placeholder="Enter Relationship"
              className="nominee-input"
              onChange={handleChange}
            />
          )}

          <button className="nominee-btn" disabled={loading || !token}>
            {loading ? "Registering..." : "Register Nominee"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NomineeRegister;