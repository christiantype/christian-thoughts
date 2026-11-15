#!/usr/bin/env python3
"""Take photographs out of the gallery, completely.

    python3 bin/remove-photo.py DSCF2220 L1000533 ...

Accepts bare names, filenames, or the URL of any size of the thumbnail —
paste straight from the browser:

    python3 bin/remove-photo.py http://localhost:4010/assets/images/photo-thumb/DSCF2220-840.jpg

Removing a photograph by hand means five things, and missing any one of them
leaves the site inconsistent in a way nothing complains about: the original,
its two thumbnails, its alt text, its camera line, and the two generated
lists. This does all of it, then tells you the counts so you can see they
still agree.
"""

import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY = os.path.join(ROOT, "assets", "images", "photography")
DATA = [os.path.join(ROOT, "_data", f) for f in ("photo_alt.yml", "photo_exif.yml")]


def stem(arg):
    """DSCF2220 from anything: a name, a file, a thumbnail, a URL."""
    name = arg.rstrip("/").split("/")[-1]
    name = re.sub(r"\.(jpg|jpeg|png|webp)$", "", name, flags=re.I)
    return re.sub(r"-(420|840)$", "", name)


def main():
    names = [stem(a) for a in sys.argv[1:]]
    if not names:
        sys.exit(__doc__)

    gone, missing = [], []
    for n in names:
        path = os.path.join(GALLERY, n + ".jpg")
        if not os.path.exists(path):
            missing.append(n); continue
        # git rm when it is tracked, plain remove when it is not
        if subprocess.run(["git", "-C", ROOT, "ls-files", "--error-unmatch",
                           os.path.relpath(path, ROOT)],
                          capture_output=True).returncode == 0:
            subprocess.run(["git", "-C", ROOT, "rm", "-q", os.path.relpath(path, ROOT)], check=True)
        else:
            os.remove(path)
        gone.append(n)

    for path in DATA:
        lines = open(path).read().split("\n")
        keep = [l for l in lines if not any(l.startswith(f'"{n}.jpg"') for n in gone)]
        open(path, "w").write("\n".join(keep))

    for script in ("generate-photo-dims.py", "generate-photo-order.py",
                   "generate-photo-thumbs.py"):
        subprocess.run([sys.executable, os.path.join(ROOT, "bin", script)],
                       capture_output=True)

    files = len([f for f in os.listdir(GALLERY) if not f.startswith(".")])
    thumbs = len([f for f in os.listdir(os.path.join(ROOT, "assets", "images", "photo-thumb"))
                  if f.endswith("-420.jpg")])
    alt = len(re.findall(r'^"', open(DATA[0]).read(), re.M))

    for n in gone:    print("removed ", n)
    for n in missing: print("MISSING ", n, "— not in the gallery")
    print(f"\n{files} photographs · {thumbs} thumbnails · {alt} alt entries"
          f"{'  — counts agree' if files == thumbs == alt else '  *** COUNTS DISAGREE ***'}")


if __name__ == "__main__":
    main()
