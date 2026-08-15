import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
    checkIn,
    checkOut,
    getCurrentOccupancy,
    getCustomers
} from "../../Occupancy/occupancyApi";

import styles from "../AdminBooking/Booking.module.css";

const OPTIONS = [
    {
        key: "checkin",
        title: "Check In",
        description: "Mark a selected customer as inside the gym",
        icon: "✅",
    },
    {
        key: "checkout",
        title: "Check Out",
        description: "Mark a selected customer as leaving the gym",
        icon: "🚪",
    },
];

export default function AdminOccupancy() {
    const [activePanel, setActivePanel] = useState(null);
    const [occupancy, setOccupancy] = useState(0);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    async function loadData() {
        try {
            const [occupancyResponse, customersResponse] =
                await Promise.all([
                    getCurrentOccupancy(),
                    getCustomers(),
                ]);

            setOccupancy(
                occupancyResponse.currentOccupancy
            );

            setCustomers(
                Array.isArray(customersResponse)
                    ? customersResponse
                    : []
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to load occupancy data"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const selectedCustomer = useMemo(() => {
        return customers.find((customer) => 
            String(customer.id) === String(selectedCustomerId)
        );
    }, [customers, selectedCustomerId]);

    async function handleCheckIn() {
        if (!selectedCustomerId) {
            toast.error("Please select a customer");
            return;
        }

        try {
            setSubmitting(true);
            await checkIn(selectedCustomerId);
            toast.success("Checked in successfully");
            setSelectedCustomerId("");
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Check in failed");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCheckOut() {
        if (!selectedCustomerId) {
            toast.error("Please select a customer");
            return;
        }

        try {
            setSubmitting(true);
            await checkOut(selectedCustomerId);
            toast.success("Checked out successfully");
            setSelectedCustomerId("");
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Check out failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <h2>Loading occupancy...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>
                    Occupancy Administration
                </h1>

                <div className={styles.optionGrid}>
                    {OPTIONS.map((option) => (
                        <button
                            key={option.key}
                            className={`${styles.optionCard} ${activePanel === option.key
                                    ? styles.optionCardActive
                                    : ""
                                }`}
                            onClick={() =>
                                setActivePanel(
                                    activePanel === option.key ? null : option.key
                                )
                            }
                        >
                            <span className={styles.optionIcon}>
                                {option.icon}
                            </span>

                            <span className={styles.optionTitle}>
                                {option.title}
                            </span>

                            <span className={styles.optionDesc}>
                                {option.description}
                            </span>
                        </button>
                    ))}
                </div>

                {activePanel && (
                    <div className={styles.card}>
                        <h2>
                            {activePanel === "checkin"
                                ? "Check In Customer"
                                : "Check Out Customer"}
                        </h2>

                        <label className={styles.fieldLabel}>
                            Select Customer
                        </label>

                        <select
                            className={styles.input}
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                        >
                            <option value="">Select a customer</option>
                            {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.fullName}
                                    </option>
                            ))}
                        </select>

                        {selectedCustomer && (
                            <p style={{ marginTop: "10px" }}>
                                Selected: {selectedCustomer.fullName}
                            </p>
                        )}

                        <button
                            className={styles.cardBtn}
                            onClick={
                                activePanel === "checkin"
                                    ? handleCheckIn
                                    : handleCheckOut
                            }
                            disabled={submitting || !selectedCustomerId}
                        >
                            {submitting
                                ? "Processing..."
                                : activePanel === "checkin"
                                    ? "Check In"
                                    : "Check Out"}
                        </button>
                    </div>
                )}

                <div className={styles.card}>
                    <h2>Current Gym Occupancy</h2>
                    <p>
                        <strong>{occupancy}</strong> members are currently inside the gym.
                    </p>
                </div>
            </div>
        </div>
    );
}