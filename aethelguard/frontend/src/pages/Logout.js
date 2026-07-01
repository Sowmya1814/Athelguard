// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Logout.css";

// function Logout() {

//   const navigate = useNavigate();

//   useEffect(() => {

//     // clear session data
//     localStorage.removeItem("user");
    
//     // redirect after 1.5 seconds
//     setTimeout(() => {
//       navigate("/");
//     }, 1500);

//   }, [navigate]);

//   return (
//     <div className="logoutPage">
//       <div className="logoutCard">
//         <h2>Logging Out...</h2>
//         <p>You are being redirected to login page.</p>
//       </div>
//     </div>
//   );
// }

// export default Logout;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all auth + session data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("loginRole");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("nomineeProfile");
    localStorage.removeItem("pending_nominee_id");
    localStorage.removeItem("pending_email");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  }, [navigate]);

  return (
    <div className="logoutPage">
      <div className="logoutCard">
        <h2>Logging Out...</h2>
        <p>You are being redirected to the login page.</p>
      </div>
    </div>
  );
}

export default Logout;