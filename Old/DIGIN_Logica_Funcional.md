# DIG-IN · Mercado de Crédito Agrícola
## Documento de Replicación Lógica del Sistema

> **Nota de autoría:** Este documento describe el comportamiento funcional del sistema tal como se infiere de su implementación. Fue elaborado para permitir que un equipo independiente replique la lógica con sus propias decisiones de diseño y tecnología. *Las notas pendientes de considerar quedan incluidas en fuente itálica*.


---

## FASE 1 · MAPA LÓGICO

### 1.1 Entidades del sistema

**Usuario autenticado**
La entidad central que condiciona todo el comportamiento. Tiene identidad (nombre), rol (banco / cooperativa / microfinanciera) y un saldo de créditos disponible para consumir durante la sesión.

**Crédito (Loan)**
La unidad de negocio central. Tiene tipo (`banco` -refiere al paquete de acopio intermediario + grupo de productores-, `coop` -crédito individual a productores-, `grupo` -credito a un grupo de productores-), atributos financieros, y puede contener un conjunto de productores vinculados. Es el objeto que el usuario explora, desbloquea y eventualmente evalúa para ofertar.

**Productor**
Subentidad de un crédito. Tiene perfil productivo (variedad, historial, geolocalización, carnet de registro...), indicadores de elegibilidad (verificación regulatoria EU, aval de una entidad de garantía externa, reporte en central de riesgos) y sus propias métricas ESG individuales.

**Métricas ESG**
Conjunto fijo de 8 indicadores ambientales. Existen en dos niveles: agregadas al nivel del crédito (calculadas como promedio o moda de los productores vinculados) e individuales por productor. Son productos de información que el usuario adquiere de forma desagregada.

**Carrito de compra (sesión de detalle)**
Estado transitorio que representa la selección actual antes de confirmar el pago. Contiene dos componentes opcionales: el bloque de información fundamental del crédito y las métricas ESG seleccionadas (una, varias, o todas).

**Oferta de crédito**
Artefacto que el usuario produce tras acceder a la información de un crédito. Contiene las condiciones financieras que el prestamista propone al intermediario. Es el producto final de la jornada del usuario en el sistema.

---

### 1.2 Variables que condicionan flujos

| Variable | Tipo | Efecto |
|---|---|---|
| `rol del usuario` | Enum: banco / coop / imf | Determina qué conjunto de créditos se muestra y cómo se presentan sus datos |
| `tipo del crédito` | Enum: banco / coop / grupo | Cambia la estructura del detalle desbloqueado y el contenido de la oferta. |
| `tierOn` | Booleano | Activa o desactiva el bloque de información fundamental en el carrito |
| `esgSel` | Mapa de ids | Cuáles métricas ESG están seleccionadas; cada una tiene costo independiente |
| `paqueteFlexible` | Booleano del crédito | Habilita o no la tabla de oferta individual por productor en el formulario de oferta |
| `confirmed` | Objeto de sesión | Consolida todo lo comprado; conduce el renderizado del acceso y de la oferta |
| `saldo (wallet)` | Entero de sesión | Se descuenta al confirmar; refleja el consumo |

---

### 1.3 Estados del sistema

1. **Login**
2. **Autenticado en el mercado** — el usuario ve la lista de créditos filtrada por su rol, además de su saldo disponible en la billetera.
3. **Selección de producto (detalle / carrito)** — el usuario configura qué información desea adquirir para un crédito específico.
4. **Confirmación exitosa** — el pago fue procesado; se generó el objeto `confirmed` y se descontó el saldo de la billetera.
5. **Acceso a la información** — el usuario navega la información desbloqueada del crédito.
6. **Estructuración de oferta** — el usuario construye y previsualiza una propuesta de crédito.
7. **Oferta enviada** — estado terminal de la jornada para ese crédito.

Los estados 3–7 están ligados a un crédito específico. Cerrar sesión regresa al estado 1.

---

### 1.4 Eventos (triggers)

