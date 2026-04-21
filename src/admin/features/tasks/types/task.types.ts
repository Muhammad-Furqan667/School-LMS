export interface TeacherTask {
  id: string;
  admin_id: string;
  assignment_id: string;
  task_description: string;
  target_date: string;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
  admin?: {
    username: string;
  };
  assignment?: {
    id: string;
    class?: {
      grade: string;
      section: string;
    };
    subject?: {
      name: string;
    };
    teacher?: {
      full_name: string;
    };
  };
}

export interface TaskFormState {
  assignment_id: string;
  task_description: string;
  target_date: string;
}
