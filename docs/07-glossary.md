# 07 - Glossary for Beginners

[Back to docs index](README.md)

## Core Terms

`Rust`

- A compiled systems programming language.
- This project uses Rust for parsing, model logic, and rendering components.

`rustup`

- Rust toolchain manager.
- Installs and switches Rust versions and targets.

`cargo`

- Rust package manager and build tool.
- You use it to check, build, test, and run packages.

`crate`

- A Rust package.
- Can be a library crate, binary crate, or both.

`workspace`

- A group of related crates managed together.
- `inox2d/` is a Cargo workspace with multiple packages.

`package`

- One member inside a workspace.
- Example packages here: `inox2d`, `inox2d-opengl`, `render-opengl`, `render-webgl`.

`target triple`

- Platform compilation identifier, like `x86_64-pc-windows-msvc` or `wasm32-unknown-unknown`.
- Determines where compiled code can run.

`wasm32-unknown-unknown`

- The WebAssembly target used for browser-focused builds in this project.

`wasm-pack`

- Tool that builds Rust to WebAssembly and generates JS glue code.
- Used in `inochi_web`.

`Trunk`

- Tool for Rust WASM web apps with static assets and live serving.
- Used in `inox2d/examples/render-webgl`.

`submodule`

- A Git repository nested inside another repository.
- This project expects `inox2d/` as a required submodule/fork dependency.

`origin`

- Your default Git remote for a repository.
- Here, `inox2d` origin should point to `SpatialLab-UCENFOTEC/inox2d`.

`upstream`

- Optional secondary remote, usually original source repository.
- Here, `inox2d` upstream can point to `Inochi2D/inox2d`.

`OpenGL`

- Graphics API for desktop rendering.
- Used by `inox2d-opengl` and `render-opengl`.

`WebGL`

- Browser graphics API.
- Used through the wasm path in `render-webgl` and `inochi_web`.

`INP` and `INX`

- Inochi model formats.
- Parsing support is available in this project, and `.inp` is a practical first test format.

## Command Pattern Reference

`cargo check -p <package>`

- Check one package in a workspace.

`cargo run -p <package> -- <args>`

- Run one package and pass arguments to it.

`cargo check --target wasm32-unknown-unknown`

- Validate wasm compilation path.

`git submodule update --init --recursive`

- Initialize and sync nested repositories.

## Visuals (Planned for v2)

- Diagram of workspace packages and execution paths.
