const canvas = document.getElementById("roulette-canvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-button");
const categorySelect = document.getElementById("category");
const resultContainer = document.getElementById("result-container");
const resultTextSpan = document.querySelector("#result-text span");
const resultImg = document.getElementById("result-image");
const seasonalList = document.getElementById("seasonal-list");
const currentMonthSpan = document.getElementById("current-month");

const menus = {
  korean: [
    "김치찌개", "된장찌개", "순두부찌개", "제육볶음", "불고기",
    "비빔밥", "갈비탕", "삼계탕", "닭갈비", "보쌈",
    "족발", "김밥", "떡볶이", "라면", "냉면",
    "칼국수", "수제비", "오징어볶음", "닭볶음탕", "설렁탕",
    "육개장", "곰탕", "순대국", "청국장", "감자탕"
  ],
  chinese: [
    "짜장면", "짬뽕", "탕수육", "마라탕", "마라샹궈",
    "깐풍기", "유린기", "양장피", "볶음밥", "군만두",
    "고추잡채", "훠궈", "마파두부", "라즈지", "샤오롱바오",
    "동파육", "멘보샤", "유산슬", "누룽지탕", "울면"
  ],
  western: [
    "파스타", "스테이크", "피자", "햄버거", "리조또",
    "샐러드", "오믈렛", "토스트", "핫도그", "치킨",
    "감바스", "브런치", "샌드위치", "크림파스타", "라자냐",
    "에그베네딕트", "바베큐립", "피쉬앤칩스", "퀘사디아", "타코"
  ],
  japanese: [
    "초밥", "라멘", "돈카츠", "우동", "소바",
    "규동", "텐동", "오코노미야끼", "타코야끼", "가츠동",
    "사케동", "에비동", "야키니쿠", "카레라이스", "가라아게",
    "나베", "메밀소바", "장어덮밥", "회덮밥", "돈코츠라멘"
  ]
};

const seasonalFoods = {
  1: ["더덕", "과메기", "꼬막", "명태", "한라봉"],
  2: ["아귀", "바지락", "우엉", "딸기", "삼치"],
  3: ["냉이", "달래", "쑥", "쭈꾸미", "소라"],
  4: ["두릅", "엄나무순", "미더덕", "키조개", "참나물"],
  5: ["매실", "멍게", "다슬기", "취나물", "장어"],
  6: ["감자", "참외", "장어", "복분자", "매실"],
  7: ["복숭아", "수박", "토마토", "옥수수", "갈치"],
  8: ["포도", "전복", "참나물", "고구마", "블루베리"],
  9: ["대하", "전어", "꽃게", "배", "은행"],
  10: ["사과", "고등어", "무", "늙은호박", "석류"],
  11: ["배추", "무", "굴", "해삼", "도루묵"],
  12: ["명태", "아귀", "도미", "한라봉", "유자"]
};

const colors = ["#f1c40f", "#e67e22", "#e74c3c", "#9b59b6", "#3498db", "#2ecc71", "#1abc9c", "#34495e"];

let currentCategory = "korean";
let currentRotation = 0;
let isSpinning = false;

function drawRoulette(category) {
  const items = menus[category];
  const numSegments = items.length;
  const arcSize = (2 * Math.PI) / numSegments;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, i) => {
    const angle = i * arcSize;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arcSize);
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.fill();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(item, canvas.width / 2 - 20, 10);
    ctx.restore();
  });
}

function spin() {
  if (isSpinning) return;

  isSpinning = true;
  resultContainer.classList.add("hidden");
  
  const items = menus[currentCategory];
  const numSegments = items.length;
  const spinAngle = Math.random() * 360 + 3600;
  const duration = 4000;
  const startTimestamp = performance.now();

  function animate(timestamp) {
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const rotation = easeOut * spinAngle;
    
    canvas.style.transform = `rotate(${rotation}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      currentRotation = rotation % 360;
      
      const arcSizeDeg = 360 / numSegments;
      const actualRotation = (360 - (currentRotation % 360) + 270) % 360;
      const selectedIndex = Math.floor(actualRotation / arcSizeDeg);
      const selectedItem = items[selectedIndex];

      showResult(selectedItem);
    }
  }

  requestAnimationFrame(animate);
}

function showResult(item) {
  resultTextSpan.innerText = item;
  // Refine search query with "food" and "dish" for better accuracy
  resultImg.src = `https://loremflickr.com/640/480/food,${encodeURIComponent(item)},dish/all`;
  resultContainer.classList.remove("hidden");
}

function updateSeasonalFoods() {
  const month = new Date().getMonth() + 1;
  currentMonthSpan.innerText = month;
  
  const foods = seasonalFoods[month];
  seasonalList.innerHTML = "";
  foods.forEach(food => {
    const li = document.createElement("li");
    li.innerText = food;
    seasonalList.appendChild(li);
  });
}

categorySelect.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  canvas.style.transform = "rotate(0deg)";
  drawRoulette(currentCategory);
  resultContainer.classList.add("hidden");
});

spinBtn.addEventListener("click", spin);

// Initial setup
drawRoulette(currentCategory);
updateSeasonalFoods();
