import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BuildingProvider } from "@/contexts/BuildingContext";
import { TenantProvider } from "@/contexts/TenantContext";
import LoginPage from "./pages/LoginPage";
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import RoomManagement from "./pages/landlord/RoomManagement";
import TenantManagement from "./pages/landlord/TenantManagement";
import InvoiceManagement from "./pages/landlord/InvoiceManagement";
import LandlordMore from "./pages/landlord/LandlordMore";
import ContractManagement from "./pages/landlord/ContractManagement";
import IncidentManagement from "./pages/landlord/IncidentManagement";
import NotificationManagement from "./pages/landlord/NotificationManagement";
import BuildingManagement from "./pages/landlord/BuildingManagement";
import SubscriptionPage from "./pages/landlord/SubscriptionPage";
import AssetManagement from "./pages/landlord/AssetManagement";
import FinanceManagement from "./pages/landlord/FinanceManagement";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantInvoices from "./pages/tenant/TenantInvoices";
import TenantIncidents from "./pages/tenant/TenantIncidents";
import TenantNotifications from "./pages/tenant/TenantNotifications";
import TenantProfile from "./pages/tenant/TenantProfile";
import TenantAssets from "./pages/tenant/TenantAssets";
import TenantMembers from "./pages/tenant/TenantMembers";
import TenantUsageHistory from "./pages/tenant/TenantUsageHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminRoles from "./pages/admin/AdminRoles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${user?.role}`} replace />} />

      {/* Landlord */}
      <Route path="/landlord" element={<LandlordDashboard />} />
      <Route path="/landlord/rooms" element={<RoomManagement />} />
      <Route path="/landlord/tenants" element={<TenantManagement />} />
      <Route path="/landlord/invoices" element={<InvoiceManagement />} />
      <Route path="/landlord/more" element={<LandlordMore />} />
      <Route path="/landlord/contracts" element={<ContractManagement />} />
      <Route path="/landlord/incidents" element={<IncidentManagement />} />
      <Route path="/landlord/notifications" element={<NotificationManagement />} />
      <Route path="/landlord/buildings" element={<BuildingManagement />} />
      <Route path="/landlord/subscription" element={<SubscriptionPage />} />
      <Route path="/landlord/assets" element={<AssetManagement />} />
      <Route path="/landlord/finance" element={<FinanceManagement />} />

      {/* Tenant */}
      <Route path="/tenant" element={<TenantDashboard />} />
      <Route path="/tenant/invoices" element={<TenantInvoices />} />
      <Route path="/tenant/incidents" element={<TenantIncidents />} />
      <Route path="/tenant/notifications" element={<TenantNotifications />} />
      <Route path="/tenant/profile" element={<TenantProfile />} />
      <Route path="/tenant/assets" element={<TenantAssets />} />
      <Route path="/tenant/members" element={<TenantMembers />} />
      <Route path="/tenant/usage" element={<TenantUsageHistory />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/packages" element={<AdminPackages />} />
      <Route path="/admin/roles" element={<AdminRoles />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BuildingProvider>
          <TenantProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TenantProvider>
        </BuildingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
