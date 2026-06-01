# API Routes

This document describes the backend routes for the School Support Atlas platform. The React admin website and Flutter volunteer mobile app use the same backend API and database. The current app registers grouped route files from `project/src/routes/index.js`, uses controller handlers from `project/src/controllers/`, and supports middleware aliases from `project/src/config/middleware.js`.

## Client Architecture

- Admin dashboard: React web application.
- Volunteer app: Flutter mobile application.
- Shared backend: Express API with shared auth, shared database, and role-based access.
- Admin credentials are valid only for the React admin dashboard.
- Volunteer credentials are valid only for the Flutter volunteer mobile app.
- The React admin dashboard must reject signed-in users whose role is not `admin`.
- The Flutter volunteer app must reject signed-in users whose role is not `volunteer`.
- Admin routes use `/admin/...` and require `auth` plus `admin`.
- Volunteer routes use `/volunteer/...` and require `auth`, `volunteer`, and profile completion where needed.
- Both clients should use the same JSON response format.

## Auth Rules

Authenticated routes require one of these token inputs:

- Header: `Authorization: Bearer <access_token>`
- Header: `x-access-token: <access_token>`
- Query: `?access_token=<access_token>`

Existing middleware aliases:

- `auth` maps to `AccessTokenMiddleware`
- `admin` maps to `AdminOnlyMiddleware`

Recommended new middleware:

- `volunteer` should allow only `req.auth.user.role === 'volunteer'`
- `profileComplete` should allow volunteer feature access only when a completed `volunteer_profiles` row exists for the current user

## Existing Routes

### Auth

Base path: `/auth`

| Method | Path | Middleware | Handler | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/auth/sign-up` | none | `auth/AuthController.sign_up` | Public volunteer sign-up |
| POST | `/auth/sign-in` | none | `auth/AuthController.sign_in` | Admin or volunteer sign-in |
| POST | `/auth/admin/users` | `auth`, `admin` | `auth/AuthController.create_user` | Admin creates admin/volunteer user |
| GET | `/auth/me` | `auth` | `auth/AuthController.me` | Get current authenticated user |

The same sign-in route can authenticate both roles, but each client must enforce its expected role after sign-in:

- React admin dashboard accepts only `role: "admin"` and rejects `role: "volunteer"`.
- Flutter volunteer app accepts only `role: "volunteer"` and rejects `role: "admin"`.
- Backend route middleware must also enforce this separation. Admin tokens must receive `403` on `/volunteer/...`; volunteer tokens must receive `403` on `/admin/...`.

For volunteer users, sign-in and `/auth/me` should include profile status so the frontend knows whether to show the profile form or the dashboard.

Volunteer sign-in response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Volunteer Name",
      "email": "volunteer@example.com",
      "role": "volunteer"
    },
    "access_token": "token",
    "token_type": "Bearer",
    "profile": null,
    "profile_completed": false,
    "next_step": "complete_profile"
  }
}
```

When `profile_completed` is `false`, the frontend should route the volunteer to the profile form, not the dashboard.

Wrong-client login response recommendation:

```json
{
  "success": false,
  "error": "This account cannot access this application",
  "code": "INVALID_CLIENT_ROLE"
}
```

## New Volunteer Routes

Create `project/src/routes/volunteer.js` and register it with the other route groups from `project/src/routes/index.js`:

```js
const auth_routes = require('./auth');
const volunteer_routes = require('./volunteer');
const admin_routes = require('./admin');
const school_routes = require('./schools');

module.exports = [
  { path: '/auth', name: 'auth.', group: auth_routes },
  { path: '/volunteer', name: 'volunteer.', middleware: ['auth', 'volunteer'], group: volunteer_routes },
  { path: '/admin', name: 'admin.', group: admin_routes },
  { path: '/schools', name: 'schools.', group: school_routes },
];
```

The current route binder does not inherit group middleware, so either update the binder to merge parent middleware into child routes or put middleware on every volunteer route.

Profile routes should require `auth` and `volunteer`, but they should not require `profileComplete`. Dashboard, school, draft, and photo routes should require `auth`, `volunteer`, and `profileComplete`.

## Volunteer Onboarding Flow

1. Volunteer signs up using `/auth/sign-up`.
2. Volunteer signs in using `/auth/sign-in`.
3. API returns `profile_completed: false` if the profile is missing or incomplete.
4. Frontend shows the volunteer profile form.
5. Volunteer submits required profile fields using `PUT /volunteer/profile`.
6. API sets `volunteer_profiles.is_completed = true` and returns `next_step: "dashboard"`.
7. Frontend allows access to `/volunteer/dashboard` and other volunteer features.

Until profile completion, these routes should return `403`:

- `/volunteer/dashboard`
- `/volunteer/schools`
- `/volunteer/schools/drafts`
- `/volunteer/schools/:id/photos`

Incomplete profile error:

```json
{
  "success": false,
  "error": "Volunteer profile must be completed first",
  "code": "PROFILE_INCOMPLETE",
  "next_step": "complete_profile"
}
```

