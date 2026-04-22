# 01 - Environment Setup (Windows, macOS, Linux)

[Back to docs index](README.md)

Goal: install the minimum tools needed to build and run this project on native and web targets.

## 1. Install Git

### Windows (PowerShell)

```powershell
winget install --id Git.Git -e
```

### macOS (Terminal)

```bash
brew install git
```

### Linux (choose your distro)

Ubuntu and Debian:

```bash
sudo apt update
sudo apt install -y git
```

Fedora:

```bash
sudo dnf install -y git
```

Arch:

```bash
sudo pacman -S --needed git
```

Verify:

```bash
git --version
```

Expected result: command prints a Git version.

## 2. Install Rust Toolchain (rustup + cargo + rustc)

### Windows (PowerShell)

```powershell
winget install --id Rustlang.Rustup -e
```

Restart terminal after install.

### macOS and Linux

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When prompted, choose default stable installation.

Restart terminal after install and verify:

```bash
rustup --version
rustc --version
cargo --version
```

Expected result: all three commands print versions.

## 3. Add WebAssembly Target

```bash
rustup target add wasm32-unknown-unknown
```

Verify:

```bash
rustup target list --installed
```

Expected result: list includes `wasm32-unknown-unknown`.

## 4. Install Web Build Tools

Install Trunk and wasm-pack using Cargo:

```bash
cargo install trunk wasm-pack
```

Verify:

```bash
trunk --version
wasm-pack --version
```

Expected result: both commands print versions.

## 5. Optional Local HTTP Server Tools

Any local HTTP server is fine. Common options:

- Python: `python -m http.server 8080`
- Node: `npx serve .`

Verify at least one is available:

```bash
python --version
```

or

```bash
node --version
```

## 6. Cargo Basics You Will Use in This Project

- `cargo check`: type-check and build metadata quickly without full artifacts.
- `cargo build`: compile binaries/libraries.
- `cargo run -p <package>`: run one package from a workspace.
- `cargo check --target wasm32-unknown-unknown`: validate wasm compilation path.

If any command fails, go to [06-troubleshooting.md](06-troubleshooting.md).

## Visuals (Planned for v2)

- OS-specific install screenshots.
- Example successful version output screenshot.
