# Dashboard & Log Issues – Plain Language Guide

## 1) What you see on the Dashboard
- A grid of portfolio cards (26 portfolios).  
- Each card shows status color and a small badge like `H 0` or `Y 10`.  
- A “+ Log New Issue” button and a small search box above the grid.  
- Tabs on top: “Dashboard & Log Issues”, “Issue Details”, and others.

## 2) Locking a portfolio (clicking a card)
- Click any portfolio card → a modal opens with options (Log Issue, View Issues, Unlock, etc.).  
- When you choose to log for that portfolio/hour, the system creates a **lock** in the background:
  - It ties *that portfolio* + *that hour* to *your user/session*.
  - While locked, the card gets a **thick purple border** to show it’s reserved.
- Only one portfolio can be locked by you at a time (per current hour).  
- Admins can override locks; hour change auto-releases old locks.

## 3) What happens in the form (bottom “Log Issue” section)
- The form sits below the coverage chart (still on the Dashboard tab).  
- When a portfolio is preselected from the card:
  - The **Portfolio** dropdown is already filled and highlighted.  
  - The **Hour** field is fixed to the locked hour (disabled) so you can’t change it.  
  - The **Monitored By** box shows your name on a green “Locked” pill and cannot be changed.  
  - A purple info bar may appear saying the portfolio is locked for you, or an error if locked by someone else.  
- Fields present:
  - Portfolio (required, prefilled when coming from a card)
  - Hour (0–23, locked to reservation hour)
  - Site (optional, filtered by portfolio)
  - Issue Present (Yes/No) — if No, details auto-fill to “No issue” and “Missed By” is disabled
  - Issue Details (required when Issue Present = Yes)
  - Case Number (optional)
  - Monitored By (required, locked to you)
  - Issues Missed By (only enabled if Issue Present = Yes)
  - Date/Time (read-only, current timestamp)
  - Log Ticket button
- After submit:
  - The issue is saved; lock is **not** released automatically (you can log multiple issues).  
  - Lock is released when you mark “All Sites Checked = Yes”, the hour changes, or an admin unlocks.

## 4) The H 0 / Y 0 badge on cards
- Tiny badge at top-right of each card:  
  - `H X` = Last activity hour today. Example: `H 0` means last issue logged at hour 0 today.  
  - `Y X` = Last activity was yesterday (or earlier). Example: `Y 10` means last activity at hour 10 on the previous day.  
  - `H -` = No activity recorded.

## 5) Status colors on cards (today’s activity)
- 🟢 Updated (<1h) – logged this hour and sites confirmed.  
- 🔵 1h Inactive – last activity 1 hour ago.  
- 🟡 2h Inactive – last activity 2 hours ago.  
- 🟠 3h Inactive – last activity 3 hours ago.  
- 🔴 No Activity (4h+) – 4+ hours with no activity or none today.  
- If “All Sites Checked” is set to Yes for the current hour, the card stays green for that hour.

## 6) Navigating to Issue Details (“View Issues” flow)
- Click a portfolio card → choose **“View Issues”** in the modal.  
- You are switched to the **Issue Details** tab with that portfolio pre-selected.  
- Issue Details tab shows a filterable list of issues with columns:
  - Portfolio, Hour, Issue Present (Yes/No), Description, Case #, Monitored By, Date/Time, Missed By, Actions (Edit/Delete for admin).
- You can filter by portfolio, hour, and date; edit is restricted to the user who logged the issue (and lock checks still apply).

## 7) Right-side session drawer (when active)
- When you lock a portfolio for the current hour, a right-side drawer can open (session view) showing:
  - The portfolio name and hour you’re working on.
  - Quick context for the current session.
  - This is purely informational and tied to your active lock.

## 8) Quick behaviors and rules
- Locks are per portfolio + hour + user/session.  
- One lock per user at a time (per current hour) until you complete/release.  
- “All Sites Checked = Yes” releases all locks for that portfolio so others can take it.  
- Hour change auto-clears prior-hour locks.  
- Admins can unlock any portfolio from the Admin Panel.  
- Form validation: Portfolio, Issue Present, Monitored By are required; Issue Details required when “Yes”.

## 9) If you need a Word copy
- Open this markdown in Word (File → Open) and save as .docx, or convert with `pandoc Dashboard_Log_Issues_Explained.md -o Dashboard_Log_Issues_Explained.docx`.



