// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Loader2 } from "lucide-react";

// export default function AuthSuccess() {
//     const navigate = useNavigate();

//   useEffect(() => {
//     const getCookie = (name) => {
//         const value = `; ${document.cookie}`;
//         const parts = value.split(`; ${name}=`);
//         if (parts.length === 2) return parts.pop().split(';').shift();
//         return null;
//     };

//     const deleteCookie = (name) => {
//         document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
//     };

//     const cookieToken = getCookie("accessToken");
//     const cookieUserData = getCookie("userData"); 

//     if (cookieToken && cookieUserData) {
//         try {
//             localStorage.setItem("accessToken", cookieToken);
            
//             const decodedData = decodeURIComponent(cookieUserData);
//             localStorage.setItem("user", decodedData);
            
//             console.log("Token and User Data locked into localStorage.");

//             deleteCookie("accessToken");
//             deleteCookie("userData");
//             console.log("Cookies cleared from localhost.");

//             navigate("/home");

//         } catch (error) {
//             console.error("Error processing cookie data:", error);
//             navigate("/login?error=parsing_failed");
//         }
//     } else {
//         navigate("/login?error=token_or_data_missing");
//     }
// }, [navigate]);



//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
//             <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
//             <p className="text-sm text-gray-500 font-medium">Verifying security tokens, please wait...</p>
//         </div>
//     );
// }











import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            // 1. Hash path se sirf query string wala part extract karein (jo ? ke baad hai)
            const hashPath = window.location.hash; // E.g., "#/auth-success?token=...&user=..."
            const queryIndex = hashPath.indexOf('?');

            if (queryIndex !== -1) {
                const queryString = hashPath.substring(queryIndex);
                const urlParams = new URLSearchParams(queryString);

                // 2. URL Parameters se value nikaalein
                const token = urlParams.get("token");
                const refreshToken = urlParams.get("refreshToken");
                const encodedUserData = urlParams.get("user");

                if (token && encodedUserData) {
                    // 3. LocalStorage me data lock karein
                    localStorage.setItem("accessToken", token);
                    
                    if (refreshToken) {
                        localStorage.setItem("refreshToken", refreshToken);
                    }

                    // Backend ne encodeURIComponent kiya tha, yahan decode karke parse karenge
                    const decodedData = decodeURIComponent(encodedUserData);
                    localStorage.setItem("user", decodedData);

                    console.log("Tokens and User Data locked into localStorage successfully!");

                    // 4. Clean redirection to dashboard/home
                    navigate("/home");
                    return;
                }
            }

            // Agar parameters missing hain toh login par pheinbkein
            console.error("Tokens or user data missing from redirect URL.");
            navigate("/login?error=token_or_data_missing");

        } catch (error) {
            console.error("Error processing URL parameters:", error);
            navigate("/login?error=parsing_failed");
        }
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-medium">Verifying security tokens, please wait...</p>
        </div>
    );
}

