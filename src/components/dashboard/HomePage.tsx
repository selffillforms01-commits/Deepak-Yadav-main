import React from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Bell, 
  Bot, 
  Wrench, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Lock,
  UserCheck
} from 'lucide-react';
import { DashboardTab, UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { calculateOverallProfileCompletion } from '../../utils/profileChecker';

export interface HomePageProps {
  user?: UserProfile;
  userName?: string;
  onNavigateTab?: (tab: DashboardTab) => void;
  onNavigateToTab?: (tab: DashboardTab) => void;
  logoUrl?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  user, 
  userName, 
  onNavigateTab, 
  onNavigateToTab 
}) => {
  const { t } = useLanguage();

  const navigate = (tab: DashboardTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (onNavigateToTab) {
      onNavigateToTab(tab);
    }
  };

  const displayName = user?.name || userName || 'Citizen User';

  // Calculate real profile completion percentage using the unified 5-section rule (20% each)
  const profileCompletion = calculateOverallProfileCompletion(user);
  const completionPercent = profileCompletion.totalPercentage;

  const dashboardCards = [
    {
      id: 'ai-assistant',
      title: t('nav.aiAssistant', 'AI Assistant'),
      shortDesc: t('ai.title', '24/7 Smart Bot'),
      icon: Bot,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
      tabId: 'ai-assistant' as DashboardTab,
    },
    {
      id: 'services',
      title: t('nav.services', 'Services'),
      shortDesc: t('home.popularServices', 'Browse Services'),
      icon: Wrench,
      iconBg: 'bg-amber-50 text-[#D97706] border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
      tabId: 'services' as DashboardTab,
    },
    {
      id: 'notifications',
      title: t('nav.notifications', 'Notifications'),
      shortDesc: t('active', 'Latest Updates'),
      icon: Bell,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
      tabId: 'notifications' as DashboardTab,
    },
    {
      id: 'profile',
      title: t('nav.profile', 'Profile'),
      shortDesc: t('home.checkScore', 'Manage Profile'),
      icon: UserIcon,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
      tabId: 'profile' as DashboardTab,
    },
  ];

  return (
    <div id="sff-home-page" className="space-y-6 pb-8 select-none max-w-4xl mx-auto">
      {/* 1. WELCOME + USER ID CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        id="user-welcome-card"
        className={`relative overflow-hidden bg-gradient-to-r ${completionPercent >= 80 ? "from-emerald-700 via-emerald-600 to-emerald-500 border-emerald-500/60" : "from-red-700 via-red-600 to-red-500 border-red-500/60"} text-white p-5 sm:p-6 rounded-3xl border shadow-xl transition-colors duration-500`}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-blue-200 font-semibold">
              Welcome back,
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
              {displayName}
            </h2>
            <p className="text-[11px] sm:text-xs text-blue-200 mt-1">
              SFF User account
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
          <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wide">User ID</p>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              {user?.sffUserId || user?.userId || user?.uid || "Not Available"}
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wide">Mobile No.</p>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              {user?.mobileNumber || user?.mobile || "Not Available"}
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wide">Email</p>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              {user?.email || "Not Available"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. 2x2 DASHBOARD CARDS GRID */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4" id="homepage-dashboard-grid">
        {dashboardCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              onClick={() => navigate(card.tabId)}
              className="flex flex-col justify-between p-5 bg-white dark:bg-[#161B22] border border-slate-200/80 dark:border-slate-800 rounded-3xl hover:border-[#0B3B8C] dark:hover:border-blue-500 shadow-sm hover:shadow-md cursor-pointer group active:scale-98 transition-all text-left space-y-4"
              id={`homepage-card-${card.id}`}
            >
              {/* Icon Bubble */}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${card.iconBg} group-hover:scale-105 transition-transform`}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Card Title and Short Description */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#0B3B8C] dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>{card.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-[#0B3B8C] transition-all" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {card.shortDesc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. BOTTOM SECURITY BADGE */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4 text-center space-y-1.5"
      >
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Local Encryption Shield Active</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium max-w-sm mx-auto">
          Your citizen credentials and form data remain securely stored and encrypted locally.
        </p>
      </motion.div>
    </div>
  );
};

export default HomePage;
