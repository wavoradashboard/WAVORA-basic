import React from 'react';
import { motion } from 'motion/react';
import { Play, Disc, ArrowUpRight, DollarSign, Wallet, CheckCircle, Music } from 'lucide-react';
import { User, Release, RevenueReport, Notification } from '../types';
import NotificationsWidget from './NotificationsWidget';

interface DashboardHomeProps {
  currentUser: User;
  releases: Release[];
  revenueReports: RevenueReport[];
  setCurrentTab: (tab: string) => void;
  onOpenRevenueModal: () => void;
  notifications: Notification[];
}

export default function DashboardHome({
  currentUser,
  releases,
  revenueReports,
  setCurrentTab,
  onOpenRevenueModal,
  notifications,
}: DashboardHomeProps) {
  // Filter user's specific releases
  const userReleases = releases.filter(r => r.email === currentUser.email);
  const totalReleases = userReleases.length;

  // Filter user's specific revenue
  const userRevenue = revenueReports.filter(r => r.email === currentUser.email);
  
  // Format helper for dynamic report currencies
  const formatAmount = (amount: number, currency?: 'USD' | 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalUSD = userRevenue
    .filter(rep => rep.currency !== 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalINR = userRevenue
    .filter(rep => rep.currency === 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  // Live status helper
  const liveReleases = userReleases.filter(r => r.status === 'Live').length;
  const pendingReleases = userReleases.filter(r => r.status === 'Submitted').length;

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard_home_root">
      {/* Upper header banner - Sleek Magazine Hero aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 md:p-8 bg-white/2 rounded-3xl border border-white/10 relative overflow-hidden" id="home_welcome_banner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(29,185,84,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="text-[9px] md:text-[10px] text-[#6366F1] font-bold tracking-widest uppercase">Artist Welcome Dashboard</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter" id="home_welcome_header">
            Welcome, <span className="text-[#6366F1]">{currentUser.artistName}</span>
          </h2>
          <p className="text-[10px] md:text-xs text-gray-400 max-w-xl leading-relaxed">
            Distribute new singles, EPs, or albums directly to global music networks. Build your custom catalog metadata, verify official copyrights, and overview your digital earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('new-release')}
          className="relative z-10 cursor-pointer px-4 md:px-5 py-2.5 md:py-3 bg-white hover:bg-[#6366F1] hover:text-black text-black font-black text-[10px] md:text-xs uppercase tracking-tight rounded-xl flex items-center justify-center gap-2 transition duration-200 w-full sm:w-auto self-start md:self-auto shadow-lg"
          id="btn_home_quick_launch"
        >
          <Play className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" /> Distribute New Track
        </button>
      </div>

      {/* Broadcast System Announcements Bulletin Board */}
      <NotificationsWidget currentUser={currentUser} notifications={notifications} />

      {/* C Lines and P Lines display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="home_legal_lines_grid">
        <div className="p-5 bg-white/2 rounded-2xl border border-white/10" id="home_c_lines">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Authorized C Lines (©)</h3>
          <div className="space-y-1">
            {(currentUser.allowedCLines || []).length === 0 ? (
              <p className="text-[10px] text-gray-600 italic">No C lines authorized.</p>
            ) : (
              (currentUser.allowedCLines || []).map((line, i) => (
                <div key={i} className="text-[10px] text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 truncate">
                  © {line}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="p-5 bg-white/2 rounded-2xl border border-white/10" id="home_p_lines">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Authorized P Lines (℗)</h3>
          <div className="space-y-1">
            {(currentUser.allowedPLines || []).length === 0 ? (
              <p className="text-[10px] text-gray-600 italic">No P lines authorized.</p>
            ) : (
              (currentUser.allowedPLines || []).map((line, i) => (
                <div key={i} className="text-[10px] text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 truncate">
                  ℗ {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards - Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="home_stats_grid">
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 bg-white/2 rounded-2xl border border-white/10 hover:border-[#2F2F2F] transition-all overflow-hidden"
          id="metric_total_releases"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Total Releases</span>
            <div className="p-1.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
              <Disc className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter truncate break-all" title={String(totalReleases)}>
            {totalReleases}
          </div>
          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1 font-mono uppercase truncate">
            <span className="text-[#6366F1] font-bold">{liveReleases} Live</span>
            <span>•</span>
            <span className="text-amber-500 font-bold">{pendingReleases} In Review</span>
          </div>
        </motion.div>

        <motion.div 
          onClick={onOpenRevenueModal}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="p-5 bg-white/2 hover:bg-[#181818] rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all overflow-hidden cursor-pointer select-none group"
          id="metric_total_revenue"
          title="Click to view detailed statements popup"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#6366F1] group-hover:text-[#818CF8] transition-colors flex items-center gap-1.5">
              Artist Revenue <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded border border-indigo-500/20 font-sans tracking-normal uppercase">View details</span>
            </span>
            <div className="p-1.5 rounded bg-[#6366F1]/10 text-[#6366F1] group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {totalINR > 0 && totalUSD > 0 ? (
            <div className="space-y-0.5 min-w-0">
              <div 
                className="text-xl sm:text-2xl lg:text-3xl font-black text-[#6366F1] tracking-tighter truncate break-all"
                title={formatAmount(totalINR, 'INR')}
              >
                {formatAmount(totalINR, 'INR')}
              </div>
              <div 
                className="text-[10px] sm:text-xs font-bold text-gray-400 truncate break-all"
                title={`+ ${formatAmount(totalUSD, 'USD')}`}
              >
                + {formatAmount(totalUSD, 'USD')}
              </div>
            </div>
          ) : totalINR > 0 ? (
            <div 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#6366F1] tracking-tighter truncate break-all"
              title={formatAmount(totalINR, 'INR')}
            >
              {formatAmount(totalINR, 'INR')}
            </div>
          ) : (
            <div 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#6366F1] tracking-tighter truncate break-all"
              title={formatAmount(totalUSD, 'USD')}
            >
              {formatAmount(totalUSD, 'USD')}
            </div>
          )}
          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1 font-mono uppercase truncate">
            <span className="text-[#6366F1] font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Direct Payout
            </span>
            <span>•</span>
            <span>100% Shared</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 bg-white/2 rounded-2xl border border-white/10 hover:border-[#2F2F2F] transition-all overflow-hidden"
          id="metric_streaming_share"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Statement Block</span>
            <div className="p-1.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-black text-white leading-tight uppercase tracking-tight truncate break-all">
            {userRevenue.length > 0 ? userRevenue[0].month : 'No Period'}
          </div>
          <div className="text-[10px] text-[#6366F1] font-bold mt-3 hover:underline cursor-pointer uppercase tracking-wider truncate break-all" onClick={() => setCurrentTab('revenue')}>
            {userRevenue.length > 0 ? `${formatAmount(userRevenue[0].amount, userRevenue[0].currency)} reported` : 'Reviewing stats'}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 bg-white/2 rounded-2xl border border-white/10 hover:border-[#2F2F2F] transition-all overflow-hidden"
          id="metric_distribution_speed"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">System Pipeline</span>
            <div className="p-1.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter flex items-baseline gap-1 truncate break-all">
            <span>UPTIME</span>
          </div>
          <div className="text-[10px] text-gray-550 mt-2 font-mono uppercase tracking-wider truncate">
            Direct Ingestion APIs Operational
          </div>
        </motion.div>
      </div>

      {/* Grid: Recent Releases and Streaming Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="home_secondary_grid">
        {/* Recent Submissions */}
        <div className="md:col-span-12 p-6 bg-white/2 rounded-3xl border border-white/10 flex flex-col justify-between" id="recent_releases_section">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300">Catalog Registry Preview</h3>
              <button 
                onClick={() => setCurrentTab('catalogue')}
                className="text-xs text-[#6366F1] hover:underline cursor-pointer font-bold uppercase tracking-tight"
              >
                View Full Catalogue
              </button>
            </div>

            {userReleases.length === 0 ? (
              <div className="py-12 text-center text-gray-500 space-y-3" id="no_activity_alert">
                <Music className="w-10 h-10 text-gray-700 mx-auto" />
                <p className="text-xs text-gray-300">No releases registered on your catalog registry.</p>
                <button
                  onClick={() => setCurrentTab('new-release')}
                  className="mx-auto block text-xs bg-white text-black font-black px-4 py-2 rounded uppercase tracking-tighter hover:bg-[#6366F1] cursor-pointer"
                >
                  Create New release
                </button>
              </div>
            ) : (
              <div className="space-y-3" id="activity_list">
                {userReleases.slice(0, 3).map((rel) => (
                  <div 
                    key={rel.id} 
                    className="p-3 bg-black rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs hover:border-[#2F2F2F] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={rel.coverArtSignedUrl || rel.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover flex-shrink-0 border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md uppercase tracking-tight">{rel.albumName}</h4>
                        <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1.5 font-mono">
                          <span>{rel.type}</span>
                          <span>•</span>
                          <span>{rel.tracks.length} track(s)</span>
                          {rel.labelName && (
                            <>
                              <span>•</span>
                              <span className="text-amber-500 truncate max-w-[100px]">{rel.labelName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end justify-center min-w-[90px]">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                        rel.status === 'Live' ? 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20' :
                        rel.status === 'Approved' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20' :
                        rel.status === 'Rejected' ? 'bg-red-950/40 text-red-500 border border-red-500/20' :
                        'bg-zinc-800 text-gray-300 border border-zinc-700'
                      }`}>
                        {rel.status}
                      </span>
                      <div className="text-[9px] text-gray-500 mt-1 font-mono whitespace-nowrap">
                        {new Date(rel.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
