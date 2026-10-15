# Enonic XP - Users App

[![Actions Status](https://github.com/enonic/app-users/workflows/Gradle%20Build/badge.svg)](https://github.com/enonic/app-users/actions)
[![License][license-image]][license-url]
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/98a3593d448f4cb29d165048609434dd)](https://www.codacy.com/app/enonic/app-users?utm_source=github.com&utm_medium=referral&utm_content=enonic/app-users&utm_campaign=Badge_Grade)

Manage permissions for users, user groups and roles in [Enonic XP](https://github.com/enonic/xp).

## Usage

Just copy the built JAR files to the `$XP_HOME/deploy` folder, or use the `deploy` task from the Gradle:

```
./gradlew deploy
```

## Building

```
./gradlew build
```

This runs the UI checks (`vp check`, strict server `tsc`, vitest), the JUnit suites under both
script engines, and packs the jar.

#### Environment

`-Penv=dev` builds the client for development — sourcemaps, no minification:

```
./gradlew build -Penv=dev
```

#### Quick

Skip the verification tasks:

```
./gradlew build -x check -x test
```

or use the `yolo` task, which skips them and deploys:

```
./gradlew yolo
```

## UI development

The client and the server-side TypeScript are one pnpm project at the repository root:

```
pnpm install
pnpm dev      # watch build
pnpm check    # format, lint, typecheck, test
```

<!-- Links -->

[license-url]: LICENSE.txt
[license-image]: https://img.shields.io/github/license/enonic/app-users.svg "GPL 3.0"
