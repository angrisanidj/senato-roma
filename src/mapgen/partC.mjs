
/* ================= MAP ENGINE ================= */
function pt(map, ll) { const p = P[map](ll); return [f1(p[0]), f1(p[1])]; }
function geom(pts, bend) {
  const S = [];
  if (pts.length === 2) {
    const [a, b] = pts, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], k = (bend == null ? .14 : bend);
    const cx = f1(mx - dy * k), cy = f1(my + dx * k);
    for (let i = 0; i <= 40; i++) { const t = i / 40, u = 1 - t; S.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]]); }
    return { d: `M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}`, end: b, ang: Math.atan2(b[1] - cy, b[0] - cx), S };
  }
  let d = `M${pts[0][0]} ${pts[0][1]}`, ang = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [f1(p1[0] + (p2[0] - p0[0]) / 6), f1(p1[1] + (p2[1] - p0[1]) / 6)], c2 = [f1(p2[0] - (p3[0] - p1[0]) / 6), f1(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
    for (let j = 0; j <= 24; j++) { const t = j / 24, u = 1 - t; S.push([u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0], u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]]); }
    if (i === pts.length - 2) ang = Math.atan2(p2[1] - c2[1], p2[0] - c2[0]);
  }
  return { d, end: pts[pts.length - 1], ang, S };
}
function newScene(m) { return { m, under: '', lines: '', marks: '', hud: '', labels: [], obs: [], rects: [], cam: null }; }
function addObsLine(S, samples, r) { let last = null; samples.forEach(p => { if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 4) { S.obs.push([p[0], p[1], r]); last = p; } }); }
function Arrow(S, lls, col, delay, o = {}) {
  const g = geom(lls.map(l => pt(S.m, l)), o.bend), w = (o.w || 3.2) * (MOB ? 1.15 : 1);
  S.lines += `<path class="dr" pathLength="1" d="${g.d}" fill="none" stroke="#FBF6EA" stroke-width="${w + 3}" stroke-linecap="round" stroke-opacity=".75" style="animation-delay:${delay}s"/><path class="dr" pathLength="1" d="${g.d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" style="animation-delay:${delay}s"/>`;
  const a = f1(g.ang * 180 / Math.PI), z = MOB ? 1.2 : 1;
  S.marks += `<polygon class="pop" points="0,0 ${-13 * z},${-6.5 * z} ${-13 * z},${6.5 * z}" fill="${col}" stroke="#FBF6EA" stroke-width="1" transform="translate(${g.end[0]} ${g.end[1]}) rotate(${a})" style="animation-delay:${delay + 1.3}s"/>`;
  addObsLine(S, g.S, w / 2 + 3); S.obs.push([g.end[0], g.end[1], 10]);
  if (o.label) { const at = o.lp ? pt(S.m, o.lp) : g.S[Math.floor(g.S.length / 2)]; S.labels.push({ t: o.label, col, d: delay + .9, pri: 2, type: 'free', at, max: 110, size: o.size || 13 }); }
}
function Line(S, lls, delay, o = {}) {
  const g = geom(lls.map(l => pt(S.m, l)), 0);
  S.lines += `<path d="${g.d}" fill="none" stroke="#FBF6EA" stroke-width="4.5" stroke-opacity=".7" stroke-linecap="round"/><path d="${g.d}" fill="none" stroke="${o.col || '#7A5A3A'}" stroke-width="${o.w || 1.8}" stroke-dasharray="${o.dash || '6 4'}" stroke-linecap="round"/>`;
  addObsLine(S, g.S, 3.5);
  if (o.name) S.labels.push({ t: o.name, col: o.col || '#7A5A3A', d: 0, pri: 3, type: 'free', at: pt(S.m, o.lp), max: 34, size: 10.5, kind: 'it' });
}
function City(S, ll, name, delay, o = {}) {
  const p = pt(S.m, ll), r = (o.r || 3.6) * (MOB ? 1.2 : 1);
  S.marks += `<circle class="pop" cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${o.col || C.ink}" stroke="#FBF6EA" stroke-width="1.5" style="animation-delay:${delay}s"/>`;
  S.obs.push([p[0], p[1], r + 2]);
  if (name) S.labels.push({ t: name, col: o.tcol || C.ink, d: delay, pri: 1, type: 'pt', at: p, rad: r + 2, pref: o.side, size: o.size || 12.5 });
}
function Battle(S, ll, name, delay, o = {}) {
  const p = pt(S.m, ll), z = o.z || (MOB ? 1.3 : 1.2), d2 = (delay + .15).toFixed(2), d3 = (delay + .55).toFixed(2);
  S.marks += `<g class="pop" style="animation-delay:${delay}s"><g transform="translate(${p[0]} ${p[1]}) scale(${z})"><circle r="13.5" fill="#FBF6EA" stroke="#7A1F2B" stroke-width="2"/>${o.nopulse ? '' : '<circle class="pulse" r="13.5" fill="none" stroke="#7A1F2B" stroke-width="2"/>'}<g class="sw-l" style="animation-delay:${d2}s"><use href="#fg-sword"/></g><g class="sw-r" style="animation-delay:${d2}s"><use href="#fg-sword"/></g><path class="clash" d="M0,-12 l1.6,3.2 l3.4,.6 l-3.4,.8 l-1.6,3.2 l-1.6,-3.2 l-3.4,-.8 l3.4,-.6 Z" fill="#F2B632" style="animation-delay:${d3}s"/></g></g>`;
  S.obs.push([p[0], p[1], 16 * z]);
  if (name) S.labels.push({ t: name, col: '#7A1F2B', d: delay + .15, pri: 1, type: 'pt', at: p, rad: o.rad || 16 * z, pref: o.side, size: o.size || 12.5 });
}
function Ring(S, ll, col, delay) { const p = pt(S.m, ll), r = MOB ? 20 : 17; S.marks += `<circle class="pop" cx="${p[0]}" cy="${p[1]}" r="${r}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="5 4" style="animation-delay:${delay}s"/>`; S.obs.push([p[0], p[1], r + 2]); }
function Prov(S, ll, name, o = {}) { S.labels.push({ t: name, col: o.col || '#9C8768', d: 0, pri: o.pri || 4, type: 'free', at: pt(S.m, ll), max: o.max || (MOB ? 48 : 30), size: o.size || 11, kind: 'prov' }); }
function Sea(S, ll, name, o = {}) { S.labels.push({ t: name, col: '#6E8A84', d: 0, pri: 5, type: 'free', at: pt(S.m, ll), max: 40, size: o.size || 12, kind: 'sea' }); }
function Free(S, ll, name, col, delay, o = {}) { S.labels.push({ t: name, col, d: delay, pri: o.pri || 2, type: 'free', at: pt(S.m, ll), max: o.max || 90, size: o.size || 13 }); }
function Tint(S, ll, rx, ry, col, delay) { const p = pt(S.m, ll), k = MOB ? .7 : 1; S.under += `<ellipse class="pop" cx="${p[0]}" cy="${p[1]}" rx="${f1(rx * k)}" ry="${f1(ry * k)}" fill="${col}" fill-opacity=".16" stroke="${col}" stroke-opacity=".45" stroke-dasharray="4 4" style="animation-delay:${delay}s"/>`; }
function Ships(S, ll, n, col, delay, o = {}) {
  const p = pt(S.m, ll), z = MOB ? 1.15 : 1; let s = `<g class="${o.cls || 'pop'}" style="animation-delay:${delay}s">`;
  for (let i = 0; i < n; i++) {
    const x = f1(p[0] + (o.dx || 0) * i * z), y = f1(p[1] + (o.dy == null ? 9 : o.dy) * i * z);
    s += `<path d="M${x - 7 * z} ${y} Q${x} ${y + 4 * z} ${x + 7 * z} ${y} L${x + 5 * z} ${y - 2.5 * z} L${x - 5 * z} ${y - 2.5 * z} Z" fill="${col}" stroke="#FBF6EA" stroke-width=".8"/>`;
    S.obs.push([x, y, 8 * z]);
  }
  S.marks += s + '</g>';
}
function Badge(S, txt, delay, col) {
  const lines = txt.split('|'), fs0 = 13 * FS, fs1 = 12 * FS, w = Math.max(tw(lines[0], fs0, 'b'), ...lines.slice(1).map(l => tw(l, fs1, 'n'))) + 24, h = fs0 + (lines.length - 1) * fs1 * 1.35 + 20;
  const x = MOB ? 12 : W - w - 14, y = 12;
  let s = `<g class="pop" style="animation-delay:${delay}s"><rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${f1(h)}" rx="4" fill="#FBF6EA" stroke="${col}" stroke-width="1.2"/>`;
  lines.forEach((l, i) => { s += `<text x="${f1(x + 12)}" y="${f1(y + 8 + fs0 + i * fs1 * 1.35)}" fill="${i ? '#6F6356' : col}" style="font-size:${f1(i ? fs1 : fs0)}px;font-weight:${i ? 400 : 700}">${l}</text>`; });
  S.hud += s + '</g>'; S.rects.push([x - 4, y - 4, x + w + 4, y + h + 4]);
}
/* text metrics */
function tw(str, fs, kind) {
  let w = 0;
  for (const ch of str) {
    if (kind === 'cap' || kind === 'sea') w += (/[A-Z]/.test(ch) ? .76 : /[a-z]/.test(ch) ? .6 : ch === ' ' ? .3 : .45) * fs + .14 * fs;
    else w += (/[iljtf.,'’:;!|]/.test(ch) ? .3 : /[mwMW]/.test(ch) ? .9 : /[A-Z]/.test(ch) ? .7 : ch === ' ' ? .29 : /[0-9]/.test(ch) ? .58 : .57) * fs * (kind === 'b' ? 1.04 : 1);
  }
  return w;
}
function box(L, x, y, anchor) {
  const lines = L.t.split('|'), fs = L.size * FS, lh = fs * 1.18;
  let w = 0;
  lines.forEach((l, i) => { const k = L.kind === 'prov' ? (i ? 'n' : 'cap') : L.kind === 'sea' ? 'sea' : L.kind === 'it' ? 'n' : 'b'; const f = L.kind === 'prov' && i ? fs * .86 : fs; w = Math.max(w, tw(l, f, k)); });
  const h = lh * lines.length, x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2, top = y - fs * .82;
  return [x0 - 2, top - 2, x0 + w + 2, top + h + 1];
}
function placeLabels(S) {
  const placed = [], out = [];
  const order = S.labels.map((l, i) => [l, i]).sort((a, b) => a[0].pri - b[0].pri || a[1] - b[1]).map(a => a[0]);
  const hitCount = (b, strict) => {
    if (b[0] < 3 || b[2] > W - 3 || b[1] < 3 || b[3] > H - 3) return 1e9;
    for (const r of S.rects.concat(placed)) if (!(b[2] < r[0] || b[0] > r[2] || b[3] < r[1] || b[1] > r[3])) return 1e9;
    let n = 0;
    for (const o of S.obs) { const dx = Math.max(b[0] - o[0], 0, o[0] - b[2]), dy = Math.max(b[1] - o[1], 0, o[1] - b[3]); if (dx * dx + dy * dy < o[2] * o[2]) { n++; if (strict) return n; } }
    return n;
  };
  for (const L of order) {
    const fs = L.size * FS, nl = L.t.split('|').length, lh = fs * 1.18, H0 = lh * nl, cands = [];
    if (L.type === 'pt') {
      const [px, py] = L.at, dirs = ['E', 'W', 'N', 'S', 'NE', 'SE', 'NW', 'SW'];
      if (L.pref) { dirs.splice(dirs.indexOf(L.pref), 1); dirs.unshift(L.pref); }
      for (const dd of [3, 9, 17, 28, 42, 60, 80, 100]) {
        const dist = L.rad + dd;
        for (const dr of dirs) {
          const e = dr.includes('E'), wv = dr.includes('W'), n = dr.includes('N'), s = dr.includes('S'), diag = (e || wv) && (n || s), dx = diag ? dist * .75 : dist;
          let x = px, anchor = 'middle', yc = py;
          if (e) { x = px + dx; anchor = 'start'; } if (wv) { x = px - dx; anchor = 'end'; }
          if (n) yc = py - (diag ? dist * .75 : dist) - H0 / 2; if (s) yc = py + (diag ? dist * .75 : dist) + H0 / 2;
          cands.push([x, yc - H0 / 2 + fs * .82, anchor]);
        }
      }
    } else {
      const [ax, ay] = L.at;
      cands.push([ax, ay - H0 / 2 + fs * .82, 'middle']);
      for (let r = 8; r <= L.max; r += 8) for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; cands.push([ax + Math.cos(a) * r * 1.3, ay + Math.sin(a) * r - H0 / 2 + fs * .82, 'middle']); }
    }
    let best = null, bestN = 1e9;
    for (const c of cands) { const b = box(L, c[0], c[1], c[2]), n = hitCount(b, true); if (n === 0) { best = [c, b]; bestN = 0; break; } }
    if (!best && L.pri <= 2 && L.type === 'free') { const [ax, ay] = L.at; for (let r = L.max + 8; r <= 170 && !best; r += 8) for (let k = 0; k < 24; k++) { const an = k * Math.PI / 12, cc = [ax + Math.cos(an) * r * 1.3, ay + Math.sin(an) * r - H0 / 2 + fs * .82, 'middle']; const b = box(L, cc[0], cc[1], cc[2]); if (hitCount(b, true) === 0) { best = [cc, b]; bestN = 0; break; } } }
    if (!best && L.pri <= 2) for (const c of cands) { const b = box(L, c[0], c[1], c[2]), n = hitCount(b, false); if (n < bestN) { bestN = n; best = [c, b]; } }
    if (!best || bestN >= 1e9) { console.error((L.pri <= 2 ? '  ! NON piazzata: ' : '  - omessa: ') + L.t); continue; }
    if (bestN > 0) console.error('  ~ label con', bestN, 'contatti:', L.t);
    placed.push(best[1]);
    if (L.type === 'pt') { const [px, py] = L.at, b = best[1], qx = Math.min(Math.max(px, b[0]), b[2]), qy = Math.min(Math.max(py, b[1]), b[3]), dd = Math.hypot(qx - px, qy - py); if (dd > L.rad + 9) out.push(`<line class="pop" x1="${f1(px + (qx - px) / dd * L.rad)}" y1="${f1(py + (qy - py) / dd * L.rad)}" x2="${f1(qx)}" y2="${f1(qy)}" stroke="${L.col}" stroke-width="1" stroke-opacity=".7" style="animation-delay:${L.d}s"/>`); }
    out.push(emitLabel(L, best[0]));
  }
  return out.join('');
}
function emitLabel(L, c) {
  const [x, y, anchor] = c, fs = f1(L.size * FS), lh = L.size * FS * 1.18, lines = L.t.split('|');
  let st;
  if (L.kind === 'prov') st = `font-family:'Cinzel','Trajan Pro',Georgia,serif;font-size:${fs}px;letter-spacing:.14em;font-weight:600;paint-order:stroke;stroke:#F3EAD4;stroke-width:3px`;
  else if (L.kind === 'sea') st = `font-family:'Cinzel','Trajan Pro',Georgia,serif;font-size:${fs}px;letter-spacing:.14em;font-style:italic`;
  else if (L.kind === 'it') st = `font-size:${fs}px;font-style:italic;paint-order:stroke;stroke:#FBF6EA;stroke-width:3px`;
  else st = `font-size:${fs}px;font-weight:600;paint-order:stroke;stroke:#FBF6EA;stroke-width:4px;stroke-linejoin:round`;
  let s = `<text class="pop" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" fill="${L.col}" style="animation-delay:${L.d}s;${st}">`;
  lines.forEach((l, i) => { s += `<tspan x="${f1(x)}" dy="${i ? f1(lh) : 0}"${L.kind === 'prov' && i ? ` style="font-family:inherit;font-size:${f1(L.size * FS * .86)}px;letter-spacing:.02em;font-weight:400;font-style:italic"` : ''}>${l}</tspan>`; });
  return s + '</text>';
}
let CAMN = 0;
function render(S) {
  const labels = placeLabels(S);
  let inner = `<use href="#fg-map-${S.m}${SUF}"/>` + S.under + S.lines + S.marks + labels;
  if (S.cam) {
    const T = S.cam[S.cam.length - 1][0], name = 'fgcam' + (CAMN++) + (MOB ? 'm' : 'd');
    const kf = S.cam.map(c => {
      const pct = f1(c[0] / T * 100);
      if (c[1] == null) return `${pct}%{transform:translate(0px,0px) scale(1)}`;
      const s = c[3], p = pt(S.m, [c[1], c[2]]), x = Math.min(Math.max(p[0], W / (2 * s)), W - W / (2 * s)), y = Math.min(Math.max(p[1], H / (2 * s)), H - H / (2 * s));
      return `${pct}%{transform:translate(${f1(W / 2 - s * x)}px,${f1(H / 2 - s * y)}px) scale(${s})}`;
    }).join('');
    inner = `<style>@keyframes ${name}{${kf}}</style><g class="cam" style="animation:${name} ${T}s ease-in-out both">${inner}</g>`;
  }
  return inner + S.hud;
}

/* confini approssimativi delle province (c. 60–30 a.C.) */
const PBORD = [
  { p: [[11.95, 43.82], [11.3, 43.95], [10.8, 43.9], [10.3, 43.68]], min: 43 },
  { p: [[7.2, 43.66], [6.95, 44.4], [6.95, 45.2], [6.95, 46.05], [7.9, 46.2], [8.5, 46.45], [9.6, 46.55], [10.5, 46.6], [11.5, 46.7], [12.5, 46.6], [13.4, 46.3], [13.8, 45.7]] },
  { p: [[0.8, 42.7], [1.44, 43.6], [2.2, 43.9], [3.4, 44.3], [3.9, 45.0], [4.6, 45.6], [5.5, 45.9], [6.1, 46.2], [6.95, 46.05]] },
  { p: [[-1.75, 43.37], [-0.6, 42.85], [0.8, 42.7], [1.8, 42.45], [3.15, 42.43]] },
  { p: [[19.55, 41.75], [20.2, 42.1], [21.0, 42.3], [21.8, 42.2]] },
  { p: [[28.4, 40.4], [29.8, 39.9], [31.0, 40.0], [32.2, 40.4], [33.5, 41.2], [34.0, 41.9]] },
  { p: [[31.0, 40.0], [31.2, 39.0], [30.8, 38.2], [30.0, 37.5], [29.4, 36.9], [28.7, 36.75]] },
  { p: [[30.8, 38.2], [32.5, 37.6], [34.0, 37.8], [35.5, 37.8], [36.3, 37.0], [36.2, 36.6], [35.95, 36.2]] },
  { p: [[34.95, 33.1], [35.6, 33.25], [36.3, 32.9], [36.9, 32.6]] },
  { p: [[37.87, 37.06], [38.0, 36.83], [38.3, 36.5], [38.2, 36.0], [39.0, 35.95], [40.14, 35.33]] },
  { p: [[8.75, 36.95], [9.3, 36.3], [9.6, 35.6], [10.6, 34.6]] },
  { p: [[6.3, 36.9], [6.2, 35.8], [6.0, 34.5]], max: 46 },
  { p: [[6.3, 36.9], [6.2, 35.8], [6.0, 34.5]], min: 47, lbl: 0 },
  { p: [[18.8, 30.3], [18.8, 29.0]] },
  { p: [[-1.85, 37.15], [-3.0, 37.9], [-3.8, 38.4], [-4.5, 39.5], [-5.2, 40.6], [-6.0, 41.4]] }
];
function ProvBorders(S, yr) {
  PBORD.forEach(b => { if ((b.min && yr < b.min) || (b.max && yr > b.max)) return; const g = geom(b.p.map(l => pt(S.m, l)), 0);
    S.lines = `<path d="${g.d}" fill="none" stroke="#FBF6EA" stroke-width="3.6" stroke-opacity=".55" stroke-linecap="round"/><path d="${g.d}" fill="none" stroke="#8C6A4A" stroke-width="1.3" stroke-dasharray="5 4" stroke-linecap="round" opacity=".85"/>` + S.lines;
    addObsLine(S, g.S, 2.5); });
}

/* aree controllate (approssimative), ritagliate sulla terraferma */
const REG = {
  CIS: [[6.95, 46.05], [7.9, 46.2], [8.5, 46.45], [9.6, 46.55], [10.5, 46.6], [11.5, 46.7], [12.5, 46.6], [13.4, 46.3], [13.8, 45.7], [13.0, 44.6], [12.42, 44.16], [11.95, 43.82], [11.3, 43.95], [10.8, 43.9], [10.3, 43.68], [9.8, 43.9], [7.2, 43.66], [6.95, 44.4], [6.95, 45.2]],
  ITS: [[12.42, 44.16], [13.0, 44.6], [15.5, 42.6], [18.5, 40.8], [18.9, 39.8], [16.5, 37.6], [15.52, 37.9], [15.60, 38.12], [15.685, 38.27], [15.70, 38.45], [12.0, 41.0], [10.2, 42.8], [10.3, 43.68], [10.8, 43.9], [11.3, 43.95], [11.95, 43.82]],
  NARB: [[3.6, 42.3], [3.15, 42.43], [1.8, 42.45], [0.8, 42.7], [1.44, 43.6], [2.2, 43.9], [3.4, 44.3], [3.9, 45.0], [4.6, 45.6], [5.5, 45.9], [6.1, 46.2], [6.95, 46.05], [6.95, 45.2], [6.95, 44.4], [7.2, 43.66], [7.3, 42.0]],
  COM: [[-1.75, 43.37], [-0.6, 42.85], [0.8, 42.7], [1.44, 43.6], [2.2, 43.9], [3.4, 44.3], [3.9, 45.0], [4.6, 45.6], [5.5, 45.9], [6.1, 46.2], [6.95, 46.05], [7.6, 47.55], [7.75, 48.58], [8.27, 50.0], [7.6, 50.36], [7.1, 50.73], [6.96, 50.94], [6.76, 51.43], [6.25, 51.83], [4.4, 51.95], [1.55, 51.05], [-1.0, 50.3], [-5.8, 49.3], [-6.2, 43.5]],
  HISC: [[-1.75, 43.37], [-2.5, 42.9], [-4.0, 42.6], [-6.0, 41.4], [-5.2, 40.6], [-4.5, 39.5], [-3.8, 38.4], [-3.0, 37.9], [-1.9, 37.2], [-1.5, 37.1], [-0.5, 37.3], [3.3, 41.8], [3.15, 42.43], [1.8, 42.45], [0.8, 42.7], [-0.6, 42.85]],
  HISU: [[-6.0, 41.4], [-7.0, 41.9], [-9.8, 41.9], [-10, 36.5], [-6.2, 36.0], [-5.4, 35.97], [-4.0, 36.2], [-2.0, 36.5], [-1.5, 37.1], [-1.9, 37.2], [-3.0, 37.9], [-3.8, 38.4], [-4.5, 39.5], [-5.2, 40.6]],
  SIC: [[12.1, 38.35], [15.70, 38.45], [15.685, 38.27], [15.60, 38.12], [15.52, 37.9], [15.4, 37.0], [15.4, 36.3], [12.1, 36.9]],
  SAR: [[7.9, 43.1], [9.9, 43.1], [10.0, 38.8], [7.9, 38.8]],
  AFV: [[8.75, 37.4], [8.75, 36.95], [9.3, 36.3], [9.6, 35.6], [10.6, 34.6], [12.2, 34.6], [12.2, 37.6]],
  AFN: [[6.3, 37.3], [6.3, 36.9], [6.2, 35.8], [6.0, 34.5], [10.6, 34.6], [9.6, 35.6], [9.3, 36.3], [8.75, 36.95], [8.75, 37.4]],
  CYR: [[18.8, 33.6], [18.8, 29.0], [25.1, 29.0], [25.1, 33.6]],
  CRE: [[23.3, 35.8], [26.5, 35.8], [26.5, 34.7], [23.3, 34.7]],
  ILL: [[13.8, 45.7], [15.5, 45.8], [17.5, 44.6], [19.2, 43.3], [20.2, 42.1], [19.55, 41.75], [19.3, 41.4], [16.0, 42.9], [13.9, 45.0]],
  MAC: [[19.55, 41.75], [20.2, 42.1], [21.0, 42.3], [21.8, 42.2], [23.0, 42.0], [23.8, 41.85], [24.2, 41.5], [24.62, 41.1], [24.75, 40.87], [24.0, 39.9], [25.6, 37.0], [22.5, 35.9], [20.0, 37.5], [19.2, 40.0], [19.3, 41.4]],
  ASI: [[26.2, 40.0], [27.0, 40.4], [29.0, 41.2], [31.5, 41.4], [34.0, 42.2], [34.0, 41.2], [33.5, 41.2], [32.2, 40.4], [31.0, 40.0], [31.2, 39.0], [30.8, 38.2], [32.5, 37.6], [34.0, 37.8], [35.5, 37.8], [36.3, 37.0], [36.2, 36.6], [35.95, 36.2], [35.2, 35.3], [34.8, 34.4], [32.2, 34.6], [32.0, 35.9], [29.5, 35.9], [27.0, 36.2], [25.9, 37.5]],
  SYR: [[35.95, 36.2], [36.2, 36.6], [36.3, 37.0], [37.87, 37.06], [38.0, 36.83], [38.3, 36.5], [38.2, 36.0], [39.0, 35.95], [38.5, 34.5], [37.5, 33.0], [36.9, 32.6], [36.3, 32.9], [35.6, 33.25], [34.95, 33.1], [34.5, 33.5], [35.2, 35.3]],
  EGY: [[25.1, 33.6], [25.1, 27.5], [34.4, 27.5], [34.95, 29.5], [34.6, 29.6], [34.2, 30.4], [33.8, 31.13], [33.8, 33.0]],
  JUD: [[34.95, 33.1], [35.6, 33.25], [36.3, 32.9], [36.9, 32.6], [35.9, 31.0], [34.2, 30.4], [33.8, 31.13], [34.2, 32.0]],
  ACTN: [[20.2, 39.3], [21.4, 39.3], [21.4, 39.0], [20.95, 38.98], [20.77, 38.955], [20.70, 38.955], [20.2, 38.95]],
  ACTS: [[20.2, 38.95], [20.70, 38.955], [20.77, 38.955], [20.95, 38.98], [21.4, 39.0], [21.4, 38.5], [20.2, 38.5]]
};
function Area(S, keys, col, delay, o = {}) {
  const d = keys.map(k => 'M' + REG[k].map(l => pt(S.m, l).join(' ')).join(' L') + ' Z').join(' ');
  S.under += `<g clip-path="url(#fg-land-${S.m}${SUF})"><path class="${o.cls || 'pop'}" d="${d}" fill="${o.fill || col}" fill-opacity="${o.op || .2}" style="animation-delay:${delay}s${o.dur ? `;animation-duration:${o.dur}s` : ''}"/></g>`;
}
function RomanArea(S, keys, delay) {
  const hid = 'fgRA' + (CAMN) + (MOB ? 'm' : 'd');
  S.under += `<defs><pattern id="${hid}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#7A1F2B" fill-opacity=".1"/><line x1="0" y1="0" x2="0" y2="7" stroke="#7A1F2B" stroke-width="1.6" stroke-opacity=".3"/></pattern></defs>`;
  Area(S, keys, '#7A1F2B', delay, { fill: `url(#${hid})`, op: 1 });
}
const EGB = S => { Line(S, [[25.15, 31.6], [25.1, 30.8], [25.0, 29.4]], 0); Line(S, [[33.8, 31.13], [34.2, 30.4], [34.6, 29.6], [34.95, 29.5]], 0); };
const RUB = S => Line(S, [[12.42, 44.16], [12.2, 44.0], [11.95, 43.82]], 0, { name: 'Rubicone', lp: [12.75, 44.25] });
const VAR = S => { S.labels.push({ t: 'Varo', col: '#7A5A3A', d: 0, pri: 3, type: 'free', at: pt(S.m, [7.45, 44.05]), max: 34, size: 10.5, kind: 'it' }); };
const NES = S => Line(S, [[24.75, 40.87], [24.62, 41.1], [24.2, 41.5], [23.8, 41.85]], 0, { name: 'Nesto', lp: [24.55, 41.6] });
function MEDPROV(S, cis) {
  Prov(S, [15.2, 41.0], 'ITALIA'); if (cis) Prov(S, [10.6, 45.4], 'GALLIA|Cisalpina'); Prov(S, [22.2, 40.2], 'MACEDONIA'); Prov(S, [26.0, 42.3], 'THRACIA|regno cliente');
  Prov(S, [29.4, 39.0], 'ASIA'); Prov(S, [36.4, 34.9], 'SYRIA'); Prov(S, [30.3, 30.4], 'AEGYPTVS|regno tolemaico'); Prov(S, [21.8, 31.2], 'CYRENAICA'); Prov(S, [9.8, 34.4], 'AFRICA'); Prov(S, [14.1, 37.45], 'SICILIA', { size: 9.5 });
}

/* ================= IDI DI MARZO ================= */
function sceneIdes() {
  const fy = H - (MOB ? 64 : 50), cx = MOB ? W * .40 : W * .43, sx = MOB ? W * .84 : W * .80, id = 'fgI' + (MOB ? 'm' : 'd'), Z = MOB ? .92 : 1;
  const leaves = (() => { let l = ''; for (let i = 0; i < 12; i++) { const a = Math.PI * (1.02 + i * .082), x = f1(3 + 14.5 * Math.cos(a)), y = f1(-152 + 14.5 * Math.sin(a)), r = f1(a * 180 / Math.PI + 90 + (i % 2 ? 32 : -32)); l += `<ellipse cx="${x}" cy="${y}" rx="5.4" ry="2.3" transform="rotate(${r} ${x} ${y})" fill="${i % 2 ? '#4E7A34' : '#6E9A45'}" stroke="#2F4A1E" stroke-width=".5"/>`; } l += `<path d="M-10,-146 q-6,6 -5,14 M-9,-146 q-2,7 1,13" fill="none" stroke="#8E1B24" stroke-width="1.6" stroke-linecap="round"/>`; return l; })();
  const OUT = '#4A3A2A';
  let s = `<defs><linearGradient id="${id}skF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A8744E"/><stop offset=".55" stop-color="#D6A47C"/><stop offset="1" stop-color="#E8BC94"/></linearGradient><linearGradient id="${id}skN" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A6848"/><stop offset="1" stop-color="#C8956C"/></linearGradient>
<linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E0B12"/><stop offset=".62" stop-color="#1C090C"/><stop offset="1" stop-color="#120607"/></linearGradient>
<radialGradient id="${id}sp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A8" stop-opacity=".55"/><stop offset=".55" stop-color="#F6D08A" stop-opacity=".14"/><stop offset="1" stop-color="#F6D08A" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9BC" stop-opacity=".22"/><stop offset="1" stop-color="#FFE9BC" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A1A14"/><stop offset="1" stop-color="#1A0B09"/></linearGradient>
<linearGradient id="${id}tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#CBBFA5"/><stop offset=".5" stop-color="#F4EDDF"/><stop offset="1" stop-color="#E0D5BE"/></linearGradient>
<linearGradient id="${id}tgd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A89C84"/><stop offset=".5" stop-color="#CFC4AD"/><stop offset="1" stop-color="#BDB199"/></linearGradient>
<linearGradient id="${id}pp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A0C29"/><stop offset=".5" stop-color="#6E1D50"/><stop offset="1" stop-color="#511442"/></linearGradient>
<linearGradient id="${id}mb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9E9482"/><stop offset=".45" stop-color="#E7E0D2"/><stop offset="1" stop-color="#A69B86"/></linearGradient>
<filter id="${id}gray" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.25 0.6 0.15 0 0.1  0.24 0.6 0.14 0 0.08  0.22 0.55 0.13 0 0.05  0 0 0 1 0"/></filter>
<filter id="${id}blur"><feGaussianBlur stdDeviation="2.2"/></filter>
<g id="${id}head"><path d="M-2,-138 L9,-138 L10,-127 L-3,-127 Z" fill="#B98560" stroke="${OUT}" stroke-width=".7"/><path d="M-7,-151 C-8,-162 2,-165 9,-162 C15,-160 17,-155 16.5,-151 L21,-145 L16.5,-143.5 C17,-141 16,-139.5 14,-139.5 C15,-137 13,-135 9.5,-135.5 C6,-134 1,-135 -2,-138 C-6,-141 -7,-146 -7,-151 Z" fill="#D2A27B" stroke="${OUT}" stroke-width=".8"/><circle cx="11" cy="-151" r="1.4" fill="#2B1A12"/><path d="M8.5,-154.5 q3,-1.5 6,0" stroke="#6B4A30" stroke-width="1.2" fill="none"/><path d="M12,-140.8 q2.2,.6 3.8,-.3" stroke="#8C5A40" stroke-width="1" fill="none"/><ellipse cx="-2.5" cy="-148" rx="2.6" ry="3.8" fill="#C08C66" stroke="${OUT}" stroke-width=".6"/></g>
<g id="${id}body"><ellipse cx="2" cy="0" rx="34" ry="5" fill="#000" opacity=".4" filter="url(#${id}blur)"/><path d="M-17,0 h16 v-6 h-14 z" fill="#6B2A1E"/><path d="M5,0 h18 v-6 h-16 z" fill="#6B2A1E"/>
<path d="M-12,-130 C-28,-124 -34,-96 -32,-60 C-31,-34 -33,-16 -36,-5 L31,-5 C27,-22 25,-44 27,-70 C29,-100 25,-122 14,-130 Z" style="fill:var(--tg)" stroke="${OUT}" stroke-width=".9"/>
<path d="M-26,-104 C-6,-88 12,-70 24,-44" fill="none" style="stroke:var(--fold)" stroke-width="3.4" stroke-linecap="round"/><path d="M-31,-72 C-12,-58 8,-42 28,-27" fill="none" style="stroke:var(--fold)" stroke-width="2.2" stroke-linecap="round" opacity=".75"/><path d="M-33,-40 C-18,-30 -4,-22 16,-17" fill="none" style="stroke:var(--fold)" stroke-width="1.7" opacity=".6"/><path d="M-20,-8 C-18,-26 -14,-40 -12,-58" fill="none" style="stroke:var(--fold)" stroke-width="1.4" opacity=".55"/>
<path d="M2,-130 L15,-130 L10,-110 Z" fill="#E6DCC6" stroke="${OUT}" stroke-width=".6"/><path d="M7,-129 L11,-129 L9.6,-113 Z" fill="#7A2260"/></g>
<g id="${id}hairS"><path d="M-7.5,-151 C-8,-163 2,-167 10,-164 C15,-162 17,-158 16,-155 C11,-158 6,-158 2,-155 C0,-151 -3,-147 -7,-145 Z"/></g>
<g id="${id}arm"><path d="M-2,-3 C8,1 17,2 23,-1" fill="none" style="stroke:var(--sl)" stroke-width="11.5" stroke-linecap="round"/><path d="M20,-1 C26,-4 30,-8 33,-11" fill="none" stroke="#D2A27B" stroke-width="6.8" stroke-linecap="round"/><circle cx="34" cy="-12" r="4.4" fill="#D2A27B" stroke="${OUT}" stroke-width=".6"/><path d="M34.5,-15.5 L60,-40 L38.5,-10 Z" fill="#F1EFE9" stroke="#6E6C66" stroke-width=".8"/><path d="M36,-13.5 L57,-37" stroke="#FFFFFF" stroke-width=".8" opacity=".8"/><path d="M29.5,-17.5 L40.5,-5.5" stroke="#C99A3A" stroke-width="3.4" stroke-linecap="round"/></g>
<g id="${id}farm"><path d="M-4,-2 C6,4 16,6 24,4" fill="none" style="stroke:var(--sl2)" stroke-width="10" stroke-linecap="round"/><path d="M22,4 C28,3 32,1 36,-1" fill="none" stroke="#B98560" stroke-width="6" stroke-linecap="round"/><circle cx="37" cy="-1.5" r="4" fill="#B98560"/></g>
</defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>`;
  let scene = '';
  const ncol = MOB ? 4 : 7, ct = MOB ? 104 : 46;
  for (let i = 0; i < ncol; i++) { const x = f1(W * (i + .5) / ncol); scene += `<rect x="${x - 18}" y="${ct}" width="36" height="${fy - ct}" fill="#4A1A20" opacity=".5"/><rect x="${x - 25}" y="${ct - 7}" width="50" height="10" fill="#5E262D" opacity=".55"/><path d="M${x - 10} ${ct + 6} V${fy}" stroke="#2A0C10" stroke-width="2" opacity=".5"/>`; }
  scene += `<polygon points="${f1(cx - 40)},0 ${f1(cx + 40)},0 ${f1(cx + 170)},${fy} ${f1(cx - 170)},${fy}" fill="url(#${id}beam)"/>`;
  for (let r = 0; r < 2; r++) scene += `<rect x="0" y="${f1(fy - 64 + r * 24)}" width="${W}" height="14" fill="#2C1114" opacity=".8"/>`;
  const fleer = (x0, dir, d, sc) => `<g transform="translate(${f1(x0)} ${f1(fy - 34)}) scale(${dir * sc * Z} ${sc * Z})"><g class="flee" style="animation-delay:${d}s"><g style="--tg:#4E2A2C;--fold:#3A1E20" opacity=".85"><use href="#${id}body"/><use href="#${id}head" opacity=".0"/><circle cx="4" cy="-149" r="12" fill="#3A1E20"/></g></g></g>`;
  scene += fleer(cx - 250 * Z, -1, 2.3, .55) + fleer(cx - 200 * Z, -1, 2.7, .5) + fleer(cx + 190 * Z, 1, 2.5, .52) + (MOB ? '' : fleer(cx + 250, 1, 3.0, .5));
  scene += `<rect x="0" y="${fy}" width="${W}" height="${H - fy}" fill="url(#${id}fl)"/><line x1="0" y1="${fy}" x2="${W}" y2="${fy}" stroke="#7A4232" stroke-width="1.5"/>`;
  scene += `<ellipse cx="${cx}" cy="${fy - 90}" rx="${170 * Z}" ry="${190 * Z}" fill="url(#${id}sp)"/><ellipse cx="${cx}" cy="${fy + 6}" rx="${140 * Z}" ry="14" fill="#FFE3A8" opacity=".12"/>`;
  const pk = 1.25 * Z, pb = fy - 72 * Z;
  scene += `<g><rect x="${f1(sx - 46 * Z)}" y="${f1(pb)}" width="${f1(92 * Z)}" height="${f1(72 * Z)}" fill="#8A7F6B" stroke="#5E5446"/><rect x="${f1(sx - 53 * Z)}" y="${f1(pb - 9 * Z)}" width="${f1(106 * Z)}" height="${f1(10 * Z)}" fill="#A99D86" stroke="#5E5446"/><rect x="${f1(sx - 53 * Z)}" y="${f1(fy - 8 * Z)}" width="${f1(106 * Z)}" height="${f1(8 * Z)}" fill="#7A705E"/><text x="${sx}" y="${f1(pb + 40 * Z)}" text-anchor="middle" fill="#3E3426" style="${CAP};font-size:${F(10.5)}px;font-weight:700;letter-spacing:.08em">CN·POMPEIVS</text>`;
  const PM = `fill="url(#${id}mb)" stroke="#6E6558" stroke-width=".8"`, PL = `fill="none" stroke="#9C9282" stroke-width="1"`, LIMB = (d, w) => `<path d="${d}" fill="none" stroke="#6E6558" stroke-width="${w + 2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#E4DCCD" stroke-width="${w}" stroke-linecap="round"/>`;
  scene += `<g transform="translate(${sx} ${f1(pb - 9 * Z)}) scale(${-pk} ${pk})" filter="url(#${id}gray)">`
   + `<path d="M-10,-137 C-24,-127 -27,-101 -24,-78 C-22,-66 -20,-58 -17,-52 L-9,-54 C-8,-72 -8,-96 -6,-112 C-6,-122 -6,-130 -5,-136 Z" ${PM}/><path d="M-20,-112 C-18,-96 -17,-80 -15,-62" ${PL}/>`
   + LIMB('M6,-133 C20,-134 34,-137 46,-143', 8.5) + `<path d="M45,-147 C49,-149 55,-148 58,-145.5 L57,-143.5 C54,-144.5 51,-144 49,-142.5 C51,-141 53,-139 52.5,-138 C50,-138.5 47,-140 45,-140.5 Z" ${PM}/>`
   + `<path d="M-4,-82 C-6,-62 -8,-42 -10,-22 C-11,-12 -13,-5 -15,0 L-3,0 C-2,-8 -1,-24 1,-44 C2,-60 4,-72 6,-82 Z" ${PM}/>`
   + `<path d="M-9,-139 C-16,-127 -17,-109 -13,-97 C-11,-91 -9,-87 -8,-83 L17,-83 C19,-89 21,-99 21,-109 C21,-123 17,-134 11,-140 Z" ${PM}/>`
   + `<path d="M3,-124 C9,-120 14,-120 19,-123 M5,-108 C9,-106 13,-106 17,-108 M6,-98 C9,-96 13,-96 16,-98 M11,-116 L11,-90" ${PL}/>`
   + `<path d="M2,-85 C6,-65 8,-45 8,-25 C8,-13 8,-5 10,0 L22,0 C20,-6 19,-15 19,-25 C19,-47 18,-65 16,-85 Z" ${PM}/><path d="M9,-50 q4,-3 8,0" ${PL}/>`
   + `<path d="M-1,-147 L9,-147 L10,-137 L-2,-137 Z" ${PM}/><path d="M-7,-160 C-8,-171 2,-174 9,-171 C15,-169 17,-164 16.5,-160 L21,-154 L16.5,-152.5 C17,-150 16,-148.5 14,-148.5 C15,-146 13,-144 9.5,-144.5 C6,-143 1,-144 -2,-147 C-6,-150 -7,-155 -7,-160 Z" ${PM}/><path d="M8.5,-163 q3,-1.5 6,0 M12,-149.8 q2.2,.6 3.8,-.3" ${PL}/><path d="M9.5,-159.5 q1.8,-.8 3,0" stroke="#7E7568" stroke-width="1.1" fill="none"/><ellipse cx="-2.5" cy="-157" rx="2.6" ry="3.8" ${PM}/>`
   + `<path d="M-7,-160 C-8,-172 0,-177 8,-176 C11,-180 17,-176 16.5,-169 C14,-171 10,-170 8,-167 C4,-169 0,-166 -1,-161 C-3,-158 -5,-156 -7,-155 Z" ${PM}/><circle cx="10" cy="-172" r="2.2" ${PM}/><circle cx="4" cy="-174" r="2" ${PM}/><circle cx="-2" cy="-172" r="1.9" ${PM}/>`
   + LIMB('M11,-132 C12,-122 11,-112 9,-104', 8.5) + LIMB('M9,-104 C14,-103 19,-103 24,-105', 7.5)
   + `<path d="M4,-106 C12,-104 20,-104 26,-106 C28,-96 27,-80 24,-64 C22,-58 18,-56 14,-58 C12,-70 8,-86 4,-96 Z" ${PM}/><path d="M10,-100 C14,-88 16,-76 18,-62 M18,-102 C21,-90 22,-78 21,-66" ${PL}/>`
   + `<circle cx="29" cy="-113" r="9.5" fill="url(#${id}mb)" stroke="#6E6558" stroke-width=".8"/><path d="M29,-122.5 C25,-118 25,-108 29,-103.5 M19.5,-113 L38.5,-113" ${PL}/><path d="M22,-106 C25,-103 31,-103 34,-106 L33,-104 C30,-101.5 26,-101.5 23,-104 Z" ${PM}/>`
   + `</g></g>`;
  scene += `<ellipse class="pool" cx="${f1(sx - 60 * Z)}" cy="${f1(fy + 4)}" rx="${f1(46 * Z)}" ry="5" fill="#5E0E14" style="animation-delay:6.9s"/>`;
  scene += `<g transform="translate(${f1(cx - 4)} ${fy}) scale(${Z})"><path d="M-22,-48 L22,-2 M22,-48 L-22,-2" stroke="#B8892B" stroke-width="5.5" stroke-linecap="round"/><path d="M-22,-48 L22,-2" stroke="#F1D07A" stroke-width="1.5" stroke-linecap="round"/><rect x="-26" y="-53" width="52" height="8" rx="2" fill="#E0B94F" stroke="#7A5A1E" stroke-width=".7"/><rect x="-24" y="-60" width="48" height="8" rx="2" fill="#8E1B24"/></g>`;
  const fig = (o) => {
    const ox = f1(cx + o.dx * Z), sc = Z * (o.bk ? .9 : 1);
    let a = `<g transform="translate(${ox} ${fy}) scale(${o.mir ? -sc : sc} ${sc})"><g class="cz-back" style="animation-delay:${o.back || 7.2}s"><g class="cz-in" style="animation-delay:${o.enter}s${o.fast ? ';animation-duration:.6s' : ''}"><g transform="skewX(${-(o.lean || 6)})">`;
    a += `<g transform="translate(-4 -118)" style="--sl2:${o.bk ? '#B8AC94' : '#DCD1BC'}">${o.reach ? `<g class="reach" style="animation-delay:${o.enter + .5}s"><use href="#${id}farm"/></g>` : `<use href="#${id}farm"/>`}</g>`;
    a += `<g style="--tg:url(#${id}${o.bk ? 'tgd' : 'tg'});--fold:${o.bk ? '#9A8C72' : '#BFAF90'}"><use href="#${id}body"/></g><use href="#${id}head"/><g fill="${o.hair}"><use href="#${id}hairS"/></g>`;
    if (o.stab) a += `<g transform="translate(10 -122)" style="--sl:${o.bk ? '#C6BAA2' : '#ECE3D1'}"><g class="stab" style="animation-delay:${o.stab}s;animation-iteration-count:${o.n || 3}"><use href="#${id}arm"/></g></g>`;
    return a + `</g></g></g></g>`;
  };
  const F_ = MOB ? [
    { dx: -54, enter: 1.1, stab: 1.55, n: 4, hair: '#3B2A1E', fast: 1, lean: 12, back: 7.2 },
    { dx: -104, enter: 2.2, stab: 2.8, n: 3, hair: '#8E8578' },
    { dx: -150, enter: 2.6, stab: 3.3, n: 2, hair: '#5A3F2B', bk: 1 },
    { dx: 58, enter: -1, stab: 2.6, n: 3, hair: '#2E241C', mir: 1, reach: 1, lean: 10 },
    { dx: 100, enter: 3.6, stab: 4.25, n: 2, hair: '#4A3526', mir: 1, lean: 9 }
  ] : [
    { dx: -58, enter: 1.1, stab: 1.55, n: 4, hair: '#3B2A1E', fast: 1, lean: 12 },
    { dx: -110, enter: 2.2, stab: 2.8, n: 3, hair: '#8E8578' },
    { dx: -160, enter: 2.6, stab: 3.3, n: 3, hair: '#5A3F2B', bk: 1 },
    { dx: -205, enter: 3.0, stab: 3.7, n: 2, hair: '#6E5A48', bk: 1 },
    { dx: 62, enter: -1, stab: 2.6, n: 3, hair: '#2E241C', mir: 1, reach: 1, lean: 10 },
    { dx: 108, enter: 3.6, stab: 4.25, n: 2, hair: '#4A3526', mir: 1, lean: 9 },
    { dx: 152, enter: 2.4, stab: 3.1, n: 3, hair: '#A39A8C', mir: 1, bk: 1 }
  ];
  F_.slice().sort((a, b) => (b.bk ? 1 : 0) - (a.bk ? 1 : 0) || Math.abs(b.dx) - Math.abs(a.dx)).forEach(o => { scene += fig(o); });
  const tx = f1(((sx - 58 * Z) - (cx + 166 * Z)) / Z);
  const CZH = (() => {
    let lv = '';
    const P0 = [-10, -150], P1 = [1, -171.5], P2 = [17, -163];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, u = 1 - t, x = u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], y = u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1];
      const tx_ = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), ty_ = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]), ang = Math.atan2(ty_, tx_) * 180 / Math.PI;
      [[-38, -3.2, '#6E9A45'], [38, 3.2, '#4E7A34']].forEach(([da, off, col]) => {
        const nx = f1(x - Math.sin(ang * Math.PI / 180) * off), ny = f1(y + Math.cos(ang * Math.PI / 180) * off);
        lv += `<ellipse cx="${nx}" cy="${ny}" rx="5.6" ry="2.1" transform="rotate(${f1(ang + da)} ${nx} ${ny})" fill="${col}" stroke="#2F4A1E" stroke-width=".45"/><path d="M${nx} ${ny} l${f1(Math.cos((ang + da) * Math.PI / 180) * 4.5)} ${f1(Math.sin((ang + da) * Math.PI / 180) * 4.5)}" stroke="#A8C77A" stroke-width=".4"/>`;
      });
    }
    return lv;
  })();
  let cz = `<g class="cz-sway" style="animation-delay:1.6s"><g transform="skewX(-3)">`;
  cz += `<ellipse cx="2" cy="0" rx="38" ry="5.5" fill="#000" opacity=".45" filter="url(#${id}blur)"/>`;
  cz += `<path d="M-18,0 h17 v-17 C-2,-19 -5,-21 -9,-21 L-16,-21 Z" fill="#A42C22" stroke="${OUT}" stroke-width=".7"/><path d="M4,0 h19 v-4 C23,-8 20,-10 16,-12 L16,-21 L6,-21 Z" fill="#B8342A" stroke="${OUT}" stroke-width=".7"/><path d="M-16,-17 h13 M-16,-12 h13 M7,-17 h8 M7,-12 h10" stroke="#5E1812" stroke-width="1"/>`;
  cz += `<g transform="translate(-4 -118)"><g class="parryU" style="animation-delay:2.7s"><path d="M-4,-2 C-12,3 -20,6 -29,6" fill="none" stroke="#5A1742" stroke-width="10.5" stroke-linecap="round"/><g transform="translate(-29 6)"><g class="parryF" style="animation-delay:2.7s"><path d="M1,0 C-4,-2 -8,-5 -12,-9" fill="none" stroke="#C99670" stroke-width="6" stroke-linecap="round"/><circle cx="-13" cy="-10" r="3.8" fill="#C99670" stroke="${OUT}" stroke-width=".6"/><path d="M-13,-10 L-27,-24" stroke="#3A2A1A" stroke-width="2.4" stroke-linecap="round"/><path d="M-26,-23 L-28.6,-25.6" stroke="#C8C8C0" stroke-width="1.4" stroke-linecap="round"/></g></g></g></g>`;
  cz += `<path d="M-13,-128 C-29,-122 -35,-96 -33,-60 C-32,-34 -34,-16 -37,-5 L32,-5 C28,-22 26,-44 28,-70 C30,-100 26,-122 15,-128 Z" fill="url(#${id}pp)" stroke="#2A0A1E" stroke-width="1"/>`;
  cz += `<path d="M-37,-5 L32,-5 L31.3,-13 L-36.3,-13 Z" fill="#D4AE55" stroke="#8C6420" stroke-width=".6"/><path d="M-36.3,-13 L31.3,-13" stroke="#FBE7A6" stroke-width=".8" stroke-dasharray="2 3"/>`;
  cz += `<path d="M-27,-106 C-7,-90 12,-72 25,-44" fill="none" stroke="#8C6420" stroke-width="7" stroke-linecap="round"/><path d="M-27,-106 C-7,-90 12,-72 25,-44" fill="none" stroke="#E0BA5C" stroke-width="5" stroke-linecap="round"/><path d="M-27,-106 C-7,-90 12,-72 25,-44" fill="none" stroke="#FBE7A6" stroke-width="1" stroke-dasharray="1.5 3"/>`;
  cz += `<path d="M-32,-72 C-12,-58 8,-42 29,-27" fill="none" stroke="#2E0A22" stroke-width="2.2"/><path d="M-30,-66 C-12,-53 8,-38 28,-22" fill="none" stroke="#8A2A66" stroke-width="1.4" opacity=".7"/><path d="M-21,-9 C-19,-27 -15,-41 -13,-59" fill="none" stroke="#2E0A22" stroke-width="1.6"/><path d="M-17,-9 C-15,-27 -11,-41 -9,-59" fill="none" stroke="#8A2A66" stroke-width="1.1" opacity=".6"/><path d="M26,-100 C30,-80 30,-50 31,-18" fill="none" stroke="#F3C96A" stroke-width="1.6" opacity=".45"/>`;
  [[-14, -86], [4, -64], [-20, -42], [12, -32], [16, -96], [-24, -64], [0, -22], [-12, -24], [20, -58]].forEach(p => { cz += `<g transform="translate(${p[0]} ${p[1]})"><path d="M0,-3.4 l1,2.4 l2.4,1 l-2.4,1 l-1,2.4 l-1,-2.4 l-2.4,-1 l2.4,-1 Z" fill="#EBC860"/><circle r=".9" fill="#FBE7A6"/></g>`; });
  cz += `<path d="M1,-128 L17,-128 L11,-106 Z" fill="#E9DCC0" stroke="#8C6420" stroke-width=".6"/><path d="M6,-127 L12,-127 L10.4,-109 Z" fill="#D4AE55"/><path d="M8.8,-124 l1.6,3 l-1.6,3 l-1.6,-3 Z M8.8,-117 l1.2,2.4 l-1.2,2.4 l-1.2,-2.4 Z" fill="#6A1C4C"/>`;
  cz += `<g transform="translate(4 -129.5) scale(.8)">${headCaesar(id)}</g>`;
  cz += `<g><circle cx="-4" cy="-121" r="3.6" fill="#B0222B" class="bl" style="animation-delay:1.9s"/><circle cx="-8" cy="-96" r="3.5" fill="#B0222B" class="bl" style="animation-delay:2.9s"/><circle cx="12" cy="-84" r="4" fill="#B0222B" class="bl" style="animation-delay:3.4s"/><circle cx="-14" cy="-70" r="3" fill="#B0222B" class="bl" style="animation-delay:3.9s"/><circle cx="18" cy="-60" r="3" fill="#B0222B" class="bl" style="animation-delay:4.5s"/></g>`;
  cz += `<g transform="translate(11 -121)"><g class="cz-arm-up" style="animation-delay:5.2s"><path d="M-2,-3 C8,1 16,2 22,-1" fill="none" stroke="#2A0A1E" stroke-width="12.5" stroke-linecap="round"/><path d="M-2,-3 C8,1 16,2 22,-1" fill="none" stroke="#5A1742" stroke-width="10.5" stroke-linecap="round"/><path d="M20,-1 C24,-3 27,-6 29,-9" fill="none" stroke="#C99670" stroke-width="6" stroke-linecap="round"/><path d="M28,-9 C30,-12 33,-12 34,-10 L33,-7 C31,-7.5 30,-7 29.5,-5.5 Z" fill="#C99670" stroke="${OUT}" stroke-width=".6"/></g></g>`;
  cz += `<path class="cz-veil" d="M-12,-127 C-19,-150 -10,-178 6,-178 C23,-178 30,-156 25,-129 C14,-135 -1,-135 -12,-127 Z" fill="url(#${id}pp)" stroke="#D4AE55" stroke-width="2.2" style="animation-delay:5.4s"/></g></g>`;
  scene += `<g transform="translate(${f1(cx)} ${fy}) scale(${f1(Z * 1.1)})"><g class="cz-fall" style="animation-delay:6.1s;--tx:${tx}px">${cz}</g></g>`;
  const blows = [[-22, -120, 1.8], [30, -92, 2.95], [-30, -80, 3.3], [26, -110, 3.55], [-20, -100, 3.85], [34, -74, 4.1], [-34, -94, 4.35], [22, -86, 4.55], [-24, -70, 4.8]];
  blows.forEach(b => { const x = f1(cx + b[0] * Z), y = f1(fy + b[1] * Z); scene += `<g class="spark" style="animation-delay:${b[2]}s"><path d="M${x} ${y - 12} L${x + 3} ${y - 3} L${x + 12} ${y} L${x + 3} ${y + 3} L${x} ${y + 12} L${x - 3} ${y + 3} L${x - 12} ${y} L${x - 3} ${y - 3} Z" fill="#FFE7A8"/><circle cx="${x}" cy="${y}" r="3.2" fill="#FFFFFF"/></g>`; });
  const focusY = fy - 95, zs = 1.2;
  s += `<style>@keyframes ${id}cam{0%{transform:none}15%{transform:none}30%{transform:translate(${f1(W / 2 - zs * cx)}px,${f1(H * .52 - zs * focusY)}px) scale(${zs})}72%{transform:translate(${f1(W / 2 - zs * cx)}px,${f1(H * .52 - zs * focusY)}px) scale(${zs})}90%{transform:none}100%{transform:none}}</style>`;
  s += `<g style="animation:${id}cam 8.4s ease-in-out both">${scene}</g>`;
  s += `<rect x="0" y="0" width="${W}" height="${MOB ? 92 : 66}" fill="#12060A" opacity=".55"/>`;
  if (MOB) {
    s += `<text x="16" y="32" fill="#F1D99A" style="${CAP};font-size:${F(15)}px;font-weight:700;letter-spacing:.04em">Idi di marzo, 44 a.C.</text><text x="16" y="${f1(32 + F(16))}" fill="#C9B7A2" style="font-size:${F(10.5)}px">Curia di Pompeo</text>`;
    s += `<text x="${W - 16}" y="44" text-anchor="end" fill="#F1D99A" style="${CAP};font-size:${F(30)}px;font-weight:700" data-count="23" data-delay="1.8" data-dur="3100">0</text><text x="${W - 16}" y="${f1(44 + F(15))}" text-anchor="end" fill="#E8D6C2" style="font-size:${F(10.5)}px">colpi</text>`;
  } else {
    s += `<text x="26" y="34" fill="#F1D99A" style="${CAP};font-size:20px;font-weight:700;letter-spacing:.04em">Idi di marzo, 44 a.C.</text><text x="26" y="54" fill="#C9B7A2" style="font-size:12.5px">Curia di Pompeo, Campo Marzio · più di sessanta congiurati</text>`;
    s += `<text x="${W - 26}" y="46" text-anchor="end" fill="#F1D99A" style="${CAP};font-size:40px;font-weight:700" data-count="23" data-delay="1.8" data-dur="3100">0</text><text x="${W - 80}" y="42" text-anchor="end" fill="#E8D6C2" style="font-size:13px">colpi di pugnale</text>`;
  }
  const beats = [
    [0.2, 1.5, 'Tillio Cimbro lo afferra per la toga'],
    [1.5, 1.4, 'Casca colpisce per primo, da dietro'],
    [2.9, 1.2, 'Cesare gli trafigge il braccio con lo stilo'],
    [4.1, 1.2, 'Tra i congiurati c\'è anche Bruto'],
    [5.3, 1.1, 'Vedendolo, si copre il capo con la toga'],
    [6.4, 99, 'Cade ai piedi della statua di Pompeo']
  ];
  const bh = MOB ? 58 : 44;
  s += `<rect x="0" y="${H - bh}" width="${W}" height="${bh}" fill="#12060A" opacity=".72"/><rect x="0" y="${H - bh}" width="${W}" height="1.5" fill="#A87B2A" opacity=".8"/>`;
  beats.forEach((b, i) => { s += `<text class="beat${i === beats.length - 1 ? ' last' : ''}" x="${W / 2}" y="${f1(H - bh / 2 + F(6))}" text-anchor="middle" fill="#F1D99A" style="animation-delay:${b[0]}s;animation-duration:${b[1]}s;${CAP};font-size:${F(MOB ? 13.5 : 16)}px;font-weight:700;letter-spacing:.02em">${b[2]}</text>`; });
  return s;
}

