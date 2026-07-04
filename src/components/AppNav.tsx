import { Link, useLocation } from "react-router-dom";
import { BookOpen, Route, FlaskConical, Compass, User, LogOut, TrendingUp, Network } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const navItems = [
  { to: "/", icon: BookOpen, label: "Home", hover: "hover:bg-[var(--accent-green)]" },
  { to: "/learning-path", icon: Route, label: "Learning Path", hover: "hover:bg-[var(--accent-violet)]" },
  { to: "/finsignal", icon: TrendingUp, label: "Market Literacy", hover: "hover:bg-[var(--accent-blue)]" },
  { to: "/causal-lab", icon: Network, label: "Causal Lab", hover: "hover:bg-[var(--accent-orange)]" },
  { to: "/sandbox", icon: FlaskConical, label: "Sandbox", hover: "hover:bg-[var(--accent-yellow)]" },
  { to: "/scenarios", icon: Compass, label: "Scenarios", hover: "hover:bg-[var(--accent-pink)]" },
  { to: "/account", icon: User, label: "Hub", hover: "hover:bg-[var(--accent-blue)]" },
];

const AppNav = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const initials = user?.user_metadata?.display_name
    ? (user.user_metadata.display_name as string).slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-foreground bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-foreground bg-accent shadow-[2px_2px_0_hsl(var(--foreground))]">
            <BookOpen className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-pixel text-xs text-foreground">InvestLab</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-none border-2 border-foreground px-2.5 py-1.5 text-sm font-semibold transition-all duration-100 ${
                  isActive
                    ? "translate-x-[2px] translate-y-[2px] bg-primary text-primary-foreground shadow-none"
                    : `bg-background text-foreground shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:text-black ${item.hover} hover:shadow-[1px_1px_0_hsl(var(--foreground))]`
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
              <Link to="/account" className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-foreground bg-accent text-xs font-bold text-accent-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                {initials}
              </Link>
              <button
                onClick={() => signOut()}
                className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-foreground bg-background text-foreground shadow-[2px_2px_0_hsl(var(--foreground))] transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-none border-2 border-foreground bg-primary px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[2px_2px_0_hsl(var(--foreground))] transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
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
