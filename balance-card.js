/* Independent of article.innerHTML: call sync after every kiosk render.
 * BalanceCard.sync("A", { state: "ready", slot, onInsert() {} });
 * CSS companion: balance-card.css. No images or libraries are required.
 */
(function () {
  "use strict";

  const cards = new Map();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let layoutFrame = 0;

  function visible(slot) {
    if (!slot || !slot.isConnected || !slot.getClientRects().length) return false;
    const rect = slot.getBoundingClientRect();
    const style = window.getComputedStyle(slot);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" &&
      style.visibility !== "collapse" && (!slot.checkVisibility ||
        slot.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }));
  }

  function transform(pose) {
    return `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.angle || 0}deg)`;
  }

  function frame(pose) {
    return { transform: transform(pose), opacity: pose.opacity ?? 1,
      clipPath: pose.clip || "inset(0% 0% 0% 0%)" };
  }

  function paint(card, pose) {
    card.pose = pose;
    Object.assign(card.button.style, frame(pose));
  }

  function stopMotion(card) {
    card.epoch += 1;
    if (card.animation) card.animation.cancel();
    card.animation = null;
    window.clearTimeout(card.timer);
  }

  function move(card, poses, duration, easing, done) {
    const computed = window.getComputedStyle(card.button);
    const first = { transform: computed.transform, opacity: computed.opacity,
      clipPath: computed.clipPath };
    stopMotion(card);
    const epoch = card.epoch;
    paint(card, poses[poses.length - 1]);
    const finish = () => {
      if (card.epoch !== epoch) return;
      card.animation = null;
      if (done) done();
      scheduleLayout();
    };
    if (reducedMotion.matches || !card.button.animate) {
      card.timer = window.setTimeout(finish, 0);
      return;
    }
    card.animation = card.button.animate([first, ...poses.map(frame)], {
      duration, easing, fill: "none"
    });
    card.animation.onfinish = finish;
  }

  function flag(slot, name, enabled) {
    if (slot && slot.classList.contains(name) !== enabled) slot.classList.toggle(name, enabled);
  }

  function hint(card) {
    card.hint.hidden = card.phase !== "ready" || Boolean(card.drag);
    card.button.disabled = card.phase !== "ready";
    card.button.tabIndex = card.phase === "ready" ? 0 : -1;
    card.button.setAttribute("aria-disabled", String(card.phase !== "ready"));
    card.layer.dataset.phase = card.phase;
    flag(card.slot, "balance-card-slot-ready", card.phase === "ready" && !card.layer.hidden);
  }

  function cancelDrag(card) {
    if (!card.drag) return;
    const pointerId = card.drag.id;
    card.drag = null;
    if (card.button.hasPointerCapture?.(pointerId)) card.button.releasePointerCapture(pointerId);
    flag(card.slot, "balance-card-slot-near", false);
    hint(card);
  }

  function geometry(card) {
    const rect = card.slot.getBoundingClientRect();
    const terminal = card.slot.closest("article") || card.slot;
    // A tall reader housing contains its horizontal opening near the bottom.
    // A genuinely narrow vertical slit accepts the card from its right instead.
    const vertical = rect.height > rect.width * 2.2;
    const width = Math.max(86, Math.min(164, rect.width * (vertical ? 2 : 1.25)));
    const height = width / 1.585;
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.top + rect.height * (vertical || rect.width > rect.height * 2.2 ? 0.5 : 0.85) + window.scrollY;
    const sideGap = Math.max(60, Math.min(90, width * 0.45));
    const viewportWidth = document.documentElement.clientWidth;
    let readyX = rect.left + rect.width / 2;
    let readyY = rect.bottom + 24;
    const otherChassis = Array.from(document.querySelectorAll("article.terminal"))
      .filter((element) => element !== terminal && element.getClientRects().length)
      .map((element) => element.getBoundingClientRect());
    // Anchor to the reader, not the photograph's much wider article canvas.
    // Leave 60–90px to its right; if that space is occupied, rest just below it.
    for (const candidate of [rect.right + sideGap]) {
      const top = y - window.scrollY - height / 2;
      if (candidate < 20 || candidate + width > viewportWidth - 20) continue;
      const occupied = otherChassis.some((other) => candidate < other.right &&
        candidate + width > other.left && top < other.bottom && top + height + 44 > other.top);
      if (!occupied) {
        readyX = candidate + width / 2;
        readyY = top;
        break;
      }
    }
    readyX = Math.max(width / 2 + 12, Math.min(viewportWidth - width / 2 - 12, readyX));
    const ready = { x: readyX + window.scrollX - x, y: readyY + window.scrollY - y,
      angle: card.side === "A" ? -9 : 8 };
    const approach = vertical
      ? { x: height / 2 + 4, y: -height / 2, angle: 90 }
      : { x: 0, y: 4, angle: 0 };
    const inserted = vertical
      ? { x: -height * 0.2, y: -height / 2, angle: 90, clip: "inset(0% 0% 70% 0%)" }
      : { x: 0, y: -height * 0.7, angle: 0, clip: "inset(70% 0% 0% 0%)" };
    return { x, y, width, height, ready, approach, inserted };
  }

  function layout(card) {
    if (!visible(card.slot)) {
      if (card.phase === "inserting" || card.phase === "exiting") {
        stopMotion(card);
        card.phase = card.requested === "hidden" ? "hidden" : card.requested;
      }
      cancelDrag(card);
      card.layer.hidden = true;
      flag(card.slot, "balance-card-slot-ready", false);
      return false;
    }
    if (card.phase === "hidden") {
      card.layer.hidden = true;
      return false;
    }
    card.layer.hidden = false;
    const next = geometry(card);
    // The body layer follows the slot even while a finite animation is running.
    // Keep its card dimensions stable until that animation has finished.
    if (card.animation || card.drag) {
      if (card.geometry) {
        next.width = card.geometry.width;
        next.height = card.geometry.height;
      }
    }
    card.layer.style.left = `${next.x - next.width / 2}px`;
    card.layer.style.top = `${next.y}px`;
    card.layer.style.setProperty("--balance-card-width", `${next.width}px`);
    card.layer.style.setProperty("--balance-card-height", `${next.height}px`);
    card.hint.style.left = `${next.ready.x + next.width / 2}px`;
    card.hint.style.top = `${next.ready.y + next.height + 14}px`;
    card.geometry = next;
    if (!card.drag && !card.animation && card.phase !== "exiting") {
      paint(card, card.phase === "inserted" ? next.inserted : next.ready);
    }
    hint(card);
    return true;
  }

  function scheduleLayout() {
    if (layoutFrame) return;
    layoutFrame = window.requestAnimationFrame(() => {
      layoutFrame = 0;
      cards.forEach(layout);
    });
  }

  function nearSlot(card, x, y) {
    if (!visible(card.slot)) return false;
    const rect = card.slot.getBoundingClientRect();
    const margin = Math.max(24, Math.min(46, rect.width * 0.4));
    return x >= rect.left - margin && x <= rect.right + margin &&
      y >= rect.top - margin && y <= rect.bottom + margin;
  }

  function insert(card) {
    if (card.phase !== "ready" || !layout(card)) return;
    cancelDrag(card);
    card.phase = "inserting";
    hint(card);
    move(card, [card.geometry.approach, card.geometry.inserted], 450,
      "cubic-bezier(.22,.7,.3,1)", () => {
        if (!visible(card.slot)) {
          card.phase = card.requested;
          return;
        }
        card.phase = "inserted";
        hint(card);
        if (card.notified) return;
        card.notified = true;
        const callback = card.onInsert;
        if (typeof callback === "function") callback();
      });
  }

  function createCard(side) {
    const layer = document.createElement("div");
    layer.className = "balance-card-layer";
    layer.dataset.side = side;
    layer.hidden = true;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "balance-credit-card";
    button.setAttribute("aria-label", "카드를 투입구에 넣기");
    button.setAttribute("aria-describedby", `balance-card-hint-${side}`);
    button.innerHTML = '<span class="balance-credit-card-brand" aria-hidden="true">BALANCE <b>PAY</b></span>' +
      '<span class="balance-credit-card-chip" aria-hidden="true"></span>' +
      '<span class="balance-credit-card-number" aria-hidden="true">•••• •••• •••• 1024</span>' +
      '<span class="balance-credit-card-owner" aria-hidden="true">EVERYDAY CARD</span>' +
      '<span class="balance-credit-card-mark" aria-hidden="true"></span>';
    const bubble = document.createElement("span");
    bubble.id = `balance-card-hint-${side}`;
    bubble.className = "balance-card-hint";
    bubble.textContent = "카드를 끌어서 넣어 주세요";
    layer.append(button, bubble);
    document.body.appendChild(layer);
    const card = { side, layer, button, hint: bubble, slot: null, requested: "hidden",
      phase: "hidden", onInsert: null, notified: false, drag: null,
      animation: null, epoch: 0, timer: 0, pose: { x: 0, y: 0 }, geometry: null };

    button.addEventListener("pointerdown", (event) => {
      if (card.phase !== "ready" || (event.button !== 0 && event.button !== -1) ||
          event.isPrimary === false || !layout(card)) return;
      event.preventDefault();
      const computed = window.getComputedStyle(button);
      const matrix = new DOMMatrixReadOnly(computed.transform === "none" ? undefined : computed.transform);
      const x = matrix.m41;
      const y = matrix.m42;
      stopMotion(card);
      paint(card, { x, y, angle: 0 });
      button.focus({ preventScroll: true });
      card.drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x, y };
      button.setPointerCapture(event.pointerId);
      hint(card);
    });
    button.addEventListener("pointermove", (event) => {
      if (!card.drag || card.drag.id !== event.pointerId) return;
      const dx = event.clientX - card.drag.startX;
      const dy = event.clientY - card.drag.startY;
      paint(card, { x: card.drag.x + dx, y: card.drag.y + dy,
        angle: Math.max(-12, Math.min(12, dx / 12)) });
      flag(card.slot, "balance-card-slot-near", nearSlot(card, event.clientX, event.clientY));
    });
    const release = (event) => {
      if (!card.drag || card.drag.id !== event.pointerId) return;
      const accepts = event.type === "pointerup" && nearSlot(card, event.clientX, event.clientY);
      // Preserve the dragged pose: layout() must not snap it home before insert().
      const pose = card.pose;
      cancelDrag(card);
      if (accepts) {
        const target = card.geometry;
        card.phase = "inserting";
        hint(card);
        move(card, [target.approach, target.inserted], 450, "cubic-bezier(.22,.7,.3,1)", () => {
          if (!visible(card.slot)) { card.phase = card.requested; return; }
          card.phase = "inserted";
          hint(card);
          if (!card.notified) {
            card.notified = true;
            if (typeof card.onInsert === "function") card.onInsert();
          }
        });
      } else if (card.phase === "ready") {
        paint(card, pose);
        move(card, [{ ...card.geometry.ready, y: card.geometry.ready.y - 6 }, card.geometry.ready],
          430, "cubic-bezier(.2,.9,.25,1.18)");
      }
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", (event) => {
      if (card.drag?.id === event.pointerId) release(event);
    });
    // Native buttons supply Enter/Space and assistive-technology activation.
    // A pointer's synthetic click must not duplicate its drop action.
    button.addEventListener("click", (event) => { if (event.detail === 0) insert(card); });
    return card;
  }

  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(scheduleLayout) : null;

  function sync(side, options) {
    if ((side !== "A" && side !== "B") || !options ||
        !["hidden", "ready", "inserted"].includes(options.state)) return;
    // A hidden kiosk does not need a layer until it first becomes active.
    if (!document.body || (!cards.has(side) && options.state === "hidden")) return;
    let card = cards.get(side);
    if (!card) { card = createCard(side); cards.set(side, card); }
    if (card.slot !== options.slot) {
      flag(card.slot, "balance-card-slot-ready", false);
      flag(card.slot, "balance-card-slot-near", false);
      if (card.slot) resizeObserver?.unobserve(card.slot);
      card.slot = options.slot || null;
      if (card.slot) resizeObserver?.observe(card.slot);
    }
    card.onInsert = options.onInsert;
    const previous = card.requested;
    card.requested = options.state;
    if (previous === options.state) { layout(card); return; }
    if (options.state === "hidden") {
      cancelDrag(card);
      if (card.phase === "hidden" || !visible(card.slot)) {
        stopMotion(card);
        card.phase = "hidden";
        card.layer.hidden = true;
        flag(card.slot, "balance-card-slot-ready", false);
        return;
      }
      const inserted = card.phase === "inserted" || card.phase === "inserting";
      card.phase = "exiting";
      hint(card);
      const ready = card.geometry.ready;
      move(card, inserted
        ? [{ ...card.geometry.approach, y: card.geometry.approach.y + 16 },
          { ...ready, y: ready.y - 22, angle: -14, opacity: 0 }]
        : [{ ...ready, y: ready.y + 12, opacity: 0 }], inserted ? 400 : 180, "ease-out", () => {
          card.phase = "hidden";
          card.layer.hidden = true;
        });
      return;
    }
    if (options.state === "inserted" && card.phase === "inserting") { layout(card); return; }
    stopMotion(card);
    cancelDrag(card);
    card.phase = options.state;
    if (options.state === "ready") card.notified = false;
    if (!layout(card)) return;
    if (options.state === "ready") {
      const ready = card.geometry.ready;
      paint(card, { ...ready, y: ready.y + 15, angle: ready.angle - 5, opacity: 0 });
      move(card, [ready], 260, "cubic-bezier(.2,.8,.2,1)");
    }
  }

  window.addEventListener("resize", scheduleLayout, { passive: true });
  window.addEventListener("scroll", scheduleLayout, { passive: true, capture: true });
  window.visualViewport?.addEventListener("resize", scheduleLayout, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleLayout, { passive: true });
  if (typeof MutationObserver === "function") {
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => !mutation.target.closest?.(".balance-card-layer"))) scheduleLayout();
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true,
      attributeFilter: ["hidden", "class", "style", "data-kiosk-focus"] });
  }

  window.BalanceCard = { sync };
})();
