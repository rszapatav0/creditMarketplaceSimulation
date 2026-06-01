let U=null,L=null,tierOn=false,esgAllOn=false,esgSel={},confirmed={},currentPage=1,cardsPerPage=3;

function roleName(r){return r==='banco'?'Banco Comercial':r==='coop'?'Cooperativa':'Microfinanciera';}
function getLoans(){return [...(U.role==='banco'?LOANS_BANCO:LOANS_COOP),...LOANS_GRUPO];}

function syncPills(){
  [['tb-u','tb-r'],['tb-u2','tb-r2'],['tb-u3','tb-r3'],['tb-u4','tb-r4'],['tb-u5','tb-r5']].forEach(([uid,rid])=>{
    const eu=document.getElementById(uid),er=document.getElementById(rid);
    if(eu)eu.textContent=U.name;
    if(er){er.textContent=roleName(U.role);er.className='rpill '+U.role;}
  });
}

// WALLET / BALANCE FUNCTIONS
function initBalance(){
  if(!sessionStorage.getItem('wallet_balance')){
    sessionStorage.setItem('wallet_balance','5000');
  }
}

function getBalance(){
  return parseInt(sessionStorage.getItem('wallet_balance')||'0',10);
}

function setBalance(amount){
  sessionStorage.setItem('wallet_balance', Math.floor(amount).toString());
}

function updateBalance(amount){
  const current=getBalance();
  setBalance(current-amount);
  renderBalanceDisplay();
}

function renderBalanceDisplay(){
  const wds=document.querySelectorAll('.wallet-display');
  if(!wds.length)return;
  const balance=getBalance();
  wds.forEach(wd=>wd.textContent=`Saldo disponible: ${balance.toLocaleString('es-HN')} HNL`);
}

function doLogin(){
  const u=document.getElementById('inp-u').value.trim().toLowerCase();
  const p=document.getElementById('inp-p').value;
  const err=document.getElementById('lerr');
  const found=USERS.find(x=>x.email===u&&x.pass===p);
  if(!found){err.classList.add('show');['inp-u','inp-p'].forEach(id=>document.getElementById(id).classList.add('err'));return;}
  err.classList.remove('show');['inp-u','inp-p'].forEach(id=>document.getElementById(id).classList.remove('err'));
  U=found;syncPills();initBalance();renderBalanceDisplay();
  document.getElementById('mkt-title').textContent=U.role==='banco'
    ?'Créditos de acopio disponibles — intermediarios comerciales'
    :'Créditos a productores individuales — contratos inteligentes con importadoras';
  renderLoans();show('s-market');
}
function doLogout(){U=null;sessionStorage.removeItem('wallet_balance');document.getElementById('inp-p').value='';show('s-login');}

function renderLoans(){
  const list=document.getElementById('loan-list');list.innerHTML='';
  getLoans().forEach(l=>{
    const iB=U.role==='banco';
    const isG=l.tipo==='grupo';
    const mA=iB&&!isG?`<div class="mi"><div class="mi-lbl">Monto acopio</div><div class="mi-val mv-b">${l.acopio}</div></div>`:'';
    const mP=isG
      ?`<div class="mi"><div class="mi-lbl">Monto total</div><div class="mi-val mv-g">${l.productores}</div></div>`
      :iB?`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores}</div></div>`:`<div class="mi"><div class="mi-lbl">Monto crédito</div><div class="mi-val mv-o">${l.productores}</div></div>`;
    const mX=isG
      ?`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-m">${l.nProd}</div></div>`
      :iB?`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-m">${l.nProd}</div></div>`:`<div class="mi"><div class="mi-lbl">Importadora</div><div class="mi-val mv-o">${l.contrato}</div></div>`;
    const mF=(iB||isG)&&l.paqueteFlexible!==undefined?`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`:'';
    const smartB=!iB&&!isG?`<span class="badge smart">Smart Contract</span>`:'';
    const badgeClass=isG?'grupo':U.role;
    const badgeLabel=isG?'Grupo de productores':iB?'Acopio':'Productor';
    list.innerHTML+=`<div class="lcard" onclick="openLoan('${l.id}')">
      <div>
        <div class="loan-top"><span class="badge ${badgeClass}">${badgeLabel}</span>${smartB}<span class="loan-name">${l.name}</span></div>
        <div class="loan-region">${l.region} · Plazo: ${l.plazo}</div>
        <div class="loan-meta">${mA}${mP}${mX}${mF}<div class="mi"><div class="mi-lbl">Detalle</div><div class="lock-tag">🔒 Acceso de pago</div></div></div>
      </div>
      <div class="larr">›</div>
    </div>`;
  });
  initPagination();
}

function openLoan(id){L=[...LOANS_BANCO,...LOANS_COOP,...LOANS_GRUPO].find(l=>l.id===id);tierOn=false;esgAllOn=false;esgSel={};renderDetail();show('s-detail');}

