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
 * Converts **bold** and {accent} tokens into SVG <tspan> elements for use within <textPath> or <text>.
 */
function parseRichTokensToSvgTspan(rawText, accentColor = 'var(--c-blue)') {
  if (!rawText) return '';
  let safe = escapeHtml(rawText);
  // Bold & Accent compound: **{word}**
  safe = safe.replace(/\*\*\{([^*]+?)\}\*\*/g, `<tspan font-weight="700" fill="${accentColor}">$1</tspan>`);
  // Bold token: **word**
  safe = safe.replace(/\*\*([^*]+?)\*\*/g, `<tspan font-weight="700">$1</tspan>`);
  // Accent token: {word} or [accent]word[/accent]
  safe = safe.replace(/\{([^}]+?)\}/g, `<tspan font-weight="700" fill="${accentColor}">$1</tspan>`);
  safe = safe.replace(/\[accent\]([\s\S]*?)\[\/accent\]/g, `<tspan font-weight="700" fill="${accentColor}">$1</tspan>`);
  return safe;
}

/**
 * Strips rich typography tokens returning clean plain text.
 */
function stripRichTokens(text) {
  if (!text) return '';
  return text
    .replace(/\*\*\{([^*]+?)\}\*\*/g, '$1')
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/\{([^}]+?)\}/g, '$1')
    .replace(/\[accent\]([\s\S]*?)\[\/accent\]/g, '$1');
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
      const p = page.specificParams || {};
      const stepOffset = p.stepOffset !== undefined ? Number(p.stepOffset) : 26;
      const trackingDecay = p.trackingDecay !== undefined ? Number(p.trackingDecay) : 0.28;
      const threshold = p.dissolveThreshold !== undefined ? Number(p.dissolveThreshold) : 4;
      const factor = spread / 50;

      // Extract lines from body or dedicated fields
      let rawLines;
      if (page.body && page.body.trim()) {
        rawLines = page.body.split('\n');
      } else {
        const parts = [
          p.openingStanzas || '',
          p.fractureLines || '',
          p.decayLetters || ''
        ].filter(Boolean);
        rawLines = parts.join('\n\n').split('\n');
      }

      const numLines = rawLines.length || 1;

      // Anti-overflow dynamic font-size clamping (scales down if many lines)
      const fontSize = Math.max(0.72, Math.min(1.05, 1.15 - (numLines * 0.012)));
      const lineGap = numLines > 22 ? '0.25rem' : (numLines > 16 ? '0.35rem' : '0.45rem');

      const linesHtml = rawLines.map((line, idx) => {
        if (!line.trim()) return `<div style="height: ${fontSize * 1.1}rem;"></div>`;
        
        // Specimen parity: First `threshold` lines maintain equilibrium (left-aligned),
        // subsequent lines progressively accelerate in lateral drift and tracking decay.
        let indentPx = 0;
        let letterSpacing = 0.02;
        let opacity = 1.0;

        if (idx >= threshold) {
          const fractureProgress = (idx - threshold + 1) / Math.max(1, numLines - threshold);
          // Non-linear entropy acceleration: drift shifts right in stepped increments
          const rawDrift = Math.pow(fractureProgress, 1.6) * stepOffset * 8 * factor;
          // Anti-overflow clamp: ensures line cannot breach the right container margin
          indentPx = Math.min(240 * factor, rawDrift);
          // Letter tracking decay expands progressively up to safe ceiling
          letterSpacing = Math.min(0.42, 0.02 + (fractureProgress * trackingDecay * factor));
          // Subtly decay opacity to simulate thermodynamic heat death / dispersion
          opacity = Math.max(0.4, 1 - (fractureProgress * 0.5));
        }

        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div class="cascade-verse-line" style="margin-left: ${indentPx.toFixed(1)}px; letter-spacing: ${letterSpacing.toFixed(3)}em; opacity: ${opacity.toFixed(2)}; font-size: ${fontSize}rem; line-height: 1.5; word-break: break-word;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-cascade-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 0.5rem 0;">
          <div class="tpl-header-block" style="margin-bottom: 1.25rem;">
            <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.35rem; font-weight: 700; margin-bottom: 0.2rem; letter-spacing: -0.01em;">${escapeHtml(page.title || 'Entropy')}</h1>
            <div class="tpl-entry-author" style="color: ${theme.muted}; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;">${escapeHtml(page.author ? `- ${page.author}` : '- A. Harris')}</div>
          </div>
          <div class="cascade-lines-container" style="flex: 1; display: flex; flex-direction: column; gap: ${lineGap}; overflow: hidden;">
            ${linesHtml}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const p = page.specificParams || {};
      const stepOffset = p.stepOffset !== undefined ? Number(p.stepOffset) : 26;
      const trackingDecay = p.trackingDecay !== undefined ? Number(p.trackingDecay) : 0.28;
      const threshold = p.dissolveThreshold !== undefined ? Number(p.dissolveThreshold) : 4;
      const factor = spread / 50;

      // Header title
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'Entropy', 160, 340);

      // Header author
      ctx.fillStyle = theme.muted;
      ctx.font = '700 22px "Michelangelus"';
      ctx.fillText((page.author ? `- ${page.author}` : '- A. Harris').toUpperCase(), 160, 395);

      let rawLines;
      if (page.body && page.body.trim()) {
        rawLines = page.body.split('\n');
      } else {
        const parts = [
          p.openingStanzas || '',
          p.fractureLines || '',
          p.decayLetters || ''
        ].filter(Boolean);
        rawLines = parts.join('\n\n').split('\n');
      }

      let curY = 500;
      const numLines = rawLines.length || 1;
      const baseFs = Math.max(20, Math.min(32, Math.round(36 - numLines * 0.45)));
      const lineGap = Math.round(baseFs * (numLines > 20 ? 1.5 : 1.75));

      rawLines.forEach((l, idx) => {
        if (!l.trim()) { curY += lineGap * 0.6; return; }
        
        let shiftX = 160;
        let trackingPx = 0;
        let op = 1.0;

        if (idx >= threshold) {
          const fractureProgress = (idx - threshold + 1) / Math.max(1, numLines - threshold);
          const rawDrift = Math.pow(fractureProgress, 1.6) * (stepOffset * 32) * factor;
          // Clamped shift to guarantee text stays within printable bounds (w - 750)
          shiftX = 160 + Math.min(w - 750, rawDrift);
          trackingPx = Math.min(18, fractureProgress * trackingDecay * 30 * factor);
          op = Math.max(0.4, 1 - (fractureProgress * 0.5));
        }

        ctx.save();
        ctx.globalAlpha = op;
        if (typeof ctx.letterSpacing === 'string') {
          ctx.letterSpacing = `${trackingPx.toFixed(1)}px`;
        }
        renderCanvasRichLine(ctx, l, shiftX, curY, baseFs, theme, 'left');
        ctx.restore();

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
      const bodyText = page.body || '';
      const charCount = bodyText.length;
      const userCompaction = (page.specificParams && page.specificParams.wordSpacingCompaction !== undefined ? Number(page.specificParams.wordSpacingCompaction) : 20) / 100;
      const userLineHeight = (page.specificParams && page.specificParams.lineHeightScale !== undefined ? Number(page.specificParams.lineHeightScale) : 2.0);

      // Auto-compaction steps for anti-overflow
      let baseRem = 0.875;
      let dynamicLineHeight = userLineHeight;
      if (charCount > 500) {
        baseRem = Math.max(0.68, 0.875 - ((charCount - 500) / 1000) * 0.25);
        dynamicLineHeight = Math.max(1.4, userLineHeight * (1 - userCompaction * 0.3));
      } else if (charCount > 300) {
        baseRem = Math.max(0.75, 0.875 - ((charCount - 300) / 800) * 0.15);
        dynamicLineHeight = Math.max(1.6, userLineHeight * 0.9);
      }
      const wordSpacingEm = Math.max(0.12, 0.46 * (1 - userCompaction));
      const richBody = parseRichTokensToHtml(bodyText, theme.accent);

      return `
        <div class="tpl-justified-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 0.5rem 0;">
          <div class="tpl-header-block" style="margin-bottom: 1.75rem;">
            <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.35rem; font-weight: 700; margin-bottom: 0.3rem; letter-spacing: -0.02em;">${escapeHtml(page.title || 'Untitled')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted}; font-style: italic;">${escapeHtml(page.author || 'ruangrobin')}</div>
          </div>
          <div class="justified-body-field" style="flex: 1; text-align: justify; text-align-last: justify; word-spacing: ${wordSpacingEm}em; font-size: ${baseRem}rem; line-height: ${dynamicLineHeight}; letter-spacing: 0.04em; color: ${theme.ink}; hyphens: auto;">
            ${richBody}
          </div>
          <div style="margin-top: auto; font-size: 0.65rem; color: ${theme.muted}; border-top: 1px solid ${theme.border}; padding-top: 0.5rem; letter-spacing: 0.08em; display: flex; justify-content: space-between;">
            <span>${escapeHtml((page.specificParams && page.specificParams.colophonNote) || 'PLATE 03 · AIRY JUSTIFIED FIELD')}</span>
            <span>COMPACTION: ${Math.round(userCompaction * 100)}%</span>
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

      // Measure character count and scale font for 300 DPI canvas
      const bodyText = page.body || '';
      const charCount = bodyText.length;
      const fontSize = charCount > 500 ? 22 : (charCount > 300 ? 24 : 28);
      const lineHeight = fontSize * 2.2;
      renderCanvasRichParagraph(ctx, bodyText, 160, 560, w - 320, lineHeight, fontSize, theme);
    }
  },

  // ------------------------------------------------------
  // 4. CONTOUR (Curved Wave Flow)
  // ------------------------------------------------------
  contour: {
    id: 'contour',
    name: '4. Contour (Curved Flow)',
    renderHTML: (page, theme, spread = 50) => {
      // 1. Resolve body verses from specificParams.verseLines or page.body
      const rawText = (page.specificParams && page.specificParams.verseLines) || page.body || '';
      const rawLines = rawText.split('\n');
      const numLines = rawLines.length || 1;
      const factor = spread / 50;

      // 2. Read dedicated fields with defaults
      const userAmplitude = (page.specificParams && page.specificParams.waveAmplitude !== undefined)
        ? Number(page.specificParams.waveAmplitude) : 35;
      const userMarginBase = (page.specificParams && page.specificParams.marginBase !== undefined)
        ? Number(page.specificParams.marginBase) : 20;
      const userFrequency = (page.specificParams && page.specificParams.waveFrequency !== undefined)
        ? Number(page.specificParams.waveFrequency) : 1.0;

      // 3. Dynamic anti-overflow vertical scaling based on line count
      let baseRem = 0.8125;
      let lineHeight = 1.8;
      let gapRem = 0.35;
      if (numLines > 26) {
        baseRem = Math.max(0.68, 0.8125 - ((numLines - 26) * 0.012));
        lineHeight = Math.max(1.4, 1.8 - ((numLines - 26) * 0.025));
        gapRem = 0.15;
      } else if (numLines > 16) {
        baseRem = Math.max(0.75, 0.8125 - ((numLines - 16) * 0.006));
        lineHeight = Math.max(1.6, 1.8 - ((numLines - 16) * 0.015));
        gapRem = 0.25;
      }

      // 4. Clamped wave amplitude and base margin to prevent right margin penetration
      const effectiveBasePct = Math.min(38, Math.max(2, userMarginBase * (factor * 0.3 + 0.7)));
      const rawAmpPct = (userAmplitude * 0.45) * factor;
      const maxAllowedAmp = Math.max(5, 52 - effectiveBasePct);
      const effectiveAmpPct = Math.min(rawAmpPct, maxAllowedAmp);

      const linesHtml = rawLines.map((line, idx) => {
        if (!line.trim()) return `<div style="height: ${baseRem * 0.8}rem;"></div>`;
        const progress = idx / Math.max(1, numLines - 1);
        // Multi-cycle sinusoidal wave following dedicated waveFrequency
        const waveAngle = progress * (Math.PI * 2 * userFrequency);
        const waveOffset = Math.sin(waveAngle) * effectiveAmpPct;
        
        // Strict boundary clamping: minimum 4%, maximum 52% to guarantee text never hits right margin
        const indentPct = Math.max(4, Math.min(52, effectiveBasePct + waveOffset));
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div class="contour-wave-line" style="margin-left: ${indentPct.toFixed(2)}%; font-size: ${baseRem}rem; line-height: ${lineHeight}; white-space: nowrap;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-contour-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 0.5rem 0;">
          <div class="tpl-header-block" style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid ${theme.border}; padding-bottom: 0.65rem;">
            <div>
              <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.35rem; font-weight: 700; margin-bottom: 0.2rem; letter-spacing: -0.01em;">${escapeHtml(page.title || 'The Maple')}</h1>
              <div style="font-size: 0.75rem; color: ${theme.muted}; letter-spacing: 0.08em; text-transform: uppercase;">BY: ${escapeHtml(page.author || 'Bob Hicok')}</div>
            </div>
            <div style="font-size: 0.65rem; color: ${theme.accent}; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
              SINUSOIDAL CONTOUR // ${userFrequency.toFixed(1)}x CYCLE
            </div>
          </div>
          <div class="contour-lines-container" style="flex: 1; display: flex; flex-direction: column; gap: ${gapRem}rem; justify-content: center; overflow: hidden;">
            ${linesHtml}
          </div>
          <div style="margin-top: auto; font-size: 0.65rem; color: ${theme.muted}; padding-top: 0.5rem; letter-spacing: 0.08em; display: flex; justify-content: space-between; border-top: 1px dashed ${theme.border};">
            <span>${escapeHtml((page.specificParams && page.specificParams.colophonNote) || 'PLATE 04 · ORGANIC WAVE FLOW')}</span>
            <span>AMP: ${Math.round(userAmplitude)}% · BASE: ${Math.round(userMarginBase)}%</span>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      // 1. Folio Header
      ctx.fillStyle = theme.ink;
      ctx.font = '700 40px "Michelangelus"';
      ctx.fillText(page.title || 'The Maple', 160, 360);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`BY: ${(page.author || 'Bob Hicok').toUpperCase()}`, 160, 410);

      // Header Tag
      const userFrequency = (page.specificParams && page.specificParams.waveFrequency !== undefined)
        ? Number(page.specificParams.waveFrequency) : 1.0;
      const tagText = `SINUSOIDAL CONTOUR // ${userFrequency.toFixed(1)}x CYCLE`;
      ctx.fillStyle = theme.accent;
      ctx.font = '700 18px "Michelangelus"';
      ctx.fillText(tagText, w - 160 - ctx.measureText(tagText).width, 410);

      // 2. Resolve body lines
      const rawText = (page.specificParams && page.specificParams.verseLines) || page.body || '';
      const rawLines = rawText.split('\n');
      const numLines = rawLines.length || 1;
      const factor = spread / 50;

      const userAmplitude = (page.specificParams && page.specificParams.waveAmplitude !== undefined)
        ? Number(page.specificParams.waveAmplitude) : 35;
      const userMarginBase = (page.specificParams && page.specificParams.marginBase !== undefined)
        ? Number(page.specificParams.marginBase) : 20;

      // Anti-overflow Canvas Font scaling
      let baseFs = 26;
      let lineGap = 48;
      if (numLines > 26) {
        baseFs = Math.max(18, 26 - Math.round((numLines - 26) * 0.4));
        lineGap = Math.max(30, Math.round(baseFs * 1.65));
      } else if (numLines > 16) {
        baseFs = Math.max(22, 26 - Math.round((numLines - 16) * 0.25));
        lineGap = Math.max(38, Math.round(baseFs * 1.75));
      }

      // Safe Canvas clamping parameters
      const basePx = 160 + ((userMarginBase / 100) * (w - 320) * 0.5 * (factor * 0.3 + 0.7));
      const rawAmpPx = ((userAmplitude / 100) * (w - 320) * 0.32) * factor;
      const maxAllowedAmpPx = Math.max(50, (w - 160 - 900) - basePx);
      const effectiveAmpPx = Math.min(rawAmpPx, maxAllowedAmpPx);

      let curY = 520;
      rawLines.forEach((line, idx) => {
        if (!line.trim()) { curY += Math.round(lineGap * 0.6); return; }
        const progress = idx / Math.max(1, numLines - 1);
        const waveAngle = progress * (Math.PI * 2 * userFrequency);
        const shiftX = Math.max(160, Math.min(w - 950, basePx + Math.sin(waveAngle) * effectiveAmpPx));
        renderCanvasRichLine(ctx, line, shiftX, curY, baseFs, theme, 'left');
        curY += lineGap;
      });

      // Bottom footer rule and label
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(160, h - 340);
      ctx.lineTo(w - 160, h - 340);
      ctx.stroke();

      ctx.fillStyle = theme.muted;
      ctx.font = '700 18px "Michelangelus"';
      ctx.fillText((page.specificParams && page.specificParams.colophonNote) || 'PLATE 04 · ORGANIC WAVE FLOW', 160, h - 305);
      const paramTag = `AMP: ${Math.round(userAmplitude)}% · BASE: ${Math.round(userMarginBase)}%`;
      ctx.fillText(paramTag, w - 160 - ctx.measureText(paramTag).width, h - 305);
    }
  },

  // ------------------------------------------------------
  // 5. LETTERPRESS (Classical Stanza)
  // ------------------------------------------------------
  letterpress: {
    id: 'letterpress',
    name: '5. Letterpress (Classical Stanza)',
    renderHTML: (page, theme, spread = 50) => {
      const rawBody = (page.specificParams && page.specificParams.stanzas) || page.body || '';
      const stanzas = rawBody.split(/\n\s*\n/).filter(st => st.trim().length > 0);
      const emblem = (page.specificParams && (page.specificParams.printersMark || page.specificParams.pressEmblem || page.specificParams.ornamentGlyph)) || '*';
      const year = (page.specificParams && page.specificParams.publicationYear) || '2026';
      const rawStanzaSpacing = (page.specificParams && page.specificParams.stanzaSpacing != null) ? Number(page.specificParams.stanzaSpacing) : 1.5;
      const alignment = (page.specificParams && page.specificParams.stanzaAlignment) || 'center';

      // Multi-stanza line count and dynamic auto-scaling to prevent overflow
      const totalLines = stanzas.reduce((acc, st) => acc + st.split('\n').filter(l => l.trim().length > 0).length, 0);

      let fontSizeRem = 0.875;
      let lineHeight = 1.9;
      let effectiveStanzaMargin = rawStanzaSpacing;

      if (totalLines > 24) {
        // Auto-scale line-height from 1.8 down to 1.4 to prevent multi-stanza overflow
        lineHeight = Math.max(1.35, +(1.8 - (totalLines - 24) * 0.03).toFixed(2));
        fontSizeRem = Math.max(0.72, +(0.875 - (totalLines - 24) * 0.012).toFixed(3));
        effectiveStanzaMargin = Math.max(0.6, +(rawStanzaSpacing * 0.65).toFixed(2));
      } else if (totalLines > 16) {
        lineHeight = Math.max(1.5, +(1.9 - (totalLines - 16) * 0.04).toFixed(2));
        fontSizeRem = Math.max(0.80, +(0.875 - (totalLines - 16) * 0.008).toFixed(3));
        effectiveStanzaMargin = Math.max(0.9, +(rawStanzaSpacing * 0.85).toFixed(2));
      }

      const textAlignStyle = alignment === 'left' ? 'text-align: left;' : (alignment === 'indented' ? 'text-align: left; text-indent: 1.5rem;' : 'text-align: center;');

      const stanzasHtml = stanzas.map(st => {
        const lines = st.split('\n').map(l => parseRichTokensToHtml(l, theme.accent)).join('<br>');
        return `<div class="letterpress-stanza" style="${textAlignStyle} font-size: ${fontSizeRem}rem; line-height: ${lineHeight}; margin-bottom: ${effectiveStanzaMargin}rem;">${lines}</div>`;
      }).join('');

      return `
        <div class="tpl-letterpress-wrap" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; overflow: hidden; padding: 2.25rem 1.25rem;">
          <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 1.25rem;">
            <div style="font-size: 1.5rem; color: ${theme.accent}; margin-bottom: 0.75rem; line-height: 1;">${escapeHtml(emblem)}</div>
            <h1 class="tpl-entry-title" style="color: ${theme.ink}; font-size: 1.45rem; font-weight: 700; margin-bottom: 0.35rem; letter-spacing: 0.04em;">${escapeHtml(page.title || 'Lives of Raft')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted}; letter-spacing: 0.15em;">${escapeHtml(page.author || 'Rob Schlegel').toUpperCase()} &middot; ${escapeHtml(year)}</div>
          </div>
          
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; max-width: 460px; margin: auto;">
            ${stanzasHtml}
          </div>

          <div style="margin-top: auto; padding-top: 0.75rem; font-size: 0.6875rem; color: ${theme.muted}; letter-spacing: 0.2em;">
            RUANGROBIN ARCHIVAL PRESS
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.textAlign = 'center';
      const emblem = (page.specificParams && (page.specificParams.printersMark || page.specificParams.pressEmblem || page.specificParams.ornamentGlyph)) || '*';
      const year = (page.specificParams && page.specificParams.publicationYear) || '2026';
      const rawStanzaSpacing = (page.specificParams && page.specificParams.stanzaSpacing != null) ? Number(page.specificParams.stanzaSpacing) : 1.5;
      const alignment = (page.specificParams && page.specificParams.stanzaAlignment) || 'center';

      ctx.fillStyle = theme.accent;
      ctx.font = '700 36px "Michelangelus"';
      ctx.fillText(emblem, w / 2, 380);

      ctx.fillStyle = theme.ink;
      ctx.font = '700 46px "Michelangelus"';
      ctx.fillText(page.title || 'Lives of Raft', w / 2, 450);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`${(page.author || 'Rob Schlegel').toUpperCase()}  ·  ${year}`, w / 2, 510);

      const rawBody = (page.specificParams && page.specificParams.stanzas) || page.body || '';
      const stanzas = rawBody.split(/\n\s*\n/).filter(st => st.trim().length > 0);
      const totalLines = stanzas.reduce((acc, st) => acc + st.split('\n').filter(l => l.trim().length > 0).length, 0);

      let canvasFontSize = 28;
      let lineStep = 52;
      let stanzaGap = Math.round(rawStanzaSpacing * 24);

      if (totalLines > 24) {
        canvasFontSize = Math.max(18, Math.round(28 - (totalLines - 24) * 0.45));
        lineStep = Math.max(28, Math.round(canvasFontSize * 1.45));
        stanzaGap = Math.max(16, Math.round(rawStanzaSpacing * 12));
      } else if (totalLines > 16) {
        canvasFontSize = Math.max(24, Math.round(28 - (totalLines - 16) * 0.35));
        lineStep = Math.max(38, Math.round(canvasFontSize * 1.6));
        stanzaGap = Math.max(22, Math.round(rawStanzaSpacing * 18));
      }

      // Vertically center stanzas within available canvas body space (Y: 620 to 3180)
      const totalHeight = (totalLines * lineStep) + (Math.max(0, stanzas.length - 1) * stanzaGap);
      let curY = Math.max(620, Math.round(620 + (2560 - totalHeight) / 2));

      const alignX = alignment === 'left' ? (w / 2 - 200) : (alignment === 'indented' ? (w / 2 - 180) : (w / 2));
      const canvasAlign = alignment === 'left' ? 'left' : (alignment === 'indented' ? 'left' : 'center');

      stanzas.forEach(st => {
        const lines = st.split('\n');
        lines.forEach((l, lIdx) => {
          let lineX = alignX;
          if (alignment === 'indented' && lIdx % 2 === 1) {
            lineX += 30; // Classical alternate line indentation
          }
          renderCanvasRichLine(ctx, l, lineX, curY, canvasFontSize, theme, canvasAlign);
          curY += lineStep;
        });
        curY += stanzaGap;
      });

      // Bottom Archival Colophon Tag
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.muted;
      ctx.font = '700 18px "Michelangelus"';
      ctx.fillText('RUANGROBIN ARCHIVAL PRESS', w / 2, 3320);
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
      const rawText = (page.body && page.body.trim()) ? page.body : ((page.specificParams && page.specificParams.shapeMapText) || '');
      const rawLines = rawText.split('\n');
      const numLines = Math.max(1, rawLines.length);
      const tracking = (page.specificParams && page.specificParams.letterTracking) !== undefined ? page.specificParams.letterTracking : 0.12;

      // Anti-overflow font and line-height clamping based on line density
      const fontSize = Math.max(0.55, Math.min(0.75, (13 / numLines) * 0.72));
      const lineH = Math.max(1.15, Math.min(1.5, (18 / numLines) * 1.35));

      const linesHtml = rawLines.map(line => {
        const rich = parseRichTokensToHtml(line, theme.accent);
        return `<div class="calligram-silhouette-line" style="white-space: pre; font-size: ${fontSize}rem; line-height: ${lineH}; letter-spacing: ${tracking}em; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">${rich}</div>`;
      }).join('');

      return `
        <div class="tpl-calligram-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; align-items: center; justify-content: space-between;">
          <div style="text-align: center; margin-bottom: 1rem; width: 100%;">
            <h1 class="tpl-entry-title" style="font-size: 1.3rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'Places of Poetry')}</h1>
            <div style="font-size: 0.71875rem; color: ${theme.muted};">${escapeHtml(page.author || 'Guillaume Apollinaire')}</div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 100%; width: 100%; overflow: hidden;">
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

      const rawText = (page.body && page.body.trim()) ? page.body : ((page.specificParams && page.specificParams.shapeMapText) || '');
      const rawLines = rawText.split('\n');
      const numLines = Math.max(1, rawLines.length);

      // Anti-overflow font and gap calculation for 300 DPI Canvas
      const baseFs = Math.max(16, Math.min(26, Math.round(360 / Math.max(12, numLines))));
      const lineGap = Math.round(baseFs * 1.6);
      let curY = Math.max(540, Math.min(760, (h / 2) - ((numLines * lineGap) / 2)));

      rawLines.forEach(l => {
        renderCanvasRichLine(ctx, l, w / 2, curY, baseFs, theme, 'center');
        curY += lineGap;
      });

      // Flank annotations and bottom colophon line on Canvas
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, h - 260);
      ctx.lineTo(w - 160, h - 260);
      ctx.stroke();

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.textAlign = 'left';
      const leftTag = (page.specificParams && page.specificParams.leftAnnotation) || 'MAPPING IN VERSE';
      ctx.fillText(leftTag, 160, h - 210);

      ctx.textAlign = 'right';
      const rightTag = (page.specificParams && page.specificParams.rightColophon) || 'AMPHORA SILHOUETTE';
      ctx.fillText(rightTag, w - 160, h - 210);
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
      const p = page.specificParams || {};
      const rawText = (p.fragmentLines && p.fragmentLines.trim()) ? p.fragmentLines : (page.body || '');
      const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);
      const numLines = Math.max(1, rawLines.length);
      const factor = spread / 50;

      // Safe Angular Rotation Clamping (Strictly restricted to +-18 deg via AABB physics)
      const baseMaxAngle = Math.min(18, Math.max(4, Math.abs(Number(p.rotationAngle || p.angleVariance || 12))));
      const anglePattern = [-0.5, 1.0, -0.35, 1.15, -0.7, 0.85, -1.0, 0.5];

      // Parse custom sliceOffsets or procedural stagger
      let customOffsets = null;
      if (p.sliceOffsets && typeof p.sliceOffsets === 'string') {
        customOffsets = p.sliceOffsets.split(',').map(v => parseFloat(v.trim())).filter(n => !isNaN(n));
      }
      const staggerBase = Number(p.staggerDepth || 35);

      // Accent lines index set
      const accentSet = new Set();
      if (p.accentIndices) {
        String(p.accentIndices).split(',').forEach(idxStr => {
          const idx = parseInt(idxStr.trim(), 10);
          if (!isNaN(idx)) accentSet.add(idx);
        });
      }

      // Dynamic font size floor and scale to prevent vertical blowout
      const baseFsRem = Math.max(0.75, Math.min(1.05, 1.15 - (numLines * 0.018)));

      const linesHtml = rawLines.map((line, idx) => {
        // Compute rotation angle clamped strictly to [-18, +18]
        const rawDeg = anglePattern[idx % anglePattern.length] * baseMaxAngle * (factor * 0.35 + 0.8);
        const deg = Math.max(-18, Math.min(18, Math.round(rawDeg * 10) / 10));

        // Horizontal displacement offset (slice offset)
        let shiftX = 0;
        if (customOffsets && customOffsets.length > 0) {
          shiftX = customOffsets[idx % customOffsets.length] * (factor * 0.5 + 0.75);
        } else {
          shiftX = ((idx * 28 * (staggerBase / 35)) % 160) * factor;
        }

        // AABB Physics Clamping against right container boundary (~480px width)
        const charCount = line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\{([^}]+)\}/g, '$1').length;
        const estimatedW = charCount * (baseFsRem * 9.5);
        const rad = Math.abs(deg) * (Math.PI / 180);
        const rotW = estimatedW * Math.cos(rad) + (baseFsRem * 16) * Math.sin(rad);
        if (shiftX + rotW > 460) {
          shiftX = Math.max(0, 460 - rotW);
        }

        const isAccentLine = accentSet.has(idx);
        let rich = parseRichTokensToHtml(line, theme.accent);
        if (isAccentLine && !rich.includes('rr-token-accent')) {
          rich = `<span class="rr-token-accent" style="color: ${theme.accent}; font-weight: 700;">${rich}</span>`;
        }

        // Pure typographic presentation with subtle typewriter overprint fracture
        const hasOverprint = line.includes('**') || isAccentLine || idx % 3 === 1;
        const overprintStyle = hasOverprint
          ? 'text-shadow: 0.35px 0.35px 0 currentColor, -0.3px -0.2px 0 currentColor;'
          : '';

        return `
          <div class="deconstruct-fracture-line" style="
            transform: rotate(${deg}deg);
            transform-origin: left center;
            margin-left: ${Math.round(shiftX)}px;
            margin-top: 1.15rem;
            font-size: ${baseFsRem}rem;
            font-weight: 700;
            line-height: 1.35;
            letter-spacing: 0.02em;
            color: ${isAccentLine ? theme.accent : theme.ink};
            ${overprintStyle}
          ">
            ${rich}
          </div>
        `;
      }).join('');

      return `
        <div class="tpl-deconstruct-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          <div class="tpl-header-block" style="margin-bottom: 1.5rem;">
            <h1 class="tpl-entry-title" style="font-size: 1.35rem; font-weight: 700; color: ${theme.ink}; margin-bottom: 0.25rem;">${escapeHtml(page.title || 'Deconstruction')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted}; letter-spacing: 0.08em;">${escapeHtml(page.author || 'Jacques D.').toUpperCase()}</div>
          </div>
          <div class="deconstruct-field-container" style="flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
            ${linesHtml}
          </div>
          <div style="margin-top: auto; font-size: 0.65rem; color: ${theme.muted}; border-top: 1px solid ${theme.border}; padding-top: 0.4rem; display: flex; justify-content: space-between;">
            <span>AABB ROTATION SAFE &plusmn;18&deg;</span>
            <span>DIAGONAL FRACTURE</span>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'Deconstruction', 160, 360);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText((page.author || 'Jacques D.').toUpperCase(), 160, 410);

      const p = page.specificParams || {};
      const rawText = (p.fragmentLines && p.fragmentLines.trim()) ? p.fragmentLines : (page.body || '');
      const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);
      const numLines = Math.max(1, rawLines.length);
      const factor = spread / 50;

      // Safe Angular Rotation Clamping (Strictly restricted to +-18 deg via AABB physics)
      const baseMaxAngle = Math.min(18, Math.max(4, Math.abs(Number(p.rotationAngle || p.angleVariance || 12))));
      const anglePattern = [-0.5, 1.0, -0.35, 1.15, -0.7, 0.85, -1.0, 0.5];

      let customOffsets = null;
      if (p.sliceOffsets && typeof p.sliceOffsets === 'string') {
        customOffsets = p.sliceOffsets.split(',').map(v => parseFloat(v.trim())).filter(n => !isNaN(n));
      }
      const staggerBase = Number(p.staggerDepth || 35);

      const accentSet = new Set();
      if (p.accentIndices) {
        String(p.accentIndices).split(',').forEach(idxStr => {
          const idx = parseInt(idxStr.trim(), 10);
          if (!isNaN(idx)) accentSet.add(idx);
        });
      }

      // Dynamic Canvas font size and vertical spacing to fit 300 DPI bounds (Y: 540 to 3180)
      const canvasFs = Math.max(22, Math.min(34, Math.round(38 - numLines * 0.6)));
      const lineGap = Math.round(canvasFs * 2.8);
      let curY = Math.max(540, Math.min(760, (h / 2) - ((numLines * lineGap) / 2)));

      rawLines.forEach((l, idx) => {
        const rawDeg = anglePattern[idx % anglePattern.length] * baseMaxAngle * (factor * 0.35 + 0.8);
        const deg = Math.max(-18, Math.min(18, Math.round(rawDeg * 10) / 10));
        const rad = deg * (Math.PI / 180);

        let shiftX = 0;
        if (customOffsets && customOffsets.length > 0) {
          shiftX = customOffsets[idx % customOffsets.length] * (factor * 1.5 + 2.0);
        } else {
          shiftX = ((idx * 85 * (staggerBase / 35)) % 520) * factor;
        }

        // AABB Physics Clamping against right canvas border (w - 160)
        ctx.font = `700 ${canvasFs}px "Michelangelus"`;
        const plainText = l.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\{([^}]+)\}/g, '$1');
        const textW = ctx.measureText(plainText).width;
        const rotW = textW * Math.cos(Math.abs(rad)) + (canvasFs * 1.5) * Math.sin(Math.abs(rad));
        const posX = Math.max(160, Math.min(w - 200 - rotW, 160 + shiftX));

        const isAccentLine = accentSet.has(idx);

        ctx.save();
        ctx.translate(posX, curY);
        ctx.rotate(rad);

        // Word-only presentation: Primary typographic render
        renderCanvasRichLine(ctx, l, 0, 0, canvasFs, isAccentLine ? { ...theme, ink: theme.accent } : theme, 'left');

        // Tactile Overprint Fracture: Subtle secondary overstrike pass matching specimen
        if (l.includes('**') || isAccentLine || idx % 3 === 1) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          renderCanvasRichLine(ctx, l, 1.2, 0.8, canvasFs, isAccentLine ? { ...theme, ink: theme.accent } : theme, 'left');
          ctx.restore();
        }

        ctx.restore();
        curY += lineGap;
      });

      // Bottom Archival Colophon
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, h - 260);
      ctx.lineTo(w - 160, h - 260);
      ctx.stroke();

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.textAlign = 'left';
      ctx.fillText('AABB CLAMPED [±18°]  ·  DIAGONAL FRACTURE', 160, h - 210);
      ctx.textAlign = 'right';
      ctx.fillText('RUANGROBIN PURE TYPOGRAPHY', w - 160, h - 210);
      ctx.textAlign = 'start';
    }
  },

  // ------------------------------------------------------
  // 8. BUTTERFLY (Dual Wing Steps)
  // ------------------------------------------------------
  butterfly: {
    id: 'butterfly',
    name: '8. Butterfly Steps (Dual Wing)',
    renderHTML: (page, theme, spread = 50) => {
      const p = page.specificParams || {};
      const factor = (spread || 50) / 50;

      // Extract left and right wing verses from dedicated fields or body fallback
      const leftRaw = p.leftWingText || p.leftWing || '';
      const rightRaw = p.rightWingText || p.rightWing || '';
      
      let leftLines = [];
      let rightLines = [];
      if (leftRaw.trim() || rightRaw.trim()) {
        leftLines = leftRaw.split('\n').filter(l => l.trim().length > 0);
        rightLines = rightRaw.split('\n').filter(l => l.trim().length > 0);
      } else {
        const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
        leftLines = rawLines.filter((_, i) => i % 2 === 0);
        rightLines = rawLines.filter((_, i) => i % 2 !== 0);
      }

      // Dedicated keyword accenting helper
      const accentKeywords = p.accentWords || '';
      const highlightKeywords = (line) => {
        if (!line || !accentKeywords) return line;
        const words = (typeof accentKeywords === 'string' ? accentKeywords.split(',') : accentKeywords)
          .map(w => w.trim())
          .filter(w => w.length > 0);
        if (words.length === 0) return line;
        let out = line;
        words.forEach(word => {
          const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const reg = new RegExp(`(?<![{*\\w])(${escaped})(?![}*\\w])`, 'gi');
          out = out.replace(reg, '{$1}');
        });
        return out;
      };

      const maxLines = Math.max(leftLines.length, rightLines.length, 1);
      // Dynamic anti-overflow font clamping
      const fontSize = Math.max(0.72, Math.min(0.875, 1.0 - (maxLines * 0.015)));

      // Bilateral fixed 46% columns with 8% central gutter
      // Step margin clamping prevents center collision across spine:
      // Left wing: right-aligned, margin-right pushes text leftward (away from center spine)
      // Right wing: left-aligned, margin-left pushes text rightward (away from center spine)
      const leftHtml = leftLines.map((l, idx) => {
        const progress = idx / Math.max(1, leftLines.length - 1);
        const wingCurve = Math.sin(progress * Math.PI);
        const stepMargin = Math.min(75, Math.max(0, Math.round((wingCurve * 50 + (idx % 2) * 12) * factor)));
        const highlighted = highlightKeywords(l);
        return `<div class="butterfly-wing-line" style="text-align: right; margin-right: ${stepMargin}px; margin-bottom: 0.65rem; font-size: ${fontSize}rem; line-height: 1.6;">${parseRichTokensToHtml(highlighted, theme.accent)}</div>`;
      }).join('');

      const rightHtml = rightLines.map((l, idx) => {
        const progress = idx / Math.max(1, rightLines.length - 1);
        const wingCurve = Math.sin(progress * Math.PI);
        const stepMargin = Math.min(75, Math.max(0, Math.round((wingCurve * 50 + (idx % 2) * 12) * factor)));
        const highlighted = highlightKeywords(l);
        return `<div class="butterfly-wing-line" style="text-align: left; margin-left: ${stepMargin}px; margin-bottom: 0.65rem; font-size: ${fontSize}rem; line-height: 1.6;">${parseRichTokensToHtml(highlighted, theme.accent)}</div>`;
      }).join('');

      const colophon = p.bottomColophon || 'LEPIDOPTERA // CHUANG TZU';

      return `
        <div class="tpl-butterfly-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h1 class="tpl-entry-title" style="font-size: 1.35rem; font-weight: 700; color: ${theme.ink}; margin-bottom: 0.25rem;">${escapeHtml(page.title || 'The Chuang Tzu Paradox')}</h1>
            <div style="font-size: 0.75rem; color: ${theme.muted}; letter-spacing: 0.1em;">${escapeHtml((page.author || 'Chuang Tzu').toUpperCase())}</div>
          </div>
          <div style="flex: 1; display: grid; grid-template-columns: 46% 46%; column-gap: 8%; width: 100%; box-sizing: border-box; align-items: center;">
            <div class="butterfly-col-left" style="overflow: hidden; width: 100%;">${leftHtml}</div>
            <div class="butterfly-col-right" style="overflow: hidden; width: 100%;">${rightHtml}</div>
          </div>
          <div style="text-align: center; font-size: 0.6875rem; color: ${theme.muted}; letter-spacing: 0.15em; border-top: 1px solid ${theme.border}; padding-top: 0.5rem; margin-top: auto;">
            ${escapeHtml(colophon)}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread = 50, w, h) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText(page.title || 'The Chuang Tzu Paradox', w / 2, 380);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText((page.author || 'Chuang Tzu').toUpperCase(), w / 2, 430);

      const p = page.specificParams || {};
      const factor = (spread || 50) / 50;

      const leftRaw = p.leftWingText || p.leftWing || '';
      const rightRaw = p.rightWingText || p.rightWing || '';
      
      let leftLines = [];
      let rightLines = [];
      if (leftRaw.trim() || rightRaw.trim()) {
        leftLines = leftRaw.split('\n').filter(l => l.trim().length > 0);
        rightLines = rightRaw.split('\n').filter(l => l.trim().length > 0);
      } else {
        const rawLines = (page.body || '').split('\n').filter(l => l.trim().length > 0);
        leftLines = rawLines.filter((_, i) => i % 2 === 0);
        rightLines = rawLines.filter((_, i) => i % 2 !== 0);
      }

      const accentKeywords = p.accentWords || '';
      const highlightKeywords = (line) => {
        if (!line || !accentKeywords) return line;
        const words = (typeof accentKeywords === 'string' ? accentKeywords.split(',') : accentKeywords)
          .map(w => w.trim())
          .filter(w => w.length > 0);
        if (words.length === 0) return line;
        let out = line;
        words.forEach(word => {
          const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const reg = new RegExp(`(?<![{*\\w])(${escaped})(?![}*\\w])`, 'gi');
          out = out.replace(reg, '{$1}');
        });
        return out;
      };

      // Exact 46% columns with 8% central gutter on 2480px width:
      // gutter width = w * 0.08 = 198.4px (gutterHalf = 99.2px)
      // column width = w * 0.46 = 1140.8px
      const cx = w / 2;
      const gutterHalf = w * 0.04;
      const maxLines = Math.max(leftLines.length, rightLines.length, 1);
      const fs = Math.max(22, Math.min(30, Math.round(34 - maxLines * 0.6)));
      const lineGap = Math.round(fs * 2.2);

      let curYLeft = 620;
      leftLines.forEach((l, idx) => {
        const progress = idx / Math.max(1, leftLines.length - 1);
        const wingCurve = Math.sin(progress * Math.PI);
        const stepMargin = Math.min(220, Math.max(0, Math.round((wingCurve * 140 + (idx % 2) * 25) * factor)));
        // Clamped at spine boundary (cx - gutterHalf) and steps outward leftward
        const posX = (cx - gutterHalf) - stepMargin;
        const highlighted = highlightKeywords(l);
        renderCanvasRichLine(ctx, highlighted, posX, curYLeft, fs, theme, 'right');
        curYLeft += lineGap;
      });

      let curYRight = 620;
      rightLines.forEach((l, idx) => {
        const progress = idx / Math.max(1, rightLines.length - 1);
        const wingCurve = Math.sin(progress * Math.PI);
        const stepMargin = Math.min(220, Math.max(0, Math.round((wingCurve * 140 + (idx % 2) * 25) * factor)));
        // Clamped at spine boundary (cx + gutterHalf) and steps outward rightward
        const posX = (cx + gutterHalf) + stepMargin;
        const highlighted = highlightKeywords(l);
        renderCanvasRichLine(ctx, highlighted, posX, curYRight, fs, theme, 'left');
        curYRight += lineGap;
      });

      // Bottom colophon
      const colophon = p.bottomColophon || 'LEPIDOPTERA // CHUANG TZU';
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.muted;
      ctx.font = '700 22px "Michelangelus"';
      ctx.fillText(colophon, cx, h - 220);
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
      const params = page.specificParams || {};
      const forwardRaw = params.forwardDiagText || params.forwardDiagLines || page.body || '';
      const backwardRaw = params.backwardDiagText || params.backwardDiagLines || page.body || '';
      const plaqueText = params.intersectionPlaque || params.centerFocalWord || page.title || 'Traveled Wake';
      const angle = Number(params.intersectionAngle) || 24;

      const forwardLines = forwardRaw.split('\n').filter(l => l.trim().length > 0);
      const backwardLines = backwardRaw.split('\n').filter(l => l.trim().length > 0);

      // Multi-ray spacing (perpendicular offset to form optical lattice)
      const raySpacing = Math.max(38, Math.min(65, 480 / Math.max(forwardLines.length, backwardLines.length, 1)));

      const forwardHtml = forwardLines.map((line, idx) => {
        const perpOffset = (idx - (forwardLines.length - 1) / 2) * raySpacing;
        return `
          <div style="position: absolute; top: calc(50% + ${perpOffset}px); left: 50%; transform: translate(-50%, -50%) rotate(-${angle}deg); width: 140%; max-width: 1400px; text-align: center; font-size: 0.8125rem; letter-spacing: 0.22em; color: ${idx % 2 === 0 ? theme.ink : theme.muted}; font-weight: 700; white-space: nowrap; pointer-events: none; opacity: 0.9;">
            ${parseRichTokensToHtml(line, theme.accent)}
          </div>
        `;
      }).join('');

      const backwardHtml = backwardLines.map((line, idx) => {
        const perpOffset = (idx - (backwardLines.length - 1) / 2) * raySpacing;
        return `
          <div style="position: absolute; top: calc(50% + ${perpOffset}px); left: 50%; transform: translate(-50%, -50%) rotate(${angle}deg); width: 140%; max-width: 1400px; text-align: center; font-size: 0.8125rem; letter-spacing: 0.22em; color: ${idx % 2 === 0 ? theme.accent : theme.ink}; font-weight: 700; white-space: nowrap; pointer-events: none; opacity: 0.9;">
            ${parseRichTokensToHtml(line, theme.accent)}
          </div>
        `;
      }).join('');

      return `
        <div class="tpl-cross-wrap" style="height: 100%; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: ${theme.paper};">
          <!-- Forward Diagonal Lattice Rays (-Angle) -->
          <div style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;">
            ${forwardHtml}
          </div>

          <!-- Backward Diagonal Lattice Rays (+Angle) -->
          <div style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;">
            ${backwardHtml}
          </div>

          <!-- Pure Typographic Focal Plaque (WORD ONLY - No plastic cards or drop-shadow boxes) -->
          <div class="tpl-cross-plaque" style="z-index: 5; text-align: center; padding: 1.25rem 2rem; background: radial-gradient(ellipse at center, ${theme.paper} 75%, transparent 100%);">
            <div style="font-size: 0.625rem; color: ${theme.accent}; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 0.35rem;">INTERSECTION</div>
            <h1 style="font-size: 1.45rem; font-weight: 700; color: ${theme.ink}; margin: 0; letter-spacing: 0.12em; text-transform: uppercase;">${escapeHtml(plaqueText)}</h1>
            <div style="font-size: 0.72rem; color: ${theme.muted}; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 0.35rem;">${escapeHtml(page.author || 'ruangrobin')}</div>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const params = page.specificParams || {};
      const forwardRaw = params.forwardDiagText || params.forwardDiagLines || page.body || '';
      const backwardRaw = params.backwardDiagText || params.backwardDiagLines || page.body || '';
      const plaqueText = params.intersectionPlaque || params.centerFocalWord || page.title || 'Traveled Wake';
      const angle = Number(params.intersectionAngle) || 24;
      const angleRad = angle * (Math.PI / 180);

      const forwardLines = forwardRaw.split('\n').filter(l => l.trim().length > 0);
      const backwardLines = backwardRaw.split('\n').filter(l => l.trim().length > 0);

      // Pythagoras calculation: page hypotenuse with safe corner margin to eliminate corner clipping
      const hypotenuse = Math.sqrt((w * w) + (h * h));
      const maxDiagLen = hypotenuse - 120; // 60px safe margin from corners

      const raySpacing = Math.max(70, Math.min(130, 950 / Math.max(forwardLines.length, backwardLines.length, 1)));

      // Render Forward Diagonal Lattice Rays (-Angle)
      forwardLines.forEach((line, idx) => {
        const perpOffset = (idx - (forwardLines.length - 1) / 2) * raySpacing;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-angleRad);

        // Measure line width and scale font size via Pythagoras bound
        const baseSize = 26;
        ctx.font = `700 ${baseSize}px "Michelangelus"`;
        const textWidth = ctx.measureText(line.replace(/[*{}]+/g, '')).width;
        const finalSize = textWidth > maxDiagLen ? Math.floor(baseSize * (maxDiagLen / textWidth)) : baseSize;

        renderCanvasRichLine(ctx, line, 0, perpOffset, finalSize, theme, 'center');
        ctx.restore();
      });

      // Render Backward Diagonal Lattice Rays (+Angle)
      backwardLines.forEach((line, idx) => {
        const perpOffset = (idx - (backwardLines.length - 1) / 2) * raySpacing;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(angleRad);

        // Measure line width and scale font size via Pythagoras bound
        const baseSize = 26;
        ctx.font = `700 ${baseSize}px "Michelangelus"`;
        const textWidth = ctx.measureText(line.replace(/[*{}]+/g, '')).width;
        const finalSize = textWidth > maxDiagLen ? Math.floor(baseSize * (maxDiagLen / textWidth)) : baseSize;

        renderCanvasRichLine(ctx, line, 0, perpOffset, finalSize, theme, 'center');
        ctx.restore();
      });

      // Central Typographic Plaque (WORD ONLY - pure typography with soft radial clearing, no rectangular card)
      const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 280);
      grad.addColorStop(0, theme.paper);
      grad.addColorStop(0.75, theme.paper);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, 280, 140, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = theme.accent;
      ctx.font = '700 18px "Michelangelus"';
      ctx.fillText('INTERSECTION', w / 2, (h / 2) - 35);

      ctx.fillStyle = theme.ink;
      ctx.font = '700 38px "Michelangelus"';
      ctx.fillText((plaqueText || 'Traveled Wake').toUpperCase(), w / 2, (h / 2) + 12);

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
      const p = page.specificParams || {};
      const factor = (spread || 50) / 50;

      // Dedicated fields with safe parameter resolution
      const vanishingAngle = Math.min(45, Math.max(15, Number(p.vanishingAngle) || 28));
      const depthStep = Math.min(100, Math.max(25, Number(p.depthStep) || 55)) * factor;
      const opacityFloor = Math.max(0.25, Math.min(0.60, Number(p.opacityFloor ?? p.recedingOpacityFloor) || 0.25));
      const planeCount = Math.min(8, Math.max(3, Number(p.planeCount) || 6));

      const rawText = p.depthLines || page.body || '';
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      const numLines = Math.max(1, lines.length);

      // Base font size scaling with line count to prevent vertical overflow
      const baseRem = Math.max(0.85, Math.min(1.35, 1.5 - (numLines * 0.045)));
      const opacityDecay = (1.0 - opacityFloor) / Math.max(1, planeCount - 1);

      // Build repeated depth planes receding in 3D perspective space (WORD ONLY)
      let planesHtml = '';
      for (let pIdx = 0; pIdx < planeCount; pIdx++) {
        const opacity = Math.max(opacityFloor, 1.0 - (pIdx * opacityDecay));
        const leftPx = Math.round(pIdx * depthStep);
        // Plane scaling floor: font size strictly >= 9px
        const planeScale = Math.max(0.42, 1.0 - (pIdx * 0.085));

        const linesHtml = lines.map((l) => {
          const rich = parseRichTokensToHtml(l, theme.accent);
          return `<div class="perspective-verse-line" style="white-space: nowrap; margin-bottom: 0.65rem; line-height: 1.35;">${rich}</div>`;
        }).join('');

        planesHtml += `
          <div class="perspective-echo-plane" style="position: absolute; top: 50%; transform: translateY(-50%); left: ${leftPx}px; opacity: ${opacity.toFixed(3)}; font-size: max(9px, calc(${baseRem}rem * ${planeScale})); font-family: 'Michelangelus', serif; color: ${theme.ink}; pointer-events: none; z-index: ${planeCount - pIdx};">
            ${linesHtml}
          </div>
        `;
      }

      return `
        <div class="tpl-perspective-wrap" style="height: 100%; width: 100%; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; position: relative; box-sizing: border-box; padding: 2rem 1.5rem; perspective: 900px; perspective-origin: 90% 50%;">
          <div class="perspective-stage" style="position: absolute; top: 0; left: 5%; width: 140%; height: 100%; transform-style: preserve-3d; transform: rotateY(-${vanishingAngle}deg); transform-origin: left center;">
            ${planesHtml}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const p = page.specificParams || {};
      const factor = (spread || 50) / 50;

      // Dedicated fields resolution
      const vanishingAngle = Math.min(45, Math.max(15, Number(p.vanishingAngle) || 28));
      const depthStepPx = (Math.min(100, Math.max(25, Number(p.depthStep) || 55)) / 50) * 115 * factor;
      const opacityFloor = Math.max(0.25, Math.min(0.60, Number(p.opacityFloor ?? p.recedingOpacityFloor) || 0.25));
      const planeCount = Math.min(8, Math.max(3, Number(p.planeCount) || 6));

      const rawText = p.depthLines || page.body || '';
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      const numLines = Math.max(1, lines.length);

      // Base typography sizing for 300 DPI canvas
      const baseFs = Math.max(28, Math.min(50, Math.round(58 - numLines * 1.5)));
      const startX = 220;
      const planeCenterY = h / 2;
      const opacityDecay = (1.0 - opacityFloor) / Math.max(1, planeCount - 1);
      const skewAngleRad = (vanishingAngle * Math.PI) / 180;

      // Draw repeated typographic depth planes from back to front
      for (let pIdx = planeCount - 1; pIdx >= 0; pIdx--) {
        const progress = pIdx / Math.max(1, planeCount - 1);
        const scale = Math.max(0.38, 1.0 - (progress * 0.52));
        // Strict scaling floors: font size >= 22px at 300 DPI (>= 9px at 72 DPI screen space), opacity >= 0.25
        const currentFs = Math.max(22, Math.round(baseFs * scale));
        const opacity = Math.max(opacityFloor, 1.0 - (pIdx * opacityDecay));

        const posX = startX + (pIdx * depthStepPx);
        const lineGap = Math.round(currentFs * 1.6);
        const totalHeight = numLines * lineGap;
        const planeStartY = planeCenterY - (totalHeight / 2);

        // Horizontal perspective shear simulating Y-axis perspective rotation
        const skewX = -Math.tan(skewAngleRad) * 0.36 * scale;

        ctx.save();
        ctx.globalAlpha = opacity;

        lines.forEach((line, lIdx) => {
          const lineY = planeStartY + (lIdx * lineGap);
          ctx.save();
          ctx.transform(scale, 0, skewX, scale, posX, lineY);
          renderCanvasRichLine(ctx, line, 0, 0, baseFs, theme, 'left');
          ctx.restore();
        });

        ctx.restore();
      }
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
      const rawStream = p.staticStream || p.staticStreamLetters || 'A v a ^ Y A v x V A i ^ A v a';
      const seedChars = rawStream.split(/\s+/).filter(Boolean);

      // Dynamic Arc Length & Font Clamping Formula (Anti-clipping)
      const wordLen = Math.max(1, mainWord.length);
      const arcFontSize = Math.min(36, Math.max(16, Math.floor(390 / (wordLen * 0.65))));

      // Phonetic Static Stream with Jitter and Opacity Decay
      let staticChars = '';
      const streamCount = 26;
      for (let i = 0; i < streamCount; i++) {
        const ch = seedChars[i % seedChars.length] || 'A';
        const jx = (Math.sin(i * 1.4) * 14).toFixed(1);
        const op = (0.3 + (i % 5) * 0.16).toFixed(2);
        staticChars += `<div style="margin-left: ${jx}px; opacity: ${op}; font-size: 0.6875rem; font-weight: 700; line-height: 1.1;">${escapeHtml(ch)}</div>`;
      }

      const rawLines = (p.stanzaBody || page.body || '').split('\n').filter(l => l.trim().length > 0);
      const stanzas = rawLines.map(l => `<div style="font-size: 0.8125rem; line-height: 1.8;">${parseRichTokensToHtml(l, theme.accent)}</div>`).join('');

      return `
        <div class="tpl-arcstream-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          <div>
            <div style="font-size: 1.25rem; font-weight: 700; color: ${theme.ink}; margin-bottom: 0.25rem; letter-spacing: -0.01em;">${escapeHtml(author.toLowerCase())}</div>
            <svg viewBox="0 0 480 200" style="width: 100%; height: auto; overflow: visible;">
              <path id="arc-stream-curve-web" d="M 20,40 Q 240,25 400,195" fill="none" stroke="none" />
              <text font-family="'Michelangelus'" font-size="${arcFontSize}" font-weight="700" fill="${theme.ink}" letter-spacing="0.02em">
                <textPath href="#arc-stream-curve-web" startOffset="0%">${escapeHtml(mainWord.toLowerCase())}</textPath>
              </text>
            </svg>
            <div style="margin-top: -65px; margin-left: 70px; font-size: 1.15rem; font-weight: 700; color: ${theme.accent}; letter-spacing: -0.01em;">${escapeHtml(subWord)}</div>
          </div>

          <div style="display: flex; gap: 2.2rem; flex: 1; margin-top: 1.75rem;">
            <div style="width: 60px; display: flex; flex-direction: column; gap: 0.35rem; color: ${theme.accent}; user-select: none;">
              ${staticChars}
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
              ${stanzas}
            </div>
          </div>

          <div style="margin-top: auto; font-size: 1.6rem; font-weight: 700; color: ${theme.ink}; letter-spacing: 0.04em;">
            ${escapeHtml(tag.toLowerCase())}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const p = page.specificParams || {};
      const author = (p.authorWord || page.author || 'giovanni fontana').toLowerCase();
      const mainWord = (p.mainCurveWord || 'radiodramma').toLowerCase();
      const subWord = p.subWord || '(in)terazione';
      const tag = (p.footTag || 'geiger').toLowerCase();
      const rawStream = p.staticStream || p.staticStreamLetters || 'A v a ^ Y A v x V A i ^ A v a';
      const seedChars = rawStream.split(/\s+/).filter(Boolean);

      // 1. Author Header
      ctx.fillStyle = theme.ink;
      ctx.font = '700 38px "Michelangelus"';
      ctx.fillText(author, 160, 360);

      // 2. Main Curved Word along Quadratic Bezier Arc on Canvas
      // Bezier points scaled to 300 DPI: P0(160, 480), P1(1200, 420), P2(2050, 1250)
      const P0 = { x: 160, y: 480 };
      const P1 = { x: 1200, y: 420 };
      const P2 = { x: 2050, y: 1250 };
      const wordLen = Math.max(1, mainWord.length);
      const canvasFontSize = Math.min(78, Math.max(34, Math.floor(1900 / (wordLen * 1.1))));
      ctx.font = `700 ${canvasFontSize}px "Michelangelus"`;
      ctx.fillStyle = theme.ink;

      for (let i = 0; i < wordLen; i++) {
        const t = (i / Math.max(1, wordLen - 1)) * 0.95;
        const mt = 1 - t;
        const x = mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x;
        const y = mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y;
        const dx = 2 * mt * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
        const dy = 2 * mt * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
        const angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(mainWord[i], 0, 0);
        ctx.restore();
      }

      // 3. Counter-word beneath arch
      ctx.fillStyle = theme.accent;
      ctx.font = '700 48px "Michelangelus"';
      ctx.fillText(subWord, 420, 620);

      // 4. Acoustic Static Stream Ribbon
      ctx.fillStyle = theme.accent;
      ctx.font = '700 28px "Michelangelus"';
      for (let i = 0; i < 28; i++) {
        const ch = seedChars[i % seedChars.length] || 'A';
        ctx.fillText(ch, 180 + Math.sin(i * 1.4) * 32, 760 + (i * 62));
      }

      // 5. Monologue Verses
      const bodyText = p.stanzaBody || page.body || '';
      renderCanvasRichParagraph(ctx, bodyText, 450, 760, w - 620, 60, 30, theme);

      // 6. Grounding Foot Tag
      ctx.fillStyle = theme.ink;
      ctx.font = '700 64px "Michelangelus"';
      ctx.fillText(tag, 160, h - 260);
    }
  },

  // ------------------------------------------------------
  // 12. HELIX (3D Cylindrical Spiral)
  // ------------------------------------------------------
  helix: {
    id: 'helix',
    name: '12. Helix Coil (3D Spiral Cylinder)',
    renderHTML: (page, theme, spread = 50) => {
      const p = page.specificParams || {};
      const rawText = p.spiralLoopsText || page.body || '';
      const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);
      const numLoops = Math.min(8, Math.max(4, parseInt(p.loopCount, 10) || rawLines.length));
      const cx = 250;
      const R = Math.min(220, Math.max(120, parseInt(p.cylinderRadius, 10) || 185));
      const pitch = Math.min(110, Math.max(50, parseInt(p.pitchHeight, 10) || 75));
      const startY = 40;

      let pathsSvg = '';
      for (let i = 0; i < numLoops; i++) {
        const yTop = startY + (i * pitch);
        const yMid = yTop + (pitch / 2);
        const yBot = yTop + pitch;
        const lineText = rawLines[i % rawLines.length] || '';
        const tspans = parseRichTokensToSvgTspan(lineText, theme.accent);

        // Back strand (pi to 2pi): contrast attenuation (subdued opacity)
        pathsSvg += `
          <path d="M ${cx + R},${yMid} C ${cx + R},${yTop - 10} ${cx - R},${yTop - 10} ${cx - R},${yMid}" 
                stroke="${theme.border}" fill="none" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.4"/>
          <path id="helix-front-web-${i}" d="M ${cx - R},${yMid} C ${cx - R},${yBot + 10} ${cx + R},${yBot + 10} ${cx + R},${yBot}" 
                stroke="${theme.ink}" fill="none" stroke-width="1.6"/>
          <text fill="${theme.ink}" font-family="'Michelangelus'" font-size="12.5" font-weight="700">
            <textPath href="#helix-front-web-${i}" startOffset="4%">${tspans}</textPath>
          </text>
        `;
      }

      return `
        <div class="tpl-helix-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; align-items: center; justify-content: center;">
          <div style="text-align: center; margin-bottom: 0.5rem; width: 100%;">
            <h1 class="tpl-entry-title" style="font-size: 1.35rem; font-weight: 700; color: ${theme.ink};">${escapeHtml(page.title || 'Times Wither and Coil')}</h1>
            <div style="font-size: 0.72rem; color: ${theme.muted}; font-style: italic;">${escapeHtml(page.author || 'Jacques D.')}</div>
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

      ctx.fillStyle = theme.muted;
      ctx.font = '700 22px "Michelangelus"';
      ctx.fillText((page.author || 'Jacques D.').toUpperCase(), w / 2, 430);

      const p = page.specificParams || {};
      const rawText = p.spiralLoopsText || page.body || '';
      const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);
      const numLoops = Math.min(8, Math.max(4, parseInt(p.loopCount, 10) || rawLines.length));
      const R = Math.min(960, Math.max(520, (parseInt(p.cylinderRadius, 10) || 185) * 4.4));
      const pitch = Math.min(480, Math.max(220, (parseInt(p.pitchHeight, 10) || 75) * 4.4));
      const startY = 600;

      for (let i = 0; i < numLoops; i++) {
        const yCenter = startY + (i * pitch);
        const l = rawLines[i % rawLines.length] || '';

        // Back strand with contrast attenuation
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.ellipse(w / 2, yCenter, R, pitch * 0.32, 0, Math.PI, 0);
        ctx.stroke();
        ctx.restore();

        // Front strand
        ctx.strokeStyle = theme.ink;
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(w / 2, yCenter, R, pitch * 0.32, 0, 0, Math.PI);
        ctx.stroke();

        // Foreground rich line rendering
        renderCanvasRichLine(ctx, l, w / 2, yCenter + (pitch * 0.28), 30, theme, 'center');
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
      const p = page.specificParams || {};
      const leftRaw = p.leftPhoneticList || page.leftPhoneticList || `o o o p a n e l s\na a a a a r c\ne e e e e n s\nI I I I I n n\ns s s s s a n d\nc c c o o o v e\nw w w v i s h e s\nt t t y t y t y\nl a l a l a c l u d e s\nr e c  r e c  "G o d"\nA A A A A A A`;
      const rightRaw = p.rightPhoneticList || page.rightPhoneticList || `s! s!\nh e\nv v v\nu p !\np p !\nb b !\nb b b\nA A A A A\ns s s s\n1 1 1 1\nd i n`;
      const centerRaw = p.centerProse || page.centerProse || page.body || `the voice attempts articulation\nbetween the teeth and the palate\na consonant catches on the tongue\nthe vowel stretches like copper wire\nspeech becomes an acoustic object\nresonating in the concrete chamber`;
      const morseSep = p.morseSeparator || '- - - j - - - j - - - - - -';

      // Left Flank (Left Wing): Phonetic murmurs
      const leftLines = leftRaw.split('\n').filter(l => l.trim().length > 0);
      const leftHtml = leftLines.map(line => {
        return `<div class="stutter-left-glyph" style="white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;">${parseRichTokensToHtml(line, theme.accent)}</div>`;
      }).join('');

      // Right Flank (Right Wing): Staccato consonants & punctuated bursts
      const rightLines = rightRaw.split('\n').filter(l => l.trim().length > 0);
      const rightHtml = rightLines.map(line => {
        return `<div class="stutter-right-glyph" style="white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;">${parseRichTokensToHtml(line, theme.accent)}</div>`;
      }).join('');

      // Center Corpus: Semantic poem punctuated with Morse code dividers
      const centerParagraphs = centerRaw.split(/\n\s*\n/).filter(Boolean);
      let centerContentHtml = '';
      if (centerParagraphs.length > 1) {
        centerContentHtml = centerParagraphs.map((para, idx) => {
          const formattedPara = parseRichTokensToHtml(para, theme.accent).replace(/\n/g, '<br>');
          const divider = (idx < centerParagraphs.length - 1)
            ? `<div class="stutter-morse-divider" style="letter-spacing: 0.18em; font-size: 0.6875rem; color: ${theme.accent}; margin: 0.75rem 0; opacity: 0.85; user-select: none;">${escapeHtml(morseSep)}</div>`
            : '';
          return `<div class="stutter-prose-block">${formattedPara}</div>${divider}`;
        }).join('');
      } else {
        const lines = centerRaw.split('\n');
        if (lines.length >= 4) {
          const chunks = [];
          for (let i = 0; i < lines.length; i += 3) {
            chunks.push(lines.slice(i, i + 3).join('\n'));
          }
          centerContentHtml = chunks.map((chunk, idx) => {
            const formatted = parseRichTokensToHtml(chunk, theme.accent).replace(/\n/g, '<br>');
            const divider = (idx < chunks.length - 1)
              ? `<div class="stutter-morse-divider" style="letter-spacing: 0.18em; font-size: 0.6875rem; color: ${theme.accent}; margin: 0.75rem 0; opacity: 0.85; user-select: none;">${escapeHtml(morseSep)}</div>`
              : '';
            return `<div class="stutter-prose-block">${formatted}</div>${divider}`;
          }).join('');
        } else {
          centerContentHtml = `<div class="stutter-prose-block">${parseRichTokensToHtml(centerRaw, theme.accent).replace(/\n/g, '<br>')}</div><div class="stutter-morse-divider" style="letter-spacing: 0.18em; font-size: 0.6875rem; color: ${theme.accent}; margin: 0.75rem 0; opacity: 0.85; user-select: none;">${escapeHtml(morseSep)}</div>`;
        }
      }

      return `
        <div class="tpl-stutter-wrap" style="height: 100%; display: grid; grid-template-columns: 22% 56% 22%; gap: 0; align-items: stretch; overflow: hidden; width: 100%; box-sizing: border-box;">
          <!-- Left Wing: Phonetic Echo Murmurs (22%) -->
          <div class="stutter-left-col" style="padding: 0.5rem 0.65rem 0.5rem 0; display: flex; flex-direction: column; justify-content: space-around; font-size: 0.6875rem; line-height: 1.45; color: ${theme.muted}; border-right: 1px dashed ${theme.border}; overflow: hidden; word-break: break-word; overflow-wrap: break-word; box-sizing: border-box;">
            ${leftHtml}
          </div>

          <!-- Center Corpus: Semantic Poem + Morse Dividers (56%) -->
          <div class="stutter-center-col" style="padding: 0.5rem 1rem; display: flex; flex-direction: column; justify-content: center; text-align: justify; text-justify: inter-word; font-size: 0.8125rem; line-height: 1.85; color: ${theme.ink}; overflow: hidden; word-break: break-word; overflow-wrap: break-word; box-sizing: border-box;">
            <div style="margin-bottom: 0.5rem; text-align: left;">
              <h1 class="tpl-entry-title" style="font-size: 1.25rem; font-weight: 700; color: ${theme.ink}; margin: 0 0 0.25rem 0; word-break: break-word;">${escapeHtml(page.title || 'Sound Poetry Matrix')}</h1>
              <div style="font-size: 0.6875rem; color: ${theme.muted}; letter-spacing: 0.1em; text-transform: uppercase;">${escapeHtml(page.author || 'ruangrobin')} &middot; Bosch Triptych</div>
            </div>
            <div class="stutter-morse-divider" style="letter-spacing: 0.18em; font-size: 0.6875rem; color: ${theme.accent}; margin-bottom: 0.75rem; opacity: 0.85; user-select: none;">${escapeHtml(morseSep)}</div>
            ${centerContentHtml}
          </div>

          <!-- Right Wing: Staccato Consonant Bursts (22%) -->
          <div class="stutter-right-col" style="padding: 0.5rem 0 0.5rem 0.65rem; display: flex; flex-direction: column; justify-content: space-around; font-size: 0.75rem; line-height: 1.45; color: ${theme.accent}; font-weight: 700; text-align: right; border-left: 1px dashed ${theme.border}; overflow: hidden; word-break: break-word; overflow-wrap: break-word; box-sizing: border-box;">
            ${rightHtml}
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const p = page.specificParams || {};
      const leftRaw = p.leftPhoneticList || page.leftPhoneticList || `o o o p a n e l s\na a a a a r c\ne e e e e n s\nI I I I I n n\ns s s s s a n d\nc c c o o o v e\nw w w v i s h e s\nt t t y t y t y\nl a l a l a c l u d e s\nr e c  r e c  "G o d"\nA A A A A A A`;
      const rightRaw = p.rightPhoneticList || page.rightPhoneticList || `s! s!\nh e\nv v v\nu p !\np p !\nb b !\nb b b\nA A A A A\ns s s s\n1 1 1 1\nd i n`;
      const centerRaw = p.centerProse || page.centerProse || page.body || `the voice attempts articulation\nbetween the teeth and the palate\na consonant catches on the tongue\nthe vowel stretches like copper wire\nspeech becomes an acoustic object\nresonating in the concrete chamber`;
      const morseSep = p.morseSeparator || '- - - j - - - j - - - - - -';

      // 1. Vertical dividers separating the Bosch triptych (22% left, 56% center, 22% right)
      const leftBound = w * 0.22;
      const rightBound = w * 0.78;
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(leftBound, 320);
      ctx.lineTo(leftBound, h - 280);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightBound, 320);
      ctx.lineTo(rightBound, h - 280);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Left Wing: Phonetic Echo Murmurs (22%)
      const leftLines = leftRaw.split('\n').filter(l => l.trim().length > 0);
      const leftCount = Math.max(1, leftLines.length);
      const leftStartY = 480;
      const leftAvailH = h - 800;
      const leftStepY = Math.min(180, leftAvailH / leftCount);

      leftLines.forEach((s, idx) => {
        renderCanvasRichLine(ctx, s, 140, leftStartY + (idx * leftStepY), 24, theme, 'left');
      });

      // 3. Right Wing: Staccato Consonants (22%)
      const rightLines = rightRaw.split('\n').filter(l => l.trim().length > 0);
      const rightCount = Math.max(1, rightLines.length);
      const rightStartY = 480;
      const rightAvailH = h - 800;
      const rightStepY = Math.min(180, rightAvailH / rightCount);

      rightLines.forEach((s, idx) => {
        renderCanvasRichLine(ctx, s, w - 140, rightStartY + (idx * rightStepY), 26, theme, 'right');
      });

      // 4. Center Corpus: Semantic Text + Morse Separators (56%)
      const centerX = leftBound + (w * 0.04);
      const centerWidth = (rightBound - leftBound) - (w * 0.08);

      // Title & Header
      ctx.fillStyle = theme.ink;
      ctx.font = '700 44px "Michelangelus"';
      ctx.fillText(page.title || 'Sound Poetry Matrix', centerX, 440);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      ctx.fillText(`${(page.author || 'ruangrobin').toUpperCase()}  ·  BOSCH TRIPTYCH`, centerX, 490);

      // Top Morse Divider
      ctx.fillStyle = theme.accent;
      ctx.font = '700 22px "Michelangelus"';
      ctx.fillText(morseSep, centerX, 550);

      // Center Prose with intermittent Morse Dividers
      const centerParagraphs = centerRaw.split(/\n\s*\n/).filter(Boolean);
      let curCenterY = 630;
      if (centerParagraphs.length > 1) {
        centerParagraphs.forEach((para, idx) => {
          curCenterY = renderCanvasRichParagraph(ctx, para, centerX, curCenterY, centerWidth, 54, 28, theme);
          if (idx < centerParagraphs.length - 1) {
            curCenterY += 20;
            ctx.fillStyle = theme.accent;
            ctx.font = '700 22px "Michelangelus"';
            ctx.fillText(morseSep, centerX, curCenterY);
            curCenterY += 50;
          }
        });
      } else {
        curCenterY = renderCanvasRichParagraph(ctx, centerRaw, centerX, curCenterY, centerWidth, 54, 28, theme);
        curCenterY += 30;
        ctx.fillStyle = theme.accent;
        ctx.font = '700 22px "Michelangelus"';
        ctx.fillText(morseSep, centerX, curCenterY);
      }
    }
  },

  // ------------------------------------------------------
  // 14. TOPOGRAPHY (Terrain Ridge Wave)
  // ------------------------------------------------------
  topography: {
    id: 'topography',
    name: '14. Topography (Terrain Ridge Wave)',
    renderHTML: (page, theme, spread = 50) => {
      const p = page.specificParams || {};
      const rawText = p.ridgeLines || page.ridgeLines || page.body || '';
      const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);
      if (rawLines.length === 0) {
        rawLines.push(
          'THE **RIDGE RISES** THROUGH THE MORNING MIST',
          'ELEVATION THREE HUNDRED METERS ABOVE {SILENCE}',
          'CONTOURS CARVED BY ANCIENT **GLACIAL MOVEMENT**',
          'THE DESCENT INTO THE BASIN OF {FORGOTTEN WATER}',
          'TERRAIN MESH SURVEYED BY **PURE TYPOGRAPHY**',
          'SLOPE ANGLE TWENTY-FOUR DEGREES {SOUTHWEST}'
        );
      }

      // Guardrail 1: Vertical spacing >= 28px
      const userStep = p.elevationStep !== undefined ? Number(p.elevationStep) : (page.elevationStep !== undefined ? Number(page.elevationStep) : 36);
      const elevationStep = Math.max(28, Math.min(60, isNaN(userStep) ? 36 : userStep));

      // Guardrail 2: Wave amplitude clamping to prevent margin clipping
      const crestAmp = Math.min(32, Math.max(12, Number(p.crestHeight) || 28));
      const dipAmp = Math.min(22, Math.max(8, Number(p.dipDepth) || 16));

      // Guardrail 3: Safe vertical bounds within SVG viewBox (0 0 480 580)
      const startY = Math.max(42, crestAmp + 16);
      const maxAvailHeight = 580 - startY - 24;
      const maxLines = Math.max(3, Math.floor(maxAvailHeight / elevationStep));
      const linesToRender = rawLines.slice(0, maxLines);

      // Dynamic font size clamping for line length
      const maxChars = Math.max(...linesToRender.map(l => l.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\{([^}]+)\}/g, '$1').length), 20);
      const fontSize = Math.min(12.5, Math.max(9.5, 380 / (maxChars * 0.68)));

      // Flank outline words (dedicated field flankOutlineWord)
      const flankRaw = (p.flankOutlineWord || page.flankOutlineWord || 'OF\nVISION').trim();
      const flankWords = flankRaw.split('\n').map(w => w.trim()).filter(Boolean);

      // Subtitle / elevation tag
      const subtitle = p.elevationSubtitle || page.chapter || 'CONTOUR INTERVAL 50M // 3D ELEVATION MESH';

      // Build pure typographic wave paths (Zero vector landscape drawings)
      let pathsSvg = '';
      linesToRender.forEach((l, i) => {
        const y = startY + (i * elevationStep);
        const parsedTspans = parseRichTokensToSvgTspan(l, theme.accent);
        pathsSvg += `
          <path id="topo-web-${i}" d="M 12,${y} C 130,${y - crestAmp} 240,${y + dipAmp} 390,${y}" fill="none" stroke="none" />
          <text fill="${theme.ink}" font-family="'Michelangelus'" font-size="${fontSize.toFixed(1)}" font-weight="700" letter-spacing="0.1em">
            <textPath href="#topo-web-${i}">${parsedTspans}</textPath>
          </text>
        `;
      });

      return `
        <div class="tpl-topography-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          <div class="tpl-header-block" style="margin-bottom: 0.5rem;">
            <h1 class="tpl-entry-title" style="font-size: 1.25rem; font-weight: 700; letter-spacing: 0.15em; color: ${theme.ink}; margin-bottom: 0.2rem;">
              ${escapeHtml(page.title || 'A METHODOLOGY OF VISION').toUpperCase()}
            </h1>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: ${theme.muted}; letter-spacing: 0.08em;">
              <span>${escapeHtml(page.author || 'ruangrobin').toUpperCase()}</span>
              <span>${escapeHtml(subtitle)}</span>
            </div>
          </div>
          <div style="flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden;">
            <svg viewBox="0 0 480 580" style="width: calc(100% - 75px); height: 100%; overflow: visible;">
              ${pathsSvg}
            </svg>
            <div style="position: absolute; right: 0; top: 8%; display: flex; flex-direction: column; gap: 0.75rem; font-size: 2.2rem; font-weight: 700; color: transparent; -webkit-text-stroke: 1.5px ${theme.accent}; text-align: center; width: 75px; line-height: 0.95; user-select: none;">
              ${flankWords.map(w => `<div>${escapeHtml(w)}</div>`).join('')}
            </div>
          </div>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const p = page.specificParams || {};
      const rawText = p.ridgeLines || page.ridgeLines || page.body || '';
      const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);

      // Title & Subtitle
      ctx.fillStyle = theme.ink;
      ctx.font = '700 42px "Michelangelus"';
      ctx.fillText((page.title || 'A METHODOLOGY OF VISION').toUpperCase(), 160, 360);

      ctx.fillStyle = theme.muted;
      ctx.font = '700 20px "Michelangelus"';
      const subtitle = p.elevationSubtitle || page.chapter || 'CONTOUR INTERVAL 50M // 3D ELEVATION MESH';
      ctx.fillText(`${(page.author || 'ruangrobin').toUpperCase()}  ·  ${subtitle}`, 160, 410);

      // Guardrail 1: Elevation step scaled to 300 DPI canvas
      const userStep = p.elevationStep !== undefined ? Number(p.elevationStep) : (page.elevationStep !== undefined ? Number(page.elevationStep) : 36);
      const elevationStep = Math.max(28, Math.min(60, isNaN(userStep) ? 36 : userStep));
      const canvasStep = elevationStep * 4.8;

      // Guardrail 2: Amplitude scaling
      const crestAmp = Math.min(32, Math.max(12, Number(p.crestHeight) || 28)) * 4.8;
      const dipAmp = Math.min(22, Math.max(8, Number(p.dipDepth) || 16)) * 4.8;

      const startY = 560;
      const maxLines = Math.floor((h - startY - 200) / canvasStep);
      const linesToRender = rawLines.slice(0, Math.max(3, maxLines));

      const x0 = 160;
      const x1 = w - 460;
      const pathW = x1 - x0;

      // Render undulating ridge wave lines for Canvas 2D
      linesToRender.forEach((line, lineIdx) => {
        const baseY = startY + (lineIdx * canvasStep);
        const tokens = tokenizeRichTextForCanvas(line);

        // Measure total width
        let totalW = 0;
        tokens.forEach(tok => {
          ctx.font = `${tok.bold ? '700' : '400'} 26px "Michelangelus"`;
          totalW += ctx.measureText(tok.text).width;
        });

        // Walk segments along the cubic Bezier curve
        let curDist = 0;
        tokens.forEach(tok => {
          ctx.font = `${tok.bold ? '700' : '400'} 26px "Michelangelus"`;
          ctx.fillStyle = tok.accent ? theme.accent : theme.ink;
          const segW = ctx.measureText(tok.text).width;

          // Compute normalized t along curve for center of segment
          const t = Math.max(0, Math.min(1, (curDist + segW * 0.5) / Math.max(totalW, pathW)));
          const curX = x0 + (t * pathW);

          // Cubic Bezier Y: M 12,y C 130,y-crest 240,y+dip 390,y
          // Normalized controls: P0=0, P1=-crestAmp, P2=+dipAmp, P3=0
          const u = 1 - t;
          const deltaY = (3 * u * u * t * (-crestAmp)) + (3 * u * t * t * dipAmp);
          const curY = baseY + deltaY;

          // Tangent angle
          const dYdt = 3 * u * u * (-crestAmp) + 6 * u * t * (dipAmp - (-crestAmp)) + 3 * t * t * (-dipAmp);
          const angle = Math.atan2(dYdt, pathW) * 0.75; // slight softening of angle for readability

          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(angle);
          ctx.fillText(tok.text, -segW * 0.5, 0);
          ctx.restore();

          curDist += segW;
        });
      });

      // Flank outline words on 300 DPI Canvas
      const flankRaw = (p.flankOutlineWord || page.flankOutlineWord || 'OF\nVISION').trim();
      const flankWords = flankRaw.split('\n').map(w => w.trim()).filter(Boolean);

      ctx.save();
      ctx.font = '700 76px "Michelangelus"';
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3.5;
      ctx.textAlign = 'center';
      let flankY = 680;
      flankWords.forEach(word => {
        ctx.strokeText(word, w - 240, flankY);
        flankY += 115;
      });
      ctx.restore();
    }
  },

  // ------------------------------------------------------
  // 15. VORTEX (Concentric Swirl)
  // ------------------------------------------------------
  vortex: {
    id: 'vortex',
    name: '15. Vortex Spiral (Concentric Swirl)',
    renderHTML: (page, theme, spread = 50) => {
      const p = page.specificParams || {};
      const rawText = p.ringsText || page.body || '';
      const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (rawLines.length === 0) {
        rawLines.push(
          '**blackberry staggering juice** dripping on warm limestone',
          'expanding ripples across the {quiet pond}',
          'centrifugal language pulling away from the **calm center**',
          'outer circumference embracing the {vast nocturnal silence}',
          'every eddy returns to the **unbroken source**'
        );
      }

      const cx = 250;
      const cy = 250;

      // 2. Radii clamped strictly between 42px and 235px
      const userInner = p.innerRadius !== undefined ? Number(p.innerRadius) : 45;
      const userOuter = p.outerRadius !== undefined ? Number(p.outerRadius) : 235;
      const innerR = Math.max(42, Math.min(215, userInner));
      const outerR = Math.min(235, Math.max(innerR + 25, userOuter));

      const numRings = Math.min(8, Math.max(3, rawLines.length));
      const radii = [];
      for (let i = 0; i < numRings; i++) {
        const t = numRings === 1 ? 0.5 : i / (numRings - 1);
        const r = Math.round(innerR + t * (outerR - innerR));
        radii.push(Math.max(42, Math.min(235, r)));
      }

      const rotStep = p.rotationOffsetStep !== undefined ? Number(p.rotationOffsetStep) : 20;
      const userRep = p.repetitionCount !== undefined ? Number(p.repetitionCount) : 0;

      // 1. WORD ONLY presentation: pure typographic whirlpool, no drawn circle graphics or backgrounds
      let ringsSvg = '';
      radii.forEach((r, idx) => {
        const rawLine = rawLines[idx % rawLines.length];
        const cleanLine = stripRichTokens(rawLine);
        const fontSize = 10 + (idx * 1.35);

        // Circumference 2*pi*r limits text length & drives graceful repetition
        const circumference = 2 * Math.PI * r;
        const charWidth = fontSize * 0.65;
        const phrasePixelWidth = Math.max(25, (cleanLine.length + 3) * charWidth);

        // Bounded graceful repetition
        const maxFittingReps = Math.max(1, Math.floor((circumference * 0.98) / phrasePixelWidth));
        const reps = userRep > 0 ? Math.min(userRep, maxFittingReps) : maxFittingReps;

        const repeatedPhrase = Array(reps).fill(rawLine).join('     ');
        const parsedTspans = parseRichTokensToSvgTspan(repeatedPhrase, theme.accent);
        const startOffsetPct = ((idx * rotStep) % 100);

        ringsSvg += `
          <path id="vortex-web-${idx}" 
                d="M ${cx - r},${cy} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0" 
                fill="none" stroke="none" />
          <text fill="${theme.ink}" font-family="'Michelangelus'" font-size="${fontSize.toFixed(1)}" font-weight="700" letter-spacing="0.12em">
            <textPath href="#vortex-web-${idx}" startOffset="${startOffsetPct}%">${parsedTspans}</textPath>
          </text>
        `;
      });

      // Optional center void micro-label
      let centerLabelSvg = '';
      if (p.centerVoidLabel) {
        centerLabelSvg = `
          <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" 
                fill="${theme.muted}" font-family="'Michelangelus'" font-size="8.5" font-weight="700" 
                letter-spacing="0.18em" opacity="0.65">
            ${escapeHtml(p.centerVoidLabel)}
          </text>
        `;
      }

      return `
        <div class="tpl-vortex-wrap" style="height: 100%; display: flex; flex-direction: column; overflow: hidden; align-items: center; justify-content: center; position: relative;">
          ${page.title ? `
            <div style="text-align: center; margin-bottom: 0.25rem; width: 100%;">
              <h1 class="tpl-entry-title" style="font-size: 1.25rem; font-weight: 700; color: ${theme.ink}; margin: 0;">${escapeHtml(page.title)}</h1>
              ${page.author ? `<div style="font-size: 0.7rem; color: ${theme.muted}; font-style: italic; margin-top: 0.15rem;">${escapeHtml(page.author)}</div>` : ''}
            </div>
          ` : ''}
          <svg viewBox="0 0 500 500" style="width: 100%; max-width: 480px; height: auto;" aria-label="Concentric Typographic Vortex">
            ${ringsSvg}
            ${centerLabelSvg}
          </svg>
        </div>
      `;
    },
    renderCanvas: (ctx, page, theme, spread, w, h) => {
      const p = page.specificParams || {};
      const rawText = p.ringsText || page.body || '';
      const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (rawLines.length === 0) {
        rawLines.push(
          '**blackberry staggering juice** dripping on warm limestone',
          'expanding ripples across the {quiet pond}',
          'centrifugal language pulling away from the **calm center**',
          'outer circumference embracing the {vast nocturnal silence}',
          'every eddy returns to the **unbroken source**'
        );
      }

      ctx.textAlign = 'center';
      if (page.title) {
        ctx.fillStyle = theme.ink;
        ctx.font = '700 44px "Michelangelus"';
        ctx.fillText(page.title, w / 2, 340);
        if (page.author) {
          ctx.fillStyle = theme.muted;
          ctx.font = 'italic 24px "Michelangelus"';
          ctx.fillText(page.author, w / 2, 385);
        }
      }

      const cx = w / 2;
      const cy = (h / 2) + 80;

      // Clamped high-res radii (42 * 4.4 = 185px to 235 * 4.4 = 1034px)
      const userInner = p.innerRadius !== undefined ? Number(p.innerRadius) : 45;
      const userOuter = p.outerRadius !== undefined ? Number(p.outerRadius) : 235;
      const innerR = Math.max(42, Math.min(215, userInner)) * 4.4;
      const outerR = Math.min(235, Math.max(userInner + 25, userOuter)) * 4.4;

      const numRings = Math.min(8, Math.max(3, rawLines.length));
      const radii = [];
      for (let i = 0; i < numRings; i++) {
        const t = numRings === 1 ? 0.5 : i / (numRings - 1);
        radii.push(innerR + t * (outerR - innerR));
      }

      const rotStep = p.rotationOffsetStep !== undefined ? Number(p.rotationOffsetStep) : 20;
      const rotStepRad = (rotStep * Math.PI) / 180;
      const userRep = p.repetitionCount !== undefined ? Number(p.repetitionCount) : 0;

      radii.forEach((r, idx) => {
        const rawLine = rawLines[idx % rawLines.length];
        const cleanLine = stripRichTokens(rawLine);
        const fontSize = Math.round((10 + (idx * 1.35)) * 4.4);

        const circumference = 2 * Math.PI * r;
        const charWidth = fontSize * 0.65;
        const phrasePixelWidth = Math.max(50, (cleanLine.length + 3) * charWidth);

        const maxFittingReps = Math.max(1, Math.floor((circumference * 0.98) / phrasePixelWidth));
        const reps = userRep > 0 ? Math.min(userRep, maxFittingReps) : maxFittingReps;

        // Tokenized character array for full Canvas font & color styling
        const tokens = tokenizeRichTextForCanvas(rawLine);
        tokens.push({ text: '     ', bold: false, accent: false });

        const fullCharList = [];
        for (let rep = 0; rep < reps; rep++) {
          tokens.forEach(tok => {
            for (let c = 0; c < tok.text.length; c++) {
              fullCharList.push({
                char: tok.text[c],
                bold: tok.bold,
                accent: tok.accent
              });
            }
          });
        }

        const count = fullCharList.length;
        if (count === 0) return;
        const step = (Math.PI * 2) / count;

        for (let c = 0; c < count; c++) {
          const charObj = fullCharList[c];
          const ang = c * step + (idx * rotStepRad);
          const px = cx + Math.cos(ang) * r;
          const py = cy + Math.sin(ang) * r;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ang + Math.PI / 2);
          ctx.font = `${charObj.bold ? '700' : '400'} ${fontSize}px "Michelangelus"`;
          ctx.fillStyle = charObj.accent ? theme.accent : theme.ink;
          ctx.fillText(charObj.char, 0, 0);
          ctx.restore();
        }
      });

      if (p.centerVoidLabel) {
        ctx.fillStyle = theme.muted;
        ctx.font = '700 28px "Michelangelus"';
        ctx.fillText(p.centerVoidLabel, cx, cy);
      }

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
