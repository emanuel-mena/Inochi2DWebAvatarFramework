# 04 - Web Build and Run (WASM Paths)

[Back to docs index](README.md)

Goal: validate both web flows:

- `inox2d/examples/render-webgl` with Trunk
- `inochi_web` with wasm-pack and a local HTTP server

## A) `render-webgl` via Trunk

### 1. Check wasm build from `inox2d` workspace root

From project root:

```bash
cd inox2d
cargo check -p render-webgl --target wasm32-unknown-unknown
```

Expected result:

- Command ends with `Finished` and no errors.

### 2. Prepare demo asset

Go to the example directory:

```bash
cd examples/render-webgl
```

Create `assets/` directory if missing:

```bash
mkdir assets
```

Place a puppet file at:

```text
inox2d/examples/render-webgl/assets/puppet.inp
```

The example fetches this exact file name by default.

### 3. Serve with Trunk

From `inox2d/examples/render-webgl`:

```bash
trunk serve --open
```

Expected result:

- Browser opens local URL.
- Canvas appears and renders the puppet.

## B) `inochi_web` via wasm-pack

### 1. Validate wasm target build

From project root:

```bash
cd inochi_web
cargo check --target wasm32-unknown-unknown
```

Expected result:

- Command ends with `Finished` and no errors.

### 2. Rebuild web package

From `inochi_web/`:

```bash
wasm-pack build --target web --out-dir pkg
```

Expected result:

- `pkg/` contains fresh `inochi_viewer_bg.wasm`, JS glue, and type files.

### 3. Serve with local HTTP server

From `inochi_web/`:

```bash
python -m http.server 8080
```

Open:

```text
http://127.0.0.1:8080
```

Then load your `.inp` or `.inx` file through the UI.

Important: do not open `index.html` via `file://`, because browsers block required module/wasm behavior there.

## Web Path Success Checklist

- `cargo check` passes for wasm targets.
- Trunk path renders with `assets/puppet.inp`.
- `inochi_web` path loads `pkg/` output and lets you open a model file.

If something fails, go to [06-troubleshooting.md](06-troubleshooting.md).

## Visuals (Planned for v2)

- Screenshot of Trunk app running.
- Screenshot of `inochi_web` UI after loading a model.
