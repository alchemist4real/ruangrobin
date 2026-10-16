/**
 * ruangrobin — Modular Template Specific Fields & Data Model Registry
 * 
 * Defines the formal architecture for all 15 Pure Typographic Spatial Templates,
 * the Series metadata schema, and helper token formatters.
 * 
 * Categories / Chapters:
 *  - Chapter I:   Dispersion & Waves (cascade, constellation, contour, arcstream, topography)
 *  - Chapter II:  Structural Geometry (cross, helix, vortex, perspective, butterfly)
 *  - Chapter III: Typographic Textures (justified, letterpress, deconstruct, stutter, calligram)
 */

// ========================================================
// 1. TYPOGRAPHIC TOKEN FORMATTERS
// ========================================================

/**
 * Parses markdown bold (**word**) and accent color ({word}) tokens into HTML markup.
 * @param {string} text - Raw input text containing tokens
 * @param {string} accentColor - Resolved accent hex or CSS var (e.g. 'var(--c-blue)')
 * @returns {string} - HTML string with <strong> and styled accent <span> tags
 */
function formatTypographyTokens(text, accentColor = 'var(--c-blue)') {
  if (!text) return '';
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Bold token: **phrase** -> <strong>phrase</strong>
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong class="rr-token-bold" style="font-weight: 700;">$1</strong>');

  // Accent token: {phrase} -> <span class="rr-token-accent" style="color: ...; font-weight: 700;">phrase</span>
  safe = safe.replace(/\{([^}]+)\}/g, `<span class="rr-token-accent" style="color: ${accentColor}; font-weight: 700;">$1</span>`);

  return safe;
}

/**
 * Strips formatting tokens to return clean plain text (useful for TTS, clipboard, or plain logs).
 * @param {string} text 
 * @returns {string}
 */
function stripTypographyTokens(text) {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\{([^}]+)\}/g, '$1');
}

// ========================================================
// 2. TEMPLATE SPECIFIC FIELD DEFINITIONS (15 TEMPLATES)
// ========================================================

