import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

export const PromotionConsoleFeature: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [sourceClass, setSourceClass] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [selectedYearId, setSelectedYearId] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [cls, years] = await Promise.all([
        SchoolService.getClasses(),
        SchoolService.getAcademicYears()
      ]);
      setClasses(cls);
      setAcademicYears(years);
      
      const current = years.find(y => y.is_current);
      if (current) setSelectedYearId(current.id);
    } catch (error) {
      toast.error('Failed to load metadata');
    }
  };

  const fetchStudents = async (classId: string) => {
    if (!classId) return;
    try {
      setLoading(true);
      const data = await SchoolService.getStudentsForPromotion(classId);
      setStudents(data);
      // Auto-select those who passed
      const passedIds = data
        .filter((s: any) => s.results?.some((r: any) => r.status === 'pass'))
        .map((s: any) => s.id);
      setSelectedIds(passedIds);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!targetClass) {
      toast.error('Please select a target class');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('No students selected for promotion');
      return;
    }

    let currentYearId = academicYears.find(y => y.is_current)?.id;
    
    // If not in state, re-fetch
    if (!currentYearId) {
      const freshYears = await SchoolService.getAcademicYears();
      const current = freshYears.find(y => y.is_current);
      if (current) currentYearId = current.id;
      
      if (!currentYearId && freshYears.length > 0) {
        currentYearId = freshYears[0].id;
      }
      if (freshYears.length > 0) setAcademicYears(freshYears);
    }

    if (!currentYearId) {
      toast.error('No sessions found. Please create an academic year in the Promotions console first.');
      return;
    }

    try {
      setProcessing(true);
      await SchoolService.promoteStudents(selectedIds, targetClass, currentYearId);
      toast.success(`${selectedIds.length} students promoted successfully!`);
      fetchStudents(sourceClass);
    } catch (error) {
      toast.error('Promotion failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-emerald-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Year-End Promotion Engine</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Academic Advancement</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
            <div className="px-6 py-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Active Session</p>
              <p className="text-sm font-black text-slate-900">
                {academicYears.find(y => y.is_current)?.year_label || 'Initializing...'}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Session Transition Hub */}
          <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <RefreshCw className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-black text-white">Session Transition</h3>
              </div>
              
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Retire the current active session and initialize the next academic cycle. 
                <span className="text-emerald-400 block mt-1">This will automatically archive the current session.</span>
              </p>

              <button 
                onClick={async () => {
                  const label = prompt('Enter next session label (e.g. 2025-26):');
                  if (!label) return;
                  
                  if (!confirm(`Are you sure you want to promote the school to ${label}? The current session will be archived.`)) return;

                  try {
                    setProcessing(true);
                    await SchoolService.upsertAcademicYear({ year_label: label, is_current: true });
                    toast.success(`Academic Cycle ${label} is now ACTIVE.`);
                    fetchMetadata();
                  } catch (e) {
                    toast.error('Failed to transition session');
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {processing ? 'Processing Transition...' : 'Initialize Next Session'}
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">View Specific Session Records</label>
              <div className="flex gap-2">
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer text-slate-900"
                >
                  <option value="">Select Session</option>
                  {academicYears.length > 0 ? academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.year_label} {y.is_current ? '(Current Active)' : '(Archived)'}</option>
                  )) : (
                    <option disabled>No Sessions Found</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Step 1: Source Grade</label>
              <select
                value={sourceClass}
                onChange={(e) => {
                  setSourceClass(e.target.value);
                  fetchStudents(e.target.value);
                }}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-900 appearance-none cursor-pointer"
              >
                <option value="">Select Origin Class</option>
                {classes.filter(c => c.academic_year_id === selectedYearId || !c.academic_year_id).length > 0 ? 
                  classes.filter(c => c.academic_year_id === selectedYearId || !c.academic_year_id).map(c => (
                    <option key={c.id} value={c.id}>
                      Grade {c.grade} - {c.section} {!c.academic_year_id ? '(Needs Repair)' : ''}
                    </option>
                  )) : (
                  <option disabled>No classes for this session</option>
                )}
              </select>
              {classes.some(c => !c.academic_year_id) && (
                <button 
                  onClick={async () => {
                    if (selectedYearId) {
                      await SchoolService.linkOrphanClasses(selectedYearId);
                      toast.success('Classes linked to current session');
                      fetchMetadata();
                    } else {
                      toast.error('Select a session first');
                    }
                  }}
                  className="text-[9px] text-emerald-600 font-bold mt-2 uppercase tracking-tight flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Auto-assign classes to this session
                </button>
              )}
            </div>

            <div className="flex justify-center">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Step 2: Target Grade</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-900 appearance-none cursor-pointer"
              >
                <option value="">Select Promotion Target</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Grade {c.grade} - {c.section} ({academicYears.find(y => y.id === c.academic_year_id)?.year_label})</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={handlePromote}
                disabled={processing || selectedIds.length === 0}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {processing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>Execute Advancement ({selectedIds.length})</>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold mt-6 italic">
                * Selected students will be migrated to the target section and their academic history will be archived.
              </p>
            </div>
          </div>
        </div>

        {/* Student Selection Table */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Candidates for Promotion</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Manual Override Enabled</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedIds(students.map(s => s.id))}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  Select All
                </button>
                <button 
                   onClick={() => setSelectedIds([])}
                   className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Academic Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score %</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Financials</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Promote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Analyzing Comprehensive Records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                        Select an origin class to view candidates
                      </td>
                    </tr>
                  ) : (
                    students.map(student => {
                      const result = student.results?.[0]; 
                      const isPassed = result?.status === 'pass';
                      const isSelected = selectedIds.includes(student.id);
                      
                      const percentage = result ? Math.round((result.marks_obtained / result.total_marks) * 100) : 0;
                      
                      const totalDue = (student.fees || []).reduce((acc: number, f: any) => acc + Number(f.amount_due || 0), 0);
                      const totalPaid = (student.fees || []).reduce((acc: number, f: any) => acc + Number(f.amount_paid || 0), 0);
                      const balance = totalDue - totalPaid;
                      const isClear = balance <= 0;

                      return (
                        <tr key={student.id} className={`hover:bg-slate-50/50 transition-all ${isSelected ? 'bg-emerald-50/10' : ''}`}>
                          <td className="px-8 py-5">
                            <Link 
                              to={`/admin/students/${student.id}`}
                              className="font-black text-slate-900 hover:text-emerald-600 transition-colors"
                            >
                              {student.name}
                            </Link>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.roll_no}</p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              isPassed 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : result?.status === 'fail'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              {isPassed ? 'PASS' : result?.status === 'fail' ? 'FAIL' : 'PENDING'}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`text-xs font-black ${percentage >= 80 ? 'text-emerald-600' : percentage >= 40 ? 'text-indigo-600' : 'text-rose-600'}`}>
                              {percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isClear ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isClear ? 'Clear' : 'Pending'}
                              </span>
                              {!isClear && (
                                <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                                  PKR {balance.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => {
                                setSelectedIds(prev => 
                                  prev.includes(student.id) 
                                    ? prev.filter(id => id !== student.id)
                                    : [...prev, student.id]
                                );
                              }}
                              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all mx-auto lg:ml-auto ${
                                isSelected 
                                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                                  : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
