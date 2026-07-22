import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { createPlan } from "../membershipAdminApi";
import styles from "../../AdminBooking/Booking.module.css";

const schema = z.object({
    name: z.string().min(1, "Plan name is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    durationInDays: z.coerce
        .number()
        .positive("Duration must be greater than 0"),
    maxFreezes: z.coerce
        .number()
        .min(0, "Cannot be negative"),
});

export default function CreatePlan({ onCreated }) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    async function onSubmit(data) {
        try {
            setLoading(true);

            await createPlan(data);

            toast.success("Membership plan created successfully");

            reset();

            onCreated?.();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to create membership plan"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.card}
        >
            <h3 className={styles.cardTitle}>
                Create Membership Plan
            </h3>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Plan Name
                </label>

                <input
                    className={styles.input}
                    placeholder="Premium"
                    {...register("name")}
                />

                {errors.name && (
                    <span className={styles.errorText}>
                        {errors.name.message}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Price
                </label>

                <input
                    className={styles.input}
                    type="number"
                    {...register("price")}
                />

                {errors.price && (
                    <span className={styles.errorText}>
                        {errors.price.message}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Duration (Days)
                </label>

                <input
                    className={styles.input}
                    type="number"
                    {...register("durationInDays")}
                />

                {errors.durationInDays && (
                    <span className={styles.errorText}>
                        {errors.durationInDays.message}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Maximum Freezes
                </label>

                <input
                    className={styles.input}
                    type="number"
                    {...register("maxFreezes")}
                />

                {errors.maxFreezes && (
                    <span className={styles.errorText}>
                        {errors.maxFreezes.message}
                    </span>
                )}
            </div>

            <button
                className={styles.cardBtn}
                disabled={loading}
            >
                {loading ? "Creating..." : "Create Plan"}
            </button>
        </form>
    );
}