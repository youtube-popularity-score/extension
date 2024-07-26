const popularVideoDetect = {
  tools: {
    convertViewCount: (viewStr) => {
      const viewStrCleaned = viewStr.replace(/\u00A0/g, " ");
      const parts = viewStrCleaned.split(" ");

      const numberPart = parts[0].replace(/,/g, ".");
      const suffix = parts[1];

      let numericValue;
      if (suffix === "Mn") {
        numericValue = parseFloat(numberPart) * 1_000_000;
      } else if (suffix === "B") {
        numericValue = parseFloat(numberPart) * 1_000;
      } else {
        numericValue = parseFloat(numberPart);
      }

      return numericValue;
    },
    convertUploadDate: (dateStr) => {
      const now = new Date();
      let number, unit;

      const match = dateStr.match(/(\d+)\s+(dakika|saat|gün|hafta|ay|yıl)/);
      if (match) {
        number = parseInt(match[1], 10);
        unit = match[2];
      } else {
        return null;
      }

      let pastDate = new Date(now);
      switch (unit) {
        case "dakika":
          pastDate.setMinutes(now.getMinutes() - number);
          break;
        case "saat":
          pastDate.setHours(now.getHours() - number);
          break;
        case "gün":
          pastDate.setDate(now.getDate() - number);
          break;
        case "hafta":
          pastDate.setDate(now.getDate() - number * 7);
          break;
        case "ay":
          pastDate.setMonth(now.getMonth() - number);
          break;
        case "yıl":
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
      scoreView.textContent = `Score: ${score}`;
      scoreView.classList.add("score-view");
      scoreView.style.width = "100%";

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
    console.log("init!");

    const videoElements = document.querySelectorAll("ytd-rich-item-renderer");

    videoElements.forEach((videoElement) => {
      // Video öğesinin daha önce işlendiğini kontrol edin
      if (videoElement.getAttribute('data-processed')) return;

      const hasElement = popularVideoDetect.tools.isNotEmptyElement(videoElement);

      if (hasElement) {
        const info = popularVideoDetect.getVideoInfo(videoElement);

        if (!info.uploadDate?.date) {
          console.log("info: ", info);
        }

        const popularityScore = popularVideoDetect.tools.calculatePopularityScore(
          info.uploadDate.date,
          info.viewCount
        );

        if (info.meta.querySelector(".score-view")) {
          info.meta.removeChild(info.meta.querySelector(".score-view"));
        }

        const scoreViewElement = popularVideoDetect.tools.getScoreElement(popularityScore);

        info.meta.appendChild(scoreViewElement);

        // Video öğesinin işlendiğini belirten bir işaret ekleyin
        videoElement.setAttribute('data-processed', 'true');
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
