import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useFirestoreData';
import TrustBadges from './TrustBadges';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="mt-10 border-t border-border px-4 py-8 pb-28 lg:pb-8 text-sm text-muted-foreground">
      <div className="max-w-screen-xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="mb-3">
            <img src="/icon.png" alt={settings.appName} className="h-8 max-w-[140px] object-contain" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
          </div>
          <p className="text-xs leading-relaxed">আপনার বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম।</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Quick Links</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/category" className="hover:text-primary transition-colors">Categories</Link></li>
            <li><Link to="/search" className="hover:text-primary transition-colors">Deals</Link></li>
            <li><Link to="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Policy</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Contact</h4>
          <ul className="space-y-1.5 text-xs">
            {settings.email && <li>{settings.email}</li>}
            {settings.phone && <li>{settings.phone}</li>}
            <li><Link to="/support" className="hover:text-primary transition-colors">Help Center</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs">&copy; {new Date().getFullYear()} {settings.appName}. All rights reserved.</p>
        <TrustBadges />
      </div>
    </footer>
  );
}
