// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import "./Profile.css";
// import Footer from "../components/Footer";

// function Profile() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [profileData, setProfileData] = useState({
//     username: "",
//     fullName: "",
//     email: "",
//     age: "",
//     password: "",
//     phone: "",
//     inactivityTimer: "",
//     emergencyCode: "",
//     nomineeName: "",
//     nomineeEmail: "",
//     nomineePhone: "",
//     relationship: ""
//   });

//   const [nomineeStatus, setNomineeStatus] = useState("Pending");

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem("userProfile"));
//     const savedNominee = JSON.parse(localStorage.getItem("nomineeBasicData"));
//     const savedStatus = localStorage.getItem("nomineeProcessStatus") || "Pending";

//     if (savedUser) {
//       setProfileData((prev) => ({
//         ...prev,
//         username: savedUser.username || "",
//         fullName: savedUser.fullName || "",
//         email: savedUser.email || "",
//         age: savedUser.age || "",
//         password: savedUser.password || "",
//         phone: savedUser.phone || "",
//         inactivityTimer: savedUser.inactivityTimer || "",
//         emergencyCode: savedUser.emergencyCode || ""
//       }));
//     }

//     if (savedNominee) {
//       setProfileData((prev) => ({
//         ...prev,
//         nomineeName: savedNominee.nomineeName || "",
//         nomineeEmail: savedNominee.nomineeEmail || "",
//         nomineePhone: savedNominee.nomineePhone || "",
//         relationship: savedNominee.relationship || ""
//       }));
//     }

//     setNomineeStatus(savedStatus);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//   };

//   const handleSave = () => {
//     const updatedUser = {
//       username: profileData.username,
//       fullName: profileData.fullName,
//       email: profileData.email,
//       age: profileData.age,
//       password: profileData.password,
//       phone: profileData.phone,
//       inactivityTimer: profileData.inactivityTimer,
//       emergencyCode: profileData.emergencyCode
//     };

//     localStorage.setItem("userProfile", JSON.stringify(updatedUser));
//     setIsEditing(false);
//     alert("Profile updated successfully");
//   };

//   return (
//     <div className="profilePage">
//       <Navbar />

//       <div className="pageHeader">
//         <h1>Profile</h1>
//       </div>

//       <div className="profileWrapper">
//         <div className="leftProfileCard">
//           <div className="profileImageBox">
//             <div className="profileAvatar">👤</div>
//           </div>

//           <h2>{profileData.fullName || "User Name"}</h2>
//           <p className="profileSubText">@{profileData.username || "username"}</p>

//           <div className="divider"></div>

//           <div className="sectionHeader">
//             <h3>Personal Information</h3>
//           </div>

//           <div className="sideInfoList">
//             <div className="sideInfoRow">
//               <span>Name</span>
//               <strong>{profileData.fullName || "-"}</strong>
//             </div>

//             <div className="sideInfoRow">
//               <span>Username</span>
//               <strong>{profileData.username || "-"}</strong>
//             </div>

//             <div className="sideInfoRow">
//               <span>Email</span>
//               <strong>{profileData.email || "-"}</strong>
//             </div>

//             <div className="sideInfoRow">
//               <span>Age</span>
//               <strong>{profileData.age || "-"}</strong>
//             </div>

//             <div className="sideInfoRow">
//               <span>Emergency Code</span>
//               <strong>{profileData.emergencyCode || "-"}</strong>
//             </div>
//           </div>
//         </div>

//         <div className="rightProfileContent">
//           <div className="topInfoCards">
//             <div className="miniCard">
//               <span className="miniLabel">Vault Status</span>
//               <strong>Active</strong>
//             </div>

//             <div className="miniCard">
//               <span className="miniLabel">Last Check-in</span>
//               <strong>15 May 2026</strong>
//             </div>

//             <div className="miniCard">
//               <span className="miniLabel">Nominee Process</span>
//               <strong
//                 style={{
//                   color: nomineeStatus === "Completed" ? "#16a34a" : "#dc2626"
//                 }}
//               >
//                 {nomineeStatus}
//               </strong>
//             </div>
//           </div>

//           <div className="tabRow">
//             <button className="activeTab">Account Information</button>
//             <button>Security</button>
//             <button>Nominee</button>
//             <button>Settings</button>
//           </div>

//           <div className="detailsCard">
//             <div className="detailsHeader">
//               <h3>Account Information</h3>

//               {!isEditing ? (
//                 <button className="editBtn" onClick={handleEditToggle}>
//                   Edit
//                 </button>
//               ) : (
//                 <div className="actionBtns">
//                   <button className="saveBtn" onClick={handleSave}>
//                     Save
//                   </button>
//                   <button className="cancelBtn" onClick={handleEditToggle}>
//                     Cancel
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div className="detailsTable">
//               <div className="tableRow">
//                 <div className="tableLabel">Full Name</div>
//                 <div className="tableValue">{profileData.fullName}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Email</div>
//                 <div className="tableValue">{profileData.email}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Age</div>
//                 <div className="tableValue">{profileData.age}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Phone Number</div>
//                 <div className="tableValue">
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       name="phone"
//                       value={profileData.phone}
//                       onChange={handleChange}
//                     />
//                   ) : (
//                     profileData.phone
//                   )}
//                 </div>
//               </div>

