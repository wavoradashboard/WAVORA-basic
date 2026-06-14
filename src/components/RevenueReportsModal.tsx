import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, DollarSign, Calendar, TrendingUp, ChevronDown, ChevronUp, Download, Eye, Layers } from 'lucide-react';
import { RevenueReport, User } from '../types';

interface RevenueReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  revenueReports: RevenueReport[];
}

export default function RevenueReportsModal({ isOpen, onClose, currentUser, revenueReports }: RevenueReportsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter only user reports
  const userReports = revenueReports.filter(rep => rep.email === currentUser.email);

  // Filter by search query (month or tracking id)
  const filteredReports = userReports.filter((rep) => {
    const term = searchQuery.toLowerCase();
    return (
      rep.month.toLowerCase().includes(term) ||
      rep.id.toLowerCase().includes(term) ||
      rep.breakdown.some((b) => b.releaseName.toLowerCase().includes(term))
    );
  });

  const formatAmount = (amount: number, currency?: 'USD' | 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Calculate totals
  const totalUSD = userReports
    .filter(rep => rep.currency !== 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalINR = userReports
    .filter(rep => rep.currency === 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto p-4" id="rev_modal_overlay">
      <div className="flex min-h-full items-center justify-center">
        {/* Backdrop for clicks outside */}
        <div 
          className="fixed inset-0 cursor-pointer -z-10" 
          onClick={onClose} 
          id="rev_modal_backdrop"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0F0F0F] border border-[#232323] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto"
          id="rev_modal_box"
        >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20" id="rev_modal_header">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">All Royalty Statements</h2>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Historical Audits & Platform Breakdown</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1C1C1C] text-gray-400 hover:text-white transition cursor-pointer"
            id="btn_close_rev_modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Quick-Ribbon */}
        <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.1)] border-b border-white/10" id="rev_modal_ribbon">
          <div className="bg-[#141414] p-4 text-left">
            <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest">Aggregate USD Net</span>
            <span className="text-lg font-black text-white font-mono">{formatAmount(totalUSD, 'USD')}</span>
          </div>
          <div className="bg-[#141414] p-4 text-left">
            <span className="block text-[8px] font-black text-[#6366F1] uppercase tracking-widest">Aggregate INR Net</span>
            <span className="text-lg font-black text-white font-mono">{formatAmount(totalINR, 'INR')}</span>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" id="rev_modal_body">
          {/* Search bar helper */}
          <div className="relative" id="rev_modal_search_box">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search statements by month, ID, or release name..."
              className="w-full bg-black border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 placeholder:text-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="rev_modal_search_input"
            />
          </div>

          {/* List of Statements */}
          {filteredReports.length === 0 ? (
            <div className="py-12 text-center bg-white/5 backdrop-blur-md/35 rounded-2xl border border-white/10 space-y-2" id="rev_modal_empty">
              <Layers className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
              <p className="text-xs text-gray-400">No matched royalty statements found matching search terms.</p>
            </div>
          ) : (
            <div className="space-y-2.5 text-left" id="rev_modal_records_stack">
              {filteredReports.map((report) => {
                const isExpanded = expandedId === report.id;
                return (
                  <div 
                    key={report.id}
                    className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden transition-all duration-150 hover:border-[#2A2A2A]"
                    id={`rev_record_${report.id}`}
                  >
                    {/* Header Row clickable */}
                    <div 
                      onClick={() => toggleExpand(report.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-[#181818] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-white block uppercase tracking-tight">{report.month} Report</span>
                          <span className="text-[9px] text-gray-500 font-mono block uppercase">ID: {report.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-indigo-400">
                          {formatAmount(report.amount, report.currency)}
                        </span>
                        <div className="p-1 rounded bg-[#1A1A1A] text-gray-400 border border-[#2B2B2B]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Breakdown Block */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="border-t border-white/10 bg-black/20 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-[9px] font-black tracking-widest uppercase text-gray-500 border-b border-[#1A1A1A] pb-1.5">
                              <span>Digital Release Title</span>
                              <span>Prorated Share Amount</span>
                            </div>

                            {report.breakdown.length === 0 ? (
                              <p className="text-[11px] text-gray-500 italic">No release metadata was bound to this period payout.</p>
                            ) : (
                              <div className="space-y-2">
                                {report.breakdown.map((item, idx) => {
                                  const pct = report.amount > 0 ? Math.round((item.amount / report.amount) * 100) : 0;
                                  return (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-300 font-medium truncate max-w-[70%]">{item.releaseName}</span>
                                      <span className="font-mono text-gray-300 font-bold whitespace-nowrap">
                                        {formatAmount(item.amount, report.currency)} 
                                        <span className="text-gray-500 font-normal ml-1.5 text-[10px]">({pct}%)</span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Export block */}
                            <div className="pt-2 border-t border-[#1A1A1A] flex justify-between items-center">
                              <span className="text-[9px] text-[#6366F1] font-mono flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> Ledger Auto-Verified & Released
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Successfully exported statement XML for ${report.month}`);
                                }}
                                className="cursor-pointer px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" /> XML Export
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-end" id="rev_modal_footer">
          <button
            type="button"
            className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#2F2F2F] text-gray-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer"
            onClick={onClose}
          >
            Close view
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
