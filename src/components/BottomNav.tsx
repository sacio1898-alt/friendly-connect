import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User, Package } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Grid3X3, label: ' Category', path: '/category' },
  { icon: ShoppingCart, label: 'Cart', path: '/cart' },
  { icon: Package, label: 'Order', path: '/orders' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 lg:hidden safe-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 flex-1 py-1.5">
              <Icon size={20} className={active ? 'text-primary' : 'text-muted-foreground'} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
