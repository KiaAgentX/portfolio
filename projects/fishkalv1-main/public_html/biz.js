(function(){
/* ================= fishkal business layer ================= */
const FK_CFG=Object.assign({launch:'2026-10-18T10:00:00+04:00'},(window.FK_CONFIG||{}));

/* ---- business strings, 14 languages ---- */
const BIZSTR={
 en:{launch:'Launching in',d:'d',h:'h',m:'m',inst:'Install the app'},
 ar:{launch:'الافتتاح خلال',d:'يوم',h:'ساعة',m:'دقيقة',inst:'نصب التطبيق'},
 tr:{launch:'Açılışa',d:'gün',h:'saat',m:'dk',inst:'Uygulamayı yükle'},
 fr:{launch:'Ouverture dans',d:'j',h:'h',m:'min',inst:"Installer l'appli"},
 es:{launch:'Apertura en',d:'d',h:'h',m:'min',inst:'Instalar app'},
 pt:{launch:'Abertura em',d:'d',h:'h',m:'min',inst:'Instalar app'},
 nl:{launch:'Lancering over',d:'d',h:'u',m:'m',inst:'App installeren'},
 ja:{launch:'オープンまで',d:'日',h:'時間',m:'分',inst:'アプリをインストール'},
 hi:{launch:'लॉन्च में',d:'दिन',h:'घंटे',m:'मिनट',inst:'ऐप इंस्टॉल करें'},
 zh:{launch:'距开业',d:'天',h:'时',m:'分',inst:'安装应用'},
 id:{launch:'Dibuka dalam',d:'hari',h:'jam',m:'menit',inst:'Instal aplikasi'},
 he:{launch:'פתיחה בעוד',d:'ימים',h:'שעות',m:'דקות',inst:'התקנת האפליקציה'},
 fa:{launch:'افتتاح طی',d:'روز',h:'ساعت',m:'دقیقه',inst:'نصب اپ'},
 ko:{launch:'오픈까지',d:'일',h:'시간',m:'분',inst:'앱 설치'}
};

/* ---- engine i18n extensions (en/ar/fa are native) ---- */
I18N.tr={ dir:'ltr', code:'TR', unitM:'m',
  sub:'Derin Av', meta:'Dubai',
  hint:'Kıyıdan ayrılmak için kaydır', cont:'Kaydırmaya devam',
  cue:'Misina çekildiği anda dokun',
  caps:{coast:['Kıyıdan ayrılış','Dubai · 25.20°N 55.27°E'],
        vessel:['Tekne','Dubai balıkçı teknesi'],
        dubai:['Dubai','Açık sular'],
        descent:['İniş','']},
  kickPerfect:'Temiz vuruş', kickOk:'Yakalandı',
  goneK:'Misina gevşedi', goneN:'Hâlâ orada', goneL:'Bir balık hâlâ yolda.',
  close:'Kapat', tag:'Deniz her seferinde bir balık verir. Biz de aynı şekilde getiririz.',
  cta:'Avı keşfet', depth:'Derinlik',
  sndOn:'Sesi aç', sndOff:'Sesi kapat',
  log:'Av defteri', logEmpty:'Henüz yok — deniz bekliyor', logN:'yakalanan', logLast:'son'
};
I18N.fr={ dir:'ltr', code:'FR', unitM:'m',
  sub:'Pêche profonde', meta:'Dubaï',
  hint:'Faites défiler pour quitter la côte', cont:'Continuez à descendre',
  cue:'Touchez quand la ligne tire',
  caps:{coast:['Quitter la côte','Dubaï · 25.20°N 55.27°E'],
        vessel:['Le bateau','Bateau de pêche de Dubaï'],
        dubai:['Dubaï','Eaux libres'],
        descent:['Descente','']},
  kickPerfect:'Touche parfaite', kickOk:'Ferré',
  goneK:"La ligne s'est détendue", goneN:'Toujours là', goneL:'Un poisson est encore en route.',
  close:'Fermer', tag:'La mer donne un poisson à la fois. Nous le ramenons de la même façon.',
  cta:'Découvrir la pêche', depth:'Profondeur',
  sndOn:'Activer le son', sndOff:'Couper le son',
  log:'Journal de pêche', logEmpty:"Rien pour l'instant — la mer attend", logN:'pris', logLast:'dernier'
};
I18N.es={ dir:'ltr', code:'ES', unitM:'m',
  sub:'Pesca profunda', meta:'Dubái',
  hint:'Desliza para dejar la costa', cont:'Sigue bajando',
  cue:'Toca cuando la línea tire',
  caps:{coast:['Dejando la costa','Dubái · 25.20°N 55.27°E'],
        vessel:['El barco','Barco pesquero de Dubái'],
        dubai:['Dubái','Aguas abiertas'],
        descent:['Descenso','']},
  kickPerfect:'Pique limpio', kickOk:'Capturado',
  goneK:'La línea se aflojó', goneN:'Sigue ahí', goneL:'Un pez aún viene en camino.',
  close:'Cerrar', tag:'El mar da un pez a la vez. Así lo traemos.',
  cta:'Descubrir la pesca', depth:'Profundidad',
  sndOn:'Activar sonido', sndOff:'Silenciar',
  log:'Diario de pesca', logEmpty:'Nada aún — el mar espera', logN:'capturados', logLast:'último'
};
I18N.pt={ dir:'ltr', code:'PT', unitM:'m',
  sub:'Pesca Profunda', meta:'Dubai',
  hint:'Role para deixar a costa', cont:'Continue descendo',
  cue:'Toque no momento em que a linha puxar',
  caps:{coast:['Deixando a costa','Dubai · 25.20°N 55.27°E'],
        vessel:['A embarcação','Barco de pesca de Dubai'],
        dubai:['Dubai','Águas abertas'],
        descent:['Descida','']},
  kickPerfect:'Golpe limpo', kickOk:'Embarcado',
  goneK:'A linha afrouxou', goneN:'Ainda por aí', goneL:'Um peixe ainda está a caminho.',
  close:'Fechar', tag:'O mar entrega um peixe de cada vez. Nós o trazemos do mesmo jeito.',
  cta:'Descobrir a pesca', depth:'Profundidade',
  sndOn:'Ativar som', sndOff:'Silenciar',
  log:'Diário de pesca', logEmpty:'Nada ainda — o mar espera', logN:'pescados', logLast:'último'
};
I18N.nl={ dir:'ltr', code:'NL', unitM:'m',
  sub:'Diepzeevangst', meta:'Dubai',
  hint:'Scroll om de kust te verlaten', cont:'Blijf scrollen',
  cue:'Tik zodra de lijn trekt',
  caps:{coast:['De kust achter ons','Dubai · 25.20°N 55.27°E'],
        vessel:['Het vaartuig','Dubai-visboot'],
        dubai:['Dubai','Open water'],
        descent:['Afdaling','']},
  kickPerfect:'Strakke slag', kickOk:'Binnen',
  goneK:'De lijn werd slap', goneN:'Nog daarbuiten', goneL:'Er is nog een vis onderweg.',
  close:'Sluiten', tag:'De zee geeft één vis tegelijk. Zo brengen we ze ook binnen.',
  cta:'Ontdek de vangst', depth:'Diepte',
  sndOn:'Geluid aan', sndOff:'Geluid uit',
  log:'Vangstlog', logEmpty:'Nog niets — de zee wacht', logN:'gevangen', logLast:'laatste'
};
I18N.ja={ dir:'ltr', code:'JA', unitM:'m',
  sub:'ディープキャッチ', meta:'ドバイ',
  hint:'スクロールして海岸を離れる', cont:'そのままスクロール',
  cue:'ラインが引いた瞬間にタップ',
  caps:{coast:['出航','ドバイ · 25.20°N 55.27°E'],
        vessel:['船','ドバイの漁船'],
        dubai:['ドバイ','外海'],
        descent:['潜降','']},
  kickPerfect:'見事な一撃', kickOk:'釣り上げた',
  goneK:'ラインが緩んだ', goneN:'まだそこにいる', goneL:'魚がまだ向かってきている。',
  close:'閉じる', tag:'海は一度に一匹しか与えない。私たちも一匹ずつ持ち帰る。',
  cta:'獲物を見る', depth:'深度',
  sndOn:'サウンドオン', sndOff:'ミュート',
  log:'釣果ログ', logEmpty:'まだ何も——海は待っている', logN:'匹', logLast:'最新'
};
I18N.hi={ dir:'ltr', code:'HI', unitM:'m',
  sub:'डीप कैच', meta:'दुबई',
  hint:'तट छोड़ने के लिए स्क्रॉल करें', cont:'स्क्रॉल जारी रखें',
  cue:'लाइन खिंचते ही टैप करें',
  caps:{coast:['तट से विदा','दुबई · 25.20°N 55.27°E'],
        vessel:['नाव','दुबई की मछुआ नाव'],
        dubai:['दुबई','खुला पानी'],
        descent:['गोता','']},
  kickPerfect:'साफ वार', kickOk:'पकड़ लिया',
  goneK:'लाइन ढीली पड़ गई', goneN:'अभी भी वहाँ है', goneL:'एक मछली अभी भी रास्ते में है।',
  close:'बंद करें', tag:'समंदर एक समय में एक मछली देता है। हम भी उसे ऐसे ही लाते हैं।',
  cta:'शिकार देखें', depth:'गहराई',
  sndOn:'ध्वनि चालू करें', sndOff:'ध्वनि बंद करें',
  log:'पकड़ की डायरी', logEmpty:'अभी कुछ नहीं — समंदर इंतज़ार में है', logN:'पकड़ी गई', logLast:'ताज़ा'
};
I18N.zh={ dir:'ltr', code:'ZH', unitM:'m',
  sub:'深潜捕捞', meta:'迪拜',
  hint:'滚动离开海岸', cont:'继续下滚',
  cue:'鱼线拉动的瞬间点按',
  caps:{coast:['离岸','迪拜 · 25.20°N 55.27°E'],
        vessel:['渔船','迪拜渔船'],
        dubai:['迪拜','外海'],
        descent:['下潜','']},
  kickPerfect:'干净利落', kickOk:'钓到了',
  goneK:'鱼线松了', goneN:'还在水里', goneL:'还有一条鱼正在上钩的路上。',
  close:'关闭', tag:'大海一次只给一条鱼。我们也一条一条地带回。',
  cta:'查看渔获', depth:'深度',
  sndOn:'打开声音', sndOff:'静音',
  log:'渔获记录', logEmpty:'还没有——大海在等待', logN:'条', logLast:'最新'
};
I18N.id={ dir:'ltr', code:'ID', unitM:'m',
  sub:'Tangkap Laut Dalam', meta:'Dubai',
  hint:'Gulir untuk meninggalkan pantai', cont:'Terus gulir',
  cue:'Ketuk saat tali menarik',
  caps:{coast:['Meninggalkan pantai','Dubai · 25.20°N 55.27°E'],
        vessel:['Kapal','Kapal nelayan Dubai'],
        dubai:['Dubai','Perairan terbuka'],
        descent:['Penyelaman','']},
  kickPerfect:'Sambaran bersih', kickOk:'Didaratkan',
  goneK:'Tali mengendur', goneN:'Masih di luar', goneL:'Seekor ikan masih di jalan.',
  close:'Tutup', tag:'Laut memberi satu ikan pada satu waktu. Kami membawanya dengan cara yang sama.',
  cta:'Lihat hasil tangkapan', depth:'Kedalaman',
  sndOn:'Nyalakan suara', sndOff:'Bisukan',
  log:'Catatan tangkapan', logEmpty:'Belum ada — laut menunggu', logN:'tangkapan', logLast:'terakhir'
};
I18N.he={ dir:'rtl', code:'HE', unitM:'m',
  sub:'דיג עמוק', meta:'דובאי',
  hint:'גוללו כדי לעזוב את החוף', cont:'המשיכו לגלול',
  cue:'הקישו ברגע שהחוט נמשך',
  caps:{coast:['עוזבים את החוף','דובאי · 25.20°N 55.27°E'],
        vessel:['הסירה','סירת הדייגים של דובאי'],
        dubai:['דובאי','מים פתוחים'],
        descent:['צלילה','']},
  kickPerfect:'פגיעה נקייה', kickOk:'נידוג',
  goneK:'החוט התרפה', goneN:'עדיין שם', goneL:'דג עדיין בדרך.',
  close:'סגירה', tag:'הים נותן דג אחד בכל פעם. כך גם אנחנו מביאים אותו.',
  cta:'לגלות את השלל', depth:'עומק',
  sndOn:'הפעלת סאונד', sndOff:'השתקה',
  log:'יומן דיג', logEmpty:'בינתיים כלום — הים מחכה', logN:'נידוגו', logLast:'אחרון'
};
I18N.ko={ dir:'ltr', code:'KO', unitM:'m',
  sub:'딥 캐치', meta:'두바이',
  hint:'해안을 떠나려면 스크롤', cont:'계속 스크롤',
  cue:'낚줄이 당겨지는 순간 탭',
  caps:{coast:['출항','두바이 · 25.20°N 55.27°E'],
        vessel:['배','두바이 어선'],
        dubai:['두바이','먼바다'],
        descent:['하강','']},
  kickPerfect:'깔끔한 한 방', kickOk:'잡았다',
  goneK:'낚줄이 풀어졌다', goneN:'아직 거기 있다', goneL:'물고기가 아직 오는 중이다.',
  close:'닫기', tag:'바다는 한 번에 한 마리만 내어준다. 우리도 한 마리씩 가져온다.',
  cta:'어획 보기', depth:'수심',
  sndOn:'소리 켜기', sndOff:'소리 끄기',
  log:'어획 기록', logEmpty:'아직 없음 — 바다가 기다리는 중', logN:'마리', logLast:'최근'
};

/* extra menu entries (en/ar/fa exist in the engine markup) */
(function(){
  const m=document.getElementById('langMenu');
  if(m){
    [['tr','Türkçe'],['fr','Français'],['es','Español'],['pt','Português'],['nl','Nederlands'],
     ['ja','日本語'],['hi','हिन्दी'],['zh','中文'],['id','Indonesia'],['he','עברית'],['ko','한국어']]
    .forEach(p=>{
      const b=document.createElement('button');b.type='button';b.dataset.lang=p[0];b.setAttribute('role','option');b.textContent=p[1];m.appendChild(b);
    });
  }
})();

/* ---- one more species: balool ---- */
SPECIES.push({ id:"balool", weight:9, approach:5000, body:"fusiform", tail:"fork", spiny:false, scale:0.72, beat:6.2,
  cols:["#3d5a68","#0e1a20"], pat:{t:"stripe",c:"rgba(10,20,26,.5)",n:1},
  latin:"Scomberoides lysan",
  name:{en:"Balool",ar:"بالول",fa:"بالول"},
  line:{en:"Spotted leather-jacket — a flash of silver gone in one pull.",
        ar:"بالول منقّط — ومضة فضة تختفي بشدّة واحدة.",
        fa:"خال‌دار نقره‌ای — با یک کشیدن ناپدید می‌شود."} });

/* ---- bottom bar: countdown only (+ install when the browser offers it) ---- */
const bar=document.createElement('div');bar.id='bizBar';
bar.innerHTML='<span class="cd" id="cd2"></span><button id="installBtn" type="button"><svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg><span id="in2t"></span></button>';
document.body.appendChild(bar);

function bizNums(){
  const loc={ar:'ar-AE',fa:'fa-IR',hi:'hi-IN'}[L]||'en-US';
  try{ return new Intl.NumberFormat(loc); }catch(e){ return new Intl.NumberFormat('en-US'); }
}
function renderBiz(){
  const s=BIZSTR[L]||BIZSTR.en, nf=bizNums();
  const end=new Date(FK_CFG.launch).getTime();
  const dd=Math.max(0,end-Date.now());
  const d=Math.floor(dd/864e5), h=Math.floor(dd/36e5)%24, m=Math.floor(dd/6e4)%60;
  const c2=document.getElementById('cd2');
  if(c2)c2.textContent=s.launch+' '+nf.format(d)+' '+s.d+' · '+nf.format(h)+' '+s.h+' · '+nf.format(m)+' '+s.m;
  const i2=document.getElementById('in2t');if(i2)i2.textContent=s.inst;
}
applyLang=(function(orig){return function(l,s){const r=orig(l,s);renderBiz();lbFlag.innerHTML=FLAGS[L]||FLAGS.en;return r;};})(applyLang);
setInterval(renderBiz,1000);

/* ---- country flags (inline SVG — renders on every OS) ---- */
const FLAGS={
 ae_ar:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="20" height="4.7" fill="#00732F"/><rect y="9.3" width="20" height="4.7" fill="#000"/><rect width="6" height="14" fill="#FF0000"/></svg>',
 ar:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect width="20" height="4.7" fill="#00732F"/><rect y="9.3" width="20" height="4.7" fill="#000"/><rect width="6" height="14" fill="#FF0000"/></svg>',
 en:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#012169"/><path d="M0 0l20 14M20 0L0 14" stroke="#fff" stroke-width="2.6"/><path d="M0 0l20 14M20 0L0 14" stroke="#C8102E" stroke-width="1"/><path d="M10 0v14M0 7h20" stroke="#fff" stroke-width="4"/><path d="M10 0v14M0 7h20" stroke="#C8102E" stroke-width="2.2"/></svg>',
 fa:'<svg viewBox="0 0 20 14"><rect width="20" height="4.7" fill="#239f40"/><rect y="4.7" width="20" height="4.7" fill="#fff"/><rect y="9.3" width="20" height="4.7" fill="#da0000"/><path d="M10 5.7c-.95 0-1.7.8-1.7 1.8S9.05 9.3 10 9.3s1.7-.8 1.7-1.8S10.95 5.7 10 5.7zm0 .9c.5 0 .8.4.8.9s-.3.9-.8.9-.8-.4-.8-.9.3-.9.8-.9z" fill="#da0000"/></svg>',
 fr:'<svg viewBox="0 0 20 14"><rect width="6.7" height="14" fill="#0055A4"/><rect x="6.7" width="6.7" height="14" fill="#fff"/><rect x="13.3" width="6.7" height="14" fill="#EF4135"/></svg>',
 es:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#AA151B"/><rect y="3.5" width="20" height="7" fill="#F1BF00"/></svg>',
 tr:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#E30A17"/><circle cx="7.6" cy="7" r="3.1" fill="#fff"/><circle cx="8.3" cy="7" r="2.5" fill="#E30A17"/><path d="M13.9 7l-1.5 1.1.55-1.75L11.5 5.3h1.85L13.9 3.6l.55 1.7h1.85l-1.5 1.05.55 1.75z" fill="#fff"/></svg>',
 pt:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#DA291C"/><rect width="8" height="14" fill="#046A38"/><circle cx="8" cy="7" r="2.6" fill="#FFE900"/></svg>',
 nl:'<svg viewBox="0 0 20 14"><rect width="20" height="4.7" fill="#AE1C28"/><rect y="4.7" width="20" height="4.7" fill="#fff"/><rect y="9.3" width="20" height="4.7" fill="#21468B"/></svg>',
 ja:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="4" fill="#BC002D"/></svg>',
 hi:'<svg viewBox="0 0 20 14"><rect width="20" height="4.7" fill="#FF9933"/><rect y="4.7" width="20" height="4.7" fill="#fff"/><rect y="9.3" width="20" height="4.7" fill="#138808"/><circle cx="10" cy="7" r="1.6" fill="none" stroke="#000080" stroke-width=".7"/></svg>',
 zh:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#DE2910"/><path d="M4.6 2.2l.8 2 2.1.1-1.7 1.3.6 2-1.8-1.2-1.8 1.2.6-2-1.7-1.3 2.1-.1z" fill="#FFDE00"/></svg>',
 id:'<svg viewBox="0 0 20 14"><rect width="20" height="7" fill="#CE1126"/><rect y="7" width="20" height="7" fill="#fff"/></svg>',
 he:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect y="1.6" width="20" height="1.8" fill="#0038b8"/><rect y="10.6" width="20" height="1.8" fill="#0038b8"/><path d="M10 4.2l2.4 4.2H7.6L10 4.2zm0 5.6L7.6 5.6h4.8L10 9.8z" fill="none" stroke="#0038b8" stroke-width=".8"/></svg>',
 ko:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="3.6" fill="#CD2E3A"/><path d="M6.4 7a3.6 3.6 0 007.2 0z" fill="#0047A0"/></svg>'
};
function flagSpan(l){const s=document.createElement('span');s.className='lf';s.setAttribute('aria-hidden','true');s.innerHTML=FLAGS[l]||FLAGS.en;return s;}
document.querySelectorAll('#langMenu button[data-lang]').forEach(btn=>{ if(!btn.querySelector('.lf')) btn.prepend(flagSpan(btn.dataset.lang)); });
const lbFlag=flagSpan(L);document.getElementById('langBtn').prepend(lbFlag);

/* ---- install button ---- */
let deferredPrompt=null;
const instBtn=document.getElementById('installBtn');
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(instBtn)instBtn.style.display='flex';});
addEventListener('appinstalled',()=>{if(instBtn)instBtn.style.display='none';});
if(instBtn&&matchMedia('(display-mode: standalone)').matches)instBtn.style.display='none';
if(instBtn)instBtn.addEventListener('click',()=>{if(deferredPrompt&&deferredPrompt.prompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;});}});

