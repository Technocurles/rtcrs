import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo2.png";

function Navbar() {
  const location = useLocation();

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        
        {/* Logo */}
        <div style={styles.logoSection}>
          <img src={logo} alt="RTCRS Logo" style={styles.logo}/>
          <span style={styles.brand}></span>
        </div>

        {/* Links */}
        <div style={styles.links}>
          <Link to="/" style={{
            ...styles.link,
            ...(location.pathname === '/' && { borderBottom: '3px solid #2563EB', paddingBottom: '4px' })
          }}>Home</Link>
          <Link to="/crimemap" style={{
            ...styles.link,
            ...(location.pathname === '/crimemap' && { borderBottom: '3px solid #2563EB', paddingBottom: '4px' })
          }}>Crime Map</Link>
          <Link to="/awareness" style={{
            ...styles.link,
            ...(location.pathname === '/awareness' && { borderBottom: '3px solid #2563EB', paddingBottom: '4px' })
          }}>Awareness</Link>
          <Link to="/about" style={{
            ...styles.link,
            ...(location.pathname === '/about' && { borderBottom: '3px solid #2563EB', paddingBottom: '4px' })
          }}>About</Link>
        </div>

        {/* Login */}
        <div>
          <Link to="/login" style={styles.loginBtn}>
            Login
          </Link>
        </div>

      </nav>
    </div>
  );
}

const styles = {

  wrapper: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    padding: "10px 0"
  },

  navbar: {
    width: "95%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    padding: "12px 25px",
    borderRadius: "40px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  logo: {
    height: "40px"
  },

  brand: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1E3A8A"
  },

  links: {
    display: "flex",
    gap: "30px"
  },

  link: {
    textDecoration: "none",
    color: "#1f2937",
    fontWeight: "500",
    transition: "0.2s"
  },

  loginBtn: {
    background: "#2563EB",
    color: "white",
    padding: "8px 20px",
    borderRadius: "20px",
    textDecoration: "none",
    fontWeight: "500"
  }
};

export default Navbar;

