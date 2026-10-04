"""Regenerate ../index.html from template.html + pubs.json (both in this folder).
Run from the site root:  python3 tools/build.py
To add a paper: append an entry to pubs.json (same fields as the others), optionally drop
a thumbnail as assets/<slug>/thumb.jpg (or .png/.gif/.webp; put any other material for that
project in the same folder), then rerun. Optional: assets/<slug>/full.mp4 (or full.gif/png) is shown when the thumbnail is clicked. Optional fields: website, paperurl, github.
Co-author links: add 'Full Name': 'url' to collaborators.json (names without an entry are shown as plain text)."""
import json, html, os, re, datetime
from collections import OrderedDict
tools = os.path.dirname(os.path.abspath(__file__))
here = os.path.dirname(tools)           # site root (index.html and assets/ live here)
pubs = json.load(open(os.path.join(tools, 'pubs.json')))
pubs = [p for p in pubs if not p.get('hidden')]   # set "hidden": true in pubs.json to hide a paper for now
pubs.sort(key=lambda p: p['date'], reverse=True)
TOPICS = ['Collaborative Perception', 'Robot Planning & Learning']      # current
PAST = ['Medical Robotics', 'Medical Image Analysis']                                    # past
esc = html.escape

def thumb(p):
    d = os.path.join(here, 'assets', p['slug'])
    full = ''
    for ext in ('mp4', 'webm', 'gif', 'png', 'jpg', 'jpeg', 'webp'):      # optional bigger version for the click-to-enlarge view
        if os.path.exists(os.path.join(d, f'full.{ext}')):
            full = f' data-full="assets/{p["slug"]}/full.{ext}"'; break
    for ext in ('jpg', 'jpeg', 'png', 'gif', 'webp'):
        if os.path.exists(os.path.join(d, f'thumb.{ext}')):
            return f'<img src="assets/{p["slug"]}/thumb.{ext}"{full} alt="" loading="lazy">'
    return ''

COLLAB = json.load(open(os.path.join(tools, 'collaborators.json')))   # name -> homepage; names not listed stay plain text

def authors(s):
    out = []
    for tok in s.split(', '):
        m = re.match(r'^(.*?)([\u2020*]*)$', tok)
        name, mark = m.group(1), m.group(2)
        if name == 'Qihang Li':
            out.append(f'<b>Qihang Li</b>{esc(mark)}')
        elif name in COLLAB:
            out.append(f'<a href="{COLLAB[name]}">{esc(name)}</a>{esc(mark)}')
        else:
            out.append(esc(tok))
    return ', '.join(out)

def entry(p):
    links = []
    if p.get('website'): links.append(f'<a href="{p["website"]}">Website</a>')
    if p.get('paperurl'): links.append(f'<a href="{p["paperurl"]}">Paper</a>')
    if p.get('github'): links.append(f'<a href="{p["github"]}">GitHub</a>')
    ven = '<i>Preprint</i>' if p['pubtype'] == 'preprint' else f'<i>{esc(p["venue"])}</i>, {p["date"][:4]}'
    aw = f' <span class="award">{esc(p["award"])}</span>' if p.get('award') else ''
    note = f' <span class="note">{esc(p["note"])}</span>' if p.get('note') else ''
    return (f'<li class="pub"><div class="thumb">{thumb(p)}</div><div class="pbody">'
            f'<div class="ptitle">{esc(p["title"])}</div><div class="authors">{authors(p["authors"])}</div>'
            f'<div class="venue">{ven}.{aw}{note}</div>'
            f'<div class="links">{"".join(links)}</div></div></li>')

def group(keyfn, order, label=lambda k: k):
    g = OrderedDict((k, []) for k in order)
    for p in pubs: g.setdefault(keyfn(p), []).append(p)
    return ''.join(f'<section class="grp" data-key="{esc(str(k))}"><h4>{esc(str(label(k)))}</h4><ul class="pubs">'
                   + ''.join(entry(p) for p in v) + '</ul></section>' for k, v in g.items() if v)

def yb(p):
    y = int(p['date'][:4]); return y if y >= 2025 else 'Before 2025'
years = [2026, 2025, 'Before 2025']
years = [y for y in years if any(yb(p) == y for p in pubs)]
sel = sorted([p for p in pubs if p.get('selected')], key=lambda p: p['selected'])
mapping = {
 '{{SELECTED}}': ''.join(entry(p) for p in sel),
 '{{BYDATE}}': group(yb, years),
 '{{BYTOPIC}}': group(lambda p: p['topic'], TOPICS + PAST),
 '{{UPDATED}}': datetime.date.today().strftime('%b %-d, %Y'),
 '{{YEARS}}': ' / '.join(f'<a href="#" data-year="{y}">{y}</a>' for y in years),
 '{{TOPICS}}': ' / '.join(f'<a href="#" data-topic="{t}">{esc(t)}</a>' for t in TOPICS),
 '{{PASTTOPICS}}': ' / '.join(f'<a href="#" data-topic="{t}">{esc(t)}</a>' for t in PAST),
}
t = open(os.path.join(tools, 'template.html')).read()
for k, v in mapping.items(): t = t.replace(k, v)
open(os.path.join(here, 'index.html'), 'w').write(t)
print('built', len(pubs), 'papers')
