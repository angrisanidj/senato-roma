import fs from 'fs';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as simp from 'topojson-simplify';
import pc from 'polygon-clipping';

let W = 800, H = 440, FS = 1, MOB = false, SUF = '';
const f1 = v => Math.round(v * 10) / 10;
const T10 = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-10m.json'));
const T50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));

const MAPS = {
  med: { b: [3, 29.5, 37.5, 47.0], bm: [8, 30, 37.5, 46], t: T50, w: 0.0008 },
  ita: { b: [6.3, 40.4, 17.2, 46.8], bm: [6.3, 41.6, 13.6, 46.3], t: T10, w: 0.00012 },
  gre: { b: [17.6, 36.6, 27.2, 42.4], bm: [17.8, 38.6, 27.2, 42.3], t: T10, w: 0.00012 },
  act: { b: [20.33, 38.72, 21.28, 39.16], t: T10, w: 0.0000004 },
  sic: { b: [12.1, 36.55, 16.3, 38.95], bm: [12.3, 36.6, 16.7, 38.75], t: T10, w: 0.00003 },
  egy: { b: [25.5, 29.6, 36.6, 35.6], bm: [26.6, 29.9, 36.4, 35.6], t: T50, w: 0.0003 },
  gal: { b: [-4.6, 43.2, 9.0, 51.45], bm: [-4.6, 43.0, 8.9, 51.6], t: T50, w: 0.0003 },
  est: { b: [33.3, 33.4, 43.6, 39.3], bm: [34.4, 33.9, 42.4, 38.9], t: T50, w: 0.0003 },
  wme: { b: [-9.8, 33.2, 16.5, 45.5], bm: [-7.4, 33.8, 14.4, 45], t: T50, w: 0.0006 }
};

const C = { ott: '#D99A12', ant: '#C8373A', rep: '#2667B0', sex: '#5E93C8', lep: '#6454C8', sen: '#23845D', ink: '#2B2420' };
const P = {};
let defs = '';
function buildMaps() {
defs = SUF ? '' : `<radialGradient id="fg-sea" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#E4EDE9" stop-opacity=".7"/><stop offset="1" stop-color="#B8CBC6" stop-opacity=".55"/></radialGradient><linearGradient id="fg-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7EFDC"/><stop offset=".55" stop-color="#F2E7CE"/><stop offset="1" stop-color="#EADBBB"/></linearGradient><radialGradient id="fg-ptv" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient><radialGradient id="fg-vign" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#3A2614" stop-opacity="0"/><stop offset="1" stop-color="#3A2614" stop-opacity=".2"/></radialGradient><radialGradient id="fg-plate" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="#FDFAF3"/><stop offset=".7" stop-color="#F7F0E2"/><stop offset="1" stop-color="#EADDC4"/></radialGradient><g id="fg-sword"><path d="M0,-15 L2.3,4.5 L-2.3,4.5 Z" fill="#E2DFD7" stroke="#5E5A52" stroke-width=".8" stroke-linejoin="round"/><path d="M0,-11 L0,3.5" stroke="#A8A49B" stroke-width=".8"/><rect x="-5.5" y="4.5" width="11" height="2.4" rx="1" fill="#C99A3A" stroke="#6B4A1E" stroke-width=".5"/><rect x="-1.3" y="6.9" width="2.6" height="5" fill="#5A3A22"/><circle cx="0" cy="13.4" r="1.9" fill="#C99A3A" stroke="#6B4A1E" stroke-width=".5"/></g>`;
for (const [k, m] of Object.entries(MAPS)) {
  const [x0, y0, x1, y1] = (MOB && m.bm) || m.b;
  const proj = d3.geoMercator().fitExtent([[0, 0], [W, H]], { type: 'MultiPoint', coordinates: [[x0, y0], [x1, y1], [x0, y1], [x1, y0]] });
  P[k] = proj;
  const topo = simp.presimplify(JSON.parse(JSON.stringify(m.t)));
  const st = simp.simplify(topo, m.w);
  const land = topojson.feature(st, st.objects.land);
  const geoms = land.type === 'FeatureCollection' ? land.features.map(f => f.geometry) : [land.geometry];
  const polys = [];
  geoms.forEach(g => { if (g.type === 'Polygon') polys.push(g.coordinates); else if (g.type === 'MultiPolygon') g.coordinates.forEach(c => polys.push(c)); });
  const tl = proj.invert([-10, -10]), br = proj.invert([W + 10, H + 10]);
  const X0 = tl[0], X1 = br[0], Y0 = br[1], Y1 = tl[1], pad = 0.05;
  const box = [[[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1], [X0, Y0]]];
  const cand = polys.filter(pl => { const r = pl[0]; let a = 1e9, b = -1e9, c = 1e9, e = -1e9; r.forEach(([lo, la]) => { a = Math.min(a, lo); b = Math.max(b, lo); c = Math.min(c, la); e = Math.max(e, la); }); return !(b < X0 || a > X1 || e < Y0 || c > Y1); });
  const clipped = cand.length ? pc.intersection(box, cand) : [];
  let d = '';
  clipped.forEach(pl => pl.forEach(ring => { const pts = ring.map(ll => proj(ll)); let prev = ''; ring.length && (d += 'M' + pts.map(p => { const q = f1(p[0]) + ',' + f1(p[1]); const out = q === prev ? '' : q; prev = q; return out; }).filter(Boolean).join('L') + 'Z'); }));
  const lp = `#fg-landp-${k}${SUF}`;
  // stile da atlante antico: linee d'acqua che seguono le coste, ombra interna lungo la costa, carta calda
  const rings = [[30, '#CBDAD6'], [24, '#D5E1DD'], [18, '#C6D7D3'], [13, '#D5E1DD'], [8, '#C2D4D0'], [4, '#D5E1DD']].map(r => `<use href="${lp}" fill="none" stroke="${r[1]}" stroke-width="${r[0]}" stroke-linejoin="round"/>`).join('');
  defs += `<path id="fg-landp-${k}${SUF}" d="${d}" fill-rule="evenodd"/><clipPath id="fg-land-${k}${SUF}"><use href="${lp}" clip-rule="evenodd"/></clipPath>`
    + `<g id="fg-map-${k}${SUF}"><rect width="${W}" height="${H}" fill="#D5E1DD"/><rect width="${W}" height="${H}" fill="url(#fg-sea)"/>${rings}`
    + `<use href="${lp}" fill="url(#fg-paper)" stroke="#8E7A55" stroke-width="2.4" stroke-opacity=".18" stroke-linejoin="round"/>`
    + `<g clip-path="url(#fg-land-${k}${SUF})"><use href="${lp}" fill="none" stroke="#B89A62" stroke-width="12" stroke-opacity=".22" stroke-linejoin="round"/><use href="${lp}" fill="none" stroke="#B89A62" stroke-width="4" stroke-opacity=".22" stroke-linejoin="round"/></g>`
    + `<use href="${lp}" fill="none" stroke="#86724E" stroke-width=".9" stroke-linejoin="round"/></g>`;
  console.error(k + SUF, Math.round(d.length / 1024) + 'KB');
}
}

