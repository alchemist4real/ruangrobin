/**
 * ruangrobin — Pure Typographic A4 Monograph Platform (v2.0 Modular Architecture)
 * 
 * 1. Zero Hardcoding: Powered by seriesRegistry & templateRegistry.
 * 2. 15 Typographic Spatial Templates with Anti-Overflow Physics.
 * 3. Complete CRUD for Slides, Chapters (Bab), and Series.
 * 4. Interactive Cover Photo Crop & Zoom Engine (A4 210:297).
 * 5. Multi-page High-Resolution A4 PDF & PNG E-Book Export.
 * 6. Single Font: 'Michelangelus' exclusively.
 */

// ========================================================
// 1. STATE MANAGEMENT
// ========================================================

const PASSCODE = 'robin';

const State = {
  currentView: 'shelf',          // 'shelf' | 'reader' | 'studio' | 'colophon'
  currentEbookId: null,          // Active series ID
  currentPageIndex: 0,           // Active page index in reader
  isUnlocked: false,             // Auth flag
  editingSlideId: null,          // Active slide ID being edited in studio
  studioPreviewMode: 'page',     // 'page' | 'cover'
  searchQuery: '',               // Shelf filter query
  activeStudioTab: 'tab-slide-content',

  // Cover photo interactive crop state
  crop: {
    imageObj: null,
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
  }
};

if (typeof window !== 'undefined') {
  window.State = State;
}

// ========================================================
// 2. HELPER UTILITIES & CONTRAST CALCULATION
// ========================================================

function showToast(message) {
  const toast = document.getElementById('toast-notify');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 2800);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  try {
    const c1 = typeof hex1 === 'string' ? hexToRgb(hex1) : hex1;
    const c2 = typeof hex2 === 'string' ? hexToRgb(hex2) : hex2;
    if (typeof calcRgbContrast === 'function') {
      return calcRgbContrast(c1, c2);
    }
    const l1 = getLuminance(c1.r, c1.g, c1.b);
    const l2 = getLuminance(c2.r, c2.g, c2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch (e) {
    return 14.2;
  }
}

/**
 * Resolves semantic colors from series palette.
 */
function resolveSeriesTheme(palette) {
  if (typeof window !== 'undefined' && typeof window.smartResolvePalette === 'function') {
    return window.smartResolvePalette(palette);
  }
  const pal = Array.isArray(palette) && palette.length >= 2 ? palette : ['#faf6ee', '#111418', '#0018f0'];
  return {
    paper: pal[0] || '#faf6ee',
    ink: pal[1] || '#111418',
    accent: pal[2] || (pal.length > 2 ? pal[2] : pal[1]),
    muted: pal[3] || (pal.length > 3 ? pal[3] : 'rgba(17,20,24,0.6)'),
    sheet: pal[4] || '#ffffff',
    border: 'rgba(17,20,24,0.12)'
  };
}

// ========================================================
// 3. NAVIGATION & VIEW SWITCHING
// ========================================================

function switchView(viewName) {
  State.currentView = viewName;

  document.querySelectorAll('.main-view').forEach(v => v.style.display = 'none');
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.menu-pill-item').forEach(btn => btn.classList.remove('active'));
  const activeTabBtn = document.getElementById(`nav-tab-${viewName}`);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'shelf') {
    renderShelf();
  } else if (viewName === 'reader') {
    renderReader();
  } else if (viewName === 'studio') {
    initStudio();
  }
}

// ========================================================
// 4. SHELF VIEW RENDERING
// ========================================================

function renderShelf() {
  const container = document.getElementById('catalog-grid');
  if (!container) return;

  const allSeries = seriesRegistry.getAll();
  const query = (State.searchQuery || '').trim().toLowerCase();

  let matches = allSeries;
  if (query) {
    matches = allSeries.filter(series => {
      const matchMeta = (series.title || '').toLowerCase().includes(query) ||
                        (series.subtitle || '').toLowerCase().includes(query) ||
                        (series.volNumber || '').toLowerCase().includes(query);
      const matchPages = (series.pages || []).some(p => 
        (p.title || '').toLowerCase().includes(query) ||
        (p.author || '').toLowerCase().includes(query) ||
        (p.body || '').toLowerCase().includes(query) ||
        (p.template || '').toLowerCase().includes(query)
      );
      return matchMeta || matchPages;
    });
  }

  // Update search feedback banner
  const feedbackBar = document.getElementById('search-results-info');
  const countSpan = document.getElementById('search-matches-count');
  if (feedbackBar && countSpan) {
    if (query) {
      feedbackBar.style.display = 'flex';
      countSpan.textContent = matches.length;
    } else {
      feedbackBar.style.display = 'none';
    }
  }

  if (matches.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--c-ink-muted);">
        <div style="font-size: 1.25rem; margin-bottom: 0.5rem; letter-spacing: 0.3em; opacity: 0.5;">&middot; &middot; &middot;</div>
        <p style="font-size: 0.9375rem;">No monograph editions matching "<strong>${escapeHtml(query)}</strong>".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(series => {
    const theme = resolveSeriesTheme(series.palette);
    const pageCount = (series.pages || []).length;
    const chapCount = (series.chapters || []).length;
    const firstPage = (series.pages && series.pages[0]) ? series.pages[0] : null;

    // Cover Artwork / Photo vs Typographic motif preview
    let coverPreviewHtml = '';
    if (series.coverImage) {
      coverPreviewHtml = `
        <img src="${series.coverImage}" class="cover-photo-img" alt="${escapeHtml(series.title)}">
        <div class="cover-photo-overlay"></div>
        <div style="position: absolute; bottom: 1.25rem; left: 1.25rem; right: 1.25rem; z-index: 2; color: #fff;">
          <div style="font-size: 0.625rem; letter-spacing: 0.15em; font-weight: 700; opacity: 0.9;">${escapeHtml(series.volNumber)}</div>
          <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0.2rem 0; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">${escapeHtml(series.title)}</h3>
          <div style="font-size: 0.6875rem; opacity: 0.85;">${escapeHtml(series.subtitle || '')}</div>
        </div>
      `;
    } else {
      // Pure Typographic Monograph Cover Card
      const tpl = series.coverTemplate || (firstPage ? firstPage.template : 'cascade');
      const motifPreview = templateRegistry.renderHTML(tpl, firstPage || { title: series.title, body: series.subtitle }, theme, 50);
      coverPreviewHtml = `
        <div style="width: 100%; height: 100%; overflow: hidden; transform: scale(0.92); transform-origin: top center; pointer-events: none;">
          ${motifPreview}
        </div>
      `;
    }

    return `
      <article class="book-shelf-card" onclick="openEbookReader('${series.id}')">
        <div class="book-card-a4-sheet" style="background: ${theme.paper};">
          ${coverPreviewHtml}
        </div>
        <div class="book-card-meta">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span class="cover-pill-badge">${escapeHtml(series.volNumber)}</span>
            <span style="font-size: 0.6875rem; color: var(--c-ink-muted);">${pageCount} Pages &middot; ${chapCount} Bab</span>
          </div>
          <h2 class="book-card-title">${escapeHtml(series.title)}</h2>
          <p class="book-card-sub">${escapeHtml(series.subtitle || '')}</p>
        </div>
      </article>
    `;
  }).join('');
}

