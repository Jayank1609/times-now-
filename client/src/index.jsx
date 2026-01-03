import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Button, Container, createTheme, ThemeProvider, Box, Link as MuiLink, Typography, GlobalStyles } from '@mui/material';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import About from './pages/About';
import Explore from './pages/Explore';
import Feedback from './pages/Feedback';
import SystemStatusBar from './components/SystemStatusBar';

function Nav() {
  const location = useLocation();
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: 'Analyze', path: '/analyze' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Feedback', path: '/feedback' },
    { label: 'About', path: '/about' }
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(3,4,10,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <Toolbar sx={{ gap: 2, maxWidth: '1400px', width: '100%', mx: 'auto', py: 1.5 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.5,
                background: 'linear-gradient(135deg, #e31837 0%, #8a3ffc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              NewsVerify Pro
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
              Times Square Command · Powered by AI
            </Typography>
          </Box>
        </Box>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              variant={isActive ? 'contained' : 'text'}
              color={isActive ? 'primary' : 'inherit'}
              sx={{
                fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                borderRadius: 999,
                px: 2.5
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Toolbar>
    </AppBar>
  );
}

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      h1: { fontWeight: 800, fontFamily: '"Georgia", serif' },
      h2: { fontWeight: 800, fontFamily: '"Georgia", serif' },
      h3: { fontWeight: 800, fontFamily: '"Georgia", serif' },
      h4: { fontWeight: 700, fontFamily: '"Georgia", serif' },
      h5: { fontWeight: 700, fontFamily: '"Georgia", serif' },
      h6: { fontWeight: 600, fontFamily: '"Georgia", serif' },
      body1: { fontFamily: '"Arial", sans-serif' },
      body2: { fontFamily: '"Arial", sans-serif' }
    },
    palette: {
      mode: 'light',
      primary: { main: '#e31837' },
      secondary: { main: '#8a3ffc' },
      background: { default: '#fafafa' }
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: { 
        styleOverrides: { 
          root: { 
            textTransform: 'none', 
            fontWeight: 600,
            borderRadius: 6
          } 
        } 
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 8
          }
        }
      }
    }
  });
  const backgroundGradients = {
    body: {
      backgroundColor: '#05060a',
      backgroundImage:
        'radial-gradient(circle at 20% 20%, rgba(227,24,55,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(138,63,252,0.12), transparent 45%)'
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={backgroundGradients} />
      <BrowserRouter>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Nav />
          <Container
            maxWidth="xl"
            sx={{
              mt: 3,
              mb: 8,
              flexGrow: 1,
              minHeight: 'calc(100vh - 200px)',
              position: 'relative'
            }}
          >
            <SystemStatusBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Container>
          <Box
            component="footer"
            sx={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              py: 3,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.8)',
              backgroundColor: 'rgba(3,4,10,0.95)'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              NewsVerify Pro · Professional News Analysis Platform
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Powered by Advanced AI & Machine Learning · Built for Professionals
            </Typography>
            <MuiLink href="/" color="inherit" underline="hover" sx={{ mt: 1, display: 'inline-block' }}>
              © 2025 · Crafted for Times Square precision
            </MuiLink>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
