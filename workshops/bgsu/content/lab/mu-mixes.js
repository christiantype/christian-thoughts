/* ────────────────────────────────────────────────────────────────────────────
   Mu Radio — every published mix, read from the Mixcloud API on 15 Oct 2026.

   k  the Mixcloud key, which is also what the player embed needs
   w  who made it     s  seconds     d  published     p  the artwork     t  tracks (0 = no
      tracklist published for that mix)

   To refresh: re-read https://api.mixcloud.com/ChicagoGraphicDesignClub/cloudcasts/
   ──────────────────────────────────────────────────────────────────────────── */

  const MU_MIXES = [
    { k: `/ChicagoGraphicDesignClub/mix_001-c_solorzano/`, w: `Christian Solorzano`, s: 2633, d: `2023-10-09`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/c/b/c/f/477d-dc2c-410a-9f3c-41f87f06b010`, t: 9 },
    { k: `/ChicagoGraphicDesignClub/11-01-2023-set-by-david-sieren/`, w: `David Sieren`, s: 3892, d: `2023-11-01`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/b/4/0/c/627c-eace-4613-a16f-0ea1832905c6`, t: 13 },
    { k: `/ChicagoGraphicDesignClub/11-08-2023-set-by-sarah-jean-adler-casuallyonline/`, w: `Sarah Jean Adler (@casuallyonline)`, s: 3762, d: `2023-11-08`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/6/f/7/3/8e07-9e1b-466b-8c9d-fcb79e7a08cb`, t: 16 },
    { k: `/ChicagoGraphicDesignClub/12-06-2023-set-by-david-sieren/`, w: `David Sieren`, s: 4595, d: `2023-12-06`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/d/0/a/d/0ef3-3b5c-4fe7-abc9-ce1c893d1811`, t: 13 },
    { k: `/ChicagoGraphicDesignClub/01-03-2023-set-by-tyler-english/`, w: `Tyler English`, s: 3513, d: `2024-01-03`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/6/4/9/1/28f9-5b26-4e59-98e3-1eab69e07b43`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/01-10-2024-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 2944, d: `2024-01-10`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/9/8/6/1/26b7-e66d-417d-8b84-e733d586daae`, t: 12 },
    { k: `/ChicagoGraphicDesignClub/02-02-2024-set-by-sean-fermoyle-the-lost-demos-mixtape/`, w: `Sean Fermoyle (The Lost Demos • Mixtape)`, s: 3196, d: `2024-02-03`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/e/e/7/b/4894-b7a0-4fc5-9972-a2098eb9a07a`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/02-09-2024-set-by-david-sieren/`, w: `David Sieren`, s: 4046, d: `2024-02-09`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/3/3/7/2/64e5-b5a1-4c15-bfc7-16231aaae506`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/03-01-2024-set-by-guy-villa/`, w: `Guy Villa`, s: 3627, d: `2024-03-01`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/3/9/0/3/fa79-0301-4f60-bdc0-3f94aa40b786`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/03-07-2024-set-by-sean-fermoyle-seven-silly-songs/`, w: `Sean Fermoyle (Seven Silly Songs)`, s: 2601, d: `2024-03-09`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/c/1/6/4/d14a-c4a6-4c86-854a-adb774f379ec`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/03-15-2024-set-by-david-sieren/`, w: `David Sieren`, s: 5669, d: `2024-03-15`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/8/2/7/a/f32a-c8ee-468b-8ad2-0741ea8fbd5c`, t: 20 },
    { k: `/ChicagoGraphicDesignClub/03-22-2024-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 2789, d: `2024-03-22`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/d/7/5/7/0254-2715-42ef-862f-417705ad0f0d`, t: 13 },
    { k: `/ChicagoGraphicDesignClub/03-29-2024-set-by-hamid-alavi/`, w: `Hamid Alavi`, s: 3109, d: `2024-03-29`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/b/0/4/1/e5b1-abeb-4970-972c-71caa8468ec1`, t: 9 },
    { k: `/ChicagoGraphicDesignClub/04-05-2024-set-by-guy-villa/`, w: `Guy Villa`, s: 3448, d: `2024-04-05`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/8/1/1/5/9dca-3dff-4e59-8f21-95808df8a4ec`, t: 15 },
    { k: `/ChicagoGraphicDesignClub/04-12-2024-set-by-tyler-english/`, w: `Tyler English`, s: 4369, d: `2024-04-12`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/b/3/2/5/530a-7a7f-4429-a3f7-a4e8a3f4707d`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/04-19-2024-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 3943, d: `2024-04-19`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/2/0/5/f/5870-c093-4c4e-bb74-27ac919bdd87`, t: 12 },
    { k: `/ChicagoGraphicDesignClub/04-26-2024-set-by-nicolette-stosur-bassett/`, w: `Nicolette Stosur-Bassett`, s: 2353, d: `2024-04-26`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/a/1/6/7/a265-6cb5-4716-aa80-82530d5e627e`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/05-04-2024-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 1623, d: `2024-05-04`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/9/c/8/f/d092-814a-4cbc-b012-8a12bd892497`, t: 9 },
    { k: `/ChicagoGraphicDesignClub/05-17-2024-set-by-carlos-segura/`, w: `Carlos Segura`, s: 6629, d: `2024-05-18`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/9/6/0/2/8a01-3d35-4bb3-a44d-91649d3c8f8b`, t: 23 },
    { k: `/ChicagoGraphicDesignClub/05-24-2024-brian-eno-special/`, w: `Brian Eno`, s: 2872, d: `2024-05-24`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/2/5/8/6/779d-3a99-4056-a3c9-2cf54edc427f`, t: 12 },
    { k: `/ChicagoGraphicDesignClub/05-31-2024-set-by-hamid-alavi/`, w: `Hamid Alavi`, s: 2843, d: `2024-05-31`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/d/3/4/8/db35-c50e-4bd8-8b1b-9ce33ab29e96`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/07-19-2023-set-by-guy-villa/`, w: `Guy Villa`, s: 3611, d: `2024-07-19`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/2/9/6/f/2d15-4739-4861-b2e3-b333a0df27be`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/07-26-2024-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 2592, d: `2024-07-26`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/3/3/1/6/83bc-1fb0-4df6-8adc-715e7c4dc08e`, t: 14 },
    { k: `/ChicagoGraphicDesignClub/08-02-2024-set-by-carlos-segura/`, w: `Carlos Segura`, s: 9623, d: `2024-08-02`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/d/a/d/8/690e-cb78-4bba-bc11-475df9097a79`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/09-06-2024-set-by-sean-fermoyle/`, w: `Sean Fermoyle`, s: 3140, d: `2024-09-06`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/7/8/f/b/2698-a1ec-4e8c-979b-9bec2bf9232d`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/11-01-2024-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 2555, d: `2024-11-01`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/0/e/2/9/2b8c-4387-4f61-bf72-58af2b1ae5a1`, t: 14 },
    { k: `/ChicagoGraphicDesignClub/11-15-2024-set-by-cheryl-bever/`, w: `Cheryl Bever`, s: 3711, d: `2024-11-15`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/c/6/1/b/9d10-228e-43ab-a984-6f3e90422740`, t: 13 },
    { k: `/ChicagoGraphicDesignClub/11-22-2024-set-by-sean-fermoyle/`, w: `Sean Fermoyle`, s: 3945, d: `2024-11-22`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/4/7/5/6/c9ca-20e9-4a41-b87b-c96e4112ce94`, t: 14 },
    { k: `/ChicagoGraphicDesignClub/12-13-2024-set-by-hamid-alavi/`, w: `Hamid Alavi`, s: 2444, d: `2024-12-13`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/9/9/6/b/714c-39cb-4dd7-a895-f6e6e50912f6`, t: 9 },
    { k: `/ChicagoGraphicDesignClub/01-10-2025-set-by-patrick-smith/`, w: `Patrick Smith`, s: 2457, d: `2025-01-10`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/7/2/1/e/7fce-a3e5-473b-b8c1-557be6541845`, t: 11 },
    { k: `/ChicagoGraphicDesignClub/01-31-2025-set-by-nicolette-stosur-bassett/`, w: `Nicolette Stosur-Bassett`, s: 3599, d: `2025-01-31`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/9/7/a/d/d963-1b8d-4378-9994-50dd2e8fc66a`, t: 19 },
    { k: `/ChicagoGraphicDesignClub/02-14-2025-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 3465, d: `2025-02-14`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/4/f/c/9/0687-afd8-4ae9-a90d-01f84b688130`, t: 15 },
    { k: `/ChicagoGraphicDesignClub/04-18-2025-set-by-cheryl-bever/`, w: `Cheryl Bever`, s: 3588, d: `2025-04-18`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/2/8/b/9/20ce-9f66-4aa0-8b82-aac3ad7543c7`, t: 11 },
    { k: `/ChicagoGraphicDesignClub/04-24-2025-set-by-wendy-robles/`, w: `Wendy Robles`, s: 3764, d: `2025-04-25`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/7/f/1/c/1ee1-127d-4ea4-90c3-cf03c5b5eaa5`, t: 16 },
    { k: `/ChicagoGraphicDesignClub/05-15-2025-set-by-hamid-alavi/`, w: `Hamid Alavi`, s: 2635, d: `2025-05-16`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/6/3/1/7/d9a9-cdf4-4519-84b4-9dfd3878086c`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/07-11-2025-set-by-jeffrey-hitchens/`, w: `Jeffrey Hitchens`, s: 3585, d: `2025-07-11`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/9/a/1/0/53a9-dd3f-4026-b0f8-bcd54ff7703f`, t: 13 },
    { k: `/ChicagoGraphicDesignClub/09-19-2025-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 4226, d: `2025-09-19`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/0/e/7/6/d2ec-09ce-4d66-b788-eb31a68eac7a`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/11-15-2025-set-by-david-sieren/`, w: `David Sieren`, s: 6593, d: `2025-11-14`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/8/6/1/4/943e-50d9-4b7b-984a-5a028775a729`, t: 0 },
    { k: `/ChicagoGraphicDesignClub/10-14-2026-set-by-christian-solorzano/`, w: `Christian Solorzano`, s: 3377, d: `2026-10-14`, p: `https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/1/f/d/d/ac52-f7f7-4a5b-8a7a-bbda31ad4212`, t: 0 }
  ];
