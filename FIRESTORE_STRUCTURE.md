# Firestore Database Structure

This document describes the exact structure for creating documents in your Firestore database.

## Collections Overview

Your database has 4 main collections:
1. **admins** - Administrator accounts
2. **employees** - Employee accounts with credentials
3. **parts** - Industrial parts inventory
4. **assignments** - Part assignment tracking

---

## 1. Admins Collection (`admins`)

**Collection Name:** `admins`

**Document Structure:**
```json
{
  "name": "Admin User",
  "username": "javed",
  "password": "kaz@1975",
  "createdAt": "<Firestore Timestamp>"
}
```

### Field Descriptions:
- `name` (string) - Full name of the administrator
- `username` (string) - Username for login (must be unique)
- `password` (string) - Password for login ⚠️ **In production, use hashed passwords!**
- `createdAt` (Timestamp) - Firestore timestamp of creation

### How to Create in Firestore Console:
1. Go to Firestore Console
2. Click "Start collection"
3. Collection ID: `admins`
4. Click "Auto-ID" for Document ID (or use custom ID)
5. Add fields:
   - Field: `name`, Type: `string`, Value: `Admin User`
   - Field: `username`, Type: `string`, Value: `javed`
   - Field: `password`, Type: `string`, Value: `kaz@1975`
   - Field: `createdAt`, Type: `timestamp`, Value: (current date/time)

---

## 2. Employees Collection (`employees`)

**Collection Name:** `employees`

**Document Structure:**
```json
{
  "username": "johndoe",
  "password": "secure123",
  "assignedParts": [],
  "createdAt": "<Firestore Timestamp>"
}
```

### Field Descriptions:
- `username` (string) - Username for login (must be unique)
- `password` (string) - Password for login ⚠️ **In production, use hashed passwords!**
- `assignedParts` (array) - Array of part IDs assigned to this employee (empty by default)
- `createdAt` (Timestamp) - Firestore timestamp of creation

### How to Create in Firestore Console:
1. Collection ID: `employees`
2. Click "Add document"
3. Click "Auto-ID" for Document ID
4. Add fields:
   - Field: `username`, Type: `string`, Value: `johndoe`
   - Field: `password`, Type: `string`, Value: `secure123`
   - Field: `assignedParts`, Type: `array`, Value: (leave empty)
   - Field: `createdAt`, Type: `timestamp`, Value: (current date/time)

### Auto-Creation via Admin Panel:
Employees are automatically created when an admin uses the "Add Employee" feature:
- Navigate to Admin Panel → Employees → "Add Employee"
- Fill in: Username, Password
- Click "Add Employee"
- The system automatically creates the Firestore document with the correct structure

---

## 3. Parts Collection (`parts`)

**Collection Name:** `parts`

**Document Structure:**
```json
{
  "callStatus": "Open",
  "customerName": "ABC Manufacturing",
  "machineModelNo": "MDL-5000X",
  "serialNo": "SN-2024-001",
  "callId": "CALL-001",
  "attendDate": "2024-01-15",
  "claimEngineerName": "John Smith",
  "claimDate": "2024-01-16",
  "repairReplacementDOA": "Replacement",
  "partDescription": "Hydraulic Pump Assembly",
  "partNo": "HPU-2500",
  "consumptionEngineer": "Mike Johnson",
  "consumptionStatus": "Consumed",
  "consumptionDate": "2024-01-17",
  "faultyGPRPartSent": "GPR",
  "sentDate": "2024-01-18",
  "receivedBy": "Warehouse Team",
  "recdDate": "2024-01-19",
  "completedStatus": "Completed",
  "completedBy": "Sarah Williams",
  "completeDate": "2024-01-20",
  "completedLocation": "Main Facility",
  "remarks": "Part replaced successfully",
  "status": "available",
  "category": "Hydraulic",
  "name": "Hydraulic Pump",
  "description": "High-pressure hydraulic pump for industrial machinery",
  "partNumber": "HPU-2500",
  "createdAt": "<Firestore Timestamp>"
}
```

### Status Values:
- `available` - Part is available for assignment
- `assigned` - Part is assigned to an employee
- `in-use` - Part is currently being used
- `returned-gpr` - Part returned as Good Parts Return
- `returned-defective` - Part returned as defective

---

## 4. Assignments Collection (`assignments`)

**Collection Name:** `assignments`

**Document Structure:**
```json
{
  "partId": "p1",
  "employeeId": "e1",
  "assignedDate": "2024-01-15T10:30:00Z",
  "status": "active",
  "notes": "Urgent repair needed",
  "returnDate": null,
  "returnCondition": null,
  "createdAt": "<Firestore Timestamp>"
}
```

### Field Descriptions:
- `partId` (string) - ID of the assigned part
- `employeeId` (string) - ID of the employee receiving the part
- `assignedDate` (string) - ISO date string of assignment
- `status` (string) - Either "active" or "completed"
- `notes` (string, optional) - Additional notes about the assignment
- `returnDate` (string, optional) - ISO date string when part was returned
- `returnCondition` (string, optional) - Either "gpr" or "defective"
- `createdAt` (Timestamp) - Firestore timestamp of creation

---

## Authentication Flow

### Admin Login:
1. User enters username and password
2. System queries `admins` collection for matching `username` and `password`
3. If found, user is authenticated as admin

### Employee Login:
1. User enters username and password
2. System queries `employees` collection for matching `username` and `password`
3. If found, user is authenticated as employee

---

## Security Considerations

### Current Implementation (Development):
⚠️ **Passwords are stored in plain text**

### Production Requirements:
1. **Password Hashing**: Use bcrypt or argon2 to hash passwords
2. **Firestore Security Rules**: Implement proper read/write rules
3. **Environment Variables**: Never commit Firebase config to version control
4. **HTTPS Only**: Ensure all connections use HTTPS
5. **Input Validation**: Sanitize all user inputs before saving

### Recommended Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection - only admins can read/write
    match /admins/{adminId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Employees collection
    match /employees/{employeeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Parts collection
    match /parts/{partId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Quick Start Steps

1. **Create Admin Account**:
   - Go to Firestore Console
   - Create `admins` collection
   - Add your first admin document with username and password

2. **Test Admin Login**:
   - Open app at `/admin/login`
   - Enter your admin credentials
   - Verify successful login

3. **Create Employees via Admin Panel**:
   - Login as admin
   - Navigate to "Employees"
   - Click "Add Employee"
   - Fill in details and click "Add Employee"
   - Employee is automatically created in Firestore

4. **Test Employee Login**:
   - Logout from admin
   - Go to `/employee/login`
   - Use employee credentials
   - Verify successful login

---

## Troubleshooting

### Login Not Working:
- Check browser console (F12) for error messages
- Verify Firebase credentials in `.env.local`
- Confirm collection names are lowercase (`admins`, `employees`)
- Ensure field names match exactly (case-sensitive)
- Check that username/password match your Firestore documents

### Employee Not Appearing:
- Verify document was created in `employees` collection
- Check that `username` and `email` fields are set
- Refresh the page to reload data from Firestore

### Assignment Issues:
- Ensure both employee and part exist in their respective collections
- Check that employee ID and part ID match document IDs in Firestore
