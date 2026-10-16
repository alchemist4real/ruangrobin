/**
 * ruangrobin — Master Specimen Series
 * File: series/lorem-specimen.js
 * 
 * Title: The Architectural Specimen
 * Volume: SPECIMEN VOL. 00
 * 
 * A comprehensive master monograph containing 15 high-yield typographic slides,
 * each demonstrating one of the 15 Pure Typographic Spatial Templates across 3 chapters:
 * 
 * Chapter I:   Dispersion & Waves (Cascade, Constellation, Contour, Arc Stream, Topography)
 * Chapter II:  Structural Geometry (Cross, Helix, Vortex, Perspective, Butterfly)
 * Chapter III: Typographic Textures (Justified, Letterpress, Deconstruct, Stutter, Calligram)
 * 
 * Text Token Conventions:
 *  - Bold emphasis: **word or phrase** -> converted to <strong> or bold typeface
 *  - Accent color:  {word or phrase}   -> converted to accent color (e.g. ruangrobin Klein Blue)
 */

const LOREM_SPECIMEN_SERIES = {
  id: 'seri-lorem-specimen',
  volNumber: 'SPECIMEN VOL. 00',
  title: 'The Architectural Specimen',
  subtitle: 'A Monograph of Fifteen Typographic Geometries & Spatial Grammars',
  editionDate: 'October 2026',
  colophon: 'Composed in Michelangelus types at ruangrobin laboratory. Pure spatial typography without decorative illustration or arbitrary ornamentation. Hand-balanced dual-polarity WCAG contrast. Set for virtual 250gsm cotton rag monograph sheets. Bandung — Jakarta.',
  
  // Curated Palette: [paper, ink, accent, muted, sheet]
  palette: ['#faf6ee', '#111418', '#0018f0', '#71717a', '#ffffff'],
  
  coverImage: null,
  coverSettings: {
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    overlayTitle: true,
    coverTemplate: 'cascade'
  },

  chapters: [
    {
      id: 'ch-dispersion',
      title: 'Chapter I: Dispersion & Waves',
      description: 'Kinetic decay, gravitational fall, and trigonometric oscillations of language across the white page.'
    },
    {
      id: 'ch-geometry',
      title: 'Chapter II: Structural Geometry',
      description: 'Tectonic intersections, helical helices, and mathematical projections of language into three dimensions.'
    },
    {
      id: 'ch-textures',
      title: 'Chapter III: Typographic Textures',
      description: 'Micro-typographic rhythms, letterpress stanzas, phonetic matrices, and concrete shape silhouettes.'
    }
  ],

  pages: [
    // ========================================================
    // CHAPTER I: DISPERSION & WAVES (SLIDES 1 TO 5)
    // ========================================================

    // 1. CASCADE (Entropy Dispersion)
    {
      id: 'p-spec-cascade',
      chapterId: 'ch-dispersion',
      template: 'cascade',
      title: 'Entropy & the Dispersing Star',
      author: 'A. Harris & ruangrobin',
      spread: 60,
      body: `The **universe is structured**,
a poem scrawled in {drifting stars}.
Its lines arranged precisely,
stanzas galaxies apart.

It seems to have a **meter**
and patterns, much like rhyme.
But as it marches ever on
its {chaos} grows with time.

And sometimes **poems fall apart**
their order getting lost
to {entropy}
and what is
happening
**now**.`,
      specificParams: {
        openingStanzas: `The **universe is structured**,
a poem scrawled in {drifting stars}.
Its lines arranged precisely,
stanzas galaxies apart.

It seems to have a **meter**
and patterns, much like rhyme.
But as it marches ever on
its {chaos} grows with time.`,
        fractureLines: `And sometimes **poems fall apart**
their order getting lost`,
        decayLetters: `to {entropy} and what is happening **now**.`,
        driftVelocity: 1.25,
        dissolveThreshold: 2
      }
    },

    // 2. CONSTELLATION (Spatial Drift)
    {
      id: 'p-spec-constellation',
      chapterId: 'ch-dispersion',
      template: 'constellation',
      title: 'Spatial Drift Across the Cold Meridian',
      author: 'ruangrobin',
      spread: 55,
      body: `I will speak to you
of
**whole human beings** lost
in {mutual disguise}
the high starlight
the **irresistible pull** of gravity
The quiet encroachment of
{electric currents}
the sleeping city   the flame.`,
      specificParams: {
        verseLines: `I will speak to you
of
**whole human beings** lost
in {mutual disguise}
the high starlight
the **irresistible pull** of gravity
The quiet encroachment of
{electric currents}
the sleeping city   the flame.`,
        celestialTag: 'ORION MERIDIAN // 42° 18\' N',
        footerEpigraph: 'transmissions recorded across cold negative space',
        driftDistribution: 'celestial'
      }
    },

    // 3. CONTOUR (Organic Wave Flow)
    {
      id: 'p-spec-contour',
      chapterId: 'ch-dispersion',
      template: 'contour',
      title: 'The Architecture of the Maple',
      author: 'Bob Hicok & ruangrobin',
      spread: 50,
      body: `is a **system of posture** for wood.
A way of {not falling down}
for twigs that happens
to benefit the birds.
I am staring at a tree,
at {yellow leaves}
threshed by autumnal wind
and want you who read this
to stand before the **same quiet timber**.
We could carve our speech into its bark
and let the {sap of silence} seal our words.`,
      specificParams: {
        verseLines: `is a **system of posture** for wood.
A way of {not falling down}
for twigs that happens
to benefit the birds.
I am staring at a tree,
at {yellow leaves}
threshed by autumnal wind
and want you who read this
to stand before the **same quiet timber**.
We could carve our speech into its bark
and let the {sap of silence} seal our words.`,
        waveAmplitude: 35,
        marginBase: 20,
        waveFrequency: 1.0
      }
    },

    // 4. ARC STREAM (Sonic Radiodrama & Static Stream)
    {
      id: 'p-spec-arcstream',
      chapterId: 'ch-dispersion',
      template: 'arcstream',
      title: 'radiodramma (in)terazione',
      author: 'giovanni fontana & ruangrobin',
      spread: 50,
      body: `la **voce** si scompone nello spazio continuo,
interferenze {magnetiche} tra carne e frequenza.
il segnale viaggia lungo il cavo di rame,
perdendosi nel **brusio primordiale** del ricevitore a valvole.
corpi risonanti cercano {l'onda portante} nella notte.`,
      specificParams: {
        authorWord: 'giovanni fontana',
        mainCurveWord: 'radiodramma',
        subWord: '(in)terazione',
        staticStreamLetters: 'A v a ^ Y A v x V A i ^ A v a',
        stanzaBody: `la **voce** si scompone nello spazio continuo,
interferenze {magnetiche} tra carne e frequenza.
il segnale viaggia lungo il cavo di rame,
perdendosi nel **brusio primordiale** del ricevitore a valvole.
corpi risonanti cercano {l'onda portante} nella notte.`,
        footTag: 'geiger // mhz 104.2'
      }
    },

    // 5. TOPOGRAPHY (Terrain Ridge Wave)
    {
      id: 'p-spec-topography',
      chapterId: 'ch-dispersion',
      template: 'topography',
      title: 'A Methodology of Vision',
      author: 'ruangrobin',
      spread: 50,
      body: `THE **RIDGE RISES** THROUGH THE COLD MORNING MIST
ELEVATION THREE HUNDRED METERS ABOVE {ABSOLUTE SILENCE}
CONTOURS CARVED BY ANCIENT **GLACIAL COMPRESSION**
THE DESCENT INTO THE BASIN OF {FORGOTTEN RAINWATER}
TERRAIN MESH SURVEYED BY **PURE TYPOGRAPHY**
HORIZONTAL STRATUM NUMBER TWENTY-FOUR {SOUTHWEST}
THE GEOLOGY OF THE WORD RESTING ON {BEDROCK}`,
      specificParams: {
        ridgeLines: `THE **RIDGE RISES** THROUGH THE COLD MORNING MIST
ELEVATION THREE HUNDRED METERS ABOVE {ABSOLUTE SILENCE}
CONTOURS CARVED BY ANCIENT **GLACIAL COMPRESSION**
THE DESCENT INTO THE BASIN OF {FORGOTTEN RAINWATER}
TERRAIN MESH SURVEYED BY **PURE TYPOGRAPHY**
HORIZONTAL STRATUM NUMBER TWENTY-FOUR {SOUTHWEST}
THE GEOLOGY OF THE WORD RESTING ON {BEDROCK}`,
        flankOutlineWord: 'OF\nVISION',
        elevationStep: 36,
        crestHeight: 28,
        dipDepth: 16,
        elevationSubtitle: 'CONTOUR INTERVAL 50M // 3D ELEVATION MESH'
      }
    },

    // ========================================================
    // CHAPTER II: STRUCTURAL GEOMETRY (SLIDES 6 TO 10)
    // ========================================================

    // 6. DIAGONAL CROSS (Lattice Intersection)
    {
      id: 'p-spec-cross',
      chapterId: 'ch-geometry',
      template: 'cross',
      title: 'Traveled Wake & Meridian Cross',
      author: 'ruangrobin',
      spread: 50,
      body: `The **wake we leave behind us** carves the bay
moving relentlessly toward the {western horizon}
every departure leaves an incision in water
the boat cuts the mirror of the calm tide
Returning currents carry {shells and sand}
remnants of speech across **unmeasured millennia**
reaching the eastern shore where {we began}
**memory crosses** the vector of departure`,
      specificParams: {
        forwardDiagText: `The **wake we leave behind us** carves the bay
moving relentlessly toward the {western horizon}
every departure leaves an incision in water
the boat cuts the mirror of the calm tide`,
        backwardDiagText: `Returning currents carry {shells and sand}
remnants of speech across **unmeasured millennia**
reaching the eastern shore where {we began}
**memory crosses** the vector of departure`,
        forwardDiagLines: `The **wake we leave behind us** carves the bay
moving relentlessly toward the {western horizon}
every departure leaves an incision in water
the boat cuts the mirror of the calm tide`,
        backwardDiagLines: `Returning currents carry {shells and sand}
remnants of speech across **unmeasured millennia**
reaching the eastern shore where {we began}
**memory crosses** the vector of departure`,
        intersectionAngle: 24,
        intersectionPlaque: 'TRAVELED WAKE',
        centerFocalWord: 'TRAVELED WAKE'
      }
    },

    // 7. HELIX COIL (3D Cylindrical Spiral)
    {
      id: 'p-spec-helix',
      chapterId: 'ch-geometry',
      template: 'helix',
      title: 'Times Wither and Coil',
      author: 'ruangrobin',
      spread: 50,
      body: `**times wither and pass** like cold river water
turning through the {endless coil} of seasons
memory ascends the **virtual spiral staircase**
returning to where the {first spark} ignited
each revolution reveals another **hidden dimension**
language winding itself around the {central void}`,
      specificParams: {
        spiralLoopsText: `**times wither and pass** like cold river water
turning through the {endless coil} of seasons
memory ascends the **virtual spiral staircase**
returning to where the {first spark} ignited
each revolution reveals another **hidden dimension**
language winding itself around the {central void}`,
        loopCount: 6,
        cylinderDiameter: 420,
        helixAxisLabel: 'TEMPORAL STRAND // 360° REVOLUTION'
      }
    },

    // 8. VORTEX SPIRAL (Concentric Swirl)
    {
      id: 'p-spec-vortex',
      chapterId: 'ch-geometry',
      template: 'vortex',
      title: 'Blackberry Staggering Swirl',
      author: 'ruangrobin',
      spread: 50,
      body: `**blackberry staggering juice** dripping on warm limestone
expanding ripples across the {quiet pond}
centrifugal language pulling away from the **calm center**
outer circumference embracing the {vast nocturnal silence}
every eddy returns to the **unbroken source**`,
      specificParams: {
        ringsText: `**blackberry staggering juice** dripping on warm limestone
expanding ripples across the {quiet pond}
centrifugal language pulling away from the **calm center**
outer circumference embracing the {vast nocturnal silence}
every eddy returns to the **unbroken source**`,
        innerRadius: 45,
        outerRadius: 235,
        repetitionCount: 3,
        centerVoidLabel: 'THE QUIET EYE',
        rotationOffsetStep: 20
      }
    },

    // 9. PERSPECTIVE ECHO (Vanishing Depth)
    {
      id: 'p-spec-perspective',
      chapterId: 'ch-geometry',
      template: 'perspective',
      title: 'These Rooms Are Hollow',
      author: 'ruangrobin',
      spread: 50,
      body: `These **rooms are hollow.**
A suffocating {silence flakes}
off their walls **like snow,**
imagined as {beautiful}
but still a **cold wet landscape,**
endless of {solitude.}`,
      specificParams: {
        depthLines: `These **rooms are hollow.**
A suffocating {silence flakes}
off their walls **like snow,**
imagined as {beautiful}
but still a **cold wet landscape,**
endless of {solitude.}`,
        depthStep: 55,
        vanishingAngle: 28,
        opacityFloor: 0.25,
        planeCount: 6
      }
    },

    // 10. BUTTERFLY STEPS (Dual Wing Bilateral Symmetry)
    {
      id: 'p-spec-butterfly',
      chapterId: 'ch-geometry',
      template: 'butterfly',
      title: 'The Chuang Tzu Paradox',
      author: 'Chuang Tzu & ruangrobin',
      spread: 50,
      body: `Once upon a time I | unconscious of my {human individuality}
**dreamt I was a butterfly** | as a mortal waking in the dawn.
fluttering hither and thither | Suddenly I awoke and there I was,
conscious only of {my flight} | veritably **myself again** in the cold room.
as a butterfly | Now I do not know whether I was then
a man dreaming I was a {butterfly} | or whether I am now a **butterfly** dreaming I am a man.`,
      specificParams: {
        leftWingText: `Once upon a time I
**dreamt I was a butterfly**
fluttering hither and thither
conscious only of {my flight}
as a butterfly
a man dreaming I was a {butterfly}`,
        rightWingText: `unconscious of my {human individuality}
as a mortal waking in the dawn.
Suddenly I awoke and there I was,
veritably **myself again** in the cold room.
Now I do not know whether I was then
or whether I am now a **butterfly** dreaming I am a man.`,
        leftWing: `Once upon a time I
**dreamt I was a butterfly**
fluttering hither and thither
conscious only of {my flight}
as a butterfly
a man dreaming I was a {butterfly}`,
        rightWing: `unconscious of my {human individuality}
as a mortal waking in the dawn.
Suddenly I awoke and there I was,
veritably **myself again** in the cold room.
Now I do not know whether I was then
or whether I am now a **butterfly** dreaming I am a man.`,
        gutter: 8,
        spineMargin: 24,
        accentWords: 'butterfly, flight, myself, individuality',
        bottomColophon: 'LEPIDOPTERA // CHUANG TZU'
      }
    },

    // ========================================================
    // CHAPTER III: TYPOGRAPHIC TEXTURES (SLIDES 11 TO 15)
    // ========================================================

    // 11. JUSTIFIED FIELD (Airy Typographic Texture)
    {
      id: 'p-spec-justified',
      chapterId: 'ch-textures',
      template: 'justified',
      title: 'Oh, Hello There (A Letter to Earlier Self)',
      author: 'ruangrobin',
      spread: 40,
      body: `**oh, hello there** — my {little me}. how have you been? did you ever imagine our life would turn out this way? have your dreams come true yet? we are about to turn **twenty-four** soon. funny, isn't it? some of our ambitions are finally starting to take shape {faintly, slowly}, not exactly as we once pictured them under the childhood lamplight, but they are here, breathing on the page. and now, I am just learning to live our days with **gentleness and quiet discipline**, letting each word find its own natural measure.`,
      specificParams: {
        dropCap: 'O',
        proseBody: `**oh, hello there** — my {little me}. how have you been? did you ever imagine our life would turn out this way? have your dreams come true yet? we are about to turn **twenty-four** soon. funny, isn't it? some of our ambitions are finally starting to take shape {faintly, slowly}, not exactly as we once pictured them under the childhood lamplight, but they are here, breathing on the page. and now, I am just learning to live our days with **gentleness and quiet discipline**, letting each word find its own natural measure.`,
        preamble: 'A quiet letter composed across ten years of solitude.',
        interwordSpacing: 'airy',
        colophonNote: 'Monograph Plate 11 · Set in Michelangelus 11pt'
      }
    },

    // 12. LETTERPRESS (Classical Monograph Stanzas)
    {
      id: 'p-spec-letterpress',
      chapterId: 'ch-textures',
      template: 'letterpress',
      title: 'Lives of Raft',
      author: 'Rob Schlegel & ruangrobin',
      spread: 30,
      body: `Seeding the shore, **pale shells**
Wash up the beach

And the dead open their eyes
Stealing sight from {migratory birds}.

When the ships go out to sea
Their bellows kill the **coastal air**.

I touch my face with salt
And {warm wild flowers}.

On Grief's pier,
I brew tea beneath **winter's dark robe**.

With dried driftwood, I build a raft
To capsize alone in the {quiet harbor}.`,
      specificParams: {
        stanzas: `Seeding the shore, **pale shells**
Wash up the beach

And the dead open their eyes
Stealing sight from {migratory birds}.

When the ships go out to sea
Their bellows kill the **coastal air**.

I touch my face with salt
And {warm wild flowers}.

On Grief's pier,
I brew tea beneath **winter's dark robe**.

With dried driftwood, I build a raft
To capsize alone in the {quiet harbor}.`,
        pressEmblem: '*',
        publicationYear: '2026',
        stanzaAlignment: 'center'
      }
    },

    // 13. DECONSTRUCT (Diagonal Fracture)
    {
      id: 'p-spec-deconstruct',
      chapterId: 'ch-textures',
      template: 'deconstruct',
      title: 'Deconstruction of the Sentence',
      author: 'Jacques D. & ruangrobin',
      spread: 50,
      body: `every structure carries its **own silent ruin**
the syntax breaks before the {intended meaning}
we speak through the **fractures of the wall**
language slipping like water through {cold fingers}
silence is not empty of sound
it vibrates with what was **deliberately omitted**
the architecture collapses inward
leaving only the **cadence of the fall**`,
      specificParams: {
        fragmentLines: `every structure carries its **own silent ruin**
the syntax breaks before the {intended meaning}
we speak through the **fractures of the wall**
language slipping like water through {cold fingers}
silence is not empty of sound
it vibrates with what was **deliberately omitted**
the architecture collapses inward
leaving only the **cadence of the fall**`,
        rotationAngle: 12,
        sliceOffsets: '0, 35, 15, 60, 20, 85, 40',
        accentIndices: '1, 3, 5',
        staggerDepth: 35
      }
    },

    // 14. STUTTER MATRIX (Phonetic Echo Sound Poetry)
    {
      id: 'p-spec-stutter',
      chapterId: 'ch-textures',
      template: 'stutter',
      title: 'Phonetic Matrix & Staccato Pulse',
      author: 'ruangrobin',
      spread: 50,
      body: `the voice attempts **articulation**
between the cold teeth and the palate
a consonant catches on the {trembling tongue}
the vowel stretches like **copper wire**
speech becomes an {acoustic sculpture}
resonating in the concrete chamber`,
      specificParams: {
        leftPhoneticList: `o o o p a n e l s
a a a a a r c
e e e e e n s
I I I I I n n
s s s s s a n d
c c c o o o v e
w w w v i s h e s
t t t y t y t y
l a l a l a c l u d e s
r e c  r e c  "G o d"
A A A A A A A`,
        centerProse: `the voice attempts **articulation**
between the cold teeth and the palate
a consonant catches on the {trembling tongue}
the vowel stretches like **copper wire**
speech becomes an {acoustic sculpture}
resonating in the concrete chamber`,
        rightPhoneticList: `s! s!
h e
v v v
u p !
p p !
b b !
b b b
A A A A A
s s s s
1 1 1 1
d i n`,
        morseSeparator: '- - - j - - - j - - - - - -'
      }
    },

    // 15. CALLIGRAM (Shape Map Silhouette)
    {
      id: 'p-spec-calligram',
      chapterId: 'ch-textures',
      template: 'calligram',
      title: 'Places of Poetry: The Amphora Silhouette',
      author: 'Guillaume A. & ruangrobin',
      spread: 50,
      body: `          O
        VESSEL
      OF **MEMORY**
    CARVED IN STONE
  CONTAINING {CLEAR WATER}
    THE WAITING
      **AMPHORA**
        NECK
      EXPANDING
    INTO {SILENCE}
  THE WIDE VESSEL
    GROUNDED FIRM
      UPON **CLAY**`,
      specificParams: {
        shapeMapText: `          O
        VESSEL
      OF **MEMORY**
    CARVED IN STONE
  CONTAINING {CLEAR WATER}
    THE WAITING
      **AMPHORA**
        NECK
      EXPANDING
    INTO {SILENCE}
  THE WIDE VESSEL
    GROUNDED FIRM
      UPON **CLAY**`,
        silhouetteType: 'amphora',
        leftAnnotation: 'LAT 06° 54\' S // MERIDIAN W',
        rightColophon: 'CONCRETE MAP // PLACES OF POETRY',
        letterTracking: 0.14
      }
    }
  ]
};

// Universal module export (ESM + CommonJS + Browser Window)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LOREM_SPECIMEN_SERIES };
}
if (typeof window !== 'undefined') {
  window.LOREM_SPECIMEN_SERIES = LOREM_SPECIMEN_SERIES;
}
