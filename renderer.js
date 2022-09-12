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
  var bgmID = localStorage.getItem("RecentViewID");
  var bgmEP = localStorage.getItem("RecentViewEpisode");
  if(bgmID != '' && localStorage.getItem("RecentViewID")&&localStorage.getItem("RecentViewEpisode")){
    $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID.toString(), function(data){
    document.getElementById("RecentViewDetail").innerText=data.summary;
    document.getElementById("RecentViewName").innerText=data.name;
    document.getElementById("RecentViewTitle").innerText="继续观看: "+data.name_cn;
    var HomePageRatingScore =document.createTextNode(data.rating.score);
    document.getElementById("RecentViewRatingScore").appendChild(HomePageRatingScore);
    document.getElementById("RecentViewRatingRank").innerText="NO."+data.rating.rank;
    // 作品等级判定
    if(data.rating.score > 9.5) {document.getElementById("RecentViewRatingPos").innerText="超神作";}
      else if(data.rating.score > 8.5) {document.getElementById("RecentViewRatingPos").innerText="神作";}
      else if(data.rating.score > 7.5) {document.getElementById("RecentViewRatingPos").innerText="力荐";}
      else if(data.rating.score > 6.5) {document.getElementById("RecentViewRatingPos").innerText="推荐";}
      else if(data.rating.score > 5.5) {document.getElementById("RecentViewRatingPos").innerText="还行";}
      else if(data.rating.score > 4.5) {document.getElementById("RecentViewRatingPos").innerText="不过不失";}
      else if(data.rating.score > 3.5) {document.getElementById("RecentViewRatingPos").innerText="较差";}
      else if(data.rating.score > 2.5) {document.getElementById("RecentViewRatingPos").innerText="差";}
      else if(data.rating.score > 2.5) {document.getElementById("RecentViewRatingPos").innerText="很差";}
      else if(data.rating.score >= 1) {document.getElementById("RecentViewRatingPos").innerText="不忍直视";}
      else {document.getElementById("RecentViewRatingPos").innerText="暂无评分";}
    // 作品等级判定OVER
    document.getElementById("HomePage").style.background="url('"+data.images.large+"') no-repeat center";
    document.getElementById("HomePage").style.backgroundSize="cover";
    });
    $.getJSON("https://api.bgm.tv/v0/episodes/"+bgmEP.toString(), function(data){
    document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+data.ep+"-"+data.name;
    });
    console.log("Success");
  }
  else{
    document.getElementById("RecentViewDetail").innerText="哇啊(＃°Д°)，您最近根本没有本地看过番的说！";
    document.getElementById("RecentViewName").innerText="Unknown";
    document.getElementById("RecentViewRatingScore").innerText="0.0";
    document.getElementById("RecentViewProgress").innerText="您最近没有观看记录！";
  }
}

//TODO 手动存储API(DEV) 
//*输入输入框ID，自动提取输入框内数据并以输入框ID相同键值存入localStorage
function LocalSave(Key,Input){
  if(Key == 13)
  {
    var Inner = document.getElementById(Input.toString()).value;
    localStorage.setItem(Input.toString(),Inner.toString());
    console.log(Inner);
    document.getElementById(Input.toString()).value = "";
    document.getElementById(Input.toString()).setAttribute("placeholder","✅更改成功保存！");
    setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 1000);
  }
}

function FloatBarAction(PageID) { //点击切换页面
  if(PageID == "Home"){
    document.getElementById("HomePage").style.display="block";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="none";

    document.getElementById("Home").style.border="2px solid rgb(66, 66, 66)";
    document.getElementById("Archive").style.border="none";
    document.getElementById("Torrnet").style.border="none";
    document.getElementById("Settings").style.border="none";
  }
  else if(PageID == "Archive"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="block";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="none";

    document.getElementById("Home").style.border="none";
    document.getElementById("Archive").style.border="2px solid rgb(66, 66, 66)";
    document.getElementById("Torrnet").style.border="none";
    document.getElementById("Settings").style.border="none";
  }
  else if(PageID == "Torrnet"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="block";
    document.getElementById("SettingsPage").style.display="none";

    document.getElementById("Home").style.border="none";
    document.getElementById("Archive").style.border="none";
    document.getElementById("Torrnet").style.border="2px solid rgb(66, 66, 66)";
    document.getElementById("Settings").style.border="none";
  }
  else if(PageID == "Settings"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="block";

    document.getElementById("Home").style.border="none";
    document.getElementById("Archive").style.border="none";
    document.getElementById("Torrnet").style.border="none";
    document.getElementById("Settings").style.border="2px solid rgb(66, 66, 66)";
  }
}