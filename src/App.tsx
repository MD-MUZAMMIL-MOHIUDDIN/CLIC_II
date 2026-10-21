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

  return (
    <div className="h-screen flex flex-col bg-[#F7F8F2] text-[#202B24] font-sans antialiased overflow-hidden">
      <Navbar
        onToggleMobileSidebar={handleToggleSidebar}
        isSidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar only rendered on authenticated portal / master / dashboard pages */}
        {currentUser && !isPublicPage && (
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
              {/* Public Discovery Routes */}
              <Route path="/" element={<HomePage />} />
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
                  <ProtectedRoute>
                    <LocationsPage defaultTab="state" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/states"
                element={
                  <ProtectedRoute>
                    <LocationsPage defaultTab="state" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/districts"
                element={
                  <ProtectedRoute>
                    <LocationsPage defaultTab="district" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/mandals"
                element={
                  <ProtectedRoute>
                    <LocationsPage defaultTab="mandal" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/panchayats"
                element={
                  <ProtectedRoute>
                    <LocationsPage defaultTab="panchayat" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/locations/villages"
                element={
                  <ProtectedRoute>
                    <LocationsPage defaultTab="village" />
                  </ProtectedRoute>
                }
              />

              {/* Dropdown Management CRUD Routes */}
              <Route
                path="/dropdown-management"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdown-management/ref-types"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdown-management/dropdowns"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="dropdowns" />
                  </ProtectedRoute>
                }
              />
              {/* Dropdown aliases */}
              <Route
                path="/dropdowns"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdowns/ref-types"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="ref-types" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdowns/dropdowns"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="dropdowns" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dropdowns/items"
                element={
                  <ProtectedRoute>
                    <DropdownManagementPage defaultTab="dropdowns" />
                  </ProtectedRoute>
                }
              />

              {/* Crop Master Routes */}
              <Route
                path="/crops"
                element={
                  <ProtectedRoute>
                    <CropsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crops/list"
                element={
                  <ProtectedRoute>
                    <CropsPage />
                  </ProtectedRoute>
                }
              />

              {/* Dedicated Crop Problems Master & Media Route */}
              <Route
                path="/crop-problems"
                element={
                  <ProtectedRoute>
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
                  <ProtectedRoute>
                    <ProblemManagementPage />
                  </ProtectedRoute>
                }
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
