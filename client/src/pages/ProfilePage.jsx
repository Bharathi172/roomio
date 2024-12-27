import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext.jsx";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage.jsx";
import AccountNav from "../AccountNav.jsx";

export default function AccountPage() {
    const [redirect, setRedirect] = useState(false);
    const { ready, user, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    let { subpage } = useParams();
    if (subpage === undefined) {
        subpage = "profile";
    }

    async function logout() {
        await axios.post("/logout");
        setRedirect("/");
        setUser(null);
    }

    // Simulate loading for 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Show loading message for 2 seconds
    if (loading) {
        return "Loading...";
    }

    // If the user is not authenticated, redirect to login
    if (!user && !redirect) {
        return <Navigate to={"/login"} />;
    }

  
    if (redirect) {
        return <Navigate to={redirect} />;
    }

    return (
        <div>
            <AccountNav />
            {subpage === "profile" && (
                <div className="text-center max-w-lg mx-auto">
                    Logged in as {user.name} ({user.email})
                    <button onClick={logout} className="primary max-w-sm mt-2">
                        Logout
                    </button>
                </div>
            )}
            {subpage === "places" && (
                <div>
                    <PlacesPage />
                </div>
            )}
        </div>
    );
}