/* ================= EPILOGO: AUGUSTO ================= */
function sceneAugustus() {
  const id = 'fgA' + (MOB ? 'm' : 'd');
  const sc = MOB ? .5 : .655, ix = MOB ? 8 : 52, iy = MOB ? 78 : 8, hx = f1(ix + 252 * sc), hy = f1(iy + 61 * sc);
  let s = `<defs><radialGradient id="${id}bg" cx=".32" cy=".45" r=".8"><stop offset="0" stop-color="#4A2A30"/><stop offset=".55" stop-color="#26121A"/><stop offset="1" stop-color="#12080C"/></radialGradient>
<radialGradient id="${id}mg" cx=".5" cy=".44" r=".62"><stop offset=".42" stop-color="#fff"/><stop offset=".78" stop-color="#777"/><stop offset="1" stop-color="#000"/></radialGradient><filter id="${id}warm" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.52 0.42 0.1 0 0.02  0.4 0.46 0.1 0 0  0.3 0.36 0.14 0 -0.01  0 0 0 1 0"/></filter><mask id="${id}mk" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#${id}mg)"/></mask>
<filter id="${id}sh"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="${id}shn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="${id}gd" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FBE7A6"/><stop offset=".55" stop-color="#D4AE55"/><stop offset="1" stop-color="#8C6420"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>`;
  const nc = MOB ? 3 : 5;
  for (let i = 0; i < nc; i++) { const x = f1(W * (i + .5) / nc); s += `<rect x="${x - 16}" y="0" width="32" height="${H}" fill="#3A1A22" opacity=".35"/>`; }
  s += `<ellipse cx="${hx}" cy="${f1(iy + 330 * sc)}" rx="${f1(220 * sc)}" ry="${f1(360 * sc)}" fill="#F6D08A" opacity=".10"/>`;
  s += `<style>@keyframes ${id}kb{from{transform:translate(${f1(hx * -0.6)}px,${f1(hy * -0.6)}px) scale(1.6)}to{transform:none}}</style>`;
  s += `<g style="animation:${id}kb 4.6s cubic-bezier(.3,.1,.2,1) both"><g class="pop" style="animation-duration:1.4s"><g filter="url(#${id}warm)"><use href="#fg-aug-img" transform="translate(${ix} ${iy}) scale(${sc})" mask="url(#${id}mk)"/></g></g></g>`;
  const txt = (x, y, t, d, st, a) => `<text class="pop" x="${f1(x)}" y="${f1(y)}" text-anchor="${a || 'start'}" style="animation-delay:${d}s;${st}">${t}</text>`;
  const CAPS = `${CAP};font-weight:700`;
  const leaf = (x, y, r, flip) => { let l = `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><g class="pop" style="animation-delay:1.2s">`; l += `<path d="M0,0 C18,-6 36,-8 54,-4" fill="none" stroke="#6E8F3A" stroke-width="1.6"/>`; for (let i = 0; i < 6; i++) { const px = 8 + i * 8, py = -2 - i * .6; l += `<ellipse cx="${px}" cy="${py - 4}" rx="5" ry="2" transform="rotate(-35 ${px} ${py - 4})" fill="#6E9A45"/><ellipse cx="${px + 3}" cy="${py + 3}" rx="5" ry="2" transform="rotate(30 ${px + 3} ${py + 3})" fill="#4E7A34"/>`; } return l + '</g></g>'; };
  const shield = (cx, cy, r, d, big) => {
    const lines = big ? ['CLVPEVM', 'VIRTVTIS', 'CLEMENTIAE', 'IVSTITIAE', 'PIETATIS'] : ['SENATVS', 'POPVLVSQVE ROMANVS', 'IMP CAESARI DIVI F', 'AVGVSTO COS VIII', 'DEDIT CLVPEVM', 'VIRTVTIS CLEMENTIAE', 'IVSTITIAE PIETATIS', 'ERGA DEOS PATRIAMQVE'];
    let g = `<g class="stamp" style="animation-delay:${d}s"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}gd)" stroke="#6B4A1E" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${f1(r * .9)}" fill="none" stroke="#8C6420" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${f1(r * .86)}" fill="none" stroke="#FBE7A6" stroke-opacity=".6" stroke-width=".8"/>`;
    const fs = f1(r * (big ? .15 : .105)), lh = f1(r * (big ? .215 : .158)), y0 = cy - lh * (big ? 1.75 : 3.3);
    lines.forEach((l, i) => { g += `<text x="${cx}" y="${f1(y0 + i * lh)}" text-anchor="middle" fill="#5A3A12" style="${CAP};font-weight:700;font-size:${fs}px;letter-spacing:.04em">${l}</text>`; });
    return g + '</g>';
  };
  if (!MOB) {
    const x0 = 380;
    s += txt(x0, 62, '16 gennaio 27 a.C.', .5, `${CAPS};font-size:14px;letter-spacing:.14em;fill:#D4AE55`);
    s += leaf(x0, 84, 1, false);
    s += txt(x0, 118, 'IMP · CAESAR · DIVI · F ·', 1.3, `${CAPS};font-size:25px;letter-spacing:.06em;fill:#F1D99A`);
    s += txt(x0, 152, 'AVGVSTVS', 1.6, `${CAPS};font-size:38px;letter-spacing:.14em;fill:#F6E3A6`);
    s += txt(x0, 190, 'Il Senato conferisce a Ottaviano il nome di Augusto.', 2.3, `font-size:14.5px;fill:#EFE3D0`);
    s += txt(x0, 212, 'Non sarà mai re né dittatore: sarà il princeps,', 3.0, `font-size:14.5px;fill:#EFE3D0`);
    s += txt(x0, 232, 'il primo dei cittadini.', 3.0, `font-size:14.5px;fill:#EFE3D0`);

  } else {
    const x0 = 218;
    s += txt(W / 2, 34, '16 gennaio 27 a.C.', .5, `${CAPS};font-size:${F(12)}px;letter-spacing:.14em;fill:#D4AE55`, 'middle');
    s += txt(x0, 118, 'IMP · CAESAR', 1.3, `${CAPS};font-size:${F(15)}px;fill:#F1D99A`) + txt(x0, 118 + F(20), 'DIVI · F ·', 1.4, `${CAPS};font-size:${F(15)}px;fill:#F1D99A`);
    s += txt(x0, 118 + F(52), 'AVGVSTVS', 1.6, `${CAPS};font-size:${F(24)}px;letter-spacing:.1em;fill:#F6E3A6`);
    s += leaf(x0, 118 + F(68), 1, false);
    s += `<rect class="pop" x="0" y="${H - 100}" width="${W}" height="100" fill="#12060A" opacity=".78" style="animation-delay:2.2s"/>`;
    s += txt(W / 2, H - 100 + F(20), 'Il Senato gli conferisce il nome di Augusto:', 2.3, `font-size:${F(12)}px;fill:#EFE3D0`, 'middle');
    s += txt(W / 2, H - 100 + F(38), 'sarà il princeps, il primo dei cittadini.', 3.0, `font-size:${F(12)}px;fill:#EFE3D0`, 'middle');
  }
  /* ---------- atto 2: lo scudo nella Curia ---------- */
  let c2 = `<rect width="${W}" height="${H}" fill="#B8B4AC"/>`;
  const wy = MOB ? 110 : 70, fl = MOB ? H - 110 : H - 70;
  c2 += `<rect x="0" y="${wy - 16}" width="${W}" height="16" fill="#D8CDB4"/><rect x="0" y="${wy - 4}" width="${W}" height="4" fill="#8C7A5A"/>`;
  const np = MOB ? 4 : 6;
  for (let i = 0; i < np; i++) { const pw = W / np, X = i * pw + 8, Y = wy + 10, Wd = pw - 16, Hh = fl - wy - 30; if (i % 2 === 0) c2 += `<rect x="${f1(X)}" y="${Y}" width="${f1(Wd)}" height="${f1(Hh)}" fill="#7A1F2B"/><rect x="${f1(X + 6)}" y="${Y + 6}" width="${f1(Wd - 12)}" height="${f1(Hh - 12)}" fill="#9E9A92"/><path d="M${f1(X + Wd / 2)} ${f1(Y + Hh * .25)} l${f1(Wd * .22)} ${f1(Hh * .25)} l${f1(-Wd * .22)} ${f1(Hh * .25)} l${f1(-Wd * .22)} ${f1(-Hh * .25)} Z" fill="#D6B066"/>`; else c2 += `<rect x="${f1(X)}" y="${Y}" width="${f1(Wd)}" height="${f1(Hh)}" fill="#8E8A82"/><rect x="${f1(X + 10)}" y="${Y + 14}" width="${f1(Wd - 20)}" height="${f1(Hh - 28)}" fill="#7A1F2B"/><rect x="${f1(X + 16)}" y="${Y + 20}" width="${f1(Wd - 32)}" height="${f1(Hh - 40)}" fill="none" stroke="#D6B066" stroke-width="2"/>`; }
  c2 += `<rect x="0" y="${fl}" width="${W}" height="${H - fl}" fill="#D6B066"/>`;
  for (let q = 0; q < 10; q++) c2 += `<circle cx="${f1((q + .5) * W / 10)}" cy="${f1(fl + 22)}" r="11" fill="#7A1F2B" stroke="#3E6150" stroke-width="3"/>`;
  c2 += `<path d="M${f1(W * .08)} 0 L${f1(W * .3)} 0 L${f1(W * .62)} ${H} L${f1(W * .34)} ${H} Z" fill="#FFF3D6" opacity=".16"/>`;
  const vx = MOB ? W * .77 : W * .79, vb = fl, vs = MOB ? .95 : 1.15;
  let vic = `<g transform="translate(${f1(vx)} ${f1(vb)}) scale(${vs})">`;
  vic += `<ellipse cx="4" cy="0" rx="46" ry="6" fill="#000" opacity=".22"/>`;
  vic += `<rect x="-30" y="-92" width="60" height="92" fill="#F2EBDD" stroke="#9C8E72"/><rect x="-30" y="-92" width="14" height="92" fill="#D8CDB4" opacity=".6"/><rect x="-35" y="-100" width="70" height="9" fill="#E6DCC6" stroke="#9C8E72"/><rect x="-35" y="-8" width="70" height="8" fill="#E6DCC6" stroke="#9C8E72"/>`;
  vic += `<circle cx="0" cy="-118" r="18" fill="url(#${id}gd)" stroke="#6B4A1E"/><path d="M-12 -126 C-6 -132 4 -133 10 -128" stroke="#FFF1C0" stroke-width="2" fill="none" opacity=".6"/>`;
  const wing = (sd) => { let w = `<g transform="translate(${sd * 5} -208) scale(${sd} 1)">`; [[-8, 58, 14], [8, 66, 15], [24, 70, 15], [40, 66, 14], [56, 54, 12]].forEach(([ang, len, wd], k) => { const a = (ang - 90) * Math.PI / 180, ex = Math.cos(a) * len + 8, ey = Math.sin(a) * len; w += `<path d="M2 4 C${f1(ex * .3 - wd * .5)} ${f1(ey * .5)} ${f1(ex - wd * .4)} ${f1(ey - 2)} ${f1(ex)} ${f1(ey)} C${f1(ex + wd * .4)} ${f1(ey + 4)} ${f1(ex * .4 + wd * .4)} ${f1(ey * .4)} 8 6 Z" fill="url(#${id}gd)" stroke="#6B4A1E" stroke-width=".8"/><path d="M5 5 C${f1(ex * .4)} ${f1(ey * .5)} ${f1(ex * .8)} ${f1(ey * .85)} ${f1(ex)} ${f1(ey)}" stroke="#8C6420" stroke-width=".7" fill="none"/>`; }); return w + `</g>`; };
  vic += wing(-1) + wing(1);
  vic += `<path d="M-13 -136 C-11 -150 -8 -170 -7 -190 C-6 -200 -4 -206 0 -208 C4 -206 6 -200 7 -190 C8 -170 11 -150 13 -136 C8 -132 -8 -132 -13 -136 Z" fill="url(#${id}gd)" stroke="#6B4A1E" stroke-width=".9"/>`;
  vic += `<path d="M-6 -140 C-5 -158 -4 -176 -3 -192 M2 -140 C2 -158 2 -176 1 -192 M8 -140 C7 -158 5 -176 4 -192" stroke="#8C6420" stroke-width=".6" fill="none" opacity=".8"/><path d="M-7 -186 C-2 -183 3 -183 7 -186" stroke="#8C6420" stroke-width="1" fill="none"/><path d="M-3 -150 C0 -162 1 -176 1 -190" stroke="#FFF1C0" stroke-width="1.6" fill="none" opacity=".45"/>`;
  vic += `<path d="M-4 -208 L4 -208 L3.4 -212 L-3.4 -212 Z" fill="url(#${id}gd)"/><ellipse cx="0" cy="-219" rx="6" ry="7.4" fill="url(#${id}gd)" stroke="#6B4A1E" stroke-width=".7"/><path d="M-5 -222 C-3 -228 4 -228 6 -222 C3 -225 -2 -225 -5 -222 Z" fill="#B8923E"/><circle cx="-4.6" cy="-219" r="2.2" fill="#B8923E"/>`;
  vic += `<path d="M5 -203 C12 -210 18 -220 22 -232" stroke="url(#${id}gd)" stroke-width="3.8" stroke-linecap="round" fill="none"/><circle cx="24" cy="-242" r="9" fill="none" stroke="#4E8A34" stroke-width="3.2"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => { const a = k / 10 * Math.PI * 2, x = 24 + Math.cos(a) * 9, y = -242 + Math.sin(a) * 9; return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="2.6" ry="1.2" transform="rotate(${f1(a * 180 / Math.PI + 90)} ${f1(x)} ${f1(y)})" fill="#6EAA48"/>`; }).join('')}`;
  vic += `<path d="M-5 -200 C-9 -190 -12 -178 -13 -168" stroke="url(#${id}gd)" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M-13 -164 C-15 -186 -18 -206 -17 -222" stroke="#5E8A3C" stroke-width="1.8" fill="none"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${f1(-15.4 - k * .4)} ${-176 - k * 9} l-6 -4 M${f1(-15.4 - k * .4)} ${-176 - k * 9} l5 -5" stroke="#6E9A45" stroke-width="1.3"/>`).join('')}`;
  vic += `</g>`;
  const ax = vx - (MOB ? 34 : 40), aS = MOB ? .95 : 1.15;
  let alt = `<g transform="translate(${f1(ax)} ${f1(vb)}) scale(${aS})"><ellipse cx="0" cy="0" rx="26" ry="4" fill="#000" opacity=".2"/><rect x="-18" y="-40" width="36" height="40" fill="#EFE6D4" stroke="#9C8E72"/><rect x="-21" y="-46" width="42" height="7" fill="#7A1F2B" stroke="#4A1018"/><rect x="-16" y="-49" width="32" height="3" fill="url(#${id}gd)"/><circle cx="0" cy="-66" r="22" fill="#FFB050" opacity=".25"/>${fireTongue(0, -49, 20, 7, 91)}</g>`;
  [ax - (MOB ? 34 : 44), vx + (MOB ? 40 : 50)].forEach(x => { alt += `<g transform="translate(${f1(x)} ${f1(vb)}) scale(${aS})"><path d="M-12 0 L10 -20 M12 0 L-10 -20" stroke="url(#${id}gd)" stroke-width="3"/><rect x="-14" y="-26" width="28" height="7" rx="2" fill="#9E2A34" stroke="#5A1018"/></g>`; });
  c2 += vic + alt;
  c2 += `<rect x="${f1(vx - (MOB ? 60 : 70))}" y="${f1(vb + 4)}" width="${MOB ? 120 : 140}" height="18" rx="9" fill="#FBF6EA" opacity=".9"/><text x="${f1(vx)}" y="${f1(vb + 17)}" text-anchor="middle" fill="#3A2A14" style="font-size:${F(MOB ? 9.5 : 10.5)}px;font-style:italic">la Vittoria sul suo altare</text>`;
  const sxC = MOB ? W * .36 : W * .44, syC = MOB ? 250 : 196, sr = MOB ? 96 : 104;
  const clip2 = (cx, cy, r, big) => { const lines = big ? ['CLVPEVM', 'VIRTVTIS', 'CLEMENTIAE', 'IVSTITIAE', 'PIETATIS'] : ['SENATVS', 'POPVLVSQVE ROMANVS', 'IMP CAESARI DIVI F', 'AVGVSTO COS VIII', 'DEDIT CLVPEVM', 'VIRTVTIS CLEMENTIAE', 'IVSTITIAE PIETATIS', 'ERGA DEOS PATRIAMQVE'];
    let g = `<g class="stamp" style="animation-delay:5.4s"><circle cx="${f1(cx + 8)}" cy="${f1(cy + 10)}" r="${r}" fill="#000" opacity=".3" filter="url(#${id}sh)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}gd)" stroke="#5A3A12" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${f1(r * .94)}" fill="none" stroke="#8C6420" stroke-width="${f1(r * .05)}"/>`;
    for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; g += `<circle cx="${f1(cx + Math.cos(a) * r * .97)}" cy="${f1(cy + Math.sin(a) * r * .97)}" r="${f1(r * .018)}" fill="#FBE7A6"/>`; }
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2, rr = r * .86, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; g += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * .05)}" ry="${f1(r * .022)}" transform="rotate(${f1(a * 180 / Math.PI + 60)} ${f1(x)} ${f1(y)})" fill="#A8843A" stroke="#6B4A1E" stroke-width=".4"/>`; }
    g += `<circle cx="${cx}" cy="${cy}" r="${f1(r * .78)}" fill="none" stroke="#6B4A1E" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${f1(r * .76)}" fill="none" stroke="#FBE7A6" stroke-width=".8" opacity=".7"/>`;
    const fs = f1(r * (big ? .135 : .092)), lh = f1(r * (big ? .19 : .136)), y0 = cy - lh * (big ? 1.75 : 3.3);
    lines.forEach((l, k) => { g += `<text x="${cx}" y="${f1(y0 + k * lh + .8)}" text-anchor="middle" fill="#FFF1C0" opacity=".55" style="${CAP};font-weight:700;font-size:${fs}px;letter-spacing:.04em">${l}</text><text x="${cx}" y="${f1(y0 + k * lh)}" text-anchor="middle" fill="#4A2E0E" style="${CAP};font-weight:700;font-size:${fs}px;letter-spacing:.04em">${l}</text>`; });
    g += `<ellipse cx="${f1(cx - r * .35)}" cy="${f1(cy - r * .45)}" rx="${f1(r * .35)}" ry="${f1(r * .16)}" transform="rotate(-30 ${f1(cx - r * .35)} ${f1(cy - r * .45)})" fill="#FFF8E0" opacity=".35"/>`;
    g += `<clipPath id="${id}cc"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id}cc)"><rect class="tshine" x="${f1(cx - r * 2.4)}" y="${f1(cy - r)}" width="${f1(r * .5)}" height="${f1(r * 2)}" fill="url(#${id}shn)" transform="rotate(20 ${cx} ${cy})" style="animation-delay:6.4s"/></g>`;
    return g + `</g>`; };
  c2 += `<path d="M${f1(sxC - 12)} ${f1(syC - sr - 24)} L${f1(sxC)} ${f1(syC - sr - 4)} L${f1(sxC + 12)} ${f1(syC - sr - 24)}" stroke="#6B4A1E" stroke-width="1.6" fill="none"/><circle cx="${f1(sxC)}" cy="${f1(syC - sr - 26)}" r="3" fill="#8C6420"/><circle cx="${f1(sxC)}" cy="${syC}" r="${sr + 34}" fill="#FFE8B0" opacity=".22"/>` + clip2(f1(sxC), syC, sr, MOB);
  { const lw = MOB ? 250 : 290, ly = syC + sr + (MOB ? 14 : 16); c2 += `<g class="pop" style="animation-delay:6.2s"><rect x="${f1(sxC - lw / 2)}" y="${f1(ly)}" width="${lw}" height="${F(MOB ? 22 : 24)}" rx="${F(MOB ? 11 : 12)}" fill="#12060A" opacity=".82"/><text x="${f1(sxC)}" y="${f1(ly + F(MOB ? 15.5 : 17))}" text-anchor="middle" fill="#F1D99A" style="${CAPS};font-size:${F(MOB ? 12 : 14)}px">il clipeus virtutis nella Curia</text></g>`; }
  c2 += `<rect x="0" y="${H - 44}" width="${W}" height="44" fill="#12060A" opacity=".82"/>`;
  c2 += `<text class="beat" x="${W / 2}" y="${f1(H - (MOB ? 16 : 17))}" text-anchor="middle" fill="#F1D99A" style="animation-delay:5.0s;animation-duration:3s;${CAPS};font-size:${F(MOB ? 11 : 14)}px">${MOB ? 'Uno scudo d\'oro nella Curia (Res gestae 34)' : 'Il Senato gli dedica uno scudo d\'oro, appeso nella Curia (Res gestae 34)'}</text>`;
  c2 += `<text class="beat last" x="${W / 2}" y="${f1(H - (MOB ? 16 : 17))}" text-anchor="middle" fill="#F1D99A" style="animation-delay:8.0s;${CAPS};font-size:${F(MOB ? 12 : 16)}px">Finisce la Repubblica, comincia il principato</text>`;
  const i0 = s.indexOf('</defs>') + 7;
  s = s.slice(0, i0) + `<g class="act" style="animation-delay:0s;animation-duration:5.4s">` + s.slice(i0) + `</g><g class="act last" style="animation-delay:5.0s">${c2}</g>`;
  return s;
}

