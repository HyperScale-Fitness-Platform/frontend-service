import { Link, NavLink, useNavigate, useLocation } from 'react-router';
import toast from 'react-hot-toast';
import styles from './Navbar.module.css';
import { getCurrentUser } from '../utils/auth';
import { disconnectSocket } from '../features/Community/socket';

// Extracting route configs outside the component prevents array recreation on every render.
const CUSTOMER_TABS = [
  { to: '/customerHomePage', label: 'Home' },
  { to: '/booking', label: 'Booking' },
  { to: '/membership', label: 'Membership' },
  { to: '/occupancy', label: 'Occupancy' },
  { to: '/payments', label: 'Payments' },
  { to: '/community', label: 'Community' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Orders' },
  { to: '/ai-plans', label: 'AI Plans' },
  { to: '/progress', label: 'Progress' }
];

const TRAINER_TABS = [
  { to: '/trainer/chats', label: 'Chats' },
  { to: '/trainer/plans', label: 'Plans' }
];

const ADMIN_TABS = [
  { to: '/admin', label: 'Booking' },
  { to: '/admin/membership', label: 'Membership Management' },
  { to: '/admin/trainer', label: 'Trainer Management' },
  { to: '/admin/customer', label: 'Customer Management' },
  { to: '/admin/occupancy', label: 'Occupancy Management' },
  { to: '/admin/threads', label: 'Threads Management' },
  { to: '/admin/catalog', label: 'Products' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTrainerRoute = location.pathname.startsWith('/trainer');

  // Note: Reading from localStorage during render isn't reactive. 
  // If the token changes in another tab, the Navbar won't update until a hard refresh.
  // Consider moving this to a React Context or an event listener for production.
  const isLoggedIn = !!localStorage.getItem('customerToken');
  const userRole = getCurrentUser()?.role;

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    // Drop the socket identity so the next login
    // never reuses the previous account's connection.
    disconnectSocket();
    toast.dismiss();
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
      ) : isTrainerRoute || userRole === 'trainer' ? (
        <div className={styles.adminTabs}>
          {TRAINER_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
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
