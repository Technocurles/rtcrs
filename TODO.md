# ESLint Fixes TODO - Frontend Admin Pages

## Task List

### 1. AdminDashboard.jsx
- [ ] Remove unused `getAllCities` import
- [ ] Remove unused `dashboardStats` state  
- [ ] Remove unused `selectedReport` state (keeping for handleViewMore)

### 2. AdminLogin.jsx
- [ ] Remove unused `setRole` variable

### 3. CrimeReports.jsx
- [ ] Fix useEffect dependency warnings (lines 72, 108, 115)
- [ ] Remove or use `getFileTypeFromUrl` function

### 4. Sidebar.jsx
- [ ] Remove unused `useEffect` import
- [ ] Remove or use `totalSOSCount` variable

### 5. UserManagement.jsx
- [ ] Remove unused `Users` import

### 6. adminService.js
- [ ] Fix no-throw-literal errors (proper error objects)
- [ ] Fix export default to assign to variable first

### 7. sosService.js
- [ ] Remove unused `getAuthHeader` function
- [ ] Fix no-throw-literal errors
- [ ] Fix export default

## Status
- [ ] Pending
