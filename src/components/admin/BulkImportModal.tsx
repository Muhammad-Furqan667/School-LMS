import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classes: any[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess, classes }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [classId, setClassId] = useState('');
  const [results, setResults] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !classId) {
      toast.error('Please select a file and a target class');
      return;
    }

    setImporting(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const importResults = await SchoolService.bulkRegisterStudents(results.data, classId);
          setResults(importResults);
          toast.success('Batch processing complete');
          onSuccess();
        } catch (error: any) {
          toast.error(error.message || 'Import failed');
        } finally {
          setImporting(false);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900">Batch Onboarding</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">CSV Student Registry</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!results ? (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Grade / Section</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                >
                  <option value="">Select a class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>Grade {c.grade}-{c.section}</option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-emerald-500/50 hover:bg-emerald-50/10 transition-all group relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-white transition-colors">
                    <FileText className="h-8 w-8 text-slate-300 group-hover:text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{file ? file.name : 'Drop your CSV here'}</p>
                    <p className="text-xs text-slate-400">or click to browse local files</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-[10px] text-amber-700 font-black uppercase mb-1">CSV Template Required</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Required columns: <code className="bg-amber-100 px-1 rounded">name</code>, <code className="bg-amber-100 px-1 rounded">roll_no</code>, <code className="bg-amber-100 px-1 rounded">password</code> (optional).
                </p>
              </div>

              <button
                onClick={handleImport}
                disabled={importing || !file || !classId}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                    Processing Registry...
                  </>
                ) : (
                  'Start Batch Processing'
                )}
              </button>
            </>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                 <p className="text-sm font-bold text-emerald-700">Import Sequence Finished</p>
               </div>
               
               <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                 {results.map((res: any, i: number) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                     <span className="font-bold text-slate-700">{res.name}</span>
                     {res.status === 'success' ? (
                       <span className="text-emerald-600 font-bold uppercase text-[9px]">Success</span>
                     ) : (
                       <span className="text-red-500 font-bold uppercase text-[9px]" title={res.message}>Failed</span>
                     )}
                   </div>
                 ))}
               </div>

               <button
                onClick={onClose}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl"
              >
                Close Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
