export interface Class {
  id: string;
  grade: string;
  section: string;
  academic_year_id?: string;
  academic_years?: {
    year_label: string;
    is_current: boolean;
  };
  class_teacher_id?: string;
  class_teacher?: {
    id: string;
    full_name: string;
  };
  [key: string]: any;
}

export interface ClassFormState {
  grade: string;
  section: string;
  class_teacher_id: string;
  academic_year_id: string;
}

export interface TimetableSlot {
  id: string;
  assignment_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  assignment?: {
    subject?: {
      name: string;
    };
    teacher?: {
      full_name: string;
    };
  };
}

export interface TimetableFormState {
  assignment_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export interface AttendanceRecord {
  id?: string;
  student_id: string;
  assignment_id: string;
  date: string;
  status: string;
  created_at?: string;
}
