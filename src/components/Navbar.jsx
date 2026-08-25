import { Link, NavLink, useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import styles from "./Navbar.module.css";
import { getCurrentUser } from "../utils/auth";
import { disconnectSocket } from "../features/Community/socket";

const CUSTOMER_MAIN_TABS = [
  { to: "/customerHomePage", label: "Home" },
  { to: "/booking", label: "Booking" },
  { to: "/membership", label: "Membership" },
  { to: "/community", label: "Community" },
  { to: "/catalog", label: "Shop" },
  { to: "/ai-plans", label: "AI Plans" },
];

const CUSTOMER_MENU_TABS = [
  { to: "/occupancy", label: "Occupancy" },
  { to: "/payments", label: "Payments" },
  { to: "/orders", label: "Orders" },
  { to: "/progress", label: "Progress" },
];

const TRAINER_MAIN_TABS = [
  { to: "/trainer/chats", label: "Chats" },
  { to: "/trainer/plans", label: "Plans" },
  { to: "/catalog", label: "Shop" },
];

const TRAINER_MENU_TABS = [
  { to: "/orders", label: "Orders" },
];

const ADMIN_TABS = [
  { to: "/admin", label: "Booking" },
  { to: "/admin/membership", label: "Membership Management" },
  { to: "/admin/trainer", label: "Trainer Management" },
  { to: "/admin/customer", label: "Customer Management" },
  { to: "/admin/occupancy", label: "Occupancy Management" },
  { to: "/admin/threads", label: "Threads Management" },
  { to: "/admin/catalog", label: "Products" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isTrainerRoute = location.pathname.startsWith("/trainer");

  const isLoggedIn = !!localStorage.getItem("customerToken");
  const userRole = getCurrentUser()?.role;

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerName");

    disconnectSocket();
    toast.dismiss();

    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    isActive
      ? `${styles.navLink} ${styles.navLinkActive}`
      : styles.navLink;

  return (
    <nav className={styles.navbar}>

      {/* LEFT — BRAND */}
      <Link
        to={
          isAdminRoute
            ? "/admin"
            : isTrainerRoute || userRole === "trainer"
              ? "/trainer/chats"
              : "/customerHomePage"
        }
        className={styles.brand}
      >

        <span className={styles.logoMark}>H</span>

        <span className={styles.logoText}>
          HYPERSCALE
          <span>FITNESS</span>
        </span>
      </Link>

      {/* CENTER — NAVIGATION */}
      <div className={styles.navCenter}>

        {isAdminRoute ? (
          <div className={styles.adminTabs}>
            {ADMIN_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/admin"}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.adminTab} ${styles.adminTabActive}`
                    : styles.adminTab
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        ) : isTrainerRoute || userRole === "trainer" ? (
          <div className={styles.customerNav}>

            {TRAINER_MAIN_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={navClass}
              >
                {tab.label}
              </NavLink>
            ))}

            <div className={styles.menuWrapper}>
              <button className={styles.menuButton}>
                <span>Menu</span>
                <span className={styles.menuChevron}>⌄</span>
              </button>

              <div className={styles.menuDropdown}>
                {TRAINER_MENU_TABS.map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    className={styles.menuItem}
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className={styles.customerNav}>

            {CUSTOMER_MAIN_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={navClass}
              >
                {tab.label}
              </NavLink>
            ))}

            {/* MENU */}
            <div className={styles.menuWrapper}>

              <button className={styles.menuButton}>
                <span>Menu</span>
                <span className={styles.menuChevron}>⌄</span>
              </button>

              <div className={styles.menuDropdown}>
                {CUSTOMER_MENU_TABS.map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    className={styles.menuItem}
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* RIGHT — CART + LOGOUT */}
      <div className={styles.navRight}>

        {isLoggedIn ? (
          <>
            {!isAdminRoute && (
              <button
                className={styles.cartButton}
                onClick={() => navigate("/cart")}
                aria-label="Shopping cart"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={styles.cartIcon}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
                  <circle cx="9" cy="20" r="1.2" />
                  <circle cx="18" cy="20" r="1.2" />
                </svg>
              </button>
            )}

            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={styles.loginLink}
          >
            Log in
          </Link>
        )}

      </div>

    </nav>
  );
}