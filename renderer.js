// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { app , Menu , Tray, shell, ipcRenderer, nativeTheme} = nodeRequire('electron');
const path = nodeRequire("path");

//Version Get
// window.onload = function () {
//   var package = nodeRequire("./package.json");
//   document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
// }

// function Closer(){ipcRenderer.send('MainWindow','Close');}
// function Hider(){ipcRenderer.send('MainWindow','Hide');}

window.onload = function () {
  //!Version Get
  var package = nodeRequire("./package.json");
  document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
  
  //!Recent View Get <!--格式化HomePage主页继续观看内容-->
  var bgmID = 292238;
  var bgmEP = 217956;
  // var bgmID = localStorage.getItem("RecentViewID");
  // var bgmEP = localStorage.getItem("RecentViewEpisode");
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID.toString(), function(data){
  document.getElementById("RecentViewDetail").innerText=data.summary;
  document.getElementById("RecentViewName").innerText=data.name;
  document.getElementById("RecentViewRatingScore").innerText=data.rating.score;
  document.getElementById("HomePage").style.background="url('"+data.images.large+"') no-repeat center";
  document.getElementById("HomePage").style.backgroundSize="cover";
  });
  $.getJSON("https://api.bgm.tv/v0/episodes/"+bgmEP.toString(), function(data){
  document.getElementById("RecentViewProgress").innerText="上次看到"+"EP"+data.ep+"-"+data.name;
  });
  console.log("Success");
}

//TODO 手动存储API(DEV) 
//*输入输入框ID，自动提取输入框内数据并以输入框ID相同键值存入localStorage
function LocalSave(Input){
  var Inner = document.getElementById(Input.toString());
  localStorage.setItem(Input.toString(),Inner.toString());
  document.getElementById(Input.toString()).setAttribute("placeholder","✅更改成功保存！")
}

function FloatBarAction(PageID) { //点击切换页面
  if(PageID == "Home"){
    document.getElementById("Home").style.display="block";
    document.getElementById("Archive").style.display="none";
    document.getElementById("Torrnet").style.display="none";
    document.getElementById("Settings").style.display="none";
    // document.getElementById("setTabA").style.backgroundColor="rgb(85, 85, 85)";
    // document.getElementById("setTabB").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabC").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabA").style.color="whitesmoke";
    // document.getElementById("setTabB").style.color="black";
    // document.getElementById("setTabC").style.color="black";
  }
  else if(PageID == "Archive"){
    document.getElementById("Home").style.display="none";
    document.getElementById("Archive").style.display="block";
    document.getElementById("Torrnet").style.display="none";
    document.getElementById("Settings").style.display="none";
    // document.getElementById("setTabA").style.backgroundColor="rgb(85, 85, 85)";
    // document.getElementById("setTabB").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabC").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabA").style.color="whitesmoke";
    // document.getElementById("setTabB").style.color="black";
    // document.getElementById("setTabC").style.color="black";
  }
  else if(PageID == "Torrnet"){
    document.getElementById("Home").style.display="none";
    document.getElementById("Archive").style.display="none";
    document.getElementById("Torrnet").style.display="block";
    document.getElementById("Settings").style.display="none";
    // document.getElementById("setTabA").style.backgroundColor="rgb(85, 85, 85)";
    // document.getElementById("setTabB").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabC").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabA").style.color="whitesmoke";
    // document.getElementById("setTabB").style.color="black";
    // document.getElementById("setTabC").style.color="black";
  }
  else if(PageID == "Settings"){
    document.getElementById("Home").style.display="none";
    document.getElementById("Archive").style.display="none";
    document.getElementById("Torrnet").style.display="none";
    document.getElementById("Settings").style.display="block";
    // document.getElementById("setTabA").style.backgroundColor="rgb(85, 85, 85)";
    // document.getElementById("setTabB").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabC").style.backgroundColor="rgb(223, 223, 223)";
    // document.getElementById("setTabA").style.color="whitesmoke";
    // document.getElementById("setTabB").style.color="black";
    // document.getElementById("setTabC").style.color="black";
  }
}