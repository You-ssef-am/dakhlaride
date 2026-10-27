# Security Specification & Invariants (Dakhla Ride)

## 1. Data Invariants
- **User Isolation**: A user can only write their own user profile document (`/users/{userId}`) where `userId == request.auth.uid`.
- **Identity Integrity**: A passenger publishing a ride must have `passengerId == request.auth.uid`. A driver making an offer must have `driverId == request.auth.uid`.
- **Role Verification**: Only drivers with approved KYC or legitimate identity can submit offers to open rides.
- **Terminal State Locking**: Once a ride is marked `COMPLETED` or `CANCELLED`, neither the status nor key financial attributes can be retroactively mutated.
- **Rate & Price Limits**: Fares and counter-offers must be positive numeric values (`offeredPrice > 0`).
- **Subcollection Authority**: Messages and Offers in `/rides/{rideId}` require existence of the parent ride.

## 2. The "Dirty Dozen" Payloads (Vulnerability Vectors)
1. **User Impersonation Write**: Attempt to write `/users/target_victim` with caller `uid: attacker`. (Expect: PERMISSION_DENIED).
2. **Ghost Ride Injection**: Attempt to create a ride with `passengerId: victim_id`. (Expect: PERMISSION_DENIED).
3. **Offer Hijacking**: Attempt to post an offer with `driverId: victim_driver` or tamper with another driver's offer. (Expect: PERMISSION_DENIED).
4. **Terminal State Mutation**: Attempt to revert a `COMPLETED` ride back to `SEARCHING`. (Expect: PERMISSION_DENIED).
5. **Negative Fare Exploit**: Attempt to offer `-50 MAD` to siphon funds. (Expect: PERMISSION_DENIED).
6. **Denial of Wallet ID Bomb**: Submitting a document with a 2MB string ID or path traversal sequence. (Expect: PERMISSION_DENIED).
7. **Unauthenticated Read on KYC**: Reading other users' sensitive CIN documents or national ID cards without authorization. (Expect: PERMISSION_DENIED).
8. **Shadow Field Injection**: Adding an unvetted `isAdmin: true` or `verifiedBypass: true` field to a user profile. (Expect: PERMISSION_DENIED).
9. **Chat Message Tampering**: Modifying an already sent chat message or writing with a spoofed sender. (Expect: PERMISSION_DENIED).
10. **Transaction Balance Falsification**: Client attempting to self-credit `balanceAfter: 9999999` without authorized server transaction. (Expect: PERMISSION_DENIED).
11. **OTP Bypass Write**: Driver mutating ride status to `IN_PROGRESS` without valid OTP exchange or completion state. (Expect: PERMISSION_DENIED).
12. **Blanket Query Scraping**: Attempting a query without filtering by current user's rides or open market broadcast. (Expect: PERMISSION_DENIED).

## 3. Test Runner Specification
See `firestore.rules` and validation helpers enforcing strict schema type safety, positive number checks, string size limits (`<= 128`, `<= 500`, `<= 1000`), and owner verification.