- **Login exitoso:** activa el contexto de usuario y carga la lista de créditos.
- **Selección de crédito:** carga el objeto `L` y reinicia el estado del carrito.
- **Toggle de bloque fundamental:** modifica `tierOn` y recalcula el total.
- **Toggle de métrica ESG individual:** modifica `esgSel` y recalcula el total.
- **Toggle de todas las ESG:** establece todas o ninguna de forma masiva.
- **Confirmar acceso:** valida que hay al menos un ítem, descuenta el saldo, fija `confirmed` y transita al estado de confirmación.
- **Expandir fila de productor:** carga y renderiza el detalle individual (perfil + ESG filtradas al subconjunto adquirido).
- **Estructurar oferta:** carga el formulario pre-cargado con los datos del crédito activo.
- **Cambio en el formulario de oferta:** recalcula en tiempo real la vista previa (incluyendo cuota estimada).
- **Enviar oferta:** valida los campos mínimos y transita al estado terminal.
- **Logout / Volver al mercado:** reinicia la paginación.

---

### 1.5 Transiciones principales

```
Login correcto
  → Mercado (filtrado por rol)
    → Seleccionar crédito
      → Detalle + carrito
        → Confirmar (total > 0)
          → Pantalla de éxito
            → Ver acceso
              → Estructurar oferta
                → Enviar oferta
                  → Estado terminal de oferta
        → Cancelar / Volver al mercado
    → Cerrar sesión
      → Login
```

---

## FASE 2 · DOCUMENTO DE REPLICACIÓN

---

### 2.1 Estructura lógica: Componentes funcionales

El sistema tiene siete **zonas funcionales** que operan en secuencia:

**Zona 1 — Autenticación**
Valida credenciales contra un directorio de usuarios. Al autenticar, establece el perfil del usuario y su saldo de sesión.


**Zona 2 — Mercado (listado)**
Muestra los créditos disponibles como tarjetas con información parcial. La información sensible (detalle, productores, ESG) está marcada visualmente como bloqueada. La lista se pagina con ventana fija de *n* elementos. El conjunto de créditos mostrado depende directamente del rol del usuario. *Pendientes por considerar:*

- *Orden de visualización de los créditos, podría ser con la fecha de ingreso o la de desembolso*
- *¿Cuándo eliminar el crédito? Si se asigna, eliminar. Si nunca se asigna, ¿eliminar después de la fecha estimada de desembolso? Definir.*
- *De pronto agregar una opción para eliminar el crédito de la visualización de un usuario, algo tipo "No me interesa".*


**Zona 3 — Detalle + Carrito**
Permite al usuario seleccionar qué información desea adquirir para un crédito específico. Tiene dos líneas de producto: el bloque fundamental (con información general del crédito e información general del perfil de productores) y las métricas ESG (precio fijo por métrica, igual para todas). El total se recalcula en tiempo real. El botón de confirmación permanece inactivo si el total es cero. *Consideración*:

- *Estos pagos se van a actualizar después del estudio de DAP. Muy probablemente vayan a depender del número de productores asociados al crédito.*


**Zona 4 — Confirmación de pago**
Procesa la transacción (descuenta saldo), asigna un "plan" según la combinación adquirida, y consolida el objeto de acceso. No hay reversión.


**Zona 5 — Vista de acceso**
Renderiza la información desbloqueada según el plan adquirido. El contenido varía según el tipo de crédito. Los productores se muestran en tabla expandible; al expandir una fila se renderizan la información general, el mapa de la parcela y las métricas ESG individuales, pero solo las que fueron adquiridas en la sesión de compra.  *Algunas consideraciones:*

- *La sección que está debajo de "Estructurar oferta de crédito" cambia según el tipo de crédito (`banco`, `coop`, `grupo`), es un agregado general.*
- *Si se compra el bloque fundamental, se debería habilitar la sección que se mencionó arriba, y también la sección de "PERFIL PRODUCTIVO" que hay a nivel de productor (dentro del listado desplegable).*
- *Cada métrica ESG en realidad será el acceso a una pestaña de información (de las que hay actualmente en el Marketplace): información de productor, de finca, comercial, cartera... y para el futuro, información específica por conexiones con la DPI: aclimatar, agroclimática, suelos de Honduras... Estas son las pestañas que se activan en el pago, no variables individuales.*


**Zona 6 — Formulario de oferta**
Permite al prestamista estructurar una propuesta de crédito con condiciones financieras y garantías. Si el crédito admite paquete flexible, la tabla de productores se habilita para asignar montos individuales. Una vista previa se actualiza en tiempo real con cada cambio, incluyendo el cálculo estimado de cuota mensual.


