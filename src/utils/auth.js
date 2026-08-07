export function getCurrentUser() {

    const token = localStorage.getItem("customerToken");


    if (!token) {
        return null;
    }


    try {

        const payload = token.split(".")[1];


        const decoded =
            JSON.parse(
                atob(payload)
            );


        return {
            id: decoded.sub,
            role: decoded.role,
            email: decoded.email
        };


    } catch (error) {

        console.error("Invalid token");

        return null;
    }
}