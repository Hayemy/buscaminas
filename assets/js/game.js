/* Buscaminas — lógica del juego y del caos posterior a la derrota */

const NIVELES={facil:[9,9,10],medio:[16,16,40],dificil:[16,30,99]};
const RUTA_IMG='assets/img/gato.png';
const RUTA_MP3='assets/audio/risa.mp3';

// título gigante + subtítulo amarillo. Se elige uno al azar en cada derrota.
const BURLAS=[['💥 QUÉ MALPARIDEZ 💥','le dio a la mina, aguevad@'],
              ['😂 GONORREA 😂','ni tres clicks aguantó, bro, tres'],
              ['🤡 HIJUEPUTA ENCHIMBADO🤡','una mina. UNA. y usted derechito para allá'],
              ['🪦 R.I.P. 🪦','aquí yace un marica que le dio clic a la bomba']];

// mensaje al fallar el botón trampa. Uno al azar.
const BURLAS2=['🤣 ¡NI AL BOTÓN LE DIO ESTA GONORREA! 🤣',
               '😭 FALLÓ UN BOTÓN, AGUEVADO 😭',
               '👏 BRAVO HIJUEPUTA, FALLÓ  EL CLICK 👏',
               '🐌 SE LE ESCAPÓ UN BOTÓN QUE ESTABA QUIETO, JSJFDJC 🐌',
               '📸 OLEEEEEEE JAJAJAJAJAJJA'];

const $=id=>document.getElementById(id);
const boardEl=$('tablero'),selNivel=$('nivel'),mMinas=$('mMinas'),mTiempo=$('mTiempo');
const caos=$('caos'),burla=$('burla'),sub=$('sub'),otra=$('otra'),gane=$('gane');

let filas,cols,minas,celdas,generado,terminado,banderas,seg,timer;
let esquivado=false;                    // el botón huye una vez por partida (se resetea en nuevo())

const risa=new Audio(RUTA_MP3);
function sonar(veces){                  // n reproducciones seguidas, nunca solapadas
  risa.onended=null;risa.pause();risa.currentTime=0;
  let n=veces;
  risa.onended=()=>{if(--n>0){risa.currentTime=0;risa.play().catch(()=>{})}};
  risa.play().catch(()=>{});
}

/* ---------- tablero ---------- */
const vecinos=i=>{
  const f=(i/cols)|0,c=i%cols,v=[];
  for(let df=-1;df<=1;df++)for(let dc=-1;dc<=1;dc++){
    if(!df&&!dc)continue;
    const nf=f+df,nc=c+dc;
    if(nf>=0&&nf<filas&&nc>=0&&nc<cols)v.push(nf*cols+nc);
  }
  return v;
};

const contar=()=>celdas.forEach((c,i)=>c.n=c.mina?0:vecinos(i).filter(j=>celdas[j].mina).length);

function generar(libre){                // minas después del primer click: nunca explota de entrada
  const prohibido=new Set([libre,...vecinos(libre)]);
  let puestas=0;
  while(puestas<minas){
    const i=Math.floor(Math.random()*celdas.length);
    if(celdas[i].mina||prohibido.has(i))continue;
    celdas[i].mina=1;puestas++;
  }
  contar();generado=true;
  timer=setInterval(()=>{seg++;pintarTiempo()},1000);
}

