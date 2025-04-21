const POPULAR_VIDEO_DETECT_CONSTANTS = {
  FRESHNESS_DECAY_RATE: 0.05, // Önerilen k sabiti
  SCORE_COLORS: [
    { min: 1, max: 2, background: "#f94040", text: "#fff" },
    { min: 3, max: 4, background: "#FFA500", text: "#483005" },
    { min: 5, max: 6, background: "#fcd000", text: "#544915" },
    { min: 7, max: 8, background: "#52cf80", text: "#0f311c" },
    { min: 9, max: 10, background: "#4cbb70", text: "#fff" },
  ],
  DEFAULT_SCORE_COLOR: { background: "#CCCCCC", text: "#fff" },
  VIEW_UNIT_REGEX: /[KM]/,
  MINIMUM_SCORE: 1,
  MAXIMUM_SCORE: 10,
  SCORE_MULTIPLIER: 10,
};

const popularVideoDetect = {
  tools: {
    convertViewTextFormat: (text) => {
      if (navigator.language !== "en-GB") {
        return text;
      }

      const splitted = text.split(" ");
      const countAndUnit = splitted[0];

      if (POPULAR_VIDEO_DETECT_CONSTANTS.VIEW_UNIT_REGEX.test(countAndUnit)) {
        const unit = countAndUnit.slice(-1);
        const count = countAndUnit.replace(unit, "");
        return `${count} ${unit} views`;
      }

      return text;
    },

    convertViewCount: (viewStr) => {
      const language =
        document.documentElement.lang ||
        document.querySelector("html")?.getAttribute("lang");
      const parts = viewStr?.replace(/\s+/g, " ")?.split(" ") || [];
      if (parts.length === 0) return 0;

      const isTurkish = language === "tr-TR" || language === "tr";
      const numberPart = isTurkish
        ? parts[0]?.replace(/,/g, ".")
        : parts[0]?.slice(0, -1)?.replace(/,/g, ".");
      const suffix = isTurkish ? parts[1] : parts[0]?.slice(-1);

      const value = parseFloat(numberPart);
      if (isNaN(value)) return 0;

      switch (suffix) {
        case "Mn":
        case "M":
          return value * 1_000_000;
        case "B":
          return isTurkish ? value * 1_000 : value * 1_000_000_000;
        case "Mr":
          return value * 1_000_000_000;
        case "K":
          return value * 1_000;
        default:
          return value;
      }
    },

    convertUploadDate: (dateStr) => {
      const now = new Date();
      const match = dateStr?.match(
        /(\d+)\s+(dakika|saat|gün|hafta|ay|yıl|min|hour|day|week|month|year)/
      );
      if (!match) return null;

      const number = parseInt(match[1], 10);
      const unit = match[2];
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
        default:
          return null;
      }

      const diffTime = Math.abs(now - pastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { date: pastDate, daysAgo: diffDays };
    },

    getMaxViewCount: () => {
      const videoElements = document.querySelectorAll("ytd-rich-item-renderer");
      let maxViewsPerDay = 0;

      videoElements.forEach((videoElement) => {
        if (!popularVideoDetect.tools.isNotEmptyElement(videoElement)) return;
        const info = popularVideoDetect.getVideoInfo(videoElement);
        if (info?.uploadDate?.date && info.viewCount > 0) {
          const diffDays = Math.max(
            1,
            Math.ceil(
              Math.abs(new Date() - new Date(info.uploadDate.date)) /
                (1000 * 60 * 60 * 24)
            )
          );
          const viewsPerDay = info.viewCount / diffDays;
          maxViewsPerDay = Math.max(maxViewsPerDay, viewsPerDay);
        }
      });
      return maxViewsPerDay || 1; // En az 1 döndür
    },

    calculatePopularityScore: (uploadDate, viewCount, maxViewsPerDay) => {
      const now = new Date();
      const uploadDateObject = new Date(uploadDate);
      const diffDays = Math.max(
        1,
        Math.ceil(Math.abs(now - uploadDateObject) / (1000 * 60 * 60 * 24))
      );
      const dailyViews = viewCount / diffDays;
      const normalizedViews = dailyViews / (maxViewsPerDay || 1);
      const freshnessFactor = Math.exp(
        -POPULAR_VIDEO_DETECT_CONSTANTS.FRESHNESS_DECAY_RATE * diffDays
      );
      let rawScore =
        normalizedViews *
        freshnessFactor *
        POPULAR_VIDEO_DETECT_CONSTANTS.SCORE_MULTIPLIER;

      return Math.round(
        Math.max(
          POPULAR_VIDEO_DETECT_CONSTANTS.MINIMUM_SCORE,
          Math.min(POPULAR_VIDEO_DETECT_CONSTANTS.MAXIMUM_SCORE, rawScore)
        )
      );
    },

    isNotEmptyElement: (videoElement) => {
      if (videoElement?.getAttribute("is-slim-media") !== null) return false;
      const meta = videoElement?.querySelector("#metadata-line");
      if (!meta) return false;
      const viewCount = meta.querySelector("span:nth-of-type(1)");
      const uploadDate = meta.querySelector("span:nth-of-type(2)");
      return !!(
        viewCount?.innerText &&
        viewCount.innerText.trim() !== "" &&
        uploadDate?.innerText &&
        uploadDate.innerText.trim() !== ""
      );
    },

    getScoreElement: (score) => {
      const scoreView = document.createElement("span");
      scoreView.classList.add("score-view");
      Object.assign(scoreView.style, {
        width: "100%",
        display: "flex",
        alignItems: "center",
      });

      let backgroundColor =
        POPULAR_VIDEO_DETECT_CONSTANTS.DEFAULT_SCORE_COLOR.background;
      let textColor = POPULAR_VIDEO_DETECT_CONSTANTS.DEFAULT_SCORE_COLOR.text;

      for (const colorRange of POPULAR_VIDEO_DETECT_CONSTANTS.SCORE_COLORS) {
        if (score >= colorRange.min && score <= colorRange.max) {
          backgroundColor = colorRange.background;
          textColor = colorRange.text;
          break;
        }
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
    const meta = videoElement?.querySelector("#metadata-line");
    if (!meta) return null;

    const viewCountElement = meta.querySelector("span:nth-of-type(1)");
    const uploadDateElement = meta.querySelector("span:nth-of-type(2)");

    const viewCountText = viewCountElement?.innerText;
    const uploadDateText = uploadDateElement?.innerText;

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
    const maxViewsPerDay = popularVideoDetect.tools.getMaxViewCount();

    videoElements.forEach((videoElement) => {
      if (videoElement?.getAttribute("data-processed")) return;
      if (!popularVideoDetect.tools.isNotEmptyElement(videoElement)) return;

      const info = popularVideoDetect.getVideoInfo(videoElement);
      if (!info?.uploadDate?.date) return;

      const popularityScore = popularVideoDetect.tools.calculatePopularityScore(
        info.uploadDate.date,
        info.viewCount,
        maxViewsPerDay
      );

      const meta = info.meta;
      const existingScoreView = meta.querySelector(".score-view");
      if (existingScoreView) {
        meta.removeChild(existingScoreView);
      }

      if (popularityScore > 0) {
        const scoreViewElement =
          popularVideoDetect.tools.getScoreElement(popularityScore);
        meta.appendChild(scoreViewElement);
      }

      videoElement.setAttribute("data-processed", "true");
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
