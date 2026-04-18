# School Management System Implementation Phases

Build a high-end, minimalist School Management System with a White and Emerald-600 UI. The system supports a strict hierarchy (Class to Section to Student), multi-child parent accounts, real-time teacher diaries, and a central fee enforcement lockout.

## Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Sonner (Toasts)
*   **Backend/Cloud:** Supabase (Auth, Postgres DB, Realtime, RLS)
*   **Architecture:** Logic-Isolation. All DB calls must reside in `/src/services/schoolService.ts`.

## Implementation Phases

### Phase 1: Authentication and Profile Synchronization
**Objective:** Resolve database query errors during login and ensure profile synchronization.

*   Introspection: Verify if the profiles table exists and matches Supabase auth.users IDs.
*   Trigger/Sync: Ensure `createSchoolUser` creates both an Auth user and a profiles row.
*   RLS Audit: Apply policy: `CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);`
*   Auth Service: Abstract logic into `/src/services/authService.ts`.
*   **Test Gate:** Log in as a newly created Parent or Teacher. Success is defined by redirection to the dashboard without console errors.

### Phase 2: Relational Hierarchy (Classes and Sections)
**Objective:** Implement the Grade to Section structure.

*   Schema Update: Create sections table (id, class_id (fk), name, capacity).
*   Student Update: Link students to section_id instead of class_id.
*   Admin UI: Build a Dynamic Class Creator with `useFieldArray` to manage sections.
*   Service: Implement `createClassWithSections` as a single SQL transaction.
*   **Test Gate:** Create "Grade 10" with multiple sections. Verify the database hierarchy.

### Phase 3: Smart Enrollment and Multi-Child Linking
**Objective:** Support parents with multiple children across different classes.

*   Enrollment Form: Build student enrollment with dependent dropdowns (Class to Section to Student).
*   Parent Linker: Build a Parent creation form with multi-child support.
*   Multi-Link Logic: Allow linking multiple student IDs to one parent ID.
*   Edit Mode: Enable adding new children to existing parent profiles.
*   **Test Gate:** Create one parent profile and link two students from different grades. Verify mapping in the students table.

### Phase 4: Teacher Workplace
**Objective:** Enable teachers to manage diaries and view schedules.

*   Assignments: Create `teacher_assignments` (Teacher + Class + Subject).
*   Diary Logic: Build "Add Diary" form. Teacher selects assigned Class and Subject to add content.
*   Timetable: Build a grid view of the teacher's specific weekly assignment slots.
*   **Test Gate:** Log in as a Teacher, save a diary entry, and verify it links to the correct assignment ID.

### Phase 5: Parent Monitor
**Objective:** High-fidelity dashboard for parents to track all children.

*   Child Switcher: Sidebar or dropdown to toggle between linked siblings.
*   Modules:
    *   Diary: Card view (hide subjects with no content).
    *   Fees: Status badge (Emerald for Paid, Red for Unpaid).
    *   Timetable: Weekly grid for the active child.
*   Mobile UI: Implement fixed bottom navigation icons.
*   **Test Gate:** Switch between siblings and verify that diary and fee data updates instantly.

### Phase 6: Real-time Communication Engine
**Objective:** Instant school-wide or group-specific communication.

*   Broadcast Table: Create notifications (id, target_role [all, parent, teacher], message).
*   Real-time Hub: Setup `supabase.channel()` listeners in Teacher and Parent dashboards.
*   Toast System: Use Sonner for instant popup alerts when a broadcast or diary is posted.
*   **Test Gate:** Admin sends a notification; verify instant alert in the target user's window.

### Phase 7: Fee Enforcement Lockout
**Objective:** Automated application lockout for pending fees.

*   Lock Logic: Add `is_locked` (boolean) to the students table.
*   UI Guard: Build a global `LockoutGuard` component. If `activeStudent.is_locked` is true, show a red and white overlay.
*   Admin Toggle: Add a "Warn/Lock" toggle to the Admin Student List.
*   **Test Gate:** Lock a student and verify the parent is instantly blocked. Unlock and verify immediate access restoration.

### Phase 8: UI Integration and Polish
**Objective:** Final visual overhaul to match the professional Emerald theme.

*   Style Sync: Apply professional designs to all components.
*   Design Rules: Use `bg-slate-50` for backgrounds, `bg-white` for cards, and `emerald-600` for primary actions.
*   Refactoring: Ensure all components are modular and follow logic-isolation rules.

## Final Universal Stress Test

| Test ID | Scenario | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| ST-01 | Auth Integrity | All created users have entries in the profiles table. | Pending |
| ST-02 | Hierarchy | Deleting a section handles students in that section correctly. | Pending |
| ST-03 | Security/RLS | Unauthorized users cannot access unlinked student fees via API. | Pending |
| ST-04 | Real-time | UI updates in under 1 second when a teacher adds a diary entry. | Pending |
| ST-05 | Lockout | Red overlay is non-dismissible when a student is locked. | Pending |
| ST-06 | Performance | Switching between siblings occurs in under 200ms. | Pending |

**Current Priority:** Phase 1 (Resolving Database Query Login Error)
**Action:** Audit the profiles table and the auth.users relationship.