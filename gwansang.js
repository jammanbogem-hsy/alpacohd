const scanLines = [
  "얼굴 찾는 중...",
  "이마 모양 살펴보는 중...",
  "눈매 읽는 중...",
  "코와 입 위치 재는 중...",
  "웃음 에너지 재는 중...",
  "닮은 동물 찾는 중...",
  "관상 풀이 쓰는 중..."
];

const scanChecklistThresholds = [14, 30, 48, 66, 86];

// 동물 관상 8가지. 풀이는 모두 칭찬만 담고, 아이가 상처받을 수 있는 표현은 쓰지 않습니다.
const animalTypes = {
  puppy: {
    emoji: "🐶",
    title: "다정한 강아지상",
    headline: "보기만 해도 마음이 편해지는 얼굴이에요!",
    readings: [
      "눈매가 순하고 따뜻해 보여요. 처음 만난 친구도 금방 편하게 느낄 거예요.",
      "친구가 힘들어 보이면 먼저 \"괜찮아?\" 하고 물어보는 마음씨가 보여요.",
      "웃을 때 주변까지 환해지는 얼굴이에요."
    ],
    dream: "동물을 돌보는 수의사",
    lucky: "노란 공"
  },
  cat: {
    emoji: "🐱",
    title: "멋쟁이 고양이상",
    headline: "또렷한 눈빛 속에 나만의 생각이 반짝여요!",
    readings: [
      "눈매가 또렷해서 한 번 보면 잘 잊히지 않는 얼굴이에요.",
      "남을 따라 하기보다 나만의 방법을 찾는 멋진 힘이 보여요.",
      "좋아하는 일에는 누구보다 깊이 빠져드는 집중력이 있어요."
    ],
    dream: "멋진 옷을 만드는 디자이너",
    lucky: "보라색 리본"
  },
  lion: {
    emoji: "🦁",
    title: "든든한 사자상",
    headline: "친구들이 기대고 싶어 하는 든든한 얼굴이에요!",
    readings: [
      "이마가 시원하게 보여서 씩씩하고 용감한 느낌을 줘요.",
      "어려운 일이 생기면 \"내가 해 볼게!\" 하고 앞장서는 힘이 보여요.",
      "약한 친구를 지켜 주는 따뜻한 마음도 함께 있어요."
    ],
    dream: "모두를 이끄는 탐험대 대장",
    lucky: "빨간 운동화"
  },
  rabbit: {
    emoji: "🐰",
    title: "호기심 토끼상",
    headline: "반짝이는 눈에 궁금한 게 가득한 얼굴이에요!",
    readings: [
      "눈이 반짝반짝해서 새로운 것을 보면 바로 알아채는 얼굴이에요.",
      "\"왜 그럴까?\" 하고 궁금해하는 마음이 아주 커 보여요.",
      "작은 것에도 크게 기뻐할 줄 아는 밝은 기운이 있어요."
    ],
    dream: "우주를 연구하는 과학자",
    lucky: "분홍색 연필"
  },
  owl: {
    emoji: "🦉",
    title: "똑똑한 부엉이상",
    headline: "생각이 깊고 차분한 지혜가 보이는 얼굴이에요!",
    readings: [
      "눈 주변이 또렷해서 무엇이든 꼼꼼히 살펴보는 관찰력이 보여요.",
      "말하기 전에 한 번 더 생각하는 차분함이 있어요.",
      "친구들이 고민이 있을 때 찾아오고 싶은 얼굴이에요."
    ],
    dream: "수수께끼를 푸는 탐정",
    lucky: "작은 수첩"
  },
  dolphin: {
    emoji: "🐬",
    title: "명랑한 돌고래상",
    headline: "웃는 모습이 친구들을 즐겁게 하는 얼굴이에요!",
    readings: [
      "입꼬리가 밝아 보여서 같이 있으면 기분이 좋아지는 얼굴이에요.",
      "여러 친구와 잘 어울리고 놀이를 재미있게 만드는 힘이 보여요.",
      "엉뚱하고 재미있는 아이디어가 톡톡 튀어나올 것 같아요."
    ],
    dream: "모두를 웃게 하는 유튜버",
    lucky: "파란 물병"
  },
  bear: {
    emoji: "🐻",
    title: "포근한 곰돌이상",
    headline: "옆에 있으면 마음이 든든해지는 얼굴이에요!",
    readings: [
      "얼굴이 동글동글 부드러워서 포근하고 편안한 느낌을 줘요.",
      "한번 약속하면 꼭 지키는 믿음직한 마음이 보여요.",
      "급하게 서두르지 않고 끝까지 해내는 끈기가 있어요."
    ],
    dream: "맛있는 빵을 굽는 제빵사",
    lucky: "꿀 사탕"
  },
  squirrel: {
    emoji: "🐿️",
    title: "부지런 다람쥐상",
    headline: "반짝이는 아이디어와 부지런함이 보이는 얼굴이에요!",
    readings: [
      "눈과 입이 오밀조밀해서 야무지고 똑 부러진 느낌을 줘요.",
      "하나하나 차근차근 모으고 정리하는 꼼꼼함이 보여요.",
      "손으로 무언가 만들기를 아주 잘할 것 같은 얼굴이에요."
    ],
    dream: "신기한 발명품을 만드는 발명가",
    lucky: "도토리 열쇠고리"
  }
};

