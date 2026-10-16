const HARD_TIMER_SECONDS = 1.8;
const EXTREME_TIMER_SECONDS = 1.6;

const stations = [
  {
    id: "timer",
    badge: "3초",
    title: "3초 뒤 사라지는 주문 키오스크",
    short: "고민할 시간이 부족한 화면",
    mission: "치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제까지 완료해 보세요.",
    kicker: "시간 장벽",
    insight: "충분한 시간, 멈춤 버튼, 이전 단계로 돌아가기 버튼이 있어야 합니다.",
    principle: "시간을 넉넉하게",
    summary: "화면 제한 시간을 늘리고, 연장 버튼과 뒤로 가기 버튼을 함께 둡니다.",
    closing: "사용자가 늦은 것이 아니라, 충분히 생각할 시간을 주는 화면이 필요합니다.",
    hardLabel: `어려운 모드 (${HARD_TIMER_SECONDS}초)`,
    hardTitle: `${HARD_TIMER_SECONDS}초 뒤 사라지는 주문 키오스크`,
    hardMission: "새우버거, 콘샐러드, 레몬에이드(M), 얼음 중간, 쿠폰만 사용까지 완료해 보세요.",
    extremeLabel: `더 어려운 모드 (${EXTREME_TIMER_SECONDS}초)`,
    extremeTitle: `${EXTREME_TIMER_SECONDS}초 뒤 사라지는 주문 키오스크`,
    extremeMission: "더블패티버거, 버팔로윙, 제로환타(L), 얼음 많이, 모바일 상품권 결제까지 완료해 보세요."
  },
  {
    id: "alien",
    badge: "말",
    title: "외계어 메뉴 키오스크",
    short: "어려운 외래어와 줄임말",
    mission: "따뜻한 보리차, 포장, 설탕 없음을 골라 보세요.",
    kicker: "문해 장벽",
    insight: "쉬운 말, 그림, 예시가 있으면 처음 쓰는 사람도 이해하기 쉽습니다.",
    principle: "쉬운 말로",
    summary: "외래어와 줄임말을 줄이고, 쉬운 설명과 그림 단서를 제공합니다.",
    closing: "낯선 말은 주문을 막을 수 있으므로 쉬운 말과 그림 단서가 함께 있어야 합니다.",
    hardTitle: "읽는 방향까지 낯선 외계어 키오스크",
    hardMission: "차가운 유자차, 포장, 설탕 없음, 재사용이 가능한 컵까지 골라 보세요."
  },
  {
    id: "tiny",
    badge: "결제",
    title: "어려운 결제 키오스크",
    short: "할인, 적립, 결제, 영수증까지 이어지는 복잡한 과정",
    mission: "문자로 받은 쿠폰 번호를 입력하고, 휴대폰 번호 010-2580-1379로 포인트를 적립한 뒤 카드로 결제하고 영수증을 받으세요.",
    kicker: "절차 장벽",
    insight: "결제 전 단계가 많고 안내가 흩어져 있으면 어디를 눌러야 하는지 헷갈립니다.",
    principle: "결제 흐름을 단순하게",
    summary: "할인, 적립, 결제, 카드 투입, 영수증 수령을 단계별로 명확하게 안내합니다.",
    closing: "할인, 적립, 결제, 수령은 실제 행동 순서대로 하나씩 안내해야 합니다.",
    hardTitle: "함정이 숨은 결제 키오스크",
    hardMission: "문자로 받은 쿠폰 번호를 입력하고 휴대폰 번호 010-2580-1379로 적립하세요. 추가 주문은 모두 거절하고 모바일 상품권으로 결제한 뒤, 모자란 금액은 카드로 내고 영수증을 받으세요. 카드 비밀번호는 1234입니다."
  }
];

const stationPasswords = {
  timer: "감자튀김",
  alien: "보리차",
  tiny: "카드결제"
};

const state = {
  currentId: null,
  mode: "challenge",
  kioskStarted: false,
  completed: new Set(),
  attempts: {},
  barriers: []
};

let cleanupTasks = [];
let toastTimer = 0;

const els = {
  homeView: document.querySelector("#homeView"),
  stationView: document.querySelector("#stationView"),
  summaryView: document.querySelector("#summaryView"),
  stationCards: document.querySelector("#stationCards"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  stationBackButton: document.querySelector("#stationBackButton"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  stationKicker: document.querySelector("#stationKicker"),
  stationTitle: document.querySelector("#stationTitle"),
  stationMission: document.querySelector("#stationMission"),
  challengeMode: document.querySelector("#challengeMode"),
  kindMode: document.querySelector("#kindMode"),
  simulator: document.querySelector("#simulator"),
  insightText: document.querySelector("#insightText"),
  barrierLog: document.querySelector("#barrierLog"),
  summaryList: document.querySelector("#summaryList"),
  toast: document.querySelector("#toast"),
  topbar: document.querySelector(".topbar"),
  reflectionPanel: document.querySelector(".reflection-panel"),
  sideRail: document.querySelector("#sideRail"),
  chromebookToggle: document.querySelector("#chromebookToggle")
};

function getStation(id) {
  return stations.find((station) => station.id === id);
}

function currentStation() {
  return getStation(state.currentId);
}

function addCleanup(task) {
  cleanupTasks.push(task);
}

function clearRuntime() {
  cleanupTasks.forEach((task) => task());
  cleanupTasks = [];
}

function showView(viewName) {
  clearRuntime();
  if (viewName !== "station") {
    state.kioskStarted = false;
  }
  [els.homeView, els.stationView, els.summaryView].forEach((view) => view.classList.remove("is-active"));
  if (viewName === "home") {
    els.homeView.classList.add("is-active");
  }
  if (viewName === "station") {
    els.stationView.classList.add("is-active");
  }
  if (viewName === "summary") {
    renderSummary();
    els.summaryView.classList.add("is-active");
  }
  document.body.dataset.view = viewName;
  syncFocusMode();
}

function syncFocusMode() {
  const focused = state.kioskStarted && els.stationView.classList.contains("is-active");
  document.body.classList.toggle("kiosk-focus-mode", focused);
  els.stationView.classList.toggle("is-focus", focused);
}

const CHROMEBOOK_STORAGE_KEY = "alpaco-chromebook-mode";
const chromebookMovables = [els.topbar, els.stationBackButton, els.reflectionPanel].map((element) => ({
  element,
  parent: element.parentNode,
  next: element.nextSibling
}));

function readChromebookPreference() {
  try {
    return window.localStorage.getItem(CHROMEBOOK_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function setChromebookMode(enabled) {
  document.body.classList.toggle("chromebook-mode", enabled);
  els.chromebookToggle.setAttribute("aria-pressed", String(enabled));
  els.chromebookToggle.textContent = enabled ? "크롬북 모드 끄기" : "크롬북 모드";
  // 같은 DOM 노드를 옮겨서 기존 이벤트와 els 참조를 그대로 유지합니다.
  chromebookMovables.forEach(({ element, parent, next }) => {
    if (enabled) {
      els.sideRail.appendChild(element);
    } else {
      parent.insertBefore(element, next);
    }
  });
  try {
    window.localStorage.setItem(CHROMEBOOK_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // 저장소를 쓸 수 없는 환경에서도 현재 화면에는 적용됩니다.
  }
}

function renderProgress() {
  const done = state.completed.size;
  els.progressText.textContent = `${done} / ${stations.length} 완료`;
  els.progressBar.style.width = `${(done / stations.length) * 100}%`;
}

function renderCards() {
  els.stationCards.innerHTML = stations
    .map(
      (station) => {
        const isComplete = state.completed.has(station.id);
        return `
        <button class="station-card ${isComplete ? "is-complete" : ""}" type="button" data-station="${station.id}">
          <span class="station-card-top">
            <span class="monster-token">${station.badge}</span>
            ${isComplete ? `<span class="station-card-status">완료</span>` : ""}
          </span>
          <span>
            <p class="section-kicker">${station.kicker}</p>
            <h3>${station.title}</h3>
            <p>${isComplete ? station.closing : station.short}</p>
          </span>
        </button>
      `;
      }
    )
    .join("");

  els.stationCards.querySelectorAll("[data-station]").forEach((button) => {
    button.addEventListener("click", () => openStation(button.dataset.station));
  });
}

function openStation(id) {
  state.currentId = id;
  state.mode = "challenge";
  state.kioskStarted = false;
  showView("station");
  renderStation();
}

function returnHome() {
  state.currentId = null;
  state.kioskStarted = false;
  renderCards();
  showView("home");
  renderProgress();
}

function renderStation() {
  clearRuntime();
  const station = currentStation();
  if (!station) return;

  els.stationKicker.textContent = station.kicker;
  const tier = state.mode === "extreme" && station.extremeTitle ? "extreme" : state.mode === "hard" && station.hardTitle ? "hard" : "";
  els.stationTitle.textContent = tier ? station[`${tier}Title`] : station.title;
  els.stationMission.textContent = tier ? station[`${tier}Mission`] : station.mission;
  els.insightText.textContent = station.insight;
  els.challengeMode.classList.toggle("is-active", state.mode !== "kind");
  els.kindMode.classList.toggle("is-active", state.mode === "kind");
  renderBarrierLog();

  const renderers = {
    timer: renderTimerStation,
    tiny: renderTinyStation,
    alien: renderAlienStation,
    contrast: renderContrastStation,
    audio: renderAudioStation
  };

  if (!state.kioskStarted) {
    renderKioskStart(els.simulator, station, state.mode);
  } else {
    renderers[station.id](els.simulator, state.mode);
  }
  syncFocusMode();
  renderProgress();
}

function recordBarrier(message) {
  const station = currentStation();
  if (!station) return;
  state.attempts[station.id] = (state.attempts[station.id] || 0) + 1;
  state.barriers.unshift({
    stationId: station.id,
    stationTitle: station.title,
    message,
    success: false
  });
  renderBarrierLog();
  showToast(`장벽 발견: ${message}`);
}

function completeStation(message) {
  const station = currentStation();
  if (!station) return;
  state.kioskStarted = false;
  state.completed.add(station.id);
  state.barriers.unshift({
    stationId: station.id,
    stationTitle: station.title,
    message,
    success: true
  });
  renderProgress();
  renderBarrierLog();
  syncFocusMode();
  showToast("체험 완료. 더 좋은 설계를 찾았습니다.");
}

function celebrationParticles() {
  return Array.from({ length: 30 }, (_, index) => {
    const x = 8 + ((index * 19) % 84);
    const delay = (index % 10) * 70;
    const duration = 1200 + (index % 5) * 150;
    const size = 8 + (index % 4) * 3;
    const turn = (index % 2 === 0 ? 1 : -1) * (180 + index * 11);
    const drift = (index % 2 === 0 ? 1 : -1) * (24 + (index % 6) * 12);
    return `
      <span
        class="celebration-particle particle-${index % 5}"
        style="--x: ${x}%; --delay: ${delay}ms; --duration: ${duration}ms; --size: ${size}px; --turn: ${turn}deg; --drift: ${drift}px;"
      ></span>
    `;
  }).join("");
}

// 일반(challenge) → 어려운(hard) → 더 어려운(extreme) 순서로, 스테이션에 정의된 단계까지만 이어집니다.
function nextHarderMode(station, mode) {
  if (mode === "challenge" && station.hardTitle) return "hard";
  if (mode === "hard" && station.extremeTitle) return "extreme";
  return null;
}

function showCompletion(root, message, options = {}) {
  const station = currentStation();
  const stationRecords = state.barriers
    .filter((entry) => entry.stationId === station.id && !entry.success)
    .slice(0, 3);
  const nextMode = options.autoReturn ? null : nextHarderMode(station, state.mode);
  const completionRecord = stationRecords.length
    ? `
      <div class="completion-record">
        <b>발견 기록</b>
        ${stationRecords.map((entry) => `<span>${entry.message}</span>`).join("")}
      </div>
    `
    : "";
  const completionActions = options.autoReturn
    ? `<p class="auto-return-note">잠시 뒤 키오스크 선택 화면으로 돌아갑니다.</p>`
    : `
        <div class="completion-actions">
          <button class="next-button" type="button" data-return-home="true">키오스크 선택으로</button>
          ${
            nextMode
              ? `<button class="next-button harder-button" type="button" data-try-hard="true">${
                  station[`${nextMode}Label`] || "더 어려운 모드"
                }</button>`
              : ""
          }
        </div>
      `;
  // 주문 키오스크는 실제 매장처럼 주문 완료 화면과 주문번호를 먼저 보여 줍니다.
  const orderPrefix = { timer: "A", alien: "T" }[station.id];
  const orderTicket = orderPrefix
    ? `
      <div class="completion-order" role="status">
        <span class="completion-order-check" aria-hidden="true"></span>
        <span class="completion-order-copy">
          <b>주문이 완료되었습니다</b>
          <small>주문번호를 확인해 주세요</small>
        </span>
        <span class="completion-order-number"><small>주문번호</small><strong>${orderPrefix}-${100 + Math.floor(Math.random() * 900)}</strong></span>
      </div>
    `
    : "";
  if (orderPrefix) {
    fxToastLayer?.remove();
    fxSound("approve");
  }

  root.innerHTML = `
    <div class="kiosk-stage">
      <div class="kiosk-hardware" data-sign="${kioskSignText(stationBrands[station.id])}">
        <div class="kiosk-device-screen">
          <div class="kiosk-screen completion-screen">
            <div class="celebration-layer" aria-hidden="true">
              ${celebrationParticles()}
            </div>
            <div class="completion-panel">
              ${orderTicket}
              <p class="completion-kicker">${options.kicker || "미션 해결"}</p>
              <h3>${options.title || `${station.title} 완료`}</h3>
              <p>${message}</p>
              <p class="completion-lesson">마무리: ${station.closing}</p>
              ${completionRecord}
              ${completionActions}
            </div>
          </div>
        </div>
        ${kioskHardwareSlot()}
      </div>
    </div>
  `;
  root.querySelector("[data-return-home]")?.addEventListener("click", returnHome);
  root.querySelector("[data-try-hard]")?.addEventListener("click", () => {
    state.mode = nextMode;
    state.kioskStarted = true;
    renderStation();
  });
  if (options.autoReturn) {
    const autoReturnTimer = window.setTimeout(returnHome, 1800);
    addCleanup(() => window.clearTimeout(autoReturnTimer));
  }
}

function renderBarrierLog() {
  const station = currentStation();
  const filtered = station
    ? state.barriers.filter((entry) => entry.stationId === station.id)
    : state.barriers;

  if (filtered.length === 0) {
    els.barrierLog.innerHTML = `<p class="empty-log">아직 발견 기록이 없습니다.</p>`;
    return;
  }

  els.barrierLog.innerHTML = filtered
    .slice(0, 6)
    .map(
      (entry) => `
        <div class="log-entry${entry.success ? " success" : ""}">
          ${entry.message}
        </div>
      `
    )
    .join("");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2400);
}

function formatWon(amount) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function foodArt(type) {
  return `<span class="food-art ${type}" aria-hidden="true"><span></span><span></span><span></span></span>`;
}

const productImages = {
  bulgogi: "assets/menu/bulgogi-burger.png",
  "cheese-set": "assets/menu/cheese-burger.png",
  shrimp: "assets/menu/shrimp-burger.png",
  wrap: "assets/menu/chicken-wrap.png",
  salad: "assets/menu/salad.png",
  fries: "assets/menu/fries.png",
  stick: "assets/menu/cheese-stick.png",
  corn: "assets/menu/corn-salad.png",
  cola: "assets/menu/cola.png",
  "zero-cola": "assets/menu/zero-cola.png",
  cider: "assets/menu/cider.png",
  ade: "assets/menu/lemonade.png",
  "ice-none": "assets/menu/ice-none.png",
  "ice-less": "assets/menu/ice-less.png",
  "ice-normal": "assets/menu/ice-normal.png",
  "ice-more": "assets/menu/ice-more.png",
  "ice-extra": "assets/menu/ice-more.png",
  "ice-half": "assets/menu/ice-less.png",
  "double-patty": "assets/menu/double-patty-burger.png",
  bacon: "assets/menu/bacon-burger.png",
  "chicken-burger": "assets/menu/chicken-burger.png",
  teriyaki: "assets/menu/teriyaki-burger.png",
  hanwoo: "assets/menu/hanwoo-burger.png",
  jalapeno: "assets/menu/jalapeno-burger.png",
  mushroom: "assets/menu/mushroom-burger.png",
  "truffle-mushroom": "assets/menu/truffle-mushroom-burger.png",
  "rice-burger": "assets/menu/rice-burger.png",
  "buffalo-wing": "assets/menu/buffalo-wing.png",
  "yangnyeom-potato": "assets/menu/yangnyeom-potato.png",
  dakgangjeong: "assets/menu/dakgangjeong.png",
  "onion-ring": "assets/menu/onion-ring.png",
  nugget: "assets/menu/chicken-nugget.png",
  "hash-brown": "assets/menu/hash-brown.png",
  fanta: "assets/menu/fanta.png",
  "zero-fanta": "assets/menu/zero-fanta.png",
  "zero-cider": "assets/menu/zero-cider.png",
  "iced-tea": "assets/menu/iced-tea.png",
  "cup-small": "assets/menu/cup-small.png",
  "cup-medium": "assets/menu/cup-medium.png",
  "cup-large": "assets/menu/cup-large.png",
  "pay-card": "assets/menu/pay-card.png",
  "pay-cash": "assets/menu/pay-cash.png",
  "pay-gift": "assets/menu/pay-gift.png",
  "pay-cocoa": "assets/menu/pay-cocoa.png",
  "pay-naeildo": "assets/menu/pay-naeildo.png",
  "pay-saseong": "assets/menu/pay-saseong.png",
  "pay-coupon": "assets/menu/pay-coupon.png",
  "pay-point": "assets/menu/pay-point.png",
  "barley-hot": "assets/menu/barley-tea.png",
  "alpaco-vip": "assets/menu/alpaco-vip.png",
  jammanbo: "assets/menu/jammanbo-membership.png",
  "snu-class": "assets/menu/snu-class.png",
  "message-app": "assets/menu/message-app.png",
  "photo-app": "assets/menu/photo-app.png",
  "map-app": "assets/menu/map-app.png",
  "bank-app": "assets/menu/bank-app.png",
  "weather-app": "assets/menu/weather-app.png",
  "settings-app": "assets/menu/settings-app.png",
  "mail-app": "assets/menu/mail-app.png",
  "calendar-app": "assets/menu/calendar-app.png",
  "music-app": "assets/menu/music-app.png",
  "payment-card-hand": "assets/menu/card.png",
  "hardware-card-slot": "assets/menu/card-slot.png",
  "hardware-receipt": "assets/menu/receipt.png",
  "hardware-barcode": "assets/menu/barcode-scanner.png"
};

function productImageMarkup(src, className = "") {
  return `
    <span class="product-image-frame ${className}" aria-hidden="true">
      <img src="${src}" alt="" decoding="async">
    </span>
  `;
}

function productArt(item) {
  const imageSrc = productImages[item.id];
  if (imageSrc) {
    return productImageMarkup(imageSrc, `product-image-${item.id}`);
  }
  return item.visual ? foodArt(item.visual) : `<span class="text-art">${item.mark || item.label.slice(0, 1)}</span>`;
}

function stepDots(labels, activeIndex) {
  return `
    <ol class="order-steps" aria-label="주문 단계">
      ${labels
        .map(
          (label, index) => `
            <li class="${index === activeIndex ? "is-active" : ""}${index < activeIndex ? " is-done" : ""}">
              <span>${index + 1}</span>${label}
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function productCard(item, attrs = "", extraClass = "") {
  const desc = item.desc ? `<small>${item.desc}</small>` : "";
  const price = typeof item.price === "number" ? `<strong>${formatWon(item.price)}</strong>` : "";
  const art = item.noArt ? "" : productArt(item);
  const className = ["product-card", extraClass, item.noArt ? "no-art" : ""].filter(Boolean).join(" ");

  return `
    <button class="${className}" type="button" ${attrs}>
      ${art}
      <span class="product-copy">
        <b>${item.label}</b>
        ${desc}
        ${price}
      </span>
    </button>
  `;
}

function cartPanel(items, actionLabel = "결제하기") {
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const rows =
    items.length > 0
      ? items
          .map(
            (item) => `
              <div class="cart-row">
                <span>${item.label}</span>
                <strong>${formatWon(item.price || 0)}</strong>
              </div>
            `
          )
          .join("")
      : `<p class="empty-cart">선택한 메뉴가 없습니다.</p>`;

  return `
    <aside class="order-cart" aria-label="주문 내역">
      <h4>주문 내역 <em class="cart-count">${items.length}</em></h4>
      <div class="cart-list">${rows}</div>
      <div class="cart-total">
        <span>합계</span>
        <strong>${formatWon(total)}</strong>
      </div>
      <button class="checkout-button" type="button" data-cart-action="true">${actionLabel}</button>
    </aside>
  `;
}

// 기계 아래 결제 모듈. 카드 리더기와 영수증 출력구는 결제 키오스크의 실제 투입/수령 위치로도 동작합니다.
function kioskHardwareSlot() {
  return `
    <div class="kiosk-hardware-slot">
      <span class="hw-card-reader" data-barcode-target="card" data-card-target="slot" data-hardware="card" aria-label="카드 리더기"></span>
      <span class="hw-receipt-printer" data-barcode-target="receipt" data-hardware="receipt" aria-label="영수증 출력구"></span>
    </div>
  `;
}

// 매장 키오스크 상단 광고 배너. 이미지가 없으면 kiosk-store.css의 그라데이션만 보입니다.
const stationBrands = { timer: "모두버거", alien: "모두티", tiny: "모두페이" };

const kioskBanners = {
  모두버거: { id: "burger", kicker: "MODU BURGER", headline: "갓 구운 버거 세트", copy: "주문 후 바로 조리해요" },
  모두티: { id: "tea", kicker: "MODU TEA", headline: "따뜻한 차 한 잔", copy: "오늘의 차를 골라 보세요" },
  모두페이: { id: "pay", kicker: "MODU PAY", headline: "할인·적립 한 번에", copy: "간편하게 결제해요" }
};

// 기계 상단 간판 문구 (kiosk-3d.css에서 attr(data-sign)으로 표시)
function kioskSignText(brand) {
  return kioskBanners[brand] ? `${kioskBanners[brand].kicker} · TOUCH ORDER` : "TOUCH ORDER";
}

function kioskBanner(banner) {
  if (!banner) return "";
  return `
    <div class="kiosk-banner kiosk-banner-${banner.id}" aria-hidden="true">
      <div class="kiosk-banner-copy">
        <small>${banner.kicker}</small>
        <b>${banner.headline}</b>
        <span>${banner.copy}</span>
      </div>
    </div>
  `;
}

function kioskShell({ brand, title, subtitle, mode, status, timer, steps, activeStep, body, cartItems, guide, className = "", banner }) {
  const modeLabel = mode === "kind" ? "개선 모드" : "어려운 모드";
  const stageClass = ["kiosk-stage", mode === "challenge" ? "challenge" : ""].filter(Boolean).join(" ");
  const bannerInfo = banner === undefined ? kioskBanners[brand] : banner;
  return `
    <div class="${stageClass}">
      <div class="kiosk-hardware" data-sign="${kioskSignText(brand)}">
        <div class="kiosk-device-screen">
          <div class="real-kiosk ${className}">
            <header class="kiosk-brandbar">
              <div class="brand-stack">
                <span class="store-logo">${brand.slice(0, 1)}</span>
                <span>
                  <b>${brand}</b>
                  <small>${modeLabel}</small>
                </span>
              </div>
              <div class="kiosk-status">
                <span>${status}</span>
                ${timer ? `<strong id="timerReadout">${timer}</strong>` : ""}
              </div>
            </header>
            ${kioskBanner(bannerInfo)}
            <section class="kiosk-order-main">
              <div class="order-board">
                <div class="order-heading">
                  <div>
                    <h3>${title}</h3>
                    ${subtitle ? `<p>${subtitle}</p>` : ""}
                  </div>
                  ${steps ? stepDots(steps, activeStep) : ""}
                </div>
                ${guide ? `<p class="kiosk-help real-help">${guide}</p>` : ""}
                ${body}
              </div>
              ${cartPanel(cartItems)}
            </section>
            <footer class="kiosk-homebar">
              <span>처음으로</span>
              <span>직원 호출</span>
              <span>도움말</span>
            </footer>
          </div>
        </div>
        ${kioskHardwareSlot()}
      </div>
    </div>
  `;
}

function selectedCartItems(values) {
  return Object.values(values).filter(Boolean);
}

function flowModal(message) {
  return `
    <div class="flow-modal-backdrop" role="dialog" aria-modal="true" aria-label="${message}">
      <div class="flow-modal">
        <h4>${message}</h4>
        <button class="phone-primary-button" type="button" data-flow-modal-close="true">확인</button>
      </div>
    </div>
  `;
}

function randomStudentNumber(length = 8) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const all = `${letters}${digits}`;
  const chars = [
    letters[Math.floor(Math.random() * letters.length)],
    digits[Math.floor(Math.random() * digits.length)]
  ];

  while (chars.length < length) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.join("");
}

function captureKioskScroll(root) {
  const frame = root.querySelector(".kiosk-frame");
  const device = root.querySelector(".kiosk-device-screen");
  const board = root.querySelector(".order-board");
  return {
    frameTop: frame ? frame.scrollTop : 0,
    deviceTop: device ? device.scrollTop : 0,
    boardTop: board ? board.scrollTop : 0
  };
}

function restoreKioskScroll(root, scrollState) {
  if (!scrollState) return;

  const restore = () => {
    const frame = root.querySelector(".kiosk-frame");
    const device = root.querySelector(".kiosk-device-screen");
    const board = root.querySelector(".order-board");
    if (frame) frame.scrollTop = scrollState.frameTop;
    if (device) device.scrollTop = scrollState.deviceTop || 0;
    if (board) board.scrollTop = scrollState.boardTop;
  };

  restore();
  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(restore);
  }
}

function kioskHeroFor(stationId) {
  const heroes = {
    timer: {
      brand: "모두버거",
      title: "오늘의 추천 메뉴",
      name: "치즈버거",
      copy: "치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제까지 해보세요.",
      art: productImageMarkup(productImages["cheese-set"], "hero-product-image")
    },
    tiny: {
      brand: "모두페이",
      title: "결제수단 선택",
      name: "카드 결제",
      copy: "ALPACO VIP 인증, SNU 클래스 적립, 결제, 영수증 수령까지 확인합니다.",
      art: productImageMarkup(productImages["alpaco-vip"], "hero-product-image hero-alpaco-image")
    },
    alien: {
      brand: "모두티",
      title: "오늘의 차 메뉴",
      name: "따뜻한 보리차",
      copy: "따뜻한 보리차, 포장, 설탕 없음을 선택해 보세요.",
      art: productImageMarkup(productImages["barley-hot"], "hero-product-image hero-barley-image")
    },
    contrast: {
      brand: "모두버거",
      title: "결제 전 쿠폰 확인",
      name: "1,000원 할인",
      copy: "쿠폰과 결제 화면의 보기 쉬움을 비교합니다.",
      art: `<span class="text-art">%</span>`
    },
    audio: {
      brand: "모두병원",
      title: "번호표 접수",
      name: "소아과 접수",
      copy: "음성 안내와 화면 안내를 비교합니다.",
      art: `<span class="text-art">접</span>`
    }
  };
  return heroes[stationId] || heroes.timer;
}

function renderKioskStart(root, station, mode) {
  const hero = kioskHeroFor(station.id);
  const modeLabel = mode === "kind" ? "개선 모드" : "어려운 모드";
  const inputId = `stationPassword-${station.id}`;
  const heroBanner = kioskBanners[hero.brand];
  root.innerHTML = `
    <div class="kiosk-stage">
      <div class="kiosk-hardware start-hardware" data-sign="${kioskSignText(hero.brand)}">
        <div class="kiosk-device-screen start-device-screen">
          <header class="start-hero${heroBanner ? ` start-hero-${heroBanner.id}` : ""}">
            <div class="start-copy">
              <p>${hero.title}</p>
              <h3>${hero.name}</h3>
              <span>${hero.copy}</span>
            </div>
            <div class="start-art">${hero.art}</div>
          </header>
          <section class="start-panel">
            <p class="section-kicker">${modeLabel}</p>
            <h3>주문 목표를 확인했나요?</h3>
            <p>${station.mission}</p>
            <form class="start-password-form" data-start-password-form="true">
              <label for="${inputId}">비밀번호</label>
              <input id="${inputId}" type="text" autocomplete="off" placeholder="선생님이 알려준 비밀번호 입력" data-start-password-input="true" />
              <small data-start-password-error="true" aria-live="polite"></small>
              <button class="kiosk-start-button" type="submit">시작</button>
            </form>
          </section>
          <footer class="kiosk-homebar">
            <span>처음으로</span>
            <span>직원 호출</span>
            <span>도움말</span>
          </footer>
        </div>
        ${kioskHardwareSlot()}
      </div>
    </div>
  `;

  root.querySelector("[data-start-password-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = root.querySelector("[data-start-password-input]");
    const error = root.querySelector("[data-start-password-error]");
    const expected = stationPasswords[station.id] || "";
    const typed = input.value.replace(/\s/g, "");

    if (typed !== expected.replace(/\s/g, "")) {
      input.classList.add("is-error");
      error.textContent = "비밀번호를 다시 확인해 주세요.";
      showToast("비밀번호를 다시 확인해 주세요.");
      input.focus();
      input.select();
      return;
    }

    state.kioskStarted = true;
    renderStation();
  });

  root.querySelector("[data-start-password-input]").addEventListener("input", (event) => {
    event.currentTarget.classList.remove("is-error");
    root.querySelector("[data-start-password-error]").textContent = "";
  });
}

// ---------- 실제 매장 키오스크처럼 반응하는 터치 피드백 (kiosk-feedback.css) ----------
// 효과는 document.body 위 fixed 레이어에서 비동기로만 돌아서, draw()로 화면이 바뀌어도 남고 입력을 막지 않습니다.
function fxReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function fxSound(name) {
  window.KioskFX?.sound?.(name);
}

// 같은 요소에 같은 애니메이션 클래스를 다시 붙여도 처음부터 재생되게 합니다.
function fxRestartClass(element, className, duration = 320) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), duration);
}

