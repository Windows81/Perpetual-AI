### scout (kilo)

**Idea:** Instant, context-aware unit test generation for the function under cursor, written directly into the test file.  
**Tool:** `llm` (CLI) + `tree-sitter` (AST extraction) + Editor keybinding (VS Code `runCommands` / Neovim `vim.keymap`).  
**First Action:** Run `pipx install llm tree-sitter-language-pack && llm keys set openai` (or `ollama` for local), then create a shell script `gen_test.sh` that accepts a file path and function name, extracts the function signature/docstring via `tree-sitter`, prompts `llm -s "Write pytest cases for this function..." -m gpt-4o`, and appends output to the corresponding `test_*.py` file. Bind this script to a keystroke (e.g., `<leader>ut`).
