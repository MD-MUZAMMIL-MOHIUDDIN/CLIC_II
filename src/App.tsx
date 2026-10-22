import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppSidebar } from './components/layout/AppSidebar';
import { ProtectedRoute } from './routes/RouteGuards';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CHCDiscoveryPage } from './pages/CHCDiscoveryPage';
import { MachineryHiringPage } from './pages/MachineryHiringPage';
import { LivestockShopPage } from './pages/LivestockShopPage';
import { ScientistsPage } from './pages/ScientistsPage';
import { BioInputAdvisorPage } from './pages/BioInputAdvisorPage';
import { KnowledgeCentrePage } from './pages/KnowledgeCentrePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ApplicationStatusPage } from './pages/ApplicationStatusPage';
import { ProfilePage } from './pages/ProfilePage';

// Dashboards
import { FarmerDashboard } from './pages/dashboards/FarmerDashboard';
import { CHCDashboard } from './pages/dashboards/CHCDashboard';
import { FMCDashboard } from './pages/dashboards/FMCDashboard';
import { LivestockShopDashboard } from './pages/dashboards/LivestockShopDashboard';
import { InputStoreDashboard } from './pages/dashboards/InputStoreDashboard';
import { ScientistDashboard } from './pages/dashboards/ScientistDashboard';
import { FacilitatorDashboard } from './pages/dashboards/FacilitatorDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

// Master Data Management Pages
import { LocationsPage } from './pages/locations/LocationsPage';
import { DropdownManagementPage } from './pages/dropdowns/DropdownManagementPage';
import { CropProblemsPage } from './pages/crops/CropProblemsPage';
import { ProblemManagementPage } from './pages/crops/ProblemManagementPage';
import { CropsPage } from './pages/crops/CropsPage';
import { UsersPage } from './pages/users/UsersPage';
import { RolesPage } from './pages/users/RolesPage';

function AppLayout() {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Public discovery and auth routes should never render the sidebar
  const publicRoutes = [
    '/',
    '/services',
    '/chc',
    '/machinery',
    '/livestock',
    '/scientists',
    '/bio-inputs',
    '/knowledge',
    '/login',
    '/register',
    '/application-status'
  ];

  const isPublicPage = publicRoutes.some(path =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  );

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  const getRoleDashboard = (role?: string) => {
    switch (role) {
      case 'Farmer': return '/farmer';
      case 'CHC': return '/chc-dashboard';
      case 'FMC': return '/fmc-dashboard';
      case 'LivestockShop': return '/livestock-shop';
      case 'Inputstore': return '/input-store';
      case 'Facilitator': return '/facilitator';
      case 'Admin': return '/admin';
      case 'superadmin': return '/superadmin';
      default: return '/farmer';
    }
  };

  const isAdminUser = currentUser?.role === 'Admin' || currentUser?.role === 'superadmin';

  return (
    <div className="h-screen flex flex-col bg-[#F7F8F2] text-[#202B24] font-sans antialiased overflow-hidden">
      <Navbar
        onToggleMobileSidebar={handleToggleSidebar}
        isSidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Admin Master Sidebar ONLY rendered for Admin and superadmin */}
        {isAdminUser && !isPublicPage && (
          <AppSidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col">
          <main className="flex-1">
            <Routes>
              {/* Root Route: If authenticated non-admin, automatically redirect to role dashboard */}
              <Route
                path="/"
                element={
                  currentUser && !isAdminUser ? (
                    <Navigate to={getRoleDashboard(currentUser.role)} replace />
                  ) : (
                    <HomePage />
                  )
                }
              />
              <Route path="/services" element={<CHCDiscoveryPage />} />
              <Route path="/chc" element={<CHCDiscoveryPage />} />
              <Route path="/machinery" element={<MachineryHiringPage />} />
              <Route path="/livestock" element={<LivestockShopPage />} />
              <Route path="/scientists" element={<ScientistsPage />} />
              <Route path="/bio-inputs" element={<BioInputAdvisorPage />} />
              <Route path="/knowledge" element={<KnowledgeCentrePage />} />

              {/* Authentication & Onboarding */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/application-status" element={<ApplicationStatusPage />} />

              {/* Protected Common Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Location Management Master CRUD Routes */}
              <Route
                path="/locations"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <LocationsPage defaultTab="state" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/states"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <LocationsPage defaultTab="state" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/districts"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <LocationsPage defaultTab="district" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/mandals"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <LocationsPage defaultTab="mandal" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/panchayats"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <LocationsPage defaultTab="panchayat" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/villages"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <LocationsPage defaultTab="village" />
                  </ProtectedRoute>
                }
              />

              {/* Dropdown Management CRUD Routes */}
              <Route
                path="/dropdown-management"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdown-management/ref-types"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdown-management/dropdowns"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="dropdowns" />
                  </ProtectedRoute>
                }
              />
              {/* Dropdown aliases */}
              <Route
                path="/dropdowns"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdowns/ref-types"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdowns/dropdowns"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="dropdowns" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdowns/items"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <DropdownManagementPage defaultTab="dropdowns" />
                  </ProtectedRoute>
                }
              />

              {/* Crop Master Routes */}
              <Route
                path="/crops"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <CropsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crops/list"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <CropsPage />
                  </ProtectedRoute>
                }
              />

              {/* Dedicated Crop Problems Master & Media Route */}
              <Route
                path="/crop-problems"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <CropProblemsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/problem-media"
                element={<Navigate to="/crop-problems" replace />}
              />
              <Route
                path="/diagnostic-atlas"
                element={<Navigate to="/crop-problems" replace />}
              />

              {/* Dedicated Crop Problem Management Route */}
              <Route
                path="/problem-management"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <ProblemManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* User Management Master CRUD Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <RolesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-management"
                element={<Navigate to="/users" replace />}
              />

              {/* Role-Specific Dashboards */}
              <Route
                path="/farmer"
                element={
                  <ProtectedRoute allowedRoles={['Farmer']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/*"
                element={
                  <ProtectedRoute allowedRoles={['Farmer']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chc-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CHC']}>
                    <CHCDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/fmc-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['FMC']}>
                    <FMCDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/livestock-shop"
                element={
                  <ProtectedRoute allowedRoles={['LivestockShop']}>
                    <LivestockShopDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/input-store"
                element={
                  <ProtectedRoute allowedRoles={['Inputstore']}>
                    <InputStoreDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/scientist"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <ScientistDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/facilitator"
                element={
                  <ProtectedRoute allowedRoles={['Facilitator']}>
                    <FacilitatorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'superadmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/superadmin"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <ToastProvider>
        <LocationProvider>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </LocationProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
