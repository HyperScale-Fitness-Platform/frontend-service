import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    getThreadById,
    getThreadComments
} from "../communityApi";

import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

import styles from "../Community.module.css";

import socket from "../socket";

export default function ThreadDetail({
    threadId
}) {

    const [thread, setThread] = useState(null);
    const [comments, setComments] = useState([]);

    const [loading, setLoading] = useState(true);


    // ==========================================
    // LOAD THREAD + COMMENTS
    // ==========================================

    async function loadThread() {

        try {

            setLoading(true);

            const [
                threadResponse,
                commentsResponse
            ] = await Promise.all([

                getThreadById(threadId),

                getThreadComments(threadId)

            ]);

            setThread(threadResponse.data);

            setComments(commentsResponse.data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to load discussion"
            );

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // LOAD INITIAL DATA
    // ==========================================

    useEffect(() => {

        if (!threadId) return;

        loadThread();

    }, [threadId]);


    // ==========================================
    // SOCKET.IO
    // ==========================================

    useEffect(() => {

        if (!threadId) return;


        // Join this thread's Socket.IO room
        socket.emit(
            "join:thread",
            threadId
        );


        // ------------------------------
        // NEW COMMENT
        // ------------------------------

        function handleCommentCreated(comment) {

            // Make sure the event belongs
            // to the current thread
            if (
                comment.thread_id !== threadId
            ) {
                return;
            }


            setComments((prevComments) => {

                // Prevent duplicate comments
                // because the creator also receives
                // the Socket.IO event
                const exists = prevComments.some(
                    (item) =>
                        item.id === comment.id
                );

                if (exists) {
                    return prevComments;
                }

                return [
                    ...prevComments,
                    comment
                ];

            });

        }


        // ------------------------------
        // UPDATED COMMENT
        // ------------------------------

        function handleCommentUpdated(comment) {

            if (
                comment.thread_id !== threadId
            ) {
                return;
            }


            setComments((prevComments) =>

                prevComments.map((item) =>

                    item.id === comment.id
                        ? comment
                        : item

                )

            );

        }


        // ------------------------------
        // DELETED COMMENT
        // ------------------------------

        function handleCommentDeleted(data) {

            if (
                data.thread_id !== threadId
            ) {
                return;
            }


            setComments((prevComments) =>

                prevComments.filter(
                    (item) =>
                        item.id !== data.id
                )

            );

        }


        // ------------------------------
        // THREAD DELETED
        // ------------------------------

        function handleThreadDeleted(data) {

            if (
                data.id !== threadId
            ) {
                return;
            }


            setThread(null);

            toast.error(
                "This discussion has been removed"
            );

        }


        // Register listeners

        socket.on(
            "comment:created",
            handleCommentCreated
        );

        socket.on(
            "comment:updated",
            handleCommentUpdated
        );

        socket.on(
            "comment:deleted",
            handleCommentDeleted
        );

        socket.on(
            "thread:deleted",
            handleThreadDeleted
        );


        // ==========================================
        // CLEANUP
        // ==========================================

        return () => {

            socket.emit(
                "leave:thread",
                threadId
            );


            socket.off(
                "comment:created",
                handleCommentCreated
            );

            socket.off(
                "comment:updated",
                handleCommentUpdated
            );

            socket.off(
                "comment:deleted",
                handleCommentDeleted
            );

            socket.off(
                "thread:deleted",
                handleThreadDeleted
            );

        };

    }, [threadId]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className={styles.status}>
                Loading discussion...
            </div>
        );

    }


    // ==========================================
    // THREAD NOT FOUND / DELETED
    // ==========================================

    if (!thread) {

        return (
            <div className={styles.status}>
                Thread not found or has been removed.
            </div>
        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className={styles.detailPage}>

            {/* AUTHOR */}

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


            {/* POST */}

            <h1 className={styles.detailTitle}>
                {thread.title}
            </h1>

            <p className={styles.detailContent}>
                {thread.content}
            </p>


            {/* COMMENTS */}

            <div className={styles.commentSection}>

                <h2 className={styles.sectionTitle}>
                    Discussion
                </h2>


                <CommentForm
                    threadId={threadId}
                    onCreated={loadThread}
                />


                <CommentList
                    comments={comments}
                    threadId={threadId}
                    onUpdated={loadThread}
                />

            </div>

        </div>

    );

}
