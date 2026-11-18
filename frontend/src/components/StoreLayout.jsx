import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import StoreSidebar from './StoreSidebar';
import { useAuth } from '../context/AuthContext';

const tanpaSidebar = ['/login', '/register'];

export default function StoreLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sembunyi = tanpaSidebar.includes(location.pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="store-shell flex min-h-screen flex-col bg-[#f4f7fb]">
      <Navbar />

      {sembunyi ? (
        <main className="flex-1">
          <Outlet />
        </main>
      ) : (
        <div className="flex flex-1">
          {user && <StoreSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

          <main className="min-w-0 flex-1">
            {user && (
              <div className="border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <Menu className="h-4 w-4" /> Menu Dashboard
                </button>
              </div>
            )}
            <Outlet />
          </main>
        </div>
      )}

      <Footer />
    </div>
  );
}
