import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthSuccess() {
    const navigate = useNavigate();

  useEffect(() => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    };

    const cookieToken = getCookie("accessToken");
    const cookieUserData = getCookie("userData"); 

    if (cookieToken && cookieUserData) {
        try {
            localStorage.setItem("accessToken", cookieToken);
            
            const decodedData = decodeURIComponent(cookieUserData);
            localStorage.setItem("user", decodedData);
            
            console.log("Token and User Data locked into localStorage.");

            deleteCookie("accessToken");
            deleteCookie("userData");
            console.log("Cookies cleared from localhost.");

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
