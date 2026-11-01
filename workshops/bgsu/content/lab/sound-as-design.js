/* ────────────────────────────────────────────────────────────────────────────
   Sound as Design — the text of this study.

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
        start: 1,
        span: 7
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
    title: `Sound`,
    medium: `Browser instrument, record`,
    /* What the instrument is, said once and plainly, before any of the
       argument around it. */
    lede: `A concentric instrument: four sequencers laid out as rings, one inside the next, each with its own voice, step count and speed. Place steps by tapping a ring and it plays what it passes as it turns — an intuitive music practice for people who do not read notation.`,
    author: `OP/AL`,
    active: `2025–present`,
    ongoing: true,
    provocation: `Sound design and graphic design run on the same six words — rhythm, texture, space, silence, weight, tension — and the two fields behave as though this were a coincidence. If the vocabulary is shared, the judgement should transfer, and a designer should be able to build an instrument as readily as a typeface.`,
    question: `Can a graphic designer’s judgement about rhythm, weight and space operate on sound without translation?`,
    position: [
      `The vocabulary is not borrowed. Wassily Kandinsky’s <cite>Point and Line to Plane</cite> (1926) is an attempt at a grammar in which a mark has weight, direction, tension and a temporal character, and he reached for musical terms because they were the only ones precise enough — his whole pedagogy at the Bauhaus assumed that a student learning composition was learning one thing, not two. The claim is old and it has never been properly tested by designers, largely because the equipment was expensive and the musicians were elsewhere.`,
      `Iannis Xenakis is the strongest evidence that it holds. He was a working architect in Le Corbusier’s office and a composer simultaneously, and in <cite>Formalized Music</cite> (1963; English 1971) he treats the two practices as one problem in different materials — the glissandi of <cite>Metastaseis</cite> and the ruled surfaces of the Philips Pavilion are the same idea, drawn once. He then built the UPIC, a machine on which a composer <em>draws</em> and the drawing is the score. Xenakis did not argue that graphic and sonic judgement were analogous; he built a device in which they were identical, which is a much stronger claim and a direct precedent for an instrument that runs on gesture.`,
      `Daphne Oram arrived at the same place from the other direction. Oramics, the system she developed after leaving the BBC Radiophonic Workshop, read shapes painted onto 35mm film as waveform and envelope — sound produced by drawing, with the drawing legible as the cause. <cite>An Individual Note of Music, Sound and Electronics</cite> (1972) is candid that the interest was in the correspondence itself: what a hand-made line sounds like, and whether the irregularity of a human mark carries into the audio as character. Norman McLaren was doing the same thing with optical soundtracks scratched directly onto film. In every case the finding is that a drawn gesture retains its quality when heard — the vocabulary survives the translation.`,
      `Brian Eno supplies the method a designer can actually work in. The liner note to <cite>Ambient 1: Music for Airports</cite> (1978) sets the criterion — music “as ignorable as it is interesting” — which is a specification, not a mood: it constrains dynamic range, event density and rate of change simultaneously. More usefully, Eno’s generative work makes the instrument the artifact. He describes, in <cite>A Year with Swollen Appendices</cite> (1996), building systems of a few unsynchronised loops whose phase relationships produce more material than anyone could compose by hand, and the design work is entirely in choosing the loops and the ratios. That is the same act as Gerstner’s program: specify the system, let it generate the instances. And <cite>Oblique Strategies</cite> (1975), made with Peter Schmidt, is the deck that says the way out of a stuck decision is an arbitrary external instruction — a tool for authorship under constraint.`,
      `Pauline Oliveros defines what the instrument is finally for. Her distinction between hearing and listening — involuntary reception against trained, voluntary attention — is the sonic form of the argument this Lab makes about attention elsewhere, and <cite>Sonic Meditations</cite> (1971) is a set of instructions rather than scores, most of them performable by people with no training. An instrument built on those terms is not for producing a finished track; it is for producing attention in whoever uses it. R. Murray Schafer’s <cite>The Tuning of the World</cite> (1977) adds the environmental frame, naming the soundscape as a designed object with the same status as a built one, and coining <em>schizophonia</em> for the split between a sound and its source that all recording performs — the condition every browser instrument operates inside.`,
      `John Cage, finally, established the term designers use most loosely. <cite>4′33″</cite> (1952) and the essays in <cite>Silence</cite> (1961) demonstrate that silence is not absence but frame: what fills a rest is ambient content, and a composer arranges the conditions under which it is heard. Whitespace in a layout does exactly this, and designers habitually describe it in exactly these terms while treating the parallel as decorative. It is not decorative. The rest and the margin are the same instrument for the same purpose, which is to make the marks either side of them legible.`,
      `So the position of this pillar is that a designer should build the synthesiser rather than commission it, that the design work lies in what the instrument refuses to do, and that the test is whether a musician — somebody who will notice immediately if the shared vocabulary is fake — can make something real with it.`
    ],
    positionNote: `Position written before the instrument was built; unrevised. See Research.`,
    /* The three things the instrument is made of, in the order you meet them.
       Written to be read before the tool is touched. */

    /* Two instruments for a working day, each broken into its parts. They
       share a field layer and a position, and differ in what they ask of the
       person using them: A Day asks for a schedule, Weather asks only for
       conditions and then for nothing at all. */
    breakdowns: [
      {
        name: `A Day`,
        url: `/workshops/bgsu/lab/day/`,
        open: `Open A Day`,
        lead: `Music for a day, read off a strip that is the day. The playhead is the clock — it crosses once, at the speed of the actual day, and the piece is over when the day is.`,
        parts: [
          { name: `The strip`,
            desc: `The whole day across the screen and a line where you are in it. Nothing scrolls: a day you have to scroll is a day you cannot see. The light is drawn under it, so the shape of the day is visible before anything is placed on it.` },
          { name: `The marks`,
            desc: `Not notes and not instruments — characters a stretch of day can have. Rest, Meeting, Focus, Lunch, Open. Each is a set of conditions. Meeting is the important one: it refuses transients altogether, because an attack is an orienting event and lowering its volume does not stop it being one.` },
          { name: `The layers`,
            desc: `Five voices on periods of thirteen, seventeen, twenty-three, thirty-one and forty-three minutes. Nothing divides into anything, so their phase relationships take weeks to come round — which is how eight hours are made from a few minutes of material with no seam in it.` },
          { name: `The sky`,
            desc: `What you do not set. Sunrise and sunset put a curve under the register, pressure thickens the air, wind moves the layers against each other, and if it is raining where you are, you hear rain.` }
        ]
      },
      {
        name: `Weather`,
        url: `/workshops/bgsu/lab/weather/`,
        open: `Open Weather`,
        lead: `A simulation rather than a sequencer. Masses drift across a field and the music is what happens where two of them meet. You cannot place a note — only make the kind of weather in which one becomes likely.`,
        parts: [
          { name: `The field`,
            desc: `Eleven masses, each carrying a pitch and a color, drifting on headings of their own. Nothing is scheduled: whether anything sounds in the next minute is a question about where things have drifted to.` },
          { name: `The conditions`,
            desc: `Four dials, and none of them musical: warmth, weight, movement, size. They describe the air and the music is downstream of them, which is the difference between composing and gardening.` },
          { name: `The meetings`,
            desc: `Two masses overlapping is the event. How deep the overlap sets how long the note is held, and a meeting will not sound twice inside nine seconds — so a pair sitting on top of each other does not become a pulse.` }
        ]
      }
    ],


    research: [
      `<em>Written after Lake Opeka and after <cite>Sinner</cite>, the album Sean Fermoyle made with Angel. The instrument is running; it has not been published.</em>`,
      `The shared vocabulary holds for four of the six words and fails for two. Rhythm, space, silence and tension transferred without translation — decisions made with a designer’s ear produced results a musician accepted. Texture and weight did not: in sound both turned out to be functions of frequency content and loudness over time, and my intuitions about them were consistently wrong in the same direction, toward density. Everything I made was too full. The graphic analog of that error is a layout with no rest in it, which I would have caught immediately on a page.`,
      `The generative approach was right and the interface was not. Following Eno, the first build ran unsynchronised loops and produced more usable material in an afternoon than a week of sequencing, but the controls I put on it were a designer’s controls — sliders for qualities rather than for parameters — and they made the instrument unpredictable in a way that reads as broken rather than as alive. This is the same finding the type instruments produced from the other end: exposing every real control beats curating a few abstracted ones.`,
      `What did not work: the attempt to drive the visual field from the audio directly. Amplitude-linked dot fields looked exactly like every audio visualiser ever made, and the reason is instructive — a literal mapping discards the judgement that made either medium interesting. The version that worked on the record runs the two in parallel from the same source material rather than wiring one to the other.`,
      `The central claim of the position is settled, and settled in the instrument’s favor: <cite>Sinner</cite> exists, it was made with Angel, and it was made by a musician rather than by me. That is the test this pillar set itself — whether somebody who would notice immediately if the shared vocabulary were fake could make something real with it — and the record is the answer.`,
      `What is still open is narrower and entirely mine: Angel has no public build. One record proves the instrument works for the person sitting next to the person who built it. It does not yet prove anything about a musician who has never met either of us, and that is the claim the democratic half of this position actually makes. Until the public build exists, the reach of the argument is one record wide.`
    ],
    references: [
      `Cage, John. <cite>Silence: Lectures and Writings</cite>. Middletown, CT: Wesleyan University Press, 1961.`,
      `Eno, Brian. Liner notes to <cite>Ambient 1: Music for Airports</cite>. EG Records, 1978.`,
      `Eno, Brian. <cite>A Year with Swollen Appendices</cite>. London: Faber and Faber, 1996.`,
      `Eno, Brian and Peter Schmidt. <cite>Oblique Strategies</cite>. London, 1975.`,
      `Kandinsky, Wassily. <cite>Point and Line to Plane</cite>. 1926. Trans. Howard Dearstyne and Hilla Rebay. New York: Guggenheim, 1947.`,
      `Oliveros, Pauline. <cite>Sonic Meditations</cite>. Baltimore: Smith Publications, 1971.`,
      `Oram, Daphne. <cite>An Individual Note of Music, Sound and Electronics</cite>. London: Galliard, 1972.`,
      `Schafer, R. Murray. <cite>The Tuning of the World</cite>. New York: Knopf, 1977.`,
      `Xenakis, Iannis. <cite>Formalized Music: Thought and Mathematics in Composition</cite>. 1963. Bloomington: Indiana University Press, 1971.`
    ],
    next: {
      title: `Community`,
      url: `/workshops/bgsu/lab/community-from-the-inside-out/`
    }
  };
