import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./NomineeDashboard.css";
import { useNavigate } from "react-router-dom";
import {
  getNomineeProfile,
  nomineeRequestAccess,
  nomineeVerifyAccess,
  nomineeListVault,
  nomineeGetVaultItem,
} from "../api/api";

// ── Inline vault item viewer modal ────────────────────────────────────────────
function VaultViewModal({ item, onClose }) {
  if (!item) return null;
  const isImage = item.mime_type?.startsWith("image/");
  const isPdf   = item.mime_type === "application/pdf";

  return (
    <div className="ndModalOverlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ndModal">
        <div className="ndModalHeader">
          <span>{item.item_type === "text" ? "📝" : "📄"}</span>
          <div className="ndModalTitleWrap">
            <h3>{item.title}</h3>
            <span className="ndModalSub">
              {item.item_type === "text" ? "Note" : item.original_filename}
              {item.file_size ? ` · ${(item.file_size / 1024).toFixed(1)} KB` : ""}
            </span>
          </div>
          <button className="ndModalClose" onClick={onClose}>✕</button>
        </div>
        <div className="ndModalBody">
          {item.item_type === "text" && (
            <div className="ndModalText">{item.content || "No content."}</div>
          )}
          {item.item_type === "file" && item.file_data && isImage && (
            <img src={`data:${item.mime_type};base64,${item.file_data}`} alt={item.title} className="ndModalImage" />
          )}
          {item.item_type === "file" && item.file_data && isPdf && (
            <iframe src={`data:application/pdf;base64,${item.file_data}`} title={item.title} className="ndModalPdf" />
          )}
          {item.item_type === "file" && item.file_data && !isImage && !isPdf && (
            <div className="ndModalDownloadWrap">
              <p>📎 <strong>{item.original_filename}</strong></p>
              <a href={`data:${item.mime_type || "application/octet-stream"};base64,${item.file_data}`}
                download={item.original_filename} className="ndDownloadBtn">⬇ Download File</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function NomineeDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionMsg, setActionMsg]       = useState("");
  const [actionError, setActionError]   = useState("");
  const [requesting, setRequesting]     = useState(false);

  // Emergency code verify
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState("");
  const [verifyMsg, setVerifyMsg]         = useState("");
  const [verifyError, setVerifyError]     = useState("");
  const [verifying, setVerifying]         = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  // Vault items
  const [vaultItems, setVaultItems]     = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [activeItem, setActiveItem]     = useState(null);
  const [itemLoading, setItemLoading]   = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { ok, data } = await getNomineeProfile();
      if (ok) setProfile(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, [fetchProfile, navigate]);

  const accessStatus = profile?.access_status || "none";
  const isApproved   = accessStatus === "approved" || accessStatus === "auto_approved";

  // ── Request access ─────────────────────────────────────
  const handleRequestAccess = async () => {
    setRequesting(true);
    setActionMsg(""); setActionError("");
    try {
      const { ok, data } = await nomineeRequestAccess();
      if (ok) { setActionMsg(data.message); setProfile((p) => ({ ...p, access_status: "pending" })); }
      else      setActionError(data.error || "Request failed.");
    } catch { setActionError("Network error."); }
    finally   { setRequesting(false); }
  };

  // ── Verify emergency code ──────────────────────────────
  const handleVerifyAccess = async () => {
    if (!emergencyCode.trim()) { setVerifyError("Enter your emergency code."); return; }
    setVerifying(true); setVerifyMsg(""); setVerifyError("");
    try {
      const { ok, data } = await nomineeVerifyAccess(emergencyCode);
      if (ok) {
        setVerifyMsg("✅ Access verified! Loading vault...");
        setVaultUnlocked(true);
        loadVaultItems();
      } else {
        setVerifyError(data.error || "Verification failed.");
      }
    } catch { setVerifyError("Network error."); }
    finally  { setVerifying(false); }
  };

  // ── Load vault items (after verify) ───────────────────
  const loadVaultItems = async () => {
    setVaultLoading(true);
    try {
      const { ok, data } = await nomineeListVault();
      if (ok) setVaultItems(data.vault_items || []);
    } catch {}
    finally { setVaultLoading(false); }
  };

  // ── Open a vault item ──────────────────────────────────
  const handleOpenItem = async (itemId) => {
    setItemLoading(true);
    try {
      const { ok, data } = await nomineeGetVaultItem(itemId);
      if (ok) setActiveItem(data);
      else    alert(data.error || "Failed to load item");
    } catch { alert("Network error"); }
    finally  { setItemLoading(false); }
  };

  // ── Status badge helper ────────────────────────────────
  const statusBadge = (s) => {
    const map = {
      approved:      { label: "Approved",      cls: "badgeGreen"  },
      auto_approved: { label: "Auto-Approved", cls: "badgeGreen"  },
      pending:       { label: "Pending",        cls: "badgeYellow" },
      denied:        { label: "Denied",         cls: "badgeRed"    },
      none:          { label: "No Request",     cls: "badgeGray"   },
    };
    const b = map[s] || map.none;
    return <span className={`ndBadge ${b.cls}`}>{b.label}</span>;
  };

  return (
    <div className="nomineeDashPage">
      <Navbar />

      <div className="nomineeDashWrap">
        <div className="nomineeDashHead">
          <h1>Nominee Dashboard</h1>
          {profile && <p className="nomineeDashSub">Welcome, <strong>{profile.name}</strong></p>}
        </div>

        {loading ? (
          <div className="ndLoadingBox"><div className="ndSpinner" /><p>Loading your dashboard...</p></div>
        ) : (
          <>
            {/* ── Status Cards Row ── */}
            <div className="ndStatusRow">
              <div className="ndStatCard">
                <div className="ndStatIcon">👤</div>
                <div className="ndStatInfo">
                  <span className="ndStatLabel">Vault Owner</span>
                  <strong>{profile?.user_name || "—"}</strong>
                </div>
              </div>
              <div className="ndStatCard">
                <div className="ndStatIcon">🔐</div>
                <div className="ndStatInfo">
                  <span className="ndStatLabel">Vault Access</span>
                  {statusBadge(accessStatus)}
                </div>
              </div>
              <div className="ndStatCard">
                <div className="ndStatIcon">✅</div>
                <div className="ndStatInfo">
                  <span className="ndStatLabel">Registration</span>
                  <strong style={{ color: profile?.is_registered ? "#15803d" : "#b45309" }}>
                    {profile?.is_registered ? "Completed" : "Pending"}
                  </strong>
                </div>
              </div>
              <div className="ndStatCard">
                <div className="ndStatIcon">📱</div>
                <div className="ndStatInfo">
                  <span className="ndStatLabel">2FA Status</span>
                  <strong style={{ color: profile?.is_totp_enabled ? "#15803d" : "#b45309" }}>
                    {profile?.is_totp_enabled ? "Enabled" : "Not Set"}
                  </strong>
                </div>
              </div>
            </div>

            {/* ── Main content area ── */}
            <div className="ndMainGrid">

              {/* Left: Access Request panel */}
              <div className="ndPanel">
                <div className="ndPanelHeader">
                  <span className="ndPanelIcon">🔓</span>
                  <h2>Vault Access</h2>
                </div>

                {actionMsg   && <div className="ndAlertSuccess">{actionMsg}</div>}
                {actionError && <div className="ndAlertError">{actionError}</div>}

                {/* Not requested yet */}
                {accessStatus === "none" && (
                  <div className="ndAccessSection">
                    <p className="ndAccessDesc">
                      You can request access to the vault owner's encrypted files. The owner will receive an email to approve or deny your request.
                    </p>
                    <button className="ndPrimaryBtn" onClick={handleRequestAccess} disabled={requesting}>
                      {requesting ? "Sending..." : "📨 Request Vault Access"}
                    </button>
                  </div>
                )}

                {/* Pending */}
                {accessStatus === "pending" && (
                  <div className="ndAccessSection">
                    <div className="ndInfoBox yellow">
                      <span>⏳</span>
                      <p>Your access request is pending approval from the vault owner. You'll receive an email once they respond. If the owner is inactive for 24 hours, access will be auto-approved.</p>
                    </div>
                  </div>
                )}

                {/* Denied */}
                {accessStatus === "denied" && (
                  <div className="ndAccessSection">
                    <div className="ndInfoBox red">
                      <span>❌</span>
                      <p>Your access request was denied by the vault owner.</p>
                    </div>
                    <button className="ndPrimaryBtn" style={{ marginTop: 16 }} onClick={handleRequestAccess} disabled={requesting}>
                      {requesting ? "Sending..." : "📨 Request Again"}
                    </button>
                  </div>
                )}

                {/* Approved — show emergency code verify */}
                {isApproved && !vaultUnlocked && (
                  <div className="ndAccessSection">
                    <div className="ndInfoBox green">
                      <span>✅</span>
                      <p>Access has been granted! Enter your emergency code below to unlock and view the vault.</p>
                    </div>

                    <button className="ndPrimaryBtn" style={{ marginTop: 16 }}
                      onClick={() => setShowVerifyBox(!showVerifyBox)}>
                      🔑 {showVerifyBox ? "Hide" : "Enter Emergency Code"}
                    </button>

                    {showVerifyBox && (
                      <div className="ndVerifyBox">
                        {verifyMsg   && <p className="ndAlertSuccess" style={{ marginBottom: 10 }}>{verifyMsg}</p>}
                        {verifyError && <p className="ndAlertError"   style={{ marginBottom: 10 }}>{verifyError}</p>}
                        <input
                          type="text"
                          placeholder="Emergency access code"
                          className="ndInput"
                          value={emergencyCode}
                          onChange={(e) => { setEmergencyCode(e.target.value); setVerifyError(""); }}
                        />
                        <button className="ndPrimaryBtn" onClick={handleVerifyAccess} disabled={verifying}>
                          {verifying ? "Verifying..." : "🔓 Unlock Vault"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Vault is unlocked */}
                {vaultUnlocked && (
                  <div className="ndAccessSection">
                    <div className="ndInfoBox green">
                      <span>🔓</span>
                      <p>Vault is unlocked. You can view all items on the right.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Vault items */}
              <div className="ndPanel ndVaultPanel">
                <div className="ndPanelHeader">
                  <span className="ndPanelIcon">🗄</span>
                  <h2>Vault Contents</h2>
                  {vaultUnlocked && <span className="ndItemCount">{vaultItems.length} items</span>}
                </div>

                {!vaultUnlocked ? (
                  <div className="ndLockedState">
                    <div className="ndLockIcon">🔒</div>
                    <p>Vault is locked</p>
                    <span>Request and verify access to view encrypted files</span>
                  </div>
                ) : vaultLoading ? (
                  <div className="ndLoadingBox" style={{ padding: "40px" }}>
                    <div className="ndSpinner" /><p>Loading vault items...</p>
                  </div>
                ) : vaultItems.length === 0 ? (
                  <div className="ndLockedState">
                    <div className="ndLockIcon">📭</div>
                    <p>No items found</p>
                    <span>The vault owner hasn't uploaded any files yet</span>
                  </div>
                ) : (
                  <div className="ndVaultList">
                    {vaultItems.map((item) => {
                      const isNote = item.item_type === "text";
                      return (
                        <div
                          className="ndVaultItem"
                          key={item.id}
                          onClick={() => handleOpenItem(item.id)}
                        >
                          <div className={`ndVaultItemIcon ${isNote ? "iconNote" : "iconFile"}`}>
                            {isNote ? "📝" : "📄"}
                          </div>
                          <div className="ndVaultItemMeta">
                            <span className="ndVaultItemTitle">{item.title}</span>
                            <span className="ndVaultItemSub">
                              {isNote ? "Note" : item.original_filename || "File"}
                              {item.file_size ? ` · ${(item.file_size / 1024).toFixed(1)} KB` : ""}
                            </span>
                          </div>
                          <span className={`ndVaultBadge ${isNote ? "badgeNote" : "badgeFile"}`}>
                            {isNote ? "Note" : "File"}
                          </span>
                          <span className="ndViewHint">
                            {itemLoading ? "⏳" : "👁 View"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vault item modal */}
      {activeItem && <VaultViewModal item={activeItem} onClose={() => setActiveItem(null)} />}

      <Footer />
    </div>
  );
}

export default NomineeDashboard;





// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import "./NomineeDashboard.css";
// import { useNavigate } from "react-router-dom";
// import { getNomineeProfile, nomineeRequestAccess } from "../api/api";

// function NomineeDashboard() {
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [accessMsg, setAccessMsg] = useState("");
//   const [accessError, setAccessError] = useState("");
//   const [requesting, setRequesting] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     if (!token) { navigate("/login"); return; }

//     getNomineeProfile()
//       .then(({ ok, data }) => {
//         if (ok) setProfile(data);
//       })
//       .finally(() => setLoading(false));
//   }, [navigate]);

//   const handleRequestAccess = async () => {
//     setRequesting(true);
//     setAccessMsg("");
//     setAccessError("");
//     try {
//       const { ok, data } = await nomineeRequestAccess();
//       if (ok) setAccessMsg(data.message || "Access request sent to vault owner.");
//       else setAccessError(data.error || "Request failed.");
//     } catch {
//       setAccessError("Network error. Please try again.");
//     } finally {
//       setRequesting(false);
//     }
//   };

//   const accessStatus = profile?.access_status || "none";
//   const statusColor =
//     accessStatus === "approved" ? "#4ade80" :
//     accessStatus === "pending"  ? "#facc15" :
//     accessStatus === "denied"   ? "#f87171" : "#94a3b8";

//   return (
//     <div className="nomineeDashboardPage">
//       <Navbar />

//       <div className="nomineeDashboardWrapper">
//         <h1>Nominee Dashboard</h1>

//         {loading ? (
//           <p style={{ color: "#aaa" }}>Loading...</p>
//         ) : (
//           <>
//             {profile && (
//               <div className="nomineeDashboardCard" style={{ marginBottom: "20px" }}>
//                 <h3>Welcome, {profile.name}</h3>
//                 <p style={{ color: "#302e2e", fontSize: "14px" }}>
//                   Vault Owner: <strong style={{ color: "#161515" }}>{profile.user_name || "—"}</strong>
//                 </p>
//                 <p style={{ marginTop: "8px" }}>
//                   Access Status:{" "}
//                   <strong style={{ color: statusColor, textTransform: "capitalize" }}>
//                     {accessStatus}
//                   </strong>
//                 </p>
//               </div>
//             )}

//             <div className="nomineeDashboardCard">
//               <h3>Request Vault Access</h3>
//               <p>
//                 Send a request to access the vault when the owner becomes inactive
//                 or when access conditions are satisfied.
//               </p>

//               {accessMsg && <p style={{ color: "#4ade80", margin: "8px 0" }}>{accessMsg}</p>}
//               {accessError && <p style={{ color: "#f87171", margin: "8px 0" }}>{accessError}</p>}

//               {accessStatus === "approved" ? (
//                 <p style={{ color: "#4ade80", fontWeight: "600" }}>
//                   ✅ Access already granted by vault owner.
//                 </p>
//               ) : (
//                 <button
//                   className="nomineeActionBtn"
//                   onClick={handleRequestAccess}
//                   disabled={requesting || accessStatus === "pending"}
//                 >
//                   {requesting ? "Sending..." :
//                    accessStatus === "pending" ? "Request Pending..." :
//                    "Request Vault Access"}
//                 </button>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default NomineeDashboard;