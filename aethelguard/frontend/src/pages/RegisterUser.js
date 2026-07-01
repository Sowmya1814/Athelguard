// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "./RegisterUser.css";
// import { useNavigate } from "react-router-dom";

// function RegisterUser() {

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     age: "",
//     phone: "",
//     inactivity: ""
//   });

//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [strength, setStrength] = useState("");

//   const checkPasswordStrength = (password) => {

//     let score = 0;

//     if (password.length >= 8) score++;
//     if (/[A-Z]/.test(password)) score++;
//     if (/[0-9]/.test(password)) score++;
//     if (/[^A-Za-z0-9]/.test(password)) score++;

//     if (score <= 1) setStrength("weak");
//     else if (score <= 3) setStrength("medium");
//     else setStrength("strong");

//   };

//   const handleChange = (e) => {

//     const { name, value } = e.target;

//     setFormData({
//       ...formData,
//       [name]: value
//     });

//     setErrors({
//       ...errors,
//       [name]: ""
//     });

//     if(name === "password"){
//       checkPasswordStrength(value);
//     }

//     setSuccess("");
//   };

//   const validate = () => {

//     let newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Full name is required";
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     }
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Enter valid email address";
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     }
//     else if (formData.password.length < 8) {
//       newErrors.password = "Password must be at least 8 characters";
//     }

//     if (!formData.age) {
//       newErrors.age = "Age is required";
//     }
//     else if (formData.age < 18) {
//       newErrors.age = "Age must be 18+";
//     }

//     if (!formData.phone) {
//       newErrors.phone = "Phone number required";
//     }
//     else if (!/^\d{10}$/.test(formData.phone)) {
//       newErrors.phone = "Enter valid 10 digit phone number";
//     }

//     if (!formData.inactivity) {
//       newErrors.inactivity = "Enter inactivity timer";
//     }
//     else if (formData.inactivity < 1) {
//       newErrors.inactivity = "Minimum 1 day required";
//     }

//     return newErrors;

//   };

//   const handleSubmit = () => {

//     const validationErrors = validate();

//     if (Object.keys(validationErrors).length > 0) {

//       setErrors(validationErrors);
//       setSuccess("");

//     } 
//     else {

//       setSuccess("Registration Successful!");

//       setTimeout(() => {
//         navigate("/totp-setup");
//       }, 1200);
//     }

//   };

//   const isFormValid =
//     formData.name.trim() !== "" &&
//     /\S+@\S+\.\S+/.test(formData.email) &&
//     formData.password.length >= 8 &&
//     Number(formData.age) >= 18 &&
//     /^\d{10}$/.test(formData.phone) &&
//     Number(formData.inactivity) >= 1;

//   return (

//     <div className="register-container">

//       <div className="register-card">

//         <h2 className="register-title">User Registration</h2>

//         {success && <p className="success">{success}</p>}

//         {/* Row 1 */}

//         <div className="form-row">

//           <div className="form-group">
//             <label className="input-label">Full Name</label>
//             <input
//               type="text"
//               name="name"
//               placeholder="Enter your full name"
//               className="register-input"
//               value={formData.name}
//               onChange={handleChange}
//             />
//             {errors.name && <p className="error">{errors.name}</p>}
//           </div>

//           <div className="form-group">
//             <label className="input-label">Email Address</label>
//             <input
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               className="register-input"
//               value={formData.email}
//               onChange={handleChange}
//             />
//             {errors.email && <p className="error">{errors.email}</p>}
//           </div>

//         </div>

//         {/* Row 2 */}

//         <div className="form-row">

//           <div className="form-group">

//             <label className="input-label">Password</label>

//             <div className="password-box">

//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 placeholder="Create password"
//                 className="register-input"
//                 value={formData.password}
//                 onChange={handleChange}
//               />

//               <span
//                 className="toggle-password"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? "visibility_off" : "visibility"}
//               </span>

//             </div>

//             {errors.password && <p className="error">{errors.password}</p>}

//             {strength && (
//               <p className={`password-strength ${strength}`}>
//                 {strength === "weak" && "Weak 🔴"}
//                 {strength === "medium" && "Medium 🟡"}
//                 {strength === "strong" && "Strong 🟢"}
//               </p>
//             )}

