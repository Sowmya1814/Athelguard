// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import "./Nominee.css";

// function Nominee() {
//   const [formData, setFormData] = useState({
//     nomineeName: "",
//     nomineeEmail: "",
//     nomineePhone: "",
//     relationship: "",
//     otherRelationship: "",
//     emergencyCode: ""
//   });

//   const [saved, setSaved] = useState(false);

//   useEffect(() => {
//     const savedData = JSON.parse(localStorage.getItem("nomineeBasicData"));

//     if (savedData) {
//       setFormData({
//         nomineeName: savedData.nomineeName || "",
//         nomineeEmail: savedData.nomineeEmail || "",
//         nomineePhone: savedData.nomineePhone || "",
//         relationship: savedData.relationship || "",
//         otherRelationship: savedData.otherRelationship || "",
//         emergencyCode: savedData.emergencyCode || ""
//       });
//       setSaved(true);
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const finalRelationship =
//       formData.relationship === "Other"
//         ? formData.otherRelationship
//         : formData.relationship;

//     const dataToSave = {
//       nomineeName: formData.nomineeName,
//       nomineeEmail: formData.nomineeEmail,
//       nomineePhone: formData.nomineePhone,
//       relationship: finalRelationship,
//       otherRelationship: formData.otherRelationship,
//       emergencyCode: formData.emergencyCode
//     };

//     localStorage.setItem("nomineeBasicData", JSON.stringify(dataToSave));
//     localStorage.setItem("nomineeProcessStatus", "Pending");

//     setSaved(true);
//     alert("Nominee details saved successfully. Invitation email sent to nominee.");
//   };

//   return (
//     <div className="nomineePage">
//       <Navbar />

//       <div className="nomineeWrapper">
//         <h1>Nominee Details</h1>

//         <div className="nomineeCard">
//           <h3>Add Nominee</h3>
//           <p>
//             Fill nominee details. The nominee will receive an email invitation
//             to complete their registration process.
//           </p>

//           <form className="nomineeForm" onSubmit={handleSubmit}>
//             <div className="formGrid">
//               <div className="formGroup">
//                 <label>Nominee Name</label>
//                 <input
//                   type="text"
//                   name="nomineeName"
//                   value={formData.nomineeName}
//                   onChange={handleChange}
//                   placeholder="Enter nominee full name"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label>Nominee Email</label>
//                 <input
//                   type="email"
//                   name="nomineeEmail"
//                   value={formData.nomineeEmail}
//                   onChange={handleChange}
//                   placeholder="Enter nominee email"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label>Nominee Phone</label>
//                 <input
//                   type="tel"
//                   name="nomineePhone"
//                   value={formData.nomineePhone}
//                   onChange={handleChange}
//                   placeholder="Enter nominee phone number"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label>Relationship</label>
//                 <select
//                   name="relationship"
//                   value={formData.relationship}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select relationship</option>
//                   <option value="Father">Father</option>
//                   <option value="Mother">Mother</option>
//                   <option value="Wife">Wife</option>
//                   <option value="Husband">Husband</option>
//                   <option value="Son">Son</option>
//                   <option value="Daughter">Daughter</option>
//                   <option value="Brother">Brother</option>
//                   <option value="Sister">Sister</option>
//                   <option value="Grandfather">Grandfather</option>
//                   <option value="Grandmother">Grandmother</option>
//                   <option value="Friend">Friend</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>

//               {formData.relationship === "Other" && (
//                 <div className="formGroup">
//                   <label>Other Relationship</label>
//                   <input
//                     type="text"
//                     name="otherRelationship"
//                     value={formData.otherRelationship}
//                     onChange={handleChange}
//                     placeholder="Enter relationship"
//                     required
//                   />
//                 </div>
//               )}

//               <div className="formGroup fullWidth">
//                 <label>Emergency Access Code</label>
//                 <input
//                   type="text"
//                   name="emergencyCode"
//                   value={formData.emergencyCode}
//                   onChange={handleChange}
//                   placeholder="Enter emergency access code"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="nomineeActionRow">
//               <button type="submit" className="submitBtn">
//                 {saved ? "Update Nominee Details" : "Save Nominee Details"}
//               </button>
//             </div>
//           </form>

