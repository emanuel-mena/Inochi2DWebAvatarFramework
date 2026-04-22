# 05 - Minimal Library Integration (Rust Consumer)

[Back to docs index](README.md)

Goal: create the smallest useful Rust program that consumes `inox2d`, parses a puppet file, and initializes runtime data.

## 1. Create a Minimal Consumer Project

From project root:

```bash
cargo new minimal_inox2d_consumer
cd minimal_inox2d_consumer
```

## 2. Add Dependency to Local Fork

Edit `minimal_inox2d_consumer/Cargo.toml`:

```toml
[package]
name = "minimal_inox2d_consumer"
version = "0.1.0"
edition = "2021"

[dependencies]
inox2d = { path = "../inox2d/inox2d" }
```

## 3. Add Minimal `main.rs`

Replace `minimal_inox2d_consumer/src/main.rs` with:

```rust
use std::error::Error;
use std::fs;

use inox2d::formats::inp::parse_inp;

fn main() -> Result<(), Box<dyn Error>> {
    let model_path = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "assets/puppet.inp".to_string());

    let bytes = fs::read(&model_path)?;
    let mut model = parse_inp(bytes.as_slice())?;

    model.puppet.init_transforms();
    model.puppet.init_rendering();
    model.puppet.init_params();
    model.puppet.init_physics();

    let puppet_name = model
        .puppet
        .meta
        .name
        .as_deref()
        .unwrap_or("<no name in puppet metadata>");

    println!("Loaded puppet: {puppet_name}");
    println!("Model file: {model_path}");

    Ok(())
}
```

## 4. Add Assets

Put your test model at:

```text
minimal_inox2d_consumer/assets/puppet.inp
```

## 5. Run It

Default asset path:

```bash
cargo run
```

Explicit model path:

```bash
cargo run -- assets/puppet.inp
```

Expected result:

- Program prints loaded puppet information and exits without error.

## 6. Where to Go Next

- Add renderer integration with `inox2d-opengl`.
- Add your own parameter update loop.
- Convert this into your app's library layer.

If setup/build fails, go to [06-troubleshooting.md](06-troubleshooting.md).

## Visuals (Planned for v2)

- Screenshot of expected terminal output.
- Diagram of parse and init flow.
