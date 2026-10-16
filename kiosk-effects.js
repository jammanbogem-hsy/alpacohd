/* KioskFX: 실제 키오스크 하드웨어 반응(소리·스캔·카드 투입·결제 처리·영수증 출력) 모듈.
   app.js가 draw()로 화면을 자주 다시 그리므로, 효과는 모두 document.body에 position: fixed로 붙이고
   매 프레임 대상 요소 위치를 다시 읽어 따라간다(대상이 다시 그려지면 같은 클래스의 새 요소를 찾는다). */
(function () {
  "use strict";

  const SOUND_KEY = "alpaco-sound";
  const DEFAULT_CARD = "assets/menu/card.png";
  const READER_STATES = ["idle", "busy", "ok", "error"];
  const READER_SELECTOR = '.hw-card-reader, [data-card-target="slot"]';

  const overlays = new Set(); // { el, target, selector, place(rect, el), done? }
  const pending = new Set(); // clear() 때 강제로 resolve할 함수들
  let rafId = 0;
  let muted = readMuted();
  let audioCtx = null;
  let masterGain = null;
  let activeVoices = new Set();
  let readerStateValue = "idle";
  let readerObserver = null;

  /* ---------- 공통 유틸 ---------- */

  function reducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (error) {
      return false;
    }
  }

  function dur(ms, reducedMs) {
    return reducedMotion() ? reducedMs : ms;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      const finish = () => {
        pending.delete(finish);
        resolve();
      };
      pending.add(finish);
      window.setTimeout(finish, Math.max(0, Number(ms) || 0));
    });
  }

  function isEl(el) {
    return Boolean(el && el.nodeType === 1);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function won(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return `${value.toLocaleString("ko-KR")}원`;
    }
    return value == null ? "" : String(value);
  }

  function minusWon(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return `-${Math.abs(value).toLocaleString("ko-KR")}원`;
    }
    return value == null ? "" : String(value);
  }

  // 대상이 다시 그려져 DOM에서 빠져도 같은 요소를 다시 찾을 수 있게 셀렉터를 기억한다.
  function selectorFor(el) {
    if (!isEl(el)) return "";
    if (el.id) return `#${CSS.escape(el.id)}`;
    for (const attr of ["data-card-target", "data-barcode-target"]) {
      if (el.hasAttribute(attr)) return `[${attr}="${CSS.escape(el.getAttribute(attr))}"]`;
    }
    const cls = Array.from(el.classList).find((name) => !name.startsWith("fx-") && !name.startsWith("is-"));
    return cls ? `.${CSS.escape(cls)}` : "";
  }

  function liveTarget(entry) {
    if (isEl(entry.target) && entry.target.isConnected) return entry.target;
    if (entry.selector) {
      const found = document.querySelector(entry.selector);
      if (found) {
        entry.target = found;
        return found;
      }
    }
    return null;
  }

  function rectOf(el) {
    if (isEl(el) && el.isConnected) {
      const rect = el.getBoundingClientRect();
      if (rect.width || rect.height) return rect;
    }
    // 대상이 없으면 화면 가운데 작은 영역을 쓴다.
    const w = Math.min(320, window.innerWidth * 0.8);
    const h = Math.min(220, window.innerHeight * 0.5);
    const left = (window.innerWidth - w) / 2;
    const top = (window.innerHeight - h) / 2;
    return { left, top, width: w, height: h, right: left + w, bottom: top + h };
  }

  function placeBox(el, rect, pad = 0) {
    el.style.left = `${rect.left - pad}px`;
    el.style.top = `${rect.top - pad}px`;
    el.style.width = `${rect.width + pad * 2}px`;
    el.style.height = `${rect.height + pad * 2}px`;
  }

  function track(entry) {
    overlays.add(entry);
    const rect = rectOf(liveTarget(entry));
    entry.place(rect, entry.el);
    if (!rafId) rafId = window.requestAnimationFrame(tick);
    return entry;
  }

  function tick() {
    rafId = 0;
    overlays.forEach((entry) => {
      if (!entry.el.isConnected) {
        overlays.delete(entry);
        return;
      }
      const target = liveTarget(entry);
      if (target) entry.place(target.getBoundingClientRect(), entry.el);
    });
    if (overlays.size) rafId = window.requestAnimationFrame(tick);
  }

  function makeOverlay(className, html) {
    const el = document.createElement("div");
    el.className = `kfx-overlay ${className}`;
    if (html) el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  }

  function removeOverlay(el) {
    overlays.forEach((entry) => {
      if (entry.el === el) overlays.delete(entry);
    });
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // WAAPI 애니메이션을 Promise로. 탭이 숨겨져 finish가 늦어도 타임아웃으로 반드시 끝난다.
  function play(el, keyframes, options) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        pending.delete(finish);
        resolve();
      };
      pending.add(finish);
      const total = (options.duration || 0) + (options.delay || 0);
      window.setTimeout(finish, total + 250);
      if (!isEl(el) || typeof el.animate !== "function") {
        finish();
        return;
      }
      try {
        const anim = el.animate(keyframes, options);
        anim.onfinish = finish;
        anim.oncancel = finish;
      } catch (error) {
        finish();
      }
    });
  }

  /* ---------- 소리 (Web Audio 합성) ---------- */

  function readMuted() {
    try {
      return window.localStorage.getItem(SOUND_KEY) === "off";
    } catch (error) {
      return false;
    }
  }

  function isMuted() {
    return muted;
  }

  function setMuted(value) {
    muted = Boolean(value);
    try {
      window.localStorage.setItem(SOUND_KEY, muted ? "off" : "on");
    } catch (error) {
      /* 저장 불가 환경은 무시 */
    }
    if (muted) stopVoices();
    syncSoundToggle();
  }

  function ensureAudio() {
    if (muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      if (!audioCtx) {
        audioCtx = new Ctx();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(audioCtx.destination);
      }
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      return audioCtx;
    } catch (error) {
      return null;
    }
  }

  function stopVoices() {
    activeVoices.forEach((node) => {
      try {
        node.stop();
      } catch (error) {
        /* 이미 멈춤 */
      }
    });
    activeVoices = new Set();
  }

  function startNode(node, at, until) {
    activeVoices.add(node);
    node.onended = () => activeVoices.delete(node);
    node.start(at);
    node.stop(until);
  }

  // 짧은 음 하나: 주파수, 시작 시각, 길이, 파형, 음량
  function tone(ctx, { freq, start, length, type = "sine", gain = 0.1, attack = 0.005, slideTo }) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + length);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(amp).connect(masterGain);
    startNode(osc, start, start + length + 0.02);
  }

  let noiseBuffer = null;
  function noiseSource(ctx) {
    if (!noiseBuffer) {
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    return src;
  }

  const sounds = {
    // 바코드 스캐너 "삑": 높고 깨끗한 단음
    beep(ctx, t) {
      tone(ctx, { freq: 2350, start: t, length: 0.13, type: "square", gain: 0.06, attack: 0.003 });
      tone(ctx, { freq: 2350, start: t, length: 0.13, type: "sine", gain: 0.08, attack: 0.003 });
    },
    // 오류: 낮은 "부부" 두 번
    error(ctx, t) {
      [0, 0.2].forEach((offset) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const amp = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, t + offset);
        filter.type = "lowpass";
        filter.frequency.value = 900;
        amp.gain.setValueAtTime(0.0001, t + offset);
        amp.gain.exponentialRampToValueAtTime(0.12, t + offset + 0.01);
        amp.gain.setValueAtTime(0.12, t + offset + 0.12);
        amp.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.16);
        osc.connect(filter).connect(amp).connect(masterGain);
        startNode(osc, t + offset, t + offset + 0.18);
      });
    },
    // 타이머 "똑": 아주 작고 짧은 시계 소리
    tick(ctx, t) {
      tone(ctx, { freq: 3200, start: t, length: 0.03, type: "sine", gain: 0.035, attack: 0.002, slideTo: 2400 });
      noiseBurst(ctx, t, 0.015, 5000, 0.02);
    },
    // 키패드 "틱": 아주 짧은 클릭
    key(ctx, t) {
      tone(ctx, { freq: 1500, start: t, length: 0.045, type: "triangle", gain: 0.1, attack: 0.002, slideTo: 900 });
      noiseBurst(ctx, t, 0.02, 4000, 0.05);
    },
    // 명예의 전당 팡파르: 도-미-솔-도 상승 후 화음
    fanfare(ctx, t) {
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        tone(ctx, { freq, start: t + index * 0.13, length: 0.18, type: "triangle", gain: 0.09, attack: 0.006 });
      });
      [1046.5, 1318.5, 1568].forEach((freq) => {
        tone(ctx, { freq, start: t + 0.42, length: 1.1, type: "triangle", gain: 0.06, attack: 0.01 });
        tone(ctx, { freq: freq * 2, start: t + 0.42, length: 0.6, type: "sine", gain: 0.012, attack: 0.01 });
      });
    },
    // 승인 "띵동": 높은 음 → 낮은 음
    approve(ctx, t) {
      tone(ctx, { freq: 1318.5, start: t, length: 0.45, type: "sine", gain: 0.12, attack: 0.008 });
      tone(ctx, { freq: 2637, start: t, length: 0.25, type: "sine", gain: 0.025, attack: 0.008 });
      tone(ctx, { freq: 1046.5, start: t + 0.22, length: 0.7, type: "sine", gain: 0.12, attack: 0.008 });
      tone(ctx, { freq: 2093, start: t + 0.22, length: 0.35, type: "sine", gain: 0.025, attack: 0.008 });
    },
    // 카드 투입: "스윽" 마찰음 + 끝에 "딸깍"
    insert(ctx, t) {
      const src = noiseSource(ctx);
      const filter = ctx.createBiquadFilter();
      const amp = ctx.createGain();
      filter.type = "bandpass";
      filter.Q.value = 1.4;
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(700, t + 0.38);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(0.11, t + 0.08);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      src.connect(filter).connect(amp).connect(masterGain);
      startNode(src, t, t + 0.45);
      tone(ctx, { freq: 420, start: t + 0.42, length: 0.06, type: "square", gain: 0.07, attack: 0.002, slideTo: 180 });
      noiseBurst(ctx, t + 0.42, 0.03, 2500, 0.09);
    },
    // 영수증 프린터 "지이이잉": 스테핑 모터 윙윙 + 종이 긁는 소리
    print(ctx, t, length = 1.7) {
      const motor = ctx.createOscillator();
      const motorFilter = ctx.createBiquadFilter();
      const motorAmp = ctx.createGain();
      const stepper = ctx.createOscillator();
      const stepperDepth = ctx.createGain();
      motor.type = "sawtooth";
      motor.frequency.setValueAtTime(190, t);
      motor.frequency.linearRampToValueAtTime(230, t + 0.15);
      motor.frequency.setValueAtTime(230, t + length - 0.12);
      motor.frequency.linearRampToValueAtTime(160, t + length);
      motorFilter.type = "bandpass";
      motorFilter.frequency.value = 1100;
      motorFilter.Q.value = 0.9;
      // 사각파 LFO로 음량을 계단처럼 떨어뜨려 "드르르르" 스텝 느낌
      stepper.type = "square";
      stepper.frequency.value = 34;
      stepperDepth.gain.value = 0.035;
      motorAmp.gain.setValueAtTime(0.0001, t);
      motorAmp.gain.exponentialRampToValueAtTime(0.07, t + 0.06);
      motorAmp.gain.setValueAtTime(0.07, t + length - 0.1);
      motorAmp.gain.exponentialRampToValueAtTime(0.0001, t + length);
      stepper.connect(stepperDepth).connect(motorAmp.gain);
      motor.connect(motorFilter).connect(motorAmp).connect(masterGain);
      startNode(motor, t, t + length + 0.02);
      startNode(stepper, t, t + length + 0.02);

      const paper = noiseSource(ctx);
      const paperFilter = ctx.createBiquadFilter();
      const paperAmp = ctx.createGain();
      paperFilter.type = "highpass";
      paperFilter.frequency.value = 3500;
      paperAmp.gain.setValueAtTime(0.0001, t);
      paperAmp.gain.exponentialRampToValueAtTime(0.03, t + 0.1);
      paperAmp.gain.setValueAtTime(0.03, t + length - 0.1);
      paperAmp.gain.exponentialRampToValueAtTime(0.0001, t + length);
      paper.connect(paperFilter).connect(paperAmp).connect(masterGain);
      startNode(paper, t, t + length + 0.02);
      // 끝에 커터 "찰칵"
      noiseBurst(ctx, t + length, 0.04, 2000, 0.1);
    },
    // 영수증 뜯는 소리: "찌익"
    tear(ctx, t) {
      const src = noiseSource(ctx);
      const filter = ctx.createBiquadFilter();
      const amp = ctx.createGain();
      filter.type = "bandpass";
      filter.Q.value = 2;
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(5200, t + 0.22);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      src.connect(filter).connect(amp).connect(masterGain);
      startNode(src, t, t + 0.26);
    }
  };

  function noiseBurst(ctx, t, length, freq, gain) {
    const src = noiseSource(ctx);
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(filter).connect(amp).connect(masterGain);
    startNode(src, t, t + length + 0.01);
  }

  function sound(name, option) {
    const synth = sounds[name];
    if (!synth) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      synth(ctx, ctx.currentTime + 0.01, option);
    } catch (error) {
      /* 소리 실패는 화면 동작에 영향 없음 */
    }
  }

  /* ---------- 소리 켜기/끄기 버튼 ---------- */

  function syncSoundToggle() {
    const button = document.getElementById("soundToggle");
    if (!button) return;
    button.textContent = muted ? "소리 꺼짐" : "소리 켜짐";
    button.setAttribute("aria-pressed", String(!muted));
  }

  function bindSoundToggle() {
    syncSoundToggle();
    document.addEventListener("click", (event) => {
      const button = event.target && event.target.closest && event.target.closest("#soundToggle");
      if (!button) return;
      setMuted(!muted);
      if (!muted) sound("key");
    });
  }

  /* ---------- 바코드 스캔 ---------- */

  async function scan(targetEl) {
    const ms = dur(650, 250);
    const el = makeOverlay("kfx-scan", '<span class="kfx-scan-glow"></span><span class="kfx-scan-line"></span>');
    track({ el, target: targetEl, selector: selectorFor(targetEl), place: (rect, node) => placeBox(node, rect, 4) });
    const line = el.querySelector(".kfx-scan-line");
    const frames = reducedMotion()
      ? [{ top: "50%", opacity: 0 }, { top: "50%", opacity: 1 }, { top: "50%", opacity: 0 }]
      : [
          { top: "0%", opacity: 0.4 },
          { top: "100%", opacity: 1, offset: 0.45 },
          { top: "0%", opacity: 1, offset: 0.9 },
          { top: "50%", opacity: 0.2 }
        ];
    await play(line, frames, { duration: ms, easing: "ease-in-out" });
    sound("beep");
    el.classList.add("is-done");
    await play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
    removeOverlay(el);
  }

  /* ---------- 카드 리더 ---------- */

  function applyReaderState(el, state) {
    if (!isEl(el)) return;
    READER_STATES.forEach((name) => el.classList.remove(`fx-reader-${name}`));
    if (state !== "idle") el.classList.add(`fx-reader-${state}`);
  }

  function readerState(readerEl, state) {
    const next = READER_STATES.includes(state) ? state : "idle";
    readerStateValue = next;
    applyReaderState(readerEl, next);
    document.querySelectorAll(READER_SELECTOR).forEach((el) => applyReaderState(el, next));
    // draw()로 다시 그려진 새 리더에도 상태를 유지한다.
    if (next === "idle") {
      if (readerObserver) {
        readerObserver.disconnect();
        readerObserver = null;
      }
      return;
    }
    if (!readerObserver && typeof MutationObserver === "function") {
      let queued = false;
      readerObserver = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(() => {
          queued = false;
          document.querySelectorAll(READER_SELECTOR).forEach((el) => {
            if (!el.classList.contains(`fx-reader-${readerStateValue}`)) applyReaderState(el, readerStateValue);
          });
        });
      });
      readerObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  async function insertCard(readerEl, cardImageSrc) {
    const ms = dur(560, 200);
    const el = makeOverlay(
      "kfx-card",
      `<img class="kfx-card-img${cardImageSrc ? "" : " is-default"}" alt="" draggable="false" src="${escapeHtml(
        cardImageSrc || DEFAULT_CARD
      )}" />`
    );
    const img = el.querySelector("img");
    let cardW = 96;
    let cardH = 64;
    // 클립 상자 아래 끝 = 리더 슬롯의 가운데. 카드는 그 아래로 내려가며 슬롯 속으로 사라진다.
    track({
      el,
      target: readerEl,
      selector: selectorFor(readerEl),
      place(rect, node) {
        cardW = Math.max(64, Math.min(150, rect.width * 0.62));
        cardH = cardW * 0.6;
        const slotY = rect.top + rect.height / 2;
        const boxH = cardH + 16;
        node.style.left = `${rect.left + rect.width / 2 - cardW / 2 - 8}px`;
        node.style.top = `${slotY - boxH}px`;
        node.style.width = `${cardW + 16}px`;
        node.style.height = `${boxH}px`;
        img.style.width = `${cardW}px`;
        img.style.height = `${cardH}px`;
      }
    });
    const travel = cardH + 18;
    const frames = reducedMotion()
      ? [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: `translateY(${travel}px)` }]
      : [
          { opacity: 0, transform: "translateY(-16px) rotateX(8deg) scale(1.05)" },
          { opacity: 1, transform: "translateY(0) rotateX(16deg) scale(1)", offset: 0.25 },
          { opacity: 1, transform: `translateY(${travel * 0.55}px) rotateX(24deg) scale(0.96)`, offset: 0.7 },
          { opacity: 1, transform: `translateY(${travel}px) rotateX(30deg) scale(0.92)` }
        ];
    window.setTimeout(() => sound("insert"), ms * 0.25);
    await play(img, frames, { duration: ms, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "forwards" });
    removeOverlay(el);
    readerState(readerEl, "busy");
  }

  /* ---------- 결제 처리 / 승인 ---------- */

  async function processing(containerEl, options = {}) {
    const ms = Math.max(200, Number(options.ms) || 1500);
    const title = options.title || "결제 중입니다";
    const detail = options.detail == null ? "카드를 빼지 마세요" : options.detail;
    const el = makeOverlay(
      "kfx-processing",
      `<div class="kfx-processing-panel" role="status" aria-live="assertive">
        <span class="kfx-spinner" aria-hidden="true"></span>
        <strong class="kfx-processing-title">${escapeHtml(title)}</strong>
        ${detail ? `<span class="kfx-processing-detail">${escapeHtml(detail)}</span>` : ""}
        <span class="kfx-progress" aria-hidden="true"><span class="kfx-progress-bar"></span></span>
      </div>`
    );
    track({ el, target: containerEl, selector: selectorFor(containerEl), place: (rect, node) => placeBox(node, rect) });
    // 결제 중에는 아래 화면을 누르지 못하게 막는다.
    const block = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    ["pointerdown", "click", "touchstart"].forEach((type) => el.addEventListener(type, block));
    play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 140 });
    await play(el.querySelector(".kfx-progress-bar"), [{ width: "0%" }, { width: "70%", offset: 0.55 }, { width: "100%" }], {
      duration: ms,
      easing: "ease-out",
      fill: "forwards"
    });
    await play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "forwards" });
    removeOverlay(el);
  }

  async function approve(containerEl, options = {}) {
    const title = options.title || "승인되었습니다";
    const detail = options.detail || "";
    const el = makeOverlay(
      "kfx-approve",
      `<div class="kfx-stamp" role="status" aria-live="assertive">
        <span class="kfx-stamp-check" aria-hidden="true"></span>
        <strong>${escapeHtml(title)}</strong>
        ${detail ? `<span>${escapeHtml(detail)}</span>` : ""}
      </div>`
    );
    track({ el, target: containerEl, selector: selectorFor(containerEl), place: (rect, node) => placeBox(node, rect) });
    sound("approve");
    const stamp = el.querySelector(".kfx-stamp");
    const frames = reducedMotion()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, transform: "scale(1.8) rotate(-14deg)" },
          { opacity: 1, transform: "scale(0.92) rotate(-6deg)", offset: 0.6 },
          { opacity: 1, transform: "scale(1) rotate(-6deg)" }
        ];
    await play(stamp, frames, { duration: dur(320, 120), easing: "cubic-bezier(.2,.8,.3,1.2)", fill: "forwards" });
    await wait(dur(420, 400));
    await play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
    removeOverlay(el);
  }

  /* ---------- 버튼 반응 ---------- */

  function shake(el) {
    sound("error");
    if (!isEl(el)) return Promise.resolve();
    el.classList.add("fx-shake-flash");
    const distance = reducedMotion() ? 3 : 10;
    return play(
      el,
      [0, -1, 1, -1, 1, -0.6, 0.6, 0].map((k) => ({ transform: `translateX(${k * distance}px)` })),
      { duration: dur(420, 200), easing: "ease-in-out", composite: "add" }
    ).then(() => el.classList.remove("fx-shake-flash"));
  }

  function pressKey(el) {
    sound("key");
    if (!isEl(el)) return Promise.resolve();
    return play(
      el,
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(0.93)", filter: "brightness(1.25)", offset: 0.35 },
        { transform: "scale(1)", filter: "brightness(1)" }
      ],
      { duration: 140, easing: "ease-out", composite: "add" }
    );
  }

  /* ---------- 영수증 출력 ---------- */

  function barcodeSvg(seed) {
    const digits = String(seed || "20251016").replace(/\D/g, "") || "1234";
    let x = 0;
    let rects = "";
    for (let i = 0; i < 46; i += 1) {
      const d = Number(digits[i % digits.length]) + i * 7;
      const w = 1 + (d % 3);
      if (i % 2 === 0) rects += `<rect x="${x}" y="0" width="${w}" height="34"/>`;
      x += w + (d % 2);
    }
    return `<svg class="kfx-receipt-barcode" viewBox="0 0 ${x} 34" preserveAspectRatio="none" aria-hidden="true">${rects}</svg>`;
  }

  function receiptRows(list, labelKey, valueKey, format) {
    return (Array.isArray(list) ? list : [])
      .map(
        (row) =>
          `<span class="kfx-row"><span>${escapeHtml(row && row[labelKey])}</span><span>${escapeHtml(
            format(row && row[valueKey])
          )}</span></span>`
      )
      .join("");
  }

  function receiptHtml(receipt = {}) {
    const items = receiptRows(receipt.items, "label", "price", won);
    const discounts = receiptRows(receipt.discounts, "label", "amount", minusWon);
    const payments = receiptRows(receipt.payments, "label", "amount", won);
    const time = receipt.time ? String(receipt.time) : new Date().toLocaleString("ko-KR");
    return `
      <span class="kfx-receipt-store">${escapeHtml(receipt.store || "모두페이")}</span>
      <span class="kfx-receipt-title">${escapeHtml(receipt.title || "영수증")}</span>
      <span class="kfx-receipt-meta">${escapeHtml(time)}</span>
      <span class="kfx-sep"></span>
      ${items}
      ${discounts ? `<span class="kfx-sep"></span><span class="kfx-receipt-sub">할인</span>${discounts}` : ""}
      <span class="kfx-sep"></span>
      <span class="kfx-row kfx-total"><span>합계</span><span>${escapeHtml(won(receipt.total))}</span></span>
      ${payments ? `<span class="kfx-sep"></span><span class="kfx-receipt-sub">결제</span>${payments}` : ""}
      ${receipt.approval ? `<span class="kfx-row"><span>승인번호</span><span>${escapeHtml(receipt.approval)}</span></span>` : ""}
      <span class="kfx-sep"></span>
      ${barcodeSvg(receipt.approval)}
      <span class="kfx-receipt-footer">${escapeHtml(receipt.footer || "감사합니다")}</span>`;
  }

  function printReceipt(printerEl, receipt) {
    return new Promise((resolve) => {
      let finished = false;
      const previousFocus = document.activeElement;
      const root = makeOverlay(
        "kfx-receipt",
        `<div class="kfx-receipt-lift">
          <div class="kfx-receipt-clip">
            <button type="button" class="kfx-receipt-paper" aria-label="영수증 가져가기" tabindex="-1">${receiptHtml(receipt)}</button>
          </div>
          <span class="kfx-receipt-hint" aria-hidden="true">영수증을 뜯어 가져가세요</span>
        </div>`
      );
      const lift = root.querySelector(".kfx-receipt-lift");
      const clip = root.querySelector(".kfx-receipt-clip");
      const paper = root.querySelector(".kfx-receipt-paper");
      const hint = root.querySelector(".kfx-receipt-hint");
      const machine = isEl(printerEl) ? printerEl.closest(".kiosk-hardware") : null;
      const machineWidth = machine ? machine.getBoundingClientRect().width : window.innerWidth;
      const width = Math.round(Math.max(150, Math.min(240, machineWidth * 0.9)));
      paper.style.width = `${width}px`;
      clip.style.width = `${width}px`;
      let paperH = paper.offsetHeight || 320;
      clip.style.height = `${paperH}px`;
      let lifted = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        pending.delete(finish);
        const hadFocus = root.contains(document.activeElement);
        removeOverlay(root);
        if (hadFocus && isEl(previousFocus) && previousFocus.isConnected) {
          try {
            previousFocus.focus({ preventScroll: true });
          } catch (error) {
            /* 포커스 복귀 실패 무시 */
          }
        }
        resolve();
      };
      pending.add(finish);

      const entry = track({
        el: root,
        target: printerEl,
        selector: selectorFor(printerEl) || ".hw-receipt-printer",
        place(rect, node) {
          const slitY = rect.top + rect.height / 2;
          node.style.left = `${rect.left + rect.width / 2 - width / 2}px`;
          node.style.top = `${slitY}px`;
          node.style.width = `${width}px`;
          // 다 나온 뒤 화면 아래로 넘치면, 종이를 위로 들어 올려(필요하면 축소) 전부 읽히게 한다.
          let scale = 1;
          let offset = 0;
          if (lifted) {
            const room = window.innerHeight - 24;
            scale = paperH > room ? room / paperH : 1;
            const bottom = slitY + paperH * scale;
            const limit = window.innerHeight - 12;
            if (bottom > limit) offset = limit - bottom;
            offset = Math.max(offset, 12 - slitY);
          }
          lift.style.transform = `translateY(${offset}px) scale(${scale})`;
          // 안내 문구는 종이 옆 빈 공간 쪽에
          const rightRoom = window.innerWidth - (rect.left + rect.width / 2 + width / 2);
          hint.classList.toggle("is-left", rightRoom < 190);
        }
      });

      const ms = dur(1800, 600);
      sound("print", ms / 1000);
      play(
        paper,
        [{ transform: `translateY(-${paperH}px)` }, { transform: "translateY(0)" }],
        { duration: ms, easing: reducedMotion() ? "linear" : `steps(${Math.max(12, Math.round(paperH / 9))}, end)`, fill: "forwards" }
      ).then(() => {
        if (finished) return;
        paperH = paper.offsetHeight || paperH;
        lifted = true;
        entry.place(rectOf(liveTarget(entry)), root);
        root.classList.add("is-ready");
        paper.removeAttribute("tabindex");
        try {
          paper.focus({ preventScroll: true });
        } catch (error) {
          /* 포커스 실패 무시 */
        }
      });

      // 클릭(키보드 Enter/Space 포함) 또는 끌어서 뜯기
      let drag = null;
      const tearOff = (dx = 0, dy = 0) => {
        if (finished || root.classList.contains("is-torn")) return;
        root.classList.add("is-torn");
        root.classList.remove("is-ready");
        sound("tear");
        const dir = dx < 0 ? -1 : 1;
        play(
          paper,
          [
            { transform: `translate(${dx}px, ${dy}px) rotate(${dir * 2}deg)`, opacity: 1 },
            { transform: `translate(${dx + dir * 40}px, ${dy - 90}px) rotate(${dir * 14}deg)`, opacity: 0.9, offset: 0.5 },
            { transform: `translate(${dx + dir * 90}px, ${dy - 220}px) rotate(${dir * 24}deg)`, opacity: 0 }
          ],
          { duration: dur(620, 200), easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" }
        ).then(finish);
      };

      paper.addEventListener("pointerdown", (event) => {
        if (!root.classList.contains("is-ready")) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false };
        try {
          paper.setPointerCapture(event.pointerId);
        } catch (error) {
          /* 캡처 불가 무시 */
        }
      });
      paper.addEventListener("pointermove", (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        drag.dx = event.clientX - drag.x;
        drag.dy = event.clientY - drag.y;
        if (Math.hypot(drag.dx, drag.dy) > 6) drag.moved = true;
        paper.style.transform = `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx * 0.05}deg)`;
        if (Math.hypot(drag.dx, drag.dy) > 60) {
          const { dx, dy } = drag;
          drag = null;
          tearOff(dx, dy);
        }
      });
      const endDrag = (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        const { moved, dx, dy } = drag;
        drag = null;
        if (moved) tearOff(dx, dy);
      };
      paper.addEventListener("pointerup", endDrag);
      paper.addEventListener("pointercancel", () => {
        drag = null;
        paper.style.transform = "";
      });
      paper.addEventListener("click", () => {
        if (root.classList.contains("is-ready")) tearOff(0, 0);
      });
    });
  }

  /* ---------- 카드 투입 확대 연출 (화면 맨 위 레이어) ---------- */

  // 카드 리더기를 가까이서 본 장면을 띄우고 카드가 투입구로 들어가는 모습을 보여 줍니다.
  // outcome: "ok"(인식 완료) | "error"(IC 인식 오류로 카드가 다시 나옴)
  async function cardCinematic(options = {}) {
    const outcome = options.outcome === "error" ? "error" : "ok";
    const cardSrc = options.cardSrc || "assets/menu/card-face.png";
    document.querySelectorAll(".kfx-cinema").forEach((el) => el.remove());
    const root = document.createElement("div");
    root.className = "kfx-overlay kfx-cinema";
    root.setAttribute("role", "status");
    root.innerHTML = `
      <div class="kfx-cinema-stage">
        <div class="kfx-cinema-panel">
          <img class="kfx-cinema-photo" src="assets/menu/card-reader-closeup.png" alt="" onerror="this.remove()">
          <div class="kfx-cinema-slot"><i class="kfx-cinema-led"></i></div>
          <div class="kfx-cinema-clip"><img class="kfx-cinema-card" src="${escapeHtml(cardSrc)}" alt=""></div>
        </div>
        <p class="kfx-cinema-caption">카드를 투입구에 넣고 있어요</p>
      </div>
    `;
    document.body.appendChild(root);
    const card = root.querySelector(".kfx-cinema-card");
    const caption = root.querySelector(".kfx-cinema-caption");
    const setLed = (state) => {
      root.dataset.led = state;
    };
    const slide = (keyframes, ms, easing) =>
      card.animate
        ? card.animate(keyframes, { duration: dur(ms, 120), easing, fill: "forwards" }).finished.catch(() => null)
        : Promise.resolve();

    setLed("idle");
    await wait(dur(260, 60));
    sound("insert");
    await Promise.race([
      slide([{ transform: "translateY(-125%)" }, { transform: "translateY(-30%)", offset: 0.55 }, { transform: "translateY(105%)" }], 760, "cubic-bezier(0.5, 0, 0.8, 0.6)"),
      wait(900)
    ]);
    setLed("busy");
    caption.textContent = "카드를 읽는 중… 카드를 빼지 마세요";
    await wait(dur(700, 200));

    if (outcome === "error") {
      setLed("error");
      sound("error");
      caption.textContent = "IC 칩을 인식하지 못했어요";
      await Promise.race([slide([{ transform: "translateY(105%)" }, { transform: "translateY(-45%)" }], 460, "cubic-bezier(0.2, 0.9, 0.3, 1.2)"), wait(600)]);
      await wait(dur(650, 200));
    } else {
      setLed("ok");
      sound("beep");
      caption.textContent = "카드 인식 완료";
      await wait(dur(450, 150));
    }
    root.classList.add("is-leaving");
    await wait(dur(240, 60));
    root.remove();
  }

  /* ---------- 정리 ---------- */

  function clear() {
    document.querySelectorAll(".kfx-cinema").forEach((el) => el.remove());
    Array.from(document.querySelectorAll(".kfx-overlay")).forEach(removeOverlay);
    overlays.clear();
    stopVoices();
    readerState(null, "idle");
    document.querySelectorAll(".fx-shake-flash").forEach((el) => el.classList.remove("fx-shake-flash"));
    Array.from(pending).forEach((finish) => finish());
    pending.clear();
  }

  window.KioskFX = {
    isMuted,
    setMuted,
    sound,
    wait,
    scan,
    insertCard,
    cardCinematic,
    readerState,
    processing,
    approve,
    shake,
    pressKey,
    printReceipt,
    clear
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindSoundToggle, { once: true });
  } else {
    bindSoundToggle();
  }
})();
