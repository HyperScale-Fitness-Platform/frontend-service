import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";

import {
    getAllClasses,
    getClassSessions,
    getCustomerBookings,
    getTrainerSlots,
    bookClass,
    getBookableSources,
    getPackageAvailability,
    getFreePtAvailability,
    bookPtSession,
    cancelBooking,
    rescheduleBooking,
} from "./bookingApi";

// import { getCurrentMembership } from "../Membership/membershipApi";
// import { getCustomerPackages } from "../PTPackages/ptPackagesApi";

import styles from "./Booking.module.css";


export default function Booking() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [classes, setClasses] = useState([]);
    const [bookings, setBookings] = useState([]);
    // const [trainerSlots, setTrainerSlots] = useState([]);

    // const [membership, setMembership] = useState(null);
    // const [packages, setPackages] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [reschedulingId, setReschedulingId] = useState(null);
    const [rescheduleSlotId, setRescheduleSlotId] = useState("");
    const [rescheduleSlots, setRescheduleSlots] = useState([]);
    const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);


    const [bookableSources, setBookableSources] =
        useState({
            packages: [],
            freeCredit: {
                available: false,
                remaining: 0,
            },
        });

    const [selectedSource, setSelectedSource] = useState(null);

    const [ptSlots, setPtSlots] = useState([]);

    const [loadingPtSlots, setLoadingPtSlots] = useState(false);

    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        try {

            const [
                classesData,
                bookingsData,
                sourcesData,
            ] = await Promise.all([
                getAllClasses(),
                getCustomerBookings(),
                getBookableSources(),
            ]);

            // setClasses(classesData);
            // setBookings(bookingsData);
            // setMembership(membershipData);
            // setPackages(packagesData);
            // setBookableSources(sourcesData);

            setClasses(
                Array.isArray(classesData) ? classesData : []
            );

            // setTrainerSlots(
            //     Array.isArray(trainerSlotsData) ? trainerSlotsData : []
            // );

            setBookings(
                Array.isArray(bookingsData) ? bookingsData : []
            );

            // setMembership(membershipData);

            // setPackages(
            //     Array.isArray(packagesData) ? packagesData : []
            // );

            setBookableSources({
                packages:
                    Array.isArray(
                        sourcesData?.packages
                    )
                        ? sourcesData.packages
                        : [],

                freeCredit:
                    sourcesData?.freeCredit ?? {
                        available: false,
                        remaining: 0,
                    },
            });
        }
        catch (error) {
            console.error("BOOKING LOAD ERROR:", error);
            console.error("STATUS:", error.response?.status);
            console.error("URL:", error.config?.url);
            console.error("RESPONSE:", error.response?.data);

            toast.error(
                error.response?.data?.message ||
                "Unable to load booking data"
            );
        }
        finally {

            setLoading(false);

        }

    }


    // const hasMembershipPt =
    //     membership?.status === "ACTIVE" &&
    //     membership.plan?.benefits?.some(
    //         b => b.benefitName === "PT_SESSIONS"
    //     );

    // const activePackage =
    //     packages.find(
    //         pkg =>
    //             pkg.status === "ACTIVE" &&
    //             pkg.sessionsTotal - pkg.sessionsUsed > 0
    //     );


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

        toast.success("Class booked successfully");

        // Refresh bookings and other booking data
        await loadData();

        // Refresh the currently displayed class sessions
        if (selectedClassId) {
            const updatedSessions =
                await getClassSessions(selectedClassId);

            setSessions(
                Array.isArray(updatedSessions)
                    ? updatedSessions
                    : []
            );
        }

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Booking failed"
        );
    }
}

    async function selectPtSource(source) {

        setSelectedSource(source);

        setLoadingPtSlots(true);

        try {

            let slots;

            if (source.type === "package") {

                slots =
                    await getPackageAvailability(
                        source.id
                    );

            } else {

                slots =
                    await getFreePtAvailability();

            }

            setPtSlots(slots);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to load PT availability"
            );

        } finally {

            setLoadingPtSlots(false);
        }
    }


    // async function handleBookPt(trainerSlotId, source) {

    //     try {

    //         if (source === "package")
    //             await bookPtSessionViaPackage(
    //                 trainerSlotId,
    //                 activePackage.id
    //             );
    //         else
    //             await bookPtSessionViaMembership(
    //                 trainerSlotId
    //             );

    //         toast.success(
    //             "PT session booked successfully"
    //         );

    //         loadData();

    //     }
    //     catch (error) {

    //         toast.error(
    //             error.response?.data?.message ||
    //             "Booking failed"
    //         );

    //     }

    // }


    async function handleCancel(bookingId) {
    try {
        await cancelBooking(bookingId);

        toast.success("Booking cancelled");

        await loadData();

        // Refresh currently displayed class sessions
        if (selectedClassId) {
            const updatedSessions =
                await getClassSessions(selectedClassId);

            setSessions(
                Array.isArray(updatedSessions)
                    ? updatedSessions
                    : []
            );
        }

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to cancel booking"
        );
    }
}


    async function startReschedule(booking) {

        setReschedulingId(booking.id);
        setRescheduleSlotId("");
        setRescheduleSlots([]);
        setLoadingRescheduleSlots(true);

        try {

            if (!booking.trainerId) {
                toast.error("Trainer information is unavailable");
                return;
            }

            const slots =
                await getTrainerSlots(
                    booking.trainerId
                );

            setRescheduleSlots(
                Array.isArray(slots)
                    ? slots
                    : []
            );

        }
        catch (error) {

            console.error(
                "RESCHEDULE SLOTS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load trainer availability"
            );

        }
        finally {

            setLoadingRescheduleSlots(false);

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
            setRescheduleSlots([]);

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

                                            {booking.type === "pt_session" && booking.trainer && (
                                                <div className={styles.trainerInfo}>

                                                    {booking.trainer.photoUrl && (
                                                        <img
                                                            src={booking.trainer.photoUrl}
                                                            alt={booking.trainer.fullName}
                                                            className={styles.trainerPhoto}
                                                        />
                                                    )}

                                                    <div>
                                                        <p>
                                                            <strong>Trainer:</strong>{" "}
                                                            {booking.trainer.fullName}
                                                        </p>

                                                        {booking.trainer.bio && (
                                                            <p>
                                                                {booking.trainer.bio}
                                                            </p>
                                                        )}

                                                        {booking.trainer.gender && (
                                                            <p>
                                                                Gender: {booking.trainer.gender}
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>
                                            )}

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
                                                                                loadingRescheduleSlots ? (

                                                                                    <option value="">
                                                                                        Loading available slots...
                                                                                    </option>

                                                                                ) : (

                                                                                    rescheduleSlots.map(slot => (

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

                                                                                )
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
                                                                            startReschedule(booking)
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

                {/* SOURCE SELECTION */}

                {!selectedSource && (

                    <div className={styles.grid}>

                        {
                            bookableSources.packages.map(pkg => (

                                <div
                                    key={pkg.id}
                                    className={styles.card}
                                >

                                    <h3>
                                        PT Package
                                    </h3>

                                    {
                                        pkg.trainer ? (
                                            <div className={styles.trainerInfo}>

                                                {
                                                    pkg.trainer.photoUrl && (
                                                        <img
                                                            src={pkg.trainer.photoUrl}
                                                            alt={pkg.trainer.fullName}
                                                            className={styles.trainerPhoto}
                                                        />
                                                    )
                                                }

                                                <div>
                                                    <p>
                                                        Trainer: {pkg.trainer.fullName}
                                                    </p>

                                                    {
                                                        pkg.trainer.bio && (
                                                            <p>
                                                                {pkg.trainer.bio}
                                                            </p>
                                                        )
                                                    }
                                                </div>

                                            </div>
                                        ) : (
                                            <p>
                                                Trainer information unavailable
                                            </p>
                                        )
                                    }

                                    <p>
                                        Remaining:
                                        {" "}
                                        {pkg.remainingSessions}
                                    </p>

                                    <button
                                        onClick={() =>
                                            selectPtSource({
                                                type: "package",
                                                id: pkg.id
                                            })
                                        }
                                    >
                                        Use Package
                                    </button>

                                </div>

                            ))
                        }


                        {
                            bookableSources.freeCredit?.remaining > 0 && (

                                <div className={styles.card}>

                                    <h3>
                                        Membership PT Credit
                                    </h3>

                                    <p>
                                        Remaining:
                                        {" "}
                                        {bookableSources.freeCredit.remaining}
                                    </p>

                                    <p>
                                        Trainer will be assigned automatically.
                                    </p>

                                    <button
                                        onClick={() =>
                                            selectPtSource({
                                                type: "free"
                                            })
                                        }
                                    >
                                        Use Membership Credit
                                    </button>

                                </div>
                            )
                        }

                    </div>
                )}


                {/* AVAILABILITY */}

                {
                    selectedSource && (

                        <div>

                            <button
                                className={styles.backButton}
                                onClick={() => {
                                    setSelectedSource(null);
                                    setPtSlots([]);
                                }}
                            >
                                ← Choose another source
                            </button>


                            <h3>
                                Available PT Sessions
                            </h3>


                            {
                                loadingPtSlots

                                    ?

                                    <p>
                                        Loading availability...
                                    </p>

                                    :

                                    ptSlots.length === 0

                                        ?

                                        <p className={styles.notice}>
                                            No sessions available.
                                        </p>

                                        :

                                        <div className={styles.grid}>

                                            {
                                                ptSlots.map(slot => (

                                                    <div
                                                        key={slot.id || slot.startTime}
                                                        className={styles.card}
                                                    >

                                                        <h3>
                                                            {
                                                                new Date(
                                                                    slot.startTime
                                                                ).toLocaleString()
                                                            }
                                                        </h3>

                                                        {
                                                            selectedSource.type === "free" && (

                                                                <p>
                                                                    Trainer assigned automatically
                                                                </p>

                                                            )
                                                        }


                                                        {
                                                            selectedSource.type === "package" && (

                                                                <p>
                                                                    Your package trainer
                                                                </p>

                                                            )
                                                        }


                                                        <button
                                                            onClick={async () => {

                                                                try {

                                                                    const booking =
                                                                        await bookPtSession({
                                                                            sourceType: selectedSource.type,

                                                                            ...(selectedSource.type === "package"
                                                                                ? {
                                                                                    sourceId: selectedSource.id
                                                                                }
                                                                                : {}),

                                                                            slotStart: slot.startTime
                                                                        });

                                                                    toast.success(
                                                                        "PT session booked successfully"
                                                                    );

                                                                    setSelectedSource(null);
                                                                    setPtSlots([]);

                                                                    loadData();

                                                                }
                                                                catch (error) {

                                                                    toast.error(
                                                                        error.response?.data?.message ||
                                                                        "Booking failed"
                                                                    );

                                                                }

                                                            }}
                                                        >
                                                            Book Session
                                                        </button>

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