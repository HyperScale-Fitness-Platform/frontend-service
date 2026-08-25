import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./CustomerHomePage.module.css";

import {
  getCurrentMembership,
} from "../Membership/membershipApi";

import {
  getCurrentOccupancy,
} from "../Occupancy/occupancyApi";

import {
  getUserStatus,
  activateUser,
  getCustomerProfile,
} from "./customerHomeApi";

import ProgressSnapshot from "./components/ProgressSnapshot/ProgressSnapshot";

export default function CustomerHomePage() {
  const navigate = useNavigate();

  const [membership, setMembership] = useState(null);
  const [occupancy, setOccupancy] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);

  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [popupError, setPopupError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        membershipData,
        occupancyData,
        statusData,
        profileData,
      ] = await Promise.all([
        getCurrentMembership().catch(() => null),

        getCurrentOccupancy().catch(() => ({
          currentOccupancy: 0,
        })),

        userId
          ? getUserStatus(userId).catch(() => ({
              is_active: true,
            }))
          : Promise.resolve({
              is_active: true,
            }),

        userId
          ? getCustomerProfile(userId).catch(() => null)
          : Promise.resolve(null),
      ]);

      setMembership(membershipData);

      setOccupancy(
        occupancyData?.currentOccupancy ??
          occupancyData?.occupancy ??
          0
      );

      setCustomerName(
        profileData?.full_name ||
          profileData?.name ||
          ""
      );

      if (statusData?.is_active === false) {
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
      setPopupError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await activateUser(
        userId,
        passwords.old,
        passwords.new
      );

      setShowPopup(false);
    } catch (err) {
      setPopupError(
        err.response?.data?.message ||
          "Failed to update password. Check your old password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingMark}>H</div>
        <span>Preparing your dashboard...</span>
      </div>
    );
  }

  const firstName = customerName
    ? customerName.trim().split(" ")[0]
    : "there";

  const membershipActive =
    membership &&
    String(membership.status).toLowerCase() ===
      "active";

  return (
    <div className={styles.page}>
      {/* PASSWORD POPUP */}
      {showPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalBadge}>
              ACCOUNT SECURITY
            </div>

            <h2>Update your password</h2>

            <p>
              Your account needs to be activated before
              you can continue using the platform.
            </p>

            {popupError && (
              <div className={styles.errorText}>
                {popupError}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className={styles.inputGroup}>
                <label>Current password</label>

                <input
                  type="password"
                  required
                  value={passwords.old}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      old: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.inputGroup}>
                <label>New password</label>

                <input
                  type="password"
                  required
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      new: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm password</label>

                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirm: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                className={styles.button}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Updating..."
                  : "Activate account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span />
            HYPERSCALE FITNESS PLATFORM
          </div>

          <h1>
            Welcome back,
            <br />
            <strong>{firstName}</strong>
          </h1>

          <p>
            Your fitness journey, membership and
            progress — all in one place.
          </p>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroRing}>
            <span>H</span>
          </div>

          <div className={styles.heroLine} />
        </div>
      </section>

      {/* OVERVIEW */}
      <section className={styles.overview}>
        {/* MEMBERSHIP */}
        <article className={styles.membershipCard}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>
              MEMBERSHIP
            </span>

            <span
              className={
                membershipActive
                  ? styles.statusActive
                  : styles.statusInactive
              }
            >
              <span />
              {membershipActive
                ? "ACTIVE"
                : "INACTIVE"}
            </span>
          </div>

          {membership ? (
            <>
              <h2>
                {membership.plan?.name ||
                  membership.planName ||
                  "Current Plan"}
              </h2>

              <div className={styles.membershipDetails}>
                <div>
                  <span>STATUS</span>
                  <strong>
                    {membership.status}
                  </strong>
                </div>

                <div>
                  <span>ENDS</span>
                  <strong>
                    {membership.endDate
                      ? new Date(
                          membership.endDate
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </strong>
                </div>
              </div>

              <button
                className={styles.darkButton}
                onClick={() =>
                  navigate("/manage-membership")
                }
              >
                Manage membership
                <span>→</span>
              </button>
            </>
          ) : (
            <>
              <h2>No active membership</h2>

              <p className={styles.cardDescription}>
                Choose a membership plan and unlock
                the full gym experience.
              </p>

              <button
                className={styles.darkButton}
                onClick={() =>
                  navigate("/membership")
                }
              >
                Browse plans
                <span>→</span>
              </button>
            </>
          )}
        </article>

        {/* OCCUPANCY */}
        <article className={styles.occupancyCard}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>
              GYM OCCUPANCY
            </span>

            <span className={styles.liveBadge}>
              <span />
              LIVE
            </span>
          </div>

          <div className={styles.occupancyNumber}>
            {occupancy}
          </div>

          <p>members currently inside</p>

          <button
            className={styles.lightButton}
            onClick={() =>
              navigate("/occupancy")
            }
          >
            View live occupancy
            <span>→</span>
          </button>
        </article>
      </section>

      {/* PROGRESS */}
      <ProgressSnapshot />

      {/* QUICK ACTIONS */}
      <section className={styles.quickSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span>EXPLORE</span>
            <h2>Quick actions</h2>
          </div>

          <p>
            Everything you need to keep your training
            moving forward.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionCard}
            onClick={() =>
              navigate("/booking")
            }
          >
            <div className={styles.actionIcon}>
              01
            </div>

            <div>
              <strong>Book a class</strong>
              <span>
                Reserve your next gym session
              </span>
            </div>

            <b>↗</b>
          </button>

          <button
            className={styles.actionCard}
            onClick={() =>
              navigate("/membership")
            }
          >
            <div className={styles.actionIcon}>
              02
            </div>

            <div>
              <strong>Membership plans</strong>
              <span>
                Explore plans and benefits
              </span>
            </div>

            <b>↗</b>
          </button>

          <button
            className={styles.actionCard}
            onClick={() =>
              navigate("/pt-packages")
            }
          >
            <div className={styles.actionIcon}>
              03
            </div>

            <div>
              <strong>Personal training</strong>
              <span>
                Find the right PT package
              </span>
            </div>

            <b>↗</b>
          </button>

          <button
            className={styles.actionCard}
            onClick={() =>
              navigate("/ai-plans")
            }
          >
            <div className={styles.actionIcon}>
              AI
            </div>

            <div>
              <strong>AI fitness plans</strong>
              <span>
                Build a smarter training routine
              </span>
            </div>

            <b>↗</b>
          </button>
        </div>
      </section>
    </div>
  );
}