const state = {
  stream: null,
  detector: null,
  detectorKind: "none",
  detectorLoading: false,
  nativeDetector: null,
  phase: "camera",
  demoMode: false,
  rafId: 0,
  scanTimer: 0,
  scanProgress: 0,
  faceStatus: "탐색 중",
  brightness: 0,
  motion: 0,
  previousFrame: null,
  lastFaceCheck: 0,
  keypoints: null,
  faceBox: { x: 34, y: 23, w: 32, h: 42 },
  rawFaceBox: { x: 34, y: 23, w: 32, h: 42 },
  capturedFeatures: null,
  finalResult: null
};

const els = {
  app: document.querySelector(".face-app"),
  video: document.querySelector("#webcam"),
  fallback: document.querySelector("#cameraFallback"),
  reconnectCameraButton: document.querySelector("#reconnectCameraButton"),
  cameraStatus: document.querySelector("#cameraStatus"),
  faceMetric: document.querySelector("#faceMetric"),
  lightMetric: document.querySelector("#lightMetric"),
  motionMetric: document.querySelector("#motionMetric"),
  calibrationFace: document.querySelector("#calibrationFace"),
  calibrationLight: document.querySelector("#calibrationLight"),
  calibrationGaze: document.querySelector("#calibrationGaze"),
  calibrationQuality: document.querySelector("#calibrationQuality"),
  captureButton: document.querySelector("#captureButton"),
  cameraPanel: document.querySelector("#cameraPanel"),
  scanPanel: document.querySelector("#scanPanel"),
  resultPanel: document.querySelector("#resultPanel"),
  revealPanel: document.querySelector("#revealPanel"),
  scanPercent: document.querySelector("#scanPercent"),
  scanProgressBar: document.querySelector("#scanProgressBar"),
  scanLogs: document.querySelector("#scanLogs"),
  scanChecklistItems: [...document.querySelectorAll("#scanChecklist span")],
  scanConfidence: document.querySelector("#scanConfidence"),
  resultConfidence: document.querySelector("#resultConfidence"),
  animalImage: document.querySelector("#animalImage"),
  animalEmoji: document.querySelector("#animalEmoji"),
  animalTitle: document.querySelector("#animalTitle"),
  animalHeadline: document.querySelector("#animalHeadline"),
  readingList: document.querySelector("#readingList"),
  fortuneDream: document.querySelector("#fortuneDream"),
  fortuneLucky: document.querySelector("#fortuneLucky"),
  resultFactors: document.querySelector("#resultFactors"),
  showRevealButton: document.querySelector("#showRevealButton"),
  restartButton: document.querySelector("#restartButton"),
  trackingBox: document.querySelector("#trackingBox"),
  landmarkLayer: document.querySelector("#landmarkLayer"),
  canvas: document.querySelector("#analysisCanvas")
};

const ctx = els.canvas.getContext("2d", { willReadFrequently: true });

