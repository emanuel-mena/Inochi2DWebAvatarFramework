# 08 - Docs QA Checklist

[Back to docs index](README.md)

Use this checklist before publishing docs changes.

## 1. Section Completeness Gate

For each docs page (`01` to `07`), verify:

- [ ] Prerequisites are explicit.
- [ ] Commands are copy/paste ready.
- [ ] Working directory is stated before commands.
- [ ] Expected result is documented.
- [ ] Failure recovery path links to troubleshooting.

## 2. Link Integrity Gate

- [ ] All local links in `docs/README.md` open correctly.
- [ ] Cross-links between pages work.
- [ ] Root `README.md` points to `docs/README.md`.

## 3. Command Consistency Gate

- [ ] Command blocks use paths and package names that exist in the repo.
- [ ] `render-webgl` path uses `examples/render-webgl` (hyphen, not underscore).
- [ ] `inox2d` fork note is consistent across docs.

## 4. Core Command Validation Gate

Run these and confirm all pass:

From root:

```bash
cd inox2d
cargo check -p inox2d -p inox2d-opengl -p render-opengl
cargo check -p render-webgl --target wasm32-unknown-unknown
```

Then:

```bash
cd ../inochi_web
cargo check --target wasm32-unknown-unknown
wasm-pack build --target web --out-dir examples/python-server/app/pkg
```

## 5. Clean Setup Reproduction Gate

For each target OS (Windows, macOS, Linux):

- [ ] Fresh shell can verify `git`, `rustup`, `cargo`.
- [ ] wasm target install is documented and works.
- [ ] Trunk and wasm-pack install commands are valid.
- [ ] Project clone/setup flow (`--recursive`) is reproducible.

## 6. Beginner Experience Gate

- [ ] No section assumes prior Rust knowledge without a short explanation.
- [ ] Errors are described in plain language before advanced details.
- [ ] Each page has a clear next step.

## 7. v2 Visual Placeholder Gate

- [ ] Each page keeps a short "Visuals (Planned for v2)" section.
- [ ] Visual placeholders match real command checkpoints.
