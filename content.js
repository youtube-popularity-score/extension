const languageMap = {
  en: {
    minute: "minute",
    hour: "hour",
    day: "day",
    week: "week",
    month: "month",
    year: "year",
    views: "views",
    thousand: "K", // İngilizce için bin
    million: "M", // İngilizce için milyon
  },
  tr: {
    minute: "dakika",
    hour: "saat",
    day: "gün",
    week: "hafta",
    month: "ay",
    year: "yıl",
    views: "görüntüleme",
    thousand: "B", // Türkçe için bin
    million: "Mn", // Türkçe için milyon
  },
};

// Seçili dili belirleme (varsayılan olarak İngilizce)
const userLang = navigator.language || navigator.userLanguage;
const selectedLang = userLang.startsWith("tr") ? "tr" : "en";

const popularVideoDetect = {
  tools: {
    convertViewCount: (viewStr) => {
      // Birimlerin dil seçimine göre tanımlanması
      const units = languageMap[selectedLang];

      // Türkçe ve İngilizce için regex desenleri
      const regexPattern =
        selectedLang === "tr"
          ? /(\d+([.,]\d+)?)\s*([Bb]|Mn)\s*(görüntüleme)?/ // Türkçe için
          : /(\d+([.,]\d+)?)\s*([Kk]|[Mm])\s*(views)?/; // İngilizce için

      // Stringi temizleme ve uygun birimleri ayırma
      const viewStrCleaned = viewStr
        .replace(/\s*views?$/, "")
        .replace(/\s*görüntüleme$/, "")
        .trim();
      const parts = viewStrCleaned.match(regexPattern);

      if (!parts) {
        console.error("Invalid view string format.");
        return null;
      }

      // Sayıyı ve birimi ayırma
      const numberPart = parts[1].replace(/,/g, "."); // Türkçe formatında virgül kullanımı
      const suffix = parts[3].toUpperCase(); // Birimi büyük harfe çevirme

      // `suffix` değerine göre doğru çarpanı kullanma
      let numericValue;
      if (suffix === units.million.toUpperCase() || suffix === "M") {
        numericValue = parseFloat(numberPart) * 1_000_000;
      } else if (
        suffix === units.thousand.toUpperCase() ||
        suffix === "K" ||
        suffix === "B"
      ) {
        numericValue = parseFloat(numberPart) * 1_000;
      } else {
        numericValue = parseFloat(numberPart);
      }

      return numericValue;
    },
    convertUploadDate: (dateStr) => {
      const now = new Date();
      let number, unit;

      // Dil seçimine göre doğru units değerlerini alalım
      const units = languageMap[selectedLang];

      if (!units) {
        console.log("Unsupported language:", selectedLang);
        return null;
      }

      // Regex pattern'ini güncelleyelim
      const regexPattern = new RegExp(
        `(\\d+)\\s*(${units.minute}s*|${units.hour}s*|${units.day}s*|${units.week}s*|${units.month}s*|${units.year}s*)`,
        "i" // Case insensitive for English
      );

      const match = dateStr.match(regexPattern);

      if (match) {
        number = parseInt(match[1], 10);
        unit = match[2].toLowerCase(); // Case insensitive matching
      } else {
        console.log("No match found for:", dateStr);
        return null;
      }

      let pastDate = new Date(now);
      switch (unit) {
        case units.minute:
        case units.minute + "s": // Dakikalar / Minutes
          pastDate.setMinutes(now.getMinutes() - number);
          break;
        case units.hour:
        case units.hour + "s": // Saatler / Hours
          pastDate.setHours(now.getHours() - number);
          break;
        case units.day:
        case units.day + "s": // Günler / Days
          pastDate.setDate(now.getDate() - number);
          break;
        case units.week:
        case units.week + "s": // Haftalar / Weeks
          pastDate.setDate(now.getDate() - number * 7);
          break;
        case units.month:
        case units.month + "s": // Aylar / Months
          pastDate.setMonth(now.getMonth() - number);
          break;
        case units.year:
        case units.year + "s": // Yıllar / Years
          pastDate.setFullYear(now.getFullYear() - number);
          break;
        default:
          console.log("Unknown unit:", unit);
          return null;
      }

      const diffTime = Math.abs(now - pastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        date: pastDate,
        daysAgo: diffDays,
      };
    },
    calculatePopularityScore: (uploadDate, viewCount) => {
      const now = new Date();
      const uploadDateObject = new Date(uploadDate);

      const diffTime = Math.abs(now - uploadDateObject);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const viewsPerDay = viewCount / diffDays;

      const maxViewsPerDay = 1_000_000;
      const score = Math.min((viewsPerDay / maxViewsPerDay) * 10, 10);

      return Math.floor(score);
    },
    isNotEmptyElement: (videoElement) => {
      const isReels = videoElement.getAttribute("is-slim-media") !== null;
      const meta = videoElement.querySelector("#metadata-line");

      const viewCount = meta.querySelector("span:nth-of-type(1)");
      const viewCountText = viewCount?.innerText;

      const uploadDate = meta.querySelector("span:nth-of-type(2)");
      const uploadDateText = uploadDate?.innerText;

      return (
        !isReels &&
        meta &&
        viewCount &&
        viewCountText &&
        viewCountText !== "" &&
        uploadDate &&
        uploadDateText &&
        uploadDateText !== ""
      );
    },
    getScoreElement: (score) => {
      const scoreView = document.createElement("span");
      scoreView.classList.add("score-view");
      scoreView.style.width = "100%";
      scoreView.innerHTML = `<span style="background-color: #ff0100; padding: 3px 5px; border-radius: 5px; font-size: 11px; font-weight: 600; color: white; ">Score: ${score}</span>`;

      return scoreView;
    },
    isYoutubeHomePage: () => {
      const url = window.location.href;
      return (
        url === "https://www.youtube.com/" ||
        url.startsWith("https://www.youtube.com/?")
      );
    },
  },
  getVideoInfo: (videoElement) => {
    const meta = videoElement.querySelector("#metadata-line");

    const viewCount = meta.querySelector("span:nth-of-type(1)");
    const viewCountText = viewCount.innerText;

    const uploadDate = meta.querySelector("span:nth-of-type(2)");
    const uploadDateText = uploadDate.innerText;

    return {
      viewCount: popularVideoDetect.tools.convertViewCount(viewCountText),
      viewCountText: viewCountText,
      uploadDate: popularVideoDetect.tools.convertUploadDate(uploadDateText),
      uploadDateText: uploadDateText,
      meta: meta,
    };
  },
  init: () => {
    if (!popularVideoDetect.tools.isYoutubeHomePage()) return;

    const videoElements = document.querySelectorAll("ytd-rich-item-renderer");

    videoElements.forEach((videoElement) => {
      if (videoElement.getAttribute("data-processed")) return;

      const hasElement =
        popularVideoDetect.tools.isNotEmptyElement(videoElement);

      if (hasElement) {
        const info = popularVideoDetect.getVideoInfo(videoElement);

        if (!info.uploadDate?.date) {
          console.log("info: ", info);
        }

        const popularityScore =
          popularVideoDetect.tools.calculatePopularityScore(
            info.uploadDate.date,
            info.viewCount
          );

        if (info.meta.querySelector(".score-view")) {
          info.meta.removeChild(info.meta.querySelector(".score-view"));
        }

        const scoreViewElement =
          popularVideoDetect.tools.getScoreElement(popularityScore);

        if (popularityScore > 0) {
          info.meta.appendChild(scoreViewElement);
        }

        videoElement.setAttribute("data-processed", "true");
      }
    });
  },
  debounce: (func, wait) => {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  ready: () => {
    const observer = new MutationObserver(
      popularVideoDetect.debounce(popularVideoDetect.init, 500)
    );
    observer.observe(document, {
      attributes: false,
      childList: true,
      subtree: true,
    });

    popularVideoDetect.init();
  },
};

popularVideoDetect.ready();