function setPhase(phase) {
  state.phase = phase;
  els.app.dataset.phase = phase;
  [els.cameraPanel, els.scanPanel, els.resultPanel, els.revealPanel].forEach((panel) => {
    panel.classList.remove("is-active");
  });
  if (phase === "camera") els.cameraPanel.classList.add("is-active");
  if (phase === "scanning") els.scanPanel.classList.add("is-active");
  if (phase === "result") els.resultPanel.classList.add("is-active");
  if (phase === "reveal") els.revealPanel.classList.add("is-active");
}

function buildLandmarks() {
  const points = [
    [50, 16],
    [39, 27],
    [61, 27],
    [32, 40],
    [44, 39],
    [56, 39],
    [68, 40],
    [50, 48],
    [38, 61],
    [45, 66],
    [55, 66],
    [62, 61],
    [30, 54],
    [70, 54],
    [41, 78],
    [50, 82],
    [59, 78],
    [27, 33],
    [73, 33],
    [50, 30],
    [45, 52],
    [55, 52],
    [36, 47],
    [64, 47]
  ];
  els.landmarkLayer.innerHTML = points
    .map(([x, y]) => `<span class="landmark-dot" style="left:${x}%; top:${y}%"></span>`)
    .join("");
}

async function startCamera() {
  cancelAnimationFrame(state.rafId);
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }
  state.demoMode = false;
  state.previousFrame = null;
  state.faceStatus = "탐색 중";
  els.video.srcObject = null;
  els.fallback.classList.remove("is-hidden");
  els.fallback.querySelector("strong").textContent = "카메라 연결 중";
  els.fallback.querySelector("span").textContent = "권한 창이 뜨면 카메라 사용을 허용해 주세요.";
  els.cameraStatus.textContent = "권한 요청 중";
  buildLandmarks();
  setupDetector();

  if (!navigator.mediaDevices?.getUserMedia) {
    enableDemoMode("이 브라우저에서는 카메라 권한 요청을 사용할 수 없어 연습 모드로 진행해요.");
    startSampling();
    return;
  }

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    els.video.srcObject = state.stream;
    await els.video.play();
    els.fallback.classList.add("is-hidden");
    els.cameraStatus.textContent = "카메라 연결됨";
  } catch (error) {
    enableDemoMode("카메라 권한이 거부되었거나 현재 브라우저에서 차단되어 연습 모드로 진행해요.");
  }

  startSampling();
}

function setupDetector() {
  state.detector = null;
  state.detectorKind = "none";

  setupNativeDetector();
  setupMediaPipeDetector();
}

function setupNativeDetector() {
  state.nativeDetector = null;
  if (!("FaceDetector" in window)) return;

  try {
    state.nativeDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    state.detector = state.nativeDetector;
    state.detectorKind = "native";
  } catch (error) {
    state.nativeDetector = null;
  }
}

async function setupMediaPipeDetector() {
  if (state.detectorLoading) return;
  state.detectorLoading = true;

  try {
    const visionModule = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
    );
    const vision = await visionModule.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    state.detector = await createMediaPipeFaceDetector(visionModule, vision, "GPU").catch(() =>
      createMediaPipeFaceDetector(visionModule, vision, "CPU")
    );
    state.detectorKind = "mediapipe";
  } catch (error) {
    if (state.nativeDetector) {
      state.detector = state.nativeDetector;
      state.detectorKind = "native";
    } else {
      state.detector = null;
      state.detectorKind = "none";
    }
  } finally {
    state.detectorLoading = false;
  }
}

function createMediaPipeFaceDetector(visionModule, vision, delegate) {
  return visionModule.FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
      delegate
    },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.45
  });
}

function enableDemoMode(message) {
  state.demoMode = true;
  els.fallback.classList.remove("is-hidden");
  els.fallback.querySelector("strong").textContent = "연습 모드";
  els.fallback.querySelector("span").textContent = message;
  els.cameraStatus.textContent = "연습 모드";
}

function startSampling() {
  cancelAnimationFrame(state.rafId);
  const tick = (time) => {
    if (state.demoMode || els.video.readyState < 2) {
      updateDemoMetrics();
    } else {
      updateFrameMetrics();
      checkFace(time);
    }
    updateHud();
    animateFallbackBox();
    applyFaceBox();
    state.rafId = requestAnimationFrame(tick);
  };
  state.rafId = requestAnimationFrame(tick);
}

