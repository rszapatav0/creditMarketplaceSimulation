const USERS=[
  /* {email:'banco@bancafe.hn',pass:'banco2024',role:'banco',name:'BanCafé — Analista de Crédito'},
  {email:'gestor@cofemarcala.hn',pass:'coop2024',role:'coop',name:'Coop. Cafetalera Marcala'},
  {email:'analista@fise.hn',pass:'imf2024',role:'imf',name:'FISE — Oficial de Cartera'}, */
  {email:'banco',pass:'123',role:'banco',name:'BanCafé — Analista de Crédito'},
  {email:'gestor',pass:'123',role:'coop',name:'Coop. Cafetalera Marcala'},
  {email:'analista',pass:'123',role:'imf',name:'FISE — Oficial de Cartera'},
];

const ESG=[
  {id:'e1',label:'aCLIMAtar',cost:80},
  {id:'e2',label:'Whisp - Open Foris',cost:70},
  {id:'e3',label:'AClimate',cost:80},
  {id:'e4',label:'Croppie',cost:80},
];

const WHISP_CONFIG = {
  n:   'Whisp - Open Foris',
  src: 'Organización de las Naciones Unidas para la Alimentación y la Agricultura - 2025 OpenForis',
  interp: {
    low:      'La finca no presenta superposición con áreas de bosque cartografiado activo, o sus coincidencias corresponden a perturbaciones anteriores a finales de 2020. Sin indicios de deforestación reciente.',
    high:     'La finca se encuentra dentro de un área de bosque cartografiado y registra una perturbación detectada después de 2020. Se recomienda verificación adicional antes del desembolso.',
    moreInfo: 'La finca coincide con un área de bosque cartografiado sin perturbaciones registradas antes ni después de 2020, y sin solapamiento con actividades económicas. Se requiere investigación más detallada para determinar cumplimiento EUDR.',
  }
};

const CROPPIE_CONFIG = {
  n:   'Croppie',
  src: 'Alianza Bioversity Internacional y CIAT, Producers Direct, Tecnicafé',
  interp: {
    low:      'La finca no presenta superposición con áreas de bosque cartografiado activo, o sus coincidencias corresponden a perturbaciones anteriores a finales de 2020. Sin indicios de deforestación reciente.',
    high:     'La finca se encuentra dentro de un área de bosque cartografiado y registra una perturbación detectada después de 2020. Se recomienda verificación adicional antes del desembolso.',
    moreInfo: 'La finca coincide con un área de bosque cartografiado sin perturbaciones registradas antes ni después de 2020, y sin solapamiento con actividades económicas. Se requiere investigación más detallada para determinar cumplimiento EUDR.',
  }
};

