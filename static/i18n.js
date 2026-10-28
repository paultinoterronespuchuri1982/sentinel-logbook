/**
 * Interface language (English and Brazilian Portuguese).
 *
 * The English text is the key. PT maps each English string to its
 * Portuguese translation. Strings without a translation stay in English.
 *
 *   tr(text)           returns the text in the current language
 *   applyI18n()        updates elements marked with data-i18n attributes
 *   setLanguage(code)  "en" or "pt"; saves the choice and notifies the page
 *
 * Elements can be translated with:
 *   data-i18n="English text"              text content
 *   data-i18n-placeholder="English text"  placeholder attribute
 *   data-i18n-title="English text"        title attribute
 *   data-i18n-aria="English text"         aria-label attribute
 */

const PT = {
  // ----- Page chrome -----
  "Logbooks": "Diários de bordo",

  // ----- Voice assistant -----
  "Voice assistant": "Assistente de voz",
  "Stop assistant": "Parar assistente",
  "The voice assistant needs Chrome, Edge or Safari.": "O assistente de voz precisa do Chrome, Edge ou Safari.",
  "Needs Chrome, Edge or Safari.": "Precisa do Chrome, Edge ou Safari.",
  "All fields are filled. Check them and save.": "Todos os campos estão preenchidos. Revise e salve.",
  "Assistant listening. Say stop to finish.": "Assistente ouvindo. Diga parar para terminar.",
  "Let's fill the record. Say stop to finish, next to skip a field.": "Vamos preencher o registro. Diga parar para terminar, ou próximo para pular um campo.",
  "I did not hear anything. Stopping.": "Não ouvi nada. Vou parar.",
  "I did not hear you. Please say it again.": "Não ouvi. Diga de novo.",
  "I did not understand. Say it again.": "Não entendi. Diga de novo.",
  "Filled: ": "Preenchido: ",
  "Assistant finished. Check the fields before saving.": "Assistente terminou. Revise os campos antes de salvar.",
  "Assistant stopped.": "Assistente parado.",
  "Say the time, for example 8 30.": "Diga a hora, por exemplo 8 30.",
  "Say the date, for example 28/10/2026.": "Diga a data, por exemplo 28/10/2026.",

  // ----- Voice and charts (added with the fuel field and confirmation) -----
  "Voice language": "Idioma da voz",
  "Vessel": "Navio",
  "Heard: ": "Escutado: ",
  "Say yes to confirm, or say the correct value.": "Diga sim para confirmar, ou diga o valor correto.",
  "Fuel oil quantity (tons)": "Quantidade de óleo combustível (toneladas)",
  "Fuel oil per day (tons)": "Óleo combustível por dia (toneladas)",
  "Fuel consumption per day chart (fuel field is numeric, in tons)": "Gráfico de consumo diário de combustível (campo numérico, em toneladas)",
  "Emissions estimate from fuel (not an official CII or EU-MRV calculation)": "Estimativa de emissões a partir do combustível (não é cálculo oficial de CII ou EU-MRV)",

  // ----- Statistics -----
  "Statistics": "Estatísticas",
  "Statistics from the records saved on this device.": "Estatísticas dos registros salvos neste dispositivo.",
  "The chart library did not load. Check your internet connection.": "A biblioteca de gráficos não carregou. Verifique sua conexão com a internet.",
  "No data yet. Save a record to see statistics.": "Ainda sem dados. Salve um registro para ver as estatísticas.",
  "Total records": "Total de registros",
  "Records this week": "Registros nesta semana",
  "Reminders on time": "Lembretes em dia",
  "Watch hours, last 14 days": "Horas de guarda, últimos 14 dias",
  "Records per week": "Registros por semana",
  "Reminders by logbook": "Lembretes por livro",
  "Watch hours per day": "Horas de guarda por dia",
  "On time": "Em dia",
  "Overdue": "Vencido",
  "Not recorded": "Não registrado",
  "Watch hours": "Horas de guarda",
  "Needs attention": "Precisa de atenção",
  "Nothing needs attention.": "Nada precisa de atenção.",
  "vs last week": "em relação à semana passada",
  "Statistics: records per week, reminders on time and watch hours, as charts from this device's records": "Estatísticas: registros por semana, lembretes em dia e horas de guarda, em gráficos a partir dos registros deste dispositivo",
  "Fuel consumption trend and emissions estimate (needs a numeric fuel field)": "Tendência de consumo de combustível e estimativa de emissões (precisa de um campo numérico de combustível)",

  // ----- Roadmap -----
  "Roadmap": "Roteiro",
  "Roadmap: what is available and what is planned": "Roteiro: o que já existe e o que está planejado",
  "This list is updated with each release. Nothing here is an approval by any maritime authority.": "Esta lista é atualizada a cada versão. Nada aqui é aprovação de autoridade marítima.",
  "Available": "Disponível",
  "Draft": "Rascunho",
  "Planned": "Planejado",
  "Outside this software": "Fora deste software",
  "Deck watch record and compliance report draft": "Registro de guarda do Diário de Náutica e rascunho de relatório de conformidade",
  "Entries saved on this device, with reminders for due records": "Registros salvos neste dispositivo, com lembretes para registros pendentes",
  "Voice dictation in Chrome, Edge or Safari": "Ditado por voz no Chrome, Edge ou Safari",
  "Optional local speech recognition (faster-whisper) on the server": "Reconhecimento de voz local opcional (faster-whisper) no servidor",
  "English and Portuguese; day, dusk, night and red themes": "Inglês e português; temas dia, crepúsculo, noite e vermelho",
  "Field lists for 8 logbooks. Only the Oil Record Book has been checked against its source.": "Campos dos 8 livros. Só o Livro de Registro de Óleo foi conferido com a fonte.",
  "Voice assistant with one microphone: it reads each empty field aloud and writes your answer": "Assistente de voz com um microfone: lê em voz alta cada campo vazio e escreve sua resposta",
  "Works with a Bluetooth headset connected to the device. Uses the browser's speech tools, so it needs Chrome, Edge or Safari.": "Funciona com fone Bluetooth conectado ao dispositivo. Usa as ferramentas de voz do navegador, por isso precisa do Chrome, Edge ou Safari.",
  "Free speech: say several fields in one sentence and the system fills them": "Fala livre: diga vários campos em uma frase e o sistema os preenche",
  "Assistant speech with a language model (paid service or local model)": "Fala com modelo de linguagem (serviço pago ou modelo local)",
  "Weekly and periodic inspection reminders, asked aloud by the assistant": "Lembretes de inspeção semanal e periódica, perguntados em voz alta pelo assistente",
  "Shared database and backups, usable from several devices": "Banco de dados e cópias de segurança, acessíveis de vários dispositivos",
  "Permanent history of changes, verifiable timestamps and electronic signature (ISO 21745)": "Histórico permanente de alterações, carimbo de data verificável e assinatura eletrônica (ISO 21745)",
  "Login with roles: officer, master and inspector": "Login com funções: oficial, comandante e inspetor",
  "Automated tests and a container for deployment": "Testes automatizados e contêiner para publicação",
  "Offline work with synchronization": "Trabalho sem conexão com sincronização",
  "Accessibility review (WCAG) and measurement of voice accuracy with marine terms": "Revisão de acessibilidade (WCAG) e medição da precisão de voz com termos marítimos",
  "Approval for official use by the flag state or a classification society. Only that authority can grant it.": "Aprovação para uso oficial pelo Estado de bandeira ou pela sociedade classificadora. Só essa autoridade pode concedê-la.",
  "Deck Logbook": "Diário de Náutica",
  "Engine Logbook": "Diário de Máquinas",
  "Radio / GMDSS Logbook": "Diário de Rádio / GMDSS",
  "Garbage Record Book": "Livro de Registro de Lixo",
  "Oil Record Book Part I": "Livro de Registro de Óleo Parte I",
  "Ballast Water Record Book": "Livro de Registro de Água de Lastro",
  "Cargo Record Book": "Livro de Registro de Carga",
  "Operational Logbook": "Diário Operacional",
  "Save record": "Salvar registro",
  "Record saved on this device.": "Registro salvo neste dispositivo.",
  "Draft restored.": "Rascunho restaurado.",
  "Recording stopped.": "Gravação interrompida.",
  "Microphone permission denied. Allow Chrome to use the microphone in System Settings.": "Permissão do microfone negada. Permita que o Chrome use o microfone nas Configurações do Sistema.",
  "Recording… press the microphone again to stop.": "Gravando… toque no microfone de novo para parar.",
  "Transcribing…": "Transcrevendo…",
  "Text added. Check it before saving.": "Texto adicionado. Revise antes de salvar.",
  "No audio was recorded.": "Nenhum áudio foi gravado.",
  "Transcription failed": "A transcrição falhou",
  "Transcription failed: ": "A transcrição falhou: ",
  "Completed": "Concluído",
  "Language": "Idioma",
  "Appearance": "Aparência",
  "Theme": "Tema",
  "Accent color": "Cor de destaque",
  "Day": "Dia",
  "Dusk": "Crepúsculo",
  "Night": "Noite",
  "Red night (night vision)": "Noite vermelha (visão noturna)",
  "Follow system": "Seguir o sistema",
  "Teal": "Verde-azulado",
  "Indigo": "Índigo",
  "Emerald": "Esmeralda",
  "Amber": "Âmbar",
  "Rose": "Rosa",
  "Load sample": "Carregar exemplo",
  "Draft tool.": "Ferramenta de rascunho.",
  "Entries saved here are not an approved electronic record book. Check your flag state's list of accepted systems before using any record for official purposes.":
    "Os registros salvos aqui não são um livro de registro eletrônico aprovado. Antes de usar qualquer registro para fins oficiais, consulte a lista de sistemas aceitos do Estado de bandeira.",

  // ----- Deck watch form -----
  "Watch record": "Registro de quarto",
  "Fields marked * are required.": "Os campos marcados com * são obrigatórios.",
  "Watch": "Quarto",
  "Vessel name": "Nome do navio",
  "Chief officer": "Oficial de serviço",
  "Date": "Data",
  "Start": "Início",
  "End": "Fim",
  "Operations": "Operações",
  "Operational summary": "Resumo das operações",
  "Fuel oil quantity": "Quantidade de óleo combustível",
  "Weather conditions": "Condições meteorológicas",
  "e.g. 2450 tons": "ex.: 2450 toneladas",
  "e.g. Sea state 3, 15 kn wind": "ex.: Mar 3, vento de 15 nós",
  "Equipment and maintenance": "Equipamentos e manutenção",
  "Equipment status (JSON)": "Estado dos equipamentos (JSON)",
  "Maintenance performed": "Manutenção realizada",
  "one task per line": "uma tarefa por linha",
  "Notes": "Observações",
  "Incidents": "Incidentes",
  "Leave empty if none": "Deixe em branco se não houver",
  "Remarks": "Observações finais",
  "Generated reports are drafts. Review them before any official use.":
    "Os relatórios gerados são rascunhos. Revise-os antes de qualquer uso oficial.",
  "Generate report": "Gerar relatório",

  // ----- Other logbooks: layout -----
  "Entry": "Registro",
  "What a complete record contains": "O que um registro completo deve conter",
  "Entry type": "Tipo de registro",
  "Tap the microphone to dictate into a field. Check the text before saving.":
    "Toque no microfone para ditar em um campo. Revise o texto antes de salvar.",
  "Save entry": "Salvar registro",
  "Recent entries on this device": "Registros recentes neste dispositivo",
  "Reminders": "Lembretes",
  "Dictate": "Ditar",
  "Listening… speak now.": "Ouvindo… fale agora.",
  "Captured. Check the text before saving.": "Texto capturado. Revise antes de salvar.",
  "Voice input needs Chrome, Edge or Safari.": "A entrada por voz precisa do Chrome, Edge ou Safari.",
  "Voice error: ": "Erro de voz: ",
  ". Check microphone permission.": ". Verifique a permissão do microfone.",
  "Could not start voice input.": "Não foi possível iniciar a entrada por voz.",
  "Fill in: ": "Preencha: ",
  "This browser blocked storage, so the entry was not saved.": "Este navegador bloqueou o armazenamento, então o registro não foi salvo.",
  "Entry saved on this device.": "Registro salvo neste dispositivo.",
  "No entries yet.": "Ainda não há registros.",
  "Record when it happens.": "Registrar quando acontecer.",
  "Not recorded yet.": "Ainda não registrado.",
  "Overdue. Last recorded ": "Atrasado. Último registro em ",
  "Next by ": "Próximo até ",
  "Operations summary": "Resumo das operações",
  "Issues or pending items": "Pendências ou itens em aberto",

  // ----- Report and status (app.js) -----
  "No report yet.": "Ainda não há relatório.",
  "Complete the watch record and select Generate report.": "Preencha o registro de quarto e selecione Gerar relatório.",
  "Compliance report": "Relatório de conformidade",
  "Loading sample logs…": "Carregando registros de exemplo…",
  "Failed to load sample logs": "Não foi possível carregar os registros de exemplo",
  "Sample logs loaded.": "Registros de exemplo carregados.",
  "Equipment Status must be valid JSON": "O estado dos equipamentos precisa ser um JSON válido",
  "Generating compliance report…": "Gerando relatório de conformidade…",
  "Failed to generate report": "Não foi possível gerar o relatório",
  "Report generated for ": "Relatório gerado para ",
  " at ": " às ",
  "Executive summary": "Resumo executivo",
  "Equipment status": "Estado dos equipamentos",
  "Incident analysis": "Análise de incidentes",
  "Maintenance review": "Revisão da manutenção",
  "Compliance checklist": "Lista de verificação de conformidade",
  "Recommendations": "Recomendações",
  "Sign-off": "Assinatura",
  "Completed ": "Concluído ",

  // ----- Reminders and entry types (logbooks.js) -----
  "Sign the deck log at the end of each watch": "Assinar o diário de náutica ao fim de cada quarto",
  "Position, course, speed and draught at each watch change": "Posição, rumo, velocidade e calado a cada troca de quarto",
  "Weather, visibility and sea state": "Tempo, visibilidade e estado do mar",
  "Navigation events, alterations of course and pilot boarding": "Eventos de navegação, mudanças de rumo e embarque de prático",
  "Weekly review of navigation equipment test records": "Revisão semanal dos registros de teste dos equipamentos de navegação",
  "Signature of the officer on watch": "Assinatura do oficial de quarto",
  "Navigation records: SOLAS chapter V, regulation 28, and IMO resolution A.916(22). Check the flag state requirements.":
    "Registros de navegação: SOLAS capítulo V, regra 28, e resolução A.916(22) da OMI. Verifique os requisitos do Estado de bandeira.",

  "Engine parameters and NOx records: MARPOL Annex VI and the NOx Technical Code. Fuel changeover records are also required by Annex VI.":
    "Parâmetros do motor e registros de NOx: Anexo VI da MARPOL e Código Técnico NOx. Os registros de troca de combustível também são exigidos pelo Anexo VI.",
  "Engine Parameters": "Parâmetros do motor",
  "Engine parameters": "Parâmetros do motor",
  "Fuel oil changeover": "Troca de óleo combustível",
  "Time": "Hora",
  "Engine": "Motor",
  "Load (%)": "Carga (%)",
  "RPM": "RPM",
  "Running hours": "Horas de funcionamento",
  "Position": "Posição",
  "From fuel": "Combustível anterior",
  "To fuel": "Novo combustível",
  "Record engine parameters once per day": "Registrar os parâmetros do motor uma vez por dia",
  "Record each fuel oil changeover": "Registrar cada troca de óleo combustível",
  "Engine parameters for each engine in use": "Parâmetros de cada motor em uso",
  "Fuel oil changeovers with time and position": "Trocas de óleo combustível com hora e posição",
  "Remarks on alarms or faults": "Observações sobre alarmes ou falhas",

  "Radio communications and GMDSS records: SOLAS chapter IV. Check the flag state requirements for the test frequency.":
    "Registros de comunicações por rádio e GMDSS: SOLAS capítulo IV. Verifique os requisitos do Estado de bandeira para a frequência dos testes.",
  "Equipment test": "Teste de equipamento",
  "Communication": "Comunicação",
  "Distress alert": "Alerta de socorro",
  "Equipment tested": "Equipamento testado",
  "Result": "Resultado",
  "Operator": "Operador",
  "Station or contact": "Estação ou contato",
  "Channel or frequency": "Canal ou frequência",
  "Summary": "Resumo",
  "Alert type": "Tipo de alerta",
  "Action taken": "Ação tomada",
  "Daily GMDSS equipment test": "Teste diário do equipamento GMDSS",
  "Monthly EPIRB and battery check": "Verificação mensal do EPIRB e das baterias",
  "Daily equipment test": "Teste diário do equipamento",
  "Distress and urgency communications": "Comunicações de socorro e urgência",
  "Equipment faults and repairs": "Falhas e reparos de equipamentos",
  "Operator name for each entry": "Nome do operador em cada registro",

  "Garbage record book: MARPOL Annex V, regulation 10. Each discharge, incineration or loss must be recorded.":
    "Livro de registro de lixo: Anexo V da MARPOL, regra 10. Cada descarte, incineração ou perda deve ser registrado.",
  "Garbage operation": "Operação com lixo",
  "Operation (discharge, incineration, loss, reception)": "Operação (descarte, incineração, perda, recepção)",
  "Category (plastics, food, etc.)": "Categoria (plásticos, alimentos, etc.)",
  "Estimated volume (m³)": "Volume estimado (m³)",
  "Record each discharge, incineration or loss when it happens": "Registrar cada descarte, incineração ou perda quando ocorrer",
  "Date, time and position of each operation": "Data, hora e posição de cada operação",
  "Garbage category and estimated volume": "Categoria do lixo e volume estimado",
  "Receipts from reception facilities": "Recibos das instalações de recepção",
  "Officer signature": "Assinatura do oficial",

  "Machinery space operations: MARPOL Annex I, regulation 36. Entries follow the operation codes in the book.":
    "Operações em casa de máquinas: Anexo I da MARPOL, regra 36. Os registros seguem os códigos de operação do livro.",
  "Sludge (weekly record)": "Borra (registro semanal)",
  "Sludge tank": "Tanque de borra",
  "Retained on board (m³)": "Retido a bordo (m³)",
  "Transfer or disposal": "Transferência ou descarte",
  "Bilge water discharge": "Descarte de água de porão",
  "Start (time and position)": "Início (hora e posição)",
  "Stop (time and position)": "Fim (hora e posição)",
  "Method (15 ppm equipment, reception, holding tank)": "Método (equipamento de 15 ppm, recepção, tanque de retenção)",
  "Quantity (m³)": "Quantidade (m³)",
  "Bunkering": "Abastecimento",
  "Place and time": "Local e hora",
  "Fuel or lubricating oil type": "Tipo de combustível ou óleo lubrificante",
  "Quantity added (tonnes)": "Quantidade adicionada (toneladas)",
  "Tank and total content": "Tanque e volume total",
  "Filter failure or accidental discharge": "Falha de filtro ou descarte acidental",
  "Event (filter failure or discharge)": "Evento (falha de filtro ou descarte)",
  "Circumstances and remarks": "Circunstâncias e observações",
  "Weekly sludge record (required even on short voyages)": "Registro semanal de borra (exigido mesmo em viagens curtas)",
  "Record each bilge water discharge": "Registrar cada descarte de água de porão",
  "Record each bunkering operation": "Registrar cada operação de abastecimento",
  "Ballasting or cleaning of fuel oil tanks": "Lastragem ou limpeza dos tanques de óleo combustível",
  "Discharge of dirty ballast or cleaning water": "Descarte de lastro sujo ou água de limpeza",
  "Weekly sludge record, retained and transferred": "Registro semanal de borra, retida e transferida",
  "Bilge discharges, manual or automatic": "Descartes de porão, manuais ou automáticos",
  "Filter failure, accidental discharges": "Falhas de filtro, descartes acidentais",
  "Bunkering of fuel and lubricating oil": "Abastecimento de combustível e óleo lubrificante",
  "Officer signature for each operation, master signature for each page": "Assinatura do oficial em cada operação e do comandante em cada página",

  "Ballast Water Management Convention, Appendix II (minimum record content). Check the flag state guidance.":
    "Convenção BWM, Apêndice II (conteúdo mínimo dos registros). Verifique as orientações do Estado de bandeira.",
  "Ballast operation": "Operação de lastro",
  "Operation (ballasting, circulation, discharge, sediment disposal)": "Operação (lastragem, circulação, descarte, descarte de sedimentos)",
  "Tank": "Tanque",
  "Volume (m³)": "Volume (m³)",
  "Unplanned or exceptional discharge": "Descarte não planejado ou excepcional",
  "Reason": "Motivo",
  "Record each ballast operation when it happens": "Registrar cada operação de lastro quando ocorrer",
  "Record any unplanned discharge immediately": "Registrar qualquer descarte não planejado imediatamente",
  "Each ballasting, circulation, treatment and discharge": "Cada lastragem, circulação, tratamento e descarte",
  "Date, time and position": "Data, hora e posição",
  "Tank and volume": "Tanque e volume",
  "Sediment disposal": "Descarte de sedimentos",
  "Unplanned or exceptional discharges": "Descartes não planejados ou excepcionais",

  "Cargo operations for chemical carriers: MARPOL Annex II, regulation 15. Applies to ships carrying noxious liquid substances.":
    "Operações de carga para navios químicos: Anexo II da MARPOL, regra 15. Aplica-se a navios que transportam substâncias líquidas nocivas.",
  "Cargo operation": "Operação de carga",
  "Operation (loading, unloading, transfer, cleaning)": "Operação (carregamento, descarregamento, transferência, limpeza)",
  "Product": "Produto",
  "Quantity": "Quantidade",
  "Record each cargo operation when it happens": "Registrar cada operação de carga quando ocorrer",
  "Loading, unloading and transfer operations": "Operações de carregamento, descarregamento e transferência",
  "Tank cleaning and residues": "Limpeza de tanques e resíduos",
  "Product, quantity and tank for each operation": "Produto, quantidade e tanque de cada operação",

  "Internal operational record set by the company or the safety management system. It does not replace the statutory books.":
    "Registro operacional interno definido pela empresa ou pelo sistema de gestão de segurança. Não substitui os livros obrigatórios.",
  "Daily summary": "Resumo diário",
  "Daily operational summary": "Resumo operacional diário",
  "Daily operations summary": "Resumo diário das operações",
  "Pending issues": "Pendências",
  "Port calls and voyage notes": "Escalas em porto e notas da viagem",
};

