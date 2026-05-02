# Database Design

This document describes the database structure for the School Support Atlas platform. The React admin website and Flutter volunteer mobile app use the same backend API and the same database. The app uses Express with Sequelize, so each table should have a migration in `project/src/database/migrations/` and a matching model in `project/src/models/`.

## Application Clients

- Admin client: React web dashboard for admins.
- Volunteer client: Flutter mobile app for volunteers.
- Shared backend: Express API, shared authentication, shared database, shared school records.
- Admin credentials must only be used for the React admin dashboard.
- Admin users must not be allowed to access the Flutter volunteer app or volunteer-only routes.
- Volunteer credentials must only be used for the Flutter volunteer app.
- Volunteer users must not be allowed to access the React admin dashboard or admin-only routes.
- Admins can see volunteer profiles, all schools submitted by a selected volunteer, pending school submissions, and dashboard notifications.
- Volunteers can only see and manage their own profile, drafts, submissions, and school photos.

## Existing Table

### users

Stores admins and volunteers.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| name | string | yes | User display name |
| email | string | yes | Unique login email |
| role | string | yes | `admin` or `volunteer` |
| password_salt | string | yes | Password salt |
| password_hash | string | yes | Password hash |
| access_token | string | no | Current API access token |
| access_token_created_at | date | no | Token issue time |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

## New Tables

### volunteer_profiles

Stores volunteer-specific profile fields separately from login credentials. A volunteer must complete this profile after sign-up/sign-in before accessing the dashboard, school forms, drafts, or any other volunteer feature.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| user_id | integer | yes | FK to `users.id`, unique |
| full_name | string | yes | Profile name shown in volunteer area |
| phone | string | yes | Volunteer contact phone |
| profile_photo_url | string | no | Uploaded profile photo |
| state | string | yes | Nigerian state where volunteer works |
| lga | string | yes | Local government area |
| community | string | no | Local community name |
| address | text | yes | Volunteer address |
| bio | text | no | Short volunteer bio |
| is_completed | boolean | yes | Default `false`; set `true` after required profile fields are saved |
| completed_at | date | no | Time when profile was completed |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationship:

- `User hasOne VolunteerProfile`
- `VolunteerProfile belongsTo User`

Required fields for completion:

- `full_name`
- `phone`
- `state`
- `lga`
- `address`

The frontend should redirect a signed-in volunteer to the profile form when no profile exists or `is_completed = false`.

### schools

Stores school submissions created by volunteers and reviewed by admins.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| submitted_by_user_id | integer | yes | FK to volunteer `users.id` |
| approved_by_user_id | integer | no | FK to admin `users.id` |
| school_name | string | yes | Name of the school |
| school_type | string | yes | See allowed school types below |
| operator_name | string | no | Kept for simple one-operator display |
| status | string | yes | `draft`, `pending`, `approved`, `rejected` |
| urgency | string | no | `high`, `medium`, `low` |
| admin_feedback | text | no | Review comment from admin |
| submitted_at | date | no | Set when draft is submitted |
| reviewed_at | date | no | Set when approved or rejected |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Allowed `school_type` values:

- `traditional_quranic_school`
- `integrated_quranic_school`
- `informal_islamic_school`
- `non_formal_education_center`
- `community_islamic_school`

Relationships:

- `School belongsTo User as submittedBy`
- `School belongsTo User as approvedBy`
- `User hasMany School as submittedSchools`
- `User hasMany School as approvedSchools`

### school_operators

Supports one or many operators/Mallams per school.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id` |
| name | string | yes | Operator or Mallam name |
| phone | string | no | Operator phone number |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationship:

- `School hasMany SchoolOperator`
- `SchoolOperator belongsTo School`

### school_locations

Stores map and manually entered location data.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id`, unique |
| latitude | decimal | no | Captured by map/current location |
| longitude | decimal | no | Captured by map/current location |
| country | string | yes | Default `Nigeria` |
| state | string | no | Nigerian state |
| lga | string | no | Local government area |
| community | string | no | Community or ward |
| address | text | no | Manual address/details |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationship:

- `School hasOne SchoolLocation`
- `SchoolLocation belongsTo School`

### school_photos

