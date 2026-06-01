# Frontend Flow and Backend JSON Contract

This document describes the Flutter frontend flow for Support Atlas and the backend behavior needed to support it. The backend should use JSON for every request and every response.

## App Purpose

Support Atlas is a mobile-first Flutter application for mapping informal education and Almajiri-style learning centres in Nigeria. Volunteers collect school and welfare data, admins review submitted records, and helpers browse verified schools to offer support.

## User Roles

- Volunteer: submits school records, tracks submission review status, receives correction/approval updates, manages profile settings, and earns reward levels from approved schools.
- Helper: browses mapped schools and support needs.
- Admin: reviews and verifies school records, manages users externally, and exports site data.

## Global Backend Rules

- All requests use JSON bodies or query parameters.
- All responses must be JSON, including exports.
- Authenticated requests use `Authorization: Bearer <accessToken>`.
- On HTTP 401, the frontend calls `/auth/refresh` with the refresh token, stores the returned token pair, and retries the failed request once.
- Dates use ISO-8601 strings.
- Validation errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": {
      "email": "Enter a valid email address"
    }
  }
}
```

## Screen Flow

1. Splash opens at `/splash`.
   - Frontend restores a saved session from secure storage.
   - If no session exists, route redirects to `/login/volunteer`.
   - If a session exists, route redirects by role and profile completion.

2. Login opens at `/login/:role`.
   - Volunteer users sign in with email or username and password.
   - Volunteer self-signup is disabled.
   - `Register as Volunteer` opens `/volunteer/register`.

3. Volunteer registration opens at `/volunteer/register`.
   - Applicant submits required personal, address, experience, availability, motivation, and emergency contact fields.
   - Frontend sends JSON to `/volunteer-applications`.
   - Backend stores a pending request for external admin review.
   - Backend/admin approval later creates the user, generates a temporary password, and emails the applicant.
   - The frontend does not approve applications and does not generate passwords.

4. Volunteer welcome opens at `/welcome/volunteer`.
   - Shown after successful volunteer login when the profile is complete.
   - User continues into `/volunteer/home`.

5. Volunteer home opens at `/volunteer/home`.
   - Frontend fetches submitted schools for the current user.
   - Home shows total, approved, and pending submission counts.
   - Reward badge is calculated client-side from approved submission count.

6. Add school opens at `/sites/new`.
   - Seven-step field flow captures school details, GPS/location, aggregate child population, welfare conditions, needs, photos, and review.
   - Submitted payload is sent to `/sites`.
   - Backend creates a `pending` / `pendingVerification` site record.

7. My Schools opens at `/volunteer/submitted-schools`.
   - Frontend calls `/users/:userId/submitted-sites`.
   - User can filter by all, approved, pending verification, or needs correction.
   - A school opens at `/volunteer/submitted-schools/:id`.

8. Correction flow opens through `/sites/:id/edit?correctionOnly=true`.
   - Only editable correction records should be resubmitted.
   - Backend returns correction fields in `correctionIssues`.
   - Resubmission sets review status back to pending verification.

9. Notifications open at `/volunteer/notifications`.
   - Frontend derives approval and correction notifications from submitted site review statuses.
   - Backend does not need a notification endpoint for the current app, but may add one later.

10. Profile opens at `/volunteer/profile`.
    - Shows user contact details, address, application-derived profile fields, and reward badge.
    - Profile edit opens `/volunteer/profile/edit`.
    - Name and email come from the approved registration request and should be treated as read-only.

11. Settings open at `/volunteer/settings`.
    - Frontend handles dark mode locally.
    - Password changes are sent to `/auth/change-password`.

12. Helper dashboard opens at `/dashboard/helper`.
    - Helper browses sites, map, and support needs.

13. Admin dashboard opens at `/home`.
    - Admin sees aggregate metrics, site list, map, and export.
    - This app does not include an in-app volunteer application approval screen.
    - External admin panel/backend must handle volunteer request approval and email delivery.

## Complete Frontend Route Table

| Route | Screen or Redirect | Auth | Notes |
| --- | --- | --- | --- |
| `/access` | Redirect to `/login/volunteer` | Public | Legacy access entry. |
| `/splash` | Splash screen | Public | Restores session and redirects. |
| `/login` | Redirect to `/login/volunteer` | Public | Default login route. |
| `/login/:role` | Login screen | Public only | `role` is `volunteer` or `helper`. Logged-in users redirect to dashboard. |
| `/volunteer/register` | Volunteer application form | Public only | Submits pending registration request. |
| `/signup/:role` | Signup screen or redirect | Public only | Volunteer role redirects to `/volunteer/register`; non-volunteer signup is legacy/admin-created only. |
| `/home` | Admin/general dashboard | Authenticated | Admin dashboard in normal admin login flow. |
| `/dashboard/volunteer` | Redirect to `/volunteer/home` | Authenticated volunteer | Legacy volunteer dashboard path. |
| `/welcome/volunteer` | Volunteer welcome | Authenticated volunteer | Shown after login. |
| `/volunteer/home` | Volunteer home | Authenticated volunteer | Stats, actions, reward badge. |
| `/volunteer/schools` | Redirect to `/volunteer/submitted-schools` | Authenticated volunteer | Legacy route. |
| `/volunteer/submitted-schools` | Submitted schools list | Authenticated volunteer | Uses current user id. |
| `/volunteer/submitted-schools/:id` | Submitted school detail | Authenticated volunteer | Detail for one submitted site. |
| `/volunteer/drafts` | Volunteer draft records | Authenticated volunteer | Local drafts and pending sync. |
| `/volunteer/notifications` | Volunteer notifications | Authenticated volunteer | Derived from submitted site statuses. |
| `/volunteer/profile` | Volunteer profile | Authenticated volunteer | Shows immutable registration identity and reward badge. |
| `/volunteer/profile/setup` | Profile setup | Authenticated volunteer | Used only if backend returns incomplete profile. |
| `/volunteer/profile/edit` | Profile edit | Authenticated volunteer | Name/email should remain read-only. |
| `/volunteer/settings` | Volunteer settings | Authenticated volunteer | Change password endpoint; theme is local. |
| `/volunteer/help` | Help and support | Authenticated volunteer | Static guidance. |
| `/dashboard/helper` | Helper dashboard | Authenticated helper | Browse and support schools. |
| `/map` | Map screen | Authenticated | Uses site list data. |
| `/sites` | Site list | Authenticated | Filters by search, verification, urgency, and needs. |
| `/sites/new` | Add site flow | Authenticated volunteer/admin | Query: `step`, `draftId`. |
| `/sites/:id` | Site profile | Authenticated | Admin can see safeguarding notes. |
| `/sites/:id/edit` | Edit site flow | Authenticated | Query: `correctionOnly=true` for corrections. |
| `/drafts` | Drafts screen | Authenticated | Volunteer route shows volunteer drafts; others show general drafts. |
| `/sync` | Sync screen | Authenticated volunteer | Uploads locally saved pending drafts. |
| `/export` | Export screen | Authenticated admin only | Non-admin redirects to dashboard. |

## Route Redirect Rules

- While auth is loading, any route except `/splash` redirects to `/splash`.
- Logged-out users can access only auth routes: `/login...`, `/signup...`, `/volunteer/register`.
- Logged-out users attempting app routes redirect to `/login/volunteer`.
- Logged-in users attempting auth routes redirect to their dashboard.
- Volunteer users with `profileComplete=false` are forced to `/volunteer/profile/setup`.
- Volunteer users with `profileComplete=true` cannot open `/volunteer/profile/setup`; they redirect to `/welcome/volunteer`.
- `/export` is admin-only.

## Required Backend Endpoints

### Auth and Account

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/username-available?username=<username>`
- `POST /auth/signup`
- `POST /auth/change-password`