const TEMPLATE_FIELD_DEFINITIONS = {
  // ----------------------------------------------------
  // CHAPTER I: DISPERSION & WAVES
  // ----------------------------------------------------
  cascade: {
    id: 'cascade',
    name: 'Cascade',
    subtitle: 'Entropy Dispersion',
    chapterCategory: 'dispersion',
    chapterName: 'Chapter I: Dispersion & Waves',
    description: 'Classical verse balance decaying downward into jagged drift lines and cosmic letter tracking.',
    referenceOrigin: 'After A. Harris (Image 5)',
    fields: [
      {
        key: 'stepOffset',
        label: 'Lateral Drift Step (px)',
        type: 'number',
        min: 10,
        max: 60,
        step: 2,
        help: 'Controls the lateral horizontal shift per step as entropy sets in.',
        defaultValue: 26
      },
      {
        key: 'trackingDecay',
        label: 'Letter Tracking Decay (em)',
        type: 'number',
        min: 0.05,
        max: 0.8,
        step: 0.05,
        help: 'Rate at which letter-spacing expands as text fractures into entropy.',
        defaultValue: 0.28
      },
      {
        key: 'dissolveThreshold',
        label: 'Fracture Line Threshold',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        help: 'Line index at which disciplined verse starts to disintegrate into drift and decay.',
        defaultValue: 4
      },
      {
        key: 'openingStanzas',
        label: 'Structured Stanzas',
        type: 'textarea',
        placeholder: 'The universe is structured,\na poem scrawled in stars.\nIts lines arranged precisely,\nstanzas galaxies apart.',
        help: 'The initial disciplined verses before spatial fracture begins. Separate stanzas with blank lines.',
        defaultValue: 'The universe is structured,\na poem scrawled in stars.\nIts lines arranged precisely,\nstanzas galaxies apart.'
      },
      {
        key: 'fractureLines',
        label: 'Fracturing Lines',
        type: 'textarea',
        placeholder: 'And sometimes poems fall apart\ntheir order getting lost',
        help: 'Verses where horizontal displacement begins to pull lines apart.',
        defaultValue: 'It seems to have a meter\nand patterns, much like rhyme.\nBut as it marches ever on\nits chaos grows with time.\n\nAnd sometimes poems fall apart\ntheir order getting lost'
      },
      {
        key: 'decayLetters',
        label: 'Terminal Dissolving Words',
        type: 'text',
        placeholder: 'to entropy and what is happening now.',
        help: 'Terminal words dispersed letter-by-letter with hyper-wide letter-spacing.',
        defaultValue: 'to entropy and what is happening now.'
      }
    ]
  },

  constellation: {
    id: 'constellation',
    name: 'Constellation',
    subtitle: 'Spatial Drift',
    chapterCategory: 'dispersion',
    chapterName: 'Chapter I: Dispersion & Waves',
    description: 'Sparse lyrical fragments suspended across 2D celestial coordinates with vast, breathing negative space.',
    referenceOrigin: 'Image 4',
    fields: [
      {
        key: 'verseLines',
        label: 'Celestial Verses',
        type: 'textarea',
        placeholder: 'I will tell you\nof\nwhole human beings lost\nmutual disguise\nthe high starlight',
        help: 'One lyrical thought per line. Each line maps to an asymmetrical spatial orbit.',
        defaultValue: 'I will tell you\nof\nwhole human beings lost\nmutual disguise\nthe high\nthe pull of irresistible love\nThe encroachment of\nElectric lights\nthe city   the flame.'
      },
      {
        key: 'celestialTag',
        label: 'Coordinate / Sector Tag',
        type: 'text',
        placeholder: 'CYGNUS MERIDIAN // 42°N',
        help: 'Top-right micro-label identifying the celestial coordinate sector.',
        defaultValue: 'CONSTELLATION MERIDIAN // 42°'
      },
      {
        key: 'footerEpigraph',
        label: 'Bottom Anchor Note',
        type: 'text',
        placeholder: 'transmissions across the cold dark vacuum',
        help: 'Lower-left micro-epigraph grounding the open field.',
        defaultValue: 'transmissions received across cold negative space'
      },
      {
        key: 'driftDistribution',
        label: 'Drift Geometry',
        type: 'select',
        options: ['celestial', 'asymmetric', 'zenith', 'diagonal'],
        help: 'Spatial arrangement pattern for verse coordinates.',
        defaultValue: 'celestial'
      }
    ]
  },

  contour: {
    id: 'contour',
    name: 'Contour',
    subtitle: 'Organic Wave Flow',
    chapterCategory: 'dispersion',
    chapterName: 'Chapter I: Dispersion & Waves',
    description: 'Verses indented along a sinusoidal envelope, echoing natural wood grains, rivers, and tree silhouettes.',
    referenceOrigin: 'Image 1 "The Maple" (Bob Hicok)',
    fields: [
      {
        key: 'verseLines',
        label: 'Contoured Verses',
        type: 'textarea',
        placeholder: 'is a system of posture for wood.\nA way of not falling down\nfor twigs that happens\nto benefit birds.',
        help: 'Poetic lines sculpted into an organic wave envelope. Enter one line per row.',
        defaultValue: 'is a system of posture for wood.\nA way of not falling down\nfor twigs that happens\nto benefit birds. I don\'t know.\nI\'m staring at a tree,\nat yellow leaves\nthreshed by wind and want you\nreading this to be staring\nat the same tree. I could\ncut it down and laminate it.'
      },
      {
        key: 'waveAmplitude',
        label: 'Wave Amplitude (%)',
        type: 'number',
        min: 10,
        max: 60,
        step: 5,
        help: 'Peak horizontal curvature of the sine-wave envelope.',
        defaultValue: 35
      },
      {
        key: 'marginBase',
        label: 'Left Margin Base (%)',
        type: 'number',
        min: 0,
        max: 40,
        step: 5,
        help: 'Base left indentation before wave modulation is applied.',
        defaultValue: 20
      },
      {
        key: 'waveFrequency',
        label: 'Wave Oscillation Frequency',
        type: 'number',
        min: 0.5,
        max: 2.5,
        step: 0.25,
        help: 'Number of sine cycles traversed down the page.',
        defaultValue: 1.0
      }
    ]
  },

  arcstream: {
    id: 'arcstream',
    name: 'Arc Stream',
    subtitle: 'Sonic Radiodrama & Static Stream',
    chapterCategory: 'dispersion',
    chapterName: 'Chapter I: Dispersion & Waves',
    description: 'Curved text sweeping over an SVG arc, accompanied by decaying radio static glyphs and a monologue core.',
    referenceOrigin: 'Giovanni Fontana (Image 1)',
    fields: [
      {
        key: 'authorWord',
        label: 'Author Callout',
        type: 'text',
        placeholder: 'giovanni fontana',
        help: 'Header callout rendered in crisp bold lowercase.',
        defaultValue: 'giovanni fontana'
      },
      {
        key: 'mainCurveWord',
        label: 'Main Arc Sweeping Word',
        type: 'text',
        placeholder: 'radiodramma',
        help: 'The primary bold term that curves along the dynamic SVG path.',
        defaultValue: 'radiodramma'
      },
      {
        key: 'subWord',
        label: 'Accent Counter-Word',
        type: 'text',
        placeholder: '(in)terazione',
        help: 'Accent-colored counter-offset word nested beneath the main arc.',
        defaultValue: '(in)terazione'
      },
      {
        key: 'staticStream',
        label: 'Radio Static Seed Glyphs',
        type: 'text',
        placeholder: 'A v a ^ Y A v x V A i ^',
        help: 'Phonetic seed glyphs cascading down the vertical static ribbon.',
        defaultValue: 'A v a ^ Y A v x V A i ^ A v a'
      },
      {
        key: 'stanzaBody',
        label: 'Monologue Body',
        type: 'textarea',
        placeholder: 'la voce si scompone nello spazio\ninterferenze tra carne e frequenza...',
        help: 'The core prose or radio drama verses rendered to the right of the static ribbon.',
        defaultValue: 'la voce si scompone nello spazio continuo,\ninterferenze magnetiche tra carne e frequenza.\nil segnale viaggia lungo il cavo di rame,\nperdendosi nel brusio del ricevitore a valvole.'
      },
      {
        key: 'footTag',
        label: 'Acoustic / Geiger Foot Tag',
        type: 'text',
        placeholder: 'geiger // mhz 104.2',
        help: 'Technical grounding tag anchored in the lower left corner.',
        defaultValue: 'geiger // mhz 104.2'
      }
    ]
  },

  topography: {
    id: 'topography',
    name: 'Topography',
    subtitle: 'Terrain Ridge Wave',
    chapterCategory: 'dispersion',
    chapterName: 'Chapter I: Dispersion & Waves',
    description: 'Parallel undulating topographic contour lines composed entirely of uppercase tracking text, flanked by vertical outline words.',
    referenceOrigin: 'Image 4 "A Methodology of Vision"',
    fields: [
      {
        key: 'ridgeLines',
        label: 'Topographic Ridge Lines',
        type: 'textarea',
        placeholder: 'THE RIDGE RISES THROUGH THE MORNING MIST\nELEVATION THREE HUNDRED METERS ABOVE SILENCE\nCONTOURS CARVED BY ANCIENT GLACIAL MOVEMENT',
        help: 'Lines of text traversing the sinusoidal topographic mountain ridges. All caps recommended.',
        defaultValue: 'THE RIDGE RISES THROUGH THE MORNING MIST\nELEVATION THREE HUNDRED METERS ABOVE SILENCE\nCONTOURS CARVED BY ANCIENT GLACIAL MOVEMENT\nTHE DESCENT INTO THE BASIN OF FORGOTTEN WATER\nTERRAIN MESH SURVEYED BY PURE TYPOGRAPHY\nSLOPE ANGLE TWENTY-FOUR DEGREES SOUTHWEST'
      },
      {
        key: 'flankOutlineWord',
        label: 'Flank Stacked Outline Words',
        type: 'textarea',
        placeholder: 'OF\nVISION',
        help: 'Stacked architectural outline words rendered vertically on the right flank.',
        defaultValue: 'OF\nVISION'
      },
      {
        key: 'elevationStep',
        label: 'Elevation Vertical Step (px)',
        type: 'number',
        min: 28,
        max: 60,
        step: 2,
        help: 'Vertical spacing between topographic contour lines (minimum 28px).',
        defaultValue: 36
      },
      {
        key: 'crestHeight',
        label: 'Ridge Crest Amplitude (px)',
        type: 'number',
        min: 12,
        max: 36,
        step: 2,
        help: 'Height of the sinusoidal mountain crest (clamped to prevent margin clipping).',
        defaultValue: 28
      },
      {
        key: 'dipDepth',
        label: 'Valley Dip Depth (px)',
        type: 'number',
        min: 8,
        max: 24,
        step: 2,
        help: 'Depth of the sinusoidal valley depressions (clamped).',
        defaultValue: 16
      },
      {
        key: 'elevationSubtitle',
        label: 'Elevation Subtitle',
        type: 'text',
        placeholder: 'CONTOUR INTERVAL 50M // 3D ELEVATION MESH',
        help: 'Cartographic micro-annotation beneath the main title.',
        defaultValue: 'CONTOUR INTERVAL 50M // 3D ELEVATION MESH'
      }
    ]
  },

  // ----------------------------------------------------
  // CHAPTER II: STRUCTURAL GEOMETRY
  // ----------------------------------------------------
  cross: {
    id: 'cross',
    name: 'Diagonal Cross',
    subtitle: 'Lattice Intersection (Traveled Wake)',
    chapterCategory: 'geometry',
    chapterName: 'Chapter II: Structural Geometry',
    description: 'Intersecting diagonal text rays forming an optical lattice across opposing angles, anchored by a central typographic plaque.',
    referenceOrigin: 'Image 4 "Traveled Wake"',
    fields: [
      {
        key: 'forwardDiagText',
        label: 'Forward Diagonal Rays (-Angle)',
        type: 'textarea',
        placeholder: 'TRAVELED THIS WAKE,\nACROSS A LOSS AT SEA\nWHAT AND DRIFTWOOD RAKE.\nCROSSING NAMESAKE.',
        help: 'Text lines tilting downwards forward along the primary diagonal axis. Each line forms a parallel ray in the optical lattice.',
        defaultValue: 'The **wake we leave behind us** carves the bay\nmoving relentlessly toward the {western horizon}\nevery departure leaves an incision in water\nthe boat cuts the mirror of the calm tide'
      },
      {
        key: 'backwardDiagText',
        label: 'Backward Diagonal Rays (+Angle)',
        type: 'textarea',
        placeholder: 'BEDDED INFERIOR LAKE.\nTO HOPE TO TAKE.\nTHE WORDS TO BE OUR PERIL\nOF BOUGH LOST FORLORN FORFEITS\nA WISHER\'S MAKE, ESCAPE,',
        help: 'Text lines tilting upwards backward intersecting the primary axis to form the diamond optical lattice.',
        defaultValue: 'Returning currents carry {shells and sand}\nremnants of speech across **unmeasured millennia**\nreaching the eastern shore where {we began}\n**memory crosses** the vector of departure'
      },
      {
        key: 'intersectionPlaque',
        label: 'Central Typographic Plaque',
        type: 'text',
        placeholder: 'TRAVELED WAKE',
        help: 'Central pure-typographic focal plaque anchored at the lattice intersection point.',
        defaultValue: 'TRAVELED WAKE'
      },
      {
        key: 'intersectionAngle',
        label: 'Diagonal Tilt Angle (Degrees)',
        type: 'number',
        min: 15,
        max: 35,
        step: 1,
        help: 'Tilt angle in degrees for the intersecting axes (standard 22°–26°).',
        defaultValue: 24
      }
    ]
  },

  helix: {
    id: 'helix',
    name: 'Helix Coil',
    subtitle: '3D Cylindrical Spiral',
    chapterCategory: 'geometry',
    chapterName: 'Chapter II: Structural Geometry',
    description: 'Continuous helical ribbon wrapping around an invisible 3D cylinder with alternating dashed rear and bold front curves.',
    referenceOrigin: 'Image 2',
    fields: [
      {
        key: 'spiralLoopsText',
        label: 'Helical Loop Verses',
        type: 'textarea',
        placeholder: 'times wither and pass like water\nturning through the coil of days\nmemory ascends the spiral staircase\nreturning to where light begins',
        help: 'Each line is mapped consecutively to one 3D helical loop rung.',
        defaultValue: 'times wither and pass like river water\nturning through the endless coil of seasons\nmemory ascends the virtual spiral staircase\nreturning to where the first spark ignited\neach revolution reveals another dimension\nlanguage winding itself around the central void'
      },
      {
        key: 'loopCount',
        label: 'Number of Helical Revolutions',
        type: 'number',
        min: 4,
        max: 8,
        step: 1,
        help: 'Total complete 3D revolutions down the cylinder height.',
        defaultValue: 6
      },
      {
        key: 'cylinderDiameter',
        label: 'Cylinder Diameter (px)',
        type: 'number',
        min: 250,
        max: 460,
        step: 20,
        help: 'Visual width of the cylindrical ribbon structure.',
        defaultValue: 420
      },
      {
        key: 'helixAxisLabel',
        label: 'Vertical Axis Label',
        type: 'text',
        placeholder: 'TEMPORAL AXIS 360°',
        help: 'Micro-tag denoting the spatial axis coordinates.',
        defaultValue: 'TEMPORAL AXIS // 360° REVOLUTION'
      }
    ]
  },

  vortex: {
    id: 'vortex',
    name: 'Vortex Spiral',
    subtitle: 'Concentric Swirl',
    chapterCategory: 'geometry',
    chapterName: 'Chapter II: Structural Geometry',
    description: 'Concentric circular typographic orbits radiating outwards from a central void with escalating scale and rotation.',
    referenceOrigin: 'Image 5 "Blackberry Staggering"',
    fields: [
      {
        key: 'ringsText',
        label: 'Concentric Ring Verses',
        type: 'textarea',
        placeholder: 'blackberry staggering juice\ndripping on the stone floor\nexpanding ripples across quiet pond\ncentrifugal language pulling away\nouter circumference embracing the page',
        help: 'One poetic phrase per concentric ring, ordered from innermost to outermost.',
        defaultValue: 'blackberry staggering juice\ndripping slowly on warm limestone\nexpanding ripples across the quiet pond\ncentrifugal language pulling away from the center\nouter circumference embracing the vast silence'
      },
      {
        key: 'innerRadius',
        label: 'Innermost Radius (px)',
        type: 'number',
        min: 42,
        max: 100,
        step: 5,
        help: 'Inner void boundary radius (clamped between 42px and 235px).',
        defaultValue: 45
      },
      {
        key: 'outerRadius',
        label: 'Outermost Radius (px)',
        type: 'number',
        min: 180,
        max: 235,
        step: 5,
        help: 'Outer perimeter boundary radius (clamped between 42px and 235px).',
        defaultValue: 235
      },
      {
        key: 'repetitionCount',
        label: 'Phrase Repetitions Per Ring',
        type: 'number',
        min: 1,
        max: 6,
        step: 1,
        help: 'Phrase repetitions around the circular perimeter, bounded gracefully by circumference 2*pi*r.',
        defaultValue: 3
      },
      {
        key: 'centerVoidLabel',
        label: 'Center Void Label',
        type: 'text',
        placeholder: 'THE EYE',
        help: 'Micro-tag resting in the calm center eye of the vortex.',
        defaultValue: 'THE QUIET EYE'
      },
      {
        key: 'rotationOffsetStep',
        label: 'Ring Rotational Offset (°)',
        type: 'number',
        min: 0,
        max: 45,
        step: 5,
        help: 'Rotational phase shift between consecutive concentric rings.',
        defaultValue: 20
      }
    ]
  },

  perspective: {
    id: 'perspective',
    name: 'Perspective Echo',
    subtitle: 'Vanishing Depth',
    chapterCategory: 'geometry',
    chapterName: 'Chapter II: Structural Geometry',
    description: '3D perspective projection receding into the distance with rotateY vanishing angles and fading spatial opacity.',
    referenceOrigin: 'Image 5 "These rooms are hollow"',
    fields: [
      {
        key: 'depthLines',
        label: 'Receding Depth Lines',
        type: 'textarea',
        placeholder: 'These rooms are hollow.\nA suffocating silence flakes\noff their walls like snow,\nimagined as beautiful\nbut still a cold wet landscape,\nendless of solitude.',
        help: 'Poetic verses repeated across 3D perspective depth planes vanishing into space. Supports **bold** and {accent}.',
        defaultValue: 'These rooms are hollow.\nA suffocating silence flakes\noff their walls like snow,\nimagined as beautiful\nbut still a cold wet landscape,\nendless of solitude.'
      },
      {
        key: 'depthStep',
        label: 'Depth Plane Step Offset (px)',
        type: 'number',
        min: 25,
        max: 100,
        step: 5,
        help: 'Horizontal and depth spatial offset between consecutive echoing planes.',
        defaultValue: 55
      },
      {
        key: 'vanishingAngle',
        label: 'Vanishing Tilt Angle (Degrees)',
        type: 'number',
        min: 15,
        max: 45,
        step: 1,
        help: 'Y-axis perspective rotation angle simulating vanishing corridor depth.',
        defaultValue: 28
      },
      {
        key: 'opacityFloor',
        label: 'Deepest Plane Opacity Floor',
        type: 'number',
        min: 0.25,
        max: 0.6,
        step: 0.05,
        help: 'Minimum opacity floor (>= 0.25) ensuring legibility and preventing vanishing into nothingness.',
        defaultValue: 0.25
      },
      {
        key: 'planeCount',
        label: 'Number of Echo Depth Planes',
        type: 'number',
        min: 3,
        max: 8,
        step: 1,
        help: 'Total repeated typographic depth planes echoing into the distance.',
        defaultValue: 6
      }
    ]
  },

  butterfly: {
    id: 'butterfly',
    name: 'Butterfly Steps',
    subtitle: 'Dual Wing Bilateral Symmetry',
    chapterCategory: 'geometry',
    chapterName: 'Chapter II: Structural Geometry',
    description: 'Bilateral symmetric columns stepping outward from a central spine, with accented words glowing in electric color.',
    referenceOrigin: 'Image 3 "Chuang Tzu Dream"',
    fields: [
      {
        key: 'leftWingText',
        label: 'Left Wing Verses (Right-Aligned)',
        type: 'textarea',
        placeholder: 'Once upon a time I\ndreamt I was a butterfly\nfluttering hither and thither\nconscious only of my happiness\nas a butterfly',
        help: 'Lines for the left wing, right-aligned towards the central spine axis.',
        defaultValue: 'Once upon a time I\n**dreamt I was a butterfly**\nfluttering hither and thither\nconscious only of {my flight}\nas a butterfly\na man dreaming I was a {butterfly}'
      },
      {
        key: 'rightWingText',
        label: 'Right Wing Verses (Left-Aligned)',
        type: 'textarea',
        placeholder: 'unconscious of my individuality\nas a human being.\nSuddenly I awoke and there I was,\nveritably myself again.\nNow I do not know',
        help: 'Lines for the right wing, left-aligned towards the outer margins.',
        defaultValue: 'unconscious of my {human individuality}\nas a mortal waking in the dawn.\nSuddenly I awoke and there I was,\nveritably **myself again** in the cold room.\nNow I do not know whether I was then\nor whether I am now a **butterfly** dreaming I am a man.'
      },
      {
        key: 'gutter',
        label: 'Central Spine Gutter Width (%)',
        type: 'number',
        min: 4,
        max: 16,
        step: 1,
        help: 'Spacing percentage between the bilateral wing columns (standard: 8%).',
        defaultValue: 8
      },
      {
        key: 'accentWords',
        label: 'Accent Keywords (Comma-Separated)',
        type: 'text',
        placeholder: 'butterfly, flight, myself, individuality',
        help: 'Words highlighted with the electric palette accent color.',
        defaultValue: 'butterfly, flight, myself, individuality'
      },
      {
        key: 'bottomColophon',
        label: 'Spine Axis Grounding Tag',
        type: 'text',
        placeholder: 'LEPIDOPTERA // CHUANG TZU',
        help: 'Bottom label grounding the central vertical symmetry axis.',
        defaultValue: 'LEPIDOPTERA // CHUANG TZU'
      }
    ]
  },

  // ----------------------------------------------------
  // CHAPTER III: TYPOGRAPHIC TEXTURES
  // ----------------------------------------------------
  justified: {
    id: 'justified',
    name: 'Justified Field',
    subtitle: 'Airy Typographic Texture',
    chapterCategory: 'textures',
    chapterName: 'Chapter III: Typographic Textures',
    description: 'Classical book prose block with expansive, breathing word-spacing and dynamic compaction.',
    referenceOrigin: 'Image 3 ("oh, hello there — my little me")',
    fields: [
      {
        key: 'proseBody',
        label: 'Justified Prose Block',
        type: 'textarea',
        placeholder: 'oh, hello there — my little me. how have you been? did you ever imagine your life would turn out this way? have your dreams come true yet? we are about to turn twenty-four soon. funny, isn\'t it? some of our dreams are finally starting to take shape faintly, slowly, not exactly as we once pictured them, but they\'re there. and now, I\'m just trying to live our life the best I can.',
        help: 'Prose text where every line stretches flush across the column with airy word gaps. Supports **bold** and {accent}.',
        defaultValue: 'oh, hello there — my little me. how have you been? did you ever imagine your life would turn out this way? have your dreams come true yet? we are about to turn twenty-four soon. funny, isn\'t it? some of our dreams are finally starting to take shape faintly, slowly, not exactly as we once pictured them, but they\'re there. and now, I\'m just trying to live our life the best I can.'
      },
      {
        key: 'wordSpacingCompaction',
        label: 'Word-Spacing Compaction (%)',
        type: 'number',
        min: 0,
        max: 100,
        step: 5,
        help: 'Compaction factor: 0% = maximum airy expanse, 100% = tight compact typesetting for dense text.',
        defaultValue: 20
      },
      {
        key: 'lineHeightScale',
        label: 'Line Height Scale',
        type: 'number',
        min: 1.2,
        max: 2.8,
        step: 0.1,
        help: 'Vertical leading multiplier for the justified prose block.',
        defaultValue: 2.0
      },
      {
        key: 'colophonNote',
        label: 'Colophon Citation',
        type: 'text',
        placeholder: 'Monograph Plate 03 · Set in Michelangelus 11pt',
        help: 'Micro editorial colophon at the foot of the measure.',
        defaultValue: 'Monograph Plate 03 · Set in Michelangelus 11pt'
      }
    ]
  },

  letterpress: {
    id: 'letterpress',
    name: 'Letterpress',
    subtitle: 'Classical Monograph Stanzas',
    chapterCategory: 'textures',
    chapterName: 'Chapter III: Typographic Textures',
    description: 'Timeless, centered monograph stanzas with dignified line height, press emblem, and year colophon.',
    referenceOrigin: 'Image 2 "Lives of Raft" (Rob Schlegel)',
    fields: [
      {
        key: 'stanzas',
        label: 'Poetic Stanzas',
        type: 'textarea',
        placeholder: 'Seeding the shore, pale shells\nWash up the beach\n\nAnd the dead open their eyes\nStealing sight from birds.\n\nWhen the ships go out to sea\nTheir bellows kill the coastal air.',
        help: 'Classical stanzas separated by blank lines. Deeply centered on the A4 page.',
        defaultValue: 'Seeding the shore, pale shells\nWash up the beach\n\nAnd the dead open their eyes\nStealing sight from birds.\n\nWhen the ships go out to sea\nTheir bellows kill the coastal air.\n\nI touch my face with salt\nAnd warm flowers.\n\nOn Grief\'s pier,\nI brew tea beneath winter\'s robe.\n\nWith dried wood, I build a raft\nTo capsize alone in the harbor.'
      },
      {
        key: 'printersMark',
        label: "Printer's Mark / Vignette",
        type: 'text',
        placeholder: '*',
        help: "Typographic printer's mark or pure typographic ornament (e.g., *, §, · · ·, ❖).",
        defaultValue: '*'
      },
      {
        key: 'stanzaSpacing',
        label: 'Stanza Spacing (rem)',
        type: 'number',
        min: 0.5,
        max: 2.5,
        step: 0.25,
        help: 'Vertical gap between consecutive stanzas.',
        defaultValue: 1.5
      },
      {
        key: 'publicationYear',
        label: 'Publication Year',
        type: 'text',
        placeholder: '2026',
        help: 'Colophon year stamped beneath the author line.',
        defaultValue: '2026'
      },
      {
        key: 'stanzaAlignment',
        label: 'Stanza Alignment',
        type: 'select',
        options: ['center', 'left', 'indented'],
        help: 'Alignment of the stanza verses within the letterpress frame.',
        defaultValue: 'center'
      }
    ]
  },

  deconstruct: {
    id: 'deconstruct',
    name: 'Deconstruct',
    subtitle: 'Diagonal Fracture',
    chapterCategory: 'textures',
    chapterName: 'Chapter III: Typographic Textures',
    description: 'Word-only kinetic typography with diagonal fracture, lateral slice offsets, and overprinting lines, strictly bounded by AABB physics (±18° max).',
    referenceOrigin: 'Specimen 2 "Diagonal Fracture (red on my hands)"',
    fields: [
      {
        key: 'fragmentLines',
        label: 'Fragmented Verses',
        type: 'textarea',
        placeholder: 'every structure carries its **own silent ruin**\nthe syntax breaks before the {intended meaning}\nwe speak through the **fractures of the wall**\nlanguage slipping through cold fingers\nsilence is not empty\nit vibrates with what was omitted\nthe architecture collapses inward\nleaving only the **cadence of the fall**',
        help: 'Lines subjected to alternating angular rotation (restricted to ±18° max). Supports **bold** and {accent} tokens.',
        defaultValue: 'every structure carries its **own silent ruin**\nthe syntax breaks before the {intended meaning}\nwe speak through the **fractures of the wall**\nlanguage slipping like water through {cold fingers}\nsilence is not empty of sound\nit vibrates with what was **deliberately omitted**\nthe architecture collapses inward\nleaving only the **cadence of the fall**'
      },
      {
        key: 'rotationAngle',
        label: 'Max Rotation Angle (±18°)',
        type: 'number',
        min: 4,
        max: 18,
        step: 1,
        help: 'Maximum degree of angular tilt clamped within safe AABB bounds (±18° max) to prevent corner clipping.',
        defaultValue: 12
      },
      {
        key: 'sliceOffsets',
        label: 'Lateral Slice Offsets (px)',
        type: 'text',
        placeholder: '0, 35, 15, 60, 20, 85, 40',
        help: 'Comma-separated lateral displacement offsets for each fractured typographic line.',
        defaultValue: '0, 35, 15, 60, 20, 85, 40'
      },
      {
        key: 'accentIndices',
        label: 'Accent Line Numbers (0-indexed)',
        type: 'text',
        placeholder: '1, 3, 5',
        help: 'Comma-separated line indices that receive electric series accent color and bold weight.',
        defaultValue: '1, 3, 5'
      },
      {
        key: 'staggerDepth',
        label: 'Procedural Stagger Depth (%)',
        type: 'number',
        min: 10,
        max: 60,
        step: 5,
        help: 'Fallback lateral displacement scale when explicit sliceOffsets are omitted.',
        defaultValue: 35
      }
    ]
  },

  stutter: {
    id: 'stutter',
    name: 'Stutter Matrix',
    subtitle: 'Phonetic Echo Sound Matrix',
    chapterCategory: 'textures',
    chapterName: 'Chapter III: Typographic Textures',
    description: 'Tripartite sound poetry: left phonetic stutter murmurs, center semantic poem with Morse dividers, right explosive staccato consonants.',
    referenceOrigin: 'Image 3',
    fields: [
      {
        key: 'leftPhoneticList',
        label: 'Left Flank Phonetic Murmurs',
        type: 'textarea',
        placeholder: 'o o o p a n e l s\na a a a a r c\ne e e e e n s\nI I I I I n n\ns s s s s a n d\nc c c o o o v e\nw w w v i s h e s',
        help: 'Repetitive rhythmic phonetic murmur lines descending the left flank.',
        defaultValue: 'o o o p a n e l s\na a a a a r c\ne e e e e n s\nI I I I I n n\ns s s s s a n d\nc c c o o o v e\nw w w v i s h e s\nt t t y t y t y\nl a l a l a c l u d e s\nr e c  r e c  "G o d"\nA A A A A A A'
      },
      {
        key: 'centerProse',
        label: 'Center Core Semantic Verses',
        type: 'textarea',
        placeholder: 'the voice attempts articulation\nbetween the teeth and the palate\na consonant catches on the tongue\nthe vowel stretches like wire\nspeech becomes an acoustic object',
        help: 'Semantic verses in the central column, punctuated by Morse-code dividers.',
        defaultValue: 'the voice attempts articulation\nbetween the teeth and the palate\na consonant catches on the tongue\nthe vowel stretches like copper wire\nspeech becomes an acoustic object\nresonating in the concrete chamber'
      },
      {
        key: 'rightPhoneticList',
        label: 'Right Flank Staccato Consonants',
        type: 'textarea',
        placeholder: 's! s!\nh e\nv v v\nu p !\np p !\nb b !\nb b b\nA A A A A\ns s s s',
        help: 'Sharp staccato monosyllables and punctuated bursts descending the right flank.',
        defaultValue: 's! s!\nh e\nv v v\nu p !\np p !\nb b !\nb b b\nA A A A A\ns s s s\n1 1 1 1\nd i n'
      },
      {
        key: 'morseSeparator',
        label: 'Morse Code Divider',
        type: 'text',
        placeholder: '- - - j - - - j - - - - - -',
        help: 'Divider pattern inserted between pairs of central verses.',
        defaultValue: '- - - j - - - j - - - - - -'
      }
    ]
  },

  calligram: {
    id: 'calligram',
    name: 'Calligram',
    subtitle: 'Shape Map Silhouette',
    chapterCategory: 'textures',
    chapterName: 'Chapter III: Typographic Textures',
    description: 'Concrete typographic map where line lengths and tracking sculpt a geometric silhouette, flanked by cartographic coordinates.',
    referenceOrigin: 'Image 1 "Places of Poetry"',
    fields: [
      {
        key: 'shapeMapText',
        label: 'Sculpted Silhouette Lines',
        type: 'textarea',
        placeholder: '          O\n        VESSEL\n      OF MEMORY\n    CARVED IN STONE\n  CONTAINING WATER\n    THE WAITING\n      AMPHORA\n        NECK\n      EXPANDING\n    INTO SILENCE',
        help: 'Lines shaped so their character counts and spacing trace an architectural silhouette.',
        defaultValue: '          O\n        VESSEL\n      OF MEMORY\n    CARVED IN STONE\n  CONTAINING WATER\n    THE WAITING\n      AMPHORA\n        NECK\n      EXPANDING\n    INTO SILENCE\n  THE WIDE VESSEL\n    GROUNDED FIRM\n      UPON CLAY'
      },
      {
        key: 'silhouetteType',
        label: 'Contour Target Type',
        type: 'select',
        options: ['amphora', 'hourglass', 'mountain', 'diamond', 'column'],
        help: 'The architectural or geographic contour form being traced.',
        defaultValue: 'amphora'
      },
      {
        key: 'leftAnnotation',
        label: 'Left Flank Latitude / Tag',
        type: 'text',
        placeholder: 'LAT 06° 54\' S // MERIDIAN W',
        help: 'Cartographic coordinates on the left margin.',
        defaultValue: 'LAT 06° 54\' S // MERIDIAN W'
      },
      {
        key: 'rightColophon',
        label: 'Right Flank Cartographic Note',
        type: 'text',
        placeholder: 'CONCRETE MAP // PLACES OF POETRY',
        help: 'Typographic or cartographic note on the right margin.',
        defaultValue: 'CONCRETE MAP // PLACES OF POETRY'
      },
      {
        key: 'letterTracking',
        label: 'Character Tracking (em)',
        type: 'number',
        min: 0.05,
        max: 0.35,
        step: 0.02,
        help: 'Wide letter-spacing applied to sculpt the silhouette lines cleanly.',
        defaultValue: 0.14
      }
    ]
  }
};

