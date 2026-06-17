import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Sun,
  Home as HomeIcon,
  BedDouble,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  MessageCircleHeart,
  PawPrint,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ProviderCard from '@/components/provider/ProviderCard';

export default function Home() {
  const navigate = useNavigate();
  const { providers } = useAppStore();
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const serviceCategories = [
    {
      icon: Sun,
      title: '日间照料',
      description: '白天9:00-18:00专业照护，包含户外活动、午餐和定时休息，让毛孩子告别独自在家的孤单。',
      color: 'bg-sky-50 text-sky-600',
      iconBg: 'bg-sky-100',
      type: 'daycare',
    },
    {
      icon: HomeIcon,
      title: '上门喂养',
      description: '专业服务人员上门，提供喂食、换水、清理猫砂、30分钟互动陪玩，宠物无需适应新环境。',
      color: 'bg-violet-50 text-violet-600',
      iconBg: 'bg-violet-100',
      type: 'home_visit',
    },
    {
      icon: BedDouble,
      title: '住宿寄养',
      description: '24小时全天照顾，独立房间，每日视频汇报，三餐定时，散步两次，给宠物家一般的温暖。',
      color: 'bg-forest-50 text-forest-600',
      iconBg: 'bg-forest-100',
      type: 'boarding',
    },
  ];

  const processSteps = [
    {
      step: '01',
      icon: Search,
      title: '搜索选择',
      description: '输入地点和日期，浏览附近优质商家，查看评分和评价，挑选最适合的寄养服务。',
    },
    {
      step: '02',
      icon: ShoppingBag,
      title: '预约下单',
      description: '选择服务类型和宠物信息，在线支付定金，轻松完成预约，订单状态实时可查。',
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: '安心寄养',
      description: '24小时专人照顾，每日视频汇报，全程监控保障，让您出行无忧，随时查看宝贝状态。',
    },
    {
      step: '04',
      icon: MessageCircleHeart,
      title: '好评互评',
      description: '服务结束后支付尾款，评价寄养体验，帮助其他宠主做出选择，优质商家获得更多曝光。',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&q=80)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-cream-50" />
          </div>

          <div className="relative container mx-auto py-24 md:py-32 lg:py-40">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-6 animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-brand-300" />
                <span className="text-sm font-medium">10000+ 宠主信赖的寄养平台</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                给毛孩子找一个
                <br />
                <span className="bg-gradient-to-r from-brand-300 to-brand-200 bg-clip-text text-transparent">
                  温馨的家
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                专业认证的寄养服务，让您的爱宠在您出差旅行时，依然能享受家一般的温暖与关怀
              </p>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Card padding="sm" className="max-w-3xl mx-auto shadow-float">
                  <div className="flex flex-col md:flex-row gap-3 p-2">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-cream-50 rounded-2xl">
                      <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="输入城市或地址，如：北京市朝阳区"
                        className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-cream-50 rounded-2xl">
                      <Calendar className="w-5 h-5 text-brand-500 shrink-0" />
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-transparent outline-none text-gray-900 placeholder:text-gray-400 w-32"
                        />
                        <span className="text-gray-400">至</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-transparent outline-none text-gray-900 placeholder:text-gray-400 w-32"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSearch}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      <Search className="w-5 h-5" />
                      搜索寄养
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/70 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-300" />
                  <span>实名认证</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-300" />
                  <span>资质审核</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-300" />
                  <span>全程保障</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-300" />
                  <span>售后无忧</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                选择合适的寄养服务
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                我们提供多种专业寄养服务，满足您不同场景的需求
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {serviceCategories.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.type} hover padding="lg" className="group">
                    <div className={`w-16 h-16 rounded-3xl ${service.iconBg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-8 h-8 ${service.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <Link
                      to={`/search?type=${service.type}`}
                      className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
                    >
                      查看服务
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section className="py-20 md:py-24 bg-gradient-to-b from-cream-50 to-white">
          <div className="container mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  附近优质寄养服务
                </h2>
                <p className="text-gray-500 text-lg">
                  精选高评分认证商家，为您的毛孩子提供贴心照顾
                </p>
              </div>
              <Link
                to="/search"
                className="hidden md:inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
              >
                查看全部
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="shrink-0 w-[320px] sm:w-[360px] snap-start"
                  >
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-white to-transparent" />
            </div>

            <div className="mt-6 md:hidden text-center">
              <Link to="/search">
                <Button variant="outline">查看全部商家</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                简单四步，轻松寄养
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                从搜索选择到完成寄养，全程透明高效，给您最安心的体验
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="relative">
                    <Card padding="lg" className="h-full">
                      <div className="text-6xl font-bold text-brand-100 mb-4 select-none">
                        {step.step}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-5 shadow-float">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </Card>
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-2 z-10">
                        <ChevronRight className="w-6 h-6 text-brand-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-600 via-forest-500 to-brand-500 p-8 md:p-12 lg:p-16">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

              <div className="relative max-w-4xl mx-auto text-center text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                  <PawPrint className="w-4 h-4" />
                  <span className="text-sm font-medium">加入我们的大家庭</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  成为服务方，<br className="hidden sm:block" />
                  开启你的宠物事业
                </h2>
                <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
                  无论您是专业宠物店、个人寄养家庭，还是热爱宠物的小伙伴，
                  我们都欢迎您加入萌宠寄养平台，让更多毛孩子享受您的专业服务
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register/provider">
                    <Button
                      size="lg"
                      className="bg-white text-brand-600 hover:bg-cream-50 shadow-float w-full sm:w-auto"
                    >
                      立即入驻
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/about/partner">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                    >
                      了解更多
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/70 text-sm">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white">0</p>
                    <p>入驻费用</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white">24h</p>
                    <p>极速审核</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white">10万+</p>
                    <p>潜在客户</p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white">7x12</p>
                    <p>专属客服</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
