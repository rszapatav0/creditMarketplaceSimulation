let U=null,L=null,tierOn=false,esgAllOn=false,esgSel={},confirmed={},currentPage=1,cardsPerPage=10,purchases={};

// ─── SINGLE SESSION STATE OBJECT ───────────────────────────────────────────────
function defaultState(){
  return {
    sessionGroup: null,
    generalQuestionsCompleted: false,
    generalAnswers: {},
    dismissedLoans: [],
    interactions: {
      notInterested: [],
      viewed: [],
      confirmedAccess: [],
      canceledAccess: []
    },
    offers: {},
    walletBalance: walletInitial,
    additionalQuestionsCompleted: false,
    additionalAnswers: {},
  };
}

function loadState(){
  try {
    const raw = sessionStorage.getItem('appState');
    if(raw) return JSON.parse(raw);
  } catch(e){}
  return defaultState();
}

function saveState(){
  sessionStorage.setItem('appState', JSON.stringify(state));
}

let state = loadState();
let tempDismissedLoans = new Set();
let activeLoanTab = 'yes';


// ─── ───────────────────────────────────────────────
function roleName(r){return r==='banco'?'Banco Comercial':r==='coop'?'Cooperativa':'Microfinanciera';}

function assignSessionGroup(){
  const grupoIds = [...new Set(
    [...LOANS_BANCO, ...LOANS_COOP, ...LOANS_GRUPO]
      .map(l => l.grupoId)
      .filter(id => id != null)
  )].sort((a,b)=>a-b); 
  if(!grupoIds.length) return null;
  // Current rule: derive group from login-time minute (easily swappable)
  const index = new Date().getMinutes() % grupoIds.length;
  return grupoIds[index];
}

function getLoans(){
  const g = state.sessionGroup;
  const filterNo = l => l.grupoId == null || l.grupoId === g;
  return [
    ...LOANS_BANCO_TEST,
    ...LOANS_BANCO.filter(filterNo),
    ...LOANS_COOP_TEST,
    ...LOANS_COOP.filter(filterNo),
    ...LOANS_GRUPO_TEST,
    ...LOANS_GRUPO.filter(filterNo),
  ];
}

function syncPills(){
  [['tb-u','tb-r'],['tb-u2','tb-r2'],['tb-u3','tb-r3'],['tb-u4','tb-r4'],['tb-u5','tb-r5']].forEach(([uid,rid])=>{
    const eu=document.getElementById(uid),er=document.getElementById(rid);
    if(eu)eu.textContent=U.name;
    if(er){er.textContent=roleName(U.role);er.className='rpill '+U.role;}
  });
}

// WALLET / BALANCE FUNCTIONS
function initBalance(){
  if(state.walletBalance === undefined) state.walletBalance = walletInitial;
  saveState();
}

function getBalance(){
  return state.walletBalance ?? 0;
}

function setBalance(amount){
  state.walletBalance = Math.floor(amount);
  saveState();
}

function updateBalance(amount){
  setBalance(getBalance() - amount);
  renderBalanceDisplay();
}

function renderBalanceDisplay(){
  const wds=document.querySelectorAll('.wallet-display');
  if(!wds.length)return;
  const balance=getBalance();
  wds.forEach(wd=>{wd.textContent=`Saldo disponible: ${balance.toLocaleString('es-HN')} HNL`;
  if(balance < 0){wd.classList.add('negative');}else{wd.classList.remove('negative');}});
}

function doLogin(){
  const u=document.getElementById('inp-u').value.trim().toLowerCase();
  const p=document.getElementById('inp-p').value;
  const err=document.getElementById('lerr');
  const found=USERS.find(x=>x.email===u&&x.pass===p);
  if(!found){err.classList.add('show');['inp-u','inp-p'].forEach(id=>document.getElementById(id).classList.add('err'));return;}
  err.classList.remove('show');['inp-u','inp-p'].forEach(id=>document.getElementById(id).classList.remove('err'));
  U=found;
  state.sessionGroup = assignSessionGroup();
  saveState();
  syncPills();initBalance();renderBalanceDisplay();
  document.getElementById('mkt-title').textContent='Oportunidades de crédito disponibles';
  showGeneralQuestions();show('s-market');
}

function endSession(){
  // Future: await fetch('/api/sessions', { method:'POST', body: JSON.stringify(state) })
  doLogout();
}

function doLogout(){
  U=null;
  purchases={};
  state = defaultState();
  sessionStorage.removeItem('appState');
  document.getElementById('inp-p').value='';
  show('s-login');
}

function dismissLoan(id, event){
  event.stopPropagation();
  const loan = getLoans().find(l => l.id === id);
  if(loan?.testValue === 'yes'){
    tempDismissedLoans.add(id);
    renderLoans();
    return;
  }
  if(!state.dismissedLoans.includes(id)) state.dismissedLoans.push(id);
  if(!state.interactions.notInterested.includes(id)) state.interactions.notInterested.push(id);
  saveState();
  renderLoans();
}