function fxScreenRect(root) {
  const screen = root.querySelector(".kiosk-device-screen");
  return screen ? screen.getBoundingClientRect() : null;
}

// 키오스크 화면 위에 겹치는 레이어 (클릭은 그대로 아래로 통과)
function fxScreenLayer(root, className, html, lifetime) {
  const rect = fxScreenRect(root);
  if (!rect) return null;
  const layer = document.createElement("div");
  layer.className = `kfx-screen-layer ${className}`;
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  });
  layer.innerHTML = html;
  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), lifetime);
  return layer;
}

let fxToastLayer = null;

// 브라우저 알림 대신 키오스크 화면 안에 잠깐 뜨는 안내 문구
function fxKioskToast(root, message, tone = "error") {
  fxToastLayer?.remove();
  fxToastLayer = fxScreenLayer(root, "kfx-toast-layer", `<div class="kfx-toast kfx-toast-${tone}">${message}</div>`, 1400);
  // 하단 주문 바 바로 위에 띄웁니다.
  const screenRect = fxScreenRect(root);
  const cartRect = root.querySelector(".order-cart")?.getBoundingClientRect();
  if (fxToastLayer && screenRect && cartRect) {
    fxToastLayer.style.paddingBottom = `${Math.max(screenRect.bottom - cartRect.top + 12, 12)}px`;
  }
}

// 잘못 누른 타일: 빨갛게 번쩍이며 흔들림 + 오류음 + 화면 안내
function fxReject(root, element, message) {
  fxSound("error");
  fxRestartClass(element, "kfx-wrong", 360);
  fxKioskToast(root, message, "error");
}

// 다시 그리기 전에 고른 타일의 위치와 그림을 기억해 둡니다.
function fxSnapshot(button) {
  const rect = button.getBoundingClientRect();
  const img = button.querySelector(".product-image-frame img");
  const label = button.querySelector(".product-copy b")?.textContent || "";
  return { rect, src: img ? img.getAttribute("src") : "", label };
}

