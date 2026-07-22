import { Link, useNavigate, useLocation } from 'react-router';
import styles from './Navbar.module.css';

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

      <Link 
        to="/customerHomePage" 
        className={styles.brand}
      >
        <span className={styles.logoMark}>
          H
        </span>

        <span className={styles.logoText}>
          HYPERSCALE FITNESS PLATFORM
        </span>
      </Link>


      {!isAdminRoute && (

        <div className={styles.links}>

          <Link 
            to="/customerHomePage" 
            className={styles.link}
          >
            Home
          </Link>


          <Link 
            to="/booking" 
            className={styles.link}
          >
            Booking
          </Link>


          <Link 
            to="/membership" 
            className={styles.link}
          >
            Membership
          </Link>


          <Link 
            to="/occupancy" 
            className={styles.link}
          >
            Occupancy
          </Link>


          <Link 
            to="/admin/booking" 
            className={styles.link}
          >
            Admin
          </Link>

        </div>

      )}


      {isLoggedIn ? (

        <button 
          onClick={handleLogout} 
          className={styles.logoutBtn}
        >
          Log Out
        </button>

      ) : (

        <Link 
          to="/login" 
          className={styles.loginLink}
        >
          Log In
        </Link>

      )}

    </nav>
  );
}