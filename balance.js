(() => {
  "use strict";

  // Equal-budget classroom scenario: language coverage vs interface optimization.
  // Performance and billing faults belong to product A, regardless of locale.
  // A's regional locales also hit scripted system errors (see faultCopy): the
  // budget spent on language coverage left little for error handling.
  // These are classroom simulation conditions, not properties of regional languages.
  const LEGACY_DELAYS = [1000, 1500, 900, 2100, 1200, 1700];
  const LEGACY_FRAME_MS = 150;
  const RECEIPT_PRINT_MS = 1800;
  const FAULT_RESET_SECONDS = 4;
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
      popular: "인기",
      won: "원",
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
    // Stage 3: the translation kiosk's foreign-language screens.
    en: {
      language: "English",
      status: "Now ordering",
      chooseLanguage: "Language",
      categories: ["All", "Meals", "Sides", "Drinks"],
      menuTitle: "Please choose your menu",
      here: "Eat here",
      takeout: "Take out",
      basket: "Your order",
      empty: "Please choose your menu",
      clear: "Cancel all",
      remove: "Remove",
      quantity: "Quantity",
      minus: "Decrease quantity",
      plus: "Increase quantity",
      total: "Total",
      checkout: "Pay",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      add: "Add",
      ice: "Ice",
      iceLabels: ["Regular", "Less", "No ice"],
      sum: "Order total",
      review: "Check your order",
      checkOrder: "Please check your order",
      card: "Pay by card",
      cardPrompt: "Please insert your card",
      cardWait: "Do not remove your card until payment is complete",
      insert: "Insert card",
      paying: "Processing payment",
      wait: "Please wait",
      complete: "Your order is complete",
      number: "Order number",
      receipt: "Receipt",
      receiptPrompt: "Please take your receipt",
      done: "Home",
      confirmClear: "Cancel all items?",
      yes: "Cancel all",
      no: "Go back",
      soldMax: "You can order up to 20 of each item",
      popular: "Best",
      won: "KRW",
      names: ["Bulgogi Rice Bowl", "Bibimbap", "Pork Cutlet", "Tteokbokki", "Fried Dumplings", "Green Grape Ade"],
      details: [
        "Sweet bulgogi beef over warm rice",
        "Fresh vegetables with sesame oil",
        "Thick, crispy fried pork cutlet",
        "Chewy rice cakes in spicy sauce",
        "Six pan-fried dumplings",
        "Green grape with sparkling water",
      ],
    },
    zh: {
      language: "中文",
      status: "正在点餐",
      chooseLanguage: "语言",
      categories: ["全部", "主食", "小吃", "饮料"],
      menuTitle: "请选择菜单",
      here: "堂食",
      takeout: "打包",
      basket: "已选菜单",
      empty: "请选择菜单",
      clear: "全部取消",
      remove: "删除",
      quantity: "数量",
      minus: "减少数量",
      plus: "增加数量",
      total: "合计",
      checkout: "结账",
      cancel: "取消",
      close: "关闭",
      back: "返回",
      add: "加入",
      ice: "冰块",
      iceLabels: ["正常", "少冰", "去冰"],
      sum: "订单金额",
      review: "确认订单",
      checkOrder: "请确认所选菜单",
      card: "刷卡支付",
      cardPrompt: "请插入银行卡",
      cardWait: "支付完成前请勿拔出银行卡",
      insert: "插入银行卡",
      paying: "正在支付",
      wait: "请稍候",
      complete: "点餐完成",
      number: "取餐号",
      receipt: "收据",
      receiptPrompt: "请取走收据",
      done: "返回首页",
      confirmClear: "要取消全部菜单吗？",
      yes: "全部取消",
      no: "返回",
      soldMax: "每种菜单最多可点20份",
      popular: "人气",
      won: "韩元",
      names: ["烤肉盖饭", "拌饭", "炸猪排", "炒年糕", "煎饺", "青葡萄气泡饮"],
      details: [
        "甜烤牛肉配热米饭",
        "新鲜蔬菜配香油",
        "厚切酥脆炸猪排",
        "Q弹年糕配辣酱",
        "六个香煎饺子",
        "青葡萄加气泡水",
      ],
    },
    ja: {
      language: "日本語",
      status: "ご注文受付中",
      chooseLanguage: "言語",
      categories: ["すべて", "お食事", "サイド", "ドリンク"],
      menuTitle: "メニューをお選びください",
      here: "店内",
      takeout: "持ち帰り",
      basket: "選んだメニュー",
      empty: "メニューをお選びください",
      clear: "すべて取消",
      remove: "削除",
      quantity: "数量",
      minus: "数量を減らす",
      plus: "数量を増やす",
      total: "合計",
      checkout: "お会計",
      cancel: "キャンセル",
      close: "閉じる",
      back: "戻る",
      add: "追加",
      ice: "氷",
      iceLabels: ["普通", "少なめ", "なし"],
      sum: "ご注文金額",
      review: "ご注文の確認",
      checkOrder: "選んだメニューをご確認ください",
      card: "カード払い",
      cardPrompt: "カードを入れてください",
      cardWait: "お支払いが終わるまでカードを抜かないでください",
      insert: "カードを入れる",
      paying: "お支払い中です",
      wait: "少々お待ちください",
      complete: "ご注文が完了しました",
      number: "注文番号",
      receipt: "レシート",
      receiptPrompt: "レシートをお取りください",
      done: "最初に戻る",
      confirmClear: "すべて取り消しますか？",
      yes: "すべて取消",
      no: "戻る",
      soldMax: "1つのメニューは20個までご注文いただけます",
      popular: "人気",
      won: "ウォン",
      names: ["プルコギ丼", "ビビンバ", "とんかつ", "トッポッキ", "焼き餃子", "マスカットエード"],
      details: [
        "甘いプルコギを温かいご飯にのせて",
        "新鮮な野菜とごま油",
        "厚切りでサクサクのとんかつ",
        "もちもちのお餅と辛いタレ",
        "こんがり焼いた餃子6個",
        "マスカットと炭酸の爽やかな味",
      ],
    },
  };
  const DIALECTS = ["standard", "jeolla", "gyeongsang", "jeju"];
  const TRANSLATIONS = ["standard", "en", "zh", "ja"];
  const LANG_ATTR = { en: "en", zh: "zh", ja: "ja" };

  // Stage 3's foreign-tourist role: Korean screens appear in a script the
  // visitor cannot read. Digits stay so prices remain legible.
  const unreadable = (value) =>
    Array.isArray(value)
      ? value.map(unreadable)
      : String(value).replace(/[가-힣]/g, (ch) => {
          const code = ch.charCodeAt(0);
          return String.fromCharCode(0x10d0 + (code % 33), 0x10d0 + ((code >> 3) % 33));
        });
  const unreadableCopy = Object.fromEntries(
    Object.entries(copy.standard).map(([key, value]) => [key, unreadable(value)]),
  );

  const STAGES = {
    1: {
      title: "다양성 vs 정확성",
      left: "사투리도 알아듣는 기기",
      right: "표준어만 정확한 기기",
      key: "1t5g4lv",
    },
    2: {
      title: "심미성 vs 접근성",
      left: "예쁜 디자인 기기",
      right: "잘 보이는 기기",
      key: "15ohe0q",
    },
    3: {
      title: "공정성 vs 비용",
      left: "번역 기능에 예산을 쓴 기기",
      right: "음성 안내에 예산을 쓴 기기",
      key: "1jiaydn",
    },
  };
  // Classroom pacing only: hashed so the next password is not readable at a glance.
  const passKey = (value) => {
    let h = 0x811c9dc5;
    for (const ch of value.replace(/\s/g, "").normalize("NFC")) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(36);
  };
  const store = {
    get(key) {
      try { return sessionStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, value); } catch {}
    },
  };
  const unlocked = new Set((store.get("balance-unlocked") || "").split(",").filter((n) => STAGES[n]).map(Number));
  let stage = 0;
  let vision = "normal";
  let role = "foreign";
  const roleCopy = {
    foreign: { label: "외국인 관광객", note: "한글을 읽지 못하고 영어는 읽을 수 있어요." },
    blind: { label: "시각장애인 손님", note: "화면이 보이지 않아요. 손으로 눌러 보세요." },
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
  // Kiosk-screen currency unit; dialect copies fall back to the standard "원".
  const won = (side) => html(t(side).won || "원");
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
    receiptTaken: false,
    receiptGone: false,
    cardInserted: false,
    fault: null,
    alert: "",
  });
  const machines = { A: fresh("jeolla"), B: fresh("standard") };
  const serial = { A: 100, B: 200 };

  // The same order mission on both devices so students can compare outcomes.
  const mission = {
    dining: "takeout",
    items: [
      { id: "bulgogi", qty: 1 },
      { id: "dumpling", qty: 1 },
      { id: "ade", qty: 1, ice: "less" },
    ],
  };
  // Keyed by stage (and stage 3's role) so switching back keeps earlier results.
  const missionResults = {};
  const resultKey = (side) => `${stage}:${stage === 3 ? role : ""}:${side}`;

  // Scripted per order run in A's regional locales: the 2nd add, the 1st order
  // review and the 1st payment fail. Counters survive the payment reset so the
  // order can still be finished, and clear when a completed order restarts.
  const faults = { add: 0, checkout: 0, pay: 0, seen: 0 };
  const faultCopy = {
    add: {
      code: "E-102",
      title: "메뉴를 담지 못했습니다",
      body: "지역말 메뉴 정보를 불러오는 중 문제가 생겼습니다. 메뉴를 다시 담아 주세요.",
    },
    checkout: {
      code: "E-204",
      title: "주문 확인 화면을 열 수 없습니다",
      body: "지역말 화면을 만드는 중 응답이 없습니다. 결제하기를 다시 눌러 주세요.",
    },
    pay: {
      code: "E-503",
      title: "결제 오류로 주문이 취소되었습니다",
      body: "카드 승인 결과를 처리하지 못했습니다. 담은 메뉴가 모두 지워지고 처음 화면으로 돌아갑니다.",
      reset: true,
    },
  };
  const FAULT_NOTE =
    "이 기기는 한정된 개발비를 지역말 지원에 먼저 써서, 오류를 처리하는 기능을 충분히 만들지 못했습니다.";
  // Stage 1's left kiosk is the slow, error-prone legacy product.
  const legacy = (side) => stage === 1 && side === "A";
  const dialect = (side) => legacy(side) && machines.A.locale !== "standard";
  const voiceMode = (side) => stage === 3 && role === "blind" && side === "B";
  let activeSide = null;
  let overviewScroll = 0;
  const t = (side) =>
    stage === 3 && role === "foreign" && machines[side].locale === "standard"
      ? unreadableCopy
      : copy[machines[side].locale];
  const product = (id) => products.find((p) => p.id === id);
  const name = (side, id) =>
    t(side).names[products.findIndex((p) => p.id === id)];
  const detail = (side, id) =>
    t(side).details[products.findIndex((p) => p.id === id)];
  const total = (machine) =>
    machine.cart.reduce((sum, row) => sum + product(row.id).price * row.qty, 0);
  const billedTotal = (side) => total(machines[side]) + (legacy(side) ? machines.A.totalError : 0);

  function recalculate(side, machine) {
    machine.totalError = 0;
    if (!legacy(side) || !machine.cart.length) return;
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
    if (activeSide !== "A" || !legacy("A") || machines.A.busy || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
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
    if (side && voiceMode(side)) speak(screenSpeech(side));
    else if (!side) stopVoice();
    else root.querySelector(".kiosk-focus-target")?.focus({ preventScroll: true });
  }

  function renderLanguage(side) {
    const m = machines[side], c = t(side);
    const selected = m.pendingLocale || m.locale;
    if (legacy(side))
      return `<section class="locale-panel"><p class="locale-caption">${html(c.chooseLanguage)}</p><div class="locale-buttons" role="group" aria-label="${html(c.chooseLanguage)}">${DIALECTS.map((locale) => button("locale", `<span>${copy[locale].language}</span><i aria-hidden="true">${selected === locale ? "✓" : ""}</i>`, `data-value="${locale}" aria-pressed="${selected === locale}" ${m.busy ? "disabled" : ""}`)).join("")}</div></section>`;
    if (stage === 3 && side === "A")
      return `<div class="translate-buttons" role="group" aria-label="Language">${TRANSLATIONS.map((locale) => button("locale", locale === "standard" ? "한국어" : copy[locale].language, `data-value="${locale}" aria-pressed="${selected === locale}" ${LANG_ATTR[locale] ? `lang="${LANG_ATTR[locale]}"` : 'lang="ko"'}`)).join("")}</div>`;
    if (stage === 3 && side === "B")
      return `<span class="voice-badge" aria-label="음성 안내 지원"><span aria-hidden="true">🔊</span>음성 안내</span>`;
    return '<span class="fixed-language" aria-label="표준어">한국어</span>';
  }

  function renderHeader(side) {
    const modern = !legacy(side);
    return `<header class="store-header"><div class="store-logo">${restaurantMark}<span class="store-brand"><strong>말맛식당</strong>${modern ? '<small>정성으로 차린 한 끼</small>' : ""}</span></div>${modern ? renderLanguage(side) : `<span class="legacy-state"><i aria-hidden="true"></i>${html(t(side).status)}</span>`}</header>`;
  }

  function renderNavigation(side) {
    const m = machines[side], c = t(side), modern = !legacy(side);
    const choice = (type, label) => modern ? `${icon(type)}<span>${html(label)}</span>` : html(label);
    return `<div class="dining-bar" role="group" aria-label="${html(c.here)} / ${html(c.takeout)}">${button("dining", choice("here", c.here), `data-value="here" aria-pressed="${m.dining === "here"}"`)}${button("dining", choice("takeout", c.takeout), `data-value="takeout" aria-pressed="${m.dining === "takeout"}"`)}</div><nav class="menu-tabs" aria-label="${html(c.menuTitle)}">${["all", "meal", "side", "drink"].map((category, index) => button("category", choice(category, c.categories[index]), `data-value="${category}" aria-pressed="${m.category === category}"`)).join("")}</nav>${modern ? "" : `<div class="legacy-menu-caption">${html(c.menuTitle)}</div>`}`;
  }

  function renderMenu(side) {
    const m = machines[side], modern = !legacy(side);
    const filtered = products.filter((p) => m.category === "all" || p.category === m.category);
    return `<div class="menu-scroll" tabindex="0" aria-label="${html(t(side).menuTitle)}"><div class="menu-grid">${filtered.map((p) => `<button type="button" class="menu-product ${p.id === "bulgogi" ? "is-popular" : ""}" data-action="product" data-id="${p.id}">${photo(p.id)}${modern && p.id === "bulgogi" ? `<span class="product-badge">${html(t(side).popular || "인기")}</span>` : ""}<span class="product-text"><strong>${html(name(side, p.id))}</strong><small>${html(detail(side, p.id))}</small><b>${money(p.price)}<span>${won(side)}</span></b></span>${modern ? '<span class="product-order-sign" aria-hidden="true">＋</span>' : ""}</button>`).join("")}</div></div>`;
  }

  function renderCart(side) {
    const m = machines[side],
      c = t(side);
    const rows = m.cart
      .map(
        (row, index) =>
          `<div class="basket-row">${!legacy(side) ? `<span class="basket-thumb">${photo(row.id)}</span>` : ""}<span class="basket-name">${html(name(side, row.id))}${row.id === "ade" ? `<small>${html(iceLabel(side, row.ice))}</small>` : ""}</span><div class="stepper">${button("decrease", "−", `data-index="${index}" aria-label="${html(c.minus)}"`)}<output>${row.qty}</output>${button("increase", "＋", `data-index="${index}" aria-label="${html(c.plus)}"`)}</div><span class="line-price">${money(product(row.id).price * row.qty)}</span>${button("remove", "×", `class="remove" data-index="${index}" aria-label="${html(c.remove)}"`)}</div>`,
      )
      .join("");
    return `<section class="basket ${m.cart.length ? "" : "is-empty"}" aria-label="${html(c.basket)}"><div class="basket-head"><strong>${html(c.basket)} <span>${count(m)}</span></strong>${button("clear", html(c.clear), m.cart.length ? "" : "disabled")}</div><div class="basket-list">${rows || `<p class="empty-basket">${html(c.empty)}</p>`}</div></section><div class="checkout-bar"><div><span>${html(c.total)}</span><strong>${money(billedTotal(side))}<small>${won(side)}</small></strong></div>${button("checkout", `${html(c.checkout)} <span aria-hidden="true">›</span>`, `class="checkout" ${m.cart.length ? "" : "disabled"}`)}</div>`;
  }

  function orderRows(side, rows) {
    return rows
      .map(
        (row) =>
          `<div class="review-row"><span>${!legacy(side) ? `<span class="review-thumb">${photo(row.id)}</span>` : ""}<span>${html(name(side, row.id))}<small>${row.id === "ade" ? html(iceLabel(side, row.ice)) : ""}</small></span></span><b>× ${row.qty}</b><span>${money(product(row.id).price * row.qty)}${won(side)}</span></div>`,
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
      content = `<header class="overlay-heading"><h2 tabindex="-1">${html(name(side, p.id))}</h2>${button("back", "×", `class="icon-close" aria-label="${html(c.close)}"`)}</header><div class="product-detail">${photo(p.id)}<p>${html(detail(side, p.id))}</p><strong class="detail-price">${money(p.price)}<small>${won(side)}</small></strong><div class="option-row"><span>${html(c.quantity)}</span><div class="stepper">${button("draft-minus", "−", `aria-label="${html(c.minus)}" ${m.draftQty === 1 ? "disabled" : ""}`)}<output>${m.draftQty}</output>${button("draft-plus", "＋", `aria-label="${html(c.plus)}" ${m.draftQty === 20 ? "disabled" : ""}`)}</div></div>${p.id === "ade" ? `<fieldset class="ice-options"><legend>${html(c.ice)}</legend>${["normal", "less", "none"].map((ice) => button("draft-ice", html(iceLabel(side, ice)), `data-value="${ice}" aria-pressed="${m.draftIce === ice}"`)).join("")}</fieldset>` : ""}</div><footer class="overlay-actions">${button("back", html(c.cancel), 'class="secondary"')}${button("add", `${html(c.add)} <b>${money(p.price * m.draftQty)}${won(side)}</b>`, 'class="primary"')}</footer>`;
    } else if (m.phase === "clear") {
      content = `<div class="centered-panel"><h2 tabindex="-1">${html(c.confirmClear)}</h2><div class="clear-actions">${button("back", html(c.no), 'class="secondary"')}${button("clear-confirm", html(c.yes), 'class="primary"')}</div></div>`;
    } else if (m.phase === "checkout") {
      content = `<header class="overlay-heading"><h2 tabindex="-1">${html(c.review)}</h2>${button("back", "×", `class="icon-close" aria-label="${html(c.close)}"`)}</header><div class="review-content"><p class="review-help">${html(c.checkOrder)}</p><div class="dining-summary">${html(m.dining === "here" ? c.here : c.takeout)}</div>${orderRows(side, m.cart)}<div class="review-total"><span>${html(c.sum)}</span><strong>${money(billedTotal(side))}${won(side)}</strong></div></div><footer class="overlay-actions">${button("back", html(c.back), 'class="secondary"')}${button("payment", html(c.card), 'class="primary"')}</footer>`;
    } else if (m.phase === "payment") {
      content = `<div class="centered-panel payment-panel"><h2 tabindex="-1">${html(c.cardPrompt)}</h2><strong class="payment-total">${money(billedTotal(side))}<small>${won(side)}</small></strong><div class="insert-card"><span class="payment-card-art" aria-hidden="true"><i></i><b>▥</b></span><span>${html(c.insert)} ↓</span></div><p>${html(c.cardWait)}</p>${button("checkout", html(c.back), `class="secondary payment-back" ${m.cardInserted ? "disabled" : ""}`)}</div>`;
    } else if (m.phase === "fault") {
      const f = faultCopy[m.fault.kind];
      content = `<div class="centered-panel fault-panel"><span class="fault-mark" aria-hidden="true">!</span><p class="fault-code">시스템 오류 ${f.code}</p><h2 tabindex="-1">${html(f.title)}</h2><p class="fault-body">${html(f.body)}</p><p class="fault-note">${html(FAULT_NOTE)}</p>${f.reset ? `<p class="fault-countdown" aria-live="polite">${m.fault.seconds}초 뒤 처음 화면으로 돌아갑니다</p>` : ""}${button("fault-ok", f.reset ? "처음으로" : "확인", 'class="primary"')}</div>`;
    } else if (m.phase === "complete") {
      const r = m.receipt;
      content = `<div class="centered-panel complete-panel"><span class="success-mark" aria-hidden="true">✓</span><h2 tabindex="-1">${html(c.complete)}</h2><p>${html(c.number)}</p><strong class="order-number">${r.number}</strong><div class="receipt-preview"><strong>말맛식당</strong><small>${html(m.dining === "here" ? c.here : c.takeout)}</small>${orderRows(side, r.cart)}<div class="review-total"><span>${html(c.total)}</span><b>${money(r.total)}${won(side)}</b></div></div><p class="receipt-prompt">${html(c.receiptPrompt)}</p>${button("restart", html(c.done), 'class="primary complete-done"')}</div>`;
    }
    if (m.phase === "fault")
      return `<section class="screen-overlay fault-overlay" role="alertdialog" aria-label="시스템 오류">${content}</section>`;
    return `<section class="screen-overlay" role="dialog" aria-label="${html(m.phase === "product" ? name(side, m.selected) : m.phase === "complete" ? c.complete : c.review)}">${content}</section>`;
  }

  function renderReceipt(side) {
    const m = machines[side],
      c = t(side),
      r = m.receipt;
    if (m.phase !== "complete" || !r || m.receiptGone) return "";
    // Re-renders keep the feed animation where it was instead of restarting it.
    const elapsed = Date.now() - r.printedAt;
    const printing = elapsed < RECEIPT_PRINT_MS;
    const rows = r.cart
      .map(
        (row) =>
          `<span class="receipt-paper-row"><span>${html(name(side, row.id))}${row.id === "ade" ? ` (${html(iceLabel(side, row.ice))})` : ""}</span><b>×${row.qty}</b><span>${money(product(row.id).price * row.qty)}</span></span>`,
      )
      .join("");
    return `<button type="button" class="receipt-paper ${m.receiptTaken ? "is-taken" : ""}" data-action="take-receipt" data-printing="${printing}" style="--print-elapsed: -${printing ? elapsed : 0}ms" aria-label="${html(c.receipt)}"><span class="receipt-paper-head"><strong>말맛식당</strong><small>${html(m.dining === "here" ? c.here : c.takeout)}</small></span>${rows}<span class="receipt-paper-total"><span>${html(c.total)}</span><b>${money(r.total)}${won(side)}</b></span><span class="receipt-paper-number"><span>${html(c.number)}</span><strong>${r.number}</strong></span></button>`;
  }

  function renderMission() {
    if (!stage) return;
    const info = STAGES[stage];
    const item = (row) => {
      const index = products.findIndex((p) => p.id === row.id);
      return `<li>${html(copy.standard.names[index])} ${row.qty}개${row.ice ? ` <small>(얼음 ${html(copy.standard.iceLabels[["normal", "less", "none"].indexOf(row.ice)])})</small>` : ""}</li>`;
    };
    const status = (side) => {
      const r = missionResults[resultKey(side)];
      if (!r) return '<span class="mission-status is-pending">주문 중</span>';
      if (!r.matches)
        return '<span class="mission-status is-bad">주문 내용이 미션과 달라요</span>';
      if (r.billed !== r.expected)
        return `<span class="mission-status is-warn">주문은 맞았지만 ${money(r.billed)}원이 결제됐어요 <small>(맞는 금액 ${money(r.expected)}원)</small></span>`;
      return `<span class="mission-status is-good">미션 성공 · ${money(r.billed)}원</span>`;
    };
    let tools = "";
    if (stage === 2)
      tools = `<div class="mission-tools"><button type="button" data-mission="vision" aria-pressed="${vision === "low"}">어르신 눈으로 보기 <b>${vision === "low" ? "켜짐" : "꺼짐"}</b></button></div>`;
    else if (stage === 3)
      tools = `<div class="mission-tools" role="group" aria-label="손님 역할"><span>나는</span>${Object.entries(roleCopy).map(([key, r]) => `<button type="button" data-mission="role" data-value="${key}" aria-pressed="${role === key}">${r.label}</button>`).join("")}<small>${html(roleCopy[role].note)}</small></div>`;
    $("#mission").innerHTML = `<h2>주문 미션</h2><ol><li>포장</li>${mission.items.map(item).join("")}<li>카드로 결제</li></ol>${tools}<dl><div><dt>왼쪽 · ${html(info.left)}</dt><dd>${status("A")}${stage === 1 && faults.seen ? `<small class="mission-faults">오류 ${faults.seen}번</small>` : ""}</dd></div><div><dt>오른쪽 · ${html(info.right)}</dt><dd>${status("B")}</dd></div></dl>`;
  }

  function scoreMission(side) {
    const m = machines[side],
      r = m.receipt;
    const matches =
      m.dining === mission.dining &&
      r.cart.length === mission.items.length &&
      mission.items.every((want) =>
        r.cart.some(
          (row) =>
            row.id === want.id &&
            row.qty === want.qty &&
            (!want.ice || row.ice === want.ice),
        ),
      );
    const expected = r.cart.reduce(
      (sum, row) => sum + product(row.id).price * row.qty,
      0,
    );
    missionResults[resultKey(side)] = { matches, billed: r.total, expected };
    renderMission();
  }

  function setFault(order, kind) {
    order.phase = "fault";
    order.fault = { kind, seconds: FAULT_RESET_SECONDS };
    order.alert = "";
    faults.seen++;
    renderMission();
  }

  function resetAfterFault(side) {
    machines[side] = fresh(machines[side].locale);
    render(side, true);
  }

  // The payment fault wipes the order and counts down back to the first screen.
  function showResetFault(side, kind) {
    const m = machines[side];
    setFault(m, kind);
    render(side, true);
    const tick = () => {
      if (machines[side] !== m || m.phase !== "fault") return;
      if (--m.fault.seconds <= 0) return resetAfterFault(side);
      render(side);
      setTimeout(tick, 1000);
    };
    setTimeout(tick, 1000);
  }

  function pay(side) {
    const m = machines[side];
    if (m.busy || m.phase !== "payment" || activeSide !== side) return;
    m.busy = true;
    m.cardInserted = true;
    const revision = ++m.revision;
    render(side);
    if (voiceMode(side)) speak(t(side).paying);
    setTimeout(
      () => {
        if (machines[side] !== m || m.revision !== revision) return;
        m.busy = false;
        m.cardInserted = false;
        if (dialect(side) && faults.pay++ === 0) {
          showResetFault(side, "pay");
          return;
        }
        m.receipt = {
          number: ++serial[side],
          cart: m.cart.map((row) => ({ ...row })),
          total: billedTotal(side),
          printedAt: Date.now(),
        };
        m.phase = "complete";
        scoreMission(side);
        render(side, true);
        if (voiceMode(side)) speak(screenSpeech(side));
        // Keep the printer slot in view so the receipt feed is visible.
        if (activeSide === side)
          $(`#kiosk${side} .receipt-output`).scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      },
      legacy(side) ? 3200 : 600,
    );
  }

  // Stage 3's voice-guidance kiosk: the first touch reads a control aloud, a
  // second touch on the same control activates it (as on screen-reader phones).
  const voice = { key: null, at: 0, text: "" };
  function speak(text) {
    voice.text = text;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {}
    const caption = $("#kioskB .voice-caption-text");
    if (caption) caption.textContent = text;
  }
  function stopVoice() {
    try { window.speechSynthesis.cancel(); } catch {}
    voice.key = null;
    voice.text = "";
  }
  const controlLabel = (control) =>
    (control.getAttribute("aria-label") || control.innerText || "")
      .replace(/[＋›×↓✓]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  function screenSpeech(side) {
    const m = machines[side];
    const items = m.cart.map((row) => `${name(side, row.id)} ${row.qty}개`).join(", ");
    if (m.phase === "menu")
      return m.cart.length
        ? `메뉴 화면입니다. 담은 메뉴 ${count(m)}개, 합계 ${money(total(m))}원. 결제하기 버튼은 화면 맨 아래 오른쪽에 있어요.`
        : "메뉴 화면입니다. 위쪽에 매장 식사와 포장 버튼, 가운데에 메뉴가 있어요. 한 번 누르면 읽어 주고, 같은 곳을 한 번 더 누르면 선택돼요.";
    if (m.phase === "product") {
      const p = product(m.selected);
      return `${name(side, p.id)}, ${money(p.price)}원. 수량 ${m.draftQty}개.${p.id === "ade" ? " 가운데에 얼음 선택 버튼이 있어요." : ""} 맨 아래 왼쪽은 취소, 오른쪽은 담기 버튼이에요.`;
    }
    if (m.phase === "clear") return "담은 메뉴를 모두 취소할까요? 왼쪽은 돌아가기, 오른쪽은 취소하기예요.";
    if (m.phase === "checkout")
      return `주문 확인 화면입니다. ${m.dining === "here" ? "매장 식사" : "포장"}, ${items}. 합계 ${money(total(m))}원. 맨 아래 오른쪽 카드 결제 버튼을 눌러 주세요.`;
    if (m.phase === "payment")
      return `결제 금액 ${money(total(m))}원. 키오스크 오른쪽 아래 카드 투입구에 카드를 넣어 주세요.`;
    if (m.phase === "complete")
      return `주문이 완료되었습니다. 주문 번호 ${m.receipt.number}번. 영수증은 키오스크 왼쪽 아래에서 나와요.`;
    return "";
  }
  function renderVoiceCaption(side) {
    if (stage !== 3 || role !== "blind") return "";
    if (side === "A")
      return '<div class="voice-caption is-off"><span aria-hidden="true">🔇</span><span>음성 안내 없음 · 이 기기는 번역 기능에 예산을 썼어요</span></div>';
    return `<div class="voice-caption"><span aria-hidden="true">🔊</span><span class="voice-caption-text">${html(voice.text || "화면을 눌러 보세요. 한 번 누르면 읽어 주고, 한 번 더 누르면 선택돼요.")}</span></div>`;
  }
  // Returns true when the touch should activate the control.
  function exploreTouch(control) {
    const d = control.dataset;
    const key = [d.action, d.id, d.index, d.value].join("|");
    if (voice.key === key && Date.now() - voice.at < 6000) {
      voice.key = null;
      return true;
    }
    voice.key = key;
    voice.at = Date.now();
    speak(`${controlLabel(control)}. 선택하려면 한 번 더 누르세요.`);
    return false;
  }
  function announceResult(side, before, control) {
    const m = machines[side];
    if (m.phase !== before.phase) speak(screenSpeech(side));
    else if (count(m) !== before.count)
      speak(`담은 메뉴 ${count(m)}개, 합계 ${money(total(m))}원.`);
    else if (m.draftQty !== before.qty) speak(`수량 ${m.draftQty}개.`);
    else speak(`${controlLabel(control)}, 선택됨.`);
  }

  function render(side, focus = false) {
    if (legacy(side)) cancelLegacyScroll();
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
        <div class="touchscreen" data-language="${m.locale}" lang="${LANG_ATTR[m.locale] || "ko"}" aria-label="${side} ${html(c.language)} 주문 화면" aria-busy="${m.busy}">
          <div class="store-ui" ${m.phase !== "menu" ? "inert" : ""}>
            ${renderHeader(side)}${legacy(side) ? renderLanguage(side) : ""}${renderNavigation(side)}${renderMenu(side)}${renderCart(side)}
          </div>
          ${renderOverlay(side)}
          ${m.busy ? `<div class="busy-shade" role="status"><span class="loading-wheel" aria-hidden="true"></span><span>${html(m.phase === "payment" ? c.paying : c.wait)}</span></div>` : ""}
          ${m.alert ? `<div class="screen-alert" role="status">${html(m.alert)}</div>` : ""}
          ${stage === 3 && role === "blind" ? '<div class="blind-cover" aria-hidden="true"><span>화면이 보이지 않는 상태예요</span></div>' : ""}
        </div>
      </div>
      <div class="hardware-layer" ${isFocused ? "" : "inert"}>
        ${renderVoiceCaption(side)}
        <span class="receipt-caption" aria-hidden="true">${html(c.receipt)}</span>
        <div class="receipt-output">${renderReceipt(side)}</div>
        <span class="card-caption" aria-hidden="true">${html(c.card)}</span>
        <div class="physical-reader ${m.phase === "payment" && !m.busy ? "is-ready" : ""}" aria-hidden="true"><span class="reader-active-light"></span></div>
      </div>
      ${isFocused ? "" : `<button type="button" class="kiosk-focus-target" data-focus-kiosk="${side}" aria-label="${side === "A" ? "왼쪽" : "오른쪽"} 키오스크 확대" title="키오스크 확대"></button>`}`;
    root.querySelector(".menu-scroll").scrollTop = previous;
    root.querySelector(".basket-list").scrollTop = basketScroll;
    window.BalanceCard?.sync(side, {
      state:
        isFocused && m.phase === "payment"
          ? m.cardInserted
            ? "inserted"
            : "ready"
          : "hidden",
      slot: root.querySelector(".physical-reader"),
      onInsert: () => pay(side),
    });
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
    if (!legacy(side)) {
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
          if (dialect(side) && ++faults.add === 2) {
            setFault(order, "add");
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
          if (order.phase === "menu" && dialect(side) && faults.checkout++ === 0)
            setFault(order, "checkout");
          else order.phase = "checkout";
        },
        true,
      );
    else if (action === "fault-ok" && m.phase === "fault") {
      if (faultCopy[m.fault.kind].reset) resetAfterFault(side);
      else
        transact(
          side,
          (order) => {
            order.phase = "menu";
            order.fault = null;
          },
          true,
        );
    }
    else if (action === "payment" && m.cart.length)
      transact(
        side,
        (order) => {
          order.phase = "payment";
        },
        true,
      );
    else if (action === "take-receipt" && m.receipt && !m.receiptTaken) {
      m.receiptTaken = true;
      render(side);
      setTimeout(() => {
        if (machines[side] !== m) return;
        m.receiptGone = true;
        render(side);
      }, 700);
    } else if (action === "restart") {
      if (legacy(side)) Object.assign(faults, { add: 0, checkout: 0, pay: 0 });
      machines[side] = fresh(m.locale);
      render(side, true);
    }
  }

  function renderStageNav() {
    $("#stageNav").innerHTML = Object.entries(STAGES)
      .map(([n, info]) => {
        const open = unlocked.has(Number(n));
        return `<button type="button" data-stage="${n}" class="${open ? "" : "is-locked"}" aria-current="${stage === Number(n) ? "step" : "false"}"><b>${n}단계</b><span>${info.title}</span>${open ? "" : '<i aria-label="잠김">🔒</i>'}</button>`;
      })
      .join("");
  }

  let gateStage = 0;
  function openGate(n) {
    gateStage = n;
    const gate = $("#stageGate");
    gate.hidden = false;
    gate.innerHTML = `<form class="stage-gate-panel" role="dialog" aria-modal="true" aria-labelledby="stageGateTitle"><p class="stage-gate-step">${n}단계</p><h1 id="stageGateTitle">${STAGES[n].title}</h1><p>선생님이 알려 준 비밀번호를 입력하세요.</p><input name="password" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="비밀번호" placeholder="비밀번호" /><p class="stage-gate-error" role="alert"></p><div class="stage-gate-actions">${stage ? '<button type="button" class="secondary" data-gate="cancel">닫기</button>' : ""}<button type="submit" class="primary">열기</button></div></form>`;
    gate.querySelector("input").focus();
  }
  function closeGate() {
    $("#stageGate").hidden = true;
    $("#stageGate").innerHTML = "";
    gateStage = 0;
  }

  function resetMachines() {
    stopVoice();
    machines.A = fresh(stage === 1 ? "jeolla" : "standard");
    machines.B = fresh("standard");
    Object.assign(faults, { add: 0, checkout: 0, pay: 0, seen: 0 });
  }

  function enterStage(n) {
    if (activeSide) setKioskFocus(null);
    stage = n;
    store.set("balance-stage", String(n));
    document.body.dataset.stage = n;
    // Stage 2 opens with normal vision; students switch the blur on afterwards.
    if (n === 2) document.body.dataset.vision = vision = "normal";
    else delete document.body.dataset.vision;
    $("#kioskA").className = `terminal ${n === 1 ? "terminal-legacy" : n === 2 ? "terminal-modern terminal-pretty" : "terminal-modern"}`;
    $("#kioskB").className = `terminal terminal-modern${n === 2 ? " terminal-plain" : ""}`;
    $("#kioskA").setAttribute("aria-label", `왼쪽 키오스크 · ${STAGES[n].left}`);
    $("#kioskB").setAttribute("aria-label", `오른쪽 키오스크 · ${STAGES[n].right}`);
    resetMachines();
    renderStageNav();
    renderMission();
    render("A");
    render("B");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  $("#stageNav").addEventListener("click", (event) => {
    const target = event.target.closest("button[data-stage]");
    if (!target) return;
    const n = Number(target.dataset.stage);
    if (unlocked.has(n)) {
      if (n !== stage) enterStage(n);
    } else openGate(n);
  });
  $("#stageGate").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.target.querySelector("input");
    if (passKey(input.value) === STAGES[gateStage].key) {
      const n = gateStage;
      unlocked.add(n);
      store.set("balance-unlocked", [...unlocked].join(","));
      closeGate();
      enterStage(n);
      return;
    }
    const error = event.target.querySelector(".stage-gate-error");
    error.textContent = "비밀번호가 맞지 않아요. 다시 입력해 주세요.";
    event.target.classList.remove("is-wrong");
    void event.target.offsetWidth;
    event.target.classList.add("is-wrong");
    input.select();
  });
  $("#stageGate").addEventListener("click", (event) => {
    if (event.target.closest('[data-gate="cancel"]')) closeGate();
  });
  $("#mission").addEventListener("click", (event) => {
    const control = event.target.closest("button[data-mission]");
    if (!control) return;
    if (control.dataset.mission === "vision") {
      vision = vision === "low" ? "normal" : "low";
      document.body.dataset.vision = vision;
      renderMission();
    } else if (control.dataset.mission === "role" && control.dataset.value !== role) {
      role = control.dataset.value;
      resetMachines();
      renderMission();
      render("A");
      render("B");
      if (activeSide && voiceMode(activeSide)) speak(screenSpeech(activeSide));
    }
  });

  $("#overviewBack").addEventListener("click", () => setKioskFocus(null));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#stageGate").hidden) {
      if (stage) closeGate();
      return;
    }
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
      if (!control || control.disabled || control.closest("[inert]")) return;
      if (!voiceMode(side)) {
        handle(side, control);
        return;
      }
      if (!exploreTouch(control)) return;
      const m = machines[side];
      const before = { phase: m.phase, count: count(m), qty: m.draftQty };
      handle(side, control);
      announceResult(side, before, control);
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
  renderStageNav();
  const saved = Number(store.get("balance-stage"));
  if (unlocked.has(saved)) enterStage(saved);
  else if (unlocked.size) enterStage(Math.min(...unlocked));
  else openGate(1);
})();