const fmt=s=>String((s/60)|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const pintarTiempo=()=>mTiempo.textContent='⏱ '+fmt(seg);
const pintarMinas=()=>mMinas.textContent='💣 '+(minas-banderas);
const tamCelda=()=>Math.max(18,Math.min(32,(innerWidth-50)/cols-2))+'px';

function pintar(i){
  const c=celdas[i],d=c.el;
  d.className='celda'+(c.rev?' rev':'');
  d.textContent=c.rev?(c.mina?'💣':c.n||''):(c.flag?'🚩':'');
  if(c.rev&&c.n&&!c.mina)d.classList.add('n'+c.n);
}

function abrir(i){
  if(terminado)return;
  const c=celdas[i];
  if(c.flag||c.rev)return;
  if(!generado)generar(i);
  if(c.mina){c.rev=1;pintar(i);c.el.classList.add('boom');return perder()}
  const pila=[i];
  while(pila.length){                   // flood fill de los ceros
    const j=pila.pop(),cj=celdas[j];
    if(cj.rev||cj.flag)continue;
    cj.rev=1;pintar(j);
    if(!cj.n)vecinos(j).forEach(k=>{if(!celdas[k].rev)pila.push(k)});
  }
  if(celdas.filter(c=>c.rev).length===celdas.length-minas)ganar();
}

function marcar(i){
  if(terminado||!generado)return;
  const c=celdas[i];
  if(c.rev)return;
  c.flag^=1;banderas+=c.flag?1:-1;
  pintar(i);pintarMinas();
}

/* ---------- final de partida ---------- */
function fin(){terminado=true;clearInterval(timer);timer=null}
const limpiarCaos=()=>caos.querySelectorAll('.extra').forEach(e=>e.remove());

function ganar(){
  fin();
  $('ganeTiempo').textContent='Tiempo: '+fmt(seg);
  gane.hidden=false;
}

function perder(){
  fin();
  celdas.forEach((c,i)=>{if(c.mina&&!c.flag){c.rev=1;pintar(i)}});
  const [t,s]=BURLAS[Math.floor(Math.random()*BURLAS.length)];
  burla.textContent=t;sub.textContent=s;
  limpiarCaos();
  sonar(1);
  for(let k=0;k<45;k++){
    const e=document.createElement('span');
    e.className='emoji extra';
    e.textContent='💥😂🤡💀🔥🎉👎😭💣🙃'[Math.floor(Math.random()*10)];
    e.style.left=Math.random()*95+'vw';
    e.style.top=Math.random()*95+'vh';
    e.style.animationDelay=-Math.random()*2+'s';
    caos.appendChild(e);
  }
  // translate y no transform: transform lo pisa la animación tiembla
  otra.style.left='50%';otra.style.top='75%';otra.style.translate='-50% -50%';
  caos.hidden=false;
}

function esquivar(ev){                  // la trampa: una vez por partida
  if(esquivado)return;
  esquivado=true;
  const r=otra.getBoundingClientRect();
  const px=ev&&ev.clientX!=null?ev.clientX:r.left+r.width/2;
  const py=ev&&ev.clientY!=null?ev.clientY:r.top+r.height/2;
  const w=otra.offsetWidth,h=otra.offsetHeight,m=16;
  const esquinas=[[m,m],[innerWidth-w-m,m],[m,innerHeight-h-m],[innerWidth-w-m,innerHeight-h-m]];
  const [x,y]=esquinas.reduce((a,b)=>   // a la esquina más lejana del cursor, nunca al lado
    Math.hypot(b[0]+w/2-px,b[1]+h/2-py)>Math.hypot(a[0]+w/2-px,a[1]+h/2-py)?b:a);
  otra.style.translate='0';
  otra.style.left=x+'px';otra.style.top=y+'px';
  const msg=document.createElement('div');
  msg.id='burla2';msg.className='extra';
  msg.textContent=BURLAS2[Math.floor(Math.random()*BURLAS2.length)];
  caos.appendChild(msg);
  sonar(3);                                     // 3 risas seguidas
  [[8,10],[62,32],[30,58]].forEach(([l,t])=>{   // y 3 gatos más, libres de la franja del mensaje
    const im=new Image();
    im.src=RUTA_IMG;im.className='foto3 extra';
    im.style.left=l+'vw';im.style.top=t+'vh';
    im.style.animationDelay=-Math.random()+'s';
    caos.appendChild(im);
  });
}

/* ---------- arranque ---------- */
function nuevo(){
  clearInterval(timer);timer=null;
  [filas,cols,minas]=NIVELES[selNivel.value];
  celdas=Array.from({length:filas*cols},()=>({mina:0,rev:0,flag:0,n:0}));
  generado=false;terminado=false;banderas=0;seg=0;esquivado=false;
  risa.onended=null;risa.pause();risa.currentTime=0;
  pintarTiempo();pintarMinas();
  boardEl.style.setProperty('--cols',cols);
  boardEl.style.setProperty('--tam',tamCelda());
  boardEl.innerHTML='';
  celdas.forEach((c,i)=>{
    const d=document.createElement('div');
    d.className='celda';
    d.addEventListener('click',()=>abrir(i));
    d.addEventListener('contextmenu',e=>{e.preventDefault();marcar(i)});
    let hold;                                   // móvil: mantener pulsado = bandera
    d.addEventListener('touchstart',()=>{hold=setTimeout(()=>{marcar(i);hold=0},400)},{passive:true});
    d.addEventListener('touchend',e=>{if(!hold){e.preventDefault()}clearTimeout(hold)});
    c.el=d;boardEl.appendChild(d);
  });
  caos.hidden=true;gane.hidden=true;limpiarCaos();
}

otra.addEventListener('pointerenter',esquivar);
otra.addEventListener('click',e=>{if(!esquivado)return esquivar(e);nuevo()});
$('btnNuevo').onclick=nuevo;
$('btnGane').onclick=nuevo;
selNivel.onchange=nuevo;
addEventListener('resize',()=>boardEl.style.setProperty('--tam',tamCelda()));

// self-check: abrir index.html#test y mirar la consola
if(location.hash==='#test'){
  filas=3;cols=3;
  celdas=Array.from({length:9},()=>({mina:0,rev:0,flag:0,n:0}));
  celdas[4].mina=1;contar();
  console.assert(vecinos(0).length===3&&vecinos(4).length===8&&vecinos(1).length===5,'vecinos mal');
  console.assert(celdas.every((c,i)=>i===4||c.n===1),'conteo mal');
  console.log('self-check OK');
}

nuevo();
