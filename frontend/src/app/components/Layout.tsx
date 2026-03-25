import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Logo } from './logo';
import {
  Recycle,
  LayoutDashboard,
  Package,
  List,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType") || "recycler";
  const isRecycler = userType === "recycler";

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // Menús diferenciados por tipo de usuario
  const navItems = isRecycler ? [
    // Reciclador: Dashboard, Publicar, Perfil (NO Botellas)
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    { path: "/publish", icon: Package, label: "Publicar" },
    { path: "/profile", icon: User, label: "Perfil" },
  ] : [
    // Centro de Acopio: Dashboard, Botellas, Perfil (NO Publicar)
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    { path: "/bottles", icon: List, label: "Botellas" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2"
            >
              <Logo className="size-8" />
              <span className="text-xl font-semibold text-foreground">
                GreenScript Exchange
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={
                        isActive ? "bg-primary text-white" : ""
                      }
                    >
                      <Icon className="size-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="size-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <button
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-green-50"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}