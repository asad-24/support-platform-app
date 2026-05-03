# Flutter Sites Endpoint Test Report

Generated for the backend Flutter school/site contract implementation.

## Passing Endpoint Coverage

| Endpoint | Expected status | Covered scenario |
| --- | ---: | --- |
| `GET /sites` | `200` | Lists verified sites for authenticated helper, supports `verificationStatus`, `urgencyLevel`, and `need` filters. |
| `GET /sites` without auth | `401` | Rejects unauthenticated access. |
| `POST /sites` | `201` | Creates a pending site and returns raw Flutter `Site` JSON. |
| `GET /sites/:id` | `200` | Returns raw Flutter `Site` detail for a verified site. |
| `PUT /sites/:id?correctionOnly=true` | `200` | Resubmits a rejected/correction site and clears correction issues. |
| `DELETE /sites/:id` | `200` | Deletes a volunteer-owned correction record. |
| `POST /sites/:id/media` | `201` | Stores media metadata and returns raw Flutter `MediaFile` JSON. |
| `POST /sites/:id/assessment` | `201` | Upserts welfare assessment and returns raw Flutter `WelfareAssessment` JSON. |
| `GET /users/:userId/submitted-sites` | `200` | Returns current volunteer submissions as `{ items, total }`. |
| `GET /users/:userId/submitted-sites` cross-user | `403` | Blocks another volunteer from reading someone else's submitted sites. |
| `GET /dashboard/summary` | `200` | Returns `totalSites`, `estimatedChildren`, `pendingVerification`, `verifiedSites`, and `highUrgencySites`. |
| `GET /exports/sites` | `200` | Returns JSON-wrapped CSV export for authenticated admin. |
| `GET /locations/nigeria/states-lgas` | `200` | Public endpoint returns Nigeria state/LGA reference data. |
| `GET /sites/drafts` | `200` | Lists backend drafts as `{ items, total }`. |
| `POST /sites/drafts` | `201` | Creates a backend draft. |
| `GET /sites/drafts/:id` | `200` | Returns one backend draft by id. |
| `PUT /sites/drafts/:id` | `200` | Updates backend draft payload. |
| `DELETE /sites/drafts/:id` | `200` | Deletes backend draft. |
| `POST /sites/drafts/:id/submit` | `200` | Converts draft to pending verification site. |
| `POST /auth/sign-in` default admin | `401` | Confirms a fresh database does not auto-create a default admin. |
| `POST /sites` as helper | `403` | Blocks helper write access. |

## Verification Commands

```sh
npm test -- --runTestsByPath tests/src/routes/flutter_sites.test.js
npm test -- --runTestsByPath tests/src/routes/flutter_auth.test.js tests/src/routes/auth.test.js tests/src/routes/volunteer_admin.test.js tests/src/routes/flutter_sites.test.js
```

Both endpoint-focused commands passed.

## Full Suite Note

`npm test` still has existing non-site failures in `tests/core/env.test.js`, `tests/core/debug.test.js`, and the MySQL-backed job tests. The Flutter site/auth route tests pass.
