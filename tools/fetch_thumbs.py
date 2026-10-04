"""Download paper teaser figures (Yaqian Chen's homepage; iKap cover gif from sairlab.org) into assets/<slug>/
Run on your own computer:  python3 tools/fetch_thumbs.py && python3 tools/build.py"""
import os, urllib.request
BASE = 'https://yaqianchen.github.io/assets/img/publication_preview/'
# slug -> (url, saved filename)
EXTRA = {
    'ikap': ('https://sairlab.org/img/posts/2024-12-12-ikap/cover.gif', 'thumb.gif'),
    'imperative-learning': ('https://sairlab.org/img/posts/2024-07-02-iSeries/il-cover.jpg', 'thumb.jpg'),
    'cerpe': ('https://rokeeeto-li.github.io/cerpe.github.io/static/images/cerpe_method.jpeg', 'thumb.jpg'),   # interim, until a GIF is made
    'pypose-v06': ('https://sairlab.org/img/pubs/pypose-v0.6.jpg', 'thumb.jpg'),
}
MAP = {
    'guidedmorph': 'guidedmorph.png',
    'slm-sam2': 'accelerating_volumetric_medical_image_annotation.png',
    'vfm-registration': 'vision_foundation_models.png',
    'mri-core': 'MRI-core.png',
}
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # site root
for slug, name in MAP.items():
    d = os.path.join(here, 'assets', slug); os.makedirs(d, exist_ok=True)
    out = os.path.join(d, 'thumb.png')
    try:
        req = urllib.request.Request(BASE + name, headers={'User-Agent': 'Mozilla/5.0'})
        open(out, 'wb').write(urllib.request.urlopen(req, timeout=30).read())
        print('ok  ', slug)
    except Exception as e:
        print('FAIL', slug, e)
for slug, (url, fname) in EXTRA.items():
    d = os.path.join(here, 'assets', slug); os.makedirs(d, exist_ok=True)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=60).read()
        if data[:4] == b'GIF8': fname = 'thumb.gif'          # keep animations as .gif whatever the URL says
        for old in os.listdir(d):                              # drop an older thumb with another extension
            if old.startswith('thumb.') and old != fname: os.remove(os.path.join(d, old))
        open(os.path.join(d, fname), 'wb').write(data)
        print('ok  ', slug, fname, len(data) // 1024, 'KB')
    except Exception as e:
        print('FAIL', slug, e)
