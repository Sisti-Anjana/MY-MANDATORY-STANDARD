# Bug Fix: Edit Issue Validation Error

## Problem Description
When editing logged issues, users encountered a database constraint violation error:
```
Error updating issue:
code: "23514"
message: "new row for relation \"issues\" violates check constraint \"valid_issue_details\""
```

This error occurred when:
- User selected "Yes" for "Issue Present" 
- User did NOT provide issue details (left empty)
- The database constraint requires issue details when issue_present = 'yes'

## Root Cause
The EditIssueModal component was missing validation that exists in the TicketLoggingTable (issue logging form):

**TicketLoggingTable.js (Line 168-172)** ✅ Had validation:
```javascript
if (issuePresent === 'yes' && (!formData.issue_details || formData.issue_details.trim() === '')) {
  alert('❌ ERROR: Please provide issue details when issue is present');
  return;
}
```

**EditIssueModal.js** ❌ Was missing this validation

## Solution Implemented

### 1. Added Form Validation (EditIssueModal.js)
Updated the `handleSubmit` function to include validation:

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate issue_present and issue_details
  const issuePresent = formData.issue_present.toLowerCase();
  
  if (issuePresent === 'yes' && (!formData.issue_details || formData.issue_details.trim() === '')) {
    alert('❌ ERROR: Please provide issue details when issue is present');
    return;
  }
  
  // Convert empty strings to null for UUID fields
  const cleanedData = {
    ...formData,
    site_id: formData.site_id || null,
    portfolio_id: formData.portfolio_id || null,
    issue_present: issuePresent, // Ensure lowercase for database
    issue_details: formData.issue_details.trim() || (issuePresent === 'no' ? 'No issue present' : '')
  };
  onSave({ ...issue, ...cleanedData });
};
```

### 2. Enhanced UI Feedback
Added visual indicators to make requirements clear:

**Issue Details Field:**
- Shows red asterisk (*) when "Yes" is selected
- Field turns red with light red background when empty and "Yes" is selected
- Warning message appears: "⚠️ Issue details are required when an issue is present"
- Dynamic placeholder text:
  - "Required: Describe the issue..." when "Yes" selected
  - "Optional: Add any notes..." when "No" selected
- HTML5 `required` attribute dynamically applied

**Updated UI Code:**
```javascript
<label className="block text-sm font-medium text-gray-700 mb-1">
  Issue Details {formData.issue_present === 'Yes' && <span className="text-red-600">*</span>}
</label>
<textarea
  name="issue_details"
  value={formData.issue_details}
  onChange={handleChange}
  rows="3"
  required={formData.issue_present === 'Yes'}
  placeholder={formData.issue_present === 'Yes' ? 'Required: Describe the issue...' : 'Optional: Add any notes...'}
  className={`w-full px-3 py-2 border rounded text-sm focus:ring-blue-500 focus:border-blue-500 ${
    formData.issue_present === 'Yes' && !formData.issue_details.trim() 
      ? 'border-red-300 bg-red-50' 
      : 'border-gray-300'
  }`}
/>
{formData.issue_present === 'Yes' && !formData.issue_details.trim() && (
  <p className="mt-1 text-xs text-red-600">⚠️ Issue details are required when an issue is present</p>
)}
```

### 3. Improved Auto-Fill Logic
Enhanced the `handleChange` function:

```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Auto-fill issue details when switching to "No"
  if (name === 'issue_present' && value === 'No') {
    setFormData(prev => ({ ...prev, issue_details: 'No issue present' }));
  }
  
  // Clear the auto-fill when switching to "Yes" to allow user input
  if (name === 'issue_present' && value === 'Yes' && formData.issue_details === 'No issue present') {
    setFormData(prev => ({ ...prev, issue_details: '' }));
  }
};
```

## Testing Checklist

### ✅ Logging Issues (Should work as before)
- [ ] Can log issue with "Yes" + details → Success
- [ ] Can log issue with "No" (auto-fills "No issue present") → Success
- [ ] Cannot log issue with "Yes" + empty details → Shows error

### ✅ Editing Issues (Now fixed)
- [ ] Can edit issue from "No" to "Yes" with details → Success
- [ ] Cannot edit issue from "No" to "Yes" without details → Shows error and validation message
- [ ] Can edit issue from "Yes" to "No" → Auto-fills "No issue present"
- [ ] Visual feedback appears when "Yes" selected and details empty
- [ ] Warning message disappears when user starts typing details

## Database Constraint
The database has a check constraint `valid_issue_details` that enforces:
```sql
CHECK (
  (issue_present = 'yes' AND issue_details IS NOT NULL AND issue_details != '') 
  OR 
  issue_present = 'no'
)
```

This constraint is now properly handled by both:
1. TicketLoggingTable.js (issue logging)
2. EditIssueModal.js (issue editing) ← **FIXED**

## Files Modified
- `client/src/components/EditIssueModal.js`
  - Added validation in `handleSubmit`
  - Enhanced UI with conditional required field and visual feedback
  - Improved `handleChange` logic for better user experience

## Result
✅ Users can no longer submit invalid edits that violate database constraints
✅ Clear visual feedback helps users understand what's required
✅ Consistent validation between logging and editing forms
✅ Better user experience with helpful error messages

---
**Fixed Date:** November 11, 2025
**Issue Reporter:** LibsysAdmin
**Developer:** Claude (Anthropic)
