import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router";

import toast from "react-hot-toast";


import {
    getPtPackageTypes,
    purchasePtPackage,
    getCustomerPackages
}
from "./ptPackagesApi";


import styles from "./PTPackages.module.css";



export default function PTPackages(){


    const navigate = useNavigate();


    const [packages,setPackages] = useState([]);

    const [myPackages,setMyPackages] = useState([]);

    const [loading,setLoading] = useState(true);



    useEffect(()=>{

        loadData();

    },[]);




    async function loadData(){

        try{


            const available =
                await getPtPackageTypes();


            setPackages(available);



            const customerPackages =
                await getCustomerPackages();


            setMyPackages(customerPackages);



        }
        catch(error){


            toast.error(
                "Unable to load PT packages"
            );


        }
        finally{


            setLoading(false);


        }

    }





    async function purchase(type){


        try{


            await purchasePtPackage(type);



            toast.success(
                "PT Package purchased successfully"
            );


            loadData();



        }
        catch(error){


            toast.error(
                error.response?.data?.message ||
                "Purchase failed"
            );


        }

    }





    if(loading)

        return (

            <div className={styles.loading}>

                Loading PT Packages...

            </div>

        );





    return (

        <div className={styles.page}>


            <div className={styles.header}>


                <p className={styles.eyebrow}>
                    HyperScale Fitness Platform
                </p>


                <h1>
                    Personal Training
                </h1>



                <p className={styles.subtitle}>
                    Manage your PT sessions and packages.
                </p>


            </div>





            {/* MY PACKAGES */}


            <section>


                <h2>
                    My PT Packages
                </h2>



                {

                    myPackages.length === 0


                    ?


                    <div className={styles.emptyCard}>


                        <h3>
                            No PT Package
                        </h3>


                        <p>
                            Purchase a package to start
                            your personal training sessions.
                        </p>


                    </div>


                    :



                    <div className={styles.grid}>


                        {

                            myPackages.map(pkg=>(


                                <div
                                    key={pkg.id}
                                    className={styles.card}
                                >



                                    <div className={styles.sessions}>

                                        {pkg.packageType}

                                        <span>
                                            Sessions
                                        </span>


                                    </div>




                                    <p>

                                        Remaining:

                                        {

                                            pkg.sessionsTotal -
                                            pkg.sessionsUsed

                                        }

                                    </p>





                                    <p>

                                        Used:

                                        {pkg.sessionsUsed}

                                        /

                                        {pkg.sessionsTotal}


                                    </p>





                                    <span className={styles.status}>

                                        {pkg.status}

                                    </span>





                                    <button disabled>

                                        Book Session
                                        <br/>
                                        (Coming Soon)

                                    </button>



                                </div>


                            ))

                        }


                    </div>


                }


            </section>







            {/* AVAILABLE PACKAGES */}



            <section>


                <h2>
                    Available Packages
                </h2>



                <div className={styles.grid}>


                    {

                        packages.map(pkg=>(



                            <div

                                key={pkg.type}

                                className={styles.card}

                            >



                                <div className={styles.sessions}>

                                    {pkg.sessions}

                                    <span>
                                        Sessions
                                    </span>


                                </div>





                                <p>

                                    Personal training sessions
                                    with your trainer.

                                </p>





                                <button

                                    onClick={() =>
                                        purchase(pkg.type)
                                    }

                                >

                                    Purchase

                                </button>




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