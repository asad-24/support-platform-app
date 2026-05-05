Here is the rewritten version, cleaned up for Codex. Humanity survives another typo storm.

```text
Project structure:
- app/ contains the Flutter frontend app
- backend/ contains the Express.js backend

Please inspect both folders and implement the following changes.

1. Site photo upload storage

Currently, when images are uploaded for a site from the photos/ section, they are not being stored using the same local storage flow used for profile pictures.

Please check the Flutter frontend app to confirm how these site photos are sent to the backend.

Expected behavior:
- Site photos uploaded from the frontend should be sent to the backend.
- The backend should save those photos in local storage initially.
- The upload flow should work the same way as profile picture uploads.
- Keep the implementation compatible with future S3 storage support.
- For now, only local storage should be used.

Please update the backend and frontend if needed so that site photo uploads are handled correctly.

2. Help and Support screen cleanup

In the Profile screen, there is a Help and Support screen.

At the bottom of this screen, two buttons are currently showing:
- Edit Profile
- Submit School

Please remove both buttons.

Instead, add a support email section where users can see an email address for help and support.

Use this email:
info@example.com

The user should be able to use this email to contact support.

3. Volunteer card level info popup

On the Home screen, there is a volunteer card where the level timeline is shown.

Please add an info icon near the level timeline.

When the user clicks the info icon:
- Open a popup/modal screen.
- The popup should explain how the volunteer levels work.
- It should explain what types of levels exist.
- The popup content should be scrollable.
- The popup must include an X close button.

Keep the UI clean and consistent with the existing design.

4. Documentation

After completing the changes:
- Update the relevant documentation or progress log.
- Mention what files were changed.
- Mention how site photo upload now works.
- Mention the Help and Support screen update.
- Mention the new volunteer level info popup.

Important:
- Keep changes minimal and focused.
- Do not rewrite unrelated code.
- Preserve the existing project structure and coding style.
```

## Implementation notes

- Updated Flutter site submission so the main `/sites` create/update request no longer sends selected photo local paths as JSON media. After the backend returns the site id, each selected photo is uploaded as multipart `media` to `POST /sites/:id/media`.
- The backend media endpoint continues to use `FileStorage`, which writes files to local `/uploads/schools/...` paths now and remains compatible with the existing future S3 storage interface.
- Updated Help & Support to remove the bottom `Edit Profile` and `Submit School` action buttons and show the support email `info@example.com` with copy support.
- Added a Home screen volunteer level info icon and scrollable popup explaining the level thresholds from Community Starter through Atlas Champion.
- Changed files include:
  - `app/lib/features/sites/data/sites_repository.dart`
  - `app/lib/features/sites/presentation/add_site_flow_screen.dart`
  - `app/lib/features/volunteer/presentation/volunteer_help_support_screen.dart`
  - `app/lib/features/volunteer/presentation/volunteer_home_screen.dart`
  - `app/lib/features/volunteer/presentation/volunteer_reward_widgets.dart`
  - `app/pubspec.yaml`
  - `app/pubspec.lock`
  - `app/test/widget_test.dart`


---
while adding a new sschoola as a site initally user have to ad minum two photos in same screen user can add 1 video with at least max size of 4 mb it is optional an laso sotee in local as for images and also s3 implmenetation but nt woring in this milstone it sould be work later 
