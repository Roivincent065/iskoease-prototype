# ISKOEASE - Scholarship Portal Prototype

ISKOEASE is a frontend-only scholarship portal prototype. It uses sample data and stores changes in the browser's `localStorage`; it does not use a backend or real authentication.

## Setup

1. Install [Bun](https://bun.sh/) if it is not already installed.
2. From the project directory, install dependencies and start the development server:

   ```sh
   bun install
   bun run dev
   ```

3. Open the local URL printed by Vite in your browser.

## Demo access

Choose **Administrator Demo** on the sign-in page to open the admin area, or **Student Demo** to view the student experience. Demo access does not require credentials.

Administrators can:

- View dashboard summary cards and recent applications.
- Create, edit, activate/deactivate, and delete scholarship listings. Deletion requires confirmation.
- Search applications, filter by status, review application details, and update their status.
- Create, edit, and delete announcements.

Changes are shared between the student and administrator views in the same browser and remain after refresh. Clearing this site's browser storage resets the prototype data.

## Checks

```sh
bun run test
bun run lint
bun run build
```

## Deploying to Vercel

The production build uses Nitro's Vercel preset and writes the deployment output to `.vercel/output`.
In Vercel Project Settings, use **Other** as the Framework Preset, set the Build Command to
`npm run build`, and clear any custom Output Directory such as `dist`. Do not set an Output
Directory for this server-rendered app; Vercel should use Nitro's generated output.
