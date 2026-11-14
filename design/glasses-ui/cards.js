/* Sink unclogging: state cards for Meta Ray-Ban Display (600x600). MASTER FILE.
   Follows meta-display-design-guide.html: Noto Sans, text #F2F2F2, accent #00D4FF with focus glow,
   warning #FFAA00, docked button rail >= 88 px. Background is left empty (on the glasses, empty = black = see-through).
   Motion follows Meta's web-app motion rules: only transform and opacity (plus stroke-dashoffset) animate, every loop
   is interruptible, the un-animated "rest pose" is a complete still card (used for PNG exports and as the
   reduced-motion fallback). Each card's svg carries its own <style>, so a single .svg file animates on its own. */
(function (root) {
  var C = { text: '#F2F2F2', dim: '#9AA0A6', hdr: '#C9CDD2', cy: '#00D4FF', am: '#FFAA00', gr: '#34E089', rd: '#FF4D4D', surf: 'rgba(255,255,255,0.13)' };

  /* ---------- motion (shared keyframes, embedded in every card) ---------- */
  var MOTION =
    '.fb{transform-box:fill-box;transform-origin:center}' +
    '.ccw{animation:ccw 1.6s linear infinite}@keyframes ccw{to{transform:rotate(-360deg)}}' +
    '.cw{animation:cw 1.6s linear infinite}@keyframes cw{to{transform:rotate(360deg)}}' +
    '.pulse{animation:pulse 1.4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}' +
    '.blink{animation:blink 1.2s steps(1) infinite}@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}' +
    '.fall{animation:fall 1.2s ease-in infinite}@keyframes fall{0%{transform:translateY(-26px);opacity:0}20%,75%{opacity:1}100%{transform:translateY(34px);opacity:0}}' +
    '.lift{animation:lift 2s ease-in-out infinite}@keyframes lift{0%,12%{transform:translateY(44px)}55%,85%{transform:translateY(0)}100%{transform:translateY(44px)}}' +
    '.rise{animation:rise 2.2s cubic-bezier(.2,.8,.2,1) infinite}@keyframes rise{0%{transform:translateY(70px);opacity:0}35%,85%{transform:translateY(0);opacity:1}100%{transform:translateY(0);opacity:0}}' +
    '.toL{animation:toL 2.2s cubic-bezier(.4,0,.2,1) infinite}@keyframes toL{0%,10%{transform:translateX(0)}55%,85%{transform:translateX(-84px)}100%{transform:translateX(0)}}' +
    '.toR{animation:toR 2.2s cubic-bezier(.4,0,.2,1) infinite}@keyframes toR{0%,10%{transform:translateX(0)}55%,85%{transform:translateX(84px)}100%{transform:translateX(0)}}' +
    '.nudgeL{animation:nudgeL 1.1s ease-in-out infinite}@keyframes nudgeL{0%,100%{transform:translateX(0)}50%{transform:translateX(-14px)}}' +
    '.nudgeR{animation:nudgeR 1.1s ease-in-out infinite}@keyframes nudgeR{0%,100%{transform:translateX(0)}50%{transform:translateX(14px)}}' +
    '.nudgeU{animation:nudgeU 1.1s ease-in-out infinite}@keyframes nudgeU{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}' +
    '.scan{animation:scan 2.4s ease-in-out infinite}@keyframes scan{0%,100%{transform:translateY(-92px)}50%{transform:translateY(92px)}}' +
    '.chev{animation:chev 1.2s ease-in-out infinite}@keyframes chev{0%,100%{opacity:.18}45%{opacity:1}}' +
    '.d1{animation-delay:.2s}.d2{animation-delay:.4s}.d3{animation-delay:.6s}' +
    '.draw{stroke-dasharray:170;animation:draw 2.6s ease-out infinite}@keyframes draw{0%{stroke-dashoffset:170}35%,100%{stroke-dashoffset:0}}' +
    '.pop{animation:pop 2.6s ease-out infinite}@keyframes pop{0%{transform:scale(.6);opacity:0}25%{transform:scale(1.1);opacity:1}40%,100%{transform:scale(1);opacity:1}}' +
    '.breathe{animation:breathe 2.4s ease-in-out infinite}@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}' +
    '.bob{animation:bob 1.8s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}' +
    '.heat{animation:heat 1.6s ease-out infinite}@keyframes heat{0%{transform:translateY(16px);opacity:0}40%{opacity:1}100%{transform:translateY(-22px);opacity:0}}' +
    '.fly{animation:fly 2s ease-in-out infinite}@keyframes fly{0%,100%{transform:translate(0,0)}50%{transform:translate(12px,-9px)}}' +
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}' +
    '.still *{animation:none!important}';

  /* ---------- building blocks ---------- */
  function wrap(id, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" font-family="\'Noto Sans\', system-ui, sans-serif">' +
      '<style>' + MOTION + '</style>' +
      '<defs><filter id="glow-' + id + '" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      ['cy', 'am', 'text'].map(function (k) {
        return '<marker id="ah-' + k + '-' + id + '" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + C[k] + '"/></marker>';
      }).join('') + '</defs>' + inner + '</svg>';
  }
  function hero(inner, y, s) {
    return '<g transform="translate(300,' + (y || 250) + ') scale(' + (s || 1) + ')" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="12">' + inner + '</g>';
  }
  /* animated wrapper: never put a transform attribute on the same element as an animation class */
  function A(cls, inner) { return '<g class="fb ' + cls + '">' + inner + '</g>'; }
  function word(t, color, y, size) {
    return '<text x="300" y="' + (y || 448) + '" text-anchor="middle" font-size="' + (size || 40) + '" font-weight="700" fill="' + (color || C.text) + '">' + t + '</text>';
  }
  function sub(t, y) {
    return '<text x="300" y="' + (y || 494) + '" text-anchor="middle" font-size="24" font-weight="500" fill="' + C.dim + '">' + t + '</text>';
  }
  function dots(n, total) {
    var gap = 22, w = (total - 1) * gap + 18, x = 300 - w / 2, s = '';
    for (var i = 1; i <= total; i++) {
      if (i === n) { s += '<rect x="' + (x - 6) + '" y="40" width="30" height="12" rx="6" fill="' + C.text + '"/>'; x += 36; continue; }
      s += '<circle cx="' + x + '" cy="46" r="6" fill="' + (i < n ? C.cy : 'rgba(255,255,255,0.3)') + '"/>';
      x += gap;
    }
    return s;
  }
  /* header: camera is live (red dot blinks while frames are sent) */
  function cam() {
    return '<g class="blink"><circle cx="281" cy="46" r="7" fill="' + C.rd + '"/></g><g fill="none" stroke="' + C.hdr + '" stroke-width="2.6" stroke-linejoin="round"><rect x="296" y="37" width="26" height="18" rx="4"/><circle cx="309" cy="46" r="4.5"/></g>';
  }
  var glyph = {
    check: '<path d="M-11 0L-3 8L12-8"/>',
    x: '<path d="M-9-9L9 9M9-9L-9 9"/>',
    send: '<path d="M-12-2L12-12L4 12L0 2Z"/>',
    play: '<path d="M-7-10L10 0L-7 10Z" fill="currentColor"/>'
  };
  function rail(id, btns) {
    var w = 260, out = '';
    btns.forEach(function (b, i) {
      var x = 32 + i * (w + 16), cx = x + w / 2, tw = b.label.length * 13.5, gw = b.icon ? 38 : 0, start = cx - (tw + gw) / 2;
      var col = b.focus ? C.cy : C.text;
      out += '<g' + (b.focus ? ' filter="url(#glow-' + id + ')"' : '') + '><rect x="' + x + '" y="484" width="' + w + '" height="88" rx="44" fill="' + (b.focus ? 'rgba(0,212,255,0.16)' : C.surf) + '"' + (b.focus ? ' stroke="' + C.cy + '" stroke-width="2.5"' : '') + '/></g>';
      if (b.icon) out += '<g transform="translate(' + (start + 14) + ',528)" fill="none" stroke="' + col + '" color="' + col + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + glyph[b.icon] + '</g>';
      out += '<text x="' + (start + gw + tw / 2) + '" y="536" text-anchor="middle" font-size="24" font-weight="600" fill="' + col + '">' + b.label + '</text>';
    });
    return out;
  }

  /* ---------- icons (local coords, roughly -110..110) ---------- */
  var DROP = 'M0-14C8-4 10 2 10 5A10 10 0 0 1-10 5C-10 2-8-4 0-14Z';
  function drop(x, y, s, col, cls) {
    var d = '<path transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="' + DROP + '" fill="' + col + '" stroke="none"/>';
    return cls ? A(cls, d) : d;
  }
  function mic(col, waves) {
    var s = '<g stroke="' + col + '"><rect x="-32" y="-100" width="64" height="116" rx="32"/><path d="M-62-12A62 62 0 0 0 62-12"/><path d="M0 50V88M-34 88H34"/></g>';
    if (waves) s += '<g stroke="' + col + '" stroke-width="9">' +
      A('pulse', '<path d="M-92-74Q-120-34-92 6" opacity=".7"/>') + A('pulse d2', '<path d="M-124-92Q-164-34-124 24" opacity=".4"/>') +
      A('pulse', '<path d="M92-74Q120-34 92 6" opacity=".7"/>') + A('pulse d2', '<path d="M124-92Q164-34 124 24" opacity=".4"/>') + '</g>';
    return s;
  }
  function camera(col) {
    return '<g stroke="' + col + '"><rect x="-90" y="-50" width="180" height="120" rx="22"/><path d="M-40-50L-26-74H26L40-50"/><circle cx="0" cy="10" r="34"/></g>';
  }
  function sink(col, water) {
    return '<g stroke="' + col + '"><path d="M-40-46V-104H24V-82"/><path d="M-110-40H110Q104 62 0 62Q-104 62-110-40Z"/></g>' +
      (water ? '<path d="M-86-12Q-64-24-43-12T0-12T43-12T86-12" stroke="' + water + '" stroke-width="9"/>' : '');
  }
  function trap(col) {
    return '<path d="M-50-112V-10A50 50 0 0 0 50-10V-50H112" stroke="' + col + '" stroke-width="22"/>' +
      '<rect x="-68" y="-62" width="36" height="22" rx="5" stroke="' + C.cy + '" stroke-width="7"/><rect x="32" y="-36" width="36" height="22" rx="5" stroke="' + C.cy + '" stroke-width="7"/>';
  }
  /* turning arrow around a nut; an invisible circle pins the rotation centre to the nut */
  function turn(id, cx, cy, cw) {
    var arc = cw
      ? '<path d="M' + (cx - 36) + ' ' + cy + 'A36 36 0 1 1 ' + cx + ' ' + (cy + 36) + '" stroke="' + C.cy + '" stroke-width="8" marker-end="url(#ah-cy-' + id + ')"/>'
      : '<path d="M' + (cx + 36) + ' ' + cy + 'A36 36 0 1 0 ' + cx + ' ' + (cy + 36) + '" stroke="' + C.cy + '" stroke-width="8" marker-end="url(#ah-cy-' + id + ')"/>';
    return A(cw ? 'cw' : 'ccw', '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="none" stroke="none"/>' + arc);
  }
  function bucket(col, dashed) {
    return '<g stroke="' + col + '"' + (dashed ? ' stroke-dasharray="14 12" stroke-width="7"' : '') + '><path d="M-80 44H80L66 122H-66Z"/><path d="M-94 44H94"/>' + (dashed ? '' : '<path d="M-70 44Q0-4 70 44" stroke-width="6" opacity=".6"/>') + '</g>';
  }
  function chevrons(rot) {
    var s = '';
    [[0, .3, ''], [46, .6, ' d2'], [92, 1, ' d3']].forEach(function (c) { s += A('chev' + c[2], '<path d="M-62 ' + (c[0] - 26) + 'L0 ' + (c[0] + 26) + 'L62 ' + (c[0] - 26) + '" opacity="' + c[1] + '"/>'); });
    return '<g transform="rotate(' + rot + ')" stroke="' + C.cy + '" stroke-width="14"><g transform="translate(0,-46)">' + s + '</g></g>';
  }
  function badgeCheck(x, y) {
    return A('pop', '<circle cx="' + x + '" cy="' + y + '" r="32" fill="' + C.gr + '" stroke="none"/><path d="M' + (x - 14) + ' ' + y + 'L' + (x - 4) + ' ' + (y + 10) + 'L' + (x + 15) + ' ' + (y - 10) + '" stroke="#0B0E11" stroke-width="7"/>');
  }
  function triangle(col) {
    return '<g stroke="' + col + '"><path d="M0-108L114 92H-114Z"/><path d="M0-36V22"/></g><circle cx="0" cy="54" r="8" fill="' + col + '" stroke="none"/>';
  }

  /* ---------- the cards ---------- */
  var T = [];
  function add(o) { T.push(o); }

  // Start
  add({ id: 'ready', group: 'Start', name: 'Ready', motion: 'centre dot breathes',
    earcon: 'none (display stays dark)', voice: '',
    draw: function () { return hero('<circle r="58" stroke="' + C.dim + '" stroke-width="6"/>' + A('breathe', '<circle r="14" fill="' + C.cy + '" stroke="none"/>'), 250) + word('Ready', C.dim); } });
  add({ id: 'listening', group: 'Start', name: 'Listening', motion: 'sound waves pulse outward',
    earcon: 'rising two-note chime', voice: '(wearer speaks)',
    draw: function () { return hero(mic(C.cy, true), 240) + word('Listening'); } });
  add({ id: 'thinking', group: 'Start', name: 'One moment', motion: 'dots pulse in turn',
    earcon: 'soft ticking loop after 1 s', voice: '“Still looking…” after 3 s',
    draw: function () { return hero(A('pulse', '<circle cx="-62" r="18" fill="' + C.cy + '" stroke="none"/>') + A('pulse d1', '<circle r="18" fill="' + C.cy + '" stroke="none"/>') + A('pulse d2', '<circle cx="62" r="18" fill="' + C.cy + '" stroke="none"/>'), 250) + word('One moment'); } });
  add({ id: 'scanning', group: 'Start', name: 'Scanning', motion: 'scan line sweeps up and down',
    earcon: 'camera shutter click, then low hum', voice: '“Let me take a look.”',
    draw: function () {
      return cam() + hero('<g stroke="' + C.text + '" stroke-width="10"><path d="M-110-50V-110H-50"/><path d="M50-110H110V-50"/><path d="M110 50V110H50"/><path d="M-50 110H-110V50"/></g>' + A('scan', '<path d="M-92 4H92" stroke="' + C.cy + '" stroke-width="6"/>'), 245) + word('Scanning');
    } });
  [['down', 0, 300, 462, 'under the sink'], ['left', 90, 112, 300, 'to the left'], ['right', -90, 488, 300, 'to the right'], ['up', 180, 300, 150, 'up']].forEach(function (d) {
    add({ id: 'look-' + d[0], group: 'Look this way', name: 'Look ' + d[0], motion: 'chevrons ripple toward the ' + (d[0] === 'down' || d[0] === 'up' ? d[0] : d[0] + ' edge'),
      earcon: 'spatial ping from the ' + (d[0] === 'down' ? 'floor' : d[0] === 'up' ? 'ceiling' : d[0] + ' side') + ', repeats until in view', voice: '“Look ' + d[4] + ', please.”',
      draw: function () {
        var wy = d[0] === 'up' ? 360 : d[0] === 'down' ? 270 : 316, ey = wy - 92;
        return cam() + '<g transform="translate(' + d[2] + ',' + d[3] + ')" fill="none" stroke-linecap="round" stroke-linejoin="round">' + chevrons(d[1]) + '</g>' +
          hero('<path d="M-90 0Q0-64 90 0Q0 64-90 0Z" stroke="' + C.text + '" stroke-width="12"/><circle r="24" stroke="' + C.text + '"/>', ey, .55) + word('Look ' + d[0], C.text, wy + 6, 44);
      } });
  });

  // Check
  add({ id: 'confirm', group: 'Check', name: 'Is that it?', motion: 'still (waiting for an answer)',
    earcon: 'neutral question tone', voice: '“I see a sink full of standing water. Is that it?”',
    draw: function () { return cam() + hero(sink(C.text, C.cy), 200, .9) + word('Clogged sink?', C.text, 398, 36) + rail('confirm', [{ label: 'Yes', icon: 'check', focus: true }, { label: 'No', icon: 'x' }]); } });
  add({ id: 'safety', group: 'Check', name: 'Drain cleaner?', motion: 'warning badge pulses',
    earcon: 'caution tone (two short mid notes)', voice: '“Have you poured any drain cleaner in today?”',
    draw: function () {
      return hero('<g stroke="' + C.text + '"><path d="M-50-30H50V90Q50 100 40 100H-40Q-50 100-50 90Z"/><path d="M-20-30V-72H20V-30"/><rect x="-28" y="-98" width="56" height="26" rx="6"/></g>' +
        A('pulse', '<g transform="translate(70,48) scale(.42)">' + triangle(C.am) + '</g>'), 196, .9) + word('Drain cleaner?', C.am, 398, 36) + rail('safety', [{ label: 'No', focus: true }, { label: 'Yes' }]);
    } });

  // Steps
  var steps = [
    { id: 'step-1-stopper', name: 'Pull the stopper', w: 'Stopper out', motion: 'stopper lifts out of the drain, arrow pulses',
      icon: function () {
        return '<path d="M-110 10H110Q104 100 0 100Q-104 100-110 10Z" stroke="' + C.text + '"/><ellipse cx="0" cy="40" rx="18" ry="6" stroke="' + C.dim + '" stroke-width="6"/>' +
          A('lift', '<rect x="-20" y="-58" width="40" height="52" rx="12" stroke="' + C.cy + '"/><path d="M-18-24q9 8 18 0t18 0" stroke="' + C.dim + '" stroke-width="6"/>') +
          A('pulse', '<path d="M0-80V-118M-22-96L0-118L22-96" stroke="' + C.cy + '"/>');
      }, voice: '“Pull the stopper straight up and out.”' },
    { id: 'step-2-bucket', name: 'Bucket under the pipe', w: 'Bucket under', motion: 'bucket slides up into place under the pipe',
      icon: function () { return '<g transform="translate(0,-40) scale(.7)">' + trap(C.text) + '</g>' + A('rise', bucket(C.cy)); }, voice: '“Put the bucket under the U-shaped pipe.”' },
    { id: 'step-3-unscrew', name: 'Unscrew by hand', w: 'Unscrew', motion: 'arrows circle both nuts anticlockwise',
      icon: function () { return '<g transform="translate(0,20)">' + trap(C.text) + '</g>' + turn('step-3-unscrew', -50, -31, false) + turn('step-3-unscrew', 50, -5, false); }, voice: '“Turn both nuts left, by hand.”' },
    { id: 'step-4-rinse', name: 'Empty and rinse', w: 'Rinse', motion: 'water drops fall into the pipe',
      icon: function () { return '<path d="M-50-60V10A50 50 0 0 0 50 10V-60" stroke="' + C.text + '" stroke-width="22"/>' + drop(-50, -100, 1.6, C.cy, 'fall') + drop(0, -88, 1.3, C.cy, 'fall d2') + drop(50, -100, 1.6, C.cy, 'fall d1'); }, voice: '“Empty the pipe into the bucket and rinse it.”' },
    { id: 'step-5-refit', name: 'Screw back on', w: 'Hand-tight', motion: 'arrows circle both nuts clockwise',
      icon: function () { return '<g transform="translate(0,20)">' + trap(C.text) + '</g>' + turn('step-5-refit', -50, -31, true) + turn('step-5-refit', 50, -5, true); }, voice: '“Screw it back on, hand-tight.”' },
    { id: 'step-6-water', name: 'Run the water', w: 'Run water', motion: 'water falls from the tap',
      icon: function () { return '<g stroke="' + C.text + '"><path d="M-104-50H10Q50-50 50-10V0"/><path d="M-40-50V-86M-66-86H-14"/></g>' + drop(50, 40, 1.6, C.cy, 'fall') + drop(50, 78, 1.6, C.cy, 'fall d2') + drop(50, 112, 1.6, C.cy, 'fall d3'); }, voice: '“Run the tap for a few seconds.”' }
  ];
  steps.forEach(function (s, i) {
    add({ id: s.id, group: 'Repair steps', name: 'Step ' + (i + 1) + ': ' + s.name, motion: s.motion,
      earcon: 'soft step tick', voice: s.voice,
      draw: function () { return dots(i + 1, steps.length) + hero(s.icon(), 250) + word(s.w); } });
  });

  // Feedback
  add({ id: 'correct', group: 'Feedback', name: 'Correct', motion: 'check mark draws itself',
    earcon: 'bright up-chime', voice: '“Yes, that’s right.”',
    draw: function () { return hero('<circle r="100" stroke="' + C.gr + '"/><path class="draw" d="M-48 4L-12 40L54-36" stroke="' + C.gr + '" stroke-width="16"/>', 250) + word('Correct', C.gr); } });
  add({ id: 'next', group: 'Feedback', name: 'Next step', motion: 'arrow nudges forward',
    earcon: 'soft forward whoosh', voice: '“Next…”',
    draw: function () { return hero('<circle r="100" stroke="' + C.cy + '"/>' + A('nudgeR', '<path d="M-52 0H46M8-38L48 0L8 38" stroke="' + C.cy + '" stroke-width="16"/>'), 250) + word('Next step'); } });
  add({ id: 'try-again', group: 'Feedback', name: 'Try again', motion: 'retry arrow spins',
    earcon: 'low double buzz', voice: '“Not quite. Let’s try that again.”',
    draw: function () { return hero(A('cw', '<circle r="80" fill="none" stroke="none"/><path d="M-76-26A80 80 0 1 1-76 26" stroke="' + C.am + '" stroke-width="16" marker-end="url(#ah-am-try-again)"/>'), 250) + word('Try again', C.am); } });
  [['left', 'toL', 'nudgeL', 84, '“Move the bucket a little to the left.”'], ['right', 'toR', 'nudgeR', -84, '“Move the bucket a little to the right.”']].forEach(function (m) {
    add({ id: 'move-bucket-' + m[0], group: 'Feedback', name: 'Move bucket ' + m[0], motion: 'bucket slides ' + m[0] + ' into the dashed target, arrow nudges',
      earcon: 'directional ping from the ' + m[0] + ' side', voice: m[4],
      draw: function () {
        var dir = m[0] === 'left' ? -1 : 1;
        return cam() + hero('<g transform="translate(0,-74) scale(.6)">' + trap(C.text) + '</g>' +
          bucket(C.dim, true) +
          '<g transform="translate(' + m[3] + ',0)">' + A(m[1], bucket(C.cy)) + '</g>' +
          A(m[2], '<path d="M' + (-40 * dir) + ' 6H' + (40 * dir) + 'M' + (18 * dir) + '-14L' + (40 * dir) + ' 6L' + (18 * dir) + ' 26" stroke="' + C.cy + '" stroke-width="10"/>'), 230, .85) +
          word('Move ' + m[0]);
      } });
  });
  add({ id: 'careful', group: 'Feedback', name: 'Careful', motion: 'triangle pulses',
    earcon: 'alert tone (three quick notes)', voice: '“Careful, the water in the pipe will spill.”',
    draw: function () { return hero(A('pulse', triangle(C.am)), 250) + word('Careful', C.am); } });
  add({ id: 'drain-clear', group: 'Feedback', name: 'Drain clear', motion: 'drop bobs, check badge pops in',
    earcon: 'three-note rising success chime', voice: '“The water’s going down. Fixed.”',
    draw: function () { return hero(A('bob', '<path transform="scale(7)" d="' + DROP + '" stroke="' + C.cy + '" stroke-width="1.8"/>') + badgeCheck(62, 62), 250) + word('Drain clear', C.gr); } });

  // Hard stop
  add({ id: 'stop-water', group: 'Hard stop', name: 'Stop water', motion: 'octagon pulses',
    earcon: 'urgent pulsing tone, repeats twice', voice: '“Stop running water. The building’s drain is blocked. Send it to maintenance?”',
    draw: function () {
      return hero(A('pulse', '<path d="M42-102L102-42V42L42 102H-42L-102 42V-42L-42-102Z" stroke="' + C.rd + '"/>') + '<path transform="translate(0,4) scale(3.6)" d="' + DROP + '" stroke="' + C.text + '" stroke-width="3"/><path d="M-50-50L50 50" stroke="' + C.text + '"/>', 200, .9) +
        word('Stop water', C.rd, 398, 36) + rail('stop-water', [{ label: 'Send', icon: 'send', focus: true }, { label: 'Later' }]);
    } });
  add({ id: 'sent', group: 'Hard stop', name: 'Sent to maintenance', motion: 'plane drifts forward, badge pops in',
    earcon: 'confirmation chime', voice: '“Sent. They’ll contact you.”',
    draw: function () { return hero(A('fly', '<path d="M-104 0L100-84L40 92L8 22Z M8 22L100-84" stroke="' + C.cy + '"/>') + badgeCheck(70, 70), 250) + word('Sent') + sub('To maintenance'); } });

  // Device and privacy
  add({ id: 'all-off', group: 'Device and privacy', name: 'All off', motion: 'still (nothing is running)',
    earcon: 'descending two-note chime', voice: '“Camera and microphone are off.”',
    draw: function () { return hero('<g transform="translate(-74,0) scale(.62)">' + mic(C.dim, false) + '</g><g transform="translate(76,0) scale(.62)">' + camera(C.dim) + '</g><path d="M-140-96L140 96" stroke="' + C.text + '" stroke-width="10"/>', 250) + word('All off') + sub('Not recording'); } });
  add({ id: 'offline', group: 'Device and privacy', name: 'Offline', motion: 'outer signal arcs blink',
    earcon: 'two falling notes (works without network)', voice: '“I’ve lost the internet. Your place is saved.”',
    draw: function () { return hero('<g stroke="' + C.am + '">' + A('pulse', '<path d="M-104-30A148 148 0 0 1 104-30" opacity=".45"/>') + A('pulse d2', '<path d="M-68 8A96 96 0 0 1 68 8" opacity=".45"/>') + '<path d="M-32 44A46 46 0 0 1 32 44"/><path d="M-104-98L104 102"/></g><circle cx="0" cy="80" r="9" fill="' + C.am + '" stroke="none"/>', 240) + word('Offline', C.am) + sub('Step saved'); } });
  add({ id: 'low-battery', group: 'Device and privacy', name: 'Low battery', motion: 'last bar blinks',
    earcon: 'single low tone, once', voice: '“Your glasses battery is low. About ten minutes left.”',
    draw: function () { return hero('<rect x="-104" y="-52" width="186" height="104" rx="18" stroke="' + C.am + '"/><rect x="88" y="-22" width="16" height="44" rx="4" fill="' + C.am + '" stroke="none"/>' + A('blink', '<rect x="-84" y="-32" width="30" height="64" rx="6" fill="' + C.am + '" stroke="none"/>'), 250) + word('10 min left', C.am); } });
  add({ id: 'cooling', group: 'Device and privacy', name: 'Cooling down', motion: 'heat waves rise',
    earcon: 'single low tone', voice: '“The glasses are warm, so I’ve paused the camera. I can still help by voice.”',
    draw: function () { return hero('<g stroke="' + C.am + '"><path d="M-18 40V-80A18 18 0 0 1 18-80V40"/><circle cx="0" cy="66" r="34"/><path d="M0 60V-30" stroke-width="10"/>' + A('heat', '<path d="M58-70q14 16 0 32t0 32" stroke-width="9"/>') + A('heat d3', '<path d="M90-70q14 16 0 32t0 32" stroke-width="9" opacity=".5"/>') + '</g>', 240) + word('Cooling down', C.am) + sub('Camera off'); } });
  add({ id: 'paused', group: 'Device and privacy', name: 'Paused', motion: 'pause ring breathes',
    earcon: 'soft two-note pause chime', voice: '“Welcome back. Resume at step three?”',
    draw: function () { return hero(A('breathe', '<circle r="100" stroke="' + C.cy + '"/><path d="M-28-42V42M28-42V42" stroke="' + C.cy + '" stroke-width="18"/>'), 200, .9) + word('Paused', C.text, 398, 36) + rail('paused', [{ label: 'Resume', icon: 'play', focus: true }, { label: 'End' }]); } });

  T.forEach(function (t, i) {
    t.no = i + 1;
    t.base = String(i + 1).padStart(2, '0') + '-' + t.id;
    t.file = t.base + '.png';
    t.svg = wrap(t.id, t.draw());
  });
  root.SINK_CARDS = T;
})(typeof window !== 'undefined' ? window : this);