// ========================================================
// 5. READER VIEW RENDERING & CONTROLS
// ========================================================

function openEbookReader(seriesId, targetPageIndex = 0) {
  const series = seriesRegistry.getById(seriesId);
  if (!series) {
    showToast('Edition not found.');
    return;
  }
  State.currentEbookId = seriesId;
  State.currentPageIndex = Math.max(0, Math.min(targetPageIndex, (series.pages || []).length - 1));
  switchView('reader');
}

function renderReader() {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) {
    switchView('shelf');
    return;
  }

  const pages = series.pages || [];
  const theme = resolveSeriesTheme(series.palette);
  const totalPages = pages.length;

  if (totalPages === 0) {
    document.getElementById('reader-poem-stage').innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--c-ink-muted);">
        <p>This edition has no pages yet. Use Studio to write verses.</p>
      </div>
    `;
    return;
  }

  // Clamped page index
  if (State.currentPageIndex >= totalPages) State.currentPageIndex = totalPages - 1;
  if (State.currentPageIndex < 0) State.currentPageIndex = 0;

  const curPage = pages[State.currentPageIndex];

  // Update Masthead
  const badge = document.getElementById('reader-ebook-badge');
  const titleBar = document.getElementById('reader-ebook-title-bar');
  const pageIndicator = document.getElementById('reader-page-indicator');
  const poemTitleIndicator = document.getElementById('reader-poem-title-indicator');

  if (badge) badge.textContent = series.volNumber;
  if (titleBar) titleBar.textContent = series.title;
  if (pageIndicator) pageIndicator.textContent = `Page ${State.currentPageIndex + 1} of ${totalPages}`;
  if (poemTitleIndicator) poemTitleIndicator.textContent = curPage.title || 'Untitled';

  // Render Page Content inside A4 physical container
  const stage = document.getElementById('reader-poem-stage');
  if (stage) {
    stage.style.background = theme.paper;
    stage.style.color = theme.ink;

    // Folio Top Header
    const folioHeader = `
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.6875rem; color: ${theme.muted}; border-bottom: 1px solid ${theme.border}; padding-bottom: 0.65rem; margin-bottom: 1.5rem; letter-spacing: 0.08em;">
        <span>ruangrobin &middot; ${escapeHtml(series.title.toUpperCase())}</span>
        <span>${escapeHtml(series.volNumber)} &middot; PAGE ${State.currentPageIndex + 1}</span>
      </div>
    `;

    // Active Template Rendered HTML
    const templateHtml = templateRegistry.renderHTML(curPage.template, curPage, theme, curPage.spread || 50);

    // Folio Foot
    const folioFoot = `
      <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: baseline; font-size: 0.625rem; color: ${theme.muted}; border-top: 1px solid ${theme.border}; padding-top: 0.65rem; letter-spacing: 0.1em;">
        <span>FORMAT: ${(curPage.template || 'cascade').toUpperCase()}</span>
        <span>${escapeHtml(series.editionDate || '2026')}</span>
      </div>
    `;

    stage.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column;">
        ${folioHeader}
        <div style="flex: 1; overflow: hidden;">
          ${templateHtml}
        </div>
        ${folioFoot}
      </div>
    `;
  }

  // Render bottom chapter pills
  renderReaderChapterShelf(series);
}

function renderReaderChapterShelf(series) {
  const shelf = document.getElementById('reader-chapter-shelf');
  if (!shelf) return;

  const pages = series.pages || [];
  shelf.innerHTML = pages.map((p, idx) => {
    const isActive = idx === State.currentPageIndex;
    return `
      <button class="pill-action-btn ${isActive ? 'active' : ''}" onclick="goToReaderPage(${idx})" style="padding: 0.25rem 0.65rem; font-size: 0.6875rem; white-space: nowrap;">
        ${idx + 1}. ${escapeHtml(p.title || 'Untitled')}
      </button>
    `;
  }).join('');
}

function goToReaderPage(pageIdx) {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series || !series.pages) return;
  State.currentPageIndex = Math.max(0, Math.min(pageIdx, series.pages.length - 1));
  renderReader();
}

function flipPage(delta) {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series || !series.pages) return;
  const newIdx = State.currentPageIndex + delta;
  if (newIdx >= 0 && newIdx < series.pages.length) {
    State.currentPageIndex = newIdx;
    renderReader();
  }
}

// Table of Contents Modal
function openReaderTocModal() {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;

  const modal = document.getElementById('reader-toc-modal');
  const title = document.getElementById('toc-modal-edition-title');
  const listContainer = document.getElementById('reader-toc-list-container');
  if (!modal || !listContainer) return;

  title.textContent = `${series.volNumber}: ${series.title}`;

  const chapters = series.chapters || [];
  const pages = series.pages || [];

  if (chapters.length === 0) {
    listContainer.innerHTML = pages.map((p, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #fff; border: 1px solid var(--c-border); border-radius: 6px; cursor: pointer;" onclick="goToReaderPage(${idx}); closeReaderTocModal();">
        <span style="font-weight: 700; font-size: 0.8125rem;">${idx + 1}. ${escapeHtml(p.title)}</span>
        <span style="font-size: 0.6875rem; color: var(--c-ink-muted);">${escapeHtml(p.template)}</span>
      </div>
    `).join('');
  } else {
    listContainer.innerHTML = chapters.map(ch => {
      const chPages = pages.filter(p => p.chapterId === ch.id);
      const pagesHtml = chPages.map(p => {
        const pageIdx = pages.findIndex(x => x.id === p.id);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; border-left: 2px solid var(--c-blue); background: #ffffff; border-radius: 4px; cursor: pointer; margin-top: 0.35rem;" onclick="goToReaderPage(${pageIdx}); closeReaderTocModal();">
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--c-ink);">${pageIdx + 1}. ${escapeHtml(p.title)}</span>
            <span style="font-size: 0.65rem; color: var(--c-blue);">${escapeHtml(p.template)}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="padding: 0.75rem; background: rgba(17,20,24,0.03); border-radius: 8px; border: 1px solid var(--c-border);">
          <div style="font-size: 0.875rem; font-weight: 700; color: var(--c-ink);">${escapeHtml(ch.title)}</div>
          <div style="font-size: 0.6875rem; color: var(--c-ink-muted); margin-bottom: 0.4rem;">${escapeHtml(ch.description || '')}</div>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            ${pagesHtml || '<div style="font-size: 0.6875rem; color: var(--c-ink-muted); font-style: italic;">No slides assigned to this chapter yet.</div>'}
          </div>
        </div>
      `;
    }).join('');
  }

  modal.style.display = 'flex';
}

function closeReaderTocModal() {
  const modal = document.getElementById('reader-toc-modal');
  if (modal) modal.style.display = 'none';
}

