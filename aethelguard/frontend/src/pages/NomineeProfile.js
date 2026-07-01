// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import "./NomineeProfile.css";

// function NomineeProfile() {
//   const [isEditing, setIsEditing] = useState(false);

//   const [profileData, setProfileData] = useState({
//     nomineeName: "",
//     nomineeEmail: "",
//     nomineePhone: "",
//     relationship: ""
//   });

//   const [processStatus, setProcessStatus] = useState("Pending");

//   useEffect(() => {
//     const savedNominee = JSON.parse(localStorage.getItem("nomineeData"));
//     const savedBasic = JSON.parse(localStorage.getItem("nomineeBasicData"));
//     const savedStatus = localStorage.getItem("nomineeProcessStatus") || "Pending";

//     if (savedNominee) {
//       setProfileData({
//         nomineeName: savedNominee.nomineeName || "",
//         nomineeEmail: savedNominee.nomineeEmail || "",
//         nomineePhone: savedNominee.nomineePhone || "",
//         relationship: savedNominee.relationship || ""
//       });
//     } else if (savedBasic) {
//       setProfileData({
//         nomineeName: savedBasic.nomineeName || "",
//         nomineeEmail: savedBasic.nomineeEmail || "",
//         nomineePhone: savedBasic.nomineePhone || "",
//         relationship: savedBasic.relationship || ""
//       });
//     }

//     setProcessStatus(savedStatus);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSave = () => {
//     localStorage.setItem("nomineeData", JSON.stringify(profileData));
//     setIsEditing(false);
//     alert("Nominee profile updated successfully");
//   };

//   return (
//     <div className="nomineeProfilePage">
//       <Navbar />

//       <div className="nomineeProfileHeader">
//         <h1>Nominee Profile</h1>
//       </div>

//       <div className="nomineeProfileWrapper">
//         <div className="nomineeLeftCard">
//           <div className="nomineeAvatarBox">
//             <div className="nomineeAvatar">👤</div>
//           </div>

//           <h2>{profileData.nomineeName || "Nominee Name"}</h2>
//           <p>{profileData.nomineeEmail || "nominee@email.com"}</p>

//           <div className="nomineeMiniInfo">
//             <div className="nomineeMiniRow">
//               <span>Relationship</span>
//               <strong>{profileData.relationship || "-"}</strong>
//             </div>
//             <div className="nomineeMiniRow">
//               <span>Phone</span>
//               <strong>{profileData.nomineePhone || "-"}</strong>
//             </div>
//             <div className="nomineeMiniRow">
//               <span>Status</span>
//               <strong
//                 style={{
//                   color: processStatus === "Completed" ? "#16a34a" : "#dc2626"
//                 }}
//               >
//                 {processStatus}
//               </strong>
//             </div>
//           </div>
//         </div>

//         <div className="nomineeRightCard">
//           <div className="nomineeCardHeader">
//             <h3>Account Details</h3>

//             {!isEditing ? (
//               <button className="nomineeEditBtn" onClick={() => setIsEditing(true)}>
//                 Edit
//               </button>
//             ) : (
//               <div className="nomineeBtnGroup">
//                 <button className="nomineeSaveBtn" onClick={handleSave}>
//                   Save
//                 </button>
//                 <button
//                   className="nomineeCancelBtn"
//                   onClick={() => setIsEditing(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="nomineeDetailsTable">
//             <div className="nomineeRow">
//               <div className="nomineeLabel">Nominee Name</div>
//               <div className="nomineeValue">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="nomineeName"
//                     value={profileData.nomineeName}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   profileData.nomineeName || "-"
//                 )}
//               </div>
//             </div>

//             <div className="nomineeRow">
//               <div className="nomineeLabel">Nominee Email</div>
//               <div className="nomineeValue">
//                 {isEditing ? (
//                   <input
//                     type="email"
//                     name="nomineeEmail"
//                     value={profileData.nomineeEmail}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   profileData.nomineeEmail || "-"
//                 )}
//               </div>
//             </div>

