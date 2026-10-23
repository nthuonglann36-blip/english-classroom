/* Render the original illustration as independent printing layers on this device. */
(() => {
  'use strict';
  const files = window.EC_JOURNEY_CONTENT.printFiles || {};
  const cache = new Map(), started = new WeakSet();
  // Paper, four pigments, then black ink. Each source pixel belongs to one layer.
  const pigments = [[251,247,238],[230,180,67],[219,110,145],[78,159,140],[47,81,150],[30,27,46]];
  function load(source) {
    return new Promise((resolve,reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Artwork could not be loaded.'));
      image.src = source;
    });
  }
  async function layers(source) {
    const image = await load(source);
    const width = Math.min(450,image.naturalWidth), height = Math.round(width*image.naturalHeight/image.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width=width; canvas.height=height;
    const context = canvas.getContext('2d',{willReadFrequently:true});
    if (!context) throw new Error('Artwork preview is unavailable.');
    context.drawImage(image,0,0,width,height);
    const original = context.getImageData(0,0,width,height);
    const masks = pigments.map(() => context.createImageData(width,height));
    for (let p=0;p<original.data.length;p+=4) {
      const r=original.data[p], g=original.data[p+1], b=original.data[p+2];
      let nearest=0, best=Infinity;
      pigments.forEach(([pr,pg,pb],index) => {
        const distance=(r-pr)**2+(g-pg)**2+(b-pb)**2;
        if (distance<best) {best=distance; nearest=index;}
      });
      // The paper is opaque beneath the other layers. No source file is modified.
      const paper=masks[0].data;
      paper[p]=nearest===0?r:251; paper[p+1]=nearest===0?g:247; paper[p+2]=nearest===0?b:238; paper[p+3]=255;
      if (nearest!==0) {
        const target=masks[nearest].data;
        target[p]=r; target[p+1]=g; target[p+2]=b; target[p+3]=original.data[p+3];
      }
    }
    return masks.map(mask => {
      context.putImageData(mask,0,0);
      return canvas.toDataURL('image/png');
    });
  }
  function prepare(frame) {
    const svg=frame.querySelector('svg[data-layered-print]');
    if (!svg || started.has(svg)) return;
    const source=files[svg.dataset.layeredPrint];
    if (!source) return;
    started.add(svg);
    if (!cache.has(source)) cache.set(source,layers(source));
    cache.get(source).then(images => {
      if (!svg.isConnected) return;
      const names={paper:0,ghost:5,yellow:1,pink:2,green:3,indigo:4,ink:5};
      svg.querySelectorAll('[data-art-layer]').forEach(image => image.setAttribute('href',images[names[image.dataset.artLayer]]));
      svg.dataset.artReady='true';
    }).catch(() => {
      if (!svg.isConnected) return;
      svg.dataset.artReady='error';
      const text=document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x','150');text.setAttribute('y','200');text.setAttribute('text-anchor','middle');text.setAttribute('font-size','11');text.setAttribute('fill','#5a6a8c');
      text.textContent='Reload or update Self-study offline.';
      svg.append(text);
    });
  }
  window.ECPrintArt=Object.freeze({prepare});
})();