/** Current language: "en", "pt" or "es". */
let currentLang = "en";

/** Supported interface languages and their dictionaries (English is the key). */
const LANGS = ["en", "pt", "es"];
const DICTS = { pt: PT, es: ES };

/** Locale used for dates and numbers in the current language. */
function currentLocale() {
  return { pt: "pt-BR", es: "es-ES", en: "en-US" }[currentLang];
}

/** Return the text in the current language. Unknown text is returned as is. */
function tr(text) {
  const dict = DICTS[currentLang];
  if (dict && dict[text] !== undefined) return dict[text];
  return text;
}

/** Translate every element marked with a data-i18n attribute. */
function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = tr(el.dataset.i18n);
  });
  scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", tr(el.dataset.i18nPlaceholder));
  });
  scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", tr(el.dataset.i18nTitle));
  });
  scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", tr(el.dataset.i18nAria));
  });
  document.documentElement.lang = currentLocale();
}

/**
 * Change the interface language, save it, and notify other scripts.
 * Other scripts listen for the "langchange" event to re-render their text.
 *
 * @param {"en"|"pt"} code
 */
function setLanguage(code) {
  currentLang = LANGS.includes(code) ? code : "en";
  try { localStorage.setItem("lang", currentLang); } catch (err) { /* storage blocked */ }
  applyI18n();
  document.dispatchEvent(new Event("langchange"));
}

// Restore the saved language, or use Portuguese if the browser is set to it.
(function initLanguage() {
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch (err) { /* storage blocked */ }
  // Without a saved choice, use the browser language when it is supported.
  const browser = (navigator.language || "").toLowerCase().slice(0, 2);
  currentLang = LANGS.includes(saved) ? saved : (LANGS.includes(browser) ? browser : "en");

  const select = document.getElementById("language");
  if (select) {
    select.value = currentLang;
    select.addEventListener("change", () => setLanguage(select.value));
  }
  applyI18n();
})();