/* footer line in brand panel */
(function(){
  const brand=document.getElementById('brand');
  if(brand&&!document.getElementById('footLine')){
    const f=document.createElement('div');f.id='footLine';
    f.textContent='© 2026 FISHKAL — DUBAI, UAE';
    brand.appendChild(f);
  }
})();

/* ---- logo chip + live Dubai clock ---- */
const LOGO_SVG='<svg width="30" height="19" viewBox="0 0 64 40"><path d="M6 18 C16 4 42 2 56 16 C42 30 16 30 6 18 Z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/><path d="M6 18 L0 10 M6 18 L0 26" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="46" cy="14" r="2.6" fill="#fff"/><path d="M18 33 q7 6 14 0 q7 -6 14 0" fill="none" stroke="#10B6A8" stroke-width="3.4" stroke-linecap="round"/></svg>';
const chip=document.createElement('button');chip.type='button';chip.id='logoChip';
chip.innerHTML=LOGO_SVG+'<span style="display:flex;flex-direction:column;gap:3px"><b>fishkal</b><small>ONLINE SEAFOOD MARKET</small></span><span class="clk" id="dxbClk">--:--</span>';
document.body.appendChild(chip);
chip.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
function tickClk(){try{document.getElementById('dxbClk').textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'}).format(new Date());}catch(e){}}
tickClk();setInterval(tickClk,10000);

/* ---- English default when the visitor has no saved choice ---- */
addEventListener('DOMContentLoaded',()=>{
  let saved='';try{saved=localStorage.getItem('fk_lang')||'';}catch(e){}
  if(!saved)applyLang('en',false);else renderBiz();
});

/* ---- TV remote / keyboard navigation ---- */
addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp','PageDown','PageUp'].includes(e.key)){
    const dy=(e.key==='ArrowDown'||e.key==='PageDown')?1:-1;
    window.scrollBy(0,dy*innerHeight*0.6);
  }
});