function renderDetail(){
  const iB=U.role==='banco';
  const isG=L.tipo==='grupo';
  let h=`<div class="dhdr"><div class="dname">${L.name}</div><div class="dsub">${L.region} · Plazo: ${L.plazo}`;
  if(!iB&&!isG)h+=` &nbsp;·&nbsp; <span style="color:var(--gold);font-size:11px">Smart Contract: ${L.contrato}</span>`;
  h+=`</div></div>`;
  h+=`<div class="tier"><div class="tier-hdr"><div class="tier-hdr-left"><span class="tier-num">01</span><span class="tier-name">Fundamentales del crédito + perfil de productores</span><span class="tier-price">L. ${L.precio} por crédito</span></div><button class="toggle${tierOn?' on':''}" onclick="toggleTier()"></button></div></div>`;
  const nEsg=Object.values(esgSel).filter(Boolean).length;
  const esgItems=ESG.map(e=>`<div class="esg-item${esgSel[e.id]?' sel':''}" onclick="toggleEsg('${e.id}')"><div class="esg-check">${esgSel[e.id]?'✓':''}</div><span class="esg-lbl">${e.label}</span><span class="esg-cost">+L.${e.cost}</span></div>`).join('');
  h+=`<div class="tier"><div class="tier-hdr"><div class="tier-hdr-left"><span class="tier-num">02</span><span class="tier-name">Métricas ESG</span><span class="tier-price">L. 80 por métrica</span></div><span class="tier-count">${nEsg} seleccionadas</span><button class="toggle${esgAllOn?' on':''}" onclick="toggleEsgAll()"></button></div><div class="esg-open"><div class="esg-grid">${esgItems}</div></div></div>`;
  document.getElementById('dmain').innerHTML=h;
  renderCart();
}

function toggleTier(){tierOn=!tierOn;renderDetail();}
function toggleEsg(id){esgSel[id]=!esgSel[id];renderDetail();}
function toggleEsgAll(){esgAllOn=!esgAllOn;if(esgAllOn){ESG.forEach(e=>esgSel[e.id]=true);}else{ESG.forEach(e=>esgSel[e.id]=false);}renderDetail();}

function calcTotal(){
  let t=0;
  if(tierOn)t+=L.precio;
  Object.values(esgSel).forEach(v=>{if(v)t+=80;});
  return t;
}

function renderCart(){
  const esgKeys=Object.keys(esgSel).filter(k=>esgSel[k]);
  let h='';
  if(tierOn||esgKeys.length>0){
    if(tierOn)h+=`<div class="cline"><span class="cl-l">Fundamentales + productores</span><span class="cl-v">L. ${L.precio}</span></div>`;
    if(esgKeys.length>0){
      h+=`<div class="cline"><span class="cl-l">Métricas ESG</span><span class="cl-v">L. ${esgKeys.length*80}</span></div>`;
      esgKeys.forEach(k=>{const e=ESG.find(x=>x.id===k);h+=`<div class="cline sub"><span class="cl-l">${e.label}</span><span class="cl-v">+L.80</span></div>`;});
    }
  } else {
    h=`<div style="font-size:12px;color:var(--text3);padding:8px 0">Active los ítems que desea adquirir.</div>`;
  }
  document.getElementById('cart-lines').innerHTML=h;
  const total=calcTotal();
  document.getElementById('cart-num').textContent=total.toLocaleString('es-HN');
  const cta=document.getElementById('cart-cta');
  const ci=document.getElementById('cart-info');
  cta.disabled=total===0;
  cta.textContent=total===0?'Seleccione al menos un ítem':'Confirmar acceso →';
  if(total>0){ci.style.display='block';ci.textContent='Al confirmar, accederá a la información seleccionada para este crédito específico. La suscripción base (L. 500/mes) cubre el acceso al listado y está activa en su cuenta.';}
  else{ci.style.display='none';}
}

function confirmAccess(){
  const esgKeys=Object.keys(esgSel).filter(k=>esgSel[k]);
  const total=calcTotal();
  const plan=tierOn&&esgKeys.length>0?'Premium':tierOn?'Estándar':esgKeys.length>0?'Solo ESG':'—';
  confirmed={loan:L,total,esgKeys,plan,tierOn,isBanco:U.role==='banco'};
  updateBalance(total);
  document.getElementById('scard').innerHTML=`
    <div class="srow"><span class="sr-l">Institución</span><span class="sr-v">${U.name}</span></div>
    <div class="srow"><span class="sr-l">Crédito</span><span class="sr-v">${L.name}</span></div>
    <div class="srow"><span class="sr-l">Plan activado</span><span class="sr-v">${plan}</span></div>
    <div class="srow"><span class="sr-l">Métricas ESG</span><span class="sr-v">${esgKeys.length} incluidas</span></div>
    <div class="srow"><span class="sr-l">Total cobrado</span><span class="sr-v" style="color:var(--accent)">L. ${total.toLocaleString('es-HN')}</span></div>`;
  show('s-success');
}

function goAccess(){renderAccess();show('s-access');}

function renderProducersSection(l){
  const sec=document.getElementById('producers-section');
  const tbody=document.getElementById('producers-tbody');
  if(!l.paqueteFlexible){
    sec.style.display='none';
    return;
  }
  sec.style.display='block';
  tbody.innerHTML='';
  if(l.prod&&l.prod.length>0){
    l.prod.forEach(p=>{
      const row=document.createElement('tr');
      row.innerHTML=`<td>${p.cod}</td><td>${p.nombre}</td><td>${p.monto}</td><td><input class="finp-s" type="number" placeholder="ej. 20,000"></td><td><input class="finp-s" type="number" step="0.1" placeholder="ej. 14.5"></td><td><input class="finp-s" type="number" placeholder="ej. 6"></td>`;
      tbody.appendChild(row);
    });
  }
}


