#!/usr/bin/env python3
"""Build the grid's thumbnails — assets/images/photography/thumb/.

Run after adding or removing photographs:

    python3 bin/generate-photo-thumbs.py

The gallery grid draws a tile at 360px on a desktop and 177px on a phone, and
until this existed it drew it out of the 2048px original: a first screen cost
25MB on a desktop and 31MB on a phone, for about a thirtieth of the pixels
actually used. The full-size file is still what the slideshow opens, so
nothing is lost where the photograph is actually looked at — only the
thumbnail is made to the size of the thumbnail.

Two widths, because a tile is drawn at a different size on a phone and on a
retina desktop, and the browser picks by itself from the srcset:

    <name>-420.jpg   a tile at 1x
    <name>-840.jpg   the same tile on a 2x or 3x screen

Both are progressive, so they paint top to bottom on a slow connection
instead of appearing all at once at the end. EXIF is dropped: the camera line
on the page comes from _data/photo_exif.yml, which is read from the original.

A photograph with no thumbnail still shows — the srcset falls back to the
original — so a stale run degrades to the old behaviour rather than a hole in
the grid.
"""

import os
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "images", "photography")
OUT = os.path.join(SRC, "thumb")
WIDTHS = (420, 840)
QUALITY = 82


def main():
    if not os.path.isdir(SRC):
        sys.exit(f"not found: {SRC}")
    os.makedirs(OUT, exist_ok=True)

    originals = sorted(f for f in os.listdir(SRC)
                       if f.lower().endswith((".jpg", ".jpeg")) and not f.startswith("."))
    stems = {os.path.splitext(f)[0] for f in originals}

    # A photograph taken out of the gallery leaves its thumbnails behind, and
    # they would sit in the repository for ever. Clear them in the same pass.
    dropped = 0
    for f in os.listdir(OUT):
        stem = f.rsplit("-", 1)[0]
        if stem not in stems:
            os.remove(os.path.join(OUT, f))
            dropped += 1

    made = kept = 0
    for name in originals:
        src = os.path.join(SRC, name)
        stem = os.path.splitext(name)[0]
        for w in WIDTHS:
            dst = os.path.join(OUT, f"{stem}-{w}.jpg")
            # Rebuilding every thumbnail on every run would rewrite 300 files
            # and make a commit out of nothing. Only what is missing or older
            # than its original is made again.
            if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
                kept += 1
                continue
            im = Image.open(src)
            im = ImageOps.exif_transpose(im)
            if im.mode != "RGB":
                im = im.convert("RGB")
            if im.width > w:
                im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            made += 1

    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"{made} written, {kept} already current, {dropped} orphans removed")
    print(f"{len(originals)} photographs → {len(os.listdir(OUT))} thumbnails, "
          f"{total / 1e6:.1f}MB in {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
