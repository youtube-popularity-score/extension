const fs = require("fs");
const path = "manifest.json";

// Dosyayı okuyun
const manifest = JSON.parse(fs.readFileSync(path, "utf8"));

// Mevcut versiyonu ayırın
const versionParts = manifest.version.split(".");

// Son segmenti artırın
const patchVersion = parseInt(versionParts[2], 10) + 1;

// Yeni versiyonu oluşturun
versionParts[2] = patchVersion.toString();
manifest.version = versionParts.join(".");

// Dosyayı güncelleyin
fs.writeFileSync(path, JSON.stringify(manifest, null, 2), "utf8");

console.log(`Version updated to ${manifest.version}`);