// 고른 메뉴 그림이 하단 주문 바로 날아가고, 개수 배지가 튀고, 합계가 올라갑니다.
function fxFlyToCart(root, snapshot, previousTotal) {
  fxToastLayer?.remove();
  const badge = root.querySelector(".order-cart .cart-count");
  const totalEl = root.querySelector(".order-cart .cart-total strong");
  const chips = root.querySelectorAll(".order-cart .cart-row");
  const newestChip = chips[chips.length - 1];
  const nextTotal = Number((totalEl?.textContent || "").replace(/[^0-9]/g, "")) || 0;

  const land = () => {
    fxRestartClass(badge, "kfx-bump", 320);
    fxRestartClass(newestChip, "kfx-chip-in", 320);
    fxCountUp(totalEl, previousTotal, nextTotal);
  };

  if (!snapshot || !badge || fxReducedMotion()) {
    land();
    return;
  }

  const from = snapshot.rect;
  const to = badge.getBoundingClientRect();
  const size = 56;
  const fly = document.createElement("div");
  fly.className = "kfx-fly";
  fly.setAttribute("aria-hidden", "true");
  fly.innerHTML = snapshot.src ? `<img src="${snapshot.src}" alt="">` : `<span>${snapshot.label.slice(0, 6)}</span>`;
  fly.style.left = `${from.left + from.width / 2 - size / 2}px`;
  fly.style.top = `${from.top + from.height / 2 - size / 2}px`;
  document.body.appendChild(fly);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = fly.animate(
    [
      { transform: "translate(0, 0) scale(1.15)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(0.8)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.4 }
    ],
    { duration: 300, easing: "cubic-bezier(0.45, 0, 0.6, 1)" }
  );
  animation.onfinish = () => {
    fly.remove();
    if (badge.isConnected) land();
  };
  window.setTimeout(() => fly.remove(), 600);
}

// 합계 금액을 계산기처럼 빠르게 세어 올립니다.
function fxCountUp(element, from, to) {
  if (!element || from === to || fxReducedMotion()) return;
  const start = performance.now();
  const duration = 260;
  const tick = (now) => {
    if (!element.isConnected) return;
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = formatWon(Math.round(from + (to - from) * progress));
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

// 다음 단계 화면이 실제 키오스크처럼 옆에서 밀려 들어옵니다. back이면 반대 방향.
function fxStepEnter(root, direction = "next") {
  const board = root.querySelector(".order-board");
  if (!board || fxReducedMotion()) return;
  fxRestartClass(board, direction === "back" ? "kfx-step-back" : "kfx-step-next", 260);
}

// 시간 초과로 처음 화면으로 돌아갈 때 잠깐 뜨는 안내 (입력은 막지 않음)
function fxTimeoutNotice(root) {
  fxSound("error");
  fxToastLayer?.remove();
  fxScreenLayer(
    root,
    "kfx-timeout-layer",
    `
      <div class="kfx-timeout">
        <span class="kfx-clock"><i></i></span>
        <b>시간이 초과되어 처음 화면으로 돌아갑니다</b>
      </div>
    `,
    1300
  );
}

function renderTimerStation(root, mode) {
  const isKind = mode === "kind";
  const isHard = mode === "hard";
  const isExtreme = mode === "extreme";
  const timeLimit = isExtreme ? EXTREME_TIMER_SECONDS : isHard ? HARD_TIMER_SECONDS : 3;
  const target = isExtreme
    ? {
        menu: "double-patty",
        side: "buffalo-wing",
        drink: "zero-fanta",
        size: "cup-large",
        ice: "ice-more",
        payment: "pay-gift",
        menuLabel: "더블패티버거",
        sideLabel: "버팔로윙",
        drinkLabel: "제로환타",
        sizeLabel: "L",
        iceLabel: "얼음 많이",
        paymentLabel: "모바일 상품권 결제"
      }
    : isHard
      ? {
          menu: "shrimp",
          side: "corn",
          drink: "ade",
          ice: "ice-normal",
          payment: "coupon",
          menuLabel: "새우버거",
          sideLabel: "콘샐러드",
          drinkLabel: "레몬에이드(M)",
          iceLabel: "얼음 중간",
          paymentLabel: "쿠폰만 사용"
        }
      : {
          menu: "cheese-set",
          side: "fries",
          drink: "cola",
          ice: "ice-less",
          payment: "card",
          menuLabel: "치즈버거",
          sideLabel: "감자튀김",
          drinkLabel: "콜라(M)",
          iceLabel: "얼음 적게",
          paymentLabel: "카드 결제"
        };
  const drinkSummary = target.sizeLabel ? `${target.drinkLabel}(${target.sizeLabel})` : target.drinkLabel;
  const targetSummary = `${target.menuLabel}, ${target.sideLabel}, ${drinkSummary}, ${target.iceLabel}, ${target.paymentLabel}`;
  const timeLabel = `${timeLimit}초`;
  const iceStep = {
    label: "얼음",
    key: "ice",
    title: "얼음 양을 선택해 주세요",
    subtitle: `${drinkSummary}에 넣을 ${target.iceLabel}을 고릅니다.`,
    correct: target.ice,
    items: [
      { id: "ice-none", label: "얼음 없음", desc: "얼음을 넣지 않음", price: 0, mark: "없" },
      { id: "ice-less", label: "얼음 적게", desc: "조금만 넣기", price: 0, mark: "적" },
      { id: "ice-normal", label: "얼음 중간", desc: "기본 양", price: 0, mark: "중" },
      { id: "ice-more", label: "얼음 많이", desc: "가득 넣기", price: 0, mark: "많" }
    ]
  };
  const steps = isExtreme
    ? [
        {
          label: "메뉴",
          key: "menu",
          title: "버거를 골라 주세요",
          subtitle: `${target.menuLabel}를 선택하면 다음 단계로 이동합니다.`,
          correct: target.menu,
          items: [
            { id: "bulgogi", label: "불고기버거", desc: "달콤한 간장 소스", price: 5200 },
            { id: "cheese-set", label: "치즈버거", desc: "기본 버거", price: 5200 },
            { id: "shrimp", label: "새우버거", desc: "바삭한 새우 패티", price: 6100 },
            { id: "bacon", label: "베이컨버거", desc: "훈제 베이컨", price: 6300 },
            { id: "double-patty", label: "더블패티버거", desc: "패티 두 장", price: 7400 },
            { id: "chicken-burger", label: "치킨버거", desc: "통가슴살 튀김", price: 5900 },
            { id: "teriyaki", label: "데리버거", desc: "데리야끼 소스", price: 4300 },
            { id: "hanwoo", label: "한우버거", desc: "한우 패티", price: 8900 },
            { id: "jalapeno", label: "할라피뇨버거", desc: "매콤한 고추", price: 6500 },
            { id: "mushroom", label: "머쉬룸버거", desc: "버섯 소스", price: 6400 },
            { id: "truffle-mushroom", label: "트러플 머쉬룸버거", desc: "트러플 버섯 소스", price: 7900 },
            { id: "rice-burger", label: "라이스버거", desc: "밥으로 만든 번", price: 6000 }
          ]
        },
        {
          label: "사이드",
          key: "side",
          title: "사이드를 선택해 주세요",
          subtitle: `세트에 포함할 ${target.sideLabel}을 고릅니다.`,
          correct: target.side,
          items: [
            { id: "fries", label: "감자튀김", desc: "기본 사이드", price: 0 },
            { id: "yangnyeom-potato", label: "양념감자", desc: "시즈닝 감자", price: 500 },
            { id: "stick", label: "치즈스틱", desc: "추가 800원", price: 800 },
            { id: "buffalo-wing", label: "버팔로윙", desc: "매콤한 날개", price: 1500 },
            { id: "dakgangjeong", label: "닭강정", desc: "달콤한 양념", price: 1500 },
            { id: "onion-ring", label: "어니언링", desc: "바삭한 양파", price: 700 },
            { id: "nugget", label: "치킨너겟", desc: "한입 너겟", price: 900 },
            { id: "hash-brown", label: "해시브라운", desc: "감자 패티", price: 600 },
            { id: "corn", label: "콘샐러드", desc: "달콤한 옥수수", price: 0 },
            { id: "salad", label: "샐러드", desc: "상큼한 채소", price: 0 }
          ]
        },
        {
          label: "음료",
          key: "drink",
          title: "음료를 선택해 주세요",
          subtitle: `세트에 포함할 ${target.drinkLabel}를 고릅니다.`,
          correct: target.drink,
          items: [
            { id: "cola", label: "콜라", desc: "기본 탄산음료", price: 0 },
            { id: "zero-cola", label: "제로콜라", desc: "당류 0g", price: 0 },
            { id: "cider", label: "사이다", desc: "레몬향 탄산", price: 0 },
            { id: "zero-cider", label: "제로사이다", desc: "당류 0g", price: 0 },
            { id: "fanta", label: "환타", desc: "오렌지 탄산", price: 0 },
            { id: "zero-fanta", label: "제로환타", desc: "당류 0g", price: 0 },
            { id: "ade", label: "레몬에이드", desc: "추가 700원", price: 700 },
            { id: "iced-tea", label: "아이스티", desc: "복숭아 홍차", price: 300 }
          ]
        },
        {
          label: "사이즈",
          key: "size",
          title: "음료 사이즈를 선택해 주세요",
          subtitle: `${target.drinkLabel} ${target.sizeLabel} 사이즈를 고릅니다.`,
          correct: target.size,
          items: [
            { id: "cup-small", label: "S 사이즈", desc: "작은 컵", price: 0, mark: "S" },
            { id: "cup-medium", label: "M 사이즈", desc: "보통 컵", price: 0, mark: "M" },
            { id: "cup-large", label: "L 사이즈", desc: "추가 500원", price: 500, mark: "L" }
          ]
        },
        iceStep,
        {
          label: "결제",
          key: "payment",
          title: "결제 방법을 선택해 주세요",
          subtitle: `${target.paymentLabel}을 선택하면 주문이 완료됩니다.`,
          correct: target.payment,
          items: [
            { id: "pay-card", label: "카드 결제", desc: "카드 투입구 사용", price: 0, mark: "카" },
            { id: "pay-cash", label: "현금 결제", desc: "직원 호출 필요", price: 0, mark: "현" },
            { id: "pay-cocoa", label: "코코아페이", desc: "간편 결제", price: 0, mark: "코" },
            { id: "pay-naeildo", label: "내일도페이", desc: "간편 결제", price: 0, mark: "내" },
            { id: "pay-saseong", label: "사성페이", desc: "휴대폰 터치 결제", price: 0, mark: "사" },
            { id: "pay-gift", label: "모바일 상품권", desc: "바코드 스캔", price: 0, mark: "상" },
            { id: "pay-coupon", label: "쿠폰 사용", desc: "쿠폰 번호 필요", price: 0, mark: "쿠" },
            { id: "pay-point", label: "포인트 결제", desc: "적립 포인트 사용", price: 0, mark: "포" }
          ]
        }
      ]
    : [
        {
          label: "메뉴",
          key: "menu",
          title: "메뉴를 골라 주세요",
          subtitle: `${target.menuLabel}를 선택하면 다음 단계로 이동합니다.`,
          correct: target.menu,
          items: [
            { id: "bulgogi", label: "불고기버거", desc: "달콤한 간장 소스", price: 5200, visual: "burger" },
            { id: "cheese-set", label: "치즈버거", desc: "기본 버거", price: 5200, visual: "burger" },
            { id: "shrimp", label: "새우버거", desc: "바삭한 새우 패티", price: 6100, visual: "burger" },
            { id: "wrap", label: "치킨랩", desc: "또띠아와 치킨", price: 5400, visual: "wrap" }
          ]
        },
        {
          label: "사이드",
          key: "side",
          title: "사이드를 선택해 주세요",
          subtitle: `세트에 포함할 ${target.sideLabel}를 고릅니다.`,
          correct: target.side,
          items: [
            { id: "salad", label: "샐러드", desc: "상큼한 채소", price: 0, visual: "salad" },
            { id: "corn", label: "콘샐러드", desc: "달콤한 옥수수", price: 0, visual: "salad" },
            { id: "stick", label: "치즈스틱", desc: "추가 800원", price: 800, visual: "stick" },
            { id: "fries", label: "감자튀김", desc: "기본 사이드", price: 0, visual: "fries" }
          ]
        },
        {
          label: "음료",
          key: "drink",
          title: "음료를 선택해 주세요",
          subtitle: `세트에 포함할 ${target.drinkLabel}를 고릅니다.`,
          correct: target.drink,
          items: [
            { id: "cola", label: "콜라(M)", desc: "기본 탄산음료", price: 0, visual: "cup" },
            { id: "zero-cola", label: "제로콜라(M)", desc: "당류 0g", price: 0, visual: "cup" },
            { id: "cider", label: "사이다(M)", desc: "레몬향 탄산", price: 0, visual: "cup" },
            { id: "ade", label: "레몬에이드(M)", desc: "추가 700원", price: 700, visual: "cup" }
          ]
        },
        iceStep,
        {
          label: "결제",
          key: "payment",
          title: "결제 방법을 선택해 주세요",
          subtitle: `${target.paymentLabel}을 선택하면 주문이 완료됩니다.`,
          correct: target.payment,
          items: [
            { id: "cash", label: "현금 결제", desc: "직원 호출 필요", price: 0, mark: "현" },
            { id: "card", label: "카드 결제", desc: "카드 투입구 사용", price: 0, mark: "카" },
            { id: "coupon", label: "쿠폰만 사용", desc: "쿠폰 번호 필요", price: 0, mark: "쿠" },
            { id: "cancel", label: "처음으로", desc: "주문 취소", price: 0, mark: "취" }
          ]
        }
      ];

  // 어려운 모드(중간 단계)는 일반 모드 목록에 비슷한 선택지 2개씩을 더해 단계마다 6개를 보여 줍니다.
  if (isHard) {
    const hardExtras = {
      menu: [
        { id: "bacon", label: "베이컨버거", desc: "훈제 베이컨", price: 6300 },
        { id: "teriyaki", label: "데리버거", desc: "데리야끼 소스", price: 4300 }
      ],
      side: [
        { id: "yangnyeom-potato", label: "양념감자", desc: "시즈닝 감자", price: 500 },
        { id: "onion-ring", label: "어니언링", desc: "바삭한 양파", price: 700 }
      ],
      drink: [
        { id: "fanta", label: "환타(M)", desc: "오렌지 탄산", price: 0 },
        { id: "iced-tea", label: "아이스티(M)", desc: "복숭아 홍차", price: 300 }
      ],
      ice: [
        { id: "ice-extra", label: "얼음 아주 많이", desc: "컵 가득 채우기", price: 0, mark: "가" },
        { id: "ice-half", label: "얼음 반만", desc: "기본의 절반", price: 0, mark: "반" }
      ],
      payment: [
        { id: "hard-cocoa-pay", label: "코코아페이", desc: "간편 결제", price: 0, mark: "코" },
        { id: "hard-gift-pay", label: "모바일 상품권", desc: "바코드 스캔", price: 0, mark: "상" }
      ]
    };
    steps.forEach((step) => {
      step.items = [...step.items, ...(hardExtras[step.key] || [])];
    });
  }

  const order = {};
  let step = 0;
  let timeLeft = isKind ? 0 : timeLimit;
  let timer = 0;
  let disposed = false;

  addCleanup(() => {
    disposed = true;
    window.clearInterval(timer);
  });

  function draw() {
    const current = steps[step];
    root.innerHTML = kioskShell({
      brand: "모두버거",
      title: current.title,
      subtitle: current.subtitle,
      mode,
      status: isKind ? "천천히 주문" : isHard || isExtreme ? `${timeLabel} 자동 초기화` : "자동 초기화",
      timer: isKind ? "" : `${timeLeft.toFixed(1)}초`,
      steps: steps.map((item) => item.label),
      activeStep: step,
      guide: isKind
        ? "시간 제한 없이 치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제를 순서대로 고릅니다."
        : `${timeLabel} 안에 ${targetSummary} 순서로 고릅니다.`,
      cartItems: selectedCartItems(order),
      className: isKind ? "friendly-kiosk" : "pressure-kiosk",
      body: `
        <div class="category-tabs" aria-label="메뉴 분류">
          <span class="category-tab is-active">${current.label}</span>
          <span class="category-tab">추천</span>
          <span class="category-tab">할인</span>
        </div>
        <div class="product-grid${isExtreme ? " mega-products" : isHard ? " six-products" : ""}">
          ${current.items.map((item) => productCard(item, `data-product="${item.id}"`, isKind ? "comfortable" : "pressure-card")).join("")}
        </div>
      `
    });

    root.querySelectorAll("[data-product]").forEach((button) => {
      button.addEventListener("click", () => {
        const selected = current.items.find((item) => item.id === button.dataset.product);
        if (!selected) return;
        if (selected.id !== current.correct) {
          fxReject(root, button, "주문 내용과 다른 메뉴예요. 다시 확인해 주세요.");
          recordBarrier(isKind ? "원하는 조건과 다른 항목입니다. 설명을 다시 확인해 보세요." : "빨리 고르려다 엉뚱한 메뉴를 눌렀습니다.");
          return;
        }

        fxSound("beep");
        const snapshot = fxSnapshot(button);
        const previousTotal = selectedCartItems(order).reduce((sum, item) => sum + (item.price || 0), 0);
        order[current.key] = selected;
        window.clearInterval(timer);
        if (step === steps.length - 1) {
          if (isExtreme) {
            completeStation(`더 어려운 ${timeLabel} 미션까지 완료했습니다.`);
            showCompletion(root, `${timeLabel} 안에 더 복잡한 주문 조건까지 완료했습니다. 잠시 뒤 키오스크 선택 화면으로 돌아갑니다.`, {
              autoReturn: true,
              kicker: "최종 미션 해결",
              title: "더 어려운 모드 완료"
            });
          } else if (isHard) {
            completeStation(`어려운 ${timeLabel} 미션을 완료했습니다.`);
            showCompletion(root, `${timeLabel} 안에도 주문을 마쳤습니다. 이번에는 메뉴가 훨씬 많은 ${EXTREME_TIMER_SECONDS}초 미션에 도전해 보세요.`, {
              kicker: "어려운 모드 해결",
              title: "어려운 모드 완료"
            });
          } else {
            completeStation("짧은 제한 시간은 주문을 포기하게 만들 수 있습니다.");
            showCompletion(root, "실제 주문 화면에서도 충분한 시간과 이전 단계 버튼이 필요합니다.");
          }
          return;
        }
        step += 1;
        timeLeft = timeLimit;
        draw();
        fxStepEnter(root, "next");
        fxFlyToCart(root, snapshot, previousTotal);
        if (!isKind) startClock();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", (event) => {
      fxReject(root, event.currentTarget, "메뉴를 모두 고른 뒤 결제할 수 있어요.");
      recordBarrier(isKind ? "아직 주문 단계를 차례로 완료해야 합니다." : "장바구니 버튼이 있어도 시간 제한이 있으면 확인하기 어렵습니다.");
    });
  }

  // 남은 시간 비율에 따라 타이머와 화면 테두리를 점점 강하게 강조합니다 (timer-urgency.css).
  function updateUrgency() {
    const readout = root.querySelector("#timerReadout");
    if (!readout) return;
    const ratio = Math.max(timeLeft, 0) / timeLimit;
    const urgency = ratio > 0.6 ? "calm" : ratio > 0.3 ? "warn" : "danger";
    readout.textContent = `${Math.max(timeLeft, 0).toFixed(1)}초`;
    readout.style.setProperty("--time-ratio", ratio.toFixed(3));
    readout.dataset.urgency = urgency;
    // 1초 단위가 바뀔 때마다 숫자가 툭 튀어 오르게 합니다.
    const wholeSecond = Math.ceil(Math.max(timeLeft, 0));
    if (readout.dataset.second && readout.dataset.second !== String(wholeSecond)) {
      readout.animate?.([{ transform: "scale(1.28)" }, { transform: "scale(1)" }], { duration: 240, easing: "ease-out" });
      // 마지막 2초는 초마다 작게 째깍 소리를 냅니다.
      if (wholeSecond > 0 && wholeSecond <= 2) fxSound("tick");
    }
    readout.dataset.second = String(wholeSecond);
    const kiosk = root.querySelector(".real-kiosk");
    if (kiosk) kiosk.dataset.urgency = urgency;
  }

  function startClock() {
    window.clearInterval(timer);
    updateUrgency();
    timer = window.setInterval(() => {
      if (disposed) return;
      timeLeft -= 0.1;
      updateUrgency();
      if (timeLeft <= 0) {
        window.clearInterval(timer);
        recordBarrier("생각할 시간이 부족해 주문 화면이 처음으로 돌아갔습니다.");
        step = 0;
        Object.keys(order).forEach((key) => delete order[key]);
        timeLeft = timeLimit;
        draw();
        fxStepEnter(root, "back");
        fxTimeoutNotice(root);
        startClock();
      }
    }, 100);
  }

  draw();
  if (!isKind) startClock();
}

const HARD_GIFT_BALANCE = 5300;
const HARD_CARD_PIN = "1234";
const hardUpsellOffers = [
  {
    title: "세트로 바꾸시겠어요?",
    desc: "지금 바꾸면 감자튀김과 음료가 커져요! 오늘만 이 가격!",
    imageKey: "fries",
    yes: "예, 세트로 바꿀게요 (+2,000원)",
    no: "아니요",
    layout: "below",
    barrier: "큰 버튼을 눌러 원하지 않은 세트 업그레이드(+2,000원)가 추가되었습니다. 추가 주문 안내가 처음부터 다시 나옵니다."
  },
  {
    title: "디저트를 함께 드릴까요?",
    desc: "버거와 찰떡궁합! 치즈스틱을 1,500원에 추가하세요.",
    imageKey: "stick",
    yes: "예, 디저트 추가할게요",
    no: "괜찮아요",
    layout: "above",
    barrier: "눈에 띄는 버튼을 눌러 원하지 않은 치즈스틱이 추가되었습니다. 추가 주문 안내가 처음부터 다시 나옵니다."
  },
  {
    title: "회원가입하고 500원 할인받기",
    desc: "휴대폰 번호만 입력하면 바로 500원 할인! 지금 가입하세요.",
    imageKey: "",
    yes: "예, 가입하고 할인받을게요",
    no: "다음에",
    layout: "corner",
    barrier: "할인이라는 말에 원하지 않은 회원가입 화면으로 넘어갔습니다. 추가 주문 안내가 처음부터 다시 나옵니다."
  }
];

function shuffledPinKeys() {
  const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  for (let index = keys.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [keys[index], keys[swapIndex]] = [keys[swapIndex], keys[index]];
  }
  return keys;
}

const TINY_REWARD_PHONE = "01025801379";
const TINY_COUPON_DISCOUNT = 1000;
const TINY_COUPON_LENGTH = 12;

// 문자 쿠폰 번호. 어려운 모드는 O/0, I/1, S/5, B/8, Z/2처럼 닮은 글자를 일부러 섞고, 개선 모드는 닮은 글자를 빼고 만듭니다.
function randomCouponCode(friendly = false) {
  const tricky = "O0I1S5B8Z2";
  const plain = "ACDEFHJKLMNPRTUVWXY34679";
  const pool = friendly ? plain : `${tricky}${tricky}${plain}`;
  const chars = Array.from({ length: TINY_COUPON_LENGTH }, () => pool[Math.floor(Math.random() * pool.length)]);
  if (!friendly) {
    const slots = shuffledPinKeys().map(Number).slice(0, 5);
    slots.forEach((slot) => {
      chars[slot] = tricky[Math.floor(Math.random() * tricky.length)];
    });
  }
  return chars.join("");
}

function normalizeCouponInput(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, TINY_COUPON_LENGTH);
}

function formatCouponCode(code) {
  return code.replace(/(.{4})(?=.)/g, "$1-");
}

function formatPhoneDigits(digits, placeholder = "") {
  const padded = placeholder ? digits.padEnd(11, placeholder) : digits;
  return [padded.slice(0, 3), padded.slice(3, 7), padded.slice(7, 11)].filter(Boolean).join("-");
}

function receiptTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function randomApprovalNumber() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function renderTinyStation(root, mode) {
  const isKind = mode === "kind";
  const isHard = mode === "hard";
  const picks = {};
  const hardPay = {
    upsellIndex: -1,
    giftStage: "none",
    remainder: null,
    pinValue: "",
    pinDone: false,
    pinKeys: shuffledPinKeys()
  };
  const hardware = {
    card: false,
    receipt: false
  };
  // 쿠폰: 휴대폰 메시지 앱에서 쿠폰 번호를 찾아 키오스크에 입력합니다. 개선 모드는 문자가 바로 열려 있습니다.
  const coupon = {
    open: false,
    stage: isKind ? "sms" : "locked",
    code: randomCouponCode(isKind),
    expiredCode: randomCouponCode(),
    value: "",
    done: false
  };
  // 적립: 010이 미리 입력된 번호 키패드 + 작은 필수 동의 체크.
  const phoneReward = {
    open: false,
    digits: "010",
    consent: false,
    done: false,
    points: 0
  };
  // 결제 마무리: approved(영수증 출력 여부 선택) → printing(영수증 출력 중) / fallback(KioskFX 없을 때 출력구 누르기)
  const pay = {
    stage: "none",
    approval: randomApprovalNumber(),
    time: ""
  };
  let flowModalMessage = "";
  let flowModalNote = "";
  let flowModalNext = "";
  let focusGroupAfterModal = "";
  let freshCart = null;
  let busy = false;
  let disposed = false;
  const baseOrder = [{ label: "치즈버거 세트", price: 7200 }];
  const phoneApps = [
    { id: "photos", label: "사진", desc: "앨범", initial: "P", imageKey: "photo-app" },
    { id: "map", label: "지도", desc: "길찾기", initial: "길", imageKey: "map-app" },
    { id: "bank", label: "뱅크", desc: "계좌", initial: "B", imageKey: "bank-app" },
    { id: "jammanbo-app", label: "JAMMANBO 멤버십", desc: "멤버십", initial: "J", imageKey: "jammanbo" },
    { id: "weather", label: "날씨", desc: "예보", initial: "W", imageKey: "weather-app" },
    { id: "snu-app", label: "SNU 클래스", desc: "수강 인증", initial: "S", imageKey: "snu-class" },
    { id: "alpaco-vip-app", label: "ALPACO VIP", desc: "할인 바코드", initial: "A", imageKey: "alpaco-vip" },
    { id: "messages", label: "메시지", desc: "대화", initial: "M", imageKey: "message-app", correct: true },
    { id: "settings", label: "설정", desc: "기기", initial: "설", imageKey: "settings-app" },
    { id: "mail", label: "메일", desc: "편지함", initial: "@", imageKey: "mail-app" },
    { id: "calendar", label: "캘린더", desc: "일정", initial: "C", imageKey: "calendar-app" },
    { id: "music", label: "뮤직", desc: "재생", initial: "♪", imageKey: "music-app" }
  ];
  const groups = isKind
    ? [
        {
          key: "discount",
          title: "① 할인 쿠폰",
          correct: "coupon-code",
          items: [
            { id: "coupon-code", label: "문자 쿠폰 번호 입력", desc: "휴대폰 문자 보기", price: -TINY_COUPON_DISCOUNT, noArt: true },
            { id: "none-discount", label: "할인 없음", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "reward",
          title: "② 포인트 적립",
          correct: "phone-reward",
          items: [
            { id: "phone-reward", label: "휴대폰 번호로 적립", desc: "번호 입력", price: 0, noArt: true },
            { id: "none-reward", label: "적립 안 함", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "payment",
          title: "③ 결제수단",
          correct: "card",
          items: [
            { id: "card", label: "카드 결제", desc: "카드 투입구 사용", price: 0, noArt: true },
            { id: "easy-pay", label: "간편결제", desc: "앱으로 결제", price: 0, noArt: true }
          ]
        }
      ]
    : [
        {
          key: "discount",
          title: "STEP 1 할인·쿠폰",
          correct: "coupon-code",
          items: [
            { id: "alpaco-vip", label: "ALPACO VIP", desc: "VIP 할인", price: -700 },
            { id: "jammanbo", label: "JAMMANBO 멤버십", desc: "앱 멤버십", price: -500 },
            { id: "coupon-code", label: "쿠폰 번호 입력", desc: "문자 쿠폰", price: -TINY_COUPON_DISCOUNT, noArt: true },
            { id: "none-discount", label: "할인 없음", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "reward",
          title: "STEP 2 포인트 적립",
          correct: "phone-reward",
          items: [
            { id: "barcode-reward", label: "멤버십 바코드", desc: "스캔", price: 0, noArt: true },
            { id: "snu-reward", label: "SNU 클래스 적립", desc: "학생번호 입력", price: 0, noArt: true },
            { id: "phone-reward", label: "휴대폰 번호", desc: "번호 입력", price: 0, noArt: true },
            { id: "none-reward", label: "적립 안 함", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "payment",
          title: "STEP 3 결제수단",
          correct: isHard ? "gift-card" : "card",
          items: [
            { id: "n-pay", label: "내일도페이", desc: "앱 결제", price: 0, noArt: true },
            { id: "app-card", label: "앱카드", desc: "QR/바코드", price: 0, noArt: true },
            { id: "kakao-pay", label: "코코아페이", desc: "앱 결제", price: 0, noArt: true },
            { id: "payco", label: "콩콩페이", desc: "간편결제", price: 0, noArt: true },
            { id: "card", label: "카드 결제", desc: "IC페이", price: 0, noArt: true },
            { id: "zero-pay", label: "동네페이", desc: "간편결제", price: 0, noArt: true },
            { id: "apple-pay", label: "Orange Pay", desc: "휴대폰 태그", price: 0, noArt: true },
            { id: "kb-pay", label: "별별페이", desc: "앱 결제", price: 0, noArt: true },
            { id: "coupon-pay", label: "쿠폰사용", desc: "쿠폰 번호", price: 0, noArt: true },
            { id: "gift-card", label: "모바일 상품권", desc: "바코드 스캔", price: 0, noArt: true }
          ]
        }
      ];

  function phoneAppIconMarkup(app) {
    const imageSrc = app.imageKey ? productImages[app.imageKey] : "";
    if (imageSrc) {
      return `
        <span class="phone-app-icon phone-app-image-icon phone-app-image-${app.imageKey}" aria-hidden="true">
          <img src="${imageSrc}" alt="" loading="lazy">
        </span>
      `;
    }
    return `<span class="phone-app-icon">${app.initial}</span>`;
  }

  // 휴대폰 화면: 잠금 → 홈 화면(앱 찾기) → 메시지 앱(문자 쿠폰). 개선 모드는 문자가 바로 열려 있습니다.
  function couponPhoneScreen() {
    if (coupon.stage === "locked") {
      return `
        <div class="phone-lock-screen coupon-lock-screen">
          <span class="phone-clock">10:24</span>
          <span class="lock-notification"><b>새 메시지 ${isHard ? 3 : 2}개</b><small>내용을 보려면 잠금을 해제하세요</small></span>
          <button class="phone-primary-button" type="button" data-coupon-phone="wake">스마트폰 켜기</button>
        </div>
      `;
    }
    if (coupon.stage === "apps") {
      return `
        <span class="phone-title">홈 화면</span>
        <div class="phone-app-grid coupon-app-grid">
          ${phoneApps
            .map(
              (app) => `
                <button class="phone-app-button" type="button" data-coupon-app="${app.id}">
                  ${phoneAppIconMarkup(app)}
                  <b>${app.label}</b>
                </button>
              `
            )
            .join("")}
        </div>
      `;
    }
    const messages = [
      isKind
        ? null
        : { from: "택배 알림", time: "오전 9:12", text: `[Web발신] 고객님의 택배가 배송을 시작했습니다. 운송장 ${isHard ? "5102-8831-0094" : "6620-1180-4471"}` },
      isHard ? { from: "모두페이", time: "어제", text: "[Web발신] (사용기간 만료) 500원 할인 쿠폰", code: coupon.expiredCode, expired: true } : null,
      { from: "모두페이", time: "방금", text: `[Web발신] ${formatWon(TINY_COUPON_DISCOUNT)} 할인 쿠폰이 도착했어요! 오늘 자정까지 사용하세요.`, code: coupon.code }
    ].filter(Boolean);
    return `
      <span class="phone-title">메시지</span>
      <div class="sms-thread">
        ${messages
          .map(
            (message) => `
              <div class="sms-bubble ${message.code ? "is-coupon" : ""} ${message.expired ? "is-expired" : ""}">
                <span class="sms-sender"><b>${message.from}</b><small>${message.time}</small></span>
                <p>${message.text}</p>
                ${message.code ? `<span class="sms-code-label">쿠폰번호</span><strong class="sms-code">${formatCouponCode(message.code)}</strong>` : ""}
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function couponPanel() {
    const phoneCopy = {
      locked: "① 스마트폰을 켜세요.",
      apps: "② 쿠폰이 온 메시지 앱을 찾으세요.",
      sms: isKind ? "문자에 온 쿠폰 번호를 보고 입력하세요." : "③ 문자의 쿠폰 번호를 키오스크에 입력하세요."
    };
    const keyRows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    return `
      <div class="coupon-focus-flow">
        <section class="coupon-entry-panel ${isKind ? "is-friendly" : ""}" aria-label="쿠폰 번호 입력">
          <div class="coupon-phone-side">
            <p class="coupon-step-copy">${phoneCopy[coupon.stage]}</p>
            <div class="phone-mock coupon-phone-mock" aria-label="스마트폰 화면">
              <div class="phone-speaker" aria-hidden="true"></div>
              <div class="phone-screen">${couponPhoneScreen()}</div>
            </div>
          </div>
          <div class="coupon-kiosk-side">
            <h4>쿠폰 번호 입력</h4>
            <p>${isKind ? "하이픈(-)은 자동으로 들어가요. 영어 대문자와 숫자 12자리예요." : `쿠폰 번호 ${TINY_COUPON_LENGTH}자리를 입력하세요.`}</p>
            <input class="coupon-input" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="14" placeholder="XXXX-XXXX-XXXX" value="${formatCouponCode(coupon.value)}" aria-label="쿠폰 번호" data-coupon-input="true" />
            <div class="coupon-keyboard" aria-label="쿠폰 번호 키보드">
              ${keyRows
                .map(
                  (row) => `
                    <div class="coupon-key-row">
                      ${[...row].map((key) => `<button class="coupon-key" type="button" data-coupon-key="${key}">${key}</button>`).join("")}
                      ${row === "ZXCVBNM" ? `<button class="coupon-key coupon-key-wide" type="button" data-coupon-key="back" aria-label="한 글자 지우기">지움</button>` : ""}
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="coupon-actions">
              <button class="tiny-secondary-button" type="button" data-coupon-cancel="true">이전</button>
              <button class="phone-primary-button" type="button" data-coupon-submit="true">쿠폰 적용</button>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function phoneRewardPanel() {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
    const keyLabel = { clear: "전체 지움", back: "지움" };
    return `
      <div class="phone-reward-flow">
        <section class="phone-reward-panel ${isKind ? "is-friendly" : ""}" aria-label="휴대폰 번호 적립">
          <div class="phone-reward-head">
            <h4>휴대폰 번호로 포인트 적립</h4>
            <p>${isKind ? "미션에 나온 휴대폰 번호를 누르고, 아래 동의 칸에 꼭 체크하세요." : "회원 휴대폰 번호를 입력하세요."}</p>
          </div>
          <output class="phone-number-display" data-phone-display="true">${formatPhoneDigits(phoneReward.digits, "_")}</output>
          <div class="phone-keypad">
            ${keys
              .map(
                (key) =>
                  `<button class="phone-key ${keyLabel[key] ? "phone-key-sub" : ""}" type="button" data-phone-key="${key}">${keyLabel[key] || key}</button>`
              )
              .join("")}
          </div>
          <label class="consent-row ${isKind ? "is-friendly" : ""}">
            <input type="checkbox" data-consent="true" ${phoneReward.consent ? "checked" : ""} />
            <span>${isKind ? "<b>필수</b> 개인정보 수집·이용에 동의합니다" : "개인정보 수집·이용 동의(필수)"}</span>
            ${isKind ? "" : `<em>[보기]</em>`}
          </label>
          <div class="phone-reward-actions">
            <button class="tiny-secondary-button" type="button" data-phone-cancel="true">이전</button>
            <button class="phone-primary-button" type="button" data-phone-submit="true">적립하기</button>
          </div>
        </section>
      </div>
    `;
  }

  // 카드 승인 뒤 실제 키오스크처럼 영수증 출력 여부를 묻습니다. 어려운 모드는 '출력 안 함'이 더 크게 보입니다.
  function receiptPanel() {
    const printing = pay.stage === "printing";
    const paid = paidCardAmount();
    return `
      <div class="receipt-choice-flow">
        <section class="receipt-choice-panel ${isKind ? "is-friendly" : ""} ${printing ? "is-printing" : ""}" aria-label="결제 완료">
          <span class="receipt-choice-check" aria-hidden="true">✓</span>
          <h4>${printing ? "영수증이 나오고 있어요" : "결제가 완료되었습니다"}</h4>
          <p class="receipt-choice-amount">카드 결제 ${formatWon(paid)} · 승인번호 ${pay.approval}</p>
          ${
            printing
              ? `<p class="tiny-next-step">다음: 기계 아래 영수증 출력구에서 나온 영수증을 뜯어 가져가세요.</p>`
              : `
                <p class="receipt-choice-question">영수증을 출력할까요?</p>
                <div class="receipt-choice-actions">
                  <button class="receipt-skip-button" type="button" data-receipt-choice="skip">출력 안 함</button>
                  <button class="receipt-print-button" type="button" data-receipt-choice="print">영수증 출력</button>
                </div>
                ${isKind ? `<p class="tiny-next-step">다음: '영수증 출력'을 누르고 기계 아래에서 영수증을 받으세요.</p>` : ""}
              `
          }
        </section>
      </div>
    `;
  }

  function kindChecklist() {
    const steps = ["문자 쿠폰 번호 입력", "휴대폰 번호로 적립", "카드 결제 고르기", "카드 넣기", "영수증 받기"];
    const done = [Boolean(picks.discount), Boolean(picks.reward), Boolean(picks.payment), hardware.card, hardware.receipt];
    const current = done.indexOf(false);
    return `
      <ol class="tiny-checklist" aria-label="결제 순서">
        ${steps
          .map(
            (label, index) => `
              <li class="${done[index] ? "is-done" : ""} ${index === current ? "is-current" : ""}">
                <b>${done[index] ? "✓" : "①②③④⑤"[index]}</b><span>${label}</span>
              </li>
            `
          )
          .join("")}
      </ol>
    `;
  }

  function paymentHardwarePanel(optionReady) {
    const barcodeActive = isHard && hardPay.giftStage === "scan";
    const cardDragActive = optionReady && !barcodeActive && !hardware.card;
    const hint = barcodeActive
      ? "모바일 상품권이 열린 스마트폰을 바코드 인식하는 곳으로 끌어다 놓으세요."
      : cardDragActive
        ? `결제 카드를 카드 넣는 곳으로 끌어다 놓으세요.${isKind ? "" : `<span class="tiny-next-step">다음: 카드를 기계 아래 카드 리더기에 넣으세요.</span>`}`
        : "";

    return `
      <section class="payment-hardware ${optionReady ? "is-ready" : ""} ${barcodeActive ? "is-barcode-stage" : ""} ${cardDragActive ? "is-card-stage" : ""}">
        <h4>키오스크 앞면</h4>
        ${hint ? `<p class="payment-hardware-hint">${hint}</p>` : ""}
        ${
          cardDragActive
            ? `
              <div class="card-drag-zone">
                <div class="payment-card-hand" data-draggable-card="true" data-card-anchor-x="0.5" data-card-anchor-y="0.5" aria-label="결제 카드를 카드 넣는 곳으로 끌어다 놓기">
                  <img src="${productImages["payment-card-hand"]}" alt="" draggable="false">
                </div>
              </div>
            `
            : ""
        }
        <div class="hardware-actions">
          <button class="hardware-button barcode-target ${hardware.card ? "is-done" : ""}" type="button" data-hardware="card" data-barcode-target="card" data-card-target="slot" aria-label="카드 넣는 곳">
            <span class="hardware-device-group">
              <span class="hardware-image hardware-card-slot" aria-hidden="true">
                <img src="${productImages["hardware-card-slot"]}" alt="" loading="lazy">
              </span>
              <b>카드 넣는 곳</b>
            </span>
          </button>
          <button class="hardware-button barcode-target ${hardware.receipt ? "is-done" : ""}" type="button" data-hardware="receipt" data-barcode-target="receipt" aria-label="영수증과 번호표 챙기기">
            <span class="hardware-device-group">
              <span class="hardware-image hardware-receipt" aria-hidden="true">
                <img src="${productImages["hardware-receipt"]}" alt="" loading="lazy">
              </span>
              <b>영수증/번호표<br>챙기기</b>
            </span>
          </button>
          <button class="hardware-button barcode-target" type="button" data-barcode-target="scanner" aria-label="바코드 인식하는 곳">
            <span class="hardware-device-group">
              <span class="hardware-image hardware-barcode" aria-hidden="true">
                <img src="${productImages["hardware-barcode"]}" alt="" loading="lazy">
              </span>
              <b>바코드 인식하는<br>곳</b>
            </span>
          </button>
        </div>
      </section>
    `;
  }

  function upsellPanel() {
    const offer = hardUpsellOffers[hardPay.upsellIndex];
    const yesButton = `<button class="upsell-yes-button" type="button" data-upsell-answer="yes">${offer.yes}</button>`;
    const noButton = `<button class="upsell-no-button" type="button" data-upsell-answer="no">${offer.no}</button>`;
    return `
      <div class="upsell-focus-flow">
        <section class="upsell-popup is-${offer.layout}" role="dialog" aria-modal="true" aria-label="${offer.title}">
          ${offer.layout === "corner" ? `<div class="upsell-corner-row">${noButton}</div>` : ""}
          <span class="upsell-badge">오늘만 특가</span>
          ${offer.imageKey ? productImageMarkup(productImages[offer.imageKey], "upsell-image") : `<span class="upsell-coin" aria-hidden="true">500</span>`}
          <h4>${offer.title}</h4>
          <p>${offer.desc}</p>
          <div class="upsell-actions">
            ${offer.layout === "above" ? noButton : ""}
            ${yesButton}
            ${offer.layout === "below" ? noButton : ""}
          </div>
          <small class="upsell-progress">${hardPay.upsellIndex + 1} / ${hardUpsellOffers.length}</small>
        </section>
      </div>
    `;
  }

  function giftScanPanel() {
    return `
      <div class="payment-flow scan-payment-flow">
        <section class="dense-section payment-section scan-payment-section">
          <h4>모바일 상품권 바코드 인식</h4>
          <p class="scan-payment-hint">모바일 상품권이 열린 스마트폰을 아래 키오스크 앞면의 바코드 인식하는 곳으로 끌어다 대세요.</p>
          <div class="scan-payment-layout">
            <div class="phone-mock scan-phone-mock gift-phone-mock" aria-label="드래그 가능한 모바일 상품권 스마트폰" data-draggable-barcode="gift">
              <div class="phone-speaker" aria-hidden="true"></div>
              <div class="phone-screen">
                <span class="phone-title">모바일 상품권</span>
                <div class="membership-card gift-card-ticket">
                  <b>모두버거 금액권</b>
                  <small>이 스마트폰을 바코드 인식하는 곳으로 끌어다 대세요.</small>
                  <span class="barcode-visual" aria-label="모바일 상품권 바코드"></span>
                  <strong>GIFT-0918-5300</strong>
                </div>
              </div>
            </div>
            ${paymentHardwarePanel(false)}
          </div>
        </section>
      </div>
    `;
  }

  function remainderPanel() {
    const paymentGroup = groups.find((item) => item.key === "payment");
    const remainderItems = paymentGroup.items.filter((item) => item.id !== "gift-card");
    return `
      <div class="payment-flow">
        <section class="dense-section payment-section remainder-section" data-payment-group="remainder">
          <h4>STEP 4 남은 금액 결제수단</h4>
          <p class="remainder-note">상품권 사용 후 결제할 금액이 남아 있습니다. 남은 금액: ${formatWon(remainderAmount())}</p>
          <div class="product-grid payment-options">
            ${remainderItems
              .map((item) =>
                productCard(item, `data-remainder-id="${item.id}"`, hardPay.remainder?.id === item.id ? "is-picked" : "")
              )
              .join("")}
          </div>
        </section>
      </div>
    `;
  }

  function pinPadPanel() {
    const dots = Array.from({ length: 4 }, (_, index) => `<span class="${index < hardPay.pinValue.length ? "is-filled" : ""}"></span>`).join("");
    const digitButtons = hardPay.pinKeys
      .map((key) => `<button class="pin-key" type="button" data-pin-key="${key}">${key}</button>`)
      .join("");
    return `
      <div class="pin-focus-flow">
        <section class="pin-pad-panel" aria-label="카드 비밀번호 보안 키패드">
          <div class="pin-pad-head">
            ${productImageMarkup(productImages["hardware-card-slot"], "pin-card-image")}
            <span>
              <h4>카드 비밀번호 4자리</h4>
              <small>보안을 위해 숫자 위치가 누를 때마다 바뀝니다.</small>
            </span>
          </div>
          <div class="pin-dots" aria-label="입력한 자릿수 ${hardPay.pinValue.length}">${dots}</div>
          <div class="pin-grid">
            ${digitButtons}
            <button class="pin-key pin-key-sub" type="button" data-pin-action="clear">지우기</button>
            <button class="pin-key pin-key-ok" type="button" data-pin-action="submit">확인</button>
          </div>
        </section>
      </div>
    `;
  }

  function stepModal() {
    return `
      <div class="flow-modal-backdrop" role="dialog" aria-modal="true" aria-label="${flowModalMessage}">
        <div class="flow-modal tiny-step-modal ${flowModalNote ? "hard-note-modal" : ""}">
          <h4>${flowModalMessage}</h4>
          ${flowModalNote ? `<p>${flowModalNote}</p>` : ""}
          ${flowModalNext ? `<p class="tiny-next-step">${flowModalNext}</p>` : ""}
          <button class="phone-primary-button" type="button" data-flow-modal-close="true">확인</button>
        </div>
      </div>
    `;
  }

  function openModal(message, note = "", next = "", focusGroup = "") {
    flowModalMessage = message;
    flowModalNote = note;
    flowModalNext = next;
    focusGroupAfterModal = focusGroup;
  }

  function orderSubtotal() {
    return baseOrder.reduce((sum, item) => sum + item.price, 0) + (picks.discount?.price || 0);
  }

  function remainderAmount() {
    return orderSubtotal() - HARD_GIFT_BALANCE;
  }

  function paidCardAmount() {
    return isHard ? remainderAmount() : orderSubtotal();
  }

  // KioskFX(kiosk-effects.js)가 없거나 일부 기능만 있어도 흐름이 멈추지 않도록 항상 감싸서 부릅니다.
  function fx(name, ...args) {
    const method = window.KioskFX?.[name];
    if (typeof method !== "function") return Promise.resolve(null);
    try {
      return Promise.resolve(method.apply(window.KioskFX, args)).catch(() => null);
    } catch (error) {
      return Promise.resolve(null);
    }
  }

  function kioskScreen() {
    return root.querySelector(".kiosk-device-screen") || root;
  }

  function cardReader() {
    return root.querySelector(".hw-card-reader");
  }

  // 효과가 진행되는 동안에는 추가 클릭·드래그를 막아 단계를 건너뛰지 못하게 합니다.
  async function runBusy(task) {
    if (busy || disposed) return;
    busy = true;
    root.classList.add("is-kiosk-busy");
    try {
      await task();
    } finally {
      busy = false;
      root.classList.remove("is-kiosk-busy");
    }
  }

  function failWith(message, element) {
    fx("sound", "error");
    if (element) fx("shake", element);
    recordBarrier(message);
  }

  function applyGiftCard() {
    hardPay.giftStage = "short";
    openModal(
      "상품권 잔액이 부족합니다",
      `상품권 ${formatWon(HARD_GIFT_BALANCE)}을 사용했어요. 남은 ${formatWon(remainderAmount())}은 다른 결제수단으로 이어서 결제해 주세요.`,
      "다음: STEP 4에서 남은 금액을 낼 카드 결제를 고르세요."
    );
    draw();
  }

  function applyCoupon() {
    const discountGroup = groups.find((item) => item.key === "discount");
    const couponItem = discountGroup.items.find((item) => item.id === "coupon-code");
    picks.discount = { ...couponItem, label: "문자 쿠폰 할인" };
    coupon.done = true;
    coupon.open = false;
    freshCart = { label: picks.discount.label, chip: `-${formatWon(TINY_COUPON_DISCOUNT)}`, tone: "discount" };
    openModal(
      "쿠폰 할인이 적용되었습니다",
      `주문 금액에서 ${formatWon(TINY_COUPON_DISCOUNT)}이 빠졌어요.`,
      isKind ? "다음: ② 포인트 적립에서 '휴대폰 번호로 적립'을 고르세요." : "다음: STEP 2에서 적립 방법을 고르세요.",
      "reward"
    );
    draw();
  }

  function applyPhoneReward() {
    const rewardGroup = groups.find((item) => item.key === "reward");
    const rewardItem = rewardGroup.items.find((item) => item.id === "phone-reward");
    phoneReward.points = Math.floor(orderSubtotal() * 0.01);
    picks.reward = { ...rewardItem, label: `포인트 적립 +${phoneReward.points}P` };
    phoneReward.done = true;
    phoneReward.open = false;
    freshCart = { label: picks.reward.label, chip: `+${phoneReward.points}P 적립`, tone: "points" };
    openModal(
      "포인트가 적립되었습니다",
      `010-****-${TINY_REWARD_PHONE.slice(7)} 회원님께 ${phoneReward.points}P가 적립돼요.`,
      isKind
        ? "다음: ③ 결제수단에서 '카드 결제'를 고르세요."
        : isHard
          ? "다음: STEP 3에서 미션에 나온 결제수단을 고르세요."
          : "다음: STEP 3에서 카드 결제를 고르세요.",
      "payment"
    );
    draw();
  }

  function pushCouponKey(key) {
    const input = root.querySelector("[data-coupon-input]");
    if (!input) return;
    const current = normalizeCouponInput(input.value);
    coupon.value = key === "back" ? current.slice(0, -1) : normalizeCouponInput(`${current}${key}`);
    input.value = formatCouponCode(coupon.value);
  }

  function submitCoupon() {
    runBusy(async () => {
      const input = root.querySelector("[data-coupon-input]");
      const panel = root.querySelector(".coupon-kiosk-side");
      const value = normalizeCouponInput(input?.value);
      coupon.value = value;
      if (value.length < TINY_COUPON_LENGTH) {
        failWith(`쿠폰 번호 ${TINY_COUPON_LENGTH}자리를 모두 입력해야 합니다. 휴대폰 문자에서 쿠폰 번호를 찾아보세요.`, panel);
        return;
      }
      if (isHard && value === coupon.expiredCode) {
        failWith("사용 기간이 지난 쿠폰입니다. 가장 최근에 받은 문자의 쿠폰 번호를 확인해야 합니다.", panel);
        return;
      }
      if (value !== coupon.code) {
        failWith("쿠폰 번호가 맞지 않습니다. 숫자 0과 영어 O, 숫자 1과 영어 I, 숫자 5와 영어 S처럼 닮은 글자를 다시 확인해 보세요.", panel);
        return;
      }
      await fx("processing", kioskScreen(), { title: "쿠폰 확인 중", detail: "쿠폰 번호를 확인하고 있어요", ms: isKind ? 700 : 1000 });
      if (disposed) return;
      fx("sound", "beep");
      applyCoupon();
    });
  }

  function pushPhoneKey(key) {
    const keyButton = root.querySelector(`[data-phone-key="${key}"]`);
    if (keyButton) fx("pressKey", keyButton);
    if (key === "clear") phoneReward.digits = "010";
    else if (key === "back") phoneReward.digits = phoneReward.digits.length > 3 ? phoneReward.digits.slice(0, -1) : phoneReward.digits;
    else if (/^[0-9]$/.test(key) && phoneReward.digits.length < 11) phoneReward.digits += key;
    const display = root.querySelector("[data-phone-display]");
    if (display) display.textContent = formatPhoneDigits(phoneReward.digits, "_");
  }

  function submitPhoneReward() {
    runBusy(async () => {
      const display = root.querySelector("[data-phone-display]");
      const consentBox = root.querySelector("[data-consent]");
      phoneReward.consent = Boolean(consentBox?.checked);
      if (phoneReward.digits.length < 11) {
        failWith("휴대폰 번호 11자리를 모두 입력해야 적립할 수 있습니다.", display);
        return;
      }
      if (phoneReward.digits !== TINY_REWARD_PHONE) {
        failWith(`미션에 나온 휴대폰 번호(${formatPhoneDigits(TINY_REWARD_PHONE)})와 다릅니다. 숫자를 다시 확인해 보세요.`, display);
        return;
      }
      if (!phoneReward.consent) {
        failWith("작은 글씨의 '개인정보 수집·이용 동의(필수)'에 체크해야 적립할 수 있습니다.", root.querySelector(".consent-row"));
        return;
      }
      await fx("processing", kioskScreen(), { title: "포인트 적립 중", detail: "회원 정보를 확인하고 있어요", ms: isKind ? 700 : 1000 });
      if (disposed) return;
      fx("sound", "beep");
      applyPhoneReward();
    });
  }

  // 카드 승인(어려운 모드는 비밀번호 확인 뒤) → 영수증 출력 여부 선택 화면
  async function approveCardPayment() {
    await fx("processing", kioskScreen(), { title: "결제 중입니다", detail: "카드를 빼지 마세요", ms: isKind ? 1200 : 1600 });
    if (disposed) return;
    await fx("approve", kioskScreen(), { title: "승인되었습니다", detail: `카드 ${formatWon(paidCardAmount())} 결제 완료` });
    if (disposed) return;
    hardware.card = true;
    if (isHard) hardPay.pinDone = true;
    pay.stage = "approved";
    pay.time = receiptTimestamp();
    draw();
    fx("readerState", cardReader(), "ok");
  }

  function receiptData() {
    const discountAmount = Math.abs(picks.discount?.price || 0);
    const cardLabel = "신용카드(IC) 일시불";
    return {
      store: "모두페이",
      title: "영수증",
      items: baseOrder.map((item) => ({ label: item.label, price: item.price })),
      discounts: discountAmount ? [{ label: picks.discount.label, amount: discountAmount }] : [],
      payments: isHard
        ? [
            { label: "모바일 상품권", amount: HARD_GIFT_BALANCE },
            { label: cardLabel, amount: remainderAmount() }
          ]
        : [{ label: cardLabel, amount: orderSubtotal() }],
      total: orderSubtotal(),
      approval: pay.approval,
      time: pay.time || receiptTimestamp(),
      footer: `포인트 적립 +${phoneReward.points}P (010-****-${TINY_REWARD_PHONE.slice(7)})\n이용해 주셔서 감사합니다`
    };
  }

  function finishPayment() {
    hardware.receipt = true;
    if (isHard) {
      completeStation("추가 주문 거절, 상품권 잔액 부족, 바뀌는 보안 키패드까지 결제 절차를 끝까지 해냈습니다.");
      showCompletion(root, "원하지 않는 추가 주문 유도와 나눠 내기, 보안 키패드까지 모두 통과했습니다. 잠시 뒤 키오스크 선택 화면으로 돌아갑니다.", {
        autoReturn: true,
        kicker: "최종 미션 해결",
        title: "더 어려운 모드 완료"
      });
      return;
    }
    completeStation("결제 단계가 많고 기기 조작 위치가 흩어져 있으면 마지막까지 놓치기 쉽습니다.");
    showCompletion(root, "결제 화면은 할인, 적립, 결제, 카드 투입, 영수증 수령을 한 단계씩 명확하게 안내해야 합니다.");
  }

  // 영수증 출력: KioskFX.printReceipt가 있으면 출력구에서 종이가 나오고, 학생이 뜯어 가면 완료됩니다.
  async function printReceipt() {
    if (pay.stage !== "approved") return;
    if (typeof window.KioskFX?.printReceipt !== "function") {
      pay.stage = "fallback";
      openModal("영수증을 챙겨주세요", "", "다음: 기계 아래 영수증 출력구를 눌러 영수증을 가져가세요.");
      draw();
      return;
    }
    pay.stage = "printing";
    draw();
    await fx("printReceipt", root.querySelector(".hw-receipt-printer"), receiptData());
    if (disposed || pay.stage !== "printing") return;
    finishPayment();
  }

  function setupBarcodeDrag() {
    const barcode = root.querySelector("[data-draggable-barcode]");
    if (!barcode) return;

    let activeTarget = null;
    const setActiveTarget = (target) => {
      if (activeTarget && activeTarget !== target) {
        activeTarget.classList.remove("is-targeted", "is-drop-correct", "is-drop-wrong");
      }
      activeTarget = target;
      if (activeTarget) {
        activeTarget.classList.add("is-targeted");
      }
    };

    barcode.addEventListener("pointerdown", (event) => {
      if (typeof event.button === "number" && event.button !== 0) return;
      event.preventDefault();

      let lastX = event.clientX;
      let lastY = event.clientY;
      const sourceRect = barcode.getBoundingClientRect();
      const ghostWidth = Math.max(145, Math.min(sourceRect.width * 0.5, 200, window.innerWidth * 0.38));
      const dragGhost = barcode.cloneNode(true);
      dragGhost.removeAttribute("data-draggable-barcode");
      dragGhost.classList.add("barcode-drag-ghost");
      dragGhost.style.width = `${ghostWidth}px`;
      dragGhost.style.maxWidth = "none";
      document.body.appendChild(dragGhost);
      barcode.classList.add("is-drag-source");
      document.body.classList.add("is-dragging-barcode");

      const moveGhost = (x, y) => {
        dragGhost.style.left = `${x}px`;
        dragGhost.style.top = `${y}px`;
      };

      const onMove = (moveEvent) => {
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
        moveGhost(lastX, lastY);
        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        setActiveTarget(target);
      };

      const onEnd = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);

        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        dragGhost.remove();
        barcode.classList.remove("is-drag-source");
        document.body.classList.remove("is-dragging-barcode");
        setActiveTarget(null);

        if (!target) {
          failWith("바코드를 키오스크의 인식부까지 직접 가져다대야 합니다.");
          return;
        }
        if (target.dataset.barcodeTarget !== "scanner") {
          failWith("카드 투입구나 영수증 출력구가 아니라 바코드 인식하는 곳에 대야 합니다.", target);
          return;
        }
        runBusy(async () => {
          await fx("scan", target);
          if (disposed) return;
          await fx("processing", kioskScreen(), { title: "잔액 조회 중", detail: "모바일 상품권 잔액을 확인하고 있어요", ms: 1200 });
          if (disposed) return;
          fx("sound", "error");
          applyGiftCard();
        });
      };

      moveGhost(lastX, lastY);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    });
  }

  function setupCardDrag() {
    const card = root.querySelector("[data-draggable-card]");
    if (!card) return;

    let activeTarget = null;
    const setActiveTarget = (target) => {
      if (activeTarget && activeTarget !== target) {
        activeTarget.classList.remove("is-card-targeted", "is-drop-correct", "is-drop-wrong");
      }
      activeTarget = target;
      if (activeTarget) {
        activeTarget.classList.add("is-card-targeted");
      }
    };

    card.addEventListener("pointerdown", (event) => {
      if (typeof event.button === "number" && event.button !== 0) return;
      event.preventDefault();

      const anchorX = Number.parseFloat(card.dataset.cardAnchorX || "0.35");
      const anchorY = Number.parseFloat(card.dataset.cardAnchorY || "0.26");
      const sourceRect = card.getBoundingClientRect();
      const ghostScale = 0.58;
      const ghostWidth = Math.max(140, Math.min(sourceRect.width * ghostScale, 260, window.innerWidth * 0.42));
      const ghostRatio = ghostWidth / Math.max(sourceRect.width, 1);
      const ghostHeight = sourceRect.height * ghostRatio;
      let lastX = event.clientX;
      let lastY = event.clientY;
      const dragGhost = card.cloneNode(true);
      dragGhost.removeAttribute("data-draggable-card");
      dragGhost.classList.add("card-drag-ghost");
      dragGhost.style.width = `${ghostWidth}px`;
      dragGhost.style.height = `${ghostHeight}px`;
      document.body.appendChild(dragGhost);
      card.classList.add("is-drag-source");
      document.body.classList.add("is-dragging-card");

      const moveGhost = (x, y) => {
        dragGhost.style.left = `${x - ghostWidth * anchorX}px`;
        dragGhost.style.top = `${y - ghostHeight * anchorY}px`;
      };

      const onMove = (moveEvent) => {
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
        moveGhost(lastX, lastY);
        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        setActiveTarget(target);
      };

      const onEnd = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);

        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        dragGhost.remove();
        card.classList.remove("is-drag-source");
        document.body.classList.remove("is-dragging-card");
        setActiveTarget(null);

        if (!target || target.dataset.cardTarget !== "slot") {
          failWith("카드의 가운데 부분을 카드 넣는 곳까지 직접 가져다 놓아야 합니다.", target);
          return;
        }

        // 화면의 카드 넣는 곳에 놓아도 실제 기계 아래 카드 리더기로 카드가 들어갑니다.
        card.classList.add("is-inserted");
        runBusy(async () => {
          await fx("insertCard", cardReader());
          if (disposed) return;
          fx("readerState", cardReader(), "busy");
          if (isHard) {
            hardware.card = true;
            hardPay.pinValue = "";
            hardPay.pinKeys = shuffledPinKeys();
            draw();
            fx("readerState", cardReader(), "busy");
            return;
          }
          await approveCardPayment();
        });
      };

      moveGhost(lastX, lastY);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    });
  }

  function draw(options = {}) {
    const scrollState = options.preserveScroll ? captureKioskScroll(root) : null;
    const selectedOptions = selectedCartItems(picks);
    const giftUsed = isHard && ["short", "done"].includes(hardPay.giftStage);
    const hardCartItems = [
      giftUsed ? { label: "모바일 상품권 사용", price: -HARD_GIFT_BALANCE } : null,
      hardPay.remainder ? { label: `남은 금액 ${hardPay.remainder.label}`, price: 0 } : null
    ].filter(Boolean);
    const cartItems = [...baseOrder, ...selectedOptions, ...hardCartItems];
    const optionReady = selectedOptions.length === groups.length;
    const readyForCard = optionReady && (!isHard || hardPay.giftStage === "done");
    const doneCount = isHard
      ? (picks.discount ? 1 : 0) + (picks.reward ? 1 : 0) + (giftUsed ? 1 : 0) + (hardware.card ? 1 : 0) + (hardPay.pinDone ? 1 : 0) + (hardware.receipt ? 1 : 0)
      : selectedOptions.length + (hardware.card ? 1 : 0) + (hardware.receipt ? 1 : 0);
    const paymentSteps = isHard ? ["할인", "적립", "상품권", "카드", "비밀번호", "영수증"] : ["할인", "적립", "결제", "카드", "영수증"];
    const modalNextGroupIndex = flowModalMessage ? groups.findIndex((group) => group.key === focusGroupAfterModal) : -1;
    const activePaymentStep = modalNextGroupIndex > 0 ? modalNextGroupIndex - 1 : Math.min(doneCount, paymentSteps.length - 1);
    const couponFocus = coupon.open && !coupon.done;
    const rewardFocus = phoneReward.open && !phoneReward.done;
    const upsellFocus = isHard && hardPay.upsellIndex >= 0;
    const giftScanFocus = isHard && optionReady && hardPay.giftStage === "scan";
    const remainderFocus = isHard && optionReady && hardPay.giftStage === "short";
    const pinFocus = isHard && hardware.card && !hardPay.pinDone;
    const receiptFocus = ["approved", "printing"].includes(pay.stage);
    const hardwareFocus = receiptFocus || (isHard ? readyForCard && !pinFocus : picks.payment?.id === "card" && optionReady);
    const kioskClassName = [
      isKind ? "friendly-kiosk payment-kiosk" : "busy-payment-kiosk payment-kiosk",
      isHard ? "hard-payment-kiosk" : "",
      couponFocus || rewardFocus ? "phone-focus-kiosk tiny-entry-kiosk" : "",
      giftScanFocus ? "barcode-scan-kiosk" : "",
      hardwareFocus ? "hardware-focus-kiosk" : "",
      receiptFocus ? "receipt-focus-kiosk" : "",
      upsellFocus ? "upsell-focus-kiosk" : "",
      pinFocus ? "pin-focus-kiosk" : ""
    ].filter(Boolean).join(" ");
    const paymentBodyContent = couponFocus
      ? couponPanel()
      : rewardFocus
        ? phoneRewardPanel()
          : upsellFocus
            ? upsellPanel()
          : giftScanFocus
            ? giftScanPanel()
          : remainderFocus
            ? remainderPanel()
          : pinFocus
            ? pinPadPanel()
          : receiptFocus
            ? receiptPanel()
          : hardwareFocus
            ? `<div class="hardware-focus-flow">${paymentHardwarePanel(readyForCard)}</div>`
          : `
          <div class="payment-flow ${isKind ? "is-friendly" : ""}">
            ${groups
              .map(
                (group) => `
                  <section class="dense-section payment-section" data-payment-group="${group.key}">
                    <h4>${group.title}</h4>
                    <div class="product-grid payment-options">
                      ${group.items
                        .map((item) =>
                          productCard(
                            item,
                            `data-option-key="${group.key}" data-option-id="${item.id}"`,
                            picks[group.key]?.id === item.id ? "is-picked" : ""
                          )
                        )
                        .join("")}
                    </div>
                  </section>
                `
              )
              .join("")}
          </div>
        `;
    const paymentBody = `${isKind ? kindChecklist() : ""}${paymentBodyContent}${flowModalMessage ? stepModal() : ""}`;
    root.innerHTML = kioskShell({
      brand: "모두페이",
      title: isKind ? "차근차근 결제하기" : isHard ? "함정이 숨은 결제 화면" : "복잡한 결제 화면",
      subtitle: "",
      mode,
      status: `${doneCount} / ${paymentSteps.length} 완료`,
      steps: paymentSteps,
      activeStep: activePaymentStep,
      guide: isKind
        ? ""
        : isHard
          ? "문자 쿠폰 입력, 휴대폰 번호 적립 뒤 결제수단을 고르세요. 결제 전에 안내 창이 나올 수 있습니다."
          : "문자 쿠폰 입력, 휴대폰 번호 적립, 카드 결제, 영수증 수령을 차례로 진행합니다.",
      cartItems,
      className: kioskClassName,
      body: paymentBody
    });
    restoreKioskScroll(root, scrollState);
    setupBarcodeDrag();
    setupCardDrag();
    highlightCart();

    const focusGroup = options.focusGroup || "";
    if (focusGroup) {
      const focusTarget = root.querySelector(`[data-payment-group="${focusGroup}"]`);
      if (focusTarget) {
        window.requestAnimationFrame(() => focusTarget.scrollIntoView({ block: "start", behavior: "smooth" }));
      }
    }

    const modalClose = root.querySelector("[data-flow-modal-close]");
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        const nextFocus = focusGroupAfterModal;
        flowModalMessage = "";
        flowModalNote = "";
        flowModalNext = "";
        focusGroupAfterModal = "";
        if (nextFocus) {
          draw({ focusGroup: nextFocus });
        } else {
          draw({ preserveScroll: true });
        }
        freshCart = null;
      });
    }

    const wrongChoiceMessage = {
      discount: isKind ? "목표와 다른 선택입니다. 문자로 받은 쿠폰 번호를 입력해 보세요." : "미션에 없는 할인입니다. 문자로 받은 쿠폰 번호를 입력해야 합니다.",
      reward: isKind ? "목표와 다른 선택입니다. 휴대폰 번호로 적립해 보세요." : "미션에 없는 적립 방법입니다. 휴대폰 번호로 적립해야 합니다.",
      payment: isKind ? "목표와 다른 선택입니다. 안내를 다시 확인해 보세요." : "선택지가 너무 많아 필요한 결제 절차를 찾기 어렵습니다."
    };

    root.querySelectorAll("[data-option-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find((item) => item.key === button.dataset.optionKey);
        const selected = group.items.find((item) => item.id === button.dataset.optionId);
        if (!selected) return;
        if (isHard && group.key === "payment" && selected.id === "card") {
          recordBarrier("모바일 상품권으로 먼저 결제한 뒤, 모자란 금액만 카드로 내야 합니다.");
          return;
        }
        if (selected.id !== group.correct) {
          recordBarrier(wrongChoiceMessage[group.key]);
          return;
        }
        if (isHard && group.key === "payment" && !picks.payment) {
          if (!picks.discount || !picks.reward) {
            recordBarrier("쿠폰 할인과 포인트 적립을 먼저 마쳐야 결제수단을 고를 수 있습니다.");
            return;
          }
          hardPay.upsellIndex = 0;
          draw();
          return;
        }
        if (group.key === "discount" && !coupon.done) {
          coupon.open = true;
          draw();
          window.requestAnimationFrame(() => root.querySelector("[data-coupon-input]")?.focus({ preventScroll: true }));
          return;
        }
        if (group.key === "reward" && !phoneReward.done) {
          phoneReward.open = true;
          draw();
          return;
        }
        if (picks[group.key]) return;
        picks[group.key] = selected;
        if (group.key === "payment" && selected.id === "card") {
          draw();
          return;
        }
        draw({ preserveScroll: true });
      });
    });

    root.querySelectorAll("[data-coupon-phone]").forEach((button) => {
      button.addEventListener("click", () => {
        coupon.stage = "apps";
        draw();
      });
    });

    root.querySelectorAll("[data-coupon-app]").forEach((button) => {
      button.addEventListener("click", () => {
        const app = phoneApps.find((item) => item.id === button.dataset.couponApp);
        if (!app) return;
        if (!app.correct) {
          recordBarrier("쿠폰 번호는 문자 메시지로 왔습니다. 메시지 앱을 찾아 보세요.");
          return;
        }
        coupon.stage = "sms";
        draw();
      });
    });

    const couponInput = root.querySelector("[data-coupon-input]");
    if (couponInput) {
      couponInput.addEventListener("input", () => {
        coupon.value = normalizeCouponInput(couponInput.value);
        couponInput.value = formatCouponCode(coupon.value);
      });
      couponInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitCoupon();
          return;
        }
        const keyName = event.key === "Backspace" ? "back" : event.key.length === 1 ? event.key.toUpperCase() : "";
        const keyButton = keyName ? root.querySelector(`[data-coupon-key="${keyName}"]`) : null;
        if (keyButton) fx("pressKey", keyButton);
      });
    }

    root.querySelectorAll("[data-coupon-key]").forEach((button) => {
      button.addEventListener("click", () => {
        fx("pressKey", button);
        pushCouponKey(button.dataset.couponKey);
      });
    });

    root.querySelector("[data-coupon-submit]")?.addEventListener("click", submitCoupon);
    root.querySelector("[data-coupon-cancel]")?.addEventListener("click", () => {
      coupon.open = false;
      draw({ focusGroup: "discount" });
    });

    root.querySelectorAll("[data-phone-key]").forEach((button) => {
      button.addEventListener("click", () => pushPhoneKey(button.dataset.phoneKey));
    });
    root.querySelector("[data-consent]")?.addEventListener("change", (event) => {
      phoneReward.consent = event.target.checked;
      if (phoneReward.consent) fx("sound", "key");
    });
    root.querySelector("[data-phone-submit]")?.addEventListener("click", submitPhoneReward);
    root.querySelector("[data-phone-cancel]")?.addEventListener("click", () => {
      phoneReward.open = false;
      draw({ focusGroup: "reward" });
    });

    root.querySelectorAll("[data-receipt-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        if (pay.stage !== "approved") return;
        if (button.dataset.receiptChoice === "skip") {
          recordBarrier("미션에서는 영수증을 받아야 합니다. '영수증 출력'을 눌러야 영수증이 나옵니다.");
          return;
        }
        fx("pressKey", button);
        printReceipt();
      });
    });

    root.querySelectorAll("[data-barcode-target]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!(isHard && hardPay.giftStage === "scan")) return;
        recordBarrier("바코드는 버튼처럼 누르는 것이 아니라, 스마트폰 화면을 인식부에 가져다대야 합니다.");
      });
    });

    root.querySelectorAll("[data-upsell-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const offer = hardUpsellOffers[hardPay.upsellIndex];
        if (!offer) return;
        if (button.dataset.upsellAnswer === "yes") {
          recordBarrier(offer.barrier);
          hardPay.upsellIndex = 0;
          draw();
          return;
        }
        if (hardPay.upsellIndex < hardUpsellOffers.length - 1) {
          hardPay.upsellIndex += 1;
          draw();
          return;
        }
        const paymentGroup = groups.find((item) => item.key === "payment");
        picks.payment = paymentGroup.items.find((item) => item.id === "gift-card");
        hardPay.upsellIndex = -1;
        hardPay.giftStage = "scan";
        draw();
      });
    });

    root.querySelectorAll("[data-remainder-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const paymentGroup = groups.find((item) => item.key === "payment");
        const selected = paymentGroup.items.find((item) => item.id === button.dataset.remainderId);
        if (!selected) return;
        if (selected.id !== "card") {
          recordBarrier("모자란 금액은 미션에 나온 대로 카드로 결제해야 합니다.");
          return;
        }
        hardPay.remainder = selected;
        hardPay.giftStage = "done";
        draw();
      });
    });

    // 비밀번호 키패드는 다시 그리지 않고 제자리에서 숫자만 섞어, 누른 키의 눌림 효과가 보이게 합니다.
    const refreshPinPad = () => {
      root.querySelectorAll(".pin-dots span").forEach((dot, index) => dot.classList.toggle("is-filled", index < hardPay.pinValue.length));
      root.querySelectorAll("[data-pin-key]").forEach((key, index) => {
        key.dataset.pinKey = hardPay.pinKeys[index];
        key.textContent = hardPay.pinKeys[index];
      });
    };

    root.querySelectorAll("[data-pin-key]").forEach((button) => {
      button.addEventListener("click", () => {
        fx("pressKey", button);
        if (hardPay.pinValue.length < 4) {
          hardPay.pinValue += button.dataset.pinKey;
        }
        hardPay.pinKeys = shuffledPinKeys();
        refreshPinPad();
      });
    });

    root.querySelectorAll("[data-pin-action]").forEach((button) => {
      button.addEventListener("click", () => {
        fx("pressKey", button);
        if (button.dataset.pinAction === "clear") {
          hardPay.pinValue = "";
          hardPay.pinKeys = shuffledPinKeys();
          refreshPinPad();
          return;
        }
        if (hardPay.pinValue !== HARD_CARD_PIN) {
          failWith("카드 비밀번호가 맞지 않습니다. 숫자 위치가 계속 바뀌어 같은 자리를 누르면 틀리기 쉽습니다.", root.querySelector(".pin-pad-panel"));
          fx("readerState", cardReader(), "error");
          hardPay.pinValue = "";
          hardPay.pinKeys = shuffledPinKeys();
          refreshPinPad();
          return;
        }
        runBusy(async () => {
          fx("readerState", cardReader(), "busy");
          await approveCardPayment();
        });
      });
    });

    root.querySelectorAll("[data-hardware]").forEach((button) => {
      button.addEventListener("click", () => {
        if ((isHard && hardPay.giftStage === "scan") || pay.stage === "printing") {
          return;
        }
        if (!readyForCard) {
          recordBarrier("할인, 적립, 결제수단을 먼저 통과해야 기기 조작을 할 수 있습니다.");
          return;
        }
        if (button.dataset.hardware === "card") {
          if (!hardware.card) {
            recordBarrier("결제 카드를 카드 넣는 곳으로 끌어다 놓아야 합니다.");
          }
          return;
        }
        if (!hardware.card || (isHard && !hardPay.pinDone)) {
          recordBarrier("결제 카드를 넣은 뒤 영수증과 번호표가 나오는 곳을 확인해야 합니다.");
          return;
        }
        if (pay.stage === "approved") {
          recordBarrier("화면에서 '영수증 출력'을 먼저 눌러야 영수증이 나옵니다.");
          return;
        }
        if (pay.stage === "fallback") finishPayment();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      if (pay.stage === "printing") return;
      if (!readyForCard) {
        recordBarrier(isHard ? "쿠폰 할인, 포인트 적립, 모바일 상품권, 남은 금액 결제수단을 차례로 마쳐야 합니다." : "쿠폰 할인, 포인트 적립, 결제수단을 모두 마쳐야 합니다.");
        return;
      }
      if (!hardware.card) {
        recordBarrier("결제 카드를 먼저 카드 넣는 곳으로 끌어다 놓아야 합니다.");
        root.querySelector("[data-draggable-card]")?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      if (isHard && !hardPay.pinDone) {
        recordBarrier("카드 비밀번호 4자리를 먼저 입력해야 결제가 끝납니다.");
        return;
      }
      if (pay.stage === "approved") {
        recordBarrier("화면에서 '영수증 출력'을 눌러 영수증을 받아야 합니다.");
        return;
      }
      if (pay.stage === "fallback") finishPayment();
    });
  }

  // 새로 적용된 할인·적립 줄을 주문 내역에서 반짝이게 하고, 금액 변화를 떠오르는 칩으로 보여 줍니다.
  function highlightCart() {
    if (!freshCart) return;
    const cart = root.querySelector(".order-cart");
    if (!cart) return;
    const row = [...cart.querySelectorAll(".cart-row")].find((item) => item.querySelector("span")?.textContent.trim() === freshCart.label);
    row?.classList.add("is-fresh");
    cart.querySelector(".cart-total strong")?.classList.add("is-updating");
    cart.insertAdjacentHTML("beforeend", `<span class="cart-delta-chip is-${freshCart.tone}" aria-hidden="true">${freshCart.chip}</span>`);
  }

  const blockWhileBusy = (event) => {
    if (!busy) return;
    event.stopPropagation();
    event.preventDefault();
  };
  // 휴대폰 번호 키패드는 실제 키보드 숫자로도 누를 수 있습니다.
  const onPhoneKeydown = (event) => {
    if (busy || disposed || !phoneReward.open || phoneReward.done) return;
    if (event.target?.matches?.("input[type='text']")) return;
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      pushPhoneKey(event.key);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      pushPhoneKey("back");
    } else if (event.key === "Enter" && !event.target?.matches?.("button")) {
      event.preventDefault();
      submitPhoneReward();
    }
  };
  root.addEventListener("click", blockWhileBusy, true);
  root.addEventListener("pointerdown", blockWhileBusy, true);
  document.addEventListener("keydown", onPhoneKeydown);
  addCleanup(() => {
    disposed = true;
    busy = false;
    root.classList.remove("is-kiosk-busy");
    root.removeEventListener("click", blockWhileBusy, true);
    root.removeEventListener("pointerdown", blockWhileBusy, true);
    document.removeEventListener("keydown", onPhoneKeydown);
    window.KioskFX?.clear?.();
  });

  draw();
}