function computeLoanEsg(loan){
  const prods = loan.prod;
  if(!prods || prods.length === 0) return [];
  // Helper: average bar across producers for a given metric id
  function avgBar(id){
    const vals = prods.map(p => (p.esg.find(m => m.id === id) || {bar:0}).bar);
    return Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
  }
  // Helper: mode of val strings for categorical metrics;
  // on tie, pick the entry with the lowest bar (most conservative).
  function modeVal(id){
    const entries = prods.map(p => p.esg.find(m => m.id === id)).filter(Boolean);
    const freq = {};
    entries.forEach(m => { freq[m.val] = (freq[m.val] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const tied = entries.filter(m => freq[m.val] === maxFreq);
    // among tied entries, pick the one with the lowest bar (most conservative)
    tied.sort((a, b) => a.bar - b.bar);
    return tied[0];
  }
  // Helper: find the producer metric whose bar is closest to a given avg bar
  function reprInterp(id, avgBarVal){
    const entries = prods.map(p => p.esg.find(m => m.id === id)).filter(Boolean);
    entries.sort((a, b) => Math.abs(a.bar - avgBarVal) - Math.abs(b.bar - avgBarVal));
    return entries[0].interp;
  }
  // e1 — Riesgo climático (numeric: bar maps to a 0–10 scale, lower = better)
  // bar = risk * 10, so val = (bar / 10).toFixed(1) + "/10"
  const e1bar = avgBar('e1');
  const e1val = (e1bar / 10).toFixed(1) + '/10';
  const e1level = e1bar < 30 ? 'Bajo' : e1bar < 45 ? 'Medio-bajo' : e1bar < 60 ? 'Medio' : 'Alto';
  // e2 — Adaptación climática (categorical: "N prácticas verificadas")
  const e2mode = modeVal('e2');
  const e2bar  = avgBar('e2');
  // e3 — Fertilidad de suelos (numeric: bar = score/100)
  const e3bar = avgBar('e3');
  const e3level = e3bar >= 75 ? 'Alto' : e3bar >= 60 ? 'Medio' : 'Bajo';
  const e3val = `${e3level} (${e3bar}/100)`;
  // e4 — Disponibilidad hídrica (categorical: "Cuenca estable" or "Estrés leve")
  const e4mode = modeVal('e4');
  const e4bar  = avgBar('e4');
  // e5 — Cobertura forestal (numeric: bar = percentage)
  const e5bar = avgBar('e5');
  const e5val = `${e5bar}% cobertura forestal activa`;
  // e6 — Certificaciones (categorical: Rainforest Alliance, Comercio Justo, Orgánico, Sin certificación)
  const e6mode = modeVal('e6');
  const e6bar  = avgBar('e6');
  // e7 — Huella de carbono (numeric, inverted: bar 100→0.8 kg, bar 0→2.8 kg)
  // formula: kg = 2.8 - (bar * 0.02)  →  bar = (2.8 - kg) * 50
  const e7bar = avgBar('e7');
  const e7kg  = (2.8 - e7bar * 0.02).toFixed(1);
  const e7val = `${e7kg} kg CO₂e / kg café`;
  // e8 — Índice biodiversidad (numeric: bar maps to Shannon 0–4 scale)
  // Shannon ≈ 0.8 + bar * 0.032  (bar 0 → 0.8, bar 100 → 4.0)
  const e8bar = avgBar('e8');
  const e8sh  = (0.8 + e8bar * 0.032).toFixed(1);
  const e8level = e8bar >= 65 ? 'diversidad alta' : e8bar >= 50 ? 'diversidad media-alta' : e8bar >= 35 ? 'diversidad media' : 'diversidad baja';
  const e8val = `Shannon ${e8sh} — ${e8level}`;
  return [
    {id:'e1', label:'Riesgo climático',          val:e1val,         bar:e1bar, detail:ESG_META.find(m=>m.id==='e1').detail, src:ESG_META.find(m=>m.id==='e1').src, interp:`${e1level}. ${reprInterp('e1', e1bar)}`},
    {id:'e2', label:'Medidas de adaptación',      val:e2mode.val,    bar:e2bar, detail:ESG_META.find(m=>m.id==='e2').detail, src:ESG_META.find(m=>m.id==='e2').src, interp:reprInterp('e2', e2bar)},
    {id:'e3', label:'Fertilidad de suelos',       val:e3val,         bar:e3bar, detail:ESG_META.find(m=>m.id==='e3').detail, src:ESG_META.find(m=>m.id==='e3').src, interp:reprInterp('e3', e3bar)},
    {id:'e4', label:'Disponibilidad hídrica',     val:e4mode.val,    bar:e4bar, detail:ESG_META.find(m=>m.id==='e4').detail, src:ESG_META.find(m=>m.id==='e4').src, interp:reprInterp('e4', e4bar)},
    {id:'e5', label:'Planes de manejo forestal',  val:e5val,         bar:e5bar, detail:ESG_META.find(m=>m.id==='e5').detail, src:ESG_META.find(m=>m.id==='e5').src, interp:reprInterp('e5', e5bar)},
    {id:'e6', label:'Certificaciones ambientales',val:e6mode.val,    bar:e6bar, detail:ESG_META.find(m=>m.id==='e6').detail, src:ESG_META.find(m=>m.id==='e6').src, interp:reprInterp('e6', e6bar)},
    {id:'e7', label:'Huella de carbono',          val:e7val,         bar:e7bar, detail:ESG_META.find(m=>m.id==='e7').detail, src:ESG_META.find(m=>m.id==='e7').src, interp:reprInterp('e7', e7bar)},
    {id:'e8', label:'Índice de biodiversidad',    val:e8val,         bar:e8bar, detail:ESG_META.find(m=>m.id==='e8').detail, src:ESG_META.find(m=>m.id==='e8').src, interp:reprInterp('e8', e8bar)},
  ];
}


// ── Per-producer ESG (uses embedded data) ──────────────────────────────────
function prodEsgMetrics(p){
  return p.esg||[];
}

// ── SVG farm map (derived from esgSeed + geo) ─────────────────────────────
function buildMap(p){
  const s=p.esgSeed, W=240, H=188, cx=120, cy=90;
  const hx=i=>(s*(i+3))%256;
  const nPts=6+(hx(0)%3);
  const pts=[];
  const baseR=48+(hx(1)%22);
  for(let i=0;i<nPts;i++){
    const ang=(2*Math.PI*i/nPts)-Math.PI/2;
    const r=baseR+(hx(i+2)%16)-8;
    pts.push([(cx+r*Math.cos(ang)).toFixed(1),(cy+r*Math.sin(ang)).toFixed(1)]);
  }
  const poly=pts.map(q=>q[0]+','+q[1]).join(' ');
  const hpx=(cx+(hx(6)%14)-7).toFixed(1), hpy=(cy+(hx(7)%14)-7).toFixed(1);
  const id='grd'+p.cod.replace(/[^a-z0-9]/gi,'');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;background:#f0fdf7">
    <defs><pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20,0L0,0 0,20" fill="none" stroke="#d1fae5" stroke-width="0.5"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#${id})"/>
    <polygon points="${poly}" fill="#bbf7d0" stroke="#059669" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="${poly}" fill="none" stroke="#6ee7b7" stroke-width="5" stroke-dasharray="3 7" opacity="0.4"/>
    <path d="M${15+hx(8)%25},${15+hx(9)%20} Q${cx+hx(10)%20-10},${cy+hx(11)%16-8} ${W-15-hx(12)%25},${H-15-hx(13)%20}" fill="none" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" opacity="0.65"/>
    <circle cx="${hpx}" cy="${hpy}" r="5" fill="#059669" stroke="white" stroke-width="1.5"/>
    <circle cx="${hpx}" cy="${hpy}" r="9" fill="none" stroke="#059669" stroke-width="1" opacity="0.35"/>
    <g transform="translate(${W-20},16)"><circle r="9" fill="white" stroke="#d1d5db" stroke-width="0.5"/>
      <polygon points="0,-6 -2.5,3 0,1 2.5,3" fill="#059669"/>
      <polygon points="0,6 -2.5,-3 0,-1 2.5,-3" fill="#d1d5db"/>
      <text x="0" y="-9" text-anchor="middle" font-size="6" fill="#374151" font-family="monospace">N</text></g>
    <g transform="translate(8,${H-12})">
      <line x1="0" y1="0" x2="36" y2="0" stroke="#6b7280" stroke-width="1.5"/>
      <line x1="0" y1="-3" x2="0" y2="3" stroke="#6b7280" stroke-width="1.5"/>
      <line x1="36" y1="-3" x2="36" y2="3" stroke="#6b7280" stroke-width="1.5"/>
      <text x="18" y="-5" text-anchor="middle" font-size="7" fill="#6b7280" font-family="monospace">~200m</text></g>
    <rect x="2" y="2" width="130" height="12" rx="2" fill="white" opacity="0.75"/>
    <text x="5" y="10" font-size="7" fill="#374151" font-family="monospace">${p.geo}</text>
  </svg>`;
}

// ── Row expand logic ──────────────────────────────────────────────────────
let _openProd=null;
function toggleProd(cod){
  const eRow=document.getElementById('pexp-'+cod);
  const dRow=document.getElementById('prow-'+cod);
  if(!eRow||!dRow)return;
  if(_openProd&&_openProd!==cod){
    const pe=document.getElementById('pexp-'+_openProd);
    const pd=document.getElementById('prow-'+_openProd);
    if(pe){pe.classList.remove('open');pd.classList.remove('open');}
  }
  const opening=!eRow.classList.contains('open');
  eRow.classList.toggle('open',opening);
  dRow.classList.toggle('open',opening);
  _openProd=opening?cod:null;
  if(opening)fillProd(cod);
}

function findProd(cod){
  for(const l of LOANS_BANCO.concat(LOANS_COOP).concat(LOANS_GRUPO)){
    const p=l.prod.find(x=>x.cod===cod);
    if(p)return p;
  }
  return null;
}

function fillProd(cod, includeEsg=true){
  const cell=document.getElementById('pxc-'+cod);
  if(!cell)return;
  const p=findProd(cod);
  if (!p) return;
  
  let metrics = [];
  if (includeEsg) {
    if (!confirmed.esgKeys || confirmed.esgKeys.length === 0) {
      cell.innerHTML = '';
      return;
    }
    const allMetrics = prodEsgMetrics(p);
    metrics = allMetrics.filter(m => confirmed.esgKeys.includes(m.id));
    if (metrics.length === 0) {
      cell.innerHTML = '';
      return;
    }
  }
  
  const rTag=p.riesgo.includes('negativo')?`<span class="tag eu">✓ Sin reportes</span>`:p.riesgo.includes('mora antigua')?`<span class="tag ok">${p.riesgo}</span>`:`<span class="tag pend">${p.riesgo}</span>`;
  const cTag=p.confianza==='Aval otorgado'?`<span class="tag yes">✓ Aval otorgado</span>`:`<span class="tag pend">${p.confianza}</span>`;
  
  let esgHtml = '';
  if (includeEsg && metrics.length > 0) {
    const cards=metrics.map(m=>`<div class="px-card">
    <div class="px-card-top"><span class="px-card-name">${m.n}</span><span class="px-card-val">${m.val}</span></div>
    <div class="px-card-src">${m.src}</div>
    <div class="px-bar"><div class="px-fill" style="width:${m.bar}%"></div></div>
    <div class="px-card-interp">${m.interp}</div>
  </div>`).join('');
    esgHtml = `<div class="px-esg">
      <div class="px-esg-hdr">Métricas ESG individuales — ${p.nombre}</div>
      ${cards}
    </div>`;
  }
  
  const euTag = p.eu === 'Sí'
    ? `<span class="tag eu">✓ Verificado</span>`
    : `<span class="tag pend">⏳ Pendiente</span>`;

  const profileHtml = `<div class="px-profile">
    <div class="px-profile-hdr">Perfil productivo</div>
    <div class="px-profile-grid">
      <div class="px-pf"><span class="px-pf-l">Variedad</span><span class="px-pf-v">${p.variedad || '—'}</span></div>
      <div class="px-pf"><span class="px-pf-l">Historial de acopio</span><span class="px-pf-v">${p.hist || '—'}</span></div>
      <div class="px-pf"><span class="px-pf-l">Destino del crédito</span><span class="px-pf-v">${p.destino || '—'}</span></div>
      <div class="px-pf"><span class="px-pf-l">Carnet IHCAFE</span><span class="px-pf-v" style="font-family:var(--mono);font-size:11px">${p.carnet || '—'}</span></div>
      <div class="px-pf"><span class="px-pf-l">Geolocalización</span><span class="px-pf-v" style="font-family:var(--mono);font-size:11px">${p.geo || '—'}</span></div>
      <div class="px-pf"><span class="px-pf-l">Verificación EUDR</span><span class="px-pf-v">${euTag}</span></div>
    </div>
  </div>`;
  
  cell.innerHTML=`<div class="px-wrap">
    <div class="px-map-box">
      <div class="px-map-hdr"><span>${p.nombre}</span><span style="color:var(--accent)">${p.variedad}</span></div>
      ${buildMap(p)}
      <div class="px-map-foot">Carnet: ${p.carnet}<br>Central riesgos: ${rTag}<br>Confianza FGR: ${cTag}</div>
    </div>
    <div class="px-right">
      ${profileHtml}
      ${esgHtml}
    </div>
  </div>`;
}

function renderAccess(){
  const {loan:l,esgKeys,plan,tierOn,isBanco}=confirmed;
  const isG=l.tipo==='grupo';
  let h='';
  const mA=isBanco&&!isG?`<div><div class="am-l">Monto acopio</div><div class="am-v mv-b">${l.acopio}</div></div>`:'';
  const mP=isG
    ?`<div><div class="am-l">Monto total</div><div class="am-v mv-g">${l.productores}</div></div>`
    :isBanco?`<div><div class="am-l">Monto productores</div><div class="am-v mv-g">${l.productores}</div></div>`:`<div><div class="am-l">Monto crédito</div><div class="am-v mv-o">${l.productores}</div></div>`;
  const mX=isG
    ?`<div><div class="am-l">Productores</div><div class="am-v">${l.nProd}</div></div>`
    :isBanco?`<div><div class="am-l">Productores</div><div class="am-v">${l.nProd}</div></div>`:`<div><div class="am-l">Importadora</div><div class="am-v mv-o">${l.contrato}</div></div>`;
  const mF=(isBanco||isG)&&l.paqueteFlexible!==undefined?`<div><div class="am-l">Paquete flexible</div><div class="am-v ${l.paqueteFlexible ? 'mv-g' : ''}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`:'';
  h+=`<div class="ahdr"><div class="ahdr-top"><div><div class="aname">${l.name}</div><div class="aregion">${l.region} · Plazo: ${l.plazo}</div></div><div class="aplan">Plan ${plan} · Activo</div></div><div class="ameta">${mA}${mP}${mX}${mF}</div></div>`;
  h+=`<div class="access-actions"><button class="btn-ol" onclick="window.print()">⬇ Exportar PDF</button><button class="btn-offer" onclick="goOffer()">✉ Estructurar oferta de crédito →</button></div>`;

  if(tierOn){
    if(isG){
      h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-b">◈</div><div><div class="sc-title">Información del grupo de productores</div><div class="sc-sub">Perfil colectivo · ${l.nProd} productores vinculados</div></div></div>
      <div class="sc-body"><div class="ig">
        <div class="ic"><div class="ic-l">Monto total solicitado</div><div class="ic-v mv-g">${l.productores}</div><div class="ic-src">Solicitud agregada DIG-IN</div></div>
        <div class="ic"><div class="ic-l">Número de productores</div><div class="ic-v">${l.nProd}</div><div class="ic-src">Registro del grupo</div></div>
        <div class="ic"><div class="ic-l">Plazo referencia</div><div class="ic-v">${l.plazo}</div><div class="ic-src">Promedio ponderado del grupo</div></div>
        ${l.volumenTotal?`<div class="ic"><div class="ic-l">Volumen total estimado</div><div class="ic-v">${l.volumenTotal}</div><div class="ic-src">Declaración del grupo / IHCAFE</div></div>`:''}
        ${l.variedades?`<div class="ic"><div class="ic-l">Variedades cultivadas</div><div class="ic-v" style="font-size:12px">${l.variedades}</div><div class="ic-src">Fichas técnicas IHCAFE</div></div>`:''}
        ${l.destinos?`<div class="ic"><div class="ic-l">Destinos del crédito</div><div class="ic-v" style="font-size:12px">${l.destinos}</div><div class="ic-src">Solicitud del grupo</div></div>`:''}
      </div></div></div>`;
    } else if(isBanco){
      h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-g">◈</div><div><div class="sc-title">Información del intermediario comercializador</div><div class="sc-sub">Perfil operativo y garantías del crédito de acopio</div></div></div>
      <div class="sc-body"><div class="ig">
        <div class="ic"><div class="ic-l">Años de operación</div><div class="ic-v">${l.anios} años</div><div class="ic-src">Registro Mercantil Honduras</div></div>
        <div class="ic"><div class="ic-l">Volumen histórico exportado</div><div class="ic-v">${l.volExport}</div><div class="ic-src">TraceFoodChain / IHCAFE 2024</div></div>
        <div class="ic"><div class="ic-l">Mercados de destino</div><div class="ic-v">${l.mercados}</div><div class="ic-src">Certificados de exportación SAG</div></div>
        <div class="ic"><div class="ic-l">Garantías del crédito</div><div class="ic-v" style="font-size:12px">${l.garantias}</div><div class="ic-src">Declaración del intermediario</div></div>
      </div></div></div>`;
    } else {
      h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-o">◈</div><div><div class="sc-title">Perfil del productor y contrato inteligente</div><div class="sc-sub">Datos productivos, trazabilidad y respaldo contractual</div></div></div>
      <div class="sc-body"><div class="ig">
        <div class="ic"><div class="ic-l">Parcela</div><div class="ic-v">${l.parcela}</div><div class="ic-src">Georreferenciación IHCAFE / TraceFoodChain</div></div>
        <div class="ic"><div class="ic-l">Carnet IHCAFE</div><div class="ic-v">${l.carnet}</div><div class="ic-src">Sistema carnetización IHCAFE 2024</div></div>
        <div class="ic"><div class="ic-l">Variedad cultivada</div><div class="ic-v">${l.variedad}</div><div class="ic-src">Ficha técnica IHCAFE</div></div>
        <div class="ic"><div class="ic-l">Historial con la cooperativa</div><div class="ic-v">${l.hist}</div><div class="ic-src">Registros de acopio TraceFoodChain</div></div>
        <div class="ic"><div class="ic-l">Contrato inteligente</div><div class="ic-v"><span class="tag ok">${l.contrato}</span></div><div class="ic-src">Blockchain DIG-IN / Permarobotics</div></div>
        <div class="ic"><div class="ic-l">Volumen comprometido</div><div class="ic-v">${l.volContrato}</div><div class="ic-src">Smart contract verificado en cadena</div></div>
        <div class="ic"><div class="ic-l">Geolocalización</div><div class="ic-v" style="font-family:var(--mono);font-size:12px">${l.geo}</div><div class="ic-src">App CartoCafé / IHCAFE</div></div>
        <div class="ic"><div class="ic-l">Verificación EUDR</div><div class="ic-v"><span class="tag ${l.eu==='Sí'?'eu':'pend'}">${l.eu==='Sí'?'✓ Verificado (deforestación)':'⏳ En revisión'}</span></div><div class="ic-src">EU Deforestation Regulation Portal</div></div>
        <div class="ic"><div class="ic-l">Central de riesgos</div><div class="ic-v" style="font-size:12px">${l.riesgo}</div><div class="ic-src">CNBS Honduras / Buró de Crédito</div></div>
        <div class="ic"><div class="ic-l">Aval Confianza SA-FGR</div><div class="ic-v"><span class="tag ${l.confianza==='Aval otorgado'?'yes':'pend'}">${l.confianza}</span></div><div class="ic-src">Confianza SA-FGR · FDG Honduras</div></div>
      </div></div></div>`;
    }

    const riesgoTag=p=>`<span class="tag ${p.riesgo.includes('negativo')?'eu':p.riesgo.includes('mora antigua')?'pend':'pend'}">${p.riesgo.includes('Sin reporte negativo')?'✓ Limpio':p.riesgo}</span>`;
    const confTag=p=>`<span class="tag ${p.confianza==='Aval otorgado'?'yes':p.confianza.includes('condición')?'pend':'pend'}">${p.confianza}</span>`;

    h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-b">⊞</div><div><div class="sc-title">Créditos a productores vinculados</div><div class="sc-sub">${l.prod.length} productor${l.prod.length>1?'es':''} · haga clic en una fila para ver mapa y métricas ESG individuales</div></div></div>
    <div class="sc-body" style="padding:0;overflow-x:auto">
      <table class="ptable">
        <thead><tr>
          <th style="width:13%">Código</th><th style="width:16%">Productor</th>
          <th style="width:12%">Monto</th><th style="width:10%">Plazo</th>
          <th style="width:12%">Histórico</th><th style="width:8%">UE</th>
          <th style="width:7%">Aval</th><th style="width:12%">Central riesgos</th>
          <th style="width:10%">Confianza FGR</th>
        </tr>
        <tr><td colspan="9" style="font-size:10px;color:var(--accent);font-family:var(--mono);padding:5px 10px;background:var(--accent-lt);border-bottom:1px solid var(--accent-bd)">↓ Haga clic en una fila para desplegar el mapa de la finca y métricas ESG individuales del productor</td></tr>
        </thead>
        <tbody>${l.prod.map(p=>`
          <tr class="prow" id="prow-${p.cod}" onclick="toggleProd('${p.cod}')">
            <td style="font-family:var(--mono);font-size:11px">${p.cod}</td>
            <td>${p.nombre}</td><td>${p.monto}</td><td>${p.plazo}</td>
            <td>${p.hist}</td>
            <td><span class="tag ${p.eu==='Sí'?'eu':'pend'}">${p.eu==='Sí'?'✓':'Pend.'}</span></td>
            <td class="${p.aval==='A'?'av-a':'av-b'}">${p.aval}</td>
            <td>${riesgoTag(p)}</td>
            <td>${confTag(p)}</td>
          </tr>
          <tr class="prow-exp" id="pexp-${p.cod}"><td colspan="9" id="pxc-${p.cod}"></td></tr>`).join('')}
        </tbody>
      </table>
    </div></div>`;
  }

  if(esgKeys.length>0){
    const loanEsg=computeLoanEsg(confirmed.loan);
    const cards=esgKeys.map(k=>{
      const e=loanEsg.find(x=>x.id===k);
      return `<div class="esg-card"><div class="ec-name">${e.label}</div><div class="ec-val">${e.val}</div><div class="ec-detail">${e.detail}</div><div class="ec-src">${e.src}</div><div class="ebar"><div class="efill" style="width:${e.bar}%"></div></div><div class="ec-interp">${e.interp}</div></div>`;
    }).join('');
    h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-g">✦</div><div><div class="sc-title">Métricas ESG del crédito</div><div class="sc-sub">${esgKeys.length} de 8 métricas · fuentes y metodología</div></div></div><div class="sc-body"><div class="esg-ag">${cards}</div></div></div>`;
  }

  document.getElementById('access-inner').innerHTML=h;
}

function goOffer(){
  const l=confirmed.loan;
  document.getElementById('o-sub').textContent=`${l.name} · ${l.region} · Plazo referencia: ${l.plazo}`;
  const inputs=['of-monto','of-tasa','of-plazo','of-periodo','of-cuota','of-garantia','of-gracia','of-comision','of-seguro','of-aval-conf','of-destino','of-vigencia','of-etapa','of-notas'];
  inputs.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const ev=el.tagName==='INPUT'?'input':'change';
    el.removeEventListener(ev,updatePreview);el.addEventListener(ev,updatePreview);
  });
  renderProducersSection(l);
  updatePreview();show('s-offer');
}

function updatePreview(){
  const v=id=>{const el=document.getElementById(id);return el?el.value:'';};
  const monto=parseFloat(v('of-monto'))||0,tasa=parseFloat(v('of-tasa'))||0,plazo=v('of-plazo'),periodo=v('of-periodo'),cuota=v('of-cuota'),garantia=v('of-garantia'),moneda=v('of-moneda'),comision=parseFloat(v('of-comision'))||0,avalConf=v('of-aval-conf');
  const sym=moneda.startsWith('L')?'L.':'$';
  let cuotaEst='—';
  if(monto>0&&tasa>0&&plazo){const n=parseInt(plazo),r=(tasa/100)/12;const c=r>0?monto*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):monto/n;cuotaEst=`${sym} ${Math.round(c).toLocaleString('es-HN')} / mes`;}
  document.getElementById('op-grid').innerHTML=`
    <div class="op-cell"><div class="op-l">Monto ofertado</div><div class="op-v">${monto>0?sym+' '+monto.toLocaleString('es-HN'):'—'}</div></div>
    <div class="op-cell"><div class="op-l">Tasa anual</div><div class="op-v">${tasa>0?tasa+'%':'—'}</div></div>
    <div class="op-cell"><div class="op-l">Plazo</div><div class="op-v">${plazo?plazo+' meses':'—'}</div></div>
    <div class="op-cell"><div class="op-l">Periodicidad</div><div class="op-v">${periodo||'—'}</div></div>
    <div class="op-cell"><div class="op-l">Cuota estimada</div><div class="op-v">${cuotaEst}</div></div>
    <div class="op-cell"><div class="op-l">Amortización</div><div class="op-v" style="font-size:11px">${cuota||'—'}</div></div>
    <div class="op-cell"><div class="op-l">Garantía</div><div class="op-v" style="font-size:11px">${garantia||'—'}</div></div>
    <div class="op-cell"><div class="op-l">Aval Confianza SA-FGR</div><div class="op-v" style="font-size:11px">${avalConf}</div></div>
    <div class="op-cell"><div class="op-l">Comisión apertura</div><div class="op-v">${comision>0?comision+'%':'—'}</div></div>
    <div class="op-cell"><div class="op-l">Vigencia oferta</div><div class="op-v" style="font-size:11px">${v('of-vigencia')}</div></div>`;
}

function submitOffer(){
  const v=id=>{const el=document.getElementById(id);return el?el.value:'';};
  const monto=parseFloat(v('of-monto'))||0,tasa=parseFloat(v('of-tasa'))||0,plazo=v('of-plazo');
  if(!monto||!tasa||!plazo){alert('Complete al menos el monto, la tasa y el plazo para enviar la oferta.');return;}
  const l=confirmed.loan;const sym=v('of-moneda').startsWith('L')?'L.':'$';
  document.getElementById('offer-sent-card').innerHTML=`
    <div class="srow"><span class="sr-l">Destinatario</span><span class="sr-v">${l.name}</span></div>
    <div class="srow"><span class="sr-l">Región</span><span class="sr-v">${l.region}</span></div>
    <div class="srow"><span class="sr-l">Institución oferente</span><span class="sr-v">${U.name}</span></div>
    <div class="srow"><span class="sr-l">Monto ofertado</span><span class="sr-v">${sym} ${monto.toLocaleString('es-HN')}</span></div>
    <div class="srow"><span class="sr-l">Tasa anual</span><span class="sr-v">${tasa}%</span></div>
    <div class="srow"><span class="sr-l">Plazo</span><span class="sr-v">${plazo} meses</span></div>
    <div class="srow"><span class="sr-l">Periodicidad</span><span class="sr-v">${v('of-periodo')||'No especificado'}</span></div>
    <div class="srow"><span class="sr-l">Aval Confianza SA-FGR</span><span class="sr-v">${v('of-aval-conf')}</span></div>
    <div class="srow"><span class="sr-l">Vigencia</span><span class="sr-v">${v('of-vigencia')}</span></div>
    <div class="srow"><span class="sr-l">Estado</span><span class="sr-v" style="color:var(--blue)">Enviada · Pendiente respuesta</span></div>`;
  show('s-offer-sent');
}

function goMkt(){tierOn=false;esgAllOn=false;esgSel={};currentPage=1;renderLoans();renderBalanceDisplay();show('s-market');}

function show(id){
  document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.style.display='none';});
  const el=document.getElementById(id);
  const flex=['s-login','s-success'];
  el.style.display=flex.includes(id)?'flex':'block';
  el.classList.add('active');
}

