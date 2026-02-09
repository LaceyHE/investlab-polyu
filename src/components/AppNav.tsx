import { Link, useLocation } from "react-router-dom";
import { BookOpen, Route, FlaskConical, History, User } from "lucide-react";

const navItems = [
  { to: "/", icon: BookOpen, label: "Home" },
  { to: "/learning-path", icon: Route, label: "Learning Path" },
  { to: "/sandbox", icon: FlaskConical, label: "Sandbox" },
  { to: "/stress-tests", icon: History, label: "Stress Tests" },
];

const AppNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-warm">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg text-foreground">StrategyLab</span>
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

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
