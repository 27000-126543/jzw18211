import { NavLink, useNavigate } from 'react-router-dom';
import {
  PawPrint,
  LayoutDashboard,
  Calendar,
  ImageUp,
  BarChart3,
  Settings,
  LogOut,
  Cat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import Button from '@/components/common/Button';

const menuItems = [
  { name: '工作台', path: '/provider/dashboard', icon: LayoutDashboard },
  { name: '预约日历', path: '/provider/calendar', icon: Calendar },
  { name: '待接宠物', path: '/provider/pets', icon: Cat },
  { name: '发布动态', path: '/provider/updates', icon: ImageUp },
  { name: '收入统计', path: '/provider/revenue', icon: BarChart3 },
  { name: '商家设置', path: '/provider/settings', icon: Settings },
];

export default function ProviderSidebar() {
  const navigate = useNavigate();
  const { currentUser, logout, providers } = useAppStore();

  const provider = currentUser?.providerId
    ? providers.find((p) => p.id === currentUser.providerId)
    : null;

  const businessName = provider?.name || currentUser?.name || '商家中心';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <NavLink to="/provider/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-float group-hover:scale-105 transition-transform">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{businessName}</p>
            <p className="text-xs text-gray-500">服务方管理中心</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-float'
                    : 'text-gray-600 hover:bg-cream-50 hover:text-brand-600'
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleLogout}
          className="justify-start text-gray-500 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </Button>
      </div>
    </aside>
  );
}
