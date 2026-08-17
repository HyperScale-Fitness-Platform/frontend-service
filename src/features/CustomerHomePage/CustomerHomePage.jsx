import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./CustomerHomePage.module.css";
import { getCurrentMembership } from "../Membership/membershipApi";
import { getCurrentOccupancy } from "../Occupancy/occupancyApi";
import { getUserStatus, activateUser, getCustomerProfile } from "./customerHomeApi";

export default function CustomerHomePage() {
  const navigate = useNavigate();

  const [membership, setMembership] = useState(null);
  const [occupancy, setOccupancy] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [popupError, setPopupError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Run independent requests in parallel to cut down network time
      const [membershipData, occupancyData, statusData, profileData] = await Promise.all([
        getCurrentMembership().catch(() => null),
        getCurrentOccupancy().catch(() => ({ currentOccupancy: 0 })),
        userId
          ? getUserStatus(userId).catch(() => ({ is_active: true })) // default true so we don't trap users on error
          : Promise.resolve({ is_active: true }),
        userId
          ? getCustomerProfile(userId).catch(() => null)
          : Promise.resolve(null)
      ]);

      setMembership(membershipData);
      setOccupancy(occupancyData.currentOccupancy);
      setCustomerName(profileData?.full_name || "");

      if (statusData && statusData.is_active === false) {
        setShowPopup(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPopupError("");

    if (passwords.new !== passwords.confirm) {
      setPopupError("New passwords do not match.");
      return;
    }

    if (passwords.new.length < 6) {
      setPopupError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await activateUser(userId, passwords.old, passwords.new);
      setShowPopup(false);
    } catch (err) {
      setPopupError(err.response?.data?.message || "Failed to update password. Check old password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.page}>
      {/* PASSWORD CHANGE POPUP */}
      {showPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Update Password</h2>
            <p>Your account is inactive. Please set a new password to continue.</p>
            
            {popupError && <div className={styles.errorText}>{popupError}</div>}

            <form onSubmit={handlePasswordChange}>
              <div className={styles.inputGroup}>
                <label>Old Password</label>
                <input
                  type="password"
                  required
                  value={passwords.old}
                  onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Rewrite Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className={styles.button} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>HyperScale Fitness Platform</p>
          <h1>Welcome Back {customerName && `${customerName.toUpperCase()} `}👋</h1>
          <p className={styles.subtitle}>Manage your membership and gym activities.</p>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Current Membership</h2>
          {membership ? (
            <>
              <h3>{membership.plan.name}</h3>
              <span className={styles.active}>{membership.status}</span>
              <p>
                Ends
                <br />
                {new Date(membership.endDate).toLocaleDateString()}
              </p>
              <button
                className={styles.button}
                onClick={() => navigate("/manage-membership")}
              >
                Manage Membership
              </button>
            </>
          ) : (
            <>
              <h3>No Active Membership</h3>
              <p>Subscribe to unlock all gym services.</p>
              <button
                className={styles.button}
                onClick={() => navigate("/membership")}
              >
                Browse Plans
              </button>
            </>
          )}
        </div>

        <div className={styles.card}>
          <h2>Gym Occupancy</h2>
          <div className={styles.live}>
            <span className={styles.dot}></span>
            LIVE
          </div>
          <div className={styles.count}>{occupancy}</div>
          <p>Members currently inside</p>
          <button
            className={styles.button}
            onClick={() => navigate("/occupancy")}
          >
            Go to Occupancy
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Quick Actions</h2>
        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate("/membership")}
          >
            Browse Membership Plans
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate("/booking")}
          >
            Booking
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate("/pt-packages")}
          >
            Personal Training
            <br />
            Packages
          </button>
        </div>
      </div>
    </div>
  );
}