/* OP/AL public tool: the bar at the bottom is built from the tool's own controls, so every
   controller the Lab has for this engine is here too — sliders, menus, colours, switches, buttons.
   Each one is a proxy: moving it moves the hidden original, which the engine already listens to.
   The blinking caret lives in the artwork itself (the engine tells us where the last glyph ends). */
(function(){
  var $=function(id){ return document.getElementById(id); };

  /* Embedded: show the instrument only. Being in a frame is the test that
     matters — a tool inside the overlay, or stacked live in a case study, is
     embedded whether or not the flag survived the trip. (It often doesn't: a
     static server that rewrites `/x.html` to `/x` drops the query with it.)
     The flag stays as well, for a frame we don't own. */
  if (window.parent !== window ||
      /(?:^|[?&])embed=1(?:&|$)/.test(location.search)) {
    document.documentElement.classList.add('is-embed');
  }

  /* Play: the instrument with its dock put away. The engine, the defaults and
     the artwork are exactly as they are everywhere else — what goes is the rail
     of sliders, so what is left is the one gesture the thing is actually for.
     The full instrument is always a click away; this is the front door to it. */
  if (/(?:^|[?&])play=1(?:&|$)/.test(location.search)) {
    document.documentElement.classList.add('is-play');
  }

  /* A stage is a frame that is not a window: an instrument set live into a case
     study. It keeps the layout it has on a wide screen — artwork, then the rail
     of controls beside it — but drops the page margin, which inside a frame is
     just empty paper. The parent says so on the frame itself; same origin, so
     we can simply ask it. */
  var IS_STAGE = false;
  try { IS_STAGE = !!(window.frameElement && window.frameElement.hasAttribute('data-rail')); }
  catch (e) { IS_STAGE = false; }
  if (IS_STAGE) document.documentElement.classList.add('is-stage');

  /* Tell the page behind us we are awake. It runs a screensaver on a timer of
     its own and cannot see a single thing that happens inside this frame, so
     without this it fades the whole window to white while somebody is in the
     middle of using the instrument. Throttled to once a second — this is a
     heartbeat, not a stream. */
  if (window.parent && window.parent !== window) {
    var lastPing = 0;
    var ping = function () {
      var now = Date.now(); if (now - lastPing < 1000) return; lastPing = now;
      try { window.parent.postMessage({ opl: 'awake' }, '*'); } catch (e) {}
    };
    ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, ping, { passive: true });
    });
    setInterval(ping, 20000);   // an instrument left running is still in use
  }

  /* ── A stage fills its frame ───────────────────────────────────────────────
     The canvas has a drawing size of its own — square, by default, because that
     is what these instruments export. Centred in a frame that is not square,
     that leaves a band of dead paper down either side. So a stage tells the
     instrument what shape it is in and the instrument draws to it: every one of
     them already has the control (the size menu, or Flora's artboard), and this
     only picks a value nobody was going to pick by hand.

     It runs after the instrument has booted, and again whenever the frame
     changes size, because a frame changes size when the page does. */
  var body=document.body, dock=$('dock'), bar=document.querySelector('.pt-bar'); if(!bar) return;
  var ctl=bar.querySelector('.pt-bar__ctl'); if(!ctl){ ctl=document.createElement('div'); ctl.className='pt-bar__ctl'; bar.appendChild(ctl); }
  var skip=(body.getAttribute('data-skip')||'').split(/[,\s]+/).filter(Boolean);
  var engine=function(){ var s=$('engine'); if(s) return s.value; var b=document.querySelector('[data-eng][aria-pressed="true"]'); return b? b.getAttribute('data-eng') : (body.getAttribute('data-engine')||''); };

  // is this control on show in the Lab right now? (not in a hidden group, and in this engine's groups)
  function shown(el){ var e=engine();
    for(var n=el; n && n!==dock; n=n.parentElement){
      if(n.hasAttribute('hidden')) return false;
      if(n.id==='output' || n.id==='sizeDock' || n.id==='engSeg' || (n.classList&&n.classList.contains('out'))) return false;   // export + size menus stay in the Lab
      var m=/(?:^|\s)eng-([\w-]+)/.exec(n.className||''); if(m && m[1]!==e) return false; }
    return true; }
  function labelOf(el){
    // a switch written as <label><input type=checkbox>breathe</label> names
    // itself in its own label, not in the field's heading
    if(el.type==='checkbox'){ var lb=el.closest('label');
      if(lb){ var lt=''; [].forEach.call(lb.childNodes,function(n){ if(n.nodeType===3) lt+=n.textContent; });
        lt=lt.trim(); if(lt) return lt; } }
    // Flora's panel names a control in .field-label's first span; the Lab's
    // engines name it in a label inside .knob/.crow/.tog. Read either.
    // a force names itself in its own row, inside the field called "Forces" —
    // look at the row first or every force comes back called Forces
    var row=el.closest('.force-row'); if(row){ var rl=row.querySelector('.force-name,span,label'); if(rl){ var rt=(rl.textContent||'').trim(); if(rt) return rt.charAt(0).toUpperCase()+rt.slice(1); } }
    var gr=el.closest('.glow-row'); if(gr){ var gl=gr.querySelector('.lbl'); if(gl){ var gt=(gl.textContent||'').trim(); if(gt) return gt; } }
    var f=el.closest('.field'); if(f){ var fl=f.querySelector('.field-label > span'); if(fl){ var ft=(fl.textContent||'').trim(); if(ft) return ft; } }
    var k=el.closest('.knob,.crow,.tog'); if(k){ var l=k.querySelector('label,span'); if(l){ var t=''; l.childNodes.forEach(function(n){ if(n.nodeType===3) t+=n.textContent; }); t=t.trim(); if(t) return t; } }
    return el.getAttribute('title')||el.getAttribute('aria-label')||(el.textContent||'').trim()||el.id; }
  function readout(el){
    if(el.closest('.force-row')) return null;
    var f=el.closest('.field'); if(f){ var fv=f.querySelector('.field-label .value');
      // Flora's Dimension puts a "breathe" switch inside the same value box as
      // the number, and the whole box was being read: the column said
      // "breathe 90%". The number names itself with an id; take that.
      if(fv){ var inner=fv.querySelector('[id$="-value"]'); return inner || fv; } }
    var k=el.closest('.knob'); return k? k.querySelector('label b') : null; }
  function fire(t,type){ t.dispatchEvent(new Event(type,{bubbles:true})); }

  function build(){
    ctl.innerHTML='';
    var seen={};
    var els=dock.querySelectorAll('input[type=range],select,input[type=color],input[type=checkbox],button');
    els.forEach(function(src){
      if(src.id && skip.indexOf(src.id)>=0) return;
      if(src.id==='aspect' || src.type==='file' || src.closest('.seg')) return;
      if(src.closest('#fanColList')) return;                               // custom pickers stay in the Lab
      if(src.closest('.glow-row') && src.type!=='color') return;           // of a glow layer only its colour is public
      if(!shown(src)) return;
      if(src.closest('.pt-bar')) return;
      var c;
      if(src.type==='range'){
        c=document.createElement('label'); c.className='pt-c pt-c--range';
        var name=labelOf(src), ro=readout(src);
        c.innerHTML='<span class="pt-c__l"><span class="pt-c__n"></span><b class="pt-c__v"></b></span><input type="range">';
        c.querySelector('.pt-c__n').textContent=name;
        var r=c.querySelector('input'); r.min=src.min; r.max=src.max; r.step=src.step||'any'; r.value=src.value;
        var v=c.querySelector('.pt-c__v'); var syncV=function(){ v.textContent= ro? ro.textContent : ''; }; syncV();
        r.addEventListener('input',function(){ src.value=r.value; fire(src,'input'); fire(src,'change'); setTimeout(syncV,0); });
        src.addEventListener('input',function(){ if(r.value!==src.value) r.value=src.value; setTimeout(syncV,0); });
      } else if(src.tagName==='SELECT'){
        c=document.createElement('label'); c.className='pt-c pt-c--sel';
        c.innerHTML='<span class="pt-c__l"><span class="pt-c__n"></span></span><select></select>';
        c.querySelector('.pt-c__n').textContent=labelOf(src);
        var sel=c.querySelector('select'); [].forEach.call(src.options,function(o){ var n=document.createElement('option'); n.value=o.value; n.textContent=o.textContent; sel.appendChild(n); }); sel.value=src.value;
        sel.addEventListener('change',function(){ src.value=sel.value; fire(src,'input'); fire(src,'change');
          // An engine has its own controls; a force IS a control. Either way the
          // set changed, so the column is built again — without this, choosing
          // a force added it to the artwork and left no way to steer it.
          if(src.id==='engine' || src.id==='force-pick') setTimeout(build,80); });
      } else if(src.type==='color'){
        c=document.createElement('label'); c.className='pt-c pt-c--col';
        c.innerHTML='<span class="pt-c__l"><span class="pt-c__n"></span></span><span class="pt-c__sw"><input type="color"></span>';
        var nm=labelOf(src); if(!nm||nm===src.id) nm='Colour';
        if(/^colou?r$/i.test(nm)){ var grp=src.closest('.group'), gt=grp&&grp.querySelector('.group__t'); if(gt && /background|paper|ground/i.test(gt.textContent)) nm=gt.textContent.trim(); }
        c.querySelector('.pt-c__n').textContent=nm;
        var ci=c.querySelector('input'), swp=c.querySelector('.pt-c__sw'); ci.value=src.value; swp.style.background=src.value;
        ci.addEventListener('input',function(){ src.value=ci.value; swp.style.background=ci.value; fire(src,'input'); fire(src,'change'); });
      } else if(src.type==='checkbox'){
        c=document.createElement('button'); c.type='button'; c.className='pt-c pt-c--tog'; c.textContent=labelOf(src); c.setAttribute('aria-pressed',String(src.checked));
        c.addEventListener('click',function(){ src.checked=!src.checked; fire(src,'input'); fire(src,'change'); c.setAttribute('aria-pressed',String(src.checked)); });
      } else if(src.tagName==='BUTTON'){
        if(src.classList.contains('sw')){                       // a swatch: colour choice
          c=document.createElement('button'); c.type='button'; c.className='pt-c pt-c--swb'; c.title=src.title||''; c.setAttribute('aria-label',src.title||'Colour');
          c.style.background=src.style.background||src.style.backgroundColor||'#fff';
          var on=src.getAttribute('aria-pressed'); if(on!==null) c.setAttribute('aria-pressed',on);
          c.addEventListener('click',function(){ src.click(); setTimeout(function(){ ctl.querySelectorAll('.pt-c--swb').forEach(function(b){ var o=b._src.getAttribute('aria-pressed'); if(o!==null) b.setAttribute('aria-pressed',o); }); },30); });
        } else if(/(?:^|\s)(x|force-remove|swatch-remove|swatch-add)(?:\s|$)/.test(src.className)){ return; }   // add/remove crosses — stay in the Lab
        else {
          var txt=(src.textContent||'').trim(); if(!txt) return;
          c=document.createElement('button'); c.type='button'; c.className='pt-c pt-c--btn'; c.textContent=txt;
          var pr=src.getAttribute('aria-pressed'); if(pr!==null) c.setAttribute('aria-pressed',pr);
          c.addEventListener('click',function(){ src.click(); setTimeout(function(){ var t=(src.textContent||'').trim(); if(t) c.textContent=t; var o=src.getAttribute('aria-pressed'); if(o!==null) c.setAttribute('aria-pressed',o); if(/^add/i.test(txt)||src.id==='addFanCol'||src.id==='addGlow') build(); },40); });
        }
      }
      if(c){ c._src=src; c._k= src.type==='range'?0 : src.tagName==='SELECT'?1 : (src.type==='color' && /background|paper|ground/i.test(c.textContent))?2 : 3; ctl.appendChild(c); }
    });
    // sliders first, then menus, then the ground colour and the palette — so the rows read as rows
    [].slice.call(ctl.children).sort(function(a,b){ return a._k-b._k; }).forEach(function(n){ ctl.appendChild(n); });
    // Two to a row. An odd number of sliders left the first menu sharing a row
    // with the last slider, which read as a pair of unrelated things. A blank
    // cell finishes the slider rows so the menus start a row of their own —
    // Blend beside Colour combination, which is what they are.
    (function fullRows(){
      [].forEach.call(ctl.querySelectorAll('.pt-c--pad'), function(n){ n.remove(); });
      var kinds = ['.pt-c--range', '.pt-c--sel'];
      kinds.forEach(function(k){
        var of = ctl.querySelectorAll(k);
        if (of.length && of.length % 2) {
          var pad = document.createElement('span');
          pad.className = 'pt-c pt-c--pad'; pad.setAttribute('aria-hidden', 'true');
          of[of.length - 1].after(pad);
        }
      });
    })();
    // A palette is one thing, not twenty. Gather the swatches into a single row
    // that spans the column, so they read as a strip instead of a block four
    // wide that runs off the bottom.
    (function oneRow(){
      var sw = ctl.querySelectorAll('.pt-c--swb');
      if (sw.length < 2) return;
      var row = document.createElement('div'); row.className = 'pt-swatches';
      ctl.insertBefore(row, sw[0]);
      [].forEach.call(sw, function(b){ row.appendChild(b); });
    })();
    window.dispatchEvent(new Event('resize'));   // the canvas refits to whatever is left above the bar
  }

  /* Pause and reseed come off the whole instrument, not only off the bar.
     Several tools keep the same pair down in the controls drawer as well, and
     taking them off the artwork while leaving them a tap away under the
     settings button only moved the problem.

     They are hidden rather than removed: a tool's own script still holds a
     reference — `connected`, for one, writes the play button's label when a
     recording starts — and pulling the node out from under it throws. Matched
     on the whole label rather than a substring, because the four tools name
     the same control four ways (reseedBtn, reroll, playBtn, play-btn), and a
     loose match would also take `Next loop` and `Upload your own`. */
  var TRANSPORT = /^(play|pause|resume|freeze|unfreeze|re-?seed|re-?roll|redraw)$/;

  /* Every word of the label has to be a transport word, not just one of them.
     The bar's own icon buttons are labelled "Play / pause", which a whole-
     label match missed and a loose match would have taken `Next loop` and
     `Upload your own` along with. `data-proxy` names the control a bar button
     stands in for, so it is read too. */
  function isTransport(b) {
    var label = ((b.textContent || '').trim() || b.getAttribute('aria-label') || '').toLowerCase();
    var proxy = (b.getAttribute('data-proxy') || '').toLowerCase();
    if (proxy && /^(play|pause|freeze|re-?seed|re-?roll|redraw)/.test(proxy.replace(/[^a-z-]/g, ''))) return true;
    var words = label.split(/[^a-z-]+/).filter(Boolean);
    return words.length > 0 && words.every(function (w) { return TRANSPORT.test(w); });
  }

  function stripTransport() {
    Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (b) {
      if (!isTransport(b)) return;
      b.hidden = true;
      b.style.display = 'none';
      /* The two-up rows these sit in would otherwise keep an empty cell where
         the button was, and the survivor would hold half the width. */
      var row = b.parentElement;
      if (!row) return;
      var left = Array.prototype.slice.call(row.children).filter(function (c) { return !c.hidden; });
      if (!left.length) { row.hidden = true; row.style.display = 'none'; }
      else if (/\b(grid2|duo)\b/.test(row.className)) row.style.gridTemplateColumns = '1fr';
    });
  }

  /* The transport — reseed, play, pause — belongs to the picture, not to the
     list of parameters. It moves onto the artwork itself, bottom left, where
     it is a control of the thing you are looking at rather than the first two
     rows of a column of sliders. */
  (function transport(){
    var public_ = !/[?&]workbench=1/.test(location.search);
    // Runs whatever the bar holds: flora and ripple keep their pause down in
    // the drawer and have no transport in the bar at all.
    if (public_) stripTransport();

    var btns = document.querySelector('.pt-bar__btns'), wrap = $('wrap');
    var shown = function (box) {
      return Array.prototype.slice.call(box.children).filter(function (c) { return !c.hidden; }).length;
    };
    if (!btns || !wrap || !shown(btns)) { if (btns) btns.remove(); return; }

    /* Pause and reseed come off. An instrument on a project page is a thing to
       watch, not a thing to operate: a pause button invites someone to stop it
       and leave it stopped, and a reseed invites them to hunt for a better
       result than the one the page chose. Both turn a demonstration into a
       slot machine. The instruments keep every control that shapes the work —
       the sliders, the words, the colour — and lose the two that only start
       and stop it.

       Matched on what the button says rather than on its id, because the four
       tools name the same control four ways (reseedBtn, reroll, playBtn,
       play-btn). The standalone gated tools are left alone: those are the
       workbench, and a workbench needs its transport. */

    btns.classList.add('pt-transport');
    wrap.appendChild(btns);
    // The artwork is centred inside its box and its height depends on the
    // engine, so the corner of the box is not the corner of the picture. The
    // transport is placed against the picture's own rectangle, measured.
    var place = function(){
      /* The artwork. Most instruments draw to a canvas called `art`; VoiceType
         draws SVG outlines into `type`. Without this the lookup failed, place()
         returned, and the transport kept its default — 46px above the top of
         the wrap, which inside the overlay is off the screen. There was no
         Start button to find. */
      var art = $('art') || $('render-canvas') || $('type')
             || wrap.querySelector('canvas, svg');
      if (!art) return;
      var a = art.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      btns.style.left = Math.round(a.left - w.left) + 'px';
      btns.style.top  = Math.round(a.bottom - w.top) + 'px';
    };
    place();
    setTimeout(place, 300); setTimeout(place, 1200);
    addEventListener('resize', function(){ clearTimeout(place._t); place._t = setTimeout(place, 120); });
  })();

  // the icon buttons at the left of the bar (play / reseed / save) proxy the same way as before
  document.querySelectorAll('[data-proxy]').forEach(function(el){ var t=$(el.dataset.proxy); if(!t) return;
    if(el.tagName==='INPUT'){ el.addEventListener('input',function(){ t.value=el.value; fire(t,'input'); fire(t,'change'); }); }
    else { el.addEventListener('click',function(){ if(t.disabled) return; t.click(); setTimeout(syncBtns,30); }); } });
  function syncBtns(){ document.querySelectorAll('button[data-proxy]').forEach(function(el){ var t=$(el.dataset.proxy); if(!t) return; el.disabled=!!t.disabled;
    if(el.hasAttribute('aria-pressed')){ var on=t.getAttribute('aria-pressed'); el.setAttribute('aria-pressed', on!==null? on : String(t.textContent.trim()!=='Play')); } }); }
  setTimeout(syncBtns,200);

  // the words: one field in the bar, mirrored into the tool's own text input
  var w=document.querySelector('[data-words]'), lastKey=0;
  if(w){
    // A tool may cap how many words it can set. The cap is enforced by REFUSING
    // the keystroke rather than truncating after the fact — truncating silently
    // dropped the space, so the words the reader kept typing ran together onto
    // the last one ("one two threefourfive").
    var maxWords = parseInt(w.getAttribute('data-max-words'), 10) || 0;
    var words = function (v) { return v.split(/\s+/).filter(Boolean).length; };
    if (maxWords) {
      w.addEventListener('beforeinput', function (e) {
        if (e.inputType && e.inputType.indexOf('delete') === 0) return;
        var ins = e.data != null ? e.data : (e.dataTransfer ? e.dataTransfer.getData('text') : '');
        if (ins == null) return;
        var next = w.value.slice(0, w.selectionStart) + ins + w.value.slice(w.selectionEnd);
        if (words(next) > maxWords) e.preventDefault();
      });
    }
    var ta=$(w.dataset.words);
    if(ta){ var push=function(){ ta.value=w.value.trim().replace(/ +/g,'\n'); fire(ta,'input'); lastKey=performance.now(); }; w.addEventListener('input',push);
      if(ta.value && ta.value.trim()) w.value=ta.value.trim().replace(/\n/g,' '); else push(); }
    // tap the artwork (or start typing anywhere) → you are typing into the artwork
    var wrap=$('wrap'); if(wrap){ wrap.addEventListener('click',function(){ w.focus(); var n=w.value.length; try{ w.setSelectionRange(n,n); }catch(e){} }); }
    document.addEventListener('keydown',function(e){ if(e.metaKey||e.ctrlKey||e.altKey) return; var a=document.activeElement; if(a===w||(a&&/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(a.tagName))) return; if(e.key.length===1||e.key==='Backspace'){ w.focus(); var n=w.value.length; try{ w.setSelectionRange(n,n); }catch(e2){} } });
  }

  // No caret is drawn in the artwork. The reader types in the field below the
  // canvas, which has a real text cursor of its own — a second blinking bar
  // inside the picture was just something else moving.

  /* ── The phone: the instrument, and a drawer ───────────────────────────────
     On a phone the artwork gets the screen. Every control lives in a drawer
     that slides up from the bottom, with the tool's own name on it and a close
     mark, and goes away again. One button over the picture, bottom right,
     where a thumb already is. */
  (function drawer() {
    const stage = document.querySelector('.pt-stage');
    if (!stage || !bar) return;

    // The instrument names itself at the top of its own column, on every
    // screen. On a phone that same line is the drawer's handle.
    const name = (document.querySelector('#hero h1') || {}).textContent || 'Controls';
    const head = document.createElement('div');
    head.className = 'pt-drawer__head';
    head.innerHTML = '<span class="pt-drawer__name"></span>' +
      '<button class="pt-drawer__x" type="button" aria-label="Close controls">&times;</button>';
    head.querySelector('.pt-drawer__name').textContent = name.trim();
    bar.insertBefore(head, bar.firstChild);
    // A spacer rather than an auto margin: an auto margin in a scrolling flex
    // column pushes the overflow out of reach, which is what was cutting the
    // last row of swatches off the bottom. A flexible spacer collapses to
    // nothing the moment the controls need the room.
    /* Two of them, one above the controls and one below, so the controls sit
       on the middle of the column and grow up and down from there as an
       engine's parameters come and go. One spacer pinned them to the foot,
       which read as hanging off the bottom of the artwork. Both collapse the
       moment the controls need the room. */
    var spacer = document.createElement('div');
    spacer.className = 'pt-bar__spacer';
    bar.insertBefore(spacer, head.nextSibling);
    var spacerB = document.createElement('div');
    spacerB.className = 'pt-bar__spacer';
    bar.appendChild(spacerB);

    if (!matchMedia('(max-width: 40em)').matches) {
      // On a wide screen the page already names the instrument, at the top of
      // the page and again in the overlay's path. A third copy at the head of
      // the control column was the same word printed twice on one screen. The
      // head stays in the markup because on a phone it is the drawer's handle.
      return;
    }

    bar.classList.add('pt-bar--drawer');

    const open = document.createElement('button');
    open.className = 'pt-drawer__open';
    open.type = 'button';
    open.setAttribute('aria-expanded', 'false');
    open.setAttribute('aria-controls', 'pt-drawer');
    open.setAttribute('aria-label', 'Controls');
    open.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" aria-hidden="true">' +
      '<path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h8M16 17h4"/>' +
      '<circle cx="16" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="14" cy="17" r="2"/></svg>';
    stage.appendChild(open);

    const scrim = document.createElement('div');
    scrim.className = 'pt-drawer__scrim';
    scrim.hidden = true;
    stage.appendChild(scrim);

    bar.id = bar.id || 'pt-drawer';
    const set = on => {
      bar.classList.toggle('is-open', on);
      scrim.hidden = !on;
      open.setAttribute('aria-expanded', String(on));
      if (on) {
        bar.scrollTop = 0;
        // hand the stage the drawer's real height so the artwork can take the
        // room above it instead of hiding behind it
        requestAnimationFrame(() => {
          // The artwork takes the room the drawer leaves, so you can watch what
          // the control you are dragging is doing. The size is carried on the
          // picture itself, not on its box — a box inside a column flex line
          // does not get to choose its own height.
          const h = Math.min(bar.getBoundingClientRect().height, innerHeight * 0.62);
          stage.style.setProperty('--art-max', Math.max(120, stage.clientHeight - h - 24) + 'px');
          // and the room it is centred in has to be the room that is left,
          // otherwise a smaller picture is still centred behind the drawer
          stage.style.setProperty('padding-bottom', h + 'px', 'important');
          stage.classList.add('is-drawer');
        });
      } else {
        stage.style.removeProperty('--art-max');
        stage.style.removeProperty('padding-bottom');
        stage.classList.remove('is-drawer');
      }
    };
    open.addEventListener('click', () => set(true));
    head.querySelector('.pt-drawer__x').addEventListener('click', () => set(false));
    scrim.addEventListener('click', () => set(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    set(false);
  })();

  /* The thin grey rule exists so a white sheet has an edge on a white page.
     A canvas the engine has filled with a colour already has one, and the rule
     just reads as a frame around it — so watch the corner pixel and drop the
     border whenever the ground is not white. */
  (function edge(){
    var c=$('art') || $('render-canvas'); if(!c) return;
    // Read the corner through a 1x1 scratch canvas rather than off the live
    // one. Calling getImageData on a canvas that is being animated makes the
    // browser give up its GPU acceleration for that canvas, which turns a
    // 60fps instrument into a page that stops responding.
    var probe=document.createElement('canvas'); probe.width=probe.height=1;
    var pg=probe.getContext('2d',{ willReadFrequently:true });
    function check(){
      try{
        if(!pg || !c.width) return;
        pg.clearRect(0,0,1,1);
        pg.drawImage(c, 1, 1, 1, 1, 0, 0, 1, 1);
        var d=pg.getImageData(0,0,1,1).data;
        var white = d[3] < 8 || (d[0] > 244 && d[1] > 244 && d[2] > 244);
        c.classList.toggle('is-filled', !white);
      }catch(e){}
    }
    check(); setTimeout(check,500); setInterval(check,1500);
  })();

  // the canvas fills whatever the bar leaves; re-fit the engine when that changes
  var wr = $('wrap');
  if (wr && window.ResizeObserver) {
    var lastW = 0, lastH = 0;
    new ResizeObserver(function () {
      var r = wr.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 0.5 && Math.abs(r.height - lastH) < 0.5) return;
      lastW = r.width; lastH = r.height;
      requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
    }).observe(wr);
  }
  // one square canvas for every public tool — after the shell has rewritten the size list
  function square(){ var asp=$('aspect'); if(!asp) return; var sq=[].filter.call(asp.options,function(o){ return /^(1400\/1400|1080\/1080|1\/1|1:1)$/.test(o.value) || /1:1|square/i.test(o.textContent); })[0]; if(sq && asp.value!==sq.value){ asp.value=sq.value; fire(asp,'change'); } }
  square(); setTimeout(square,150); setTimeout(square,600);

  // pick the engine this page shows, then build the bar from what that engine
  // offers. ?engine=<name> overrides the page's own default, so one instrument
  // with two engines can be shown twice — each opening on its own.
  var qe=/(?:^|[?&])engine=([\w-]+)/.exec(location.search);
  var pick=(qe && qe[1]) || body.getAttribute('data-engine'); var eb=pick? document.querySelector('[data-eng="'+pick+'"]') : null; if(eb) eb.click();
  var es=$('engine'); if(es && pick && [].some.call(es.options,function(o){ return o.value===pick; }) && es.value!==pick){ es.value=pick; fire(es,'change'); }
  // an instrument with two engines keeps a word for each; once the engine is
  // picked, the field in the bar shows that engine's word rather than the
  // other one's
  setTimeout(function(){ var wf=document.querySelector('[data-words]'); if(!wf) return;
    var t2=$(wf.dataset.words); if(t2 && t2.value) wf.value=t2.value.replace(/\n/g,' '); }, 180);
  setTimeout(build,120); setTimeout(build,700);
  if(dock){ var mo=new MutationObserver(function(ms){ if(ms.some(function(m){ return m.type==='attributes' || m.target.id==='fanColList' || m.target.id==='glowList'; })){ clearTimeout(build._t); build._t=setTimeout(build,80); } });
    mo.observe(dock,{ childList:true, subtree:true, attributes:true, attributeFilter:['hidden'] }); }
})();