### Volunteer Registration and Profile

- `POST /volunteer-applications`
- `GET /users/me`
- `PATCH /users/me/volunteer-profile`

### Sites and Submissions

- `GET /sites`
- `GET /sites/:id`
- `POST /sites`
- `PUT /sites/:id`
- `POST /sites/:id/media`
- `POST /sites/:id/assessment`
- `GET /users/:userId/submitted-sites`

### Dashboard, Export, and Reference Data

- `GET /dashboard/summary`
- `GET /exports/sites`
- `GET /locations/nigeria/states-lgas`

## Enum Values

- `accessRole`: `volunteer`, `helper`
- `role`: `admin`, `fieldWorker`
- `verificationStatus`: `pending`, `verified`, `rejected`
- `reviewStatus`: `approved`, `pendingVerification`, `needsCorrection`
- `urgencyLevel`: `low`, `medium`, `high`
- `media.type`: `entrance`, `class_area`, `sleeping_area`, `sanitation`, `environment`, `other`
- `needs`: `feeding`, `clothing`, `bedding`, `shelterImprovement`, `healthOutreach`, `counselling`, `sanitation`, `waterAccess`, `hygieneKits`, `educationMaterials`, `safeguarding`, `identityDocumentation`, `other`

## Reward Levels

The frontend calculates volunteer reward level from approved submitted schools. Backend only needs to return submitted sites with `reviewStatus`.

| Approved Schools | Level | Stars | Meaning |
| --- | --- | --- | --- |
| 0-4 | Community Starter | 0 | New volunteer working toward first approved records. |
| 5-14 | Field Contributor | 1 | Has started building verified school coverage. |
| 15-29 | Trusted Mapper | 2 | Consistently submits records that pass admin review. |
| 30-49 | Impact Builder | 3 | Shows strong impact through approved submissions. |
| 50-99 | Senior Field Lead | 4 | Trusted for broad, consistent field coverage. |
| 100+ | Atlas Champion | 5 | Recognized for 100+ approved school records. |

## Data Ethics Requirements

- Child data must remain aggregate only.
- Do not require or return child names or child-identifiable records.
- Safeguarding notes such as `safetyRisks` should be protected server-side and shown only to authorized admin users where applicable.
- Volunteer application data should be used only for review, approval, access creation, and account/profile display.
