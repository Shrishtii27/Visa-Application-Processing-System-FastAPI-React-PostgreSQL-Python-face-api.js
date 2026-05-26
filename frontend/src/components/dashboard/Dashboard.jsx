import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#18246f]">Dashboard</h1>
        <p className="mt-4 text-slate-600">
          Welcome back, {user?.full_name || user?.email}!
        </p>
        
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="rounded-lg bg-[#22348f] px-6 py-2 text-white shadow-sm transition hover:bg-[#1b2d7b]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
