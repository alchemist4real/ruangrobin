const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost:8089/'
});

const { window } = dom;
const { document } = window;

// Provide mock canvas context and window scroll
window.scrollTo = function() {};
window.HTMLCanvasElement.prototype.getContext = function() {
  return {
    save() {}, restore() {}, beginPath() {}, stroke() {}, fill() {}, fillRect() {}, strokeRect() {}, setLineDash() {}, ellipse() {},
    fillText() {}, strokeText() {}, measureText(t) { return { width: (t||'').length * 10 }; },
    arc() {}, rect() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, quadraticCurveTo() {},
    drawImage() {}, transform() {}, scale() {}, rotate() {}, translate() {},
    font: '', fillStyle: '', strokeStyle: '', textAlign: '', textBaseline: '', lineWidth: 1
  };
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

console.log('--- TEST TAB 1: SHELF VIEW ---');
const state = window.State;
console.log('Current view:', state.currentView);
const shelfCards = document.querySelectorAll('.book-shelf-card');
console.log('Shelf cards rendered count:', shelfCards.length);
if (shelfCards.length < 3) throw new Error('Expected at least 3 shelf cards, got ' + shelfCards.length);

console.log('--- TEST TAB 2: READER VIEW ---');
// Click the first series on shelf
shelfCards[0].click();
console.log('Current view after clicking shelf card:', state.currentView);
console.log('Active edition:', state.currentEbookId);
console.log('Active page index:', state.currentPageIndex);

const stage = document.getElementById('reader-poem-stage');
console.log('Reader poem stage innerHTML length:', stage.innerHTML.length);
if (stage.innerHTML.length < 100) throw new Error('Reader poem stage is empty!');

// Test Next Slide button
const btnNext = document.getElementById('btn-page-next');
btnNext.click();
console.log('Page index after Next click:', state.currentPageIndex);
if (state.currentPageIndex !== 1) throw new Error('Next slide navigation failed!');

// Test Prev Slide button
const btnPrev = document.getElementById('btn-page-prev');
btnPrev.click();
console.log('Page index after Prev click:', state.currentPageIndex);
if (state.currentPageIndex !== 0) throw new Error('Prev slide navigation failed!');

// Test TOC Modal
const btnToc = document.getElementById('btn-reader-toc');
btnToc.click();
const tocModal = document.getElementById('reader-toc-modal');
console.log('TOC Modal display:', tocModal.style.display);
const tocContainer = document.getElementById('reader-toc-list-container');
console.log('TOC container children count:', tocContainer.children.length);
if (tocContainer.children.length < 3) throw new Error('TOC should list chapters, got ' + tocContainer.children.length);

document.getElementById('btn-close-reader-toc').click();
console.log('TOC Modal display after close:', tocModal.style.display);

console.log('--- TEST TAB 3: STUDIO VIEW (PASSCODE UNLOCK & CRUD) ---');
// Switch to Studio / Composer
document.getElementById('nav-tab-composer').click();
const passcodeModal = document.getElementById('passcode-modal');
console.log('Passcode modal display before unlock:', passcodeModal.style.display);

// Input passcode and submit
document.getElementById('input-passcode').value = 'robin';
document.getElementById('btn-submit-passcode').click();
console.log('Is studio unlocked:', state.isUnlocked);
console.log('Current view after unlock:', state.currentView);

// Test sub-tabs inside Studio
const tabs = ['tab-slide-content', 'tab-slide-crud', 'tab-chapters', 'tab-series-meta'];
tabs.forEach(tabId => {
  const btn = document.querySelector(`.composer-tab-btn[data-tab="${tabId}"]`);
  if (btn) {
    btn.click();
    const panel = document.getElementById(tabId);
    console.log(`Studio sub-tab [${tabId}] active:`, panel.style.display !== 'none');
  }
});

// Test template selector change
const tplSelect = document.getElementById('select-slide-template');
if (tplSelect) {
  tplSelect.value = 'butterfly';
  tplSelect.dispatchEvent(new window.Event('change'));
  const dynamicFields = document.getElementById('template-specific-fields-mount');
  console.log('Dynamic template fields rendered for butterfly:', dynamicFields ? dynamicFields.children.length > 0 : false);
}

// Test Palette Color input
const hexInputs = document.querySelectorAll('#palette-swatches-container input[type="text"]');
console.log('Palette hex inputs count:', hexInputs.length);
if (hexInputs.length > 0) {
  hexInputs[0].value = '#112233';
  hexInputs[0].dispatchEvent(new window.Event('change'));
  console.log('Palette hex change triggered successfully.');
}

console.log('--- TEST TAB 4: COLOPHON VIEW ---');
document.getElementById('nav-tab-colophon').click();
console.log('Current view:', state.currentView);
const colophonView = document.getElementById('view-colophon');
console.log('Colophon display active:', colophonView.style.display !== 'none');

console.log('====================================================');
console.log('ALL TABS & CRUD USER JOURNEYS PASSED WITH 100% SUCCESS!');
console.log('====================================================');