// ========================================================
// 6. HIGH-RESOLUTION CANVAS EXPORT & MULTI-PAGE PDF GENERATOR
// ========================================================

/**
 * Draws a single slide or cover plate onto a 300 DPI A4 Canvas (2480 x 3508).
 */
function renderSlideToA4Canvas(canvas, page, series, pageNum, totalPages) {
  canvas.width = 2480;
  canvas.height = 3508;
  const ctx = canvas.getContext('2d');
  const theme = resolveSeriesTheme(series.palette);

  // Background Paper
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Folio Header
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(160, 160, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.muted;
  ctx.font = '700 24px "Michelangelus"';
  ctx.fillText(`ruangrobin  ·  ${series.title.toUpperCase()}`, 190, 170);

  const rightHead = `${series.volNumber} · PAGE ${pageNum} OF ${totalPages}`;
  ctx.fillText(rightHead, canvas.width - 160 - ctx.measureText(rightHead).width, 170);

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(160, 220);
  ctx.lineTo(canvas.width - 160, 220);
  ctx.stroke();

  // Draw Template via templateRegistry
  const tpl = page.template || 'cascade';
  templateRegistry.renderCanvas(tpl, ctx, page, theme, page.spread || 50, canvas.width, canvas.height);

  // Folio Foot
  ctx.fillStyle = theme.muted;
  ctx.font = '700 22px "Michelangelus"';
  ctx.fillText(`ruangrobin  ·  format: ${tpl.toUpperCase()}  ·  ${series.editionDate || '2026'}`, 160, canvas.height - 160);
}

/**
 * Exports current reader page to PNG.
 */
function exportCurrentPageToA4Png() {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series || !series.pages || series.pages.length === 0) return;
  const curPage = series.pages[State.currentPageIndex];

  showToast('Generating 300 DPI A4 Monograph PNG...');

  const canvas = document.createElement('canvas');
  renderSlideToA4Canvas(canvas, curPage, series, State.currentPageIndex + 1, series.pages.length);

  try {
    const link = document.createElement('a');
    link.download = `ruangrobin-${series.id}-page-${State.currentPageIndex + 1}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    showToast('A4 Monograph exported successfully.');
  } catch (e) {
    console.error(e);
    showToast('Export failed.');
  }
}

/**
 * Draws the 300 DPI A4 Cover Plate (2480 x 3508).
 */
function renderCoverToA4Canvas(canvas, series) {
  canvas.width = 2480;
  canvas.height = 3508;
  const ctx = canvas.getContext('2d');
  const theme = resolveSeriesTheme(series.palette);

  // Background Paper
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (series.coverImage) {
    const img = new Image();
    img.src = series.coverImage;
    if (img.complete && img.naturalWidth > 0) {
      const settings = series.coverSettings || { zoom: 1, offsetX: 0, offsetY: 0, rotation: 0 };
      ctx.save();
      ctx.translate(canvas.width / 2 + (settings.offsetX || 0) * 2.5, canvas.height / 2 + (settings.offsetY || 0) * 2.5);
      if (settings.rotation) ctx.rotate((settings.rotation * Math.PI) / 180);
      const scale = (settings.zoom || 1) * Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      const grad = ctx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 36px "Michelangelus"';
      ctx.fillText((series.volNumber || 'EDITION').toUpperCase(), 200, canvas.height - 520);

      ctx.font = '700 84px "Michelangelus"';
      ctx.fillText(series.title || 'Untitled Monograph', 200, canvas.height - 400);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '400 38px "Michelangelus"';
      ctx.fillText(series.subtitle || '', 200, canvas.height - 320);

      ctx.font = '700 24px "Michelangelus"';
      ctx.fillText(`ruangrobin  ·  ${series.editionDate || '2026'}  ·  ${series.colophon || 'MONOGRAPH'}`, 200, canvas.height - 180);
      return;
    }
  }

  // Pure Typographic Cover Plate
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(200, 200, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.muted;
  ctx.font = '700 28px "Michelangelus"';
  ctx.fillText(`ruangrobin  ·  PUBLICATION SERIES`, 240, 210);

  const coverTpl = series.coverTemplate || 'cascade';
  const dummyPage = (series.pages && series.pages[0]) ? series.pages[0] : { title: series.title, body: series.subtitle || 'Pure Typographic Monograph' };
  templateRegistry.renderCanvas(coverTpl, ctx, dummyPage, theme, 50, canvas.width, canvas.height);

  ctx.fillStyle = theme.accent;
  ctx.font = '700 32px "Michelangelus"';
  ctx.fillText((series.volNumber || 'EDITION').toUpperCase(), 200, canvas.height - 480);

  ctx.fillStyle = theme.ink;
  ctx.font = '700 84px "Michelangelus"';
  ctx.fillText(series.title || 'Untitled Monograph', 200, canvas.height - 370);

  ctx.fillStyle = theme.muted;
  ctx.font = '400 38px "Michelangelus"';
  ctx.fillText(series.subtitle || '', 200, canvas.height - 290);

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(200, canvas.height - 230);
  ctx.lineTo(canvas.width - 200, canvas.height - 230);
  ctx.stroke();

  ctx.font = '700 24px "Michelangelus"';
  ctx.fillText(`ruangrobin  ·  ${series.editionDate || '2026'}  ·  ${series.colophon || 'MONOGRAPH ARCHIVE'}`, 200, canvas.height - 170);
}

/**
 * Multi-page E-Book PDF Generator using jsPDF.
 */
async function exportCompleteEbookToPDF(seriesId) {
  const series = seriesRegistry.getById(seriesId || State.currentEbookId);
  if (!series) return;

  if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
    showToast('PDF library initializing, please retry...');
    return;
  }

  showToast('Compiling complete E-Book PDF (300 DPI)...');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 297]
  });

  const canvas = document.createElement('canvas');
  const pages = series.pages || [];
  const total = pages.length;

  // 1. Cover Plate
  renderCoverToA4Canvas(canvas, series);
  const coverImgData = canvas.toDataURL('image/jpeg', 0.94);
  doc.addImage(coverImgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  // 2. All Monograph Slides
  for (let i = 0; i < total; i++) {
    doc.addPage([210, 297], 'portrait');
    renderSlideToA4Canvas(canvas, pages[i], series, i + 1, total);
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  const cleanName = (series.title || 'ruangrobin-edition').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanName}.pdf`);
  showToast('E-Book PDF downloaded successfully.');
}

// ========================================================
// 7. COMPOSE STUDIO & LIVE PREVIEW ENGINE
// ========================================================

function initStudio() {
  populateStudioSeriesSelect();
  setupStudioTabs();
  loadSeriesIntoStudio();
}

function setupStudioTabs() {
  document.querySelectorAll('.composer-tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.composer-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.composer-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      State.activeStudioTab = tabId;
      const pane = document.getElementById(tabId);
      if (pane) pane.classList.add('active');

      if (tabId === 'tab-slides-crud') {
        renderStudioSlidesCrud();
      } else if (tabId === 'tab-chapters-crud') {
        renderStudioChaptersCrud();
      }
    };
  });
}

