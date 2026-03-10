import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddEmissionPage from './pages/AddEmissionPage';
import CalculationProcess from './pages/CalculationProcess';
import QuickCheck  from './pages/QuickCheck';
import Reports     from './pages/Reports';
import EcoTips     from './pages/EcoTips';
import HallOfFame  from './pages/HallOfFame';
import Profile     from './pages/Profile';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const AuthLayout = ({ children }) => (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        {children}
    </div>
);

const AppLayout = ({ children }) => (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <div className="neo-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Topbar />
            <main style={{ flex: 1, padding: '2rem' }}>
                {children}
            </main>
        </div>
    </div>
);

const PR = ({ page }) => (
    <ProtectedRoute><AppLayout>{page}</AppLayout></ProtectedRoute>
);

function AppRoutes() {
    const { token } = useAuth();
    return (
        <Routes>
            <Route path="/login"                element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register"             element={<AuthLayout><Register /></AuthLayout>} />
            <Route path="/"                     element={<Navigate to={token ? '/dashboard' : '/login'} />} />
            <Route path="/dashboard"            element={<PR page={<Dashboard />} />} />
            <Route path="/add-data"             element={<PR page={<AddEmissionPage />} />} />
            <Route path="/calculation-process"  element={<PR page={<CalculationProcess />} />} />
            <Route path="/quick-check"          element={<PR page={<QuickCheck />} />} />
            <Route path="/reports"              element={<PR page={<Reports />} />} />
            <Route path="/tips"                 element={<PR page={<EcoTips />} />} />
            <Route path="/leaderboard"          element={<PR page={<HallOfFame />} />} />
            <Route path="/profile"              element={<PR page={<Profile />} />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
