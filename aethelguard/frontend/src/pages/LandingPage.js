// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "./LandingPage.css";
// import securityImage from "../assets/security-family.png";
// import logo from "../assets/logo.png";

// function LandingPage() {
//   const [contactSuccess, setContactSuccess] = useState(false);
//   const [feedbackSuccess, setFeedbackSuccess] = useState(false);

//   const handleContactSubmit = (e) => {
//     e.preventDefault();
//     setContactSuccess(true);

//     setTimeout(() => {
//       setContactSuccess(false);
//     }, 4000);
//   };

//   const handleFeedbackSubmit = () => {
//     setFeedbackSuccess(true);

//     setTimeout(() => {
//       setFeedbackSuccess(false);
//     }, 4000);
//   };

//   return (
//     <div>

//       <nav className="landing-navbar">
//       <div className="landing-logo-section">
//           <img src={logo} alt="AthelGuard Logo" className="landing-logo-img" />
//           <div className="landing-logo">AethelGuard</div>
//         </div>

//   <ul className="landing-nav-links">
//     <li><a href="#home">Home</a></li>
//     <li><a href="#about">About</a></li>
//     <li><a href="#contact">Contact</a></li>
//     <li><a href="#feedback">Feedback</a></li>
//     <li>
//       <Link to="/login" className="landing-login-btn">
//         Login / Register
//       </Link>
//     </li>

    
//   </ul>
// </nav>
//       {/* <nav className="navbar">
//         <div className="logo">AethelGuard</div>

//         <ul className="nav-links">
//           <li><a href="#home">Home</a></li>
//           <li><a href="#about">About</a></li>
//           <li><a href="#contact">Contact</a></li>
//           <li><a href="#feedback">Feedback</a></li>
//           <li>
//             <Link to="/login" className="login-btn">
//               Login / Register
//             </Link>
//           </li>
//         </ul>
//       </nav> */}

//       <section id="home" className="hero">
//         <div className="hero-left">
//           <h1>Protect Your Digital Legacy</h1>

//           <p>
//             Secure your digital assets with OTP authentication
//             and trusted nominee access using AethelGuard.
//           </p>

//           <div className="hero-buttons">
//             <Link to="/register" className="btn-primary">
//               Get Started
//             </Link>

//             <a href="#about" className="btn-secondary">
//               Learn More
//             </a>
//           </div>
//         </div>

//         <div className="hero-right">
//           <img src={securityImage} alt="digital security" />
//         </div>
//       </section>

//       <section id="about" className="about-section">
//         <h2>About AethelGuard</h2>

//         <p>
//           AethelGuard is a secure digital legacy platform designed
//           to protect sensitive digital assets and allow trusted
//           nominees to access them during emergencies using
//           secure authentication methods.
//         </p>
//       </section>

//       <section className="features">
//         <h2>Platform Features</h2>

//         <div className="feature-box">
//           <div>
//             <h3>🔐 OTP Security</h3>
//             <p>Strong authentication using OTP verification</p>
//           </div>

//           <div>
//             <h3>📲 QR Authentication</h3>
//             <p>Secure login with authenticator apps</p>
//           </div>

//           <div>
//             <h3>👨‍👩‍👧 Nominee Access</h3>
//             <p>Trusted emergency access for family</p>
//           </div>
//         </div>
//       </section>

//       <section className="how-section">
//         <h2>How It Works</h2>

//         <div className="steps">
//           <div className="step-card">
//             <h3>1️⃣ Register</h3>
//             <p>Create your secure account</p>
//           </div>

//           <div className="step-card">
//             <h3>2️⃣ Setup QR</h3>
//             <p>Scan QR using Google Authenticator</p>
//           </div>

//           <div className="step-card">
//             <h3>3️⃣ Add Nominee</h3>
//             <p>Assign trusted emergency access</p>
//           </div>

//           <div className="step-card">
//             <h3>4️⃣ Secure Data</h3>
//             <p>Your digital assets remain protected</p>
//           </div>
//         </div>
//       </section>

      

//       <section id="contact" className="contact-section">
//         <h2>Contact Us</h2>

//         <form className="contact-form" onSubmit={handleContactSubmit}>
//           <input type="text" placeholder="Your Name" required />
//           <input type="email" placeholder="Your Email" required />
//           <textarea placeholder="Your Message" required></textarea>

//           <button type="submit" className="send-btn">
//             Send Message
//           </button>
//         </form>

//         {contactSuccess && (
//           <p className="success-msg">
//             ✅ Message sent successfully! We will contact you soon.
//           </p>
//         )}
//       </section>

//       <section id="feedback" className="feedback-section">
//         <h2>Feedback</h2>

//         <textarea
//           className="feedback-box"
//           placeholder="Write your feedback here..."
//         ></textarea>

