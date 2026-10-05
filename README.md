# qihangli.com

Personal homepage of Qihang Li, served by GitHub Pages at https://qihangli.com

The site is plain static HTML. `index.html` is generated, so edit the sources in `tools/` and rebuild.

```
index.html, style.css, QihangLi_CV.pdf   the published site
assets/photo.jpg                         profile photo
assets/<slug>/thumb.*, full.*            per-paper thumbnail (and optional click-to-enlarge media)
assets/<slug>/...                        figures and files used by that project's page
assets/shared/project.css, project.js    style and script shared by all project pages
<slug>/index.html                        project page, served at qihangli.com/<slug>/ (e.g. cerpe/)
cerpe.github.io/index.html, 404.html     redirect from the old /cerpe.github.io/ address to /cerpe/
CNAME, .nojekyll                         GitHub Pages custom domain / no Jekyll build
tools/pubs.json                          publication list (add "hidden": true to hide an entry)
tools/template.html                      page layout and text
tools/build.py                           regenerates index.html
tools/project_template.html              starting point for a new project page (steps at the top of the file)
tools/fetch_thumbs.py, shrink_images.py  optional helpers for images
```

Update workflow: edit `tools/pubs.json` or `tools/template.html`, run `python3 tools/build.py`, preview by opening `index.html`, then commit and push.
