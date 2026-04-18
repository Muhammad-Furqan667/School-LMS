import React, { useState, useEffect } from 'react';
import { X, Book, DollarSign, User, Award, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    grade_level: 5,
    teacher_id: '',
    pricing_type: 'free',
    price: 0,
    discounted_price: 0,
    status: 'active',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('id, full_name');
    setTeachers(data || []);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('subjects')
        .insert([formData]);

      if (error) throw error;
      
      toast.success('Course subject created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <Book className="h-5 w-5 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900">Configure New Subject</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Syllabus & Pricing Engine</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors border border-slate-200 shadow-sm">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Subject Name</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. Mathematics - Advanced"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Level</label>
            <select
              value={formData.grade_level}
              onChange={(e) => setFormData({ ...formData, grade_level: parseInt(e.target.value) })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Instructor</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <select
                required
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none"
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
               <DollarSign className="h-4 w-4 text-emerald-600" />
               Fee & Pricing Configuration
            </h3>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billing Model</label>
            <select
              value={formData.pricing_type}
              onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            >
              <option value="free">Free Access</option>
              <option value="one_time">One-time Payment</option>
              <option value="monthly">Monthly Subscription</option>
            </select>
          </div>

          {formData.pricing_type !== 'free' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Base Price (PKR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Discount Price</label>
                <input
                  type="number"
                  value={formData.discounted_price}
                  onChange={(e) => setFormData({ ...formData, discounted_price: parseFloat(e.target.value) })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>
            </div>
          )}

          <div className="md:col-span-2 space-y-4 pt-4">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Description</label>
             <textarea 
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 outline-none resize-none"
               placeholder="Brief syllabus overview..."
             />
             
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Award className="h-5 w-5 text-indigo-400" />
              {loading ? 'Initializing Content...' : 'Deploy Course Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
