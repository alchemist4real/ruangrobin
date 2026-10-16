/**
 * ruangrobin — Modular Template Engine & Render Registry
 * 
 * Provides:
 * 1. Anti-overflow DOM rendering for all 15 Pure Typographic Spatial Templates.
 * 2. 300 DPI Canvas 2D rendering with multi-style segment tokenizer (**bold** & {accent}).
 * 3. Modular template registry allowing templates to be added, edited, or removed independently.
 */

// ========================================================
// 1. RICH TYPOGRAPHIC TOKEN PARSER
// ========================================================

/**
 * Escapes HTML characters.
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parses **bold** and {accent} into safe HTML with series palette accent coloring.
 */
function parseRichTokensToHtml(rawText, accentColor = 'var(--c-blue)') {
  if (!rawText) return '';
  let safe = escapeHtml(rawText);

  // Bold & Accent compound: **{word}**
  safe = safe.replace(/\*\*\{([^*]+?)\}\*\*/g, `<strong class="rr-token-bold rr-token-accent" style="font-weight:700; color:${accentColor};">$1</strong>`);

  // Bold token: **word**
  safe = safe.replace(/\*\*([^*]+?)\*\*/g, `<strong class="rr-token-bold" style="font-weight:700;">$1</strong>`);

  // Accent token: {word} or [accent]word[/accent]
  safe = safe.replace(/\{([^}]+?)\}/g, `<span class="rr-token-accent" style="color:${accentColor}; font-weight:700;">$1</span>`);
  safe = safe.replace(/\[accent\]([\s\S]*?)\[\/accent\]/g, `<span class="rr-token-accent" style="color:${accentColor}; font-weight:700;">$1</span>`);

  return safe;
}

/**
 * Tokenizes text with formatting tokens for Canvas 2D drawing.
 * Returns array of segments: { text, bold: boolean, accent: boolean }
 */
function tokenizeRichTextForCanvas(text) {
  if (!text) return [];
  const segments = [];
  // Regex matches **...** or {...} or regular words
  const regex = /(\*\*\{[^*]+?\}\*\*|\*\*[^*]+?\*\*|\{[^}]+?\}|[^\s*{}]+|\s+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (raw.startsWith('**{') && raw.endsWith('}**')) {
      segments.push({ text: raw.slice(3, -3), bold: true, accent: true });
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      segments.push({ text: raw.slice(2, -2), bold: true, accent: false });
    } else if (raw.startsWith('{') && raw.endsWith('}')) {
      segments.push({ text: raw.slice(1, -1), bold: true, accent: true });
    } else {
      segments.push({ text: raw, bold: false, accent: false });
    }
  }

  return segments;
}

/**
 * Renders a single line of rich tokens to Canvas 2D context.
 */
function renderCanvasRichLine(ctx, lineText, x, y, baseFontSize, theme, align = 'left') {
  const tokens = tokenizeRichTextForCanvas(lineText);
  if (tokens.length === 0) return 0;

  // Measure total width first if center or right aligned
  let totalWidth = 0;
  tokens.forEach(tok => {
    ctx.font = `${tok.bold ? '700' : '400'} ${baseFontSize}px "Michelangelus"`;
    totalWidth += ctx.measureText(tok.text).width;
  });

  let startX = x;
  if (align === 'center') {
    startX = x - (totalWidth / 2);
  } else if (align === 'right') {
    startX = x - totalWidth;
  }

  let curX = startX;
  tokens.forEach(tok => {
    ctx.font = `${tok.bold ? '700' : '400'} ${baseFontSize}px "Michelangelus"`;
    ctx.fillStyle = tok.accent ? theme.accent : theme.ink;
    ctx.fillText(tok.text, curX, y);
    curX += ctx.measureText(tok.text).width;
  });

  return totalWidth;
}

/**
 * Word wraps and renders paragraphs on Canvas with anti-overflow wrapping and token preservation.
 */
function renderCanvasRichParagraph(ctx, text, startX, startY, maxWidth, lineHeight, baseFontSize, theme) {
  const paragraphs = (text || '').split('\n');
  let curY = startY;

  paragraphs.forEach(para => {
    if (!para.trim()) {
      curY += lineHeight * 0.6;
      return;
    }

    const words = para.split(/\s+/);
    let curLineWords = [];

    words.forEach(word => {
      const testLine = [...curLineWords, word].join(' ');
      // Test width without tokens
      const plainTest = testLine.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\{([^}]+)\}/g, '$1');
      ctx.font = `400 ${baseFontSize}px "Michelangelus"`;
      const w = ctx.measureText(plainTest).width;

      if (w > maxWidth && curLineWords.length > 0) {
        renderCanvasRichLine(ctx, curLineWords.join(' '), startX, curY, baseFontSize, theme, 'left');
        curY += lineHeight;
        curLineWords = [word];
      } else {
        curLineWords.push(word);
      }
    });

    if (curLineWords.length > 0) {
      renderCanvasRichLine(ctx, curLineWords.join(' '), startX, curY, baseFontSize, theme, 'left');
      curY += lineHeight;
    }
  });

  return curY;
}

// ========================================================
// 2. THE 15 TEMPLATE ENGINES (HTML & CANVAS)
// ========================================================

