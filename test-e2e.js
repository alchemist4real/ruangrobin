const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'http://localhost/'
});

const { window } = dom;
const { document } = window;

// Provide mock canvas context, window scroll, URL.createObjectURL, and navigator.clipboard
window.scrollTo = function() {};
window.URL.createObjectURL = function() { return 'blob:mock-url'; };
window.URL.revokeObjectURL = function() {};
window.confirm = function() { return true; };
window.HTMLAnchorElement.prototype.click = function() {};
window.navigator.clipboard = {
  writeText: async function() { return Promise.resolve(); }
};

window.HTMLCanvasElement.prototype.getContext = function() {
  return {
    save() {}, restore() {}, beginPath() {}, stroke() {}, fill() {}, fillRect() {}, strokeRect() {}, setLineDash() {}, ellipse() {},
    fillText() {}, strokeText() {}, measureText(t) { return { width: (t||'').length * 10 }; },
    arc() {}, rect() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, quadraticCurveTo() {},
    drawImage() {}, transform() {}, scale() {}, rotate() {}, translate() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    font: '', fillStyle: '', strokeStyle: '', textAlign: '', textBaseline: '', lineWidth: 1
  };
};
window.HTMLCanvasElement.prototype.toDataURL = function() {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
};

// Listen to window error
window.addEventListener('error', e => {
  console.error('WINDOW ERROR:', e.error || e.message);
});

// Load scripts manually into window in exact order
const scripts = [
  'jspdf.umd.min.js',
  'series/smart-palette.js',
  'series/template-fields.js',
  'series/lorem-specimen.js',
  'series/entropy-cosmos.js',
  'series/river-departure.js',
  'series/registry.js',
  'templates/registry.js',
  'app.js'
];

scripts.forEach(s => {
  const code = fs.readFileSync(s, 'utf8');
  window.eval(code);
});

// Trigger DOMContentLoaded
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const state = window.State;

console.log('=== TEST 1: TOP NAVIGATION & HEADER ===');
const navBrandBtn = document.getElementById('nav-brand-btn');
const navTabShelf = document.getElementById('nav-tab-shelf');
const navTabReader = document.getElementById('nav-tab-reader');
const navTabComposer = document.getElementById('nav-tab-composer');
const navTabColophon = document.getElementById('nav-tab-colophon');
const btnTopAuth = document.getElementById('btn-top-auth');

if (!navBrandBtn || !navTabShelf || !navTabReader || !navTabComposer || !navTabColophon || !btnTopAuth) {
  throw new Error('Top Navigation elements missing!');
}

navBrandBtn.click();
if (state.currentView !== 'shelf') throw new Error('Nav brand click failed to switch to shelf');

navTabColophon.click();
if (state.currentView !== 'colophon') throw new Error('Nav tab colophon failed to switch to colophon');

navTabShelf.click();
if (state.currentView !== 'shelf') throw new Error('Nav tab shelf failed to switch to shelf');

// Test clicking studio when locked opens passcode modal
const passcodeModal = document.getElementById('passcode-modal');
navTabComposer.click();
if (passcodeModal.style.display !== 'flex') throw new Error('Passcode modal should open when clicking Studio while locked');
document.getElementById('btn-close-passcode').click();
if (passcodeModal.style.display !== 'none') throw new Error('Close passcode modal failed');

console.log('Top Navigation verification passed.');

