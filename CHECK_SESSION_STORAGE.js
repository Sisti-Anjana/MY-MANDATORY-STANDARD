// COPY AND PASTE THIS INTO YOUR BROWSER CONSOLE (F12)
// This will show what username is stored

console.log('=== SESSION STORAGE CHECK ===');
console.log('username:', sessionStorage.getItem('username'));
console.log('fullName:', sessionStorage.getItem('fullName'));
console.log('userRole:', sessionStorage.getItem('userRole'));
console.log('============================');

// This is what the auto-tracking will use:
const loggedInUser = sessionStorage.getItem('username') || 
                    sessionStorage.getItem('fullName') || 
                    'LibsysAdmin';
console.log('Auto-tracking will use:', loggedInUser);
