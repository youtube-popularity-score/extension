const VideoInfoScraper = (function () {
  let instance;

  const keywords = [
    { score: 5, word: "devasa" },
    { score: 5, word: "muhteşem" },
    { score: 5, word: "inanılmaz" },
    { score: 5, word: "şok" },
    { score: 4, word: "hayret verici" },
    { score: 3, word: "en iyi" },
    { score: 3, word: "kesinlikle" },
    { score: 4, word: "asla" },
    { score: 4, word: "mükemmel" },
    { score: 5, word: "inanılmaz" },
    { score: 5, word: "görmeniz lazım" },
    { score: 5, word: "şok edici" },
    { score: 5, word: "inanılmaz" },
    { score: 5, word: "akıl almaz" },
    { score: 4, word: "şaşırtıcı" },
    { score: 5, word: "görünce şok olacaksınız" },
    { score: 5, word: "gözlerinize inanamayacaksınız" },
    { score: 4, word: "sizi çok şaşırtacak" },
    { score: 5, word: "herkesi şok etti" },
    { score: 4, word: "dikkat!" },
    { score: 4, word: "uyarı!" },
    { score: 5, word: "hemen" },
    { score: 4, word: "acele edin" },
    { score: 4, word: "sakın kaçırmayın" },
    { score: 3, word: "kritik" },
    { score: 4, word: "sır" },
    { score: 4, word: "gizli" },
    { score: 4, word: "bilinmeyen" },
    { score: 3, word: "keşfedilmemiş" },
    { score: 3, word: "bilinmeyen detaylar" },
    { score: 4, word: "saklı kalan" },
    { score: 4, word: "garanti" },
    { score: 5, word: "kesin" },
    { score: 4, word: "mutlaka" },
    { score: 4, word: "kaçırmayın" },
    { score: 4, word: "kaçırmamanız gereken" },
    { score: 5, word: "garanti ediyoruz" },
    { score: 4, word: "kaçırılmayacak" },
    { score: 4, word: "ilginç" },
    { score: 4, word: "enteresan" },
    { score: 4, word: "hayatınızda hiç görmediğiniz" },
    { score: 4, word: "olağanüstü" },
    { score: 4, word: "benzersiz" },
    { score: 3, word: "eşi benzeri olmayan" },
    { score: 4, word: "daha önce hiç duymadığınız" },
    { score: 4, word: "kalp kıran" },
    { score: 4, word: "hüzünlü" },
    { score: 3, word: "duygusal" },
    { score: 4, word: "gözyaşlarına boğulacaksınız" },
    { score: 3, word: "içinizi ısıtacak" },
    { score: 4, word: "yürek burkan" },
    { score: 3, word: "ağlatan" },
    { score: 5, word: "en iyi" },
    { score: 5, word: "en kötü" },
    { score: 4, word: "en" },
    { score: 5, word: "asla" },
    { score: 4, word: "sonsuza dek" },
    { score: 4, word: "bir daha asla" },
    { score: 5, word: "hayatınızı değiştirecek" },
    { score: 4, word: "nasıl?" },
    { score: 4, word: "neden?" },
    { score: 3, word: "kim?" },
    { score: 3, word: "ne?" },
    { score: 3, word: "hangi?" },
    { score: 4, word: "bu neden oldu?" },
    { score: 4, word: "bunu kim yaptı?" },
    { score: 3, word: "hızlı" },
    { score: 4, word: "anında" },
    { score: 4, word: "kolayca" },
    { score: 4, word: "hemen" },
    { score: 3, word: "çabucak" },
    { score: 3, word: "dakikalar içinde" },
    { score: 3, word: "basit adımlarla" },
    { score: 4, word: "inanılmaz değişim" },
    { score: 4, word: "şaşırtıcı sonuçlar" },
    { score: 4, word: "mucizevi" },
    { score: 4, word: "devrim niteliğinde" },
    { score: 3, word: "mükemmel cilt" },
    { score: 3, word: "harika saçlar" },
    { score: 4, word: "hayatınızı değiştirecek" },
    { score: 4, word: "zengin olmanın yolları" },
    { score: 4, word: "başarı sırları" },
    { score: 4, word: "milyonlarca dolar kazanmak" },
    { score: 4, word: "kısa sürede zengin olmak" },
    { score: 3, word: "başarı hikayeleri" },
    { score: 3, word: "para kazanma yöntemleri" },
    { score: 3, word: "en eğlenceli" },
    { score: 3, word: "komik" },
    { score: 4, word: "güldüren" },
    { score: 4, word: "kahkaha garantili" },
    { score: 3, word: "çılgınca" },
    { score: 3, word: "oyun değiştiren" },
    { score: 4, word: "eğlenceli vakit geçirmek" },
    { score: 4, word: "ünlülerin sırları" },
    { score: 4, word: "magazin dünyasında" },
    { score: 3, word: "ünlüler hakkında bilinmeyenler" },
    { score: 4, word: "şok eden magazin haberleri" },
    { score: 3, word: "ünlülerin hayatları" },
    { score: 4, word: "gizli aşklar" },
  ];

  function calculateClickbaitScore(title, description) {
    let score = 0;
    let matchedKeywords = [];
    const lowerCaseTitle = title.toLowerCase();
    const lowerCaseDescription = description.toLowerCase();

    keywords.forEach((keyword) => {
      const lowerCaseKeyword = keyword.word.toLowerCase();
      if (
        lowerCaseTitle.includes(lowerCaseKeyword) ||
        lowerCaseDescription.includes(lowerCaseKeyword)
      ) {
        score += keyword.score;
        matchedKeywords.push(keyword.word);
      }
    });

    return { score, matchedKeywords };
  }

  function getClickbaitResult(score) {
    if (score >= 9) {
      return { likelihood: "yüksek", color: "red" };
    } else if (score >= 6) {
      return { likelihood: "orta", color: "orange" };
    } else {
      return { likelihood: "düşük", color: "green" };
    }
  }

  function createInstance() {
    return {
      getVideoInfos: function () {
        const videoElements = document.querySelectorAll("#video-title");
        const videoInfos = Array.from(videoElements).map((titleElement) => {
          const videoContainer = titleElement.closest(
            "ytd-rich-item-renderer, ytd-video-renderer"
          );

          const videoUrl = titleElement.parentElement.href;
          const imageElement =
            videoContainer.querySelector("ytd-thumbnail img");
          const imageUrl = imageElement ? imageElement.src : "";

          const title = titleElement.textContent.trim();
          const descriptionElement =
            videoContainer.querySelector("#description");
          const description = descriptionElement
            ? descriptionElement.textContent.trim()
            : "";

          const { score, matchedKeywords } = calculateClickbaitScore(
            title,
            description
          );
          const result = getClickbaitResult(score);

          titleElement.style.backgroundColor = result.color;

          return {
            title: title,
            url: videoUrl,
            image: imageUrl,
            titleElement: titleElement,
            score: score,
            likelihood: result.likelihood,
            color: result.color,
            matchedKeywords: matchedKeywords,
            description: description,
          };
        });
        return videoInfos;
      },
    };
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

// Usage

function observeYouTube() {
  let previousTitles = new Set();

  const observer = new MutationObserver(() => {
    const scraper = VideoInfoScraper.getInstance();
    const videoInfos = scraper.getVideoInfos();

    // Filter new titles
    const newInfos = videoInfos.filter(
      (info) => !previousTitles.has(info.title)
    );

    if (newInfos.length > 0) {
      console.log(newInfos);
      newInfos.forEach((info) => previousTitles.add(info.title));
    }
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);

  // Initial fetch of video infos
  const scraper = VideoInfoScraper.getInstance();
  const videoInfos = scraper.getVideoInfos();

  console.log(videoInfos);
  videoInfos.forEach((info) => previousTitles.add(info.title));
}

observeYouTube();