//               <div className="tableRow">
//   <div className="tableLabel">Password</div>
//   <div className="tableValue">
//     <div className="profile-password-box">
//       {isEditing ? (
//         <input
//           type={showPassword ? "text" : "password"}
//           name="password"
//           value={profileData.password}
//           onChange={handleChange}
//           className="profile-password-input"
//         />
//       ) : (
//         <span className="profile-password-text">
//           {showPassword ? profileData.password : "••••••••"}
//         </span>
//       )}

//       <span
//         className="profile-toggle-password"
//         onClick={() => setShowPassword(!showPassword)}
//       >
//         {showPassword ? "visibility_off" : "visibility"}
//       </span>
//     </div>
//   </div>
// </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Inactivity Timer</div>
//                 <div className="tableValue">
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       name="inactivityTimer"
//                       value={profileData.inactivityTimer}
//                       onChange={handleChange}
//                     />
//                   ) : (
//                     profileData.inactivityTimer
//                   )}
//                 </div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Emergency Code</div>
//                 <div className="tableValue">{profileData.emergencyCode}</div>
//               </div>
//             </div>
//           </div>

//           <div className="detailsCard">
//             <div className="detailsHeader">
//               <h3>Nominee Information</h3>
//             </div>

//             <div className="detailsTable">
//               <div className="tableRow">
//                 <div className="tableLabel">Nominee Name</div>
//                 <div className="tableValue">{profileData.nomineeName || "-"}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Nominee Email</div>
//                 <div className="tableValue">{profileData.nomineeEmail || "-"}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Nominee Phone</div>
//                 <div className="tableValue">{profileData.nomineePhone || "-"}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Relationship</div>
//                 <div className="tableValue">{profileData.relationship || "-"}</div>
//               </div>

//               <div className="tableRow">
//                 <div className="tableLabel">Process Status</div>
//                 <div
//                   className="tableValue"
//                   style={{
//                     color: nomineeStatus === "Completed" ? "#16a34a" : "#dc2626",
//                     fontWeight: "600"
//                   }}
//                 >
//                   {nomineeStatus}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default Profile;