function renderFriendlyPicker(root, config) {
  const selectedByGroup = {};
  root.innerHTML = `
    <div class="kiosk-screen">
      <div class="kiosk-top">
        <h3>${config.title}</h3>
        <span class="status-pill">0 / ${config.correctLabels.length}</span>
      </div>
      <p class="kiosk-help">${config.help}</p>
      <div class="friendly-picker">
        ${config.groups
          .map(
            (group, groupIndex) => `
              <div class="choice-row" data-group="${groupIndex}">
                ${group.map((label) => `<button class="choice-button" type="button" data-choice="${label}">${label}</button>`).join("")}
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  root.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".choice-row");
      const groupIndex = row.dataset.group;
      row.querySelectorAll(".choice-button").forEach((item) => item.classList.remove("is-picked"));
      button.classList.add("is-picked");
      selectedByGroup[groupIndex] = button.dataset.choice;
      const picked = Object.values(selectedByGroup).filter((label) => config.correctLabels.includes(label));
      const status = root.querySelector(".status-pill");
      status.textContent = `${picked.size} / ${config.correctLabels.length}`;
      if (picked.size === config.correctLabels.length) {
        completeStation(config.doneMessage);
        showCompletion(root, config.doneMessage);
      }
    });
  });
}

function renderAlienStation(root, mode) {
  const isKind = mode === "kind";
  const isHard = mode === "hard";
  let picks = {};
  let alienSuccessMessage = "";
  let alienSuccessAction = "";
  let alienReplayPrompt = false;
  const completedLanguages = new Set();
  const hardItem = (id, label, price = 0) => ({ id, label, price, noArt: true });
  const easyGroups = [
    {
      key: "drink",
      title: "음료",
      correct: "barley-hot",
      items: [
        { id: "barley-hot", label: "따뜻한 보리차", desc: "카페인이 적은 차", price: 2500, visual: "cup" },
        { id: "barley-ice", label: "차가운 보리차", desc: "얼음 포함", price: 2500, visual: "cup" },
        { id: "milk", label: "딸기 우유", desc: "달콤한 우유", price: 3200, visual: "cup" },
        { id: "citron-hot", label: "따뜻한 유자차", desc: "달콤한 과일차", price: 3000, visual: "cup" },
        { id: "ice-tea", label: "아이스티", desc: "차가운 홍차", price: 2800, visual: "cup" }
      ]
    },
    {
      key: "serve",
      title: "받는 방법",
      correct: "takeout",
      items: [
        { id: "here", label: "매장 이용", desc: "컵에 제공", price: 0, mark: "매" },
        { id: "takeout", label: "포장", desc: "뚜껑 있는 컵", price: 0, mark: "포" },
        { id: "later", label: "나중에 받기", desc: "대기 후 수령", price: 0, mark: "대" }
      ]
    },
    {
      key: "sugar",
      title: "단맛",
      correct: "zero",
      items: [
        { id: "normal", label: "보통", desc: "기본 단맛", price: 0, mark: "보" },
        { id: "zero", label: "설탕 없음", desc: "단맛 추가 없음", price: 0, mark: "무" },
        { id: "more", label: "많이", desc: "달게", price: 0, mark: "다" }
      ]
    }
  ];
  const alienLanguageSets = [
    {
      id: "english",
      name: "영어",
      groups: [
        {
          key: "drink",
          title: "Beverage",
          correct: "barley-hot-hard",
          items: [
            hardItem("barley-ice-hard", "Iced Barley Tea", 2500),
            hardItem("barley-hot-hard", "Hot Barley Tea", 2500),
            hardItem("milk-hard", "Strawberry Milk", 3200),
            hardItem("citron-hot-hard", "Hot Citron Tea", 3000),
            hardItem("ice-tea-hard", "Iced Tea", 2800)
          ]
        },
        {
          key: "serve",
          title: "Pickup",
          correct: "takeout-hard",
          items: [hardItem("here-hard", "Eat In"), hardItem("later-hard", "Pick Up Later"), hardItem("takeout-hard", "To go")]
        },
        {
          key: "sugar",
          title: "Sweetness",
          correct: "no-sugar-hard",
          items: [hardItem("no-sugar-hard", "No Sugar"), hardItem("regular-hard", "Regular Sweet"), hardItem("extra-sweet-hard", "Extra Sweet")]
        }
      ]
    },
    {
      id: "spanish",
      name: "스페인어",
      groups: [
        {
          key: "drink",
          title: "Bebida",
          correct: "barley-hot-hard",
          items: [
            hardItem("barley-ice-hard", "Te de cebada frio", 2500),
            hardItem("milk-hard", "Leche de fresa", 3200),
            hardItem("ice-tea-hard", "Te helado", 2800),
            hardItem("barley-hot-hard", "Te de cebada caliente", 2500),
            hardItem("citron-hot-hard", "Te de cidra caliente", 3000)
          ]
        },
        {
          key: "serve",
          title: "Retiro",
          correct: "takeout-hard",
          items: [hardItem("takeout-hard", "Para llevar"), hardItem("here-hard", "Comer aqui"), hardItem("later-hard", "Recoger mas tarde")]
        },
        {
          key: "sugar",
          title: "Dulzor",
          correct: "no-sugar-hard",
          items: [hardItem("regular-hard", "Dulce regular"), hardItem("no-sugar-hard", "Sin azucar"), hardItem("extra-sweet-hard", "Extra dulce")]
        }
      ]
    },
    {
      id: "chinese",
      name: "중국어",
      groups: [
        {
          key: "drink",
          title: "饮品",
          correct: "barley-hot-hard",
          items: [
            hardItem("milk-hard", "草莓牛奶", 3200),
            hardItem("citron-hot-hard", "热柚子茶", 3000),
            hardItem("barley-hot-hard", "热麦茶", 2500),
            hardItem("barley-ice-hard", "冰麦茶", 2500),
            hardItem("ice-tea-hard", "冰茶", 2800)
          ]
        },
        {
          key: "serve",
          title: "取餐",
          correct: "takeout-hard",
          items: [hardItem("here-hard", "堂食"), hardItem("takeout-hard", "外带"), hardItem("later-hard", "稍后取餐")]
        },
        {
          key: "sugar",
          title: "甜度",
          correct: "no-sugar-hard",
          items: [hardItem("regular-hard", "正常糖"), hardItem("extra-sweet-hard", "多糖"), hardItem("no-sugar-hard", "无糖")]
        }
      ]
    },
    {
      id: "japanese",
      name: "일본어",
      groups: [
        {
          key: "drink",
          title: "ドリンク",
          correct: "barley-hot-hard",
          items: [
            hardItem("barley-hot-hard", "ホット麦茶", 2500),
            hardItem("barley-ice-hard", "アイス麦茶", 2500),
            hardItem("milk-hard", "いちごミルク", 3200),
            hardItem("citron-hot-hard", "ホットゆず茶", 3000),
            hardItem("ice-tea-hard", "アイスティー", 2800)
          ]
        },
        {
          key: "serve",
          title: "受け取り",
          correct: "takeout-hard",
          items: [hardItem("here-hard", "店内"), hardItem("takeout-hard", "持ち帰り"), hardItem("later-hard", "あとで受け取り")]
        },
        {
          key: "sugar",
          title: "甘さ",
          correct: "no-sugar-hard",
          items: [hardItem("regular-hard", "ふつう"), hardItem("extra-sweet-hard", "甘め"), hardItem("no-sugar-hard", "砂糖なし")]
        }
      ]
    },
    {
      id: "thai",
      name: "태국어",
      groups: [
        {
          key: "drink",
          title: "เครื่องดื่ม",
          correct: "barley-hot-hard",
          items: [
            hardItem("ice-tea-hard", "ชาเย็น", 2800),
            hardItem("milk-hard", "นมสตรอว์เบอร์รี", 3200),
            hardItem("citron-hot-hard", "ชายูซุร้อน", 3000),
            hardItem("barley-ice-hard", "ชาข้าวบาร์เลย์เย็น", 2500),
            hardItem("barley-hot-hard", "ชาข้าวบาร์เลย์ร้อน", 2500)
          ]
        },
        {
          key: "serve",
          title: "รับสินค้า",
          correct: "takeout-hard",
          items: [hardItem("takeout-hard", "กลับบ้าน"), hardItem("here-hard", "ทานที่ร้าน"), hardItem("later-hard", "รับภายหลัง")]
        },
        {
          key: "sugar",
          title: "ความหวาน",
          correct: "no-sugar-hard",
          items: [hardItem("regular-hard", "หวานปกติ"), hardItem("no-sugar-hard", "ไม่ใส่น้ำตาล"), hardItem("extra-sweet-hard", "หวานมาก")]
        }
      ]
    }
  ];
  const hardGroups = [
    {
      key: "drink",
      title: "المشروبات",
      language: "아랍어",
      lang: "ar",
      dir: "rtl",
      correct: "citron-ice-hard",
      barrier: "오른쪽부터 읽는 글자라 비슷한 유자 메뉴를 구분하기 어려웠습니다.",
      items: [
        hardItem("citron-hot-hard", "شاي يوزو ساخن", 3000),
        hardItem("citron-ade-hard", "يوزو غازي", 3500),
        hardItem("citron-ice-hard", "شاي يوزو بارد", 3000),
        hardItem("barley-ice-hard", "شاي شعير بارد", 2500)
      ]
    },
    {
      key: "serve",
      title: "Как получить",
      language: "러시아어",
      lang: "ru",
      correct: "takeout-hard",
      barrier: "아는 알파벳처럼 보였지만 뜻이 전혀 다른 글자였습니다.",
      items: [hardItem("here-hard", "В зале"), hardItem("delivery-hard", "Доставка"), hardItem("takeout-hard", "С собой"), hardItem("later-hard", "Забрать позже")]
    },
    {
      key: "sugar",
      title: "मिठास",
      language: "힌디어",
      lang: "hi",
      correct: "no-sugar-hard",
      barrier: "글자 모양이 비슷해 보여서 단맛 옵션을 구분하기 어려웠습니다.",
      items: [hardItem("less-sweet-hard", "कम मीठा"), hardItem("regular-hard", "सामान्य मीठा"), hardItem("no-sugar-hard", "बिना चीनी"), hardItem("extra-sweet-hard", "ज़्यादा मीठा")]
    },
    {
      key: "cup",
      title: "컵 셀렉트",
      language: "외래어 범벅 한국어",
      lang: "ko",
      correct: "reusable-cup-hard",
      barrier: "한국어인데도 외래어가 많아 무슨 뜻인지 알기 어려웠습니다.",
      items: [
        { ...hardItem("disposable-cup-hard", "디스포저블 컵"), price: null, desc: "테이크아웃 시 ECO 옵션 미적용" },
        { ...hardItem("tumbler-discount-hard", "텀블러 디스카운트"), price: null, desc: "퍼스널 텀블러 지참 시 프라이스 오프" },
        { ...hardItem("reusable-cup-hard", "리유저블 컵"), price: null, desc: "에코 리턴 시 디파짓 리펀드" },
        { ...hardItem("mug-hard", "머그 (포 히어)"), price: null, desc: "다인인 전용 세라믹 웨어" }
      ]
    }
  ];
  const pickLanguage = () => {
    const available = alienLanguageSets.filter((language) => !completedLanguages.has(language.id));
    const pool = available.length ? available : alienLanguageSets;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  let currentLanguage = isKind || isHard ? null : pickLanguage();
  let groups = isKind ? easyGroups : isHard ? hardGroups : currentLanguage.groups;

  function resetAlienRound() {
    picks = {};
    alienReplayPrompt = false;
    alienSuccessMessage = "";
    alienSuccessAction = "";
    currentLanguage = pickLanguage();
    groups = currentLanguage.groups;
  }

  function alienReplayModal() {
    return `
      <div class="flow-modal-backdrop" role="dialog" aria-modal="true" aria-label="다른 외계어 도전">
        <div class="flow-modal alien-replay-modal">
          <h4>${currentLanguage.name} 버전을 해결했습니다</h4>
          <p>다른 외계어로도 해보겠어요?</p>
          <div class="alien-replay-actions">
            <button class="phone-primary-button" type="button" data-alien-replay="again">다른 외계어 도전</button>
            <button class="secondary-action alien-finish-button" type="button" data-alien-replay="finish">마무리하기</button>
          </div>
        </div>
      </div>
    `;
  }

  function draw(options = {}) {
    const scrollState = options.preserveScroll ? captureKioskScroll(root) : null;
    const cartItems = selectedCartItems(picks);
    const nextGroupIndex = groups.findIndex((group) => !picks[group.key]);
    const activeGroupIndex = nextGroupIndex === -1 ? groups.length - 1 : nextGroupIndex;
    const activeGroup = groups[activeGroupIndex];
    const langAttr = isHard ? ` lang="${activeGroup.lang}"` : "";
    root.innerHTML = kioskShell({
      brand: "모두티",
      title: isKind ? "쉬운 말로 주문하기" : isHard ? "단계마다 바뀌는 말로 주문하기" : "낯선 말로 주문하기",
      subtitle: isKind
        ? "따뜻한 보리차, 포장, 설탕 없음을 고릅니다."
        : isHard
          ? "그림 없이 글자만 보고, 단계마다 다른 말로 된 메뉴에서 목표 옵션을 찾아야 합니다."
          : `${currentLanguage.name} 메뉴와 짧은 안내만 보고 목표 옵션을 찾아야 합니다.`,
      mode,
      status: `${cartItems.length} / ${groups.length} 선택`,
      steps: isHard ? ["음료", "수령", "단맛", "컵"] : ["음료", "수령", "옵션"],
      activeStep: activeGroupIndex,
      guide: isKind
        ? "따뜻한 보리차, 포장, 설탕 없음을 쉬운 말과 설명으로 확인합니다."
        : isHard
          ? "차가운 유자차, 포장, 설탕 없음, 재사용이 가능한 컵을 글자만 보고 찾아봅니다."
          : `따뜻한 보리차, 포장, 설탕 없음을 ${currentLanguage.name} 메뉴와 짧은 안내만 보고 찾아봅니다.`,
      cartItems,
      className: isKind ? "friendly-kiosk" : isHard ? "alien-kiosk alien-hard-kiosk" : "alien-kiosk",
      body: `
        ${
          isKind
            ? ""
            : isHard
              ? `
              <div class="alien-language-status alien-hard-status">
                <span>이번 단계의 말</span>
                <b>${activeGroup.language}</b>
                <small>${activeGroupIndex + 1} / ${groups.length} 단계</small>
              </div>
            `
              : `
              <div class="alien-language-status">
                <span>랜덤 외계어</span>
                <b>${currentLanguage.name}</b>
                <small>${completedLanguages.size} / ${alienLanguageSets.length} 언어 해결</small>
              </div>
            `
        }
        <div class="category-tabs">
          ${groups.map((group, index) => `<span class="category-tab ${index === activeGroupIndex ? "is-active" : ""} ${picks[group.key] ? "is-complete" : ""}"${isHard ? ` lang="${group.lang}"` : ""}>${group.title}</span>`).join("")}
        </div>
        <div class="alien-order">
          <section class="dense-section alien-active-section"${langAttr}>
            <h4>${activeGroup.title}</h4>
            <div class="product-grid compact-products">
              ${activeGroup.items
                .map((item) =>
                  productCard(
                    item,
                    `data-option-key="${activeGroup.key}" data-option-id="${item.id}"`,
                    picks[activeGroup.key]?.id === item.id ? "is-picked" : ""
                  )
                )
                .join("")}
            </div>
          </section>
        </div>
        ${alienReplayPrompt ? alienReplayModal() : ""}
        ${alienSuccessMessage ? flowModal(alienSuccessMessage) : ""}
      `
    });
    restoreKioskScroll(root, scrollState);
    if (isHard && activeGroup.dir === "rtl") {
      root.querySelector(".real-kiosk")?.setAttribute("dir", "rtl");
    }

    root.querySelectorAll("[data-alien-replay]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.alienReplay === "again") {
          resetAlienRound();
          draw();
          fxStepEnter(root, "next");
          return;
        }
        completeStation("낯선 말과 부족한 설명은 디지털 기기가 익숙하지 않은 사람에게 주문 장벽이 됩니다.");
        showCompletion(root, "실제 주문 화면에서도 쉬운 말과 그림 설명이 필요합니다.");
      });
    });

    const modalClose = root.querySelector("[data-flow-modal-close]");
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        const action = alienSuccessAction;
        alienSuccessMessage = "";
        alienSuccessAction = "";
        if (action === "complete") {
          completeStation(isKind ? "쉬운 말과 설명이 있으면 처음 보는 메뉴도 고를 수 있습니다." : "낯선 말과 부족한 설명은 디지털 기기가 익숙하지 않은 사람에게 주문 장벽이 됩니다.");
          showCompletion(root, "실제 주문 화면에서도 쉬운 말과 그림 설명이 필요합니다.");
          return;
        }
        draw();
        fxStepEnter(root, "next");
      });
    }

    root.querySelectorAll("[data-option-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find((item) => item.key === button.dataset.optionKey);
        const selected = group.items.find((item) => item.id === button.dataset.optionId);
        if (!selected) return;
        if (selected.id !== group.correct) {
          fxReject(root, button, "주문 내용과 다른 옵션이에요. 다시 확인해 주세요.");
          recordBarrier(isKind ? "선택 조건을 다시 읽어 보세요." : isHard ? group.barrier : "버튼을 못 누른 것이 아니라, 화면의 말이 충분히 친절하지 않았습니다.");
          return;
        }
        fxSound("beep");
        const snapshot = fxSnapshot(button);
        const previousTotal = selectedCartItems(picks).reduce((sum, item) => sum + (item.price || 0), 0);
        picks[group.key] = selected;
        if (Object.keys(picks).length === groups.length) {
          if (isHard) {
            completeStation("읽는 방향, 처음 보는 글자, 외래어까지 낯선 4단계 주문을 완료했습니다.");
            showCompletion(
              root,
              "이 글자를 쓰는 사람이 한국 키오스크 앞에 서면 지금과 같은 느낌을 받습니다. 한국에 사는 이주민, 여행객, 외래어가 낯선 어르신에게는 쉬운 말, 그림, 여러 언어 안내가 필요합니다.",
              {
                autoReturn: true,
                kicker: "최종 미션 해결",
                title: "더 어려운 모드 완료"
              }
            );
            return;
          }
          if (!isKind) {
            completedLanguages.add(currentLanguage.id);
            if (completedLanguages.size === alienLanguageSets.length) {
              alienSuccessMessage = "5개 외계어 메뉴를 모두 해결했습니다.";
              alienSuccessAction = "complete";
              draw();
              fxFlyToCart(root, snapshot, previousTotal);
              return;
            }
            alienReplayPrompt = true;
            draw();
            fxFlyToCart(root, snapshot, previousTotal);
            return;
          }
          alienSuccessMessage = "잘 골랐습니다. 목표 메뉴를 모두 찾았습니다.";
          alienSuccessAction = "complete";
          draw();
          fxFlyToCart(root, snapshot, previousTotal);
          return;
        }
        alienSuccessMessage = "잘 골랐습니다. 다음 항목을 찾아보세요.";
        alienSuccessAction = "next";
        draw();
        fxFlyToCart(root, snapshot, previousTotal);
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", (event) => {
      fxReject(root, event.currentTarget, "옵션을 모두 고른 뒤 결제할 수 있어요.");
      recordBarrier(isHard ? "네 가지 조건을 모두 선택해야 결제할 수 있습니다." : "세 가지 조건을 모두 선택해야 결제할 수 있습니다.");
    });
  }

  draw();
}