//           </div>

//           <div className="form-group">
//             <label className="input-label">Age</label>
//             <input
//               type="number"
//               name="age"
//               placeholder="Enter your age"
//               className="register-input"
//               value={formData.age}
//               onChange={handleChange}
//             />
//             {errors.age && <p className="error">{errors.age}</p>}
//           </div>

//         </div>

//         {/* Row 3 */}

//         <div className="form-row">

//           <div className="form-group">
//             <label className="input-label">Phone Number</label>
//             <input
//               type="tel"
//               name="phone"
//               placeholder="Enter phone number"
//               className="register-input"
//               value={formData.phone}
//               onChange={handleChange}
//             />
//             {errors.phone && <p className="error">{errors.phone}</p>}
//           </div>

//           <div className="form-group">
//             <label className="input-label">Inactivity Timer (Days)</label>
//             <input
//               type="number"
//               name="inactivity"
//               placeholder="Example: 30"
//               className="register-input"
//               value={formData.inactivity}
//               onChange={handleChange}
//             />
//             {errors.inactivity && <p className="error">{errors.inactivity}</p>}
//           </div>

//         </div>

//         <button
//           className="register-button"
//           onClick={handleSubmit}
//           disabled={!isFormValid}
//         >
//           Continue
//         </button>

//         <p className="login-text">
//           Already Registered ?{" "}
//           <Link to="/login" className="login-link">
//             Click here to Login
//           </Link>
//         </p>

//       </div>

//     </div>

//   );
// }

// export default RegisterUser;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterUser.css";
import { registerUser } from "../api/api";

function RegisterUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
    inactivity: "",
  });

  // Nominee fields (required by backend at registration)
  const [nomineeData, setNomineeData] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    emergency_code: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) setStrength("weak");
    else if (score <= 3) setStrength("medium");
    else setStrength("strong");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setApiError("");
    if (name === "password") checkPasswordStrength(value);
  };

  const handleNomineeChange = (e) => {
    const { name, value } = e.target;
    setNomineeData({ ...nomineeData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setApiError("");
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!formData.age) newErrors.age = "Age is required";
    else if (Number(formData.age) < 18) newErrors.age = "Age must be 18+";
    if (!formData.phone) newErrors.phone = "Phone number required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter valid 10 digit phone number";
    if (!formData.inactivity) newErrors.inactivity = "Enter inactivity timer";
    else if (Number(formData.inactivity) < 1) newErrors.inactivity = "Minimum 1 day required";
    // Nominee validations
    if (!nomineeData.name.trim()) newErrors.nominee_name = "Nominee name is required";
    if (!nomineeData.email.trim()) newErrors.nominee_email = "Nominee email is required";
    else if (!/\S+@\S+\.\S+/.test(nomineeData.email)) newErrors.nominee_email = "Enter valid nominee email";
    if (!nomineeData.phone) newErrors.nominee_phone = "Nominee phone required";
    else if (!/^\d{10}$/.test(nomineeData.phone)) newErrors.nominee_phone = "Enter valid 10 digit phone";
    if (!nomineeData.relationship) newErrors.nominee_relationship = "Relationship is required";
    if (!nomineeData.emergency_code.trim()) newErrors.emergency_code = "Emergency code is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: Number(formData.age),
        phone: formData.phone,
        inactivity_days: Number(formData.inactivity),
        nominee: {
          name: nomineeData.name,
          email: nomineeData.email,
          phone: nomineeData.phone,
          relationship: nomineeData.relationship,
          emergency_code: nomineeData.emergency_code,
        },
      };

      const { ok, data } = await registerUser(payload);
      if (!ok) {
        setApiError(data.error || "Registration failed");
        return;
      }

      // Save user_id + qr_code for TotpSetup page
      localStorage.setItem("reg_user_id", data.user_id);
      localStorage.setItem("reg_qr_code", data.qr_code);
      localStorage.setItem("reg_totp_secret", data.totp_secret);
      localStorage.setItem("totpFlow", "user-register");

      setSuccess("Registration Successful! Setting up 2FA...");
      setTimeout(() => navigate("/totp-setup"), 1200);
    } catch {
      setApiError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(formData.email) &&
    formData.password.length >= 8 &&
    Number(formData.age) >= 18 &&
    /^\d{10}$/.test(formData.phone) &&
    Number(formData.inactivity) >= 1 &&
    nomineeData.name.trim() !== "" &&
    /\S+@\S+\.\S+/.test(nomineeData.email) &&
    /^\d{10}$/.test(nomineeData.phone) &&
    nomineeData.relationship !== "" &&
    nomineeData.emergency_code.trim() !== "";

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">User Registration</h2>

        {success && <p className="success">{success}</p>}
        {apiError && <p className="error">{apiError}</p>}

        {/* ── User Details ── */}
        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Full Name</label>
            <input type="text" name="name" placeholder="Enter your full name"
              className="register-input" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label className="input-label">Email Address</label>
            <input type="email" name="email" placeholder="Enter your email"
              className="register-input" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Password</label>
            <div className="password-box">
              <input type={showPassword ? "text" : "password"} name="password"
                placeholder="Create password" className="register-input"
                value={formData.password} onChange={handleChange} />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
            {strength && (
              <p className={`password-strength ${strength}`}>
                {strength === "weak" && "Weak 🔴"}
                {strength === "medium" && "Medium 🟡"}
                {strength === "strong" && "Strong 🟢"}
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="input-label">Age</label>
            <input type="number" name="age" placeholder="Enter your age"
              className="register-input" value={formData.age} onChange={handleChange} />
            {errors.age && <p className="error">{errors.age}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Phone Number</label>
            <input type="tel" name="phone" placeholder="Enter phone number"
              className="register-input" value={formData.phone} onChange={handleChange} />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </div>
          <div className="form-group">
            <label className="input-label">Inactivity Timer (Days)</label>
            <input type="number" name="inactivity" placeholder="Example: 30"
              className="register-input" value={formData.inactivity} onChange={handleChange} />
            {errors.inactivity && <p className="error">{errors.inactivity}</p>}
          </div>
        </div>

        {/* ── Nominee Details ── */}
        <h3 className="register-title" style={{ marginTop: "24px", fontSize: "18px" }}>
          Nominee Details
        </h3>
        <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "12px" }}>
          A trusted person who can access your vault in an emergency.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Nominee Full Name</label>
            <input type="text" name="name" placeholder="Nominee's full name"
              className="register-input" value={nomineeData.name} onChange={handleNomineeChange} />
            {errors.nominee_name && <p className="error">{errors.nominee_name}</p>}
          </div>
          <div className="form-group">
            <label className="input-label">Nominee Email</label>
            <input type="email" name="email" placeholder="Nominee's email"
              className="register-input" value={nomineeData.email} onChange={handleNomineeChange} />
            {errors.nominee_email && <p className="error">{errors.nominee_email}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Nominee Phone</label>
            <input type="tel" name="phone" placeholder="Nominee's phone"
              className="register-input" value={nomineeData.phone} onChange={handleNomineeChange} />
            {errors.nominee_phone && <p className="error">{errors.nominee_phone}</p>}
          </div>
          <div className="form-group">
            <label className="input-label">Relationship</label>
            <select name="relationship" className="register-input"
              value={nomineeData.relationship} onChange={handleNomineeChange}>
              <option value="">Select Relationship</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
            {errors.nominee_relationship && <p className="error">{errors.nominee_relationship}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="input-label">Emergency Code</label>
            <input type="text" name="emergency_code" placeholder="Create an emergency code"
              className="register-input" value={nomineeData.emergency_code} onChange={handleNomineeChange} />
            {errors.emergency_code && <p className="error">{errors.emergency_code}</p>}
            <small style={{ color: "#888", fontSize: "12px" }}>
              Share this code with your nominee — they'll need it to complete their registration.
            </small>
          </div>
        </div>

        <button className="register-button" onClick={handleSubmit} disabled={!isFormValid || loading}>
          {loading ? "Registering..." : "Continue"}
        </button>

        <p className="login-text">
          Already Registered?{" "}
          <Link to="/login" className="login-link">Click here to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterUser;