import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function populate() {
  console.log('🚀 Starting Academic Data Population...');

  // 1. Ensure Academic Years
  console.log('📅 Setting up Academic Years...');
  const years = [
    { year_label: 'Session 2022-23', is_current: false },
    { year_label: 'Session 2023-24', is_current: false },
    { year_label: 'Session 2024-25', is_current: true }
  ];

  for (const year of years) {
    const { data: existing } = await supabase.from('academic_years').select('id').eq('year_label', year.year_label).single();
    if (!existing) {
       await supabase.from('academic_years').insert(year);
    } else {
       await supabase.from('academic_years').update({ is_current: year.is_current }).eq('id', existing.id);
    }
  }

  // Fetch IDs
  const { data: year2022 } = await supabase.from('academic_years').select('id').eq('year_label', 'Session 2022-23').single();
  const { data: year2023 } = await supabase.from('academic_years').select('id').eq('year_label', 'Session 2023-24').single();
  const { data: yearCurr } = await supabase.from('academic_years').select('id').eq('is_current', true).limit(1).single();

  // 2. Ensure Subjects for Grades 1, 2, and 5/10
  console.log('📚 Setting up Core Subjects...');
  const subjectsToCreate = [
    { name: 'Mathematics', grade_level: '1' },
    { name: 'English', grade_level: '1' },
    { name: 'Mathematics', grade_level: '2' },
    { name: 'Geography', grade_level: '2' },
    { name: 'Physics', grade_level: '10' },
    { name: 'Chemistry', grade_level: '10' }
  ];

  for (const subj of subjectsToCreate) {
     const { data: existing } = await supabase.from('subjects').select('id').match(subj).single();
     if (!existing) await supabase.from('subjects').insert(subj);
  }

  // 3. Populate Results for all Students
  console.log('👨‍🎓 Populating Student Results...');
  const { data: students } = await supabase.from('students').select('id, class_id, classes(grade)');
  
  if (!students) return console.error('No students found');

  for (const student of students) {
    // History for Grade 1 (2022)
    const { data: subjectsG1 } = await supabase.from('subjects').select('id').eq('grade_level', '1');
    if (subjectsG1) {
      for (const s of subjectsG1) {
        await supabase.from('results').upsert({
          student_id: student.id,
          subject_id: s.id,
          academic_year_id: year2022?.id,
          exam_type: 'Annual',
          status: 'pass',
          marks_obtained: 85,
          total_marks: 100
        }, { onConflict: 'student_id,subject_id,academic_year_id,exam_type' });
      }
    }

    // History for Grade 2 (2023)
    const { data: subjectsG2 } = await supabase.from('subjects').select('id').eq('grade_level', '2');
    if (subjectsG2) {
      for (const s of subjectsG2) {
        await supabase.from('results').upsert({
          student_id: student.id,
          subject_id: s.id,
          academic_year_id: year2023?.id,
          exam_type: 'Annual',
          status: 'pass',
          marks_obtained: 78,
          total_marks: 100
        }, { onConflict: 'student_id,subject_id,academic_year_id,exam_type' });
      }
    }

    // Current Grade Results (Pending)
    const currentGrade = (student.classes as any)?.grade || '1';
    const { data: subjectsCurr } = await supabase.from('subjects').select('id').eq('grade_level', currentGrade);
    if (subjectsCurr) {
      for (const s of subjectsCurr) {
        await supabase.from('results').upsert({
          student_id: student.id,
          subject_id: s.id,
          academic_year_id: yearCurr?.id,
          exam_type: 'Annual',
          status: 'pending',
          marks_obtained: 0,
          total_marks: 100
        }, { onConflict: 'student_id,subject_id,academic_year_id,exam_type' });
      }
    }
  }

  console.log('✅ Academic Data Population Complete!');
  process.exit(0);
}

populate().catch(console.error);