import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Profile.css";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, getVaultStatus } from "../api/api";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    name: "", email: "", age: "", phone: "",
    inactivity_days: "", role: "",
    nominee_name: "", nominee_email: "", nominee_phone: "", nominee_relationship: "",
    nominee_registered: false, nominee_access_status: "none",
  });

  const [vaultInfo, setVaultInfo] = useState({ status: "—", next_checkin: "—" });

  // Editable fields
  const [editData, setEditData] = useState({ name: "", phone: "", inactivity_days: "" });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }

    Promise.all([getUserProfile(), getVaultStatus()])
      .then(([profileRes, vaultRes]) => {
        if (profileRes.ok) {
          const d = profileRes.data;
          const nom = d.nominee || {};
          setProfileData({
            name: d.name || "",
            email: d.email || "",
            age: d.age || "",
            phone: d.phone || "",
            inactivity_days: d.inactivity_days || "",
            role: d.role || "",
            nominee_name: nom.name || "",
            nominee_email: nom.email || "",
            nominee_phone: nom.phone || "",
            nominee_relationship: nom.relationship || "",
            nominee_registered: nom.is_registered || false,
            nominee_access_status: nom.access_status || "none",
          });
          setEditData({
            name: d.name || "",
            phone: d.phone || "",
            inactivity_days: d.inactivity_days || "",
          });
        }
        if (vaultRes.ok) {
          setVaultInfo({ status: vaultRes.data.status, next_checkin: vaultRes.data.next_checkin });
        }
      })
      .catch(() => setApiError("Network error"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess("");
    setApiError("");
    try {
      const { ok, data } = await updateUserProfile({
        name: editData.name,
        phone: editData.phone,
        inactivity_days: Number(editData.inactivity_days),
      });
      if (!ok) { setApiError(data.error || "Save failed"); return; }
      setProfileData((prev) => ({
        ...prev,
        name: editData.name,
        phone: editData.phone,
        inactivity_days: editData.inactivity_days,
      }));
      setSaveSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch {
      setApiError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const nomineeStatusColor = profileData.nominee_registered ? "#4ade80" : "#f87171";
  const accessColor =
    profileData.nominee_access_status === "approved" ? "#4ade80" :
    profileData.nominee_access_status === "pending"  ? "#facc15" :
    profileData.nominee_access_status === "denied"   ? "#f87171" : "#94a3b8";

  if (loading) {
    return (
      <div className="profilePage">
        <Navbar />
        <div style={{ padding: "60px", color: "#aaa" }}>Loading profile...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profilePage">
      <Navbar />

      <div className="pageHeader"><h1>Profile</h1></div>

      <div className="profileWrapper">

        {/* ── Left card ── */}
        <div className="leftProfileCard">
          <div className="profileImageBox">
            <div className="profileAvatar">👤</div>
          </div>
          <h2>{profileData.name || "User Name"}</h2>
          <p className="profileSubText">{profileData.email}</p>

          <div className="divider"></div>
          <div className="sectionHeader"><h3>Personal Information</h3></div>

          <div className="sideInfoList">
            {[
              ["Name",           profileData.name],
              ["Email",          profileData.email],
              ["Age",            profileData.age],
              ["Role",           profileData.role],
            ].map(([label, value]) => (
              <div className="sideInfoRow" key={label}>
                <span>{label}</span>
                <strong>{value || "—"}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right card ── */}
        <div className="rightProfileContent">

          {/* Status mini cards */}
          <div className="topInfoCards">
            <div className="miniCard">
              <span className="miniLabel">Vault Status</span>
              <strong style={{ color: vaultInfo.status === "Active" ? "#4ade80" : "#f87171" }}>
                {vaultInfo.status}
              </strong>
            </div>
            <div className="miniCard">
              <span className="miniLabel">Next Check-in</span>
              <strong>{vaultInfo.next_checkin}</strong>
            </div>
            <div className="miniCard">
              <span className="miniLabel">Nominee Status</span>
              <strong style={{ color: nomineeStatusColor }}>
                {profileData.nominee_registered ? "Registered" : "Pending"}
              </strong>
            </div>
          </div>

          {apiError  && <p className="error"  style={{ marginBottom: "10px" }}>{apiError}</p>}
          {saveSuccess && <p style={{ color: "#4ade80", marginBottom: "10px" }}>{saveSuccess}</p>}

          {/* Account Info card */}
          <div className="detailsCard">
            <div className="detailsHeader">
              <h3>Account Information</h3>
              {!isEditing ? (
                <button className="editBtn" onClick={() => setIsEditing(true)}>Edit</button>
              ) : (
                <div className="actionBtns">
                  <button className="saveBtn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="cancelBtn" onClick={() => { setIsEditing(false); setApiError(""); }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="detailsTable">
              {/* Name */}
              <div className="tableRow">
                <div className="tableLabel">Full Name</div>
                <div className="tableValue">
                  {isEditing
                    ? <input type="text" name="name" value={editData.name} onChange={handleEditChange} />
                    : profileData.name}
                </div>
              </div>
              {/* Email - read only */}
              <div className="tableRow">
                <div className="tableLabel">Email</div>
                <div className="tableValue">{profileData.email}</div>
              </div>
              {/* Age - read only */}
              <div className="tableRow">
                <div className="tableLabel">Age</div>
                <div className="tableValue">{profileData.age}</div>
              </div>
              {/* Phone */}
              <div className="tableRow">
                <div className="tableLabel">Phone Number</div>
                <div className="tableValue">
                  {isEditing
                    ? <input type="text" name="phone" value={editData.phone} onChange={handleEditChange} />
                    : profileData.phone}
                </div>
              </div>
              {/* Password - display only masked */}
              <div className="tableRow">
                <div className="tableLabel">Password</div>
                <div className="tableValue">
                  <div className="profile-password-box">
                    <span className="profile-password-text">
                      {showPassword ? "(stored securely on server)" : "••••••••"}
                    </span>
                    <span
                      className="profile-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Inactivity */}
              <div className="tableRow">
                <div className="tableLabel">Inactivity Timer</div>
                <div className="tableValue">
                  {isEditing
                    ? <input type="number" name="inactivity_days" value={editData.inactivity_days} onChange={handleEditChange} />
                    : `${profileData.inactivity_days} days`}
                </div>
              </div>
            </div>
          </div>

          {/* Nominee Info card */}
          <div className="detailsCard">
            <div className="detailsHeader"><h3>Nominee Information</h3></div>
            <div className="detailsTable">
              {[
                ["Nominee Name",         profileData.nominee_name],
                ["Nominee Email",        profileData.nominee_email],
                ["Nominee Phone",        profileData.nominee_phone],
                ["Relationship",         profileData.nominee_relationship],
                ["Registration Status",  profileData.nominee_registered ? "Completed" : "Pending"],
                ["Vault Access",         profileData.nominee_access_status],
              ].map(([label, value]) => (
                <div className="tableRow" key={label}>
                  <div className="tableLabel">{label}</div>
                  <div
                    className="tableValue"
                    style={
                      label === "Registration Status"
                        ? { color: nomineeStatusColor, fontWeight: "600" }
                        : label === "Vault Access"
                        ? { color: accessColor, fontWeight: "600", textTransform: "capitalize" }
                        : {}
                    }
                  >
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;