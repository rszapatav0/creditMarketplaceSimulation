const USERS=[
  /* {email:'banco@bancafe.hn',pass:'banco2024',role:'banco',name:'BanCafé — Analista de Crédito'},
  {email:'gestor@cofemarcala.hn',pass:'coop2024',role:'coop',name:'Coop. Cafetalera Marcala'},
  {email:'analista@fise.hn',pass:'imf2024',role:'imf',name:'FISE — Oficial de Cartera'}, */
  {email:'1',pass:'1',role:'banco',name:'BanCafé — Analista de Crédito'},
  {email:'2',pass:'2',role:'coop',name:'Coop. Cafetalera Marcala'},
  {email:'3',pass:'3',role:'imf',name:'FISE — Oficial de Cartera'},
];

const precioFundamentales=100;

// ── Metrics and tools ──────────────────────────────────────────────────────
const ESG=[
  {id:'e1',label:'aCLIMAtar',cost:80},
  {id:'e2',label:'Whisp - Open Foris',cost:70},
  {id:'e4',label:'Croppie',cost:80},
];

const ACLIMATAR_CONFIG = {
  n:   'aCLIMAtar',
  src: 'Alianza Bioversity Internacional y CIAT, Producers Direct, Fundación Mundial del Cacao (WCF), Rikolto, Fundación Hanns R. Neumann Stiftung.',
  aptitudClimActualClass: {
    low:'low',medium:'medium',high:'high',uncertain:'uncertain',limitations:'limitations',unsuitable:'unsuitable',unknown:'unknown'},
  aptitudClimActualLabel: {
    low:'Déficit hídrico bajo',medium:'Déficit hídrico intermedio',high:'Déficit hídrico alto',uncertain:'Aptitud incierta',limitations:'Con limitaciones',unsuitable:'No idóneo',unknown:'Sin información'},
  aptitudClimActualInterp: {
    low: 'La zona presenta un déficit hídrico bajo en época seca, lo que indica condiciones generalmente favorables para el cultivo. La duración y severidad del estrés hídrico son limitadas, aunque pueden existir variaciones locales.',
    medium: 'La época seca en esta zona tiene un déficit hídrico intermedio, tiene una duración de 4,3 meses y 78mm en promedio de lluvia trimestral. El trimestre más seco en esta zona tiene una temperatura promedio aproximada de 19°C. Estos valores son un promedio de toda la zona, pero las condiciones varían según la ubicación.',
    high: 'La zona presenta un déficit hídrico alto en época seca, lo que sugiere condiciones restrictivas para el cultivo. Es probable que se requieran medidas de adaptación para sostener la producción.',
    uncertain: 'Las condiciones de déficit hídrico no pueden ser clasificadas con precisión debido a la variabilidad o falta de datos suficientes en la zona.',
    limitations: 'Existen limitaciones importantes en la disponibilidad de información climática para esta zona, lo que restringe la precisión de la clasificación.',
    unsuitable: 'Las condiciones de déficit hídrico indican que la zona no es adecuada para el cultivo bajo los parámetros actuales.',
    unknown: ''},
  aptitudClimFuturaClass: {
    low:'low',medium:'medium',high:'high',uncertain:'uncertain',limitations:'limitations',unsuitable:'unsuitable',unknown:'unknown'},
  aptitudClimFuturaLabel: {
    low:'Déficit hídrico bajo',medium:'Déficit hídrico intermedio',high:'Déficit hídrico alto',uncertain:'Aptitud incierta',limitations:'Con limitaciones',unsuitable:'No idóneo',unknown:'Sin información'},
  aptitudClimFuturaInterp: {
    low: 'Las proyecciones climáticas sugieren que la zona mantendrá condiciones relativamente favorables para el cultivo en los próximos 30 años, con cambios moderados en el balance hídrico.',
    medium: 'Las proyecciones indican una transición hacia condiciones intermedias, donde el cultivo seguirá siendo viable pero con mayor exposición a estrés climático.',
    high: 'Las proyecciones muestran un aumento significativo del estrés climático, lo que podría reducir la idoneidad de la zona para el cultivo en el mediano plazo.',
    uncertain: 'Estas zonas son aptas para el cultivo, pero la información climática no nos permite clasificarlas claramente en una de las zonas agroclimáticas, porque están entre dos zonas y tienen características de ambas.',
    limitations: 'Las limitaciones en los modelos o datos disponibles reducen la confiabilidad de la proyección climática para esta zona.',
    unsuitable: 'Las proyecciones indican condiciones desfavorables persistentes para el cultivo en el horizonte de 30 años.',
    unknown: ''},
  gradienteClimClass: {
    low:'low',medium:'medium',high:'high',unsuitable:'unsuitable',unknown:'unknown'},
  gradienteClimLabel: {
    low:'Adaptación incremental',medium:'Adaptación sistématica',high:'Adaptación transformacional',unsuitable:'No idóneo',unknown:'Sin información'},
  gradienteClimInterp: {
    low: 'Donde es más probable que el clima siga siendo adecuado y la adaptación se logrará mediante un cambio de prácticas y estrategias y facilitadores idealmente mejorados. Los patrones alterados de plagas y enfermedades, la lluvia incierta, la sequía y el calor pueden afectar el cultivo, pero la producción de cacao seguirá siendo factible.',
    medium: 'El cambio climático proyectado requiere adaptación sistemática, con ajustes más estructurales en manejo agronómico y estrategias productivas.',
    high: 'El cambio climático proyectado implica una adaptación transformacional, donde podrían requerirse cambios significativos en el sistema productivo o incluso en la viabilidad del cultivo.',
    unsuitable: 'El nivel de cambio proyectado sugiere condiciones no aptas para la continuidad del cultivo bajo el sistema actual.',
    unknown: ''},
  calorClass: {
    low:'low',medium:'medium',high:'high',unsuitable:'unsuitable',unknown:'unknown'},
  calorLabel: {
    low:'Riesgo bajo',medium:'Riesgo medio',high:'Riesgo alto',unsuitable:'No idóneo',unknown:'Sin información'},
  calorInterp: {
    low: 'La exposición a temperaturas elevadas es baja en comparación con zonas cafetaleras típicas, aunque pueden presentarse episodios puntuales de calor.',
    medium: 'La exposición a temperaturas elevadas es moderada y puede generar estrés térmico ocasional en el cultivo durante ciertas épocas del año.',
    high: 'Es probable que experimente temperaturas inusuales a las que conocen actualmente áreas cafetaleras.',
    unsuitable: 'Las condiciones térmicas son severas y no adecuadas para el cultivo bajo los parámetros actuales.',
    unknown: ''},
  sequiaClass: {
    low:'low',medium:'medium',high:'high',unsuitable:'unsuitable',unknown:'unknown'},
  sequiaLabel: {
    low:'Riesgo bajo',medium:'Riesgo medio',high:'Riesgo alto',unsuitable:'No idóneo',unknown:'Sin información'},
  sequiaInterp: {
    low: 'La disponibilidad hídrica en época seca es relativamente estable, lo que reduce el riesgo de estrés hídrico para el cultivo.',
    medium: 'La época seca presenta restricciones hídricas moderadas que pueden afectar el rendimiento si no se implementan prácticas de manejo adecuadas.',
    high: 'La época seca presenta fuertes restricciones hídricas, lo que aumenta significativamente el riesgo de afectación del cultivo.',
    unsuitable: 'La zona de su ubicación se clasifica como No idónea. La época seca presenta limitaciones para la caficultura.',
    unknown: ''}
  };