### Volunteer Dashboard

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/volunteer/dashboard` | `volunteer/VolunteerDashboardController.index` | Dashboard card and stats |

Response:

```json
{
  "success": true,
  "data": {
    "volunteer": {
      "id": 2,
      "name": "Volunteer Name",
      "email": "volunteer@example.com",
      "profile_photo_url": null
    },
    "stats": {
      "total_submitted": 10,
      "pending": 4,
      "approved": 5,
      "rejected": 1,
      "drafts": 2,
      "unread_notifications": 1
    }
  }
}
```

### Volunteer Notifications

Flutter volunteer app only. Notifications are created by backend review actions when an admin approves or rejects one of the volunteer's schools.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/volunteer/notifications` | `volunteer/VolunteerNotificationController.index` | List own notifications |
| POST | `/volunteer/notifications` | `volunteer/VolunteerNotificationController.store` | Create a test/manual own notification |
| GET | `/volunteer/notifications/:id` | `volunteer/VolunteerNotificationController.show` | View one own notification |
| PUT/PATCH | `/volunteer/notifications/:id` | `volunteer/VolunteerNotificationController.update` | Update own notification status/content |
| DELETE | `/volunteer/notifications/:id` | `volunteer/VolunteerNotificationController.destroy` | Delete own notification |
| POST | `/volunteer/notifications/:id/read` | `volunteer/VolunteerNotificationController.mark_read` | Mark one own notification as read |
| POST | `/volunteer/notifications/read-all` | `volunteer/VolunteerNotificationController.mark_all_read` | Mark all own unread notifications as read |

Notification query parameters:

- `status`: optional `unread` or `read`
- `type`: optional `school_approved` or `school_rejected`
- `page`
- `limit`

When an admin approves a school, the backend creates a volunteer notification like:

```json
{
  "recipient_user_id": 2,
  "actor_user_id": 1,
  "school_id": 42,
  "type": "school_approved",
  "title": "School approved",
  "message": "Al-Huda Quranic School has been approved by the admin.",
  "status": "unread"
}
```

### Volunteer Profile

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/volunteer/profile` | `volunteer/VolunteerProfileController.show` | View current profile or profile-completion status |
| PUT | `/volunteer/profile` | `volunteer/VolunteerProfileController.update` | Create/update profile and mark completed when required fields exist |
| GET | `/volunteer/profile/activity` | `volunteer/VolunteerProfileController.activity` | View volunteer activity history after profile is complete |

Update profile request:

```json
{
  "full_name": "Volunteer Name",
  "phone": "+2348012345678",
  "state": "Kano",
  "lga": "Nasarawa",
  "community": "Tudun Wada",
  "address": "Near central mosque",
  "bio": "Community education volunteer"
}
```

Update profile response after completion:

```json
{
  "success": true,
  "data": {
    "profile": {
      "full_name": "Volunteer Name",
      "phone": "+2348012345678",
      "state": "Kano",
      "lga": "Nasarawa",
      "address": "Near central mosque",
      "is_completed": true
    },
    "profile_completed": true,
    "next_step": "dashboard"
  }
}
```

### School Drafts

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| POST | `/volunteer/schools/drafts` | `volunteer/VolunteerSchoolController.create_draft` | Create a draft school record |
| GET | `/volunteer/schools/drafts` | `volunteer/VolunteerSchoolController.list_drafts` | List current volunteer drafts |
| GET | `/volunteer/schools/drafts/:id` | `volunteer/VolunteerSchoolController.show_draft` | View one draft |
| PUT | `/volunteer/schools/drafts/:id` | `volunteer/VolunteerSchoolController.update_draft` | Update draft progress |
| DELETE | `/volunteer/schools/drafts/:id` | `volunteer/VolunteerSchoolController.delete_draft` | Delete own draft |
| POST | `/volunteer/schools/drafts/:id/submit` | `volunteer/VolunteerSchoolController.submit_draft` | Submit draft for admin review |

Draft request should accept partial school data. A submitted draft must pass full validation.

### School Submission

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| POST | `/volunteer/schools` | `volunteer/VolunteerSchoolController.submit` | Submit a completed school directly |
| GET | `/volunteer/schools` | `volunteer/VolunteerSchoolController.index` | List volunteer submitted schools |
| GET | `/volunteer/schools/:id` | `volunteer/VolunteerSchoolController.show` | View own school details |
| PUT | `/volunteer/schools/:id` | `volunteer/VolunteerSchoolController.update` | Update own `draft` or `rejected` school |

List query parameters:

- `status`: optional `draft`, `pending`, `approved`, or `rejected`
- `page`: optional page number
- `limit`: optional page size
- `search`: optional school-name search

Submit request:

```json
{
  "school": {
    "school_name": "Al-Huda Quranic School",
    "school_type": "traditional_quranic_school",
    "urgency": "high"
  },
  "operators": [
    {
      "name": "Mallam Musa",
      "phone": "+2348012345678"
    }
  ],
  "location": {
    "latitude": 12.0022,
    "longitude": 8.5919,
    "country": "Nigeria",
    "state": "Kano",
    "lga": "Nasarawa",
    "community": "Tudun Wada",
    "address": "Behind main market"
  },
  "children_stats": {
    "total_children": 120,
    "residential_children": 80,
    "non_residential_children": 40,
    "boys_count": 90,
    "girls_count": 30,
    "age_3_5_count": 8,
    "age_6_10_count": 45,
    "age_11_15_count": 50,
    "age_16_18_count": 15,
    "age_18_plus_count": 2
  },
  "welfare": {
    "has_clean_water": false,
    "has_sanitation": false,
    "has_healthcare": false,
    "has_nutritious_food": false,
    "has_educational_materials": true,
    "has_recreational_facilities": false,
    "has_clothing_shelter": false,
    "has_sleeping_area": true,
    "has_electricity": false,
    "has_internet": false,
    "has_transportation": false,
    "has_financial_resources": false,
    "safety_physical_abuse": false,
    "safety_child_labor": true,
    "safety_sexual_abuse": false,
    "safety_trafficking": false,
    "additional_notes": "Needs clean water and sanitation support."
  }
}
```

### School Photos

Use multipart form-data for real file upload. If external storage is added later, store the returned URL in `school_photos.file_url`.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| POST | `/volunteer/schools/:id/photos` | `volunteer/VolunteerSchoolPhotoController.store` | Upload one or more photos |
| GET | `/volunteer/schools/:id/photos` | `volunteer/VolunteerSchoolPhotoController.index` | List photos for own school |
| DELETE | `/volunteer/schools/:id/photos/:photoId` | `volunteer/VolunteerSchoolPhotoController.destroy` | Delete own draft/rejected photo |

Multipart fields:

- `photos[]`: one or more image files
- `category`: `entrance`, `class_area`, `sleeping_area`, `sanitation_area`, `general_environment`, or `other`
- `caption`: optional text

## New Admin Routes

Create `project/src/routes/admin.js` and register it from `project/src/routes/index.js`.

```js
const auth_routes = require('./auth');
const admin_routes = require('./admin');
const school_routes = require('./schools');

