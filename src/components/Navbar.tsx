
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full px-margin py-md flex items-center justify-between border-b border-surface-variant bg-surface-container-lowest sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-xs text-primary hover:text-on-primary-fixed-variant transition-colors">
        <span className="material-symbols-outlined text-[24px]">local_library</span>
        <span className="font-title-sm text-title-sm">SmartLibrary</span>
      </Link>
      
      <div className="flex items-center gap-md">
        {user ? (
          <>
            <Link to="/books" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm">Catalog</Link>
            <Link to="/aria-planner" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm" style={{ fontWeight: 800, color: '#8b5cf6' }}>ARIA OS</Link>
            <Link to="/aria-intelligence" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm">PDF Intel</Link>
            <Link to="/campus-intel" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm">Campus Intel</Link>
            <Link to="/career-dna" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm">Career DNA</Link>
            <Link to="/my-books" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm">My Books</Link>
            {isAdmin && (
              <Link to="/admin" className="text-on-surface hover:text-primary transition-colors font-title-sm text-sm">Admin</Link>
            )}
            <div className="w-px h-6 bg-outline-variant mx-xs"></div>
            <span className="text-on-surface-variant font-body-base text-sm hidden sm:inline-block">Hi, {user.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};
