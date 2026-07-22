import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import {
    getAdminPlans,
    addBenefit,
} from "../membershipAdminApi";

import styles from "../../AdminBooking/Booking.module.css";

const schema = z.object({
    planId: z.string().min(1, "Select a plan"),

    benefitName: z.string().min(1),

    benefitValue: z.coerce
        .number()
        .positive("Benefit value must be greater than 0"),
});

export default function AddBenefit({ plans, onAdded }) {
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

            await addBenefit(
                data.planId,
                {
                    benefitName: data.benefitName,
                    benefitValue: data.benefitValue,
                }
            );

            toast.success("Benefit added successfully");
            reset();

            onAdded?.();

            reset();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to add benefit"
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
                Add Membership Benefit
            </h3>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Membership Plan
                </label>

                <select
                    className={styles.input}
                    {...register("planId")}
                >
                    <option value="">
                        Select a plan
                    </option>

                    {plans.map((plan) => (
                        <option
                            key={plan.id}
                            value={plan.id}
                        >
                            {plan.name}
                        </option>
                    ))}
                </select>

                {errors.planId && (
                    <span className={styles.errorText}>
                        {errors.planId.message}
                    </span>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Benefit
                </label>

                <select
                    className={styles.input}
                    {...register("benefitName")}
                >
                    <option value="PT_SESSIONS">
                        PT Sessions
                    </option>

                    <option value="GROUP_CLASSES">
                        Group Classes
                    </option>

                    <option value="LOCKER_ACCESS">
                        Locker Access
                    </option>

                    <option value="SAUNA_ACCESS">
                        Sauna Access
                    </option>
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Benefit Value
                </label>

                <input
                    className={styles.input}
                    type="number"
                    placeholder="10"
                    {...register("benefitValue")}
                />

                {errors.benefitValue && (
                    <span className={styles.errorText}>
                        {errors.benefitValue.message}
                    </span>
                )}
            </div>

            <button
                className={styles.cardBtn}
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Benefit"}
            </button>
        </form>
    );
}