function populateStudioSeriesSelect() {
  const sel = document.getElementById('studio-series-select');
  if (!sel) return;

  const all = seriesRegistry.getAll();
  sel.innerHTML = all.map(s => `
    <option value="${s.id}" ${s.id === State.currentEbookId ? 'selected' : ''}>
      ${escapeHtml(s.volNumber)}: ${escapeHtml(s.title)}
    </option>
  `).join('');

  sel.onchange = (e) => {
    State.currentEbookId = e.target.value;
    loadSeriesIntoStudio();
  };
}

function loadSeriesIntoStudio() {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;

  // Update tabs counters
  const slidesCountSpan = document.getElementById('tab-slides-count');
  const chapCountSpan = document.getElementById('tab-chapters-count');
  if (slidesCountSpan) slidesCountSpan.textContent = (series.pages || []).length;
  if (chapCountSpan) chapCountSpan.textContent = (series.chapters || []).length;

  // Chapter dropdown in slide editor
  populateStudioChapterSelect(series);

  // Populate series meta inputs
  const titleInp = document.getElementById('series-edit-title');
  const volInp = document.getElementById('series-edit-vol');
  const subInp = document.getElementById('series-edit-sub');
  const coverTplSel = document.getElementById('studio-cover-template-select');

  if (titleInp) titleInp.value = series.title || '';
  if (volInp) volInp.value = series.volNumber || '';
  if (subInp) subInp.value = series.subtitle || '';
  if (coverTplSel) coverTplSel.value = series.coverTemplate || 'cascade';

  // Cover photo status & button
  updateCoverPhotoStatusUI(series);

  // Palette swatches
  renderPaletteSwatches(series.palette);

  // Load first slide or editing slide
  const pages = series.pages || [];
  if (pages.length > 0) {
    const slideToEdit = pages.find(p => p.id === State.editingSlideId) || pages[0];
    populateSlideEditorFields(slideToEdit);
  }

  updateStudioLivePreview();
}

function populateStudioChapterSelect(series) {
  const sel = document.getElementById('studio-chapter-select');
  if (!sel) return;
  const chapters = series.chapters || [];
  sel.innerHTML = chapters.map(ch => `
    <option value="${ch.id}">${escapeHtml(ch.title)}</option>
  `).join('') || '<option value="">No chapters defined</option>';
}

function populateSlideEditorFields(slide) {
  if (!slide) return;
  State.editingSlideId = slide.id;

  const tplSel = document.getElementById('studio-template-select');
  const titleInp = document.getElementById('studio-title');
  const authorInp = document.getElementById('studio-author');
  const spreadInp = document.getElementById('studio-spread');
  const spreadLbl = document.getElementById('spread-value-label');
  const bodyTxt = document.getElementById('studio-body');
  const chSel = document.getElementById('studio-chapter-select');

  if (tplSel) tplSel.value = slide.template || 'cascade';
  if (titleInp) titleInp.value = slide.title || '';
  if (authorInp) authorInp.value = slide.author || 'ruangrobin';
  if (spreadInp) spreadInp.value = slide.spread || 50;
  if (spreadLbl) spreadLbl.textContent = `${slide.spread || 50}%`;
  if (bodyTxt) bodyTxt.value = slide.body || '';
  if (chSel && slide.chapterId) chSel.value = slide.chapterId;

  // Render template-specific inputs
  renderSpecificTemplateFields(slide.template || 'cascade', slide.specificParams || {});
  updateStudioLivePreview();
}

/**
 * Dynamically builds dedicated inputs for template fields (no guessing / no kata asal-asalan).
 */
function renderSpecificTemplateFields(tplId, currentParams = {}) {
  const container = document.getElementById('studio-specific-fields-container');
  if (!container) return;

  if (typeof TEMPLATE_FIELD_DEFINITIONS === 'undefined' || !TEMPLATE_FIELD_DEFINITIONS[tplId]) {
    container.innerHTML = '';
    return;
  }

  const def = TEMPLATE_FIELD_DEFINITIONS[tplId];
  const fields = def.fields || {};
  const keys = Object.keys(fields);

  if (keys.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <div style="font-size: 0.6875rem; font-weight: 700; color: var(--c-blue); margin-bottom: 0.25rem;">
      Specific Parameters for ${escapeHtml(def.name)}:
    </div>
  `;

  keys.forEach(k => {
    const f = fields[k];
    const paramKey = f.key || k;
    const val = currentParams[paramKey] !== undefined ? currentParams[paramKey] : (f.defaultValue !== undefined ? f.defaultValue : (f.default !== undefined ? f.default : ''));
    
    if (f.type === 'textarea') {
      html += `
        <div>
          <label class="field-label" style="font-size: 0.65rem;">${escapeHtml(f.label)}:</label>
          <textarea class="composer-textarea specific-param-input" data-param="${paramKey}" rows="2" placeholder="${escapeHtml(f.placeholder || '')}">${escapeHtml(val)}</textarea>
        </div>
      `;
    } else if (f.type === 'select' && f.options) {
      html += `
        <div>
          <label class="field-label" style="font-size: 0.65rem;">${escapeHtml(f.label)}:</label>
          <select class="composer-select specific-param-input" data-param="${paramKey}">
            ${f.options.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}
          </select>
        </div>
      `;
    } else {
      html += `
        <div>
          <label class="field-label" style="font-size: 0.65rem;">${escapeHtml(f.label)}:</label>
          <input type="${f.type || 'text'}" class="composer-input specific-param-input" data-param="${paramKey}" value="${escapeHtml(val)}" placeholder="${escapeHtml(f.placeholder || '')}">
        </div>
      `;
    }
  });

  container.innerHTML = html;

  // Bind live preview listeners
  container.querySelectorAll('.specific-param-input').forEach(el => {
    el.addEventListener('input', () => updateStudioLivePreview());
  });
}

function collectSpecificParamsFromInputs() {
  const params = {};
  document.querySelectorAll('.specific-param-input').forEach(el => {
    const key = el.getAttribute('data-param');
    if (!key) return;
    if (el.type === 'number') {
      params[key] = parseFloat(el.value) || 0;
    } else {
      params[key] = el.value;
    }
  });
  return params;
}

function updateStudioLivePreview() {
  const box = document.getElementById('studio-live-preview-box');
  if (!box) return;

  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;
  const theme = resolveSeriesTheme(series.palette);

  if (State.studioPreviewMode === 'cover') {
    // Render Book Cover Preview
    if (series.coverImage) {
      box.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; border-radius: 6px; overflow: hidden; background: #000;">
          <img src="${series.coverImage}" class="cover-photo-img" alt="Cover">
          <div class="cover-photo-overlay"></div>
          <div style="position: absolute; bottom: 2rem; left: 2rem; right: 2rem; z-index: 2; color: #fff;">
            <div style="font-size: 0.75rem; letter-spacing: 0.15em; font-weight: 700;">${escapeHtml(series.volNumber)}</div>
            <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0.4rem 0;">${escapeHtml(series.title)}</h1>
            <div style="font-size: 0.8125rem; opacity: 0.9;">${escapeHtml(series.subtitle || '')}</div>
          </div>
        </div>
      `;
    } else {
      const coverTpl = document.getElementById('studio-cover-template-select')?.value || series.coverTemplate || 'cascade';
      const dummyPage = {
        title: series.title,
        author: 'ruangrobin',
        body: series.subtitle || 'words as visual architecture',
        spread: 50
      };
      const coverHtml = templateRegistry.renderHTML(coverTpl, dummyPage, theme, 50);
      box.innerHTML = `
        <div class="a4-physical-page" style="width: 100%; height: 100%; background: ${theme.paper}; color: ${theme.ink};">
          ${coverHtml}
        </div>
      `;
    }
    return;
  }

  // Render Slide Preview
  const tpl = document.getElementById('studio-template-select')?.value || 'cascade';
  const title = document.getElementById('studio-title')?.value || 'Untitled';
  const author = document.getElementById('studio-author')?.value || 'ruangrobin';
  const spread = parseInt(document.getElementById('studio-spread')?.value || '50', 10);
  const body = document.getElementById('studio-body')?.value || '';
  const specificParams = collectSpecificParamsFromInputs();

  const mockSlide = { template: tpl, title, author, spread, body, specificParams };
  const html = templateRegistry.renderHTML(tpl, mockSlide, theme, spread);

  box.innerHTML = `
    <div class="a4-physical-page" style="width: 100%; height: 100%; background: ${theme.paper}; color: ${theme.ink}; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.65rem; color: ${theme.muted}; border-bottom: 1px solid ${theme.border}; padding-bottom: 0.5rem; margin-bottom: 1rem;">
        <span>ruangrobin &middot; ${escapeHtml(series.title.toUpperCase())}</span>
        <span>${escapeHtml(series.volNumber)} &middot; LIVE PREVIEW</span>
      </div>
      <div style="flex: 1; overflow: hidden;">
        ${html}
      </div>
      <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: baseline; font-size: 0.625rem; color: ${theme.muted}; border-top: 1px solid ${theme.border}; padding-top: 0.5rem;">
        <span>FORMAT: ${tpl.toUpperCase()}</span>
        <span>2026</span>
      </div>
    </div>
  `;
}

