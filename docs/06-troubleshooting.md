# 06 - Troubleshooting Matrix

[Back to docs index](README.md)

Use this page when a command fails. Each row gives:

- typical symptom
- diagnosis command
- fix
- re-check command

## Common Issues

| Symptom | Diagnose | Fix | Re-check |
| --- | --- | --- | --- |
| `git: command not found` | `git --version` | Install Git from [01-environment-setup.md](01-environment-setup.md) and restart terminal. | `git --version` |
| `rustup` or `cargo` not found | `rustup --version` and `cargo --version` | Install rustup and restart terminal session. | `rustc --version` and `cargo --version` |
| wasm target missing | `rustup target list --installed` | `rustup target add wasm32-unknown-unknown` | `rustup target list --installed` |
| `trunk: command not found` | `trunk --version` | `cargo install trunk` | `trunk --version` |
| `wasm-pack: command not found` | `wasm-pack --version` | `cargo install wasm-pack` | `wasm-pack --version` |
| `failed to read ... inox2d` path/dependency errors | `git submodule status` | Run `git submodule update --init --recursive` from root. | `git submodule status` |
| Wrong `inox2d` source (upstream instead of fork) | `git -C inox2d remote -v` | `git -C inox2d remote set-url origin https://github.com/SpatialLab-UCENFOTEC/inox2d.git` | `git -C inox2d remote -v` |
| `render-webgl` shows network/404 for `assets/puppet.inp` | Check browser devtools network panel or verify file path on disk. | Create `inox2d/examples/render-webgl/assets/` and add `puppet.inp`. | `trunk serve --open` |
| Browser page is blank when opening `inochi_web/index.html` directly | Check browser URL. If it starts with `file://`, this is the issue. | Serve with HTTP: `python -m http.server 8080` inside `inochi_web/`. | Open `http://127.0.0.1:8080` |
| OpenGL example fails to open window/context | Re-run with logs: `cargo run -p render-opengl -- /path/to/model.inp` | Update GPU drivers and run on a desktop session with graphics support. | Re-run the same command |

## Fast Validation Commands

Run these when you need a full sanity check:

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
```

## Still Stuck

- Re-read [02-project-setup.md](02-project-setup.md) and verify submodule and remotes first.
- Re-run commands from the exact directories shown in docs.
- Copy the full error text into your issue report or team chat.

## Visuals (Planned for v2)

- Screenshots for common failure signatures.
- Flowchart from symptom to fix.