console.log('=== TEST 2: SEARCH & FILTER ENGINE ===');
const searchInput = document.getElementById('catalog-search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const searchResultsInfo = document.getElementById('search-results-info');
const searchMatchesCount = document.getElementById('search-matches-count');

searchInput.value = 'specimen';
searchInput.dispatchEvent(new window.Event('input'));
if (searchResultsInfo.style.display === 'none') throw new Error('Search results info should be visible');
console.log('Search matches for "specimen":', searchMatchesCount.textContent);

searchClearBtn.click();
if (searchInput.value !== '' || state.searchQuery !== '') throw new Error('Search clear button failed');
if (searchResultsInfo.style.display !== 'none') throw new Error('Search results info should be hidden after clear');

// Test filter reset button
searchInput.value = 'nonexistentxyz';
searchInput.dispatchEvent(new window.Event('input'));
document.getElementById('btn-reset-filter').click();
if (searchInput.value !== '' || state.searchQuery !== '') throw new Error('Reset filter button failed');

console.log('Search & Filter verification passed.');

console.log('=== TEST 3: TAB 1 — SHELF VIEW ===');
const shelfCards = document.querySelectorAll('.book-shelf-card');
console.log('Shelf cards rendered count:', shelfCards.length);
if (shelfCards.length < 3) throw new Error('Expected at least 3 shelf cards, got ' + shelfCards.length);

console.log('Shelf View verification passed.');

console.log('=== TEST 4: TAB 2 — READER VIEW ===');
// Click the first card -> opens at page -1 (Cover Plate)
shelfCards[0].click();
if (state.currentView !== 'reader') throw new Error('Clicking shelf card should open reader');
console.log('Active edition:', state.currentEbookId, 'Page:', state.currentPageIndex);
if (state.currentPageIndex !== -1) throw new Error('Expected initial reader page to be -1 (Cover Plate), got ' + state.currentPageIndex);

const stage = document.getElementById('reader-poem-stage');
if (!stage || stage.innerHTML.length < 100) throw new Error('Reader stage failed to render cover plate content');

const pageInd = document.getElementById('reader-page-indicator');
if (!pageInd || !pageInd.textContent.includes('Cover Plate')) throw new Error('Reader indicator missing Cover Plate text');

// Export Cover Plate A4 PNG
document.getElementById('btn-download-poem').click();

// Flipper step Next -> moves to Slide 0 (Page 1)
document.getElementById('btn-page-next').click();
if (state.currentPageIndex !== 0) throw new Error('Next page from cover failed, expected 0 got ' + state.currentPageIndex);

// Flipper step Next -> moves to Slide 1 (Page 2)
document.getElementById('btn-page-next').click();
if (state.currentPageIndex !== 1) throw new Error('Next page failed, expected 1 got ' + state.currentPageIndex);

// Flipper step Prev -> moves back to Slide 0
document.getElementById('btn-page-prev').click();
if (state.currentPageIndex !== 0) throw new Error('Prev page failed, expected 0 got ' + state.currentPageIndex);

// Flipper step Prev -> moves back to Cover Plate (-1)
document.getElementById('btn-page-prev').click();
if (state.currentPageIndex !== -1) throw new Error('Prev page to cover failed, expected -1 got ' + state.currentPageIndex);

// Keyboard arrows
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }));
if (state.currentPageIndex !== 0) throw new Error('ArrowRight navigation failed');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' }));
if (state.currentPageIndex !== -1) throw new Error('ArrowLeft navigation failed');

// Table of contents modal
document.getElementById('btn-reader-toc').click();
const tocModal = document.getElementById('reader-toc-modal');
if (tocModal.style.display !== 'flex') throw new Error('TOC modal should be visible');

const tocContainer = document.getElementById('reader-toc-list-container');
if (tocContainer.children.length < 3) throw new Error('TOC chapters count insufficient: ' + tocContainer.children.length);

document.getElementById('btn-close-reader-toc').click();
if (tocModal.style.display !== 'none') throw new Error('Close TOC modal failed');

// Export E-Book PDF
document.getElementById('btn-reader-pdf').click();

// Copy text button
document.getElementById('btn-copy-poem').click();

// Back to Shelf
document.getElementById('btn-reader-back').click();
if (state.currentView !== 'shelf') throw new Error('Reader back button failed');

console.log('Reader View verification passed.');

console.log('=== TEST 5: TAB 3 — STUDIO / COMPOSER (AUTH & CRUD) ===');
btnTopAuth.click();
if (passcodeModal.style.display !== 'flex') throw new Error('Passcode modal failed to open from top auth');

// Submit passcode via Enter key
const inputPasscode = document.getElementById('input-passcode');
inputPasscode.value = 'robin';
inputPasscode.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));

if (!state.isUnlocked) throw new Error('Passcode authentication failed');
if (state.currentView !== 'studio') throw new Error('Studio should open after unlock');
if (btnTopAuth.textContent !== 'Tulis [unlocked]') throw new Error('Top auth label should reflect unlock state');

// Test Sub-tabs
const subTabs = ['tab-slide-content', 'tab-slides-crud', 'tab-cover-series', 'tab-chapters-crud'];
subTabs.forEach(tabId => {
  const btn = document.querySelector(`.composer-tab-btn[data-tab="${tabId}"]`);
  if (!btn) throw new Error('Missing sub-tab button: ' + tabId);
  btn.click();
  const pane = document.getElementById(tabId);
  if (!pane.classList.contains('active')) throw new Error('Sub-tab failed to activate: ' + tabId);
});

