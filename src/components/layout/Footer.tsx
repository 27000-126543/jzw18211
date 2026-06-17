import { Link } from 'react-router-dom';
import { PawPrint, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white mt-auto">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">萌宠寄养</span>
            </Link>
            <p className="text-forest-200 text-sm leading-relaxed mb-4">
              让每一只毛孩子都能享受安心、温暖的寄养体验。专业的服务团队，给宠物家一般的关怀。
            </p>
            <div className="flex items-center gap-2 text-forest-300 text-sm">
              <Heart className="w-4 h-4 text-brand-400 fill-brand-400" />
              <span>用心守护每一个毛孩子</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">关于我们</h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  公司介绍
                </Link>
              </li>
              <li>
                <Link to="/about/team" className="hover:text-brand-400 transition-colors">
                  团队成员
                </Link>
              </li>
              <li>
                <Link to="/about/join" className="hover:text-brand-400 transition-colors">
                  加入我们
                </Link>
              </li>
              <li>
                <Link to="/about/contact" className="hover:text-brand-400 transition-colors">
                  联系方式
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">服务项目</h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li>
                <Link to="/providers?type=boarding" className="hover:text-brand-400 transition-colors">
                  宠物寄宿
                </Link>
              </li>
              <li>
                <Link to="/providers?type=daycare" className="hover:text-brand-400 transition-colors">
                  日托服务
                </Link>
              </li>
              <li>
                <Link to="/providers?type=home_visit" className="hover:text-brand-400 transition-colors">
                  上门喂养
                </Link>
              </li>
              <li>
                <Link to="/provider/register" className="hover:text-brand-400 transition-colors">
                  成为服务方
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">帮助中心</h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li>
                <Link to="/help" className="hover:text-brand-400 transition-colors">
                  常见问题
                </Link>
              </li>
              <li>
                <Link to="/help/safety" className="hover:text-brand-400 transition-colors">
                  安全保障
                </Link>
              </li>
              <li>
                <Link to="/help/policy" className="hover:text-brand-400 transition-colors">
                  用户协议
                </Link>
              </li>
              <li>
                <Link to="/help/privacy" className="hover:text-brand-400 transition-colors">
                  隐私政策
                </Link>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-forest-700 space-y-2">
              <div className="flex items-center gap-2 text-sm text-forest-200">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>400-888-8888</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-forest-200">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@mengchong.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-forest-200">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>北京市朝阳区望京SOHO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-forest-400">
            © {new Date().getFullYear()} 萌宠寄养. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-forest-400">
            <Link to="/help/policy" className="hover:text-brand-400 transition-colors">
              服务条款
            </Link>
            <Link to="/help/privacy" className="hover:text-brand-400 transition-colors">
              隐私政策
            </Link>
            <span>京ICP备12345678号</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
