import publicacionesJson from "@/data/publicaciones.json"
import type { Publication, ImportantDate } from "@/lib/types"

export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// ----------------------------
// Normalizadores (clásico y robusto)
// ----------------------------
function normalizeNetwork(red: string) {
  const v = String(red ?? "").toLowerCase().trim()
  if (v.includes("insta")) return "instagram"
  if (v.includes("face")) return "facebook"
  if (v.includes("tiktok")) return "tiktok"
  if (v.includes("x") || v.includes("twitter")) return "twitter"
  if (v.includes("linkedin")) return "linkedin"
  return "instagram"
}

function normalizeFormat(tipo: string) {
  const v = String(tipo ?? "").toLowerCase().trim()
  if (v.includes("reel")) return "video"
  if (v.includes("video")) return "video"
  if (v.includes("carrusel")) return "carrusel"
  if (v.includes("imagen") || v.includes("foto")) return "imagen"
  return "imagen"
}

// ----------------------------
// ✅ Publicaciones desde JSON (data/publicaciones.json)
// ----------------------------
export const PUBLICACIONES_FROM_JSON: Publication[] = (publicacionesJson as any[]).map((row, i) => {
  const fecha = String(row.fecha ?? "")
  const d = new Date(fecha)
  const network = normalizeNetwork(row.red)
  const format = normalizeFormat(row.tipo)

  return {
    id: `json-${i + 1}`,
    date: fecha,
    dayOfWeek: DAYS_OF_WEEK[d.getDay()],
    theme: row.tema ? String(row.tema) : `Publicación ${i + 1}`,
    description: row.descripcion ? String(row.descripcion) : "",
    objective: "informar" as any, // si tu type tiene union estricta, lo ajustamos luego
    networks: [network as any],
    time: row.hora ? String(row.hora) : "08:00",
    hashtags: [],
    caption: row.caption ? String(row.caption) : "",
    format: format as any,
    responsibles: [],
    observations: "",
    status: "pendiente" as any,
    links: [],
    attachments: [],

    // ✅ FIX: networkMetrics SIEMPRE debe ser array
    // OJO: tu JSON parece traer alcance/interacciones/clics, no likes/comments/shares/views.
    // Por eso dejamos esos campos en 0 si no existen.
    networkMetrics: [
      {
        network: network as any,
        reach: Number(row.alcance ?? 0),
        likes: Number(row.likes ?? row.meGusta ?? 0),
        comments: Number(row.comentarios ?? 0),
        shares: Number(row.compartidos ?? 0),
        views: Number(row.vistas ?? 0),
      },
    ],
  } as Publication
})

