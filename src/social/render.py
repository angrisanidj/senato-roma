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
        '--virtual-time-budget=4000', f'--user-data-dir={TMP / "prof"}', f'--screenshot={out}',
        f'--window-size={w},{h}', f.as_uri()], check=True, capture_output=True)

# Emiciclo dell'anteprima: senatori colorati per fazione, come nell'aula della pagina
COL = ['#23845D'] * 10 + ['#2F7FB8'] * 6 + ['#D4AE55'] * 4 + ['#E0663A'] * 7
dots, k = [], 0
rows = [(46, 6), (66, 9), (86, 12)]
pts = []
for rad, n in rows:
    for i in range(n):
        a = math.pi + math.pi * i / (n - 1)
        pts.append((a, 110 + rad * math.cos(a), 92 + rad * math.sin(a)))
pts.sort()
for (a, x, y), c in zip(pts, COL):
    dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5.4" fill="{c}" stroke="#2A080D" stroke-width="1"/>')
caes = 'data:image/jpeg;base64,' + (ROOT / 'src/assets/caes.b64').read_text().strip()
og = (HERE / 'og.html').read_text(encoding='utf-8').replace('{{CAES}}', caes).replace('{{HEMI}}', ''.join(dots))
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
