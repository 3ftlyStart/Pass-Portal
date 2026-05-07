
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic2, 
  GraduationCap,
  History,
  Settings,
  Menu,
  X,
  Target as TargetIcon,
  User,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Reading', path: '/reading', icon: BookOpen },
    { name: 'Listening', path: '/listening', icon: Headphones },
    { name: 'Writing', path: '/writing', icon: PenTool },
    { name: 'Speaking', path: '/speaking', icon: Mic2 },
    { name: 'Mock Tests', path: '/mock-tests', icon: GraduationCap },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-100 h-20 flex items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center shadow-lg shadow-brand-navy/10 group">
            <span className="text-white font-bold text-xl transition-transform group-hover:scale-110">i</span>
          </div>
          <span className="text-xl font-bold text-brand-navy tracking-tight">ieHuddle</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm md:text-base",
                isActive 
                  ? 'bg-brand-navy text-white font-semibold shadow-md shadow-brand-navy/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
              )}
            >
              <Icon size={isActive ? 20 : 18} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-brand-navy")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-brand-navy">
        <Link to="/history" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-white hover:text-brand-navy rounded-xl transition-all group">
          <History size={18} className="group-hover:text-brand-navy" />
          History
        </Link>
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-white hover:text-brand-navy rounded-xl transition-all group">
          <Settings size={18} className="group-hover:text-brand-navy" />
          Settings
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent />
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-6 right-4 p-2 text-slate-400 hover:text-slate-600 lg:hidden"
              >
                <X size={24} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-base md:text-lg font-bold text-brand-navy truncate max-w-[150px] md:max-w-none">
              {navItems.find(n => n.path === location.pathname)?.name || 'ieHuddle'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative">
            <div className="hidden sm:flex items-center gap-2 bg-brand-sky/10 px-3 py-1.5 rounded-full border border-brand-sky/20">
              <TargetIcon size={14} className="text-brand-sky" />
              <span className="text-xs font-bold text-brand-navy">8.0</span>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors"
            >
              <img 
                src={user?.photoURL || "https://picsum.photos/seed/user1/64/64"} 
                alt="Avatar" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
              />
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800">{user?.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium">Standard Plan</p>
              </div>
            </motion.div>

            {/* User Menu Popover */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                      <p className="text-sm font-bold text-slate-800">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-slate-400">Standard Plan</p>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-sky/10 hover:text-brand-navy rounded-xl transition-all group"
                      >
                        <User size={18} className="text-slate-400 group-hover:text-brand-navy" />
                        Account Settings
                      </button>
                      <button 
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                      >
                        <LogOut size={18} className="text-rose-400 group-hover:text-rose-600" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
