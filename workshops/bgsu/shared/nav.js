/* ── Analytics ──────────────────────────────────────────────────────────────
   Paste the Measurement ID from the GA4 web data stream for more-than.design
   (Admin → Data streams → Web). It looks like G-XXXXXXXXXX. Empty means off,
   and off is genuinely off: nothing is requested and no cookie is set.

   It lives here rather than in 78 heads: one place to add it, one to remove
   it, and it cannot be eaten by the pre-render, which only rewrites the block
   it owns inside each page.                                                 */
const OPAL_GA = 'G-T7WM2TTMWC';

(function analytics() {
  if (!OPAL_GA) return;

  /* An instrument embedded in a case study is the same page, not a second
     visit. Six tools on Typography New.0 would file six pageviews between
     them and make one reader look like seven. A frame is the test that
     matters, because the ?embed=1 flag does not always survive a static
     server's rewrite. */
  if (window.parent !== window) return;
  if (/(?:^|[?&])embed=1(?:&|$)/.test(location.search)) return;

  /* Your own visits are not traffic. Open any page with ?me=1 once and this
     browser stops counting; ?me=0 starts it again. */
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('me') === '1') localStorage.setItem('opal:skip', '1');
    if (q.get('me') === '0') localStorage.removeItem('opal:skip');
    if (localStorage.getItem('opal:skip')) return;
  } catch (e) {}

  /* A reader who has asked not to be followed is not an edge case to route
     around. */
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://www.googletagmanager.com/gtag/js?id=' + OPAL_GA;
  document.head.appendChild(t);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  /* No ad signals and a short-lived cookie: this is here to count readers,
     not to build an audience to sell to. */
  gtag('config', OPAL_GA, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 90,
  });
})();

