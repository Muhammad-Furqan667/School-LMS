export interface Student {
  id: string;
  name: string;
  roll_no: string;
  class_id?: string;
  father_name?: string;
  cnic?: string;
  parent_cnic?: string;
  is_locked?: boolean;
  classes?: {
    grade: string;
    section: string;
    academic_year_id?: string;
  };
  parents?: {
    profile_id?: string;
  };
  fees?: any[];
  [key: string]: any;
}

export interface Class {
  id: string;
  grade: string;
  section: string;
  academic_year_id?: string;
  [key: string]: any;
}

export interface StudentFormState {
  id?: string;
  name: string;
  roll_no: string;
  class_id: string;
  father_name: string;
  cnic: string;
  parent_cnic: string;
  password?: string;
  admission_date?: string;
  academic_year_id?: string;
  status?: string;
  profile_picture_url?: string;
}

export interface FeeFormState {
  id?: string;
  month: string;
  amount_paid: string;
  status: string;
  items: Array<{ category: string; amount: number }>;
}

export interface AcademicSession {
  label: string;
  results: any[];
  totalMarks: number;
  obtainedMarks: number;
}

export interface AcademicResults {
  current: any[];
  past: AcademicSession[];
}
