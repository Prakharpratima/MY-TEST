import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
};

export default Home; 