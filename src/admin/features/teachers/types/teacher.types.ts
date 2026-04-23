export interface Teacher {
  id: string;
  full_name: string;
  salary?: number;
  joined_at?: string;
  created_at?: string;
  profile_id?: string;
  teacher_assignments?: any[];
  [key: string]: any;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  subject?: {
    name: string;
    code?: string;
  };
  class?: {
    grade: string;
    section: string;
  };
}

export interface HireFormState {
  full_name: string;
  username: string;
  password: string;
  salary: number;
  subject_id: string;
  class_id: string;
}

export interface EditFormState {
  full_name: string;
  salary: number;
  username: string;
  password: string;
  joined_at: string;
}

export interface AssignFormState {
  subject_id: string;
  class_id: string;
}
