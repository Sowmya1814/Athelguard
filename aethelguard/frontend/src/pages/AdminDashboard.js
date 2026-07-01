// import React from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import "./AdminDashboard.css";

// function AdminDashboard() {
//   return (
//     <div className="adminDashboardPage">
//       <Navbar />

//       <div className="adminDashboardWrapper">
//         <h1>Admin Dashboard</h1>

//         <div className="adminGroup">
//           <div className="adminGroupHeader">
//             <div>
//               <h2>Admin</h2>
//               <span>Admin User Management</span>
//             </div>
//             <span className="adminChevron">⌄</span>
//           </div>

//           <div className="apiList">
//             <div className="apiRow get">
//               <div className="methodTag getTag">GET</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/admin/profile</div>
//                 <div className="apiDesc">Get admin profile</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow get">
//               <div className="methodTag getTag">GET</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/admin/users</div>
//                 <div className="apiDesc">List all users and their nominees</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow get">
//               <div className="methodTag getTag">GET</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/admin/users/{"{user_id}"}</div>
//                 <div className="apiDesc">
//                   Get single user details (admin cannot see file contents)
//                 </div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow put">
//               <div className="methodTag putTag">PUT</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/admin/users/{"{user_id}"}/reset-mfa</div>
//                 <div className="apiDesc">
//                   Reset MFA for user or nominee (when they lose their phone)
//                 </div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow put">
//               <div className="methodTag putTag">PUT</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/admin/users/{"{user_id}"}/status</div>
//                 <div className="apiDesc">
//                   Activate or deactivate a user account
//                 </div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>
//           </div>
//         </div>

//         <div className="adminGroup">
//           <div className="adminGroupHeader">
//             <div>
//               <h2>Vault</h2>
//               <span>Upload and Manage Encrypted Files/Text</span>
//             </div>
//             <span className="adminChevron">⌄</span>
//           </div>

//           <div className="apiList">
//             <div className="apiRow get">
//               <div className="methodTag getTag">GET</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/vault/items</div>
//                 <div className="apiDesc">List all vault items (metadata only)</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow get">
//               <div className="methodTag getTag">GET</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/vault/item/{"{item_id}"}</div>
//                 <div className="apiDesc">View and decrypt a single vault item</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow post">
//               <div className="methodTag postTag">POST</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/vault/upload/file</div>
//                 <div className="apiDesc">Upload and encrypt a file to vault</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow post">
//               <div className="methodTag postTag">POST</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/vault/upload/text</div>
//                 <div className="apiDesc">Upload and encrypt text to vault</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>

//             <div className="apiRow delete">
//               <div className="methodTag deleteTag">DELETE</div>
//               <div className="apiContent">
//                 <div className="apiPath">/api/vault/items/{"{item_id}"}</div>
//                 <div className="apiDesc">Delete a vault item permanently</div>
//               </div>
//               <div className="apiLock">🔒</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default AdminDashboard;


import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { adminListUsers, adminDeleteUser } from "../api/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role   = localStorage.getItem("loginRole");
    if (!token || role !== "admin") { navigate("/login"); return; }

    adminListUsers()
      .then(({ ok, data }) => {
        if (ok) setUsers(data.users || []);
        else setApiError(data.error || "Failed to load users");
      })
      .catch(() => setApiError("Network error"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" permanently?`)) return;
    try {
      const { ok, data } = await adminDeleteUser(userId);
      if (ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
      else alert(data.error || "Delete failed");
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="adminDashboardPage">
      <Navbar />

      <div className="adminDashboardWrapper">
        <h1>Admin Dashboard</h1>

        {apiError && <p style={{ color: "#f87171", marginBottom: "16px" }}>{apiError}</p>}

        {/* ── Users Table ── */}
        <div className="adminGroup">
          <div className="adminGroupHeader">
            <div>
              <h2>Registered Users</h2>
              <span>{loading ? "Loading..." : `${users.length} total`}</span>
            </div>
            <span className="adminChevron">⌄</span>
          </div>

          {!loading && users.length === 0 ? (
            <p style={{ color: "#aaa", padding: "16px" }}>No users found.</p>
          ) : (
            <div className="apiList">
              {users.map((user) => (
                <div className="apiRow get" key={user.id} style={{ alignItems: "flex-start", padding: "12px 16px" }}>
                  <div className="apiContent" style={{ flex: 1 }}>
                    <div className="apiPath">{user.name} &nbsp;<span style={{ color: "#aaa", fontSize: "12px" }}>#{user.id}</span></div>
                    <div className="apiDesc">{user.email} · {user.phone}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      Role: {user.role} &nbsp;|&nbsp;
                      Active: {user.is_active ? "✅" : "❌"} &nbsp;|&nbsp;
                      Inactivity: {user.inactivity_days}d &nbsp;|&nbsp;
                      Vault: {user.is_vault_locked ? "🔒 Locked" : "🔓 Active"}
                    </div>
                    {user.nominee && (
                      <div style={{ fontSize: "12px", color: "#7c3aed", marginTop: "4px" }}>
                        Nominee: {user.nominee.name} ({user.nominee.email}) —
                        Access: <span style={{ textTransform: "capitalize" }}>{user.nominee.access_status}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    style={{
                      background: "#7f1d1d", color: "#fff", border: "none",
                      borderRadius: "6px", padding: "4px 12px", cursor: "pointer",
                      fontSize: "12px", marginLeft: "12px", marginTop: "4px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── API Reference (kept as-is from original) ── */}
        <div className="adminGroup">
          <div className="adminGroupHeader">
            <div>
              <h2>Vault</h2>
              <span>Upload and Manage Encrypted Files/Text</span>
            </div>
            <span className="adminChevron">⌄</span>
          </div>

          <div className="apiList">
            {[
              ["GET",    "/api/vault/items",               "List all vault items (metadata only)"],
              ["GET",    "/api/vault/item/{item_id}",      "View and decrypt a single vault item"],
              ["POST",   "/api/vault/upload/file",         "Upload and encrypt a file to vault"],
              ["POST",   "/api/vault/upload/text",         "Upload and encrypt text to vault"],
              ["DELETE", "/api/vault/items/{item_id}",     "Delete a vault item permanently"],
            ].map(([method, path, desc]) => (
              <div className={`apiRow ${method.toLowerCase()}`} key={path}>
                <div className={`methodTag ${method.toLowerCase()}Tag`}>{method}</div>
                <div className="apiContent">
                  <div className="apiPath">{path}</div>
                  <div className="apiDesc">{desc}</div>
                </div>
                <div className="apiLock">🔒</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboard;