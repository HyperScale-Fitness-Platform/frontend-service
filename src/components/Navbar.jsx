import { Link, NavLink, useNavigate, useLocation } from 'react-router';
import styles from './Navbar.module.css';

// Extracting route configs outside the component prevents array recreation on every render.
const CUSTOMER_TABS = [
  { to: '/customerHomePage', label: 'Home' },
  { to: '/booking', label: 'Booking' },
  { to: '/membership', label: 'Membership' },
  { to: '/occupancy', label: 'Occupancy' },
];

const ADMIN_TABS = [
  { to: '/admin', label: 'Booking' },
  { to: '/admin/trainer', label: 'Trainer Management' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Note: Reading from localStorage during render isn't reactive. 
  // If the token changes in another tab, the Navbar won't update until a hard refresh.
  // Consider moving this to a React Context or an event listener for production.
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

      {isAdminRoute ? (
        <div className={styles.adminTabs}>
          {ADMIN_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              // 'end' prevents '/admin' from being incorrectly marked active when at '/admin/trainer'
              end={tab.to === '/admin'} 
              className={({ isActive }) =>
                isActive ? `${styles.adminTab} ${styles.adminTabActive}` : styles.adminTab
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      ) : (
        <div className={styles.links}>
          {CUSTOMER_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                // Assuming you have or will add a .linkActive class in your CSS
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link 
              }
            >
              {tab.label}
            </NavLink>
          ))}
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