Purpose
-------
These instructions help AI coding assistants become productive quickly in this Angular workspace (Activa Sports). Focus on concrete, discoverable patterns and files—not generic advice.

Quick facts
-----------
- Framework: Angular 18 + Angular Material
- Main entry: `src/main.ts` -> `src/app/app.module.ts`
- Shared module: `src/app/shared/shared.module.ts` (many shared components, Material imports and exports)
- Dev scripts (package.json): `npm start` (ng serve), `npm run build` (ng build), `npm test` (ng test)

Architecture & important boundaries
---------------------------------
- Pages vs Shared: `src/app/pages/*` contains feature modules for roles (client, admin, owner). Use their routing modules for page-level navigation.
- Shared module: `src/app/shared/shared.module.ts` declares and exports common UI components (navbar, footer, dialogs, gestion-*). If you add a UI component used across pages, declare it here and export it.
- Services live in `src/app/services/` and are injected into components (e.g., `CuelloService` used by `MoldeCuellosComponent`). Prefer using these services instead of calling HTTP directly inside components.
- Models live in `src/app/models/` and are simple DTOs (e.g., `cuello.model.ts`). Use them for typing API responses.

Common project patterns
-----------------------
- Material & modules: SharedModule centralizes all Angular Material imports/exports. When adding Material components, import them in `SharedModule` so they become available project-wide.
- Dialogs: Components that open dialogs use `MatDialog` and provide a separate modal component under `shared/components/*-modal`. See `CuellosModalComponent` and `MoldeCuellosComponent` for examples.
- Tables: use `MatTableDataSource<T>` for tables and define `displayedColumns` arrays.
- Snackbars: Use `MatSnackBar` with `snackbar-success` and `snackbar-error` CSS classes (already used in components).

How to add and use a shared component (concrete example)
------------------------------------------------------
To include `MoldeCuellosComponent` in another shared component template (e.g., `GestionPacksComponentComponent`):

1. Confirm the selector: open `src/app/shared/components/gestionPedidos/molde-cuellos/molde-cuellos.component.ts`.
   - Selector: `app-molde-cuellos`

2. Confirm the component is declared and exported in the SharedModule: `src/app/shared/shared.module.ts`.
   - `MoldeCuellosComponent` is declared and also exported from `SharedModule`.

3. Use the component's selector directly in the template where you want it displayed. Example: add the following to `src/app/shared/components/gestionPedidos/gestion-packs-component/gestion-packs-component.component.html`:

   <app-molde-cuellos></app-molde-cuellos>

Notes & caveats
--------------
- If you add a new shared component, update `SharedModule` declarations and exports so other modules can use it without importing the component directly.
- Routing modules (`clientRouting.module.ts`, `admin-routing.module.ts`, `owner-routing.module.ts`) are used to wire pages; don't add page routes directly into `AppRoutingModule` without checking existing role-based routing.
- Internationalization / localization: `MAT_DATE_LOCALE` is set to `es-ES` in `SharedModule` providers.
- Styling: global SCSS is `src/styles.scss`. Component styles use default Angular encapsulation.

Developer workflows
-------------------
- Run dev server: `npm start` (runs `ng serve`).
- Build production: `npm run build`.
- Run tests: `npm test` (Karma + Jasmine configured).

When editing code
-----------------
- Preserve existing module exports when moving components; other parts of the app rely on `SharedModule` exports.
- Prefer to reuse services in `src/app/services` for API calls and centralize error handling in the service when feasible.

Reference files to inspect when working in this repo
---------------------------------------------------
- `src/app/shared/shared.module.ts` — central place for shared components and Material modules.
- `src/app/shared/components/gestionPedidos/molde-cuellos/*` — example of a shared list + dialog + service usage.
- `src/app/services/cuello.service.ts` — shows API calls and observable patterns.
- `package.json` — dev scripts.
- `src/app/pages/*` — page modules and routing per role.

If something is unclear
----------------------
Leave a short note in the PR describing where you changed declarations/exports. When in doubt, check `SharedModule` first: missing exports is the most common cause of "component not found" errors.

End
