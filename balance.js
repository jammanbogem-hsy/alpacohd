(() => {
  "use strict";

  // Equal-budget classroom scenario: language coverage vs interface optimization.
  // Performance and billing faults belong to product A, regardless of locale.
  // These are classroom simulation conditions, not properties of regional languages.
  const LEGACY_DELAYS = [1000, 1500, 900, 2100, 1200, 1700];
  const LEGACY_FRAME_MS = 150;
  const products = [
    { id: "bulgogi", price: 8900, category: "meal", position: "0% 0%" },
    { id: "bibimbap", price: 8500, category: "meal", position: "50% 0%" },
    { id: "cutlet", price: 9900, category: "meal", position: "100% 0%" },
    { id: "tteok", price: 4500, category: "side", position: "0% 100%" },
    { id: "dumpling", price: 3900, category: "side", position: "50% 100%" },
    { id: "ade", price: 3500, category: "drink", position: "100% 100%" },
  ];
  const copy = {
    standard: {
      language: "표준어",
      status: "주문 접수 중",
      chooseLanguage: "언어 선택",
      categories: ["전체 메뉴", "식사", "사이드", "음료"],
      menuTitle: "메뉴를 선택해 주세요",
      here: "매장 식사",
      takeout: "포장",
      basket: "선택한 메뉴",
      empty: "메뉴를 선택해 주세요",
      clear: "전체 취소",
      remove: "삭제",
      quantity: "수량",
      minus: "수량 줄이기",
      plus: "수량 늘리기",
      total: "합계",
      checkout: "결제하기",
      cancel: "취소",
      close: "닫기",
      back: "이전",
      add: "담기",
      ice: "얼음 선택",
      iceLabels: ["보통", "적게", "없이"],
      sum: "주문 금액",
      review: "주문 확인",
      checkOrder: "선택한 메뉴를 확인해 주세요",
      card: "카드 결제",
      cardPrompt: "카드를 넣어 주세요",
      cardWait: "결제가 끝날 때까지 카드를 빼지 마세요",
      insert: "카드 넣기",
      paying: "결제 중입니다",
      wait: "잠시만 기다려 주세요",
      complete: "주문이 완료되었습니다",
      number: "주문 번호",
      receipt: "영수증",
      receiptPrompt: "영수증을 받아 주세요",
      done: "처음으로",
      confirmClear: "선택한 메뉴를 모두 취소할까요?",
      yes: "취소하기",
      no: "돌아가기",
      soldMax: "한 메뉴는 20개까지 주문할 수 있습니다",
      names: [
        "불고기덮밥",
        "비빔밥",
        "수제 돈가스",
        "떡볶이",
        "군만두",
        "청포도에이드",
      ],
      details: [
        "달콤한 불고기를 올린 따뜻한 한 그릇",
        "신선한 채소와 고소한 참기름",
        "바삭하게 튀긴 두툼한 돈가스",
        "쫄깃한 떡과 매콤한 양념",
        "노릇하게 구운 만두 6개",
        "청포도와 탄산의 시원한 만남",
      ],
    },
    jeolla: {
      language: "전라도",
      status: "주문 받고 있구만요",
      chooseLanguage: "어떤 말로 볼랑가요",
      categories: ["몽땅 보기", "밥 한 끼", "곁들일 거", "마실 거"],
      menuTitle: "드실 거 골라 보셔요",
      here: "여그서 먹기",
      takeout: "싸 갖고 가기",
      basket: "골라 놓은 거",
      empty: "드실 거 골라 주셔요",
      clear: "몽땅 비우기",
      remove: "빼기",
      quantity: "몇 개 담을랑가요",
      minus: "하나 빼 주셔요",
      plus: "하나 더 주셔요",
      total: "몽땅 얼마냐면",
      checkout: "계산허기",
      cancel: "그만두기",
      close: "닫아 주셔요",
      back: "뒤로 가기",
      add: "요걸로 담기",
      ice: "얼음은 얼만큼요",
      iceLabels: ["알맞게", "쪼까만", "빼 주셔요"],
      sum: "드실 거 값",
      review: "맞게 골랐는가요",
      checkOrder: "골라 놓은 거 맞는지 봐 주셔요",
      card: "카드로 계산허기",
      cardPrompt: "카드를 넣어 주셔요",
      cardWait: "계산 끝날 때까진 카드 빼지 마셔요",
      insert: "카드 넣기",
      paying: "계산허고 있구만요",
      wait: "쪼까만 기다려 주셔요",
      complete: "주문 잘 들어갔어라",
      number: "찾아갈 번호여",
      receipt: "영수증 받는 디",
      receiptPrompt: "영수증 챙겨 가셔요",
      done: "첨으로 가기",
      confirmClear: "골라 놓은 거 몽땅 비울까라?",
      yes: "몽땅 비우기",
      no: "그대로 두기",
      soldMax: "한 가지는 스무 개까지만 담아 주셔요",
      names: [
        "불고기 얹은 밥",
        "쓱쓱 비빈 밥",
        "바삭헌 돈가스",
        "매콤헌 떡볶이",
        "노릇헌 군만두",
        "시원헌 청포도에이드",
      ],
      details: [
        "달큰헌 불고기를 따순 밥 위에 얹었어라",
        "나물허고 참지름 넣고 쓱쓱 비벼 드셔요",
        "두툼허니 바삭허게 튀겼어라",
        "쫄깃헌 떡이 양념허고 만났어라",
        "노릇허게 구운 만두 여섯 개요",
        "청포도허고 탄산이 시원허구만요",
      ],
    },
    gyeongsang: {
      language: "경상도",
      status: "주문 받는 중입니더",
      chooseLanguage: "어떤 말로 볼랍니꺼",
      categories: ["다 보이소", "밥 묵을 거", "곁들일 거", "마실 거"],
      menuTitle: "드실 거 골라 주이소",
      here: "여서 묵기",
      takeout: "싸 가기",
      basket: "골라 담은 거",
      empty: "드실 거 골라 주이소",
      clear: "다 비우기",
      remove: "빼기",
      quantity: "몇 개 드릴까예",
      minus: "하나 빼 주이소",
      plus: "하나 더 주이소",
      total: "전부 얼만데예",
      checkout: "계산하이소",
      cancel: "그만할래예",
      close: "닫아 주이소",
      back: "뒤로 가기",
      add: "이걸로 담아 주이소",
      ice: "얼음 우예 넣을까예",
      iceLabels: ["알맞게", "쪼매만", "빼 주이소"],
      sum: "음식값",
      review: "맞게 담았는교",
      checkOrder: "골라 담은 거 맞는지 봐 주이소",
      card: "카드로 계산하이소",
      cardPrompt: "카드를 넣어 주이소",
      cardWait: "계산 끝날 때까지 카드 빼지 마이소",
      insert: "카드 넣기",
      paying: "계산하고 있습니더",
      wait: "쪼매만 기다리이소",
      complete: "주문 잘 들어갔습니더",
      number: "찾아갈 번호입니더",
      receipt: "영수증 챙기이소",
      receiptPrompt: "영수증 챙겨 가이소",
      done: "첨으로 가기",
      confirmClear: "골라 담은 거 다 비울까예?",
      yes: "다 비우기",
      no: "그대로 두이소",
      soldMax: "한 가지는 스무 개까지만 담아 주이소",
      names: [
        "불고기 올린 밥",
        "나물 비빈 밥",
        "바삭한 돈가스",
        "떡볶이",
        "군만두",
        "청포도에이드",
      ],
      details: [
        "달달한 불고기 올렸심더. 든든하게 묵으이소",
        "나물하고 참기름 넣고 쓱쓱 비비 묵으이소",
        "두툼하고 바삭하게 튀겼습니더",
        "쫄깃한 떡에 매콤한 양념입니더",
        "노릇하게 구운 만두 여섯 개입니더",
        "청포도랑 탄산이 시원합니더",
      ],
    },
    jeju: {
      language: "제주도",
      status: "주문 받고 이수다",
      chooseLanguage: "어떤 말로 볼 거우꽈",
      categories: ["몬딱 봅서", "밥 먹을 거", "곁들일 거", "마실 거"],
      menuTitle: "먹을 거 골라 줍서",
      here: "이디서 먹읍서",
      takeout: "싸 갑서",
      basket: "골라 담은 거",
      empty: "먹을 거 골라 줍서",
      clear: "몬딱 비웁서",
      remove: "빼 줍서",
      quantity: "몇 개 드릴 거우꽈",
      minus: "하나 빼 줍서",
      plus: "하나 더 줍서",
      total: "몬딱 합친 값",
      checkout: "계산해 줍서",
      cancel: "그만합서",
      close: "닫아 줍서",
      back: "뒤로 갑서",
      add: "이걸로 담아 줍서",
      ice: "얼음은 얼마나 넣을 거우꽈",
      iceLabels: ["알맞게 줍서", "호끔만 줍서", "빼 줍서"],
      sum: "먹을 거 값",
      review: "담은 거 맞수과",
      checkOrder: "담은 거 맞는지 봅서",
      card: "카드로 계산해 줍서",
      cardPrompt: "카드를 넣어 줍서",
      cardWait: "계산 끝날 때까지 카드는 빼지 맙서",
      insert: "카드 넣읍서",
      paying: "계산하고 이수다",
      wait: "호끔만 기다려 줍서",
      complete: "주문 받았수다",
      number: "찾아갈 번호우다",
      receipt: "영수증 받아 갑서",
      receiptPrompt: "영수증 받아 갑서",
      done: "처음으로 갑서",
      confirmClear: "담은 거 몬딱 비울 거우꽈?",
      yes: "몬딱 비웁서",
      no: "그대로 둡서",
      soldMax: "한 가지는 스무 개까지만 담아 줍서",
      names: [
        "괴기 얹은 밥",
        "나물 비빈 밥",
        "도새기 돈가스",
        "떡볶이",
        "군만두",
        "청포도 마실 거",
      ],
      details: [
        "괴기영 따뜻한 밥이우다. 맛 좋수다",
        "나물이영 참기름 넣엉 비빈 밥이우다",
        "도새기괴기 바삭하게 튀겼수다",
        "쫄깃한 떡이 매콤하우다",
        "노릇하게 구운 만두 여섯 개우다",
        "청포도영 탄산 넣은 마실 거우다",
      ],
    },
  };
  const $ = (s) => document.querySelector(s);
  const html = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const money = (value) => value.toLocaleString("ko-KR");
  const fresh = (locale) => ({
    locale,
    pendingLocale: null,
    category: "all",
    dining: "here",
    cart: [],
    phase: "menu",
    selected: null,
    draftQty: 1,
    draftIce: "normal",
    busy: false,
    revision: 0,
    responseCount: 0,
    calculationCount: 0,
    totalError: 0,
    receipt: null,
    alert: "",
  });
  const machines = { A: fresh("jeolla"), B: fresh("standard") };
  const serial = { A: 100, B: 200 };
  let activeSide = null;
  let overviewScroll = 0;
  const t = (side) => copy[machines[side].locale];
  const product = (id) => products.find((p) => p.id === id);
  const name = (side, id) =>
    t(side).names[products.findIndex((p) => p.id === id)];
  const detail = (side, id) =>
    t(side).details[products.findIndex((p) => p.id === id)];
  const total = (machine) =>
    machine.cart.reduce((sum, row) => sum + product(row.id).price * row.qty, 0);
  const billedTotal = (side) => total(machines[side]) + (side === "A" ? machines.A.totalError : 0);

  function recalculate(side, machine) {
    machine.totalError = 0;
    if (side !== "A" || !machine.cart.length) return;
    // Reproducible faults: the 2nd, 5th, 8th… nonempty cart edits are incorrect.
    // Rows stay intact; the same mistaken total carries through to the receipt.
    const calculation = ++machine.calculationCount;
    if (calculation % 3 === 2)
      machine.totalError = Math.floor(calculation / 3) % 2 === 0 ? 1000 : -500;
  }

  // Batch only A's scroll paints. Never stall the shared browser event loop or B.
  const legacyScroll = { target: null, top: 0, timer: null, touchY: null, touchTarget: null };
  function cancelLegacyScroll() {
    clearTimeout(legacyScroll.timer);
    legacyScroll.target = null;
    legacyScroll.timer = null;
    legacyScroll.touchTarget = null;
  }
  function legacyScroller(target) {
    if (activeSide !== "A" || machines.A.busy || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    const scroller = target.closest(".menu-scroll, .basket-list, .product-detail, .review-content, .complete-panel");
    return scroller && scroller.scrollHeight > scroller.clientHeight + 1 ? scroller : null;
  }
  function queueLegacyScroll(target, delta) {
    if (legacyScroll.target !== target || legacyScroll.timer === null) {
      clearTimeout(legacyScroll.timer);
      legacyScroll.timer = null;
      legacyScroll.target = target;
      legacyScroll.top = target.scrollTop;
    }
    const max = target.scrollHeight - target.clientHeight;
    legacyScroll.top = Math.max(0, Math.min(max, legacyScroll.top + delta));
    if (legacyScroll.timer !== null) return;
    legacyScroll.timer = setTimeout(() => {
      if (target.isConnected && activeSide === "A")
        target.scrollTo({ top: legacyScroll.top, behavior: "instant" });
      legacyScroll.timer = null;
    }, LEGACY_FRAME_MS);
  }
  const count = (machine) =>
    machine.cart.reduce((sum, row) => sum + row.qty, 0);
  const iceLabel = (side, ice) =>
    t(side).iceLabels[["normal", "less", "none"].indexOf(ice)];
  const button = (action, label, attrs = "") =>
    `<button type="button" data-action="${action}" ${attrs}>${label}</button>`;
  const photo = (id) => {
    const index = products.findIndex((p) => p.id === id);
    return `<svg class="food-photo" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><svg width="512" height="512" viewBox="${(index % 3) * 512} ${Math.floor(index / 3) * 512} 512 512" overflow="hidden"><image href="/assets/balance/meal-menu.png" width="1536" height="1024" /></svg></svg>`;
  };
  const icon = (type) => {
    const paths = {
      all: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
      meal: '<path d="M3 12h18c-1 6-4 8-9 8s-8-2-9-8ZM8 4v3m4-4v4m4-3v3M7 22h10"/>',
      side: '<path d="M4 12c0-5 4-8 8-8s8 3 8 8H4Zm0 0c0 5 4 8 8 8s8-3 8-8M8 6l1 6m3-8v8m4-6-1 6"/>',
      drink: '<path d="m6 8 2 13h8l2-13H6Zm7 0 1-5h5M5 8h14"/>',
      here: '<path d="M5 5v15m3-15v5H2V5m3 5v10m12 0V4c-4 1-5 6-4 9h4"/>',
      takeout: '<path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2"/>',
    };
    return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[type]}</svg>`;
  };
  const restaurantMark = '<svg class="restaurant-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false"><path d="M7 21h26c-1.6 9-6 12-13 12S8.6 30 7 21Z" stroke="currentColor" stroke-width="2"/><path d="M14 16c-4-4 4-5 1-10m6 10c-4-4 4-5 1-10m6 10c-4-4 4-5 1-10M13 36h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function setKioskFocus(side) {
    if (side === activeSide) return;
    const animatedSide = side || activeSide;
    const root = $(`#kiosk${animatedSide}`);
    const before = root.getBoundingClientRect();
    root.getAnimations().forEach((animation) => animation.cancel());
    if (side && !activeSide) overviewScroll = window.scrollY;
    activeSide = side;
    if (side) document.body.dataset.kioskFocus = side;
    else delete document.body.dataset.kioskFocus;
    $("#overviewBack").hidden = !side;
    $(".kiosk-stage").setAttribute("aria-label", side ? `${side} 주문 키오스크` : "주문 키오스크 두 대");
    for (const id of ["A", "B"]) {
      const terminal = $(`#kiosk${id}`);
      terminal.hidden = Boolean(side && id !== side);
      terminal.classList.toggle("is-focused", id === side);
      render(id);
    }
    window.scrollTo({ top: side ? 0 : overviewScroll, behavior: "instant" });
    const after = root.getBoundingClientRect();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.animate(
        [
          { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width})`, opacity: .85 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 360, easing: "cubic-bezier(.2,.75,.2,1)" },
      );
    }
    if (side) $("#overviewBack").focus({ preventScroll: true });
    else root.querySelector(".kiosk-focus-target")?.focus({ preventScroll: true });
  }

  function renderLanguage(side) {
    if (side === "B")
      return '<span class="fixed-language" aria-label="표준어">한국어</span>';
    const m = machines[side], c = t(side);
    const selected = m.pendingLocale || m.locale;
    return `<section class="locale-panel"><p class="locale-caption">${html(c.chooseLanguage)}</p><div class="locale-buttons" role="group" aria-label="${html(c.chooseLanguage)}">${Object.keys(copy).map((locale) => button("locale", `<span>${copy[locale].language}</span><i aria-hidden="true">${selected === locale ? "✓" : ""}</i>`, `data-value="${locale}" aria-pressed="${selected === locale}" ${m.busy ? "disabled" : ""}`)).join("")}</div></section>`;
  }

  function renderHeader(side) {
    const modern = side === "B";
    return `<header class="store-header"><div class="store-logo">${restaurantMark}<span class="store-brand"><strong>말맛식당</strong>${modern ? '<small>정성으로 차린 한 끼</small>' : ""}</span></div>${modern ? renderLanguage(side) : `<span class="legacy-state"><i aria-hidden="true"></i>${html(t(side).status)}</span>`}</header>`;
  }

  function renderNavigation(side) {
    const m = machines[side], c = t(side), modern = side === "B";
    const choice = (type, label) => modern ? `${icon(type)}<span>${html(label)}</span>` : html(label);
    return `<div class="dining-bar" role="group" aria-label="${html(c.here)} / ${html(c.takeout)}">${button("dining", choice("here", c.here), `data-value="here" aria-pressed="${m.dining === "here"}"`)}${button("dining", choice("takeout", c.takeout), `data-value="takeout" aria-pressed="${m.dining === "takeout"}"`)}</div><nav class="menu-tabs" aria-label="${html(c.menuTitle)}">${["all", "meal", "side", "drink"].map((category, index) => button("category", choice(category, c.categories[index]), `data-value="${category}" aria-pressed="${m.category === category}"`)).join("")}</nav>${modern ? "" : `<div class="legacy-menu-caption">${html(c.menuTitle)}</div>`}`;
  }

  function renderMenu(side) {
    const m = machines[side], modern = side === "B";
    const filtered = products.filter((p) => m.category === "all" || p.category === m.category);
    return `<div class="menu-scroll" tabindex="0" aria-label="${html(t(side).menuTitle)}"><div class="menu-grid">${filtered.map((p) => `<button type="button" class="menu-product ${p.id === "bulgogi" ? "is-popular" : ""}" data-action="product" data-id="${p.id}">${photo(p.id)}${modern && p.id === "bulgogi" ? '<span class="product-badge">인기</span>' : ""}<span class="product-text"><strong>${html(name(side, p.id))}</strong><small>${html(detail(side, p.id))}</small><b>${money(p.price)}<span>원</span></b></span>${modern ? '<span class="product-order-sign" aria-hidden="true">＋</span>' : ""}</button>`).join("")}</div></div>`;
  }

  function renderCart(side) {
    const m = machines[side],
      c = t(side);
    const rows = m.cart
      .map(
        (row, index) =>
          `<div class="basket-row">${side === "B" ? `<span class="basket-thumb">${photo(row.id)}</span>` : ""}<span class="basket-name">${html(name(side, row.id))}${row.id === "ade" ? `<small>${html(iceLabel(side, row.ice))}</small>` : ""}</span><div class="stepper">${button("decrease", "−", `data-index="${index}" aria-label="${html(c.minus)}"`)}<output>${row.qty}</output>${button("increase", "＋", `data-index="${index}" aria-label="${html(c.plus)}"`)}</div><span class="line-price">${money(product(row.id).price * row.qty)}</span>${button("remove", "×", `class="remove" data-index="${index}" aria-label="${html(c.remove)}"`)}</div>`,
      )
      .join("");
    return `<section class="basket ${m.cart.length ? "" : "is-empty"}" aria-label="${html(c.basket)}"><div class="basket-head"><strong>${html(c.basket)} <span>${count(m)}</span></strong>${button("clear", html(c.clear), m.cart.length ? "" : "disabled")}</div><div class="basket-list">${rows || `<p class="empty-basket">${html(c.empty)}</p>`}</div></section><div class="checkout-bar"><div><span>${html(c.total)}</span><strong>${money(billedTotal(side))}<small>원</small></strong></div>${button("checkout", `${html(c.checkout)} <span aria-hidden="true">›</span>`, `class="checkout" ${m.cart.length ? "" : "disabled"}`)}</div>`;
  }

  function orderRows(side, rows) {
    return rows
      .map(
        (row) =>
          `<div class="review-row"><span>${side === "B" ? `<span class="review-thumb">${photo(row.id)}</span>` : ""}<span>${html(name(side, row.id))}<small>${row.id === "ade" ? html(iceLabel(side, row.ice)) : ""}</small></span></span><b>× ${row.qty}</b><span>${money(product(row.id).price * row.qty)}원</span></div>`,
      )
      .join("");
  }

  function renderOverlay(side) {
    const m = machines[side],
      c = t(side);
    if (m.phase === "menu") return "";
    let content = "";
    if (m.phase === "product") {
      const p = product(m.selected);
      content = `<header class="overlay-heading"><h2 tabindex="-1">${html(name(side, p.id))}</h2>${button("back", "×", `class="icon-close" aria-label="${html(c.close)}"`)}</header><div class="product-detail">${photo(p.id)}<p>${html(detail(side, p.id))}</p><strong class="detail-price">${money(p.price)}<small>원</small></strong><div class="option-row"><span>${html(c.quantity)}</span><div class="stepper">${button("draft-minus", "−", `aria-label="${html(c.minus)}" ${m.draftQty === 1 ? "disabled" : ""}`)}<output>${m.draftQty}</output>${button("draft-plus", "＋", `aria-label="${html(c.plus)}" ${m.draftQty === 20 ? "disabled" : ""}`)}</div></div>${p.id === "ade" ? `<fieldset class="ice-options"><legend>${html(c.ice)}</legend>${["normal", "less", "none"].map((ice) => button("draft-ice", html(iceLabel(side, ice)), `data-value="${ice}" aria-pressed="${m.draftIce === ice}"`)).join("")}</fieldset>` : ""}</div><footer class="overlay-actions">${button("back", html(c.cancel), 'class="secondary"')}${button("add", `${html(c.add)} <b>${money(p.price * m.draftQty)}원</b>`, 'class="primary"')}</footer>`;
    } else if (m.phase === "clear") {
      content = `<div class="centered-panel"><h2 tabindex="-1">${html(c.confirmClear)}</h2><div class="clear-actions">${button("back", html(c.no), 'class="secondary"')}${button("clear-confirm", html(c.yes), 'class="primary"')}</div></div>`;
    } else if (m.phase === "checkout") {
      content = `<header class="overlay-heading"><h2 tabindex="-1">${html(c.review)}</h2>${button("back", "×", `class="icon-close" aria-label="${html(c.close)}"`)}</header><div class="review-content"><p class="review-help">${html(c.checkOrder)}</p><div class="dining-summary">${html(m.dining === "here" ? c.here : c.takeout)}</div>${orderRows(side, m.cart)}<div class="review-total"><span>${html(c.sum)}</span><strong>${money(billedTotal(side))}원</strong></div></div><footer class="overlay-actions">${button("back", html(c.back), 'class="secondary"')}${button("payment", html(c.card), 'class="primary"')}</footer>`;
    } else if (m.phase === "payment") {
      content = `<div class="centered-panel payment-panel"><h2 tabindex="-1">${html(c.cardPrompt)}</h2><strong class="payment-total">${money(billedTotal(side))}<small>원</small></strong>${button("pay", `<span class="payment-card-art" aria-hidden="true"><i></i><b>▥</b></span><span>${html(c.insert)} ↓</span>`, 'class="insert-card"')}<p>${html(c.cardWait)}</p>${button("checkout", html(c.back), 'class="secondary payment-back"')}</div>`;
    } else if (m.phase === "complete") {
      const r = m.receipt;
      content = `<div class="centered-panel complete-panel"><span class="success-mark" aria-hidden="true">✓</span><h2 tabindex="-1">${html(c.complete)}</h2><p>${html(c.number)}</p><strong class="order-number">${r.number}</strong><div class="receipt-preview"><strong>말맛식당</strong><small>${html(m.dining === "here" ? c.here : c.takeout)}</small>${orderRows(side, r.cart)}<div class="review-total"><span>${html(c.total)}</span><b>${money(r.total)}원</b></div></div><p class="receipt-prompt">${html(c.receiptPrompt)}</p>${button("restart", html(c.done), 'class="primary complete-done"')}</div>`;
    }
    return `<section class="screen-overlay" role="dialog" aria-label="${html(m.phase === "product" ? name(side, m.selected) : m.phase === "complete" ? c.complete : c.review)}">${content}</section>`;
  }

  function render(side, focus = false) {
    if (side === "A") cancelLegacyScroll();
    const isFocused = activeSide === side;
    const root = $(`#kiosk${side}`),
      m = machines[side],
      c = t(side);
    const previous = root.querySelector(".menu-scroll")?.scrollTop || 0;
    const basketScroll = root.querySelector(".basket-list")?.scrollTop || 0;
    const active = root.contains(document.activeElement)
      ? document.activeElement
      : null;
    const data = active?.dataset;
    const oldFocus = data?.action
      ? `[data-action="${data.action}"]${data.id ? `[data-id="${data.id}"]` : ""}${data.index !== undefined ? `[data-index="${data.index}"]` : ""}${data.value ? `[data-value="${data.value}"]` : ""}`
      : active?.matches("[data-focus-kiosk]")
        ? "[data-focus-kiosk]"
        : null;
    root.innerHTML = `
      <img class="terminal-photo" src="/assets/balance/kiosk-shell.png" alt="" aria-hidden="true" draggable="false" />
      <div class="screen-bezel" ${isFocused ? "" : "inert"}>
        <div class="touchscreen" data-language="${m.locale}" aria-label="${side} ${html(c.language)} 주문 화면" aria-busy="${m.busy}">
          <div class="store-ui" ${m.phase !== "menu" ? "inert" : ""}>
            ${renderHeader(side)}${side === "A" ? renderLanguage(side) : ""}${renderNavigation(side)}${renderMenu(side)}${renderCart(side)}
          </div>
          ${renderOverlay(side)}
          ${m.busy ? `<div class="busy-shade" role="status"><span class="loading-wheel" aria-hidden="true"></span><span>${html(m.phase === "payment" ? c.paying : c.wait)}</span></div>` : ""}
          ${m.alert ? `<div class="screen-alert" role="status">${html(m.alert)}</div>` : ""}
        </div>
      </div>
      <div class="hardware-layer" ${isFocused ? "" : "inert"}>
        <span class="receipt-caption" aria-hidden="true">${html(c.receipt)}</span>
        <div class="receipt-output">${m.phase === "complete" ? `<div class="paper-slip"><span>${html(c.number)}</span><strong>${m.receipt.number}</strong></div>` : ""}</div>
        <span class="card-caption" aria-hidden="true">${html(c.card)}</span>
        ${button("pay", '<span class="reader-active-light" aria-hidden="true"></span>', `class="physical-reader" aria-label="${html(c.insert)}" title="${html(c.insert)}" ${m.phase !== "payment" || m.busy ? "disabled" : ""}`)}
      </div>
      ${isFocused ? "" : `<button type="button" class="kiosk-focus-target" data-focus-kiosk="${side}" aria-label="${side === "A" ? "왼쪽" : "오른쪽"} 키오스크 확대" title="키오스크 확대"></button>`}`;
    root.querySelector(".menu-scroll").scrollTop = previous;
    root.querySelector(".basket-list").scrollTop = basketScroll;
    if (focus && isFocused) {
      const target =
        m.phase === "menu"
          ? root.querySelector(".menu-product")
          : root.querySelector(".screen-overlay h2");
      target?.focus({ preventScroll: true });
    } else if (oldFocus && (isFocused || oldFocus === "[data-focus-kiosk]"))
      root.querySelector(oldFocus)?.focus({ preventScroll: true });
  }

  function transact(side, change, focus = false) {
    const m = machines[side];
    if (m.busy) return;
    if (side === "B") {
      change(m);
      render(side, focus);
      return;
    }
    const localeFocus = document.activeElement?.matches('[data-action="locale"]')
      ? document.activeElement.dataset.value
      : null;
    m.busy = true;
    const delay = LEGACY_DELAYS[m.responseCount++ % LEGACY_DELAYS.length];
    const revision = ++m.revision;
    render(side);
    setTimeout(() => {
      if (machines[side] !== m || m.revision !== revision) return;
      m.busy = false;
      change(m);
      render(side, focus);
      if (localeFocus && activeSide === side)
        $(`#kiosk${side} [data-action="locale"][data-value="${localeFocus}"]`)?.focus({ preventScroll: true });
    }, delay);
  }

  function handle(side, control) {
    const m = machines[side],
      action = control.dataset.action,
      id = control.dataset.id,
      value = control.dataset.value;
    const index = Number(control.dataset.index);
    if (m.busy) return;
    if (action === "locale") {
      if (side !== "A" || !copy[value] || value === m.locale) return;
      m.pendingLocale = value;
      transact(side, (order) => {
        order.locale = value;
        order.pendingLocale = null;
        order.alert = "";
      });
    } else if (action === "product")
      transact(
        side,
        (order) => {
          order.selected = id;
          order.draftQty = 1;
          order.draftIce = "normal";
          order.phase = "product";
          order.alert = "";
        },
        true,
      );
    else if (action === "category")
      transact(
        side,
        (order) => {
          order.category = value;
        },
        false,
      );
    else if (action === "dining")
      transact(side, (order) => {
        order.dining = value;
      });
    else if (action === "draft-minus" || action === "draft-plus")
      transact(side, (order) => {
        order.draftQty = Math.max(
          1,
          Math.min(20, order.draftQty + (action === "draft-plus" ? 1 : -1)),
        );
      });
    else if (action === "draft-ice")
      transact(side, (order) => {
        order.draftIce = value;
      });
    else if (action === "back")
      transact(
        side,
        (order) => {
          order.phase = "menu";
          order.alert = "";
        },
        true,
      );
    else if (action === "add")
      transact(
        side,
        (order) => {
          const row = order.cart.find(
            (row) =>
              row.id === order.selected &&
              (row.id !== "ade" || row.ice === order.draftIce),
          );
          if (row && row.qty + order.draftQty > 20) {
            order.alert = t(side).soldMax;
            return;
          }
          if (row) row.qty += order.draftQty;
          else
            order.cart.push({
              id: order.selected,
              qty: order.draftQty,
              ice: order.draftIce,
            });
          recalculate(side, order);
          order.phase = "menu";
          order.alert = "";
        },
        true,
      );
    else if (
      ["increase", "decrease", "remove"].includes(action) &&
      m.cart[index]
    )
      transact(side, (order) => {
        if (action === "remove") order.cart.splice(index, 1);
        else if (action === "decrease" && order.cart[index].qty === 1)
          order.cart.splice(index, 1);
        else
          order.cart[index].qty = Math.max(
            1,
            Math.min(
              20,
              order.cart[index].qty + (action === "increase" ? 1 : -1),
            ),
          );
        recalculate(side, order);
      });
    else if (action === "clear" && m.cart.length)
      transact(
        side,
        (order) => {
          order.phase = "clear";
        },
        true,
      );
    else if (action === "clear-confirm")
      transact(
        side,
        (order) => {
          order.cart = [];
          recalculate(side, order);
          order.phase = "menu";
        },
        true,
      );
    else if (action === "checkout" && m.cart.length)
      transact(
        side,
        (order) => {
          order.phase = "checkout";
        },
        true,
      );
    else if (action === "payment" && m.cart.length)
      transact(
        side,
        (order) => {
          order.phase = "payment";
        },
        true,
      );
    else if (action === "pay" && m.phase === "payment") {
      m.busy = true;
      const revision = ++m.revision;
      render(side);
      setTimeout(
        () => {
          if (machines[side] !== m || m.revision !== revision) return;
          m.busy = false;
          m.receipt = {
            number: ++serial[side],
            cart: m.cart.map((row) => ({ ...row })),
            total: billedTotal(side),
          };
          m.phase = "complete";
          render(side, true);
          if (activeSide === side && window.scrollY > 0)
            window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        },
        side === "A" ? 3200 : 600,
      );
    } else if (action === "restart") {
      machines[side] = fresh(m.locale);
      render(side, true);
    }
  }

  $("#overviewBack").addEventListener("click", () => setKioskFocus(null));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeSide && !event.defaultPrevented && !event.target.matches("select")) {
      setKioskFocus(null);
    }
  });

  for (const side of ["A", "B"]) {
    const root = $(`#kiosk${side}`);
    if (side === "A") {
      root.addEventListener("wheel", (event) => {
        if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        const scroller = legacyScroller(event.target);
        if (!scroller) return;
        event.preventDefault();
        const unit = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? scroller.clientHeight : 1;
        queueLegacyScroll(scroller, event.deltaY * unit);
      }, { passive: false });
      root.addEventListener("touchstart", (event) => {
        legacyScroll.touchTarget = event.touches.length === 1 ? legacyScroller(event.target) : null;
        legacyScroll.touchY = event.touches[0]?.clientY;
      }, { passive: true });
      root.addEventListener("touchmove", (event) => {
        if (event.touches.length !== 1 || !legacyScroll.touchTarget) return;
        event.preventDefault();
        const y = event.touches[0].clientY;
        queueLegacyScroll(legacyScroll.touchTarget, legacyScroll.touchY - y);
        legacyScroll.touchY = y;
      }, { passive: false });
      const finishTouch = () => { legacyScroll.touchTarget = null; };
      root.addEventListener("touchend", finishTouch, { passive: true });
      root.addEventListener("touchcancel", finishTouch, { passive: true });
    }
    root.addEventListener("click", (event) => {
      if (event.target.closest("[data-focus-kiosk]")) {
        setKioskFocus(side);
        return;
      }
      if (activeSide !== side) return;
      const control = event.target.closest("button[data-action]");
      if (control && !control.disabled && !control.closest("[inert]"))
        handle(side, control);
    });
    root.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !machines[side].busy &&
        ["product", "checkout", "clear"].includes(machines[side].phase)
      ) {
        event.preventDefault();
        event.stopPropagation();
        machines[side].phase = "menu";
        render(side, true);
      }
    });
    render(side);
  }
})();
