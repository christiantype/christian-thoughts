/* ────────────────────────────────────────────────────────────────────────────
   The Portrait as Contract — the structure of this study.

   The WORDS live in the .txt file next to this one. This file holds the
   layout, the ten assignments, the photographs and the counted things.

   Edit the words between the ` ` marks, save, refresh the page.

   The marks are backticks (the key above Tab), not quotation marks — which
   means your text CAN run over several lines and can contain ' and " freely.
   Keep the commas between items in a list.

   A little markup is allowed inside the text:
     <em>…</em> italic   <strong>…</strong> bold   <cite>…</cite> a title
     <a class="u" href="/somewhere">words</a> a link
   ──────────────────────────────────────────────────────────────────────────── */

  const LAB = {
    layout: {
      position:   { start: 1, span: 7 },
      showcase:   { start: 1, span: 12 },
      research:   { start: 1, span: 7 },
      references: { start: 1, span: 7 }
    },
    headerImage: `/workshops/bgsu/lab/images/portrait/encounter-05.webp`,
    title: `Image`,
    fullTitle: `The Portrait as Contract`,
    medium: `Portraiture, assignments, photographs`,
    author: `OP/AL`,
    active: `2026–present`,
    ongoing: true,

    question: `What do we owe the person we photograph?`,
    provocation: `A photograph is usually described as something one person takes from another. Every serious account of the medium says the opposite — that the picture is the residue of an encounter, and the encounter is the work. The question is not what you captured. It is what you entered into, and what it obliges you to.`,

    /* ── What the course is reading ─────────────────────────────────────────
       Four plates in the margin of the write-up, each credited. Drop the files
       in at the paths below and they appear; until then each plate says what
       is missing rather than breaking. */
    researchRefs: [
      { src: `/workshops/bgsu/lab/images/portrait/ref-sander.webp`,
        alt: `August Sander, Young Farmers, Westerwald, 1914`,
        caption: `August Sander, <cite>Young Farmers</cite>, Westerwald, 1914. From <cite>People of the Twentieth Century</cite> &mdash; people set down as types, named by trade rather than by name. Two of the three worked in an iron-ore mine.` },
      { src: `/workshops/bgsu/lab/images/portrait/ref-dicorcia.webp`,
        alt: `Philip-Lorca diCorcia, from Hustlers — a man reflected in a motel mirror, the television on`,
        caption: `Philip-Lorca diCorcia, from <cite>Hustlers</cite> (1990&ndash;92). Each man was paid his asking price to be photographed, and the title of every picture is his name, his age, his birthplace and the fee &mdash; the transaction written into the work rather than kept out of it.` },
      { src: `/workshops/bgsu/lab/images/portrait/ref-sheikh.webp`,
        alt: `Fazal Sheikh, Abshiro Aden Mohammed, Women’s Leader, Dagahaley, Kenya, 2000`,
        caption: `Fazal Sheikh, <cite>Abshiro Aden Mohammed, Women’s Leader</cite>, Somali refugee camp, Dagahaley, Kenya, 2000. From <cite>A Camel for the Son</cite>. The sitter is named in the title, her account is printed with the picture, and the work was made over years in one place rather than on a visit.` },
      { src: `/workshops/bgsu/lab/images/portrait/ref-parks.webp`,
        alt: `Gordon Parks, Red Jackson, Harlem, 1948 — at a broken window with a cigarette`,
        caption: `Gordon Parks, Red Jackson, Harlem, 1948. From <cite>Harlem Gang Leader</cite>, made for <cite>Life</cite> &mdash; and a lesson in who holds the edit, since the magazine&rsquo;s was not Parks&rsquo;s.` },
      { src: `/workshops/bgsu/lab/images/portrait/ref-arbus.webp`,
        alt: `Diane Arbus, Transvestite on a couch, N.Y.C. 1966`,
        caption: `Diane Arbus, <cite>Transvestite on a couch, N.Y.C.</cite> 1966. The sitter faces the camera on their own ground, and the argument about whether that is complicity or exposure has never settled.` }
    ],

    /* ── The ten weeks ───────────────────────────────────────────────────────
       Title first, then the account, then the photographs. An assignment that
       has not been run is just its title: naming the ten up front says what
       the course is, and anything more would be a promise rather than a
       record. */
    outputLabel: `Weekly assignments`,
    outputLead: ``,
    weeks: [
      {
        name: `The Encounter`,
        date: `2026 09 23`,
        note: [
          `I photographed two friends, Ungo and Genshin. For these three months they are in a training period called Ango, which in Zen Buddhism means a time of deep practice. Every morning they are responsible for doing rounds at the temple — going through it to pay their dedication at the altars: the founder’s altar, the altar of the deceased, the altar of Shakyamuni Buddha, etc.`,
          `I followed them throughout, instructing them to disregard me as being there. I wanted to document the intimacy of a private ritual. I was mindful of the lighting, and I did not want to focus on their identity but on their unified presence — two people who together take up the roles of humble students practising deeply.`,
          `They also happen to be former partners, husband and wife for twenty years, separated for about a year now. To watch that relationship develop into this new kind of relationship was an interesting observation.`
        ],
        figures: [
          { src: `/workshops/bgsu/lab/images/portrait/encounter-01.webp`, span: 12,
            alt: `A figure in black robes, head bowed, against a bright wall with an ensō painted on it` },
          { src: `/workshops/bgsu/lab/images/portrait/encounter-02.webp`, span: 12,
            alt: `Hands together in gassho, seen in a mirror over a small altar` },
          { src: `/workshops/bgsu/lab/images/portrait/encounter-03.webp`, span: 12,
            alt: `Hands holding a stick of incense in front of three framed portraits of teachers` },
          { src: `/workshops/bgsu/lab/images/portrait/encounter-04.webp`, span: 12,
            alt: `Looking down on a full bow, hands turned upward on a cushion at the edge of a red rug` },
          { src: `/workshops/bgsu/lab/images/portrait/encounter-05.webp`, span: 12,
            alt: `Two people at a window in early light, one bowing, one with hands together` }
        ]
      },
      {
        name: `The Gaze`,
        date: `2026 09 30`,
        note: [
          `I photographed someone I had recently started getting to know — at the time of these pictures still something of a semi-stranger, someone I did not know much about but knew would be interesting to make a photograph with. The assignment was to collaborate with someone on making an image, which meant talking to them first and explaining what the assignment was.`,
          `When you photograph a person it is imperative to recognize the power you hold while pointing the camera, and the vulnerability you are asking of them. I don’t like staged photographs — posing, anything that feels fabricated — so I told her to act naturally. Before any of these were taken we sat on her rooftop and talked about relationships and heartbreak and personal growth, some of it threading on intimacy. By the time the camera came up there was already an established sense of safety, and what I would call emotional intelligence at play. That is my whole process with anyone in front of a camera: get them feeling safe and comfortable first.`,
          `I think about this because I was recently assisting on a shoot for a client, and after nearly every portrait the person who looked at their own picture showed some version of <em>I don’t like how I look</em> — a few said “ew”, one did not want to see it at all and walked away. It is our job to best represent the person. For this assignment, that means producing something that leaves them feeling empowered, with agency.`
        ],
        figures: [
          { src: `/workshops/bgsu/lab/images/portrait/gaze-01.webp`, span: 12,
            alt: `A woman on a roof deck at dusk, one arm on the rail, the city behind her` },
          { src: `/workshops/bgsu/lab/images/portrait/gaze-02.webp`, span: 12,
            alt: `A woman at the foot of a staircase, seen through the banister from above` },
          { src: `/workshops/bgsu/lab/images/portrait/gaze-03.webp`, span: 12,
            alt: `A woman reading on a green sofa by a window of plants and candles` },
          { src: `/workshops/bgsu/lab/images/portrait/gaze-04.webp`, span: 6,
            alt: `A woman seen from behind in a bright room, turned away from the camera` },
          { src: `/workshops/bgsu/lab/images/portrait/gaze-05.webp`, span: 6,
            alt: `A woman at a table in warm lamplight, glass raised, mid-sentence` }
        ]
      },
      { name: `The Stranger` },
      { name: `The Familiar` },
      { name: `The Self` },
      { name: `The Constructed Self` },
      { name: `The Collaborator` },
      { name: `Home / Belonging` },
      { name: `The Edit` },
      { name: `Bearing Witness` }
    ],

    /* Takeaways are held back until week ten. A study three weeks old that
       publishes conclusions is advertising, not research. Restore the list and
       the band draws itself again.
    takeaways: [
    ],
    */

    /* The references are written in the .txt file. */

    next: {
      title: `Community`,
      url: `/workshops/bgsu/lab/community-from-the-inside-out/`
    }
  };
