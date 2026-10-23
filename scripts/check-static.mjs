import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "hard-alien.css",
  "hard-payment.css",
  "chromebook.css",
  "kiosk-3d.css",
  "kiosk-store.css",
  "timer-urgency.css",
  "kiosk-effects.css",
  "kiosk-feedback.css",
  "kiosk-effects.js",
  "app.js",
  "bias.html",
  "bias.css",
  "bias.js",
  "balance.html",
  "balance.css",
  "balance-surface.css",
  "balance-hardware.css",
  "balance.js",
  "balance-card.css",
  "balance-card.js",
  "balance-themes.css",
  "balance-stages.css",
  "assets/balance/meal-menu.png",
  "assets/balance/kiosk-shell.png",
  "assets/balance/fonts/PretendardVariable.woff2",
  "assets/balance/fonts/LICENSE.txt",
  "vercel.json"
];
const requiredSnippets = [
  "이상한 키오스크 월드",
  "3초 뒤 사라지는 주문 키오스크",
  "HARD_TIMER_SECONDS = 1.8;",
  "EXTREME_TIMER_SECONDS = 1.6",
  "INSANE_TIMER_SECONDS = 1.4",
  "명예의 전당",
  "새우버거, 콘샐러드, 레몬에이드(M), 얼음 중간, 쿠폰만 사용",
  "더 어려운 모드",
  "더블패티버거, 버팔로윙, 제로환타(L), 얼음 많이, 모바일 상품권 결제",
  "어려운 결제 키오스크",
  "외계어 메뉴 키오스크",
  "알파코 : 블랙박스",
  "인공지능 얼굴 프로파일링 시스템",
  "인공지능 얼굴 분석 체험",
  "스캔 중...",
  "실제 감정·위험도·인종·성별 분석을 수행하지 않습니다"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const html = await readFile("index.html", "utf8");
const biasHtml = await readFile("bias.html", "utf8");
const balanceHtml = await readFile("balance.html", "utf8");
const js = await readFile("app.js", "utf8");
const biasJs = await readFile("bias.js", "utf8");
const vercelConfig = JSON.parse(await readFile("vercel.json", "utf8"));
const source = `${html}\n${js}\n${biasHtml}\n${biasJs}`;

const missing = requiredSnippets.filter((snippet) => !source.includes(snippet));

if (missing.length > 0) {
  throw new Error(`Missing required content: ${missing.join(", ")}`);
}

const productImagesBlock = js.match(/const productImages = \{([\s\S]*?)\n\};/);
if (!productImagesBlock) {
  throw new Error("Missing productImages map");
}

const imagePaths = [...productImagesBlock[1].matchAll(/:\s*"([^"]+)"/g)].map((match) => match[1]);
await Promise.all(imagePaths.map((path) => access(path)));

if (!biasHtml.includes('href="/bias.css') || !biasHtml.includes('src="/bias.js')) {
  throw new Error("Bias route is missing its CSS or JS asset link");
}

if (html.includes('href="/bias"')) {
  throw new Error("Main app should not link to the independent /bias route");
}

const hasBiasRewrite = vercelConfig.rewrites?.some(
  (rewrite) => rewrite.source === "/bias" && rewrite.destination === "/bias.html"
);

if (!hasBiasRewrite) {
  throw new Error("Vercel config is missing the /bias rewrite");
}

if (!balanceHtml.includes('href="/balance.css"') || !balanceHtml.includes('src="/balance.js"')) {
  throw new Error("Balance route is missing its CSS or JS asset link");
}
if (!vercelConfig.rewrites?.some((rewrite) => rewrite.source === "/balance" && rewrite.destination === "/balance.html")) {
  throw new Error("Vercel config is missing the /balance rewrite");
}

console.log("Static app check passed.");
