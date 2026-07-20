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

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTO_DIR = os.path.join(ROOT, "assets", "images", "photography")
OUT = os.path.join(ROOT, "_data", "photo_order.yml")

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


def main():
    files = sorted(f for f in os.listdir(PHOTO_DIR) if not f.startswith("."))
    if not files:
        sys.exit(f"No photographs found in {PHOTO_DIR} — refusing to write an empty order file.")

    dated = [(f, capture_date(os.path.join(PHOTO_DIR, f))) for f in files]
    with_date = sorted([r for r in dated if r[1]], key=lambda r: r[1], reverse=True)
    without = [r for r in dated if not r[1]]

    with open(OUT, "w") as fh:
        fh.write("# Photography display order — newest first by EXIF capture date.\n")
        fh.write("# Regenerate with bin/generate-photo-order.py after adding photos.\n")
        fh.write("# Files without a capture date sort to the end.\n\n")
        for name, stamp in with_date + without:
            fh.write(f'- "{name}"   # {stamp or "no date"}\n')

    print(f"wrote {len(dated)} entries to {OUT} ({len(without)} without a capture date)")


if __name__ == "__main__":
    main()
