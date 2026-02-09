# Specification

## Summary
**Goal:** Fix the login flow so valid credentials authenticate successfully without triggering the “only admin can assign user roles” authorization error, and improve the frontend login error messaging if that error occurs.

**Planned changes:**
- Update the backend login flow to remove/replace the role-assignment call that requires admin privileges so successful credential verification results in an authenticated caller session usable for subsequent operations.
- Ensure backend behavior keeps invalid credentials failing with an authentication error (not a roles/admin error).
- Update the frontend login screen to detect the specific backend error text “only admin can assign user roles” and display a user-friendly English message instead of the raw error.

**User-visible outcome:** Users can log in with Darling/181818 or MyHoney/182518 successfully and then access profile, messages, send message, update profile, and gallery without “Unauthorized” errors; if the admin/roles error ever occurs again, they see a clear English message on the login screen.
