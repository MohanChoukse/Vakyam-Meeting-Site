import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const router = useNavigate();
    const location = useLocation();

    const generateAvatar = (name) => {
        if (!name) return "";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111111&color=FCFCF9`;
    };

    const restoreSession = useCallback(() => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        const loginTime = localStorage.getItem("loginTime");

        if (token && userId && name) {
            try {
                // Ensure token is valid JWT structure before atob
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const isExpired = payload.exp * 1000 < Date.now();
                    
                    if (!isExpired) {
                        setUserData({ 
                            token, 
                            userId, 
                            name, 
                            email, 
                            loginTime,
                            avatar: generateAvatar(name)
                        });
                        setIsAuthenticated(true);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Session restore failed", e);
            }
        }
        
        // If we reach here, session is invalid or expired
        handleLogout(false);
        setLoading(false);
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    const handleLogout = useCallback((redirect = true) => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("loginTime");
        
        setUserData(null);
        setIsAuthenticated(false);
        
        if (redirect && location.pathname !== '/' && location.pathname !== '/auth') {
            router("/auth");
        }
    }, [router, location.pathname]);

    const handleLogin = useCallback(async (username, password) => {
        try {
            let request = await client.post("/login", {
                username,
                password
            });

            if (request.status === httpStatus.OK) {
                const { token, user } = request.data;
                const loginTime = Date.now().toString();

                localStorage.setItem("token", token);
                localStorage.setItem("userId", user.id || user._id);
                localStorage.setItem("name", user.name);
                localStorage.setItem("email", user.username); // backend uses username for email
                localStorage.setItem("loginTime", loginTime);

                setUserData({
                    token,
                    userId: user.id || user._id,
                    name: user.name,
                    email: user.username,
                    loginTime,
                    avatar: generateAvatar(user.name)
                });
                setIsAuthenticated(true);

                router("/home");
            }
        } catch (err) {
            throw err;
        }
    }, [router]);

    const handleRegister = useCallback(async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name,
                username,
                password
            });

            if (request.status === httpStatus.CREATED) {
                await handleLogin(username, password);
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }, [handleLogin]);

    const fetchCurrentUser = useCallback(() => {
        return userData;
    }, [userData]);

    const updateProfile = useCallback(async (updates) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");

            // Make API Call
            let request = await client.put("/profile", updates, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (request.data.success) {
                setUserData(prev => {
                    const updated = { ...prev, ...updates };
                    if (updates.name) {
                        localStorage.setItem("name", updates.name);
                        updated.avatar = generateAvatar(updates.name);
                    }
                    if (updates.email) {
                        localStorage.setItem("email", updates.email);
                    }
                    return updated;
                });
                return request.data;
            }
        } catch (err) {
            console.error("Profile update failed", err);
            throw err;
        }
    }, []);

    const isLoggedIn = useCallback(() => {
        return isAuthenticated;
    }, [isAuthenticated]);

    // Legacy functions kept for backward compatibility if any old components use them
    const getHistoryOfUser = useCallback(async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch (err) {
            if (err.response?.status === httpStatus.UNAUTHORIZED) {
                handleLogout();
            }
            throw err;
        }
    }, [handleLogout]);

    const addToUserHistory = useCallback(async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request;
        } catch (err) {
            if (err.response?.status === httpStatus.UNAUTHORIZED) {
                handleLogout();
            }
            throw err;
        }
    }, [handleLogout]);

    // Set up auto-logout when token expires
    useEffect(() => {
        if (userData?.token) {
            try {
                const parts = userData.token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const expTime = payload.exp * 1000;
                    const timeLeft = expTime - Date.now();

                    if (timeLeft <= 0) {
                        handleLogout();
                    } else {
                        const timer = setTimeout(() => {
                            handleLogout();
                        }, timeLeft);
                        return () => clearTimeout(timer);
                    }
                }
            } catch (e) {
                handleLogout();
            }
        }
    }, [userData, handleLogout]);

    const data = {
        userData,
        setUserData,
        isAuthenticated,
        loading,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
        restoreSession,
        fetchCurrentUser,
        updateProfile,
        isLoggedIn,
        // Legacy
        handleLogin,
        handleLogout,
        handleRegister,
        getHistoryOfUser,
        addToUserHistory
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