module.exports = [
  { path: '/auth', name: 'auth.', group: auth_routes },
  { path: '/admin', name: 'admin.', group: admin_routes },
  { path: '/schools', name: 'schools.', group: school_routes },
];
```

Put `middleware: ['auth', 'admin']` on every admin route unless route group middleware inheritance is added.

### Admin Dashboard

The React admin dashboard should show system totals and recent notifications.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | `admin/AdminDashboardController.index` | Admin stats and recent notifications |

Response:

```json
{
  "success": true,
  "data": {
    "stats": {
      "pending_reviews": 7,
      "approved_schools": 23,
      "rejected_schools": 4,
      "total_volunteers": 18,
      "completed_volunteer_profiles": 15,
      "unread_notifications": 3
    },
    "recent_notifications": [
      {
        "id": 11,
        "type": "school_submitted",
        "title": "New school submitted",
        "message": "Volunteer Name submitted Al-Huda Quranic School for review.",
        "status": "unread",
        "school_id": 42,
        "actor_user_id": 2,
        "created_at": "2026-04-23T10:00:00.000Z"
      }
    ]
  }
}
```

### Admin Notifications

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/notifications` | `admin/AdminNotificationController.index` | List dashboard notifications |
| POST | `/admin/notifications/:id/read` | `admin/AdminNotificationController.mark_read` | Mark one notification as read |
| POST | `/admin/notifications/read-all` | `admin/AdminNotificationController.mark_all_read` | Mark all admin notifications as read |

Notification query parameters:

- `status`: optional `unread`, `read`, or `resolved`
- `type`: optional notification type, for example `school_submitted`
- `page`
- `limit`

When a volunteer submits a school, the backend should create a notification like:

```json
{
  "type": "school_submitted",
  "title": "New school submitted",
  "message": "Volunteer Name submitted Al-Huda Quranic School for review.",
  "actor_user_id": 2,
  "school_id": 42,
  "status": "unread"
}
```

### Admin Volunteers

Admins can see volunteer profiles from the React dashboard. When the admin selects a volunteer, the API should return that volunteer profile and all schools added by that specific volunteer.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/volunteers` | `admin/AdminVolunteerController.index` | List volunteer users and profile status |
| GET | `/admin/volunteers/:id` | `admin/AdminVolunteerController.show` | View selected volunteer profile and summary |
| GET | `/admin/volunteers/:id/schools` | `admin/AdminVolunteerController.schools` | View all schools submitted by selected volunteer |

Volunteer list query parameters:

- `profile_completed`: optional `true` or `false`
- `search`: optional name, email, phone, state, or LGA search
- `page`
- `limit`

Selected volunteer response:

```json
{
  "success": true,
  "data": {
    "volunteer": {
      "id": 2,
      "name": "Volunteer Name",
      "email": "volunteer@example.com",
      "role": "volunteer",
      "profile": {
        "full_name": "Volunteer Name",
        "phone": "+2348012345678",
        "state": "Kano",
        "lga": "Nasarawa",
        "address": "Near central mosque",
        "is_completed": true
      }
    },
    "stats": {
      "total_submitted": 10,
      "pending": 4,
      "approved": 5,
      "rejected": 1,
      "drafts": 2
    }
  }
}
```

Volunteer schools query parameters:

- `status`: optional `draft`, `pending`, `approved`, or `rejected`
- `search`
- `page`
- `limit`

### Admin School Review

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/schools` | `admin/AdminSchoolController.index` | List all school submissions |
| GET | `/admin/schools/:id` | `admin/AdminSchoolController.show` | View full school submission |
| PATCH | `/admin/schools/:id/status` | `admin/AdminSchoolReviewController.update_status` | Change status from a React dashboard status control |
| POST | `/admin/schools/:id/approve` | `admin/AdminSchoolReviewController.approve` | Approve a pending school |
| POST | `/admin/schools/:id/reject` | `admin/AdminSchoolReviewController.reject` | Reject a pending school |
| GET | `/admin/schools/:id/reviews` | `admin/AdminSchoolReviewController.index` | View review history |

