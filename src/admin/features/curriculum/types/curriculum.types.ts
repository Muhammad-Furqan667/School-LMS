export interface Subject {
  id: string;
  name: string;
  grade_level: string;
  [key: string]: any;
}

export interface Lecture {
  id: string;
  title: string;
  content_url: string;
  subject_id: string;
  subjects?: {
    name: string;
  };
  [key: string]: any;
}

export interface LectureFormState {
  title: string;
  content_url: string;
  subject_id: string;
}
