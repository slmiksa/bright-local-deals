import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "./components/SplashScreen";
import OnboardingTour from "./components/OnboardingTour";
import Index from "./pages/Index";
import AdDetail from "./pages/AdDetail";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import FeaturedPage from "./pages/FeaturedPage";
import AddAdPage from "./pages/AddAdPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";
import BottomTabBar from "./components/BottomTabBar";
import ScrollToTop from "./components/ScrollToTop";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAds from "./pages/admin/AdminAds";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCities from "./pages/admin/AdminCities";
import AdminStats from "./pages/admin/AdminStats";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("lamha_opened")) return false;
    sessionStorage.setItem("lamha_opened", "1");
    return true;
  });
  const [showTour, setShowTour] = useState(() => {
    if (localStorage.getItem("lamha_tour_done")) return false;
    return true;
  });
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);
  const handleTourFinish = useCallback(() => {
    setShowTour(false);
    localStorage.setItem("lamha_tour_done", "1");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CityProvider>
            <Toaster />
            <Sonner />
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            {!showSplash && showTour && <OnboardingTour onFinish={handleTourFinish} />}
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/ad/:id" element={<AdDetail />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/featured" element={<FeaturedPage />} />
                <Route path="/add" element={<AddAdPage />} />
                <Route path="/support" element={<SupportPage />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="ads" element={<AdminAds />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="cities" element={<AdminCities />} />
                  <Route path="stats" element={<AdminStats />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomTabBar />
            </BrowserRouter>
          </CityProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
