-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.academic_years (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year_label text NOT NULL UNIQUE,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_years_pkey PRIMARY KEY (id)
);
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL,
  assignment_id uuid,
  status text DEFAULT 'present'::text CHECK (status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text])),
  remarks text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT attendance_assignment_fkey FOREIGN KEY (assignment_id) REFERENCES public.teacher_assignments(id),
  CONSTRAINT unique_attendance UNIQUE (student_id, date, assignment_id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grade text NOT NULL,
  section text NOT NULL,
  academic_year_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.diary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT diary_pkey PRIMARY KEY (id),
  CONSTRAINT diary_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.teacher_assignments(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  price_at_enrollment numeric NOT NULL DEFAULT 0,
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['paid'::text, 'pending'::text, 'cancelled'::text])),
  enrollment_status text DEFAULT 'active'::text CHECK (enrollment_status = ANY (ARRAY['active'::text, 'completed'::text, 'dropped'::text])),
  enrolled_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT enrollments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.fees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  amount_due numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status = ANY (ARRAY['Paid'::text, 'Unpaid'::text])),
  month text NOT NULL,
  year_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fees_pkey PRIMARY KEY (id),
  CONSTRAINT fees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT fees_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.lectures (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject_id uuid NOT NULL,
  title text NOT NULL,
  content_url text,
  content_body text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lectures_pkey PRIMARY KEY (id),
  CONSTRAINT lectures_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  target_role text NOT NULL CHECK (target_role = ANY (ARRAY['all'::text, 'teacher'::text, 'parent'::text])),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.parents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE,
  full_name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parents_pkey PRIMARY KEY (id),
  CONSTRAINT parents_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'teacher'::text, 'parent'::text])),
  phone_number text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  subject_id uuid,
  teacher_id uuid,
  marks_obtained numeric NOT NULL,
  total_marks numeric NOT NULL DEFAULT 100,
  exam_type text NOT NULL,
  academic_year_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pass'::character varying, 'fail'::character varying, 'pending'::character varying]::text[])),
  CONSTRAINT results_pkey PRIMARY KEY (id),
  CONSTRAINT results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT results_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT results_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id),
  CONSTRAINT results_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.student_class_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  class_id uuid,
  academic_year_id uuid,
  promoted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_class_history_pkey PRIMARY KEY (id),
  CONSTRAINT student_class_history_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_class_history_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT student_class_history_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_no text NOT NULL,
  class_id uuid,
  parent_id uuid,
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  father_name text,
  cnic text,
  parent_cnic text,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT students_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id)
);
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  teacher_id uuid,
  pricing_type text DEFAULT 'free'::text CHECK (pricing_type = ANY (ARRAY['free'::text, 'one_time'::text, 'monthly'::text])),
  price numeric DEFAULT 0,
  discounted_price numeric,
  grade_level integer CHECK (grade_level >= 1 AND grade_level <= 10),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['active'::text, 'draft'::text, 'archived'::text])),
  description text,
  thumbnail_url text,
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);
CREATE TABLE public.teacher_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid,
  class_id uuid,
  subject_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id),
  CONSTRAINT teacher_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT teacher_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE,
  full_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  salary numeric DEFAULT 0,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teachers_pkey PRIMARY KEY (id),
  CONSTRAINT teachers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.timetable (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  day_of_week text NOT NULL CHECK (day_of_week = ANY (ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text, 'Saturday'::text, 'Sunday'::text])),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timetable_pkey PRIMARY KEY (id),
  CONSTRAINT timetable_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.teacher_assignments(id)
);