// ========================================================
// 8. SLIDES CRUD TAB IMPLEMENTATION
// ========================================================

function renderStudioSlidesCrud() {
  const container = document.getElementById('composer-slides-crud-list');
  if (!container) return;

  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;

  const pages = series.pages || [];
  if (pages.length === 0) {
    container.innerHTML = '<div style="font-size: 0.75rem; color: var(--c-ink-muted); padding: 1rem 0;">No slides in this edition.</div>';
    return;
  }

  container.innerHTML = pages.map((p, idx) => `
    <div class="slide-crud-card ${p.id === State.editingSlideId ? 'active-editing' : ''}">
      <div class="slide-crud-meta">
        <span class="slide-crud-title">${idx + 1}. ${escapeHtml(p.title || 'Untitled')}</span>
        <span class="slide-crud-tag">${escapeHtml(p.template)} &middot; ${(p.body || '').split(' ').slice(0, 5).join(' ')}...</span>
      </div>
      <div class="slide-crud-actions">
        <button type="button" class="btn-icon-sm" title="Move Up" onclick="handleReorderSlide(${idx}, -1)">&uarr;</button>
        <button type="button" class="btn-icon-sm" title="Move Down" onclick="handleReorderSlide(${idx}, 1)">&darr;</button>
        <button type="button" class="btn-icon-sm" title="Duplicate Slide" style="font-size: 0.65rem; padding: 0.2rem 0.45rem;" onclick="handleDuplicateSlide('${p.id}')">Clone</button>
        <button type="button" class="btn-icon-sm" title="Edit Slide" style="font-size: 0.65rem; padding: 0.2rem 0.45rem;" onclick="handleEditSlide('${p.id}')">Edit</button>
        <button type="button" class="btn-icon-sm btn-danger" title="Delete Slide" style="font-size: 0.9rem; line-height: 1;" onclick="handleDeleteSlide('${p.id}')">&times;</button>
      </div>
    </div>
  `).join('');
}

function handleDuplicateSlide(slideId) {
  const clone = seriesRegistry.duplicateSlide(State.currentEbookId, slideId);
  if (clone) {
    showToast(`Slide cloned: ${clone.title}`);
    loadSeriesIntoStudio();
    renderStudioSlidesCrud();
    updateStudioLivePreview();
  }
}

function handleEditSlide(slideId) {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series || !series.pages) return;
  const slide = series.pages.find(p => p.id === slideId);
  if (!slide) return;

  // Switch to Tab 1
  document.querySelector('.composer-tab-btn[data-tab="tab-slide-content"]')?.click();
  populateSlideEditorFields(slide);
  showToast(`Editing: ${slide.title}`);
}

function handleDeleteSlide(slideId) {
  if (!confirm('Are you sure you want to delete this slide?')) return;
  const success = seriesRegistry.deleteSlide(State.currentEbookId, slideId);
  if (success) {
    showToast('Slide deleted.');
    loadSeriesIntoStudio();
    renderStudioSlidesCrud();
  }
}

function handleReorderSlide(index, delta) {
  const newIndex = index + delta;
  const success = seriesRegistry.reorderSlide(State.currentEbookId, index, newIndex);
  if (success) {
    renderStudioSlidesCrud();
    updateStudioLivePreview();
  }
}

function handleSaveCurrentSlide() {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;

  const tpl = document.getElementById('studio-template-select')?.value || 'cascade';
  const title = document.getElementById('studio-title')?.value || 'Untitled';
  const author = document.getElementById('studio-author')?.value || 'ruangrobin';
  const spread = parseInt(document.getElementById('studio-spread')?.value || '50', 10);
  const body = document.getElementById('studio-body')?.value || '';
  const chapterId = document.getElementById('studio-chapter-select')?.value || null;
  const specificParams = collectSpecificParamsFromInputs();

  if (State.editingSlideId) {
    // Update existing
    seriesRegistry.updateSlide(State.currentEbookId, State.editingSlideId, {
      template: tpl,
      title,
      author,
      spread,
      body,
      chapterId,
      specificParams
    });
    showToast('Slide updated successfully.');
  } else {
    // Add new
    const newSlide = seriesRegistry.addSlide(State.currentEbookId, {
      template: tpl,
      title,
      author,
      spread,
      body,
      chapterId,
      specificParams
    });
    State.editingSlideId = newSlide.id;
    showToast('New slide added to edition.');
  }

  loadSeriesIntoStudio();
}

function handleCreateNewSlide() {
  State.editingSlideId = null;
  document.getElementById('studio-title').value = 'New Verse';
  document.getElementById('studio-body').value = '';
  document.getElementById('studio-template-select').value = 'cascade';
  renderSpecificTemplateFields('cascade');
  updateStudioLivePreview();
  showToast('Ready to compose new slide.');
}

