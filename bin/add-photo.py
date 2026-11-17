#!/usr/bin/env python3
"""Put photographs into the gallery, completely.

    python3 bin/add-photo.py ~/Desktop/L1003944.jpg "Christian Solorzano — ..."

Adding one by hand means five things, and missing any of them leaves the
site inconsistent in a way nothing complains about: the original, its two
thumbnails, its alt text, its camera line, and the two generated lists.

The camera line is read with Pillow rather than exiftool, which is not on
this machine — and exiftool's own script refuses to run without it rather
than overwrite photo_exif.yml with nothing, which is the right call. If
exiftool is ever installed, its script regenerates the whole file and
absorbs these.

Alt text is required. A photograph without it is one nobody using a screen
reader can see at all, and it is the one part of this that cannot be read
off the file.
"""

import os, re, subprocess, sys
from fractions import Fraction

try:
    from PIL import Image, ExifTags
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY = os.path.join(ROOT, "assets", "images", "photography")
TAGS = {v: k for k, v in ExifTags.TAGS.items()}


def shutter(v):
    f = Fraction(v).limit_denominator(100000)
    return f"{float(f):g}s" if f >= 1 else f"1/{round(1 / float(f))}s"


def camera_line(path):
    ex = Image.open(path).getexif()
    ifd = ex.get_ifd(0x8769)
    # Leica writes its own name in capitals; the rest of the file does not.
    model = (ex.get(TAGS["Model"]) or "").strip().replace("LEICA", "Leica")
    lens = (ifd.get(TAGS["LensModel"]) or ifd.get(0xA434) or "").strip()
    fn, et = ifd.get(TAGS["FNumber"]), ifd.get(TAGS["ISOSpeedRatings"])
    et = ifd.get(TAGS["ExposureTime"])
    iso = ifd.get(TAGS["ISOSpeedRatings"]) or ifd.get(0x8827)
    bits = [b for b in (model, lens) if b]
    if fn:  bits.append(f"f/{float(fn):g}")
    if et:  bits.append(shutter(et))
    if iso: bits.append(f"ISO {iso}")
    return " · ".join(bits)


def append(path, line):
    s = open(path).read().rstrip("\n")
    open(path, "w").write(s + "\n" + line + "\n")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, alt = sys.argv[1], sys.argv[2]
    src = os.path.expanduser(src)
    if not os.path.exists(src):
        sys.exit(f"No file at {src}")
    if "—" not in alt or len(alt) < 40:
        sys.exit("Alt text should name the photographer and describe the picture.")

    name = os.path.basename(src)
    dest = os.path.join(GALLERY, name)
    if os.path.exists(dest):
        sys.exit(f"{name} is already in the gallery. Remove it first if you mean to replace it.")

    with open(src, "rb") as a, open(dest, "wb") as b:
        b.write(a.read())

    append(os.path.join(ROOT, "_data", "photo_alt.yml"),  f"\"{name}\": '{alt}'")
    append(os.path.join(ROOT, "_data", "photo_exif.yml"), f"\"{name}\": '{camera_line(dest)}'")

    for script in ("generate-photo-dims.py", "generate-photo-order.py",
                   "generate-photo-thumbs.py"):
        subprocess.run([sys.executable, os.path.join(ROOT, "bin", script)],
                       capture_output=True)

    files = len([f for f in os.listdir(GALLERY) if not f.startswith(".")])
    thumbs = len([f for f in os.listdir(os.path.join(ROOT, "assets", "images", "photo-thumb"))
                  if f.endswith("-420.jpg")])
    nalt = len(re.findall(r'^"', open(os.path.join(ROOT, "_data", "photo_alt.yml")).read(), re.M))

    print("added   ", name)
    print("camera  ", camera_line(dest))
    print(f"\n{files} photographs · {thumbs} thumbnails · {nalt} alt entries"
          f"{'  — counts agree' if files == thumbs == nalt else '  *** COUNTS DISAGREE ***'}")


if __name__ == "__main__":
    main()