Stores photos uploaded or captured by the volunteer.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id` |
| uploaded_by_user_id | integer | yes | FK to volunteer `users.id` |
| file_url | string | yes | Storage URL or local file path |
| category | string | yes | See allowed photo categories below |
| caption | string | no | Optional description |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Allowed `category` values:

- `entrance`
- `class_area`
- `sleeping_area`
- `sanitation_area`
- `general_environment`
- `other`

Relationships:

- `School hasMany SchoolPhoto`
- `SchoolPhoto belongsTo School`
- `SchoolPhoto belongsTo User as uploadedBy`

### school_children_stats

Stores child count, residence, gender, and age distribution.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id`, unique |
| total_children | integer | yes | Total children in school |
| residential_children | integer | no | Children living at school |
| non_residential_children | integer | no | Children not living at school |
| boys_count | integer | no | Male children count |
| girls_count | integer | no | Female children count |
| age_3_5_count | integer | no | Children ages 3-5 |
| age_6_10_count | integer | no | Children ages 6-10 |
| age_11_15_count | integer | no | Children ages 11-15 |
| age_16_18_count | integer | no | Children ages 16-18 |
| age_18_plus_count | integer | no | Children older than 18 |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationship:

- `School hasOne SchoolChildrenStats`
- `SchoolChildrenStats belongsTo School`

Validation rules:

- `total_children` should be greater than or equal to zero.
- If gender counts are provided, `boys_count + girls_count` should not exceed `total_children`.
- If residential counts are provided, `residential_children + non_residential_children` should not exceed `total_children`.

### school_welfare_assessments

Stores welfare fields and safety risks observed by the volunteer.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id`, unique |
| has_clean_water | boolean | no | Clean water access |
| has_sanitation | boolean | no | Sanitation access |
| has_healthcare | boolean | no | Healthcare access |
| has_nutritious_food | boolean | no | Food access |
| has_educational_materials | boolean | no | Educational materials access |
| has_recreational_facilities | boolean | no | Recreational access |
| has_clothing_shelter | boolean | no | Clothing and shelter access |
| has_sleeping_area | boolean | no | Sleeping area access |
| has_electricity | boolean | no | Electricity access |
| has_internet | boolean | no | Internet access |
| has_transportation | boolean | no | Transportation access |
| has_financial_resources | boolean | no | Financial resources access |
| safety_physical_abuse | boolean | no | Physical abuse observed |
| safety_child_labor | boolean | no | Child labor observed |
| safety_sexual_abuse | boolean | no | Sexual abuse observed |
| safety_trafficking | boolean | no | Trafficking observed |
| additional_notes | text | no | Volunteer notes |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationship:

- `School hasOne SchoolWelfareAssessment`
- `SchoolWelfareAssessment belongsTo School`

### school_reviews

Keeps admin review history. The latest review also updates `schools.status`, `schools.approved_by_user_id`, `schools.admin_feedback`, and `schools.reviewed_at`.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id` |
| reviewed_by_user_id | integer | yes | FK to admin `users.id` |
| status | string | yes | `approved` or `rejected` |
| comment | text | no | Review feedback |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationships:

- `School hasMany SchoolReview`
- `SchoolReview belongsTo School`
- `SchoolReview belongsTo User as reviewedBy`

### school_views

Tracks users who open/view a school detail page.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| school_id | integer | yes | FK to `schools.id` |
| user_id | integer | yes | FK to `users.id` |
| viewed_at | date | yes | Time of view |

Relationships:

- `School hasMany SchoolView`
- `SchoolView belongsTo School`
- `SchoolView belongsTo User`

Index suggestion:

- Composite index on `school_id`, `user_id`, `viewed_at`.

### volunteer_activity_logs

Stores activity shown in the volunteer profile/history screen.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| user_id | integer | yes | FK to `users.id` |
| school_id | integer | no | Optional FK to `schools.id` |
| action | string | yes | Example: `school_drafted`, `school_submitted`, `school_approved`, `school_rejected`, `profile_updated` |
| metadata | json | no | Extra activity context |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationships:

- `User hasMany VolunteerActivityLog`
- `VolunteerActivityLog belongsTo User`
- `VolunteerActivityLog belongsTo School`

### admin_notifications

Stores notifications shown in the React admin dashboard. A notification should be created when a volunteer submits a school for review.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| actor_user_id | integer | yes | FK to volunteer `users.id` who caused the notification |
| school_id | integer | no | FK to submitted `schools.id` |
| type | string | yes | Example: `school_submitted` |
| title | string | yes | Short dashboard notification title |
| message | text | yes | Human-readable notification message |
| status | string | yes | `unread`, `read`, `resolved` |
| read_at | date | no | Set when admin reads notification |
| resolved_at | date | no | Set when related review is approved/rejected |
| metadata | json | no | Extra context for dashboard display |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationships:

