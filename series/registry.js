/**
 * ruangrobin — Modular Series Registry & Data Storage Engine
 * 
 * Manages all book editions/series without hardcoding.
 * Supports complete CRUD for Series, Slides, Chapters, and Base64 Cover Artwork.
 */

const STORAGE_KEY_SERIES = 'ruangrobin_series_modular_v15';

// Optional Node.js CommonJS imports for testing/tooling
let nodeLoremSpecimen, nodeEntropyCosmos, nodeRiverDeparture;
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  try {
    nodeLoremSpecimen = require('./lorem-specimen.js').LOREM_SPECIMEN_SERIES;
    nodeEntropyCosmos = require('./entropy-cosmos.js').ENTROPY_COSMOS_SERIES;
    nodeRiverDeparture = require('./river-departure.js').RIVER_DEPARTURE_SERIES;
  } catch (e) {}
}

class SeriesRegistry {
  constructor() {
    this.seriesList = [];
    this.init();
  }

  /**
   * Initializes registry from LocalStorage or default bundled series modules.
   */
  init() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SERIES);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.seriesList = parsed;
            return;
          }
        }
      } catch (e) {
        console.warn('SeriesRegistry: failed reading localStorage, fallback to defaults', e);
      }
    }
    this.resetToDefaults();
  }

  /**
   * Resets registry to default modular series.
   */
  resetToDefaults() {
    this.seriesList = [];

    // 1. The Comprehensive 15-Template Specimen Series
    const lorem = (typeof LOREM_SPECIMEN_SERIES !== 'undefined') ? LOREM_SPECIMEN_SERIES :
                  (typeof window !== 'undefined' && window.LOREM_SPECIMEN_SERIES) ? window.LOREM_SPECIMEN_SERIES :
                  nodeLoremSpecimen;
    if (lorem) {
      this.seriesList.push(JSON.parse(JSON.stringify(lorem)));
    }

    // 2. Entropy & Cosmos
    const entropy = (typeof ENTROPY_COSMOS_SERIES !== 'undefined') ? ENTROPY_COSMOS_SERIES :
                    (typeof window !== 'undefined' && window.ENTROPY_COSMOS_SERIES) ? window.ENTROPY_COSMOS_SERIES :
                    nodeEntropyCosmos;
    if (entropy) {
      this.seriesList.push(JSON.parse(JSON.stringify(entropy)));
    }

    // 3. River & Departure
    const river = (typeof RIVER_DEPARTURE_SERIES !== 'undefined') ? RIVER_DEPARTURE_SERIES :
                  (typeof window !== 'undefined' && window.RIVER_DEPARTURE_SERIES) ? window.RIVER_DEPARTURE_SERIES :
                  nodeRiverDeparture;
    if (river) {
      this.seriesList.push(JSON.parse(JSON.stringify(river)));
    }

    this.persist();
  }

  /**
   * Persists active series list to LocalStorage.
   */
  persist() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SERIES, JSON.stringify(this.seriesList));
      } catch (e) {
        console.error('SeriesRegistry: persistence error', e);
      }
    }
  }

  // ========================================================
  // SERIES CRUD
  // ========================================================

  getAll() {
    return this.seriesList;
  }

  getById(id) {
    return this.seriesList.find(s => s.id === id) || null;
  }

  createSeries(data) {
    const newId = 'seri-' + Date.now();
    const newSeries = {
      id: newId,
      volNumber: data.volNumber || `VOL. ${String(this.seriesList.length + 1).padStart(2, '0')}`,
      title: data.title || 'Untitled Edition',
      subtitle: data.subtitle || 'notes on pure spatial typography',
      editionDate: data.editionDate || 'October 2026',
      colophon: data.colophon || 'Typeset exclusively in Michelangelus.',
      palette: data.palette || ['#faf6ee', '#111418', '#0018f0', '#666a73', '#ffffff'],
      coverTemplate: data.coverTemplate || 'cascade',
      coverImage: data.coverImage || null,
      coverSettings: data.coverSettings || {
        zoom: 1.0,
        offsetX: 0,
        offsetY: 0,
        overlayTitle: true,
        coverTemplate: data.coverTemplate || 'cascade'
      },
      chapters: data.chapters || [
        {
          id: 'ch-' + Date.now() + '-1',
          title: 'Chapter I: Inception',
          description: 'First movements and verses.'
        }
      ],
      pages: data.pages || []
    };

    this.seriesList.push(newSeries);
    this.persist();
    return newSeries;
  }

  updateSeries(id, patch) {
    const idx = this.seriesList.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.seriesList[idx] = { ...this.seriesList[idx], ...patch };
    this.persist();
    return this.seriesList[idx];
  }

  deleteSeries(id) {
    const prevLen = this.seriesList.length;
    this.seriesList = this.seriesList.filter(s => s.id !== id);
    if (this.seriesList.length === 0) {
      this.resetToDefaults();
    } else {
      this.persist();
    }
    return this.seriesList.length < prevLen;
  }

  // ========================================================
  // COVER PHOTO & ARTWORK
  // ========================================================

  updateCoverPhoto(seriesId, base64Image, settings = {}) {
    const series = this.getById(seriesId);
    if (!series) return false;
    series.coverImage = base64Image;
    series.coverSettings = {
      ...(series.coverSettings || {}),
      ...settings
    };
    this.persist();
    return true;
  }

  removeCoverPhoto(seriesId) {
    const series = this.getById(seriesId);
    if (!series) return false;
    series.coverImage = null;
    this.persist();
    return true;
  }

  // ========================================================
  // CHAPTER (BAB) MANAGEMENT
  // ========================================================

  addChapter(seriesId, title, description = '') {
    const series = this.getById(seriesId);
    if (!series) return null;
    if (!series.chapters) series.chapters = [];
    const newChap = {
      id: 'ch-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: title || `Chapter ${series.chapters.length + 1}`,
      description: description || ''
    };
    series.chapters.push(newChap);
    this.persist();
    return newChap;
  }

  updateChapter(seriesId, chapterId, title, description) {
    const series = this.getById(seriesId);
    if (!series || !series.chapters) return false;
    const chap = series.chapters.find(c => c.id === chapterId);
    if (!chap) return false;
    if (title !== undefined) chap.title = title;
    if (description !== undefined) chap.description = description;
    this.persist();
    return true;
  }

  deleteChapter(seriesId, chapterId) {
    const series = this.getById(seriesId);
    if (!series || !series.chapters) return false;
    series.chapters = series.chapters.filter(c => c.id !== chapterId);
    // Unassign deleted chapter from pages
    if (series.pages) {
      series.pages.forEach(p => {
        if (p.chapterId === chapterId) p.chapterId = null;
      });
    }
    this.persist();
    return true;
  }

  // ========================================================
  // SLIDE / PAGE CRUD & REORDERING
  // ========================================================

  addSlide(seriesId, slideData) {
    const series = this.getById(seriesId);
    if (!series) return null;
    if (!series.pages) series.pages = [];

    const newSlide = {
      id: 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      chapterId: slideData.chapterId || (series.chapters && series.chapters[0] ? series.chapters[0].id : null),
      template: slideData.template || 'cascade',
      title: slideData.title || 'Untitled',
      author: slideData.author || 'ruangrobin',
      spread: typeof slideData.spread === 'number' ? slideData.spread : 50,
      body: slideData.body || '',
      specificParams: slideData.specificParams || {}
    };

    series.pages.push(newSlide);
    this.persist();
    return newSlide;
  }

  updateSlide(seriesId, slideId, updatedFields) {
    const series = this.getById(seriesId);
    if (!series || !series.pages) return null;
    const idx = series.pages.findIndex(p => p.id === slideId);
    if (idx === -1) return null;

    series.pages[idx] = {
      ...series.pages[idx],
      ...updatedFields,
      specificParams: {
        ...(series.pages[idx].specificParams || {}),
        ...(updatedFields.specificParams || {})
      }
    };

    this.persist();
    return series.pages[idx];
  }

  deleteSlide(seriesId, slideId) {
    const series = this.getById(seriesId);
    if (!series || !series.pages) return false;
    const prevLen = series.pages.length;
    series.pages = series.pages.filter(p => p.id !== slideId);
    this.persist();
    return series.pages.length < prevLen;
  }

  reorderSlide(seriesId, fromIndex, toIndex) {
    const series = this.getById(seriesId);
    if (!series || !series.pages) return false;
    if (fromIndex < 0 || fromIndex >= series.pages.length) return false;
    if (toIndex < 0 || toIndex >= series.pages.length) return false;

    const [moved] = series.pages.splice(fromIndex, 1);
    series.pages.splice(toIndex, 0, moved);
    this.persist();
    return true;
  }

  // ========================================================
  // JSON IMPORT / EXPORT
  // ========================================================

  exportSeriesJson(seriesId) {
    const series = this.getById(seriesId);
    if (!series) return null;
    return JSON.stringify(series, null, 2);
  }

  importSeriesJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.title || !Array.isArray(parsed.pages)) {
        throw new Error('Invalid series format: missing title or pages array.');
      }
      parsed.id = 'seri-imported-' + Date.now();
      this.seriesList.push(parsed);
      this.persist();
      return parsed;
    } catch (e) {
      console.error('Import failed', e);
      return null;
    }
  }
}

// Global Singleton Instance
const seriesRegistry = new SeriesRegistry();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SeriesRegistry, seriesRegistry };
}
if (typeof window !== 'undefined') {
  window.SeriesRegistry = SeriesRegistry;
  window.seriesRegistry = seriesRegistry;
}
