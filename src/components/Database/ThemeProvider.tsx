// ThemeProvider.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark'; // Only dark mode

interface ThemeContextType {
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme] = useState<Theme>('dark');

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};