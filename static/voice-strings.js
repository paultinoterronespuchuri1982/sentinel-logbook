/**
 * Text of the voice assistant, per voice language (static/voice-assistant.js).
 *
 * Placeholders: {label} = field name, {value} = the value filled in.
 * FIELD_NAMES_ES gives Spanish spoken names for the watch form fields.
 * Other fields are spoken with their label from the page.
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
  },
};

// Spoken names in Spanish for the watch form fields, by element id.
const FIELD_NAMES_ES = {
  vessel_name: "nombre del buque",
  chief_officer: "oficial de guardia",
  date: "fecha",
  watch_start: "hora de inicio",
  watch_end: "hora de fin",
  operational_summary: "resumen de operaciones",
  fuel_oil_quantity: "combustible en toneladas",
  weather_conditions: "condiciones del tiempo",
  maintenance_performed: "mantenimiento realizado",
  incidents: "incidentes",
  remarks: "observaciones",
};