**Zona 7 — Confirmación de oferta enviada**
Estado terminal informativo. Muestra el resumen de lo que fue enviado al solicitante de crédito.

---

### 2.2 Flujo del sistema: Secuencia y decisiones clave

**Paso 1 — Autenticación**
El sistema verifica email y contraseña. Si la combinación existe, se establecen: el objeto de usuario activo, el saldo del usuario, y el título del mercado (que cambia según el rol).


**Paso 2 — Carga del mercado**
Se construye la lista de créditos combinando dos fuentes según el rol: Actualmente banco ve BANCO; coop e imf ven COOP, todos ven grupos (*ESTO ESTÁ PENDIENTE POR DEFINIR*). La paginación se activa solo si el total de tarjetas supera *n*.


**Paso 3 — Apertura de un crédito**
Al seleccionar una tarjeta, el sistema carga el crédito en contexto y reinicia completamente el estado del carrito (`tierOn=false`, `esgSel={}`). Se navega a la zona de detalle.


**Paso 4 — Configuración del carrito**
El usuario activa o desactiva los ítems disponibles. Decisión crítica: si el total es 0, la confirmación está bloqueada. El sistema no obliga a comprar nada en particular; la combinación es libre.

- *Considerar: agregar una opción de "estructurar oferta" sin comprar ninguna información adicional.*


**Paso 5 — Confirmación**
Al confirmar, se ejecutan dos operaciones atómicas: descontar el total del saldo de sesión y construir el objeto `confirmed` con el plan clasificado. La clasificación del plan es: "Estándar" (solo fundamentales), "Solo ESG" (solo métricas), "Premium" (ambos). Este objeto gobierna todo lo que el usuario puede ver en la zona de acceso.


**Paso 6 — Navegación del acceso**
El sistema renderiza secciones condicionadas por `confirmed.tierOn` y `confirmed.esgKeys`. Si no se adquirió el bloque fundamental, la sección de datos del intermediario/productor no aparece. Si no se adquirieron ESGs, las métricas agregadas tampoco aparecen. La expansión de productores en la tabla también filtra las ESGs al subconjunto pagado.

- *En el plan de "Solo ESG" y en el plan "Premium" cuando aparecen las métricas agregadas abajo, está pendiente definir cómo se haría la agregación de las variables a nivel de paquete de créditos. También hay que definir si esa opción existiría para créditos de un solo productor, pues el resumen sería igual al desagregado.*


**Paso 7 — Oferta**
El formulario siempre está disponible desde la vista de acceso, independientemente del plan adquirido. La tabla de productores editables solo aparece si el crédito tiene `paqueteFlexible=true`. Al enviar, se validan tres campos mínimos (monto, tasa, plazo); si faltan, el envío se rechaza con alerta.

---

### 2.3 Variables condicionantes: Solo las que cambian el comportamiento

**`U.role`** — La variable de mayor alcance. El "rol" afecta qué créditos se visualizan.

**`L.tipo`** — Afecta la estructura del detalle dentro del acceso. Hay tres ramas: `banco` (intermediario comercializador con productores vinculados), `coop` (productor individual), y `grupo` (colectivo de productores con información agregada).

**`L.paqueteFlexible`** — Booleano que habilita la tabla de asignación por productor en la oferta. Un crédito con `paqueteFlexible=false` no muestra esa sección.

**`confirmed.tierOn`** — Si es falso, toda la sección de información fundamental en la vista de acceso queda suprimida, sin importar el tipo de crédito.

**`confirmed.esgKeys`** — Si está vacío, las tarjetas ESG agregadas del crédito no se renderizan. Cuando se expande un productor, solo se muestran las métricas cuyo id está en este arreglo.

---

### 2.4 Datos y su interacción

**Estructura de datos**

Hay tres colecciones de créditos (`LOANS_BANCO`, `LOANS_COOP`, `LOANS_GRUPO`) y una colección de métricas ESG de referencia (`ESG`, `ESG_META`), más el directorio de usuarios (`USERS`).

- *Nuevamente, las métricas se actualizarán por conjuntos de datos del productor.*

Cada crédito es un objeto con dos capas: los atributos del crédito en sí (financieros y operativos) y un arreglo de productores vinculados (`prod`), donde cada productor tiene sus propios atributos de perfil y su propio arreglo de 8 métricas ESG individuales.