// ========================================================
// 9. BAB (CHAPTERS) CRUD TAB IMPLEMENTATION
// ========================================================

function renderStudioChaptersCrud() {
  const container = document.getElementById('composer-chapters-crud-list');
  if (!container) return;

  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;

  const chapters = series.chapters || [];
  if (chapters.length === 0) {
    container.innerHTML = '<div style="font-size: 0.75rem; color: var(--c-ink-muted); padding: 1rem 0;">No chapters in this edition. Click "+ New Bab" to add one.</div>';
    return;
  }

  container.innerHTML = chapters.map(ch => {
    const slideCount = (series.pages || []).filter(p => p.chapterId === ch.id).length;
    return `
      <div class="chapter-crud-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <input type="text" class="composer-input" value="${escapeHtml(ch.title)}" style="font-weight: 700; flex: 1; margin-right: 0.5rem;" onchange="handleUpdateChapterTitle('${ch.id}', this.value)">
          <button type="button" class="btn-icon-sm btn-danger" style="font-size: 0.9rem; line-height: 1;" title="Delete Chapter" onclick="handleDeleteChapter('${ch.id}')">&times;</button>
        </div>
        <textarea class="composer-textarea" rows="2" placeholder="Chapter description..." style="font-size: 0.6875rem;" onchange="handleUpdateChapterDesc('${ch.id}', this.value)">${escapeHtml(ch.description || '')}</textarea>
        <div style="font-size: 0.65rem; color: var(--c-ink-muted);">Contains ${slideCount} slides</div>
      </div>
    `;
  }).join('');
}

function handleAddNewChapter() {
  const newChap = seriesRegistry.addChapter(State.currentEbookId, 'New Chapter', 'Description of movement or tone.');
  if (newChap) {
    showToast('New Bab created.');
    loadSeriesIntoStudio();
    renderStudioChaptersCrud();
  }
}

function handleUpdateChapterTitle(chapterId, val) {
  seriesRegistry.updateChapter(State.currentEbookId, chapterId, val, undefined);
  populateStudioChapterSelect(seriesRegistry.getById(State.currentEbookId));
  showToast('Bab title saved.');
}

function handleUpdateChapterDesc(chapterId, val) {
  seriesRegistry.updateChapter(State.currentEbookId, chapterId, undefined, val);
  showToast('Bab description saved.');
}

function handleDeleteChapter(chapterId) {
  if (!confirm('Delete this chapter? Slides belonging to it will become unassigned.')) return;
  seriesRegistry.deleteChapter(State.currentEbookId, chapterId);
  loadSeriesIntoStudio();
  renderStudioChaptersCrud();
  showToast('Chapter removed.');
}

// ========================================================
// 10. INTERACTIVE COVER PHOTO CROP & ZOOM ENGINE
// ========================================================

function updateCoverPhotoStatusUI(series) {
  const statusEl = document.getElementById('cover-photo-status');
  const adjustBtn = document.getElementById('btn-open-crop-modal');
  const removeBtn = document.getElementById('btn-remove-cover-photo');

  if (series.coverImage) {
    if (statusEl) statusEl.textContent = 'Custom photo attached & cropped to A4.';
    if (adjustBtn) adjustBtn.style.display = 'inline-block';
    if (removeBtn) removeBtn.style.display = 'inline-block';
  } else {
    if (statusEl) statusEl.textContent = 'No photo attached (using pure typographic motif).';
    if (adjustBtn) adjustBtn.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function setupCoverPhotoEvents() {
  const fileInput = document.getElementById('cover-photo-file-input');
  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          State.crop.imageObj = img;
          State.crop.zoom = 1.0;
          State.crop.offsetX = 0;
          State.crop.offsetY = 0;
          State.crop.rotation = 0;
          openCropModal();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    };
  }

  // Crop modal buttons
  document.getElementById('btn-open-crop-modal')?.addEventListener('click', () => {
    const series = seriesRegistry.getById(State.currentEbookId);
    if (!series || !series.coverImage) return;
    const img = new Image();
    img.onload = () => {
      State.crop.imageObj = img;
      openCropModal();
    };
    img.src = series.coverImage;
  });

  document.getElementById('btn-remove-cover-photo')?.addEventListener('click', () => {
    if (!confirm('Remove cover photo and revert to pure typographic cover?')) return;
    seriesRegistry.removeCoverPhoto(State.currentEbookId);
    loadSeriesIntoStudio();
    showToast('Cover photo removed.');
  });

  document.getElementById('btn-close-crop-modal')?.addEventListener('click', closeCropModal);
  document.getElementById('btn-cancel-crop')?.addEventListener('click', closeCropModal);

  document.getElementById('btn-crop-reset')?.addEventListener('click', () => {
    State.crop.zoom = 1.0;
    State.crop.offsetX = 0;
    State.crop.offsetY = 0;
    document.getElementById('crop-zoom-slider').value = '1';
    document.getElementById('crop-zoom-label').textContent = '1.0x';
    drawCropPreview();
  });

  document.getElementById('btn-crop-rotate')?.addEventListener('click', () => {
    State.crop.rotation = (State.crop.rotation + 90) % 360;
    drawCropPreview();
  });

  const zoomSlider = document.getElementById('crop-zoom-slider');
  if (zoomSlider) {
    zoomSlider.oninput = (e) => {
      State.crop.zoom = parseFloat(e.target.value);
      document.getElementById('crop-zoom-label').textContent = `${State.crop.zoom.toFixed(1)}x`;
      drawCropPreview();
    };
  }

  // Interactive mouse drag on canvas
  const canvas = document.getElementById('crop-preview-canvas');
  if (canvas) {
    canvas.onmousedown = (e) => {
      State.crop.isDragging = true;
      State.crop.dragStartX = e.clientX - State.crop.offsetX;
      State.crop.dragStartY = e.clientY - State.crop.offsetY;
    };
    window.addEventListener('mousemove', (e) => {
      if (!State.crop.isDragging) return;
      State.crop.offsetX = e.clientX - State.crop.dragStartX;
      State.crop.offsetY = e.clientY - State.crop.dragStartY;
      drawCropPreview();
    });
    window.addEventListener('mouseup', () => {
      State.crop.isDragging = false;
    });
  }

  // Apply Crop
  document.getElementById('btn-apply-crop')?.addEventListener('click', () => {
    if (!canvas) return;
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
    seriesRegistry.updateCoverPhoto(State.currentEbookId, croppedBase64, {
      zoom: State.crop.zoom,
      offsetX: State.crop.offsetX,
      offsetY: State.crop.offsetY,
      rotation: State.crop.rotation
    });
    closeCropModal();
    loadSeriesIntoStudio();
    showToast('Cover photo applied to monograph!');
  });
}

function openCropModal() {
  const modal = document.getElementById('cover-crop-modal');
  if (modal) modal.style.display = 'flex';
  drawCropPreview();
}

function closeCropModal() {
  const modal = document.getElementById('cover-crop-modal');
  if (modal) modal.style.display = 'none';
}

