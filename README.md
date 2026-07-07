# Bend Language Support for VS Code

Community extension for the [Bend](https://github.com/HigherOrderCO/Bend) programming language.

## Features

- **Syntax Highlighting**: Rich semantic coloring for Bend types, functions, and control structures.
- **Language Server Integration**: Real-time syntax validation, hover documentation, and outline views powered by an embedded Language Server.
- **Execution Engine**: Run `.bend` files directly from the editor using `bend run-c`, `bend run-rs`, or `bend run-cu` via CodeLens and context menus.
- **Environment Detection**: Automatically detects your Bend installation and displays the current compiler version in the Status Bar.

## Requirements

You must have the `bend` executable installed and in your system PATH. 

Alternatively, you can specify the exact path to the compiler via the `bend.executablePath` setting.

## Configuration

* `bend.executablePath`: Path to the bend executable. Defaults to `bend`.
* `bend.defaultRunner`: The default runner to use (`c`, `rs`, or `cu`). Defaults to `c`.