School list query parameters:

- `status`: optional `draft`, `pending`, `approved`, or `rejected`
- `submitted_by_user_id`: optional volunteer user id
- `state`
- `lga`
- `school_type`
- `urgency`
- `search`
- `page`
- `limit`

Approve request:

```json
{
  "comment": "Verified and approved."
}
```

Status update request:

```json
{
  "status": "approved",
  "comment": "Verified and approved."
}
```

Reject request:

```json
{
  "comment": "Location details are incomplete. Please add clearer photos and operator phone number."
}
```

Approval or rejection should:

- Create a `school_reviews` row.
- Update `schools.status`.
- Set `schools.approved_by_user_id` when approved.
- Set `schools.admin_feedback` from the review comment.
- Set `schools.reviewed_at`.
- Mark related `admin_notifications` as `resolved`.
- Create a `volunteer_notifications` row for the school submitter with type `school_approved` or `school_rejected`.

## Public or Shared School Routes

These routes can be used by authenticated users to view approved schools.

| Method | Path | Middleware | Handler | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/schools` | `auth` | `school/SchoolController.index` | List approved schools |
| GET | `/schools/:id` | `auth` | `school/SchoolController.show` | View approved school and create `school_views` record |

List query parameters:

- `state`
- `lga`
- `school_type`
- `urgency`
- `search`
- `page`
- `limit`

## Full REST CRUD Reference

This section is the implementation checklist for RESTful route files. Use these controller method names where possible:

- `index`: list records
- `store`: create a record
- `show`: read one record
- `update`: replace or update a record
- `destroy`: delete a record

Some resources are read-only for a role even when the underlying table supports CRUD. For example, admins can read volunteer profiles but should not use the volunteer app profile endpoints, and volunteers cannot create admin notifications directly.

### Auth Sessions

Auth is not standard CRUD because it creates and verifies sessions/tokens.

| Action | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| Register volunteer | POST | `/auth/sign-up` | none | Create volunteer account |
| Login | POST | `/auth/sign-in` | none | Create/refresh access token |
| Current user | GET | `/auth/me` | `auth` | Read authenticated user and role |
| Create user | POST | `/auth/admin/users` | `auth`, `admin` | Admin creates admin or volunteer user |

### Volunteer Profile CRUD

Flutter volunteer app only. Admin users must receive `403` on these routes.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| Create | POST | `/volunteer/profile` | `auth`, `volunteer` | Create profile after sign-up/sign-in |
| Read | GET | `/volunteer/profile` | `auth`, `volunteer` | Read own profile and completion status |
| Update | PUT/PATCH | `/volunteer/profile` | `auth`, `volunteer` | Update own profile and set completion status |
| Delete | DELETE | `/volunteer/profile` | `auth`, `volunteer` | Soft-delete or clear own profile only if product policy allows it |
| List activity | GET | `/volunteer/profile/activity` | `auth`, `volunteer`, `profileComplete` | Read own activity history |

Required fields for profile completion: `full_name`, `phone`, `state`, `lga`, and `address`.

### Volunteer Notification CRUD

Flutter volunteer app only. Volunteers can only access notifications where `recipient_user_id = req.auth.user.id`.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/volunteer/notifications` | `auth`, `volunteer`, `profileComplete` | List own notifications |
| Create | POST | `/volunteer/notifications` | `auth`, `volunteer`, `profileComplete` | Optional manual/test notification creation for own account |
| Read | GET | `/volunteer/notifications/:id` | `auth`, `volunteer`, `profileComplete` | Read one own notification |
| Update | PUT/PATCH | `/volunteer/notifications/:id` | `auth`, `volunteer`, `profileComplete` | Update own notification state or metadata |
| Delete | DELETE | `/volunteer/notifications/:id` | `auth`, `volunteer`, `profileComplete` | Delete/archive own notification |
| Mark read | POST | `/volunteer/notifications/:id/read` | `auth`, `volunteer`, `profileComplete` | Mark one own notification as read |
| Mark all read | POST | `/volunteer/notifications/read-all` | `auth`, `volunteer`, `profileComplete` | Mark all own notifications as read |

