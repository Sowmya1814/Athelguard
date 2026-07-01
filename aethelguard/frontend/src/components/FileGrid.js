import React, { useState } from "react";
import "./FileGrid.css";

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ item, onClose }) {
  if (!item) return null;

  const isImage = item.mime_type && item.mime_type.startsWith("image/");
  const isPdf   = item.mime_type === "application/pdf";

  return (
    <div className="viewModalOverlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="viewModal">

        {/* Header */}
        <div className="viewModalHeader">
          <span className="viewModalIcon">{item.item_type === "text" ? "📝" : "📄"}</span>
          <div className="viewModalTitle">
            <h3>{item.title}</h3>
            <span className="viewModalMeta">
              {item.item_type === "text" ? "Encrypted Note" : item.original_filename}
              {item.file_size
                ? ` · ${item.file_size > 1024 * 1024
                    ? (item.file_size / 1024 / 1024).toFixed(1) + " MB"
                    : (item.file_size / 1024).toFixed(1) + " KB"}`
                : ""}
              {" · "}
              {new Date(item.created_at).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric"
              })}
            </span>
          </div>
          <button className="viewModalClose" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="viewModalBody">
          {item.item_type === "text" && (
            <div className="viewModalText">{item.content || "No content available."}</div>
          )}

          {item.item_type === "file" && item.file_data && isImage && (
            <img
              src={`data:${item.mime_type};base64,${item.file_data}`}
              alt={item.title}
              className="viewModalImage"
            />
          )}

          {item.item_type === "file" && item.file_data && isPdf && (
            <iframe
              src={`data:application/pdf;base64,${item.file_data}`}
              title={item.title}
              className="viewModalPdf"
            />
          )}

          {item.item_type === "file" && item.file_data && !isImage && !isPdf && (
            <div className="viewModalFileActions">
              <p className="viewModalFileMsg">
                📎 <strong>{item.original_filename}</strong> is ready to download.
              </p>
              <a
                href={`data:${item.mime_type || "application/octet-stream"};base64,${item.file_data}`}
                download={item.original_filename}
                className="viewModalDownloadBtn"
              >
                ⬇ Download File
              </a>
            </div>
          )}

          {item.item_type === "file" && !item.file_data && (
            <p className="viewModalFileMsg" style={{ color: "#9ca3af" }}>
              Loading file data...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FileGrid ──────────────────────────────────────────────────────────────────
function FileGrid({ files, viewMode, onDelete, onView }) {
  const [activeModal, setActiveModal] = useState(null);

  if (!files || files.length === 0) {
    return (
      <div className="emptyState">
        <div className="emptyIcon">🔐</div>
        <p style={{ fontWeight: 600, marginBottom: 6 }}>Your vault is empty</p>
        <p style={{ fontSize: 13 }}>Upload a file or add a note to get started</p>
      </div>
    );
  }

  const handleCardClick = async (file) => {
    if (!onView) return;
    const result = await onView(file.id);
    if (result) setActiveModal(result);
  };

  return (
    <>
      <div className={`fileGrid ${viewMode}`}>
        {files.map((file) => {
          const isNote = file.item_type === "text";
          const icon   = isNote ? "📝" : "📄";
          const size   = file.file_size
            ? file.file_size > 1024 * 1024
              ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB`
              : `${(file.file_size / 1024).toFixed(1)} KB`
            : null;

          return (
            <div
              className={`fileCard ${viewMode}`}
              key={file.id || file.title}
              onClick={() => handleCardClick(file)}
              title="Click to view"
            >
              <div className={`fileIconWrap ${isNote ? "typeNote" : "typeFile"}`}>{icon}</div>

              <div className="fileMeta">
                <div className="fileName">{file.title || file.name}</div>
                <div className="fileSub">
                  {size && <span>{size} · </span>}
                  <span>
                    {new Date(file.created_at || Date.now()).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {viewMode !== "grid" && (
                <span className={`fileTypeBadge ${isNote ? "text" : "file"}`}>
                  {isNote ? "Note" : "File"}
                </span>
              )}

              {onDelete && file.id && (
                <button
                  className="fileDeleteBtn"
                  onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* View modal */}
      {activeModal && (
        <ViewModal item={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}

export default FileGrid;




// import React from "react";
// import "./FileGrid.css";

// function FileGrid({ files, viewMode, onDelete }) {
//   if (!files || files.length === 0) {
//     return (
//       <div className="emptyState">
//         <div className="emptyIcon">📂</div>
//         <p>No files uploaded yet. Use the buttons above to add files or notes.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`fileGrid ${viewMode}`}>
//       {files.map((file) => (
//         <div className={`fileCard ${viewMode}`} key={file.id || file.name}>
//           <div className="fileIcon">
//             {file.item_type === "text" ? "📝" : "📄"}
//           </div>
//           <div className="fileName">{file.title || file.name}</div>
//           {file.item_type && (
//             <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
//               {file.item_type === "text" ? "Note" : file.original_filename || "File"}
//               {file.file_size ? ` · ${(file.file_size / 1024).toFixed(1)} KB` : ""}
//             </div>
//           )}
//           {onDelete && file.id && (
//             <button
//               onClick={() => onDelete(file.id)}
//               style={{
//                 marginTop: "8px",
//                 background: "transparent",
//                 border: "1px solid #7f1d1d",
//                 color: "#f87171",
//                 borderRadius: "4px",
//                 padding: "2px 8px",
//                 fontSize: "11px",
//                 cursor: "pointer",
//               }}
//             >
//               Delete
//             </button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default FileGrid;