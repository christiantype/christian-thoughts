/* Lake Opeka · the field, live. The same rule as the record's pages: a cloud of discs on a hex grid, each on a slow periodic orbit;
   their summed falloff is thresholded every frame so neighbours fuse and part; every fused blob samples one drifting patch of the
   source image. Runs on a coarse grid (G cells on the short side) and hands back a canvas to scale up. Period T seconds, so it loops.
   const f = LOBlobs.create(image, {size: 420, seed: 7}); each frame: f.render(t) → canvas (transparent outside the blobs). */
(function(){
  function rng(seed){ let a=seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function create(img, o){ o=o||{}; const G=o.size||420, T=o.period||12, r=rng(o.seed||7);
    // the source, cover-fitted into a square, at a modest working size
    const SW=Math.min(1600, Math.max(img.naturalWidth||img.width, 256)), sc=document.createElement('canvas'); sc.width=sc.height=SW; const sx=sc.getContext('2d');
    const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height, s=Math.max(SW/iw,SW/ih); sx.drawImage(img,(SW-iw*s)/2,(SW-ih*s)/2,iw*s,ih*s);
    const src=sx.getImageData(0,0,SW,SW).data;
    // the accent: where the picture is most saturated (coarse), a share of blobs draw from there
    let bestS=-1, ax=SW/2, ay=SW/2; for(let y=0;y<SW;y+=16) for(let x=0;x<SW;x+=16){ let acc=0; for(let dy=0;dy<16;dy+=4) for(let dx=0;dx<16;dx+=4){ const i=((y+dy)*SW+x+dx)*4; const mx=Math.max(src[i],src[i+1],src[i+2]), mn=Math.min(src[i],src[i+1],src[i+2]); acc+=mx-mn; } if(acc>bestS){ bestS=acc; ax=x+8; ay=y+8; } }
    // the discs
    const d=0.075, D=G*d, dy=D*0.866, margin=G*0.02, balls=[];
    for(let row=0; row<G/dy+2; row++) for(let col=0; col<G/D+2; col++){ if(r()<0.14) continue;
      const cx=col*D+(row%2?D/2:0)+(r()-0.5)*0.36*D, cy=row*dy+(r()-0.5)*0.36*D, rad=D/2*(0.85+r()*0.6);
      if(cx-rad*0.9<margin||cx+rad*0.9>G-margin||cy-rad*0.9<margin||cy+rad*0.9>G-margin) continue;
      const acc=r()<0.35; balls.push({x:cx,y:cy,r:rad,ax:D*(0.25+r()*0.35),ay:D*(0.25+r()*0.35),ph:r()*6.283,ph2:r()*6.283,k:1+Math.floor(r()*2),
        sx:acc?ax+(r()-0.5)*0.2*SW:r()*SW, sy:acc?ay+(r()-0.5)*0.2*SW:r()*SW, sa:SW*(0.02+r()*0.04), sph:r()*6.283, cx:cx, cy:cy}); }
    const field=new Float32Array(G*G), label=new Int32Array(G*G), stack=new Int32Array(G*G), out=document.createElement('canvas'); out.width=out.height=G; const ox=out.getContext('2d'), id=ox.createImageData(G,G), px=id.data;
    const bb=[]; // per label: minx,miny,maxx,maxy,count
    let lastT=-1; function render(t){ if(lastT>=0 && t-lastT<1/30) return out; lastT=t; const w=2*Math.PI/T; field.fill(0);
      for(const b of balls){ const cx=b.x+b.ax*Math.sin(w*b.k*t+b.ph), cy=b.y+b.ay*Math.cos(w*b.k*t+b.ph2), rad=b.r*(1+0.08*Math.sin(w*t*2+b.ph)); b.cx=cx; b.cy=cy;
        const x0=Math.max(0,cx-1.5*rad|0), x1=Math.min(G,cx+1.5*rad+1|0), y0=Math.max(0,cy-1.5*rad|0), y1=Math.min(G,cy+1.5*rad+1|0), rr=rad*rad;
        for(let y=y0;y<y1;y++){ const dy2=(y+0.5-cy)*(y+0.5-cy); for(let x=x0;x<x1;x++){ const dd=((x+0.5-cx)*(x+0.5-cx)+dy2)/rr; if(dd<1){ const v=1-dd; field[y*G+x]+=v*v*1.6; } } } }
      // label the fused blobs (4-connected flood fill)
      label.fill(0); let n=0; bb.length=0;
      for(let i=0;i<G*G;i++){ if(field[i]<0.55||label[i]) continue; n++; let sp=0; stack[sp++]=i; label[i]=n; let minx=G,miny=G,maxx=0,maxy=0,cnt=0;
        while(sp){ const j=stack[--sp]; const x=j%G, y=(j-x)/G; cnt++; if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y;
          if(x>0&&!label[j-1]&&field[j-1]>=0.55){ label[j-1]=n; stack[sp++]=j-1; } if(x<G-1&&!label[j+1]&&field[j+1]>=0.55){ label[j+1]=n; stack[sp++]=j+1; }
          if(y>0&&!label[j-G]&&field[j-G]>=0.55){ label[j-G]=n; stack[sp++]=j-G; } if(y<G-1&&!label[j+G]&&field[j+G]>=0.55){ label[j+G]=n; stack[sp++]=j+G; } }
        bb.push([minx,miny,maxx,maxy,cnt]); }
      // each blob: its nearest ball's drifting sample point; the blob's box maps to a patch 1/z its size around that point
      const z=1.4, k=SW/G, maps=new Array(n+1);
      for(let i=1;i<=n;i++){ const [minx,miny,maxx,maxy]=bb[i-1]; const bw=maxx-minx+1, bh=maxy-miny+1, cxi=minx+bw/2, cyi=miny+bh/2; let nb=balls[0], best=1e18;
        for(const b of balls){ const dd=(b.cx-cxi)*(b.cx-cxi)+(b.cy-cyi)*(b.cy-cyi); if(dd<best){ best=dd; nb=b; } }
        const sx=nb.sx+nb.sa*Math.sin(w*t+nb.sph), sy=nb.sy+nb.sa*Math.cos(w*t+nb.sph), pw=Math.min(bw*k/z,SW-1), ph=Math.min(bh*k/z,SW-1);
        maps[i]={bx0:Math.max(0,Math.min(SW-1-pw,sx-pw/2)), by0:Math.max(0,Math.min(SW-1-ph,sy-ph/2)), minx:minx, miny:miny, fx:pw/bw, fy:ph/bh}; }
      for(let i=0;i<G*G;i++){ const l=label[i]; const o4=i*4; if(!l){ px[o4+3]=0; continue; } const m=maps[l]; const x=i%G, y=(i-x)/G;
        const uf=Math.min(SW-1.001, m.bx0+(x-m.minx+0.5)*m.fx), vf=Math.min(SW-1.001, m.by0+(y-m.miny+0.5)*m.fy), u0=uf|0, v0=vf|0, tu=uf-u0, tv=vf-v0, i00=(v0*SW+u0)*4, i10=i00+4, i01=i00+SW*4, i11=i01+4;
        px[o4]=(src[i00]*(1-tu)+src[i10]*tu)*(1-tv)+(src[i01]*(1-tu)+src[i11]*tu)*tv; px[o4+1]=(src[i00+1]*(1-tu)+src[i10+1]*tu)*(1-tv)+(src[i01+1]*(1-tu)+src[i11+1]*tu)*tv; px[o4+2]=(src[i00+2]*(1-tu)+src[i10+2]*tu)*(1-tv)+(src[i01+2]*(1-tu)+src[i11+2]*tu)*tv; const a=(field[i]-0.55)/0.12+0.5; px[o4+3]=a>=1?255:(a<=0?0:a*255|0); }
      ox.putImageData(id,0,0); return out; }
    return {render:render, size:G};
  }
  window.LOBlobs={create:create};
})();