function updateDemoMetrics() {
  const t = Date.now() / 760;
  state.brightness = clamp(56 + Math.sin(t) * 18 + Math.random() * 8, 10, 96);
  state.motion = clamp(22 + Math.cos(t * 1.7) * 18 + Math.random() * 14, 0, 100);
  state.faceStatus = Math.random() > 0.12 ? "추적 고정" : "탐색 중";
}

function updateFrameMetrics() {
  const width = els.canvas.width;
  const height = els.canvas.height;
  ctx.drawImage(els.video, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  let light = 0;
  let motion = 0;
  const current = new Uint8Array(data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    const pixel = i / 4;
    light += lum;
    current[pixel] = lum;
    if (state.previousFrame) {
      motion += Math.abs(lum - state.previousFrame[pixel]);
    }
  }

  const pixels = current.length;
  state.previousFrame = current;
  state.brightness = clamp((light / pixels / 255) * 100, 0, 100);
  state.motion = clamp((motion / pixels / 55) * 100, 0, 100);
}

function checkFace(time) {
  if (!state.detector || time - state.lastFaceCheck < 180) {
    if (!state.detector) state.faceStatus = state.detectorLoading ? "모델 준비 중" : "추적 중";
    return;
  }
  state.lastFaceCheck = time;

  if (state.detectorKind === "mediapipe") {
    try {
      const result = runMediaPipeDetection(time);
      const detection = result.detections?.[0];
      if (!detection) {
        state.faceStatus = "탐색 중";
        return;
      }
      updateDetectedFaceBox(detection.boundingBox);
      state.keypoints = detection.keypoints || null;
    } catch (error) {
      state.faceStatus = "추적 중";
    }
    return;
  }

  state.detector
    .detect(els.video)
    .then((faces) => {
      if (!faces.length || !els.video.videoWidth || !els.video.videoHeight) {
        state.faceStatus = "탐색 중";
        return;
      }
      updateDetectedFaceBox(faces[0].boundingBox);
    })
    .catch(() => {
      state.faceStatus = "추적 중";
  });
}

function runMediaPipeDetection(time) {
  try {
    return state.detector.detectForVideo(els.video, time);
  } catch (error) {
    return state.detector.detectForVideo(els.video);
  }
}

function updateDetectedFaceBox(box) {
  const pixelBox = normalizeDetectionBox(box);
  if (!pixelBox) {
    state.faceStatus = "탐색 중";
    return;
  }

  state.rawFaceBox = {
    x: clamp((pixelBox.x / els.video.videoWidth) * 100, 0, 100),
    y: clamp((pixelBox.y / els.video.videoHeight) * 100, 0, 100),
    w: clamp((pixelBox.w / els.video.videoWidth) * 100, 1, 100),
    h: clamp((pixelBox.h / els.video.videoHeight) * 100, 1, 100)
  };
  state.faceBox = videoPixelsToOverlayBox(pixelBox);
  state.faceStatus = "추적 고정";
}

function normalizeDetectionBox(box) {
  if (!box || !els.video.videoWidth || !els.video.videoHeight) return null;

  const x = box.originX ?? box.origin_x ?? box.x ?? box.xMin ?? 0;
  const y = box.originY ?? box.origin_y ?? box.y ?? box.yMin ?? 0;
  const w = box.width ?? (box.xMax && box.xMin ? box.xMax - box.xMin : 0);
  const h = box.height ?? (box.yMax && box.yMin ? box.yMax - box.yMin : 0);
  if (!w || !h) return null;

  return { x, y, w, h };
}

function videoPixelsToOverlayBox(box) {
  const appRect = els.app.getBoundingClientRect();
  const videoRect = els.video.getBoundingClientRect();
  const scale = Math.max(videoRect.width / els.video.videoWidth, videoRect.height / els.video.videoHeight);
  const drawnWidth = els.video.videoWidth * scale;
  const drawnHeight = els.video.videoHeight * scale;
  const cropX = (videoRect.width - drawnWidth) / 2;
  const cropY = (videoRect.height - drawnHeight) / 2;
  const leftPx = videoRect.left - appRect.left + videoRect.width - (box.x + box.w) * scale + cropX;
  const topPx = videoRect.top - appRect.top + box.y * scale + cropY;
  const widthPx = box.w * scale;
  const heightPx = box.h * scale;

  return {
    x: clamp((leftPx / appRect.width) * 100, 4, 86),
    y: clamp((topPx / appRect.height) * 100, 8, 72),
    w: clamp((widthPx / appRect.width) * 100, 12, 64),
    h: clamp((heightPx / appRect.height) * 100, 16, 72)
  };
}

function animateFallbackBox() {
  if (state.detector && state.faceStatus === "추적 고정") return;
  const t = Date.now() / 1100;
  state.faceBox = {
    x: 34 + Math.sin(t) * 2.8,
    y: 23 + Math.cos(t * 0.9) * 2.4,
    w: 32 + Math.sin(t * 0.7) * 1.4,
    h: 42 + Math.cos(t * 0.8) * 1.6
  };
  state.rawFaceBox = {
    x: clamp(100 - state.faceBox.x - state.faceBox.w, 0, 100),
    y: state.faceBox.y,
    w: state.faceBox.w,
    h: state.faceBox.h
  };
}

function applyFaceBox() {
  const box = state.faceBox;
  [els.trackingBox, els.landmarkLayer].forEach((element) => {
    element.style.setProperty("--x", `${box.x}%`);
    element.style.setProperty("--y", `${box.y}%`);
    element.style.setProperty("--w", `${box.w}%`);
    element.style.setProperty("--h", `${box.h}%`);
  });
}

function updateHud() {
  els.faceMetric.textContent = state.faceStatus;
  els.lightMetric.textContent = `${Math.round(state.brightness)}%`;
  els.motionMetric.textContent = `${Math.round(state.motion)}%`;
  updateCalibration();
}

function updateCalibration() {
  const faceReady = state.faceStatus === "추적 고정";
  const lightReady = state.brightness >= 34 && state.brightness <= 82;
  const gazeReady =
    faceReady &&
    Math.hypot(state.faceBox.x + state.faceBox.w / 2 - 50, state.faceBox.y + state.faceBox.h / 2 - 44) < 17;
  const qualityReady = faceReady && lightReady && state.motion < 72;

  setCalibrationItem(els.calibrationFace, faceReady, faceReady ? "얼굴 찾기 완료" : "얼굴 찾는 중");
  setCalibrationItem(els.calibrationLight, lightReady, lightReady ? "밝기 딱 좋아요" : "밝기 확인 중");
  setCalibrationItem(els.calibrationGaze, gazeReady, gazeReady ? "정면 보기 완료" : "정면 보기 확인 중");
  setCalibrationItem(
    els.calibrationQuality,
    qualityReady,
    qualityReady ? "관상 볼 준비 완료" : "준비 상태 확인 중"
  );
}

function setCalibrationItem(element, isReady, label) {
  element.classList.toggle("is-ready", isReady);
  element.classList.toggle("is-waiting", !isReady);
  element.querySelector("b").textContent = isReady ? "✓" : "•";
  element.querySelector("em").textContent = label;
}

function startScan() {
  setPhase("scanning");
  state.scanProgress = 0;
  state.capturedFeatures = captureFeatures();
  state.finalResult = createFinalResult();
  els.scanLogs.innerHTML = "";
  els.scanPercent.textContent = "0%";
  els.scanProgressBar.style.width = "0%";
  els.scanConfidence.textContent = "--%";
  updateScanChecklist(0);

  let lineIndex = 0;
  clearInterval(state.scanTimer);
  state.scanTimer = setInterval(() => {
    state.scanProgress = Math.min(100, state.scanProgress + 4 + Math.random() * 7);
    const visibleProgress = Math.round(state.scanProgress);
    const confidence = Math.min(97, Math.round(42 + state.scanProgress * 0.58 + Math.random() * 8));
    els.scanPercent.textContent = `${visibleProgress}%`;
    els.scanProgressBar.style.width = `${visibleProgress}%`;
    els.scanConfidence.textContent = `${confidence}%`;
    updateScanChecklist(visibleProgress);

    if (lineIndex < scanLines.length && state.scanProgress > lineIndex * 13) {
      addScanLog(scanLines[lineIndex]);
      lineIndex += 1;
    }

    if (state.scanProgress >= 100) {
      clearInterval(state.scanTimer);
      els.scanConfidence.textContent = `${state.finalResult.confidence}%`;
      setTimeout(showResults, 520);
    }
  }, 210);
}

function updateScanChecklist(progress) {
  els.scanChecklistItems.forEach((item, index) => {
    item.classList.toggle("is-complete", progress >= scanChecklistThresholds[index]);
  });
}

function addScanLog(message) {
  const item = document.createElement("span");
  item.textContent = message;
  els.scanLogs.prepend(item);
}

function showResults() {
  setPhase("result");
  cancelAnimationFrame(state.rafId);
  const finalResult = state.finalResult || createFinalResult();
  state.finalResult = finalResult;
  const animal = animalTypes[finalResult.animalId];
  els.resultConfidence.textContent = `정확도: ${finalResult.confidence}%`;
  els.animalImage.src = `/assets/gs/${finalResult.animalId}.png`;
  els.animalImage.alt = animal.title;
  els.animalEmoji.textContent = animal.emoji;
  els.animalTitle.textContent = animal.title;
  els.animalHeadline.textContent = animal.headline;
  els.readingList.innerHTML = animal.readings.map((line) => `<li>${line}</li>`).join("");
  els.fortuneDream.textContent = animal.dream;
  els.fortuneLucky.textContent = animal.lucky;
  els.resultFactors.innerHTML = finalResult.factors.map((factor) => `<li>${factor}</li>`).join("");
}

// 실제 관상이 아니라, 얼굴 상자와 눈·코·입 위치에서 잰 숫자 몇 개로 동물을 고릅니다.
function createFinalResult() {
  const features = state.capturedFeatures || captureFeatures();
  const face = measureFace(features);
  const scores = {
    bear: (face.ratio - 0.86) * 10,
    cat: (0.8 - face.ratio) * 10,
    lion: (features.faceSize - 1300) / 450,
    owl: (face.eyeGap - 0.46) * 22,
    squirrel: (0.4 - face.eyeGap) * 22,
    rabbit: (features.faceBrightness - 62) / 10,
    dolphin: (0.2 - face.mouthDrop) * 16,
    puppy: (12 - features.centerOffset) / 12
  };
  Object.keys(scores).forEach((id) => {
    scores[id] += Math.random() * 1.4;
  });
  const animalId = Object.keys(scores).reduce((best, id) => (scores[id] > scores[best] ? id : best));

  return {
    animalId,
    confidence: Math.round(clamp(91 + Math.random() * 8, 91, 99)),
    factors: describeFace(face, features)
  };
}

function measureFace(features) {
  const box = state.rawFaceBox;
  const videoWidth = els.video.videoWidth || 16;
  const videoHeight = els.video.videoHeight || 9;
  const ratio = state.demoMode
    ? 0.74 + Math.random() * 0.24
    : clamp((box.w * videoWidth) / (box.h * videoHeight), 0.5, 1.4);
  const points = features.keypoints;
  if (!points || points.length < 4) {
    return { ratio, eyeGap: 0.38 + Math.random() * 0.12, mouthDrop: 0.15 + Math.random() * 0.1 };
  }
  const [rightEye, leftEye, nose, mouth] = points;
  const eyeDistance = Math.hypot((leftEye.x - rightEye.x) * videoWidth, (leftEye.y - rightEye.y) * videoHeight);
  return {
    ratio,
    eyeGap: clamp(eyeDistance / ((box.w / 100) * videoWidth), 0.2, 0.8),
    mouthDrop: clamp((mouth.y - nose.y) / (box.h / 100), 0.05, 0.45)
  };
}

function describeFace(face, features) {
  const shape = face.ratio >= 0.86 ? "동글동글한 얼굴형" : face.ratio <= 0.8 ? "갸름한 얼굴형" : "균형 잡힌 얼굴형";
  const eyes = face.eyeGap >= 0.46 ? "시원하게 넓은 눈매" : face.eyeGap <= 0.4 ? "오밀조밀한 눈매" : "또렷한 눈매";
  const distance = features.faceSize > 1700 ? "가까워요" : features.faceSize < 800 ? "멀어요" : "적당해요";
  return [
    `얼굴 가로÷세로 비율 ${face.ratio.toFixed(2)} → ${shape}`,
    `눈 사이 간격 ${face.eyeGap.toFixed(2)} → ${eyes}`,
    `코와 입 사이 거리 ${face.mouthDrop.toFixed(2)}`,
    `얼굴 밝기 ${Math.round(features.faceBrightness)}%`,
    `카메라와의 거리: ${distance}`
  ];
}

function captureFeatures() {
  const base = {
    overallBrightness: state.brightness,
    faceBrightness: state.brightness,
    motion: state.motion,
    faceLocked: state.faceStatus === "추적 고정",
    keypoints: state.faceStatus === "추적 고정" ? state.keypoints : null,
    faceSize: state.faceBox.w * state.faceBox.h,
    centerOffset: Math.hypot(state.faceBox.x + state.faceBox.w / 2 - 50, state.faceBox.y + state.faceBox.h / 2 - 44),
    eyeBandDarkRatio: 0,
    lowerDarkRatio: 0
  };

  if (state.demoMode || els.video.readyState < 2) return base;

  const width = els.canvas.width;
  const height = els.canvas.height;
  ctx.drawImage(els.video, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const rawBox = state.rawFaceBox;
  const faceRect = rectFromPercent(rawBox.x, rawBox.y, rawBox.w, rawBox.h, width, height);
  const eyeRect = rectFromPercent(
    rawBox.x + rawBox.w * 0.18,
    rawBox.y + rawBox.h * 0.24,
    rawBox.w * 0.64,
    rawBox.h * 0.2,
    width,
    height
  );
  const lowerRect = rectFromPercent(34, 68, 32, 22, width, height);

  return {
    ...base,
    faceBrightness: averageBrightness(data, width, faceRect),
    eyeBandDarkRatio: darkRatio(data, width, eyeRect, 78),
    lowerDarkRatio: darkRatio(data, width, lowerRect, 82)
  };
}

function rectFromPercent(x, y, w, h, width, height) {
  const left = Math.round(clamp(x, 0, 100) * width / 100);
  const top = Math.round(clamp(y, 0, 100) * height / 100);
  const rectWidth = Math.max(1, Math.round(clamp(w, 1, 100) * width / 100));
  const rectHeight = Math.max(1, Math.round(clamp(h, 1, 100) * height / 100));
  return {
    x: Math.min(left, width - 1),
    y: Math.min(top, height - 1),
    w: Math.max(1, Math.min(rectWidth, width - left)),
    h: Math.max(1, Math.min(rectHeight, height - top))
  };
}

function averageBrightness(data, width, rect) {
  let total = 0;
  let count = 0;
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const index = (y * width + x) * 4;
      total += data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      count += 1;
    }
  }
  return count ? (total / count / 255) * 100 : state.brightness;
}

