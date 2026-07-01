import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import FileGrid from "../components/FileGrid";
import "./UserDashboard.css";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import {
  listVaultItems,
  uploadFileToVault,
  uploadTextToVault,
  deleteVaultItem,
  getVaultStatus,
  getVaultItem,
} from "../api/api";

function UserDashboard() {
  const navigate = useNavigate();

  const [vaultStatus, setVaultStatus]   = useState("Active");
  const [nextCheckin, setNextCheckin]   = useState("—");
  const [files, setFiles]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [uploadError, setUploadError]   = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [showNomineePopup, setShowNomineePopup] = useState(false);
  const [viewMode, setViewMode]         = useState(localStorage.getItem("fileViewMode") || "grid");
  const [dragOver, setDragOver]         = useState(false);

  // Text note modal
  const [showTextModal, setShowTextModal] = useState(false);
  const [textTitle, setTextTitle]         = useState("");
  const [textContent, setTextContent]     = useState("");
  const [textLoading, setTextLoading]     = useState(false);
  const [textError, setTextError]         = useState("");

  // View item loading state
  const [viewLoading, setViewLoading] = useState(false);

  const fetchVaultItems = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await listVaultItems();
      if (ok) setFiles(data.vault_items || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const fetchVaultStatus = useCallback(async () => {
    try {
      const { ok, data } = await getVaultStatus();
      if (ok) { setVaultStatus(data.status); setNextCheckin(data.next_checkin); }
    } catch {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    fetchVaultItems();
    fetchVaultStatus();
    const shouldShow = localStorage.getItem("showNomineePopup");
    if (shouldShow === "true") {
      setShowNomineePopup(true);
      localStorage.removeItem("showNomineePopup");
    }
  }, [fetchVaultItems, fetchVaultStatus, navigate]);

  useEffect(() => {
    localStorage.setItem("fileViewMode", viewMode);
  }, [viewMode]);

  const showUploadFeedback = (msg, isError = false) => {
    if (isError) { setUploadError(msg); setTimeout(() => setUploadError(""), 4000); }
    else         { setUploadSuccess(msg); setTimeout(() => setUploadSuccess(""), 3000); }
  };

  const handleFileUpload = async (file) => {
    setUploadError("");
    try {
      const { ok, data } = await uploadFileToVault(file);
      if (!ok) { showUploadFeedback(data.error || "Upload failed", true); return; }
      setFiles((prev) => [data.item, ...prev]);
      showUploadFeedback(`"${file.name}" encrypted and saved ✅`);
    } catch { showUploadFeedback("Network error during upload", true); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(handleFileUpload);
  };

  const handleTextSubmit = async () => {
    if (!textTitle.trim() || !textContent.trim()) {
      setTextError("Both title and content are required");
      return;
    }
    setTextLoading(true);
    setTextError("");
    try {
      const { ok, data } = await uploadTextToVault(textTitle, textContent);
      if (!ok) { setTextError(data.error || "Upload failed"); return; }
      setFiles((prev) => [data.item, ...prev]);
      setShowTextModal(false);
      setTextTitle("");
      setTextContent("");
      showUploadFeedback("Note encrypted and saved ✅");
    } catch { setTextError("Network error"); }
    finally { setTextLoading(false); }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item permanently? This cannot be undone.")) return;
    try {
      const { ok } = await deleteVaultItem(itemId);
      if (ok) setFiles((prev) => prev.filter((f) => f.id !== itemId));
    } catch {}
  };

  // ── Decrypt + open a vault item ───────────────────────────
  const handleView = async (itemId) => {
    setViewLoading(true);
    try {
      const { ok, data } = await getVaultItem(itemId);
      if (ok) return data;
      alert(data.error || "Failed to load item. Please try again.");
    } catch {
      alert("Network error while loading item.");
    } finally {
      setViewLoading(false);
    }
    return null;
  };

  const vaultStatusColor = vaultStatus === "Active" ? "#4ade80" : "#f87171";

  return (
    <div className="layout">
      <div className="mainContent">
        <Navbar />

        {/* Nominee popup */}
        {showNomineePopup && (
          <div className="popupOverlay">
            <div className="popupCard">
              <h3>Complete Nominee Details</h3>
              <p>
                You haven't added nominee details yet. Please fill them
                to complete your vault setup.
              </p>
              <div className="popupButtons">
                <button
                  className="popupPrimaryBtn"
                  onClick={() => { setShowNomineePopup(false); navigate("/nominee"); }}
                >
                  Go to Nominee
                </button>
                <button
                  className="popupSecondaryBtn"
                  onClick={() => setShowNomineePopup(false)}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Text Note Modal */}
        {showTextModal && (
          <div
            className="popupOverlay"
            onClick={(e) => e.target === e.currentTarget && setShowTextModal(false)}
          >
            <div className="noteModal">
              <div className="noteModalHeader">
                <span className="noteModalIcon">📝</span>
                <h3>Add Secret Note</h3>
                <button className="noteModalClose" onClick={() => setShowTextModal(false)}>
                  ✕
                </button>
              </div>
              {textError && <p className="error" style={{ marginBottom: "12px" }}>{textError}</p>}
              <input
                type="text"
                placeholder="Note title..."
                className="noteModalInput"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
              />
              <textarea
                placeholder="Write your secret note here..."
                className="noteModalTextarea"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
              />
              <div className="noteModalFooter">
                <button className="noteModalCancel" onClick={() => setShowTextModal(false)}>
                  Cancel
                </button>
                <button
                  className="noteModalSave"
                  onClick={handleTextSubmit}
                  disabled={textLoading}
                >
                  {textLoading ? "Encrypting..." : "🔐 Encrypt & Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard">
          <h2>My Vault</h2>

          <div className="vaultTopBar">

            {/* Upload zone */}
            <div
              className={`dropZone ${dragOver ? "dragActive" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="dropZoneInner">
                <span className="dropZoneIcon">☁</span>
                <p className="dropZoneText">Drag & drop files here</p>
                <p className="dropZoneSubText">or choose an option below</p>
              </div>

              <div className="uploadActions">
                <label className="uploadActionBtn fileBtn">
                  <span>📁</span> Upload File
                  <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      Array.from(e.target.files).forEach(handleFileUpload);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button className="uploadActionBtn noteBtn" onClick={() => setShowTextModal(true)}>
                  <span>📝</span> Add Note
                </button>
              </div>

              {uploadError   && <p className="uploadFeedback error">{uploadError}</p>}
              {uploadSuccess && <p className="uploadFeedback success">{uploadSuccess}</p>}
            </div>

            {/* Vault status panel */}
            <div className="vaultStatusPanel">
              <div className="vaultStatusCard">
                <span className="vaultStatusLabel">Vault Status</span>
                <span className="vaultStatusValue" style={{ color: vaultStatusColor }}>
                  {vaultStatus === "Active" ? "🔓" : "🔒"} {vaultStatus}
                </span>
              </div>
              <div className="vaultStatusCard">
                <span className="vaultStatusLabel">Next Check-in</span>
                <span className="vaultStatusValue">{nextCheckin}</span>
              </div>
              <div className="vaultStatusCard">
                <span className="vaultStatusLabel">Total Items</span>
                <span className="vaultStatusValue">{files.length}</span>
              </div>

              <div className="viewSwitcher">
                <span className="viewLabel">View</span>
                <div className="viewTabs">
                  {["grid", "list", "compact"].map((mode) => (
                    <button
                      key={mode}
                      className={`viewTab ${viewMode === mode ? "active" : ""}`}
                      onClick={() => setViewMode(mode)}
                    >
                      {mode === "grid" ? "⊞" : mode === "list" ? "☰" : "≡"}
                      <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Files section */}
          <div className="filesSection">
            {loading ? (
              <div className="emptyState">
                <div className="loadingSpinner" />
                <p>Loading vault items...</p>
              </div>
            ) : (
              <FileGrid
                files={files}
                viewMode={viewMode}
                onDelete={handleDelete}
                onView={handleView}
              />
            )}
            {viewLoading && (
              <div style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 9999, backdropFilter: "blur(4px)"
              }}>
                <div style={{ textAlign: "center", color: "#e0f2fe" }}>
                  <div className="loadingSpinner" style={{ margin: "0 auto 14px" }} />
                  <p style={{ fontSize: "15px", fontWeight: 600 }}>Decrypting file...</p>
                  <p style={{ fontSize: "13px", color: "#64748b", marginTop: 6 }}>
                    This may take a few seconds for large files.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default UserDashboard;





// import React, { useEffect, useState, useCallback } from "react";
// import Navbar from "../components/Navbar";
// import FileGrid from "../components/FileGrid";
// import "./UserDashboard.css";
// import Footer from "../components/Footer";
// import { useNavigate } from "react-router-dom";
// import {
//   listVaultItems,
//   uploadFileToVault,
//   uploadTextToVault,
//   deleteVaultItem,
//   getVaultStatus,
// } from "../api/api";

// function UserDashboard() {
//   const navigate = useNavigate();

//   const [vaultStatus, setVaultStatus] = useState("Active");
//   const [nextCheckin, setNextCheckin] = useState("—");
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [showNomineePopup, setShowNomineePopup] = useState(false);
//   const [viewMode, setViewMode] = useState(
//     localStorage.getItem("fileViewMode") || "grid"
//   );

//   // Text upload modal state
//   const [showTextModal, setShowTextModal] = useState(false);
//   const [textTitle, setTextTitle] = useState("");
//   const [textContent, setTextContent] = useState("");
//   const [textLoading, setTextLoading] = useState(false);
//   const [textError, setTextError] = useState("");

//   // ── Fetch vault items from backend ───────────────────────────
//   const fetchVaultItems = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { ok, data } = await listVaultItems();
//       if (ok) {
//         setFiles(data.vault_items || []);
//       }
//     } catch {
//       // Silently fail — user may not be logged in yet
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const fetchVaultStatus = useCallback(async () => {
//     try {
//       const { ok, data } = await getVaultStatus();
//       if (ok) {
//         setVaultStatus(data.status);
//         setNextCheckin(data.next_checkin);
//       }
//     } catch {}
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }
//     fetchVaultItems();
//     fetchVaultStatus();

//     // Show nominee popup if flag is set
//     const shouldShow = localStorage.getItem("showNomineePopup");
//     if (shouldShow === "true") {
//       setShowNomineePopup(true);
//       localStorage.removeItem("showNomineePopup");
//     }
//   }, [fetchVaultItems, fetchVaultStatus, navigate]);

//   useEffect(() => {
//     localStorage.setItem("fileViewMode", viewMode);
//   }, [viewMode]);

//   // ── File upload handler ──────────────────────────────────────
//   const handleFileUpload = async (file) => {
//     setUploadError("");
//     try {
//       const { ok, data } = await uploadFileToVault(file);
//       if (!ok) {
//         setUploadError(data.error || "Upload failed");
//         return;
//       }
//       setFiles((prev) => [data.item, ...prev]);
//     } catch {
//       setUploadError("Network error during upload");
//     }
//   };

//   // ── Text upload handler ──────────────────────────────────────
//   const handleTextSubmit = async () => {
//     if (!textTitle.trim() || !textContent.trim()) {
//       setTextError("Title and content are required");
//       return;
//     }
//     setTextLoading(true);
//     setTextError("");
//     try {
//       const { ok, data } = await uploadTextToVault(textTitle, textContent);
//       if (!ok) {
//         setTextError(data.error || "Upload failed");
//         return;
//       }
//       setFiles((prev) => [data.item, ...prev]);
//       setShowTextModal(false);
//       setTextTitle("");
//       setTextContent("");
//     } catch {
//       setTextError("Network error");
//     } finally {
//       setTextLoading(false);
//     }
//   };

//   // ── Delete handler ───────────────────────────────────────────
//   const handleDelete = async (itemId) => {
//     if (!window.confirm("Delete this item permanently?")) return;
//     try {
//       const { ok } = await deleteVaultItem(itemId);
//       if (ok) setFiles((prev) => prev.filter((f) => f.id !== itemId));
//     } catch {}
//   };

//   return (
//     <div className="layout">
//       <div className="mainContent">
//         <Navbar />

//         {showNomineePopup && (
//           <div className="popupOverlay">
//             <div className="popupCard">
//               <h3>Complete Nominee Details</h3>
//               <p>
//                 You have not added nominee details yet. Please fill nominee
//                 details to continue your vault setup.
//               </p>
//               <div className="popupButtons">
//                 <button className="popupPrimaryBtn" onClick={() => { setShowNomineePopup(false); navigate("/nominee"); }}>
//                   Go to Nominee
//                 </button>
//                 <button className="popupSecondaryBtn" onClick={() => setShowNomineePopup(false)}>
//                   Later
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Text Upload Modal */}
//         {showTextModal && (
//           <div className="popupOverlay">
//             <div className="popupCard" style={{ minWidth: "360px" }}>
//               <h3>Upload Text / Note</h3>
//               {textError && <p className="error">{textError}</p>}
//               <input
//                 type="text"
//                 placeholder="Title"
//                 value={textTitle}
//                 onChange={(e) => setTextTitle(e.target.value)}
//                 style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #444", background: "#1e1e2e", color: "#fff" }}
//               />
//               <textarea
//                 placeholder="Your secret note..."
//                 value={textContent}
//                 onChange={(e) => setTextContent(e.target.value)}
//                 rows={5}
//                 style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px", border: "1px solid #444", background: "#1e1e2e", color: "#fff", resize: "vertical" }}
//               />
//               <div className="popupButtons">
//                 <button className="popupPrimaryBtn" onClick={handleTextSubmit} disabled={textLoading}>
//                   {textLoading ? "Saving..." : "Save Note"}
//                 </button>
//                 <button className="popupSecondaryBtn" onClick={() => setShowTextModal(false)}>
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="dashboard">
//           <h2>User Dashboard</h2>

//           <div className="topBarSection">
//             <div className="uploadLeft">
//               {/* Upload Controls */}
//               <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
//                 <label className="newButton" style={{ cursor: "pointer" }}>
//                   <span className="plusIcon">+</span>
//                   <span className="newText">Upload File</span>
//                   <input
//                     type="file"
//                     multiple
//                     style={{ display: "none" }}
//                     onChange={(e) => {
//                       Array.from(e.target.files).forEach(handleFileUpload);
//                       e.target.value = "";
//                     }}
//                   />
//                 </label>
//                 <button className="newButton" onClick={() => setShowTextModal(true)}>
//                   <span className="plusIcon">✏</span>
//                   <span className="newText">Add Note</span>
//                 </button>
//               </div>
//               {uploadError && <p className="error" style={{ marginTop: "8px" }}>{uploadError}</p>}
//             </div>

//             <div className="vaultInfoRight">
//               <span><b>Vault Status:</b> {vaultStatus}</span>
//               <span><b>Next Check-in:</b> {nextCheckin}</span>

//               <div className="viewSwitcher">
//                 <span className="viewLabel">View</span>
//                 <div className="viewTabs">
//                   {["grid", "list", "compact"].map((mode) => (
//                     <button
//                       key={mode}
//                       className={viewMode === mode ? "viewTab active" : "viewTab"}
//                       onClick={() => setViewMode(mode)}
//                       type="button"
//                     >
//                       {mode.charAt(0).toUpperCase() + mode.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="filesSection">
//             {loading ? (
//               <div className="emptyState"><p>Loading vault...</p></div>
//             ) : (
//               <FileGrid files={files} viewMode={viewMode} onDelete={handleDelete} />
//             )}
//           </div>
//         </div>

//         <Footer />
//       </div>
//     </div>
//   );
// }

// export default UserDashboard;