/* ── OPL Shared Nav ── */
(function () {
  /* The placeholders, fetched rather than written into the page. This file is
     pulled in dynamically on a project page, and document.write from a script
     that arrives after parsing has finished replaces the whole document — it
     took the project pages' pictures with it. Sixty kilobytes, cached after
     the first page; images held before it lands are given their blur the
     moment it does. */
  /* The placeholders, inlined. Twenty-three kilobytes: four tones and the real
     dimensions of every picture on the site, written here rather than fetched.

     Two earlier versions lost the same race. A separate file is requested only
     once this script runs, and on a project page that is after the pictures
     are already in flight — Chrome gives a host six connections, the pictures
     take all six, and the map for standing in for them arrived after they did.
     Holding the pictures back until it landed only moved the problem. It is
     part of the script that needs it now, so it cannot arrive late.

     Regenerate with scripts/lqip.sh when the pictures change. */
  window.LQIP = {"/workshops/bgsu/images/1759-01.webp":[2000,1371,"e2e8efebeff4f4f6f8eef2fa"],"/workshops/bgsu/images/BB-1690.webp":[2000,1333,"73747c7470747b745086795e"],"/workshops/bgsu/images/BB-1890.webp":[1600,2400,"6e6c69827f814e46306a5b41"],"/workshops/bgsu/images/BB-2070.webp":[1600,2400,"76707098948a6e6949605c3e"],"/workshops/bgsu/images/BB-postcard-1.webp":[1200,800,"c88247b4612cd09054bc7039"],"/workshops/bgsu/images/BB-postcard-2.webp":[1200,800,"fbfbfbfbfbfbfbfbfbfbfbfb"],"/workshops/bgsu/images/CD-01.webp":[1600,1068,"a58c7da299995c5659727176"],"/workshops/bgsu/images/CD-02.webp":[1600,1068,"835e7085607460647a5c6176"],"/workshops/bgsu/images/CD-03.webp":[2000,1333,"9b9d9587786535322b3c3328"],"/workshops/bgsu/images/CD-04.webp":[2000,1335,"afaa9d6a61566362572d3737"],"/workshops/bgsu/images/CD-05.webp":[2000,1335,"ebeccb99896ac9ccba938870"],"/workshops/bgsu/images/CD-06.webp":[2000,1333,"99a6a7b2bcc063696a5c6061"],"/workshops/bgsu/images/CD-07.webp":[2000,1333,"aaada89397967b7d79656564"],"/workshops/bgsu/images/CD-08.webp":[2000,1333,"4f413a504e4938343251514f"],"/workshops/bgsu/images/CD-09.webp":[2000,1333,"8e847ca19b9655514b7a736f"],"/workshops/bgsu/images/CD-10.webp":[2000,1333,"8c8887847f80373434877f7f"],"/workshops/bgsu/images/CD-11.webp":[2000,1333,"cacac8dedddcadacaac7c4c2"],"/workshops/bgsu/images/CGDC-01.webp":[1440,600,"2d2d2d2d2d2d2c2c2c2d2d2d"],"/workshops/bgsu/images/CGDC-02.webp":[2000,1125,"9292929494946060607e7e7e"],"/workshops/bgsu/images/CGDC-03.webp":[2000,1500,"354c654f7895273240445a71"],"/workshops/bgsu/images/CGDC-04.webp":[2000,1333,"a3a3a3e8e8e83e3e3e858585"],"/workshops/bgsu/images/CGDC-05.webp":[2000,1333,"938d92a79e9c81888f96a9b9"],"/workshops/bgsu/images/CGDC-06.webp":[2000,1000,"55474689767464575591827f"],"/workshops/bgsu/images/CGDC-07.webp":[2000,1000,"42423e3a3836343531333030"],"/workshops/bgsu/images/DMoC-01.webp":[2000,1333,"5e65686c7a7d8688847a8b94"],"/workshops/bgsu/images/DMoC-02.webp":[2000,2376,"414141373737434343353535"],"/workshops/bgsu/images/DMoC-03.webp":[2000,2376,"eab483ebb483ebb483ebb483"],"/workshops/bgsu/images/DMoC-04.webp":[2000,2376,"6392b8baa0854e797baca79b"],"/workshops/bgsu/images/DMoC-05.webp":[2000,2376,"6473615b6748929ba1a3aeb6"],"/workshops/bgsu/images/DMoC-06.webp":[2000,1333,"5e65686c7a7d8788857a8b94"],"/workshops/bgsu/images/EN-01.webp":[1288,2112,"7c756c736b63605850605950"],"/workshops/bgsu/images/EN-02.webp":[1288,2112,"746c637e776f4c453c5b534b"],"/workshops/bgsu/images/EN-03.webp":[1288,2112,"756e65766e665a524a5d554c"],"/workshops/bgsu/images/EN-04.webp":[1288,2112,"7069607770674c453c4e463e"],"/workshops/bgsu/images/EN-05.webp":[1288,2112,"726b636f685f4b443b443d34"],"/workshops/bgsu/images/EN-06.webp":[1288,2112,"746d666f685f4c443c453d34"],"/workshops/bgsu/images/EN-07.webp":[1080,1920,"0857a80857a80957a90756a8"],"/workshops/bgsu/images/EN-08.webp":[1080,1920,"0655a80655a80756a80555a7"],"/workshops/bgsu/images/EN-09.webp":[1080,1920,"0656a80655a80756a80555a7"],"/workshops/bgsu/images/EN-10.webp":[1080,1920,"0555a70555a70555a70555a7"],"/workshops/bgsu/images/Faculty-01.webp":[1920,1080280,"000000000000000000000018110d091815090e0cdf130d081611091610d2140b07171108120a081008050f0b0410089b0a050208070209051c0704010a08010805130705010f0c010a066e0805011412010d09d50907011b1701110cd90b0801221f01140edc0d0a012b27011711e10e0c013531011914e40f0d01403c011a15e70f0d014d48011a16860f0d0157530119150e0303000201000101250e0d005955011613860d0c005653011412830e0d004d4a011412210e0d004542011110220e0e003a3801100f220e0e00302e010f0e260f0e002a29000e0d280f0e002524000c0b2a0f0e002221000b0a260e0d002321010b0a260d0c002523010a0a250c0b00201e020c09eb0b0a001916020d08130a08001411030e04470101000100000100180b09010d0a050f06980c08020c080511065b0c06040c07061206bd0d05060c07061407201004080d070715078313030c0d07071607e816030e0e07071707e917020f0d06071607e915020e0d060716078514020d0c060614072113020c0b050612065913030c0b05051105f513030c0a05051005f514030d0a05050f025b0100000101010200731a03110a05051005f71c03120a05051105f81c03130a05051105f81c03120904051005951b03120904050f05951a03110904050f05961a03100a05051005fa1903100a05060f05fb1903100b06061005fb18030f0c06061005fc18030e0c07050f059816030d0b07050e04d014030b0b06040c046a1203090905040a04040f020708050309039e0d03060905050b072c0d03060c0707130c200b04060e0b07120cf612070b120e08150c6e00000001010101017d1e0d141a160a1914d0261219201b0d1d19c72a15181d190c1c17c52d161a1a160b1b165e2d141c17140b1812f82b131d19150c1a14c13116201f1a0e22194f2e161e201b0d221a892c171e1f1b0c2019c229161c1f1b0b1d185e27171b1e1a0c1c17fb2415191f1b0c1c195d2012151e1a0c1d19bf1d10121a170a1915f722121516130818149323131512100715112e2414160e0c05120a7901010102020102018427191315130615103a2b1d131b18061914082d1f13211e071f18392f2012272308211a403022122c2809221c47322311302c09231d4a312211332e09211b80312012353109211b7e311e12383309211b16301c133a350a231cdb2f1a1439330b261f392c171436300b261f962a1614342e0c2820f5271413322c0b291ad603020103030103028223130e2c260a2b22e91e120b28220a29221d180f08241f0a2721b5130d06221e0a262052100b06221d0a261fbd170f09231e0a2820c01d100c231e0a28212722110f241e0a282029271112231d0a281f932f1714211a0b291efc341c14211b09291f32301b131f1907261d5e23130e1914051e16c71c0e0b1915051b1166020101010100010014140b071d19051b16fd110c05211d051c1963110d042521051f1bc80f0c022c2705221e32120f02373105262237130f02423d04292571110f014a460325224b110f01504b03201c87111002514c03221d880f0e02544f02201cb90d0c01514e021e1ae80c0b014845011a18810a09013f3c0114137f120b05343102110edf140a082a27020f0cdc180a0b221f030e0b411d0f0c1e1a030f0ca51f110c1d1804190fff1e120b231e05241767020201010100010119190f09221d042018a0190f08221e041c153e181106211d041810dd171205201b05170ea8141002201b05160c13141101221c06170be3171202241e06190bb01611032720071b0c15140f022620071b0c77120e03221b081b0c770f0d02241d071b06a4030300030201020196100d03201906180b420f0d021d170514090f0e0b021a14041107db0c0a021511040e060d0b0902110d030b05a50a08020d0a0209053c0a07010b09020704d60907020a08020604710a06020a080206041d0804020907030704270904030a08040b043b0904030b08050d06c70a04040c09050e07910c05040d090610085b0d06050e0a061108c10e07050e0a061108c51008060f0b0712092c130906110c07140994140b06110d071609fd170d07140e091b0d93170e061510071906ad0302000302010301981811041e17081c0f7b1812041e1806180cf21812031f1906180bf41712031d1706170af51611021e1808190dbd1410021d1608170e531410021b16081910e8150f04181208181048140e05151007150e7a150d07130e05140d74140d07110e0510085c01010002010001011e140e08100e06140f6816100a16130a1d18be17110b17140a1d1ab9130e0a110f091412c2110d0a0e0c08110f5a0e0a080c0a090f088b0906060a090a0f079f0a06060c0b0b100eae0c03090a0a0a0e0d541d10150a09090c0bf31f10140908090c0af62012110908090d0a962415100907070e0a3424150e0907050d097024150d0d0b040d08ae27170e120f05110a7e2c1a10171306160caf311c121c17081d10a1331c141f180a211268341c141e1709210bc20402010402010402f93219141a14081e10092f16141912081c0e042b13131911091c0d622610111c130b2011ed210d0f1a120a1f11201c0a0c18110a1d115317090a150f081a0f88110708130e07170cbd0d0606120c06130a5a0c0707100b061109fa110b090d0905100a95130c0b0d0905110865010000010100010110130d0c0c0a060f0d93110b0b0b09050c0b2f100a0a0b09050b0ac80c07060b09050a08620c07060b09050e0b2b0d08060f0c06120ff70f0a071310071512c3120d071815071a172d1610081e1b071e1a971a1408252107221d9f1e18082c2707231fa61e19062f2b06211ce41c1705332f071d18ee1d17053934071c185d1f19053a36081c18c3221b072e2a081a16cc272205262407181091040300020200020139121001111005100de4180f06131104100d171e1508191605130f701810071e1c05181237170f082320051b14991e0e0d2724061e16fd200e0e2b27061f1798210f0e302b07221af91d0c0c332e07231af5190a0b342f08241b53140809302b082218ea0f06072622081f16e70a05051c18071811580a0505171307170e240f070818120a1e0abf010001020101020177100909130d081d0810"],"/workshops/bgsu/images/Faculty-05.webp":[1638,2048,"d3c4d3c8c0cda29aa7837d89"],"/workshops/bgsu/images/Faculty-06.webp":[1638,2048,"d6c071ccb870867031615229"],"/workshops/bgsu/images/Faculty-07.webp":[2000,1333,"201e1e636360876d6e885d63"],"/workshops/bgsu/images/Faculty-08.webp":[1638,2048,"a58c94bfb4bd6152626e6b7d"],"/workshops/bgsu/images/Faculty-09.webp":[1638,2048,"ab9a8086917d818e76aaa9b0"],"/workshops/bgsu/images/Faculty-10.webp":[2000,1600,"b0a4be616c75455b66969fad"],"/workshops/bgsu/images/Faculty-11.webp":[2000,1600,"8b93a15759659290986d7383"],"/workshops/bgsu/images/Faculty-12.webp":[2000,1600,"45474c616369292e35848994"],"/workshops/bgsu/images/Faculty-13.webp":[1638,2048,"d2cac7c3c6c57d7b79989697"],"/workshops/bgsu/images/Faculty-14.webp":[1638,2048,"be9d8eeec79fc9a595aa916c"],"/workshops/bgsu/images/Faculty-15.webp":[1638,2048,"c5c1c2c8c2c3c3bfc1c7c1c2"],"/workshops/bgsu/images/Faculty-16.webp":[1638,2048,"b4825b9b714e503c24625445"],"/workshops/bgsu/images/Faculty-17.webp":[2000,1333,"c3c8c4453b46c4c4bd5f5150"],"/workshops/bgsu/images/Faculty-20.webp":[2000,2000,"896e677a6760827071937c76"],"/workshops/bgsu/images/Faculty-21.webp":[1638,2048,"85878d65646282741bb9af79"],"/workshops/bgsu/images/Faculty-22.webp":[1536,2048,"a3949b94888c5b6c7d484d5d"],"/workshops/bgsu/images/Faculty-24.webp":[2000,1125,"443a3b8e8a894b363fb0b4c6"],"/workshops/bgsu/images/Faculty-25.webp":[2000,1500,"1616163434345f5f5fb8b8b8"],"/workshops/bgsu/images/Faculty-26.webp":[2000,1125,"5f4c4176615a2117123b3027"],"/workshops/bgsu/images/Faculty-27.webp":[1600,2000,"616568d2dde66876857d94a6"],"/workshops/bgsu/images/Faculty-28.webp":[2000,1600,"a08681e9e0e2b0a19da19c9d"],"/workshops/bgsu/images/Gratitude-01.webp":[1638,2048,"d58d84e0b5a8ae5b50c08976"],"/workshops/bgsu/images/Gratitude-02.webp":[1638,2048,"d9d2c9c7bfb6d1cac7d7cbc2"],"/workshops/bgsu/images/Gratitude-03.webp":[1638,2048,"c5a092b2a8a29a5343997a6a"],"/workshops/bgsu/images/Gratitude-04.webp":[1638,2048,"9e9795b182649e86728f4f2c"],"/workshops/bgsu/images/Gratitude-05.webp":[1638,2048,"98877eaf876f9068608d5243"],"/workshops/bgsu/images/Gratitude-06.webp":[1638,2048,"b36657b54638aa6147be5c41"],"/workshops/bgsu/images/Gratitude-07.webp":[1638,2048,"c36149a96157ac2e14a21d04"],"/workshops/bgsu/images/Gratitude-08.webp":[1638,2048,"dab2a1d7c9bcc4977edfd5be"],"/workshops/bgsu/images/Gratitude-09.webp":[2000,1600,"c8bca5c6c2b4c39f76c6b8a1"],"/workshops/bgsu/images/Gratitude-10.webp":[1638,2048,"e29682e6947dcd3e1cd3340b"],"/workshops/bgsu/images/ID-01.webp":[2000,879,"3e3d3e6666662f2d2e4f4d4e"],"/workshops/bgsu/images/ID-02.webp":[2000,879,"311b2ca66a20381d31a96c25"],"/workshops/bgsu/images/ID-03.webp":[2000,879,"8e837fa4928d7d7b7d93837e"],"/workshops/bgsu/images/ID-04.webp":[2000,879,"c8c8c7968d84d6d6d6c1c2c2"],"/workshops/bgsu/images/ID-05.webp":[2000,879,"d5d0cfa48783e0dcdbc8aeaa"],"/workshops/bgsu/images/ID-06.webp":[2000,879,"c5c3c662626ac2c0c27b7e83"],"/workshops/bgsu/images/ID-07.webp":[2000,879,"e1e0dfb3aca8dfdfdf9a9798"],"/workshops/bgsu/images/ID-08.webp":[2000,879,"88aa97b0bcb9548163a0b0a7"],"/workshops/bgsu/images/LO-share.png":[1200,630,"f1f1f0efefeff4f4f3f4f4f4"],"/workshops/bgsu/images/PT-01.webp":[1639,2048,"2424241f1f1f3c3c3c2b2b2b"],"/workshops/bgsu/images/PT-02.webp":[1638,2048,"575757171717cacaca797979"],"/workshops/bgsu/images/PT-03.webp":[2000,1335,"11121449525a292e326f8797"],"/workshops/bgsu/images/PT-04.webp":[2000,1600,"48433c211f1d544a3f0f0d0c"],"/workshops/bgsu/images/PT-05.webp":[2000,1125,"8a7b6d938475bcab9a73665b"],"/workshops/bgsu/images/PT-06.webp":[2000,1125,"a99887312c279b8c7c60554b"],"/workshops/bgsu/images/PT-07.webp":[2000,1195,"9c9c9c9292938d8d8e9a9a9b"],"/workshops/bgsu/images/PT-08.webp":[2000,1125,"645e537a7065938b7f9b9084"],"/workshops/bgsu/images/PT-09.webp":[2000,1125,"988a795a5047a698865f554b"],"/workshops/bgsu/images/PWP-01.webp":[2000,1324,"a1a2a2a1a1a1898888767573"],"/workshops/bgsu/images/PWP-02.webp":[2000,1324,"959492939697d2cdc0bababb"],"/workshops/bgsu/images/PWP-03.webp":[2000,1324,"b3b7b9989795b7b6b5a7a7a7"],"/workshops/bgsu/images/PWP-04.webp":[2000,1324,"938681827873837b778b8280"],"/workshops/bgsu/images/PWP-05.webp":[2000,1324,"b4b5b39d9e9f8d8d8b9e9d9e"],"/workshops/bgsu/images/PWP-06.webp":[2000,1324,"aaa8a69d9b979d9b95a4a3a0"],"/workshops/bgsu/images/PWP-07.webp":[2000,1324,"834a7eb2a1aeaf76addad4d9"],"/workshops/bgsu/images/PWP-08.webp":[2000,1324,"99978e989797a2a2a1989899"],"/workshops/bgsu/images/PWP-09.webp":[2000,1324,"b5b39b9894718985599e9b8d"],"/workshops/bgsu/images/PWP-10.webp":[2000,1324,"a3a1a06f625c847f7d888482"],"/workshops/bgsu/images/PWP-11.webp":[2000,1324,"7e7b7ba5a29f807d7b938e8a"],"/workshops/bgsu/images/PWP-12.webp":[2000,1324,"c3c1c09d8c8a857f7f887d7b"],"/workshops/bgsu/images/PWP-13.webp":[2000,1324,"747f81a2a59a8c929b6e97ad"],"/workshops/bgsu/images/PWP-14.webp":[2000,1324,"75747282817f8a8987878685"],"/workshops/bgsu/images/PWP-15.webp":[2000,1324,"bcbcbcb8b8b8a3a3a3949393"],"/workshops/bgsu/images/PWP-16.webp":[2000,1324,"5251515d5a5b4645454e4949"],"/workshops/bgsu/images/PWP-17.webp":[2000,1324,"919190afb0b08b8b8b666565"],"/workshops/bgsu/images/PWP-18.webp":[2000,1324,"a5a3a1bbbfbf808588819093"],"/workshops/bgsu/images/PWP-19.webp":[2000,1324,"b3b69faaaf93a9b090a8ad91"],"/workshops/bgsu/images/PWP-20.webp":[2000,1248,"707070a7a7a76f6e6f969696"],"/workshops/bgsu/images/PWP-21.webp":[2000,1248,"4f4f4f2121218e8e8e6f6f6f"],"/workshops/bgsu/images/SP-01.webp":[1080,1350,"465151270c272f3f2c1a141b"],"/workshops/bgsu/images/SP-overlay-page.webp":[1300,1682,"b5b8a8f3c297bdaf91ecb2a4"],"/workshops/bgsu/images/SP-overlay-spread.webp":[1700,1100,"fad5c5f7f0edfad5c5fbf6f4"],"/workshops/bgsu/images/SP-pair-01.webp":[2000,1250,"372f3b1f1618222e21152a16"],"/workshops/bgsu/images/SP-pair-02.webp":[2000,1250,"59778c3e6fb1479e7e7b879d"],"/workshops/bgsu/images/SP-pair-03.webp":[2000,1250,"dae7da493f49b4d4b44b284c"],"/workshops/bgsu/images/SP-pair-04.webp":[2000,1250,"22263a4d5749000004394b39"],"/workshops/bgsu/images/SP-pair-05.webp":[2000,1250,"4439d1511be34d3fce6526e0"],"/workshops/bgsu/images/SP-pair-06.webp":[1700,1100,"f5f5f5f5f4f4faf6f5f5f8f9"],"/workshops/bgsu/images/SP-pair-07.webp":[1700,1100,"f7f7f7f0f1f1f5f8f9f4f3f3"],"/workshops/bgsu/images/SP-pair-08.webp":[1700,1100,"f2f1ddfaf9f7f7f7eaf6f5f2"],"/workshops/bgsu/images/Underscore-01.webp":[2000,1058,"52575c5b60665e636955595e"],"/workshops/bgsu/images/Underscore-02.webp":[1638,1638,"8c8c8c797979939393919191"],"/workshops/bgsu/images/Underscore-02a.webp":[1638,1638,"9090905555557c7c7c4d4d4d"],"/workshops/bgsu/images/Underscore-03-1.webp":[1440,1712,"afafafb1b1b1b1b1b1b1b1b1"],"/workshops/bgsu/images/Underscore-03.webp":[1440,1712,"729ba2739ca3739ca3739ca3"],"/workshops/bgsu/images/Underscore-04.webp":[2000,1333,"daab8d9a9aa1a06e507a7973"],"/workshops/bgsu/images/Values-02.webp":[1920,2400,"c998accccbc8af7993af8898"],"/workshops/bgsu/images/Values-03.webp":[1920,2400,"b5b4b7c1bcbba6a1a1a09590"],"/workshops/bgsu/images/Values-04.webp":[2000,1125,"93969ab9b3b47673729a9291"],"/workshops/bgsu/images/Values-05.webp":[2000,1328,"5757575252524b4b4b404040"],"/workshops/bgsu/images/Values-06.webp":[2000,1080,"8b847baa9c96635d53564d47"],"/workshops/bgsu/images/Values-07.webp":[2000,1322,"9e8c7ab7ae9f7165558c816f"],"/workshops/bgsu/images/Values-08.webp":[2000,1500,"7b72677a7267918b849f9b96"],"/workshops/bgsu/images/Values-09.webp":[1600,1068,"e1c9b3715c4dc5af9f594637"],"/workshops/bgsu/images/Values-catalog-back.webp":[1600,2400,"f7f7f7f9f9f9f9f8f8f5f5f5"],"/workshops/bgsu/images/Values-catalog-front.webp":[1600,2400,"c1c2c4c2b7b9d3ccc4ddd6cc"],"/workshops/bgsu/images/Values-cgdc-avatar.png":[256,256,"3a3a3a2626264141412a2a2a"],"/workshops/bgsu/images/Values-closing.webp":[2000,3000,"070707070606070808060606"],"/workshops/bgsu/images/Values-names-post.webp":[1400,1750,"d6f0d1d6f1d2d5f2ced5f2ce"],"/workshops/bgsu/images/Values-opening.webp":[2000,3000,"f8f8f8f8f9f9f8f7f7f9f9f9"],"/workshops/bgsu/images/ValuesPoster-01.webp":[900,1350,"6e5643bfa48f786351b19d8d"],"/workshops/bgsu/images/ValuesPoster-02.webp":[900,1350,"c6876ccf885ec27e53d2915b"],"/workshops/bgsu/images/ValuesPoster-03.webp":[900,1350,"5b2fa46143a45f34a4623ba0"],"/workshops/bgsu/images/ValuesPoster-04.webp":[900,1350,"b3b4b6d2d3d9c9c9c9dbdbde"],"/workshops/bgsu/images/ValuesPoster-05.webp":[900,1350,"b5b5b5d1d1d1cbcbcbe0e0e0"],"/workshops/bgsu/images/ValuesPoster-06.webp":[900,1350,"57c0425ac0445bbc465ebb49"],"/workshops/bgsu/images/ValuesPoster-07.webp":[900,1350,"677676727e7f6e7a80576a6f"],"/workshops/bgsu/images/ValuesPoster-08.webp":[900,1350,"c2af71c2b375bfb074beb173"],"/workshops/bgsu/images/ValuesPoster-09.webp":[900,1350,"57638059647f6e89c26f87b9"],"/workshops/bgsu/images/ValuesPoster-10.webp":[900,1350,"c3c3c38a8a8a6c6c6c5e5e5e"],"/workshops/bgsu/images/ValuesPoster-11.webp":[900,1350,"8749477551597a494379544b"],"/workshops/bgsu/images/ValuesPoster-12.webp":[900,1350,"e3cecddecacadcccc6dac8c4"],"/workshops/bgsu/images/ValuesPoster-13.webp":[900,1350,"251e1d241d1b58322f5d3632"],"/workshops/bgsu/images/ValuesPoster-14.webp":[900,1350,"9baeac89a29e677473707c7b"],"/workshops/bgsu/images/ValuesPoster-15.webp":[900,1350,"79726d8a81787b766f8b8279"],"/workshops/bgsu/images/ValuesPoster-16.webp":[900,1350,"cfd2d9cccfd7cccfd5c6cad3"],"/workshops/bgsu/images/ValuesPoster-17.webp":[900,1350,"6b68676966646d69686e6b6a"],"/workshops/bgsu/images/ValuesPoster-18.webp":[900,1350,"c1d8cbc1d9cbc1d8cbc0d8cb"],"/workshops/bgsu/images/ValuesPoster-19.webp":[900,1350,"8681808a8584c0b8b696908f"],"/workshops/bgsu/images/ValuesPoster-20.webp":[900,1350,"6f70706f7071979797969696"],"/workshops/bgsu/images/ValuesPoster-21.webp":[900,1350,"3e47634f618749435d5e648a"],"/workshops/bgsu/images/ValuesPoster-22.webp":[900,1350,"91abba7f9fb0a1bac7b1c4cf"],"/workshops/bgsu/images/ValuesPoster-23.webp":[900,1350,"5942475c3f4e70565971515e"],"/workshops/bgsu/images/ValuesPoster-24.webp":[900,1350,"8976ab8c77a8c19c9689669c"],"/workshops/bgsu/images/ValuesPoster-25.webp":[900,1350,"ded8bdddd1cbd1cbaea5ab6e"],"/workshops/bgsu/images/ValuesPoster-26.webp":[900,1350,"ee3449ee2d4cf63e48f53a49"],"/workshops/bgsu/images/ValuesPoster-27.webp":[900,1350,"716e6f5c595a6764654d4a4b"],"/workshops/bgsu/images/ValuesPoster-28.webp":[900,1350,"f09e56f09b56f09d56f09754"],"/workshops/bgsu/images/ValuesPoster-29.webp":[900,1350,"768a6260805f669463628e65"],"/workshops/bgsu/images/ValuesPoster-30.webp":[900,1350,"545453b1aea9757574bebcb8"],"/workshops/bgsu/images/ValuesPoster-31.webp":[900,1350,"f2c1a3f2c3a4f3c9a9f3caaa"],"/workshops/bgsu/images/ValuesPoster-32.webp":[900,1350,"856a8962564b9981947d6246"],"/workshops/bgsu/images/ValuesPoster-33.webp":[900,1350,"6a546f6c57717d647c785f78"],"/workshops/bgsu/images/ValuesPoster-34.webp":[900,1350,"e49b20d4832bd07826d2752e"],"/workshops/bgsu/images/ValuesPoster-35.webp":[900,1350,"c16722ca5b2bbb692ebe7026"],"/workshops/bgsu/images/ValuesPoster-36.webp":[900,1350,"c6e8a2b7e39ac7e89ec7e9b2"],"/workshops/bgsu/images/ValuesPoster-37.webp":[900,1350,"60535d4d44515e5662493c47"],"/workshops/bgsu/images/ValuesPoster-38.webp":[900,1350,"999895cececc7c7773e7e4e0"],"/workshops/bgsu/images/ValuesPoster-39.webp":[900,1350,"917e61888069937f738a7168"],"/workshops/bgsu/images/ValuesPoster-40.webp":[900,1350,"9997979c9a9b959394959393"],"/workshops/bgsu/images/ValuesPoster-41.webp":[900,1350,"9f92d69283d09a8cd48c7cce"],"/workshops/bgsu/images/ValuesPoster-42.webp":[900,1350,"b89f9478655ba28c7aa8988d"],"/workshops/bgsu/images/ValuesPoster-43.webp":[900,1350,"635c6f76596286696e7c6065"],"/workshops/bgsu/images/ZLMC-01.webp":[2000,1600,"9a8469b7a68ba2978e857668"],"/workshops/bgsu/images/ZLMC-02.webp":[1638,2048,"f1ede4ddd9d27b76738b7a65"],"/workshops/bgsu/images/ZLMC-03.webp":[1638,2048,"aeaeae7c7c7c343434060606"],"/workshops/bgsu/images/ZLMC-04.webp":[2000,1500,"9e9088534c4242362e392b21"],"/workshops/bgsu/images/ZLMC-05.webp":[1978,2560,"a39e8aa9a99b837e616f6f61"],"/workshops/bgsu/images/ZLMC-06.webp":[1978,2560,"5958579191913b39385c5c5b"],"/workshops/bgsu/images/ZLMC-07.webp":[2000,972,"5538228664435d412667492b"],"/workshops/bgsu/images/ZLMC-08.webp":[1875,1275,"595959c2c1c091908fcccccb"],"/workshops/bgsu/images/ZLMC-09.webp":[1875,1275,"1b35651d386c84659d91689f"],"/workshops/bgsu/images/ZLMC-10.webp":[2000,1500,"6d675fcecdce3b38337e746b"],"/workshops/bgsu/images/ZLMC-11.webp":[1080,1350,"09060408050418110e090705"],"/workshops/bgsu/images/ZLMC-12.webp":[1080,1350,"bab7b79e8f8bc4c6c8ae968f"],"/workshops/bgsu/images/ZLMC-13.webp":[2000,1500,"96735fb88f7878655ac7bfb8"],"/workshops/bgsu/images/ZLMC-14.webp":[2000,972,"716e624b565b747062535f67"],"/workshops/bgsu/images/brains-gallery.webp":[1600,1169,"6e757d90969d6f78838f959f"],"/workshops/bgsu/images/brains-opening.webp":[1290,861,"b1aba7c3b9b374706d827b76"],"/workshops/bgsu/images/brains-spread-01.webp":[1600,1067,"fcfcfcd5d2d0fafafad5d3d1"],"/workshops/bgsu/images/brains-spread-02.webp":[1600,1067,"fbfcfccfcecffafafad1d1d1"],"/workshops/bgsu/images/brains-spread-03.webp":[1600,1067,"fcfcfcdbd5c6fafafad9d5cc"],"/workshops/bgsu/images/enough-poster.webp":[1080,1920,"756c6370685f504a40554d43"],"/workshops/bgsu/images/hero-fallback.webp":[1600,1000,"020202030302040404030303"],"/workshops/bgsu/images/hero/artifact.webp":[2000,1599,"c0424ac68480b53b44c3a9a1"],"/workshops/bgsu/images/hero/research.webp":[2000,1599,"9dcf015f8501425801314301"],"/workshops/bgsu/images/playbot-becca.webp":[1067,1600,"9997959e9c9b8a88868e8c8b"],"/workshops/bgsu/images/playbot-bobbot.webp":[1067,1600,"bcb092c1b596a89c86aa9f88"],"/workshops/bgsu/images/playbot-chloe.webp":[1067,1600,"949190979594858382898788"],"/workshops/bgsu/images/playbot-coco.webp":[1067,1600,"97928fa19b98878280928c8b"],"/workshops/bgsu/images/playbot-elvs.webp":[1067,1600,"96918e99949285817f8a8685"],"/workshops/bgsu/images/playbot-hank.webp":[1067,1600,"9f9692a49b978b8581908a87"],"/workshops/bgsu/images/playbot-jing.webp":[1067,1600,"9f9f9facacad8d8c8b9a9999"],"/workshops/bgsu/images/playbot-nicki.webp":[1067,1600,"a7948bac9a9290827d918784"],"/workshops/bgsu/images/playbot-nigel.webp":[1067,1600,"a2948da698918e8581948a86"],"/workshops/bgsu/images/playbot-pierce.webp":[1067,1600,"9c9896a5a1a0928d8a9a9695"],"/workshops/bgsu/images/playbot-rex.webp":[1067,1600,"b2aba6b5aeaa9e9792a29b97"],"/workshops/bgsu/images/playbot-rory.webp":[1067,1600,"998c88a7958f8f85819c8d87"],"/workshops/bgsu/images/playbot-slvrfx.webp":[1067,1600,"9896949a97958c89868b8887"],"/workshops/bgsu/images/playbot-sylk.webp":[1067,1600,"9f9b99a29d9c918d8b94908f"],"/workshops/bgsu/images/playbot-tomiko.webp":[1067,1600,"a2a2a1a6a5a6929191969697"],"/workshops/bgsu/images/pwp-poster.webp":[1280,720,"c1b68ab0a47a393731222019"],"/workshops/bgsu/images/values-reel-poster.webp":[1080,1920,"9a817c8a868c8c776c87848a"],"/workshops/bgsu/lab/images/angel-full.webp":[1400,1400,"f8fcfbf7fbf6fbfff9fbf8f7"],"/workshops/bgsu/lab/images/angel-notes.webp":[1400,1400,"fefdfbfdfdf8fcfbfcfafcfb"],"/workshops/bgsu/lab/images/angel-rings.webp":[1400,1400,"fefefefefefefefefefefefe"],"/workshops/bgsu/lab/images/card-flora.webp":[1200,1200,"090a09070807070807070808"],"/workshops/bgsu/lab/images/card-mitsuo-dots.webp":[1200,1200,"15111014100e120f0d17120f"],"/workshops/bgsu/lab/images/card-mitsuo.webp":[1200,1200,"9995739e9d7f817d61797965"],"/workshops/bgsu/lab/images/card-opeka-type.webp":[1200,1200,"1313131111110e0e0e0d0d0d"],"/workshops/bgsu/lab/images/card-people.webp":[1200,1200,"030303030303030303030303"],"/workshops/bgsu/lab/images/community/room-01.webp":[1400,1050,"79675d897a738f837e554f4d"],"/workshops/bgsu/lab/images/community/room-02.webp":[1400,1050,"a4a4a4787878a8a8a8414141"],"/workshops/bgsu/lab/images/community/room-03.webp":[1400,933,"aaaaaaadadad9b9b9b6f6f6f"],"/workshops/bgsu/lab/images/community/room-04.webp":[1400,788,"645100d8c4515f4a01674f00"],"/workshops/bgsu/lab/images/community/room-05.webp":[1400,788,"959595707070545454464646"],"/workshops/bgsu/lab/images/community/room-06.webp":[1400,930,"a19a98b6a29d3a2b249a7666"],"/workshops/bgsu/lab/images/community/room-07.webp":[1400,1050,"9e9e9e6a6a6a6161616b6b6b"],"/workshops/bgsu/lab/images/community/room-08.webp":[1400,1120,"b7bdc0b3c3cdb1a194b3b9bc"],"/workshops/bgsu/lab/images/community/room-09.webp":[1400,1750,"87685ea78b7e927975745c55"],"/workshops/bgsu/lab/images/faculty-flora.webp":[2000,1294,"e9e9df82795beeebd9888464"],"/workshops/bgsu/lab/images/opeka-type-card.webp":[1600,1000,"e4e4e3e4e3e3edececedecec"],"/workshops/bgsu/lake-opeka-player/assets/v2/cover-back.webp":[1860,1842,"fefefefefefefdfdfdfdfdfd"],"/workshops/bgsu/lake-opeka-player/assets/v2/cover-front.webp":[1860,1842,"e2e2e2dad9d9e7e6e6e7e7e7"],"/workshops/bgsu/lake-opeka-player/assets/v2/flatlay.webp":[2019,1308,"8b929d7f858d404852667281"],"/workshops/bgsu/lake-opeka-player/assets/v2/label-A.webp":[866,866,"fefefefdfdfdfefefefdfdfd"],"/workshops/bgsu/lake-opeka-player/assets/v2/label-B.webp":[866,866,"fefefefcfcfcfefefefcfcfc"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-01L.webp":[1417,1418,"100f0f0f0e0e0e0e0f0e0f0f"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-01R.webp":[1418,1418,"0f0f0f0f0e0f0f0f0f100e0f"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-02L.webp":[1417,1418,"fdfcfcfcfcfcfdfcfcfcfcfc"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-02R.webp":[1418,1418,"343031312d2f393c3d3f393a"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-03L.webp":[1417,1418,"3134382f343935383a36383b"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-03R.webp":[1418,1418,"3a3733433c3247423b443f37"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-04L.webp":[1417,1418,"2d3940313a3e353e4232393d"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-04R.webp":[1418,1418,"312a2c3328292f2829312727"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-05L.webp":[1417,1418,"3d3d3e3a3a3b4b444745494a"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-05R.webp":[1418,1418,"25292d272b2f3b4147313337"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-06L.webp":[1417,1418,"2626292a2c3037373c36373b"],"/workshops/bgsu/lake-opeka-player/assets/v2/page-06R.webp":[1418,1418,"fdfdfdffffffffffffffffff"],"/workshops/bgsu/lake-opeka-player/assets/v2/sleeve-back.webp":[1778,1807,"666364666364676465676465"],"/workshops/bgsu/lake-opeka-player/assets/v2/sleeve-front.webp":[1778,1807,"676465676465676465676465"],"/workshops/bgsu/lake-opeka-player/assets/v2/spread-02.webp":[2835,1418,"e9e9e9444041e9e9e94c4a4b"],"/workshops/bgsu/lake-opeka-player/assets/v2/spread-03.webp":[2835,1418,"2c303439352f333537403c36"],"/workshops/bgsu/lake-opeka-player/assets/v2/spread-04.webp":[2835,1418,"2d363b2f282930383b2d2627"],"/workshops/bgsu/lake-opeka-player/assets/v2/spread-05.webp":[2835,1418,"36373825282c44444633393d"],"/workshops/bgsu/lake-opeka-player/assets/v2/spread-06.webp":[2835,1418,"3a3b3eeaeaeb46474bebebeb"],"/workshops/bgsu/lake-opeka-player/social/avatar.webp":[160,160,"5555555555553a3a3a393939"],"/workshops/bgsu/lake-opeka-player/social/reel-poster.webp":[1080,1920,"211d1e201b1c242121242021"],"/workshops/bgsu/thumbnails/web/br-ai-ns.webp":[1290,861,"b1aba7c3b9b374706d827b76"],"/workshops/bgsu/thumbnails/web/chicago-graphic-design-club.webp":[1440,1152,"a3a3a3717171a4a4a44a4a4a"],"/workshops/bgsu/thumbnails/web/citations-of-gratitude.webp":[1280,1600,"b3bdc6afbbc8b7a49eb7b2b6"],"/workshops/bgsu/thumbnails/web/confronting-design.webp":[1600,1068,"a58d7da299995c5659727176"],"/workshops/bgsu/thumbnails/web/enough.webp":[976,1600,"787167837b73554e44574f46"],"/workshops/bgsu/thumbnails/web/faculty.webp":[1600,1066,"0d0d0d262626606060afafaf"],"/workshops/bgsu/thumbnails/web/lake-opeka.webp":[1600,1585,"e2e2e2dad9d9e6e6e6e7e7e7"],"/workshops/bgsu/thumbnails/web/lumen-dashboard.webp":[1600,1247,"e5eeebeaf2f1fbfafafdfcfc"],"/workshops/bgsu/thumbnails/web/point.webp":[1280,1600,"0b0b0d4c525a272b2e8da5b6"],"/workshops/bgsu/thumbnails/web/pre-website-portfolios.webp":[1600,1059,"c1ae77b9a672594f4452453a"],"/workshops/bgsu/thumbnails/web/sidepiece.webp":[1080,1350,"e1e1e1e8e8e8e5e5e5eaeaea"],"/workshops/bgsu/thumbnails/web/typography-as-physics.webp":[1600,1000,"abc3cbacbdd29ab3bf8ba0bf"],"/workshops/bgsu/thumbnails/web/underscore.webp":[1600,846,"aba79e92958d7a746d8e8d85"],"/workshops/bgsu/thumbnails/web/values.webp":[1067,1600,"070707070606070808060606"],"/workshops/bgsu/thumbnails/web/zen-life-and-meditation-center.webp":[1600,1280,"9a8469b7a68ba2978e857668"],"/workshops/bgsu/images/SP-colophon.webp":[1700,1185,"6a7576babcbd6a7575b8bbbc"],"/workshops/bgsu/lab/images/portrait/encounter-05.webp":[1600,1063,"5550413a302216140f110c08"],"/workshops/bgsu/thumbnails/web/archive-and-the-humanities.webp":[1280,1600,"d3c4d3c8c0cda29ba7837d89"],"/workshops/bgsu/thumbnails/web/br-ai-ns.mp4":[540,960,"110c10080b0f150f150a0f14"],"/workshops/bgsu/thumbnails/web/community.mp4":[1600,900,"1210110c0e0e16150d10120e"],"/workshops/bgsu/thumbnails/web/enough.mp4":[736,1206,"6e675d7a726a4e483e4f4940"],"/workshops/bgsu/thumbnails/web/lake-opeka.mp4":[1200,596,"c6c5c54e4d4dd0cfcf535353"],"/workshops/bgsu/thumbnails/web/lumen.mp4":[1112,1332,"0c49590c40510b3c4e0b3347"],"/workshops/bgsu/thumbnails/web/meditation-as-creative-practice.webp":[1600,1000,"f2f2f1f2f2f1f2f2f1f2f2f1"],"/workshops/bgsu/thumbnails/web/open.mp4":[1216,758,"82aadf82aadf81aadf82aadf"],"/workshops/bgsu/thumbnails/web/posters.mp4":[1200,1520,"9999998c8c8c8d8d8d8d8d8d"],"/workshops/bgsu/thumbnails/web/pre-website-portfolios.mp4":[800,450,"9a99993c2e2d727578493d3c"],"/workshops/bgsu/thumbnails/web/sound-as-design.webp":[866,866,"fefefefdfdfdfefefefdfdfd"],"/workshops/bgsu/thumbnails/web/typography-new-0.mp4":[1200,750,"b4baa2b3b1b2b7bcaab2b0b2"],"/workshops/bgsu/thumbnails/web/underscore.mp4":[900,900,"535353606060474747313131"],"/workshops/bgsu/thumbnails/web/values.mp4":[720,1280,"967b7b8a81828e78728b8887"]};

  const inProject = window.location.pathname.includes('/workshops/bgsu/artifact/');
  const base = inProject ? '../' : '';

  /* The mark is one drawing, but it has two jobs: on arrival it says the
     practice's name, and once you are reading it only needs to hold the place.
     So the slash is lifted out of the single path into one of its own, and
     everything either side of it can be taken away without the mark moving. */
  const logoSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="155.3 212.9 1285.8 186.2" fill="currentColor" class="nav-wordmark"><path class="nav-wordmark__set" d="M1356.2,353.2h72.1v-13h-59.1v-100.6h-13v113.5ZM1077.3,313.7l13.5-61.1h10.6l13.3,61.1h-37.5ZM1055.3,353.2h13.3l5.8-26.5h43.3l5.8,26.5h13.3l-25.2-113.5h-30.6l-25.6,113.5ZM478.1,296.2v-43.6h28.1c5.9,0,8.3.9,13,4.7,5.2,4.3,5.9,6.1,5.9,10.6v13c0,4.5-.7,6.3-5.9,10.6-4.7,3.8-7,4.7-13,4.7h-28.1ZM465.1,353.2h13v-44h28.1c9.4,0,14.2-2,22.5-9,8.3-7,9.4-10.3,9.4-18.6v-14.4c0-8.3-1.1-11.5-9.4-18.6-8.3-7-13.2-9-22.5-9h-41.1v113.5ZM199.1,340.2h-11.9c-5.9,0-8.3-.9-13-4.7-5.2-4.3-5.9-6.1-5.9-10.6v-57c0-4.5.7-6.3,5.9-10.6,4.7-3.8,7-4.7,13-4.7h11.9c5.9,0,8.5.9,13.2,4.7,5,4.1,5.8,6.1,5.8,10.6v57c0,4.5-.7,6.5-5.8,10.6-4.7,3.8-7.2,4.7-13.2,4.7M187.2,353.2h11.9c9.4,0,14.2-2,22.5-9,8.3-7,9.4-10.3,9.4-18.6v-58.4c0-8.3-1.1-11.5-9.4-18.6-8.3-7-13.2-9-22.5-9h-11.9c-9.4,0-14.2,2-22.5,9-8.3,7-9.4,10.3-9.4,18.6v58.4c0,8.3,1.1,11.5,9.4,18.6,8.3,7,13.2,9,22.5,9"/><path class="nav-wordmark__slash" d="M723.6,398.3h37.2l111.9-184.5h-37.2l-111.9,184.5Z"/></svg>`;

  /* ── Favicon (injected site-wide so every page gets it) ── */
  if (!document.querySelector('link[rel="icon"]')) {
    [
      ['icon', '/workshops/bgsu/favicon.svg', 'image/svg+xml'],
      ['alternate icon', '/workshops/bgsu/favicon.ico', null],
      ['apple-touch-icon', '/workshops/bgsu/apple-touch-icon.png', null],
    ].forEach(([rel, href, type]) => {
      const l = document.createElement('link');
      l.rel = rel; l.href = href; if (type) l.type = type;
      document.head.appendChild(l);
    });
  }

  /* ── Header: the wordmark flush left, the three doors flush right.
        Lab is Original Practice (research), Studio is Applied Learning (work for
        clients), Info is the practice itself. ── */
  const path = window.location.pathname;
  const inLab = /\/lab\//.test(path);
  // `/workshops/bgsu/artifact/` as well as the old `/workshops/bgsu/projects/`: the work moved and this
  // regex did not, so a project page lit none of the three marks.
  const inStudio = !inLab && /\/projects\/|\/artifact\/|\/studio/.test(path);
  const inInfo = /about/.test(path);
  /* ── Three marks: space, research, artifact ────────────────────────────────
     One language rather than three pictures. Every mark is drawn in the same
     16-unit box with the same 1.4 stroke, and every one is the same 10-unit
     shape in a different state:

       space     an open circle      — a field with nothing in it yet
       research  a circle, centred   — the same field with a point of focus in
                 on a filled dot       it: a lens, an eye, an aim
       artifact  a filled square     — resolved. A made thing has edges.

     Open → focused → made, which is also the order the sentence puts them in
     and the order the work actually goes. A magnifying glass or a brain would
     each be a picture of a different thing borrowed from somewhere else; these
     three are the same thing three times, which is what makes them a set. */
  const marks = {
    /* space — the Info circle: the ring with an i in it. The i is set, not
       drawn: it is the house sans, the same letter the rest of the site is
       written in, rather than my approximation of one. It is centred on its
       own ink once the face has arrived — see centreInfoI below — because a
       dotted i is not symmetrical about its own box and typesetting it on
       the geometric centre leaves it visibly low and left. */
    space: '<circle cx="8" cy="8" r="5.3"/>' +
           '<text class="nav-mark__i" x="8" y="8" fill="currentColor" stroke="none">i</text>',
    // research — a triangle. The three are the elementary shapes, in the
    // Bauhaus order: triangle, square, circle.
    research: '<path d="M8 2.6 13.9 13.3H2.1Z"/>',
    // artifact — a square. A made thing has edges.
    artifact: '<rect x="3.1" y="3.1" width="9.8" height="9.8"/>'
  };
  /* 0.95 in a sixteen-unit box draws at about 1.5px once the mark is set at
     1.6rem, which is the weight of the circle it replaces. */
  const mark = k => '<svg class="nav-mark" viewBox="0 0 16 16" aria-hidden="true" ' +
    'fill="none" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round">' +
    marks[k] + '</svg>';

  /* The mark you are standing in is filled, and the fill is one of the five
     house accents, picked fresh on every load — the same five the punctuation
     and the department names use. The header is a difference blend, so the
     colour inverts against whatever is behind it: on the white a page opens on
     it is the accent itself, and on a dark band further down it reads as that
     accent's complement, which is another colour from the same family. */
  const ACCENTS = ['#ff4f9e', '#e0a000', '#2f9bd6', '#ef5a45', '#7aae1f'];
  const accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

  /* One door for now. Research and Artifact each have an index of their own,
     but the homepage is already the feed of everything in both — so the two
     marks were sending you to a filtered version of the page you were standing
     on. Info is the only one that goes somewhere else. The other two are kept
     here, commented, because the split is a decision that will come back. */
  const doorsHTML = [
    // ['/workshops/bgsu/lab/',    'research', 'Research', inLab],
    // ['/workshops/bgsu/studio/', 'artifact', 'Artifact', inStudio],
    ['/workshops/bgsu/about.html', 'space',    'Info',     inInfo]
  ].map(([href, key, label, on]) =>
    // No label under the mark and no `title` either. With one door left, a
    // name appearing under it on hover was labelling the only thing there —
    // and the browser's own tooltip arrives a second late, in a system font,
    // in the corner of the pointer. `aria-label` carries the name, so the
    // mark is still never nameless.
    `<a href="${href}" class="nav-door${on ? ' is-on' : ''}" aria-label="${label}"${
      on ? ` aria-current="page" style="--door-on:${accent}"` : ''}>${mark(key)}</a>`
  ).join('');

  const nav = document.createElement('nav');
  nav.innerHTML = `
    <div class="container">
      <div class="nav-row">
        <!-- Once the mark has closed to the slash, the slash is reading as a
             preposition with nothing after it. The page's own name goes there:
             the mark says whose site this is and the name says where in it you
             are standing. It sits OUTSIDE the link — the link's width is driven
             down to the width of the slash, so a name inside it has nowhere to
             be. -->
        <div class="nav-place">
        <a href="/" class="nav-logo-link" aria-label="OP/AL">
          <span class="nav-logo-clip">${logoSVG}</span>
        </a>
        <span class="nav-here" aria-hidden="true"></span>
        </div>
        <!-- The three doors do not live in here. The header is a difference
             blend so the wordmark reads on any ground, and a blend inverts
             everything in its layer — the active mark's colour came out as its
             complement. The doors are their own bar, below. -->
      </div>
    </div>
  `;
  document.body.prepend(nav);

  /* ── The name band ────────────────────────────────────────────────────────
     Under the header, on every page. The homepage carried it alone; it is the
     practice's own name and belongs wherever you are standing, so it is built
     here with the header rather than written into one file.

     Grey and not black: black is reserved for a bar you can click into — the
     section index on a study, the showcase ground. This one states what the
     practice is and goes nowhere.

     The homepage only. Said once, on arrival, it is the practice introducing
     itself; repeated over every page it is a strapline, and a strapline under
     the mark on all fifty-seven pages is the thing you stop reading first. */
  /* A header was built. Everything that has to clear the fixed bar keys on
     this — not on the band, which only the homepage has. The two were one class
     until the band became homepage-only, and every other page then lost the
     spacer that holds the text off the header. */
  document.documentElement.classList.add('has-header');

  const onHome = /^\/(index\.html)?$/.test(location.pathname);
  let band = null;
  if (onHome) {
    band = document.createElement('div');
    band.className = 'name-band';
    band.innerHTML = `<div class="container">` +
      `<p class="tag name-band__line">Original Practice&#8202;/&#8202;Applied Learning</p></div>`;
    nav.after(band);
    /* Everything below the band has to know it is there — the heroes clear the
       fixed header with a padding of their own, and with the band in the flow
       that padding would be counted twice. The class is set from here, so a
       page that does not build the band does not get the offsets either. */
    document.documentElement.classList.add('has-name-band');
  }

  /* ── The mark, once you are reading ──────────────────────────────────────
     Past the first screen the wordmark closes down to the slash alone. The
     name has been said; what is wanted after that is the smallest thing that
     still marks the corner as ours. Nothing is re-drawn: the mark slides left
     inside a box closing to the width of the slash, so what is left is the
     slash standing on the left margin — the same line the wordmark's own left
     edge stood on, and the line everything else on the page stands on.

     The two numbers are read off the drawing: in a viewBox 1285.8 wide
     starting at 155.3, the slash runs from 723.6 to 872.7. */
  /* The page's name, for the collapsed mark to stand in front of. Taken from
     the document title, which every page already sets properly, with the site
     name after the dash removed — the mark is already saying that part. */
  (function pageName() {
    const el = nav.querySelector('.nav-here');
    if (!el) return;
    if (/^\/(index\.html)?$/.test(location.pathname)) return;   // the homepage is not somewhere else
    /* From the page itself. A study's <title> leads with its department —
       Image, Technology, Sound — which is true but is not where you are, so
       the renderers publish the real name and this reads that, falling back to
       the title only when nothing has. */
    const t = (document.documentElement.dataset.pageName
            || (document.title || '').split(/\s+[\u2014\u2013-]\s+/)[0]).trim();
    if (t) el.textContent = t;
  })();

  (function markCollapse() {
    const link = nav.querySelector('.nav-logo-link');
    if (!link) return;
    const LEFT = (723.6 - 155.3) / 1285.8;          // 0.442 of the mark
    const WIDE = (872.7 - 723.6) / 1285.8;          // 0.116 of the mark
    const root = document.documentElement;
    let full = 0;

    /* Computed, never measured. The link carries a width transition, so
       reading its live width returns whatever it is part-way through — and a
       phone fires a resize every time its address bar moves, which on a closed
       mark meant measuring the collapsed state and driving the slash down to
       about two pixels, where it disappeared entirely. The open width is
       knowable without asking the DOM: it is the same expression the
       stylesheet uses. */
    function measure() {
      const vw  = document.documentElement.clientWidth || window.innerWidth;
      const cs  = getComputedStyle(root);
      const wm  = parseFloat(cs.getPropertyValue('--wordmark-w')) || 207;
      const cap = vw <= 640 ? 0.38 : 0.46;          // matching the stylesheet
      full = Math.min(wm, vw * cap);
      if (!full) return;
      root.style.setProperty('--mark-full',  full.toFixed(1) + 'px');
      /* A hair over the slash's own width. Cut to exactly its width the mark
         sits flush against the clip on both sides, to within a hundredth of a
         pixel — which is no tolerance, and any rounding takes a sliver off it. */
      root.style.setProperty('--mark-slash', (full * WIDE + 1.5).toFixed(1) + 'px');
      root.style.setProperty('--mark-shift', (-full * LEFT).toFixed(1) + 'px');
    }
    measure();
    addEventListener('resize', measure, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    // Hysteresis, so a mark that lands on the threshold does not flutter.
    let closed = false;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (!closed && y > 90) { closed = true;  root.classList.add('is-mark-closed'); }
      else if (closed && y < 40) { closed = false; root.classList.remove('is-mark-closed'); }
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  })();

  /* Its height, measured rather than guessed, so a full-height hero can be
     exactly what is left of the screen under it. */
  (function bandHeight() {
    const set = () => {
      // No band is a band of no height, and the heroes below read this either
      // way — left unset they would clear a bar that is not there.
      const h = band ? Math.round(band.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty('--band-h', h + 'px');
    };
    set();
    addEventListener('resize', set);
    addEventListener('load', set);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
    setTimeout(set, 250);
  })();

  /* ── The three doors ───────────────────────────────────────────────────────
     Their own fixed bar, outside the header, because the header blends and a
     colour cannot survive a difference blend. This bar carries no blend, so it
     has to follow the ground itself: it reads what is actually painted behind
     it and turns white over a dark band, black over a light one. Same result,
     honest colour. */
  const doors = document.createElement('div');
  doors.className = 'nav-doors-bar';
  doors.innerHTML = doorsHTML;
  document.body.appendChild(doors);

  (function follow() {
    const lum = c => {
      const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null;
      const n = m[1].split(',').map(parseFloat);
      if (n.length > 3 && n[3] < 0.5) return null;
      return (0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2]) / 255;
    };
    /* The bar sits on the wordmark's own line. Measured rather than written:
       the doors' box is not the wordmark's box and an em guess was eleven
       pixels high. */
    const line = () => {
      const wm = nav.querySelector('.nav-wordmark'); if (!wm) return;
      const w = wm.getBoundingClientRect(), d = doors.getBoundingClientRect();
      const want = Math.round((w.top + w.bottom) / 2 - d.height / 2);
      if (doors._top !== want) { doors._top = want; doors.style.top = want + 'px'; }
    };
    line();
    setTimeout(line, 200); setTimeout(line, 900);
    addEventListener('resize', line);

    let last = null;
    const read = () => {
      const r = doors.getBoundingClientRect();
      const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
      // elementsFromPoint, not elementFromPoint: this bar is on top of the
      // point it is asking about, so it has to look past itself
      /* The black scrim that rises behind the header on a study page is
         `pointer-events: none`, and elementsFromPoint skips anything that
         cannot be hit — so hit-testing looked straight through it and reported
         the white band underneath. The marks were drawn black on black. It is
         the one fixed pane on the site that covers this bar, so it is asked
         first, and only then the stack. */
      const scrim = document.querySelector('.nav-scrim');
      if (scrim && +getComputedStyle(scrim).opacity > 0.5) {
        const L = lum(getComputedStyle(scrim).backgroundColor);
        if (L !== null) return L;
      }
      /* The white plane behind the header is a ::before on the body, and a
         pseudo-element is not an element — elementsFromPoint cannot return it.
         So the probe looked straight through a white strip and reported the
         body's own background, which on the Artifact index is black: the two
         outlined marks came out white on white and the row looked like it had
         lost two of its three doors. Ask the pseudo-element directly. */
      const strip = getComputedStyle(document.body, '::before');
      if (strip && strip.content !== 'none' && strip.position === 'fixed') {
        const h = parseFloat(strip.height) || 0;
        if (y <= h) {
          const L = lum(strip.backgroundColor);
          if (L !== null) return L;
        }
      }
      const stack = (document.elementsFromPoint(x, y) || []).filter(e => !doors.contains(e) && !e.closest('nav'));
      for (const el of stack) { const L = lum(getComputedStyle(el).backgroundColor); if (L !== null) return L; }
      return 1;                                    // the page begins white
    };
    const tick = () => {
      const onDark = read() < 0.5;
      if (onDark !== last) { last = onDark; doors.classList.toggle('on-dark', onDark); }
      doors._raf = 0;
    };
    /* And once more after the scrim has finished fading. It transitions over
       380ms, so a read taken the instant the page scrolls still sees it at
       zero and calls a black header white. */
    const ask = () => {
      if (!doors._raf) doors._raf = requestAnimationFrame(tick);
      clearTimeout(doors._settle);
      doors._settle = setTimeout(tick, 460);
    };
    tick();
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    setTimeout(tick, 400);
  })();

  /* No phone menu. The three marks are small enough to stand on a phone as
     they stand everywhere else, so the header is the same header at every
     width: wordmark left, three doors right. A dot that opens a panel of the
     same three words is a second way of saying one thing. */

  /* ── The i, centred on its ink ──────────────────────────────────────────
     A lowercase i is a stem and a tittle with a gap between them, and its
     glyph box carries side bearings that are not equal. Setting it at the
     circle's centre puts the drawn part off-centre, which at this size is
     visible. So it is measured — getBBox gives what the face actually draws
     — and moved by the difference. Re-run when the face loads, because the
     fallback's i is a different shape in a different box. */
  (function centreInfoI() {
    const place = () => {
      // the doors are their own bar, a sibling of nav — not inside it
      document.querySelectorAll('.nav-mark__i').forEach(t => {
        t.removeAttribute('transform');
        let b; try { b = t.getBBox(); } catch (e) { return; }
        if (!b.width || !b.height) return;
        const dx = 8 - (b.x + b.width / 2);
        const dy = 8 - (b.y + b.height / 2);
        t.setAttribute('transform', `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`);
      });
    };
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    addEventListener('resize', place, { passive: true });
  })();

  /* ── Turn the mark as the page scrolls ─────────────────────────────────
     Half a degree to the pixel — a full revolution in 720px, the rate this
     has always had. It stopped turning when the asterisk it was written for
     was replaced: the selector went on looking inside nav for a class that
     no longer existed, while the doors had moved out into a bar of their
     own. Reduced motion holds it still. */
  (function turnMark() {
    const mark = document.querySelector('.nav-door .nav-mark');
    if (!mark) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const turn = () => { mark.style.transform = `rotate(${scrollY * 0.5}deg)`; ticking = false; };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(turn); }
    }, { passive: true });
    turn();
  })();

  /* ── Page transitions ── */
  document.addEventListener('click', e => {
    // Leave modifier / non-primary clicks alone so ⌘/ctrl/shift/middle-click can
    // still open links in a new tab.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download') ||
        /^(https?:|mailto:|tel:)/i.test(href)) return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = href; }, 260);
  });

  // Back/forward can restore this page from the bfcache with 'page-leaving' still
  // applied (body stuck at opacity 0 → blank white screen). Clear it on every show.
  window.addEventListener('pageshow', () => { document.body.classList.remove('page-leaving'); });

  /* The header is fixed, so anything that has to sit below it needs to know how
     tall it is. Measured here once, published as --header-h, and used by the
     homepage band and by a study's section bar. Guessing it left a ten-pixel
     overlap; measuring it does not. */
  (function publishHeaderHeight() {
    const set = () => {
      const h = document.querySelector('body > nav:not(.study-index)');
      if (!h) return;
      const px = Math.round(h.getBoundingClientRect().height);
      if (px) document.documentElement.style.setProperty('--header-h', px + 'px');
    };
    set();
    addEventListener('resize', set);
    addEventListener('load', set);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
    setTimeout(set, 250);
  })();

  // Idle word screensaver — site-wide (nav.js loads on every page, directly or via project.js).
  if (!window.__idleWordsLoaded) {
    window.__idleWordsLoaded = true;
    const s = document.createElement('script');
    s.src = '/workshops/bgsu/shared/idle-words.js';   // absolute: the Lab's case studies sit two levels deep
    document.body.appendChild(s);
  }

  /* The type switch rides along with the nav, so it is on every page the nav is
     on without each page having to ask for it. */
})();

/* ── A picture resolves; it does not appear ────────────────────────────────
   The fault this replaces: you scroll, the box is empty white, and then the
   photograph lands in it at full strength. Three things were wrong.

   The box had nothing in it. Every picture on the site now has a sixteen-pixel
   version of itself — shared/lqip.js, sixty kilobytes for all 283 of them —
   painted into the box, blurred up, before the real file is asked for. You see
   the picture's own colour and shape from the first frame; the photograph then
   resolves out of it.

   It was asked for too late. `loading="lazy"` waits until the box is nearly on
   screen, which on a fast scroll is far too late. The fetch now starts two
   screens early and the attribute comes off.

   It arrived too hard. The cross-fade runs 600ms with the blur underneath it,
   so the picture sharpens rather than switching on.

   Guards: an error or a stall reveals the picture anyway, an image already in
   the cache is never faded, and the QA harness's `reveal-off` skips the lot. */
(function picturesResolve() {
  const off = document.documentElement.classList.contains('reveal-off');
  const LQ = () => window.LQIP || null;

  /* The key is the path from the site root: an <img> on a project page writes
     `../images/x.webp` and the map is keyed `/workshops/bgsu/images/x.webp`. */
  const key = img => {
    const raw = img.getAttribute('src') || img.dataset.src || '';
    if (!raw || /^data:/.test(raw)) return null;
    try { return new URL(raw, location.href).pathname; } catch (e) { return null; }
  };

  /* Four tones — the picture reduced to a 2×2 average — drawn as two crossed
     gradients. That is twenty-three kilobytes for all 283 pictures rather than
     sixty, and it arrives in a single packet: the first version of this shipped
     a sixteen-pixel image of every photograph, and on a slow connection the map
     queued behind the very photographs it was meant to stand in for and landed
     after them. A tone that is the picture's own colour, in the picture's own
     box, is most of what a placeholder is for. */
  const blur = img => {
    const m = LQ(); if (!m) return false;
    const e = m[key(img)]; if (!e) return false;
    if (img.classList.contains('im-lq') && img.style.aspectRatio) return false;
    /* The BOX, before anything is in it. An <img> whose source is still held
       has no intrinsic size, so its height collapsed to nothing and the
       picture snapped the page open when it arrived — small, then suddenly
       right. The real dimensions are in the map, so the box is the picture's
       own shape from the first frame and nothing moves when it lands. Where a
       plate already fixes the height this is ignored, which is correct. */
    if (e[0] && e[1] && !img.style.aspectRatio) {
      img.style.aspectRatio = e[0] + ' / ' + e[1];
    }
    const c = e[2];
    if (!c || c.length < 24) return false;
    const q = i => '#' + c.slice(i * 6, i * 6 + 6);
    img.style.backgroundImage =
      'linear-gradient(135deg, ' + q(0) + ' 0%, ' + q(3) + ' 100%),' +
      'linear-gradient(45deg, ' + q(2) + ' 0%, ' + q(1) + ' 100%)';
    img.style.backgroundBlendMode = 'overlay';
    img.style.backgroundSize = 'cover';
    img.style.backgroundRepeat = 'no-repeat';
    img.classList.add('im-lq');
    return true;
  };

  const done = img => {
    img.classList.add('im-here');
    // the blur is no longer under anything; drop it once the fade has run
    setTimeout(() => {
      img.style.backgroundImage = '';
      img.classList.remove('im-lq');
    }, 700);
  };

  /* The placeholder goes in before the photograph is asked for. Otherwise the
     two race and the photograph wins, which is the empty box all over again.
     The wait is capped: 350ms and the pictures go regardless, so a map that
     never arrives cannot hold up the page. */
  const fetchNow = img => {
    if (img.dataset.imGo) return;
    img.dataset.imGo = '1';
    img.removeAttribute('loading');           // we decide when, not the browser
    // the tone goes in first, then the picture is asked for
    blur(img);
    if (img.dataset.src && !img.getAttribute('src')) img.src = img.dataset.src;
  };

  const io = ('IntersectionObserver' in window) && new IntersectionObserver((es, o) => {
    es.forEach(e => { if (e.isIntersecting) { fetchNow(e.target); o.unobserve(e.target); } });
  }, { rootMargin: '200% 0px' });   // two screens of warning

  const hold = img => {
    if (img.dataset.imIn) return;
    // an <img> with no source yet belongs to something that will fill it in
    // later — a carousel, a lightbox. Blurring an empty element only blurs
    // whatever is put in it afterwards.
    if (!img.getAttribute('src') && !img.dataset.src) return;
    img.dataset.imIn = '1';
    if (!img.getAttribute('decoding')) img.decoding = 'async';

    if (off) { fetchNow(img); return; }

    // already in the cache: nothing to wait for, and fading it in would be a
    // flicker on every page you revisit
    if (img.complete && img.naturalWidth > 0) return;

    blur(img);
    img.classList.add('im');
    img.addEventListener('load', () => done(img), { once: true });
    img.addEventListener('error', () => done(img), { once: true });
    setTimeout(() => done(img), 6000);

    // native lazy loads too late for a fast scroll; ours starts two screens out
    if (io && img.getAttribute('loading') === 'lazy') io.observe(img);
    else fetchNow(img);
  };

  const scan = root => {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === 'IMG') hold(root);
    root.querySelectorAll && root.querySelectorAll('img').forEach(hold);
  };

  scan(document.body);
  // the bands, the carousels and the project pages all render after this file
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(scan)))
    .observe(document.documentElement, { childList: true, subtree: true });
})();

