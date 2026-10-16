/**
 * ruangrobin — Modular Series: River & Departure (VOL. 02)
 */

const RIVER_DEPARTURE_SERIES = {
  id: 'seri-2',
  volNumber: 'VOL. 02',
  title: 'River & Departure',
  subtitle: 'currents, stone thresholds, and departures',
  editionDate: 'October 2026',
  colophon: 'A meditation on water, wood, and coastal grief. Printed exclusively in Michelangelus.',
  palette: ['#0d171d', '#58a6ff', '#8b949e', '#070b0e', '#ffffff'],
  coverTemplate: 'contour',
  coverImage: null,
  coverSettings: {
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    overlayTitle: true,
    coverTemplate: 'contour'
  },
  chapters: [
    {
      id: 'ch-river-01',
      title: 'Chapter I: The Estuary Tide',
      description: 'Where fresh water meets salt brine and ships prepare for night crossings.'
    },
    {
      id: 'ch-river-02',
      title: 'Chapter II: Wood on Water',
      description: 'The fragility of handmade vessels adrift upon the harbor.'
    }
  ],
  pages: [
    {
      id: 'p-contour-river',
      chapterId: 'ch-river-01',
      template: 'contour',
      title: 'The Architecture of the Maple',
      author: 'Bob Hicok & ruangrobin',
      spread: 50,
      body: `The Maple is a system of posture for {wood}.
A way of not falling down for twigs that happens to benefit birds.
I do not know. I am staring at a tree, at {yellow leaves}
threshed by wind and want you reading this to be staring at the same tree.
I could cut it down and laminate it or ask you to live with me
keeping an eye on the maple but I think your {real life}
would miss you. The story here is that all morning
I have thought of the statement that art is about **loneliness**
while watching golden leaves become unhinged.`,
      specificParams: {
        waveAmplitude: 30,
        marginBase: 15
      }
    },
    {
      id: 'p-letterpress-boat',
      chapterId: 'ch-river-02',
      template: 'letterpress',
      title: 'Lives of Raft',
      author: 'Rob Schlegel',
      spread: 45,
      body: `Seeding the shore, pale shells
wash up the beach.

And the dead open their eyes
stealing sight from {birds}.

When the ships go out to sea
their bellows kill the coastal air.

I touch my face with salt
and warm **flowers**.

On Grief's pier,
I brew tea beneath winter's robe.

With dried wood, I build a {raft}
to capsize alone in the harbor.`,
      specificParams: {
        pressEmblem: '❖',
        publicationYear: '2026'
      }
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RIVER_DEPARTURE_SERIES };
}
if (typeof window !== 'undefined') {
  window.RIVER_DEPARTURE_SERIES = RIVER_DEPARTURE_SERIES;
}
