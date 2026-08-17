import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";

import {
    getAllClasses,
    getClassSessions,
    getPackageAvailableSlots,
    getCustomerBookings,
    getBookableSources,
    getFreePtAvailability,
    bookClass,
    bookPtSessionViaMembership,
    bookPtSessionViaPackage,
    cancelBooking,
    rescheduleBooking,
} from "./bookingApi";

import { getCurrentMembership } from "../Membership/membershipApi";
import { getCustomerPackages, getTrainers } from "../PTPackages/ptPackagesApi";

import styles from "./Booking.module.css";


export default function Booking() {

    const navigate = useNavigate();
    const location = useLocation();

    // Which package the customer came from ("Book Session" on a specific
    // package card). When set, the PT package section books with — and thus
    // increments "Used" on — exactly that package.
    const preselectedPkgId =
        location.state?.ptPackageId;

    const [loading, setLoading] = useState(true);

    const [classes, setClasses] = useState([]);
    const [packageSlots, setPackageSlots] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [membership, setMembership] = useState(null);
    const [packages, setPackages] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [reschedulingId, setReschedulingId] = useState(null);
    const [rescheduleSlotId, setRescheduleSlotId] = useState("");

    const [trainerNameById, setTrainerNameById] = useState({});

    const [freeCreditRemaining, setFreeCreditRemaining] = useState(null);

    const [freeSlots, setFreeSlots] = useState([]);


    useEffect(() => {

        loadData();

    }, []);


    // Pick the package the "Use your PT Package" section books with.
    // Prefers the package the customer clicked through from; falls back to
    // the newest active package when arriving at /booking directly.
    function pickActivePackage(packageList) {

        const active = packageList.filter(
            pkg =>
                pkg.status === "ACTIVE" &&
                pkg.sessionsTotal - pkg.sessionsUsed > 0
        );

        if (preselectedPkgId) {

            const preselected =
                active.find(
                    pkg =>
                        pkg.id === preselectedPkgId
                );

            if (preselected) {

                return preselected;

            }

        }

        return active[0] || null;

    }


    async function loadData() {

        try {

            const [
                classesData,
                bookingsData,
                membershipData,
                packagesData,
                sourcesData,
                trainersData,
                freeSlotsData,
            ] = await Promise.all([
                getAllClasses(),
                getCustomerBookings(),
                getCurrentMembership().catch(() => null),
                getCustomerPackages().catch(() => []),
                getBookableSources().catch(() => null),
                getTrainers().catch(() => []),
                getFreePtAvailability().catch(() => []),
            ]);

            setClasses(classesData);
            setBookings(bookingsData);
            setMembership(membershipData);
            setPackages(packagesData);
            setFreeSlots(
                Array.isArray(freeSlotsData) ? freeSlotsData : []
            );

            const nameMap = {};

            (Array.isArray(trainersData) ? trainersData : []).forEach(
                trainer => {

                    if (trainer?.id) {

                        nameMap[trainer.id] =
                            trainer.full_name;

                    }

                }
            );

            setTrainerNameById(nameMap);

            const remaining =
                sourcesData?.freeCredit?.remaining;

            setFreeCreditRemaining(
                typeof remaining === "number"
                    ? remaining
                    : null
            );

            const activePkg =
                pickActivePackage(packagesData);

            if (activePkg) {

                const pkgSlots =
                    await getPackageAvailableSlots(activePkg.id);

                setPackageSlots(pkgSlots);

            }
            else {

                setPackageSlots([]);

            }

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
        pickActivePackage(packages);


    // Show ALL open slots so the customer can browse everything and pick
    // from them -- the remaining credit is enforced by hiding the section
    // once it hits 0 (the backend also rejects booking past the credit).
    // If the remaining count is unknown (fetch failed), show NO slots
    // rather than risk over-promising.
    const membershipSlots =
        typeof freeCreditRemaining === "number"
        &&
        freeCreditRemaining > 0
            ? freeSlots
            : [];


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

            if (selectedClassId) {

                const updatedSessions =
                    await getClassSessions(selectedClassId);

                setSessions(
                    Array.isArray(updatedSessions)
                        ? updatedSessions
                        : []
                );

            }

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Booking failed"
            );

        }

    }


    async function handleBookPt(slot, source) {

        try {

            if (source === "package")
                await bookPtSessionViaPackage(
                    slot.startTime,
                    activePackage.id
                );
            else
                await bookPtSessionViaMembership(
                    slot.startTime
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

            if (selectedClassId) {

                const updatedSessions =
                    await getClassSessions(selectedClassId);

                setSessions(
                    Array.isArray(updatedSessions)
                        ? updatedSessions
                        : []
                );

            }

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

                    bookings.filter(b => b.status !== "cancelled" && b.status !== "rescheduled").length === 0

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
                                .filter(b => b.status !== "cancelled" && b.status !== "rescheduled")
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

                                                                    (
                                                                        booking.sourceType === "package"
                                                                        ?
                                                                        freeSlots.filter(
                                                                            slot =>
                                                                                slot.trainerId ===
                                                                                booking.trainerId
                                                                        )
                                                                        :
                                                                        freeSlots
                                                                    ).map(slot => (

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
                                                            onClick={() => {
                                                                setReschedulingId(booking.id);
                                                                setRescheduleSlotId("");
                                                            }}
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

                {/* USE A PURCHASED PACKAGE */}

                {

                    activePackage && (

                        <div className={styles.sourceGroup}>

                            <h3>
                                Use your PT Package

                                {
                                    activePackage && (

                                        <span className={styles.packageLabel}>

                                            — {activePackage.packageType} Sessions

                                            {
                                                trainerNameById[activePackage.trainerId]
                                                &&
                                                ` with ${trainerNameById[activePackage.trainerId]} Coach`
                                            }

                                        </span>

                                    )
                                }

                            </h3>

                            {

                                packageSlots.length === 0

                                ?

                                <p className={styles.notice}>
                                    No trainer slots are available right now.
                                </p>

                                :

                                <div className={styles.grid}>

                                    {

                                        packageSlots.map(slot => (

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
                                                    {
                                                        trainerNameById[slot.trainerId]

                                                        ?

                                                        `${trainerNameById[slot.trainerId]} Coach`

                                                        :

                                                        "with your trainer"
                                                    }
                                                </p>

                                                <div className={styles.actions}>

                                                    <button
                                                        onClick={() =>
                                                            handleBookPt(slot, "package")
                                                        }
                                                    >
                                                        Book with Package
                                                    </button>

                                                </div>

                                            </div>

                                        ))

                                    }

                                </div>

                            }

                        </div>

                    )

                }

                {/* USE MEMBERSHIP CREDIT */}

                {

                    hasMembershipPt && (

                        <div className={styles.sourceGroup}>

                            <h3>
                                Use your Membership
                            </h3>

                            {
                                typeof freeCreditRemaining === "number"
                                &&
                                freeCreditRemaining > 0
                                &&

                                <p className={styles.freeCount}>
                                    You have {freeCreditRemaining} free PT{" "}
                                    {freeCreditRemaining === 1 ? "session" : "sessions"} left
                                </p>
                            }

                            {
                                freeCreditRemaining === null

                                ?

                                <p className={styles.notice}>
                                    Unable to load your free PT session allowance.
                                </p>

                                :

                                freeCreditRemaining === 0

                                ?

                                <p className={styles.notice}>
                                    You have no free PT sessions remaining
                                </p>

                                :

                                membershipSlots.length === 0

                                ?

                                <p className={styles.notice}>
                                    No trainer slots are available right now.
                                </p>

                                :

                                <div className={styles.grid}>

                                    {

                                        membershipSlots.map(slot => (

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
                                                    {
                                                        trainerNameById[slot.trainerId]

                                                        ?

                                                        `${trainerNameById[slot.trainerId]} Coach`

                                                        :

                                                        "with your trainer"
                                                    }
                                                </p>

                                                <div className={styles.actions}>

                                                    <button
                                                        onClick={() =>
                                                            handleBookPt(slot, "membership")
                                                        }
                                                    >
                                                        Book with Membership
                                                    </button>

                                                </div>

                                            </div>

                                        ))

                                    }

                                </div>

                            }

                        </div>

                    )

                }

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