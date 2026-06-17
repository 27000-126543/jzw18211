import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  Building2,
  User as UserIcon,
  ArrowRight,
  Heart,
  Star,
  PawPrint,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { User, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';

type TabType = 'owner' | 'provider' | 'admin';

const tabConfigs: { value: TabType; label: string; icon: typeof UserIcon; desc: string }[] = [
  { value: 'owner', label: '宠物主登录', icon: UserIcon, desc: '寻找寄养服务' },
  { value: 'provider', label: '服务方入驻', icon: Building2, desc: '开启宠物事业' },
  { value: 'admin', label: '管理员登录', icon: ShieldCheck, desc: '平台管理后台' },
];

const features = [
  { icon: ShieldCheck, text: '实名认证，安全保障' },
  { icon: Star, text: '海量商家，精挑细选' },
  { icon: Heart, text: '用心服务，全程陪伴' },
  { icon: PawPrint, text: '宠物友好，专业照顾' },
];

export default function Login() {
  const navigate = useNavigate();
  const { users, login } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('owner');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePhone = () => {
    if (!phone) {
      setPhoneError('请输入手机号');
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneError('请输入正确的手机号');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendCode = () => {
    if (!validatePhone()) return;
    setCountdown(60);
  };

  const handleLogin = () => {
    let valid = true;
    if (!validatePhone()) valid = false;
    if (!code) {
      setCodeError('请输入验证码');
      valid = false;
    } else if (code.length < 4) {
      setCodeError('验证码格式不正确');
      valid = false;
    } else {
      setCodeError('');
    }
    if (!valid) return;

    setLoading(true);
    setTimeout(() => {
      const mockUser = users.find((u) => u.role === activeTab);
      if (mockUser) {
        login(mockUser.id);
        redirectByRole(mockUser);
      }
      setLoading(false);
    }, 800);
  };

  const handleQuickLogin = (user: User) => {
    login(user.id);
    redirectByRole(user);
  };

  const redirectByRole = (user: User) => {
    switch (user.role) {
      case 'owner':
        navigate('/');
        break;
      case 'provider':
        navigate('/provider/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const quickUsers = users.filter((u) => u.role === activeTab);
  const activeConfig = tabConfigs.find((t) => t.value === activeTab)!;

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-forest-700/90 via-forest-600/85 to-brand-500/80" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-12 group">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <PawPrint className="w-6 h-6 text-brand-500" />
              </div>
              <span className="text-2xl font-bold text-white">萌宠寄养</span>
            </Link>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              欢迎来到
              <br />
              <span className="bg-gradient-to-r from-brand-200 to-white bg-clip-text text-transparent">
                毛孩子的温馨家园
              </span>
            </h1>

            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
              {activeTab === 'owner' &&
                '为您的爱宠找到最贴心的寄养服务，让每一次出行都安心无忧。'}
              {activeTab === 'provider' &&
                '加入我们，开启您的宠物服务事业，让更多毛孩子享受专业的照顾。'}
              {activeTab === 'admin' &&
                '平台管理后台，审核商家、处理订单、保障服务质量。'}
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.text}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-brand-200" />
                    </div>
                    <span className="text-sm text-white/90">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&q=80',
                  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80',
                  'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=100&q=80',
                  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100&q=80',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-12 h-12 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-4 h-4 fill-amber-300 text-amber-300" />
                  ))}
                </div>
                <p className="text-sm text-white/80">
                  10,000+ 宠主和商家的共同选择
                </p>
              </div>
            </div>

            <blockquote className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <p className="text-white/90 italic text-sm leading-relaxed mb-3">
                "每次出差都把豆豆放在温馨宠物之家，每天都能收到照片视频，
                比我自己在家照顾得还好！真的特别放心。"
              </p>
              <p className="text-xs text-white/60">— 豆豆麻麻，使用平台2年</p>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10 xl:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-float">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-forest-600 bg-clip-text text-transparent">
                萌宠寄养
              </span>
            </Link>
          </div>

          <Card padding="lg" className="p-6 md:p-10 shadow-card">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1.5 bg-cream-50 rounded-2xl">
              {tabConfigs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setPhone('');
                      setCode('');
                      setPhoneError('');
                      setCodeError('');
                    }}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-white shadow-soft'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mb-1.5',
                        isActive ? 'text-brand-500' : ''
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs md:text-sm font-medium',
                        isActive ? 'text-gray-900' : ''
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {activeConfig.label}
              </h2>
              <p className="text-gray-500">
                新老用户均可使用手机号验证码登录
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号码
                </label>
                <div
                  className={cn(
                    'flex items-center gap-3 h-12 px-4 rounded-2xl border-2 transition-all',
                    phoneError
                      ? 'border-red-400 bg-red-50/50'
                      : 'border-gray-200 bg-white focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100'
                  )}
                >
                  <Phone
                    className={cn(
                      'w-5 h-5 shrink-0',
                      phoneError ? 'text-red-400' : 'text-gray-400'
                    )}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
                      if (phoneError) setPhoneError('');
                    }}
                    onBlur={phone ? validatePhone : undefined}
                    placeholder="请输入11位手机号"
                    maxLength={11}
                    className="w-full h-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1.5 text-xs text-red-500">{phoneError}</p>
                )}
              </div>

              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex gap-3">
                  <div
                    className={cn(
                      'flex-1 flex items-center gap-3 h-12 px-4 rounded-2xl border-2 transition-all',
                      codeError
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-gray-200 bg-white focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100'
                    )}
                  >
                    <Lock
                      className={cn(
                        'w-5 h-5 shrink-0',
                        codeError ? 'text-red-400' : 'text-gray-400'
                      )}
                    />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (codeError) setCodeError('');
                      }}
                      placeholder="6位验证码"
                      maxLength={6}
                      className="w-full h-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 tracking-widest"
                    />
                  </div>
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || !!phoneError}
                    className={cn(
                      'h-12 px-5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap',
                      countdown > 0 || !!phoneError
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100 border-2 border-brand-200 hover:border-brand-300'
                    )}
                  >
                    {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
                  </button>
                </div>
                {codeError && (
                  <p className="mt-1.5 text-xs text-red-500">{codeError}</p>
                )}
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-brand-500 cursor-pointer"
                  />
                </div>
                <span className="text-sm text-gray-500 leading-relaxed">
                  我已阅读并同意
                  <Link
                    to="/help/policy"
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    《服务条款》
                  </Link>
                  和
                  <Link
                    to="/help/privacy"
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    《隐私政策》
                  </Link>
                </span>
              </label>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                size="lg"
                fullWidth
                loading={loading}
                disabled={!agreed}
              >
                {activeConfig.label}
                <ArrowRight className="w-5 h-5" />
              </Button>

              {/* Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <button className="text-gray-500 hover:text-brand-600 transition-colors">
                  忘记密码？
                </button>
                {activeTab === 'owner' && (
                  <button className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                    注册新账号 →
                  </button>
                )}
                {activeTab === 'provider' && (
                  <Link
                    to="/register/provider"
                    className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    申请入驻 →
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Login */}
            {quickUsers.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                    快捷登录（演示）
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user)}
                      className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
                    >
                      <Avatar src={user.avatar} name={user.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.phone}
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
