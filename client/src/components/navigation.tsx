import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, Coins, ChevronDown, Menu, X, LogOut, User, Settings } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Explore Events" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/rewards", label: "SP Rewards" },
    { href: "/testing", label: "Testing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-surface/80 backdrop-blur-lg border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Box className="text-primary text-2xl" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Starkverse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  location === item.href
                    ? "text-primary"
                    : "text-gray-300 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Points Display */}
            <div className="flex items-center space-x-2 bg-dark-card/50 rounded-lg px-3 py-1.5">
              <Coins className="text-accent h-4 w-4" />
              <span className="text-accent font-semibold">{user?.points?.toLocaleString() || 0}</span>
              <span className="text-gray-400 text-sm">SP</span>
            </div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm">
                    {user?.username || user?.firstName || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-dark-surface border-primary/20">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || "User"
                    }
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-400">{user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-primary/20">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-primary/20">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-2 py-2 rounded-lg transition-colors ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-gray-300 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
