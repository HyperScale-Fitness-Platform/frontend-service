import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import {
    getCurrentOccupancy
} from "./occupancyApi";

import styles from "./Occupancy.module.css";

export default function Occupancy() {
    const navigate = useNavigate();

    const [occupancy, setOccupancy] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const currentOccupancy = await getCurrentOccupancy();
            setOccupancy(currentOccupancy.currentOccupancy);
        } catch (error) {
            toast.error("Unable to load occupancy data");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <h2>Loading occupancy...</h2>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={styles.eyebrow}>
                        HyperScale Fitness Platform
                    </p>

                    <h1>
                        Gym Occupancy
                    </h1>

                    <p className={styles.subtitle}>
                        View the current gym occupancy.
                    </p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <p className={styles.label}>
                            Current Gym Occupancy
                        </p>

                        <h2 className={styles.number}>
                            {occupancy}
                        </h2>

                        <span>
                            Members inside gym
                        </span>
                    </div>
                </div>

                <button
                    className={styles.back}
                    onClick={() => navigate("/customerHomePage")}
                >
                    ← Back Dashboard
                </button>
            </div>
        </div>
    );
}