function renderContrastStation(root, mode) {
  const isKind = mode === "kind";
  let coupon = "";
  const baseItems = [
    { label: "치즈버거", price: 7900 },
    { label: "감자튀김", price: 0 }
  ];
  const coupons = [
    { id: "500", label: isKind ? "500원 할인 쿠폰" : "A", desc: isKind ? "작은 동그라미 표시" : "색상으로 구분", price: -500, mark: "A" },
    { id: "1000", label: isKind ? "1,000원 할인 쿠폰" : "B", desc: isKind ? "굵은 테두리 표시" : "색상으로 구분", price: -1000, mark: "B" },
    { id: "2000", label: isKind ? "2,000원 할인 쿠폰" : "C", desc: isKind ? "파란 사각형 표시" : "색상으로 구분", price: -2000, mark: "C" }
  ];

  function draw() {
    const selectedCoupon = coupons.find((item) => item.id === coupon);
    const cartItems = selectedCoupon ? [...baseItems, selectedCoupon] : baseItems;
    root.innerHTML = kioskShell({
      brand: "모두버거",
      title: isKind ? "쿠폰을 적용하고 결제하기" : "흐릿한 결제 화면",
      subtitle: "1,000원 할인 쿠폰을 적용한 뒤 결제합니다.",
      mode,
      status: selectedCoupon ? "쿠폰 적용" : "결제 대기",
      steps: ["주문", "쿠폰", "결제"],
      activeStep: selectedCoupon ? 2 : 1,
      guide: isKind ? "색뿐 아니라 금액과 모양 설명을 함께 표시합니다." : "낮은 대비와 색상 단서만으로 쿠폰을 구분해야 합니다.",
      cartItems,
      className: isKind ? "friendly-kiosk" : "low-contrast-kiosk",
      body: `
        <div class="checkout-layout">
          <section class="receipt-preview">
            <h4>주문 확인</h4>
            <p>결제 전 할인 쿠폰을 선택해 주세요.</p>
            <div class="receipt-total">${formatWon(cartItems.reduce((sum, item) => sum + item.price, 0))}</div>
          </section>
          <section class="coupon-panel">
            <h4>쿠폰 선택</h4>
            <div class="coupon-row real-coupons">
              ${coupons
                .map(
                  (item) => `
                    <button class="coupon-card ${coupon === item.id ? "is-picked" : ""}" type="button" data-coupon="${item.id}">
                      <span class="coupon-shape coupon-${item.id}"></span>
                      <b>${item.label}</b>
                      <small>${item.desc}</small>
                    </button>
                  `
                )
                .join("")}
            </div>
            <button class="pay-button" type="button" data-pay="true">카드로 결제하기</button>
          </section>
        </div>
      `
    });

    root.querySelectorAll("[data-coupon]").forEach((button) => {
      button.addEventListener("click", () => {
        coupon = button.dataset.coupon;
        if (coupon !== "1000" && !isKind) {
          recordBarrier("흐린 화면과 색깔만 있는 안내 때문에 쿠폰을 구분하기 어렵습니다.");
        }
        draw();
      });
    });

    root.querySelector("[data-pay]").addEventListener("click", () => {
      if (coupon === "1000") {
        completeStation("낮은 대비와 색상 의존은 시각 정보 접근을 어렵게 만듭니다.");
        showCompletion(root, "결제 화면에서는 선명한 글자와 여러 단서를 함께 제공해야 합니다.");
      } else {
        recordBarrier("원하는 쿠폰이 적용되었는지 확인하기 어렵습니다.");
      }
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      root.querySelector("[data-pay]").click();
    });
  }

  draw();
}

