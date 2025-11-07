# Portfolio Issue Tracker - Simplified Form Update

## Changes Made

### 1. Database Schema Updates (`server/database.js`)
- **Removed Fields:**
  - `site_id` - No longer tracking individual sites
  - `reporter_name` - Not needed per requirements

- **Added/Modified Fields:**
  - `issue_present` (TEXT) - "Yes" or "No" radio selection
  - `issue_hour` (INTEGER) - User-selected hour (0-23)
  - `issue_details` (TEXT) - Optional, enabled only when issue_present = "Yes"
  - `case_number` (TEXT) - Optional case reference
  - `monitored_by` (TEXT) - Person monitoring
  - `issues_missed_by` (TEXT) - Person who missed the issue
  - `created_at` (DATETIME) - Auto-generated timestamp

### 2. Issue Form Component (`client/src/components/IssueForm.js`)
**New Form Layout:**

**Row 1: 4 Fields in Grid**
- Portfolio (Dropdown) - Required
- Hour (Dropdown 0-23) - Required  
- Case # (Text Input) - Optional
- Monitored By (Dropdown) - Optional
  - Options: Kumar S, Rajesh K, Bharat Gu, Anita P, Deepa L, Manoj D, Vikram N, Ravi T, Lakshmi B

**Row 2: Issue Present**
- Radio Buttons (Required):
  - Yes (with red background)
  - No

**Row 3: Issue Description**
- Text Input - **Enabled ONLY when "Yes" is selected**
- Automatically disabled when "No" is selected
- Automatically clears when switching from "Yes" to "No"

**Row 4: Two Fields**
- Date/Time (Auto-filled, Read-only) - Shows current date/time
- Issues Missed By (Dropdown) - Optional
  - Options: Lakshmi B, Deepa L, Manoj D, Vikram N, Anita P, Ravi T, Kumar S, Rajesh K, Bharat Gu, BXJBSA, utfzytf, 76tyjtv, HJVXHASV, kinny

**Submit Button:**
- "Log Ticket" button at bottom right

### 3. Issues Table Component (`client/src/components/IssuesTable.js`)
**Updated Table Columns:**
1. Portfolio
2. Hour
3. Issue Present (with color coding: Red for Yes, Green for No)
4. Issue Description
5. Case #
6. Monitored By
7. Date/Time
8. Issues Missed By
9. Actions (Edit button)

**Filter Section:**
- Date Filter (dd-mm-yyyy format)
- Hour Filter (dropdown)
- Show All Issues (checkbox)
- Clear Filters button

### 4. Server API Updates (`server/index.js`)
**POST /api/issues**
- Validates: portfolio_id, issue_hour, issue_present
- If issue_present = "Yes", validates issue_details is provided
- Stores all fields in database

**GET /api/issues**
- Returns issues with portfolio names
- Removed site references from JOIN query

**GET /api/stats**
- Added: `issues_with_problems` count
- Removed: `sites_with_issues` count

## Key Functional Features

### Conditional Field Enabling
The Issue Description field has intelligent behavior:
1. **Disabled by default** when form loads
2. **Enabled when "Yes" is selected** for Issue Present
3. **Disabled and cleared when "No" is selected**
4. This is implemented in the `handleChange` function

```javascript
if (name === 'issue_present' && value === 'No') {
  setFormData(prev => ({
    ...prev,
    issue_details: ''
  }));
}
```

### Form Validation
- Portfolio: Required
- Hour: Required (0-23)
- Issue Present: Required (Yes/No)
- Issue Description: Required ONLY if Issue Present = "Yes"
- All other fields: Optional

### Auto-Generated Fields
- Date/Time: Automatically filled with current timestamp
- Display only (user cannot edit)

## Testing the Application

1. **Server is running on port 5001**
2. **Client is running on port 5002**
3. Open http://localhost:5002 in your browser
4. Navigate to "Log Issue" page
5. Test the conditional Issue Description field:
   - Select "No" → field should be disabled
   - Select "Yes" → field should be enabled
   - Switch back to "No" → field should clear and disable

## Files Modified
1. `server/database.js` - Schema changes
2. `server/index.js` - API endpoint updates
3. `client/src/components/IssueForm.js` - Complete rewrite
4. `client/src/components/IssuesTable.js` - Table columns updated

## Database Reset
The database was deleted and recreated with the new schema automatically when the server started.
