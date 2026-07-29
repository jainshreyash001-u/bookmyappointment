import { Navigate, Outlet } from 'react-router-dom';

export default function AuthGuard() {
    const isAuthenticated = !!localStorage.getItem('token');
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