function renderAudioStation(root, mode) {
  const isKind = mode === "kind";
  const sequence = ["start", "pediatrics", "print"];
  const picked = [];
  const choices = [
    { id: "start", label: isKind ? "접수 시작" : "", desc: isKind ? "첫 번째로 누르기" : "음성 안내 필요", price: 0, mark: "1" },
    { id: "pediatrics", label: isKind ? "소아과 선택" : "", desc: isKind ? "두 번째로 누르기" : "음성 안내 필요", price: 0, mark: "2" },
    { id: "print", label: isKind ? "번호표 출력" : "", desc: isKind ? "세 번째로 누르기" : "음성 안내 필요", price: 0, mark: "3" }
  ];

  function draw() {
    const cartItems = picked.map((id, index) => {
      const item = choices.find((choice) => choice.id === id);
      return { label: item.label || `단계 ${index + 1}`, price: 0 };
    });
    root.innerHTML = kioskShell({
      brand: "모두병원",
      title: isKind ? "자막 있는 번호표 접수" : "소리만 나오는 번호표 접수",
      subtitle: "소아과 접수 번호표를 뽑아 보세요.",
      mode,
      status: `${picked.length} / 3 단계`,
      steps: ["시작", "진료과", "출력"],
      activeStep: Math.min(picked.length, 2),
      guide: isKind ? "음성 안내와 같은 내용을 화면에도 표시합니다." : "안내 내용이 소리로만 나오고 버튼에는 글자가 없습니다.",
      cartItems,
      className: isKind ? "friendly-kiosk hospital-kiosk" : "audio-only-kiosk hospital-kiosk",
      body: `
        <div class="hospital-board">
          <button class="announce-button" type="button" data-speak="true">${isKind ? "안내 다시 듣기" : "음성 안내 듣기"}</button>
          ${isKind ? `<p class="caption-strip">왼쪽부터 접수 시작, 소아과 선택, 번호표 출력 순서로 누르세요.</p>` : ""}
          <div class="product-grid hospital-options">
            ${choices
              .map((item) =>
                productCard(
                  item,
                  `data-audio-choice="${item.id}"`,
                  picked.includes(item.id) ? "is-picked hospital-card" : "hospital-card"
                )
              )
              .join("")}
          </div>
        </div>
      `
    });

    root.querySelector("[data-speak]").addEventListener("click", () => {
      speak("왼쪽부터 접수 시작, 소아과 선택, 번호표 출력 순서로 누르세요.");
    });

    root.querySelectorAll("[data-audio-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const expected = sequence[picked.length];
        const actual = button.dataset.audioChoice;
        if (actual !== expected) {
          recordBarrier(isKind ? "화면 안내를 다시 확인해 보세요." : "소리 안내만 있으면 놓쳤을 때 다시 알기 어렵습니다.");
          picked.length = 0;
          draw();
          return;
        }
        picked.push(actual);
        if (picked.length === sequence.length) {
          completeStation("소리 안내만으로는 청각 장애나 시끄러운 환경을 고려하기 어렵습니다.");
          showCompletion(root, "음성 안내에는 자막과 단계 표시가 함께 필요합니다.");
          return;
        }
        draw();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      recordBarrier("번호표 출력까지 단계대로 눌러야 접수가 완료됩니다.");
    });
  }

  draw();
}

