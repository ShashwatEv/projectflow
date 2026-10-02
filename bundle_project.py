import os
import sys

# Output file name
OUTPUT_FILE = "project_snapshot.txt"

# Directories to ignore
IGNORE_DIRS = {
    "node_modules",
    "dist",
    ".git",
    ".continue",
    ".vscode",
    "build",
    "coverage",
    ".cache",
}

# Specific files or extensions to ignore
IGNORE_FILES = {
    OUTPUT_FILE,
    "bundle_project.py",
    "package-lock.json",
    ".env",
    ".env.local",
    ".DS_Store",
    "thumbs.db",
}

# Allowed text file extensions to include in snapshot
ALLOWED_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".css",
    ".html",
    ".sql",
    ".env.example",
    ".md",
    ".svg",
}

def is_text_file(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in ALLOWED_EXTENSIONS

def generate_bundle(root_dir="."):
    file_count = 0
    total_lines = 0

    print(f"📦 Bundling project files from '{os.path.abspath(root_dir)}'...")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        # 1. Generate Directory Tree Outline
        out.write("=" * 80 + "\n")
        out.write("PROJECT FLOW WORKSPACE SNAPSHOT\n")
        out.write("=" * 80 + "\n\n")
        out.write("--- FILE INVENTORY ---\n")

        collected_files = []
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Prune ignored folders in-place
            dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

            for fname in sorted(filenames):
                if fname in IGNORE_FILES:
                    continue
                if is_text_file(fname):
                    rel_path = os.path.relpath(os.path.join(dirpath, fname), root_dir)
                    collected_files.append(rel_path)
                    out.write(f"  • {rel_path}\n")

        out.write("\n" + "=" * 80 + "\n\n")

        # 2. Append Code Contents for each collected file
        for rel_path in sorted(collected_files):
            full_path = os.path.join(root_dir, rel_path)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                lines = content.count("\n") + 1
                total_lines += lines
                file_count += 1

                out.write(f"\n{'#' * 80}\n")
                out.write(f"FILE: {rel_path}  ({lines} lines)\n")
                out.write(f"{'#' * 80}\n\n")
                out.write(content)
                out.write("\n\n")

            except Exception as e:
                print(f"⚠️  Could not read {rel_path}: {e}")

    print(f"✅ Finished! Bundled {file_count} files ({total_lines} lines) into '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    generate_bundle()