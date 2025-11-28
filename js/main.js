// Импортируем библиотеку Chart.js
window.Chart = window.Chart || {};

// Массивы для хранения количества выборов
let decisionsCount = {
  human: [], // Решения судьи
  ai: [], // Решения ИИ
};

for (let i = 1; i <= 5; i++) {
  decisionsCount.human.push(0); // Количество выборов судьи
  decisionsCount.ai.push(0); // Количество выборов ИИ
}

// Генерируем уникальные ID для каждого модуля
document.querySelectorAll(".case-section").forEach((section, index) => {
  section.setAttribute("data-case-id", index + 1);
});

// Функция для старта симуляции
function startSimulation() {
  document.querySelector(".intro-page").style.display = "none"; // Скрываем приветственное сообщение
  document.querySelector(".cases-container").style.display = "block"; // Показываем карточки
}

// Открывает модальное окно с результатом
function openResult(decider, caseId) {
  const resultModal = document.querySelector(".result-modal");
  const modalTitle = resultModal.querySelector("h2");
  const modalDescription = resultModal.querySelector("p");

  if (decider === "human") {
    modalTitle.innerText = "Решение судьи:";
    modalDescription.innerText =
      "Изучив все обстоятельства дела, судья принял индивидуальное решение.";
    decisionsCount.human[caseId - 1]++;
  } else {
    modalTitle.innerText = "Решение ИИ:";
    modalDescription.innerText =
      "Быстро обработав доступные данные, ИИ предоставил строгое и однозначное решение.";
    decisionsCount.ai[caseId - 1]++;
  }

  resultModal.style.display = "flex";
}

// Строим график после окончания сессии
function drawResultsChart() {
  const ctx = document.getElementById("resultsChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Случай 1", "Случай 2", "Случай 3", "Случай 4", "Случай 5"],
      datasets: [
        {
          label: "Решения судьи",
          data: decisionsCount.human,
          backgroundColor: "#007BFF",
        },
        {
          label: "Решения ИИ",
          data: decisionsCount.ai,
          backgroundColor: "#FFADAD",
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

// Логика сброса симуляции
function resetSimulation() {
  document.querySelector(".final-screen").style.display = "none"; // Скрываем итоговую страницу
  document.querySelector(".cases-container").style.display = "none"; // Скрываем карточки
  document.querySelector(".intro-page").style.display = "block"; // Показываем начальную страницу
  // Сбрасываем счётчики
  decisionsCount.human.fill(0);
  decisionsCount.ai.fill(0);
  // Устанавливаем первую карточку активной
  const firstSection = document.querySelector(
    ".case-section[data-case-id='1']"
  );
  firstSection.classList.add("active-case"); // Активируем первую карточку
}

// Обновляем статистику после последнего случая
function finalizeSimulation() {
  drawResultsChart(); // Рисуем график
  document.querySelector(".cases-container").style.display = "none"; // Скрываем карточки
  document.querySelector(".final-screen").style.display = "block"; // Показываем итоговую страницу
}

// Закрывается модальное окно и движемся к следующей секции
function closeModal() {
  const resultModal = document.querySelector(".result-modal");
  resultModal.style.display = "none";

  // Найти текущую активную карточку
  const currentSection = document.querySelector(".active-case");
  const currentCaseId = currentSection.dataset.caseId;

  // Найти следующую карточку
  const nextCaseId = Number(currentCaseId) + 1;
  const nextSection = document.querySelector(
    `.case-section[data-case-id="${nextCaseId}"]`
  );

  // Если последняя карточка, заканчиваем симуляцию
  if (!nextSection) {
    finalizeSimulation();
  } else {
    currentSection.classList.remove("active-case");
    nextSection.classList.add("active-case");
  }
}