const LOANS_BANCO=[
  {id:'b1',name:'Exportadora El Paraíso S.A.',region:'El Paraíso, Honduras',tipo:'banco',paqueteFlexible: true,
   acopio:'L. 2,400,000',productores:'L. 680,000',nProd:38,plazo:'6 meses',precio:320,smartContract:true,
   anios:12,volExport:'1,840 qq',mercados:'Alemania, Países Bajos',
   garantias:'Garantía prendaria sobre café en bodega · Aval solidario · Carta de compromiso Supremo Hamburg GmbH',
   prod:[
    {cod:'HN-0041',nombre:'Martínez Flores, J.',monto:'L. 18,000',plazo:'5 meses',destino:'Insumos',hist:'42 qq / 3 ciclos',geo:'14.21°N 86.83°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2021-0041',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
     esg:[
      {id:'e1',n:'aCLIMAtar',      val:'42%',  bar:42, src:'ICF Honduras · 2024',                       interp:'Cobertura por encima del umbral EUDR (>30%). Plan de manejo vigente ante ICF.'},
      {id:'e2', risk:'low'},
      {id:'e3',n:'AClimate',    val:'80/100',bar:80, src:'Fichas IHCAFE / TraceFoodChain · nov 2024', interp:'4 prácticas verificadas: sombra diversificada, barreras vivas, cosecha escalonada y manejo de tejido. Nivel alto.'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
    {cod:'HN-0052',nombre:'López Aguilar, R.',monto:'L. 22,000',plazo:'6 meses',destino:'Cosecha',hist:'55 qq / 4 ciclos',geo:'14.18°N 86.91°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0052',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
     esg:[
      {id:'e1',n:'aCLIMAtar',      val:'38%',  bar:38, src:'ICF Honduras · 2024',                       interp:'Cobertura en rango aceptable para EUDR. Plan de manejo forestal registrado.'},
      {id:'e2', risk:'high'},
      {id:'e3',n:'AClimate',    val:'72/100',bar:72, src:'Fichas IHCAFE / TraceFoodChain · nov 2024', interp:'3 prácticas verificadas: sombra diversificada y barreras vivas implementadas. Una práctica adicional en proceso.'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
   ]},
];

const LOANS_COOP=[
  {id:'c1',name:'Ramiro Rosales Aguilar',region:'Ocotepeque, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 45,000',nProd:1,plazo:'5 meses',precio:270,smartContract:true,
   parcela:'2.4 ha · Finca El Aguacate',contrato:'Supremo Hamburg GmbH',volContrato:'38 qq',
   geo:'14.41°N 89.22°W',eu:'Sí',aval:'A',hist:'3 ciclos · 34 qq promedio',
   carnet:'IHCAFE-2020-0033',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'OC-0033',nombre:'Rosales Aguilar, R.',monto:'L. 45,000',plazo:'5 meses',destino:'Cosecha + insumos',hist:'38 qq / 3 ciclos',geo:'14.41°N 89.22°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0033',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
    esg:[
      {id:'e1',n:'aCLIMAtar',      val:'38%',  bar:38, src:'ICF Honduras · 2024',                       interp:'Sobre el umbral EUDR. Plan de manejo ICF registrado con áreas de reserva activas.'},
      {id:'e2', risk:'low'},
      {id:'e3',n:'AClimate',    val:'74/100',bar:74, src:'Fichas IHCAFE / TraceFoodChain · nov 2024', interp:'3 prácticas verificadas: sombra diversificada, barreras vivas y cosecha de agua. Buen nivel de adopción.'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
    ]}]},
];

const LOANS_GRUPO=[
  {id:'g1',name:'Grupo Productores La Esperanza',region:'El Paraíso, Honduras',tipo:'grupo',paqueteFlexible:true,
   acopio:null,productores:'L. 105,000',nProd:3,plazo:'5.3 meses',precio:285,smartContract:true,
   destinos:'Cosecha, insumos, infraestructura',variedades:'Catuaí rojo, Lempira, IHCAFE-90',
   volumenTotal:'111 qq',promedioHist:'37 qq / 3 ciclos',
   organizacion:'Asociación local no formalizada',asistenciaTecnica:'IHCAFE regional',accesoMercado:'Intermediario local + exportadora',
   prod:[
    {cod:'EP-0101',nombre:'García Méndez, L.',monto:'L. 35,000',plazo:'5 meses',destino:'Cosecha',hist:'40 qq / 3 ciclos',geo:'14.20°N 86.85°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2021-0101',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
     parcela:'2.1 ha · Finca El Roble',volContrato:'40 qq',contrato:'Exportadora Centroamérica S.A.',
     esg:[
      {id:'e1',n:'aCLIMAtar',      val:'40%',  bar:40, src:'ICF Honduras · 2024',                       interp:'Sobre umbral EUDR. Plan de manejo activo ante ICF.'},
      {id:'e2', risk:'low'},
      {id:'e3',n:'AClimate',    val:'72/100',bar:72, src:'Fichas IHCAFE / TraceFoodChain · nov 2024', interp:'3 prácticas verificadas. Nivel medio-alto de adopción.'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
    {cod:'EP-0102',nombre:'Pineda López, M.',monto:'L. 30,000',plazo:'6 meses',destino:'Insumos',hist:'36 qq / 4 ciclos',geo:'14.18°N 86.88°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0102',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
     parcela:'1.9 ha · Finca La Reforma',volContrato:'36 qq',contrato:'Exportadora Centroamérica S.A.',
     esg:[
      {id:'e1',n:'aCLIMAtar',      val:'36%',  bar:36, src:'ICF Honduras · 2024',                       interp:'Cumple umbral EUDR. Plan de manejo forestal registrado.'},
      {id:'e2', risk:'low'},
      {id:'e3',n:'AClimate',    val:'70/100',bar:70, src:'Fichas IHCAFE / TraceFoodChain · nov 2024', interp:'3 prácticas verificadas. Buenas prácticas de adaptación implementadas.'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
   ]},
];