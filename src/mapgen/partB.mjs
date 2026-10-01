const CAP = 'font-family:\'Cinzel\',\'Trajan Pro\',Georgia,serif';
const F = v => f1(v * FS);
function head(t, sub) {
  const tfs = Math.min(F(19), F(19) * (W - 28) / (tw(t, F(19), 'cap') * .9));
  return `<rect width="${W}" height="${H}" fill="#FBF8F2"/><text x="${W / 2}" y="${MOB ? 40 : 46}" text-anchor="middle" fill="${C.ink}" style="${CAP};font-size:${f1(tfs)}px;font-weight:700">${t}</text>` + (sub ? `<text x="${W / 2}" y="${MOB ? 66 : 70}" text-anchor="middle" fill="#6F6356" style="font-size:${F(13)}px">${sub}</text>` : '');
}
function chartVote() {
  const x0 = MOB ? 20 : 170, right = MOB ? 70 : 110, sc = (W - x0 - right) / 400;
  const rows = [['Favorevoli', 370, '#7AA838', 0], ['Contrari', 22, '#DB6428', .5], ['Assenti o non votanti', 208, '#B9AE9C', 1]];
  let s = head('La mozione di Curione', MOB ? '1 dicembre 50 a.C.' : '1 dicembre 50 a.C. · Cesare e Pompeo depongano entrambi il comando');
  const top = MOB ? 120 : 120, gap = MOB ? 84 : 78;
  rows.forEach((r, i) => {
    const y = top + i * gap, w = r[1] * sc;
    if (MOB) s += `<text x="${x0}" y="${y - 8}" fill="${C.ink}" style="font-size:${F(13)}px;font-weight:600">${r[0]}</text>`;
    else s += `<text x="${x0 - 14}" y="${y + 24}" text-anchor="end" fill="${C.ink}" style="font-size:14px;font-weight:600">${r[0]}</text>`;
    s += `<rect x="${x0}" y="${y}" width="${f1(w)}" height="${MOB ? 32 : 36}" rx="3" fill="${r[2]}" class="grow" style="animation-delay:${r[3]}s"/>`;
    s += `<text x="${f1(x0 + w + 10)}" y="${y + (MOB ? 24 : 25)}" fill="${C.ink}" style="${CAP};font-size:${F(22)}px;font-weight:700" data-count="${r[1]}" data-delay="${r[3]}">0</text>`;
  });
  const hx = f1(x0 + 197 * sc);
  s += `<line x1="${hx}" y1="${top - 14}" x2="${hx}" y2="${top + gap + 40}" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="5 4" class="pop" style="animation-delay:1.4s"/><text x="${hx}" y="${top - 20}" text-anchor="middle" fill="${C.ink}" class="pop" style="animation-delay:1.4s;font-size:${F(12)}px">metà dei presenti: 197</text>`;
  const sx = MOB ? W / 2 : 590, sy = MOB ? H - 70 : 380;
  s += `<g class="stamp" style="animation-delay:2.4s"><g transform="rotate(-8 ${sx} ${sy})"><rect x="${sx - 125}" y="${sy - 30}" width="250" height="60" rx="4" fill="#FBF8F2" fill-opacity=".85" stroke="#7A1F2B" stroke-width="3"/><text x="${sx}" y="${sy - 2}" text-anchor="middle" fill="#7A1F2B" style="${CAP};font-size:${F(17)}px;font-weight:700;letter-spacing:.08em">SEDUTA SCIOLTA</text><text x="${sx}" y="${sy + 18}" text-anchor="middle" fill="#7A1F2B" style="font-size:${F(12)}px">dal console Marcello</text></g></g>`;
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
  const cx = W / 2, arm = MOB ? 140 : 200, py = MOB ? 170 : 146, pw = MOB ? 70 : 88;
  let s = head('Il compromesso del 17 marzo', 'Seduta nel tempio di Tellus');
  const foot = MOB ? H - 70 : 400;
  s += `<path d="M${cx - 30} ${foot} L${cx + 30} ${foot} L${cx + 12} ${foot - 20} L${cx - 12} ${foot - 20} Z" fill="#A87B2A"/><rect x="${cx - 4}" y="${py + 4}" width="8" height="${foot - py - 22}" fill="#A87B2A"/><circle cx="${cx}" cy="${py}" r="9" fill="#D4AE55" stroke="#8C6420"/>`;
  s += `<g class="beam" style="transform-origin:${cx}px ${py}px"><rect x="${cx - arm - 40}" y="${py - 4}" width="${2 * arm + 80}" height="8" rx="4" fill="#8C6420"/>`;
  const pan = (x, t1, t2, col, cls) => {
    const L = t1.split('|');
    let r = `<g class="${cls}" style="transform-origin:${x}px ${py}px"><line x1="${x}" y1="${py}" x2="${x - pw * .8}" y2="${py + 104}" stroke="#8C6420" stroke-width="1.5"/><line x1="${x}" y1="${py}" x2="${x + pw * .8}" y2="${py + 104}" stroke="#8C6420" stroke-width="1.5"/><path d="M${x - pw} ${py + 104} Q${x} ${py + 144} ${x + pw} ${py + 104} Z" fill="#D4AE55" stroke="#8C6420"/>`;
    L.forEach((l, i) => { r += `<text x="${x}" y="${py + 172 + i * F(17)}" text-anchor="middle" fill="${col}" style="font-size:${F(15)}px;font-weight:700">${l}</text>`; });
    return r + `<text x="${x}" y="${py + 172 + L.length * F(17) + 2}" text-anchor="middle" fill="#6F6356" style="font-size:${F(12.5)}px">${t2}</text></g>`;
  };
  s += pan(cx - arm, MOB ? 'Amnistia|ai cesaricidi' : 'Amnistia per i cesaricidi', MOB ? 'Cicerone' : 'proposta di Cicerone', '#2667B0', 'pan-l');
  s += pan(cx + arm, MOB ? 'Atti di Cesare|confermati' : 'Atti di Cesare confermati', MOB ? 'Antonio' : 'richiesta di Antonio', '#C8373A', 'pan-r');
  s += `</g><text x="${cx}" y="${H - 14}" text-anchor="middle" fill="#7A1F2B" class="pop" style="animation-delay:3.2s;${CAP};font-size:${F(MOB ? 12.5 : 14)}px;font-weight:700">Nessuno vince: la partita si sposta fuori</text>`;
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