Cada productor dentro de un crédito tiene un campo `esgSeed` (un entero derivado de su código) que el sistema usa para generar un mapa de la parcela/finca.


**Cómo se cargan y transforman**

Para la simulación, los datos viven en memoria como constantes globales. *Sin embargo, es mejor diseñar una carga asíncrona o API externa en el flujo de datos principal. Al autenticar, `getLoans()` construye dinámicamente la lista combinando los conjuntos relevantes según el rol.*

Para la simulación, `computeLoanEsg()` Agrega las métricas ESG existentes. *Sin embargo, como se mencionó arriba, está pendiente definir cómo se haría la agregación de las variables a nivel de paquete de créditos. También hay que definir si esa opción existiría para créditos de un solo productor, pues el resumen sería igual al desagregado.*



**Cómo afectan el flujo**

El campo `precio` del crédito determina el costo del bloque fundamental. Este precio varía por crédito (*deberá hacerlo dependiendo del número de productores asociados*). El costo de cada métrica ESG variará de la misma forma y será diferente según la métrica. El total del carrito es la suma aritmética de los ítems seleccionados.

El campo `aval` de cada productor (valor A o B) y `confianza` condicionan las etiquetas de riesgo en la tabla de productores y en el perfil expandido. Son datos descriptivos, no lógica de negocio que bloquee acciones.

El campo `eu` (verificación EUDR) es igualmente descriptivo: indica si el productor tiene verificación de deforestación de la UE. No bloquea la operación pero es información crítica de elegibilidad que el prestamista necesita para estructurar su oferta.


---

### 2.5 Conjuntos de datos LOANS_*: Similitudes, diferencias y efecto en el sistema

**Similitudes entre los tres conjuntos**
Todos comparten la misma estructura base: `id`, `name`, `region`, `tipo`, `plazo`, `precio`, `nProd`, `prod[]`. Todos los créditos tienen productores con ESG individuales. El mecanismo de compra (carrito, confirmación, acceso) funciona igual para los tres.

**LOANS_BANCO**
Créditos de mayor escala. Tienen dos componentes de monto: `acopio` (para el intermediario) y `productores` (para los productores individuales vinculados). Incluyen atributos corporativos como `anios`, `volExport`, `mercados`, `garantias`. Pueden tener `paqueteFlexible=true` o `paqueteFlexible=false`, lo que habilita la tabla de asignación individual en la oferta.

**LOANS_COOP**
Créditos individuales de productor. No tienen `acopio`. El monto (`productores`) es el crédito personal del productor. Incluyen atributos de trazabilidad individual: `parcela`, `carnet`, `contrato`, `volContrato`, `geo`. Siempre tienen `paqueteFlexible=false`. El `prod[]` contiene un único elemento (el mismo productor que encabeza el crédito).

**LOANS_GRUPO**
Créditos colectivos. Tienen `tipo: 'grupo'` y no tienen `acopio`. El `prod[]` contiene alrededor de *m* productores. Incluyen atributos de caracterización colectiva: `volumenTotal`, `variedades`, `destinos`, `accesoMercado`. Pueden tener `paqueteFlexible=true` o `paqueteFlexible=false`, lo que habilita la tabla de asignación individual en la oferta.

**Efecto en el sistema**
El campo `tipo` del crédito es el árbol de decisión más importante en la zona de acceso. Determina qué sección de información fundamental se renderiza. El campo `paqueteFlexible` es el segundo árbol de decisión, afectando únicamente la zona de oferta. Los créditos `LOANS_COOP` tienen una experiencia de "productor único": el carrito, el acceso y la oferta se comportan igual que para los otros tipos, pero el contenido desplegado es solo una persona.

---

### 2.7 Reglas de negocio

**Suscripción base siempre activa**
Se asume que el usuario tiene una membresía activa que le da derecho a ver el listado completo.

**Acceso por ítem, no por crédito**
El usuario puede comprar solo las métricas ESG sin el bloque fundamental, solo el bloque fundamental sin ESG, o cualquier combinación. No hay bundling obligatorio. Esto significa que la vista de acceso puede estar parcialmente vacía si el usuario compró solo un componente.

