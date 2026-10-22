import React from 'react';
import { Link } from 'react-router-dom';
import appConfigSeed from '../../data/app-config.json';
import { Phone, Mail, MapPin, ShieldCheck, HeartHandshake, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-900 text-cream-200 mt-20 border-t border-forest-800">
      {/* Upper Highlight Strip */}
      <div className="border-b border-forest-800/80 bg-forest-950/60 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-harvest">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-heading font-bold text-white">
                Empowering Indian Agriculture Through Mechanization & Science
              </h4>
              <p className="text-xs text-forest-300">
                Connected with Sub-Mission on Agricultural Mechanization (SMAM) & ICAR Knowledge Network.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-forest-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-agri-light" />
              <span>Verified CHC Centers</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-harvest" />
              <span>Direct Expert Consultations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        {/* Col 1: Platform Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-harvest font-bold text-xs tracking-wider">
              CLIC
            </div>
            <span className="font-heading font-extrabold text-lg text-white tracking-tight">CLIC</span>
          </div>
          <p className="text-forest-200 leading-relaxed max-w-sm">
            An integrated agricultural services and knowledge ecosystem uniting farmers, Custom Hiring Centres, farm machinery owners, livestock suppliers, and ICAR agricultural scientists.
          </p>
          <div className="space-y-2 pt-2 text-forest-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-harvest" />
              <span>Toll-Free Helpline: <strong>1800-180-1551</strong> (Kisan Call Centre)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-agri-light" />
              <span>{appConfigSeed.contact.email}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-earth-light shrink-0 mt-0.5" />
              <span>{appConfigSeed.contact.address}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Services */}
        <div>
          <h4 className="font-heading font-bold text-sm text-white mb-3">Agricultural Services</h4>
          <ul className="space-y-2.5 text-forest-300">
            <li><Link to="/chc" className="hover:text-white transition-colors">Custom Hiring Centres</Link></li>
            <li><Link to="/machinery" className="hover:text-white transition-colors">Farm Machinery Hiring</Link></li>
            <li><Link to="/livestock" className="hover:text-white transition-colors">Livestock & Feed Shop</Link></li>
            <li><Link to="/scientists" className="hover:text-white transition-colors">Consult Agri-Scientists</Link></li>
            <li><Link to="/bio-inputs" className="hover:text-white transition-colors">Bio-Input Advisor</Link></li>
          </ul>
        </div>

        {/* Col 3: Ecosystem Portals */}
        <div>
          <h4 className="font-heading font-bold text-sm text-white mb-3">Role Portals</h4>
          <ul className="space-y-2.5 text-forest-300">
            <li><Link to="/farmer" className="hover:text-white transition-colors">Farmer Dashboard</Link></li>
            <li><Link to="/chc-dashboard" className="hover:text-white transition-colors">CHC Centre Portal</Link></li>
            <li><Link to="/fmc-dashboard" className="hover:text-white transition-colors">Machinery Owner Hub</Link></li>
            <li><Link to="/livestock-shop" className="hover:text-white transition-colors">Livestock Shop Portal</Link></li>
            <li><Link to="/facilitator" className="hover:text-white transition-colors">Facilitator Verification Desk</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Administrative Console</Link></li>
          </ul>
        </div>

        {/* Col 4: Resources & Policies */}
        <div>
          <h4 className="font-heading font-bold text-sm text-white mb-3">Knowledge & Help</h4>
          <ul className="space-y-2.5 text-forest-300">
            <li><Link to="/knowledge" className="hover:text-white transition-colors">Knowledge Centre</Link></li>
            <li><Link to="/application-status" className="hover:text-white transition-colors">Check Application Status</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register as Provider</Link></li>
            <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert("Prototype Notice: All data is structured demo mock data."); }} className="hover:text-white transition-colors">Terms & Verification Policy</a></li>
            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Prototype Notice: Client-side prototype demonstration."); }} className="hover:text-white transition-colors">Privacy & Data Governance</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-forest-800 py-6 px-4 sm:px-8 text-center text-forest-400 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 KrishiSeva AgriTech Platform. All rights reserved.</p>
          <p className="text-forest-400 font-medium">
            Interactive Prototype Architecture • Modular TypeScript & ReactJS Services
          </p>
        </div>
      </div>
    </footer>
  );
};