function switchLoanTab(tab){
 if(activeLoanTab === 'yes' && tab !== 'yes'){tempDismissedLoans.clear();}
  activeLoanTab=tab;
  currentPage=1;
  document.querySelectorAll('.loan-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.getElementById('loan-demo-info').style.display =tab === 'yes' ? 'block' : 'none';
  document.getElementById('loan-card-info').style.display =tab === 'no' ? 'block' : 'none';
  renderLoans();
}

function finishGeneralQuestions(){
  const requiredFields = ['participant-name','institution-name','institution-type','institution-role','experience-years','agr-experience-years','age-range','sex'];
  if(document.getElementById('institution-type').value === 'otro'){requiredFields.push('institution-other');}
  if(document.getElementById('institution-role').value === 'otro'){requiredFields.push('role-other');}
  const missing = requiredFields.find(id =>!document.getElementById(id)?.value.trim());
  /*if(missing){
    alert('Por favor complete todas las preguntas antes de continuar.');
    document.getElementById(missing)?.focus();return;}*/
      state.generalQuestionsCompleted = true;
      state.generalAnswers = {
        participantName:     document.getElementById('participant-name').value.trim(),
        institutionName:     document.getElementById('institution-name').value.trim(),
        institutionType:     document.getElementById('institution-type').value,
        institutionOther:    document.getElementById('institution-other').value.trim(),
        institutionRole:     document.getElementById('institution-role').value,
        roleOther:           document.getElementById('role-other').value.trim(),
        experienceYears:     document.getElementById('experience-years').value,
        agrExperienceYears:  document.getElementById('agr-experience-years').value,
        ageRange:            document.getElementById('age-range').value,
        sex:                 document.getElementById('sex').value,
        interestCoop:        document.getElementById('interest-coop').value,
        interestGrupo:       document.getElementById('interest-grupo').value,
        interestBanco:       document.getElementById('interest-banco').value,
      };
    saveState();
    //document.getElementById('general-tab').disabled       = true;
    document.querySelector('[data-tab="yes"]').disabled   = false;
    document.querySelector('[data-tab="no"]').disabled    = false;
    switchLoanTab('yes');
}

function toggleOther(select){
  const input=document.querySelector(`[data-other-for="${select.id}"]`);
  if(!input) return;
  const enabled = select.value === 'otro';
  input.disabled = !enabled;
  if(enabled){input.placeholder = 'Especifique...';
  }else{input.placeholder = 'No aplica';}
}

function showAdditionalQuestions(){
  document.querySelectorAll('.loan-tab').forEach(b=>{b.classList.remove('active');});
  document.getElementById('questions-tab').classList.add('active');
  document.getElementById('loan-demo-info').style.display = 'none';
  document.getElementById('loan-card-info').style.display = 'none';
  document.getElementById('loan-list')
  .innerHTML = `
  <div class="o-form"><div>
    <div class="fs-title">Bloque de interés</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">¿Qué tan interesante le resultan los créditos de demostración?</label>
        <div class="fhelp">Responda en una escala del 1 al 10, siendo 1 "muy poco interesante" y 10 "muy interesante".</div> 
        <select class="fsel" id="aq1" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select></div>
      <div class="fg full"><label class="flabel">¿Cree que estos créditos podrían resolver una necesidad que su institución tiene hoy?</label>
        <select class="fsel" id="aq2" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="yes">Sí</option><option value="no">No</option></select></div>
    </div></div>
    <div class="fs-title">Bloque de valor percibido</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">Si tuviera acceso a una suscripción que le permitiera ver créditos más personalizados, ¿cuánto estaría dispuesto(a) a pagar mensualmente?</label><input class="finp-s" id="aq3" type="number" placeholder="Lempiras"></div>
      <div class="fg full"><label class="flabel">¿Qué características debería incluir la suscripción para que ese monto sea justo para usted?</label><input class="finp-s" id="aq4" type="text"></div>
    </div>
    <div class="fs-title">Bloque de uso</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">¿Con qué frecuencia cree que utilizaría esta suscripción si estuviera disponible?</label>
        <div class="fhelp">Responda en una escala del 1 al 10, siendo 1 "no lo utilizaría" y 10 "lo utilizaría mucho".</div> 
        <select class="fsel" id="aq5" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select></div>
      <div class="fg full"><label class="flabel">¿Prefiere recibir alertas sobre nuevos créditos disponibles o prefiere buscarlos solo cuando lo necesite?</label>
        <select class="fsel" id="aq6" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="alertas">Recibir alertas</option><option value="buscar">Buscar cuando lo necesite</option></select></div>
    </div></div>
    <div class="btn-row">
      <button class="btn-p" onclick="finishAdditionalQuestions()">Continuar</button>
    </div>`;
}

function finishAdditionalQuestions(){
  const requiredFields2 = ['aq1','aq2','aq3','aq4','aq5','aq6'];
  const missing = requiredFields2.find(id =>!document.getElementById(id)?.value.trim());
  if(missing){
    alert('Por favor complete todas las preguntas antes de continuar.');
    document.getElementById(missing)?.focus();return;}
  state.additionalQuestionsCompleted = true;
  state.additionalAnswers = {
    aq1: document.getElementById('aq1').value,
    aq2: document.getElementById('aq2').value,
    aq3: document.getElementById('aq3').value,
    aq4: document.getElementById('aq4').value,
    aq5: document.getElementById('aq5').value,
    aq6: document.getElementById('aq6').value,
  };
  saveState();
  document.getElementById('questions-tab').disabled = false;
  document.querySelector('[data-tab="no"]').disabled = false;
  document.querySelector('[data-tab="yes"]').disabled = false;
  switchLoanTab('yes');
}

function showGeneralQuestions(){
  document.querySelectorAll('.loan-tab').forEach(b=>{b.classList.remove('active');});
  document.getElementById('general-tab').classList.add('active');
  document.querySelector('[data-tab="yes"]').disabled = false;
  document.getElementById('questions-tab').disabled  = false;
  document.querySelector('[data-tab="no"]').disabled  = false;
  document.getElementById('loan-demo-info').style.display = 'none';
  document.getElementById('loan-card-info').style.display = 'none';
  document.getElementById('loan-list')
  .innerHTML = `
  <div class="o-form"><div>
    <div class="fs-title">Información general</div>
    <div class="frow">
      <div class="fg"><label class="flabel">Nombre del participante</label><input class="finp-s" id="participant-name" type="text"></div>
      <div class="fg"><label class="flabel">Nombre de la institución a la que pertenece</label><input class="finp-s" id="institution-name" type="text"></div>
      <div class="fg"><label class="flabel">Tipo de institución</label>
        <select class="fsel" id="institution-type" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="banco">Banco comercial</option><option value="microfinanciera">Microfinanciera</option><option value="cooperativa">Cooperativa</option><option value="otro">Otro</option></select></div>
      <div class="fg"><label class="flabel">Otro tipo de institución</label><input class="finp-s" id="institution-other" data-other-for="institution-type" type="text" disabled></div>
      <div class="fg"><label class="flabel">Rol en la institución</label>
        <select class="fsel" id="institution-role" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="analista">Analista de crédito</option><option value="oficial">Oficial / asesor de crédito</option><option value="coordinador">Coordinador(a) o jefe(a) de crédito</option><option value="gerencia">Gerencia o dirección</option><option value="otro">Otro</option></select></div>
      <div class="fg"><label class="flabel">Otro rol en la institución</label><input class="finp-s" id="role-other" data-other-for="institution-role" type="text" disabled></div>
      <div class="fg"><label class="flabel">Experiencia en evaluación y asignación de crédito</label><select class="fsel" id="experience-years"><option value="">Seleccionar...</option>
        <option value="lt1">Menos de 1 año</option><option value="1to4">Entre 1 y menos de 4 años</option><option value="4to7">Entre 4 y menos de 7 años</option><option value="7plus">7 años o más</option></select></div>
      <div class="fg"><label class="flabel">Experiencia en evaluación y asignación de crédito agrícola</label><select class="fsel" id="agr-experience-years"><option value="">Seleccionar...</option>
        <option value="lt1">Menos de 1 año</option><option value="1to4">Entre 1 y menos de 4 años</option><option value="4to7">Entre 4 y menos de 7 años</option><option value="7plus">7 años o más</option></select></div>
      <div class="fg"><label class="flabel">Rango de edad</label><select class="fsel" id="age-range"><option value="">Seleccionar...</option>
        <option value="lt30">Menos de 30 años</option><option value="30to40">Entre 30 y menos de 40 años</option>
        <option value="40to50">Entre 40 y menos de 50 años</option><option value="50plus">50 años o más</option></select></div>
      <div class="fg"><label class="flabel">Sexo</label><select class="fsel" id="sex"><option value="">Seleccionar...</option>
        <option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="otro">Otro</option></select></div>
    </div></div></div>
    <div class="btn-row">
      <button class="btn-p" onclick="finishGeneralQuestions()">Continuar</button>
    </div>`;
  document.getElementById('loan-pagination').style.display='none';
}

function finishGeneralQuestions(){
  const requiredFields = ['participant-name','institution-name','institution-type','institution-role','experience-years','agr-experience-years','age-range','sex','interest-coop','interest-grupo','interest-banco'];
  if(document.getElementById('institution-type').value === 'otro'){requiredFields.push('institution-other');}
  if(document.getElementById('institution-role').value === 'otro'){requiredFields.push('role-other');}
  const missing = requiredFields.find(id =>!document.getElementById(id)?.value.trim());
  if(missing){
    alert('Por favor complete todas las preguntas antes de continuar.');
    document.getElementById(missing)?.focus();return;}
      state.generalQuestionsCompleted = true;
      state.generalAnswers = {
        participantName:     document.getElementById('participant-name').value.trim(),
        institutionName:     document.getElementById('institution-name').value.trim(),
        institutionType:     document.getElementById('institution-type').value,
        institutionOther:    document.getElementById('institution-other').value.trim(),
        institutionRole:     document.getElementById('institution-role').value,
        roleOther:           document.getElementById('role-other').value.trim(),
        experienceYears:     document.getElementById('experience-years').value,
        agrExperienceYears:  document.getElementById('agr-experience-years').value,
        ageRange:            document.getElementById('age-range').value,
        sex:                 document.getElementById('sex').value,
        interestCoop:        document.getElementById('interest-coop').value,
        interestGrupo:       document.getElementById('interest-grupo').value,
        interestBanco:       document.getElementById('interest-banco').value,
      };
    saveState();
    document.getElementById('general-tab').disabled       = false;
    document.querySelector('[data-tab="yes"]').disabled   = false;
    document.getElementById('questions-tab').disabled     = false;
    document.querySelector('[data-tab="no"]').disabled    = false;
    switchLoanTab('yes');
}

function toggleLoanCard(event, card, id){
  event.stopPropagation();
  if(!state.interactions.viewed.includes(id)){state.interactions.viewed.push(id);saveState();}
  const wasExpanded = card.classList.contains('expanded');
  document.querySelectorAll('.lcard.expanded').forEach(c => {c.classList.remove('expanded');});
  if(!wasExpanded){card.classList.add('expanded');}
}

function renderLoans(){
  const list=document.getElementById('loan-list');list.innerHTML='';
  getLoans()
  .filter(l=>!state.dismissedLoans.includes(l.id) && !tempDismissedLoans.has(l.id) && l.testValue === activeLoanTab)
    .sort((a,b)=>new Date(a.fechaDesembolso)-new Date(b.fechaDesembolso)) /*change a with b to invert order*/
  .forEach(l=>{
    const isG=l.tipo==='grupo';
    const isB=l.tipo==='banco';
    const mX=`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-g">${l.nProd}</div></div>`
    const mP=`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores} Lempiras</div></div>`
    const mA=`<div class="mi"><div class="mi-lbl">Monto acopio</div><div class="mi-val mv-m">${l.acopio ?? 0} Lempiras</div></div>`;
    const mF=`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`;
    const badgeClass=isG?'grupo':l.tipo;
    const badgeLabel=isG?'Grupo de productores':isB?'Acopio + Grupo de productores':'Productor';
    const esgFund = l.testValue === 'no' ? `<div class="mi"><div class="mi-lbl">Fundamentales</div><div class="mi-val mv-m">${l.fundamentales ? 'Sí' : 'No'}</div></div>` : '';
    const esgAcli = l.testValue === 'no' ? `<div class="mi"><div class="mi-lbl">aCLIMAtar</div><div class="mi-val mv-m">${l.aclimatar ? 'Sí' : 'No'}</div></div>` : '';
    const esgCrop = l.testValue === 'no' ? `<div class="mi"><div class="mi-lbl">Croppie</div><div class="mi-val mv-m">${l.croppie ? 'Sí' : 'No'}</div></div>` : '';
    const esgWhis = l.testValue === 'no' ? `<div class="mi"><div class="mi-lbl">Whisp</div><div class="mi-val mv-m">${l.whisp ? 'Sí' : 'No'}</div></div>` : '';
    const esgPric = l.testValue === 'no' ? `<div class="mi"><div class="mi-lbl">Precio total</div><div class="mi-val mv-g">${l.priceTotal} Lempiras por productor</div></div>` : '';
    
    const isNo = l.testValue === 'no';
    list.innerHTML += `
    <div class="lcard ${isNo?'expandable':''}"${isNo?`onclick="toggleLoanCard(event,this,'${l.id}')"`:`onclick="openLoan('${l.id}')"`}><div>
    <div class="loan-top"><span class="badge ${badgeClass}">${badgeLabel}</span><span class="loan-name">${l.name}</span></div>
    <div class="loan-meta">${mX}${mP}${mA}${mF}<div class="mi"><div class="mi-lbl">Detalle</div><div class="lock-tag">🔒 Acceso de pago</div></div></div>
    ${isNo? `<div class="loan-extra">
      <div class="loan-extra-title">Información incluida</div>
      <div class="loan-extra-help">El crédito dispone de la siguiente información: </div>
      <div class="loan-meta">${esgFund}${esgAcli}${esgCrop}${esgWhis}${esgPric}</div>
      <div class="loan-actions"><button class="btn-dismiss" onclick="dismissLoan('${l.id}',event)">No me interesa</button><button class="btn-confirm" onclick="confirmAccess('${l.id}',event)">Confirmar acceso →</button></div>` : ''}</div>
    ${!isNo? `<button class="btn-dismiss" onclick="dismissLoan('${l.id}',event)" title="No me interesa">No me interesa</button>` : ''}</div>`;

  });
  if(activeLoanTab === 'no'){
    const remaining = getLoans().filter(l => !state.dismissedLoans.includes(l.id) && l.testValue === 'no');
    if(remaining.length === 0){
      list.innerHTML = `
        <div class="btn-row" style="margin-top:2rem">
          <button class="btn-p" onclick="endSession()">Enviar →</button>
        </div>`;
      document.getElementById('loan-pagination').style.display = 'none';
      return;
    }}
  initPagination();
}

function openLoan(id){
  L=[...LOANS_BANCO_TEST,...LOANS_BANCO,...LOANS_COOP_TEST,...LOANS_COOP,...LOANS_GRUPO_TEST,...LOANS_GRUPO]
  .find(l=>l.id===id);
  if(!state.interactions.viewed.includes(id)) state.interactions.viewed.push(id);
  saveState();
  if(purchases[id]){confirmed=purchases[id];renderAccess();show('s-access');return;}tierOn=false;esgAllOn=false;esgSel={};renderDetail();show('s-detail');
}

function renderDetail(){
  const isB=L.tipo==='banco';
  const isG=L.tipo==='grupo';
  let h=`<div class="dhdr"><div class="dname">${L.name}</div>`;
  h+=`</div></div>`;
  if(L.testValue==='no'){
    const fundOn=L.fundamentales===true;
    const fundPriceHtml=(L.priceFundamentales!==null&&L.priceFundamentales!==undefined)?`<span class="tier-price"></span>`:'';
    h+=`<div class="tier"><div class="tier-hdr"><div class="tier-hdr-left"><span class="tier-num">01</span><span class="tier-name">Fundamentales del crédito + perfil de productores</span></div><button class="toggle${fundOn?' on':''}" disabled style="pointer-events:none;cursor:default;opacity:${fundOn?'1':'.45'}"></button></div></div>`;

    const toolsDef=[
      {key:'aclimatar',label:'aCLIMAtar'},
      {key:'whisp',label:'Whisp - Open Foris'},
      {key:'croppie',label:'Croppie'},
    ];
    let nToolsOn=0;
    const esgItems=toolsDef.map(t=>{
      const on=L[t.key]===true;
      if(on)nToolsOn++;
      return `<div class="esg-item${on?' sel':''}" style="pointer-events:none;cursor:default;opacity:${on?'1':'.45'}"><div class="esg-check">${on?'✓':''}</div><span class="esg-lbl">${t.label}</span></div>`;
    }).join('');
    const toolsOn=nToolsOn>0;
    const toolsPriceHtml=(L.priceTools!==null&&L.priceTools!==undefined)?`<span class="tier-price">L. ${L.priceTools}</span>`:'';
    h+=`<div class="tier"><div class="tier-hdr"><div class="tier-hdr-left"><span class="tier-num">02</span><span class="tier-name">Herramientas de análisis climático</span></div><span class="tier-count">${nToolsOn} seleccionadas</span><button class="toggle${toolsOn?' on':''}" disabled style="pointer-events:none;cursor:default;opacity:${toolsOn?'1':'.45'}"></button></div><div class="esg-open"><div class="esg-grid">${esgItems}</div></div></div>`;

    document.getElementById('dmain').innerHTML=h;
    renderCartFixed(fundOn,toolsOn);
    return;
  }
  h+=
  `<div class="tier"><div class="tier-hdr"><div class="tier-hdr-left"><span class="tier-num">01</span><span class="tier-name">Fundamentales del crédito + perfil de productores</span><span class="tier-count">L. ${precioFundamentales} por productor</span>
  </div><button class="toggle${tierOn?' on':''}" onclick="toggleTier()"></button></div></div>`;
  const nEsg=Object.values(esgSel).filter(Boolean).length;
  const esgItems=ESG.map(e=>`<div class="esg-item${esgSel[e.id]?' sel':''}" onclick="toggleEsg('${e.id}')"><div class="esg-check">${esgSel[e.id]?'✓':''}</div><span class="esg-lbl">${e.label}</span><span class="tier-count">L. ${e.cost} por productor</span></div>`).join('');
  h+=`<div class="tier"><div class="tier-hdr"><div class="tier-hdr-left"><span class="tier-num">02</span><span class="tier-name">Herramientas de análisis climático</span></div><span class="tier-count">${nEsg} seleccionadas</span><button class="toggle${esgAllOn?' on':''}" onclick="toggleEsgAll()"></button></div><div class="esg-open"><div class="esg-grid">${esgItems}</div></div></div>`;
  document.getElementById('dmain').innerHTML=h;
  renderCart();
}

function renderCartFixed(fundOn,toolsOn){
  let h='';
  let total=0;
  const fp=(L.priceFundamentales!==null&&L.priceFundamentales!==undefined)?Number(String(L.priceFundamentales).replace(/,/g,'')):0;
  const tp=(L.priceTools!==null&&L.priceTools!==undefined)?Number(String(L.priceTools).replace(/,/g,'')):0;
  if(fundOn||toolsOn){
    if(fundOn){
      const priceHtml=(L.priceFundamentales!==null&&L.priceFundamentales!==undefined)?`<span class="cl-v">L. ${L.priceFundamentales}</span>`:'';
      h+=`<div class="cline"><span class="cl-l">Fundamentales + productores</span></div>`;
      total+=fp;
    }
    if(toolsOn){
      const priceHtml=(L.priceTools!==null&&L.priceTools!==undefined)?`<span class="cl-v">+L. ${L.priceTools}</span>`:'';
      h+=`<div class="cline"><span class="cl-l">Herramientas de análisis climático</span></div>`;
      total+=tp;
    }
  } else {
    h=`<div style="font-size:12px;color:var(--text3);padding:8px 0">No hay ítems seleccionados para este crédito.</div>`;
  }
  document.getElementById('cart-lines').innerHTML=h;
  document.getElementById('cart-num').textContent=total.toLocaleString('es-HN');
  const cta=document.getElementById('cart-cta');
  const cancelBtn=document.getElementById('cart-cancel');
  cta.disabled=total===0;
  cta.textContent=total===0?'Sin ítems disponibles':'Confirmar acceso →';
  cancelBtn.style.display=total===0?'none':'block';
}

function toggleTier(){
  tierOn=!tierOn;
  renderDetail();
}
function toggleEsg(id){
  esgSel[id]=!esgSel[id];
  esgAllOn=ESG.every(e=>esgSel[e.id]);
  renderDetail();
}
function toggleEsgAll(){
  esgAllOn=!esgAllOn;
  if(esgAllOn){ESG.forEach(e=>esgSel[e.id]=true);
  }else{ESG.forEach(e=>esgSel[e.id]=false);}
  renderDetail();
}

function calcTotal(L){
  let t = 0;
  const n = Number(L?.nProd) || 1;
  if(tierOn){t+=(precioFundamentales || 0) * n;}
  ESG.forEach(e => {
    if(esgSel[e.id]){ t += (e.cost || 0) * n;}});
  return t;
}

function renderCart(){
  const esgKeys=Object.keys(esgSel).filter(k=>esgSel[k]);
  let h='';
  if(tierOn||esgKeys.length>0){
    if(tierOn)h+=`<div class="cline"><span class="cl-l">Fundamentales + productores</span><span class="cl-v">L. ${precioFundamentales}</span></div>`;
    if(esgKeys.length>0){
      h+=`<div class="cline"><span class="cl-l">Herramientas de análisis climático</span></div>`;
      esgKeys.forEach(k=>{
        const e = ESG.find(x => x.id === k);
        const n = Number(L?.nProd) || 1;
        const cost = (e.cost || 0) * n;
        h += `<div class="cline sub"><span class="cl-l">${e.label}</span><span class="cl-v">+L. ${cost.toLocaleString('es-HN')}</span></div>`;});
      }
  } else {
    h=`<div style="font-size:12px;color:var(--text3);padding:8px 0">Active los ítems que desea adquirir.</div>`;
  }
  document.getElementById('cart-lines').innerHTML=h;
  const total=calcTotal(L);
  document.getElementById('cart-num').textContent=total.toLocaleString('es-HN');
  const cta=document.getElementById('cart-cta');
  const ci=document.getElementById('cart-info');
  const cancelBtn=document.getElementById('cart-cancel');
  cta.disabled=total===0;
  cta.textContent=total===0?'Seleccione al menos un ítem':'Confirmar acceso →';
  cancelBtn.style.display=total===0?'none':'block';
}

function confirmAccess(id,event){
  if(event) event.stopPropagation();
  if(id){L = getLoans().find(l => l.id === id);}
  const n = Number(L.nProd) || 1;
  if(L.testValue === 'no'){
    const fundOn = L.fundamentales === true;
    const toolsOn=(L.aclimatar===true)||(L.whisp===true)||(L.croppie===true);
    const fp = (L.priceFundamentales != null)? Number(String(L.priceFundamentales).replace(/,/g,'')) * n : 0;
    const tp = (L.priceTools != null) ? Number(String(L.priceTools).replace(/,/g,'')) * n : 0;
    const total = (fundOn ? fp : 0) + (toolsOn ? tp : 0);
    const esgKeys = ['aclimatar','whisp','croppie'] .filter(k => L[k] === true);
    const tierOnFinal = fundOn;
    confirmed={loan:L,total,esgKeys,tierOn:tierOnFinal,loanType:L.tipo};
    if(!state.interactions.confirmedAccess.includes(L.id)){state.interactions.confirmedAccess.push(L.id);}
    purchases[L.id] = confirmed;
    updateBalance(total);
    saveState();
    if(L.continue === false){
      if(!state.dismissedLoans.includes(id)) state.dismissedLoans.push(id);saveState();renderLoans();return;}
    const btnMkt = document.getElementById('btn-mkt');
    btnMkt.style.display = 'none';
    document.getElementById('scard').innerHTML=`
    <div class="srow"><span class="sr-l">Crédito</span><span class="sr-v">${L.name}</span></div>
    <div class="srow"><span class="sr-l">Herramientas de análisis climático</span><span class="sr-v">${esgKeys.length} incluidas</span></div>
    <div class="srow"><span class="sr-l">Total cobrado</span><span class="sr-v" style="color:var(--accent)">L. ${total.toLocaleString('es-HN')}</span></div>`;
    show('s-success');
    return;
  }
  
  let esgKeys = ESG.filter(e => esgSel[e.id]).map(e => e.id);
  let total = calcTotal(L);
  let tierOnFinal = tierOn;
  confirmed={loan:L,total,esgKeys,tierOn:tierOnFinal,loanType:L.tipo};
  if(!state.interactions.confirmedAccess.includes(L.id)){state.interactions.confirmedAccess.push(L.id);}
  saveState();
  const btnMkt = document.getElementById('btn-mkt');
  btnMkt.style.display = 'inline-block';
  document.getElementById('scard').innerHTML=`
    <div class="srow"><span class="sr-l">Crédito</span><span class="sr-v">${L.name}</span></div>
    <div class="srow"><span class="sr-l">Herramientas de análisis climático</span><span class="sr-v">${esgKeys.length} incluidas</span></div>
    <div class="srow"><span class="sr-l">Total cobrado</span><span class="sr-v" style="color:var(--accent)">L. ${total.toLocaleString('es-HN')}</span></div>`;
    show('s-success');
  }

function cancelAccess(){
  if(!state.interactions.canceledAccess.includes(L.id)) state.interactions.canceledAccess.push(L.id);
  saveState();
  if(L.testValue==='no'){if(!state.dismissedLoans.includes(L.id)) state.dismissedLoans.push(L.id); saveState(); goMkt();}
  else if (L.testValue==='yes'){goMkt();}
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
      row.innerHTML=`<td>${p.cod}</td><td>${p.nombre}</td><td>${p.monto}</td><td>${p.plazo}</td><td><input class="finp-s" id="pmonto-${p.cod}" type="number" placeholder="ej. 20,000"></td><td><input class="finp-s" id="ptasa-${p.cod}" type="number" step="0.1" placeholder="ej. 14.5"></td><td><input class="finp-s" id="pplazo-${p.cod}" type="number" placeholder="ej. 6"></td>`;
      tbody.appendChild(row);
    });
  }
}

