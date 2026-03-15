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
import DataHistory from './pages/DataHistory';
import Settings    from './pages/Settings';

import LandingPage from './pages/LandingPage';

import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const AuthLayout = ({ children }) => (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        {children}
    </div>
);

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="h-screen bg-background-light dark:bg-background-dark flex overflow-hidden relative">
            <Sidebar 
                className="shrink-0 h-full" 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 h-full">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

function AppRoutes() {
    const { token } = useAuth();
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            
            {/* Public/Root Route */}
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LandingPage />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-data" element={<AddEmissionPage />} />
                <Route path="/calculation-process" element={<CalculationProcess />} />
                <Route path="/quick-check" element={<QuickCheck />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/tips" element={<EcoTips />} />
                <Route path="/history" element={<DataHistory />} />
                <Route path="/leaderboard" element={<HallOfFame />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
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
