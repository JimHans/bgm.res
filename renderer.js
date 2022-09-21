// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { app , Menu , Tray, shell, ipcRenderer, nativeTheme} = nodeRequire('electron'); //?使用electron
const path = nodeRequire("path");                                     //?引入path
const fs = nodeRequire('fs');                                         //?使用nodejs fs文件操作库
const runtimeUrl = path.join(__dirname, './mpv/mpv.exe');             //?mpv播放核心地址-调试
const packUrl = path.join(process.cwd(), './resources/mpv/mpv.exe');  //?mpv播放核心地址-打包后
let mpv = nodeRequire('node-mpv');                                    //?引入node-mpv接口
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
const store = new Store();

//Version Get
// window.onload = function () {
//   var package = nodeRequire("./package.json");
//   document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
// }

// function Closer(){ipcRenderer.send('MainWindow','Close');}
// function Hider(){ipcRenderer.send('MainWindow','Hide');}

// !成功、失败、信息横幅提示调用函数
function OKErrorStreamer(type,text,if_reload) {
  if(type=="OK") {
    document.getElementById("OKStreamer").innerHTML="✅"+text.toString();
    document.getElementById("OKStreamer").style.display="block";
    if(if_reload == 1) {setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 4000);}
    else{setTimeout(function() { document.getElementById("OKStreamer").style.display="none"; }, 4000);}
  }
  else if(type=="MessageOn") {
    document.getElementById("MessageStreamer").style.animation="Ascent-Streamer-Down 0.4s ease";
    document.getElementById("MessageStreamer").innerHTML=text.toString();
    document.getElementById("MessageStreamer").style.display="block";
  }
  else if(type=="MessageOff") {
    document.getElementById("MessageStreamer").style.display="none";
  }
  else {
    document.getElementById("ErrorStreamer").innerHTML="⛔"+text.toString();
    document.getElementById("ErrorStreamer").style.display="block";
    if(if_reload == 1) {setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 4000);}
    else{setTimeout(function() { document.getElementById("ErrorStreamer").style.display="none"; }, 4000);}
  }
  
}

// !页面加载完成后初始化数据函数[UnderConstruction]
window.onload = function () {
  // *Version Get
  var package = nodeRequire("./package.json");
  document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
  
  // *Recent View Get <!--格式化HomePage主页继续观看内容-->
  var bgmID = localStorage.getItem("LocalStorageRecentViewID");
  var bgmEP = localStorage.getItem("LocalStorageRecentViewEpisode");
  if(bgmID != '' && localStorage.getItem("LocalStorageRecentViewID")&&localStorage.getItem("LocalStorageRecentViewEpisode")){
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
    //错误回调
    }).done(function() { OKErrorStreamer("OK","加载作品信息完成",0); }).fail(function() { document.getElementById("RecentViewRatingScore").appendChild(document.createTextNode('0.0'));OKErrorStreamer("Error","无法连接Bangumi",0); });
    
    // *EP信息获取
    $.getJSON("https://api.bgm.tv/v0/episodes/"+bgmEP.toString(), function(data){
    document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+data.ep+"-"+data.name;
    // *错误回调
    }).done(function() { OKErrorStreamer("OK","加载EP信息完成",0); }).fail(function() { OKErrorStreamer("Error","无法连接Bangumi",0); }); // *错误回调
    console.log("Success");
  }
  else{
    document.getElementById("RecentViewDetail").innerText="哇啊(＃°Д°)，您最近根本没有本地看过番的说！";
    document.getElementById("RecentViewName").innerText="Unknown";
    document.getElementById("RecentViewRatingScore").innerText="0.0";
    document.getElementById("RecentViewProgress").innerText="您最近没有观看记录！";
  }

  // *Archive Get <!--格式化ArchivePage媒体库内容-->
  if(localStorage.getItem("LocalStorageMediaBaseNumber")){
  document.getElementById("ArchivePageSum").innerText="共 "+localStorage.getItem("LocalStorageMediaBaseNumber")+" 部作品";}
  var MediaBaseNumberGet = localStorage.getItem("LocalStorageMediaBaseNumber");
  for(var MediaBaseScanCounter=1;MediaBaseScanCounter<=MediaBaseNumberGet;MediaBaseScanCounter++){
    $("#ArchivePageContent").append( "<div id='ArchiveWorkNo"+MediaBaseScanCounter.toString()+"' class='ArchiveCardHover'>"+
    "<div class='ArchiveCardThumb' style='background:url(./assets/no_img.gif) no-repeat top;background-size:cover;'></div>"+
    "<div class='ArchiveCardTitle'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name")+"</div>"
    +"</div>" );
  }
}

