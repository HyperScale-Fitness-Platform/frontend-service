import { useState } from "react";
import toast from "react-hot-toast";

import {
    updateThread,
    deleteThread
} from "../communityApi";

import {
    getCurrentUser
} from "../../../utils/auth";

import styles from "../Community.module.css";

export default function ThreadCard({
    thread,
    onDeleted,
    onView
}) {

    const currentUser = getCurrentUser();

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(thread.title);
    const [content, setContent] = useState(thread.content);
    const [saving, setSaving] = useState(false);


    // ==========================================
    // DELETE THREAD
    // ==========================================

    async function handleDelete() {

        const confirmed = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmed) return;

        try {

            await deleteThread(thread.id);

            toast.success(
                "Post deleted successfully"
            );

            onDeleted();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to delete post"
            );

        }
    }


    // ==========================================
    // UPDATE THREAD
    // ==========================================

    async function handleUpdate() {

        if (!title.trim()) {

            toast.error(
                "Title cannot be empty"
            );

            return;
        }

        if (!content.trim()) {

            toast.error(
                "Post content cannot be empty"
            );

            return;
        }

        try {

            setSaving(true);

            await updateThread(
                thread.id,
                {
                    title: title.trim(),
                    content: content.trim()
                }
            );

            toast.success(
                "Post updated successfully"
            );

            setEditing(false);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to update post"
            );

        } finally {

            setSaving(false);

        }
    }


    // ==========================================
    // CANCEL EDIT
    // ==========================================

    function handleCancelEdit() {

        setTitle(thread.title);
        setContent(thread.content);
        setEditing(false);

    }


    return (

        <article className={styles.threadCard}>

            {/* USER */}

            <div className={styles.author}>

                <div className={styles.avatar}>

                    {thread.photo_url ? (

                        <img
                            src={thread.photo_url}
                            alt={thread.full_name}
                        />

                    ) : (

                        <span>
                            {thread.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                        </span>

                    )}

                </div>

                <div>

                    <strong className={styles.authorName}>
                        {thread.full_name || "Gym Member"}
                        {thread.role && (
                            <span className={styles.authorRole}>
                                {" "}
                                (
                                {thread.role.charAt(0).toUpperCase() +
                                    thread.role.slice(1)}
                                )
                            </span>
                        )}
                    </strong>

                    <span className={styles.date}>
                        {new Date(
                            thread.created_at
                        ).toLocaleDateString()}
                    </span>

                </div>

            </div>


            {/* CONTENT */}

            {editing ? (

                <div className={styles.editArea}>

                    <input
                        className={styles.input}
                        type="text"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        placeholder="Post title"
                    />

                    <textarea
                        className={styles.textarea}
                        value={content}
                        onChange={(e) =>
                            setContent(e.target.value)
                        }
                        placeholder="Post content"
                    />

                </div>

            ) : (

                <div className={styles.threadBody}>

                    <h2 className={styles.threadTitle}>
                        {thread.title}
                    </h2>

                    <p className={styles.threadContent}>
                        {thread.content}
                    </p>

                </div>

            )}


            {/* ACTIONS */}

            <div className={styles.actions}>

                {!editing && (

                    <button
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                        onClick={() =>
                            onView(thread.id)
                        }
                    >
                        View discussion
                    </button>

                )}


                {
                    currentUser?.id === thread.user_id
                && (

                    <>

                        {editing ? (

                            <>
                                <button
                                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                                    onClick={handleUpdate}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save"}
                                </button>

                                <button
                                    className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </>

                        ) : (

                            <>
                                <button
                                    className={`${styles.actionBtn} ${styles.editBtn}`}
                                    onClick={() =>
                                        setEditing(true)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </>

                        )}

                    </>

                )}

            </div>

        </article>

    );
}

