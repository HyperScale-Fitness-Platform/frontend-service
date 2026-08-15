import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import toast from "react-hot-toast";

import {
    getChatConnections
} from "./chatApi";

import styles from "./Chat.module.css";


export default function TrainerChats() {

    const navigate = useNavigate();

    const [connections, setConnections] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadConnections();

    }, []);


    async function loadConnections() {

        try {

            setLoading(true);

            const response =
                await getChatConnections();

            setConnections(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        }
        catch (error) {

            console.error(
                "CHAT CONNECTIONS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to load conversations"
            );

        }
        finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <div className={styles.page}>

                <div className={styles.status}>
                    Loading conversations...
                </div>

            </div>

        );

    }


    return (

        <div className={styles.page}>

            <div className={styles.chatContainer}>

                <header className={styles.header}>

                    <p className={styles.eyebrow}>
                        PERSONAL TRAINING
                    </p>

                    <h1 className={styles.title}>
                        My Trainees
                    </h1>

                    <p className={styles.subtitle}>
                        Chat with your personal training clients.
                    </p>

                </header>


                <div className={styles.connectionList}>

                    {connections.length === 0 ? (

                        <div className={styles.empty}>

                            <h3>
                                No trainees yet
                            </h3>

                            <p>
                                Customers who purchase a PT
                                package with you will appear here.
                            </p>

                        </div>

                    ) : (

                        connections.map(connection => (

                            <div
                                key={connection.other_user_id}
                                className={styles.connectionCard}
                            >

                                <div className={styles.profile}>

                                    {connection.photo_url ? (

                                        <img
                                            src={connection.photo_url}
                                            alt={connection.full_name}
                                            className={styles.profileImage}
                                        />

                                    ) : (

                                        <div
                                            className={
                                                styles.profilePlaceholder
                                            }
                                        >
                                            {connection.full_name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                        </div>

                                    )}


                                    <div className={styles.profileInfo}>

                                        <h3>
                                            {connection.full_name ||
                                                "Customer"}
                                        </h3>

                                        <p>
                                            Personal Training Client
                                        </p>

                                    </div>

                                </div>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/chat/${connection.other_user_id}`
                                        )
                                    }
                                >
                                    Open Chat
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>

    );

}