/* ===== depth veil + ambient school — living water ===== */
const veil=document.createElement('div');veil.id='depthVeil';document.body.appendChild(veil);
const amb=document.createElement('canvas');amb.id='amb';document.body.appendChild(amb);
const ag=amb.getContext('2d');let AW=0,AH=0;
function ambSize(){const d=Math.min(2,window.devicePixelRatio||1);AW=amb.width=innerWidth*d;AH=amb.height=innerHeight*d;}
addEventListener('resize',ambSize);ambSize();
const HUES=['rgba(126,178,178,','rgba(158,186,164,','rgba(142,164,196,','rgba(196,178,140,'];
const SCHOOL=Array.from({length:16},(_,i)=>({x:Math.random(),y:.5+Math.random()*.45,s:(.6+Math.random()*1.1),
 v:(.018+Math.random()*.05)*(Math.random()<.5?1:-1),h:HUES[i%4],ph:Math.random()*6.28,dy:Math.random()*.06}));
function myFish(g,x,y,s,dir,hue,a,t,ph){
 g.save();g.translate(x,y);g.scale(dir*s,s);g.globalAlpha=a;
 g.fillStyle=hue+'0.55)';
 g.beginPath();g.moveTo(14,0);g.quadraticCurveTo(5,-6.5,-5,-4.5);g.quadraticCurveTo(-10,-2.5,-12,0);
 g.quadraticCurveTo(-10,2.5,-5,4.5);g.quadraticCurveTo(5,6.5,14,0);g.fill();
 g.save();g.translate(-11,0);g.rotate(Math.sin(t*4+ph)*.35);
 g.beginPath();g.moveTo(0,0);g.lineTo(-7,-5.5);g.quadraticCurveTo(-4.5,0,-7,5.5);g.closePath();g.fill();g.restore();
 g.beginPath();g.moveTo(3,-4);g.quadraticCurveTo(-1,-9.5,-6,-4.5);g.closePath();g.fill();
 g.beginPath();g.moveTo(2,4);g.quadraticCurveTo(-1,7.5,-5,4.5);g.closePath();g.fill();
 g.beginPath();g.arc(9,-1.2,1.15,0,7);g.fillStyle='rgba(3,12,16,.9)';g.fill();
 g.beginPath();g.arc(9.4,-1.6,.4,0,7);g.fillStyle='rgba(230,240,240,.8)';g.fill();
 g.restore();
}
(function ambLoop(){
  requestAnimationFrame(ambLoop);
  const d=cam?cam.depth:0;
  veil.style.opacity=(Math.max(0,Math.min(1,(d-0.25)*1.15))*0.9).toFixed(3);
  const a=Math.max(0,Math.min(1,(d-0.3)*2));
  ag.clearRect(0,0,AW,AH);
  if(a<=0.01)return;
  const t=performance.now()/1000;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  for(const f of SCHOOL){
    f.x+=f.v*0.016;if(f.x>1.15)f.x=-0.15;if(f.x<-0.15)f.x=1.15;
    const y=(f.y+Math.sin(t*.5+f.ph)*f.dy)*AH;
    myFish(ag,f.x*AW,y,f.s*dpr*3.2,f.v>0?1:-1,f.h,a*(0.35+f.s*0.3),t,f.ph);
  }
})();
})();
