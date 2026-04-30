/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sword, 
  Map as MapIcon, 
  Scroll, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Clock,
  User,
  Package,
  Activity,
  History,
  LayoutDashboard,
  Search,
  Bell,
  Zap,
  Star,
  Mail,
  MessageSquare,
  Plus,
  FileUp,
  X,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSchedule, WorkflowOutput } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WorkflowOutput | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [showCutIn, setShowCutIn] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTaskDispatchModal, setShowTaskDispatchModal] = useState(false);
  const [showIntelModal, setShowIntelModal] = useState(false);
  const [slashEffect, setSlashEffect] = useState<{ x: number, y: number } | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerSlash = (e: React.MouseEvent) => {
    setSlashEffect({ x: e.clientX, y: e.clientY });
    setTimeout(() => setSlashEffect(null), 400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1600;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = (height / width) * maxDim;
                width = maxDim;
              } else {
                width = (width / height) * maxDim;
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setPendingFiles(prev => [...prev, {
              data: optimizedBase64,
              mimeType: 'image/jpeg',
              name: file.name
            }]);
          };
          img.src = base64;
        } else {
          setPendingFiles(prev => [...prev, {
            data: base64,
            mimeType: file.type,
            name: file.name
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!input.trim() && pendingFiles.length === 0) return;
    setIsLoading(true);
    setShowCutIn(false);
    try {
      const data = await analyzeSchedule(input, pendingFiles.length > 0 ? pendingFiles : undefined);
      setResult(data);
      setActiveEventIndex(0);
      setPendingFiles([]); // Clear files after analysis
      setTimeout(() => setShowCutIn(true), 1000);
    } catch (error) {
      console.error('Error analyzing schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExample = () => {
    setInput(`MISSION LOG: 2026-04-30
09:00 AM - Tactical sync with Hashira Giyu regarding the "Water Pipeline" deployment.
01:30 PM - Review the "Nichirin Blade" technical specs from the Swordsmith Village (attached screenshot/file).
04:00 PM - Crow Dispatch to the Flame Pillar about the upcoming joint mission.`);
  };

  return (
    <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD] font-sans flex-col overflow-hidden selection:bg-[#9E1B1B] selection:text-white uniform-texture">
      {/* Header Navigation */}
      <header className="h-16 bg-[#1A1A1A] border-b-4 border-[#9E1B1B] flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_4px_20px_rgba(158,27,27,0.3)]">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 bg-[#9E1B1B] rounded-lg flex items-center justify-center text-white font-bold shadow-[4px_4px_0_#4A0E0E] border-2 border-white"
          >
            <Sword size={24} />
          </motion.div>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase italic flex items-center gap-2 text-white">
              Yearly <span className="text-[#9E1B1B]">Herald</span>
            </h1>
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] leading-none">Strategic Intelligence & Tactical Path to Victory</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <div className="text-[10px] font-black uppercase text-[#9E1B1B] tracking-[0.2em]">{currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="text-xl font-black text-white leading-none tabular-nums italic">
              {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-[#9E1B1B]/10 border-2 border-[#9E1B1B] rounded-md shadow-[0_0_10px_rgba(158,27,27,0.2)]">
            <Activity size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase text-white">Breathing: Full Focus</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden relative">
        
        {/* Scanning Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[200] bg-[#1A1A1A]/80 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
            >
              <div className="absolute inset-x-0 h-1 bg-[#9E1B1B] shadow-[0_0_20px_#9E1B1B] animate-[scan_2s_linear_infinite]" />
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-[#1A1A1A] border-4 border-[#9E1B1B] px-8 py-4 rounded-xl shadow-[0_0_50px_rgba(158,27,27,0.5)] flex flex-col items-center gap-4"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 border-t-4 border-l-4 border-[#9E1B1B] rounded-tl-lg animate-pulse" />
                  <div className="w-12 h-12 border-b-4 border-r-4 border-[#9E1B1B] rounded-br-lg animate-pulse" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-white italic tracking-[0.3em] uppercase mb-1">Breathing Technique</span>
                  <span className="text-sm font-bold text-[#FFFFFF]/70 uppercase tracking-[0.1em]">Gathering Intelligence...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Left Rail: The Nichiran (Tanjiro Palette) */}
        <section className="col-span-12 lg:col-span-3 h-full flex flex-col gap-4 overflow-hidden order-2 lg:order-1">
          <div className="flex items-center gap-2 px-1 shrink-0">
            <MapIcon size={16} className="text-[#00B067]" />
            <h2 className="text-[11px] font-black text-[#00B067] uppercase tracking-[0.2em] font-jagged">The Nichiran Log</h2>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-6 px-1">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-6 bg-[#1A1A1A] border-4 border-dashed border-[#00B067]/30 rounded-2xl flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00B067]/10 flex items-center justify-center text-[#00B067]/30 border-2 border-[#00B067]/20">
                  <Scroll size={24} />
                </div>
                <div className="text-[10px] font-black text-[#00B067]/40 uppercase tracking-widest leading-tight">Waiting for Crow...</div>
              </motion.div>
            ) : (
              result.events.map((event, idx) => (
                <motion.button
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={(e) => {
                    triggerSlash(e);
                    setActiveEventIndex(idx);
                    setShowCutIn(false);
                    setTimeout(() => setShowCutIn(true), 200);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-4 relative transition-all group overflow-hidden ${
                    activeEventIndex === idx 
                      ? 'bg-[#1A1A1A] border-[#00B067] shadow-[0_0_15px_rgba(0,176,103,0.4)] scale-[1.02] muzan-pulse' 
                      : 'bg-[#1A1A1A] border-[#1A1A1A] hover:border-[#00B067]/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="absolute inset-0 tanjiro-checkered opacity-10 pointer-events-none" />
                  
                  <div className={`absolute -right-1 -top-1 w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black border-2 border-[#1A1A1A] shadow-sm ${
                    event.hasConflict ? 'bg-[#9E1B1B] rotate-12' : (activeEventIndex === idx ? 'bg-[#00B067]' : 'bg-[#1A1A1A] border-[#00B067]/30')
                  }`}>
                    {event.hasConflict ? '!' : (idx + 1)}
                  </div>

                  <div className="text-[9px] font-black text-[#00B067] mb-1 flex items-center gap-1 uppercase tracking-widest opacity-70">
                    <Clock size={10} />
                    {event.timeToImpact}
                  </div>
                  <div className="font-black text-sm text-white leading-tight uppercase mb-2 tracking-tight group-hover:text-[#00B067] transition-colors">{event.questName}</div>
                  <div className="text-[10px] text-[#FFFFFF]/60 line-clamp-1 italic font-medium leading-relaxed">
                    {event.commandRecommendation.split('.')[0]}
                  </div>
                </motion.button>
              ))
            )}
            
            <div className="p-3 bg-[#00B067]/5 border-2 border-dashed border-[#00B067]/20 rounded-xl text-center">
              <div className="text-[9px] font-black text-[#00B067]/40 uppercase tracking-[0.3em]">Horizon Guarded</div>
            </div>
          </div>
          
          <div className="mt-auto pt-2 pb-1 px-1">
             <button 
              onClick={() => setShowIntelModal(true)}
              className="w-full py-2.5 bg-[#9E1B1B]/10 border-2 border-dashed border-[#9E1B1B]/40 rounded-xl text-[9px] font-black text-[#9E1B1B] uppercase tracking-[0.2em] hover:bg-[#9E1B1B]/20 transition-all flex items-center justify-center gap-2"
             >
                <BookOpen size={12} />
                Project Intel Briefing
             </button>
          </div>
        </section>

        {/* Center: Tactical Intel & Cross-Dispatch */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-hidden order-1 lg:order-2">
          
          {/* Active Operation Input (Muzan Style) */}
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2 px-1">
              <Sword size={16} className="text-[#9E1B1B]" />
              <h2 className="text-[11px] font-black text-[#9E1B1B] uppercase tracking-[0.2em] font-jagged">Crow Dispatch Intake</h2>
            </div>
            
            <div className="bg-[#1A1A1A] border-4 border-[#9E1B1B] rounded-2xl shadow-[6px_6px_0_#4A0E0E] p-4 relative overflow-hidden group muzan-pulse">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#9E1B1B]/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
              
              <div className="flex items-center justify-between mb-3 relative">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#9E1B1B] rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-[#FFFFFF]/60 uppercase tracking-widest leading-none">Status: Gathering Intel...</span>
                </div>
                <button onClick={handleExample} className="text-[10px] font-black text-[#9E1B1B] hover:text-white uppercase tracking-tighter flex items-center gap-1 transition-colors leading-none">
                  <History size={12} />
                  Recall Memory Fragment
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Secure your scrolls or Messenger Crow dispatches here. I will extract the strategic truth."
                className="w-full h-20 p-4 bg-[#0D1B2A] border-2 border-[#9E1B1B]/30 rounded-xl text-sm font-medium text-white focus:ring-4 focus:ring-[#9E1B1B]/10 focus:border-[#9E1B1B] outline-none resize-none transition-all placeholder:text-gray-700 leading-relaxed custom-scrollbar"
              />

              {pendingFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingFiles.map((file, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-2 bg-[#9E1B1B]/10 border border-[#9E1B1B]/30 rounded-lg flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2">
                        {file.mimeType.includes('pdf') ? <FileText size={14} className="text-[#9E1B1B]" /> : <ImageIcon size={14} className="text-[#9E1B1B]" />}
                        <span className="text-[9px] font-black text-white truncate max-w-[100px]">{file.name}</span>
                      </div>
                      <button onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))} className="p-0.5 hover:bg-[#9E1B1B]/20 rounded text-[#9E1B1B]">
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="mt-3 flex justify-between items-center">
                <div className="relative">
                  <input type="file" id="file-upload" className="hidden" accept="image/*,.pdf" multiple onChange={handleFileChange} />
                  <label htmlFor="file-upload" className="flex items-center gap-2 px-3 py-1.5 bg-[#9E1B1B]/10 border-2 border-[#9E1B1B]/40 rounded-lg text-[9px] font-black uppercase text-white tracking-widest cursor-pointer hover:bg-[#9E1B1B] transition-all shadow-sm active:scale-95">
                    <FileUp size={12} />
                    Attach Artifacts
                  </label>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyze}
                  disabled={isLoading || (!input.trim() && pendingFiles.length === 0)}
                  className="flex items-center gap-2 px-6 py-2 bg-[#9E1B1B] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border-b-4 border-[#4A0E0E] shadow-lg hover:brightness-110 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {isLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} />Analyze Mission</>}
                </motion.button>
              </div>
            </div>
          </div>

          {/* DUAL DISPLAY: Mission Drafts & Email Recommendations */}
          <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-hidden">
             {result === null ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex-1 bg-[#1A1A1A] border-4 border-dashed border-[#9E1B1B]/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <p className="text-[10px] font-black text-[#9E1B1B]/40 uppercase tracking-[0.2em]">Awaiting Strategic Payload for Mission Analysis</p>
                </motion.div>
              ) : result.events[activeEventIndex] && (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  {/* Mission Extraction (Intel Details) */}
                  <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <div className="flex items-center gap-2 px-1">
                      <Scroll size={14} className="text-[#00B067]" />
                      <h2 className="text-[10px] font-black text-[#00B067] uppercase tracking-[0.2em]">Strategic Extraction</h2>
                    </div>
                    <div className="flex-1 bg-[#1A1A1A] border-4 border-[#00B067]/20 rounded-2xl p-6 overflow-y-auto custom-scrollbar relative shadow-inner">
                      <div className="absolute inset-0 tanjiro-checkered opacity-[0.03] pointer-events-none" />
                      <div className="relative text-sm text-white/90 leading-relaxed font-serif italic whitespace-pre-wrap">
                        {result.events[activeEventIndex].payloadDetails}
                      </div>
                    </div>
                  </div>

                  {/* Email Recommendation (Now with Popup trigger) */}
                  <div className="flex-1 flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-[#FFB7C5]" />
                        <h2 className="text-[10px] font-black text-[#FFB7C5] uppercase tracking-[0.2em]">Email Dispatch Recommendation</h2>
                      </div>
                      <button 
                        onClick={() => setShowEmailModal(true)}
                        className="text-[9px] font-black text-[#FFB7C5] hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                         <Search size={10} /> Full View
                      </button>
                    </div>
                    <div 
                      onClick={() => setShowEmailModal(true)}
                      className="flex-1 bg-[#1A1A1A] border-4 border-[#FFB7C5]/20 rounded-2xl overflow-hidden flex flex-col relative group cursor-pointer hover:border-[#FFB7C5]/40 transition-all border-dashed"
                    >
                      <div className="p-4 flex-1 flex flex-col gap-3 overflow-hidden">
                        <div className="flex-1 bg-[#0D1B2A] border border-white/5 rounded-xl p-4 overflow-hidden relative">
                          <div className="text-[11px] text-white/70 italic leading-relaxed line-clamp-4">
                            {result.events[activeEventIndex].theDraft}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
                        </div>
                        <div className="flex justify-center">
                           <span className="text-[8px] font-black text-[#FFB7C5]/50 uppercase tracking-[0.3em]">Click to expand strategic draft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* NEW COLUMN: Task Dispatch (Zenitsu Palette) */}
        <section className="col-span-12 lg:col-span-3 h-full flex flex-col gap-4 overflow-hidden order-3">
           <div className="flex items-center gap-2 px-1 shrink-0">
             <Package size={16} className="text-[#FBC02D]" />
             <h2 className="text-[11px] font-black text-[#FBC02D] uppercase tracking-[0.2em] font-jagged">Task Dispatch</h2>
           </div>
           
           <div className="flex-1 overflow-hidden">
             {!result ? (
               <div className="h-full border-4 border-dashed border-[#FBC02D]/20 rounded-2xl bg-[#FBC02D]/5 flex flex-col items-center justify-center text-[#FBC02D]/10">
                 <Zap size={32} />
               </div>
             ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setShowTaskDispatchModal(true)}
                  className="h-full bg-[#1A1A1A] border-4 border-[#FBC02D]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-[#FBC02D] transition-all"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBC02D]/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                  
                  <div className="text-[9px] font-black text-[#FBC02D] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Clock size={12} />
                    Tactical Workflow
                  </div>

                  <div className="space-y-4 relative">
                     <p className="text-xs text-white/80 leading-relaxed italic line-clamp-6">
                        {result.events[activeEventIndex].taskDispatchWorkflow}
                     </p>
                     
                     <div className="pt-4 border-t border-[#FBC02D]/20">
                        <div className="text-[9px] font-black text-[#FBC02D] uppercase tracking-widest mb-2 italic">Intelligence Sources:</div>
                        <div className="space-y-2">
                           {result.events[activeEventIndex].recommendedSources.map((source, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                                 <Plus size={10} className="text-[#FBC02D]" />
                                 <span className="truncate">{source}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                     <motion.button 
                       animate={{ y: [0, -5, 0] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                       className="text-[9px] font-black text-[#FBC02D] uppercase tracking-[0.2em]"
                     >
                       Full Tactical breakdown available
                     </motion.button>
                  </div>
                </motion.div>
             )}
           </div>
        </section>

        {/* Right Rail: Tactical Map (Inosuke Palette) */}
        <section className="col-span-12 lg:col-span-3 h-full flex flex-col gap-4 overflow-hidden order-4">
          <div className="flex items-center gap-2 px-1 shrink-0">
            <Package size={16} className="text-[#2E5A88]" />
            <h2 className="text-[11px] font-black text-[#2E5A88] uppercase tracking-[0.2em] font-jagged">Tactical Map Brief</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-6 px-1">
            {!result ? (
              <div className="p-8 border-4 border-dashed border-[#2E5A88]/20 rounded-2xl bg-[#2E5A88]/5 flex flex-col items-center justify-center text-[#2E5A88]/10 grayscale">
                <Users size={32} />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Focus Alert */}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="bg-[#2E5A88] border-b-4 border-[#1D3557] rounded-xl p-5 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-8 -mt-8" />
                  <div className="text-[9px] font-black text-[#A0B0C0] uppercase tracking-[0.3em] mb-1">Inosuke Style: Assault</div>
                  <div className="text-sm font-black text-white uppercase italic leading-tight">Objective: {result.events[activeEventIndex].questName}</div>
                </motion.div>

                {/* Tactical Path Breakdown */}
                <div className="bg-[#1A1A1A] border-4 border-[#2E5A88]/30 rounded-2xl overflow-hidden shadow-2xl">
                   <div className="bg-[#2E5A88]/10 px-4 py-3 text-[10px] font-black text-[#2E5A88] uppercase tracking-[0.1em] flex items-center justify-between border-b border-[#2E5A88]/20">
                      <div className="flex items-center gap-2">
                        <Zap size={14} />
                        Winning Path
                      </div>
                      <span className="text-[8px] opacity-60">Strategic Path</span>
                   </div>
                   <div className="p-5 space-y-6">
                      <div className="space-y-3">
                        <div className="text-[9px] font-black text-[#2E5A88] uppercase tracking-widest">Execution Steps:</div>
                        <div className="space-y-3">
                          {result.events[activeEventIndex].tacticalGuide.map((step, sidx) => (
                            <div key={sidx} className="flex gap-3 items-start group">
                              <div className="w-5 h-5 bg-[#2E5A88] text-white flex items-center justify-center text-[10px] font-black rounded-lg shrink-0 shadow-lg group-hover:scale-110 transition-transform">{sidx + 1}</div>
                              <p className="text-[11px] text-[#FFFFFF]/80 leading-relaxed font-medium">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#2E5A88]/10">
                        <div className="text-[9px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Activity size={12} className="text-[#2E5A88]" />
                           Mastery Tips
                        </div>
                        {result.events[activeEventIndex].optimizationStrategy.map((tip, tidx) => (
                          <div key={tidx} className="bg-[#2E5A88]/5 p-3 rounded-xl border-l-4 border-[#2E5A88] mb-3 group hover:bg-[#2E5A88]/10 transition-colors">
                            <p className="text-[11px] italic text-[#A0B0C0] leading-snug group-hover:text-white transition-colors">"{tip}"</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Status Bar with Anime "Ticker" */}
      {/* Tactical Briefing Modal */}
      <AnimatePresence>
        {showBriefingModal && result && result.events[activeEventIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#1A1A1A]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] border-4 border-[#9E1B1B] w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-[0_0_100px_rgba(158,27,27,0.3)] overflow-hidden flex flex-col relative uniform-texture"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#9E1B1B]/5 rounded-bl-full -mr-32 -mt-32 pointer-events-none" />
              
              <div className="bg-[#9E1B1B] px-8 py-6 flex justify-between items-center shrink-0 border-b-4 border-[#1A1A1A]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#9E1B1B] shadow-xl transform -rotate-12 border-2 border-[#1A1A1A]">
                    <Zap size={28} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-white/70 tracking-[0.4em]">Final Mission Briefing</div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-jagged">{result.events[activeEventIndex].questName}</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBriefingModal(false)}
                  className="w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 lg:col-span-7 space-y-8">
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-[#00B067]" />
                        <h3 className="text-sm font-black uppercase text-[#00B067] tracking-widest font-jagged">Tactical Path to Victory</h3>
                      </div>
                      <div className="space-y-3">
                        {result.events[activeEventIndex].tacticalGuide.map((step, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-[#1A1A1A] border-2 border-[#00B067]/20 rounded-2xl group hover:border-[#00B067] transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 tanjiro-checkered opacity-[0.03] pointer-events-none" />
                            <div className="w-8 h-8 bg-[#00B067] text-white flex items-center justify-center font-black rounded-lg shrink-0 mt-0.5 shadow-[2px_2px_0_#004d30]">
                              {i + 1}
                            </div>
                            <p className="text-sm text-white/90 leading-relaxed group-hover:text-white transition-colors">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-[#2E5A88]" />
                        <h3 className="text-sm font-black uppercase text-[#2E5A88] tracking-widest font-jagged">Mastery Strategy</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {result.events[activeEventIndex].optimizationStrategy.map((tip, i) => (
                          <div key={i} className="bg-[#2E5A88]/5 border-2 border-[#2E5A88]/20 p-4 rounded-2xl italic text-[#A0B0C0] text-sm leading-relaxed group hover:bg-[#2E5A88]/10 transition-colors">
                            <span className="text-[#2E5A88] font-bold mr-2">TIP:</span>
                            "{tip}"
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    <section className="bg-[#1B263B] p-6 rounded-3xl border-4 border-[#9E1B1B]/10 shadow-inner">
                      <div className="text-[10px] font-black text-[#9E1B1B] uppercase mb-2 tracking-widest flex items-center gap-2">
                        <Scroll size={14} />
                        Source Intel
                      </div>
                      <div className="text-xs text-[#FFFFFF]/70 italic leading-relaxed whitespace-pre-wrap px-3 border-l-2 border-[#9E1B1B]/30 mb-6">
                        {result.events[activeEventIndex].payloadDetails}
                      </div>

                      <div className="bg-[#FFB7C5]/5 border-2 border-[#FFB7C5]/30 p-4 rounded-2xl">
                         <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={14} className="text-[#FFB7C5]" />
                            <h3 className="text-[10px] font-black uppercase text-[#FFB7C5] tracking-widest">Communication Intelligence</h3>
                         </div>
                         <p className="text-xs text-white/80 italic leading-relaxed">
                            {result.events[activeEventIndex].communicationRecommendation}
                         </p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-1">Allied Hashiras Contacted</div>
                      <div className="space-y-2">
                        {result.events[activeEventIndex].allyIntel.map((ally, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-[#1A1A1A] border-2 border-[#FFFFFF]/5 rounded-xl group hover:border-[#9E1B1B]/40 transition-colors">
                            <div className="w-8 h-8 bg-[#9E1B1B]/10 text-[#9E1B1B] flex items-center justify-center font-black rounded-lg border border-[#9E1B1B]/20">
                              {ally.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">{ally}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#1A1A1A] border-t-4 border-[#9E1B1B]/20 flex justify-between items-center bg-gradient-to-t from-[#9E1B1B]/5 to-transparent">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#9E1B1B] animate-pulse" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Breathing: Total Concentration Mode</span>
                </div>
                <button 
                  onClick={() => setShowBriefingModal(false)}
                  className="px-10 py-3 bg-[#9E1B1B] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-white hover:text-[#9E1B1B] hover:scale-105 active:scale-95 transition-all border-b-4 border-[#4A0E0E]"
                >
                  Unleash Strategic Strike
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sword Slash Effect */}
      <AnimatePresence>
        {slashEffect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1.2, 1], rotate: [20, 20, 20] }}
            exit={{ opacity: 0 }}
            style={{ left: slashEffect.x - 200, top: slashEffect.y - 50 }}
            className="fixed w-[400px] h-[10px] bg-white z-[1000] pointer-events-none shadow-[0_0_20px_#E63946,0_0_40px_#A8DADC]"
          />
        )}
      </AnimatePresence>

      {/* Email Dispatch Modal */}
      <AnimatePresence>
        {showEmailModal && result && result.events[activeEventIndex] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#1A1A1A]/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              className="bg-[#1A1A1A] border-4 border-[#FFB7C5] w-full max-w-2xl rounded-3xl shadow-[0_0_80px_rgba(255,183,197,0.2)] overflow-hidden flex flex-col relative"
            >
              <div className="bg-[#FFB7C5] p-6 flex justify-between items-center text-[#1A1A1A]">
                <div className="flex items-center gap-3">
                  <Mail size={24} className="font-bold" />
                  <h2 className="text-xl font-black uppercase italic font-jagged tracking-widest">Email Intelligence</h2>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="p-2 bg-black/10 rounded-full hover:bg-black/20"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                   <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <span className="text-[9px] font-black text-[#FFB7C5] uppercase tracking-[0.2em] block mb-1">To Allied Forces</span>
                      <div className="flex flex-wrap gap-2">
                        {result.events[activeEventIndex].allyIntel.map((email, i) => (
                           <span key={i} className="px-2 py-1 bg-[#FFB7C5]/10 text-white text-xs font-bold rounded border border-[#FFB7C5]/20">{email}</span>
                        ))}
                      </div>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <span className="text-[9px] font-black text-[#FFB7C5] uppercase tracking-[0.2em] block mb-1">Strategic Subject</span>
                      <p className="text-sm font-bold text-white">{result.events[activeEventIndex].subject}</p>
                   </div>
                   <div className="bg-[#0D1B2A] border-2 border-[#FFB7C5]/20 p-6 rounded-2xl relative shadow-inner">
                      <div className="text-base text-white leading-relaxed font-serif italic whitespace-pre-wrap">
                        {result.events[activeEventIndex].theDraft}
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 w-full py-4 bg-[#FFB7C5] text-white font-black uppercase tracking-[0.3em] rounded-xl shadow-xl flex items-center justify-center gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(result.events[activeEventIndex].theDraft);
                          alert('Strategic draft secured to clipboard.');
                        }}
                      >
                         <CheckCircle2 size={18} /> Copy Dispatch Body
                      </motion.button>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Dispatch Modal */}
      <AnimatePresence>
        {showTaskDispatchModal && result && result.events[activeEventIndex] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#1A1A1A]/95 backdrop-blur-xl"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
               className="bg-[#1A1A1A] border-4 border-[#FBC02D] w-full max-w-3xl rounded-3xl shadow-[0_0_80px_rgba(251,192,45,0.2)] overflow-hidden flex flex-col relative"
            >
              <div className="bg-[#FBC02D] p-6 flex justify-between items-center text-[#1A1A1A]">
                <div className="flex items-center gap-3">
                  <Zap size={24} className="font-bold" />
                  <h2 className="text-xl font-black uppercase italic font-jagged tracking-widest">Deep Logistics Workflow</h2>
                </div>
                <button onClick={() => setShowTaskDispatchModal(false)} className="p-2 bg-black/10 rounded-full hover:bg-black/20"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                 <section>
                    <div className="text-[10px] font-black text-[#FBC02D] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Activity size={14} /> Execution Roadmap
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-sm text-white/90 leading-loose italic font-serif whitespace-pre-wrap">
                       {result.events[activeEventIndex].taskDispatchWorkflow}
                    </div>
                 </section>

                 <section>
                    <div className="text-[10px] font-black text-[#FBC02D] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <CheckCircle2 size={14} /> Recommended Strategic Sources
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {result.events[activeEventIndex].recommendedSources.map((source, i) => (
                          <div key={i} className="p-4 bg-[#FBC02D]/10 border border-[#FBC02D]/20 rounded-xl flex items-center gap-3 group hover:bg-[#FBC02D]/20 transition-all cursor-pointer">
                             <div className="w-8 h-8 bg-[#FBC02D] text-[#1A1A1A] flex items-center justify-center rounded-lg shadow-lg font-black">{i + 1}</div>
                             <span className="text-xs font-bold text-white/80 group-hover:text-white truncate">{source}</span>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>
              <div className="p-6 bg-[#0D1B2A] border-t-2 border-white/5 flex justify-center">
                 <button onClick={() => setShowTaskDispatchModal(false)} className="px-12 py-3 bg-[#FBC02D] text-[#1A1A1A] font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 active:scale-95 transition-all">
                    Acknowledge Logistics
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Intel Modal */}
      <AnimatePresence>
        {showIntelModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
          >
            <motion.div 
               initial={{ scale: 0.9, rotateX: 20 }} animate={{ scale: 1, rotateX: 0 }} exit={{ scale: 0.9, rotateX: 20 }}
               className="bg-[#1A1A1A] border-4 border-[#9E1B1B] w-full max-w-4xl rounded-3xl shadow-[0_0_100px_rgba(158,27,27,0.3)] overflow-hidden flex flex-col"
            >
              <div className="bg-[#9E1B1B] p-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <Sword size={24} className="font-bold" />
                  <h2 className="text-xl font-black uppercase italic font-jagged tracking-widest">Commission Briefing: Project Intel</h2>
                </div>
                <button onClick={() => setShowIntelModal(false)} className="p-2 bg-black/10 rounded-full hover:bg-black/20"><X size={20} /></button>
              </div>
              
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto custom-scrollbar">
                 <section className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Target size={20} className="text-[#9E1B1B]" />
                       <h3 className="text-lg font-black uppercase tracking-widest text-white border-b-2 border-[#9E1B1B]/30 pb-1">Problem Statement</h3>
                    </div>
                    <div className="space-y-4">
                       <p className="text-sm text-white/80 leading-relaxed font-serif italic">
                          "In the face of relentless deadlines—from hackathons to final seminars—the human mind suffers from Information Paralysis. We possess schedules, yet we lack the clarity of the First Form."
                       </p>
                       <p className="text-sm text-white/70 leading-relaxed">
                          Users are often overwhelmed by dense artifacts (PDFs/Spreadsheets/Images) and struggle to synthesize them into immediate tactical steps and professional communication. Yearly Herald solves this by providing 
                          <span className="text-[#9E1B1B] font-bold"> Neural Extraction</span>—turning passive schedules into active battlefield victory paths.
                       </p>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                       <Activity size={20} className="text-[#00B067]" />
                       <h3 className="text-lg font-black uppercase tracking-widest text-white border-b-2 border-[#00B067]/30 pb-1">Technical Implementation</h3>
                    </div>
                    <ul className="space-y-3">
                       {[
                         { label: 'Neural Core', desc: 'Gemini 1.5 Flash with specialized role-prompting (The Breathing Styles).' },
                         { label: 'Frontend', desc: 'React 18 + Tailwind CSS + Framer Motion for cinematic UI transitions.' },
                         { label: 'Multi-Modal', desc: 'Base64 image processing & PDF byte extraction for deep document analysis.' },
                         { label: 'Intelligence Layer', desc: 'Structured JSON output parsing into segmented tactical workflows.' }
                       ].map((item, i) => (
                         <li key={i} className="flex gap-3">
                            <span className="text-[#00B067] font-black">▶</span>
                            <div className="text-xs">
                               <span className="font-bold text-white block">{item.label}</span>
                               <span className="text-white/60">{item.desc}</span>
                            </div>
                         </li>
                       ))}
                    </ul>
                 </section>

                 <section className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="text-[#FBC02D]" />
                       <h3 className="text-lg font-black uppercase tracking-widest text-white border-b-2 border-[#FBC02D]/30 pb-1">Strategic Features</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#FBC02D]/50 transition-all">
                          <h4 className="text-[10px] font-black text-[#FBC02D] uppercase tracking-widest mb-1">Dispatch Recommendations</h4>
                          <p className="text-xs text-white/60">Automated email drafts with "Strategic Intent" specifically crafted for project leads and allies.</p>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#FBC02D]/50 transition-all">
                          <h4 className="text-[10px] font-black text-[#FBC02D] uppercase tracking-widest mb-1">Tactical Logistics</h4>
                          <p className="text-xs text-white/60">An exhaustive Zenitsu-style workflow guide for every identified task, including reference sources.</p>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#FBC02D]/50 transition-all">
                          <h4 className="text-[10px] font-black text-[#FBC02D] uppercase tracking-widest mb-1">The Nichiran Log</h4>
                          <p className="text-xs text-white/60">A prioritized historical timeline of all mission directives with countdown-to-impact tracking.</p>
                       </div>
                    </div>

                    <div className="pt-6 bg-[#9E1B1B]/5 p-6 rounded-2xl border-2 border-[#9E1B1B]/20">
                       <p className="text-[10px] font-black text-[#9E1B1B] uppercase tracking-[0.3em] mb-2">Final Directive</p>
                       <p className="text-xs text-white leading-relaxed italic">
                          "This project serves as a bridge between the chaos of high-stakes scheduling and the precision of victory. It is not just an analyzer; it is an architect of success."
                       </p>
                    </div>
                 </section>
              </div>

              <div className="p-6 bg-[#0D1B2A] border-t-2 border-white/5 flex justify-center">
                 <button onClick={() => setShowIntelModal(false)} className="px-16 py-4 bg-[#9E1B1B] text-white font-black uppercase tracking-[0.4em] rounded-2xl shadow-[0_0_30px_rgba(158,27,27,0.4)] hover:brightness-110 active:scale-95 transition-all">
                    Acknowledge Intelligence
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="h-10 bg-[#0D1B2A] text-[#A8DADC] px-6 flex items-center justify-between text-[9px] shrink-0 font-black relative overflow-hidden border-t-2 border-[#1B263B]">
        <div className="absolute inset-0 bg-[#E63946]/5 pointer-events-none" />
        <div className="flex items-center gap-8 relative z-10 w-full">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-1.5 h-1.5 bg-[#E63946] rounded-full shadow-[0_0_8px_#E63946] animate-pulse"></div>
            <span className="tracking-widest uppercase">Herald Heartbeat: Synchronized</span>
          </div>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <motion.div 
              animate={{ x: ['100%', '-150%'] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              className="text-[#F1FAEE] uppercase tracking-[0.4em] opacity-30 flex gap-24 font-bold"
            >
              <span>Yearly Herald Online... Strategic Buffer: 100%...</span>
              <span>Scanning for Mission Anomalies... Nichiran Updated...</span>
              <span>Hashira Communications established... Crow Dispatch ready for deployment...</span>
            </motion.div>
          </div>
          <div className="text-[10px] shrink-0 opacity-20 italic">v4.0 // YEARLY_HERALD_ACTIVE</div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E63946; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9E1B1B; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes scan {
          0% { transform: translateY(-300%); }
          100% { transform: translateY(300%); }
        }
        .uniform-texture {
          background-color: #161A1D;
          background-image: 
            radial-gradient(circle at 100% 100%, rgba(255,255,255,0.02) 2px, transparent 2px),
            linear-gradient(rgba(22, 26, 29, 0.9), rgba(22, 26, 29, 0.8)),
            url('https://www.transparenttextures.com/patterns/weave.png');
          background-size: 4px 4px, 100% 100%, 200px 200px;
        }
        .tanjiro-checkered {
          background-image: 
            linear-gradient(45deg, #00B067 25%, transparent 25%), 
            linear-gradient(-45deg, #00B067 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #00B067 75%), 
            linear-gradient(-45deg, transparent 75%, #00B067 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
        .font-jagged {
          font-family: 'Impact', 'Arial Black', sans-serif;
          letter-spacing: 0.1em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .muzan-pulse {
          animation: muzan-glow 3s infinite ease-in-out;
        }
        @keyframes muzan-glow {
          0% { box-shadow: 0 0 5px rgba(158,27,27,0.2); border-color: rgba(158,27,27,0.3); }
          50% { box-shadow: 0 0 25px rgba(158,27,27,0.4); border-color: #9E1B1B; }
          100% { box-shadow: 0 0 5px rgba(158,27,27,0.2); border-color: rgba(158,27,27,0.3); }
        }
      ` }} />
    </div>
  );
}