//! 手动存储API(DEV) 
//*输入输入框ID，自动提取输入框内数据并以输入框ID相同键值存入localStorage
function LocalSave(Key,Input){
  if(Key == 13)
  {
    var Inner = document.getElementById(Input.toString()).value;
    localStorage.setItem(Input.toString(),Inner.toString());
    console.log(Inner);
    document.getElementById(Input.toString()).value = "";
    OKErrorStreamer("OK","更改成功保存！",1);
    // document.getElementById(Input.toString()).setAttribute("placeholder","✅更改成功保存！");
    // setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 1000);
  }
}

//! 胶囊菜单-页面切换
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

//! 调用MPV播放最近播放[UnderConstruction]
function RecentViewPlayAction() {
  if(localStorage.getItem("LocalStorageRecentViewURL")){
    var RecentViewURL = localStorage.getItem("LocalStorageRecentViewURL");
    process.noAsar = true; //临时禁用fs对ASAR读取
    fs.access(runtimeUrl, fs.constants.F_OK,function (err) {
      if (err) {  //调试播放核心 
        fs.access(RecentViewURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            let mpvPlayer = new mpv({"binary": packUrl,},["--fps=60"]);
            mpvPlayer.load(RecentViewURL);}
        });
      } 
      else {  //打包后播放核心 
        fs.access(RecentViewURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            let mpvPlayer = new mpv({"binary": runtimeUrl,},["--fps=60"]);
            mpvPlayer.load(RecentViewURL);}
        });
      }
    })
    process.noAsar = false; //恢复fs对ASAR读取
  }
}

//! 媒体库目录扫描模块[UnderConstruction]
function LocalWorkScan(){
  if(localStorage.getItem('LocalStorageMediaBaseURL'))
  {
    var TargetArchiveURL = localStorage.getItem('LocalStorageMediaBaseURL');
    if(fs.existsSync(TargetArchiveURL)){       //当目标媒体库目录存在
      OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库，请稍后</div>",0);
      store.clear(); //清除旧媒体库信息
      var TargetArchiveDir = fs.readdirSync(TargetArchiveURL); //扫描目标媒体库目录
      console.log(TargetArchiveDir.length);
      var ScanSaveCounter = 0; //媒体编号清零
      for(var ScanCounter=0;ScanCounter!=TargetArchiveDir.length;ScanCounter++){ //轮询找到媒体库目录下的子目录
        if(fs.lstatSync(TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]).isDirectory()){
          ScanSaveCounter++;
          console.log("Folder"+ScanSaveCounter+":"+TargetArchiveDir[ScanCounter]); //扫描debug输出
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".URL",TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]); //扫描到的媒体路径
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Name",TargetArchiveDir[ScanCounter]); //扫描到的媒体名称默认为文件夹名
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".bgmID",'0'); //扫描到的媒体默认bgmID为0
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Cover",'0'); //扫描到的媒体默认封面为0(后期联网更新为base64)
        }
      }
      localStorage.setItem("LocalStorageMediaBaseNumber",ScanSaveCounter); //存储扫描到的媒体数目
      OKErrorStreamer("MessageOff","<div class='LoadingCircle'></div>",0); //弹出完成提示
      OKErrorStreamer("OK","扫描完成，扫描到"+ScanSaveCounter+"个媒体",0);
      document.getElementById("ArchivePageSum").innerText="共 "+ScanSaveCounter+" 部作品";
      // console.log(store.get('WorkSaveNo5'));
    }
    else{OKErrorStreamer("Error","路径错误！",0);}
  }
  else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
}