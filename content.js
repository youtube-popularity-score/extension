document.addEventListener("DOMContentLoaded", () => {
  const myDiv = document.querySelector("div"); // İstediğiniz div seçimini yapın

  if (myDiv) {
    console.log("Div bulundu:", myDiv);
    // Burada istediğiniz işlemleri yapabilirsiniz, örneğin:
    myDiv.style.backgroundColor = "yellow"; // Div'in arka plan rengini değiştir
    sendMessageToBackground("Div bulundu ve arka plan rengi değiştirildi.");
  } else {
    console.log("Div bulunamadı.");
    sendMessageToBackground("Div bulunamadı.");
  }
});

function sendMessageToBackground(message) {
  chrome.runtime.sendMessage({ log: message });
}
