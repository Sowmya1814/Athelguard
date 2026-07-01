import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Settings.css";
import Footer from "../components/Footer";

function Settings() {
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("fileViewMode") || "grid"
  );

  useEffect(() => {
    localStorage.setItem("fileViewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="settingsPage">
      <Navbar />

      <div className="settingsWrapper">
        <h1>Settings</h1>

        <div className="settingsCard">
          <h3>File Display Preferences</h3>
          <p>Choose how files should appear in your dashboard.</p>

          <div className="viewOptions">
            <button
              className={`viewBtn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <span className="viewIcon">⊞</span>
              Grid View
            </button>

            <button
              className={`viewBtn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <span className="viewIcon">☰</span>
              List View
            </button>

            <button
              className={`viewBtn ${viewMode === "compact" ? "active" : ""}`}
              onClick={() => setViewMode("compact")}
            >
              <span className="viewIcon">≡</span>
              Compact View
            </button>
          </div>
        </div>
      </div>

      {/* Footer OUTSIDE settingsWrapper so it stays at page bottom */}
      <Footer />
    </div>
  );
}

export default Settings;






// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import "./Settings.css";
// import Footer from "../components/Footer";

// // Settings page — file view preference is a pure local/UI preference,
// // no backend call needed. Kept identical to original.
// function Settings() {
//   const [viewMode, setViewMode] = useState(
//     localStorage.getItem("fileViewMode") || "grid"
//   );

//   useEffect(() => {
//     localStorage.setItem("fileViewMode", viewMode);
//   }, [viewMode]);

//   return (
//     <div className="settingsPage">
//       <Navbar />

//       <div className="settingsWrapper">
//         <h1>Settings</h1>

//         <div className="settingsCard">
//           <h3>File Display Preferences</h3>
//           <p>Choose how files should appear in your dashboard.</p>

//           <div className="viewOptions">
//             <button
//               className={`viewBtn ${viewMode === "grid" ? "active" : ""}`}
//               onClick={() => setViewMode("grid")}
//             >
//               <span className="viewIcon">⬛</span>
//               Grid View
//             </button>

//             <button
//               className={`viewBtn ${viewMode === "list" ? "active" : ""}`}
//               onClick={() => setViewMode("list")}
//             >
//               <span className="viewIcon">☰</span>
//               List View
//             </button>

//             <button
//               className={`viewBtn ${viewMode === "compact" ? "active" : ""}`}
//               onClick={() => setViewMode("compact")}
//             >
//               <span className="viewIcon">≣</span>
//               Compact View
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     </div>
//   );
// }

// export default Settings;