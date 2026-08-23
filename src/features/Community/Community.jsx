import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    getAllThreads
} from "./communityApi";

import CreateThreadForm from "./components/CreateThreadForm";
import ThreadCard from "./components/ThreadCard";
import ThreadDetail from "./components/ThreadDetail";

import styles from "./Community.module.css";
import socket, { connectSocket } from "./socket";

export default function Community() {

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState(null);

    async function loadThreads() {

        try {

            setLoading(true);

            const response = await getAllThreads();

            setThreads(response.data);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to load community"
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        loadThreads();

    }, []);
    // 2. Real-time Socket.IO updates
    useEffect(() => {

        /*
         * App.jsx only attempts to connect at bundle load,
         * usually before login. Reconnect here so customers
         * receive live thread events (created/updated/deleted).
         * connectSocket is idempotent.
         */
        connectSocket();

        function threadCreated(thread) {

            setThreads(prev => {

                const exists = prev.some(
                    t => t.id === thread.id
                );

                if (exists) return prev;

                return [thread, ...prev];
            });

        }

        function threadUpdated(updatedThread) {

            setThreads(prev =>
                prev.map(thread =>
                    thread.id === updatedThread.id
                        ? updatedThread
                        : thread
                )
            );

        }

        function threadDeleted(data) {

            setThreads(prev =>
                prev.filter(
                    thread => thread.id !== data.id
                )
            );

        }

        socket.on(
            "thread:created",
            threadCreated
        );

        socket.on(
            "thread:updated",
            threadUpdated
        );

        socket.on(
            "thread:deleted",
            threadDeleted
        );

        return () => {

            socket.off(
                "thread:created",
                threadCreated
            );

            socket.off(
                "thread:updated",
                threadUpdated
            );

            socket.off(
                "thread:deleted",
                threadDeleted
            );

        };

    }, []);


    return (

        <div className={styles.communityPage}>

            {/* HEADER */}

            <div className={styles.header}>

                <div>

                    <p className={styles.eyebrow}>
                        GYM COMMUNITY
                    </p>

                    <h1 className={styles.title}>
                        Community
                    </h1>

                    <p className={styles.subtitle}>
                        Connect with other members, share your
                        progress and find your gym partners.
                    </p>

                </div>

            </div>


            {/* CREATE THREAD */}

            <CreateThreadForm
                onCreated={loadThreads}
            />


            {/* LOADING */}

            {loading && (

                <div className={styles.status}>
                    Loading community...
                </div>

            )}


            {/* EMPTY */}

            {!loading && threads.length === 0 && (

                <div className={styles.empty}>

                    <h3>
                        No posts yet
                    </h3>

                    <p>
                        Be the first member to start a conversation.
                    </p>

                </div>

            )}


            {/* FEED */}

            {!loading && threads.length > 0 && (

                <div className={styles.feed}>

                    {threads.map((thread) => (

                        <ThreadCard
                            key={thread.id}
                            thread={thread}
                            onDeleted={loadThreads}
                            onView={(id) =>
                                setSelectedThread(id)
                            }
                        />

                    ))}

                </div>

            )}


            {/* THREAD DETAIL */}

            {selectedThread && (

                <div className={styles.detailOverlay}>

                    <div className={styles.detailModal}>

                        <button
                            className={styles.closeBtn}
                            onClick={() =>
                                setSelectedThread(null)
                            }
                        >
                            ×
                        </button>

                        <ThreadDetail
                            threadId={selectedThread}
                        />

                    </div>

                </div>

            )}

        </div>

    );
}

