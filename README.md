# School Support Atlas

Mobile-first Flutter MVP for mapping and supporting informal education / Almajiri-style learning centres in Nigeria.

Tagline: **Enabling data-driven transformation in education**

## What is included

- Token-based auth flow with access/refresh token storage via `flutter_secure_storage`.
- Role-aware routing for Admin and Field Worker users.
- Admin dashboard summary, site list filters, map view, site profiles, CSV export preview.
- Seven-step site registration form with GPS capture, aggregate child population data, welfare assessment, photo attachment UI, draft saving, and sync-later queue.
- Clean architecture folders under `lib/core`, `lib/features`, and `lib/shared`.
- Mock repositories shaped around the target API endpoints, ready to replace with real backend calls.

## Demo login

- Admin: use any email containing `admin`, for example `admin@atlas.local`.
- Field Worker: use any other email, for example `field@atlas.local`.
- Password must be at least 6 characters. The scaffold uses `password`.

## Setup

```sh
flutter pub get
flutter run
```

Set the API base URL at build time when a backend is available:

```sh
flutter run --dart-define=API_BASE_URL=https://your-api.example.com
```

## Maps and platform configuration

Google Maps is wired through `google_maps_flutter`. Add your key in platform configuration before device testing:

- Android: define `GOOGLE_MAPS_API_KEY` in `android/local.properties` or Gradle manifest placeholders.
- iOS: add the Google Maps API key in AppDelegate when enabling production maps.
- Web: follow the Google Maps Flutter web setup and provide the Maps JavaScript API key.

Location and camera permissions have been added for Android and iOS.

## Target backend endpoints

The repository interfaces currently map to:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /sites`
- `GET /sites/:id`
- `POST /sites`
- `PUT /sites/:id`
- `POST /sites/:id/media`
- `POST /sites/:id/assessment`
- `GET /dashboard/summary`
- `GET /exports/sites.csv`

Replace the mock repository providers with Dio-backed implementations in `lib/features/*/data` when the backend is ready.

## Data ethics notes

The MVP captures aggregate child counts only. It intentionally avoids child names, photos tagged to individual children, or unnecessary identifiable welfare data. Safeguarding notes are only shown to admin users in the frontend and should be protected again by backend authorization.
# support-platform-app