### Volunteer School CRUD

Flutter volunteer app only. Volunteers can only access schools where `submitted_by_user_id = req.auth.user.id`.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/volunteer/schools` | `auth`, `volunteer`, `profileComplete` | List own schools with optional filters |
| Create | POST | `/volunteer/schools` | `auth`, `volunteer`, `profileComplete` | Create and submit a completed school |
| Read | GET | `/volunteer/schools/:id` | `auth`, `volunteer`, `profileComplete` | Read one own school |
| Update | PUT/PATCH | `/volunteer/schools/:id` | `auth`, `volunteer`, `profileComplete` | Update own `draft` or `rejected` school |
| Delete | DELETE | `/volunteer/schools/:id` | `auth`, `volunteer`, `profileComplete` | Delete own `draft` school only |
| Submit | POST | `/volunteer/schools/:id/submit` | `auth`, `volunteer`, `profileComplete` | Move own `draft` or corrected `rejected` school to `pending` |

School create/update should accept the complete school payload: `school`, `operators`, `location`, `children_stats`, `welfare`, and optional uploaded photos.

### Volunteer Draft CRUD

Drafts are school records with `status = "draft"`. These routes are mobile convenience routes for Flutter.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/volunteer/schools/drafts` | `auth`, `volunteer`, `profileComplete` | List own draft schools |
| Create | POST | `/volunteer/schools/drafts` | `auth`, `volunteer`, `profileComplete` | Create a partial school draft |
| Read | GET | `/volunteer/schools/drafts/:id` | `auth`, `volunteer`, `profileComplete` | Read one own draft |
| Update | PUT/PATCH | `/volunteer/schools/drafts/:id` | `auth`, `volunteer`, `profileComplete` | Update partial draft data |
| Delete | DELETE | `/volunteer/schools/drafts/:id` | `auth`, `volunteer`, `profileComplete` | Delete own draft |
| Submit | POST | `/volunteer/schools/drafts/:id/submit` | `auth`, `volunteer`, `profileComplete` | Validate draft and submit for admin review |

### School Operator CRUD

Operators are nested under a school. Volunteers can manage operators only for their own `draft` or `rejected` schools. Admins can read operators through admin school detail responses.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/volunteer/schools/:schoolId/operators` | `auth`, `volunteer`, `profileComplete` | List operators for own school |
| Create | POST | `/volunteer/schools/:schoolId/operators` | `auth`, `volunteer`, `profileComplete` | Add operator/Mallam |
| Read | GET | `/volunteer/schools/:schoolId/operators/:id` | `auth`, `volunteer`, `profileComplete` | Read one operator |
| Update | PUT/PATCH | `/volunteer/schools/:schoolId/operators/:id` | `auth`, `volunteer`, `profileComplete` | Update operator name/phone |
| Delete | DELETE | `/volunteer/schools/:schoolId/operators/:id` | `auth`, `volunteer`, `profileComplete` | Remove operator from own editable school |

### School Location CRUD

Location is a one-to-one school resource. Use `PUT` as an upsert because each school should have one location row.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| Read | GET | `/volunteer/schools/:schoolId/location` | `auth`, `volunteer`, `profileComplete` | Read own school location |
| Create/Update | PUT | `/volunteer/schools/:schoolId/location` | `auth`, `volunteer`, `profileComplete` | Upsert map/manual location |
| Partial update | PATCH | `/volunteer/schools/:schoolId/location` | `auth`, `volunteer`, `profileComplete` | Update selected location fields |
| Delete | DELETE | `/volunteer/schools/:schoolId/location` | `auth`, `volunteer`, `profileComplete` | Clear own editable school location |

### School Children Stats CRUD

Children stats are a one-to-one school resource. Use `PUT` as an upsert.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| Read | GET | `/volunteer/schools/:schoolId/children-stats` | `auth`, `volunteer`, `profileComplete` | Read own school child counts |
| Create/Update | PUT | `/volunteer/schools/:schoolId/children-stats` | `auth`, `volunteer`, `profileComplete` | Upsert children statistics |
| Partial update | PATCH | `/volunteer/schools/:schoolId/children-stats` | `auth`, `volunteer`, `profileComplete` | Update selected count fields |
| Delete | DELETE | `/volunteer/schools/:schoolId/children-stats` | `auth`, `volunteer`, `profileComplete` | Clear own editable school child counts |

### School Welfare CRUD

Welfare is a one-to-one school resource. Use `PUT` as an upsert.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| Read | GET | `/volunteer/schools/:schoolId/welfare` | `auth`, `volunteer`, `profileComplete` | Read own school welfare assessment |
| Create/Update | PUT | `/volunteer/schools/:schoolId/welfare` | `auth`, `volunteer`, `profileComplete` | Upsert welfare and safety fields |
| Partial update | PATCH | `/volunteer/schools/:schoolId/welfare` | `auth`, `volunteer`, `profileComplete` | Update selected welfare fields |
| Delete | DELETE | `/volunteer/schools/:schoolId/welfare` | `auth`, `volunteer`, `profileComplete` | Clear own editable school welfare assessment |

### School Photo CRUD

Use multipart form-data for upload. Volunteers can manage photos only for their own editable schools.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/volunteer/schools/:schoolId/photos` | `auth`, `volunteer`, `profileComplete` | List photos for own school |
| Create | POST | `/volunteer/schools/:schoolId/photos` | `auth`, `volunteer`, `profileComplete` | Upload one or more photos |
| Read | GET | `/volunteer/schools/:schoolId/photos/:id` | `auth`, `volunteer`, `profileComplete` | Read one photo metadata record |
| Update | PUT/PATCH | `/volunteer/schools/:schoolId/photos/:id` | `auth`, `volunteer`, `profileComplete` | Update photo category/caption |
| Delete | DELETE | `/volunteer/schools/:schoolId/photos/:id` | `auth`, `volunteer`, `profileComplete` | Delete photo from own editable school |

