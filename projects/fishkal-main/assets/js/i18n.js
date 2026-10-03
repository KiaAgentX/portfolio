/* ============================================================
   FISHKAL — Internationalisation
   ------------------------------------------------------------
   Loads translation dictionary from window.DICT (injected below)
   and exposes:
     window.T(key)         — translate a string
     window.setLang(code)  — change language
     window.tickCd()       — update the countdown chip
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     TRANSLATION DICTIONARY
     ---------------------------------------------------------- */

  const DICT = {

    /* ----- ARABIC ----- */
    ar: {
      'SULTAN IBRAHIM': 'سلطان إبراهيم',
      'FASKAR': 'فصكر',
      'QUEENFISH': 'كوين فيش',
      'BARRACUDA': 'براكودا',
      'Walks the bottom on two small whiskers, wearing one line of gold.': 'يمشي على القاع بشوارب صغيرة، ويحمل خطاً واحداً من الذهب.',
      'Two dark bars at parade rest. Silver that never hurries.': 'خطّان داكنان في استراحة عرض. فضةٌ لا تستعجل أبداً.',
      'A silver dart with a dotted signature. It strikes fast and forgives nothing.': 'سهمٌ فضي بتوقيع منقّط. يهجم سريعاً ولا يصفح عن شيء.',
      'All teeth and patience. The long shadow that crosses the sand without a sound.': 'كلُّه أسنان وصبر. الظلُّ الطويل الذي يعبر الرمل بلا صوت.',
      'Deep Catch': 'الصيد العميق',
      'Dubai': 'دبي',
      'Scroll to leave the coast': 'مرِّر لتغادر الساحل',
      'Keep scrolling': 'واصل التمرير',
      'Tap the moment the line pulls': 'اضغط لحظةَ شدّ الخيط',
      'Strike': 'اصطد',
      'Leaving the coast': 'مغادرة الساحل',
      'Dubai 25.20°N 55.27°E': 'دبي 25.20°ش 55.27°ق',
      'The vessel': 'القارب',
      'Dubai fishing boat': 'قارب صيد من دبي',
      'Working ground': 'ميدان العمل',
      'Descent': 'النزول',
      'Clean strike': 'ضربة نظيفة',
      'Landed': 'تمّ الإنزال',
      'The line went slack': 'ارتخى الخيط',
      'Still out there': 'لا تزال هناك',
      'A fish is still on its way.': 'سمكةٌ ما زالت في الطريق.',
      'HAMMOUR': 'هامور',
      "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish.":
        'ثقيلٌ ومتعمّد وقريب من القاع. أكثر سمكةٍ تطلبها دبي.',
      'KINGFISH': 'كنعد',
      "Straight, fast, and gone before you decide. This one you earned.":
        'مستقيم وسريع ويختفي قبل أن تقرّر. هذا اصطياده استحقاق.',
      'EMPEROR RED SNAPPER': 'شعري أحمر',
      "Rare on the line and unmistakable in the light. A fish worth the wait.":
        'نادرٌ على الخيط ولا يُخطئ في الضوء. سمكة تستحق الانتظار.',
      'SAFI': 'صافي',
      "Small, quick and sweet-fleshed. The people’s fish of the Dubai coast.":
        'صغير وسريع وحلو اللحم. سمكة الناس على ساحل دبي.',
      'SHERI': 'شعري',
      'A fighter in the current, silver-pink in the light. A local favourite.':
        'مقاتل في التيار، ورديّ فضي في الضوء. مفضَّلة أهل الساحل.',
      'BALOOL': 'بالول',
      'Spotted mackerel — a flash of silver gone in one pull.':
        'بالول منقّط — ومضة فضة تختفي بشدّة واحدة.',
      'The sea gives up one fish at a time. We bring it in the same way.':
        'البحر يعطي سمكةً في كل مرة، ونحن نحضرها بالطريقة نفسها.',
      'Discover the catch': 'اكتشف الصيد',
      'Join the waitlist': 'انضم لقائمة الانتظار',
      'Launching in': 'الافتتاح خلال',
      'd': 'يوم',
      'h': 'ساعة',
      'm': 'دقيقة',
      'Dismiss': 'واصل'
    },

    /* ----- ENGLISH ----- */
    en: {
      'SULTAN IBRAHIM': 'Sultan Ibrahim',
      'FASKAR': 'Faskar',
      'QUEENFISH': 'Queenfish',
      'BARRACUDA': 'Barracuda',
      'Walks the bottom on two small whiskers, wearing one line of gold.': 'Walks the bottom on two small whiskers, wearing one line of gold.',
      'Two dark bars at parade rest. Silver that never hurries.': 'Two dark bars at parade rest. Silver that never hurries.',
      'A silver dart with a dotted signature. It strikes fast and forgives nothing.': 'A silver dart with a dotted signature. It strikes fast and forgives nothing.',
      'All teeth and patience. The long shadow that crosses the sand without a sound.': 'All teeth and patience. The long shadow that crosses the sand without a sound.',
      'Deep Catch': 'Deep Catch',
      'Dubai': 'Dubai',
      'Scroll to leave the coast': 'Scroll to leave the coast',
      'Keep scrolling': 'Keep scrolling',
      'Tap the moment the line pulls': 'Tap the moment the line pulls',
      'Strike': 'Strike',
      'Leaving the coast': 'Leaving the coast',
      'Dubai 25.20°N 55.27°E': 'Dubai 25.20°N 55.27°E',
      'The vessel': 'The vessel',
      'Dubai fishing boat': 'Dubai fishing boat',
      'Working ground': 'Dubai waters',
      'Descent': 'Descent',
      'Clean strike': 'Clean strike',
      'Landed': 'Landed',
      'The line went slack': 'The line went slack',
      'Still out there': 'Still out there',
      'A fish is still on its way.': 'A fish is still on its way.',
      'HAMMOUR': 'Hammour',
      "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish.":
        "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish.",
      'KINGFISH': 'Kingfish',
      "Straight, fast, and gone before you decide. This one you earned.":
        'Straight, fast, and gone before you decide. This one you earned.',
      'EMPEROR RED SNAPPER': 'Emperor Red Snapper',
      "Rare on the line and unmistakable in the light. A fish worth the wait.":
        'Rare on the line and unmistakable in the light. A fish worth the wait.',
      'SAFI': 'Rabbitfish',
      "Small, quick and sweet-fleshed. The people’s fish of the Dubai coast.":
        'Small, quick and sweet-fleshed. The people’s fish of the Dubai coast.',
      'SHERI': 'Emperor',
      'A fighter in the current, silver-pink in the light. A local favourite.':
        'A fighter in the current, silver-pink in the light. A local favourite.',
      'BALOOL': 'Spotted mackerel',
      'Spotted mackerel — a flash of silver gone in one pull.':
        'Spotted mackerel — a flash of silver gone in one pull.',
      'The sea gives up one fish at a time. We bring it in the same way.':
        'The sea gives up one fish at a time. We bring it in the same way.',
      'Discover the catch': 'Discover the catch',
      'Join the waitlist': 'Join the waitlist',
      'Launching in': 'Launching in',
      'd': 'd',
      'h': 'h',
      'm': 'm',
      'Dismiss': 'Continue'
    },

    /* ----- FRENCH ----- */
    fr: {
      'SULTAN IBRAHIM': 'Rouget-barbet',
      'FASKAR': 'Faskar',
      'QUEENFISH': 'Scomberoïde',
      'BARRACUDA': 'Barracuda',
      'Walks the bottom on two small whiskers, wearing one line of gold.': "Deux petits barbillons pour marcher sur le fond, une ligne d'or sur le flanc.",
      'Two dark bars at parade rest. Silver that never hurries.': "Deux barres sombres au repos. Un argent qui ne se presse jamais.",
      'A silver dart with a dotted signature. It strikes fast and forgives nothing.': "Une flèche d'argent à la signature pointillée. Elle frappe vite et ne pardonne rien.",
      'All teeth and patience. The long shadow that crosses the sand without a sound.': "Tout en dents et en patience. La longue ombre qui traverse le sable sans un bruit.",
      'Deep Catch': 'Pêche profonde',
      'Dubai': 'Dubaï',
      'Scroll to leave the coast': 'Faites défiler pour quitter la côte',
      'Keep scrolling': 'Continuez',
      'Tap the moment the line pulls': 'Touchez quand la ligne tire',
      'Strike': 'Ferrer',
      'Leaving the coast': 'Quitter la côte',
      'Dubai 25.20°N 55.27°E': 'Dubaï 25.20°N 55.27°E',
      'The vessel': 'Le bateau',
      'Dubai fishing boat': 'Barque de pêche de Dubaï',
      'Working ground': 'Eaux de Dubaï',
      'Descent': 'Descente',
      'Clean strike': 'Touche parfaite',
      'Landed': 'Poisson à bord',
      'The line went slack': "La ligne s'est détendue",
      'Still out there': 'Toujours là-bas',
      'A fish is still on its way.': 'Un poisson est encore en route.',
      'HAMMOUR': 'Mérou',
      "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish.":
        'Lourd, délibéré, près du fond. Le poisson le plus demandé du Golfe.',
      'KINGFISH': 'Thazard',
      "Straight, fast, and gone before you decide. This one you earned.":
        "Droit, rapide, parti avant de décider. Celui-là, vous l’avez mérité.",
      'EMPEROR RED SNAPPER': 'Capitaine',
      "Rare on the line and unmistakable in the light. A fish worth the wait.":
        "Rare à la ligne, inoubliable dans la lumière. Un poisson qui vaut l’attente.",
      'SAFI': 'Sigane',
      "Small, quick and sweet-fleshed. The people’s fish of the Dubai coast.":
        'Petit, rapide, chair douce. Le poisson du peuple de la côte de Dubaï.',
      'SHERI': 'Empereur',
      'A fighter in the current, silver-pink in the light. A local favourite.':
        'Un combattant dans le courant, rose-argent à la lumière. Un favori local.',
      'BALOOL': 'Maquereau tacheté',
      'Spotted mackerel — a flash of silver gone in one pull.':
        'Maquereau tacheté — un éclair d’argent en un seul tirage.',
      'The sea gives up one fish at a time. We bring it in the same way.':
        'La mer donne un poisson à la fois. Nous le ramenons de la même façon.',
      'Discover the catch': 'Découvrir la pêche',
      'Join the waitlist': "Rejoindre la liste d'attente",
      'Launching in': 'Ouverture dans',
      'd': 'j',
      'h': 'h',
      'm': 'min',
      'Dismiss': 'Continuer'
    },

    /* ----- SPANISH ----- */
    es: {
      'SULTAN IBRAHIM': 'Salmonete',
      'FASKAR': 'Faskar',
      'QUEENFISH': 'Pez reina',
      'BARRACUDA': 'Barracuda',
      'Walks the bottom on two small whiskers, wearing one line of gold.': 'Camina por el fondo con dos pequeños barbillones y una línea de oro.',
      'Two dark bars at parade rest. Silver that never hurries.': 'Dos bandas oscuras en reposo. Plata que nunca tiene prisa.',
      'A silver dart with a dotted signature. It strikes fast and forgives nothing.': 'Un dardo plateado con firma de puntos. Ataca rápido y no perdona nada.',
      'All teeth and patience. The long shadow that crosses the sand without a sound.': 'Todo dientes y paciencia. La larga sombra que cruza la arena sin ruido.',
      'Deep Catch': 'Pesca profunda',
      'Dubai': 'Dubái',
      'Scroll to leave the coast': 'Desliza para dejar la costa',
      'Keep scrolling': 'Sigue',
      'Tap the moment the line pulls': 'Toca cuando la línea tire',
      'Strike': 'Clavar',
      'Leaving the coast': 'Dejando la costa',
      'Dubai 25.20°N 55.27°E': 'Dubái 25.20°N 55.27°E',
      'The vessel': 'El barco',
      'Dubai fishing boat': 'Barca de pesca de Dubái',
      'Working ground': 'Aguas de Dubái',
      'Descent': 'Descenso',
      'Clean strike': 'Pique limpio',
      'Landed': 'A bordo',
      'The line went slack': 'La línea se aflojó',
      'Still out there': 'Sigue ahí fuera',
      'A fish is still on its way.': 'Un pez aún viene en camino.',
      'HAMMOUR': 'Mero',
      "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish.":
        'Pesado, deliberado, cerca del fondo. El pez más pedido del Golfo.',
      'KINGFISH': 'Carite',
      "Straight, fast, and gone before you decide. This one you earned.":
        'Recto, rápido y se va antes de decidir. Este lo ganaste.',
      'EMPEROR RED SNAPPER': 'Pargo rojo',
      "Rare on the line and unmistakable in the light. A fish worth the wait.":
        'Raro en la línea e inconfundible a la luz. Vale la espera.',
      'SAFI': 'Conejo',
      "Small, quick and sweet-fleshed. The people’s fish of the Dubai coast.":
        'Pequeño, rápido y de carne dulce. El pez del pueblo de la costa de Dubái.',
      'SHERI': 'Emperador',
      'A fighter in the current, silver-pink in the light. A local favourite.':
        'Un luchador en la corriente, plata-rosa a la luz. Un favorito local.',
      'BALOOL': 'Caballa pintada',
      'Spotted mackerel — a flash of silver gone in one pull.':
        'Caballa pintada — un destello de plata en un tirón.',
      'The sea gives up one fish at a time. We bring it in the same way.':
        'El mar da un pez a la vez. Así lo traemos.',
      'Discover the catch': 'Descubrir la pesca',
      'Join the waitlist': 'Unirse a la lista',
      'Launching in': 'Apertura en',
      'd': 'd',
      'h': 'h',
      'm': 'min',
      'Dismiss': 'Seguir'
    },

    /* ----- TURKISH ----- */
    tr: {
      'SULTAN IBRAHIM': 'Sultan İbrahim',
      'FASKAR': 'Faskar',
      'QUEENFISH': 'Kraliçe balığı',
      'BARRACUDA': 'Barakuda',
      'Walks the bottom on two small whiskers, wearing one line of gold.': 'İki küçük bıyıkla dipte yürür, sırtında tek bir altın çizgi taşır.',
      'Two dark bars at parade rest. Silver that never hurries.': 'İki koyu şerit, dimdik. Asla acele etmeyen bir gümüş.',
      'A silver dart with a dotted signature. It strikes fast and forgives nothing.': 'Noktalı imzalı gümüş bir ok. Hızlı vurur, hiçbir şeyi affetmez.',
      'All teeth and patience. The long shadow that crosses the sand without a sound.': 'Tamamen diş ve sabır. Kumun üzerinden sessizce geçen uzun gölge.',
      'Deep Catch': 'Derin Av',
      'Dubai': 'Dubai',
      'Scroll to leave the coast': 'Kıyıdan ayrılmak için kaydır',
      'Keep scrolling': 'Kaydırmaya devam',
      'Tap the moment the line pulls': 'Misina çekildiği anda dokun',
      'Strike': 'Vur',
      'Leaving the coast': 'Kıyıdan ayrılış',
      'Dubai 25.20°N 55.27°E': 'Dubai 25.20°K 55.27°D',
      'The vessel': 'Tekne',
      'Dubai fishing boat': 'Dubai balıkçı teknesi',
      'Working ground': 'Dubai suları',
      'Descent': 'Dalış',
      'Clean strike': 'Temiz vuruş',
      'Landed': 'Teknede',
      'The line went slack': 'Misina gevşedi',
      'Still out there': 'Hâlâ orada',
      'A fish is still on its way.': 'Bir balık hâlâ yolda.',
      'HAMMOUR': 'Orfoz',
      "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish.":
        "Ağır, ağırbaşlı, dibin yakını. Körfez’in en çok istenen balığı.",
      'KINGFISH': 'Kral balık',
      "Straight, fast, and gone before you decide. This one you earned.":
        'Düz, hızlı ve karar vermeden gider. Bunu hak ettin.',
      'EMPEROR RED SNAPPER': 'Kırmızı iskorpit',
      "Rare on the line and unmistakable in the light. A fish worth the wait.":
        'Misina üstünde nadir, ışıkta unutulmaz. Beklemeye değer.',
      'SAFI': 'Tavşan balığı',
      "Small, quick and sweet-fleshed. The people’s fish of the Dubai coast.":
        'Küçük, hızlı ve tatlı etli. Dubai kıyısının halk balığı.',
      'SHERI': 'İmparator',
      'A fighter in the current, silver-pink in the light. A local favourite.':
        'Akıntıda bir savaşçı, ışıkta gümüş-pembe. Yerel bir favori.',
      'BALOOL': 'Benekli uskumru',
      'Spotted mackerel — a flash of silver gone in one pull.':
        'Benekli uskumru — tek çekişte kaybolan gümüş bir parıltı.',
      'The sea gives up one fish at a time. We bring it in the same way.':
        'Deniz her seferinde bir balık verir. Biz de aynı şekilde getiririz.',
      'Discover the catch': 'Avı keşfet',
      'Join the waitlist': 'Bekleme listesine katıl',
      'Launching in': 'Açılışa',
      'd': 'g',
      'h': 's',
      'm': 'dk',
      'Dismiss': 'Devam'
    }
  };

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */

  let LANG = 'en';

  const FLAGS = {
    ar: '🇦🇪',
    en: '🇬🇧',
    fr: '🇫🇷',
    es: '🇪🇸',
    tr: '🇹🇷'
  };

  const NAMES = {
    ar: 'العربية',
    en: 'English',
    fr: 'Français',
    es: 'Español',
    tr: 'Türkçe'
  };

  /* ----------------------------------------------------------
     TRANSLATION
     ---------------------------------------------------------- */

  function T(key) {
    return (DICT[LANG] && DICT[LANG][key]) || (DICT.en && DICT.en[key]) || key;
  }

  /* ----------------------------------------------------------
     LANGUAGE SWITCHING
     ---------------------------------------------------------- */

  function setLang(code) {
    LANG = code;
    document.documentElement.lang = code;
    document.documentElement.dir = (code === 'ar') ? 'rtl' : 'ltr';

    document.title = (code === 'ar')
      ? 'فيشكال — الصيد العميق | دبي'
      : 'FISHKAL — Deep Catch | Dubai';

    const $ = s => document.querySelector(s);

    const flagEl = $('#langFlag');
    const nameEl = $('#langName');
    if (flagEl) flagEl.textContent = FLAGS[code] || '';
    if (nameEl) nameEl.textContent = (code === 'ar') ? 'العربية' : code.toUpperCase();

    const sub = $('#hero .sub');
    const meta = $('#hero .meta');
    if (sub) sub.textContent = T('Deep Catch');
    if (meta) meta.textContent = T('Dubai');

    const hint = $('#hint');
    if (hint) hint.childNodes[0].nodeValue = T('Scroll to leave the coast');

    const cont = $('#continue');
    if (cont) cont.childNodes[0].nodeValue = T('Keep scrolling');

    const cue = $('#cue');
    if (cue) cue.textContent = T('Tap the moment the line pulls');

    const strike = $('#strike');
    if (strike) strike.textContent = T('Strike');

    const tag = $('#brand .tag');
    if (tag) tag.textContent = T('The Gulf gives up one fish at a time. We bring it in the same way.');

    const cta = $('#cta');
    if (cta) cta.textContent = T('Discover the catch');

    const waTxt = $('#waTxt');
    if (waTxt) waTxt.textContent = T('Join the waitlist');

    const waCta = $('#waCta');
    if (waCta && window.FK) {
      waCta.href = 'https://wa.me/' + window.FK.wa +
                   '?text=' + encodeURIComponent(T('Join the waitlist') + ' — FISHKAL');
    }

    const contactLine = $('#contactLine');
    if (contactLine && window.FK) {
      contactLine.textContent = window.FK.email + ' · ' + window.FK.phone;
    }

    /* Reset caption index so it re-renders */
    if (window.ui) window.ui.capIdx = -1;

    tickCd();

    /* Persist preference */
    try { localStorage.setItem('fk_lang', code); } catch (e) {}
  }

  /* ----------------------------------------------------------
     COUNTDOWN
     ---------------------------------------------------------- */

  function tickCd() {
    if (!window.FK) return;

    const diff = Math.max(0, Date.parse(window.FK.launch) - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;

    const locale = LANG === 'ar' ? 'ar-AE-u-nu-arab' : LANG;
    const nf = new Intl.NumberFormat(locale);

    const cd1 = document.getElementById('cdChip');
    if (cd1) {
      cd1.textContent = T('Launching in') + '  ' +
                        nf.format(d) + ' ' + T('d') + ' · ' +
                        nf.format(h) + ' ' + T('h') + ' · ' +
                        nf.format(m) + ' ' + T('m');
    }

    const cd2 = document.getElementById('cd2');
    if (cd2) {
      cd2.textContent = T('Launching in') + ' ' +
                        nf.format(d) + ' ' + T('d') + ' · ' +
                        nf.format(h) + ' ' + T('h') + ' · ' +
                        nf.format(m) + ' ' + T('m');
    }

    const wa2t = document.getElementById('wa2t');
    if (wa2t) wa2t.textContent = T('Join the waitlist');

    const wa2 = document.getElementById('wa2');
    if (wa2 && window.FK) {
      wa2.href = 'https://wa.me/' + window.FK.wa +
                 '?text=' + encodeURIComponent(T('Join the waitlist') + ' — FISHKAL');
    }
  }

  /* ----------------------------------------------------------
     LANGUAGE DROPDOWN
     ---------------------------------------------------------- */

  function initLangDrop() {
    const ld = document.getElementById('langDrop');
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (!ld || !btn || !menu) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      ld.classList.toggle('open');
    });

    Object.keys(FLAGS).forEach(code => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span>' + FLAGS[code] + '</span>' + NAMES[code];
      b.addEventListener('click', () => {
        setLang(code);
        ld.classList.remove('open');
        if (window.track) window.track('lang_change', { lang: code });
      });
      menu.appendChild(b);
    });

    document.addEventListener('click', () => ld.classList.remove('open'));
  }

  /* ----------------------------------------------------------
     BUSINESS BAR
     ---------------------------------------------------------- */

  function initBizBar() {
    if (document.getElementById('bizBar')) return;

    const bar = document.createElement('div');
    bar.id = 'bizBar';
    bar.innerHTML =
      '<span class="cd" id="cd2"></span>' +
      '<a id="wa2" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
             'stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z"/>' +
          '<path d="M9 9.5c.5 3 2.5 5 5.5 5.5l1-2-2.2-1.1-1 .8c-1-.5-1.7-1.2-2.2-2.2l.8-1L9.8 8.5z"/>' +
        '</svg>' +
        '<span id="wa2t"></span>' +
      '</a>';
    document.body.appendChild(bar);
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  window.DICT     = DICT;
  window.FKDICT   = DICT;
  window.DICT     = DICT;   /* kept for compatibility */
  window.T        = T;
  window.setLang  = setLang;
  window.tickCd   = tickCd;

  /* ----------------------------------------------------------
     AUTO-INIT
     ---------------------------------------------------------- */

  /* Idempotent init — safe even if DOMContentLoaded already fired
     or the event fires twice (all inner steps are guarded). */
  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    initLangDrop();
    initBizBar();

    /* Restore saved language or use default from config */
    let initial = (window.FK && window.FK.defaultLang) || 'en';
    try {
      const saved = localStorage.getItem('fk_lang');
      if (saved && DICT[saved]) initial = saved;
    } catch (e) {}

    setLang(initial);
    setInterval(tickCd, 1000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
