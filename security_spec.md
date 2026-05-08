
# Security Specification - ieltshub Portal

## Data Invariants
1. A user profile must have a valid `role` ('admin', 'teacher', 'student').
2. Users can only access their own speaking sessions.
3. Users cannot change their own `role` after the initial creation.
4. Timestamps (`createdAt`, `updatedAt`) must be server-generated.
5. IDs must be valid strings.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Create a profile for another user's UID.
2. **Privilege Escalation**: Update own profile to set `role: 'admin'`.
3. **Orphaned Writes**: Create a speaking session with a `userId` that doesn't match the auth UID.
4. **Data Poisoning**: Inject a 1MB string into `displayName`.
5. **Timestamp Spoofing**: Send a future date for `createdAt`.
6. **Shadow Fields**: Add a hidden `isVerified: true` field to a session.
7. **Cross-User Leakage**: List speaking sessions belonging to another user.
8. **Invalid Role**: Set `role: 'hacker'`.
9. **Outcome Tampering**: Change `overallBand` on a finished session if it was supposed to be immutable.
10. **ID Injection**: Use `../system/config` as a `userId`.
11. **Negative Score**: Set `targetScore: -1`.
12. **Anonymous Access**: Try to write as a non-authenticated user.

## Test Runner (Logic Overview)
- `test('Anonymous cannot read/write')`
- `test('User can read/write own profile')`
- `test('User cannot update own role')`
- `test('User can only see own sessions')`
- `test('Admin can see everything')`
