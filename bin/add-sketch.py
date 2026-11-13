#!/usr/bin/env python3
"""Read a sketch and print the entry to paste into _data/sketches.yml.

    python3 bin/add-sketch.py assets/audio/lake-opeka.mp3

It does the one thing you would otherwise do by hand and get wrong: it reads
the true length off the file. Everything else — the date, the hour,
where you were, the sentence — is yours to write, and the
entry comes out with those fields empty and waiting.

The file itself goes in assets/audio/. Nothing else reads that folder, so a
sketch dropped in there is never mistaken for anything else — unlike
assets/images/photography/, where every file on disk is read as a photograph.
"""

import json
import os
import subprocess
import sys


def length(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "json", path],
        capture_output=True, text=True, check=True).stdout
    return float(json.loads(out)["format"]["duration"])


def clock(seconds):
    m, s = divmod(int(round(seconds)), 60)
    return f"{m}:{s:02d}"


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    path = sys.argv[1]
    if not os.path.exists(path):
        sys.exit(f"No file at {path}")

    secs = length(path)
    print(f"""- file:   {os.path.basename(path)}
  place:  ""
  date:   
  time:   
  note:   ""
  length: {int(round(secs))}""")
    print(f"\n{clock(secs)} long.", file=sys.stderr)


if __name__ == "__main__":
    main()
