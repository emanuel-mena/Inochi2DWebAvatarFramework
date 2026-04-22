# Inochi2D Web Avatar Framework Docs

Audience: people with zero Rust and Cargo experience who want a reliable path from setup to running the project.

## Start Here

Follow these docs in order:

1. [01-environment-setup.md](01-environment-setup.md)
2. [02-project-setup.md](02-project-setup.md)
3. [03-native-build-and-run.md](03-native-build-and-run.md)
4. [04-web-build-and-run.md](04-web-build-and-run.md)
5. [05-minimal-integration.md](05-minimal-integration.md)
6. [06-troubleshooting.md](06-troubleshooting.md)
7. [07-glossary.md](07-glossary.md)

Quality gate for maintainers:

- [08-docs-qa-checklist.md](08-docs-qa-checklist.md)

## Important Project Note

`inox2d/` in this project is a required modified fork. It is not the default upstream state.

- Fork used here: `https://github.com/SpatialLab-UCENFOTEC/inox2d`
- Upstream reference: `https://github.com/Inochi2D/inox2d`

Clone with submodules:

```bash
git clone --recursive https://github.com/emanuel-mena/Inochi2DWebAvatarFramework.git
```

## Profile Paths and Expected Outcomes

### I just want to run it

Read:

1. [01-environment-setup.md](01-environment-setup.md)
2. [02-project-setup.md](02-project-setup.md)
3. [03-native-build-and-run.md](03-native-build-and-run.md)
4. [04-web-build-and-run.md](04-web-build-and-run.md)

Expected outcome:

- You can run the OpenGL example.
- You can run the WebGL example with Trunk.
- You can run `inochi_web` in a browser with a local server.

### I want to build it

Read:

1. [01-environment-setup.md](01-environment-setup.md)
2. [02-project-setup.md](02-project-setup.md)
3. [03-native-build-and-run.md](03-native-build-and-run.md)
4. [04-web-build-and-run.md](04-web-build-and-run.md)
5. [06-troubleshooting.md](06-troubleshooting.md)

Expected outcome:

- You can run native and wasm `cargo check` commands successfully.
- You can rebuild wasm output for `inochi_web`.
- You can quickly diagnose common setup/build failures.

### I want to integrate it

Read:

1. [01-environment-setup.md](01-environment-setup.md)
2. [02-project-setup.md](02-project-setup.md)
3. [05-minimal-integration.md](05-minimal-integration.md)
4. [07-glossary.md](07-glossary.md)

Expected outcome:

- You can create a minimal Rust consumer.
- You can parse a puppet file and initialize model state.
- You can understand core terms enough to continue into renderer integration.

## Visuals (Planned for v2)

This v1 docs set is intentionally text plus commands only.

Planned additions:

- Setup screenshots by operating system.
- Build/run success screenshots for OpenGL, Trunk WebGL, and `inochi_web`.
- Architecture and build-flow diagrams.
