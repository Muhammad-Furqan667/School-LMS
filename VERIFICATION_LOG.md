# Master Verification Log: School Management System

**Role**: Lead QA Automation Engineer & Cybersecurity Auditor
**Audit Status**: 🟠 Phase 1: Introspection & Identity Initialization

---

## 🏗️ Phase 1: System Introspection
- [x] **Logic Isolation**: All DB interactions moved to `src/services/schoolService.ts`.  
- [ ] **UI Spec Check**: Emerald Minimalist compliance (Emerald-600, White BG, Rounded-XL).
- [x] **RLS Verification**: `fees`, `diary`, and `students` show `rowsecurity: true`.

---

## 📋 The Master Test Ledger

### Cluster A: Admin & Identity (The Foundation)
- [ ] **AUTH_01**: Create Parent/Teacher IDs with school-format usernames. (Verify no real email needed).
- [ ] **ADMIN_01**: Assign 1 Teacher to multiple Classes/Subjects. Verify Junction Table integrity.
- [ ] **ADMIN_02**: Perform 'Academic Year Promotion'. Verify students move classes but 'fees' history remains.
- [ ] **ADMIN_03**: Send OTA Broadcast. Verify targeting (e.g., Send to 'Teachers Only').

### Cluster B: Teacher Workplace (Logic & UI)
- [ ] **TCH_01**: Verify 'Class Select' and 'Subject Select' dropdowns only show assigned slots.
- [ ] **TCH_02**: Add Diary entry. Verify content saves to cloud with correct timestamp.
- [ ] **TCH_03**: Timetable check. Verify Teacher sees their specific weekly slots.

### Cluster C: Parent Monitor (Multi-Child & Real-time)
- [ ] **PAR_01**: Switch Student. Verify Sidebar correctly toggles between siblings.
- [ ] **PAR_02**: Diary Filtering. Verify subjects with EMPTY content are hidden from the UI.
- [ ] **PAR_03**: Settings. Verify Parent can update their phone number successfully.
- [ ] **PAR_04**: Real-time Diary. Verify instant 'Toast' notification when Teacher saves an entry.

### Cluster D: The "Big Red" Stress Test (Critical)
- [ ] **LOCK_01**: Admin toggles 'Warn' on Student A. Verify Parent A's device instantly shows the Red Overlay.
- [ ] **LOCK_02**: DOM Audit. Verify the Red Overlay is a 'Modal Trap' (User cannot scroll or click elements behind it).
- [ ] **LOCK_03**: Admin toggles 'Stop Warning'. Verify Red Overlay vanishes instantly via Realtime.

### Cluster E: Security & RLS Bypass (Hacking Attempt)
- [ ] **SEC_01**: Attempt to fetch Fee ID #999 (another student) using a Parent's session token. (Audit Result: 403 Forbidden).
- [ ] **SEC_02**: Attempt to 'Write' to the Diary table using a Parent's session. (Audit Result: Access Denied).

---

## 🛠️ Execution Progress & RCA (Root Cause Analysis)

| Test ID | Status | Notes / RCA | Fix |
|:---:|:---:|:---|:---|
| **INTRO_01** | PASS | Logic Isolation grep check. | Moved `App.tsx` logic to service. |
| **INTRO_02** | PASS | RLS check on core tables. | Verified in PostgreSQL. |
| | | | |
