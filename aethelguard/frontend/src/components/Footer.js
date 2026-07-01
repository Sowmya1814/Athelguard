// import React from "react";
// import "./Footer.css";

// function Footer() {
//   return (
//     <footer className="footer">
//       <div className="footerContainer">

//         <div className="footerLeft">
//           <h3>AthelGuard</h3>
//           <p>Secure digital vault with nominee access protection.</p>
//         </div>

//         <div className="footerLinks">
//           <h4>About</h4>
//           <p>About AthelGuard</p>
//           <p>Our Mission</p>
//         </div>

//         <div className="footerLinks">
//           <h4>Help</h4>
//           <p>FAQs</p>
//           <p>User Guide</p>
//         </div>

//         <div className="footerLinks">
//           <h4>Contact Us</h4>
//           <p>Email: support@athelguard.com</p>
//           <p>Phone: +91 9876543210</p>
//         </div>

//       </div>

//       <div className="footerBottom">
//         © 2026 AthelGuard. All rights reserved.
//       </div>
//     </footer>
//   );
// }

// export default Footer;


import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footerGlow" />

      <div className="footerContainer">
        <div className="footerBrand">
          <div className="footerLogo">🛡 AetherGuard</div>
          <p className="footerTagline">
            Secure digital vault with encrypted storage and trusted nominee emergency access.
          </p>
          <div className="footerBadges">
            <span className="footerBadge">🔐 AES-256</span>
            <span className="footerBadge">📱 TOTP 2FA</span>
            <span className="footerBadge">🔒 End-to-End</span>
          </div>
        </div>

        <div className="footerLinks">
          <h4>Platform</h4>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
        </div>

        <div className="footerLinks">
          <h4>Help</h4>
          <a href="#faq">FAQs</a>
          <a href="#guide">User Guide</a>
          <a href="#security">Security</a>
          <a href="#privacy">Privacy Policy</a>
        </div>

        <div className="footerLinks">
          <h4>Contact</h4>
          <a href="mailto:support@aetherguard.com">support@aetherguard.com</a>
          <a href="tel:+919876543210">+91 98765 43210</a>
          <p className="footerAddress">Coimbatore, Tamil Nadu, India</p>
        </div>
      </div>

      <div className="footerBottom">
        <span>© 2026 AetherGuard — All rights reserved.</span>
        <span className="footerBottomDot">·</span>
        <span>Built with 🔐 for digital security</span>
      </div>
    </footer>
  );
}

export default Footer;