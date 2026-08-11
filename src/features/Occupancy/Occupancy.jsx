import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import toast from "react-hot-toast";

import {
    checkIn,
    checkOut,
    getCurrentOccupancy
} from "./occupancyApi";

import {
    getCurrentMembership
} from "../Membership/membershipApi";

import styles from "./Occupancy.module.css";


export default function Occupancy() {


    const navigate = useNavigate();


    const [occupancy, setOccupancy] = useState(0);

    const [membership, setMembership] = useState(null);

    const [checkedIn, setCheckedIn] = useState(false);

    const [loading, setLoading] = useState(true);



    useEffect(() => {

        loadData();

    }, []);





    async function loadData() {

        try {


            const currentOccupancy =
                await getCurrentOccupancy();


            setOccupancy(
                currentOccupancy.currentOccupancy
            );



            const currentMembership =
                await getCurrentMembership();


            setMembership(currentMembership);



        }
        catch (error) {

            toast.error(
                "Unable to load occupancy data"
            );

        }
        finally {

            setLoading(false);

        }

    }





    async function handleCheckIn() {


        try {


            /*
             * customerId is taken from JWT by gateway
             * so backend should receive it through headers
             * in the future.
             *
             * Currently your DTO expects customerId.
             */


            await checkIn();


            setCheckedIn(true);


            toast.success(
                "Checked in successfully"
            );


            loadData();


        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Check in failed"
            );

        }

    }






    async function handleCheckOut() {


        try {


            await checkOut();


            setCheckedIn(false);


            toast.success(
                "Checked out successfully"
            );


            loadData();


        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Check out failed"
            );

        }

    }





    if (loading) {

        return (

            <div className={styles.page}>
                <h2>
                    Loading occupancy...
                </h2>
            </div>

        );

    }







    return (

        <div className={styles.page}>


            <div className={styles.container}>


                <div className={styles.header}>


                    <p className={styles.eyebrow}>
                        HyperScale Fitness Platform
                    </p>


                    <h1>
                        Gym Occupancy
                    </h1>


                    <p className={styles.subtitle}>
                        Manage your gym attendance.
                    </p>


                </div>





                <div className={styles.grid}>


                    <div className={styles.card}>


                        <p className={styles.label}>
                            Current Gym Occupancy
                        </p>


                        <h2 className={styles.number}>
                            {occupancy}
                        </h2>


                        <span>
                            Members inside gym
                        </span>


                    </div>





                    <div className={styles.card}>


                        <p className={styles.label}>
                            Your Status
                        </p>


                        {
                            checkedIn

                                ?

                                <h2 className={styles.inside}>
                                    Checked In
                                </h2>


                                :

                                <h2 className={styles.outside}>
                                    Checked Out
                                </h2>

                        }


                    </div>



                </div>





                {
                    membership?.status === "ACTIVE"

                        ?

                        <div className={styles.actionCard}>


                            <h2>
                                Gym Access
                            </h2>


                            <p>
                                Your membership allows you
                                to access the gym.
                            </p>



                            {
                                checkedIn

                                    ?

                                    <button
                                        onClick={handleCheckOut}
                                    >
                                        Check Out
                                    </button>


                                    :

                                    <button
                                        onClick={handleCheckIn}
                                    >
                                        Check In
                                    </button>

                            }


                        </div>


                        :

                        <div className={styles.actionCard}>


                            <h2>
                                Membership Required
                            </h2>


                            <p>
                                Subscribe to a membership
                                before using gym occupancy.
                            </p>


                            <button
                                className={styles.button}
                                onClick={() => navigate("/membership")}
                            >
                                View Plans
                            </button>


                        </div>


                }





                <button
                    className={styles.back}
                    onClick={() =>
                        navigate("/customerHomePage")
                    }
                >
                    ← Back Dashboard
                </button>



            </div>


        </div>

    );

}