let U=null,L=null,tierOn=false,esgSel={},confirmed={},currentPage=1,cardsPerPage=10,purchases={},yesSelections={};

// ─── SESSION STATES ─────────────────────────────────────────────────────────
function defaultState(){
  return {
    user: null,
    institutionName: null,
    sessionGroup: null,
    walletBalance: walletInitial,

    sociodemographicQuestionsCompleted: false,
    sociodemographicQuestions: {},
    perceptionQuestionsCompleted: false,
    perceptionQuestions: {},

    testViewed: [],
    testConfirmedAccess: [],
    testOffers: {},

    WTPviewed: [],
    WTPdismissedLoans: [],
    WTPconfirmedAccess: [],
    WTPnotInterested: [],
    WTPsessionQuestionsCompleted: {},
    WTPsessionQuestionsCompletedDate: {},
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

// ─── Session waiting period ─────────────────────────────────────────────
// Time (in milliseconds) the user must wait before continuing into a session
// after completing the previous one. Change this single value to adjust the
// wait everywhere (e.g. 24*60*60*1000 for 1 day).
const SESSION_WAIT_MS = 60*1000; // 2 minutes: 2*60*1000; 1 day: 24*60*60*1000;
// Order of numbered sessions. Add future session ids here (in order) and the
// waiting period will automatically apply between them.
const SESSION_ORDER = ['1','2','3','4','5'];
let sessionWaitTimer = null;

function stopSessionWaitTimer(){
  if(sessionWaitTimer){ clearInterval(sessionWaitTimer); sessionWaitTimer = null; }
}

function getSessionUnlockTime(session){
  const idx = SESSION_ORDER.indexOf(session);
  if(idx <= 0) return 0;
  const prevSession = SESSION_ORDER[idx - 1];
  const completedAt = state.WTPsessionQuestionsCompletedDate && state.WTPsessionQuestionsCompletedDate[prevSession];
  if(!completedAt) return 0;
  return completedAt + SESSION_WAIT_MS;
}

function renderSessionWaiting(session, unlockTime){
  stopSessionWaitTimer();
  document.getElementById('loan-pagination').style.display = 'none';
  const list = document.getElementById('loan-list');
  const tick = () => {
    const remainingMs = unlockTime - Date.now();
    if(remainingMs <= 0){
      stopSessionWaitTimer();
      switchSession(session);
      return;
    }
    const totalSec = Math.ceil(remainingMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const countdown = `${min}:${String(sec).padStart(2, '0')}`;
    const unlockLabel = new Date(unlockTime).toLocaleTimeString('es-HN', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
    document.getElementById('loan-instructions').style.display = 'none';
    list.innerHTML = `
      <div class="loan-info" id="session-wait-message">
        <strong>Espere antes de continuar</strong><br>
        Esta sección se habilitará en <strong>${countdown}</strong> (a las ${unlockLabel}).<br>
        Puede continuar navegando por las demás pestañas disponibles o cerrar la sesión y regresar cuando el tiempo se haya cumplido.
      </div>`;
  };
  tick();
  sessionWaitTimer = setInterval(tick, 1000);
}


// ─── Group ID ───────────────────────────────────────────────
function roleName(r){return r==='banco'?'Banco Comercial':r==='coop'?'Cooperativa':'Microfinanciera';}

function assignSessionGroup() {
  return U?.grupoId ?? null;
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


// ─── Login and logout functions ───────────────────────────────────────────────
function doLogin(){
  const u=document.getElementById('inp-u').value;
  const p=document.getElementById('inp-p').value;
  const err=document.getElementById('lerr');
  const found=USERS.find(x=>x.username===u&&x.pass===p);
  if(!found){err.classList.add('show');['inp-u','inp-p'].forEach(id=>document.getElementById(id).classList.add('err'));return;}
  err.classList.remove('show');['inp-u','inp-p'].forEach(id=>document.getElementById(id).classList.remove('err'));
  U=found;
  state.user = u;
  state.institutionName = U.institutionName;
  state.sessionGroup = assignSessionGroup();
  saveState();
  initBalance();renderBalanceDisplay();
  document.getElementById('mkt-title').innerHTML =
    `<div class="brand-h1"><b>Valoración de herramientas de trazabilidad agrícola</b></div>
    <div class="brand-h1-sub"><b>Convirtiendo la Información en <b>Garantía</b></b></div>`;
  showContext();show('s-market');
}

function doLogout(){
  stopSessionWaitTimer();
  U=null;
  purchases={};
  yesSelections={};
  state = defaultState();
  sessionStorage.removeItem('appState');
  document.getElementById('inp-p').value='';
  show('s-login');
}

function endSession(){
  // Future: await fetch('/api/sessions', { method:'POST', body: JSON.stringify(state) })
  doLogout();
}


// ─── Wallet ───────────────────────────────────────────────
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

function renderBalanceDisplay(){
  const wds=document.querySelectorAll('.wallet-display');
  if(!wds.length)return;
  const balance=getBalance();
  wds.forEach(wd=>{wd.textContent=`Saldo disponible: ${balance.toLocaleString('es-HN')} HNL`;
  if(balance < 0){wd.classList.add('negative');}else{wd.classList.remove('negative');}});
  document.querySelectorAll('.btn-confirm').forEach(btn => {btn.disabled = balance < 0;});
}

function updateBalance(amount){
  setBalance(getBalance() - amount);
  renderBalanceDisplay();
}


// ─── Tabs: Main tabs ───────────────────────────────────────────────
function switchLoanTab(tab){
 stopSessionWaitTimer();
 if(activeLoanTab === 'yes' && tab !== 'yes'){tempDismissedLoans.clear();}
  activeLoanTab=tab;
  currentPage=1;
  document.querySelectorAll('.loan-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.getElementById('loan-instructions').style.display='none';
  document.getElementById('context-info').style.display='none';
  document.getElementById('sociodemographic-questions').style.display='none';
  document.getElementById('loan-demo-info').style.display =tab === 'yes' ? 'block' : 'none';
  document.getElementById('loan-subtabs').style.display = tab === 'no' ? 'flex' : 'none';
  if(tab === 'no'){
    activeSession = 'instructions';
    updateSessionTabs();
    switchSession('instructions'); return;}
  renderLoans();
}

/* First tab: Context */
function showContext(){
  stopSessionWaitTimer();
  document.querySelectorAll('.loan-tab').forEach(b=>{b.classList.remove('active');});
  document.getElementById('context-tab').classList.add('active');
  const completed = state.sociodemographicQuestionsCompleted === true;
  document.getElementById('general-tab').disabled     = completed;
  document.querySelector('[data-tab="yes"]').disabled = !completed;
  document.querySelector('[data-tab="no"]').disabled  = !completed;
  document.getElementById('loan-demo-info').style.display='none';
  document.getElementById('loan-subtabs').style.display='none';
  document.getElementById('loan-instructions').style.display='none';
  document.getElementById('context-info').style.display='block';
  document.getElementById('sociodemographic-questions').style.display='none';
  document.getElementById('loan-list').innerHTML = `
    <div class="btn-row">${completed? 
      '<button class="btn-p" id="continue-session" onclick="switchLoanTab(\'yes\')">Continuar →</button>' : 
      '<button class="btn-p" id="continue-session" onclick="showSociodemographicQuestions()">Continuar →</button>'}</div>`;
  document.getElementById('loan-pagination').style.display='none';
}

/* Second tab: General questions */
function showSociodemographicQuestions(){
  stopSessionWaitTimer();
  document.querySelectorAll('.loan-tab').forEach(b=>{b.classList.remove('active');});
  document.getElementById('context-tab').disabled     = false;
  document.getElementById('general-tab').disabled     = false;
  document.querySelector('[data-tab="yes"]').disabled = true;
  document.querySelector('[data-tab="no"]').disabled  = true;
  document.getElementById('loan-subtabs').style.display='none';
  document.getElementById('loan-demo-info').style.display='none';
  document.getElementById('context-info').style.display='none';
  document.getElementById('loan-instructions').style.display='none';
  document.getElementById('sociodemographic-questions').style.display='block';
  document.getElementById('loan-list').innerHTML = `
    <div class="btn-row"><button class="btn-p" onclick="finishSociodemographicQuestions()">Guardar →</button></div>`;
  document.getElementById('loan-pagination').style.display='none';
}

function toggleOther(select){
  const input=document.querySelector(`[data-other-for="${select.id}"]`);
  if(!input) return;
  const enabled = select.value === 'otro';
  input.disabled = !enabled;
  if(enabled){input.placeholder = 'Especifique...';
  }else{input.placeholder = 'No aplica';}
}

function finishSociodemographicQuestions(){
  const requiredFields = ['institution-type','institution-role','experience-years','agr-experience-years','age-range','sex'];
  if(document.getElementById('institution-type').value === 'otro'){requiredFields.push('institution-other');}
  if(document.getElementById('institution-role').value === 'otro'){requiredFields.push('role-other');}
  const missing = requiredFields.find(id =>!document.getElementById(id)?.value.trim());
  if(missing){
    alert('Por favor complete todas las preguntas antes de continuar.');
    document.getElementById(missing)?.focus();return;}
      state.sociodemographicQuestionsCompleted = true;
      state.sociodemographicQuestions = {
        institutionType:     document.getElementById('institution-type').value,
        institutionOther:    document.getElementById('institution-other').value.trim(),
        institutionRole:     document.getElementById('institution-role').value,
        roleOther:           document.getElementById('role-other').value.trim(),
        experienceYears:     document.getElementById('experience-years').value,
        agrExperienceYears:  document.getElementById('agr-experience-years').value,
        ageRange:            document.getElementById('age-range').value,
        sex:                 document.getElementById('sex').value,
      };
    saveState();
    document.getElementById('context-tab').disabled       = false;
    document.getElementById('general-tab').disabled       = true;
    document.querySelector('[data-tab="yes"]').disabled   = false;
    document.querySelector('[data-tab="no"]').disabled    = false;
    switchLoanTab('yes');
}


// ─── Render Market ───────────────────────────────────────────────
function goMkt(){
  tierOn=false;esgSel={};currentPage=1;renderLoans();renderBalanceDisplay();show('s-market');}

function show(id){
  document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.style.display='none';});
  const el=document.getElementById(id);
  const flex=['s-login'];
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


// ─── Render Loans ───────────────────────────────────────────────
function renderLoans(){
  const list=document.getElementById('loan-list');list.innerHTML='';

  if(activeLoanTab === 'no' && SESSION_ORDER.includes(activeSession) && getSessionRemaining(activeSession) === 0){
    renderSessionQuestions(activeSession);
    updateEndSessionsAvailability();
    document.getElementById('loan-pagination').style.display='none';
    return;
  }

  getLoans()
  .filter(l=>!state.WTPdismissedLoans.includes(l.id) && !tempDismissedLoans.has(l.id) && l.testValue === activeLoanTab  && (activeLoanTab !== 'no' || String(l.session) === activeSession))
    .sort((a,b)=>new Date(a.fechaDesembolso)-new Date(b.fechaDesembolso)) /*change a with b to invert order*/
  .forEach(l=>{
    const isG=l.tipo==='grupo';
    const isB=l.tipo==='banco';
    const mX=`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-g">${l.nProd}</div></div>`
    const mP=`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores} Lempiras</div></div>`
    const mA=`<div class="mi"><div class="mi-lbl">Aval IC</div><div class="mi-val ${l.acopio ?  'mv-g' : 'mv-m'}">${l.acopio ? 'Sí' : 'No'}</div></div>`;
    const mF=`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`;
    const badgeClass=isG?'grupo':l.tipo;
    const badgeLabel=isG?'Grupo de productores':isB?'Grupo de productores':'Productor';
    const isNo = l.testValue === 'no';
    const isYes = l.testValue === 'yes';
    const isExpandable = isNo || isYes;

    let extraHelp = '';
    let extraMetrics = '';
    if(isNo){
      extraHelp = 'El crédito dispone de la siguiente información: ';
      const esgFund = metricToggle('Fundamentales', l.fundamentales===true, false);
      const esgAcli = metricToggle('aCLIMAtar', l.aclimatar===true, false);
      const esgWhis = metricToggle('Whisp', l.whisp===true, false);
      const esgPric = `<div class="mi"><div class="mi-lbl">Precio</div><div class="mi-val mv-g">${l.priceTotal} Lempiras por productor</div></div>`;
      extraMetrics = esgFund+esgAcli+esgWhis+esgPric;
    } else if(isYes){
      extraHelp = 'Seleccione la información que desea visualizar de este crédito: ';
      extraMetrics = buildYesMetrics(l);
    }

    list.innerHTML += `
    <div class="lcard ${isExpandable?'expandable':''}" id="lcard-${l.id}" onclick="toggleLoanCard(event,this,'${l.id}')"><div>
    <div class="loan-top"><span class="badge ${badgeClass}">${badgeLabel}</span><span class="loan-name">${l.name}</span></div>
    <div class="loan-meta">${mX}${mP}${mA}${mF}<div class="mi"><div class="mi-lbl">Detalle</div><div class="lock-tag">🔒 Acceso de pago</div></div></div>
    ${isExpandable? `<div class="loan-extra" id="extra-${l.id}">
      <div class="loan-extra-title">Información incluida</div>
      <div class="loan-extra-help">${extraHelp}</div>
      <div class="loan-meta">${extraMetrics}</div>
      <div class="loan-actions"><button class="btn-dismiss" onclick="dismissLoan('${l.id}',event)">No me interesa</button><button class="btn-confirm" onclick="${isNo?`confirmAccess('${l.id}',event)`:`confirmYesAccess('${l.id}',event)`}">Me interesa →</button></div>` : ''}</div>
    ${!isExpandable? `<button class="btn-dismiss" onclick="dismissLoan('${l.id}',event)" title="No me interesa">No me interesa</button>` : ''}</div>`;

  });
  if(activeLoanTab === 'no'){
    updateEndSessionsAvailability();
    initPagination();
  }
  if(activeLoanTab === 'yes'){document.getElementById('loan-pagination').style.display='none';}
}

function confirmAccess(id,event){
  if(event) event.stopPropagation();
  if(id){L = getLoans().find(l => l.id === id);}
  const n = Number(L.nProd) || 1;
  if(L.testValue === 'no'){
    const fundOn = L.fundamentales === true;
    const toolsOn=(L.aclimatar===true)||(L.whisp===true);
    const fp = (L.priceFundamentales != null)? Number(String(L.priceFundamentales).replace(/,/g,'')) * n : 0;
    const tp = (L.priceTools != null) ? Number(String(L.priceTools).replace(/,/g,'')) * n : 0;
    const total = (fundOn ? fp : 0) + (toolsOn ? tp : 0);
    if(getBalance() - total < 0){alert('Saldo insuficiente para confirmar este acceso.');return;}
    const esgKeys = ['aclimatar','whisp'] .filter(k => L[k] === true);
    const tierOnFinal = fundOn;
    confirmed={loan:L,total,esgKeys,tierOn:tierOnFinal,loanType:L.tipo};
    if(!state.WTPconfirmedAccess.includes(L.id)){state.WTPconfirmedAccess.push(L.id);}
    purchases[L.id] = confirmed;
    updateBalance(total);
    saveState();
    if(L.continue === false){
      if(!state.WTPdismissedLoans.includes(id)) state.WTPdismissedLoans.push(id);saveState();renderLoans();return;}
    goAccess();
  }

  let esgKeys = ESG.filter(e => esgSel[e.id]).map(e => e.id);
  let tierOnFinal = tierOn;
  confirmed={loan:L,esgKeys,tierOn:tierOnFinal,loanType:L.tipo};
  if(!state.testConfirmedAccess.includes(L.id)){state.testConfirmedAccess.push(L.id);}
  saveState();
  goAccess();
  }

function confirmYesAccess(id, event){
  const sel = getYesSel(id);
  tierOn = sel.tierOn;
  esgSel = {...sel.esgSel};
  confirmAccess(id, event);
}

/* Loan cards actions */
function toggleLoanCard(event, card, id){
  event.stopPropagation();
  const loan = getLoans().find(l => l.id === id);
  if(loan?.testValue === 'yes'){
    if(!state.testViewed.includes(id)){state.testViewed.push(id);saveState();}}
  if(loan?.testValue === 'no'){
    if(!state.WTPviewed.includes(id)){state.WTPviewed.push(id);saveState();}}
  const wasExpanded = card.classList.contains('expanded');
  document.querySelectorAll('.lcard.expanded').forEach(c => {c.classList.remove('expanded');});
  if(!wasExpanded){card.classList.add('expanded');}
}

function dismissLoan(id, event){
  event.stopPropagation();
  const loan = getLoans().find(l => l.id === id);
  if(loan?.testValue === 'yes'){
    tempDismissedLoans.add(id);
    renderLoans();
    setTimeout(() => {tempDismissedLoans.delete(id);renderLoans();}, 5000);
    return;
  }
  if(!state.WTPdismissedLoans.includes(id)) state.WTPdismissedLoans.push(id);
  if(!state.WTPnotInterested.includes(id)) state.WTPnotInterested.push(id);
  saveState();
  renderLoans();
}

function metricToggle(label, on, interactive, handler){
  const btnAttrs = interactive ? ` onclick="${handler}"` : ' disabled style="pointer-events:none;cursor:default"';
  return `<div class="mi"><div class="mi-lbl">${label}</div><button class="toggle${on?' on':''}"${btnAttrs}></button></div>`;
}

function getYesSel(id){
  if(!yesSelections[id]) yesSelections[id] = {tierOn:false, esgSel:{}};
  return yesSelections[id];
}

function buildYesMetrics(l){
  const sel = getYesSel(l.id);
  const fundBtn = metricToggle('Fundamentales', sel.tierOn, true, `toggleYesTier('${l.id}',event)`);
  const toolButtons = ESG.map(e=>metricToggle(e.label, !!sel.esgSel[e.id], true, `toggleYesEsg('${l.id}','${e.id}',event)`)).join('');
  return fundBtn + toolButtons;
}

function refreshYesCardExtra(id){
  const l = getLoans().find(x=>x.id===id);
  if(!l) return;
  const extra = document.getElementById('extra-'+id);
  if(!extra) return;
  const metaEl = extra.querySelector('.loan-meta');
  if(metaEl) metaEl.innerHTML = buildYesMetrics(l);
}

function toggleYesTier(id, event){
  event.stopPropagation();
  const sel = getYesSel(id);
  sel.tierOn = !sel.tierOn;
  refreshYesCardExtra(id);
}

function toggleYesEsg(id, esgId, event){
  event.stopPropagation();
  const sel = getYesSel(id);
  sel.esgSel[esgId] = !sel.esgSel[esgId];
  refreshYesCardExtra(id);
}


// ─── Tabs: WTP tabs ───────────────────────────────────────────────
function switchSession(session){
  stopSessionWaitTimer();
  activeSession = session;
  currentPage = 1;
  document.querySelectorAll('.loan-subtab').forEach(b => b.classList.toggle('active', b.dataset.type === session));
  if(SESSION_ORDER.includes(session)){
    const unlockTime = getSessionUnlockTime(session);
    if(unlockTime && Date.now() < unlockTime){
      renderSessionWaiting(session, unlockTime);
      updateSessionTabs();
      return;
    }
  }
  if(session === 'instructions'){
    document.getElementById('context-info').style.display='none';
    document.getElementById('sociodemographic-questions').style.display='none';
    document.getElementById('loan-instructions').style.display='block';
    document.getElementById('loan-list').innerHTML = `
      <div class="btn-row"><button class="btn-p" id="continue-session" onclick="nextSession()">Continuar →</button></div>`;
    document.getElementById('loan-pagination').style.display='none';
    } else if(session === 'endSessions'){
    document.getElementById('context-info').style.display='none';
    document.getElementById('sociodemographic-questions').style.display='none';
    document.getElementById('loan-instructions').style.display='none';
    document.getElementById('loan-list').innerHTML = `
      <div class="loan-info" id="loan-end-sessions">
        <strong>Finalizar sesiones</strong><br>
        Ha completado todas las sesiones disponibles. Agradecemos su participación y sus aportes a este ejercicio.</div>
      <div class="btn-row" id="end-session-button" style="margin-top:2rem"><button class="btn-p" onclick="endSession()">Enviar →</button></div>`;
    document.getElementById('loan-pagination').style.display='none';
    return;
  } else {
    document.getElementById('context-info').style.display='none';
    document.getElementById('sociodemographic-questions').style.display='none';
    document.getElementById('loan-instructions').style.display='none';
    renderLoans();}
  updateSessionTabs();
}

function updateSessionTabs() {
  const sessionButtons = [...document.querySelectorAll('.loan-subtab')];
  const instructionsBtn = sessionButtons.find(btn => btn.dataset.type === 'instructions');
  if (instructionsBtn) {instructionsBtn.disabled = false;}
  const nextSession = sessionButtons.find(btn => {const session = btn.dataset.type;
    if (session === 'instructions' || session === 'endSessions') {return false;}
    return state.WTPsessionQuestionsCompleted?.[session] !== true;});
  sessionButtons.forEach(btn => {
    const session = btn.dataset.type;
    if (session === 'instructions' || session === 'endSessions') {return;}btn.disabled = btn !== nextSession;});
  updateEndSessionsAvailability();
}

function nextSession() {
  const tabs = [...document.querySelectorAll('.loan-subtab')];
  const currentIndex = tabs.findIndex(btn => btn.dataset.type === activeSession);
  const nextTab = tabs
    .slice(currentIndex + 1)
    .find(btn => {
      const session = btn.dataset.type;
      return (session !== 'instructions' && session !== 'endSessions' && state.WTPsessionQuestionsCompleted?.[session] !== true);});
  if (nextTab) {switchSession(nextTab.dataset.type);return;}
  const endTab = tabs.find(btn => btn.dataset.type === 'endSessions');
  if (endTab && !endTab.disabled) {switchSession('endSessions');}
}


// ─── Complementary questions ───────────────────────────────────────────────
function getSessionRemaining(sessionNum){
  return getLoans().filter(l => !state.WTPdismissedLoans.includes(l.id) && l.testValue === 'no' && String(l.session) === String(sessionNum)).length;
}

function allSessionQuestionsAnswered(){
  return !!(state.WTPsessionQuestionsCompleted && SESSION_ORDER.every(s => state.WTPsessionQuestionsCompleted[s]));
}

function updateEndSessionsAvailability(){
  const remaining = getLoans().filter(l => !state.WTPdismissedLoans.includes(l.id) && l.testValue === 'no');
  const endTab = document.querySelector('.loan-subtab[data-type="endSessions"]');
  if(endTab){ endTab.disabled = remaining.length !== 0 || !allSessionQuestionsAnswered(); }
}

function finishSessionQuestions(sessionNum){
  const requiredBySession = {'1':['interestingCredits'],'2':['solvesNeed'],'3':['monthlyWtp','conditionsToWtp'],'4':['frecuency'],'5':['alerts']};
  const missing = (requiredBySession[sessionNum]||[]).find(id => !document.getElementById(id)?.value.trim());
  if(missing){
    alert('Por favor complete todas las preguntas antes de continuar.');
    document.getElementById(missing)?.focus();return;}
  const fieldsBySession = {'1':['interestingCredits'],'2':['solvesNeed'],'3':['monthlyWtp','conditionsToWtp'],'4':['frecuency'],'5':['alerts']};
  if(!state.perceptionQuestions) state.perceptionQuestions = {};
  (fieldsBySession[sessionNum]||[]).forEach(id=>{
    const el = document.getElementById(id);
    if(el) state.perceptionQuestions[id] = el.value;
  });
  if(!state.WTPsessionQuestionsCompleted) state.WTPsessionQuestionsCompleted = {};
  state.WTPsessionQuestionsCompleted[sessionNum] = true;
  state.perceptionQuestionsCompleted = SESSION_ORDER.every(s => state.WTPsessionQuestionsCompleted[s]);
  if(!state.WTPsessionQuestionsCompletedDate) state.WTPsessionQuestionsCompletedDate = {};
  state.WTPsessionQuestionsCompletedDate[sessionNum] = Date.now();
  saveState();
  updateSessionTabs();
  nextSession();
}

function renderSessionQuestions(sessionNum){
  const list = document.getElementById('loan-list');
  const blocks = {
    '1': `
  <div class="o-form"><div>
    <div class="fs-title">Bloque de interés</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">¿Qué tan interesante le resultan los créditos de demostración?<span class="required">*</span></label>
        <div class="fhelp">Responda en una escala del 1 al 5, siendo 1 "muy poco interesante" y 5 "muy interesante".</div> 
        <select class="fsel" id="interestingCredits" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>
    </div><br>
    <div class="btn-row"><button class="btn-p" onclick="finishSessionQuestions('1')">Guardar →</button></div>`,
    '2': `
  <div class="o-form"><div>
    <div class="fs-title">Bloque de interés</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">¿Cree que estos créditos podrían resolver una necesidad que su institución tiene hoy?<span class="required">*</span></label>
        <select class="fsel" id="solvesNeed" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="yes">Sí</option><option value="no">No</option></select></div>
    </div><br>
    <div class="btn-row"><button class="btn-p" onclick="finishSessionQuestions('2')">Guardar →</button></div>`,
    '3': `
  <div class="o-form"><div>
    <div class="fs-title">Bloque de valor percibido</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">Si tuviera acceso a una suscripción que le permitiera ver créditos de esta manera, ¿cuánto estaría dispuesto(a) a pagar mensualmente por ella?<span class="required">*</span></label><input class="finp-s" id="monthlyWtp" type="number" placeholder="Número de Lempiras"></div>
      <div class="fg full"><label class="flabel">¿Qué condiciones debería incluir la suscripción mensual para que ese monto sea justo para usted?<span class="required">*</span></label><input class="finp-s" id="conditionsToWtp" type="text"></div>
    </div><br>
    <div class="btn-row"><button class="btn-p" onclick="finishSessionQuestions('3')">Guardar →</button></div>`,
    '4': `
  <div class="o-form"><div>
    <div class="fs-title">Bloque de uso</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">¿Con qué frecuencia cree que utilizaría esta suscripción si estuviera disponible?<span class="required">*</span></label>
        <select class="fsel" id="frecuency" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="daily">Diario</option><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option><option value="moreThanMonthly">Cada varios meses</option><option value="notUsing">No la utilizaría</option></select></div>
    </div><br>
    <div class="btn-row"><button class="btn-p" onclick="finishSessionQuestions('4')">Guardar →</button></div>`,
    '5': `
  <div class="o-form"><div>
    <div class="fs-title">Bloque de uso</div>
    <div class="frow">
      <div class="fg full"><label class="flabel">¿Prefiere recibir alertas sobre nuevos créditos disponibles o prefiere buscarlos solo cuando lo necesite?<span class="required">*</span></label>
        <select class="fsel" id="alerts" onchange="toggleOther(this)"><option value="">Seleccionar...</option>
        <option value="alertas">Recibir alertas</option><option value="buscar">Buscar cuando lo necesite</option></select></div>
    </div><br>
    <div class="btn-row"><button class="btn-p" onclick="finishSessionQuestions('5')">Guardar →</button></div>`
  };
  list.innerHTML = blocks[sessionNum] || '';
  const fieldsBySession = {'1':['interestingCredits'],'2':['solvesNeed'],'3':['monthlyWtp','conditionsToWtp'],'4':['frecuency'],'5':['alerts']};
  (fieldsBySession[sessionNum]||[]).forEach(id=>{
    const el = document.getElementById(id);
    const val = state.perceptionQuestions && state.perceptionQuestions[id];
    if(el && val){ el.value = val; }
  });
}


// ─── Loans detail ───────────────────────────────────────────────
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
      row.innerHTML=`<td>${p.cod}</td><td>${p.nombre}</td><td>${p.monto}</td><td>${p.plazo}</td><td><input class="finp-s" id="pmonto-${p.cod}" type="number"></td><td><input class="finp-s" id="ptasa-${p.cod}" type="number" step="0.1"></td><td><input class="finp-s" id="pplazo-${p.cod}" type="number"></td>`;
      tbody.appendChild(row);
    });
  }
}

function prodEsgMetrics(p){
  return p.esg||[];
}

function topInfoAccess(){
  const {loan:l,esgKeys,tierOn,loanType}=confirmed;
  const isG=l.tipo==='grupo';
  const isB=loanType==='banco';
  let h='';
  const mX=`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-g">${l.nProd}</div></div>`
  const mP=`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores}</div></div>`
  const mA=`<div class="mi"><div class="mi-lbl">Aval IC</div><div class="mi-val ${l.acopio ? 'mv-g' : 'mv-m'}">${l.acopio ? 'Sí' : 'No'}</div></div>`;
  const mF=`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`;
  h+=`<div class="ahdr"><div class="ahdr-top"><div><div class="aname">${l.name}</div></div></div><div class="ameta">${mX}${mP}${mA}${mF}</div></div>`;
  
  document.getElementById('top-info').innerHTML = h;
}

function renderAccess(){
  const {loan:l,esgKeys,tierOn,loanType}=confirmed;
  const isG=l.tipo==='grupo';
  const isB=l.tipo==='banco';
  let h='';
  const mX=`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-g">${l.nProd}</div></div>`
  const mP=`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores}</div></div>`
  const mA=`<div class="mi"><div class="mi-lbl">Aval IC</div><div class="mi-val ${l.acopio ? 'mv-g' : 'mv-m'}">${l.acopio ? 'Sí' : 'No'}</div></div>`;
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
          <div class="ic"><div class="ic-l">Aval IC</div><div class="ic-v">${l.acopio ? 'Sí' : 'No'}</div></div>
          <div class="ic"><div class="ic-l">Paquete flexible</div><div class="ic-v">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>
        </div></div></div>`;
    }

  h += `<div class="access-actions"><button class="btn-ol" onclick="exportPdf()">⬇ Exportar PDF</button><button class="btn-p" onclick="goOffer()">Estructurar oferta de crédito →</button>
  ${l.testValue === 'yes' ? `<button class="btn-offer" onclick="goMkt()">Explorar más créditos</button>` : ''}</div>`;
  document.getElementById('access-inner').innerHTML=h;
}

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

let _openProd=null;

function findProd(cod){
  for(const l of LOANS_BANCO_TEST.concat(LOANS_BANCO).concat(LOANS_COOP_TEST).concat(LOANS_COOP).concat(LOANS_GRUPO_TEST).concat(LOANS_GRUPO)){
    if(!l.prod)continue;
    const p=l.prod.find(x=>x.cod===cod);
    if(p)return p;
  }
  return null;
}

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

      if(m.n==='Whisp'){
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


// ─── Render offer ───────────────────────────────────────────────
function goOffer(){
  const l=confirmed.loan;
  document.getElementById('o-sub');
  const inputs=['of-monto','of-tasa','of-plazo','of-notas'];
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

function renderFinancialSection(l){
  const sec = document.getElementById('financial-flex-fields');
  sec.style.display = l.paqueteFlexible ? 'none' : '';
}

function updatePreview(){
  const v=id=>{const el=document.getElementById(id);return el?el.value:'';};
  const monto=parseFloat(v('of-monto'))||0,tasa=parseFloat(v('of-tasa'))||0,plazo=v('of-plazo');
  const sym='L.';
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
    <div class="srow"><span class="sr-l">Institución oferente</span><span class="sr-v">${U.institutionName}</span></div>
    <div class="srow"><span class="sr-l">Estado</span><span class="sr-v" style="color:var(--blue)">Enviada · Pendiente respuesta</span></div>
  `;
  if(l.testValue === 'yes'){tempDismissedLoans.add(l.id);tempDismissedLoans.delete(l.id);} else {
    if(!state.WTPdismissedLoans.includes(l.id)){state.WTPdismissedLoans.push(l.id);}}
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
    state.testOffers[l.id] = {
      monto: parseFloat(v('of-monto')) || null,
      tasa: v('of-tasa') || null,
      plazo: v('of-plazo') || null,
      condiciones: v('of-notas') || null,
      producerOffers: Object.keys(producerOffers).length > 0 ? producerOffers : null
    };
    saveState();
  show('s-offer-sent');
}

JSON.stringify(state)

document.getElementById('inp-p').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('inp-u').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});