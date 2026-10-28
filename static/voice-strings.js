/**
 * Text of the voice assistant, per voice language (static/voice-assistant.js).
 *
 * Placeholders: {label} = field name, {value} = value filled in, {count} = number of fields.
 * FIELD_NAMES_ES gives Spanish spoken names for the watch form fields.
 * FIELD_ALIASES are the words that start a field in a long dictation.
 * Words are matched without accents and in lower case.
 */

const VOICE_STRINGS = {
  "es-ES": {
    start: "Vamos a llenar el registro. Diga parar para terminar, o siguiente para saltar un campo.",
    listening: "Asistente escuchando. Diga parar para terminar.",
    confirm: "{label}: {value}. ¿Está bien? Diga sí para confirmar, o diga el valor correcto.",
    rewrite: "Vuelva a decir el valor, o escríbalo en el campo.",
    notHeard: "No le oí. Diga de nuevo.",
    notUnderstood: "No entendí. Diga de nuevo, o escríbalo.",
    stopping: "No oí nada. Me detengo.",
    allFilled: "Todos los campos están llenos. Revise y guarde.",
    finished: "Asistente terminado. Revise los campos antes de guardar.",
    stopped: "Asistente detenido.",
    filled: "Llenado: {label} = {value}",
    heard: "Escuché: ",
    hintTime: "Diga la hora, por ejemplo: ocho y treinta.",
    hintDate: "Diga la fecha, por ejemplo: veintiocho de octubre de dos mil veintiséis.",
    needs: "El asistente de voz necesita Chrome, Edge o Safari.",
    allStart: "Diga todo seguido, cada campo con su nombre y su valor. Toque el botón otra vez para terminar.",
    allListening: "Escuchando todo. Toque el botón otra vez para terminar.",
    summary: "Llené {count} campos. ¿Está todo bien? Diga sí, o no para revisar campo por campo.",
    noneFilled: "No entendí ningún campo. Revise la guía y vuelva a intentar.",
    allOk: "Listo. Revise y guarde el registro.",
    guideTitle: "Cómo dictar todo",
    guideLead: "Diga cada campo con su nombre, seguido de su valor. Ejemplo:",
  },
  "pt-BR": {
    start: "Vamos preencher o registro. Diga parar para terminar, ou próximo para pular um campo.",
    listening: "Assistente ouvindo. Diga parar para terminar.",
    confirm: "{label}: {value}. Está certo? Diga sim para confirmar, ou diga o valor correto.",
    rewrite: "Diga o valor de novo, ou escreva no campo.",
    notHeard: "Não ouvi. Diga de novo.",
    notUnderstood: "Não entendi. Diga de novo, ou escreva.",
    stopping: "Não ouvi nada. Vou parar.",
    allFilled: "Todos os campos estão preenchidos. Revise e salve.",
    finished: "Assistente terminou. Revise os campos antes de salvar.",
    stopped: "Assistente parado.",
    filled: "Preenchido: {label} = {value}",
    heard: "Ouvi: ",
    hintTime: "Diga a hora, por exemplo: oito e trinta.",
    hintDate: "Diga a data, por exemplo: vinte e oito de outubro de dois mil e vinte e seis.",
    needs: "O assistente de voz precisa do Chrome, Edge ou Safari.",
    allStart: "Diga tudo seguido, cada campo com seu nome e seu valor. Toque o botão de novo para terminar.",
    allListening: "Ouvindo tudo. Toque o botão de novo para terminar.",
    summary: "Preenchi {count} campos. Está tudo certo? Diga sim, ou não para revisar campo por campo.",
    noneFilled: "Não entendi nenhum campo. Veja o guia e tente de novo.",
    allOk: "Pronto. Revise e salve o registro.",
    guideTitle: "Como ditar tudo",
    guideLead: "Diga cada campo com o nome, seguido do valor. Exemplo:",
  },
  "en-US": {
    start: "Let's fill the record. Say stop to finish, or next to skip a field.",
    listening: "Assistant listening. Say stop to finish.",
    confirm: "{label}: {value}. Is that right? Say yes to confirm, or say the correct value.",
    rewrite: "Say the value again, or type it in the field.",
    notHeard: "I did not hear you. Say it again.",
    notUnderstood: "I did not understand. Say it again, or type it.",
    stopping: "I did not hear anything. Stopping.",
    allFilled: "All fields are filled. Check them and save.",
    finished: "Assistant finished. Check the fields before saving.",
    stopped: "Assistant stopped.",
    filled: "Filled: {label} = {value}",
    heard: "Heard: ",
    hintTime: "Say the time, for example eight thirty.",
    hintDate: "Say the date, for example twenty eighth of October two thousand twenty six.",
    needs: "The voice assistant needs Chrome, Edge or Safari.",
    allStart: "Say everything in one go, each field with its name and value. Tap the button again to finish.",
    allListening: "Listening to everything. Tap the button again to finish.",
    summary: "I filled {count} fields. Is everything right? Say yes, or no to review field by field.",
    noneFilled: "I did not understand any field. Check the guide and try again.",
    allOk: "Done. Check the record and save it.",
    guideTitle: "How to dictate everything",
    guideLead: "Say each field by its name, followed by its value. Example:",
  },
};

// Example values shown in the guide, per voice language.
const EXAMPLES = {
  "es-ES": { date: "hoy", time: "ocho treinta", number: "dos mil cuatrocientos cincuenta", text: "texto corto" },
  "pt-BR": { date: "hoje", time: "oito e trinta", number: "dois mil quatrocentos e cinquenta", text: "texto curto" },
  "en-US": { date: "today", time: "eight thirty", number: "two thousand four hundred fifty", text: "short text" },
};

// Spoken names in Spanish for the watch form fields, by element id.
const FIELD_NAMES_ES = {
  vessel_name: "nombre del buque",
  chief_officer: "oficial de guardia",
  date: "fecha",
  watch_start: "hora de inicio",
  watch_end: "hora de fin",
  position: "posición",
  operational_summary: "resumen de operaciones",
  fuel_oil_quantity: "combustible en toneladas",
  weather_conditions: "condiciones del tiempo",
  maintenance_performed: "mantenimiento realizado",
  incidents: "incidentes",
  remarks: "observaciones",
};

// Words that start a field when dictating everything, in the three languages.
const FIELD_ALIASES = {
  vessel_name: ["buque", "navio", "nombre del buque", "nome do navio", "vessel name", "vessel", "ship"],
  chief_officer: ["oficial de guardia", "oficial de servicio", "oficial", "chief officer", "officer"],
  date: ["fecha", "data", "date"],
  watch_start: ["hora de inicio", "inicio de guardia", "hora de inicio", "inicio", "start"],
  watch_end: ["hora de fin", "fin de guardia", "hora de fim", "fim", "fin", "end"],
  position: ["posicion", "posicao", "posición", "posição", "position", "ubicacion", "localizacao"],
  operational_summary: ["resumen de operaciones", "resumen", "resumo das operacoes", "resumo", "operaciones", "summary", "operations"],
  fuel_oil_quantity: ["combustible", "cantidad de combustible", "quantidade de combustivel", "fuel", "fuel oil"],
  weather_conditions: ["clima", "condiciones del tiempo", "tiempo", "condicoes meteorologicas", "tempo", "weather"],
  maintenance_performed: ["mantenimiento", "manutencion", "manutencao", "maintenance"],
  incidents: ["incidentes", "incidente", "incidents"],
  remarks: ["observaciones", "observacoes", "remarks"],
};
