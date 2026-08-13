import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const BASE = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user,         setUser]         = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token,        setToken]        = useState(localStorage.getItem('token') || null);
    const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || null);

    const login = (userToken, userData) => {
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setProfileImage(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('profileImage');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    const refreshProfile = useCallback(async (tkn) => {
        const t = tkn || token;
        if (!t) return;
        try {
            const res = await axios.get(`${BASE}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${t}` }
            });
            const img = res.data.profile_image || null;
            setProfileImage(img ? `${BASE}${img}` : null);
            if (img) localStorage.setItem('profileImage', `${BASE}${img}`);
        } catch (_) {}
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, profileImage, login, logout, updateUser, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
