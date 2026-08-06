import { useState } from "react";
import toast from "react-hot-toast";

import {
    deleteComment,
    updateComment
} from "../communityApi";

import {
    getCurrentUser
} from "../../../utils/auth";

import styles from "../Community.module.css";


export default function CommentList({
    comments,
    threadId,
    onUpdated
}) {

    const currentUser = getCurrentUser();

    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");


    function startEdit(comment) {

        setEditingId(comment.id);
        setEditContent(comment.content);

    }


    function cancelEdit() {

        setEditingId(null);
        setEditContent("");

    }


    async function saveEdit(commentId) {

        if (!editContent.trim()) {

            toast.error(
                "Comment cannot be empty"
            );

            return;
        }

        try {

            await updateComment(
                threadId,
                commentId,
                {
                    content: editContent
                }
            );

            toast.success(
                "Comment updated"
            );

            cancelEdit();

            onUpdated();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to update comment"
            );

        }

    }


    async function handleDelete(commentId) {

        const confirmed =
            window.confirm(
                "Delete this comment?"
            );

        if (!confirmed) return;

        try {

            await deleteComment(
                threadId,
                commentId
            );

            toast.success(
                "Comment deleted"
            );

            onUpdated();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to delete comment"
            );

        }

    }


    if (comments.length === 0) {

        return (

            <div className={styles.noComments}>

                <p>
                    No comments yet.
                </p>

                <span>
                    Be the first to join the conversation.
                </span>

            </div>

        );

    }


    return (

        <div className={styles.comments}>

            {comments.map((comment) => (

                <article
                    className={styles.commentCard}
                    key={comment.id}
                >

                    <div className={styles.author}>

                        <div className={styles.avatarSmall}>

                            {comment.photo_url ? (

                                <img
                                    src={comment.photo_url}
                                    alt={comment.full_name}
                                />

                            ) : (

                                <span>
                                    {comment.full_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "?"}
                                </span>

                            )}

                        </div>

                        <div>

                            <strong className={styles.authorName}>
                                {comment.full_name || "Gym Member"}
                            </strong>

                            <span className={styles.date}>
                                {new Date(
                                    comment.created_at
                                ).toLocaleDateString()}
                            </span>

                        </div>

                    </div>


                    {editingId === comment.id ? (

                        <div className={styles.editArea}>

                            <textarea
                                className={styles.textarea}
                                value={editContent}
                                onChange={(e) =>
                                    setEditContent(e.target.value)
                                }
                            />

                            <div className={styles.actions}>

                                <button
                                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                                    onClick={() =>
                                        saveEdit(comment.id)
                                    }
                                >
                                    Save
                                </button>

                                <button
                                    className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    ) : (

                        <>

                            <p className={styles.commentText}>
                                {comment.content}
                            </p>


                            {(
                                currentUser?.id === comment.user_id ||
                                currentUser?.role === "admin"
                            ) && (

                                <div className={styles.commentActions}>

                                    <button
                                        className={`${styles.smallAction} ${styles.editBtn}`}
                                        onClick={() =>
                                            startEdit(comment)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className={`${styles.smallAction} ${styles.deleteBtn}`}
                                        onClick={() =>
                                            handleDelete(comment.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            )}

                        </>

                    )}

                </article>

            ))}

        </div>

    );

}
