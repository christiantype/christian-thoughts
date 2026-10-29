#!/usr/bin/env python3
"""Regenerate _data/photo_dims.yml — pixel dimensions per image.

Run after adding photos to assets/images/photography/:

    python3 bin/generate-photo-dims.py

The grid uses these to reserve the right height for a thumbnail before the
image has loaded. Without them the masonry has to wait for each file, measure
it, and re-lay the column — 164 photographs arriving lazily means 164 reflows
and the page walks around under the reader. With them, every tile knows its
shape from the first paint.

A file missing from this list still renders; the layout falls back to a square
tile for it, which is what the whole grid used to be.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Only photography is masonry. The design grid keeps square tiles: a poster
# sits on a ground, and the ground is part of the piece.
SETS = [
    (os.path.join(ROOT, "assets", "images", "photography"),
     os.path.join(ROOT, "_data", "photo_dims.yml")),
]


def write_set(photo_dir, out):
    if not os.path.isdir(photo_dir):
        print(f"skipping {photo_dir} — not found")
        return
    files = sorted(f for f in os.listdir(photo_dir) if not f.startswith("."))
    if not files:
        sys.exit(f"No images found in {photo_dir} — refusing to write an empty dims file.")

    sized = []
    for f in files:
        try:
            with Image.open(os.path.join(photo_dir, f)) as im:
                w, h = im.size
            if w and h:
                sized.append((f, w, h))
        except Exception:
            # Not an image, or unreadable — skip it rather than write a zero,
            # which would divide into an infinite aspect ratio in the grid.
            continue

    if not sized:
        sys.exit(f"No readable images in {photo_dir} — refusing to write an empty dims file.")

    with open(out, "w") as fh:
        fh.write("# auto-generated — pixel dimensions keyed by filename.\n")
        fh.write("# Regenerate with bin/generate-photo-dims.py after adding images.\n\n")
        for name, w, h in sized:
            fh.write(f'"{name}": [{w}, {h}]\n')

    print(f"wrote {len(sized)} entries to {out}")


def main():
    for photo_dir, out in SETS:
        write_set(photo_dir, out)


if __name__ == "__main__":
    main()
