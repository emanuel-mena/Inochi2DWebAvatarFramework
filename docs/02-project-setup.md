# 02 - Project Setup and Submodules

[Back to docs index](README.md)

Goal: clone the correct repository topology and verify the `inox2d` fork required by this project.

## 1. Clone with Submodules (Required)

```bash
git clone --recursive https://github.com/emanuel-mena/Inochi2DWebAvatarFramework.git
cd Inochi2DWebAvatarFramework
```

Why recursive matters:

- This project depends on `inox2d/` as a required modified fork.
- If submodules are not initialized, builds may fail or use wrong code.

## 2. Verify Submodule State

From project root:

```bash
git submodule status
```

Expected result: you see an entry for `inox2d` with a commit hash.

## 3. Verify `inox2d` Remote Configuration

From project root:

```bash
git -C inox2d remote -v
```

Expected result should include:

- `origin` -> `https://github.com/SpatialLab-UCENFOTEC/inox2d.git`
- `upstream` -> `https://github.com/Inochi2D/inox2d.git`

Important: this project expects the modified fork as the operational source.

## 4. Recovery if You Cloned Without `--recursive`

From project root:

```bash
git submodule update --init --recursive
```

Then re-check:

```bash
git submodule status
```

## 5. Recovery if `inox2d` Points to the Wrong Origin

From project root:

```bash
git -C inox2d remote set-url origin https://github.com/SpatialLab-UCENFOTEC/inox2d.git
git -C inox2d remote add upstream https://github.com/Inochi2D/inox2d.git
```

If `upstream` already exists, skip the second command.

Re-check:

```bash
git -C inox2d remote -v
```

## 6. Daily Sync Commands

From project root:

```bash
git pull --recurse-submodules
git submodule update --init --recursive
```

Use both when updating your local copy to avoid drift between root and submodule commit state.

## Visuals (Planned for v2)

- Screenshot of a correct `git submodule status` output.
- Screenshot of expected `git -C inox2d remote -v` output.
