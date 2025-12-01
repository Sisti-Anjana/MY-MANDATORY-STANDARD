## Portfolio-Hour Session Sheet Concept

### Overview

Instead of logging every detail per hour in separate tickets, the idea is to give each **portfolio-hour** a single **“session sheet”** that aggregates all sites and cases for that hour.

When a user selects a portfolio and hour, they work inside this one session sheet instead of creating many separate tickets.

### Core Idea

- **One session per portfolio + hour + monitor**
  - Fields:
    - Portfolio (e.g. Aurora)
    - Hour (e.g. 10)
    - Monitored By (auto-filled from logged-in user)
    - Overall **Issue Present: Yes/No**
    - **All Sites Checked: Yes/No**
    - Optional overall notes

- **Subtasks inside the session**
  - If there are issues, the user adds **structured subtasks**:
    - Site name
    - Case number
    - Short issue description
    - Issues missed by (optional)
    - Status
  - Each subtask:
    - Is added **inline** in the same panel
    - **Auto-saves** without leaving the sheet
    - Can be edited or deleted directly in the list

### User Flow

1. User selects a portfolio card and hour they are working on.
2. A **session sheet panel** opens (drawer or modal) with:
   - Header showing Portfolio, Hour, Monitored By.
   - Toggles for **Issue Present** and **All Sites Checked**.
3. In the same panel, there is a **subtask list**:
   - Existing sub-issues for that hour are shown as rows.
   - “Add row” lets the user add more issues (site + case + notes).
4. Each row saves instantly; editing just modifies that row.
5. When finished, the user closes the sheet; dashboard and Issue Details can then show:
   - One entry per portfolio-hour,
   - With a count of sub-issues and overall status.

### Benefits

- Users **do not need to create many separate tickets** for the same hour.
- All issues for a portfolio-hour are **grouped in one place**, easier to review.
- Editing is faster: **modify rows** inside the sheet instead of opening separate forms.
- The data model becomes clearer (one session + multiple subtasks).

### Status

This file captures the **agreed concept** only.  
Implementation will be done later, making sure it does **not break existing functionality** and is rolled out in phases.*** End Patch```} %}

