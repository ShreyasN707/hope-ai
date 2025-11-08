import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import Chat from './pages/Chat';
import History from './pages/History';
import AnalysisDetail from './pages/AnalysisDetail';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

// Public route that works for both authenticated and non-authenticated users
const PublicOrPrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  return token ? (
    <Layout>{children}</Layout>
  ) : (
    <PublicLayout>{children}</PublicLayout>
  );
};

function App() {
  const { token, setAuth } = useAuthStore();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && !token) {
      try {
        const user = JSON.parse(storedUser);
        setAuth(storedToken, user);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [token, setAuth]);

  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/analyze"
            element={
              <PublicOrPrivateRoute>
                <Analyze />
              </PublicOrPrivateRoute>
            }
          />
          
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Layout>
                  <Chat />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <Layout>
                  <History />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/history/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <AnalysisDetail />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