function renderFinancialSection(l){
  const sec = document.getElementById('financial-flex-fields');
  sec.style.display = l.paqueteFlexible ? 'none' : '';
}

// ── Per-producer ESG (uses embedded data) ──────────────────────────────────
function prodEsgMetrics(p){
  return p.esg||[];
}


 // ── SVG farm map (seed derived from p.cod) ────────
 function buildMap(p){
   const s=p.cod.split('').reduce((a,c)=>a+c.charCodeAt(0),0), W=240, H=188, cx=120, cy=90;
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
  for(const l of LOANS_BANCO_TEST.concat(LOANS_BANCO).concat(LOANS_COOP_TEST).concat(LOANS_COOP).concat(LOANS_GRUPO_TEST).concat(LOANS_GRUPO)){
    if(!l.prod)continue;
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
  if (includeEsg && confirmed.esgKeys && confirmed.esgKeys.length > 0) {
    const allMetrics = prodEsgMetrics(p);
    metrics = allMetrics.filter(m => confirmed.esgKeys.includes(m.id));
    metrics = metrics.map(m => {
      if (m.id === 'e1') {
        const hydrated = {...m,
          n: ACLIMATAR_CONFIG.n,src: ACLIMATAR_CONFIG.src,
          aptitudClimActualClass: ACLIMATAR_CONFIG.aptitudClimActualClass[m.aptitudClimActual]||'',aptitudClimActualLabel: ACLIMATAR_CONFIG.aptitudClimActualLabel[m.aptitudClimActual]||'',aptitudClimActualInterp: ACLIMATAR_CONFIG.aptitudClimActualInterp[m.aptitudClimActual] || '',
          aptitudClimFuturaClass: ACLIMATAR_CONFIG.aptitudClimFuturaClass[m.aptitudClimFutura]||'',aptitudClimFuturaLabel: ACLIMATAR_CONFIG.aptitudClimFuturaLabel[m.aptitudClimFutura]||'',aptitudClimFuturaInterp: ACLIMATAR_CONFIG.aptitudClimFuturaInterp[m.aptitudClimFutura] || '',
          gradienteClimClass: ACLIMATAR_CONFIG.gradienteClimClass[m.gradienteClim]||'',gradienteClimLabel: ACLIMATAR_CONFIG.gradienteClimLabel[m.gradienteClim]||'',gradienteClimInterp: ACLIMATAR_CONFIG.gradienteClimInterp[m.gradienteClim] || '',
          calorClass: ACLIMATAR_CONFIG.calorClass[m.calor]||'',calorLabel: ACLIMATAR_CONFIG.calorLabel[m.calor]||'',calorInterp: ACLIMATAR_CONFIG.calorInterp[m.calor] || '',
          sequiaClass: ACLIMATAR_CONFIG.sequiaClass[m.sequia]||'',sequiaLabel: ACLIMATAR_CONFIG.sequiaLabel[m.sequia]||'',sequiaInterp: ACLIMATAR_CONFIG.sequiaInterp[m.sequia] || '',};
        console.log(`[aCLIMAtar hydration] producer=${p.cod}`, hydrated);
        return hydrated;}

      if (m.id === 'e2') {
        const hydrated = {...m,
          n: WHISP_CONFIG.n,src: WHISP_CONFIG.src,
          riskClass: WHISP_CONFIG.riskClass[m.risk] || '',riskLabel: WHISP_CONFIG.riskLabel[m.risk] || '',riskInterp: WHISP_CONFIG.riskInterp[m.risk] || '',};
          console.log(`[Whisp hydration] producer=${p.cod}`, hydrated);
          return hydrated;}

      if (m.id === 'e4') {
        const hydrated = {...m,
          n: CROPPIE_CONFIG.n,src: CROPPIE_CONFIG.src,};
          console.log(`[Croppie hydration] producer=${p.cod}`, hydrated);
          return hydrated;
        }
      return m;
    });  }
  
  const rTag=p.riesgo.includes('negativo')?`<span class="tag eu">✓ Sin reportes</span>`:p.riesgo.includes('mora antigua')?`<span class="tag ok">${p.riesgo}</span>`:`<span class="tag pend">${p.riesgo}</span>`;
  const cTag=p.confianza==='Aval otorgado'?`<span class="tag yes">✓ Aval otorgado</span>`:`<span class="tag pend">${p.confianza}</span>`;
  
  let esgHtml = '';
  if (metrics.length > 0) {    
    const cards=metrics.map(m=>{
      
      if(m.n === 'aCLIMAtar'){
        return `
        <div class="px-card"><div class="px-card-top"><span class="px-card-name">${m.n}</span></div>
        <div class="px-grid">
        <div class="px-grid-title">Reporte de aptitud agroclimática</div>
        <div class="px-grid-label">Aptitud Agroclimática Actual</div><div class="px-grid-value"><span class="px-status ${m.aptitudClimActualClass}">${m.aptitudClimActualLabel}</span><div class="px-grid-detail">${m.aptitudClimActualInterp}</div></div>
        <div class="px-grid-label">Aptitud Agroclimática Futura 30 años (2020–2049)</div><div class="px-grid-value"><span class="px-status ${m.aptitudClimFuturaClass}">${m.aptitudClimFuturaLabel}</span><div class="px-grid-detail">${m.aptitudClimFuturaInterp}</div></div>
        <div class="px-grid-label">Gradiente de Impacto a 30 años (2020–2049)</div><div class="px-grid-value"><span class="px-status ${m.gradienteClimClass}">${m.gradienteClimLabel}</span><div class="px-grid-detail">${m.gradienteClimInterp}</div></div>
        <div class="px-grid-label">Calor</div><div class="px-grid-value"><span class="px-status ${m.calorClass}">${m.calorLabel}</span><div class="px-grid-detail">${m.calorInterp}</div></div>
        <div class="px-grid-label">Sequía</div><div class="px-grid-value"><span class="px-status ${m.sequiaClass}">${m.sequiaLabel}</span><div class="px-grid-detail">${m.sequiaInterp}</div></div>
        <div class="px-grid-label">Prácticas muy recomendadas</div><div class="px-grid-value">${m.practicasMuyRecomendadas}</div>
        <div class="px-grid-label">Prácticas recomendadas</div><div class="px-grid-value">${m.practicasRecomendadas}</div>
        <div class="px-grid-label">Fecha de actualización</div><div class="px-grid-value">${m.estimationDate}</div></div>
        <div class="px-card-src">${m.src}</div></div>`;}

      if(m.n==='Croppie'){
        return `
        <div class="px-card"><div class="px-card-top"><span class="px-card-name">${m.n}</span></div>
        <div class="px-grid">
        <div class="px-grid-title">Estimación de producción (quintales de café verde)</div>
        <div class="px-grid-label">Rendimiento por hectárea</div><div class="px-grid-value">${m.yield}</div>
        <div class="px-grid-label">Producción</div><div class="px-grid-value">${m.production}</div>
        <div class="px-grid-label">Fecha de actualización</div><div class="px-grid-value">${m.estimationDate}</div></div>
        <div class="px-card-src">${m.src}</div></div>`;}

      if(m.n==='Whisp - Open Foris'){
        return `
        <div class="px-card"><div class="px-card-top"><span class="px-card-name">${m.n}</span></div>
        <div class="px-grid">
        <div class="px-grid-title">Riesgo de deforestación</div>
        <div class="px-grid-label">Resultado</div><div class="px-grid-value"><span class="px-status ${m.riskClass}">${m.riskLabel}</span><div class="px-grid-detail">${m.riskInterp}</div></div>
        <div class="px-grid-label">Fecha de actualización</div><div class="px-grid-value">${m.estimationDate}</div></div>
        <div class="px-card-src">${m.src}</div></div>`;}
      }).join('');
    esgHtml = `<div class="px-esg">
      <div class="px-esg-hdr">Herramientas de análisis climático - ${p.nombre}</div>
      ${cards}
    </div>`;
  }
 
  const euTag = p.eu === 'Sí'
    ? `<span class="tag eu">✓ Verificado</span>`
    : `<span class="tag pend">⏳ Pendiente</span>`;

const profileHtml = `
  <div class="px-card"><div class="px-card-top"><span class="px-card-name">Información general</span></div>
  <div class="px-grid2">
  <div class="px-grid2-label">Nombre del productor</div><div class="px-grid2-value">${p.nombre || '-'}</div>
  <div class="px-grid2-label">Carnet IHCAFE</div><div class="px-grid2-value" style="font-family:var(--mono);font-size:11px">${p.carnet || '-'}</div>
  <div class="px-grid2-label">Evaluación en central crediticia</div><div class="px-grid2-value">${p.riesgo || '-'}</div>
  <div class="px-grid2-label">Garantía preaprobada Confianza SA-FGR</div><div class="px-grid2-value">${p.confianza || '-'}</div>
  <div class="px-grid2-label">Aval Intermediario Comercial</div><div class="px-grid2-value">${p.aval || '-'}</div>
  <div class="px-grid2-label">Tiempo de comercialización con el intermediario</div><div class="px-grid2-value">${p.tiempoic || '-'}</div>
  <div class="px-grid2-label">Destino del crédito</div><div class="px-grid2-value">${p.destino || '-'}</div>
  <div class="px-grid2-label">Monto solicitado</div><div class="px-grid2-value">${p.monto || '-'}</div>
  <div class="px-grid2-label">Plazo estimado</div><div class="px-grid2-value">${p.plazo || '-'}</div>
  </div></div>`;

const profileHtmlFinca = `
  <div class="px-card"><div class="px-card-top"><span class="px-card-name">Información de la finca</span></div>
  <div class="px-grid2">
  <div class="px-grid2-label">Departamento</div><div class="px-grid2-value">${p.department || '—'}</div>
  <div class="px-grid2-label">Municipio</div><div class="px-grid2-value">${p.municipality || '—'}</div>
  <div class="px-grid2-label">Aldea</div><div class="px-grid2-value">${p.aldea || '—'}</div>
  <div class="px-grid2-label">Geolocalización</div><div class="px-grid2-value" style="font-family:var(--mono);font-size:11px">${p.geo || '—'}</div>
  <div class="px-grid2-label">Área total de la finca</div><div class="px-grid2-value">${p.areaTot || '—'}</div>
  <div class="px-grid2-label">Área productiva</div><div class="px-grid2-value">${p.areaProd || '—'}</div>
  <div class="px-grid2-label">Número de empleados</div><div class="px-grid2-value">${p.numEmpleados || '—'}</div>
  <div class="px-grid2-label">Cuenta con documentos de propiedad</div><div class="px-grid2-value">${p.propertyDocument || '—'}</div>
  </div>
  <div class="px-farm-map">${buildMap(p)}</div>
  </div>`;

const profileHtmlProductiva = `
  <div class="px-card"><div class="px-card-top"><span class="px-card-name">Información productiva y comercial</span></div>
  <div class="px-grid2">
  <div class="px-grid2-label">Promedio histórico de acopio</div><div class="px-grid2-value">${p.histAcopio || '—'}</div>
  <div class="px-grid2-label">Promedio histórico de ingresos</div><div class="px-grid2-value">${p.histIngresos || '—'}</div>
  <div class="px-grid2-label">Cantidad comercializada 2025</div><div class="px-grid2-value">${p.acopio2025 || '—'}</div>
  <div class="px-grid2-label">Ingresos por ventas 2025</div><div class="px-grid2-value">${p.ingresos2025 || '—'}</div>
  <div class="px-grid2-label">Cantidad comercializada 2024</div><div class="px-grid2-value">${p.acopio2024 || '—'}</div>
  <div class="px-grid2-label">Ingresos por ventas 2024</div><div class="px-grid2-value">${p.ingresos2024 || '—'}</div>
  <div class="px-grid2-label">Cantidad comercializada 2023</div><div class="px-grid2-value">${p.acopio2023 || '—'}</div>
  <div class="px-grid2-label">Ingresos por ventas 2023</div><div class="px-grid2-value">${p.ingresos2023 || '—'}</div>
  <div class="px-grid2-label">Otros ingresos</div><div class="px-grid2-value">${p.otherIncome || '—'}</div>
  </div></div>`;

const profileHtmlCartera = `
  <div class="px-card"><div class="px-card-top"><span class="px-card-name">Histórico de carteras con el Intermediario comercial</span></div>
  <div class="px-grid2">
  <div class="px-grid2-label">Monto de crédito desembolsado 2025</div><div class="px-grid2-value">${p.montoCredito2025 || '—'}</div>
  <div class="px-grid2-label">Plazo crédito desembolsado 2025</div><div class="px-grid2-value">${p.plazoCredito2025 || '—'}</div>
  <div class="px-grid2-label">¿Pagó crédito desembolsado 2025?</div><div class="px-grid2-value">${p.pagoCredito2025 || '—'}</div></div>
  <div class="px-grid2">
  <div class="px-grid2-label">Monto de crédito desembolsado 2024</div><div class="px-grid2-value">${p.montoCredito2024 || '—'}</div>
  <div class="px-grid2-label">Plazo crédito desembolsado 2024</div><div class="px-grid2-value">${p.plazoCredito2024 || '—'}</div>
  <div class="px-grid2-label">¿Pagó crédito desembolsado 2024?</div><div class="px-grid2-value">${p.pagoCredito2024 || '—'}</div></div>
  <div class="px-grid2">
  <div class="px-grid2-label">Monto de crédito desembolsado 2023</div><div class="px-grid2-value">${p.montoCredito2023 || '—'}</div>
  <div class="px-grid2-label">Plazo crédito desembolsado 2023</div><div class="px-grid2-value">${p.plazoCredito2023 || '—'}</div>
  <div class="px-grid2-label">¿Pagó crédito desembolsado 2023?</div><div class="px-grid2-value">${p.pagoCredito2023 || '—'}</div>
  </div></div>`;

cell.innerHTML = confirmed.tierOn
  ? `<div class="px-wrap">
  <div class="px-right"><div class="px-esg"><div class="px-esg-hdr">Perfil del productor - ${p.nombre}</div></div>
    ${profileHtml}${profileHtmlFinca}${profileHtmlProductiva}${profileHtmlCartera}${esgHtml}</div></div>`
  : `<div class="px-wrap">
  <div class="px-right">${esgHtml}</div></div>`;
}

function renderAccess(){
  const {loan:l,esgKeys,tierOn,loanType}=confirmed;
  const isG=l.tipo==='grupo';
  const isB=l.tipo==='banco';
  let h='';
  const mX=`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-g">${l.nProd}</div></div>`
  const mP=`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores}</div></div>`
  const mA=`<div class="mi"><div class="mi-lbl">Monto acopio</div><div class="mi-val mv-m">${l.acopio ?? 0}</div></div>`;
  const mF=`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`;
  h+=`<div class="ahdr"><div class="ahdr-top"><div><div class="aname">${l.name}</div></div></div><div class="ameta">${mX}${mP}${mA}${mF}</div></div>`;
  h+=`<div class="access-actions"><button class="btn-ol" onclick="exportPdf()">⬇ Exportar PDF</button><button class="btn-p" onclick="goOffer()">Estructurar oferta de crédito →</button></div>`;

  const hasFundamentals = tierOn;
  const hasEsg = esgKeys.length > 0;
  const hasAccess = hasFundamentals || hasEsg;

  if(L.testValue==='yes'){
    if(hasFundamentals){
      h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-b">◈</div><div><div class="sc-title">Información del grupo de productores</div></div></div>
        <div class="sc-body"><div class="ig">
          <div class="ic"><div class="ic-l">Monto solicitado, total del grupo de productores</div><div class="ic-v mv-g">L. ${l.productores}</div></div>
          <div class="ic"><div class="ic-l">Destino de los créditos</div><div class="ic-v">${l.destinos}</div></div>
          <div class="ic"><div class="ic-l">Número de productores</div><div class="ic-v mv-g">${l.nProd}</div></div>
          <div class="ic"><div class="ic-l">Paquete flexible</div><div class="ic-v">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>
          <div class="ic"><div class="ic-l">Área productiva de café, total del grupo de productores</div><div class="ic-v">${l.areaProd} Manzanas</div></div>
          <div class="ic"><div class="ic-l">Volumen anual comercializado, total del grupo de productores</div><div class="ic-v">${l.volumenTotal} quintales de café verde</div></div>
        </div></div></div>`;
      if(isB){
        h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-g">◈</div><div><div class="sc-title">Información del intermediario comercializador - ${l.name}</div></div></div>
        <div class="sc-body"><div class="ig">
        <div class="ic"><div class="ic-l">Monto crédito de acopio</div><div class="ic-v mv-g">L. ${l.acopio}</div></div>
        <div class="ic"><div class="ic-l">Plazo crédito de acopio</div><div class="ic-v">${l.plazoAcopio} meses</div></div>
        <div class="ic"><div class="ic-l">Años de operación</div><div class="ic-v">${l.anios} años</div></div>
          <div class="ic"><div class="ic-l">Volumen histórico comercializado, promedio anual</div><div class="ic-v">${l.volExport} quintales de café verde</div></div>
          <div class="ic"><div class="ic-l">Contrato de exportación</div><div class="ic-v">${l.contrato}</div></div>
          <div class="ic"><div class="ic-l">Contrato inteligente</div><div class="ic-v"><span class="tag ok">${l.smartContract ? 'Sí' : 'No'}</span></div></div>
          <div class="ic"><div class="ic-l">Volumen contrato de exportación</div><div class="ic-v">${l.volContrato} quintales de café verde</div></div>
          <div class="ic"><div class="ic-l">Mercados de destino</div><div class="ic-v">${l.mercados}</div></div>
        </div></div></div>`;
      } else {
        h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-g">◈</div><div><div class="sc-title">Información de comercialización</div></div></div>
        <div class="sc-body"><div class="ig">
          <div class="ic"><div class="ic-l">Contrato de comercialización</div><div class="ic-v">${l.contrato || '-'}</div></div>
          <div class="ic"><div class="ic-l">Contrato inteligente</div><div class="ic-v"><span class="tag ok">${l.smartContract ? 'Sí' : 'No'}</span></div></div>
          <div class="ic"><div class="ic-l">Volumen contrato de comercialización</div><div class="ic-v">${l.volContrato || '-'} quintales de café verde</div></div>
        </div></div></div>`;}
      }

    const showProdTable = l.testValue==='yes' ? hasAccess : (hasFundamentals && hasAccess);
    if(showProdTable && l.prod && l.prod.length>0){
        h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-b">⊞</div><div><div class="sc-title">Productores vinculados</div><div class="sc-sub">${l.prod.length} productor${l.prod.length>1?'es':''}</div></div></div>
        <div class="sc-body" style="padding:0;overflow-x:auto">
          <table class="ptable">
            <thead><tr>
              <th style="width:15%">Código</th><th style="width:25%">Productor</th>
              <th style="width:29%">Destino</th><th style="width:12%">Monto</th>
              <th style="width:10%">Plazo</th><th style="width:9%">Aval IC</th>
            </tr>
            <tr><td colspan="9" style="font-size:10px;color:var(--accent);font-family:var(--mono);padding:5px 10px;background:var(--accent-lt);border-bottom:1px solid var(--accent-bd)">↓ Haga clic en una fila para ver la información específica de cada productor</td></tr>
            </thead>
            <tbody>${l.prod.map(p=>`
              <tr class="prow" id="prow-${p.cod}" onclick="toggleProd('${p.cod}')">
                <td style="font-family:var(--mono);font-size:11px">${p.cod}</td>
                <td>${p.nombre}</td><td>${p.destino}</td><td>${p.monto}</td>
                <td>${p.plazo}</td><td class="${p.aval==='A'?'av-a':'av-b'}">${p.aval}</td>
              </tr>
              <tr class="prow-exp" id="pexp-${p.cod}"><td colspan="9" id="pxc-${p.cod}"></td></tr>`).join('')}
            </tbody>
          </table>
        </div></div>`;
      }
    } else {
      h+=`<div class="sc"><div class="sc-hdr"><div class="sc-icon si-b">◈</div><div><div class="sc-title">Información general del crédito</div></div></div>
        <div class="sc-body"><div class="ig">
          <div class="ic"><div class="ic-l">Monto solicitado, total del grupo de productores</div><div class="ic-v mv-g">L. ${l.productores}</div></div>
          <div class="ic"><div class="ic-l">Número de productores</div><div class="ic-v mv-g">${l.nProd}</div></div>
          <div class="ic"><div class="ic-l">Monto de crédito de acopio</div><div class="ic-v">L. ${l.acopio ?? 0}</div></div>
          <div class="ic"><div class="ic-l">Paquete flexible</div><div class="ic-v">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>
        </div></div></div>`;
    }

  h += `<div class="access-actions"><button class="btn-ol" onclick="exportPdf()">⬇ Exportar PDF</button><button class="btn-p" onclick="goOffer()">Estructurar oferta de crédito →</button>
  ${l.testValue === 'yes' ? `<button class="btn-offer" onclick="goMkt()">Explorar más créditos</button>` : ''}</div>`;
  document.getElementById('access-inner').innerHTML=h;
}

function topInfoAccess(){
  const {loan:l,esgKeys,tierOn,loanType}=confirmed;
  const isG=l.tipo==='grupo';
  const isB=loanType==='banco';
  let h='';
  const mX=`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-g">${l.nProd}</div></div>`
  const mP=`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores}</div></div>`
  const mA=`<div class="mi"><div class="mi-lbl">Monto acopio</div><div class="mi-val mv-m">${l.acopio ?? 0}</div></div>`;
  const mF=`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`;
  h+=`<div class="ahdr"><div class="ahdr-top"><div><div class="aname">${l.name}</div></div></div><div class="ameta">${mX}${mP}${mA}${mF}</div></div>`;
  
  document.getElementById('top-info').innerHTML = h;
}

function goOffer(){
  const l=confirmed.loan;
  document.getElementById('o-sub');
  const inputs=['of-monto','of-tasa','of-plazo','of-periodo','of-cuota','of-garantia','of-gracia','of-comision','of-seguro','of-aval-conf','of-destino','of-vigencia','of-etapa','of-notas'];
  inputs.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    if(el.tagName==='TEXTAREA'){el.value='';}
    else if(el.tagName==='SELECT'){el.selectedIndex=0;}
    else{el.value='';}
    const ev=el.tagName==='INPUT'?'input':'change';
    el.removeEventListener(ev,updatePreview);el.addEventListener(ev,updatePreview);
  });
  renderProducersSection(l);
  renderFinancialSection(l);
  updatePreview();topInfoAccess();
  show('s-offer');
}