/* ── Video waits its turn ──────────────────────────────────────────────────
   An autoplaying video downloads in full the moment the page opens, wherever
   it sits on the page and whether or not anyone will ever scroll to it. The
   Values project fetched a twenty-megabyte reel — twice, as two range requests
   — before a phone had painted the first paragraph, and that is most of what
   "the images load slowly" actually is.

   So autoplay is taken off every video here and given back when the video is
   about to be on screen. The source is held in `data-src` until then, which is
   the only thing that reliably stops a browser fetching it. Scroll away and it
   pauses; nothing is re-downloaded when you come back.

   `preload="none"` alone does not do this: autoplay overrides it. */
(function videoWaits() {
  const holds = [];
  const hold = v => {
    if (v.dataset.vWait) return;
    v.dataset.vWait = '1';
    v.preload = 'none';
    if (v.autoplay) { v.dataset.vAuto = '1'; v.autoplay = false; }
    v.querySelectorAll('source[src]').forEach(s => {
      s.dataset.src = s.getAttribute('src');
      s.removeAttribute('src');
    });
    if (v.getAttribute('src')) { v.dataset.src = v.getAttribute('src'); v.removeAttribute('src'); }
    v.load();   // drop whatever the parser already started
    holds.push(v);
  };

  const give = v => {
    if (v.dataset.vGiven) return;
    v.dataset.vGiven = '1';
    v.querySelectorAll('source[data-src]').forEach(s => s.setAttribute('src', s.dataset.src));
    if (v.dataset.src) v.setAttribute('src', v.dataset.src);
    v.preload = 'auto';
    v.load();
    if (v.dataset.vAuto) v.play().catch(() => {});
  };

  const io = ('IntersectionObserver' in window) && new IntersectionObserver(es => {
    es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) give(v);
      else if (v.dataset.vGiven && !v.paused) v.pause();   // off screen, stop the work
    });
  }, { rootMargin: '150% 0px' });   // a screen and a half of warning

  const scan = root => {
    if (!root || root.nodeType !== 1) return;
    const vs = root.tagName === 'VIDEO' ? [root] : [...(root.querySelectorAll?.('video') || [])];
    vs.forEach(v => { hold(v); if (io) io.observe(v); else give(v); });
  };

  scan(document.body);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(scan)))
    .observe(document.documentElement, { childList: true, subtree: true });
})();

