import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FloatingChatButton from './components/FloatingChatButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import News from './pages/News';
import Schemes from './pages/Schemes';
import Settings from './pages/Settings';
import { useState } from 'react';

function Layout({ children, showSidebar = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <main className="flex-1 min-w-0">{children}</main>
        {showSidebar && (
          <div className="hidden lg:block w-72 flex-shrink-0 border-l border-slate-200 dark:border-slate-700">
            <Sidebar open={true} onClose={() => setSidebarOpen(false)} />
          </div>
        )}
      </div>
      {!isChat && <FloatingChatButton />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #0F172A)',
            color: '#f1f5f9',
          },
          success: { iconTheme: { primary: '#3b82f6' } },
          error: { iconTheme: { primary: '#ef4444' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout showSidebar={false}><Login /></Layout>} />
            <Route path="/register" element={<Layout showSidebar={false}><Register /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/chat" element={<Layout showSidebar={false}><Chat /></Layout>} />
            <Route path="/news" element={<Layout><News /></Layout>} />
            <Route path="/schemes" element={<Layout><Schemes /></Layout>} />
            <Route path="/settings" element={<Layout showSidebar={false}><Settings /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
