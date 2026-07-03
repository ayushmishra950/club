import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthSuccess() {
    const navigate = useNavigate();

  useEffect(() => {
    // Cookie se value nikalne ka helper function
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    // Backend domain config ke sath cookie delete karne ka helper function
    const deleteCookie = (name) => {
        // IMPORTANT: Backend me 'domain: localhost' hai, isliye delete karte waqt bhi exact match chahiye
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    };

    const cookieToken = getCookie("accessToken");
    const cookieUserData = getCookie("userData"); 

    if (cookieToken && cookieUserData) {
        try {
            // 1. Token ko string format me save kiya
            localStorage.setItem("accessToken", cookieToken);
            
            // 2. Cookie data URL-encoded ho jata hai stringify ke baad, use decode karke save kiya
            const decodedData = decodeURIComponent(cookieUserData);
            localStorage.setItem("user", decodedData);
            
            console.log("Token and User Data locked into localStorage.");

            // 3. Clear both cookies from localhost domain
            deleteCookie("accessToken");
            deleteCookie("userData");
            console.log("Cookies cleared from localhost.");

            // 4. Redirect to home
            navigate("/home");

        } catch (error) {
            console.error("Error processing cookie data:", error);
            navigate("/login?error=parsing_failed");
        }
    } else {
        navigate("/login?error=token_or_data_missing");
    }
}, [navigate]);



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-medium">Verifying security tokens, please wait...</p>
        </div>
    );
}
