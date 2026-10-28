/**
 * Roadmap panel: shows what is available, what is a draft, what is planned,
 * and what is outside this software, so anyone using it can see what is
 * not implemented yet.
 *
 * Text is bilingual (English and Portuguese) and follows the language
 * selector. Built with createElement and textContent only.
 *
 * Depends on currentLang (static/i18n.js) and the element IDs in
 * templates/index.html: roadmapBtn, roadmapSection, watchSection,
 * logbookSection, progressWrap.
 */

(function () {
  const btn = document.getElementById("roadmapBtn");
  const section = document.getElementById("roadmapSection");
  const watchSection = document.getElementById("watchSection");
  const logbookSection = document.getElementById("logbookSection");
  const progressWrap = document.getElementById("progressWrap");
  const sidebarItems = document.querySelectorAll(".logbook-list li[data-logbook]");

  // Status labels, in both languages.
  const STATUS = {
    available: { en: "Available", pt: "Disponível" },
    draft:     { en: "Draft", pt: "Rascunho" },
    planned:   { en: "Planned", pt: "Planejado" },
    outside:   { en: "Outside this software", pt: "Fora deste software" },
  };

  // Each item: status, English text, Portuguese text and an optional note.
  const ITEMS = [
    {
      status: "available",
      en: "Deck watch record and compliance report draft",
      pt: "Registro de guarda do Diário de Náutica e rascunho de relatório de conformidade",
    },
    {
      status: "available",
      en: "Entries saved on this device, with reminders for due records",
      pt: "Registros salvos neste dispositivo, com lembretes para registros pendentes",
    },
    {
      status: "available",
      en: "Voice dictation in Chrome, Edge or Safari",
      pt: "Ditado por voz no Chrome, Edge ou Safari",
    },
    {
      status: "available",
      en: "Optional local speech recognition (faster-whisper) on the server",
      pt: "Reconhecimento de voz local opcional (faster-whisper) no servidor",
    },
    {
      status: "available",
      en: "English and Portuguese; day, dusk, night and red themes",
      pt: "Inglês e português; temas dia, crepúsculo, noite e vermelho",
    },
    {
      status: "draft",
      en: "Field lists for 8 logbooks. Only the Oil Record Book has been checked against its source.",
      pt: "Campos dos 8 livros. Só o Livro de Registro de Óleo foi conferido com a fonte.",
    },
    {
      status: "planned",
      en: "One voice assistant: the officer speaks, the system answers aloud and says which required field is missing",
      pt: "Um único assistente de voz: o oficial fala, o sistema responde em voz alta e diz qual campo obrigatório falta",
      note: {
        en: "Works with a Bluetooth headset connected to the device. The missing-field prompts do not need a paid AI service.",
        pt: "Funciona com fone Bluetooth conectado ao dispositivo. Os avisos de campos faltantes não precisam de serviço de IA pago.",
      },
    },
    {
      status: "planned",
      en: "Weekly and periodic inspection reminders, asked aloud by the assistant",
      pt: "Lembretes de inspeção semanal e periódica, perguntados em voz alta pelo assistente",
    },
    {
      status: "planned",
      en: "Shared database and backups, usable from several devices",
      pt: "Banco de dados e cópias de segurança, acessíveis de vários dispositivos",
    },
    {
      status: "planned",
      en: "Permanent history of changes, verifiable timestamps and electronic signature (ISO 21745)",
      pt: "Histórico permanente de alterações, carimbo de data verificável e assinatura eletrônica (ISO 21745)",
    },
    {
      status: "planned",
      en: "Login with roles: officer, master and inspector",
      pt: "Login com funções: oficial, comandante e inspetor",
    },
    {
      status: "planned",
      en: "Automated tests and a container for deployment",
      pt: "Testes automatizados e contêiner para publicação",
    },
    {
      status: "planned",
      en: "Offline work with synchronization",
      pt: "Trabalho sem conexão com sincronização",
    },
    {
      status: "planned",
      en: "Accessibility review (WCAG) and measurement of voice accuracy with marine terms",
      pt: "Revisão de acessibilidade (WCAG) e medição da precisão de voz com termos marítimos",
    },
    {
      status: "outside",
      en: "Approval for official use by the flag state or a classification society. Only that authority can grant it.",
      pt: "Aprovação para uso oficial pelo Estado de bandeira ou pela sociedade classificadora. Só essa autoridade pode concedê-la.",
    },
  ];

  const isPt = () => currentLang === "pt";
  const text = (pair) => (isPt() ? pair.pt : pair.en);

  function render() {
    btn.textContent = isPt() ? "Roteiro" : "Roadmap";

    section.innerHTML = "";

    const head = document.createElement("div");
    head.className = "card-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = isPt()
      ? "Roteiro: o que já existe e o que está planejado"
      : "Roadmap: what is available and what is planned";
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = isPt()
      ? "Esta lista é atualizada a cada versão. Nada aqui é aprovação de autoridade marítima."
      : "This list is updated with each release. Nothing here is an approval by any maritime authority.";
    titleWrap.appendChild(title);
    titleWrap.appendChild(hint);
    head.appendChild(titleWrap);
    section.appendChild(head);

    const list = document.createElement("ul");
    list.className = "entries";
    ITEMS.forEach((item) => {
      const li = document.createElement("li");

      const label = document.createElement("strong");
      label.textContent = "[" + STATUS[item.status][isPt() ? "pt" : "en"] + "] ";
      li.appendChild(label);

      li.appendChild(document.createTextNode(text(item)));

      if (item.note) {
        const note = document.createElement("div");
        note.className = "muted";
        note.textContent = text(item.note);
        li.appendChild(note);
      }
      list.appendChild(li);
    });
    section.appendChild(list);
  }

  function open() {
    render();
    section.hidden = false;
    watchSection.hidden = true;
    logbookSection.hidden = true;
    progressWrap.hidden = true;
    btn.setAttribute("aria-pressed", "true");
  }

  // Closing the roadmap from the button restores the logbook that was open.
  function close() {
    section.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    const active = document.querySelector(".logbook-list li.is-active");
    if (active) active.click();
  }

  btn.addEventListener("click", () => {
    if (section.hidden) open();
    else close();
  });

  // Choosing a logbook in the sidebar leaves the roadmap. logbook.js runs
  // first, so its section visibility is already set.
  sidebarItems.forEach((li) => {
    li.addEventListener("click", () => {
      section.hidden = true;
      btn.setAttribute("aria-pressed", "false");
    });
  });

  // logbook.js redraws on a language change and may show its sections again,
  // so hide them again while the roadmap is open.
  document.addEventListener("langchange", () => {
    btn.textContent = isPt() ? "Roteiro" : "Roadmap";
    if (!section.hidden) {
      watchSection.hidden = true;
      logbookSection.hidden = true;
      progressWrap.hidden = true;
      render();
    }
  });

  btn.textContent = isPt() ? "Roteiro" : "Roadmap";
  btn.setAttribute("aria-pressed", "false");
})();