// ----------------------------
// Fechas especiales
// ----------------------------
export const IMPORTANT_DATES: ImportantDate[] = [
  // Enero
  { id: "1", date: "24/01", title: "Día Internacional de la Educación (UNESCO)", month: 1 },

  // Febrero
  { id: "2", date: "03/02", title: "Día Internacional del Abogado", month: 2 },
  { id: "3", date: "04/02", title: "Día Mundial contra el Cáncer", month: 2 },
  { id: "4", date: "09/02", title: "Día del Periodista en Colombia", month: 2 },
  { id: "5", date: "13/02", title: "Día Mundial de la Radio", month: 2 },
  { id: "6", date: "14/02", title: "Día de San Valentín", month: 2 },
  { id: "7", date: "20/02", title: "Día del Camarógrafo y Fotógrafo", month: 2 },

  // Marzo
  { id: "8", date: "01/03", title: "Día del Contador Público", month: 3 },
  { id: "9", date: "03/03", title: "Día Mundial de la Vida Silvestre (UNESCO)", month: 3 },
  { id: "10", date: "08/03", title: "Día Internacional de la Mujer", month: 3 },
  { id: "11", date: "14/03", title: "Día Nacional del Trabajador de la Construcción", month: 3 },
  { id: "12", date: "17/03", title: "Día del Psicoorientador", month: 3 },
  { id: "13", date: "19/03", title: "Día del Hombre en Colombia", month: 3 },
  { id: "14", date: "20/03", title: "Día Internacional de la eliminación de la discriminación racial", month: 3 },
  { id: "15", date: "21/03", title: "Día Mundial del Síndrome de Down", month: 3 },
  { id: "16", date: "21/03", title: "Día Mundial del Agua (UNESCO)", month: 3 },
  { id: "17", date: "23/03", title: "Día del Optómetra", month: 3 },
  { id: "18", date: "30/03", title: "Día Internacional de las Trabajadoras del Hogar", month: 3 },

  // Abril
  { id: "19", date: "07/04", title: "Día Mundial de la Salud", month: 4 },
  { id: "20", date: "09/04", title: "Día de la Memoria y Solidaridad con las Víctimas del Conflicto Armado", month: 4 },
  { id: "21", date: "16/04", title: "Día Mundial del Emprendimiento", month: 4 },
  { id: "22", date: "22/04", title: "Día Internacional de la Madre Tierra (UNESCO)", month: 4 },
  { id: "23", date: "23/04", title: "Día del Idioma", month: 4 },
  { id: "24", date: "25/04", title: "Día del Niño en Colombia", month: 4 },
  { id: "25", date: "25/04", title: "Día del Bacteriólogo", month: 4 },
  { id: "26", date: "26/04", title: "Día de la Secretaria en Colombia", month: 4 },
  { id: "27", date: "27/04", title: "Día del Diseñador Gráfico", month: 4 },
  { id: "28", date: "28/04", title: "Día Mundial de la Seguridad y la Salud en el Trabajo", month: 4 },

  // Mayo
  { id: "29", date: "01/05", title: "Día del Trabajo", month: 5 },
  { id: "30", date: "02/05", title: "Día Mundial contra el Bullying o el Acoso Escolar", month: 5 },
  { id: "31", date: "03/05", title: "Día Mundial de la Libertad de Prensa / Día del Periodista", month: 5 },
  { id: "32", date: "04/05", title: "Día Internacional del Bombero", month: 5 },
  { id: "33", date: "07/05", title: "Día Mundial de la Salud Mental Materna", month: 5 },
  { id: "34", date: "10/05", title: "Día de la Madre en Colombia", month: 5 },
  { id: "35", date: "12/05", title: "Día Internacional de la Enfermería / Día del Estadista", month: 5 },
  { id: "36", date: "15/05", title: "Día del Maestro en Colombia", month: 5 },
  { id: "37", date: "17/05", title: "Día Mundial contra la Homofobia, Transfobia y Bifobia", month: 5 },
  { id: "38", date: "20/05", title: "Día del Psicólogo", month: 5 },
  { id: "39", date: "21/05", title: "Día Mundial de la Diversidad Cultural / Día de la Afrocolombianidad", month: 5 },
  { id: "40", date: "23/05", title: "Día del Estudiante", month: 5 },

  // Junio
  { id: "41", date: "01/06", title: "Día del Campesino", month: 6 },
  { id: "42", date: "05/06", title: "Día Mundial del Medio Ambiente (UNESCO)", month: 6 },
  { id: "43", date: "12/06", title: "Día Mundial contra el Trabajo Infantil", month: 6 },
  { id: "44", date: "21/06", title: "Día del Padre", month: 6 },
  { id: "45", date: "22/06", title: "Día del Abogado en Colombia", month: 6 },

  // Julio
  { id: "46", date: "04/07", title: "Día del Cooperativismo", month: 7 },
  { id: "47", date: "20/07", title: "Día de la Independencia de Colombia", month: 7 },

  // Agosto
  { id: "48", date: "07/08", title: "Batalla de Boyacá", month: 8 },
  { id: "49", date: "12/08", title: "Día Internacional de la Juventud", month: 8 },

  // Septiembre
  { id: "50", date: "21/09", title: "Día Internacional de la Paz", month: 9 },

  // Octubre
  { id: "51", date: "12/10", title: "Día de la Raza", month: 10 },
  { id: "52", date: "31/10", title: "Halloween", month: 10 },

  // Noviembre
  { id: "53", date: "01/11", title: "Día de Todos los Santos", month: 11 },
  { id: "54", date: "11/11", title: "Independencia de Cartagena", month: 11 },

  // Diciembre
  { id: "55", date: "07/12", title: "Día de las Velitas", month: 12 },
  { id: "56", date: "25/12", title: "Navidad", month: 12 },
]

