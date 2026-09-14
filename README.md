# 🪙 Kori Inti | Sistema de Gestión Operativa Minera (ERP Industrial)

![Licencia](https://img.shields.io/badge/licencia-MIT-amber.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan.svg)
![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)
![Estado](https://img.shields.io/badge/Estado-Producción%20Ready-emerald.svg)

> **Kori Inti** (*"Sol de Oro"* en quechua) es una plataforma ERP y Sistema de Gestión Operativa (SGO) de grado industrial diseñada específicamente para empresas acopiadoras, compradoras y procesadoras de mineral polimetálico y aurífero en el Perú.

---

## 🏔️ Contexto Operativo del Negocio

El sistema modela con precisión la cadena de suministro minera peruana:
- **Zonas de Acopio en Origen**: Cajamarca, Áncash y Piura (Minería artesanal, pequeña minería y labores bajo registro **REINFO**).
- **Destino y Molienda**: Red de molinos independientes concentrados en **Trujillo (La Libertad)** (*Molino Santa Rosa*, *El Sol de Moche*, *Molino La Libertad*, *San Pedro*, etc.).
- **Fijación de Precios**: Cotizaciones internacionales en tiempo real (**COMEX / LME**) para Oro (Au), Plata (Ag) y Cobre (Cu), con conversión cambiaria oficial SBS (**USD/PEN**).

---

## ⚡ Flujo de Trabajo Core (6 Etapas Estrictas)

1. **En Origen**:
   - Registro de cliente minero formal/formalizable (**REINFO**).
   - Zona de procedencia (Cajamarca, Áncash, Piura), labor minera y persona encargada.
   - Tonelaje bruto estimado (TMH) y adelanto acordado.
   - **Registro de Leyes Estimadas**: Oro en gramos por tonelada (`g/TM`) u onzas troy por tonelada (`oz/TM`) con conversión automática (1 oz troy = 31.1035 g), Plata (`oz/TM`) y Cobre (`%`).
2. **Tránsito a Trujillo**:
   - Registro de transportista, chofer, licencia de conducir y placa de volquete.
   - Guías de remisión (GRR remitente, GRT transportista) y precintos de seguridad auditables.
3. **En Molienda (Molinos Trujillo)**:
   - Asignación a uno de los molinos independientes en Trujillo con monitoreo de capacidad operativa y carga acumulada.
   - Ticket de balanza electrónica: peso bruto, tara del camión y **peso neto TMH**.
4. **Muestreo & Leyes**:
   - Código de muestra de cliente, contra-muestra de empresa y dirimente.
   - **Factores Clave**: Porcentaje de Humedad (% H2O -> TMS) y Porcentajes de Recuperación Metalúrgica de Planta (% Recup Au, % Recup Ag, % Recup Cu).
   - Cotejo inmediato con las leyes pactadas en origen.
5. **Negociación**:
   - Calculadora comercial en tiempo real con congelamiento de cotizaciones spot.
   - Cálculo del valor metálico neto recuperable:
     - `TMS = TMH * (1 - %Humedad / 100)`
     - `Valor Metálico = Suma(TMS * Ley Fina * %Recup * Precio Spot)`
   - Deducción transparente de maquila por tonelada seca, penalidades de impurezas (As, Sb) y adelantos previos.
6. **Liquidado (Conformidad SUNAT)**:
   - Bancarización vía transferencia interbancaria (BCP, BBVA, Interbank, etc.).
   - Retención y constancia de **Detracción SUNAT (10%)**.
   - Emisión de **Boleta Oficial de Liquidación de Compra** con formato listo para impresión y exportación en PDF.

---

## 👥 Módulo de Directorio de Clientes & Mineros

- Padrón consolidado de mineros y labores mineras.
- Estatus de acreditación **REINFO** (Registro Integral de Formalización Minera).
- **Persona Encargada**: Representante o contacto directo de la labor minera.
- **Georreferenciación GPS**: Coordenadas en formato Latitud/Longitud con acceso directo a **Google Maps**.
- Historial financiero por cliente: lotes entregados, total liquidado y adelantos pendientes.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript, Tailwind CSS 3.4
- **Bundler & Dev Server**: Vite 8.3
- **Diseño Visual**: Estilo *Industrial Tech Dark Mode* (`slate-950`, acentos oro `#F59E0B` y esmeralda `#10B981`)
- **Iconografía**: FontAwesome 6
- **Tipografías**: JetBrains Mono, Rajdhani, Chakra Petch e Inter
- **Base de Datos**: Esquema relacional DDL para **PostgreSQL / Supabase** con RLS y vistas automáticas (`schema.sql`).

---

## 📦 Instalación y Despliegue Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/galgostark/koriinti.git
cd koriinti

# 2. Instalar dependencias
npm install

# 3. Iniciar el entorno de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 📄 Licencia

Distribuido bajo licencia MIT. Diseñado para la industria minera en Perú.
