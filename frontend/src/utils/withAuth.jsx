import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent ) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        useEffect(() => {
            const isAuthenticated = () => {
                if(localStorage.getItem("token")) {
                    return true;
                } 
                return false;
            }

            if(!isAuthenticated()) {
                router("/auth")
            }
        }, [router])

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;