function exportPdf(){
  const l = confirmed && confirmed.loan;
  if(!l || !l.prod || l.prod.length===0){
    window.print();
    return;
  }
  const prevState = {};
  l.prod.forEach(p=>{
    const exp = document.getElementById('pexp-'+p.cod);
    const prow = document.getElementById('prow-'+p.cod);
    prevState[p.cod] = {expOpen: !!(exp && exp.classList.contains('open')), prowOpen: !!(prow && prow.classList.contains('open'))};
  });
  const prevOpenProd = _openProd;
  // Expand all rows and ensure content is rendered
  l.prod.forEach(p=>{
    const exp = document.getElementById('pexp-'+p.cod);
    const prow = document.getElementById('prow-'+p.cod);
    if(prow) prow.classList.add('open');
    if(exp) exp.classList.add('open');
    fillProd(p.cod, true);
  });
  _openProd = null;
  // Give the browser a moment to reflow before printing
  setTimeout(()=>{
    window.print();
    // Restore previous open/closed state
    l.prod.forEach(p=>{
      const exp = document.getElementById('pexp-'+p.cod);
      const prow = document.getElementById('prow-'+p.cod);
      const prev = prevState[p.cod];
      if(exp){
        if(prev.expOpen) exp.classList.add('open'); else exp.classList.remove('open');
      }
      if(prow){
        if(prev.prowOpen) prow.classList.add('open'); else prow.classList.remove('open');
      }
    });
    _openProd = prevOpenProd;
  }, 150);
}

