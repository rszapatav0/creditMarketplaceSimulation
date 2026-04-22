const USERS=[
  {email:'banco@bancafe.hn',pass:'banco2024',role:'banco',name:'BanCafé — Analista de Crédito'},
  {email:'gestor@cofemarcala.hn',pass:'coop2024',role:'coop',name:'Coop. Cafetalera Marcala'},
  {email:'analista@fise.hn',pass:'imf2024',role:'imf',name:'FISE — Oficial de Cartera'},
];

const LOANS_BANCO=[
  {id:'b1',name:'Exportadora El Paraíso S.A.',region:'El Paraíso, Honduras',tipo:'banco',paqueteFlexible: true,
   acopio:'L. 2,400,000',productores:'L. 680,000',nProd:38,plazo:'6 meses',precio:320,
   anios:12,volExport:'1,840 qq',mercados:'Alemania, Países Bajos',
   garantias:'Garantía prendaria sobre café en bodega · Aval solidario · Carta de compromiso Supremo Hamburg GmbH',
   prod:[
    {cod:'HN-0041',nombre:'Martínez Flores, J.',monto:'L. 18,000',plazo:'5 meses',destino:'Insumos',hist:'42 qq / 3 ciclos',geo:'14.21°N 86.83°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2021-0041',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:41},
    {cod:'HN-0052',nombre:'López Aguilar, R.',monto:'L. 22,000',plazo:'6 meses',destino:'Cosecha',hist:'55 qq / 4 ciclos',geo:'14.18°N 86.91°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0052',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:52},
    {cod:'HN-0063',nombre:'Reyes Sorto, M.',monto:'L. 15,000',plazo:'5 meses',destino:'Infraestructura',hist:'28 qq / 2 ciclos',geo:'14.31°N 86.74°W',eu:'Pendiente',aval:'B',carnet:'IHCAFE-2022-0063',variedad:'IHCAFE-90',riesgo:'Deuda vigente sin mora',confianza:'En evaluación',esgSeed:63},
    {cod:'HN-0071',nombre:'Perdomo Núñez, A.',monto:'L. 19,500',plazo:'6 meses',destino:'Insumos',hist:'37 qq / 3 ciclos',geo:'14.24°N 86.80°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2021-0071',variedad:'Catuaí amarillo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:71},
   ]},
  {id:'b2',name:'Comercializadora Marcala Export',region:'Marcala, La Paz, Honduras',tipo:'banco',paqueteFlexible: true,
   acopio:'L. 3,100,000',productores:'L. 940,000',nProd:52,plazo:'8 meses',precio:320,
   anios:14,volExport:'2,310 qq',mercados:'Italia, Bélgica',
   garantias:'Hipoteca sobre instalaciones de beneficiado · Aval solidario · DO Marcala certificación vigente',
   prod:[
    {cod:'MR-0012',nombre:'García Tosta, C.',monto:'L. 20,000',plazo:'7 meses',destino:'Cosecha',hist:'61 qq / 5 ciclos',geo:'14.12°N 88.01°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2019-0012',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:12},
    {cod:'MR-0019',nombre:'Amaya Velásquez, F.',monto:'L. 16,500',plazo:'6 meses',destino:'Insumos',hist:'44 qq / 3 ciclos',geo:'14.08°N 88.13°W',eu:'Sí',aval:'B',carnet:'IHCAFE-2021-0019',variedad:'Bourbon',riesgo:'Historial con mora antigua saldada',confianza:'Aval otorgado con condición',esgSeed:19},
    {cod:'MR-0024',nombre:'Hernández Cruz, L.',monto:'L. 24,000',plazo:'8 meses',destino:'Infraestructura',hist:'72 qq / 6 ciclos',geo:'14.22°N 87.92°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2018-0024',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:24},
   ]},
  {id:'b3',name:'Acopiadora Copán Ruinas Ltda.',region:'Copán, Honduras',tipo:'banco',paqueteFlexible: true,
   acopio:'L. 1,750,000',productores:'L. 420,000',nProd:24,plazo:'5 meses',precio:320,
   anios:8,volExport:'1,120 qq',mercados:'Francia, España',
   garantias:'Garantía prendaria sobre café pergamino · Carta de crédito irrevocable Banque de Paris',
   prod:[
    {cod:'CP-0007',nombre:'Moya Castellanos, B.',monto:'L. 17,000',plazo:'4 meses',destino:'Cosecha',hist:'33 qq / 2 ciclos',geo:'14.84°N 89.14°W',eu:'Pendiente',aval:'B',carnet:'IHCAFE-2022-0007',variedad:'IHCAFE-90',riesgo:'Sin historial en central',confianza:'En evaluación',esgSeed:7},
    {cod:'CP-0011',nombre:'Flores Portillo, J.',monto:'L. 21,000',plazo:'5 meses',destino:'Insumos',hist:'49 qq / 4 ciclos',geo:'14.91°N 89.06°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0011',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:11},
   ]},
  {id:'b4',name:'Cooperativa Cafetalera San Juan Intibucá',region:'Intibucá, Honduras',tipo:'cooperativa',paqueteFlexible: true,
   acopio:'L. 1,980,000',productores:'L. 510,000',nProd:41,plazo:'6 meses',precio:318,
   anios:10,volExport:'1,420 qq',mercados:'Alemania, Suecia',
   garantias:'Aval solidario cooperativo · Fondo de garantía interno · Certificación orgánica parcial',
   prod:[
    {cod:'IN-0101',nombre:'Hernández Mejía, D.',monto:'L. 16,000',plazo:'5 meses',destino:'Insumos',hist:'39 qq / 3 ciclos',geo:'14.31°N 88.17°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2021-0101',variedad:'Bourbon',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:101},
    {cod:'IN-0108',nombre:'Castillo Ramos, E.',monto:'L. 19,000',plazo:'6 meses',destino:'Cosecha',hist:'47 qq / 4 ciclos',geo:'14.28°N 88.21°W',eu:'Sí',aval:'B',carnet:'IHCAFE-2020-0108',variedad:'Catuaí rojo',riesgo:'Historial con mora leve',confianza:'Aval condicionado',esgSeed:108},
    {cod:'IN-0113',nombre:'Vásquez López, M.',monto:'L. 14,500',plazo:'5 meses',destino:'Infraestructura',hist:'26 qq / 2 ciclos',geo:'14.35°N 88.12°W',eu:'Pendiente',aval:'B',carnet:'IHCAFE-2022-0113',variedad:'IHCAFE-90',riesgo:'Sin historial en central',confianza:'En evaluación',esgSeed:113},
  ]},
  {id:'b5',name:'Cooperativa Agroforestal Santa Bárbara',region:'Santa Bárbara, Honduras',tipo:'cooperativa',paqueteFlexible: false,
   acopio:'L. 2,600,000',productores:'L. 780,000',nProd:56,plazo:'7 meses',precio:322,
   anios:15,volExport:'2,050 qq',mercados:'Estados Unidos, Canadá',
   garantias:'Contrato de venta anticipada · Aval solidario · Certificación Rainforest Alliance',
   prod:[
    {cod:'SB-0021',nombre:'Pineda Cruz, A.',monto:'L. 21,000',plazo:'6 meses',destino:'Cosecha',hist:'58 qq / 5 ciclos',geo:'15.08°N 88.35°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2019-0021',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:21},
    {cod:'SB-0029',nombre:'López Martínez, J.',monto:'L. 18,000',plazo:'6 meses',destino:'Insumos',hist:'46 qq / 3 ciclos',geo:'15.12°N 88.28°W',eu:'Sí',aval:'B',carnet:'IHCAFE-2021-0029',variedad:'Catuaí amarillo',riesgo:'Deuda vigente sin mora',confianza:'Aval otorgado',esgSeed:29},
    {cod:'SB-0035',nombre:'Mejía Torres, R.',monto:'L. 23,500',plazo:'7 meses',destino:'Infraestructura',hist:'63 qq / 5 ciclos',geo:'15.05°N 88.40°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2018-0035',variedad:'Bourbon',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:35},
  ]},
  {id:'b6',name:'Cooperativa Productores de Café El Paraíso',region:'Danlí, El Paraíso, Honduras',tipo:'cooperativa',paqueteFlexible: false,
   acopio:'L. 1,450,000',productores:'L. 390,000',nProd:29,plazo:'5 meses',precio:317,
   anios:7,volExport:'980 qq',mercados:'España, Bélgica',
   garantias:'Garantía prendaria sobre café · Aval solidario · Acuerdo de compra con tostador europeo',
   prod:[
    {cod:'EP-0005',nombre:'Rodríguez Díaz, F.',monto:'L. 15,000',plazo:'5 meses',destino:'Cosecha',hist:'31 qq / 2 ciclos',geo:'14.05°N 86.57°W',eu:'Pendiente',aval:'B',carnet:'IHCAFE-2022-0005',variedad:'IHCAFE-90',riesgo:'Sin historial en central',confianza:'En evaluación',esgSeed:5},
    {cod:'EP-0014',nombre:'Gómez Herrera, L.',monto:'L. 17,500',plazo:'5 meses',destino:'Insumos',hist:'42 qq / 3 ciclos',geo:'14.09°N 86.62°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0014',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:14},
   ]},
  {id:'b7',name:'Cooperativa Cafetalera Lempira Sur',region:'Lempira, Honduras',tipo:'cooperativa',paqueteFlexible: false,
   acopio:'L. 2,200,000',productores:'L. 640,000',nProd:47,plazo:'6 meses',precio:319,
   anios:11,volExport:'1,670 qq',mercados:'Italia, Francia',
   garantias:'Aval solidario · Fondo rotatorio · Certificación comercio justo',
   prod:[
    {cod:'LE-0032',nombre:'Santos Reyes, P.',monto:'L. 19,000',plazo:'6 meses',destino:'Cosecha',hist:'53 qq / 4 ciclos',geo:'14.55°N 88.60°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2019-0032',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:32},
    {cod:'LE-0040',nombre:'Ortiz López, G.',monto:'L. 16,500',plazo:'5 meses',destino:'Insumos',hist:'38 qq / 3 ciclos',geo:'14.60°N 88.52°W',eu:'Sí',aval:'B',carnet:'IHCAFE-2021-0040',variedad:'Catuaí amarillo',riesgo:'Historial con mora leve',confianza:'Aval condicionado',esgSeed:40},
    {cod:'LE-0048',nombre:'Ramírez Díaz, C.',monto:'L. 20,000',plazo:'6 meses',destino:'Infraestructura',hist:'57 qq / 4 ciclos',geo:'14.49°N 88.65°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0048',variedad:'Bourbon',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:48},
  ]},
];

const LOANS_COOP=[
  {id:'c1',name:'Ramiro Rosales Aguilar',region:'Ocotepeque, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 45,000',nProd:1,plazo:'5 meses',precio:270,
   parcela:'2.4 ha · Finca El Aguacate',contrato:'Supremo Hamburg GmbH',volContrato:'38 qq',
   geo:'14.41°N 89.22°W',eu:'Sí',aval:'A',hist:'3 ciclos · 34 qq promedio',
   carnet:'IHCAFE-2020-0033',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'OC-0033',nombre:'Rosales Aguilar, R.',monto:'L. 45,000',plazo:'5 meses',destino:'Cosecha + insumos',hist:'38 qq / 3 ciclos',geo:'14.41°N 89.22°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0033',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:33}]},
  {id:'c2',name:'Darío Enamorado López',region:'El Paraíso, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 38,000',nProd:1,plazo:'6 meses',precio:270,
   parcela:'1.8 ha · Finca La Esperanza',contrato:'Kaffee Partner GmbH',volContrato:'31 qq',
   geo:'14.18°N 86.84°W',eu:'Sí',aval:'A',hist:'4 ciclos · 29 qq promedio',
   carnet:'IHCAFE-2019-0047',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'EP-0047',nombre:'Enamorado López, D.',monto:'L. 38,000',plazo:'6 meses',destino:'Cosecha',hist:'31 qq / 4 ciclos',geo:'14.18°N 86.84°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2019-0047',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:47}]},
  {id:'c3',name:'María Concepción Zelaya',region:'Santa Bárbara, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 29,500',nProd:1,plazo:'4 meses',precio:270,
   parcela:'1.2 ha · Finca El Bosque',contrato:'Supremo Hamburg GmbH',volContrato:'22 qq',
   geo:'15.10°N 88.23°W',eu:'Pendiente',aval:'B',hist:'2 ciclos · 20 qq promedio',
   carnet:'IHCAFE-2022-0018',variedad:'IHCAFE-90',riesgo:'Deuda vigente sin mora',confianza:'En evaluación',
   prod:[{cod:'SB-0018',nombre:'Zelaya, M.C.',monto:'L. 29,500',plazo:'4 meses',destino:'Insumos',hist:'22 qq / 2 ciclos',geo:'15.10°N 88.23°W',eu:'Pendiente',aval:'B',carnet:'IHCAFE-2022-0018',variedad:'IHCAFE-90',riesgo:'Deuda vigente sin mora',confianza:'En evaluación',esgSeed:18}]},
  {id:'c4',name:'Carlos Meza Ordóñez',region:'Intibucá, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 52,000',nProd:1,plazo:'7 meses',precio:270,
   parcela:'3.1 ha · Finca Los Pinos',contrato:'Nordic Roasters AS',volContrato:'48 qq',
   geo:'14.32°N 88.54°W',eu:'Sí',aval:'A',hist:'5 ciclos · 45 qq promedio',
   carnet:'IHCAFE-2018-0029',variedad:'Catuaí amarillo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'IN-0029',nombre:'Meza Ordóñez, C.',monto:'L. 52,000',plazo:'7 meses',destino:'Cosecha + infraestructura',hist:'48 qq / 5 ciclos',geo:'14.32°N 88.54°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2018-0029',variedad:'Catuaí amarillo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:29}]},
 {id:'c5',name:'José Armando Figueroa',region:'Copán, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 34,000',nProd:1,plazo:'5 meses',precio:270,
   parcela:'1.6 ha · Finca La Montaña',contrato:'Café Direct Berlin',volContrato:'27 qq',
   geo:'14.85°N 89.12°W',eu:'Sí',aval:'B',hist:'3 ciclos · 25 qq promedio',
   carnet:'IHCAFE-2021-0062',variedad:'Bourbon',riesgo:'Historial con mora leve',confianza:'Aval condicionado',
   prod:[{cod:'CP-0062',nombre:'Figueroa, J.A.',monto:'L. 34,000',plazo:'5 meses',destino:'Cosecha',hist:'27 qq / 3 ciclos',geo:'14.85°N 89.12°W',eu:'Sí',aval:'B',carnet:'IHCAFE-2021-0062',variedad:'Bourbon',riesgo:'Historial con mora leve',confianza:'Aval condicionado',esgSeed:62}]},
  {id:'c6',name:'Ana Lucía Paredes',region:'La Paz, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 41,500',nProd:1,plazo:'6 meses',precio:270,
   parcela:'2.0 ha · Finca El Mirador',contrato:'Torrefazione Italia SRL',volContrato:'35 qq',
   geo:'14.12°N 88.05°W',eu:'Sí',aval:'A',hist:'4 ciclos · 33 qq promedio',
   carnet:'IHCAFE-2020-0084',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'LP-0084',nombre:'Paredes, A.L.',monto:'L. 41,500',plazo:'6 meses',destino:'Insumos',hist:'35 qq / 4 ciclos',geo:'14.12°N 88.05°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2020-0084',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:84}]},
  {id:'c7',name:'Miguel Ángel Cáceres',region:'Lempira, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 28,000',nProd:1,plazo:'4 meses',precio:270,
   parcela:'1.3 ha · Finca El Rosario',contrato:'Cafe España SL',volContrato:'21 qq',
   geo:'14.56°N 88.58°W',eu:'Pendiente',aval:'B',hist:'2 ciclos · 19 qq promedio',
   carnet:'IHCAFE-2022-0056',variedad:'IHCAFE-90',riesgo:'Sin historial en central',confianza:'En evaluación',
   prod:[{cod:'LE-0056',nombre:'Cáceres, M.A.',monto:'L. 28,000',plazo:'4 meses',destino:'Cosecha',hist:'21 qq / 2 ciclos',geo:'14.56°N 88.58°W',eu:'Pendiente',aval:'B',carnet:'IHCAFE-2022-0056',variedad:'IHCAFE-90',riesgo:'Sin historial en central',confianza:'En evaluación',esgSeed:56}]},
  {id:'c8',name:'Rosa Elvira Mendoza',region:'El Paraíso, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 36,500',nProd:1,plazo:'5 meses',precio:270,
   parcela:'1.7 ha · Finca Las Flores',contrato:'Hamburg Coffee Traders',volContrato:'30 qq',
   geo:'14.20°N 86.78°W',eu:'Sí',aval:'A',hist:'3 ciclos · 28 qq promedio',
   carnet:'IHCAFE-2021-0091',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'EP-0091',nombre:'Mendoza, R.E.',monto:'L. 36,500',plazo:'5 meses',destino:'Insumos',hist:'30 qq / 3 ciclos',geo:'14.20°N 86.78°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2021-0091',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:91}]},
  {id:'c9',name:'Luis Fernando Ordóñez',region:'Santa Bárbara, Honduras',tipo:'coop',paqueteFlexible: false,
   acopio:null,productores:'L. 47,000',nProd:1,plazo:'6 meses',precio:270,
   parcela:'2.6 ha · Finca El Cedral',contrato:'Nordic Roasters AS',volContrato:'41 qq',
   geo:'15.07°N 88.30°W',eu:'Sí',aval:'A',hist:'5 ciclos · 39 qq promedio',
   carnet:'IHCAFE-2019-0073',variedad:'Catuaí amarillo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
   prod:[{cod:'SB-0073',nombre:'Ordóñez, L.F.',monto:'L. 47,000',plazo:'6 meses',destino:'Cosecha + insumos',hist:'41 qq / 5 ciclos',geo:'15.07°N 88.30°W',eu:'Sí',aval:'A',carnet:'IHCAFE-2019-0073',variedad:'Catuaí amarillo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',esgSeed:73}]}
];

