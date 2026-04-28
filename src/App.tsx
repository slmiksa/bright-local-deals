import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { localStoragePersister } from "@/lib/queryPersister";
import { CityProvider } from "@/contexts/CityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index"; // Eager: home is the first screen
import BottomTabBar from "./components/BottomTabBar";
import ScrollToTop from "./components/ScrollToTop";
import GoogleAnalytics from "./components/GoogleAnalytics";
import ForceUpdateModal from "./components/ForceUpdateModal";
import { APP_VERSION, APP_STORE_URL, compareVersions } from "./lib/version";
import { isNative } from "./lib/capacitor";
import { supabase } from "./integrations/supabase/client";

// Lazy public pages — load on demand to keep initial bundle tiny
const AdDetail = lazy(() => import("./pages/AdDetail"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const AddAdPage = lazy(() => import("./pages/AddAdPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const FeaturedPage = lazy(() => import("./pages/FeaturedPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy popup/banner — not needed instantly
const PopupAd = lazy(() => import("./components/PopupAd"));
const AppStoreBanner = lazy(() => import("./components/AppStoreBanner"));

// Admin pages — fully lazy (regular users never need this code)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAds = lazy(() => import("./pages/admin/AdminAds"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCities = lazy(() => import("./pages/admin/AdminCities"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminCountdown = lazy(() => import("./pages/admin/AdminCountdown"));
const AdminTerms = lazy(() => import("./pages/admin/AdminTerms"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminRequestDetail = lazy(() => import("./pages/admin/AdminRequestDetail"));
const AdminPopupAds = lazy(() => import("./pages/admin/AdminPopupAds"));
const AdminBannerSlides = lazy(() => import("./pages/admin/AdminBannerSlides"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminAppVersion = lazy(() => import("./pages/admin/AdminAppVersion"));
const AdminGiveaways = lazy(() => import("./pages/admin/AdminGiveaways"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      networkMode: "offlineFirst",
    },
  },
});

// Tiny fallback — invisible to feel native (no flash)
const RouteFallback = () => <div style={{ minHeight: "100vh" }} />;

// Warm up the most-used routes after the home page is interactive
const preloadHotRoutes = () => {
  const idle = (cb: () => void) =>
    "requestIdleCallback" in window
      ? (window as any).requestIdleCallback(cb, { timeout: 2000 })
      : setTimeout(cb, 800);
  idle(() => {
    import("./pages/AdDetail");
    import("./pages/CategoryPage");
    import("./pages/GalleryPage");
    import("./pages/SearchPage");
    import("./pages/CategoriesPage");
  });
};

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("lamha_opened")) return false;
    sessionStorage.setItem("lamha_opened", "1");
    return true;
  });
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  const [forceUpdateData, setForceUpdateData] = useState<{ show: boolean; message: string; storeUrl: string }>({ show: false, message: "", storeUrl: "" });

  useEffect(() => {
    preloadHotRoutes();
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
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: localStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}>
        <TooltipProvider>
          <AuthProvider>
          <CityProvider>
            <Toaster />
            <Sonner />
            {forceUpdateData.show && <ForceUpdateModal message={forceUpdateData.message} storeUrl={forceUpdateData.storeUrl} />}
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            <BrowserRouter>
              <ScrollToTop />
              <GoogleAnalytics />
              <Suspense fallback={null}>
                <PopupAd />
              </Suspense>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                  <Route path="/ad/:id" element={<PageTransition><AdDetail /></PageTransition>} />
                  <Route path="/categories" element={<PageTransition><CategoriesPage /></PageTransition>} />
                  <Route path="/category/:id" element={<PageTransition><CategoryPage /></PageTransition>} />
                  <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
                  <Route path="/gallery/:adId" element={<PageTransition><GalleryPage /></PageTransition>} />
                  <Route path="/add" element={<PageTransition><AddAdPage /></PageTransition>} />
                  <Route path="/support" element={<PageTransition><SupportPage /></PageTransition>} />
                  <Route path="/partners" element={<PageTransition><PartnersPage /></PageTransition>} />
                  <Route path="/privacy" element={<PageTransition><TermsPage /></PageTransition>} />
                  <Route path="/featured" element={<PageTransition><FeaturedPage /></PageTransition>} />
                  <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />

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
                    <Route path="partners" element={<AdminPartners />} />
                    <Route path="app-version" element={<AdminAppVersion />} />
                    <Route path="giveaways" element={<AdminGiveaways />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BottomTabBar />
              <Suspense fallback={null}>
                <AppStoreBanner />
              </Suspense>
            </BrowserRouter>
          </CityProvider>
          </AuthProvider>
        </TooltipProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
