import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ScrollToTop from "./components/ScrollToTop";
import InAppBrowserDetect from "./components/InAppBrowserDetect";
import SupportFab from "./components/SupportFab";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import SupportPage from "./pages/SupportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Footer from "./components/Footer";

const UserLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
    <BottomNav />
    <SupportFab />
  </>
);

function AppRoutes() {
  const { userData, loading } = useAuth();
  const isAdmin = userData?.role === 'admin';

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<UserLayout><Index /></UserLayout>} />
      <Route path="/product/:id" element={<UserLayout><ProductPage /></UserLayout>} />
      <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
      <Route path="/checkout" element={<UserLayout><CheckoutPage /></UserLayout>} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="/orders" element={<UserLayout><OrderTrackingPage /></UserLayout>} />
      <Route path="/search" element={<UserLayout><SearchPage /></UserLayout>} />
      <Route path="/category" element={<UserLayout><CategoryPage /></UserLayout>} />
      <Route path="/category/:id" element={<UserLayout><CategoryPage /></UserLayout>} />
      <Route path="/profile" element={<UserLayout><ProfilePage /></UserLayout>} />
      <Route path="/support" element={<UserLayout><SupportPage /></UserLayout>} />
      <Route path="/privacy-policy" element={<UserLayout><PrivacyPage /></UserLayout>} />
      <Route path="/terms" element={<UserLayout><TermsPage /></UserLayout>} />
      <Route path="/return-policy" element={<UserLayout><ReturnPolicyPage /></UserLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <InAppBrowserDetect />
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
