import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const lightTheme = {
    mode: 'light',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#7f8c8d',
    primary: '#3498db',
    border: '#eee',
    error: 'red',
    statusBarStyle: 'dark',
};

export const darkTheme = {
    mode: 'dark',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b3b8',
    primary: '#3498db',
    border: '#333333',
    error: '#cf6679',
    statusBarStyle: 'light',
};

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const { users, updateUserProfile } = useUsers();

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [theme, setTheme] = useState(lightTheme);

    // Sync state with user profile
    useEffect(() => {
        if (user && users[user.uid]) {
            // If user has a preference, use it
            const userTheme = users[user.uid].theme;
            if (userTheme === 'dark') {
                setIsDarkMode(true);
            } else {
                setIsDarkMode(false);
            }
        } else {
            // No user or no profile loaded yet -> default to light
            // IMPT: If we just logged out, user becomes null, so we set light.
            setIsDarkMode(false);
        }
    }, [user, users]);

    // Update actual theme object when mode changes
    useEffect(() => {
        setTheme(isDarkMode ? darkTheme : lightTheme);
    }, [isDarkMode]);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        // Optimistic update
        setIsDarkMode(newMode);

        if (user) {
            try {
                // Save to Firestore
                await updateUserProfile(user.uid, { theme: newMode ? 'dark' : 'light' });
            } catch (error) {
                console.error("Failed to save theme preference:", error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
