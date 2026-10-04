"""Downscale oversized thumbnails so the page loads fast.
Web pages only care about pixel size (ppi metadata is ignored). Anything whose long side exceeds
MAX px is resized in place; the untouched original is kept as assets/<slug>/_original.<ext>.
GIFs are skipped (resizing would break the animation).
Run on your own computer:  python3 tools/shrink_images.py && python3 tools/build.py"""
import os, glob, shutil, subprocess
MAX = 1400
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # site root
try:
    from PIL import Image
except ImportError:
    Image = None

def size_of(path):
    if Image:
        return Image.open(path).size
    out = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', path], text=True)
    v = {l.split(':')[0].strip(): int(l.split(':')[1]) for l in out.splitlines() if ':' in l and 'pixel' in l}
    return v['pixelWidth'], v['pixelHeight']

def shrink(path):
    if Image:
        im = Image.open(path); w, h = im.size; s = MAX / max(w, h)
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        if path.lower().endswith(('.jpg', '.jpeg')):
            im.convert('RGB').save(path, quality=88, optimize=True)
        else:
            im.save(path, optimize=True)
    else:
        subprocess.check_call(['sips', '-Z', str(MAX), path], stdout=subprocess.DEVNULL)

for path in sorted(glob.glob(os.path.join(here, 'assets', '*', 'thumb.*'))):
    if path.lower().endswith('.gif'): continue
    try:
        w, h = size_of(path)
    except Exception as e:
        print('skip', path, e); continue
    if max(w, h) <= MAX: continue
    base = os.path.dirname(path); ext = os.path.splitext(path)[1]
    shutil.copy2(path, os.path.join(base, '_original' + ext))
    shrink(path)
    print(f'{os.path.relpath(path, here)}: {w}x{h} -> {size_of(path)[0]}x{size_of(path)[1]}')
print('done')
