#!/usr/bin/env python3
"""Regenerate _data/photo_order.yml — photography display order, newest first
by EXIF capture date.

Run after adding photos to assets/images/photography/:

    python3 bin/generate-photo-order.py

Files with no capture date sort to the end. The layout also renders any file
that's missing from this list, so a stale order file degrades gracefully
rather than hiding photographs.
"""
import os
import sys
import time

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (image folder, output data file) — both galleries order newest-first.
SETS = [
    (os.path.join(ROOT, "assets", "images", "photography"),
     os.path.join(ROOT, "_data", "photo_order.yml")),
    (os.path.join(ROOT, "assets", "images", "design"),
     os.path.join(ROOT, "_data", "design_order.yml")),
]

DATE_TIME_ORIGINAL = 36867
DATE_TIME = 306
EXIF_IFD = 0x8769


def capture_date(path):
    try:
        exif = Image.open(path).getexif()
        stamp = exif.get_ifd(EXIF_IFD).get(DATE_TIME_ORIGINAL) or exif.get(DATE_TIME)
        return str(stamp).strip() if stamp else None
    except Exception:
        return None


def write_set(photo_dir, out):
    if not os.path.isdir(photo_dir):
        print(f"skipping {photo_dir} — not found")
        return
    files = sorted(f for f in os.listdir(photo_dir) if not f.startswith("."))
    if not files:
        sys.exit(f"No images found in {photo_dir} — refusing to write an empty order file.")

    # Fall back to file mtime so images without EXIF (exported artwork, GIFs)
    # still order sensibly instead of all piling up at the end.
    dated = []
    for f in files:
        path = os.path.join(photo_dir, f)
        stamp = capture_date(path)
        if not stamp:
            stamp = time.strftime("%Y:%m:%d %H:%M:%S", time.localtime(os.path.getmtime(path)))
            stamp += "  (file date)"
        dated.append((f, stamp))

    dated.sort(key=lambda r: r[1].replace("  (file date)", ""), reverse=True)

    with open(out, "w") as fh:
        fh.write("# Display order — newest first by EXIF capture date (file date if none).\n")
        fh.write("# Regenerate with bin/generate-photo-order.py after adding images.\n\n")
        for name, stamp in dated:
            fh.write(f'- "{name}"   # {stamp}\n')

    print(f"wrote {len(dated)} entries to {out}")


def main():
    for photo_dir, out in SETS:
        write_set(photo_dir, out)


if __name__ == "__main__":
    main()
