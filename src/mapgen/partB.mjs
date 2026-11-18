const CAP = 'font-family:\'Cinzel\',\'Trajan Pro\',Georgia,serif';
const F = v => f1(v * FS);
/* Scene dipinte (illustrazioni generate con IA, 1280×720, incorporate da build.py come #fg-pt-<key>).
   kf: [[percentuale, fuocoX, fuocoY, zoom], ...] fuoco in frazioni dell'immagine, zoom >= 1 rispetto al riempimento. */
const PT_W = 1280, PT_H = 720;
let PTN = 0;
function painted(key, kf, dur, o = {}) {
  const base = Math.max(W / PT_W, H / PT_H), name = 'fgpt' + (PTN++) + (MOB ? 'm' : 'd');
  const fr = kf.map(([p, fx, fy, z]) => {
    const s = base * z, tx = Math.min(0, Math.max(W - s * PT_W, W / 2 - s * fx * PT_W)), ty = Math.min(0, Math.max(H - s * PT_H, H * (o.cy || .5) - s * fy * PT_H));
    return `${p}%{transform:translate(${f1(tx)}px,${f1(ty)}px) scale(${Math.round(s * 10000) / 10000})}`;
  }).join('');
  let g = `<style>@keyframes ${name}{${fr}}</style><rect width="${W}" height="${H}" fill="#120A08"/>`;
  g += `<g style="animation-name:${name};animation-duration:${dur}s;animation-timing-function:${o.ease || 'cubic-bezier(.35,.05,.25,1)'};animation-delay:${o.delay || 0}s;animation-fill-mode:both"><use href="#fg-pt-${key}"/></g>`;
  g += `<rect width="${W}" height="${H}" fill="url(#fg-ptv)" pointer-events="none"/>`;
  if (!o.nolabel) g += `<text x="${W - (MOB ? 10 : 14)}" y="${H - (o.bh != null ? o.bh : (MOB ? 58 : 44)) - (MOB ? 8 : 8)}" text-anchor="end" fill="#FFFFFF" fill-opacity=".62" style="font-size:${F(MOB ? 8.5 : 9.5)}px;letter-spacing:.04em;paint-order:stroke;stroke:#000;stroke-opacity:.35;stroke-width:2px">Illustrazione generata con IA</text>`;
  return g;
}
function head(t, sub) {
  const tfs = Math.min(F(19), F(19) * (W - 28) / (tw(t, F(19), 'cap') * .9));
  const tW = Math.min(tw(t, tfs, 'cap') * .9, W - 40) / 2, ty = MOB ? 34 : 40;
  const plate = `<rect width="${W}" height="${H}" fill="url(#fg-plate)"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="4" fill="none" stroke="#C9A457" stroke-opacity=".55"/><rect x="13" y="13" width="${W - 26}" height="${H - 26}" rx="2" fill="none" stroke="#C9A457" stroke-opacity=".3" stroke-width=".7"/>`
    + (tW + 70 < W / 2 - 20 ? `<path d="M${f1(W / 2 - tW - 62)} ${ty} H${f1(W / 2 - tW - 16)} M${f1(W / 2 + tW + 16)} ${ty} H${f1(W / 2 + tW + 62)}" stroke="#C9A457" stroke-width="1"/><path d="M${f1(W / 2 - tW - 10)} ${ty} l-4 -4 l-4 4 l4 4 Z M${f1(W / 2 + tW + 10)} ${ty} l4 -4 l4 4 l-4 4 Z" fill="#C9A457"/>` : '');
  return plate + `<text x="${W / 2}" y="${MOB ? 40 : 46}" text-anchor="middle" fill="${C.ink}" style="${CAP};font-size:${f1(tfs)}px;font-weight:700">${t}</text>` + (sub ? `<text x="${W / 2}" y="${MOB ? 66 : 70}" text-anchor="middle" fill="#6F6356" style="font-size:${F(13)}px">${sub}</text>` : '');
}
function chartVote() {
  // La discessio: i senatori si spostano fisicamente verso chi sostengono. Ogni pallino = 5 senatori.
  let s = head('La mozione di Curione', MOB ? '1 dicembre 50 a.C.' : '1 dicembre 50 a.C. · Cesare e Pompeo depongano entrambi il comando');
  const id = 'fgVo' + (MOB ? 'm' : 'd'), N = 120, FAV = 74, CON = 4, r = MOB ? 6.2 : 7.6, sp = MOB ? 15.5 : 19;
  const GREEN = '#6E9E2E', ORNG = '#DB6428', NEU = '#BDB2A0';
  s += `<style>@keyframes ${id}mv{from{transform:translate(var(--dx),var(--dy))}to{transform:none}}@keyframes ${id}cl{from{fill:${NEU}}}@keyframes ${id}ab{from{opacity:1}to{opacity:.55}}</style>`;
  // dove partono: un blocco unico al centro dell'aula
  const sc = MOB ? 10 : 15, sx0 = W / 2 - (sc - 1) * sp * .5, sy0 = MOB ? 120 : 118;
  const start = i => [sx0 + (i % sc) * sp, sy0 + Math.floor(i / sc) * sp * .92];
  // dove arrivano
  const fc = MOB ? 10 : 10, fx0 = MOB ? 34 : 70, fy0 = MOB ? 130 : 128;
  const favPos = i => [fx0 + (i % fc) * sp, fy0 + Math.floor(i / fc) * sp];
  const cx0 = MOB ? W - 64 : 640, cy0 = MOB ? 130 : 126;
  const conPos = i => [cx0 + (i % 2) * sp, cy0 + Math.floor(i / 2) * sp];
  const ac = MOB ? 14 : 14, ax0 = MOB ? W / 2 - 6.5 * sp : 400 - 6.5 * sp, ay0 = MOB ? 330 : 332;
  const absPos = i => [ax0 + (i % ac) * sp, ay0 + Math.floor(i / ac) * sp];
  // la spina dell'aula e le due parti
  const midX = MOB ? W / 2 + 20 : 520;
  s += `<line x1="${midX}" y1="${MOB ? 104 : 96}" x2="${midX}" y2="${MOB ? 290 : 280}" stroke="#C9A457" stroke-width="1.2" stroke-dasharray="2 5" class="pop" style="animation-delay:.9s"/>`;
  s += `<text x="${fx0 - 2}" y="${fy0 - 18}" fill="${C.ink}" class="pop" style="animation-delay:1s;${CAP};font-size:${F(12)}px;font-weight:700;letter-spacing:.12em">FAVOREVOLI</text>`;
  s += `<text x="${MOB ? f1(cx0 + sp + r) : cx0 - 2}" y="${cy0 - 18}" text-anchor="${MOB ? 'end' : 'start'}" fill="${C.ink}" class="pop" style="animation-delay:1s;${CAP};font-size:${F(12)}px;font-weight:700;letter-spacing:.12em">CONTRARI</text>`;
  let dots = '';
  for (let i = 0; i < N; i++) {
    let p, fill, kind;
    if (i < FAV) { p = favPos(i); fill = GREEN; kind = 'f'; }
    else if (i < FAV + CON + 1) { p = conPos(i - FAV); fill = ORNG; kind = 'c'; }
    else { p = absPos(i - FAV - CON - 1); fill = 'none'; kind = 'a'; }
    const q = start(i), dx = f1(q[0] - p[0]), dy = f1(q[1] - p[1]), dl = (1.0 + (kind === 'a' ? .5 : 0) + (i % 15) * .035 + Math.floor(i / 15) * .05).toFixed(2);
    const rr = i === FAV + CON ? f1(r * .63) : r; // il quinto pallino dei contrari vale 2 senatori: 22 = 4×5 + 2
    if (kind === 'a') dots += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(r - .9)}" fill="${NEU}" fill-opacity=".25" stroke="#9A8E7A" stroke-width="1.4" stroke-dasharray="2.2 1.8" style="--dx:${dx}px;--dy:${dy}px;animation:${id}mv 1.3s cubic-bezier(.5,0,.25,1) ${dl}s both"/>`;
    else dots += `<g style="--dx:${dx}px;--dy:${dy}px;animation:${id}mv 1.3s cubic-bezier(.5,0,.25,1) ${dl}s both"><circle cx="${f1(p[0])}" cy="${f1(p[1] + 1.4)}" r="${rr}" fill="#3A2614" opacity=".18"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${rr}" fill="${fill}" style="animation:${id}cl .6s ease ${(+dl + .5).toFixed(2)}s both"/><circle cx="${f1(p[0] - rr * .3)}" cy="${f1(p[1] - rr * .3)}" r="${f1(rr * .35)}" fill="#fff" opacity=".35"/></g>`;
  }
  s += `<g class="pop" style="animation-duration:.6s">${dots}</g>`;
  // conteggi
  const favRows = Math.ceil(FAV / fc), nyF = fy0 + favRows * sp + (MOB ? 14 : 22);
  s += `<text x="${fx0 - 6}" y="${f1(nyF + F(24))}" fill="${C.ink}" class="pop" style="animation-delay:2.4s;${CAP};font-size:${F(MOB ? 26 : 34)}px;font-weight:700" data-count="370" data-delay="2.6">0</text>`;
  s += `<text x="${fx0 + (MOB ? 70 : 92)}" y="${f1(nyF + F(24))}" fill="#6F6356" class="pop" style="animation-delay:2.8s;font-family:'EB Garamond',Georgia,serif;font-size:${F(MOB ? 13 : 16)}px;font-style:italic">ne bastavano 197</text>`;
  const nyC = cy0 + 3 * sp + (MOB ? 14 : 22);
  s += `<text x="${cx0 - 6}" y="${f1(nyC + F(24))}" fill="${C.ink}" class="pop" style="animation-delay:2.4s;${CAP};font-size:${F(MOB ? 26 : 34)}px;font-weight:700" data-count="22" data-delay="2.6">0</text>`;
  const absRows = Math.ceil((N - FAV - CON - 1) / ac);
  s += `<text x="${f1(ax0 - 6)}" y="${f1(ay0 + absRows * sp + F(16))}" fill="#6F6356" class="pop" style="animation-delay:2.9s;font-size:${F(MOB ? 11.5 : 13)}px">${MOB ? '208 assenti o non votanti' : '208 assenti o non votanti · ogni pallino vale 5 senatori'}</text>`;
  // il console scioglie la seduta
  const tx = MOB ? W / 2 : 652, ty = MOB ? H - 78 : 300;
  s += `<g class="stamp" style="animation-delay:3.6s"><g transform="rotate(-7 ${tx} ${ty})"><rect x="${tx - 118}" y="${ty - 28}" width="236" height="56" rx="4" fill="#FBF8F2" fill-opacity=".9" stroke="#7A1F2B" stroke-width="3"/><rect x="${tx - 112}" y="${ty - 22}" width="224" height="44" rx="2" fill="none" stroke="#7A1F2B" stroke-width="1"/><text x="${tx}" y="${ty - 1}" text-anchor="middle" fill="#7A1F2B" style="${CAP};font-size:${F(MOB ? 15 : 18)}px;font-weight:700;letter-spacing:.08em">SEDUTA SCIOLTA</text><text x="${tx}" y="${ty + 16}" text-anchor="middle" fill="#7A1F2B" style="font-size:${F(11.5)}px">dal console Marcello</text></g></g>`;
  return s;
}
function chartCaesar() {
  const L = MOB ? 18 : 110, R = MOB ? 18 : 30, X = t => f1(L + t * (W - L - R) / 6);
  const yD = MOB ? 180 : 175, yC = MOB ? 330 : 295, base = MOB ? 440 : 360;
  let s = head('Le cariche di Cesare', MOB ? '49–44 a.C.' : '49–44 a.C. · il potere si accumula in una sola persona');
  for (let y = 0; y <= 5; y++) { s += `<line x1="${X(y)}" y1="110" x2="${X(y)}" y2="${base}" stroke="#E4DACA" stroke-width="1"/><text x="${X(y + .5)}" y="${base + 26}" text-anchor="middle" fill="#6F6356" style="font-size:${F(MOB ? 11 : 13)}px">${49 - y}</text>`; }
  s += `<text x="${W / 2}" y="${base + 46}" text-anchor="middle" fill="#8A8378" style="font-size:${F(11)}px">anni a.C.</text>`;
  s += `<line x1="${X(0)}" y1="${base}" x2="${X(6)}" y2="${base}" stroke="#B9AE9C"/>`;
  s += `<text x="${X(0)}" y="${yD - 36}" fill="#7A1F2B" style="${CAP};font-size:${F(14)}px;font-weight:700">Dittature</text><text x="${X(0)}" y="${yC - 36}" fill="#7A1F2B" style="${CAP};font-size:${F(14)}px;font-weight:700">Consolati</text>`;
  const bar = (t0, t1, y, col, d, lab, sub, o = {}) => {
    const w = Math.max(6, X(t1) - X(t0)), lx = o.lx || X(t0);
    let r = `<rect x="${X(t0)}" y="${y - 14}" width="${f1(w)}" height="28" rx="3" fill="${col}" class="grow" style="animation-delay:${d}s"/>`;
    r += `<text x="${lx}" y="${y + 32}" text-anchor="${o.a || 'start'}" fill="${C.ink}" class="pop" style="animation-delay:${d + .4}s;font-size:${F(12.5)}px;font-weight:600">${lab}</text>`;
    if (sub) r += `<text x="${lx}" y="${y + 32 + F(15)}" text-anchor="${o.a || 'start'}" fill="#6F6356" class="pop" style="animation-delay:${d + .4}s;font-size:${F(11.5)}px">${sub}</text>`;
    return r;
  };
  s += bar(.92, .95, yD, '#7A1F2B', .2, '49', '11 giorni', { lx: X(.92) - 4, a: 'middle' });
  s += bar(1.78, 2.78, yD, '#7A1F2B', .7, '48–47', MOB ? '1 anno' : 'per un anno');
  s += bar(3.3, 5.1, yD, '#7A1F2B', 1.2, '46', MOB ? '10 anni' : 'per dieci anni');
  s += bar(5.1, 5.2, yD, '#D4AE55', 1.8, '44', 'a vita', { lx: X(5.2) + 6 });
  s += bar(1, 2, yC, '#A87B2A', .4, '48', '');
  s += bar(3, 4, yC, '#A87B2A', .9, '46', '');
  s += bar(4, 5, yC, '#A87B2A', 1.3, '45', MOB ? 'a lungo solo' : 'a lungo senza collega');
  s += bar(5, 5.2, yC, '#A87B2A', 1.8, '44', '', { lx: X(5.2) + 6 });
  s += `<g class="pop" style="animation-delay:2.4s"><line x1="${X(5.2)}" y1="104" x2="${X(5.2)}" y2="${base}" stroke="#7A1F2B" stroke-width="2" stroke-dasharray="4 3"/><text x="${X(5.2) - 6}" y="${MOB ? 100 : 118}" text-anchor="end" fill="#7A1F2B" style="font-size:${F(12.5)}px;font-weight:700">15 marzo 44</text></g>`;
  return s;
}
function chartBalance() {
  const cx = W / 2, arm = MOB ? 140 : 200, py = MOB ? 170 : 150, pw = MOB ? 66 : 84, id = 'fgBa' + (MOB ? 'm' : 'd');
  let s = head('Il compromesso del 17 marzo', 'Seduta nel tempio di Tellus');
  const foot = MOB ? H - 70 : 404;
  s += `<defs><linearGradient id="${id}br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9C878"/><stop offset=".45" stop-color="#B8892B"/><stop offset="1" stop-color="#7A5A1E"/></linearGradient>`
    + `<linearGradient id="${id}col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8C6420"/><stop offset=".42" stop-color="#E6C35C"/><stop offset="1" stop-color="#7A5A1E"/></linearGradient>`
    + `<radialGradient id="${id}pan" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#F6DE97"/><stop offset=".6" stop-color="#C99A3A"/><stop offset="1" stop-color="#7A5A1E"/></radialGradient>`
    + `<radialGradient id="${id}halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3D0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3D0" stop-opacity="0"/></radialGradient></defs>`;
  // il tempio di Tellus, appena accennato dietro la bilancia
  const tw2 = MOB ? 360 : 560, tb = foot + 2, tt = MOB ? 120 : 104;
  let t = `<g opacity=".22">`;
  const nc = MOB ? 6 : 8;
  for (let i = 0; i < nc; i++) { const x = cx - tw2 / 2 + 18 + i * (tw2 - 36) / (nc - 1); t += `<rect x="${f1(x - 9)}" y="${tt + 22}" width="18" height="${f1(tb - tt - 30)}" fill="#C9B894"/><path d="M${f1(x - 6)} ${tt + 26} V${f1(tb - 10)} M${f1(x)} ${tt + 26} V${f1(tb - 10)} M${f1(x + 6)} ${tt + 26} V${f1(tb - 10)}" stroke="#A8946F" stroke-width=".8"/><rect x="${f1(x - 13)}" y="${tt + 16}" width="26" height="7" fill="#C9B894"/>`; }
  t += `<rect x="${f1(cx - tw2 / 2)}" y="${tt + 4}" width="${tw2}" height="12" fill="#C9B894"/><path d="M${f1(cx - tw2 / 2 - 8)} ${tt + 4} L${cx} ${tt - (MOB ? 34 : 44)} L${f1(cx + tw2 / 2 + 8)} ${tt + 4} Z" fill="#D8CAA8"/><rect x="${f1(cx - tw2 / 2 - 16)}" y="${f1(tb - 8)}" width="${tw2 + 32}" height="8" fill="#C9B894"/></g>`;
  s += t;
  s += `<ellipse cx="${cx}" cy="${py}" rx="${arm + 70}" ry="${MOB ? 120 : 140}" fill="url(#${id}halo)"/>`;
  // colonna e base
  s += `<ellipse cx="${cx}" cy="${foot + 2}" rx="54" ry="6" fill="#3A2614" opacity=".18"/><path d="M${cx - 46} ${foot} L${cx + 46} ${foot} L${cx + 36} ${foot - 12} L${cx - 36} ${foot - 12} Z" fill="url(#${id}br)" stroke="#6B4A1E" stroke-width=".8"/><path d="M${cx - 26} ${foot - 12} L${cx + 26} ${foot - 12} L${cx + 16} ${foot - 30} L${cx - 16} ${foot - 30} Z" fill="url(#${id}br)" stroke="#6B4A1E" stroke-width=".8"/>`;
  s += `<rect x="${cx - 6}" y="${py + 10}" width="12" height="${foot - py - 40}" fill="url(#${id}col)" stroke="#6B4A1E" stroke-width=".6"/>`;
  for (let y = py + 30; y < foot - 40; y += 34) s += `<rect x="${cx - 8}" y="${y}" width="16" height="4" rx="2" fill="url(#${id}br)" stroke="#6B4A1E" stroke-width=".5"/>`;
  s += `<path d="M${cx - 14} ${py + 10} L${cx + 14} ${py + 10} L${cx + 7} ${py - 2} L${cx - 7} ${py - 2} Z" fill="url(#${id}br)" stroke="#6B4A1E" stroke-width=".6"/>`;
  // giogo
  s += `<g class="sbeam" style="transform-origin:${cx}px ${py}px">`;
  s += `<path d="M${cx - arm - 30} ${py} C${cx - arm / 2} ${py - 9} ${cx + arm / 2} ${py - 9} ${cx + arm + 30} ${py} L${cx + arm + 30} ${py + 6} C${cx + arm / 2} ${py - 3} ${cx - arm / 2} ${py - 3} ${cx - arm - 30} ${py + 6} Z" fill="url(#${id}br)" stroke="#6B4A1E" stroke-width=".8"/>`;
  [-1, 1].forEach(sd => { s += `<circle cx="${cx + sd * (arm + 30)}" cy="${py + 3}" r="6" fill="url(#${id}pan)" stroke="#6B4A1E" stroke-width=".8"/>`; });
  s += `<path d="M${cx} ${py - 30} L${cx - 5} ${py - 6} L${cx + 5} ${py - 6} Z" fill="url(#${id}br)" stroke="#6B4A1E" stroke-width=".6"/>`;
  const scroll = x => `<g transform="translate(${x} ${py + 96})"><rect x="-26" y="-12" width="52" height="12" rx="6" fill="#F3E6C4" stroke="#8C6420" stroke-width=".8"/><ellipse cx="-26" cy="-6" rx="4" ry="6" fill="#E2D0A4" stroke="#8C6420" stroke-width=".8"/><ellipse cx="26" cy="-6" rx="4" ry="6" fill="#E2D0A4" stroke="#8C6420" stroke-width=".8"/><path d="M-18 -6 H18" stroke="#2667B0" stroke-width="1.6"/></g>`;
  const tablets = x => `<g transform="translate(${x} ${py + 96})">${[0, 1, 2].map(k => `<rect x="${-22 + k * 2}" y="${-6 - k * 6}" width="40" height="6" rx="1.5" fill="${k % 2 ? '#B07A3E' : '#8E5E2C'}" stroke="#4A3010" stroke-width=".6"/>`).join('')}<path d="M-14 -16 H12" stroke="#C8373A" stroke-width="1.4"/></g>`;
  const pan = (x, t1, t2, col, cls, obj) => {
    const L = t1.split('|');
    let r = `<g class="${cls}" style="transform-origin:${x}px ${py}px">`;
    for (let k = 0; k < 9; k++) { const u = k / 8; [-1, 1].forEach(sd => { r += `<circle cx="${f1(x + sd * pw * .8 * u)}" cy="${f1(py + 6 + 98 * u)}" r="1.5" fill="#8C6420"/>`; }); }
    r += `<path d="M${x - pw} ${py + 104} Q${x} ${py + 146} ${x + pw} ${py + 104} Z" fill="url(#${id}pan)" stroke="#6B4A1E" stroke-width="1"/><path d="M${x - pw + 6} ${py + 106} Q${x} ${py + 112} ${x + pw - 6} ${py + 106}" stroke="#FFF1C0" stroke-width="1.4" fill="none" opacity=".6"/>`;
    r += obj(x);
    L.forEach((l, i) => { r += `<text x="${x}" y="${py + 176 + i * F(18)}" text-anchor="middle" fill="${col}" style="font-family:'EB Garamond',Georgia,serif;font-size:${F(18)}px;font-weight:700">${l}</text>`; });
    return r + `<text x="${x}" y="${py + 176 + L.length * F(18) + 2}" text-anchor="middle" fill="#6F6356" style="font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:${F(14)}px">${t2}</text></g>`;
  };
  s += pan(cx - arm, MOB ? 'Amnistia|ai cesaricidi' : 'Amnistia per i cesaricidi', MOB ? 'Cicerone' : 'proposta di Cicerone', '#2667B0', 'pan-l', scroll);
  s += pan(cx + arm, MOB ? 'Atti di Cesare|confermati' : 'Atti di Cesare confermati', MOB ? 'Antonio' : 'richiesta di Antonio', '#C8373A', 'pan-r', tablets);
  s += `</g><text x="${cx}" y="${H - 22}" text-anchor="middle" fill="#7A1F2B" class="pop" style="animation-delay:3.2s;${CAP};font-size:${F(MOB ? 12.5 : 14)}px;font-weight:700">Nessuno vince: la partita si sposta fuori</text>`;
  return s;
}
function chartSize() {
  const pts = [['81', 'Silla', 600], ['45', 'Cesare', 900], ['32', 'rottura', 1050], ['28', '1ª lectio', 860], ['18', '2ª lectio', 600]];
  const L = MOB ? 64 : 110, R = MOB ? 34 : 60, X = i => f1(L + i * (W - L - R) / 4), top = MOB ? 150 : 120, bot = MOB ? 400 : 380, Y = v => f1(bot - (v - 400) * (bot - top) / 700);
  let s = head('Quanti erano i senatori', MOB ? 'dalle guerre civili ad Augusto' : 'Il Senato si gonfia nelle guerre civili, poi Augusto lo riporta a 600');
  const grid = [500, 750, 1000], obs = [];
  grid.forEach(v => { s += `<line x1="${L - 20}" y1="${Y(v)}" x2="${W - 16}" y2="${Y(v)}" stroke="#E4DACA"/><text x="${L - 24}" y="${Y(v) + 4}" text-anchor="end" fill="#8A8378" style="font-size:${F(11)}px">${v.toLocaleString('it-IT')}</text>`; for (let x = L - 20; x <= W - 16; x += 4) obs.push([x, Y(v), 2]); });
  for (let i = 0; i < pts.length - 1; i++) { const x0 = X(i), y0 = Y(pts[i][2]), x1 = X(i + 1), y1 = Y(pts[i + 1][2]), n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3); for (let k = 0; k <= n; k++) obs.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 3]); }
  pts.forEach((p, i) => obs.push([X(i), Y(p[2]), 11]));
  const d = pts.map((p, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(p[2])).join(' ');
  s += `<defs><linearGradient id="fgSz${MOB ? 'm' : 'd'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A1F2B" stop-opacity=".28"/><stop offset="1" stop-color="#7A1F2B" stop-opacity="0"/></linearGradient></defs><path class="pop" d="${d} L${X(4)} ${bot} L${X(0)} ${bot} Z" fill="url(#fgSz${MOB ? 'm' : 'd'})" style="animation-delay:2.5s;animation-duration:1.2s"/>`;
  s += `<path class="dr" pathLength="1" d="${d}" fill="none" stroke="#7A1F2B" stroke-width="3.5" stroke-linejoin="round" style="animation-delay:.2s;animation-duration:2.6s"/>`;
  const placed = [], fs = F(MOB ? 13 : 15);
  pts.forEach((p, i) => {
    const dl = (0.3 + i * 0.55).toFixed(2), lab = p[2] === 1050 ? (MOB ? '>1.000' : 'oltre 1.000') : (MOB ? '' : 'circa ') + p[2].toLocaleString('it-IT');
    const w = tw(lab, fs, 'cap') * .92, h = fs, px = X(i), py = Y(p[2]);
    let best = null;
    for (const dd of [14, 22, 32, 44]) {
      for (const [dx, dy, an] of [[0, -1, 'middle'], [0, 1, 'middle'], [.8, -.8, 'start'], [-.8, -.8, 'end'], [.8, .8, 'start'], [-.8, .8, 'end'], [1, 0, 'start'], [-1, 0, 'end']]) {
        const cx = px + dx * dd, cy = py + dy * dd;
        const x0 = an === 'start' ? cx : an === 'end' ? cx - w : cx - w / 2, yc = dy < 0 ? cy - h / 2 : dy > 0 ? cy + h / 2 : cy;
        const bx = [x0 - 3, yc - h / 2 - 2, x0 + w + 3, yc + h / 2 + 2];
        if (bx[0] < 4 || bx[2] > W - 4 || bx[1] < (MOB ? 80 : 84) || bx[3] > bot - 2) continue;
        if (placed.some(r => !(bx[2] < r[0] || bx[0] > r[2] || bx[3] < r[1] || bx[1] > r[3]))) continue;
        if (obs.some(o => { const qx = Math.max(bx[0] - o[0], 0, o[0] - bx[2]), qy = Math.max(bx[1] - o[1], 0, o[1] - bx[3]); return qx * qx + qy * qy < o[2] * o[2]; })) continue;
        best = [an, x0, yc, bx]; break;
      }
      if (best) break;
    }
    if (!best) { console.error('  ! etichetta grafico senza posto:', lab); best = ['middle', px - w / 2, py - 26, [0, 0, 0, 0]]; }
    placed.push(best[3]);
    const tx = best[0] === 'start' ? best[1] : best[0] === 'end' ? best[1] + w : best[1] + w / 2;
    s += `<g class="pop" style="animation-delay:${dl}s"><circle cx="${px}" cy="${py}" r="8" fill="${i === 4 ? '#D99A12' : '#7A1F2B'}" stroke="#FBF6EA" stroke-width="2.5"/><text x="${f1(tx)}" y="${f1(best[2] + h * .36)}" text-anchor="${best[0]}" fill="${C.ink}" style="${CAP};font-size:${fs}px;font-weight:700;paint-order:stroke;stroke:#FBF8F2;stroke-width:5px;stroke-linejoin:round">${lab}</text></g><text x="${px}" y="${bot + 30}" text-anchor="middle" fill="${C.ink}" style="font-size:${F(13)}px;font-weight:600">${p[0]} a.C.</text><text x="${px}" y="${bot + 30 + F(16)}" text-anchor="middle" fill="#6F6356" style="font-size:${F(11.5)}px">${p[1]}</text>`;
  });
  return s;
}
/* ---------- Idi di marzo: scena ---------- */
