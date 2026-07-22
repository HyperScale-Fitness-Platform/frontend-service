import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./CustomerHomePage.module.css";
import { getCurrentMembership } from "../Membership/membershipApi";
import { getCurrentOccupancy } from "../Occupancy/occupancyApi";

export default function CustomerHomePage() {

  const navigate = useNavigate();

  const [membership, setMembership] = useState(null);
  const [occupancy, setOccupancy] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    try {

      const membershipData =
        await getCurrentMembership()
          .catch(() => null);

      const occupancyData =
        await getCurrentOccupancy();

      setMembership(membershipData);

      setOccupancy(
        occupancyData.currentOccupancy
      );

    }

    finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (
      <div className={styles.loading}>
        Loading dashboard...
      </div>
    );

  }

  return (

    <div className={styles.page}>

      <header className={styles.header}>

        <div>

          <p className={styles.eyebrow}>
            HyperScale Fitness Platform
          </p>

          <h1>
            Welcome Back 👋
          </h1>

          <p className={styles.subtitle}>
            Manage your membership and gym activities.
          </p>

        </div>

      </header>

      <div className={styles.grid}>

        <div className={styles.card}>

          <h2>
            Current Membership
          </h2>

          {
            membership ?

              <>

                <h3>
                  {membership.plan.name}
                </h3>

                <span className={styles.active}>
                  {membership.status}
                </span>

                <p>

                  Ends

                  <br />

                  {
                    new Date(
                      membership.endDate
                    ).toLocaleDateString()
                  }

                </p>

                <button
                  className={styles.button}
                  onClick={() => navigate("/manage-membership")}
                >
                  Manage Membership
                </button>

              </>

              :

              <>

                <h3>
                  No Active Membership
                </h3>

                <p>

                  Subscribe to unlock all gym services.

                </p>

                <button
                  className={styles.button}
                  onClick={() => navigate("/membership")}
                >
                  Browse Plans
                </button>

              </>

          }

        </div>

        <div className={styles.card}>

          <h2>
            Gym Occupancy
          </h2>

          <div className={styles.live}>

            <span className={styles.dot}></span>

            LIVE

          </div>

          <div className={styles.count}>

            {occupancy}

          </div>

          <p>

            Members currently inside

          </p>

          <button
            className={styles.button}
            onClick={() => navigate("/occupancy")}
          >
            Go to Occupancy
          </button>

        </div>

      </div>

      <div className={styles.card}>

        <h2>

          Quick Actions

        </h2>

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