### Admin Dashboard

Dashboard is read-only.

| Action | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| Read | GET | `/admin/dashboard` | `auth`, `admin` | Read admin stats and recent notifications |

### Admin Notification CRUD

Notifications are created by the backend when volunteers submit schools. Admins can read and update notification state.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/admin/notifications` | `auth`, `admin` | List notifications |
| Create | POST | `/admin/notifications` | `auth`, `admin` | Optional manual/system notification creation |
| Read | GET | `/admin/notifications/:id` | `auth`, `admin` | Read one notification |
| Update | PUT/PATCH | `/admin/notifications/:id` | `auth`, `admin` | Update notification status or metadata |
| Delete | DELETE | `/admin/notifications/:id` | `auth`, `admin` | Delete/archive notification |
| Mark read | POST | `/admin/notifications/:id/read` | `auth`, `admin` | Mark one notification as read |
| Mark all read | POST | `/admin/notifications/read-all` | `auth`, `admin` | Mark all notifications as read |

### Admin Volunteer CRUD

Admins manage volunteer accounts from the React dashboard. Admins can read profile and submitted-school data for every volunteer.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/admin/volunteers` | `auth`, `admin` | List volunteer users and profile status |
| Create | POST | `/admin/volunteers` | `auth`, `admin` | Create volunteer user account |
| Read | GET | `/admin/volunteers/:id` | `auth`, `admin` | Read selected volunteer profile and summary |
| Update | PUT/PATCH | `/admin/volunteers/:id` | `auth`, `admin` | Update volunteer account/profile fields if admin policy allows |
| Delete | DELETE | `/admin/volunteers/:id` | `auth`, `admin` | Disable or soft-delete volunteer account |
| Schools | GET | `/admin/volunteers/:id/schools` | `auth`, `admin` | List all schools submitted by selected volunteer |

If account deletion is not allowed, `DELETE /admin/volunteers/:id` should soft-disable the account rather than hard-delete user history.

### Admin School CRUD

Admins can read all schools and review submitted schools. Admin-created schools are optional; if unsupported, omit `POST /admin/schools`.

