import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/i18n";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import PublicLayout from "@/components/layout/PublicLayout";
import PortalLayout from "@/components/layout/PortalLayout";

// Client (B2B customer) self-serve area
import ClientLogin from "@/pages/client/ClientLogin";
import ClientResetPassword from "@/pages/client/ClientResetPassword";
import ClientLayout from "@/pages/client/ClientLayout";
import ClientOverview from "@/pages/client/ClientOverview";
import ClientRequests from "@/pages/client/ClientRequests";
import ClientInvoices from "@/pages/client/ClientInvoices";
import ClientNotifications from "@/pages/client/ClientNotifications";
import ClientRequestDetail from "@/pages/client/ClientRequestDetail";
import ClientDocuments from "@/pages/client/ClientDocuments";
import ClientProfile from "@/pages/client/ClientProfile";

import Home from "@/pages/public/Home";
import Contacts from "@/pages/public/Contacts";
import Calculator from "@/pages/public/Calculator";
import WasteDirectory from "@/pages/public/WasteDirectory";
import WasteCategory from "@/pages/public/WasteCategory";
import WasteCodePage from "@/pages/public/WasteCodePage";
import BlogIndex from "@/pages/public/BlogIndex";
import BlogArticle from "@/pages/public/BlogArticle";
import LegalPage from "@/pages/public/LegalPage";
import WasteContractSign from "@/pages/public/WasteContractSign";
import AdminLogin from "@/pages/auth/AdminLogin";
import Dashboard from "@/pages/portal/Dashboard";
import Companies from "@/pages/portal/Companies";
import Company360 from "@/pages/portal/Company360";
import Requests from "@/pages/portal/Requests";
import Operations from "@/pages/portal/Operations";
import Pricing from "@/pages/portal/Pricing";
import LicenseMatrix from "@/pages/portal/Licenses";
import Directory from "@/pages/portal/Directory";
import ObjectDetail from "@/pages/portal/ObjectDetail";
import CrmHub from "@/pages/portal/CrmHub";
import CrmTasks from "@/pages/portal/CrmTasks";
import CrmCalls from "@/pages/portal/CrmCalls";
import CrmInvoices from "@/pages/portal/CrmInvoices";
import CrmDocuments from "@/pages/portal/CrmDocuments";
import CrmNotifications from "@/pages/portal/CrmNotifications";
import MessageCenter from "@/pages/portal/MessageCenter";
import ActionCenter from "@/pages/portal/ActionCenter";
import Finance360 from "@/pages/portal/Finance360";
import Operations360 from "@/pages/portal/Operations360";
import ExecutiveCenter from "@/pages/portal/ExecutiveCenter";
import Contract360 from "@/pages/portal/Contract360";
import Deal360 from "@/pages/portal/Deal360";
import FilesManager from "@/pages/portal/FilesManager";
import Inquiries from "@/pages/portal/Inquiries";
import Settings from "@/pages/portal/Settings";
import Cabinet from "@/pages/manager/Cabinet";
import ManagerLeads from "@/pages/manager/Leads";
import ManagerDeals from "@/pages/manager/Deals";
import ManagerTasks from "@/pages/manager/Tasks";
import ManagerCalls from "@/pages/manager/Calls";
import Security from "@/pages/manager/Security";
import StaffCenter from "@/pages/admin/StaffCenter";
import Assignment from "@/pages/admin/Assignment";
import WasteCodesAdmin from "@/pages/admin/WasteCodesAdmin";
import RingostatAdmin from "@/pages/admin/RingostatAdmin";
import AdminFooterPage from "@/pages/admin/AdminFooterPage";
import AdminContactsPage from "@/pages/admin/AdminContactsPage";
import AdminInfoPage from "@/pages/admin/AdminInfoPage";
import AdminBlogPage from "@/pages/admin/AdminBlogPage";
import WasteLeads from "@/pages/portal/WasteLeads";

// Role-aware landing for /app: managers go straight to their personal cabinet,
// admins (and any other staff) see the operations dashboard.
function AppHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && String(user.role || "").toLowerCase() === "manager") {
    return <Navigate to="/app/cabinet" replace />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <ClientAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/waste" element={<WasteDirectory />} />
              <Route path="/waste/category/:key" element={<WasteCategory />} />
              <Route path="/waste-code/:slug" element={<WasteCodePage />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/terms" element={<LegalPage docKey="terms" />} />
              <Route path="/privacy" element={<LegalPage docKey="privacy" />} />
              <Route path="/cookies" element={<LegalPage docKey="cookies" />} />
            </Route>
            <Route path="/contract/:token" element={<WasteContractSign />} />
            {/* Unified staff login — the light /login screen is retired; everything
                routes through the dark /admin CRM console (admin + manager). */}
            <Route path="/login" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ── Client (B2B customer) self-serve area ── */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/reset-password" element={<ClientResetPassword />} />
            <Route path="/cabinet/reset-password" element={<ClientResetPassword />} />
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<ClientOverview />} />
              <Route path="requests" element={<ClientRequests />} />
              <Route path="invoices" element={<ClientInvoices />} />
              <Route path="messages" element={<ClientNotifications />} />
              <Route path="requests/:id" element={<ClientRequestDetail />} />
              <Route path="documents" element={<ClientDocuments />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>

            <Route path="/app" element={<PortalLayout />}>
            <Route index element={<AppHome />} />
            <Route path="cabinet" element={<Cabinet />} />
            <Route path="cabinet/leads" element={<ManagerLeads />} />
            <Route path="cabinet/deals" element={<ManagerDeals />} />
            <Route path="cabinet/tasks" element={<ManagerTasks />} />
            <Route path="cabinet/calls" element={<ManagerCalls />} />
            <Route path="cabinet/security" element={<Security />} />
            <Route path="staff" element={<StaffCenter />} />
            <Route path="staff/assignment" element={<Assignment />} />
            <Route path="waste-codes" element={<WasteCodesAdmin />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<Company360 />} />
            <Route path="leads" element={<WasteLeads />} />
            <Route path="objects/:id" element={<ObjectDetail />} />
            <Route path="requests" element={<Requests />} />
            <Route path="operations" element={<Operations />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/footer" element={<AdminFooterPage />} />
            <Route path="settings/contacts" element={<AdminContactsPage />} />
            <Route path="info" element={<AdminInfoPage />} />
            <Route path="info/:tab" element={<AdminInfoPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="licenses" element={<LicenseMatrix />} />
            <Route path="directory" element={<Directory />} />
            <Route path="crm" element={<CrmHub />} />
            <Route path="crm/tasks" element={<CrmTasks />} />
            <Route path="crm/calls" element={<CrmCalls />} />
            <Route path="crm/invoices" element={<CrmInvoices />} />
            <Route path="crm/documents" element={<CrmDocuments />} />
            <Route path="crm/notifications" element={<CrmNotifications />} />
            <Route path="crm/messages" element={<MessageCenter />} />
            <Route path="crm/actions" element={<ActionCenter />} />
            <Route path="finance" element={<Finance360 />} />
            <Route path="operations360" element={<Operations360 />} />
            <Route path="executive" element={<ExecutiveCenter />} />
            <Route path="contracts" element={<Contract360 />} />
            <Route path="cabinet/deals/:dealId" element={<Deal360 />} />
            <Route path="deals/:dealId" element={<Deal360 />} />
            <Route path="crm/files" element={<FilesManager />} />
            <Route path="ringostat" element={<RingostatAdmin />} />
            <Route path="crm/ringostat" element={<RingostatAdmin />} />
          </Route>
          {/* Catch-all: unknown paths → public home (avoids blank white screens) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
      </ClientAuthProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
