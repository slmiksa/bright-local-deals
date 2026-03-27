import { useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import AdDetail from "./pages/AdDetail";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import GalleryPage from "./pages/GalleryPage";
import AddAdPage from "./pages/AddAdPage";
import SupportPage from "./pages/SupportPage";
import TermsPage from "./pages/TermsPage";
import FeaturedPage from "./pages/FeaturedPage";
import SearchPage from "./pages/SearchPage";
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
import AdminPricing from "./pages/admin/AdminPricing";
import AdminCountdown from "./pages/admin/AdminCountdown";
import AdminTerms from "./pages/admin/AdminTerms";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminRequestDetail from "./pages/admin/AdminRequestDetail";
import AdminPopupAds from "./pages/admin/AdminPopupAds";
import AdminBannerSlides from "./pages/admin/AdminBannerSlides";
import AdminSupport from "./pages/admin/AdminSupport";
import PopupAd from "./components/PopupAd";
import AppStoreBanner from "./components/AppStoreBanner";
import ForceUpdateModal from "./components/ForceUpdateModal";
import AdminAppVersion from "./pages/admin/AdminAppVersion";
import { APP_VERSION, APP_STORE_URL, compareVersions } from "./lib/version";
import { isNative } from "./lib/capacitor";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("lamha_opened")) return false;
    sessionStorage.setItem("lamha_opened", "1");
    return true;
  });
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  const [forceUpdateData, setForceUpdateData] = useState<{ show: boolean; message: string; storeUrl: string }>({ show: false, message: "", storeUrl: "" });

  useEffect(() => {
    if (!isNative) return;
    const checkVersion = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("min_required_version, update_message, force_update, store_url")
        .eq("id", "default")
        .single();
      if (data?.force_update && data.min_required_version) {
        if (compareVersions(APP_VERSION, data.min_required_version) < 0) {
          setForceUpdateData({
            show: true,
            message: data.update_message || "يرجى تحديث التطبيق",
            storeUrl: (data as any).store_url || APP_STORE_URL,
          });
        }
      }
    };
    checkVersion();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
          <CityProvider>
            <Toaster />
            <Sonner />
            {forceUpdateData.show && <ForceUpdateModal message={forceUpdateData.message} storeUrl={forceUpdateData.storeUrl} />}
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            <BrowserRouter>
              <ScrollToTop />
              <PopupAd />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/ad/:id" element={<AdDetail />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/add" element={<AddAdPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/privacy" element={<TermsPage />} />
                <Route path="/featured" element={<FeaturedPage />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="requests" element={<AdminRequests />} />
                  <Route path="requests/:id" element={<AdminRequestDetail />} />
                  <Route path="ads" element={<AdminAds />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="cities" element={<AdminCities />} />
                  <Route path="pricing" element={<AdminPricing />} />
                  <Route path="countdown" element={<AdminCountdown />} />
                  <Route path="stats" element={<AdminStats />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="privacy" element={<AdminTerms />} />
                  <Route path="popup-ads" element={<AdminPopupAds />} />
                  <Route path="banner-slides" element={<AdminBannerSlides />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="app-version" element={<AdminAppVersion />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomTabBar />
              <AppStoreBanner />
            </BrowserRouter>
          </CityProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