function updatePreview(){
  const v=id=>{const el=document.getElementById(id);return el?el.value:'';};
  const monto=parseFloat(v('of-monto'))||0,tasa=parseFloat(v('of-tasa'))||0,plazo=v('of-plazo'),periodo=v('of-periodo'),cuota=v('of-cuota'),garantia=v('of-garantia'),moneda=v('of-moneda'),comision=parseFloat(v('of-comision'))||0,avalConf=v('of-aval-conf');
  const sym=moneda.startsWith('L')?'L.':'$';
  let cuotaEst='—';
  if(monto>0&&tasa>0&&plazo){const n=parseInt(plazo),r=(tasa/100)/12;const c=r>0?monto*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):monto/n;cuotaEst=`${sym} ${Math.round(c).toLocaleString('es-HN')} / mes`;}
}

function submitOffer(){
  const v=id=>{const el=document.getElementById(id);return el?el.value:'';};
  const monto=parseFloat(v('of-monto'))||0,tasa=parseFloat(v('of-tasa'))||0,plazo=v('of-plazo');
  /*if(!monto||!tasa||!plazo){alert('Complete al menos el monto, la tasa y el plazo para enviar la oferta.');return;}*/
  const l=confirmed.loan;const sym=v('of-moneda').startsWith('L')?'L.':'$';
  document.getElementById('offer-sent-card').innerHTML=`
    <div class="srow"><span class="sr-l">Destinatario</span><span class="sr-v">${l.name}</span></div>
    <div class="srow"><span class="sr-l">Institución oferente</span><span class="sr-v">${U.name}</span></div>
  ${!l.paqueteFlexible ? `
    <div class="srow"><span class="sr-l">Monto ofertado</span><span class="sr-v">${sym} ${monto.toLocaleString('es-HN')}</span></div>
    <div class="srow"><span class="sr-l">Tasa anual</span><span class="sr-v">${tasa}%</span></div>
    <div class="srow"><span class="sr-l">Plazo</span><span class="sr-v">${plazo} meses</span></div>
  ` : ''}
    <div class="srow"><span class="sr-l">Periodicidad</span><span class="sr-v">${v('of-periodo')||'No especificado'}</span></div>
    <div class="srow"><span class="sr-l">Aval Confianza SA-FGR</span><span class="sr-v">${v('of-aval-conf')}</span></div>
    <div class="srow"><span class="sr-l">Vigencia</span><span class="sr-v">${v('of-vigencia')}</span></div>
    <div class="srow"><span class="sr-l">Estado</span><span class="sr-v" style="color:var(--blue)">Enviada · Pendiente respuesta</span></div>`;
  if(l.testValue === 'yes'){tempDismissedLoans.add(l.id);} else {
    if(!state.dismissedLoans.includes(l.id)){state.dismissedLoans.push(l.id);}}
    const producerOffers = {};
    if(l.paqueteFlexible && l.prod && l.prod.length > 0){
      l.prod.forEach(p => {
        const monto = document.getElementById('pmonto-' + p.cod);
        const tasa  = document.getElementById('ptasa-'  + p.cod);
        const plazo = document.getElementById('pplazo-' + p.cod);
        producerOffers[p.cod] = {
          monto: monto ? parseFloat(monto.value) || null : null,
          tasa:  tasa  ? parseFloat(tasa.value)  || null : null,
          plazo: plazo ? parseFloat(plazo.value) || null : null,
        };});}
    state.offers[l.id] = {
      monto: parseFloat(v('of-monto')) || null,
      tasa: v('of-tasa') || null,
      plazo: v('of-plazo') || null,
      periodicidad: v('of-periodo') || null,
      amortizacion: v('of-cuota') || null,
      moneda: v('of-moneda') || null,
      garantia: v('of-garantia') || null,
      periodogracia: v('of-gracia') || null,
      comision: v('of-comision') || null,
      seguro: v('of-seguro') || null,
      avalconfianza: v('of-aval-conf') || null,
      vigencia: v('of-vigencia') || null,
      etapaevaluacion: v('of-etapa') || null,
      condiciones: v('of-notas') || null,
      producerOffers: Object.keys(producerOffers).length > 0 ? producerOffers : null
    };
    saveState();
  show('s-offer-sent');
}

function goMkt(){
  tierOn=false;esgAllOn=false;esgSel={};currentPage=1;renderLoans();renderBalanceDisplay();show('s-market');}

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
  if(currentPage > totalPages){currentPage = Math.max(1, totalPages);}
  if(totalPages>1){document.getElementById('loan-pagination').style.display='flex';showPage(currentPage);}else{document.getElementById('loan-pagination').style.display='none';}
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

JSON.stringify(state)

document.getElementById('inp-p').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('inp-u').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});