**Las ESGs del acceso son un subconjunto de las compradas**
Al expandir un productor en la tabla, el sistema solo muestra las métricas ESG cuyo id esté en `confirmed.esgKeys`. Si el usuario compró solo 2 de 8 métricas, el productor solo muestra 2 tarjetas. Esto aplica tanto al nivel de crédito como al nivel de productor individual.

**La oferta siempre está disponible**
No hay restricción de plan para acceder al formulario de oferta. Un usuario que compró solo una métrica ESG puede igualmente estructurar y enviar una oferta. La información que el sistema pre-carga en la cabecera de la oferta proviene de `confirmed.loan`, no del plan adquirido.

**Validación mínima de la oferta**
El envío requiere al menos monto, tasa y plazo. Los demás campos (garantía, período de gracia, seguro, aval, destino, notas) son opcionales. El sistema no valida coherencia entre el monto ofertado y el monto solicitado por el crédito.

- *Pendiente confirmar estos condicionantes.*

**El saldo no bloquea la compra**
El saldo de sesión se descuenta al confirmar, pero por ahora no hay validación de que el saldo sea suficiente antes de proceder. En producción este sería el punto de integración con el sistema de facturación.


---

### 2.8 Guía de replicación: Orden lógico, dependencias y riesgos

**Orden RECOMENDADO de construcción**

1. **Modelo de datos primero.** Antes de construir cualquier interfaz, definir las estructuras de Crédito, Productor y Métrica ESG con sus relaciones. La distinción entre métricas a nivel de crédito (agregadas) y métricas a nivel de productor (individuales) es la relación más delicada.

+ *Este primer paso probablemente vaya a cambiar después.*

2. **Sistema de autenticación y sesión.** Implementar el mecanismo de roles antes que cualquier lógica de vista, porque el rol condiciona casi todo lo demás.

3. **Lógica de composición del mercado.** La función que combina los conjuntos de créditos según el rol es el corazón del filtrado. Implementar y testear esto de forma aislada.

4. **Motor de carrito y confirmación.** Este módulo debe ser completamente independiente de la presentación. Su contrato: recibe selecciones, calcula totales, emite un objeto de acceso. La transición a "confirmado" es irreversible dentro de la sesión.

5. **Lógica de agregación ESG.**

+ *Este paso depende de la información que vaya a quedar en el 1.*

6. **Renderizado del acceso.** Con el objeto `confirmed` ya diseñado, este módulo es mayormente presentacional. Pero ojo: el filtrado de ESGs por productor (mostrar solo las compradas) debe integrarse aquí.

7. **Formulario de oferta.** Es el módulo más autónomo. Depende solo de `confirmed.loan` para pre-cargar datos. La tabla de paquete flexible es un sub-módulo opcional condicionado por `paqueteFlexible`.

**Dependencias críticas**

El objeto `confirmed` es el pivote del sistema en su segunda mitad. Todo lo que ocurre después de la confirmación (acceso, oferta, envío) depende de este objeto. Cualquier replicación debe diseñar este objeto con cuidado, porque su estructura determina qué puede mostrarse y qué no.

La distinción `tipo` del crédito (`banco` / `coop` / `grupo`) debe estar presente en ese objeto porque el renderizado del acceso la necesita incluso si el crédito original ya no está en contexto inmediato.

**Riesgos de replicación**

El mayor riesgo es asumir que el contenido del acceso es uniforme. No lo es: hay tres ramas de renderizado según el tipo de crédito, y dentro de cada rama hay sub-condiciones según el plan adquirido. Un equipo que unifique esta lógica perderá información diferenciada por tipo de actor.

El segundo riesgo es tratar las métricas ESG como un bloque monolítico. Son individualmente seleccionables y tienen dos representaciones (agregada para el crédito, individual para el productor), y la vista de productor filtra por lo comprado. Cualquier implementación que no respete esta granularidad romperá la lógica de monetización por ítem.

El tercer riesgo es implementar `paqueteFlexible` como un campo cosmético. En realidad habilita una sub-lógica completa de asignación por productor en el formulario de oferta, que puede tener implicaciones en cómo se procesa la oferta aguas abajo.

---

*Documento generado a partir del análisis de los archivos `body.html`, `script.js`, y `data.js` de la simulación del sistema DIG-IN · Honduras.*