// Test Dynamic Template Fields (Sub-tab 1)
document.querySelector('.composer-tab-btn[data-tab="tab-slide-content"]').click();
const tplSel = document.getElementById('studio-template-select');
tplSel.value = 'butterfly';
tplSel.dispatchEvent(new window.Event('change'));
const dynamicContainer = document.getElementById('studio-specific-fields-container');
console.log('Dynamic template fields rendered for butterfly:', dynamicContainer.children.length);
if (dynamicContainer.children.length === 0) throw new Error('Dynamic fields for butterfly failed to render');

// Save slide
document.getElementById('studio-title').value = 'Audited Verse';
document.getElementById('studio-body').value = 'This is a **bold word** and {accent word}.';
document.getElementById('btn-save-poem').click();

// New slide
document.getElementById('btn-new-slide-btn').click();
if (document.getElementById('studio-title').value !== 'New Verse') throw new Error('New slide button failed');

// Test Slides CRUD (Sub-tab 2)
document.querySelector('.composer-tab-btn[data-tab="tab-slides-crud"]').click();
const crudContainer = document.getElementById('composer-slides-crud-list');
if (crudContainer.children.length === 0) throw new Error('Slides CRUD list empty');
console.log('Slides in current edition:', crudContainer.children.length);

// Test Series & Cover (Sub-tab 3)
document.querySelector('.composer-tab-btn[data-tab="tab-cover-series"]').click();
const titleInp = document.getElementById('series-edit-title');
titleInp.value = 'Updated Audited Series';
document.getElementById('btn-save-series-meta').click();

// Palette editor: hex change & preset
const hexInps = document.querySelectorAll('#palette-swatches-container input[type="text"]');
if (hexInps.length > 0) {
  hexInps[0].value = '#0a0a0a';
  hexInps[0].dispatchEvent(new window.Event('change'));
}
const presetBtn = document.querySelector('.preset-pill-btn[data-preset="swiss"]');
if (presetBtn) presetBtn.click();

// Test Studio Live Preview Mode: Cover vs Page
document.getElementById('btn-preview-mode-cover').click();
if (state.studioPreviewMode !== 'cover') throw new Error('Cover preview mode failed to activate');
const liveBox = document.getElementById('studio-live-preview-box');
if (!liveBox || liveBox.innerHTML.length < 50) throw new Error('Studio live cover preview empty');
// Download Cover Preview
document.getElementById('btn-preview-download').click();

document.getElementById('btn-preview-mode-page').click();
if (state.studioPreviewMode !== 'page') throw new Error('Page preview mode failed to activate');
// Download Page Preview
document.getElementById('btn-preview-download').click();

// Modular Export JS and JSON
document.getElementById('btn-export-series-js').click();
document.getElementById('btn-export-series-json').click();

// Test Cover Crop Modal
const cropModal = document.getElementById('cover-crop-modal');
window.openCropModal();
if (cropModal.style.display !== 'flex') throw new Error('Crop modal failed to open');
document.getElementById('btn-crop-rotate').click();
document.getElementById('btn-crop-reset').click();
document.getElementById('btn-apply-crop').click();
if (cropModal.style.display !== 'none') throw new Error('Crop modal should close after apply');

// Test Bab (Chapters) CRUD (Sub-tab 4)
document.querySelector('.composer-tab-btn[data-tab="tab-chapters-crud"]').click();
const chapContainer = document.getElementById('composer-chapters-crud-list');
console.log('Chapters in edition:', chapContainer.children.length);
document.getElementById('btn-add-new-chapter').click();

// Test Lock button inside Studio
document.getElementById('btn-lock-tulis').click();
if (state.isUnlocked !== false) throw new Error('Studio lock button failed to relock');
if (state.currentView !== 'shelf') throw new Error('Lock button should return to shelf');
if (btnTopAuth.textContent !== 'Tulis') throw new Error('Top auth label should reset to Tulis');

console.log('Studio / Composer verification passed.');

console.log('=== TEST 6: TAB 4 — COLOPHON & FOOTER ===');
document.getElementById('nav-tab-colophon').click();
if (state.currentView !== 'colophon') throw new Error('Colophon view navigation failed');

const footer = document.querySelector('.catalog-site-footer');
if (!footer) throw new Error('Footer missing');
const footerBrand = footer.querySelector('.footer-brand-title');
if (!footerBrand || footerBrand.textContent !== 'ruangrobin') throw new Error('Footer brand text invalid');

console.log('Colophon & Footer verification passed.');

console.log('====================================================');
console.log('ALL 6 PLATFORM ZONES AUDITED & VERIFIED WITH 100% SUCCESS!');
console.log('====================================================');
process.exit(0);

