// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

const { app , Menu , Tray, shell, ipcRenderer, nativeTheme} = nodeRequire('electron');
const path = nodeRequire("path");

//Version Get
window.onload = function () {
  var package = nodeRequire("./package.json");
  document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
}

function Closer(){ipcRenderer.send('MainWindow','Close');}
function Hider(){ipcRenderer.send('MainWindow','Hide');}

// if (nativeTheme.shouldUseDarkColors) {
//   document.getElementsByTagName('body').style.color="black";
//   console.log("Dark Theme Chosen by User");
// } else {
//   document.getElementsByTagName('body').style.color="white";
// console.log("Light Theme Chosen by User");
// }