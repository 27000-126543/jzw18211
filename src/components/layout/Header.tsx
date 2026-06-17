import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  PawPrint,
  Search,
  MessageCircle,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Shield,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';

const navLinks = [
  { name: '首页', path: '/', icon: PawPrint },
  { name: '找寄养', path: '/providers', icon: Search },
  { name: '消息', path: '/messages', icon: MessageCircle },
  { name: '我的订单', path: '/orders', icon: ShoppingBag },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAppStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'provider':
        return '/provider/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/user/profile';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-float group-hover:scale-105 transition-transform">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-forest-600 bg-clip-text text-transparent">
              萌宠寄养
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-cream-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {currentUser.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-500 transition-transform',
                      dropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-card border border-gray-100 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.phone}</p>
                    </div>

                    <Link
                      to="/user/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 hover:text-brand-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </Link>

                    {currentUser.role === 'provider' && (
                      <Link
                        to="/provider/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 hover:text-brand-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        服务方后台
                      </Link>
                    )}

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 hover:text-brand-600 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        管理员后台
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    登录
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-600 hover:bg-cream-50 hover:text-brand-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}

              {!currentUser && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2"
                >
                  <Button variant="primary" fullWidth>
                    登录 / 注册
                  </Button>
                </Link>
              )}

              {currentUser && (
                <div className="mt-2 space-y-1 pt-2 border-t border-gray-100">
                  <Link
                    to="/user/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-cream-50 hover:text-brand-600 transition-all"
                  >
                    <User className="w-5 h-5" />
                    个人中心
                  </Link>
                  {currentUser.role === 'provider' && (
                    <Link
                      to="/provider/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-cream-50 hover:text-brand-600 transition-all"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      服务方后台
                    </Link>
                  )}
                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-cream-50 hover:text-brand-600 transition-all"
                    >
                      <Shield className="w-5 h-5" />
                      管理员后台
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    退出登录
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
