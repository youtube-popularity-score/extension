const popularVideoDetect = {
  tools: {
    convertViewTextFormat: (text) => {
      const isEnglish = navigator.language === "en-GB";
      let response = text;

      if (isEnglish) {
        const splitted = text.split(" ");
        const countAndUnit = splitted[0];
        const unitRegex = /[KM]/;
        const hasUnit = unitRegex.test(countAndUnit);

        if (hasUnit) {
          const justUnit = countAndUnit.slice(
            countAndUnit.length - 1,
            countAndUnit.length
          );
          const justCount = countAndUnit.replace(justUnit, "");
          const newText = `${justCount} ${justUnit} views`;

          response = newText;
        }
      }

      return response;
    },
    convertViewCount: (viewStr) => {
      const language =
        document.documentElement.lang ||
        document.querySelector("html").getAttribute("lang");

      viewStr = viewStr.replace(/\s+/g, " ");

      const parts = viewStr.split(" ");

      let numberPart;
      let suffix;

      if (language === "tr-TR" || language === "tr") {
        numberPart = parts[0].replace(/,/g, ".");
        suffix = parts[1];
      } else {
        numberPart = parts[0].slice(0, parts[0].length - 1).replace(/,/g, ".");
        suffix = parts[0].slice(parts[0].length - 1, parts[0].length);
      }

      let numericValue;
      if (suffix === "Mn" || suffix === "M") {
        numericValue = parseFloat(numberPart) * 1_000_000;
      } else if (suffix === "B") {
        if (language === "tr-TR" || language === "tr") {
          numericValue = parseFloat(numberPart) * 1_000;
        } else {
          numericValue = parseFloat(numberPart) * 1_000_000_000;
        }
      } else if (suffix === "Mr") {
        numericValue = parseFloat(numberPart) * 1_000_000_000;
      } else if (suffix === "K") {
        numericValue = parseFloat(numberPart) * 1_000;
      } else {
        numericValue = parseFloat(numberPart);
      }

      return numericValue;
    },
    convertUploadDate: (dateStr) => {
      const now = new Date();
      let number, unit;

      const match = dateStr.match(
        /(\d+)\s+(dakika|saat|gün|hafta|ay|yıl|min|hour|day|week|month|year)/
      );
      if (match) {
        number = parseInt(match[1], 10);
        unit = match[2];
      } else {
        return null;
      }

      let pastDate = new Date(now);
      switch (unit) {
        case "dakika":
        case "min":
          pastDate.setMinutes(now.getMinutes() - number);
          break;
        case "saat":
        case "hour":
          pastDate.setHours(now.getHours() - number);
          break;
        case "gün":
        case "day":
          pastDate.setDate(now.getDate() - number);
          break;
        case "hafta":
        case "week":
          pastDate.setDate(now.getDate() - number * 7);
          break;
        case "ay":
        case "month":
          pastDate.setMonth(now.getMonth() - number);
          break;
        case "yıl":
        case "year":
          pastDate.setFullYear(now.getFullYear() - number);
          break;
      }

      const diffTime = Math.abs(now - pastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        date: pastDate,
        daysAgo: diffDays,
      };
    },
    getMaxViewCount: () => {
      const videoElements = document.querySelectorAll("ytd-rich-item-renderer");

      let maxViews = 0;

      videoElements.forEach((videoElement) => {
        if (!popularVideoDetect.tools.isNotEmptyElement(videoElement)) return;

        const meta = videoElement.querySelector("#metadata-line");
        const viewCountText = meta.querySelector(
          "span:nth-of-type(1)"
        )?.innerText;
        const viewCount =
          popularVideoDetect.tools.convertViewCount(viewCountText) || 0;

        if (viewCount > maxViews) {
          maxViews = viewCount;
        }
      });

      return maxViews;
    },
    calculatePopularityScore: (uploadDate, viewCount, maxViewsPerDay) => {
      const now = new Date();
      const uploadDateObject = new Date(uploadDate);

      const diffTime = Math.abs(now - uploadDateObject);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const viewsPerDay = viewCount / diffDays;

      const referenceViewsPerDay = maxViewsPerDay || 1; // maxViewsPerDay yoksa varsayılan 1
      const rawScore = (viewsPerDay / referenceViewsPerDay) * 10;

      const score = Math.min(Math.max(Math.round(rawScore), 0), 10);

      return score;
    },
    isNotEmptyElement: (videoElement) => {
      const isReels = videoElement.getAttribute("is-slim-media") !== null;

      if (isReels) return false;

      const meta = videoElement.querySelector("#metadata-line");

      if (!meta) return false;

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
      scoreView.style.display = "flex";
      scoreView.style.alignItems = "center";

      let backgroundColor;
      let textColor;

      if (score >= 1 && score <= 2) {
        backgroundColor = "#f94040"; // Kırmızı
        textColor = "#fff"; // beyaz
      } else if (score >= 3 && score <= 4) {
        backgroundColor = "#FFA500"; // Turuncu
        textColor = "#483005"; // siyah
      } else if (score >= 5 && score <= 6) {
        backgroundColor = "#fcd000"; // Sarı
        textColor = "#544915"; // siyah
      } else if (score >= 7 && score <= 8) {
        backgroundColor = "#52cf80"; // Açık Yeşil
        textColor = "#0f311c"; // beyaz
      } else if (score >= 9 && score <= 10) {
        backgroundColor = "#4cbb70"; // Yeşil
        textColor = "#fff"; // beyaz
      } else {
        backgroundColor = "#CCCCCC"; // Geçersiz puanlar için nötr bir renk
        textColor = "#fff"; // beyaz
      }

      scoreView.innerHTML = `
      <svg style="position: relative;" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><defs><linearGradient id="a" x1=".5" x2=".5" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#e83323"/><stop offset="1" stop-color="#741a12"/></linearGradient></defs><g data-name="Group 5" transform="translate(-2529 5257)"><circle data-name="Ellipse 13" cx="5.333" cy="5.333" r="5.333" transform="translate(2531.667 -5254.333)" fill="#fff"/><g data-name="Group 4" transform="translate(2529 -5257)" fill="url(#a)"><path data-name="Path 768" d="M8 0a8 8 0 1 0 8 8 8 8 0 0 0-8-8m0 13.333A5.333 5.333 0 1 1 13.333 8 5.333 5.333 0 0 1 8 13.333"/><path data-name="Path 769" d="M8 5.333a2.665 2.665 0 0 0-.787.118 1.333 1.333 0 1 1-1.762 1.762A2.667 2.667 0 1 0 8 5.333"/></g></g></svg>
      <span 
        style="
          background-color: ${backgroundColor}; 
          padding: 0px 6px;
          border-radius: 0px 5px 5px 0px;
          font-size: 1rem;
          font-weight: 600;
          color: ${textColor}; 
          font-family: Roboto, Arial, sans-serif;
          height: 12px;
          line-height: 13px;
          margin-left: -3px;
        "
      >${score}</span>
    `;

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

    let maxViewsPerDay = 0;

    videoElements.forEach((videoElement) => {
      if (videoElement.getAttribute("data-processed") || !videoElement) return;

      const hasElement =
        popularVideoDetect.tools.isNotEmptyElement(videoElement);

      if (hasElement) {
        const info = popularVideoDetect.getVideoInfo(videoElement);

        // Günlük izlenme hızını hesapla
        const diffTime = Math.abs(new Date() - new Date(info.uploadDate.date));
        const diffDays = Math.max(
          1,
          Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        );
        const viewsPerDay = info.viewCount / diffDays;

        // En yüksek günlük izlenme hızını güncelle
        if (viewsPerDay > maxViewsPerDay) {
          maxViewsPerDay = viewsPerDay;
        }

        const popularityScore =
          popularVideoDetect.tools.calculatePopularityScore(
            info.uploadDate.date,
            info.viewCount,
            maxViewsPerDay
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

    observer.observe(document.body, { childList: true, subtree: true });
  },
};

popularVideoDetect.ready();