const ESG=[
  {id:'e1',label:'Riesgo climático',cost:80,val:'Medio-bajo (3.2/10)',bar:32,detail:'Índice compuesto de temperatura media, frecuencia de eventos extremos y exposición a sequías. Escala 0–10 donde valores menores indican menor riesgo.',src:'Fuente: ACLIMATE Colombia / ClimateServant API · Ciclo 2024–2025',interp:'Exposición moderada-baja. La zona mantiene régimen hídrico estable con lluvias bien distribuidas.'},
  {id:'e2',label:'Medidas de adaptación',cost:80,val:'Sombra diversificada, barreras vivas',bar:70,detail:'Prácticas verificadas en campo por técnico IHCAFE. Incluye inventario de especies de sombra, cobertura de suelo y prácticas de conservación hídrica.',src:'Fuente: Fichas técnicas IHCAFE / TraceFoodChain · Verificación noviembre 2024',interp:'3 de 5 prácticas recomendadas implementadas. Nivel de adopción: Medio-alto.'},
  {id:'e3',label:'Fertilidad de suelos',cost:80,val:'Alto (74/100)',bar:74,detail:'Índice basado en materia orgánica, pH, N-P-K disponible y capacidad de intercambio catiónico (CIC). Análisis en laboratorio certificado FHIA.',src:'Fuente: Laboratorio de Suelos FHIA · Muestra octubre 2024',interp:'Suelos con buena capacidad productiva. pH 5.8–6.2, M.O. >3.5%. Sin enmiendas urgentes.'},
  {id:'e4',label:'Disponibilidad hídrica',cost:80,val:'Bajo estrés — cuenca estable',bar:82,detail:'Evaluación de cuenca, caudal en época seca e infraestructura de riego. Índice de estrés hídrico según metodología FAO-AQUASTAT.',src:'Fuente: SERNA Honduras / AQUASTAT · Período 2022–2024',interp:'Microcuenca con caudal sostenido en últimos 3 años. Riesgo de estrés hídrico: bajo.'},
  {id:'e5',label:'Planes de manejo forestal',cost:80,val:'38% cobertura forestal activa',bar:38,detail:'Porcentaje del predio bajo plan de manejo registrado ante ICF. Incluye áreas de reserva, cortinas rompevientos y sistemas agroforestales.',src:'Fuente: ICF Honduras · Registro 2024',interp:'Cobertura dentro del rango aceptable para EUDR (>30%). Plan de manejo vigente.'},
  {id:'e6',label:'Certificaciones ambientales',cost:80,val:'Rainforest Alliance 2024',bar:100,detail:'Estado de certificaciones vigentes: Rainforest Alliance, Organic, UTZ, Fair Trade, Bird Friendly. Vigencia y alcance verificados.',src:'Fuente: Rainforest Alliance / SAN · Vigente hasta diciembre 2025',interp:'Certificación activa verificable. Aumenta elegibilidad para créditos verdes y premiums de mercado.'},
  {id:'e7',label:'Huella de carbono',cost:80,val:'1.4 kg CO₂e / kg café',bar:53,detail:'Emisiones GEI en producción primaria (cultivo, cosecha y beneficiado húmedo). Metodología Cool Farm Tool adaptada para café hondureño.',src:'Fuente: CIAT CCSaS / Cool Farm Alliance · Ciclo 2023–2024',interp:'Por debajo del promedio regional (1.8 kg CO₂e/kg). Predio con potencial de certificación de carbono.'},
  {id:'e8',label:'Índice de biodiversidad',cost:80,val:'Shannon 2.8 — diversidad media-alta',bar:65,detail:'Índice Shannon-Wiener sobre inventario de especies vegetales (estratos arbóreos, arbustivos y herbáceos). Valores >2.5 indican diversidad relevante.',src:'Fuente: CIAT Biodiversidad / Inventario de campo · Septiembre 2024',interp:'Sistema agroforestal con diversidad funcional adecuada para resiliencia climática y calidad del café.'},
];

