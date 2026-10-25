import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { UserRound, Menu, X, Upload, Package } from 'lucide-react';
import { authService, type User } from '../services/auth.service';

interface HeaderProps {
  onPrimaryAction: () => void;
  onUserAction?: () => void;
  isShopOpen?: boolean; 
}

const Header: React.FC<HeaderProps> = ({ 
  onPrimaryAction, 
  onUserAction,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isSignedIn = !!currentUser;
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleStorage = () => setCurrentUser(authService.getUser());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => {
        const user = authService.getUser();
        if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
            setCurrentUser(user);
        }
    }, 1000); 

    return () => {
        window.removeEventListener('storage', handleStorage);
        clearInterval(interval);
    };
  }, [currentUser]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/tokens', label: 'Tokens' },
    { path: '/savings', label: 'Savings' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const userLabel = currentUser?.name?.split(' ')[0] || 'Account';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/Logo.png" alt="logo" />
            </div>
            <span className="font-black text-xl tracking-tight text-black">
                Print<span className="text-green-400">It</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all duration-200 hover:text-[#00b894] ${
                    isActive ? 'text-black' : 'text-gray-500'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  to="/orders"
                  className="p-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                  title="Orders"
                >
                  <Package className="w-5 h-5" />
                </Link>
                <button
                  onClick={onUserAction}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 font-medium text-sm"
                >
                  <UserRound className="w-4 h-4" />
                  <span>{userLabel}</span>
                </button>
                
                {/* UPLOAD BUTTON - Always Open */}
                <button
                    onClick={onPrimaryAction}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-md font-semibold text-sm border bg-[#80ED99] text-black border-[#6DD687] hover:bg-[#6DD687] hover:-translate-y-0.5"
                >
                    <Upload className="w-4 h-4" />
                    Upload
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 font-semibold text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl font-semibold text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Buttons Group */}
          <div className="flex md:hidden items-center gap-2">
            {isSignedIn && (
                <Link to="/orders" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Package className="w-6 h-6" />
                </Link>
            )}
            <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl animate-fade-in-down h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col p-4 gap-2">
            
            {/* Mobile Nav Links */}
            <div className="space-y-1 mb-4">
                {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                    `flex items-center gap-3 text-base font-medium p-3 rounded-xl transition-colors ${
                        isActive ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50'
                    }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {item.label}
                </NavLink>
                ))}
            </div>

            <div className="h-px bg-gray-100 my-2" />
            
            {/* Mobile Actions */}
            {!isSignedIn ? (
              <div className="grid gap-3 mt-2">
                <Link
                  to="/auth?mode=signup"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  to="/auth?mode=login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-800 rounded-xl font-bold border border-gray-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
              </div>
            ) : (
                <div className="grid gap-3 mt-2">
                    <button
                        onClick={() => {
                            onUserAction?.();
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold border border-gray-100"
                    >
                        <UserRound className="w-5 h-5" />
                        My Profile
                    </button>
                    
                    {/* MOBILE UPLOAD BUTTON - Always Open */}
                    <button
                        onClick={() => {
                            onPrimaryAction();
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold shadow-md transition-all bg-[#80ED99] text-black active:scale-95"
                    >
                        Upload File
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
