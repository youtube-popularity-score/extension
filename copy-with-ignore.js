const fs = require("fs");
const { exec } = require("child_process");

// .copyignore dosyasını oku
const ignoreFilePath = ".copyignore";
const ignoreFileContent = fs.readFileSync(ignoreFilePath, "utf8");
const ignorePatterns = ignoreFileContent
  .split("\n")
  .filter((line) => line.trim() !== "");

// ignore patterns'i copyfiles komutuna ekle
const ignoreArgs = ignorePatterns.map((pattern) => `-e ${pattern}`).join(" ");

// copyfiles komutunu oluştur
const command = `copyfiles ${ignoreArgs} "**/*" build/`;

console.log(command);

// Komutu çalıştır
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
