// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import LandingPage from "./pages/LandingPage";
// import Login from "./pages/Login";
// import RegisterUser from "./pages/RegisterUser";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import TotpSetup from "./pages/TotpSetup";
// import UserDashboard from "./pages/UserDashboard";
// import Profile from "./pages/Profile";
// import Nominee from "./pages/Nominee";
// import NomineeRegister from "./pages/NomineeRegister";
// import NomineeDashboard from "./pages/NomineeDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import Settings from "./pages/Settings";
// import NomineeTotp from "./pages/NomineeTotp";
// import NomineeProfile from "./pages/NomineeProfile";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<RegisterUser />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//         <Route path="/totp-setup" element={<TotpSetup />} />

//         <Route path="/dashboard" element={<UserDashboard />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/nominee" element={<Nominee />} />
//         <Route path="/nominee-register" element={<NomineeRegister />} />
//         <Route path="/nominee-dashboard" element={<NomineeDashboard />} />
//         <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
//         <Route path="/settings" element={<Settings />} />
//         <Route path="/nominee-totp" element={<NomineeTotp />} />
//         <Route path="/nominee-profile" element={<NomineeProfile />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TotpSetup from "./pages/TotpSetup";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import Nominee from "./pages/Nominee";
import NomineeRegister from "./pages/NomineeRegister";
import NomineeDashboard from "./pages/NomineeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import NomineeTotp from "./pages/NomineeTotp";
import NomineeProfile from "./pages/NomineeProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/totp-setup" element={<TotpSetup />} />

        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/nominee" element={<Nominee />} />

        {/* /nominee-register keeps old route working */}
        <Route path="/nominee-register" element={<NomineeRegister />} />
        {/* /register/nominee is what the backend sends in the email link */}
        <Route path="/register/nominee" element={<NomineeRegister />} />

        <Route path="/nominee-dashboard" element={<NomineeDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/nominee-totp" element={<NomineeTotp />} />
        <Route path="/nominee-profile" element={<NomineeProfile />} />
      </Routes>
    </Router>
  );
}

export default App;