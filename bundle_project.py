import os
from pathlib import Path

# Folders to ignore completely
IGNORE_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "venv",
    ".expo",
    "coverage",
    ".turbo",
    ".cache",
}

# File extensions to ignore (binaries, bundles, locks)
IGNORE_EXTS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".mp3", ".wav",
    ".zip", ".tar", ".gz",
    ".pyc", ".pyo", ".pyd",
    ".db", ".sqlite", ".sqlite3",
    ".lock", ".map", ".min.js", ".min.css",
}

# Explicit filenames to skip
IGNORE_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    ".DS_Store",
    "bundle_project.py",
    "project_bundle.md",
}

OUTPUT_FILE = "project_bundle.md"


def is_text_file(filepath: Path) -> bool:
    """Quick check to avoid reading binary files."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            f.read(1024)
        return True
    except (UnicodeDecodeError, PermissionError):
        return False


def build_tree(root_dir: Path, prefix: str = "") -> list[str]:
    """Generates an ASCII directory tree."""
    tree_lines = []
    try:
        entries = sorted(
            [e for e in root_dir.iterdir() if e.name not in IGNORE_DIRS and e.name not in IGNORE_FILES],
            key=lambda x: (not x.is_dir(), x.name.lower()),
        )
    except PermissionError:
        return []

    for index, path in enumerate(entries):
        if path.suffix.lower() in IGNORE_EXTS:
            continue

        is_last = index == len(entries) - 1
        connector = "└── " if is_last else "├── "
        tree_lines.append(f"{prefix}{connector}{path.name}")

        if path.is_dir():
            sub_prefix = f"{prefix}{'    ' if is_last else '│   '}"
            tree_lines.extend(build_tree(path, sub_prefix))

    return tree_lines


def generate_bundle(root_path: Path, output_path: Path):
    with open(output_path, "w", encoding="utf-8") as out:
        out.write("# ProjectFlow Codebase Bundle\n\n")

        # 1. Write the directory structure
        out.write("## 1. Directory Structure\n\n```text\n")
        out.write(f"{root_path.name}/\n")
        tree = build_tree(root_path)
        out.write("\n".join(tree))
        out.write("\n```\n\n")

        # 2. Iterate and append file contents
        out.write("## 2. File Contents\n\n")
        file_count = 0

        for current_root, dirs, files in os.walk(root_path):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in sorted(files):
                file_path = Path(current_root) / file

                if file in IGNORE_FILES or file_path.suffix.lower() in IGNORE_EXTS:
                    continue

                if not is_text_file(file_path):
                    continue

                rel_path = file_path.relative_to(root_path)
                ext = file_path.suffix.lstrip(".").lower()
                lang_tag = ext if ext else "text"

                try:
                    content = file_path.read_text(encoding="utf-8", errors="replace")
                    out.write(f"### `{rel_path}`\n\n")
                    out.write(f"```{lang_tag}\n")
                    out.write(content)
                    out.write("\n```\n\n")
                    file_count += 1
                except Exception as e:
                    out.write(f"### `{rel_path}` (Error reading file: {e})\n\n")

    print(f"Bundled {file_count} files into '{output_path.name}'.")


if __name__ == "__main__":
    current_directory = Path.cwd()
    output_destination = current_directory / OUTPUT_FILE
    generate_bundle(current_directory, output_destination)