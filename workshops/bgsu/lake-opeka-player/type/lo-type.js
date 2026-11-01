/* Lake Opeka · title engine. The same rule as the printed booklet titles: each line set in Benton Sans Bold, glitched sideways in
   bands, then screened to one dot per cell (six rows across the cap height); a tenth of the dots take the track's colour.
   Legibility 0..1 sets how much glitch and dropout the screen gets. draw(canvas, geo, {track, bg, t}) animates the dots the way the
   reel does: each one drifting on its own slow orbit, breathing, the rows sliding a little, the whole title turning a hair. */
(function(){
  const FONT='700 400px "BentonSans"', ROWS=6, GAP=1.4;
  const COLORS=['#ff8ba3','#7daad6','#ffc440','#46b4cd','#e83c3c','#5cc4a4','#5c789e','#f179a8'];
  function rng(seed){ let a=seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function lines(text){ const ls=text.split(/\n/).map(l=>l.trim()).filter(Boolean).slice(0,3); return ls.length?ls:['']; }
  function wordDots(word, seed, legib){
    const amt=0.12*(1-legib), keep=0.55+0.45*legib, nrows=ROWS+Math.round(3*legib);   // glitch reach · share of dots kept · finer cells when legible
    const c=document.createElement('canvas'), x=c.getContext('2d'); x.font=FONT;
    const m=x.measureText(word), W=Math.ceil(m.width)+80, H=520; c.width=W; c.height=H; x.font=FONT; x.fillStyle='#fff'; x.fillRect(0,0,W,H); x.fillStyle='#000'; x.textBaseline='alphabetic'; x.fillText(word,40,400);
    const cap=x.measureText('H').actualBoundingBoxAscent||290, cell=cap/nrows;
    const img=x.getImageData(0,0,W,H).data; let y0=-1,y1=-1;
    for(let y=0;y<H;y++){ let ink=false; for(let px=0;px<W;px++){ if(img[(y*W+px)*4]<128){ ink=true; break; } } if(ink){ if(y0<0) y0=y; y1=y; } }
    if(y0<0) return {pts:[],cols:1,rows:ROWS};
    const h=y1-y0+1, r=rng(seed), g=document.createElement('canvas'); g.width=W; g.height=h; const gx=g.getContext('2d'); gx.fillStyle='#fff'; gx.fillRect(0,0,W,h);
    let y=0; while(y<h){ const bh=Math.max(2,Math.floor(h/14+r()*(h/5-h/14))), dx=Math.round((r()*2-1)*amt*W);
      if(amt>0 && r()<0.35){ const sx=1+(r()*0.4-0.15)*(amt/0.12), w2=Math.round(W*sx); gx.drawImage(c,0,y0+y,W,bh,(W-w2)/2+dx,y,w2,bh); }
      else { gx.drawImage(c,0,y0+y,W,bh,dx,y,W,bh); if(dx>0) gx.drawImage(c,W-dx,y0+y,dx,bh,0,y,dx,bh); else if(dx<0) gx.drawImage(c,0,y0+y,-dx,bh,W+dx,y,-dx,bh); }
      y+=bh; }
    const cols=Math.max(1,Math.round(W/cell)), rows=Math.max(1,Math.round(h/cell)), s=document.createElement('canvas'); s.width=cols; s.height=rows; const sx=s.getContext('2d'); sx.drawImage(g,0,0,cols,rows);
    const d=sx.getImageData(0,0,cols,rows).data, pts=[], jr=rng(seed+1);
    for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){ const dk=1-d[(j*cols+i)*4]/255; if(dk<0.2) continue; if(jr()>keep) continue; const shrink=legib>0.85?1:(jr()<0.68?1:0.3+jr()*0.45); pts.push([i+0.5,j+0.5,0.6*Math.min(1,dk*1.6)*shrink, jr()*6.283, 0.6+jr()*0.8]); }
    let minC=cols,maxC=0; pts.forEach(p=>{ minC=Math.min(minC,Math.floor(p[0])); maxC=Math.max(maxC,Math.floor(p[0])); });
    return {pts:pts.map(p=>[p[0]-minC,p[1],p[2],p[3],p[4]]), cols:pts.length?maxC-minC+1:1, rows};
  }
  let _g=null; function grainTile(){ if(_g) return _g; const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'), id=x.createImageData(256,256), d=id.data; for(let i=0;i<d.length;i+=4){ const v=110+Math.random()*90|0; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; } x.putImageData(id,0,0); _g=c; return c; }
  let _m=null; function measure(){ if(!_m){ _m=document.createElement('canvas').getContext('2d'); _m.font=FONT; } return _m; }
  function layout(text, seed, legib){ const ls=lines(text), words=ls.map((w,k)=>wordDots(w,seed*100+k,legib)); const Wc=Math.max(...words.map(w=>w.cols)), Hc=words.reduce((a,w)=>a+w.rows,0)+GAP*(words.length-1);
    const all=[], ext=[]; let y=0; words.forEach((w,li)=>{ const x0=(Wc-w.cols)/2; w.pts.forEach(p=>all.push([p[0]+x0,p[1]+y,p[2],p[3],p[4],li])); ext.push({x0:x0, x1:x0+w.cols, y0:y, y1:y+w.rows, empty:!w.pts.length, xc:Wc/2, text:ls[li]}); y+=w.rows+GAP; });
    const cr=rng(seed*17+31); all.forEach(p=>p.push(cr())); return {pts:all,cols:Wc,rows:Hc,ext:ext}; }   // p[6]: a roll in 0..1, compared with the accent share at draw time
  function draw(canvas, g, o){ o=o||{}; const W=canvas.width, H0=canvas.height, H=H0*(o.vis||1), S=Math.min(W,H), ctx=canvas.getContext('2d'), t=o.t||0, col=COLORS[((o.track||1)-1)%8];
    ctx.fillStyle=o.field||col; ctx.fillRect(0,0,W,H0);                   // a solid field in the track's colour
    if(o.bg){ const iw=o.bg.naturalWidth||o.bg.videoWidth||o.bg.width, ih=o.bg.naturalHeight||o.bg.videoHeight||o.bg.height; if(iw&&ih){ const fit=(o.bgFit||'cover'), sc=(fit==='contain'?Math.min(W/iw,H0/ih)*(o.bgScale||1):Math.max(W/iw,H0/ih)), dw=iw*sc, dh=ih*sc; const cy0=(o.bgCenter?H0/2:(fit==='contain'?H*0.44:H0/2)); try{ ctx.drawImage(o.bg,(W-dw)/2,cy0-dh/2,dw,dh); }catch(e){} }   // cover, or contained, scaled down and centred on the words
      // film grain over the picture: a noise tile laid at a fresh offset every frame, so compression softens into texture
      const gr=(o.grain==null?0.22:o.grain); if(gr>0){ const tile=grainTile(); ctx.save(); ctx.globalAlpha=gr; ctx.globalCompositeOperation='overlay'; const ox2=-Math.floor(Math.random()*256), oy2=-Math.floor(Math.random()*256); const sc2=Math.max(1,Math.round(W/1400)); for(let y=oy2;y<H0;y+=256*sc2) for(let x=ox2;x<W;x+=256*sc2) ctx.drawImage(tile,x,y,256*sc2,256*sc2); ctx.restore(); } }   // or an image / a playing video behind the words, filling the field
    if(!g) return;
    let cell=Math.min(W*0.6/g.cols, H*0.42/g.rows);                     // the words take up to 60% of the width, or the upper part of the height, whichever binds
    cell=Math.min(cell, S*0.035)*(o.scale||1);                              // but a single short word does not become a wall
    const ox=(W-g.cols*cell)/2, oy=H*0.44-g.rows*cell/2, dr=(o.drift==null?1:o.drift), wob=0.10*cell*dr, breathe=0.18*dr, rot=(1.2*Math.PI/180)*Math.sin(t*0.5)*dr, share=(o.accentShare==null?0.1:o.accentShare), dotC=o.dot||'#fff', accC=o.accent||'#0a0a0a', accs=o.accents||null;
    ctx.save(); ctx.translate(W/2,H*0.44); ctx.rotate(rot); ctx.translate(-W/2,-H*0.44);
    for(let k=0;k<g.pts.length;k++){ const p=g.pts[k]; const ph=p[3], sp=p[4];
      const dx=wob*Math.sin(t*sp+ph)+0.06*cell*Math.sin(t*0.7+p[5]*1.9), dy=wob*Math.cos(t*sp*0.9+ph*1.3), r=p[2]*cell*(1+breathe*Math.sin(t*sp*1.3+ph*2.1));
      ctx.beginPath(); ctx.arc(ox+p[0]*cell+dx, oy+p[1]*cell+dy, Math.max(0.5,r), 0, 6.283); ctx.fillStyle=(p[6]<share)?(accs?accs[Math.floor(p[6]/share*accs.length)%accs.length]:accC):dotC; ctx.fill(); }   // accents: one colour, or a spread of the album's eight
    // the caret: a bar just past the end of the line being typed, blinking; drawn in the same grid as the dots so it sits where the words are
    if(o.caret!=null && g.ext && g.ext[o.caret] && (o.typing || Math.floor(t*2)%2===0)){ const e=g.ext[o.caret]; let x;
      if(e.empty) x=ox+e.xc*cell; else if(o.caretCh==null || o.caretCh>=e.text.length) x=ox+e.x1*cell+cell*0.35;
      else { const m=measure(); const full=m.measureText(e.text).width||1, part=m.measureText(e.text.slice(0,o.caretCh)).width; x=ox+(e.x0+(e.x1-e.x0)*part/full)*cell; }   // the caret sits where it is in the word, measured in the same face
      const y0=oy+e.y0*cell, y1=oy+e.y1*cell; ctx.fillStyle=o.caretColor||o.accent||'#0a0a0a'; ctx.fillRect(x, y0, Math.max(2,cell*0.14), Math.max(cell*ROWS*0.9, y1-y0)); }
    ctx.restore(); }
  window.LOType={layout:layout, draw:draw, lines:lines, COLORS:COLORS, ready:function(){ return document.fonts.load(FONT); }};
})();
