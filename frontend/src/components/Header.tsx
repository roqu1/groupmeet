import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/auth/useLogout';
import { Button } from './ui/button';
import { LogOut, UserCircle, Loader2 } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isLoading: isLogoutLoading } = useLogout();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container-wrapper flex h-14 items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-primary/80 transition-colors">
          GroupMeet
        </Link>

        <nav>
          {isAuthLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isAuthenticated && currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hallo, {currentUser.firstName}!
              </span>
              <Link
                to="/profile"
                className="text-sm font-medium hover:text-primary flex items-center gap-1"
              >
                <UserCircle className="h-4 w-4" /> Profil
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLogoutLoading}
                aria-label="Abmelden"
              >
                {isLogoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Abmelden</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Anmelden</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Registrieren</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