/* ── No widows ─────────────────────────────────────────────────────────────
   A single word alone on the last line of a paragraph is a hole in the
   setting. The fix is the old one: bind the last two words with a hard space
   so they wrap together and the line can never be one word long.

   Two guards, both learned the hard way:

   · A hard space between two long words cannot be broken, so on a narrow
     column it will push the line out of its measure. Anything over eighteen
     characters for the pair is left alone — a widow is a blemish, a
     horizontal scrollbar is a fault.

   · The last word is often inside a link or a <cite>, which means the space
     to replace lives in the text node BEFORE it. The pass walks the text
     nodes rather than assuming the whole paragraph is one of them.

   `text-wrap: pretty` in the stylesheet does this natively where the browser
   supports it; this is what holds everywhere else, and the two agree. */
(function widows() {
  var SEL = 'p, h1, h2, h3, h4, li, figcaption, blockquote, dd, .lead, .lab-lead';
  var SKIP = 'nav, footer, .footer-thermal, .study-index, .tag, .label, pre, code';
  var NBSP = ' ';
  var MAX_PAIR = 18;

  function fix(el) {
    if (el.dataset.widowed) return;
    if (el.closest(SKIP)) return;
    var text = (el.textContent || '').trim();
    if (!text || text.split(/\s+/).length < 4) return;
    if (text.indexOf(NBSP) >= 0) { el.dataset.widowed = '1'; return; }

    // every text node, in order, that carries something
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walk.nextNode())) { if (/\S/.test(n.nodeValue)) nodes.push(n); }
    if (!nodes.length) return;

    var last = nodes[nodes.length - 1];
    var tail = last.nodeValue.replace(/\s+$/, '');
    var m = /(\S+)$/.exec(tail);
    if (!m) return;
    var lastWord = m[1];

    // is the word before it in the same node, or the one before?
    var head = tail.slice(0, m.index).replace(/\s+$/, '');
    var prev = /(\S+)$/.exec(head);
    var pairLen;

    if (prev) {
      pairLen = prev[1].length + lastWord.length;
      if (pairLen > MAX_PAIR) { el.dataset.widowed = '1'; return; }
      last.nodeValue = head.slice(0, prev.index) + prev[1] + NBSP + lastWord +
                       last.nodeValue.slice(tail.length);
    } else if (nodes.length > 1) {
      // the last word stands alone in its node — bind across the gap
      var before = nodes[nodes.length - 2];
      var bTail = before.nodeValue.replace(/\s+$/, '');
      var bPrev = /(\S+)$/.exec(bTail);
      if (!bPrev) { el.dataset.widowed = '1'; return; }
      pairLen = bPrev[1].length + lastWord.length;
      if (pairLen > MAX_PAIR) { el.dataset.widowed = '1'; return; }
      if (before.nodeValue.length > bTail.length) before.nodeValue = bTail + NBSP;
    }
    el.dataset.widowed = '1';
  }

  function pass() { document.querySelectorAll(SEL).forEach(fix); }

  /* The studies and the project pages write themselves after this file runs,
     so the pass has to wait for them. It is idempotent — a block it has
     already bound is marked and skipped — so running it again costs nothing. */
  var t;
  function later() { clearTimeout(t); t = setTimeout(pass, 120); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later);
  else later();
  var mo = new MutationObserver(later);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); pass(); }, 6000);
})();
