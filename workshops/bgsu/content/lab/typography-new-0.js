/* ────────────────────────────────────────────────────────────────────────────
   Typography New.0 — the text of this study.

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
      position: {
        /* Set at body size, so the column sets the measure on its own: six of
           twelve is 556px, which is 2.74 alphabets in Signifier at 16px. Eight
           columns at the same size runs to 3.67 — a line too long to track. */
        start: 1,
        span: 6
      },
      showcase: {
        start: 1,
        span: 12
      },
      research: {
        start: 1,
        span: 7
      },
      references: {
        start: 1,
        span: 7
      }
    },
    title: `Technology`,
    fullTitle: `Typography New.0`,
    medium: `Type design technology`,
    author: `OP/AL`,
    active: `2026–present`,
    ongoing: true,
    provocation: `How do we push past the limits of existing design software and build instruments of our own — ones that treat typography as image, and give it parameters that ask it to do things it has not been asked to do before?`,
    question: `What new requests do we make of typography?`,
    position: [
      `Typography arrived as physics and was slowly abstracted out of it. A letter in metal had a body, a shoulder and a beard; it had weight you could feel in the hand and a height you could measure with a gauge. The compositor’s word for the space between lines — leading — is the name of a metal, not a value in a panel. What the trade called <em>tension</em> was the literal resistance of a forme locked up tight enough to lift. When Tschichold set out the terms of the new typography in 1928, he was describing a practice in which the physical constraints of the press were the grammar, and the designer’s contribution was to stop decorating them and start using them (Tschichold, <cite>Die neue Typographie</cite>, 1928).`,
      `El Lissitzky had already gone further. In “Topography of Typography,” printed in <cite>Merz</cite> 4 in 1923, he laid out eight propositions, among them that the printed surface “transcends space and time,” and that the new book demands new writers — that the word on the page is an event with extent, not an image of speech. Three years later, in “Our Book,” he predicted that the book would become an electro-library. He was wrong about the technology and exactly right about the direction: the surface would become active, and typography would have to be described in verbs. What he could not supply was the instrument. He was arguing for kinetics on a press that could only ever hold still.`,
      `The instrument arrived by a route nobody in the avant-garde would have predicted — through cheapness. The Macintosh put the drawing of letterforms in reach of people who had never been trained to do it, and <cite>Emigre</cite> spent a decade making the case that this was a gain rather than a loss. Zuzana Licko’s formulation is still the most useful sentence in the argument: “You read best what you read most” (<cite>Emigre</cite> 15, 1990). It relocates legibility from the anatomy of a letter to the habits of a reader, which means legibility is historical, contingent and — crucially — trainable. A form that is illegible in 1990 may be ordinary by 2005 because readers have put in the hours. Beatrice Warde’s crystal goblet, the vessel so transparent it disappears (Warde, 1930), turns out to be a description not of good typography but of familiar typography.`,
      `If legibility is a habit rather than a property, then the interesting question for a type designer is no longer “is this shape clear?” but “what can a reader be taught to follow?” — and that is a question about behavior, which needs a surface that behaves. Gerrit Noordzij supplies the bridge. <cite>The Stroke</cite> (2005) argues that writing is not the drawing of shapes but the recording of a movement: the letter is the trace of a pen under specific conditions of angle, pressure and speed. Noordzij’s letter is already a physical simulation. What the digital outline did was throw away the simulation and keep only the trace, leaving designers editing the residue of a gesture they could no longer perform.`,
      `The proposition of this pillar is that the browser gives the gesture back. Karl Gerstner had described the shape of the method long before there was anything to run it on: in <cite>Designing Programs</cite> (1964) the designer’s job is to specify the system that generates the solutions rather than to draw each solution by hand. Muriel Cooper’s Visible Language Workshop took that into three dimensions with <cite>Information Landscapes</cite> (1994), where type had depth, position and rate of approach, and legibility became a function of distance. John Maeda’s <cite>Design By Numbers</cite> (1999) then did the unglamorous, decisive thing: it taught designers to write the program themselves, on the grounds that a designer who cannot modify the tool is working inside somebody else’s argument.`,
      `That is the argument for the browser specifically, and it is a political one before it is an aesthetic one. A type tool that runs in a tab has no license, no install, no hardware floor and no account. It can be opened by a student in a school with no budget and by a studio with a full Adobe stack, and it will behave the same way in both. Ellen Lupton’s <cite>Thinking with Type</cite> (2004) made typographic knowledge portable; the browser can make typographic <em>instruments</em> portable, which is a larger claim. When OpenType 1.8 introduced variable fonts in 2016, the industry effectively conceded the point: a typeface is now a space of possibilities with axes, and the specimen is a single coordinate in it. What the format did not supply is the physics — the sense that moving along an axis costs something, that a form under tension wants to return.`,
      `So the work of this pillar is to build instruments in which type has mass and is acted upon: dot-matrix fields that drift and re-form, letterforms multiplied and turned until they read as ribs of a single object, glyphs dispersed into points that remain a word for as long as the reader holds the shape. Each one is a hypothesis about how much physics a reader will tolerate before a word stops being a word. The output is not a typeface. The output is a set of thresholds, and the evidence for them is that somebody could still read it.`
    ],
    /* ── The work the argument is standing on ──────────────────────────────
       Plates under Thinking, in the order the argument reaches them. Every one
       of these is somebody else’s work and is reproduced here as a citation,
       so each carries its maker and its source in the caption — the same
       standard the Owing section holds itself to.

       The files are not in the repository yet. Drop them into
       lab/images/ref/ under these names and they appear; until then the band
       renders without them. See the note in the Owing section. */
    /* ── The work the argument is standing on ──────────────────────────────
       Plates under Thinking, in the order the argument reaches them. Every one
       is somebody else’s work, reproduced here as a citation inside a text
       that discusses it, and every caption names the maker and where the image
       came from, in two lines: at two columns wide a caption is a label, not a
       paragraph, and the argument beside it already does the describing. Two are public
       domain or Creative Commons; the rest are in copyright and are credited
       to their rights holders. Sourcing is written up in
       lab/images/ref/README.txt. */
    positionFigures: [
      {
        src: `/workshops/bgsu/lab/images/ref/sulawesi-stencil.webp`,
        span: 4,
        alt: `Hand stencils in red ochre on cave limestone, Pettakere, South Sulawesi`,
        caption: `Hand stencils, Sulawesi. <span class="text-mid">Cahyo Ramadhani, CC&nbsp;BY-SA.</span>`
      },
      {
        src: `/workshops/bgsu/lab/images/ref/b42-blackletter.webp`,
        span: 4,
        alt: `The opening page of the Gutenberg Bible, set in blackletter`,
        caption: `The 42-line Bible, c.&nbsp;1455. <span class="text-mid">Harry Ransom Center. Public domain.</span>`
      },
      {
        src: `/workshops/bgsu/lab/images/ref/emigre.webp`,
        span: 4,
        alt: `The cover of Emigre 15`,
        caption: `<cite>Emigre</cite> 15, 1990. <span class="text-mid">Emigre, Inc.</span>`
      },
      {
        src: `/workshops/bgsu/lab/images/ref/information-landscapes.webp`,
        span: 4,
        alt: `Typography receding into depth in Information Landscapes`,
        caption: `Cooper, Small, Ishizaki, 1994. <span class="text-mid">MIT Media Lab.</span>`
      },
      {
        src: `/workshops/bgsu/lab/images/ref/katsui.webp`,
        span: 4,
        alt: `Hayashi, a 1981 poster by Mitsuo Katsui`,
        caption: `Katsui, <cite>Hayashi</cite>, 1981. <span class="text-mid">© V&amp;A, London.</span>`
      }
    ],
    themesLabel: `Themes`,
    themesLede: `No counts: these are open topics, not a tally, and an instrument usually sits on more than one of them.`,
    themes: [
      {
        name: `Legibility`,
        note: `The variable, not the limit — how far a word can be dispersed before it stops being a word. <strong>Liquid Type</strong> runs that axis from held to dissolved; <strong>Connected</strong> works the same threshold from the other side, as a field of nodes that stays a word for as long as you hold the shape.`
      },
      {
        name: `Motion`,
        note: `Movement without animation — a still that has traveled. <strong>Mitsuo</strong> turns a multiplied letterform about its vertical axis until the copies read as ribs of one object, perspective doing the work a timeline usually does.`
      },
      {
        name: `Customization`,
        note: `Every instrument is a system rather than a finished picture: weight, dispersal, rhythm, density and color are left open. A mark made here can be tuned to a brand’s palette and proportions instead of arriving with ours baked in. The tool proposes; the brand decides.`
      }
    ],
    tools: [
      {
        name: `Mitsuo`,
        span: 3,
        url: `/workshops/bgsu/lab/tools/mitsuo.html`,
        thumb: `/workshops/bgsu/lab/images/card-mitsuo.webp`,
        alt: `A letterform multiplied into a fan of turning copies`,
        desc: `One letter multiplied and turned about its vertical axis until the copies read as one object.`
      },
      {
        name: `Liquid Type`,
        span: 3,
        url: `/workshops/bgsu/lab/tools/liquid-type.html`,
        thumb: `/workshops/bgsu/lab/images/card-mitsuo-dots.webp`,
        alt: `Words set as a field of luminous dots that fuse and part`,
        desc: `Words poured into a field of metaballs that pull together and apart as they approach.`
      },
      {
        name: `Connected`,
        span: 3,
        url: `/workshops/bgsu/lab/tools/connected.html`,
        thumb: `/workshops/bgsu/lab/images/card-people.webp`,
        alt: `An asterisk dispersed into linked points`,
        desc: `A glyph sampled into points, dispersed and re-linked; recognition survives about a third.`
      },
      {
        name: `Flora`,
        span: 3,
        url: `/workshops/bgsu/lab/tools/flora.html`,
        thumb: `/workshops/bgsu/lab/images/card-flora.webp`,
        alt: `The word Flora grown out of a field of pollen`,
        desc: `A word sampled into pollen and left in the weather — gust, vortex, seismic, drip.`
      },
      {
        name: `Ripple`,
        span: 3,
        url: `/workshops/bgsu/lab/tools/ripple.html`,
        alt: `A line of type whose characters swell and shrink along a wave`,
        desc: `Every character takes its size and its baseline from a wave running along the line.`
      }

    ],
    output: [
      `<strong>Liquid Type</strong> — words poured into a field of metaballs: a halftone screen whose dots fuse and part as they approach, on an axis from held to dissolved, with the record’s eight accents and its loops or a picture of your own behind the words. It began as two instruments — a dot-matrix title engine for the record, and a metaball engine inside Mitsuo — which turned out to be the same instrument approached twice. Browser, HTML canvas, 1400&nbsp;×&nbsp;1400 export. <a class="u" href="/workshops/bgsu/lab/tools/liquid-type.html">Open the instrument</a>`,
      `<strong>Mitsuo</strong> — the <em>fan</em>: a letterform multiplied and turned about its vertical axis into a sheaf of copies; blend, spread, perspective and motion blur exposed, with twenty of Sanzo Wada’s combinations and no color picker. Its metaball engine has gone to <strong>Liquid Type</strong>, where it belonged. Browser, HTML canvas, 1400&nbsp;×&nbsp;1400 export. <a class="u" href="/workshops/bgsu/lab/tools/mitsuo.html">Open Mitsuo</a>`,
      `<strong>Connected</strong> — a character sampled into points, dispersed and re-linked as a constellation, with an optional discharge arcing between crossings. Browser, HTML canvas. <a class="u" href="/workshops/bgsu/lab/tools/connected.html">Open the instrument</a>`,
      `<strong>Flora</strong> — a word sampled into pollen and left in the weather. Four forces, any of them at once: gust lifts the specks off the letterform and lets them float, vortex takes the word up into a twister turning about the center of the field, seismic is a rumble that never stops, and droplet drips. Browser, HTML canvas. <a class="u" href="/workshops/bgsu/lab/tools/flora.html">Open the instrument</a>`,
      `Thirty-eight instruments in total on the workbench. Five are published here, and Mitsuo carries two engines, so there are six to play with. The rest are unpublished on purpose: most of them are failures kept for reference.`
    ],
    showcaseFigures: [
      {
        src: `/workshops/bgsu/images/ValuesPoster-16.webp`,
        span: 4,
        alt: `I trust you / I believe you — the poster for the Values exhibition`,
        caption: `“I trust you / I believe you,” set with Mitsuo — the instrument’s first use on a printed sheet.`,
        credit: `AHA Time × CGDC, 2026.`,
        href: `/workshops/bgsu/artifact/values.html`,
        linkText: `Values — a poster exhibition`
      },
      {
        src: `/workshops/bgsu/lake-opeka-player/assets/v2/flatlay.webp`,
        span: 12,
        alt: `The Lake Opeka record laid out: sleeve, disc, gatefold and insert`,
        caption: `The Lake Opeka record. The cover and the gatefold titles are both set in Liquid Type.`,
        credit: `Sean Fermoyle, 2026.`,
        href: `/workshops/bgsu/artifact/lake-opeka-artwork.html`,
        linkText: `Lake Opeka — album artwork`
      },
      {
        src: `/workshops/bgsu/lab/images/faculty-flora.webp`,
        span: 12,
        alt: `A Faculty spread: a title set in a dot field facing a sleeve of nine flower photographs`,
        caption: `A spread from Faculty 03: Wendy Robles’s <cite>analog catalog of flora</cite>, its title set in a dot field.`,
        credit: `Wendy Robles, Faculty 03, CGDC.`,
        href: `/workshops/bgsu/artifact/faculty.html`,
        linkText: `Faculty`
      }
    ],
    showcase: [
      `Each plate above was made with the instrument it names, at the resolution it exports. Every public tool carries a save button.`,
      `<a class="u" href="/workshops/bgsu/artifact/values.html">Values — a poster exhibition</a> · <a class="u" href="/workshops/bgsu/artifact/lake-opeka-artwork.html">Lake Opeka — album artwork</a> · <a class="u" href="/workshops/bgsu/artifact/faculty.html">Faculty</a>`
    ],
    /* No Looking band on this department. The account of what happened is
       carried by Thinking and by the instruments themselves; a second
       first-person record beside them was saying the same thing twice.
       `band(’research’, …)` in shared/lab.js only draws when this exists. */
    references: [
      `Licko, Zuzana. Interview. <cite>Emigre</cite> 15 (1990).`,
      `Maeda, John. <cite>Design By Numbers</cite>. Cambridge, MA: MIT Press, 1999.`,
    ],
    next: {
      title: `Community`,
      url: `/workshops/bgsu/lab/community-from-the-inside-out/`
    }
  };
