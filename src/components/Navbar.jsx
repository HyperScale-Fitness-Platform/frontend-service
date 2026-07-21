import { Link, useNavigate, useLocation } from 'react-router';
import styles from './Navbar.module.css';

const ADMIN_TABS = [
  { to: '/admin', label: 'Booking' },
  { to: '/admin/trainer', label: 'Trainer Management' },
];

function isTabActive(pathname, tabPath) {
  return pathname === tabPath;
}
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoggedIn = !!localStorage.getItem('customerToken');

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/customerHomePage" className={styles.brand}>
        <span className={styles.logoMark}>H</span>
        <span className={styles.logoText}>HYPERSCALE FITNESS PLATFORM</span>
      </Link>

      {!isAdminRoute && (
        <div className={styles.links}>
          <Link to="/customerHomePage" className={styles.link}>Home</Link>
          <Link to="/membership" className={styles.link}>Membership</Link>
          <Link to="/occupancy" className={styles.link}>Occupancy</Link>
        </div>
      )}

      {isAdminRoute && (
        <div className={styles.adminTabs}>
          {ADMIN_TABS.map((tab) => {
            const isActive = isTabActive(location.pathname, tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={
                  isActive
                    ? `${styles.adminTab} ${styles.adminTabActive}`
                    : styles.adminTab
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
      {isLoggedIn ? (
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Log Out
        </button>
      ) : (
        <Link to="/login" className={styles.loginLink}>Log In</Link>
      )}
    </nav>
  );
}