/* ================= FASI ================= */
function buildVizOld() {
  CAMN = 0;
  const V = [];
  V[0] = { svg: chartVote(), cap: 'Il conteggio tramandato da Appiano e Plutarco: una maggioranza schiacciante, ignorata dal console.', leg: [] };
  V[1] = { svg: chartCaesar(), cap: 'Dittature e consolati di Cesare tra il 49 e il 44 a.C. Date e durate sono indicative.', leg: [['#7A1F2B', 'Dittatura'], ['#A87B2A', 'Consolato']] };
  V[2] = { svg: sceneIdes(), cap: 'Ricostruzione simbolica basata su Svetonio (Cesare 82) e Plutarco (Cesare 66). Cesare porta la corona d\'alloro, di foglie verdi, e la veste purpurea da trionfatore concesse dal Senato; i senatori la toga bianca sulla tunica con la striscia di porpora. La statua di Pompeo segue il cosiddetto Pompeo Spada (Roma, Palazzo Spada): nudo eroico con mantello e globo, tradizionalmente identificato con quella della Curia, attribuzione discussa. Dei 23 colpi, secondo il medico Antistio, uno solo fu mortale.', leg: [] };
  V[3] = { svg: chartBalance(), cap: 'Amnistia per gli uccisori, validità di tutti gli atti del dittatore ucciso: un equilibrio che non poteva durare.', leg: [] };
  {
    const S = newScene('med');
    RomanArea(S, ['CIS', 'ITS', 'NARB', 'COM', 'HISC', 'HISU', 'SIC', 'SAR', 'AFV', 'AFN', 'CYR', 'CRE', 'ILL', 'MAC', 'ASI', 'SYR'], .1);
    MEDPROV(S, true); EGB(S); RUB(S); NES(S); ProvBorders(S, 44); Sea(S, [18.2, 35.0], 'MARE INTERNVM', { size: 13 });
    City(S, [12.48, 41.89], 'Roma|Antonio console', .1, { col: C.ant, tcol: C.ant, side: 'W' });
    City(S, [19.47, 40.72], 'Apollonia', .2, { side: 'E' }); City(S, [17.94, 40.63], 'Brindisi', .2, { side: 'S' });
    Arrow(S, [[19.47, 40.72], [17.94, 40.63], [15.2, 41.2], [12.8, 41.8]], C.ott, .4, { label: 'Ottaviano, erede di Cesare', lp: [15.6, 42.6] });
    Arrow(S, [[12.6, 41.6], [15.15, 40.16], [19.2, 37.6], [23.1, 36.5], [23.6, 37.8]], C.rep, 1.4, { label: 'Bruto verso Atene', lp: [20.3, 36.8] });
    Arrow(S, [[12.7, 41.5], [15.7, 38.1], [22.5, 35.2], [29, 35.4], [35.6, 35.6]], C.rep, 2.2, { label: 'Cassio verso la Siria', lp: [28.5, 34.6] });
    City(S, [23.73, 37.98], 'Atene', 2.8, { side: 'E' }); City(S, [35.78, 35.52], '', 3.4, {});
    S.cam = [[0, 18.6, 40.9, 1.9], [.4, 18.6, 40.9, 1.9], [1.9, 13.8, 41.6, 1.9], [2.6, 17.5, 39.4, 1.4], [3.6, 25, 37.2, 1.15], [4.4, null, null, 1]];
    V[4] = { svg: render(S), cap: 'Primavera–autunno 44 a.C. Ottaviano sbarca in Puglia e raggiunge Roma, mentre Bruto (da Velia, in agosto) e Cassio lasciano l\'Italia per le province d\'Oriente.', leg: [[C.ott, 'Ottaviano'], [C.rep, 'Cesaricidi'], [C.ant, 'Antonio']] };
  }
  const itaBase = S => { ProvBorders(S, 43); Prov(S, [13.7, 42.2], 'ITALIA'); Prov(S, [10.5, 45.65], 'GALLIA|Cisalpina'); Prov(S, [6.8, 44.85], 'GALLIA|Narbonense'); RUB(S); VAR(S); Sea(S, [10.4, 42.5], 'Mar Tirreno', { size: 13 }); Sea(S, [14.3, 43.5], 'Adriatico', { size: 13 }); };
  {
    const S = newScene('ita'); Area(S, ['ITS'], C.sen, .1); Area(S, ['CIS'], C.rep, .1); Area(S, ['NARB'], C.lep, .1); itaBase(S);
    City(S, [12.48, 41.89], 'Roma', 0, { side: 'W' }); City(S, [11.34, 44.49], 'Bologna', 0, { side: 'NE' }); City(S, [11.71, 44.35], 'Imola', .1, { side: 'E' });
    Ring(S, [10.93, 44.65], C.ant, .2); Free(S, [10.2, 45.05], 'Decimo Bruto assediato', C.rep, .3, { pri: 1, max: 60 });
    Arrow(S, [[12.48, 41.89], [12.9, 43.3], [11.9, 44.1], [11.34, 44.49], [11.05, 44.59]], C.sen, .7, { label: 'Pansa da Roma', lp: [13.4, 42.9] });
    Arrow(S, [[11.71, 44.35], [11.3, 44.3], [11.0, 44.5]], C.ott, 1.3, { bend: -.3, label: 'Irzio e Ottaviano', lp: [11.9, 43.95] });
    Battle(S, [11.07, 44.58], 'Forum Gallorum, 14 aprile|Modena, 21 aprile', 2.2, { side: 'S' });
    Arrow(S, [[10.8, 44.6], [9.3, 44.5], [8.44, 44.27], [7.6, 43.8], [6.8, 43.45]], C.ant, 3.3, { label: 'Antonio ripiega oltre le Alpi', lp: [8.4, 44.75] });
    City(S, [6.74, 43.43], 'Forum Iulii|Lepido si unisce ad Antonio', 4.6, { col: C.lep, tcol: C.lep, side: 'S' });
    S.cam = [[0, 12.6, 42.4, 1.7], [.7, 12.6, 42.4, 1.7], [2.2, 11.2, 44.4, 1.9], [3.1, 11.0, 44.6, 1.9], [4.7, 8.1, 44.0, 1.6], [5.5, null, null, 1]];
    V[5] = { svg: render(S), cap: 'Aprile–maggio 43 a.C. Le battaglie di Forum Gallorum e Modena liberano Decimo Bruto, ma entrambi i consoli muoiono. Antonio passa in Gallia e ottiene l\'appoggio di Lepido.', leg: [[C.sen, 'Consoli del Senato'], [C.ott, 'Ottaviano'], [C.ant, 'Antonio'], [C.rep, 'Decimo Bruto'], [C.lep, 'Lepido']] };
  }
  {
    const S = newScene('ita'); itaBase(S);
    Badge(S, 'Le proscrizioni|circa 300 senatori e 2.000 cavalieri (Appiano)', 4.4, '#7A1F2B');
    City(S, [12.48, 41.89], 'Roma', 0, { side: 'W' });
    Arrow(S, [[11.0, 44.6], [11.6, 44.2], [12.6, 43.4], [12.7, 42.6], [12.5, 42.0]], C.ott, .3, { label: MOB ? 'Agosto: Ottaviano|marcia su Roma' : 'Agosto: Ottaviano marcia su Roma|e diventa console a 19 anni', lp: MOB ? [10.3, 42.4] : [13.6, 42.9] });
    Arrow(S, [[12.4, 42.0], [11.9, 43.0], [11.4, 44.3]], C.ott, 1.9, { bend: .25 });
    Arrow(S, [[6.9, 43.5], [8.4, 44.3], [10.0, 44.6], [11.2, 44.52]], C.ant, 2.1, { label: 'Antonio e Lepido dalla Gallia', lp: [8.3, 45.0] });
    Arrow(S, [[7.1, 43.25], [8.6, 44.05], [10.2, 44.35], [11.22, 44.45]], C.lep, 2.3, {});
    const b = pt(S.m, [11.34, 44.49]), z = MOB ? 1.25 : 1;
    S.marks += `<g class="pop" style="animation-delay:3.6s"><circle cx="${b[0]}" cy="${b[1]}" r="${13 * z}" fill="#7A1F2B" stroke="#F1D99A" stroke-width="2"/><text x="${b[0]}" y="${f1(b[1] + 5 * z)}" text-anchor="middle" fill="#F1D99A" style="font-family:'Cinzel',Georgia,serif;font-size:${f1(13 * z)}px;font-weight:700">III</text></g>`;
    S.obs.push([b[0], b[1], 16 * z]); S.labels.push({ t: 'Presso Bononia|nasce il triumvirato', col: '#7A1F2B', d: 3.8, pri: 1, type: 'pt', at: b, rad: 16 * z, pref: 'NE', size: 13 });
    S.cam = [[0, 11.2, 44.3, 1.6], [.3, 11.2, 44.3, 1.6], [1.8, 12.5, 42.3, 1.6], [2.5, 10.6, 43.7, 1.3], [3.7, 10.4, 44.3, 1.4], [4.5, null, null, 1]];
    V[6] = { svg: render(S), cap: 'Agosto–novembre 43 a.C. Ottaviano prende Roma con le legioni, poi si accorda con Antonio e Lepido su un isolotto fluviale presso Bononia. La lex Titia del 27 novembre dà forma legale al triumvirato.', leg: [[C.ott, 'Ottaviano'], [C.ant, 'Antonio'], [C.lep, 'Lepido']] };
  }
  {
    const S = newScene('gre');
    Area(S, ['MAC', 'ASI'], C.rep, .1); Area(S, ['ITS', 'ILL'], C.ant, .1);
    Prov(S, [22.4, 41.9], 'MACEDONIA'); Prov(S, [25.6, 41.8], 'THRACIA|regno cliente'); Prov(S, [26.9, 38.9], 'ASIA'); NES(S); ProvBorders(S, 42);
    Sea(S, [24.9, 39.2], 'Egeo', { size: 14 }); Sea(S, [18.9, 38.4], 'Ionio', { size: 14 });
    Line(S, [[19.45, 41.32], [20.8, 41.12], [22.05, 40.8], [22.94, 40.64], [23.85, 40.82], [24.29, 41.01]], 0, { col: '#8C7A5A', dash: '2 5', w: 2, name: 'Via Egnatia', lp: [21.2, 41.45] });
    City(S, [17.94, 40.63], 'Brindisi', 0, { side: 'S' }); City(S, [19.45, 41.32], 'Durazzo', 0, { side: 'N' }); City(S, [22.94, 40.64], 'Tessalonica', .1, { side: 'S' });
    Arrow(S, [[17.94, 40.63], [18.8, 41.0], [19.45, 41.32], [20.8, 41.12], [22.05, 40.8], [22.94, 40.64], [23.85, 40.82], [24.15, 40.98]], C.ant, .4, { label: 'Antonio e Ottaviano', lp: [20.9, 40.4] });
    Arrow(S, [[27.1, 39.5], [26.4, 40.2], [25.6, 40.75], [24.45, 41.02]], C.rep, 1.5, { label: 'Bruto e Cassio|dall\'Asia', lp: [26.2, 39.6] });
    City(S, [24.40, 40.94], 'Neapolis', 2.4, { col: C.rep, side: 'SE', size: 11.5 });
    Battle(S, [24.29, 41.01], 'Filippi|3 e 23 ottobre 42', 2.8, { side: 'N' });
    S.cam = [[0, 18.7, 40.9, 1.8], [.4, 18.7, 40.9, 1.8], [1.9, 23.4, 40.9, 1.8], [3.0, 24.6, 40.7, 1.6], [3.9, null, null, 1]];
    V[7] = { svg: render(S), cap: 'Autunno 42 a.C. I triumviri attraversano l\'Adriatico e marciano lungo la via Egnatia; i cesaricidi arrivano dall\'Asia passando l\'Ellesponto. A Filippi si combattono due battaglie a tre settimane di distanza.', leg: [[C.ant, 'Triumviri'], [C.rep, 'Cesaricidi']] };
  }
  {
    const S = newScene('med');
    EGB(S); ProvBorders(S, 40); Prov(S, [30.3, 30.4], 'AEGYPTVS|regno tolemaico');
    Area(S, ['CIS', 'ITS', 'NARB', 'COM', 'HISC', 'HISU', 'ILL'], C.ott, .2, { op: .24 }); Area(S, ['MAC', 'ASI', 'SYR', 'CYR', 'CRE'], C.ant, .4, { op: .24 }); Area(S, ['AFV', 'AFN'], C.lep, .6, { op: .26 }); Area(S, ['SIC', 'SAR'], C.sex, .8, { op: .3 });
    Free(S, [MOB ? 11.2 : 6.8, 45.3], 'Ottaviano|Occidente', '#8A6208', 1.0, { size: 14, max: 50 }); Free(S, [31.5, 39.4], 'Antonio|Oriente', C.ant, 1.2, { size: 14, max: 50 });
    Free(S, [MOB ? 11.6 : 10.2, 32.8], 'Lepido|Africa', C.lep, 1.4, { size: 14, max: 50 }); Free(S, [13.6, 36.4], 'Sesto Pompeo|Sicilia e mari', '#2F6A9E', 1.6, { size: 12.5, max: 50 });
    Line(S, [[19.51, 46.9], [19.51, 36.0]], 1.8, { col: C.ink, dash: '6 5', w: 2 });
    City(S, [19.51, 42.07], 'Scodra|confine fissato a Brindisi', 2.6, { side: 'E' });
    Battle(S, [12.39, 43.11], 'Perugia|inverno 41–40', .3, { side: 'N', size: 11.5 });
    City(S, [17.94, 40.63], 'Brindisi', .4, { side: 'S', size: 11.5 });
    S.cam = [[0, 12.6, 42.8, 1.7], [.7, 12.6, 42.8, 1.7], [1.6, 17.2, 41.5, 1.5], [2.9, 19.5, 41.5, 1.35], [3.7, null, null, 1]];
    V[8] = { svg: render(S), cap: 'Ottobre 40 a.C. Dopo la guerra di Perugia, la pace di Brindisi divide il mondo romano: il confine tra Ottaviano e Antonio passa per Scodra, in Illiria. Le zone colorate sono indicative.', leg: [[C.ott, 'Ottaviano'], [C.ant, 'Antonio'], [C.lep, 'Lepido'], [C.sex, 'Sesto Pompeo']] };
  }
  {
    const S = newScene('sic');
    ProvBorders(S, 36); Area(S, ['ITS'], C.ott, .1); Area(S, ['SIC'], C.sex, 4.2, { cls: 'fadeout', dur: 1.2, op: .28 }); Area(S, ['SIC'], C.ott, 4.6, { op: .24 }); Prov(S, [14.0, 37.5], 'SICILIA', { size: 13 }); Prov(S, [16.15, 38.75], 'ITALIA'); Sea(S, [13.4, 38.7], 'Mar Tirreno', { size: 13 }); Sea(S, [15.9, 37.0], 'Ionio', { size: 13 });
    City(S, [14.96, 38.40], 'Vulcano|base di Agrippa', 0, { col: C.ott, side: 'NW', size: 11.5 }); City(S, [15.55, 38.19], 'Messina', 0, { col: C.sex, tcol: '#2F6A9E', side: 'E' });
    Battle(S, [15.19, 38.22], 'Milazzo|agosto', .4, { side: 'SW', size: 11.5, z: MOB ? .95 : 1.05, nopulse: 1 }); Battle(S, [15.29, 37.85], 'Tauromenio|Ottaviano sconfitto', 1.0, { side: 'W', size: 11.5, z: MOB ? .95 : 1.05, nopulse: 1 });
    Arrow(S, [[12.25, 36.62], [12.35, 37.2], [12.44, 37.76]], C.lep, 1.5, { label: 'Lepido dall\'Africa', lp: [12.9, 37.1] });
    City(S, [12.44, 37.80], 'Lilibeo', 2.6, { col: C.lep, side: 'N' });
    Arrow(S, [[14.98, 38.42], [15.25, 38.4], [15.42, 38.31]], C.ott, 2.4, { bend: .2 });
    Battle(S, [15.47, 38.27], 'Nauloco|3 settembre 36', 3.2, { side: 'N', size: 12.5, z: MOB ? .95 : 1.05, nopulse: 1 });
    Arrow(S, [[15.62, 38.1], [15.85, 37.8], [16.25, 37.6]], C.sex, 3.9, { label: 'Sesto fugge|verso l\'Oriente', lp: [15.95, 37.35] });
    S.cam = [[0, 15.2, 38.1, 1.6], [1.4, 15.2, 38.1, 1.6], [1.9, 12.9, 37.4, 1.6], [2.9, 12.9, 37.4, 1.6], [3.4, 15.3, 38.1, 1.7], [4.9, 15.5, 38.0, 1.6], [5.7, null, null, 1]];
    V[9] = { svg: render(S), cap: 'Estate 36 a.C. Agrippa vince a Milazzo, Ottaviano viene battuto presso Tauromenio, poi la flotta di Sesto è distrutta a Nauloco. Lepido, sbarcato a Lilibeo, perde le sue legioni che passano a Ottaviano.', leg: [[C.ott, 'Ottaviano e Agrippa'], [C.sex, 'Sesto Pompeo'], [C.lep, 'Lepido']] };
  }
  {
    const S = newScene('med');
    Area(S, ['CIS', 'ITS', 'NARB', 'COM', 'HISC', 'HISU', 'SIC', 'SAR', 'AFV', 'AFN', 'ILL'], C.ott, .1, { op: .22 }); Area(S, ['MAC', 'ASI', 'SYR', 'CYR', 'CRE'], C.ant, .1, { op: .22 }); Area(S, ['EGY'], C.ant, .1, { op: .1 });
    MEDPROV(S, false); EGB(S); NES(S); ProvBorders(S, 32); Sea(S, [18.2, 35.0], 'MARE INTERNVM', { size: 13 });
    City(S, [12.48, 41.89], 'Roma|guerra dichiarata a Cleopatra', 0, { col: C.ott, tcol: '#8A6208', side: 'W' });
    Arrow(S, [[12.6, 41.8], [15.2, 41.3], [17.94, 40.63], [20.6, 39.7], [24.3, 39.2], [27.0, 38.2]], C.ant, .3, { label: 'I consoli e circa 300 senatori|raggiungono Antonio', lp: [20.0, 42.8] });
    City(S, [27.34, 37.94], 'Efeso|Antonio e Cleopatra', 1.8, { col: C.ant, tcol: C.ant, side: 'E' });
    Arrow(S, [[27.2, 37.7], [25.8, 37.3], [23.8, 37.9], [21.9, 38.2]], C.ant, 2.4, { bend: .1, w: 2.4 });
    City(S, [21.73, 38.25], 'Patrasso|inverno 32–31', 3.6, { col: C.ant, tcol: C.ant, side: 'SW', size: 11.5 });
    S.cam = [[0, 13.2, 41.6, 1.8], [.3, 13.2, 41.6, 1.8], [1.8, 25.5, 38.6, 1.8], [2.4, 25.5, 38.2, 1.7], [3.9, 22.5, 38.2, 1.6], [4.6, null, null, 1]];
    V[10] = { svg: render(S), cap: '32 a.C. Parte del Senato lascia Roma per raggiungere Antonio in Oriente (il numero di circa 300 è una deduzione). Antonio e Cleopatra si spostano poi in Grecia e svernano a Patrasso.', leg: [[C.ant, 'Antonio e i suoi senatori'], [C.ott, 'Ottaviano']] };
  }
  {
    const S = newScene('act');
    ProvBorders(S, 31); Area(S, ['ACTN'], C.ott, .1, { op: .22 }); Area(S, ['ACTS'], C.ant, .1, { op: .22 }); Prov(S, [21.0, 39.12], 'EPIRO'); Prov(S, [21.05, 38.8], 'ACARNANIA'); Sea(S, [20.45, 38.8], 'Mar Ionio', { size: 14 }); Sea(S, [21.05, 38.99], 'Golfo di Ambracia', { size: 13 });
    City(S, [20.73, 39.03], 'Campo di Ottaviano', 0, { col: C.ott, tcol: '#8A6208', side: 'E' });
    City(S, [20.775, 38.935], 'Azio|campo di Antonio', .1, { col: C.ant, tcol: C.ant, side: 'SE' });
    City(S, [20.705, 38.83], 'Leucade', .2, { side: 'E', size: 11.5 });
    Ships(S, [20.83, 38.965], 5, C.ant, .5, { dx: 7, dy: 1.5 });
    const sp = pt(S.m, [20.64, 38.915]); let sh = `<g class="sail" style="animation-delay:1.4s">`; for (let i = 0; i < 7; i++) { const z = MOB ? 1.15 : 1, x = sp[0], y = f1(sp[1] + 9 * i * z); sh += `<path d="M${x - 7 * z} ${y} Q${x} ${y + 4 * z} ${x + 7 * z} ${y} L${x + 5 * z} ${y - 2.5 * z} L${x - 5 * z} ${y - 2.5 * z} Z" fill="${C.ant}" stroke="#FBF6EA" stroke-width=".8"/>`; S.obs.push([x, y, 8 * z]); } S.marks += sh + '</g>';
    Ships(S, [20.55, 38.905], 8, C.ott, 1.0, { dx: 0, dy: 9 });
    Free(S, [20.53, 39.03], 'Flotta di Agrippa', '#8A6208', 1.6, { size: 12, max: 60 });
    Battle(S, [20.6, 38.94], '2 settembre 31', 2.4, { side: 'N' });
    Arrow(S, [[20.63, 38.88], [20.6, 38.81], [20.55, 38.74]], C.ant, 3.2, { w: 2.6, bend: .15, label: 'Cleopatra, poi Antonio,|rompono la linea verso sud', lp: [20.8, 38.76] });
    S.cam = [[0, 20.72, 38.95, 1.4], [1.2, 20.72, 38.95, 1.4], [3.2, 20.62, 38.9, 1.3], [4.6, null, null, 1]];
    V[11] = { svg: render(S), cap: '2 settembre 31 a.C. La flotta di Antonio esce dal golfo di Ambracia contro quella di Agrippa; la squadra di Cleopatra forza il passaggio verso sud e Antonio la segue in Egitto. Posizioni delle flotte schematiche.', leg: [[C.ant, 'Antonio e Cleopatra'], [C.ott, 'Ottaviano e Agrippa']] };
  }
  {
    const S = newScene('egy');
    Area(S, ['SYR', 'CYR'], C.ott, .1, { op: .22 }); Area(S, ['JUD'], C.ott, .1, { op: .1 }); EGB(S); ProvBorders(S, 30); Prov(S, [30.8, 30.2], 'AEGYPTVS|regno di Cleopatra'); Prov(S, [36.2, 34.9], 'SYRIA'); Prov(S, [35.1, 31.5], MOB ? 'IVDAEA|con Ottaviano' : 'IVDAEA|Erode, alleato di Ottaviano'); if (!MOB) Prov(S, [25.8, 30.3], 'CYRENAICA');
    Sea(S, [30.6, 33.7], 'MARE INTERNVM', { size: 13 });
    Arrow(S, [[36.0, 35.3], [35.8, 33.6], [35.1, 32.1], [33.9, 31.1], [32.57, 31.0], [30.3, 31.2]], C.ott, .3, { label: 'Ottaviano dalla Siria', lp: [34.4, 33.3] });
    City(S, [32.57, 31.04], 'Pelusio', 1.6, { col: C.ott, side: 'S' });
    Arrow(S, [[27.24, 31.35], [28.4, 31.05], [29.65, 31.12]], C.ott, 1.2, { label: 'Cornelio Gallo|da Paretonio', lp: [28.4, 30.45] });
    City(S, [27.24, 31.35], 'Paretonio', .9, { col: C.ott, side: 'N' });
    Battle(S, [29.92, 31.20], 'Alessandria|1 agosto 30', 2.6, { side: 'N' });
    const EP = REG.EGY.map(l => pt(S.m, l));
    S.under += `<g clip-path="url(#fg-land-egy${SUF})"><path class="conq" d="M${EP.map(p => p.join(' ')).join(' L')} Z" fill="#F2C318" fill-opacity=".42" stroke="#C99A0A" stroke-width="2.4" stroke-dasharray="7 4" style="animation-delay:8.6s"/></g>`;
    const cid = 'fgEgc' + (MOB ? 'm' : 'd');
    S.hud += `<defs><clipPath id="${cid}" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath></defs>`;
    const card = (x, y, key, name, line, col, d) => { const r = MOB ? 22 : 24, w = MOB ? 196 : 240, h = r * 2 + 12; return `<g class="pop" style="animation-delay:${d}s"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#FBF6EA" stroke="${col}" stroke-width="1.3"/>` + faceM(cid, key, x + r + 8, y + h / 2, r, col, 0).replace('class="pop" style="animation-delay:0s"', '') + `<text x="${x + 2 * r + 20}" y="${f1(y + h / 2 - 3)}" fill="${col}" style="${CAP};font-size:${F(MOB ? 11.5 : 13.5)}px;font-weight:700">${name}</text><text x="${x + 2 * r + 20}" y="${f1(y + h / 2 + F(13))}" fill="${C.ink}" style="font-size:${F(MOB ? 10 : 12)}px">${line}</text></g>`; };
    const cw = MOB ? 196 : 240, cx0 = W - cw - (MOB ? 8 : 14);
    S.hud += card(cx0, MOB ? 10 : 12, 'antonio', 'Antonio', MOB ? '† 1 agosto 30, suicida' : '† 1 agosto 30, si trafigge', C.ant, 4.0);
    S.hud += card(cx0, MOB ? 72 : 80, 'cleopatra', 'Cleopatra', MOB ? '† agosto 30, suicida' : '† agosto 30, si toglie la vita', '#7A1F2B', 6.0);
    S.rects.push([cx0 - 4, 0, W, MOB ? 136 : 146]);
    const al = pt(S.m, [29.92, 31.20]);
    const aid = 'fgAsp' + (MOB ? 'm' : 'd');
    S.obs.push([al[0] + (MOB ? 24 : 27), al[1] + (MOB ? 8 : 10), MOB ? 26 : 22]);
    S.marks += `<defs><linearGradient id="${aid}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8DB35E"/><stop offset=".5" stop-color="#3F7A3A"/><stop offset="1" stop-color="#23502A"/></linearGradient><linearGradient id="${aid}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2E6234"/><stop offset=".5" stop-color="#6E9E4E"/><stop offset="1" stop-color="#2E6234"/></linearGradient></defs>`
      + `<g class="pop" style="animation-delay:6.2s"><g transform="translate(${f1(al[0] + (MOB ? 20 : 24))} ${f1(al[1] + (MOB ? 22 : 24))}) scale(${MOB ? .62 : .58})"><ellipse cx="0" cy="3" rx="22" ry="5" fill="#000" opacity=".18"/>`
      + `<g class="asp-sway"><path d="M-18,1 C-26,-4 -20,-12 -8,-11 C6,-10 15,-7 14,-1 C13,5 0,7 -12,4" fill="none" stroke="#1E3A1E" stroke-width="8.5" stroke-linecap="round"/><path d="M-18,1 C-26,-4 -20,-12 -8,-11 C6,-10 15,-7 14,-1 C13,5 0,7 -12,4" fill="none" stroke="url(#${aid}b)" stroke-width="6.5" stroke-linecap="round"/><path d="M-18,1 C-26,-4 -20,-12 -8,-11 C6,-10 15,-7 14,-1 C13,5 0,7 -12,4" fill="none" stroke="#D8C27A" stroke-width="1.4" stroke-dasharray="2 2.6" opacity=".8"/>`
      + `<path d="M12,-4 C19,-12 16,-22 9,-28" fill="none" stroke="#1E3A1E" stroke-width="8" stroke-linecap="round"/><path d="M12,-4 C19,-12 16,-22 9,-28" fill="none" stroke="url(#${aid}b)" stroke-width="6" stroke-linecap="round"/><path d="M13,-6 C18,-13 15,-21 10,-26" fill="none" stroke="#E6D59A" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>`
      + `<path d="M9,-27 C-2,-29 -5,-45 3,-51 C8,-55 17,-52 18,-44 C19,-37 15,-30 9,-27 Z" fill="url(#${aid}h)" stroke="#C99A3A" stroke-width="1.6"/><path d="M4,-47 C6,-43 6,-37 4,-33 M13,-47 C11,-43 11,-37 13,-33" stroke="#1E3A1E" stroke-width="1.4" fill="none" opacity=".7"/><ellipse cx="8.5" cy="-40" rx="2.4" ry="4" fill="#E6D59A" opacity=".85"/>`
      + `<path d="M6,-51 C8,-58 17,-59 21,-55 C24,-52 21,-48 16,-48 C12,-48 8,-49 6,-51 Z" fill="#3F7A3A" stroke="#1E3A1E" stroke-width="1.2"/><circle cx="16.5" cy="-53.5" r="1.5" fill="#F2C94C"/><circle cx="16.8" cy="-53.5" r=".7" fill="#1A1A1A"/>`
      + `<g class="asp-tongue" style="transform-origin:22px -51px"><path d="M22,-51 L28,-51 L31,-53.5 M28,-51 L31,-48.5" stroke="#C8373A" stroke-width="1.2" fill="none" stroke-linecap="round"/></g></g></g></g>`;
    const bh = MOB ? 60 : 40, beats = MOB ? [
      [.3, 2.3, 'Estate 30: Ottaviano avanza dalla Siria, Gallo da ovest'], [2.6, 1.4, '1 agosto: Ottaviano entra ad Alessandria'], [4.0, 2.0, 'Antonio si trafigge e muore tra le braccia di Cleopatra'],
      [6.0, 2.5, 'Cleopatra si toglie la vita, forse col morso di un aspide'], [8.5, 99, 'Fine dei Tolomei: l\'Egitto passa a Ottaviano']] : [
      [.3, 2.3, 'Estate 30 a.C.: Ottaviano avanza dalla Siria, Cornelio Gallo da ovest'], [2.6, 1.4, '1 agosto: Ottaviano entra ad Alessandria'], [4.0, 2.0, 'Antonio si trafigge con la spada e muore tra le braccia di Cleopatra'],
      [6.0, 2.5, 'Cleopatra si toglie la vita nel suo mausoleo, forse col morso di un aspide'], [8.5, 99, 'Fine dei Tolomei: l\'Egitto passa a Ottaviano, governato da un prefetto']];
    S.hud += `<rect x="0" y="${H - bh}" width="${W}" height="${bh}" fill="#FBF6EA" opacity=".94"/><rect x="0" y="${H - bh}" width="${W}" height="1.5" fill="${C.ott}" opacity=".8"/>`;
    beats.forEach((b, i) => { const L = MOB ? wrapT(b[2], 40) : [b[2]]; L.forEach((l, j) => { S.hud += `<text class="beat${i === beats.length - 1 ? ' last' : ''}" x="${W / 2}" y="${f1(H - bh / 2 + F(5) + (j - (L.length - 1) / 2) * F(15))}" text-anchor="middle" fill="#7A1F2B" style="animation-delay:${b[0]}s;animation-duration:${b[1]}s;font-size:${F(MOB ? 11.5 : 14)}px;font-weight:600">${l}</text>`; }); });
    S.rects.push([0, H - bh - 4, W, H]);
    { const etx = MOB ? 'Egitto, dominio di Ottaviano' : 'Egitto: dominio personale di Ottaviano', bw = Math.ceil(tw(etx, F(MOB ? 10 : 12), 'cap') * .9 + 60), bx = MOB ? 8 : 14, by = MOB ? H - bh - 44 : H - bh - 42, bh3 = MOB ? 34 : 32;
      S.hud += `<g class="pop" style="animation-delay:9.2s"><rect x="${bx}" y="${by}" width="${bw}" height="${bh3}" rx="4" fill="#FBF6EA" stroke="#C99A0A" stroke-width="1.2"/><rect x="${bx + 10}" y="${by + bh3 / 2 - 7}" width="22" height="14" rx="2" fill="#F2C318" fill-opacity=".5" stroke="#C99A0A" stroke-dasharray="4 2"/><text x="${bx + 42}" y="${f1(by + bh3 / 2 + F(4.5))}" fill="#8A6208" style="${CAP};font-size:${F(MOB ? 10 : 12)}px;font-weight:700">${etx}</text></g>`;
      S.rects.push([bx - 4, by - 4, bx + bw + 4, by + bh3 + 4]); }
    S.cam = [[0, 35.2, 33.8, 1.6], [.3, 35.2, 33.8, 1.6], [1.8, 31.6, 31.3, 1.6], [2.7, 29.0, 31.3, 1.6], [3.8, 29.95, 31.15, 2.4], [7.6, 29.95, 31.15, 2.4], [8.6, null, null, 1], [10.0, null, null, 1]];
    V[12] = { svg: render(S), cap: 'La Giudea non viene conquistata: il re Erode, fino ad allora alleato di Antonio, passa dalla parte di Ottaviano, rifornisce il suo esercito e lo accompagna fino a Pelusio (Giuseppe Flavio, Antichità giudaiche XV 6). In giallo l\'Egitto dopo la conquista: non diventa una provincia come le altre, ma un dominio personale di Ottaviano, retto da un suo prefetto; ai senatori è vietato perfino entrarvi senza permesso (Tacito, Annali II 59). Estate 30 a.C. Ottaviano arriva dalla Siria passando per Pelusio, mentre Cornelio Gallo avanza da ovest. Il 1 agosto entra ad Alessandria. Antonio si trafigge e muore tra le braccia di Cleopatra (Plutarco, Antonio 76–77); pochi giorni dopo anche Cleopatra si toglie la vita. Il morso dell\'aspide è la versione tradizionale, ma già Plutarco (86) ammette che nessuno sa come andò davvero. L\'Egitto diventa un dominio di Ottaviano, affidato a un prefetto: il primo è proprio Cornelio Gallo.', leg: [[C.ott, 'Ottaviano e i suoi generali']] };
  }
  V[13] = { svg: chartSize(), cap: 'Consistenza del Senato secondo le fonti antiche (Appiano, Cassio Dione, Svetonio): valori arrotondati. Con la seconda lectio del 18 a.C. Augusto riporta il Senato a 600 membri.', leg: [] };
  V[14] = { svg: sceneAugustus(), cap: 'Il 13 gennaio 27 a.C. Ottaviano dichiara di restituire lo Stato al Senato e al popolo; il 16 riceve il nome di Augusto (Res gestae 34; Cassio Dione LIII 16). La statua è l\'Augusto di Prima Porta, di pochi anni dopo (circa 20 a.C.); lo scudo riproduce il testo della copia di Arles del clipeus virtutis.', leg: [] };
  return V;
}
console.error('--- desktop');
buildMaps(); const D = { defs, viz: buildViz() };
W = 440; H = 520; FS = 1.3; MOB = true; SUF = '-m';
console.error('--- mobile');
buildMaps(); const Mo = { defs, viz: buildViz() };
const OUT = { defs: D.defs + Mo.defs, viz: D.viz, vizm: Mo.viz };
fs.writeFileSync('viz.json', JSON.stringify(OUT));
console.error('total', Math.round(JSON.stringify(OUT).length / 1024) + 'KB');
