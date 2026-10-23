# 말맛식당 제작 기록

`meal-menu.png`는 내장 `image_gen` 도구로 새로 생성한 1536 × 1024 픽셀 메뉴 사진 시트입니다. 3열 × 2행의 불고기덮밥, 비빔밥, 돈가스, 떡볶이, 군만두, 청포도에이드를 `balance.css`와 `balance.js`에서 배경 위치로 나누어 표시합니다. 기존 이미지의 대체 없이 이 활동 전용으로 추가했습니다.

## 최종 생성 프롬프트

Use case: product-mockup. Generate a professional photorealistic Korean casual restaurant menu photography asset sheet, landscape 3:2 ratio, composed of EXACTLY six equally sized rectangular panels in a precise 3 columns by 2 rows grid, seamless neutral warm ivory backgrounds. Each panel has ample empty margins and one entire dish fully within its own cell, consistent overhead three-quarter camera angle, realistic studio lighting and appetizing textures. Top row left: Korean bulgogi rice bowl with thin beef strips scallions sesame on white rice in a dark ceramic bowl. Top row middle: Korean bibimbap rice bowl with colorful separate vegetables, red gochujang and sunny-side fried egg in a dark bowl. Top row right: golden crispy pork tonkatsu cutlet sliced on a cream plate with cabbage salad and dark sauce. Bottom row left: thick Korean tteokbokki rice cakes in shiny red sauce in a cream shallow bowl. Bottom row middle: six golden fried dumplings neatly on a cream plate with tiny soy dip. Bottom row right: clear tall glass of sparkling green grape soda with ice, two green grapes and a small mint sprig. NO text NO labels NO letters NO logos NO watermarks NO visible panel lines NO hands. Food must be naturally photographic, clean premium restaurant catalog style, crisp details, consistent scale. This will be used as CSS background-position sprite images in real ordering kiosks, so exact equal grid and full dishes within each cell are critical.

## 지역 표현과 수업 조건

주문 입력 음성이나 손님 주문 카드가 아닌 **키오스크 자체의 표시 언어**를 전환합니다. 왼쪽의 선택기에서 표준어·전라도·경상도·제주도를 고르면 메뉴 분류, 음식명·설명, 버튼, 장바구니, 수량·얼음 옵션, 결제 확인, 카드 안내와 영수증이 함께 바뀝니다. 메뉴 고유 이름과 가격·수량·원 단위는 일부 공통으로 유지합니다.

언어 선택은 숨겨진 선택 상자 대신 네 개의 터치 버튼으로 제공합니다. 선택 상태를 `aria-pressed`로 표시하고, 언어 변경 중에는 중복 입력을 막습니다. 언어를 바꾸어도 선택한 메뉴·수량·얼음·금액 오류 상태는 유지합니다. 분류·메뉴 설명·수량과 얼음 옵션·취소 확인·결제 대기·완료·영수증과 본체 장치 안내까지 같은 지역 표현 묶음으로 출력합니다. 브랜드명·통화·일부 공통 음식명은 유지합니다.

지역 표현은 아래 공개 자료의 어휘와 용례를 참고하여 주문 화면에 맞게 각색했습니다. 전체 문장을 현지 화자가 감수한 번역은 아니며 같은 지역 안에서도 마을·세대에 따라 표현이 달라질 수 있습니다.

| 지역 | 화면에서 두드러지는 표현 | 적용 범위 |
| --- | --- | --- |
| 전라도 | 여그서, 허기, 쪼까, 따순, 참지름 | 음식 설명·식사 방식·옵션·결제·장치 안내 |
| 경상도 | 묵으이소, 우예, 쪼매, 주이소, 입니더 | 분류·음식 설명·옵션·확인·완료 |
| 제주도 | 이디, 몬딱, 호끔, 괴기, 도새기, 줍서 | 분류·음식명·설명·옵션·취소·결제·완료 |

