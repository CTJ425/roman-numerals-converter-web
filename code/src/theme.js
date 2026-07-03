import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#6366f1' : '#4f46e5', // Indigo
        light: isDark ? '#818cf8' : '#6366f1',
        dark: isDark ? '#4f46e5' : '#3730a3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#10b981' : '#059669', // Emerald
        light: isDark ? '#34d399' : '#10b981',
        dark: isDark ? '#059669' : '#047857',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc', // Slate 900 / Slate 50
        paper: isDark ? '#1e293b' : '#ffffff', // Slate 800 / White
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      error: {
        main: '#ef4444', // Red 500
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h3: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
        background: isDark 
          ? 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)'
          : 'linear-gradient(to right, #4f46e5, #7c3aed, #db2777)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h4: {
        fontWeight: 700,
      },
      body1: {
        lineHeight: 1.6,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderRadius: 24,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark 
              ? '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
              : '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              transition: 'all 0.2s ease-in-out',
              backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
              '&:hover': {
                backgroundColor: isDark ? '#090d16' : '#e2e8f0',
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? '#090d16' : '#e2e8f0',
                boxShadow: isDark 
                  ? '0 0 0 4px rgba(99, 102, 241, 0.15)'
                  : '0 0 0 4px rgba(79, 70, 229, 0.12)',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
          },
        },
      },
    },
  });
};

const defaultTheme = getTheme('dark');
export default defaultTheme;
