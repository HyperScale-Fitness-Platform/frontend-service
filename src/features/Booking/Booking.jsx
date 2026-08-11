import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";

import {
    getAllClasses,
    getClassSessions,
    getTrainerSlots,
    getCustomerBookings,
    bookClass,
    bookPtSessionViaMembership,
    bookPtSessionViaPackage,
    cancelBooking,
    rescheduleBooking,
} from "./bookingApi";

import { getCurrentMembership } from "../Membership/membershipApi";
import { getCustomerPackages } from "../PTPackages/ptPackagesApi";

import styles from "./Booking.module.css";


export default function Booking() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [classes, setClasses] = useState([]);
    const [trainerSlots, setTrainerSlots] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [membership, setMembership] = useState(null);
    const [packages, setPackages] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [reschedulingId, setReschedulingId] = useState(null);
    const [rescheduleSlotId, setRescheduleSlotId] = useState("");


    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        try {

            const [
                classesData,
                slotsData,
                bookingsData,
                membershipData,
                packagesData,
            ] = await Promise.all([
                getAllClasses(),
                getTrainerSlots(),
                getCustomerBookings(),
                getCurrentMembership().catch(() => null),
                getCustomerPackages().catch(() => []),
            ]);

            setClasses(classesData);
            setTrainerSlots(slotsData);
            setBookings(bookingsData);
            setMembership(membershipData);
            setPackages(packagesData);

        }
        catch (error) {

            toast.error(
                "Unable to load booking data"
            );

        }
        finally {

            setLoading(false);

        }

    }


    const hasMembershipPt =
        membership?.status === "ACTIVE" &&
        membership.plan?.benefits?.some(
            b => b.benefitName === "PT_SESSIONS"
        );

    const activePackage =
        packages.find(
            pkg =>
                pkg.status === "ACTIVE" &&
                pkg.sessionsTotal - pkg.sessionsUsed > 0
        );


    // Bookings don't carry their own startTime -- the backend nests it under
    // classSession (for type: 'class') or trainerSlot (for type: 'pt_session').
    // This picks the right one, or falls back to a safe message instead of
    // rendering "Invalid Date".
    function getBookingDateLabel(booking) {

        if (booking.classSession?.startTime) {
            return new Date(booking.classSession.startTime).toLocaleString();
        }

        if (booking.trainerSlot?.startTime) {
            return new Date(booking.trainerSlot.startTime).toLocaleString();
        }

        return "Date unavailable";

    }


    // For class bookings, shows the actual class name (e.g. "Salsa Class")
    // by reading the nested classSession.class relation. Falls back to a
    // generic label if that relation wasn't loaded for some reason.
    function getBookingTitle(booking) {

        if (booking.type === "class") {
            return booking.classSession?.class?.name ?? "Class Booking";
        }

        return "PT Session";

    }


    async function selectClass(classId) {

        if (selectedClassId === classId) {

            setSelectedClassId(null);
            setSessions([]);
            return;

        }

        try {

            const data =
                await getClassSessions(classId);

            setSelectedClassId(classId);
            setSessions(data);

        }
        catch (error) {

            toast.error(
                "Unable to load class sessions"
            );

        }

    }


    async function handleBookClass(classSessionId) {

        try {

            await bookClass(classSessionId);

            toast.success(
                "Class booked successfully"
            );

            loadData();

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Booking failed"
            );

        }

    }


    async function handleBookPt(trainerSlotId, source) {

        try {

            if (source === "package")
                await bookPtSessionViaPackage(
                    trainerSlotId,
                    activePackage.id
                );
            else
                await bookPtSessionViaMembership(
                    trainerSlotId
                );

            toast.success(
                "PT session booked successfully"
            );

            loadData();

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Booking failed"
            );

        }

    }


    async function handleCancel(bookingId) {

        try {

            await cancelBooking(bookingId);

            toast.success(
                "Booking cancelled"
            );

            loadData();

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to cancel booking"
            );

        }

    }


    async function handleReschedule(bookingId) {

        if (!rescheduleSlotId) {

            toast.error(
                "Choose a new slot first"
            );

            return;

        }

        try {

            await rescheduleBooking(
                bookingId,
                rescheduleSlotId
            );

            toast.success(
                "Booking rescheduled"
            );

            setReschedulingId(null);
            setRescheduleSlotId("");

            loadData();

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to reschedule booking"
            );

        }

    }


    if (loading)
        return (
            <div className={styles.loading}>
                Loading bookings...
            </div>
        );


    return (

        <div className={styles.page}>

            <Toaster
                position="top-center"
            />

            <div className={styles.header}>

                <p className={styles.eyebrow}>
                    HyperScale Fitness Platform
                </p>

                <h1>
                    Bookings
                </h1>

                <p className={styles.subtitle}>
                    Book classes and PT sessions, manage what you already booked.
                </p>

            </div>


            {/* MY BOOKINGS */}

            <section>

                <h2>
                    My Bookings
                </h2>

                {

                    bookings.filter(b => b.status !== "cancelled").length === 0

                    ?

                    <div className={styles.emptyCard}>

                        <h3>
                            No Bookings Yet
                        </h3>

                        <p>
                            Book a class or a PT session below.
                        </p>

                    </div>

                    :

                    <div className={styles.grid}>

                        {

                            bookings
                                .filter(b => b.status !== "cancelled")
                                .map(booking => (

                                <div
                                    key={booking.id}
                                    className={styles.card}
                                >

                                    <h3>
                                        {getBookingTitle(booking)}
                                    </h3>

                                    <span className={styles.status}>
                                        {booking.status}
                                    </span>

                                    <p>
                                        {getBookingDateLabel(booking)}
                                    </p>

                                    {
                                        booking.status === "confirmed" && (

                                            <div className={styles.actions}>

                                                <button
                                                    onClick={() =>
                                                        handleCancel(booking.id)
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                                {
                                                    booking.type === "pt_session" && (

                                                        reschedulingId === booking.id

                                                        ?

                                                        <div className={styles.rescheduleBox}>

                                                            <select
                                                                value={rescheduleSlotId}
                                                                onChange={e =>
                                                                    setRescheduleSlotId(e.target.value)
                                                                }
                                                            >

                                                                <option value="">
                                                                    Choose a slot
                                                                </option>

                                                                {

                                                                    trainerSlots.map(slot => (

                                                                        <option
                                                                            key={slot.id}
                                                                            value={slot.id}
                                                                        >
                                                                            {
                                                                                new Date(
                                                                                    slot.startTime
                                                                                ).toLocaleString()
                                                                            }
                                                                        </option>

                                                                    ))

                                                                }

                                                            </select>

                                                            <button
                                                                onClick={() =>
                                                                    handleReschedule(booking.id)
                                                                }
                                                            >
                                                                Confirm
                                                            </button>

                                                        </div>

                                                        :

                                                        <button
                                                            onClick={() =>
                                                                setReschedulingId(booking.id)
                                                            }
                                                        >
                                                            Reschedule
                                                        </button>

                                                    )
                                                }

                                            </div>

                                        )
                                    }

                                </div>

                            ))

                        }

                    </div>

                }

            </section>


            {/* BOOK A CLASS */}

            <section>

                <h2>
                    Book a Class
                </h2>

                <div className={styles.grid}>

                    {

                        classes.map(cls => (

                            <div
                                key={cls.id}
                                className={styles.card}
                            >

                                <h3>
                                    {cls.name}
                                </h3>

                                <p>
                                    Capacity: {cls.capacity}
                                </p>

                                <button
                                    onClick={() => selectClass(cls.id)}
                                >
                                    {
                                        selectedClassId === cls.id
                                            ? "Hide Sessions"
                                            : "View Sessions"
                                    }
                                </button>

                                {

                                    selectedClassId === cls.id && (

                                        <div className={styles.sessionsList}>

                                            {

                                                sessions.length === 0

                                                ?

                                                <p>
                                                    No upcoming sessions.
                                                </p>

                                                :

                                                sessions.map(session => (

                                                    <div
                                                        key={session.id}
                                                        className={styles.sessionRow}
                                                    >

                                                        <span>
                                                            {
                                                                new Date(
                                                                    session.startTime
                                                                ).toLocaleString()
                                                            }
                                                            {" — "}
                                                            {
                                                                session.spotsRemaining > 0
                                                                    ? `${session.spotsRemaining} spots left`
                                                                    : "Full"
                                                            }
                                                        </span>

                                                        <button
                                                            disabled={session.spotsRemaining <= 0}
                                                            onClick={() =>
                                                                handleBookClass(session.id)
                                                            }
                                                        >
                                                            Book
                                                        </button>

                                                    </div>

                                                ))

                                            }

                                        </div>

                                    )

                                }

                            </div>

                        ))

                    }

                </div>

            </section>


            {/* BOOK A PT SESSION */}

            <section>

                <h2>
                    Book a PT Session
                </h2>

                {

                    !hasMembershipPt && !activePackage && (

                        <p className={styles.notice}>
                            You need an active membership with PT sessions or a PT package to book a session.
                        </p>

                    )

                }

                <div className={styles.grid}>

                    {

                        trainerSlots.map(slot => (

                            <div
                                key={slot.id}
                                className={styles.card}
                            >

                                <h3>
                                    {
                                        new Date(
                                            slot.startTime
                                        ).toLocaleString()
                                    }
                                </h3>

                                <p>
                                    with your trainer
                                </p>

                                <div className={styles.actions}>

                                    <button
                                        disabled={!hasMembershipPt}
                                        onClick={() =>
                                            handleBookPt(slot.id, "membership")
                                        }
                                    >
                                        Use Membership
                                    </button>

                                    <button
                                        disabled={!activePackage}
                                        onClick={() =>
                                            handleBookPt(slot.id, "package")
                                        }
                                    >
                                        Use Package
                                    </button>

                                </div>

                            </div>

                        ))

                    }

                </div>

            </section>


            {/* NAVIGATION */}

            <div className={styles.navigation}>

                <button
                    className={styles.backButton}
                    onClick={() =>
                        navigate("/customerHomePage")
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>

        </div>

    );

}