- [제주특별자치도 제주어 교육 플랫폼: 호꼼·호끔(조금)](https://www.jeju.go.kr/jedu/data/card.htm?act=view&category=3104&page=1&seq=1535001)
- [제주학연구센터: 제주어 길라잡이 — 몬딱·하영 등](https://jst.re.kr/upload/pdf/RC00094038.pdf)
- [제주특별자치도·제주학연구센터 식생활 구술 자료 — 괴기·이영 등](https://www.jeju.go.kr/jedu/map/record.htm?page=150)
- [제주특별자치도 농업기술원 자료 — 도새기(돼지)](https://agri.jeju.go.kr/ebook/technology.htm?act=download&no=1&page=16&seq=44091)
- [국립국어원: 지역 언어문화 상품 개발 보고서 — 전라도 ‘쪼까’와 지역어 활용](https://www.korean.go.kr/common/download.do?c_file_name=add45015-fc3a-4704-b904-734ceb9a36e1_0.pdf&file_path=reportData&o_file_name=%EC%A7%80%EC%97%AD+%EC%96%B8%EC%96%B4%EB%AC%B8%ED%99%94+%EC%83%81%ED%92%88+%EA%B0%9C%EB%B0%9C+%EB%B3%B4%EA%B3%A0%EC%84%9C.pdf)
- [부산교구 공식 주보: ‘오이소, 보이소, 묵으이소’ 용례](https://www.catholicbusan.or.kr/uploads/bsd01/ext_jubo/1781655477.pdf)

같은 개발비를 받은 두 제품이라는 가상 조건입니다. 왼쪽은 지역말 지원에 투자하여 구형 화면과 0.9~2.1초의 가변 반응 지연, 끊기는 스크롤과 로딩 표시, 3.2초의 결제 대기를 설정했습니다. 오른쪽은 표준어만 지원하는 대신 메뉴 배치와 반응을 최적화했고 합계도 항상 정확합니다. 사투리를 지원하면 실제 제품이 반드시 느려진다는 의미는 아닙니다. 왼쪽에서 표준어로 바꾸어도 성능 조건은 같습니다.

왼쪽의 합계 오류는 장바구니가 비어 있지 않은 재계산 중 2·5·8번째에 발생합니다. +1,000원과 −500원의 오차가 번갈아 적용되며, 다음 재계산에서는 정상으로 돌아옵니다. 개별 행의 수량·단가·행 금액은 정확하게 유지하여 학생이 합계 오류를 발견할 수 있습니다. 해당 주문의 합계는 주문 확인·결제·영수증에서 일관되게 표시하고, 언어·확대 전환으로는 바꾸지 않습니다. `처음으로`는 오류 순서도 초기화합니다.

스크롤은 왼쪽 화면 안의 휠·터치 입력만 150ms씩 모아 화면에 반영합니다. 브라우저 실행을 막거나 오른쪽 성능을 낮추지 않습니다. 동작 줄이기 설정에서는 스크롤과 회전 효과를 해제하고 반응 지연과 계산 오류 조건은 유지합니다. 학생 화면에는 성능 조건 설명이나 오류 정답을 추가하지 않습니다.

## 본체 외형

`kiosk-shell.png`는 내장 `image_gen` 도구로 생성한 1024 × 1536 픽셀의 투명 배경 제품 이미지입니다. 무광 흰색 금속 본체, 검은 유리 베젤, 실제 형태의 카드 단말기와 영수증 출구를 포함합니다. [최종 생성 프롬프트](kiosk-shell.prompt.txt)를 함께 보관합니다.

생성 이미지의 화면 영역은 x=232, y=108, width=562, height=934 픽셀로 측정했습니다. `balance-hardware.css`에서 이 비율에 실제 HTML 주문 화면을 배치합니다. 카드 단말기의 투명 버튼도 사진의 단말기 위치와 맞추었고, 결제 시에만 활성화합니다. 주문과 수량 계산, 언어 전환, 옵션, 결제와 영수증은 실제 DOM으로 동작합니다. 이전에 CSS로 그렸던 본체·단말기·베젤 규칙은 제거했습니다.

`balance-surface.css`는 화면의 글자, 메뉴 그리드, 장바구니, 결제 및 상세 화면을 담당합니다. 오른쪽은 청록·화이트 색상과 둥근 카드·버튼, 반투명 유리층과 이중 테두리, 가장자리의 정적인 반사광·물방울을 사용합니다. 흐림 효과는 큰 표면 일부에만 적용하고 음식과 글씨 위에는 반사 장식을 겹치지 않으며, 장식 레이어는 포인터 입력을 받지 않습니다. 큰 확대 화면은 3열, 좁은 확대 화면은 2열로 구성하고, 메뉴명과 가격을 굵은 고딕으로 표시합니다. 상세·주문 확인·결제·영수증도 같은 색상과 서체를 사용합니다. 왼쪽은 두꺼운 회색 베벨, 별도 언어 패널과 안내 구획을 사용하는 구형 주문기로 구성합니다. `balance-hardware.css`는 본체 이미지와 화면·장치 좌표 및 오른쪽 화면의 둥근 유리 테두리를 담당합니다.

음식 사진은 기존 생성 결과를 재사용하고 SVG의 viewBox로 사진 시트의 각 칸을 비율 왜곡 없이 표시합니다. 학습 설명과 제작 정보는 이 문서에만 두고 학생 체험 화면에는 표시하지 않습니다.

두 기기를 보여 주는 화면에서 본체를 누르면 해당 기기를 확대합니다. 확대 전의 화면은 `inert`로 주문 조작을 막고 확대 버튼만 키보드로 선택할 수 있게 했습니다. 확대 후에는 해당 기기만 조작하며 `돌아가기` 또는 Escape로 비교 화면에 복귀합니다. 상세·주문 확인 화면에서 Escape는 먼저 해당 창을 닫습니다. 주문 데이터는 화면 전환과 별개로 유지하며, 확대 애니메이션은 동작 줄이기 설정을 존중합니다.

## 오른쪽 전용 글꼴

[Pretendard 공식 저장소](https://github.com/orioncactus/pretendard)의 `v1.3.9` 릴리스에서 수정 없이 가져온 `PretendardVariable.woff2`를 `fonts/`에 포함했습니다. 같은 릴리스의 SIL Open Font License 원문을 `fonts/LICENSE.txt`에 보관합니다. CSS에서는 `Balance Pretendard`라는 별칭으로 오른쪽 화면에만 적용하며, 왼쪽 글꼴은 유지합니다. 글꼴은 로컬 정적 파일로 제공하고 외부 CDN을 호출하지 않습니다.

- 원본: https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2
- SHA-256: `9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4`
