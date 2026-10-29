/* Hollyball Association : carte de licence (recto + verso) dessinée en SVG, identique sur le site et sur la page de vérification.
   Utilise la bibliothèque qrcode-generator (déjà chargée par les pages) pour le QR code. */
(function () {
  var NAVY = '#0b2352', GOLD = '#e8b32a', GOLD2 = '#f6d46a', SITE = 'https://hollyballassociation.github.io/';
  var FONT = "Montserrat,'Segoe UI',Helvetica,Arial,sans-serif";
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function okUrl(u) { return typeof u === 'string' && /^https:\/\/[^\s"'<>]+$/.test(u); }
  function dateFr(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (d || ''); }
  /* nom de famille / prénom : colonnes prenom + nom (« Prénom Nom ») */
  function split(d) {
    var full = String(d.nom || '').trim(), pre = String(d.prenom || '').trim(), fam;
    if (pre) { fam = full.toLowerCase().indexOf(pre.toLowerCase() + ' ') === 0 ? full.slice(pre.length + 1).trim() : full; }
    else { var w = full.split(/\s+/); pre = w[0] || ''; fam = w.slice(1).join(' '); if (!fam) { fam = pre; pre = ''; } }
    return { nom: fam.toUpperCase(), prenom: pre };
  }
  function txt(x, y, s, size, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + FONT + '" font-size="' + size + '" font-weight="' + (o.w || 700) + '" fill="' + (o.f || NAVY) + '"' +
      (o.a ? ' text-anchor="' + o.a + '"' : '') + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + (o.st ? ' font-style="' + o.st + '"' : '') + (o.tl ? ' textLength="' + o.tl + '" lengthAdjust="spacingAndGlyphs"' : '') + (o.t ? ' transform="' + o.t + '"' : '') + '>' + esc(s) + '</text>';
  }
  /* valeur dans un champ : rétrécit la police si le texte est long */
  function val(x, y, s, w) {
    s = String(s == null ? '' : s); if (!s) return '';
    var size = 28, need = s.length * size * 0.62; if (need > w) size = Math.max(16, Math.floor(w / (s.length * 0.62)));
    return txt(x, y, s, size, { w: 600 });
  }
  /* code-barres Code 39 (lisible par tout lecteur) */
  var C39 = { '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn', G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn', K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn',
    N: 'nnnnwnnww', O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn', S: 'nnwnnnwwn', T: 'nnnnwnwwn', U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn' };
  function barcode(code, x, y, w, h) {
    var s = '*' + String(code).toUpperCase().replace(/[^0-9A-Z\-. ]/g, '') + '*', u = 0, i, j, p, bars = [];
    for (i = 0; i < s.length; i++) { p = C39[s[i]]; for (j = 0; j < 9; j++) u += p[j] === 'w' ? 3 : 1; u += 1; }
    var m = w / u, cx = x;
    for (i = 0; i < s.length; i++) { p = C39[s[i]]; for (j = 0; j < 9; j++) { var wd = (p[j] === 'w' ? 3 : 1) * m; if (j % 2 === 0) bars.push('<rect x="' + cx.toFixed(2) + '" y="' + y + '" width="' + wd.toFixed(2) + '" height="' + h + '"/>'); cx += wd; } cx += m; }
    return '<g fill="#111">' + bars.join('') + '</g>';
  }
  function qrSvg(url, x, y, size) {
    try {
      var q = qrcode(0, 'M'); q.addData(url); q.make(); var n = q.getModuleCount(), m = size / (n + 4), r = [], a, b;
      for (a = 0; a < n; a++) for (b = 0; b < n; b++) if (q.isDark(a, b)) r.push('<rect x="' + (x + (b + 2) * m).toFixed(2) + '" y="' + (y + (a + 2) * m).toFixed(2) + '" width="' + (m + 0.4).toFixed(2) + '" height="' + (m + 0.4).toFixed(2) + '"/>');
      return '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="#fff"/><g fill="#000">' + r.join('') + '</g>';
    } catch (e) { return '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="#fff"/>'; }
  }
  function emblem(x, y, w) { /* seul l'emblème « HB » du logo (haut de l'image 340x266) */
    var h = w * 170 / 340;
    return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 340 170"><image href="logo-carte.png" width="340" height="266"/></svg>';
  }
  var TITRE = { J: ['JOUEUR / JOUEUSE'], E: ['ENTRAÎNEUR'], A: ['ARBITRE'] };
  function recto(d, o) {
    o = o || {}; var sp = split(d), saison = String(d.saison || '2026-2027').replace('-', ' - '), t = (TITRE[d.cat] || TITRE.J)[0], sx = d.sexe, nais = d.naissance ? dateFr(d.naissance) : '';
    var line = function (y, x1) { return '<line x1="' + x1 + '" y1="' + y + '" x2="1075" y2="' + y + '" stroke="#3a5a99" stroke-width="2"/>'; };
    var photo = okUrl(d.photo) ? '<image href="' + esc(d.photo) + '" x="82" y="324" width="288" height="320" preserveAspectRatio="xMidYMid slice" clip-path="url(#hbp)"/>' :
      '<rect x="82" y="324" width="288" height="320" fill="#c9d0db"/><circle cx="226" cy="440" r="62" fill="#6b7a8e"/><path d="M96 644 C100 560 160 530 226 530 C292 530 352 560 356 644 Z" fill="#6b7a8e"/>';
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1024" role="img" aria-label="Licence officielle Hollyball Association, recto" style="width:100%;height:auto;display:block;border-radius:3%">' +
      '<defs><clipPath id="hbp"><rect x="82" y="324" width="288" height="368" rx="24"/></clipPath><clipPath id="hbc"><rect x="46" y="72" width="1447" height="875" rx="44"/></clipPath></defs>' +
      '<rect width="1536" height="1024" fill="#eef1f5"/><g clip-path="url(#hbc)"><rect x="46" y="72" width="1447" height="875" fill="#fff"/>' +
      '<path d="M845 72 H1493 V322 H1128 C1100 322 1084 312 1068 294 Z" fill="' + NAVY + '"/><path d="M845 72 L1068 294 C1084 312 1100 322 1128 322" fill="none" stroke="' + GOLD + '" stroke-width="7"/>' +
      '<g opacity=".1"><svg x="1130" y="352" width="320" height="160" viewBox="0 0 340 170"><image href="logo-carte.png" width="340" height="266"/></svg></g>' +
      '<path d="M46 735 C170 790 330 770 468 800 C535 815 570 885 625 947 H46 Z" fill="' + NAVY + '"/><path d="M46 650 C100 725 220 760 340 775 C440 788 500 800 540 850 L625 947" fill="none" stroke="' + GOLD + '" stroke-width="8"/></g>' +
      emblem(78, 100, 250) + txt(368, 192, 'HOLLYBALL', 84, { w: 900 }) + txt(372, 244, 'ASSOCIATION', 50, { w: 800, f: GOLD, ls: 14 }) + txt(370, 276, 'Le nouveau souffle du sport collectif.', 26, { w: 500, st: 'italic' }) +
      txt(1455, 155, 'LICENCE OFFICIELLE', 56, { f: '#fff', a: 'end', w: 800, tl: 440 }) + txt(1455, 208, t, 40, { f: '#fff', a: 'end', w: 700 }) +
      '<rect x="1100" y="231" width="356" height="46" rx="14" fill="' + GOLD + '"/>' + txt(1278, 266, 'SAISON ' + saison, 31, { a: 'middle', w: 800 }) +
      photo + '<path d="M82 644 H370 V668 A24 24 0 0 1 346 692 H106 A24 24 0 0 1 82 668 Z" fill="' + NAVY + '"/>' + txt(226, 678, 'PHOTO', 28, { f: '#fff', a: 'middle', w: 600 }) +
      txt(407, 356, 'NOM :', 27) + line(357, 498) + val(506, 351, sp.nom, 560) +
      txt(407, 408, 'PRÉNOM :', 27) + line(411, 550) + val(558, 404, sp.prenom, 510) +
      txt(407, 460, 'DATE DE NAISSANCE :', 27) + '<line x1="692" y1="460" x2="936" y2="460" stroke="#3a5a99" stroke-width="2"/>' + val(708, 454, o.masque ? '••/••/••••' : nais, 232) + txt(950, 462, '(JJ/MM/AAAA)', 20, { w: 400 }) +
      txt(407, 513, 'SEXE :', 27) + '<rect x="603" y="493" width="24" height="24" rx="4" fill="none" stroke="' + NAVY + '" stroke-width="2.5"/>' + txt(641, 513, 'M', 26) + '<rect x="720" y="493" width="24" height="24" rx="4" fill="none" stroke="' + NAVY + '" stroke-width="2.5"/>' + txt(757, 513, 'F', 26) +
      (sx === 'M' ? '<path d="M608 505 l7 8 l11 -15" fill="none" stroke="' + NAVY + '" stroke-width="5"/>' : sx === 'F' ? '<path d="M725 505 l7 8 l11 -15" fill="none" stroke="' + NAVY + '" stroke-width="5"/>' : '') +
      txt(407, 564, 'NATIONALITÉ :', 27) + line(565, 612) + val(620, 559, d.nationalite, 450) +
      txt(407, 616, 'ÉQUIPE :', 27) + line(616, 598) + val(606, 610, d.club, 460) +
      txt(407, 672, 'POSTE :', 27) + line(670, 598) + val(606, 664, d.poste, 460) +
      txt(407, 728, 'N° LICENCE :', 27) + line(727, 598) + val(606, 721, d.id, 460) +
      txt(1252, 637, 'STRATÉGIE', 29) + txt(1252, 675, 'AGILITÉ', 29) + txt(1252, 712, 'PUISSANCE', 29) + '<rect x="1252" y="731" width="90" height="5" fill="' + GOLD + '"/>' +
      txt(1253, 806, 'LE PRÉSIDENT', 22, { w: 600, ls: 2, a: 'middle', t: '' }).replace('x="1253"', 'x="1253"') + '<line x1="1105" y1="861" x2="1407" y2="861" stroke="' + NAVY + '" stroke-width="2"/>' + txt(1257, 900, 'HOLLYBALL ASSOCIATION', 22, { w: 600, a: 'middle' }) +
      '<circle cx="130" cy="866" r="45" fill="none" stroke="' + GOLD + '" stroke-width="5"/><circle cx="132" cy="835" r="8" fill="' + GOLD + '"/><path d="M135 846 L120 872 L98 886 M120 872 L140 884 L136 905 M135 846 L158 862 L170 856" fill="none" stroke="' + GOLD + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      txt(192, 862, 'HOLLYBALL', 41, { f: '#fff', w: 900 }) + txt(194, 896, 'ASSOCIATION', 27, { f: '#fff', w: 600, ls: 5 }) +
      barcode(d.id, 595, 802, 340, 70) + txt(765, 910, d.id, 28, { a: 'middle', w: 700 }) +
      '</svg>';
    return s;
  }
  var VALEURS = ['RESPECT', 'DISCIPLINE', 'EXCELLENCE', 'INNOVATION', 'INCLUSION', 'COURAGE', 'SOLIDARITÉ', 'RESPONSABILITÉ'];
  var INFOS = [['Cette licence est personnelle et incessible.'], ['Elle est valable pour la saison en cours uniquement.'], ['Elle doit être présentée lors de toute compétition,', 'entraînement ou contrôle.'],
    ['Toute falsification ou usage frauduleux peut entraîner', 'des sanctions disciplinaires.'], ['En cas de perte, un duplicata peut être délivré', 'sur demande auprès de la Hollyball Association.']];
  function verso(d, url) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1024" role="img" aria-label="Licence officielle Hollyball Association, verso" style="width:100%;height:auto;display:block;border-radius:3%">' +
      '<defs><clipPath id="hbv"><rect x="34" y="40" width="1468" height="940" rx="46"/></clipPath><linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + GOLD2 + '"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient></defs>' +
      '<rect width="1536" height="1024" fill="#eef1f5"/><g clip-path="url(#hbv)"><rect x="34" y="40" width="1468" height="940" fill="#f5f7fb"/><rect x="34" y="40" width="540" height="940" fill="' + NAVY + '"/><rect x="560" y="40" width="9" height="940" fill="url(#hbg)"/>' +
      '<g opacity=".07"><svg x="1130" y="300" width="400" height="200" viewBox="0 0 340 170"><image href="logo-carte.png" width="340" height="266"/></svg></g>' +
      '<path d="M1180 980 C1330 975 1440 930 1502 840 V980 Z" fill="' + NAVY + '"/><path d="M1180 980 C1330 975 1440 935 1502 845" fill="none" stroke="' + GOLD + '" stroke-width="6"/></g>' +
      '<rect x="120" y="70" width="360" height="180" rx="26" fill="#fff"/><svg x="170" y="82" width="260" height="130" viewBox="0 0 340 170"><image href="logo-carte.png" width="340" height="266"/></svg>' + txt(300, 238, 'HOLLYBALL ASSOCIATION', 24, { a: 'middle', w: 900 }) +
      '<line x1="100" y1="372" x2="505" y2="372" stroke="' + GOLD + '" stroke-width="3"/>';
    VALEURS.forEach(function (v, i) { var y = 413 + i * 49.5; s += '<circle cx="127" cy="' + (y - 9) + '" r="24" fill="none" stroke="' + GOLD + '" stroke-width="3"/><circle cx="127" cy="' + (y - 9) + '" r="8" fill="' + GOLD + '"/>' + txt(182, y, v, 27, { f: '#fff', w: 600 }); });
    s += txt(136, 868, "Ensemble pour", 44, { f: GOLD, st: 'italic', w: 700, t: 'rotate(-9 136 868)' }) + txt(122, 922, "un sport d'avenir !", 44, { f: GOLD, st: 'italic', w: 700, t: 'rotate(-9 122 922)' }) +
      '<path d="M150 950 C260 925 370 905 480 885" fill="none" stroke="' + GOLD + '" stroke-width="5"/>' +
      txt(632, 135, 'INFORMATIONS IMPORTANTES', 49, { w: 800 }) + '<rect x="632" y="157" width="560" height="4" fill="' + GOLD + '"/>';
    var y = 214; INFOS.forEach(function (b) { s += '<circle cx="642" cy="' + (y - 9) + '" r="8" fill="' + GOLD + '"/>'; b.forEach(function (ln, k) { s += txt(672, y + k * 38, ln, 29, { w: 500 }); }); y += 38 * b.length + 14; });
    s += '<rect x="642" y="598" width="168" height="162" rx="6" fill="#fff" stroke="' + GOLD + '" stroke-width="4"/>' + qrSvg(url, 652, 603, 148) +
      '<line x1="852" y1="600" x2="852" y2="760" stroke="' + GOLD + '" stroke-width="3"/>' + txt(893, 624, 'HOLLYBALL ASSOCIATION', 31, { w: 800 }) +
      '<rect x="893" y="645" width="34" height="24" rx="3" fill="' + NAVY + '"/><path d="M893 647 L910 661 L927 647" fill="none" stroke="#fff" stroke-width="2.5"/>' + txt(946, 668, 'Hollyballassociation@gmail.com', 27, { w: 500 }) +
      '<circle cx="910" cy="707" r="17" fill="none" stroke="' + NAVY + '" stroke-width="3"/><ellipse cx="910" cy="707" rx="7" ry="17" fill="none" stroke="' + NAVY + '" stroke-width="2"/><line x1="893" y1="707" x2="927" y2="707" stroke="' + NAVY + '" stroke-width="2"/>' + txt(946, 716, 'Hollyballassociation.github.io/', 27, { w: 500 }) +
      '<circle cx="910" cy="752" r="17" fill="' + NAVY + '"/><path d="M903 745 q-2 8 8 14 q4 1 6 -3 l-4 -3 l-3 2 q-4 -2 -5 -6 l2 -2 l-3 -4 z" fill="#fff"/>' + txt(946, 761, '+243 859 490 857', 27, { w: 500 }) +
      '<rect x="633" y="793" width="818" height="140" rx="26" fill="#e6ebf3"/>' + txt(1042, 830, 'Licence délivrée par', 25, { a: 'middle', w: 500 }) + txt(1042, 866, 'HOLLYBALL ASSOCIATION ASBL', 30, { a: 'middle', w: 800 }) + '<rect x="878" y="880" width="328" height="4" fill="' + GOLD + '"/>' + txt(1042, 917, 'Siège : Kinshasa - RDC', 25, { a: 'middle', w: 500 }) +
      '</svg>';
    return s;
  }
  function urlCarte(token) { return SITE + 'licence.html?c=' + encodeURIComponent(token); }
  window.HolCarte = { recto: recto, verso: verso, url: urlCarte, split: split, dateFr: dateFr, SITE: SITE };
})();