// ----------------------------
// Helpers (para publicaciones demo)
// ----------------------------
function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
function getTodayDay() {
  return DAYS[new Date().getDay()]
}

// ----------------------------
// Publicaciones demo (las que ya tenías)
// ----------------------------
export const SAMPLE_PUBLICATIONS: Publication[] = [
  // Publicaciones de hoy (dinámicas)
  {
    id: "today-1",
    date: getTodayStr(),
    dayOfWeek: getTodayDay(),
    theme: "NOTICIAS SUPER",
    description: "COMUNICADO OFICIAL DE LA SUPERSUBSIDIO",
    objective: "informar" as any,
    networks: ["instagram", "facebook", "twitter", "linkedin"] as any,
    time: "9:00 AM",
    hashtags: ["#Supersubsidio", "#SupervisarEsCuidar"],
    caption: "Conoce las ultimas novedades de la Superintendencia del Subsidio Familiar.",
    format: "imagen" as any,
    responsibles: ["JAVIER DIAZ", "ISABELLA CARO"],
    observations: "",
    status: "programado" as any,
    links: [],
    attachments: [],
    networkMetrics: [], // ✅ FIX
  },
  {
    id: "today-2",
    date: getTodayStr(),
    dayOfWeek: getTodayDay(),
    theme: "APRENDE CON LA SUPER",
    description: "TIPS PARA ACCEDER AL SUBSIDIO DE VIVIENDA",
    objective: "educar" as any,
    networks: ["instagram", "facebook", "tiktok"] as any,
    time: "2:00 PM",
    hashtags: ["#SubsidioDeVivienda", "#Supersubsidio", "#SupervisarEsCuidar"],
    caption: "Te compartimos las claves para acceder al subsidio de vivienda a traves de tu caja de compensacion.",
    format: "video" as any,
    responsibles: ["JAVIER DIAZ", "JENNIFER QUINTERO"],
    observations: "",
    status: "pendiente" as any,
    links: [],
    attachments: [],
    networkMetrics: [], // ✅ FIX
  },

  // Ejemplos calendario
  {
    id: "1",
    date: "2026-03-01",
    dayOfWeek: "Domingo",
    theme: "APRENDE CON LA SUPER",
    description: "VALOR CUOTA MONETARIA 2026",
    objective: "educar" as any,
    networks: ["instagram", "facebook", "tiktok", "twitter", "linkedin"] as any,
    time: "10:00 AM",
    hashtags: ["#SubsidioFamiliar", "#CuotaMonetaria", "#Supersubsidio", "#SupervisarEsCuidar"],
    caption:
      "¡Atención trabajadores y trabajadoras de Colombia! Ya están definidas las nuevas cuotas monetarias del subsidio familiar para 2026. Consulta los valores correspondientes a tu departamento y acércate a tu Caja de Compensación Familiar para conocer cómo acceder a este beneficio.",
    format: "video" as any,
    responsibles: ["JAVIER DIAZ", "ISABELLA CARO"],
    observations: "",
    status: "publicado" as any,
    links: [
      { network: "instagram", url: "https://www.instagram.com/p/DUiOE2LyDrQs/" },
      { network: "tiktok", url: "https://www.tiktok.com/@supersubsidio/video/7501916286141361416" },
      { network: "twitter", url: "https://x.com/Supersubsidio/status/2018037103385330170" },
      { network: "linkedin", url: "https://www.linkedin.com/feed/update/urn:li:activity:7423744402981176233" },
    ],
    attachments: [],
    networkMetrics: [], // ✅ FIX
  },
]