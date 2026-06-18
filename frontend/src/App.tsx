import React from 'react';
import { useAuthStore } from './store/authStore';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';

export default function App() {
  const user = useAuthStore(s => s.user);
  return user ? <Dashboard /> : <AuthPage />;
}