//         <button
//           type="button"
//           className="send-btn"
//           onClick={handleFeedbackSubmit}
//         >
//           Submit Feedback
//         </button>

//         {feedbackSuccess && (
//           <p className="success-msg">
//             🎉 Thank you for your feedback!
//           </p>
//         )}
//       </section>

//       <footer className="footer">
//         <h3>AethelGuard</h3>
//         <p>Secure Digital Legacy Platform</p>
//         <p>© 2026 AethelGuard | All Rights Reserved</p>
//       </footer>
//     </div>
//   );
// }

// export default LandingPage;




import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import securityImage from "../assets/security-family.png";
import logo from "../assets/logo.png";

function LandingPage() {
  const [contactSuccess, setContactSuccess] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => setContactSuccess(false), 4000);
  };

  const handleFeedbackSubmit = () => {
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  return (
    <div>

      {/* ── Navbar ── */}
      <nav className="landing-navbar">
        <div className="landing-logo-section">
          <img src={logo} alt="AetherGuard Logo" className="landing-logo-img" />
          <div className="landing-logo">AetherGuard</div>
        </div>
        <ul className="landing-nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="#feedback">Feedback</a></li>
          <li>
            <Link to="/login" className="landing-login-btn">Login / Register</Link>
          </li>
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="hero">
        <div className="hero-left">
          <h1>
            Protect Your <span>Digital Legacy</span>
          </h1>
          <p>
            Secure your most important files, notes, and digital assets with
            AES-256 encryption, TOTP two-factor authentication, and trusted
            nominee emergency access.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">🔐 Get Started Free</Link>
            <a href="#about" className="btn-secondary">Learn More →</a>
          </div>
        </div>
        <div className="hero-right">
          <img src={securityImage} alt="AetherGuard digital security" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        <h2>Platform Features</h2>
        <div className="feature-box">
          <div>
            <h3>🔐 AES-256 Encryption</h3>
            <p>Every file and note is encrypted with military-grade AES-256-GCM before storage. Only you can decrypt your data.</p>
          </div>
          <div>
            <h3>📲 TOTP Authentication</h3>
            <p>Login and account activation require a time-based one-time password via Google Authenticator. No SMS, no interception.</p>
          </div>
          <div>
            <h3>👨‍👩‍👧 Nominee Access</h3>
            <p>Assign a trusted person who can request emergency access to your vault when you become inactive.</p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step-card">
            <h3>1️⃣ Register</h3>
            <p>Create your account and set up your nominee during registration.</p>
          </div>
          <div className="step-card">
            <h3>2️⃣ Setup 2FA</h3>
            <p>Scan the QR code with Google Authenticator to enable TOTP security.</p>
          </div>
          <div className="step-card">
            <h3>3️⃣ Upload Securely</h3>
            <p>Add files and notes — everything is encrypted before saving to the vault.</p>
          </div>
          <div className="step-card">
            <h3>4️⃣ Stay Protected</h3>
            <p>Check in periodically. Your nominee gets access only if you become inactive.</p>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="about-section">
        <h2>About AetherGuard</h2>
        <p>
          AetherGuard is a secure digital legacy platform designed to protect
          sensitive digital assets and allow trusted nominees to access them
          during emergencies. Built with end-to-end encryption, zero-trust
          authentication, and an inactivity detection system.
        </p>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <input type="text"  placeholder="Your Name"    required />
          <input type="email" placeholder="Your Email"   required />
          <textarea           placeholder="Your Message" required />
          <button type="submit" className="send-btn">Send Message</button>
        </form>
        {contactSuccess && <p className="success-msg">✅ Message sent! We will contact you soon.</p>}
      </section>

      {/* ── Feedback ── */}
      <section id="feedback" className="feedback-section">
        <h2>Feedback</h2>
        <textarea className="feedback-box" placeholder="Write your feedback here..." />
        <button type="button" className="send-btn" onClick={handleFeedbackSubmit}>
          Submit Feedback
        </button>
        {feedbackSuccess && <p className="success-msg">🎉 Thank you for your feedback!</p>}
      </section>

      {/* ── Footer (inline for landing page) ── */}
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
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </div>
          <div className="footerLinks">
            <h4>Help</h4>
            <a href="#faq">FAQs</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footerLinks">
            <h4>Contact</h4>
            <a href="mailto:support@aetherguard.com">support@aetherguard.com</a>
            <a href="tel:+919876543210">+91 98765 43210</a>
            <p className="footerAddress">Chennai, Tamil Nadu, India</p>
          </div>
        </div>
        <div className="footerBottom">
          <span>© 2026 AetherGuard — All rights reserved.</span>
          <span className="footerBottomDot">·</span>
          <span>Built with 🔐 for digital security</span>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;