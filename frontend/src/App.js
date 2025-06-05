
import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import Profile from './pages/Profile';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { checkAuth, authUser, onlineUsers } = useAuthStore()
  const { theme } = useThemeStore()
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    console.log(onlineUsers)
  }, [onlineUsers])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <div  >
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/" />} />

      </Routes>
    </div>
  );
}


export default App;
