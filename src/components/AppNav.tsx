import { Link, useLocation } from "react-router-dom";
import { BookOpen, Route, FlaskConical, Compass, User, LogOut, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: BookOpen, label: "Home" },
  { to: "/finsignal", icon: TrendingUp, label: "Market Literacy" },
  { to: "/learning-path", icon: Route, label: "Learning Path" },
  { to: "/sandbox", icon: FlaskConical, label: "Sandbox" },
  { to: "/scenarios", icon: Compass, label: "Scenarios" },
  { to: "/account", icon: User, label: "Hub" },
];

const AppNav = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const initials = user?.user_metadata?.display_name
    ? (user.user_metadata.display_name as string).slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg text-foreground">InvestLab</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/account" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </Link>
              <button
                onClick={() => signOut()}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
