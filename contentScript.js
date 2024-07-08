// contentScript.js

const apiKey = "AIzaSyCikElyLabtcvJoB32qppeFJb88mkG3sMY";

const keywords = [
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

function calculateScore(title) {
  let score = 0;
  keywords.forEach((keyword) => {
    if (title.toLowerCase().includes(keyword.word.toLowerCase())) {
      score += keyword.score;
    }
  });
  return score;
}

async function fetchVideoDetails(videoIds) {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoIds.join(
    ","
  )}&key=${apiKey}&part=snippet`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items;
}

function highlightTitles(videos) {
  videos.forEach((video) => {
    const titleElement = document.querySelector(
      `#video-title[title="${video.snippet.title}"]`
    );
    if (titleElement) {
      const score = calculateScore(video.snippet.title);
      let color;
      if (score >= 15) {
        color = "red";
      } else if (score >= 10) {
        color = "orange";
      } else if (score >= 5) {
        color = "yellow";
      } else {
        color = "white";
      }
      titleElement.style.backgroundColor = color;
    }
  });
}

function getVideoIds() {
  const videoElements = document.querySelectorAll("a#video-title");
  const videoIds = [];
  videoElements.forEach((element) => {
    const url = new URL(element.href);
    const videoId = url.searchParams.get("v");
    if (videoId) {
      videoIds.push(videoId);
    }
  });
  return videoIds;
}

async function processVideos() {
  const videoIds = getVideoIds();
  if (videoIds.length > 0) {
    const videos = await fetchVideoDetails(videoIds);
    highlightTitles(videos);
  }
}

processVideos();
