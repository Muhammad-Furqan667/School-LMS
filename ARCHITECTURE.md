# School LMS Architecture Guide

This project follows a **Feature-Sliced Design (FSD)** architecture. It is designed to be highly modular, scalable, and intuitive for new developers.

## 🏗️ Project Structure

The codebase is organized by **Portal** and **Feature**.

### 1. `src/pages/`
Contains the top-level route components. For Admin features, these are now **lightweight wrappers** that import feature modules from `src/admin/features/`.

### 2. `src/admin/features/`
This is the heart of the application logic. Each directory represents a standalone feature:
- `students/`: Enrollment, registry, and profile management.
- `teachers/`: Faculty data, assignments, and actions.
- `classes/`: Classrooms, timetables, and session-based attendance.
- `curriculum/`: Subjects/Courses and digital Video Syllabus.
- `attendance/`: Global institutional attendance logs.
- `fees/`: Financial ledgers and student-specific fee cards.
- `audit/`: System health and identity repair tools.
- `tasks/`: Admin-to-Teacher directives (Planner).

### 3. `src/services/`
The `SchoolService.ts` acts as the **Data Access Layer**. 
- **Rule**: UI components and Hooks should *never* call Supabase directly. They must use `SchoolService`.

---

## 🛠️ Anatomy of a Feature

Each feature directory (e.g., `src/admin/features/students/`) follows a strict sub-structure:

| Directory | Purpose |
|-----------|---------|
| `components/` | Focused UI components (Tables, Modals, Stats). |
| `hooks/` | Business logic and state management (React Hooks). |
| `types/` | TypeScript interfaces and type definitions. |

### The "Feature Aggregator" Pattern
Each feature has a main component (e.g., `StudentConsoleFeature.tsx`) that orchestrates the sub-components and hooks. This aggregator is what's exported to the `src/pages/` wrappers.

---

## 🚀 How to Add a New Feature

1. **Define Types**: Create `src/admin/features/[new-feature]/types/`.
2. **Implement Service**: Add necessary database methods to `SchoolService.ts`.
3. **Create Hook**: Extract logic into `src/admin/features/[new-feature]/hooks/`.
4. **Build UI**: Create small, focused components in `src/admin/features/[new-feature]/components/`.
5. **Create Wrapper**: Create a new page in `src/pages/admin/` and link it in the router.

---

## ⚓ Logic Isolation Principle
- **UI stays clean**: Components only handle rendering and user interactions.
- **Hooks handle state**: Data fetching, filtering, and side effects live here.
- **Services handle data**: API calls and database transformations live here.

This ensures that if we ever switch from Supabase to another backend, we only need to update the `src/services/` layer.
