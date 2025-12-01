// Инициализация состояния и кэш DOM
(function () {
  // Селекторы
  const intro = document.getElementById("intro");
  const casesContainer = document.getElementById("cases");
  const finalScreen = document.getElementById("final");
  const resultModal = document.getElementById("resultModal");
  const modalTitle = document.getElementById("resultTitle");
  const modalDesc = document.getElementById("resultDesc");
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const continueBtn = document.getElementById("continueBtn");
  const cases = Array.from(document.querySelectorAll(".case-section"));

  // Состояние
  const state = {
    currentIndex: 0,
    decisionsCount: { human: [], ai: [] },
    chartInstance: null,
    totalCases: cases.length,
    decisionMadeInCase: [], // для предотвращения двойного клика
  };

  // Вспомогательные функции UI
  function showSection(name) {
    // name: 'intro' | 'cases' | 'final'
    intro.classList.toggle("hidden", name !== "intro");
    casesContainer.classList.toggle("hidden", name !== "cases");
    finalScreen.classList.toggle("hidden", name !== "final");
  }

  function gotoCase(index) {
    // Снять активность со всех
    cases.forEach((c) => c.classList.remove("active-case"));
    if (index < 0 || index >= state.totalCases) return;
    state.currentIndex = index;
    cases[index].classList.add("active-case");
    // Разблокировать кнопки выбора для текущей карточки
    enableDecisionButtons(cases[index], true);
  }

  function enableDecisionButtons(sectionEl, enable) {
    const btns = sectionEl.querySelectorAll("button[data-decision]");
    btns.forEach((b) => {
      b.disabled = !enable;
    });
  }

  function toggleModal(open) {
    resultModal.classList.toggle("hidden", !open);
    if (!open) {
      // Возврат фокуса на текущую карточку или контейнер
      const section = cases[state.currentIndex];
      if (section) {
        const focusable = section.querySelector("button[data-decision]");
        if (focusable) focusable.focus();
      }
    } else {
      continueBtn.focus();
    }
  }

  function initCounts() {
    state.decisionsCount.human = new Array(state.totalCases).fill(0);
    state.decisionsCount.ai = new Array(state.totalCases).fill(0);
    state.decisionMadeInCase = new Array(state.totalCases).fill(false);
  }

  // Бизнес-логика
  function startSimulation() {
    initCounts();
    showSection("cases");
    gotoCase(0);
  }

  function openResult(decider, caseIndex) {
    if (caseIndex < 0 || caseIndex >= state.totalCases) return;
    if (state.decisionMadeInCase[caseIndex]) return; // уже выбрали

    // Учёт решения
    if (decider === "human") {
      modalTitle.innerText = "Решение судьи:";
      modalDesc.innerText =
        "Изучив все обстоятельства дела, судья принял индивидуальное решение.";
      state.decisionsCount.human[caseIndex]++;
    } else {
      modalTitle.innerText = "Решение ИИ:";
      modalDesc.innerText =
        "Быстро обработав доступные данные, ИИ предоставил строгое и однозначное решение.";
      state.decisionsCount.ai[caseIndex]++;
    }

    // Блокируем кнопки выбора для текущей карточки
    enableDecisionButtons(cases[caseIndex], false);
    state.decisionMadeInCase[caseIndex] = true;

    toggleModal(true);
  }

  function drawResultsChart() {
    const canvas = document.getElementById("resultsChart");
    if (!canvas || typeof Chart === "undefined") return;
    const ctx = canvas.getContext("2d");

    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }

    const labels = Array.from(
      { length: state.totalCases },
      (_, i) => `Случай ${i + 1}`
    );

    state.chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Решения судьи",
            data: state.decisionsCount.human,
            backgroundColor: "#007BFF",
          },
          {
            label: "Решения ИИ",
            data: state.decisionsCount.ai,
            backgroundColor: "#FFADAD",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }

  function finalizeSimulation() {
    drawResultsChart();
    showSection("final");
  }

  function resetSimulation() {
    // Сброс экранов
    showSection("intro");

    // Сброс активной карточки
    cases.forEach((c) => c.classList.remove("active-case"));
    gotoCase(0);

    // Очистка графика и счётчиков
    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }
    initCounts();
  }

  function closeModal() {
    toggleModal(false);
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.totalCases) {
      finalizeSimulation();
    } else {
      gotoCase(nextIndex);
    }
  }

  // Навешиваем обработчики
  startBtn.addEventListener("click", startSimulation);
  resetBtn.addEventListener("click", resetSimulation);
  continueBtn.addEventListener("click", closeModal);

  // Делегирование выбора решения
  casesContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-decision]");
    if (!btn) return;
    const decision = btn.getAttribute("data-decision");
    const caseIdAttr = btn.getAttribute("data-case");
    const caseIndex = caseIdAttr ? Number(caseIdAttr) - 1 : state.currentIndex;
    openResult(decision, caseIndex);
  });

  // Закрытие модалки по ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !resultModal.classList.contains("hidden")) {
      closeModal();
    }
  });
})();
