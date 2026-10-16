/**
 * ruangrobin — Modular Series: Entropy & Cosmos (VOL. 01)
 */

const ENTROPY_COSMOS_SERIES = {
  id: 'seri-1',
  volNumber: 'VOL. 01',
  title: 'Entropy & Cosmos',
  subtitle: 'studies in order, fracture, and drifting starlight',
  editionDate: 'October 2026',
  colophon: 'Typeset exclusively in Michelangelus on archival cream paper. ruangrobin editions.',
  palette: ['#faf6ee', '#111418', '#0018f0', '#666a73', '#ffffff'],
  coverTemplate: 'cascade',
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
      id: 'ch-entropy-01',
      title: 'Chapter I: The Dispersal of Order',
      description: 'Physical and linguistic decay under thermodynamic time.'
    },
    {
      id: 'ch-entropy-02',
      title: 'Chapter II: Cold Meridians',
      description: 'Spatial drift and silent celestial fields.'
    }
  ],
  pages: [
    {
      id: 'p-entropy',
      chapterId: 'ch-entropy-01',
      template: 'cascade',
      title: 'Entropy',
      author: 'A. Harris',
      spread: 60,
      body: `The universe is **structured**,
a poem scrawled in {stars}.
Its lines arranged precisely,
stanzas galaxies apart.

It seems to have a meter
and patterns, much like rhyme.
But as it marches ever on
its {chaos} grows with time.

And sometimes poems fall apart
their order getting lost
to **entropy**
and what is
happening
now.`,
      specificParams: {
        decayLetters: 'e n t r o p y   h a p p e n i n g',
        driftVelocity: 1.2
      }
    },
    {
      id: 'p-constellation-sky',
      chapterId: 'ch-entropy-02',
      template: 'constellation',
      title: 'Spatial Drift',
      author: 'ruangrobin',
      spread: 55,
      body: `I will tell you
of
whole
**human beings** lost
mutual
disguise
the high
the pull of   {irresistible love}
The encroachment of
Electric lights
the city   the {flame}.`,
      specificParams: {
        celestialTag: 'MERIDIAN 12 // VEGA SECTOR',
        footerEpigraph: 'observed at midnight'
      }
    },
    {
      id: 'p-airy-field',
      chapterId: 'ch-entropy-02',
      template: 'justified',
      title: 'Oh, Hello There',
      author: 'ruangrobin',
      spread: 40,
      body: `oh, hello there — my little me. how have you been? did you ever imagine your life would turn out this way? have your {dreams} come true yet? we are about to turn twenty-four soon. funny, isn't it? some of our **dreams** are finally starting to take shape faintly, slowly, not exactly as we once pictured them, but they're there. and now, I'm just trying to live our life the best I can.`,
      specificParams: {
        dropCap: 'O',
        preamble: 'A letter across twenty-four years of memory'
      }
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ENTROPY_COSMOS_SERIES };
}
if (typeof window !== 'undefined') {
  window.ENTROPY_COSMOS_SERIES = ENTROPY_COSMOS_SERIES;
}
