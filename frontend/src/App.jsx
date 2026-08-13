import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-inter overflow-hidden relative">
        {/* Full Screen Background Decorations */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.9 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center dark:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B]/80 via-[#1E293B]/60 to-eco-green/40 dark:from-[#0F172A] dark:via-[#0F172A]/90 dark:to-eco-green/30 transition-all duration-700" />
            <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.2] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            <motion.div 
                animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-eco-green/20 dark:bg-eco-green/15 rounded-full blur-[120px]" 
            />
            <motion.div 
                animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-analytics-blue/20 dark:bg-analytics-blue/15 rounded-full blur-[120px]" 
            />
        </div>
        <div className="relative z-10 w-full">
            {children}
        </div>
    </div>
);

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="h-screen bg-background-light dark:bg-background-dark flex overflow-hidden relative">
            
            {/* Premium Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-100">
                {/* Technical Grid */}
                <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Floating Animated Blobs */}
                <motion.div 
                    animate={{ 
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-eco-green/10 dark:bg-eco-green/5 rounded-full blur-[100px]" 
                />
                <motion.div 
                    animate={{ 
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-analytics-blue/10 dark:bg-analytics-blue/5 rounded-full blur-[100px]" 
                />
            </div>

            <Sidebar 
                className="shrink-0 h-full relative z-10" 
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

            <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
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