- `AdminNotification belongsTo User as actor`
- `AdminNotification belongsTo School`

Index suggestions:

- Index `status` for unread dashboard counts.
- Index `type` and `created_at` for notification filtering.
- Index `school_id` so review actions can resolve related notifications.

### volunteer_notifications

Stores notifications shown in the Flutter volunteer app. A notification should be created when an admin approves or rejects a school submitted by that volunteer.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | integer | yes | Primary key |
| recipient_user_id | integer | yes | FK to volunteer `users.id` who receives the notification |
| actor_user_id | integer | no | FK to admin `users.id` who caused the notification |
| school_id | integer | no | FK to reviewed `schools.id` |
| type | string | yes | Example: `school_approved`, `school_rejected` |
| title | string | yes | Short notification title |
| message | text | yes | Human-readable notification message |
| status | string | yes | `unread` or `read` |
| read_at | date | no | Set when volunteer reads notification |
| metadata | json | no | Extra context such as school name, status, or admin comment |
| created_at | date | yes | Sequelize timestamp |
| updated_at | date | yes | Sequelize timestamp |

Relationships:

- `VolunteerNotification belongsTo User as recipient`
- `VolunteerNotification belongsTo User as actor`
- `VolunteerNotification belongsTo School`

Index suggestions:

- Composite index on `recipient_user_id` and `status` for unread counts.
- Composite index on `recipient_user_id` and `created_at` for inbox ordering.
- Index `school_id` so a school review can be traced to its volunteer notification.

## Status Flow

1. User signs up as a volunteer.
2. User signs in and receives an access token.
3. Volunteer completes the profile form.
4. After profile completion, volunteer can access the dashboard.
5. Volunteer saves school form progress as `draft`.
6. Volunteer submits the completed school record and status becomes `pending`.
7. Backend creates an `admin_notifications` row with type `school_submitted`.
8. React admin dashboard shows the pending notification.
9. Admin opens the notification, reviews the school, and can view the volunteer profile plus all schools submitted by that volunteer.
10. Admin approval changes school status to `approved`.
11. Admin rejection changes school status to `rejected` and should include feedback.
12. Review action marks the related admin notification as `resolved`.
13. Review action creates a `volunteer_notifications` row for the school submitter.
14. Flutter volunteer app shows the approval/rejection notification in the volunteer inbox.

Only `approved` schools should be visible in public or shared school lists. Volunteers should still be able to see their own `draft`, `pending`, `approved`, and `rejected` submissions.

## Dashboard Counts

Volunteer dashboard stats can be computed from the `schools` table only after the volunteer profile is complete:

- Total submitted: count schools where `submitted_by_user_id = current user id` and status is not `draft`.
- Pending: count status `pending`.
- Approved: count status `approved`.
- Rejected: count status `rejected`.
- Drafts: count status `draft`.
- Unread notifications: count `volunteer_notifications` where `recipient_user_id = current user id` and status is `unread`.

Admin dashboard stats can be computed from `schools`, `users`, and `admin_notifications`:

- Pending reviews: count schools where status is `pending`.
- Approved schools: count schools where status is `approved`.
- Rejected schools: count schools where status is `rejected`.
- Total volunteers: count users where role is `volunteer`.
- Completed volunteer profiles: count completed `volunteer_profiles`.
- Unread notifications: count `admin_notifications` where status is `unread`.

## Recommended Sequelize Model Names

- `VolunteerProfile`
- `School`
- `SchoolOperator`
- `SchoolLocation`
- `SchoolPhoto`
- `SchoolChildrenStats`
- `SchoolWelfareAssessment`
- `SchoolReview`
- `SchoolView`
- `VolunteerActivityLog`
- `AdminNotification`
- `VolunteerNotification`

## Implementation Order

1. Create migrations for the new tables.
2. Create models and define associations.
3. Add profile completion logic and a profile-completion middleware.
4. Add volunteer routes/controllers for profile, dashboard, school drafts, and school submission.
5. Add admin routes/controllers for dashboard, notifications, volunteer profile lookup, volunteer schools, and school review.
6. Add file upload handling for school photos and profile photos.
7. Add tests for auth, incomplete profile blocking, profile completion, ownership, draft submit, notification creation, admin volunteer lookup, admin review, and dashboard counts.
