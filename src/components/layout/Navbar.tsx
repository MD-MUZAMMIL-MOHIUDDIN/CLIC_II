import React, { useState, useEffect } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import notificationsSeed from '../../data/notifications.json';
import {
  MapPin,
  Bell,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Calendar,
  LogOut,
  Settings,
  Shield,
  Layers,
  Sparkles,
  PanelLeft,
  Store,
  Tractor,
  Wrench,
  Sprout,
  ShoppingBag,
  Users
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, isSidebarCollapsed = false }) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const isAdminUser = currentUser?.role === 'Admin' || currentUser?.role === 'superadmin';
  const { selectedDistrict, selectedState, availableStates, setSelectedState, setSelectedDistrict } = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [storesDropdownOpen, setStoresDropdownOpen] = useState(false);
  const [mobileStoresOpen, setMobileStoresOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const storeLinks = [
    {
      label: 'Custom Hiring Centres (CHC)',
      path: '/chc',
      desc: 'Farm equipment rentals & local service hubs',
      icon: Tractor,
      iconBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      label: 'Farm Machinery (FMC)',
      path: '/machinery',
      desc: 'Heavy machinery, harvesters & field implements',
      icon: Wrench,
      iconBg: 'bg-blue-100 text-blue-800'
    },
    {
      label: 'Agri Input Store',
      path: '/bio-inputs',
      desc: 'Certified seeds, bio-fertilizers & nutrition',
      icon: Sprout,
      iconBg: 'bg-amber-100 text-amber-800'
    },
    {
      label: 'Livestock Shop',
      path: '/livestock',
      desc: 'Cattle feed, breed care & veterinary supplies',
      icon: ShoppingBag,
      iconBg: 'bg-purple-100 text-purple-800'
    },
  ];

  const publicPaths = [
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

  const isPublicRoute = publicPaths.some(p => p === '/' ? routerLocation.pathname === '/' : routerLocation.pathname.startsWith(p));
  const isStoreActive = storeLinks.some(s => routerLocation.pathname === s.path || routerLocation.pathname.startsWith(s.path));

  const getDashboardRoute = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'Farmer':
        return '/farmer';
      case 'CHC':
        return '/chc-dashboard';
      case 'FMC':
        return '/fmc-dashboard';
      case 'LivestockShop':
        return '/livestock-shop';
      case 'Inputstore':
        return '/input-store';
      case 'Facilitator':
        return '/facilitator';
      case 'Admin':
        return '/admin';
      case 'superadmin':
        return '/superadmin';
      default:
        return '/farmer';
    }
  };

  const notifications = notificationsSeed.filter(n => !currentUser || n.userId === currentUser.id || n.type === 'weather');

  return (
    <>
      {/* Top Banner / Utility Bar */}
      <div className="bg-forest-900 text-cream-200 text-xs py-1.5 px-4 sm:px-8 border-b border-forest-800 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-harvest">
              <Sparkles className="w-3.5 h-3.5" />
              National Integrated AgriTech Ecosystem
            </span>
            <span className="hidden md:inline text-forest-300">|</span>
            <span className="hidden md:inline text-forest-200">
              Kisan Helpline: <strong className="text-white">1800-180-1551</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Location selector trigger */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-cream-100 hover:text-white bg-forest-800/80 hover:bg-forest-800 px-2.5 py-1 rounded-md transition-colors border border-forest-700"
            >
              <MapPin className="w-3.5 h-3.5 text-agri-light" />
              <span className="font-medium">{selectedDistrict}, {selectedState}</span>
              <ChevronDown className="w-3 h-3 text-forest-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`shrink-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-brand-border py-2.5'
            : 'bg-white border-b border-brand-border py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isAdminUser && !isPublicRoute && onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="p-2 text-forest-800 hover:bg-forest-50 rounded-xl border border-brand-border transition-colors mr-1"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label="Toggle Sidebar"
              >
                <PanelLeft className="w-5 h-5 text-forest-700" />
              </button>
            )}

            {/* Platform Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-subtle group-hover:bg-forest-700 transition-colors">
                <svg className="w-6 h-6 text-harvest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                  <path d="M12 8c-2 2-3 5-3 8"/>
                  <path d="M12 8c2 2 3 5 3 8"/>
                  <path d="M7 14c2-1 5-1 7 0"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-heading font-extrabold text-forest-900 tracking-tight">KrishiSeva</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-forest-100 text-forest-800">
                    AgriHub
                  </span>
                </div>
                <p className="text-[10.5px] text-brand-muted font-medium -mt-0.5 hidden sm:block">
                  Agricultural Services & Knowledge Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {!currentUser ? (
              /* Public / Guest Discovery Navigation */
              <>
                {/* Stores Group Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStoresDropdownOpen(!storesDropdownOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isStoreActive
                        ? 'bg-forest-50 text-forest-800'
                        : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                    }`}
                    aria-expanded={storesDropdownOpen}
                  >
                    <Store className="w-3.5 h-3.5 text-forest-600" />
                    <span>Stores</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${storesDropdownOpen ? 'rotate-180 text-forest-800' : 'text-brand-muted'}`} />
                  </button>

                  {storesDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setStoresDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-elevation border border-brand-border py-2 z-50 animate-slide-down">
                        <div className="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800">
                            Agricultural Stores & Hubs
                          </span>
                          <span className="text-[10px] text-brand-muted font-medium bg-cream-100 px-2 py-0.5 rounded-full">
                            4 Hubs
                          </span>
                        </div>

                        <div className="p-1.5 space-y-1">
                          {storeLinks.map((store) => {
                            const IconComponent = store.icon;
                            const isCurrent = routerLocation.pathname === store.path;
                            return (
                              <Link
                                key={store.path}
                                to={store.path}
                                onClick={() => setStoresDropdownOpen(false)}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                                  isCurrent
                                    ? 'bg-forest-50/80 border border-forest-200'
                                    : 'hover:bg-cream-50 border border-transparent'
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${store.iconBg} group-hover:scale-105 transition-transform`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold leading-tight ${isCurrent ? 'text-forest-800' : 'text-forest-900 group-hover:text-forest-700'}`}>
                                      {store.label}
                                    </span>
                                    {isCurrent && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-brand-muted mt-0.5 leading-snug line-clamp-1">
                                    {store.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link
                  to="/scientists"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    routerLocation.pathname === '/scientists'
                      ? 'bg-forest-50 text-forest-800'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  Consult Scientists
                </Link>

                <Link
                  to="/knowledge"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    routerLocation.pathname === '/knowledge'
                      ? 'bg-forest-50 text-forest-800'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  Knowledge Centre
                </Link>
              </>
            ) : !isAdminUser ? (
              /* Non-Admin Logged-In Roles (Farmer, CHC, FMC, LivestockShop, Inputstore, Facilitator) */
              /* Exclusively show My Dashboard and Profile Settings */
              <>
                <Link
                  to={getDashboardRoute()}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    routerLocation.pathname === getDashboardRoute()
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-forest-900 hover:bg-forest-50 bg-white border border-brand-border/80'
                  }`}
                >
                  <Layers className="w-4 h-4 text-harvest" />
                  <span>My Dashboard ({currentUser.role})</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    routerLocation.pathname === '/profile'
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-forest-900 hover:bg-forest-50 bg-white border border-brand-border/80'
                  }`}
                >
                  <User className="w-4 h-4 text-forest-600" />
                  <span>Profile Settings</span>
                </Link>

                {/* Village Ecosystem Context Indicator */}
                <div className="ml-2 pl-3 border-l border-brand-border hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-forest-800 bg-forest-50/80 px-2.5 py-1.5 rounded-lg border border-forest-200">
                  <MapPin className="w-3.5 h-3.5 text-forest-600" />
                  <span>{currentUser.location?.village || 'Kanadia'}, {currentUser.location?.district || 'Indore'}</span>
                  <span className="text-forest-300">•</span>
                  <span className="font-bold text-forest-900">{currentUser.organizationName || currentUser.role}</span>
                </div>
              </>
            ) : (
              /* Admin and SuperAdmin Master Navigation */
              <>
                <Link
                  to={currentUser.role === 'superadmin' ? '/superadmin' : '/admin'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    routerLocation.pathname.startsWith('/admin') || routerLocation.pathname.startsWith('/superadmin')
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </Link>

                <Link
                  to="/locations"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    routerLocation.pathname.startsWith('/locations')
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locations Master</span>
                </Link>

                <Link
                  to="/dropdown-management"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    routerLocation.pathname.startsWith('/dropdown')
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Dropdowns</span>
                </Link>

                <Link
                  to="/users"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    routerLocation.pathname.startsWith('/users') || routerLocation.pathname.startsWith('/roles')
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users & Roles</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    routerLocation.pathname === '/profile'
                      ? 'bg-forest-600 text-white shadow-subtle'
                      : 'text-brand-text hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => navigate('/services')}
              className="p-2 text-brand-muted hover:text-forest-800 hover:bg-cream-100 rounded-lg transition-colors"
              title="Search Services"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-brand-muted hover:text-forest-800 hover:bg-cream-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-harvest-dark animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-harvest-dark" />
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-elevation border border-brand-border py-2 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                      <h4 className="font-heading font-bold text-sm text-forest-900">Notifications & Advisories</h4>
                      <span className="text-[11px] font-semibold text-agri bg-agri-light/20 px-2 py-0.5 rounded-full">
                        {notifications.length} New
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-cream-200">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-cream-50 transition-colors">
                          <p className="text-xs font-semibold text-forest-900">{n.title}</p>
                          <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-brand-muted/70 mt-1 block">Just now</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-brand-border text-center bg-cream-50">
                      <Link
                        to="/farmer"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-semibold text-forest-700 hover:text-forest-900"
                      >
                        View All Alerts
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile or Sign In CTA */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="relative p-0.5 rounded-full border-2 border-transparent hover:border-forest-600 focus:outline-none transition-all group shrink-0"
                  title={`${currentUser.fullName} (${currentUser.role})`}
                  aria-label="User Account Menu"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 aspect-square border border-brand-border shadow-xs group-hover:scale-105 transition-transform">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white shrink-0 pointer-events-none" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevation border border-brand-border py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2.5 border-b border-brand-border bg-cream-50">
                        <p className="text-xs font-bold text-forest-900">{currentUser.fullName}</p>
                        <p className="text-[11px] text-brand-muted truncate">{currentUser.email}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-800">
                            {currentUser.role}
                          </span>
                          <span className="text-[10px] text-brand-muted">
                            {currentUser.location.district}, {currentUser.location.state}
                          </span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to={getDashboardRoute()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-forest-50 text-forest-900 font-semibold"
                        >
                          <Layers className="w-4 h-4 text-forest-600" />
                          My Dashboard ({currentUser.role})
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-forest-50 text-forest-900 font-semibold"
                        >
                          <User className="w-4 h-4 text-forest-600" />
                          Profile Settings
                        </Link>
                        {isAdminUser && (
                          <div className="pt-1 border-t border-brand-border/60 mt-1">
                            <div className="px-4 py-1 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                              Admin Master Data
                            </div>
                            <Link
                              to="/locations"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-forest-50 text-brand-text text-[11px]"
                            >
                              <MapPin className="w-3.5 h-3.5 text-forest-600" />
                              Locations Master
                            </Link>
                            <Link
                              to="/dropdown-management"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-forest-50 text-brand-text text-[11px]"
                            >
                              <Settings className="w-3.5 h-3.5 text-forest-600" />
                              Dropdown Management
                            </Link>
                            <Link
                              to="/users"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-forest-50 text-brand-text text-[11px]"
                            >
                              <Users className="w-3.5 h-3.5 text-forest-600" />
                              Users & Credentials
                            </Link>
                            <Link
                              to="/roles"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-forest-50 text-brand-text text-[11px]"
                            >
                              <Shield className="w-3.5 h-3.5 text-forest-600" />
                              Roles & Permissions
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-brand-border pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-brand-error hover:bg-rose-50 text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-forest-800 hover:text-forest-900 rounded-lg hover:bg-forest-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-lg shadow-subtle transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-brand-text hover:bg-cream-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-elevation p-6 flex flex-col z-50 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <span className="font-heading font-bold text-lg text-forest-900">KrishiSeva Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              {currentUser && !isAdminUser ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-forest-50/80 rounded-2xl border border-forest-200">
                    <div className="text-xs font-bold text-forest-900">{currentUser.fullName}</div>
                    <div className="text-[11px] text-brand-muted">{currentUser.email}</div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-forest-800 bg-white/80 px-2 py-1 rounded-lg border border-forest-100">
                      <MapPin className="w-3.5 h-3.5 text-forest-600" />
                      <span>{currentUser.location?.village || 'Kanadia'}, {currentUser.location?.district || 'Indore'}</span>
                      <span className="text-forest-400">•</span>
                      <span className="font-bold text-forest-900">{currentUser.role}</span>
                    </div>
                  </div>

                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      routerLocation.pathname === getDashboardRoute()
                        ? 'bg-forest-600 text-white shadow-subtle'
                        : 'text-forest-900 bg-cream-50 hover:bg-forest-50 border border-brand-border/60'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>My Dashboard ({currentUser.role})</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      routerLocation.pathname === '/profile'
                        ? 'bg-forest-600 text-white shadow-subtle'
                        : 'text-forest-900 bg-cream-50 hover:bg-forest-50 border border-brand-border/60'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Stores Accordion */}
                  <div className="border border-brand-border/70 rounded-xl overflow-hidden bg-cream-50/50 my-1.5">
                    <button
                      type="button"
                      onClick={() => setMobileStoresOpen(!mobileStoresOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-forest-900 hover:bg-cream-100 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-forest-600" />
                        Stores & Hubs
                      </span>
                      <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${mobileStoresOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {mobileStoresOpen && (
                      <div className="px-2 pb-2 pt-1 space-y-1 bg-white border-t border-brand-border/40">
                        {storeLinks.map((store) => {
                          const IconComponent = store.icon;
                          const isCurrent = routerLocation.pathname === store.path;
                          return (
                            <Link
                              key={store.path}
                              to={store.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                isCurrent
                                  ? 'bg-forest-50 text-forest-800 font-bold'
                                  : 'text-brand-text hover:bg-cream-100'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${store.iconBg}`}>
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <span>{store.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/scientists"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      routerLocation.pathname === '/scientists'
                        ? 'bg-forest-50 text-forest-800'
                        : 'text-brand-text hover:bg-cream-100'
                    }`}
                  >
                    Consult Scientists
                  </Link>

                  <Link
                    to="/knowledge"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      routerLocation.pathname === '/knowledge'
                        ? 'bg-forest-50 text-forest-800'
                        : 'text-brand-text hover:bg-cream-100'
                    }`}
                  >
                    Knowledge Centre
                  </Link>
                </>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-brand-border space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-600 text-white font-semibold text-sm shadow-subtle hover:bg-forest-700 transition-colors"
                  >
                    Go to My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-200 text-rose-700 font-medium text-xs hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-600 text-white font-semibold text-sm shadow-subtle hover:bg-forest-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/application-status"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-2 rounded-xl border border-brand-border text-brand-text font-medium text-xs hover:bg-cream-50"
                  >
                    Check Application Status
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-elevation border border-brand-border p-6 max-w-md w-full animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-forest-600" />
                <h3 className="font-heading font-bold text-base text-forest-900">Select Service Region</h3>
              </div>
              <button onClick={() => setLocationModalOpen(false)} className="text-brand-muted hover:text-brand-text p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              Services, Custom Hiring Centres, and bio-input availability will be dynamically tailored to your chosen agricultural district.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white shadow-subtle transition-colors"
              >
                Apply Region
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
