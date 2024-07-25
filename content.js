// // Helper function to calculate days between two dates
// function calculateDaysBetween(d1, d2) {
//   const oneDay = 24 * 60 * 60 * 1000;
//   return Math.round(Math.abs((d2 - d1) / oneDay));
// }

// // Helper function to calculate view rate score
// function calculateViewRateScore(viewCount, days) {
//   const dailyViews = viewCount / days;
//   if (dailyViews <= 100) return 1;
//   else if (dailyViews <= 500) return 2;
//   else if (dailyViews <= 1000) return 3;
//   else if (dailyViews <= 5000) return 4;
//   else if (dailyViews <= 10000) return 5;
//   else if (dailyViews <= 50000) return 6;
//   else if (dailyViews <= 100000) return 7;
//   else if (dailyViews <= 500000) return 8;
//   else if (dailyViews <= 1000000) return 9;
//   else return 10;
// }

// // Function to extract video data and add view rate score
// function addViewRateScores() {
//   const videoElements = document.querySelectorAll('ytd-rich-item-renderer');

//   videoElements.forEach(videoElement => {
//     if (videoElement.querySelector('.view-rate-score')) return;

//     const titleElement = videoElement.querySelector('#video-title');
//     const metadataElement = videoElement.querySelector('#metadata-line');
//     if (!titleElement || !metadataElement) return;

//     const uploadDateTextElement = metadataElement.querySelector('span:nth-child(2)');
//     const viewCountTextElement = metadataElement.querySelector('span:nth-child(1)');

//     if (!uploadDateTextElement || !viewCountTextElement) return;

//     const uploadDateText = uploadDateTextElement.innerText;
//     const viewCountText = viewCountTextElement.innerText;

//     // Parse view count
//     const viewCount = parseInt(viewCountText.replace(/[^0-9]/g, ''), 10);
//     if (isNaN(viewCount)) return;

//     // Parse upload date
//     const uploadDateMatch = uploadDateText.match(/(\d+)\s+(day|week|month|year)s?\s+ago/);
//     if (!uploadDateMatch) return;

//     const number = parseInt(uploadDateMatch[1], 10);
//     const unit = uploadDateMatch[2];

//     let days = 0;
//     if (unit === 'day') days = number;
//     else if (unit === 'week') days = number * 7;
//     else if (unit === 'month') days = number * 30;
//     else if (unit === 'year') days = number * 365;

//     const viewRateScore = calculateViewRateScore(viewCount, days);

//     const scoreElement = document.createElement('div');
//     scoreElement.innerText = `View Rate Score: ${viewRateScore}/10`;
//     scoreElement.className = 'view-rate-score';
//     titleElement.parentElement.appendChild(scoreElement);
//   });
// }

// // Function to observe changes in the YouTube homepage
// function observeYouTube() {
//   const observer = new MutationObserver(addViewRateScores);
//   observer.observe(document.body, { childList: true, subtree: true });
// }

// // Add styles for the score element
// const styleElement = document.createElement('style');
// styleElement.innerHTML = `
//   .view-rate-score {
//     font-size: 14px;
//     font-weight: bold;
//     color: red;
//     margin-top: 4px;
//   }
// `;
// document.head.appendChild(styleElement);

// // Run the observer function
// observeYouTube();

const popularVideoDetect = {
  init: () => {
    const videoElements = document.querySelectorAll("ytd-rich-item-renderer");

    videoElements.forEach((videoElement) => {});
  },
  ready: () => {
    const observer = new MutationObserver(popularVideoDetect.init);
    observer.observe(document.body, { childList: true, subtree: true });
  },
};

popularVideoDetect.ready();
