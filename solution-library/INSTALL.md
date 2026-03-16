# Installing the Solution Library

## Add as Git Submodule

```bash
# Add the solution library as a submodule
git submodule add https://github.com/CleanExpo/NodeJS-Starter-V1.git lib/solution-library

# Initialise and fetch
git submodule update --init --recursive lib/solution-library
```

## Update to Latest

```bash
git submodule update --remote lib/solution-library
git add lib/solution-library
git commit -m "chore(lib): update solution library to latest"
```

## Sparse Checkout (library only)

If you only want the solution-library folder and not the entire starter template:

```bash
git submodule add --depth 1 https://github.com/CleanExpo/NodeJS-Starter-V1.git lib/solution-library
cd lib/solution-library
git sparse-checkout set solution-library
```

## Verify Installation

```bash
ls lib/solution-library/solution-library/library.yaml
```

## Contribute Back

```bash
cd lib/solution-library
git checkout -b feature/my-improvement
# make changes
git push origin feature/my-improvement
# open PR to NodeJS-Starter-V1
```