let U=null,L=null,tierOn=false,esgAllOn=false,esgSel={},confirmed={},currentPage=1,cardsPerPage=3;

function roleName(r){return r==='banco'?'Banco Comercial':r==='coop'?'Cooperativa':'Microfinanciera';}
function getLoans(){return U.role==='banco'?LOANS_BANCO:LOANS_COOP;}

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
    const mA=iB?`<div class="mi"><div class="mi-lbl">Monto acopio</div><div class="mi-val mv-b">${l.acopio}</div></div>`:'';
    const mP=iB?`<div class="mi"><div class="mi-lbl">Monto productores</div><div class="mi-val mv-g">${l.productores}</div></div>`:`<div class="mi"><div class="mi-lbl">Monto crédito</div><div class="mi-val mv-o">${l.productores}</div></div>`;
    const mX=iB?`<div class="mi"><div class="mi-lbl">Productores</div><div class="mi-val mv-m">${l.nProd}</div></div>`:`<div class="mi"><div class="mi-lbl">Importadora</div><div class="mi-val mv-o">${l.contrato}</div></div>`;
    const mF=iB?`<div class="mi"><div class="mi-lbl">Paquete flexible</div><div class="mi-val ${l.paqueteFlexible ? 'mv-g' : 'mv-m'}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`:'';
    const smartB=!iB?`<span class="badge smart">Smart Contract</span>`:'';
    list.innerHTML+=`<div class="lcard" onclick="openLoan('${l.id}')">
      <div>
        <div class="loan-top"><span class="badge ${U.role}">${iB?'Acopio':'Productor'}</span>${smartB}<span class="loan-name">${l.name}</span></div>
        <div class="loan-region">${l.region} · Plazo: ${l.plazo}</div>
        <div class="loan-meta">${mA}${mP}${mX}${mF}<div class="mi"><div class="mi-lbl">Detalle</div><div class="lock-tag">🔒 Acceso de pago</div></div></div>
      </div>
      <div class="larr">›</div>
    </div>`;
  });
  initPagination();
}

