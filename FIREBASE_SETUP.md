# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "defective-gpr-tracking")
4. Disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (</>)
2. Enter app nickname (e.g., "GPR Tracking Web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the configuration object

## Step 3: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose a location closest to you
5. Click **Enable**

### Firestore Rules (Update after testing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if true; // FOR TESTING ONLY
    }
  }
}
```

**⚠️ For Production**, update rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /employees/{employeeId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    match /parts/{partId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## Step 4: Configure Environment Variables

1. Open `.env.local` file in your project root
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Database Collections Structure

The app uses three main collections:

### 1. **employees** Collection
```
employees/
  {employeeId}/
    - name: string
    - email: string
    - department: string
    - password: string
    - assignedParts: array
    - createdAt: timestamp
```

### 2. **parts** Collection
```
parts/
  {partId}/
    - callStatus: string
    - customerName: string
    - machineModelNo: string
    - serialNo: string
    - callId: string
    - partNo: string
    - partDescription: string
    - status: string
    - assignedTo: string (optional)
    - category: string
    - name: string
    - description: string
    - partNumber: string
    - (all other Part fields)
    - createdAt: timestamp
```

### 3. **assignments** Collection
```
assignments/
  {assignmentId}/
    - partId: string
    - employeeId: string
    - assignedDate: string
    - status: "active" | "completed"
    - returnDate: string (optional)
    - returnCondition: "gpr" | "defective" (optional)
    - notes: string (optional)
```

## Step 6: Initial Data Migration (Optional)

The app will start with local mock data. To migrate to Firestore:

1. The app automatically uses local data if Firestore is empty
2. Add employees through the admin UI (Employees page → Add Employee)
3. These will be saved to Firestore automatically
4. Parts and assignments will sync as you use the app

## Step 7: Test the Setup

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Go to Admin → Employees page
3. Click "Add Employee" and create a test employee with:
   - Name: Test User
   - Email: test@company.com
   - Department: Testing
   - Password: test123

4. Log out and try logging in as this employee at `/employee/login`

## Security Considerations

### ⚠️ IMPORTANT for Production:

1. **Hash Passwords**: Currently passwords are stored in plain text
   - Use bcrypt or similar library to hash passwords
   - Update `addEmployeeToFirestore` and `authenticateEmployee` functions

2. **Update Firestore Rules**: Restrict access based on authentication

3. **Environment Variables**: Never commit `.env.local` to git
   - Add to `.gitignore`
   - Use environment variables in production

4. **Firebase Authentication**: Consider using Firebase Auth instead of manual authentication
   - More secure
   - Built-in features like password reset, email verification

## Troubleshooting

### "Failed to load data from Firestore"
- Check if Firebase config is correct in `.env.local`
- Verify Firestore rules allow read/write
- Check browser console for specific errors

### "Employee not found" on login
- Ensure employee was created through the admin UI
- Check Firestore console to verify data exists
- Try creating a new employee

### Build errors
- Make sure all dependencies are installed: `pnpm install`
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `pnpm build`

## Next Steps

- Implement password hashing
- Add Firebase Authentication
- Set up proper Firestore security rules
- Add data backup/export functionality
- Implement audit logging