//             <div className="nomineeRow">
//               <div className="nomineeLabel">Nominee Phone</div>
//               <div className="nomineeValue">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="nomineePhone"
//                     value={profileData.nomineePhone}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   profileData.nomineePhone || "-"
//                 )}
//               </div>
//             </div>

//             <div className="nomineeRow">
//               <div className="nomineeLabel">Relationship</div>
//               <div className="nomineeValue">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="relationship"
//                     value={profileData.relationship}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   profileData.relationship || "-"
//                 )}
//               </div>
//             </div>

//             <div className="nomineeRow">
//               <div className="nomineeLabel">Registration Status</div>
//               <div
//                 className="nomineeValue"
//                 style={{
//                   fontWeight: "600",
//                   color: processStatus === "Completed" ? "#16a34a" : "#dc2626"
//                 }}
//               >
//                 {processStatus}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default NomineeProfile;



import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./NomineeProfile.css";
import { useNavigate } from "react-router-dom";
import { getNomineeProfile } from "../api/api";

function NomineeProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }

    getNomineeProfile()
      .then(({ ok, data }) => {
        if (ok) setProfileData(data);
        else setApiError(data.error || "Failed to load profile");
      })
      .catch(() => setApiError("Network error"))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="nomineeProfilePage">
        <Navbar />
        <div className="nomineeProfileWrapper" style={{ padding: "40px", color: "#aaa" }}>
          Loading profile...
        </div>
        <Footer />
      </div>
    );
  }

  const p = profileData || {};
  const accessStatus = p.access_status || "none";
  const accessColor =
    accessStatus === "approved" ? "#4ade80" :
    accessStatus === "pending"  ? "#facc15" :
    accessStatus === "denied"   ? "#f87171" : "#94a3b8";

  return (
    <div className="nomineeProfilePage">
      <Navbar />

      <div className="nomineeProfileHeader">
        <h1>Nominee Profile</h1>
      </div>

      {apiError && (
        <p style={{ color: "#f87171", padding: "0 40px" }}>{apiError}</p>
      )}

      <div className="nomineeProfileWrapper">
        {/* Left card */}
        <div className="nomineeLeftCard">
          <div className="nomineeAvatarBox">
            <div className="nomineeAvatar">👤</div>
          </div>
          <h2>{p.name || "Nominee Name"}</h2>
          <p>{p.email || "nominee@email.com"}</p>

          <div className="nomineeMiniInfo">
            <div className="nomineeMiniRow">
              <span>Relationship</span>
              <strong>{p.relationship || "—"}</strong>
            </div>
            <div className="nomineeMiniRow">
              <span>Phone</span>
              <strong>{p.phone || "—"}</strong>
            </div>
            <div className="nomineeMiniRow">
              <span>Vault Access</span>
              <strong style={{ color: accessColor, textTransform: "capitalize" }}>
                {accessStatus}
              </strong>
            </div>
            <div className="nomineeMiniRow">
              <span>Registration</span>
              <strong style={{ color: p.is_registered ? "#4ade80" : "#f87171" }}>
                {p.is_registered ? "Completed" : "Pending"}
              </strong>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="nomineeRightCard">
          <div className="nomineeCardHeader">
            <h3>Account Details</h3>
          </div>

          <div className="nomineeDetailsTable">
            {[
              ["Nominee Name",    p.name],
              ["Email",          p.email],
              ["Phone",          p.phone],
              ["Relationship",   p.relationship],
              ["Vault Owner",    p.user_name],
              ["Access Status",  <span style={{ color: accessColor, textTransform: "capitalize" }}>{accessStatus}</span>],
              ["Registration",   p.is_registered ? "Completed" : "Pending"],
              ["TOTP Enabled",   p.is_totp_enabled ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div className="nomineeRow" key={label}>
                <div className="nomineeLabel">{label}</div>
                <div className="nomineeValue">{value || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NomineeProfile;