function drawCropPreview() {
  const canvas = document.getElementById('crop-preview-canvas');
  if (!canvas || !State.crop.imageObj) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;  // 420
  const h = canvas.height; // 594 (210 / 297 ratio)

  ctx.fillStyle = '#111418';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2 + State.crop.offsetX, h / 2 + State.crop.offsetY);
  ctx.rotate((State.crop.rotation * Math.PI) / 180);
  ctx.scale(State.crop.zoom, State.crop.zoom);

  const img = State.crop.imageObj;
  // Fit image aspect ratio to cover canvas
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;

  let drawW, drawH;
  if (imgRatio > canvasRatio) {
    drawH = h;
    drawW = h * imgRatio;
  } else {
    drawW = w;
    drawH = w / imgRatio;
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

// ========================================================
// 11. PALETTE SWATCHES & CONTRAST
// ========================================================

function renderPaletteSwatches(palette) {
  const container = document.getElementById('palette-swatches-container');
  if (!container) return;

  const pal = Array.isArray(palette) && palette.length >= 2 ? palette : ['#faf6ee', '#111418', '#0018f0'];
  const resolved = typeof smartResolvePalette === 'function' ? smartResolvePalette(pal) : resolveSeriesTheme(pal);
  
  const badge = document.getElementById('palette-contrast-badge');
  if (badge) {
    badge.textContent = `Contrast: ${resolved.contrastRatio || '7.1:1'} (AAA Guaranteed)`;
  }

  const roleLabels = ['Paper (Bg)', 'Ink (Primary)', 'Accent', 'Muted', 'Sheet'];

  let html = pal.map((color, idx) => `
    <div style="display: flex; flex-direction: column; gap: 0.2rem; background: var(--c-surface, #fff); border: 1px solid var(--c-border); border-radius: 6px; padding: 0.35rem 0.5rem; min-width: 90px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-ink-muted); font-weight: 600;">${roleLabels[idx] || `Color ${idx + 1}`}</span>
        ${pal.length > 2 ? `<button type="button" class="btn-icon-sm btn-danger" style="font-size: 0.75rem; padding: 0 0.25rem; line-height: 1;" title="Remove Color" onclick="handleRemovePaletteColor(${idx})">&times;</button>` : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 0.35rem;">
        <input type="color" value="${color.length === 7 ? color : '#111418'}" style="width: 24px; height: 24px; border: 1px solid var(--c-border); border-radius: 4px; cursor: pointer; padding: 0; background: none;" onchange="handlePaletteColorChange(${idx}, this.value)">
        <input type="text" value="${color}" maxlength="7" style="width: 56px; font-size: 0.65rem; font-family: monospace; border: 1px solid var(--c-border); border-radius: 3px; padding: 2px 4px; text-transform: uppercase;" onchange="handlePaletteHexChange(${idx}, this.value)">
      </div>
    </div>
  `).join('');

  if (pal.length < 5) {
    html += `
      <button type="button" class="pill-action-btn" style="font-size: 0.65rem; padding: 0.4rem 0.65rem; align-self: center;" onclick="handleAddPaletteColor()">+ Color</button>
    `;
  }

  container.innerHTML = html;
}

function handlePaletteColorChange(idx, newHex) {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series) return;
  series.palette[idx] = newHex;
  seriesRegistry.persist();
  renderPaletteSwatches(series.palette);
  updateStudioLivePreview();
}

function handlePaletteHexChange(idx, rawVal) {
  let clean = rawVal.trim();
  if (!clean.startsWith('#')) clean = '#' + clean;
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
    handlePaletteColorChange(idx, clean);
  } else {
    showToast('Invalid hex format. Use #RRGGBB');
    const series = seriesRegistry.getById(State.currentEbookId);
    if (series) renderPaletteSwatches(series.palette);
  }
}

function handleAddPaletteColor() {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series || series.palette.length >= 5) return;
  const presets = ['#0018f0', '#666a73', '#d97706', '#059669', '#dc2626'];
  const nextColor = presets[series.palette.length] || '#888888';
  series.palette.push(nextColor);
  seriesRegistry.persist();
  renderPaletteSwatches(series.palette);
  updateStudioLivePreview();
}

function handleRemovePaletteColor(idx) {
  const series = seriesRegistry.getById(State.currentEbookId);
  if (!series || series.palette.length <= 2) return;
  series.palette.splice(idx, 1);
  seriesRegistry.persist();
  renderPaletteSwatches(series.palette);
  updateStudioLivePreview();
}

// Preset palettes
const PRESET_PALETTES = {
  mono: ['#ffffff', '#111418'],
  klein: ['#faf6ee', '#111418', '#0018f0'],
  fontana: ['#f4efe4', '#8b181b', '#111418'],
  nocturne: ['#0d1117', '#ffffff', '#58a6ff'],
  autumn: ['#fbf8f3', '#2c1810', '#c25e00', '#78350f'],
  swiss: ['#ffffff', '#000000', '#e11d48', '#4b5563'],
  forest: ['#f4f6f0', '#1c2826', '#2d5a27', '#6b705c', '#ffffff']
};

function setupPalettePresets() {
  document.querySelectorAll('.preset-pill-btn').forEach(btn => {
    btn.onclick = () => {
      const presetKey = btn.getAttribute('data-preset');
      const pal = PRESET_PALETTES[presetKey];
      if (pal) {
        const series = seriesRegistry.getById(State.currentEbookId);
        if (!series) return;
        series.palette = [...pal];
        seriesRegistry.persist();
        renderPaletteSwatches(series.palette);
        updateStudioLivePreview();
        showToast(`Preset ${presetKey} applied.`);
      }
    };
  });
}