| CRUD | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/admin/schools` | `auth`, `admin` | List all school submissions |
| Create | POST | `/admin/schools` | `auth`, `admin` | Optional admin-created school record |
| Read | GET | `/admin/schools/:id` | `auth`, `admin` | Read full school submission |
| Update | PUT/PATCH | `/admin/schools/:id` | `auth`, `admin` | Update school data if admin correction policy allows |
| Delete | DELETE | `/admin/schools/:id` | `auth`, `admin` | Soft-delete or archive school record |
| Status update | PATCH | `/admin/schools/:id/status` | `auth`, `admin` | Change review status |
| Approve | POST | `/admin/schools/:id/approve` | `auth`, `admin` | Approve pending school |
| Reject | POST | `/admin/schools/:id/reject` | `auth`, `admin` | Reject pending school |
| Reviews | GET | `/admin/schools/:id/reviews` | `auth`, `admin` | Read review history |

### Public Approved School Read API

These routes expose approved schools only. They are read-only.

| Action | Method | Path | Middleware | Purpose |
| --- | --- | --- | --- | --- |
| List | GET | `/schools` | `auth` | List approved schools |
| Read | GET | `/schools/:id` | `auth` | Read approved school and create view record |

## Suggested Route Files

### `project/src/routes/volunteer.js`

```js
module.exports = [
  { method: 'GET', path: '/dashboard', name: 'dashboard', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerDashboardController.index' },

  { method: 'POST', path: '/profile', name: 'profile.store', middleware: ['auth', 'volunteer'], handler: 'volunteer/VolunteerProfileController.store' },
  { method: 'GET', path: '/profile', name: 'profile.show', middleware: ['auth', 'volunteer'], handler: 'volunteer/VolunteerProfileController.show' },
  { method: 'PUT', path: '/profile', name: 'profile.update', middleware: ['auth', 'volunteer'], handler: 'volunteer/VolunteerProfileController.update' },
  { method: 'PATCH', path: '/profile', name: 'profile.patch', middleware: ['auth', 'volunteer'], handler: 'volunteer/VolunteerProfileController.update' },
  { method: 'DELETE', path: '/profile', name: 'profile.destroy', middleware: ['auth', 'volunteer'], handler: 'volunteer/VolunteerProfileController.destroy' },
  { method: 'GET', path: '/profile/activity', name: 'profile.activity', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerProfileController.activity' },

  { method: 'POST', path: '/schools/drafts', name: 'schools.drafts.create', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.create_draft' },
  { method: 'GET', path: '/schools/drafts', name: 'schools.drafts.index', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.list_drafts' },
  { method: 'GET', path: '/schools/drafts/:id', name: 'schools.drafts.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.show_draft' },
  { method: 'PUT', path: '/schools/drafts/:id', name: 'schools.drafts.update', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.update_draft' },
  { method: 'PATCH', path: '/schools/drafts/:id', name: 'schools.drafts.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.update_draft' },
  { method: 'DELETE', path: '/schools/drafts/:id', name: 'schools.drafts.delete', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.delete_draft' },
  { method: 'POST', path: '/schools/drafts/:id/submit', name: 'schools.drafts.submit', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.submit_draft' },

  { method: 'POST', path: '/schools', name: 'schools.submit', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.submit' },
  { method: 'GET', path: '/schools', name: 'schools.index', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.index' },
  { method: 'GET', path: '/schools/:id', name: 'schools.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.show' },
  { method: 'PUT', path: '/schools/:id', name: 'schools.update', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.update' },
  { method: 'PATCH', path: '/schools/:id', name: 'schools.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.update' },
  { method: 'DELETE', path: '/schools/:id', name: 'schools.destroy', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.destroy' },
  { method: 'POST', path: '/schools/:id/submit', name: 'schools.submitExisting', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolController.submit_existing' },

  { method: 'GET', path: '/schools/:schoolId/operators', name: 'schools.operators.index', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolOperatorController.index' },
  { method: 'POST', path: '/schools/:schoolId/operators', name: 'schools.operators.store', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolOperatorController.store' },
  { method: 'GET', path: '/schools/:schoolId/operators/:id', name: 'schools.operators.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolOperatorController.show' },
  { method: 'PUT', path: '/schools/:schoolId/operators/:id', name: 'schools.operators.update', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolOperatorController.update' },
  { method: 'PATCH', path: '/schools/:schoolId/operators/:id', name: 'schools.operators.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolOperatorController.update' },
  { method: 'DELETE', path: '/schools/:schoolId/operators/:id', name: 'schools.operators.destroy', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolOperatorController.destroy' },

  { method: 'GET', path: '/schools/:schoolId/location', name: 'schools.location.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolLocationController.show' },
  { method: 'PUT', path: '/schools/:schoolId/location', name: 'schools.location.upsert', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolLocationController.upsert' },
  { method: 'PATCH', path: '/schools/:schoolId/location', name: 'schools.location.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolLocationController.update' },
  { method: 'DELETE', path: '/schools/:schoolId/location', name: 'schools.location.destroy', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolLocationController.destroy' },

  { method: 'GET', path: '/schools/:schoolId/children-stats', name: 'schools.childrenStats.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolChildrenStatsController.show' },
  { method: 'PUT', path: '/schools/:schoolId/children-stats', name: 'schools.childrenStats.upsert', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolChildrenStatsController.upsert' },
  { method: 'PATCH', path: '/schools/:schoolId/children-stats', name: 'schools.childrenStats.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolChildrenStatsController.update' },
  { method: 'DELETE', path: '/schools/:schoolId/children-stats', name: 'schools.childrenStats.destroy', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolChildrenStatsController.destroy' },

  { method: 'GET', path: '/schools/:schoolId/welfare', name: 'schools.welfare.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolWelfareController.show' },
  { method: 'PUT', path: '/schools/:schoolId/welfare', name: 'schools.welfare.upsert', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolWelfareController.upsert' },
  { method: 'PATCH', path: '/schools/:schoolId/welfare', name: 'schools.welfare.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolWelfareController.update' },
  { method: 'DELETE', path: '/schools/:schoolId/welfare', name: 'schools.welfare.destroy', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolWelfareController.destroy' },

  { method: 'GET', path: '/schools/:schoolId/photos', name: 'schools.photos.index', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolPhotoController.index' },
  { method: 'POST', path: '/schools/:schoolId/photos', name: 'schools.photos.store', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolPhotoController.store' },
  { method: 'GET', path: '/schools/:schoolId/photos/:id', name: 'schools.photos.show', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolPhotoController.show' },
  { method: 'PUT', path: '/schools/:schoolId/photos/:id', name: 'schools.photos.update', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolPhotoController.update' },
  { method: 'PATCH', path: '/schools/:schoolId/photos/:id', name: 'schools.photos.patch', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolPhotoController.update' },
  { method: 'DELETE', path: '/schools/:schoolId/photos/:id', name: 'schools.photos.destroy', middleware: ['auth', 'volunteer', 'profileComplete'], handler: 'volunteer/VolunteerSchoolPhotoController.destroy' },
];
```

### `project/src/routes/admin.js`

```js
module.exports = [
  { method: 'GET', path: '/dashboard', name: 'dashboard', middleware: ['auth', 'admin'], handler: 'admin/AdminDashboardController.index' },

  { method: 'GET', path: '/notifications', name: 'notifications.index', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.index' },
  { method: 'POST', path: '/notifications', name: 'notifications.store', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.store' },
  { method: 'POST', path: '/notifications/read-all', name: 'notifications.readAll', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.mark_all_read' },
  { method: 'GET', path: '/notifications/:id', name: 'notifications.show', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.show' },
  { method: 'PUT', path: '/notifications/:id', name: 'notifications.update', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.update' },
  { method: 'PATCH', path: '/notifications/:id', name: 'notifications.patch', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.update' },
  { method: 'DELETE', path: '/notifications/:id', name: 'notifications.destroy', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.destroy' },
  { method: 'POST', path: '/notifications/:id/read', name: 'notifications.read', middleware: ['auth', 'admin'], handler: 'admin/AdminNotificationController.mark_read' },

  { method: 'GET', path: '/volunteers', name: 'volunteers.index', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.index' },
  { method: 'POST', path: '/volunteers', name: 'volunteers.store', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.store' },
  { method: 'GET', path: '/volunteers/:id', name: 'volunteers.show', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.show' },
  { method: 'PUT', path: '/volunteers/:id', name: 'volunteers.update', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.update' },
  { method: 'PATCH', path: '/volunteers/:id', name: 'volunteers.patch', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.update' },
  { method: 'DELETE', path: '/volunteers/:id', name: 'volunteers.destroy', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.destroy' },
  { method: 'GET', path: '/volunteers/:id/schools', name: 'volunteers.schools', middleware: ['auth', 'admin'], handler: 'admin/AdminVolunteerController.schools' },

  { method: 'GET', path: '/schools', name: 'schools.index', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolController.index' },
  { method: 'POST', path: '/schools', name: 'schools.store', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolController.store' },
  { method: 'GET', path: '/schools/:id', name: 'schools.show', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolController.show' },
  { method: 'PUT', path: '/schools/:id', name: 'schools.update', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolController.update' },
  { method: 'PATCH', path: '/schools/:id', name: 'schools.patch', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolController.update' },
  { method: 'DELETE', path: '/schools/:id', name: 'schools.destroy', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolController.destroy' },
  { method: 'PATCH', path: '/schools/:id/status', name: 'schools.status', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolReviewController.update_status' },
  { method: 'POST', path: '/schools/:id/approve', name: 'schools.approve', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolReviewController.approve' },
  { method: 'POST', path: '/schools/:id/reject', name: 'schools.reject', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolReviewController.reject' },
  { method: 'GET', path: '/schools/:id/reviews', name: 'schools.reviews', middleware: ['auth', 'admin'], handler: 'admin/AdminSchoolReviewController.index' },
];
```

### `project/src/routes/schools.js`

```js
module.exports = [
  { method: 'GET', path: '/', name: 'index', middleware: 'auth', handler: 'school/SchoolController.index' },
  { method: 'GET', path: '/:id', name: 'show', middleware: 'auth', handler: 'school/SchoolController.show' },
];
```

## Controller Rules

- Admin credentials must never pass volunteer route middleware.
- Volunteer credentials must never pass admin route middleware.
- The React admin dashboard should call `/auth/me` after token restore and redirect away if the user role is not `admin`.
- The Flutter volunteer app should call `/auth/me` after token restore and sign out or block access if the user role is not `volunteer`.
- Volunteer profile completion must be checked before dashboard, school, draft, photo, and activity endpoints.
- `GET /volunteer/profile` and `PUT /volunteer/profile` must remain accessible to signed-in volunteers even when the profile is incomplete.
- `PUT /volunteer/profile` should set `is_completed = true` only after `full_name`, `phone`, `state`, `lga`, and `address` are present.
- Volunteer controllers must only read or modify records where `submitted_by_user_id` equals `req.auth.user.id`.
- Volunteers can edit `draft` records and rejected records that need correction.
- Volunteers cannot edit `pending` or `approved` submissions unless the product rules later allow resubmission.
- Submitting a school for review must set status to `pending` and create an unread `admin_notifications` row.
- Admin controllers can read all volunteer profiles and all schools.
- `GET /admin/volunteers/:id/schools` must only return schools where `submitted_by_user_id` equals the selected volunteer id.
- Admin review routes must only accept `pending` schools.
- Admin approval/rejection must update school status and resolve related school-submission notifications.
- Public school routes should only return `approved` schools.
- Every school detail view should create a `school_views` record for the authenticated user.

## Response Format

Use the response shape already used by `AuthController`:

Success:

```json
{
  "success": true,
  "data": {}
}
```

Validation or permission error:

```json
{
  "success": false,
  "error": "Human readable message"
}
```

Recommended status codes:

- `200` for successful reads and updates
- `201` for created records
- `400` for validation errors
- `401` for missing or invalid token
- `403` for wrong role or ownership
- `404` for missing records
- `409` for invalid state transition, such as approving an already rejected school
- `500` for unexpected server errors