const WHISP_CONFIG = {
  n:   'Whisp - Open Foris',
  src: 'Organización de las Naciones Unidas para la Alimentación y la Agricultura - 2025 OpenForis.',
  riskClass: {
    low:'low',high:'high',uncertain:'uncertain',unknown:'unknown'},
  riskLabel: {
    low:'Riesgo bajo',high:'Riesgo Alto',uncertain:'Se requiere más información',unknown:'Sin información'},
  riskInterp: {
    low:      'La finca no presenta superposición con áreas de bosque cartografiado activo, o sus coincidencias corresponden a perturbaciones anteriores a finales de 2020. Sin indicios de deforestación reciente.',
    high:     'La finca se encuentra dentro de un área de bosque cartografiado y registra una perturbación detectada después de 2020. Se recomienda verificación adicional antes del desembolso.',
    uncertain: 'La finca coincide con un área de bosque cartografiado sin perturbaciones registradas antes ni después de 2020, y sin solapamiento con actividades económicas. Se requiere investigación más detallada para determinar cumplimiento EUDR.',
  }
};

const CROPPIE_CONFIG = {
  n:   'Croppie',
  src: 'Alianza Bioversity Internacional y CIAT, Producers Direct, Tecnicafé.',
};


// ── Credits list: demo ──────────────────────────────────────────────────────
const LOANS_BANCO_TEST=[
  {id:'b1',tipo:'banco',testValue:'yes',fechaDesembolso:'2024-11-01',name:'Exportadora El Paraíso S.A. Test',region:'El Paraíso, Honduras',
    acopio:'2,400,000',productores:'680,000',nProd:38,paqueteFlexible: true,
    destinos:'Cosecha, insumos, infraestructura',areaProd:'3.1',volumenTotal:'111',
    plazoAcopio:'6',anios:12,volExport:'1,840',contrato:'Supremo Hamburg GmbH',smartContract:true,volContrato:'38',mercados:'Alemania, Países Bajos',
   prod:[
    {cod:'HN-0041',nombre:'Martínez Flores, J.',monto:'L. 18,000',plazo:'5 meses',destino:'Insumos',aval:'A',
      department:'Santa Bárbara', municipality:'San Nicolás', aldea:'Las Marías', areaProd:'2.4 mz', geo:'14.21°N 86.83°W',carnet:'IHCAFE-2021-0041',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
      propertyDocument:'Sí', tenancyTipe:'Propiedad',histAcopio:'42 qq / 3 ciclos',histIngresos:'1000 HNL / 3 ciclos',otherIncome:'Sí', amountOtherIncome:'5000 HNL',
     esg:[
      {id:'e1', aptitudClimActual:'low', aptitudClimFutura:'medium', gradienteClim: 'high', calor: 'unknown', sequia: 'unsuitable', estimationDate:'2024-11-01',
        practicasMuyRecomendadas:'Aumentar la cobertura de sombra, Cosecha de agua, Renovación de árboles de sombra',
        practicasRecomendadas:'Injerto, Uso de biochar en vivero, Renovación de cafetales, Fertilización orgánica, Conservación de suelos'},
      {id:'e2', risk:'low', estimationDate:'2024-11-01'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
    {cod:'HN-0052',nombre:'López Aguilar, R.',monto:'L. 22,000',plazo:'6 meses',destino:'Cosecha',aval:'A',
      department:'Lempira', municipality:'Lempira', aldea:'Las Marías', areaProd:'1.3 mz', geo:'14.18°N 86.91°W',carnet:'IHCAFE-2020-0052',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
      propertyDocument:'No', tenancyTipe:'Arriendo',histAcopio:'55 qq / 4 ciclos',histIngresos:'2000 HNL / 4 ciclos',otherIncome:'No', amountOtherIncome:'',
     esg:[
      {id:'e1', aptitudClimActual:'low', aptitudClimFutura:'medium', gradienteClim: 'high', calor: 'unknown', sequia: 'medium', estimationDate:'2024-11-01',
        practicasMuyRecomendadas:'Aumentar la cobertura de sombra, Cosecha de agua, Renovación de árboles de sombra',
        practicasRecomendadas:'Injerto, Uso de biochar en vivero, Renovación de cafetales, Fertilización orgánica, Conservación de suelos'},
      {id:'e2', risk:'high', estimationDate:'2024-11-01'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
   ]},
];

const LOANS_COOP_TEST=[
  {id:'c1',tipo:'coop',testValue:'yes',fechaDesembolso:'2024-11-01',name:'Ramiro Rosales Aguilar Test',region:'Ocotepeque, Honduras',
    acopio:null,productores:'45,000',nProd:1,paqueteFlexible: false,
    destinos:'Cosecha, insumos, infraestructura',areaProd:'2',volumenTotal:'111',
    contrato:'Supremo Hamburg GmbH',smartContract:true,volContrato:'38',
   prod:[{cod:'OC-0033',nombre:'Rosales Aguilar, R.',monto:'L. 45,000',plazo:'5 meses',destino:'Cosecha + insumos',aval:'A',
    department:'Santa Bárbara', municipality:'Arada', aldea:'La Esperanza', areaProd:'3.1 mz', geo:'14.41°N 89.22°W',carnet:'IHCAFE-2020-0033',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
    propertyDocument:'No', tenancyTipe:'Arriendo',histAcopio:'38 qq / 3 ciclos',histIngresos:'1300 HNL / 3 ciclos',otherIncome:'Sí', amountOtherIncome:'5000 HNL',
    esg:[
      {id:'e1', aptitudClimActual:'low', aptitudClimFutura:'medium', gradienteClim: 'high', calor: 'unknown', sequia: 'low', estimationDate:'2024-11-01',
        practicasMuyRecomendadas:'Aumentar la cobertura de sombra, Cosecha de agua, Renovación de árboles de sombra',
        practicasRecomendadas:'Injerto, Uso de biochar en vivero, Renovación de cafetales, Fertilización orgánica, Conservación de suelos'},
      {id:'e2', risk:'low', estimationDate:'2024-11-01'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
    ]}]},
];

const LOANS_GRUPO_TEST=[
  {id:'g1',tipo:'grupo',testValue:'yes',fechaDesembolso:'2024-11-03',name:'Grupo Productores La Esperanza Test',region:'El Paraíso, Honduras',
    acopio:null,productores:'105,000',nProd:3,paqueteFlexible:true,
    destinos:'Cosecha, insumos, infraestructura',areaProd:'3.1',volumenTotal:'111',
    contrato:null,smartContract:true,volContrato:null,
   prod:[
    {cod:'EP-0101',nombre:'García Méndez, L.',monto:'L. 35,000',plazo:'5 meses',destino:'Cosecha',aval:'A',
      department:'Yoro', municipality:'Yoro', aldea:'San Rafael', areaProd:'0.5 mz', geo:'14.20°N 86.85°W',carnet:'IHCAFE-2021-0101',variedad:'Catuaí rojo',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
     propertyDocument:'No', tenancyTipe:'Arriendo',histAcopio:'40 qq / 3 ciclos',histIngresos:'1500 HNL / 3 ciclos',otherIncome:'Sí', amountOtherIncome:'3200 HNL',
     parcela:'2.1 ha · Finca El Roble',volContrato:'40 qq',contrato:'Exportadora Centroamérica S.A.',
     esg:[
      {id:'e1', aptitudClimActual:'uncertain', aptitudClimFutura:'medium', gradienteClim: 'high', calor: 'low', sequia: 'high', estimationDate:'2024-11-01',
        practicasMuyRecomendadas:'Aumentar la cobertura de sombra, Cosecha de agua, Renovación de árboles de sombra',
        practicasRecomendadas:'Injerto, Uso de biochar en vivero, Renovación de cafetales, Fertilización orgánica, Conservación de suelos'},
      {id:'e2', risk:'low', estimationDate:'2024-11-01'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
    {cod:'EP-0102',nombre:'Pineda López, M.',monto:'L. 30,000',plazo:'6 meses',destino:'Insumos',aval:'A',
      department:'Yoro', municipality:'Yorito', aldea:'San Carlos', areaProd:'0.4 mz', geo:'14.18°N 86.88°W',carnet:'IHCAFE-2020-0102',variedad:'Lempira',riesgo:'Sin reporte negativo',confianza:'Aval otorgado',
     propertyDocument:'No', tenancyTipe:'Arriendo',histAcopio:'36 qq / 4 ciclos',histIngresos:'1200 HNL / 4 ciclos',otherIncome:'No', amountOtherIncome:'',
     parcela:'1.9 ha · Finca La Reforma',volContrato:'36 qq',contrato:'Exportadora Centroamérica S.A.',
     esg:[
      {id:'e1', aptitudClimActual:'limitations', aptitudClimFutura:'medium', gradienteClim: 'high', calor: 'high', sequia: 'high', estimationDate:'2024-11-01',
        practicasMuyRecomendadas:'Aumentar la cobertura de sombra, Cosecha de agua, Renovación de árboles de sombra',
        practicasRecomendadas:'Injerto, Uso de biochar en vivero, Renovación de cafetales, Fertilización orgánica, Conservación de suelos'},
      {id:'e2', risk:'low', estimationDate:'2024-11-01'},
      {id:'e4', yield:'22', production:'110', estimationDate:'2024-11-01'},
     ]},
   ]},
];


// ── Credits list: DCE ──────────────────────────────────────────────────────
const LOANS_BANCO=[
  {id:'b2',tipo:'banco',testValue:'no',fechaDesembolso:'2024-11-01',name:'Exportadora El Paraíso S.A.',
    acopio:'2,400,000',productores:'680,000',nProd:38,paqueteFlexible: true,
    fundamentales:true,priceFundamentales:'100',
    aclimatar:true,whisp:true,croppie:true,priceTools:'150',
  },
  {id:'b6',tipo:'banco',testValue:'no',fechaDesembolso:'2024-11-01',name:'Exportadora El Paraíso S.A.',
    acopio:'2,400,000',productores:'680,000',nProd:38,paqueteFlexible: true,
    fundamentales:true,priceFundamentales:'100',
    aclimatar:false,whisp:false,croppie:false,priceTools:null,
  },
];

const LOANS_COOP=[
  {id:'c2',tipo:'coop',testValue:'no',fechaDesembolso:'2024-11-04',name:'Ramiro Rosales Aguilar',
    acopio:null,productores:'45,000',nProd:1,paqueteFlexible: false,
    fundamentales:true,priceFundamentales:'100',
    aclimatar:false,whisp:false,croppie:true,priceTools:'50',
  },
];

const LOANS_GRUPO=[
  {id:'g2',tipo:'grupo',testValue:'no',fechaDesembolso:'2024-11-05',name:'Grupo Productores La Esperanza',
    acopio:null,productores:'105,000',nProd:3,paqueteFlexible:true,
    fundamentales:false,priceFundamentales:null,
    aclimatar:true,whisp:false,croppie:true,priceTools:'150',
  },
];