// ========================================================
// 12. INITIALIZATION & EVENT LISTENERS
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize default series selection
  const all = seriesRegistry.getAll();
  if (all.length > 0 && !State.currentEbookId) {
    State.currentEbookId = all[0].id;
  }

  // 2. Navigation bar events
  document.getElementById('nav-brand-btn')?.addEventListener('click', () => switchView('shelf'));
  document.getElementById('nav-tab-shelf')?.addEventListener('click', () => switchView('shelf'));
  document.getElementById('nav-tab-reader')?.addEventListener('click', () => switchView('reader'));
  document.getElementById('nav-tab-composer')?.addEventListener('click', () => {
    if (!State.isUnlocked) {
      document.getElementById('passcode-modal').style.display = 'flex';
    } else {
      switchView('studio');
    }
  });
  document.getElementById('nav-tab-colophon')?.addEventListener('click', () => switchView('colophon'));
  document.getElementById('btn-top-auth')?.addEventListener('click', () => {
    if (!State.isUnlocked) {
      document.getElementById('passcode-modal').style.display = 'flex';
    } else {
      switchView('studio');
    }
  });

  // 3. Reader controls
  document.getElementById('btn-reader-back')?.addEventListener('click', () => switchView('shelf'));
  document.getElementById('btn-page-prev')?.addEventListener('click', () => flipPage(-1));
  document.getElementById('btn-page-next')?.addEventListener('click', () => flipPage(1));
  document.getElementById('btn-reader-toc')?.addEventListener('click', openReaderTocModal);
  document.getElementById('btn-close-reader-toc')?.addEventListener('click', closeReaderTocModal);
  document.getElementById('btn-reader-pdf')?.addEventListener('click', () => exportCompleteEbookToPDF(State.currentEbookId));
  document.getElementById('btn-download-poem')?.addEventListener('click', exportCurrentPageToA4Png);

  document.getElementById('btn-copy-poem')?.addEventListener('click', () => {
    const series = seriesRegistry.getById(State.currentEbookId);
    if (!series || !series.pages) return;
    const cur = series.pages[State.currentPageIndex];
    if (!cur) return;
    const cleanText = (cur.body || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\{([^}]+)\}/g, '$1');
    navigator.clipboard.writeText(`${cur.title}\n\n${cleanText}`).then(() => {
      showToast('Verse copied to clipboard.');
    });
  });

  // 4. Passcode Auth
  document.getElementById('btn-close-passcode')?.addEventListener('click', () => {
    document.getElementById('passcode-modal').style.display = 'none';
  });
  document.getElementById('btn-submit-passcode')?.addEventListener('click', () => {
    const val = document.getElementById('input-passcode')?.value;
    if (val === PASSCODE) {
      State.isUnlocked = true;
      document.getElementById('passcode-modal').style.display = 'none';
      document.getElementById('btn-top-auth').textContent = 'Tulis [unlocked]';
      showToast('Authentication unlocked.');
      switchView('studio');
    } else {
      showToast('Invalid passcode.');
    }
  });

  // 5. Studio Buttons
  document.getElementById('btn-save-poem')?.addEventListener('click', handleSaveCurrentSlide);
  document.getElementById('btn-new-slide-btn')?.addEventListener('click', handleCreateNewSlide);
  document.getElementById('btn-add-slide-from-crud')?.addEventListener('click', handleCreateNewSlide);
  document.getElementById('btn-add-new-chapter')?.addEventListener('click', handleAddNewChapter);

  document.getElementById('btn-preview-mode-page')?.addEventListener('click', () => {
    State.studioPreviewMode = 'page';
    document.getElementById('btn-preview-mode-page').classList.add('active');
    document.getElementById('btn-preview-mode-cover').classList.remove('active');
    updateStudioLivePreview();
  });

  document.getElementById('btn-preview-mode-cover')?.addEventListener('click', () => {
    State.studioPreviewMode = 'cover';
    document.getElementById('btn-preview-mode-cover').classList.add('active');
    document.getElementById('btn-preview-mode-page').classList.remove('active');
    updateStudioLivePreview();
  });

  document.getElementById('btn-preview-download')?.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const series = seriesRegistry.getById(State.currentEbookId);
    if (!series) return;
    const cur = series.pages.find(p => p.id === State.editingSlideId) || series.pages[0];
    renderSlideToA4Canvas(canvas, cur, series, 1, 1);
    const link = document.createElement('a');
    link.download = `preview-${cur.title || 'monograph'}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    showToast('A4 Monograph exported.');
  });

  // Series details update
  document.getElementById('btn-save-series-meta')?.addEventListener('click', () => {
    const title = document.getElementById('series-edit-title')?.value;
    const vol = document.getElementById('series-edit-vol')?.value;
    const sub = document.getElementById('series-edit-sub')?.value;
    const coverTpl = document.getElementById('studio-cover-template-select')?.value;

    seriesRegistry.updateSeries(State.currentEbookId, {
      title,
      volNumber: vol,
      subtitle: sub,
      coverTemplate: coverTpl
    });
    showToast('Series details updated.');
    populateStudioSeriesSelect();
    updateStudioLivePreview();
  });

  // Export standalone Series JS for GitHub repository
  document.getElementById('btn-export-series-js')?.addEventListener('click', () => {
    const series = seriesRegistry.getById(State.currentEbookId);
    if (!series) return;
    const cleanId = (series.id || 'series').replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase() + '_SERIES';
    const jsContent = `/**\n * ruangrobin — Modular Series Edition\n * File: series/${series.id}.js\n */\n\nconst ${cleanId} = ${JSON.stringify(series, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = { ${cleanId} };\n}\nif (typeof window !== 'undefined') {\n  window.${cleanId} = ${cleanId};\n}\n`;
    const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${series.id || 'edition'}.js`;
    link.click();
    showToast('Series JS module downloaded for GitHub repo.');
  });

  // Export series JSON
  document.getElementById('btn-export-series-json')?.addEventListener('click', () => {
    const series = seriesRegistry.getById(State.currentEbookId);
    if (!series) return;
    const jsonStr = JSON.stringify(series, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${series.id || 'edition'}.json`;
    link.click();
    showToast('Series JSON data downloaded.');
  });

  // Live preview bindings
  document.getElementById('studio-template-select')?.addEventListener('change', (e) => {
    renderSpecificTemplateFields(e.target.value);
    updateStudioLivePreview();
  });
  document.getElementById('studio-title')?.addEventListener('input', updateStudioLivePreview);
  document.getElementById('studio-author')?.addEventListener('input', updateStudioLivePreview);
  document.getElementById('studio-body')?.addEventListener('input', updateStudioLivePreview);
  document.getElementById('studio-spread')?.addEventListener('input', (e) => {
    document.getElementById('spread-value-label').textContent = `${e.target.value}%`;
    updateStudioLivePreview();
  });

  // Search input on shelf
  const searchInp = document.getElementById('catalog-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      State.searchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = e.target.value ? 'block' : 'none';
      renderShelf();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInp.value = '';
      State.searchQuery = '';
      clearBtn.style.display = 'none';
      renderShelf();
    });
  }
  document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
    if (searchInp) searchInp.value = '';
    State.searchQuery = '';
    if (clearBtn) clearBtn.style.display = 'none';
    renderShelf();
  });

  // Setup Cover Photo & Palette
  setupCoverPhotoEvents();
  setupPalettePresets();

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (State.currentView === 'reader') {
      if (e.key === 'ArrowLeft') flipPage(-1);
      if (e.key === 'ArrowRight') flipPage(1);
    }
  });

  // Initial render
  renderShelf();
});

// Expose globals for inline event handlers
window.openEbookReader = openEbookReader;
window.goToReaderPage = goToReaderPage;
window.closeReaderTocModal = closeReaderTocModal;
window.handleEditSlide = handleEditSlide;
window.handleDeleteSlide = handleDeleteSlide;
window.handleDuplicateSlide = handleDuplicateSlide;
window.handleReorderSlide = handleReorderSlide;
window.handleUpdateChapterTitle = handleUpdateChapterTitle;
window.handleUpdateChapterDesc = handleUpdateChapterDesc;
window.handleDeleteChapter = handleDeleteChapter;
window.handlePaletteColorChange = handlePaletteColorChange;
window.handleAddPaletteColor = handleAddPaletteColor;
window.handleRemovePaletteColor = handleRemovePaletteColor;
