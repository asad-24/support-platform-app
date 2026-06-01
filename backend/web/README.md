# School Support Atlas Web

Simple React app for manually testing the shared backend workflow.

## Run

Start the API first:

```bash
cd ../project
DB_DIALECT=sqlite DB_STORAGE=.tmp/dev.sqlite DB_LOGGING=false npm run db:migrate
DB_DIALECT=sqlite DB_STORAGE=.tmp/dev.sqlite DB_LOGGING=false npm run dev
```

Start this web app:

```bash
cd ../web
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Flow

1. Sign up as volunteer.
2. Complete volunteer profile.
3. Submit a school.
4. Sign out.
5. Login as admin.
6. Review notifications and approve/reject the submitted school.
7. View approved schools.