// ========================================================
// 3. SCHEMA SPECIFICATIONS
// ========================================================

/**
 * Standard Series Specification Schema
 */
const SERIES_SCHEMA = {
  id: 'string (unique slug, e.g. "seri-lorem-specimen")',
  title: 'string (main monograph title, e.g. "Specimen & Syntagma")',
  subtitle: 'string (detailed descriptive subtitle)',
  volNumber: 'string (e.g. "VOL. 01" or "SPECIMEN VOL. 00")',
  editionDate: 'string (e.g. "October 2026")',
  colophon: 'string (press, typography, paper, and location metadata)',
  palette: 'array of 2 to 5 hex colors [paper, ink, accent, secondary, tertiary]',
  coverImage: 'base64 string if photo uploaded, or null',
  coverSettings: {
    zoom: 'number (e.g. 1.0)',
    offsetX: 'number (px offset, e.g. 0)',
    offsetY: 'number (px offset, e.g. 0)',
    overlayTitle: 'boolean (render title over cover motif)',
    coverTemplate: 'string (one of the 15 template identifiers)'
  },
  chapters: [
    {
      id: 'string (unique chapter id, e.g. "ch-dispersion")',
      title: 'string (e.g. "Chapter I: Dispersion & Waves")',
      description: 'string (brief aesthetic / thematic summary)'
    }
  ],
  pages: [
    {
      id: 'string (unique slide id, e.g. "p-spec-cascade")',
      chapterId: 'string (refers to chapters[i].id)',
      title: 'string (slide / poem title)',
      author: 'string (creator / poet)',
      template: 'string (one of the 15 templates)',
      body: 'string (master formatted text containing **bold** and {accent} tokens)',
      spread: 'number (spatial dispersion factor, 10 to 100)',
      specificParams: 'object (dedicated template fields matching TEMPLATE_FIELD_DEFINITIONS[template].fields)'
    }
  ]
};

/**
 * Helper to get default specificParams for any template
 * @param {string} templateId 
 * @returns {object}
 */
function getDefaultSpecificParams(templateId) {
  const def = TEMPLATE_FIELD_DEFINITIONS[templateId];
  if (!def) return {};
  const params = {};
  def.fields.forEach(f => {
    params[f.key] = f.defaultValue;
  });
  return params;
}

// Universal module export (ESM + CommonJS + Browser Window)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEMPLATE_FIELD_DEFINITIONS,
    SERIES_SCHEMA,
    formatTypographyTokens,
    stripTypographyTokens,
    getDefaultSpecificParams
  };
}
if (typeof window !== 'undefined') {
  window.TEMPLATE_FIELD_DEFINITIONS = TEMPLATE_FIELD_DEFINITIONS;
  window.SERIES_SCHEMA = SERIES_SCHEMA;
  window.formatTypographyTokens = formatTypographyTokens;
  window.stripTypographyTokens = stripTypographyTokens;
  window.getDefaultSpecificParams = getDefaultSpecificParams;
}