function darkRatio(data, width, rect, threshold) {
  let dark = 0;
  let count = 0;
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const index = (y * width + x) * 4;
      const light = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      if (light < threshold) dark += 1;
      count += 1;
    }
  }
  return count ? dark / count : 0;
}

function showReveal() {
  clearInterval(state.scanTimer);
  cancelAnimationFrame(state.rafId);
  setPhase("reveal");
  stopCamera();
}

function restart() {
  setPhase("camera");
  els.animalImage.removeAttribute("src");
  els.animalTitle.textContent = "관상을 준비하고 있어요";
  els.animalHeadline.textContent = "";
  els.readingList.innerHTML = "";
  els.resultFactors.innerHTML = "";
  els.scanLogs.innerHTML = "";
  state.previousFrame = null;
  state.keypoints = null;
  state.capturedFeatures = null;
  state.finalResult = null;
  startCamera();
}

function stopCamera() {
  cancelAnimationFrame(state.rafId);
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }
  els.video.srcObject = null;
  els.fallback.classList.remove("is-hidden");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

els.captureButton.addEventListener("click", startScan);
els.reconnectCameraButton.addEventListener("click", startCamera);
els.showRevealButton.addEventListener("click", showReveal);
els.restartButton.addEventListener("click", restart);
window.addEventListener("beforeunload", stopCamera);

startCamera();
