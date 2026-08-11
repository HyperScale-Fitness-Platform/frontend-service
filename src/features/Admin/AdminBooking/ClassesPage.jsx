import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getClasses, getClassSessions, updateClass } from "./bookingApi";
import styles from "./Booking.module.css";

export default function ClassesPage() {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", type: "", capacity: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    async function loadClasses() {
        setLoading(true);
        try {
            const res = await getClasses();
            setClasses(res.data);
        } catch (error) {
            toast.error("Unable to load classes");
        } finally {
            setLoading(false);
        }
    }

    async function toggleSessions(classId) {
        if (expandedId === classId) {
            setExpandedId(null);
            setSessions([]);
            return;
        }

        setExpandedId(classId);
        setSessionsLoading(true);
        try {
            const res = await getClassSessions(classId);
            setSessions(res.data);
        } catch (error) {
            toast.error("Unable to load sessions");
        } finally {
            setSessionsLoading(false);
        }
    }

    function startEditing(cls) {
        setEditingId(cls.id);
        setEditForm({
            name: cls.name,
            type: cls.type,
            capacity: cls.capacity,
        });
    }

    function cancelEditing() {
        setEditingId(null);
        setEditForm({ name: "", type: "", capacity: "" });
    }

    async function saveEdit(classId) {
        setSaving(true);
        try {
            await updateClass(classId, {
                name: editForm.name,
                type: editForm.type,
                capacity: Number(editForm.capacity),
            });
            toast.success("Class updated");
            setEditingId(null);
            loadClasses();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update class");
        } finally {
            setSaving(false);
        }
    }

    if (loading)
        return <div className={styles.loading}>Loading classes...</div>;

    return (

        <div className={styles.page}>

            <div className={styles.container}>

                <h1 className={styles.pageTitle}>
                    All Classes
                </h1>

                <p className={styles.pageSub}>
                    Every class currently in the gym catalog.
                </p>

                {

                    classes.length === 0

                    ?

                    <p className={styles.notice}>
                        No classes created yet.
                    </p>

                    :

                    <div className={styles.optionGrid}>

                        {classes.map(cls => (

                            <div
                                key={cls.id}
                                className={`${styles.optionCard} ${expandedId === cls.id ? styles.optionCardActive : ''}`}
                            >

                                {editingId === cls.id ? (

                                    <>

                                        <input
                                            className={styles.input}
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="Class name"
                                        />

                                        <input
                                            className={styles.input}
                                            value={editForm.type}
                                            onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                            placeholder="Type"
                                        />

                                        <input
                                            className={styles.input}
                                            type="number"
                                            value={editForm.capacity}
                                            onChange={e => setEditForm({ ...editForm, capacity: e.target.value })}
                                            placeholder="Capacity"
                                        />

                                        <div className={styles.actions}>
                                            <button disabled={saving} onClick={() => saveEdit(cls.id)}>
                                                {saving ? "Saving..." : "Save"}
                                            </button>
                                            <button disabled={saving} onClick={cancelEditing}>
                                                Cancel
                                            </button>
                                        </div>

                                    </>

                                ) : (

                                    <>

                                        <span className={styles.optionTitle}>
                                            {cls.name}
                                        </span>

                                        <span className={styles.optionDesc}>
                                            {cls.type} — capacity {cls.capacity}
                                        </span>

                                        <div className={styles.actions}>

                                            <button onClick={() => toggleSessions(cls.id)}>
                                                {expandedId === cls.id ? "Hide Sessions" : "View Sessions"}
                                            </button>

                                            <button onClick={() => startEditing(cls)}>
                                                Edit
                                            </button>

                                        </div>

                                    </>

                                )}

                                {expandedId === cls.id && editingId !== cls.id && (

                                    <div className={styles.sessionsList}>

                                        {sessionsLoading ? (

                                            <p>Loading sessions...</p>

                                        ) : sessions.length === 0 ? (

                                            <p>No sessions scheduled yet.</p>

                                        ) : (

                                            sessions.map(session => (
                                                <div key={session.id} className={styles.sessionRow}>
                                                    <span>
                                                        {new Date(session.startTime).toLocaleString()}
                                                    </span>
                                                    {session.spotsRemaining !== undefined && (
                                                        <span className={styles.cardMeta}>
                                                            {session.spotsRemaining > 0
                                                                ? `${session.spotsRemaining} spots left`
                                                                : "Full"}
                                                        </span>
                                                    )}
                                                </div>
                                            ))

                                        )}

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                }

                <div className={styles.navigation}>
                    <button
                        className={styles.backButton}
                        onClick={() => navigate("/admin/booking")}
                    >
                        ← Back to Booking Setup
                    </button>
                </div>

            </div>

        </div>

    );

}