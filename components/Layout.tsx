
import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
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
  LogOut,
  User as UserIcon,
  Crown,
  Library,
  Zap,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { Brand } from './Brand';
import WhatsAppWidget from './WhatsAppWidget';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Reading', path: '/reading', icon: BookOpen },
    { name: 'Listening', path: '/listening', icon: Headphones },
    { name: 'Practice Material', path: '/catalog', icon: Library },
    { name: 'Plans & Pricing', path: '/pricing', icon: Zap },
    { name: 'Writing', path: '/writing', icon: PenTool },
    { name: 'Speaking', path: '/speaking', icon: Mic2 },
    { name: 'Mock Tests', path: '/mock-tests', icon: GraduationCap },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-100 h-24 flex items-center shrink-0">
        <Link to="/">
          <Brand size={40} variant="primary" />
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm md:text-base",
                isActive 
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              )}
            >
              <Icon size={isActive ? 20 : 18} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-indigo-600")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Link to="/history" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-all group">
          <History size={18} className="group-hover:text-indigo-600" />
          History
        </Link>
        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-white hover:text-indigo-600 rounded-xl transition-all group">
          <Settings size={18} className="group-hover:text-indigo-600" />
          Profile Settings
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
            <h1 className="text-base md:text-lg font-bold text-slate-800 truncate max-w-[150px] md:max-w-none font-heading">
              {navItems.find(n => location.pathname === n.path || (n.path !== '/' && location.pathname.startsWith(n.path)))?.name || 'Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative">
            <Link to="/pricing" className="relative group">
              <motion.div 
                animate={(profile?.credits || 0) < 10 ? {
                  scale: [1, 1.05, 1],
                  backgroundColor: ['rgba(79, 70, 229, 0.05)', 'rgba(245, 158, 11, 0.1)', 'rgba(79, 70, 229, 0.05)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300",
                  (profile?.credits || 0) < 10 
                    ? "border-amber-200 bg-amber-50 shadow-sm shadow-amber-100" 
                    : "border-indigo-100/50 bg-indigo-50 hover:bg-indigo-100/50"
                )}
              >
                <div className="relative">
                  <Zap size={14} className={clsx(
                    (profile?.credits || 0) < 10 ? "text-amber-500 fill-amber-500" : "text-indigo-600 fill-indigo-600"
                  )} />
                  {(profile?.credits || 0) < 10 && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-amber-400 rounded-full blur-sm"
                    />
                  )}
                </div>
                <span className={clsx(
                  "text-xs font-black font-heading flex items-center gap-1",
                  (profile?.credits || 0) < 10 ? "text-amber-700" : "text-indigo-700"
                )}>
                  {profile?.credits || 0} 
                  <span className="text-[10px] font-bold opacity-70">CR</span>
                </span>
                
                {/* Tooltip for low credits */}
                {(profile?.credits || 0) < 10 && (
                  <div className="absolute top-full mt-2 right-0 bg-slate-900 text-white text-[10px] font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Low balance • Top up soon
                  </div>
                )}
              </motion.div>
            </Link>

            {profile?.targetScore && (
              <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50">
                <TargetIcon size={14} className="text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{profile.targetScore.toFixed(1)}</span>
              </div>
            )}
            
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 cursor-pointer p-1 pr-1 md:pr-3 rounded-full hover:bg-slate-50 transition-colors"
              >
                <img 
                  src={profile?.photoURL || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || 'User')}&background=random`} 
                  alt="Avatar" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 object-cover"
                />
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[100px] font-heading">
                    {profile?.displayName || user?.displayName || 'Member'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize flex items-center gap-1">
                    {profile?.role === 'admin' && <Crown size={10} className="text-amber-500" />}
                    {profile?.role === 'teacher' && 'Teacher'}
                    {profile?.role === 'student' && 'Student'}
                    {!profile?.role && 'Basic Plan'}
                  </p>
                </div>
              </motion.div>

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
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 py-2"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-sm font-bold text-slate-800 truncate font-heading">{profile?.displayName || user?.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{profile?.email || user?.email}</p>
                      </div>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <UserIcon size={16} />
                        Profile Settings
                      </Link>
                      
                      <Link 
                        to="/pricing" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Wallet size={16} />
                        Billing & Credits
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-50 mt-1"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
        <WhatsAppWidget />
      </main>
    </div>
  );
};

export default Layout;
