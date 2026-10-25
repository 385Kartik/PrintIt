import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import AuthPage from './components/auth/AuthPage'; // Using 1st App component
import FileUploadForm from './components/FileUploadForm';
import LandingPage from './components/LandingPage';
import PricingPage from './components/PricingPage';
import ContactPage from './components/ContactPage';
import TokenPage from './components/TokenPage';
import SavingsPage from './components/SavingsPage';
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import RefundPage from './components/RefundPage';

// Logic/Services from 1st App
import { authService, type User } from './services/auth.service';
import { useOrdersStore } from './store/useOrdersStore';
import UserProfileModal from './components/UserProfileModal';
import OrdersPage from './components/OrdersPage.tsx';

function App() {
  // --- LOGIC FROM 1ST APP ---
  const navigate = useNavigate();
  const location = useLocation(); // Retained from 2nd app for UI logic (AiTutor check)
  
  const [user, setUser] = useState<User | null>(() => authService.getUser());
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const clearOrders = useOrdersStore((state) => state.clearOrders);
  
  // UI Logic from 2nd App (to determine if we block loading)
  const isAiTutorPage = location.pathname === "/ai-tutor";

  const fetchUserData = useCallback(async () => {
    try {
      setLoadingUser(true);
      const cachedUser = authService.getUser();
      const token = authService.getToken();
      
      if (!cachedUser || !token) {
        setUser(null);
        clearOrders();
        return;
      }

      // Skip backend verification - rely on localStorage and token expiration
      setUser(cachedUser);
      
      // Refresh token count in background using cache-first strategy
      authService.getTokensWithCache((freshTokenCount) => {
        setUser(prev => prev ? { ...prev, tokens: freshTokenCount } : null);
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      authService.logout();
      clearOrders();
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [clearOrders]);

  const refreshUserProfile = useCallback(async () => {
    const token = authService.getToken();
    if (!token) return;

    try {
      const profile = await authService.getProfile(token);
      setUser(profile.user);
      authService.saveUser(profile.user);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleProfileUpdate = async (phone: string, college: string) => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const updatedUser = await authService.updateProfile(token, { phone, college });
    setUser(updatedUser);
    authService.saveUser(updatedUser);
  };

  const handleLogout = async () => {
    authService.logout();
    setUser(null);
    clearOrders();
    navigate('/');
  };

  // --- NAVIGATION HANDLERS ---
  const handlePrimaryNavigation = () => {
    if (user) {
      navigate('/upload');
    } else {
      navigate('/auth');
    }
  };

  // Open profile modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => setIsProfileModalOpen(false);

  const handleNavigateHome = () => {
    navigate('/');
  };

  // --- LOADING SCREEN ---
  // Using 1st App logic (loadingUser) with 2nd App UI condition (!isAiTutorPage)
  if (loadingUser && !isAiTutorPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center">
          <video
            src="/Print-loader.mp4"
            className="w-[min(640px,90%)] h-auto rounded-xl shadow-lg"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="mt-6 text-black text-lg font-medium">
            Loading... Please wait
          </div>
        </div>
      </div>
    );
  }

  // --- UI / ROUTES FROM 2ND APP ---
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#000000',
            border: '1px solid #E5E7EB',
          },
        }}
      />
      
      {/* Centralized profile modal so header's user button only opens modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        user={user ? user : { name: '', email: '', phone: '', college: '', tokens: 0 }}
        onUpdate={handleProfileUpdate}
        onLogout={handleLogout}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={<LandingPage onGetStarted={handlePrimaryNavigation} onOpenProfile={openProfileModal} />}
        />
        <Route
          path="/pricing"
          element={<PricingPage onGetStarted={handlePrimaryNavigation} onOpenProfile={openProfileModal} />}
        />
        <Route
          path="/contact"
          element={<ContactPage onGetStarted={handlePrimaryNavigation} onOpenProfile={openProfileModal} />}
        />
        
        {/* Extra Pages from 2nd App */}
        <Route 
          path="/savings" 
          element={<SavingsPage onGoBack={handleNavigateHome} onOpenProfile={openProfileModal} />} 
        />
        <Route 
          path="/about" 
          element={<AboutPage onGoBack={handleNavigateHome} onOpenProfile={openProfileModal} />} 
        />
        <Route 
          path="/privacy" 
          element={<PrivacyPage onGoBack={handleNavigateHome} onOpenProfile={openProfileModal} />} 
        />
        <Route 
          path="/terms" 
          element={<TermsPage onGoBack={handleNavigateHome} onOpenProfile={openProfileModal} />} 
        />
        <Route 
          path="/refund-policy" 
          element={<RefundPage onGoBack={handleNavigateHome} onOpenProfile={openProfileModal} />} 
        />
        <Route
          path="/tokens"
          element={
            <TokenPage 
              onGoBack={handleNavigateHome} 
              onOpenProfile={openProfileModal} 
            />
          }
        />

        {/* Auth Route - Using 1st App Logic (AuthPage) */}
        <Route
          path="/auth"
          element={
            !user ? (
              <AuthPage initialMode={(() => {
                const authModeParam = new URLSearchParams(location.search).get('mode');
                if (authModeParam === 'signup') return 'signup';
                if (authModeParam === 'login') return 'login';
                return undefined;
              })()} onAuthSuccess={(authUser) => {
                setUser(authUser);
                navigate('/upload');
              }} />
            ) : (
              <Navigate to="/upload" replace />
            )
          }
        />

        {/* Protected Upload - Using 1st App Logic Props */}
        <Route
          path="/upload"
          element={
            user ? (
              <FileUploadForm
                user={{
                  ...user,
                  phone: user.phone || '',
                  college: user.college || 'Universal College of Engineering',
                  isAdmin: false,
                }}
                onLogout={handleLogout}
                onNavigateHome={handleNavigateHome}
                onProfileUpdate={handleProfileUpdate}
                onRefreshUser={refreshUserProfile} // Included from 1st App logic
                onOpenProfile={openProfileModal}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/orders"
          element={
            user ? (
              <OrdersPage onGetStarted={handlePrimaryNavigation} onOpenProfile={openProfileModal} />
            ) : (
              <Navigate to="/auth?mode=login" replace />
            )
          }
        />
        
      </Routes>
    </>
  );
}

export default App;