function openLoan(id){L=getLoans().find(l=>l.id===id);tierOn=false;esgAllOn=false;esgSel={};renderDetail();show('s-detail');}

function renderDetail(){
  const iB=U.role==='banco';
  let h=`<div class="dhdr"><div class="dname">${L.name}</div><div class="dsub">${L.region} · Plazo: ${L.plazo}`;
  if(!iB)h+=` &nbsp;·&nbsp; <span style="color:var(--gold);font-size:11px">Smart Contract: ${L.contrato}</span>`;
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

// ── Per-producer ESG (varies by esgSeed) ─────────────────────────────────
function prodEsgMetrics(p){
  const s=p.esgSeed;
  const v=(base,range)=>Math.min(98,Math.max(4,base+(s%range)-Math.floor(range/2)));
  return [
    {n:'Riesgo climático',    val:(3.2+(s%30)/10-1.5).toFixed(1)+'/10', bar:v(32,28), src:'ACLIMATE / ClimateServant 2025',     interp:'Índice: temperatura, eventos extremos, sequías. Menor = mejor.'},
    {n:'Fertilidad de suelos',val:v(74,20)+'/100',                       bar:v(74,20), src:'Lab. Suelos FHIA · oct 2024',         interp:'M.O., pH, N-P-K y CIC. >70 indica suelos productivos.'},
    {n:'Disponibilidad hídrica',val:s>50?'Cuenca estable':'Estrés leve', bar:v(80,24), src:'SERNA Honduras / AQUASTAT 2022–2024',interp:'Caudal en época seca. Metodología FAO-AQUASTAT.'},
    {n:'Cobertura forestal',   val:v(38,20)+'% del predio',               bar:v(38,20), src:'ICF Honduras · 2024',                interp:'Área bajo plan de manejo activo registrado ante ICF.'},
    {n:'Huella de carbono',   val:(1.4+(s%10)/10).toFixed(1)+' kg CO₂e/kg', bar:v(53,20), src:'CIAT CCSaS / Cool Farm Alliance 2024',interp:'Emisiones en producción primaria. Promedio regional: 1.8.'},
    {n:'Índice biodiversidad',val:'Shannon '+(2.8+(s%8)/10-0.4).toFixed(1), bar:v(65,20), src:'CIAT Biodiversidad · sep 2024',    interp:'>2.5 = sistema agroforestal resiliente.'},
    {n:'Adaptación climática',val:s>40?'3 prácticas verificadas':'2 prácticas verificadas', bar:v(70,24), src:'Fichas IHCAFE / TraceFoodChain',interp:'Sombra diversificada, barreras vivas, cosecha escalonada.'},
    {n:'Verificación EUDR',   val:p.eu==='Sí'?'Verificado':'En revisión', bar:p.eu==='Sí'?100:40, src:'EU Deforestation Regulation Portal',interp:'Acceso verificado a mercado europeo libre de deforestación.'},
  ];
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
  for(const l of LOANS_BANCO.concat(LOANS_COOP)){
    const p=l.prod.find(x=>x.cod===cod);
    if(p)return p;
  }
  return null;
}

function fillProd(cod){
  const cell=document.getElementById('pxc-'+cod);
  if(!cell)return;
  const p=findProd(cod);
  if(!p)return;
  const metrics=prodEsgMetrics(p);
  const rTag=p.riesgo.includes('negativo')?`<span class="tag eu">✓ Sin reportes</span>`:p.riesgo.includes('mora antigua')?`<span class="tag ok">${p.riesgo}</span>`:`<span class="tag pend">${p.riesgo}</span>`;
  const cTag=p.confianza==='Aval otorgado'?`<span class="tag yes">✓ Aval otorgado</span>`:`<span class="tag pend">${p.confianza}</span>`;
  const cards=metrics.map(m=>`<div class="px-card">
    <div class="px-card-top"><span class="px-card-name">${m.n}</span><span class="px-card-val">${m.val}</span></div>
    <div class="px-card-src">${m.src}</div>
    <div class="px-bar"><div class="px-fill" style="width:${m.bar}%"></div></div>
    <div class="px-card-interp">${m.interp}</div>
  </div>`).join('');
  cell.innerHTML=`<div class="px-wrap">
    <div class="px-map-box">
      <div class="px-map-hdr"><span>${p.nombre}</span><span style="color:var(--accent)">${p.variedad}</span></div>
      ${buildMap(p)}
      <div class="px-map-foot">Carnet: ${p.carnet}<br>Central riesgos: ${rTag}<br>Confianza FGR: ${cTag}</div>
    </div>
    <div class="px-esg">
      <div class="px-esg-hdr">Métricas ESG individuales — ${p.nombre}</div>
      ${cards}
    </div>
  </div>`;
}

function renderAccess(){
  const {loan:l,esgKeys,plan,tierOn,isBanco}=confirmed;
  let h='';
  const mA=isBanco?`<div><div class="am-l">Monto acopio</div><div class="am-v mv-b">${l.acopio}</div></div>`:'';
  const mP=isBanco?`<div><div class="am-l">Monto productores</div><div class="am-v mv-g">${l.productores}</div></div>`:`<div><div class="am-l">Monto crédito</div><div class="am-v mv-o">${l.productores}</div></div>`;
  const mX=isBanco?`<div><div class="am-l">Productores</div><div class="am-v">${l.nProd}</div></div>`:`<div><div class="am-l">Importadora</div><div class="am-v mv-o">${l.contrato}</div></div>`;
  const mF=isBanco?`<div><div class="am-l">Paquete flexible</div><div class="am-v ${l.paqueteFlexible ? 'mv-g' : ''}">${l.paqueteFlexible ? 'Sí' : 'No'}</div></div>`:'';
  h+=`<div class="ahdr"><div class="ahdr-top"><div><div class="aname">${l.name}</div><div class="aregion">${l.region} · Plazo: ${l.plazo}</div></div><div class="aplan">Plan ${plan} · Activo</div></div><div class="ameta">${mA}${mP}${mX}${mF}</div></div>`;
  h+=`<div class="access-actions"><button class="btn-ol" onclick="window.print()">⬇ Exportar PDF</button><button class="btn-offer" onclick="goOffer()">✉ Estructurar oferta de crédito →</button></div>`;

  if(tierOn){
    if(isBanco){
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
    const cards=esgKeys.map(k=>{
      const e=ESG.find(x=>x.id===k);
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
