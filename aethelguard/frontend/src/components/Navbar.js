import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = !!localStorage.getItem("access_token");
  const loginRole  = localStorage.getItem("loginRole");
  const profilePath = loginRole === "nominee" ? "/nominee-profile" : "/profile";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".navProfileWrapper")) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    ["access_token","refresh_token","loginRole","userProfile","nomineeProfile",
     "pending_nominee_id","pending_email"].forEach(k => localStorage.removeItem(k));
    setShowMenu(false);
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "navScrolled" : ""}`}>

      {/* Logo */}
      <Link to={isLoggedIn ? (loginRole === "admin" ? "/admin-dashboard" : loginRole === "nominee" ? "/nominee-dashboard" : "/dashboard") : "/"} className="navLogo">
        <img src={logo} alt="AetherGuard" className="navLogoImg" />
        <span className="navBrand">AetherGuard</span>
      </Link>

      {/* Right side */}
      <div className="navRight">
        {!isLoggedIn ? (
          <Link to="/login" className="navLoginBtn">Login / Register</Link>
        ) : (
          <div className="navProfileWrapper">
            <button className="navAvatarBtn" onClick={() => setShowMenu(!showMenu)}>
              <span className="navAvatarIcon">
                {loginRole === "admin" ? "🛡" : loginRole === "nominee" ? "👥" : "👤"}
              </span>
              <span className="navChevron">{showMenu ? "▲" : "▼"}</span>
            </button>

            {showMenu && (
              <div className="navDropdown">
                <div className="navDropdownHeader">
                  <span className="navDropdownRole">{loginRole || "user"}</span>
                  <span className="navDropdownLabel">Logged in</span>
                </div>

                <div className="navDropdownDivider" />

                <Link to={profilePath} className="navDropdownItem" onClick={() => setShowMenu(false)}>
                  <span>👤</span> Profile
                </Link>

                {loginRole === "user" && <>
                  <Link to="/dashboard" className="navDropdownItem" onClick={() => setShowMenu(false)}>
                    <span>🗄</span> Dashboard
                  </Link>
                  <Link to="/nominee" className="navDropdownItem" onClick={() => setShowMenu(false)}>
                    <span>👥</span> Nominee
                  </Link>
                  <Link to="/settings" className="navDropdownItem" onClick={() => setShowMenu(false)}>
                    <span>⚙</span> Settings
                  </Link>
                </>}

                {loginRole === "nominee" && (
                  <Link to="/nominee-dashboard" className="navDropdownItem" onClick={() => setShowMenu(false)}>
                    <span>🏠</span> Dashboard
                  </Link>
                )}

                {loginRole === "admin" && (
                  <Link to="/admin-dashboard" className="navDropdownItem" onClick={() => setShowMenu(false)}>
                    <span>🛡</span> Admin Panel
                  </Link>
                )}

                <div className="navDropdownDivider" />
                <button className="navDropdownItem navLogoutItem" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;





// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import logo from "../assets/logo.png";
// import "./Navbar.css";

// function Navbar() {
//   const navigate = useNavigate();
//   const [showMenu, setShowMenu] = useState(false);

//   const loginRole = localStorage.getItem("loginRole");
//   const isLoggedIn = !!localStorage.getItem("access_token");

//   const profilePath = loginRole === "nominee" ? "/nominee-profile" : "/profile";

//   const handleLogout = () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("loginRole");
//     localStorage.removeItem("userProfile");
//     localStorage.removeItem("nomineeProfile");
//     setShowMenu(false);
//     navigate("/");
//   };

//   return (
//     <nav className="navbar">

//       {/* LOGO */}
//       <div className="logo-section">
//         <img src={logo} alt="AetherGuard Logo" className="logo-img" />
//         <span className="brand-name">AetherGuard</span>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="auth-section">
//         {!isLoggedIn ? (
//           <Link to="/login" className="login-btn">Login / Register</Link>
//         ) : (
//           <div className="navProfileWrapper">
//             <button
//               className="navProfileIconBtn"
//               onClick={() => setShowMenu(!showMenu)}
//             >
//               👤
//             </button>

//             {showMenu && (
//               <div className="navProfileDropdown">
//                 <Link to={profilePath} className="navDropdownItem" onClick={() => setShowMenu(false)}>
//                   Profile
//                 </Link>

//                 {loginRole === "user" && (
//                   <>
//                     <Link to="/dashboard" className="navDropdownItem" onClick={() => setShowMenu(false)}>
//                       Dashboard
//                     </Link>
//                     <Link to="/nominee" className="navDropdownItem" onClick={() => setShowMenu(false)}>
//                       Nominee
//                     </Link>
//                     <Link to="/settings" className="navDropdownItem" onClick={() => setShowMenu(false)}>
//                       Settings
//                     </Link>
//                   </>
//                 )}

//                 {loginRole === "nominee" && (
//                   <Link to="/nominee-dashboard" className="navDropdownItem" onClick={() => setShowMenu(false)}>
//                     Dashboard
//                   </Link>
//                 )}

//                 {loginRole === "admin" && (
//                   <Link to="/admin-dashboard" className="navDropdownItem" onClick={() => setShowMenu(false)}>
//                     Admin Panel
//                   </Link>
//                 )}

//                 <button className="navDropdownItem navLogoutBtn" onClick={handleLogout}>
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//     </nav>
//   );
// }

// export default Navbar;