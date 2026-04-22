# 03 - Native Build and Run (OpenGL Path)

[Back to docs index](README.md)

Goal: compile native packages and run a desktop OpenGL example.

## 1. Go to the Inox2D Workspace

From project root:

```bash
cd inox2d
```

## 2. Run Native Checks

```bash
cargo check -p inox2d -p inox2d-opengl -p render-opengl
```

Expected result:

- Command ends with `Finished` and no errors.

## 3. Parse a Model File (Smoke Test)

If your root has `Irene.inp`, run:

```bash
cargo run -p inox2d --features owo --example parse-inp -- ../Irene.inp
```

Or use your own model path:

```bash
cargo run -p inox2d --features owo --example parse-inp -- /path/to/model.inp
```

Expected result:

- Parsing logs appear.
- Command exits without panic.

## 4. Run the OpenGL Renderer Example

From `inox2d/`:

```bash
cargo run -p render-opengl -- ../Irene.inp
```

Or:

```bash
cargo run -p render-opengl -- /path/to/model.inp
```

Expected result:

- A desktop window opens.
- Puppet is rendered.
- You can close the app window normally.

## 5. Common Native Path Notes

- If you are on a headless environment, OpenGL context creation may fail.
- If your model is `.inx`, parse support exists, but a known-good `.inp` is best for first validation.
- First build is slower because dependencies are compiled.

If something fails, go to [06-troubleshooting.md](06-troubleshooting.md).

## Visuals (Planned for v2)

- Screenshot of successful `cargo check` output.
- Screenshot of the OpenGL example window.
