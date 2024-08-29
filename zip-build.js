const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// Manifest dosyasını okuyarak version değerini al
const manifestPath = "manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const version = manifest.version.replace(/\./g, "_");

// ZIP dosyasının oluşturulacağı yer ve isim
const zipFileName = `build_ver_${version}.zip`;
const output = fs.createWriteStream(zipFileName);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`ZIP dosyası oluşturuldu: ${archive.pointer()} byte`);

  // ZIP dosyasını 'zip' klasörüne taşı
  const zipFolderPath = path.join(__dirname, "zip");

  // 'zip' klasörünü oluştur
  if (!fs.existsSync(zipFolderPath)) {
    fs.mkdirSync(zipFolderPath);
  }

  // ZIP dosyasının yeni yolu
  const newZipPath = path.join(zipFolderPath, zipFileName);

  // ZIP dosyasını 'zip' klasörüne taşı
  fs.rename(zipFileName, newZipPath, (err) => {
    if (err) throw err;
    console.log(`ZIP dosyası '${zipFolderPath}' klasörüne taşındı.`);
  });
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// 'build' klasörünü ZIP dosyasına ekle
archive.directory("build/", false);

archive.finalize();