function shapeButton(shape, caption) {
  if (!caption) {
    return `
      <button class="shape-button" type="button" data-shape="${shape}">
        <span class="shape ${shape}"></span>
      </button>
    `;
  }

  return `
    <button class="caption-button" type="button" data-shape="${shape}">
      <span class="shape ${shape}"></span>
      <strong>${caption}</strong>
    </button>
  `;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("이 브라우저에서는 음성 안내를 재생할 수 없습니다.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function renderSummary() {
  els.summaryList.innerHTML = stations
    .map(
      (station) => `
        <div class="summary-item">
          <h3>${station.principle}</h3>
          <p>${station.summary}</p>
        </div>
      `
    )
    .join("");
}

els.startButton.addEventListener("click", () => {
  els.stationCards.scrollIntoView({ block: "start", behavior: "smooth" });
  els.stationCards.querySelector("[data-station]")?.focus({ preventScroll: true });
});
els.restartButton.addEventListener("click", returnHome);
els.stationBackButton.addEventListener("click", returnHome);

els.challengeMode.addEventListener("click", () => {
  state.mode = "challenge";
  state.kioskStarted = false;
  renderStation();
});

els.kindMode.addEventListener("click", () => {
  state.mode = "kind";
  state.kioskStarted = false;
  renderStation();
});

// 키오스크 화면을 누르면 손가락이 닿는 듯한 이펙트를 띄웁니다. pointer-events: none이라 클릭·드래그 판정에는 영향이 없습니다.
function spawnTouchEffect(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (!event.target.closest?.(".kiosk-device-screen")) return;
  const fx = document.createElement("span");
  fx.className = "touch-fx";
  fx.style.left = `${event.clientX}px`;
  fx.style.top = `${event.clientY}px`;
  fx.innerHTML = '<span class="touch-fx-ring"></span><span class="touch-fx-finger"></span>';
  document.body.appendChild(fx);
  window.setTimeout(() => fx.remove(), 600);
}

document.addEventListener("pointerdown", spawnTouchEffect, { capture: true, passive: true });

els.chromebookToggle.addEventListener("click", () => {
  setChromebookMode(!document.body.classList.contains("chromebook-mode"));
});

document.body.dataset.view = "home";
if (readChromebookPreference()) setChromebookMode(true);

// 제한 시간이 짧은 화면에서 그림이 늦게 뜨지 않도록 메뉴·배너 이미지를 미리 받아 둡니다.
function preloadKioskImages() {
  const sources = new Set([
    ...Object.values(productImages),
    "assets/menu/banner-burger.png",
    "assets/menu/banner-tea.png",
    "assets/menu/banner-pay.png"
  ]);
  window.kioskImageCache = [...sources].map((src) => {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    return image;
  });
}

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(preloadKioskImages, { timeout: 1200 });
} else {
  window.setTimeout(preloadKioskImages, 300);
}

renderCards();
renderProgress();
