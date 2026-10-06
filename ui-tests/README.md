# UI tests

Browser tests of the four sections this app adds to the Settings shell, plus Service Accounts:
WebdriverIO 9 + Mocha against a real XP with the app deployed, Chrome driven over WebDriver.

## What is covered

- `specs/*.page.toolbar*.spec.js` — the browse screens of Users, Service Accounts, Groups and
  Roles: the toolbar with nothing selected (New enabled, Delete disabled) and the Sort by menu.
- `specs/create.idprovider.and.user.spec.js` — the user editor end to end: a user without a password
  and without roles is created and listed.
- `specs/idprovider.in.use.delete.spec.js` — an ID provider in use by a user cannot be deleted:
  Delete stays disabled until the user is gone.

`page_objects/` are the page objects, one per screen and per editor step, on three base classes:
`browse.page.js` (the five browse screens), `step.dialog.js` + `summary.step.dialog.js` (the editors)
and `details.panel.js` (the details panels). Every section renders inside its own shadow root, so
the page objects locate with CSS through `section.page.js`; XPath cannot cross a shadow root.

`libs/users.items.builder.js` makes the test data, `libs/settings.utils.js` the flows the specs
share (log in, open a section, create a user or an ID provider).

## Running

The suite is a Gradle subproject of this repository and a package of its pnpm workspace. The whole
run — unpack an XP distro, deploy the app, start the server, run the specs, write the Allure
report, stop the server — is one task from the repository root:

```bash
./gradlew build
./gradlew :ui-tests:testUsersApp
```

The first command makes `build/libs/app-users.jar`, which `:ui-tests:deployApp` copies into the
distro; pass `-PappUrl=<url>` to deploy another build. The XP version comes from `xpVersion` in
`gradle.properties`; the test applications (`com.enonic.uitest:*`) come from the `dev` repository.

Against an XP that is already running at `base.url` of `browser.properties`:

```bash
pnpm --filter test_app_users run test_users_ext:wdio_chrome
```

The report lands in `ui-tests/build/reports/allure-report`, screenshots of failures in
`ui-tests/build/reports/screenshots`.

The suite is not part of CI: it needs a running XP with the `dev` test applications and a Chrome
matching `browser.version` in `browser.properties`.