function initPagination(){
  const cards=document.querySelectorAll('.loan-list .lcard');
  const totalCards=cards.length;
  const totalPages=Math.ceil(totalCards/cardsPerPage);
  currentPage=1;
  if(totalPages>1){
    document.getElementById('loan-pagination').style.display='flex';
    showPage(currentPage);
  }else{
    document.getElementById('loan-pagination').style.display='none';
  }
}

function showPage(page){
  const cards=document.querySelectorAll('.loan-list .lcard');
  const totalCards=cards.length;
  const totalPages=Math.ceil(totalCards/cardsPerPage);
  const start=(page-1)*cardsPerPage;
  const end=start+cardsPerPage;
  cards.forEach((card,idx)=>{
    card.style.display=idx>=start&&idx<end?'grid':'none';
  });
  document.getElementById('loan-page-info').textContent=`Página ${page} de ${totalPages}`;
  document.getElementById('loan-prev').disabled=page===1;
  document.getElementById('loan-next').disabled=page===totalPages;
}

function nextPage(){
  const cards=document.querySelectorAll('.loan-list .lcard');
  const totalCards=cards.length;
  const totalPages=Math.ceil(totalCards/cardsPerPage);
  if(currentPage<totalPages){
    currentPage++;
    showPage(currentPage);
  }
}

function prevPage(){
  if(currentPage>1){
    currentPage--;
    showPage(currentPage);
  }
}

document.getElementById('inp-p').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('inp-u').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});