const TEMPLATE_ENGINES = {

  // ------------------------------------------------------
  // 1. CASCADE (Entropy Dispersion)
  // ------------------------------------------------------
  cascade: {
    id: 'cascade',
    name: '1. Cascade (Entropy Dispersion)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n');
      const factor = spread / 50;
      const numLines = rawLines.length || 1;

      // Anti-overflow font clamping
      const fontSize = Math.max(0.75, Math.min(1.0, 1.1 - (numLines * 0.012)));

      const linesHtml = rawLines.map((line, idx) => {
        if (!line.trim()) return '<div style="height: 1.25rem;"></div>';
        const progress = idx / Math.max(1, numLines - 1);
        
        // Clamped drift to prevent right margin penetration
        const maxShift = 220 * factor;
        const indentPx = Math.min(maxShift, Math.pow(progress, 1.8) * maxShift);
        const letterSpacing = Math.min(0.35, 0.05 + (progress * 0.25 * factor));
        const opacity = Math.max(0.35, 1 - (progress * 0.55));

        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div class="cascade-verse-line" style="margin-left: ${indentPx}px; letter-spacing: ${letterSpacing}em; opacity: ${opacity}; font-size: ${fontSize}rem;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-cascade-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <div class="tpl-header-block" style="margin-bottom: 1.5rem;">
            <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.35rem; font-weight: 700; margin-bottom: 0.25rem;">${escapeHtml(page.title || 'Entropy')}</h1>
            <div class="tpl-entry-author" style="color: ${theme.muted}; font-size: 0.75rem; letter-spacing: 0.1em;">AUTHOR: ${escapeHtml(page.author || 'A. Harris').toUpperCase()}</div>
          </div>
          <div class="cascade-lines-container" style="flex: 1; display: flex; flex-direction: column; gap: 0.45rem;">
            ${linesHtml}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 40px "Michelangelus"';
      ctx.fillText(page.title || 'Entropy', 160, 360);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`AUTHOR: ${(page.author || 'A. Harris').toUpperCase()}`, 160, 410);

      const rawLines = (page.body || '').split('\n');
      const factor = spread / 50;
      let curY = 520;
      const numLines = rawLines.length || 1;
      const baseFs = Math.max(22, Math.min(32, Math.round(36 - numLines * 0.5)));
      const lineGap = Math.round(baseFs * 1.8);

      rawLines.forEach((l, idx) => {
        if (!l.trim()) { curY += lineGap * 0.6; return; }
        const progress = idx / Math.max(1, numLines - 1);
        const shiftX = 160 + Math.min(750, Math.pow(progress, 1.8) * 800 * factor);
        renderCanvasRichLine(ctx, l, shiftX, curY, baseFs, theme, 'left');
        curY += lineGap;
      });
    }
  },

  // ------------------------------------------------------
  // 2. CONSTELLATION (Spatial Drift)
  // ------------------------------------------------------
  constellation: {
    id: 'constellation',
    name: '2. Constellation (Spatial Drift)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const factor = spread / 50;
      const basePositions = [
        { left: 60, top: 12 }, { left: 8, top: 22 }, { left: 38, top: 32 },
        { left: 62, top: 42 }, { left: 16, top: 52 }, { left: 64, top: 62 },
        { left: 68, top: 72 }, { left: 12, top: 82 }, { left: 52, top: 90 }
      ];

      const versesHtml = rawLines.map((line, idx) => {
        const pos = basePositions[idx % basePositions.length];
        const clLeft = Math.min(74, Math.max(6, pos.left * factor));
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div class="constellation-star-verse" style="margin-left: ${clLeft}%; margin-top: 1.15rem; font-size: 0.8125rem;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-constellation-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          <div style="font-size: 0.6875rem; color: ${theme.accent}; font-weight: 700; letter-spacing: 0.15em; margin-bottom: 1.5rem;">
            ${escapeHtml((page.specificParams && page.specificParams.celestialTag) || 'CELESTIAL FIELD // SPATIAL DRIFT')}
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around;">
            ${versesHtml}
          </div>
          <div style="font-size: 0.65rem; color: ${theme.muted}; font-style: italic; margin-top: auto;">
            ${escapeHtml((page.specificParams && page.specificParams.footerEpigraph) || (page.author || 'ruangrobin'))}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.accent;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText((page.specificParams && page.specificParams.celestialTag) || 'CELESTIAL FIELD // SPATIAL DRIFT', 160, 360);

      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const factor = spread / 50;
      const baseCoords = [
        { x: 0.60, y: 480 }, { x: 0.10, y: 720 }, { x: 0.40, y: 980 },
        { x: 0.64, y: 1240 }, { x: 0.18, y: 1520 }, { x: 0.65, y: 1800 },
        { x: 0.68, y: 2080 }, { x: 0.14, y: 2360 }, { x: 0.52, y: 2640 }
      ];

      rawLines.forEach((line, idx) => {
        const coord = baseCoords[idx % baseCoords.length];
        const posX = Math.min(w - 600, Math.max(200, (coord.x * w) * (factor * 0.4 + 0.8)));
        renderCanvasRichLine(ctx, line, posX, coord.y, 28, theme, 'left');
      });
    }
  },

  // ------------------------------------------------------
  // 3. JUSTIFIED (Airy Typographic Texture)
  // ------------------------------------------------------
  justified: {
    id: 'justified',
    name: '3. Justified Field (Airy Typography)',
    renderHTML: (page, theme, spread = 50) => {
      const dropCap = (page.specificParams && page.specificParams.dropCap) || '';
      const richBody = parseRichTokensToHtml(page.body || '', theme.accent);
      return `
        <div class="tpl-justified-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <div class="tpl-header-block" style="margin-bottom: 2rem;">
            <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.4rem; font-weight: 700; margin-bottom: 0.35rem;">${escapeHtml(page.title || 'Untitled')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted}; font-style: italic;">${escapeHtml(page.author || 'ruangrobin')}</div>
          </div>
          <div class="justified-body-field" style="flex: 1; text-align: justify; text-justify: inter-word; font-size: 0.875rem; line-height: 2.1; letter-spacing: 0.05em; color: ${theme.ink};">
            ${dropCap ? `<span style="float: left; font-size: 3.2rem; line-height: 0.8; font-weight: 700; color: ${theme.accent}; margin-right: 0.65rem;">${escapeHtml(dropCap)}</span>` : ''}
            ${richBody}
          </div>
          <div style="margin-top: auto; font-size: 0.6875rem; color: ${theme.muted}; border-top: 1px solid ${theme.border}; padding-top: 0.5rem;">
            ${escapeHtml((page.specificParams && page.specificParams.colophonNote) || 'typeset with airy inter-word spatial breathing')}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'Untitled', 160, 380);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`BY: ${(page.author || 'ruangrobin').toUpperCase()}`, 160, 430);

      renderCanvasRichParagraph(ctx, page.body || '', 160, 560, w - 320, 56, 26, theme);
    }
  },

  // ------------------------------------------------------
  // 4. CONTOUR (Curved Wave Flow)
  // ------------------------------------------------------
  contour: {
    id: 'contour',
    name: '4. Contour (Curved Flow)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n');
      const factor = spread / 50;
      const numLines = rawLines.length || 1;

      const linesHtml = rawLines.map((line, idx) => {
        if (!line.trim()) return '<div style="height: 0.85rem;"></div>';
        const progress = idx / Math.max(1, numLines - 1);
        const waveAngle = progress * Math.PI;
        // Sine curve indentation: peaks at center, clamped
        const indentPct = Math.min(38, Math.sin(waveAngle) * 36 * factor);
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div class="contour-wave-line" style="margin-left: ${indentPct}%; font-size: 0.8125rem; line-height: 1.8;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-contour-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <div class="tpl-header-block" style="margin-bottom: 1.5rem;">
            <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.35rem; font-weight: 700;">${escapeHtml(page.title || 'The Maple')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted};">${escapeHtml(page.author || 'Bob Hicok')}</div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.35rem;">
            ${linesHtml}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 40px "Michelangelus"';
      ctx.fillText(page.title || 'The Maple', 160, 360);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`AUTHOR: ${(page.author || 'ruangrobin').toUpperCase()}`, 160, 410);

      const rawLines = (page.body || '').split('\n');
      const factor = spread / 50;
      let curY = 520;
      const numLines = rawLines.length || 1;

      rawLines.forEach((line, idx) => {
        if (!line.trim()) { curY += 28; return; }
        const progress = idx / Math.max(1, numLines - 1);
        const shiftX = 160 + Math.min(650, Math.sin(progress * Math.PI) * 700 * factor);
        renderCanvasRichLine(ctx, line, shiftX, curY, 26, theme, 'left');
        curY += 48;
      });
    }
  },

  // ------------------------------------------------------
  // 5. LETTERPRESS (Classical Stanza)
  // ------------------------------------------------------
  letterpress: {
    id: 'letterpress',
    name: '5. Letterpress (Classical Stanza)',
    renderHTML: (page, theme, spread = 50) => {
      const stanzas = (page.body || '').split(/\n\s*\n/);
      const emblem = (page.specificParams && page.specificParams.pressEmblem) || '*';
      const year = (page.specificParams && page.specificParams.publicationYear) || '2026';

      const stanzasHtml = stanzas.map(st => {
        const lines = st.split('\n').map(l => parseRichTokensToHtml(l, theme.accent)).join('<br>');
        return `<div class="letterpress-stanza" style="text-align: center; font-size: 0.875rem; line-height: 1.9; margin-bottom: 1.5rem;">${lines}</div>`;
      }).join('');

      return `
        <div class="tpl-letterpress-wrap" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; padding: 2rem 1rem;">
          <div style="font-size: 1.5rem; color: ${theme.accent}; margin-bottom: 1rem;">${escapeHtml(emblem)}</div>
          <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.45rem; font-weight: 700; margin-bottom: 0.35rem;">${escapeHtml(page.title || 'Lives of Raft')}</h1>
          <div style="font-size: 0.75rem; color: ${theme.muted}; letter-spacing: 0.15em; margin-bottom: 2.5rem;">${escapeHtml(page.author || 'Rob Schlegel').toUpperCase()} &middot; ${escapeHtml(year)}</div>
          
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 440px;">
            ${stanzasHtml}
          </div>

          <div style="margin-top: auto; font-size: 0.6875rem; color: ${theme.muted}; letter-spacing: 0.2em;">
            RUANGROBIN ARCHIVAL PRESS
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.accent;
      ctx.font = '700 36px "Michelangelus"';
      ctx.fillText((page.specificParams && page.specificParams.pressEmblem) || '*', w / 2, 380);

      ctx.fillStyle = theme.ink;
      ctx.font = '700 44px "Michelangelus"';
      ctx.fillText(page.title || 'Lives of Raft', w / 2, 450);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`${(page.author || 'Rob Schlegel').toUpperCase()}  ·  2026`, w / 2, 500);

      const stanzas = (page.body || '').split(/\n\s*\n/);
      let curY = 680;
      stanzas.forEach(st => {
        const lines = st.split('\n');
        lines.forEach(l => {
          renderCanvasRichLine(ctx, l, w / 2, curY, 28, theme, 'center');
          curY += 52;
        });
        curY += 36;
      });
      ctx.textAlign = 'start';
    }
  },

  // ------------------------------------------------------
  // 6. CALLIGRAM (Shape Map Silhouette)
  // ------------------------------------------------------
  calligram: {
    id: 'calligram',
    name: '6. Calligram (Shape Map)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n');
      const linesHtml = rawLines.map(line => {
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div style="white-space: pre; font-size: 0.6875rem; line-height: 1.45; letter-spacing: 0.12em; text-align: center;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-calligram-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; align-items: center; justify-content: space-between;">
          <div style="text-align: center; margin-bottom: 1rem; width: 100%;">
            <h1 class="tpl-entry-title" style="font-size: 1.3rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'Places of Poetry')}</h1>
            <div style="font-size: 0.71875rem; color: ${theme.muted};">${escapeHtml(page.author || 'Guillaume Apollinaire')}</div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 100%;">
            ${linesHtml}
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.65rem; color: ${theme.muted}; border-top: 1px solid ${theme.border}; padding-top: 0.5rem; margin-top: 1rem;">
            <span>${escapeHtml((page.specificParams && page.specificParams.leftAnnotation) || 'MAPPING IN VERSE')}</span>
            <span>${escapeHtml((page.specificParams && page.specificParams.rightColophon) || 'AMPHORA SILHOUETTE')}</span>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'Places of Poetry', w / 2, 380);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText((page.author || 'Guillaume Apollinaire').toUpperCase(), w / 2, 430);

      const rawLines = (page.body || '').split('\n');
      let curY = 600;
      rawLines.forEach(l => {
        renderCanvasRichLine(ctx, l, w / 2, curY, 22, theme, 'center');
        curY += 38;
      });
      ctx.textAlign = 'start';
    }
  },

  // ------------------------------------------------------
  // 7. DECONSTRUCT (Diagonal Fracture)
  // ------------------------------------------------------
  deconstruct: {
    id: 'deconstruct',
    name: '7. Deconstruct (Diagonal Fracture)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const angles = [-6, 12, -4, 14, -8, 10, -12, 6];
      const factor = spread / 50;

      const linesHtml = rawLines.map((line, idx) => {
        const deg = angles[idx % angles.length] * (factor * 0.4 + 0.8);
        const shiftX = (idx * 24 * factor) % 180;
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div style="transform: rotate(${deg}deg); margin-left: ${shiftX}px; margin-top: 1.25rem; font-size: 0.875rem; font-weight: 700; transform-origin: left center;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-deconstruct-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <div class="tpl-header-block" style="margin-bottom: 2rem;">
            <h1 class="tpl-entry-title" style="font-size: 1.35rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'Deconstruction')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted};">${escapeHtml(page.author || 'Jacques D.')}</div>
          </div>
          <div style="flex: 1; position: relative;">
            ${linesHtml}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'Deconstruction', 160, 380);

      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const angles = [-6, 12, -4, 14, -8, 10, -12, 6];
      let curY = 560;

      rawLines.forEach((l, idx) => {
        const deg = angles[idx % angles.length] * (Math.PI / 180);
        ctx.save();
        ctx.translate(160 + (idx * 40), curY);
        ctx.rotate(deg);
        renderCanvasRichLine(ctx, l, 0, 0, 32, theme, 'left');
        ctx.restore();
        curY += 130;
      });
    }
  },

  // ------------------------------------------------------
  // 8. BUTTERFLY (Dual Wing Steps)
  // ------------------------------------------------------
  butterfly: {
    id: 'butterfly',
    name: '8. Butterfly Steps (Dual Wing)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const leftLines = rawLines.filter((_, i) => i % 2 === 0);
      const rightLines = rawLines.filter((_, i) => i % 2 !== 0);

      const leftHtml = leftLines.map((l, idx) => {
        const indent = (idx * 16) % 120;
        return `<div style="text-align: right; margin-right: ${indent}px; margin-bottom: 0.75rem; font-size: 0.8125rem;">${parseRichTokensToHtml(l, theme.accent)}</div>`;
      }).join('');

      const rightHtml = rightLines.map((l, idx) => {
        const indent = (idx * 16) % 120;
        return `<div style="text-align: left; margin-left: ${indent}px; margin-bottom: 0.75rem; font-size: 0.8125rem;">${parseRichTokensToHtml(l, theme.accent)}</div>`;
      }).join('');

      return `
        <div class="tpl-butterfly-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h1 class="tpl-entry-title" style="font-size: 1.35rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'The Chuang Tzu Paradox')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted};">${escapeHtml(page.author || 'Chuang Tzu')}</div>
          </div>
          <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
            <div>${leftHtml}</div>
            <div>${rightHtml}</div>
          </div>
          <div style="text-align: center; font-size: 0.6875rem; color: ${theme.muted}; letter-spacing: 0.15em; border-top: 1px solid ${theme.border}; padding-top: 0.5rem;">
            ${escapeHtml((page.specificParams && page.specificParams.bottomColophon) || 'BILATERAL CHUANG TZU SYMMETRY')}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'The Chuang Tzu Paradox', w / 2, 380);

      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const leftLines = rawLines.filter((_, i) => i % 2 === 0);
      const rightLines = rawLines.filter((_, i) => i % 2 !== 0);

      let curY = 600;
      leftLines.forEach((l, idx) => {
        renderCanvasRichLine(ctx, l, (w / 2) - 80 - (idx * 25), curY, 26, theme, 'right');
        curY += 75;
      });

      curY = 600;
      rightLines.forEach((l, idx) => {
        renderCanvasRichLine(ctx, l, (w / 2) + 80 + (idx * 25), curY, 26, theme, 'left');
        curY += 75;
      });
      ctx.textAlign = 'start';
    }
  },

  // ------------------------------------------------------
  // 9. CROSS (Diagonal Cross Lattice)
  // ------------------------------------------------------
  cross: {
    id: 'cross',
    name: '9. Diagonal Cross (Lattice Intersection)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const mid = Math.ceil(rawLines.length / 2);
      const stream1 = rawLines.slice(0, mid).join('  &middot;  ');
      const stream2 = rawLines.slice(mid).join('  &middot;  ');

      return `
        <div class="tpl-cross-wrap" style="height: 100%; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; transform: rotate(-22deg); width: 140%; text-align: center; font-size: 0.8125rem; color: ${theme.muted}; font-weight: 700; white-space: nowrap;">
            ${parseRichTokensToHtml(stream1, theme.accent)}
          </div>
          <div style="position: absolute; transform: rotate(22deg); width: 140%; text-align: center; font-size: 0.8125rem; color: ${theme.accent}; font-weight: 700; white-space: nowrap;">
            ${parseRichTokensToHtml(stream2, theme.accent)}
          </div>
          <div style="z-index: 2; background: ${theme.paper}; border: 1.5px solid ${theme.accent}; border-radius: 8px; padding: 1.25rem 2rem; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
            <div style="font-size: 0.625rem; color: ${theme.accent}; font-weight: 700; letter-spacing: 0.15em;">INTERSECTION</div>
            <h1 style="font-size: 1.25rem; font-weight: 700; color: ${theme.ink}; margin: 0.25rem 0;">${escapeHtml(page.title || 'Traveled Wake')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted};">${escapeHtml(page.author || 'ruangrobin')}</div>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const mid = Math.ceil(rawLines.length / 2);
      const stream1 = rawLines.slice(0, mid).join('   ·   ');
      const stream2 = rawLines.slice(mid).join('   ·   ');

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-22 * (Math.PI / 180));
      ctx.textAlign = 'center';
      renderCanvasRichLine(ctx, stream1, 0, 0, 26, theme, 'center');
      ctx.restore();

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(22 * (Math.PI / 180));
      ctx.textAlign = 'center';
      renderCanvasRichLine(ctx, stream2, 0, 0, 26, theme, 'center');
      ctx.restore();

      // Center plaque
      ctx.fillStyle = theme.paper;
      ctx.fillRect((w / 2) - 220, (h / 2) - 100, 440, 200);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect((w / 2) - 220, (h / 2) - 100, 440, 200);

      ctx.textAlign = 'center';
      ctx.fillStyle = theme.accent;
      ctx.font = '700 18px "Michelangelus"';
      ctx.fillText('INTERSECTION', w / 2, (h / 2) - 40);

      ctx.fillStyle = theme.ink;
      ctx.font = '700 36px "Michelangelus"';
      ctx.fillText(page.title || 'Traveled Wake', w / 2, (h / 2) + 10);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText((page.author || 'ruangrobin').toUpperCase(), w / 2, (h / 2) + 55);
      ctx.textAlign = 'start';
    }
  },

  // ------------------------------------------------------
  // 10. PERSPECTIVE (Vanishing Depth)
  // ------------------------------------------------------
  perspective: {
    id: 'perspective',
    name: '10. Perspective Echo (Vanishing Depth)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const linesHtml = rawLines.map((line, idx) => {
        const scale = 1.0 - (idx * 0.08);
        const op = Math.max(0.25, 1.0 - (idx * 0.12));
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div style="transform: skewX(-14deg) scale(${scale}); transform-origin: left; opacity: ${op}; font-size: 1.15rem; font-weight: 700; margin-bottom: 0.65rem; color: ${idx === 0 ? theme.ink : (idx === 1 ? theme.accent : theme.muted)};">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-perspective-wrap" style="height: 100%; display: flex; flex-direction: column; justify-content: center; overflow: hidden; padding-left: 2rem;">
          <div style="font-size: 0.6875rem; color: ${theme.muted}; letter-spacing: 0.2em; margin-bottom: 2rem;">
            PERSPECTIVE ECHO // 3D HORIZON
          </div>
          <div style="perspective: 600px;">
            ${linesHtml}
          </div>
          <div style="margin-top: 2rem; font-size: 1.25rem; font-weight: 700; color: ${theme.ink};">
            ${escapeHtml(page.title || 'These Rooms Are Hollow')}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      let curY = 600;

      rawLines.forEach((l, idx) => {
        const scale = 1.0 - (idx * 0.07);
        const fs = Math.round(38 * scale);
        ctx.save();
        ctx.transform(1, 0, -0.25, 1, 160 + (idx * 30), curY);
        renderCanvasRichLine(ctx, l, 0, 0, fs, theme, 'left');
        ctx.restore();
        curY += 120;
      });

      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'These Rooms Are Hollow', 160, curY + 60);
    }
  },

  // ------------------------------------------------------
  // 11. ARC STREAM (Sonic Radiodrama)
  // ------------------------------------------------------
  arcstream: {
    id: 'arcstream',
    name: '11. Arc Stream (Sonic Radiodrama)',
    renderHTML: (page, theme, spread = 50) => {
      const p = page.specificParams || {};
      const author = p.authorWord || page.author || 'giovanni fontana';
      const mainWord = p.mainCurveWord || 'radiodramma';
      const subWord = p.subWord || '(in)terazione';
      const tag = p.footTag || 'geiger';
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);

      let staticChars = '';
      for (let i = 0; i < 24; i++) {
        const ch = ['A', 'V', 'T', 'I', 'O'][i % 5];
        const jx = (Math.sin(i * 1.5) * 12).toFixed(1);
        const op = (0.35 + (i % 4) * 0.2).toFixed(2);
        staticChars += `<div style="margin-left: ${jx}px; opacity: ${op}; font-size: 0.6875rem;">${ch}</div>`;
      }

      const stanzas = rawLines.map(l => `<div style="font-size: 0.8125rem; line-height: 1.8;">${parseRichTokensToHtml(l, theme.accent)}</div>`).join('');

      return `
        <div class="tpl-arcstream-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          <div>
            <div style="font-size: 1.25rem; font-weight: 700; color: ${theme.ink}; margin-bottom: 0.25rem;">${escapeHtml(author.toLowerCase())}</div>
            <svg viewBox="0 0 460 160" style="width: 100%; height: auto; overflow: visible;">
              <path id="arc-stream-curve-web" d="M 20,40 Q 240,30 380,180" fill="none" stroke="none" />
              <text font-family="'Michelangelus'" font-size="34" font-weight="700" fill="${theme.ink}">
                <textPath href="#arc-stream-curve-web" startOffset="0%">${escapeHtml(mainWord.toLowerCase())}</textPath>
              </text>
            </svg>
            <div style="margin-top: -60px; margin-left: 65px; font-size: 1.15rem; font-weight: 700; color: ${theme.accent};">${escapeHtml(subWord)}</div>
          </div>

          <div style="display: flex; gap: 2rem; flex: 1; margin-top: 1.5rem;">
            <div style="width: 80px; display: flex; flex-direction: column; gap: 0.2rem; color: ${theme.accent};">
              ${staticChars}
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
              ${stanzas}
            </div>
          </div>

          <div style="margin-top: auto; font-size: 1.6rem; font-weight: 700; color: ${theme.ink}; letter-spacing: 0.05em;">
            ${escapeHtml(tag.toLowerCase())}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 38px "Michelangelus"';
      ctx.fillText((page.author || 'giovanni fontana').toLowerCase(), 160, 360);

      ctx.fillStyle = theme.ink;
      ctx.font = '700 72px "Michelangelus"';
      ctx.fillText('radiodramma', 160, 480);

      ctx.fillStyle = theme.accent;
      ctx.font = '700 44px "Michelangelus"';
      ctx.fillText('(in)terazione', 340, 560);

      // Left static ribbon
      ctx.fillStyle = theme.accent;
      ctx.font = '700 24px "Michelangelus"';
      for (let i = 0; i < 28; i++) {
        const ch = ['A', 'V', 'T', 'I', 'O'][i % 5];
        ctx.fillText(ch, 180 + Math.sin(i * 1.5) * 30, 720 + (i * 55));
      }

      // Stanzas
      renderCanvasRichParagraph(ctx, page.body || '', 420, 720, w - 580, 56, 28, theme);

      // Bottom tag
      ctx.fillStyle = theme.ink;
      ctx.font = '700 64px "Michelangelus"';
      ctx.fillText('geiger', 160, h - 260);
    }
  },

  // ------------------------------------------------------
  // 12. HELIX (3D Cylindrical Spiral)
  // ------------------------------------------------------
  helix: {
    id: 'helix',
    name: '12. Helix Coil (3D Spiral Cylinder)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const numLoops = Math.min(7, Math.max(4, rawLines.length));
      const loopSpacing = Math.round(480 / numLoops);

      let pathsSvg = '';
      for (let i = 0; i < numLoops; i++) {
        const yTop = 40 + (i * loopSpacing);
        const yBot = yTop + loopSpacing;
        const lineText = rawLines[i % rawLines.length] || '';
        pathsSvg += `
          <path d="M 460,${yTop} C 460,${yTop - 20} 40,${yTop - 20} 40,${yTop + 25}" 
                stroke="${theme.border}" fill="none" stroke-width="1.2" stroke-dasharray="3 3"/>
          <path id="helix-front-web-${i}" d="M 40,${yTop + 25} C 40,${yBot + 15} 460,${yBot + 15} 460,${yBot}" 
                stroke="${theme.ink}" fill="none" stroke-width="1.5"/>
          <text fill="${theme.ink}" font-family="'Michelangelus'" font-size="13" font-weight="700">
            <textPath href="#helix-front-web-${i}" startOffset="5%">${escapeHtml(lineText)}</textPath>
          </text>
        `;
      }

      return `
        <div class="tpl-helix-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; align-items: center; justify-content: center;">
          <div style="text-align: center; margin-bottom: 0.5rem; width: 100%;">
            <h1 class="tpl-entry-title" style="font-size: 1.35rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'Times Wither and Coil')}</h1>
          </div>
          <svg viewBox="0 0 500 580" style="width: 100%; max-width: 500px; height: 100%; max-height: 580px;">
            ${pathsSvg}
          </svg>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.ink;
      ctx.font = '700 44px "Michelangelus"';
      ctx.fillText(page.title || 'Times Wither and Coil', w / 2, 380);

      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const numLoops = Math.min(8, Math.max(5, rawLines.length));
      const spacing = 2600 / (numLoops + 1);

      for (let i = 0; i < numLoops; i++) {
        const y = 550 + (i * spacing);
        const l = rawLines[i % rawLines.length] || '';

        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.ellipse(w / 2, y, 700, 160, 0, Math.PI, 0);
        ctx.stroke();

        ctx.strokeStyle = theme.ink;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(w / 2, y, 700, 160, 0, 0, Math.PI);
        ctx.stroke();

        renderCanvasRichLine(ctx, l, w / 2, y + 60, 32, theme, 'center');
      }
      ctx.textAlign = 'start';
    }
  },

  // ------------------------------------------------------
  // 13. STUTTER (Phonetic Echo Sound Matrix)
  // ------------------------------------------------------
  stutter: {
    id: 'stutter',
    name: '13. Stutter Matrix (Phonetic Echo)',
    renderHTML: (page, theme, spread = 50) => {
      const leftStutter = ['o o o panels', 'a a a a a r c', 'e e e e e n s', 'I I I I I n n', 's s s s s and', 'c c c o o o v e', 'w w w v i s h e s', 't t t y t y t y', 'l a l a l a c l u d e s'];
      const rightStutter = ['s! s!', 'h e', 'u p !', 'p p !', 'b b !', 'b b b', 'A A A A A', 's s s s', '1 1 1 1'];
      const richBody = parseRichTokensToHtml(page.body || '', theme.accent);

      return `
        <div class="tpl-stutter-wrap" style="height: 100%; display: grid; grid-template-columns: 130px 1fr 80px; gap: 1rem; align-items: center; overflow: hidden;">
          <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.6875rem; color: ${theme.muted};">
            ${leftStutter.map(s => `<div>${escapeHtml(s)}</div>`).join('')}
          </div>
          <div style="padding: 0 0.5rem; text-align: justify; font-size: 0.8125rem; line-height: 1.8; color: ${theme.ink};">
            <h1 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${escapeHtml(page.title || 'Phonetic Matrix')}</h1>
            ${richBody}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.75rem; color: ${theme.accent}; font-weight: 700; text-align: right;">
            ${rightStutter.map(s => `<div>${escapeHtml(s)}</div>`).join('')}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      // Left flank
      ctx.fillStyle = theme.muted;
      ctx.font = '22px "Michelangelus"';
      const leftStutter = ['o o o panels', 'a a a a a r c', 'e e e e e n s', 'I I I I I n n', 's s s s s and', 'c c c o o o v e', 'w w w v i s h e s', 't t t y t y t y', 'l a l a l a c l u d e s'];
      leftStutter.forEach((s, idx) => {
        ctx.fillText(s, 160, 520 + (idx * 160));
      });

      // Right flank
      ctx.fillStyle = theme.accent;
      ctx.font = '700 24px "Michelangelus"';
      ctx.textAlign = 'right';
      const rightStutter = ['s! s!', 'h e', 'u p !', 'p p !', 'b b !', 'b b b', 'A A A A A', 's s s s', '1 1 1 1'];
      rightStutter.forEach((s, idx) => {
        ctx.fillText(s, w - 160, 520 + (idx * 160));
      });
      ctx.textAlign = 'start';

      // Center
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'Phonetic Matrix', 540, 480);

      renderCanvasRichParagraph(ctx, page.body || '', 540, 580, w - 1000, 54, 28, theme);
    }
  },

  // ------------------------------------------------------
  // 14. TOPOGRAPHY (Terrain Ridge Wave)
  // ------------------------------------------------------
  topography: {
    id: 'topography',
    name: '14. Topography (Terrain Ridge Wave)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const numLines = Math.min(10, Math.max(4, rawLines.length));
      const lineGap = Math.round(520 / numLines);

      let pathsSvg = '';
      for (let i = 0; i < numLines; i++) {
        const y = 30 + (i * lineGap);
        const l = rawLines[i % rawLines.length] || '';
        pathsSvg += `
          <path id="topo-web-${i}" d="M 10,${y} C 140,${y - 30} 240,${y + 20} 420,${y}" fill="none" stroke="none" />
          <text fill="${theme.ink}" font-family="'Michelangelus'" font-size="11.5" font-weight="700" letter-spacing="0.1em">
            <textPath href="#topo-web-${i}">${escapeHtml(l)}</textPath>
          </text>
        `;
      }

      return `
        <div class="tpl-topography-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
          <div style="margin-bottom: 0.5rem;">
            <h1 class="tpl-entry-title" style="font-size: 1.25rem; font-weight: 700; letter-spacing: 0.15em; color: ${theme.ink};">
              ${escapeHtml(page.title || 'A METHODOLOGY OF VISION').toUpperCase()}
            </h1>
            <div style="font-size: 0.6875rem; color: ${theme.muted};">${escapeHtml(page.author || 'ruangrobin').toUpperCase()}</div>
          </div>
          <div style="flex: 1; position: relative;">
            <svg viewBox="0 0 480 580" style="width: calc(100% - 70px); height: 100%;">
              ${pathsSvg}
            </svg>
            <div style="position: absolute; right: 0; top: 10%; display: flex; flex-direction: column; gap: 0.5rem; font-size: 2.2rem; font-weight: 700; color: transparent; -webkit-text-stroke: 1.5px ${theme.accent};">
              <div>OF</div>
              <div>VISION</div>
            </div>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText((page.title || 'A METHODOLOGY OF VISION').toUpperCase(), 160, 360);

      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      let curY = 520;
      rawLines.slice(0, 10).forEach(l => {
        ctx.save();
        ctx.translate(160, curY);
        renderCanvasRichLine(ctx, l, 0, 0, 26, theme, 'left');
        ctx.restore();
        curY += 85;
      });

      // Flank outline words
      ctx.font = '700 64px "Michelangelus"';
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.strokeText('OF', w - 300, 600);
      ctx.strokeText('VISION', w - 300, 700);
    }
  },

  // ------------------------------------------------------
  // 15. VORTEX (Concentric Swirl)
  // ------------------------------------------------------
  vortex: {
    id: 'vortex',
    name: '15. Vortex Spiral (Concentric Swirl)',
    renderHTML: (page, theme, spread = 50) => {
      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const cx = 250;
      const cy = 250;
      const radii = [45, 95, 145, 195, 235];

      let ringsSvg = '';
      radii.forEach((r, idx) => {
        const l = rawLines[idx % rawLines.length] || 'blackberry staggering juice';
        const rep = `${l}   ${l}   ${l}`;
        ringsSvg += `
          <path id="vortex-web-${idx}" 
                d="M ${cx - r},${cy} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0" 
                fill="none" stroke="none" />
          <text fill="${theme.ink}" font-family="'Michelangelus'" font-size="${11 + idx}" font-weight="700" letter-spacing="0.12em">
            <textPath href="#vortex-web-${idx}" startOffset="${(idx * 20) % 100}%">${escapeHtml(rep)}</textPath>
          </text>
        `;
      });

      return `
        <div class="tpl-vortex-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; align-items: center; justify-content: center;">
          <div style="text-align: center; margin-bottom: 0.5rem; width: 100%;">
            <h1 class="tpl-entry-title" style="font-size: 1.3rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'Blackberry Staggering')}</h1>
          </div>
          <svg viewBox="0 0 500 500" style="width: 100%; max-width: 480px; height: auto;">
            ${ringsSvg}
          </svg>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.ink;
      ctx.font = '700 44px "Michelangelus"';
      ctx.fillText(page.title || 'Blackberry Staggering', w / 2, 380);

      const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
      const cx = w / 2;
      const cy = (h / 2) + 100;
      const radii = [240, 440, 640, 840, 1040];

      radii.forEach((r, idx) => {
        const text = rawLines[idx % rawLines.length] || 'blackberry staggering juice';
        const full = `${text}     ${text}     ${text}`;
        const count = full.length;
        const step = (Math.PI * 2) / count;

        ctx.font = `700 ${22 + idx * 4}px "Michelangelus"`;
        ctx.fillStyle = idx === 2 ? theme.accent : theme.ink;

        for (let c = 0; c < count; c++) {
          const ang = c * step + (idx * 0.4);
          const px = cx + Math.cos(ang) * r;
          const py = cy + Math.sin(ang) * r;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ang + Math.PI / 2);
          ctx.fillText(full[c], 0, 0);
          ctx.restore();
        }
      });
      ctx.textAlign = 'start';
    }
  }
};

// ========================================================
// 3. MASTER TEMPLATE REGISTRY EXPORT
// ========================================================

class TemplateRegistry {
  constructor() {
    this.engines = TEMPLATE_ENGINES;
  }

  get(id) {
    return this.engines[id] || this.engines.cascade;
  }

  getAll() {
    return Object.values(this.engines);
  }

  renderHTML(tplId, page, theme, spreadVal = 50) {
    const engine = this.get(tplId);
    return engine.renderHTML(page, theme, spreadVal);
  }

  renderCanvas(tplId, ctx, page, theme, spreadVal, canvasWidth, canvasHeight) {
    const engine = this.get(tplId);
    return engine.renderCanvas(ctx, page, theme, spreadVal, canvasWidth, canvasHeight);
  }
}

const templateRegistry = new TemplateRegistry();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    parseRichTokensToHtml,
    tokenizeRichTextForCanvas,
    renderCanvasRichLine,
    renderCanvasRichParagraph,
    TEMPLATE_ENGINES,
    TemplateRegistry,
    templateRegistry
  };
}
if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.parseRichTokensToHtml = parseRichTokensToHtml;
  window.tokenizeRichTextForCanvas = tokenizeRichTextForCanvas;
  window.renderCanvasRichLine = renderCanvasRichLine;
  window.renderCanvasRichParagraph = renderCanvasRichParagraph;
  window.TEMPLATE_ENGINES = TEMPLATE_ENGINES;
  window.TemplateRegistry = TemplateRegistry;
  window.templateRegistry = templateRegistry;
}
