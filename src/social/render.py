# Genera favicon e immagine di anteprima (og-image.png) nella radice del repository.
# Richiede Microsoft Edge (o Chrome) per il rendering headless: python render.py
import base64, math, os, struct, subprocess, sys, tempfile, pathlib
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
BROWSER = next((p for p in (os.environ.get('BROWSER_BIN', ''),
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') if p and os.path.exists(p)), None)
if not BROWSER: sys.exit('Browser non trovato: imposta BROWSER_BIN')
TMP = pathlib.Path(tempfile.mkdtemp())

def shot(html, out, w, h):
    f = TMP / (out.stem + '.html'); f.write_text(html, encoding='utf-8')
    subprocess.run([BROWSER, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        '--virtual-time-budget=6000', f'--user-data-dir={TMP / "prof"}', f'--screenshot={out}',
        f'--window-size={w},{h}', f.as_uri()], check=True, capture_output=True)

# Striscia in basso: la composizione dell'aula in ognuna delle 26 sedute, dai dati di index.html
import re
page = (ROOT / 'index.html').read_text(encoding='utf-8')
gruppi = {m.group(1): (m.group(2), bool(m.group(3))) for m in re.finditer(r'(\w+):\{n:"[^"]*",c:"(#[0-9A-Fa-f]{6})"(,h:1)?', page[page.index('groups:{'):page.index('eras:[')])}
strip = []
for m in re.finditer(r'g:\[(\[.*?\])\],txt:', page):
    col = ''
    for gid, n in re.findall(r'\["?(\w+)"?,\s*(\d+)\]', m.group(1)):
        c, assente = gruppi[gid]
        if not assente: col += f'<i style="flex:{n} 1 0px;background:{c}"></i>'
    strip.append(f'<div>{col}</div>')
assert len(strip) == 26, len(strip)
aug = 'data:image/jpeg;base64,' + (ROOT / 'src/assets/aug.b64').read_text().strip()
og = (HERE / 'og.html').read_text(encoding='utf-8').replace('{{AUG}}', aug).replace('{{STRIP}}', ''.join(strip))
shot(og, ROOT / 'og-image.png', 1200, 630)

# Favicon: SVG per i browser moderni, PNG per iOS/Android e ICO (PNG incorporati) per i vecchi
svg = (HERE / 'favicon.svg').read_text(encoding='utf-8')
(ROOT / 'favicon.svg').write_text(svg, encoding='utf-8')
def icon(size, out, bg='transparent'):
    shot(f'<html><body style="margin:0;background:{bg}"><img src="data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}" width="{size}" height="{size}" style="display:block"></body></html>', out, size, size)
icon(180, ROOT / 'apple-touch-icon.png', '#4A1119')
icon(192, ROOT / 'icon-192.png')
pngs = []
for s in (16, 32, 48):
    p = TMP / f'ico{s}.png'; icon(s, p); pngs.append((s, p.read_bytes()))
ico = struct.pack('<HHH', 0, 1, len(pngs)); off = 6 + 16 * len(pngs); body = b''
for s, data in pngs:
    ico += struct.pack('<BBBBHHII', s, s, 0, 0, 1, 32, len(data), off); off += len(data); body += data
(ROOT / 'favicon.ico').write_bytes(ico + body)
print('ok')