//           <div className="processStatusBox">
//             <span className="statusLabel">Process Status:</span>
//             <span className={saved ? "statusPending" : "statusPending"}>
//               {saved ? "Pending" : "Pending"}
//             </span>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default Nominee;

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Nominee.css";
import { useNavigate } from "react-router-dom";
import { getUserProfile, handleNomineeAccessRequest } from "../api/api";

function Nominee() {
  const navigate = useNavigate();
  const [nominee, setNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    getUserProfile()
      .then(({ ok, data }) => {
        if (ok && data.nominee) setNominee(data.nominee);
        else if (!ok) setApiError(data.error || "Failed to load nominee data");
      })
      .catch(() => setApiError("Network error"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleAccessAction = async (action) => {
    setActionLoading(true);
    setActionMsg("");
    setApiError("");
    try {
      const { ok, data } = await handleNomineeAccessRequest(action);
      if (ok) {
        setActionMsg(data.message);
        setNominee((prev) => ({
          ...prev,
          access_status: action === "approve" ? "approved" : "denied",
        }));
      } else {
        setApiError(data.error || "Action failed");
      }
    } catch {
      setApiError("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const accessStatus = nominee?.access_status || "none";
  const accessStatusClass =
    accessStatus === "approved" ? "accessApproved" :
    accessStatus === "pending"  ? "accessPending"  :
    accessStatus === "denied"   ? "accessDenied"   : "accessNone";

  return (
    <div className="nomineePage">
      <Navbar />

      <div className="nomineeWrapper">
        <h1>Nominee Details</h1>

        {loading   && <p className="nomineeLoadingText">Loading nominee data...</p>}
        {apiError  && <p className="nomineeErrorText">{apiError}</p>}
        {actionMsg && <p className="nomineeSuccessText">{actionMsg}</p>}

        {!loading && !nominee && !apiError && (
          <div className="nomineeCard">
            <h3>No Nominee Found</h3>
            <p>Nominee details are set during registration and cannot be changed from this page.</p>
          </div>
        )}

        {nominee && (
          <div className="nomineeCard">
            <h3>Nominee Information</h3>
            <p>Your nominated trusted person. They were invited via email during your registration.</p>

            <div className="nomineeForm">
              <div className="formGrid">
                {[
                  ["Nominee Name",  nominee.name],
                  ["Nominee Email", nominee.email],
                  ["Nominee Phone", nominee.phone],
                  ["Relationship",  nominee.relationship],
                  ["Registration",  nominee.is_registered ? "✅ Completed" : "⏳ Pending"],
                  ["TOTP Enabled",  nominee.is_totp_enabled ? "✅ Yes" : "❌ No"],
                ].map(([label, value]) => (
                  <div className="formGroup" key={label}>
                    <label>{label}</label>
                    <div className="readonlyBox">{value || "—"}</div>
                  </div>
                ))}

                {/* Vault Access Status — uses CSS class, NO inline style */}
                <div className="formGroup fullWidth">
                  <label>Vault Access Status</label>
                  <div className={`readonlyBox accessStatusBox ${accessStatusClass}`}>
                    {accessStatus === "approved" && "✅ "}
                    {accessStatus === "pending"  && "⏳ "}
                    {accessStatus === "denied"   && "❌ "}
                    <span style={{ textTransform: "capitalize" }}>{accessStatus}</span>
                  </div>
                </div>
              </div>

              {accessStatus === "pending" && (
                <div className="nomineeActionRow">
                  <button
                    className="submitBtn approveBtn"
                    onClick={() => handleAccessAction("approve")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "✅ Approve Access"}
                  </button>
                  <button
                    className="submitBtn denyBtn"
                    onClick={() => handleAccessAction("deny")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "❌ Deny Access"}
                  </button>
                </div>
              )}
            </div>

            <div className="processStatusBox">
              <span className="statusLabel">Access Status:</span>
              <span className={`statusValue ${accessStatusClass}`} style={{ textTransform: "capitalize" }}>
                {accessStatus}
              </span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Nominee;