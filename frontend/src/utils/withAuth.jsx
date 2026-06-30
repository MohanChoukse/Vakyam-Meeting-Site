import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const { isAuthenticated, loading } = useContext(AuthContext);

        useEffect(() => {
            if (!loading && !isAuthenticated) {
                router("/auth");
            }
        }, [isAuthenticated, loading, router]);

        if (loading) {
            return (
                <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111', color: '#FCFCF9' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FACC15', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>
                        {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null; // Will redirect in useEffect
        }

        return <WrappedComponent {...props} />;
    }

    return AuthComponent;
}

export default withAuth;