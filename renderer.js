// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { app , Menu , Tray, shell, ipcRenderer, nativeTheme} = nodeRequire('electron'); //?使用electron
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog 对话框弹出api
const path = nodeRequire("path");                                     //?引入path
const fs = nodeRequire('fs');                                         //?使用nodejs fs文件操作库
const runtimeUrl = path.join(__dirname, './mpv/mpv.exe');             //?mpv播放核心地址-调试
const packUrl = path.join(process.cwd(), './resources/mpv/mpv.exe');  //?mpv播放核心地址-打包后
let exec = nodeRequire('child_process').exec;                         //?引用exec用于CMD指令执行
let mpv = nodeRequire('node-mpv');                                    //?引入node-mpv接口
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
const store = new Store();                                            //?创建electron-store存储资源库对象-媒体库
let SysdataOption={
  name:"sysdata",//文件名称,默认 config
  fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储


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
    document.getElementById("OKStreamer").innerHTML="✅ "+text.toString();
    document.getElementById("OKStreamer").style.display="block";
    if(if_reload == 1) {setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 4000);}
    else{setTimeout(function() { document.getElementById("OKStreamer").style.display="none"; }, 4000);}
  }
  else if(type=="MessageOn") {
    document.getElementById("MessageStreamer").style.animation="Ascent-Streamer-Down 0.4s ease";
    document.getElementById("MessageStreamer").innerHTML="<div style='position: absolute;margin-left: 5px;animation: Element-Rotation 1.5s linear infinite;aspect-ratio: 1;height: 70%;top: 15%;'><svg t='1674730870243' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='2939' style='width: 100%;height: 100%;'><path d='M277.333333 759.466667C213.333333 695.466667 170.666667 610.133333 170.666667 512c0-187.733333 153.6-341.333333 341.333333-341.333333v85.333333c-140.8 0-256 115.2-256 256 0 72.533333 29.866667 140.8 81.066667 187.733333l-59.733334 59.733334z' fill='#111' p-id='2940'></path></svg></div>"+text.toString();
    document.getElementById("MessageStreamer").style.display="block";
  }
  else if(type=="MessageOff") {
    document.getElementById("MessageStreamer").style.display="none";
  }
  else {
    document.getElementById("ErrorStreamer").innerHTML="⛔ "+text.toString();
    document.getElementById("ErrorStreamer").style.display="block";
    if(if_reload == 1) {setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 4000);}
    else{setTimeout(function() { document.getElementById("ErrorStreamer").style.display="none"; }, 4000);}
  }
  
}

// !配置初始化函数
function SysdataDefaultInit(){
  //获取本地json文件的路径
  const SysdataFile_path = path.join(__dirname, './sysdata_default.json').replace(/\\/g, "\/");

  fs.exists(SysdataFile_path, function (exists) {
      if (!exists) {$(".errorInformation").show();return;} 
      else {
        //读取本地的json文件
        let result = JSON.parse(fs.readFileSync(SysdataFile_path));
        sysdata.set(result);
      }
  });
}

// !页面加载完成后初始化数据函数(目前仅初始化主页)
function SysOnload() {

  if(!sysdata.get("Settings")){SysdataDefaultInit()}
  // *Version Get
  var package = nodeRequire("./package.json");
  document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
  
  // *Recent View Get <!--格式化HomePage主页继续观看内容-->
  var bgmID = sysdata.get("Settings.checkboxC.LocalStorageRecentViewID");//localStorage.getItem("LocalStorageRecentViewID");
  var MediaID = sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID");//localStorage.getItem("LocalStorageRecentViewLocalID");
  var bgmEP = sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisode");//localStorage.getItem("LocalStorageRecentViewEpisode");
  if(bgmID != '' && sysdata.get("Settings.checkboxC.LocalStorageRecentViewID")&&sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisode")){
    $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID.toString(), function(data){
    document.getElementById("RecentViewDetail").innerText=data.summary;
    document.getElementById("RecentViewName").innerText=data.name;
    document.getElementById("RecentViewTitle").innerText="继续观看: "+data.name_cn;
    document.getElementById("RecentViewRatingScore").innerHTML=
    "<div id='RecentViewRatingRank' class='boxBlank' style='border: 1px dashed rgb(155, 155, 155);background-color: rgba(0, 0, 0, 0.292);top:15%;font-size: 1.5vw;font-family:bgmUI;height: 28%;width:30%;left:10%;backdrop-filter: blur(10px);box-shadow:none;line-height: 200%;'>NO.Null</div>"+
    "<div id='RecentViewRatingPos' class='boxBlank' style='border: 1px dashed rgb(155, 155, 155);background-color: rgba(0, 0, 0, 0.292);bottom:15%;font-size: 1.5vw;font-family:bgmUI;height: 28%;width:30%;left:10%;backdrop-filter: blur(10px);box-shadow:none;line-height: 200%;'>NoRank</div>";
    var HomePageRatingScore =document.createTextNode(data.rating.score.toFixed(1));
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
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemShowModifiedCover")) //判断是否使用自定义背景
    {document.getElementById("HomePage").style.background="url('"+store.get('WorkSaveNo'+MediaID+'.Cover')+"') no-repeat center";}
    document.getElementById("HomePage").style.backgroundSize="cover";
    //错误回调
    }).done(function() { OKErrorStreamer("OK","加载作品信息完成",0); }).fail(function() { document.getElementById("RecentViewTitle").innerText="继续观看: "+store.get("WorkSaveNo"+MediaID+".Name");document.getElementById("RecentViewRatingScore").appendChild(document.createTextNode('0.0'));OKErrorStreamer("Error","无法连接Bangumi",0); });
    
    // *EP信息获取
    var RecentViewEpisodeType = sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisodeType");//localStorage.getItem("LocalStorageRecentViewEpisodeType");
    if(RecentViewEpisodeType!='SP'){
    $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
      for(var EPTemper=0;EPTemper!=data1.data.length;EPTemper++){
        if(data1.data[EPTemper].hasOwnProperty("ep")&&data1.data[EPTemper].ep==bgmEP) 
        {
          if(sysdata.get("UserData.userpageProgressSyncOptions")!='Disabled'){$.ajax({url: "https://api.bgm.tv/v0/users/-/collections/-/episodes/"+data1.data[EPTemper].id, //与云端同步章节看过信息
          type: 'GET',contentType: "application/json",headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
          success: function (data2) {if(data2.type!=2){ //判断云端是否观看
            $.ajax({url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID+"/episodes", //当云端未观看时与云端同步章节看过信息
            type: 'PATCH',contentType: "application/json",dataType: "json",
            headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},
            data: '{"episode_id": ['+data1.data[EPTemper].id+'],"type": 2}',timeout : 2000,success: function () {;}, error: function () {;}})
            }
          }, error: function () {;}})}

          $.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[EPTemper].id, function(data2){document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+data2.ep+"-"+data2.name;}).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+bgmEP});break;}
        else{document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+bgmEP;}
      }
    // *错误回调
    }).done(function() { OKErrorStreamer("OK","加载作品EP信息完成,数据已同步",0); }).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+bgmEP; OKErrorStreamer("Error","无法连接Bangumi",0); }); // *错误回调
    }
    if(RecentViewEpisodeType=='SP'){
      $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
        for(let SPTemper=0;SPTemper!=data1.data.length;SPTemper++){
          if(data1.data[SPTemper].type=='1'&&data1.data[SPTemper].sort==bgmEP) 
          {$.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[SPTemper].id, function(data2){document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+data2.type+"-"+data2.name;}).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+bgmEP});break;}
          else{document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+bgmEP;}
        }// *错误回调
      }).done(function() { OKErrorStreamer("OK","加载作品SP信息完成",0); }).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+bgmEP; OKErrorStreamer("Error","无法连接Bangumi",0); }); // *错误回调
    }

    $('#RecentViewProgress').attr('onclick',"console.log('OK');RecentViewPlayAction('Last');");
    console.log("Success");
  }
  else{
    document.getElementById("RecentViewDetail").innerText="哇啊(＃°Д°)，您最近根本没有本地看过番的说！";
    document.getElementById("RecentViewName").innerText="Unknown";
    document.getElementById("RecentViewRatingScore").innerText="0.0";
    document.getElementById("RecentViewProgress").innerText="您最近没有观看记录！";
  }

  if(sysdata.get("Settings.checkboxB.LocalStorageSystemBackgroundImage")) //判断是否启用自定义背景
  {document.getElementById('HomePage').style.background="url('"+sysdata.get("Settings.checkboxB.LocalStorageSystemBackgroundImage").toString()+"') no-repeat";
  document.getElementById('HomePage').style.backgroundSize='cover';
  document.getElementById('ArchivePage').style.background="url('"+sysdata.get("Settings.checkboxB.LocalStorageSystemBackgroundImage").toString()+"') no-repeat";
  document.getElementById('ArchivePage').style.backgroundSize='cover';
  document.getElementsByClassName('ArchivePageHeader')[0].style.backgroundColor= '#00000058';
  document.getElementById('SettingsPage').style.background="url('"+sysdata.get("Settings.checkboxB.LocalStorageSystemBackgroundImage").toString()+"') no-repeat";
  document.getElementById('SettingsPage').style.backgroundSize='cover';}
  if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) //判断是否启用自定义主题色
  {document.getElementById("Home").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");}
}window.onload = SysOnload();

// !页面大小变化时更新元素状态函数(目前仅更新作品详情)
window.onresize=function(){  
  if($("#ArchivePageContentDetails").is(":visible")){
    document.getElementById("ArchivePageContentDetailsTitle").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品主标题贴左边
    document.getElementById("ArchivePageContentDetailsTitleJp").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制日文标题贴左边
    document.getElementById("ArchivePageContentDetailsTitleJp").style.top=(22+(document.getElementById("ArchivePageContentDetailsTitle").getBoundingClientRect().height)*2/($(window).height())*100).toString()+"%"; // 控制日文标题贴上边
    document.getElementById("ArchivePageContentDetailsFolderURL").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制打开文件夹按钮贴左边
    document.getElementById("ArchivePageContentDetailsEditor").style.left=(34+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品编辑按钮贴左边

    document.getElementById('RecentViewEpisodePlayCard').style.display='none';document.getElementById('RecentViewEpisodePlayCardBack').style.display='none'; //自动关闭作品播放卡片
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

// TODO MainPage Relavant Function Start

//! 胶囊菜单-页面切换
function FloatBarAction(PageID) { //点击切换页面
  if(PageID == "Home"){
    document.getElementById("HomePage").style.display="block";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="none";

    document.getElementById("Home").style.border="3px solid rgb(240 145 153)";
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    {document.getElementById("Home").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");}
    document.getElementById("Archive").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Torrnet").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Settings").style.border="3px solid rgb(66, 66, 66,0)";
  }
  else if(PageID == "Archive"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="block";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="none";
    ArchivePageInit();

    document.getElementById("Home").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Archive").style.border="3px solid rgb(240 145 153)";
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    {document.getElementById("Archive").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");}
    document.getElementById("Torrnet").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Settings").style.border="3px solid rgb(66, 66, 66,0)";
  }
  else if(PageID == "Torrnet"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="block";
    document.getElementById("SettingsPage").style.display="none";

    document.getElementById("Home").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Archive").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Torrnet").style.border="3px solid rgb(240 145 153)";
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    {document.getElementById("Torrnet").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");}
    document.getElementById("Settings").style.border="3px solid rgb(66, 66, 66,0)";
  }
  else if(PageID == "Settings"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="block";

    document.getElementById("Home").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Archive").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Torrnet").style.border="3px solid rgb(66, 66, 66,0)";
    document.getElementById("Settings").style.border="3px solid rgb(240 145 153)";
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    {document.getElementById("Settings").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");}
    SettingsPageConfigInit()
  }
}

//! 播放-调用MPV播放最近播放 传入Last/Next选择上次播放或者下一话 完成后刷新
function RecentViewPlayAction(Type) {
  //获取待播放的最近播放章节类型
  var RecentViewEpisodeType = sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisodeType");//localStorage.getItem("LocalStorageRecentViewEpisodeType");
  //按继续播放或播放下一话调用url与epid
  if(Type=='Last') {var RecentTempURL = "LocalStorageRecentViewURL";var RecentEP = sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisode")/*localStorage.getItem("LocalStorageRecentViewEpisode")*/;}
  if(Type=='Next') {var RecentTempURL = "LocalStorageRecentViewNextURL";var RecentEP = Number(sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisode"))+1;
  if(RecentViewEpisodeType!='SP'){store.set("WorkSaveNo"+sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID")+".EPDetails.EP"+(RecentEP-1).toString()+'.Condition','Watched');}
  if(RecentViewEpisodeType=='SP'){store.set("WorkSaveNo"+sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID")+".SPDetails.SP"+(RecentEP-1).toString()+'.Condition','Watched')}}setTimeout
  //当章节为数据库内truenum记录的最后一章时 点击下一话不加载之后的 即使有 而提醒播放完毕
  if(Type=='Next'&&RecentViewEpisodeType!='SP'&&RecentEP>store.get("WorkSaveNo"+sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID")+".EPTrueNum")){setTimeout(function(){OKErrorStreamer("OK","所有EP章节已观看完毕！",0)},1000);SysOnload();return true;}
  if(Type=='Next'&&RecentViewEpisodeType=='SP'&&RecentEP>store.get("WorkSaveNo"+sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID")+".SPTrueNum")){setTimeout(function(){OKErrorStreamer("OK","所有SP章节已观看完毕！",0)},1000);SysOnload();return true;}
  
  if(sysdata.get("Settings.checkboxC."+RecentTempURL)){
    var RecentViewURL = sysdata.get("Settings.checkboxC."+RecentTempURL);//localStorage.getItem(RecentTempURL);
    process.noAsar = true; //临时禁用fs对ASAR读取
    fs.access(runtimeUrl, fs.constants.F_OK,function (err) {
      if (err) {  //调试播放核心 
        fs.access(RecentViewURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            var MediaID = sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID");//localStorage.getItem("LocalStorageRecentViewLocalID"); //更新最近播放ep集数与链接信息
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisode",RecentEP);
            localStorage.setItem("LocalStorageRecentViewEpisode",RecentEP);
            if(RecentViewEpisodeType!='SP'){ //根据类型保存播放url
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(RecentEP)+".URL"));
            localStorage.setItem("LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(RecentEP)+".URL"));
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(Number(RecentEP)+1)+".URL"));
            localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(Number(RecentEP)+1)+".URL"));}
            if(RecentViewEpisodeType=='SP'){
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(RecentEP)+".URL"));
            localStorage.setItem("LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(RecentEP)+".URL"));
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(Number(RecentEP)+1)+".URL"));
            localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(Number(RecentEP)+1)+".URL"));}
            SysOnload();
            let mpvPlayer = new mpv({"binary": packUrl,},["--fps=60"]);
            mpvPlayer.load(RecentViewURL);}
        });
      } 
      else {  //打包后播放核心 
        fs.access(RecentViewURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            var MediaID = sysdata.get("Settings.checkboxC.LocalStorageRecentViewLocalID");//localStorage.getItem("LocalStorageRecentViewLocalID"); //更新最近播放ep集数与链接信息
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisode",RecentEP);
            localStorage.setItem("LocalStorageRecentViewEpisode",RecentEP);
            if(RecentViewEpisodeType!='SP'){ //根据类型保存播放url
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(RecentEP)+".URL"));
            localStorage.setItem("LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(RecentEP)+".URL"));
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(Number(RecentEP)+1)+".URL"));
            localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(Number(RecentEP)+1)+".URL"));}
            if(RecentViewEpisodeType=='SP'){
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(RecentEP)+".URL"));
            localStorage.setItem("LocalStorageRecentViewURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(RecentEP)+".URL"));
            sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(Number(RecentEP)+1)+".URL"));
            localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(Number(RecentEP)+1)+".URL"));}  
            SysOnload();
            let mpvPlayer = new mpv({"binary": runtimeUrl,},["--fps=60"]);
            mpvPlayer.load(RecentViewURL);}
        });
      }
    })
    process.noAsar = false; //恢复fs对ASAR读取
  }
}

// TODO Media Archive Relavant Function Start

//! 媒体库-目录全局扫描模块
function LocalWorkScan(){
  var result = dialog.showMessageBoxSync({
    type:"question",
    buttons:["取消","确认"],
    title:"提示",
    message:`您确定要进行媒体库全局扫描吗？这将覆盖您当前的媒体库数据信息！`
  });
  if(result == 1){
    if(sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL"))//if(localStorage.getItem('LocalStorageMediaBaseURL'))
    {
      var TargetArchiveURL = sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL")//localStorage.getItem('LocalStorageMediaBaseURL');
      if(fs.existsSync(TargetArchiveURL)){       // *当目标媒体库目录存在
        OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库，请稍后</div>",0);
        setTimeout(function() {
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
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Score",'0.0'); //扫描到的媒体默认评分
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Type",'TV'); //扫描到的媒体默认类型
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Year",'0000'); //扫描到的媒体默认年代
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Eps",'1'); //扫描到的媒体默认话数
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Protocol",'Unknown'); //扫描到的媒体默认原案
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Director",'Unknown'); //扫描到的媒体默认监督
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Corp",'Corp'); //扫描到的媒体默认制作公司
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Cover",'./assets/banner.jpg'); //扫描到的媒体默认封面(后期联网更新为base64)
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".ExistCondition",'Exist'); //扫描到的媒体默认状态(默认存在)

            LocalWorkEpsScanModule(ScanSaveCounter.toString());
          }
        }
        sysdata.set("Settings.checkboxC.LocalStorageMediaBaseNumber",ScanSaveCounter);
        localStorage.setItem("LocalStorageMediaBaseNumber",ScanSaveCounter); //存储扫描到的媒体数目
        sysdata.set("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber",0);
        localStorage.setItem('LocalStorageMediaBaseDeleteNumber',0) //存储删除的媒体数目(初始0)

        // *使用默认刮削器自动收集初始数据
        $.ajaxSettings.async = false; //关闭同步
        for(var ScanCounter=1;ScanCounter<=ScanSaveCounter;ScanCounter++){ //轮询找到媒体库目录下的子目录
          //TODO 默认刮削器
          if(store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g)!=null&&store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g)!=" "){ 
            //存在双括号约束
            $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g)+"?type=2", function(data){
              store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.list[0].id); });} //初始化id
          else if(store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]!=null&&store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]!=" "){ //存在单括号约束
          $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]+"?type=2", function(data){
            store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.list[0].id); });}  //初始化id
          else { $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString()+"?type=2", function(data){
            store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.list[0].id); });}  //不存在约束
          //TODO 默认刮削器END
        }$.ajaxSettings.async = true; //重新打开同步
        OKErrorStreamer("MessageOff","<div class='LoadingCircle'></div>",0); //弹出完成提示
        OKErrorStreamer("OK","扫描完成，扫描到"+ScanSaveCounter+"个媒体",0);
        document.getElementById("ArchivePageSum").innerText="共 "+ScanSaveCounter+" 部作品";
        setTimeout(function() {ArchiveMediaUpdate();},3000);
        // console.log(store.get('WorkSaveNo5'));
        },1000);
      }
      else{OKErrorStreamer("Error","路径错误！",0);}
    }
    else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
  }
}

//! 媒体库-目录增量扫描模块
function LocalWorkScanModify(){
  if(sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL"))  // *检测是否已填写路径 localStorage.getItem('LocalStorageMediaBaseURL');
  {
    var TargetArchiveURL = sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL")//localStorage.getItem('LocalStorageMediaBaseURL');

    if(fs.existsSync(TargetArchiveURL)){       // *当目标媒体库目录存在
      OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库更改，请稍后</div>",0);

      setTimeout(function() {
      var TargetArchiveDir = fs.readdirSync(TargetArchiveURL); //扫描目标媒体库目录
      console.log(TargetArchiveDir.length);

      var ScanSaveCounter = 0; //媒体计数器清零
      if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))
      {var LocalStorageMediaBaseNumber = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");}//localStorage.getItem("LocalStorageMediaBaseNumber")
      else {var LocalStorageMediaBaseNumber = 0;} //获取已存储的总数目,若未初始化则置零

      for(let ScanCounter=0;ScanCounter!=TargetArchiveDir.length;ScanCounter++){ //轮询找到媒体库目录下的子目录

        var Scan_Valid = 0; //扫描有效键值

        for(let StorageScanCounter=1;StorageScanCounter<=LocalStorageMediaBaseNumber;StorageScanCounter++){
          if((TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]) == store.get("WorkSaveNo"+StorageScanCounter.toString()+".URL"))
          {Scan_Valid = 1;break;}
        }

        if(fs.lstatSync(TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]).isDirectory() && Scan_Valid == 0){
          ScanSaveCounter++;
          let ScanStorageNumber = Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter) //媒体计数器+已有数目计算得出实际编号
          console.log("Folder"+ScanStorageNumber+":"+TargetArchiveDir[ScanCounter]); //扫描debug输出
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".URL",TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]); //扫描到的媒体路径
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Name",TargetArchiveDir[ScanCounter]); //扫描到的媒体名称默认为文件夹名
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".bgmID",'0'); //扫描到的媒体默认bgmID为0
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Score",'0.0'); //扫描到的媒体默认评分
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Type",'TV'); //扫描到的媒体默认类型
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Year",'0000'); //扫描到的媒体默认年代
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Eps",'1'); //扫描到的媒体默认话数
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Protocol",'Unknown'); //扫描到的媒体默认原案
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Director",'Unknown'); //扫描到的媒体默认监督
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Corp",'Corp'); //扫描到的媒体默认制作公司
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Cover",'./assets/banner.jpg'); //扫描到的媒体默认封面(后期联网更新为base64)
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".ExistCondition",'Exist'); //扫描到的媒体默认状态(默认存在)

          LocalWorkEpsScanModule(ScanStorageNumber.toString());
        }
      }
      sysdata.set("Settings.checkboxC.LocalStorageMediaBaseNumber",Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter));
      localStorage.setItem("LocalStorageMediaBaseNumber",Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter)); //存储扫描到的媒体数目
      if(!sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"))
      {sysdata.set("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber",0);localStorage.setItem('LocalStorageMediaBaseDeleteNumber',0) }//未初始化时，存储删除的媒体数目(初始0)

      // *使用默认刮削器自动收集初始数据
      if(ScanSaveCounter!=0){
        $.ajaxSettings.async = false; //关闭同步
        for(let ScanCounter=1;ScanCounter<=ScanSaveCounter;ScanCounter++){ //轮询找到媒体库目录下的子目录
          //TODO 默认刮削器
          if(store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g)!=null&&store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g)!=" "){ 
            //存在双括号约束
            $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g)+"?type=2", function(data){
              store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); });} //初始化id
          else if(store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]!=null&&store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]!=" "){ //存在单括号约束
          $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]+"?type=2", function(data){
            store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); });}  //初始化id
          else { $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString()+"?type=2", function(data){
            store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); });}  //不存在约束
          //TODO 默认刮削器END
        }$.ajaxSettings.async = true; //重新打开同步
      }
      let DeleteNumberSaver= sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber");//localStorage.getItem('LocalStorageMediaBaseDeleteNumber')
      OKErrorStreamer("MessageOff","<div class='LoadingCircle'></div>",0); //弹出完成提示
      OKErrorStreamer("OK","扫描完成，新增"+ScanSaveCounter+"个媒体",0);
      document.getElementById("ArchivePageSum").innerText="共 "+(Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter)-Number(DeleteNumberSaver))+" 部作品";
      setTimeout(function() {for(let ScanCounter=1;ScanCounter<=ScanSaveCounter;ScanCounter++){ArchiveMediaUpdateSingle((Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)));}},3000);
      // console.log(store.get('WorkSaveNo5'));
      },1000);
    }
    else{OKErrorStreamer("Error","路径错误！",0);}
  }
  else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
}

//! 媒体库-页面初始化模块
function ArchivePageInit(){
  // *Archive Get <!--格式化ArchivePage媒体库内容-->
  if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")){
    document.getElementById("ArchivePageSum").innerText="共 "+(parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))-parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"))).toString()+" 部作品";}
    var MediaBaseNumberGet = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");//localStorage.getItem("LocalStorageMediaBaseNumber");
    document.getElementById('ArchivePageContent').innerHTML="";
    if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")==0 || !sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))
    {document.getElementById('ArchivePageContent').innerHTML="<div style='position:absolute;left:25%;right:25%;top:30%;bottom:30%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3vmin'>暂时没有作品，请设置正确的媒体库地址并点击右上角下拉菜单中的“全局扫描”按钮来更新媒体库</div>";}
    // *扫描作品bgmID获取作品信息
    for(let MediaBaseScanCounter=1;MediaBaseScanCounter<=MediaBaseNumberGet;MediaBaseScanCounter++){

      if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".ExistCondition") == "Deleted") {continue;} //发现已删除作品，自动跳过

      // *计算作品进度信息
      var ArchiveCardWatchPercentSaver = 0;var ArchiveCardWatchPercentRightBorder='8px'
      for(let Tempi=1;Tempi<=parseInt(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".EPTrueNum"));Tempi++){
        if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".EPDetails.EP"+Tempi+'.Condition')=='Watched') ArchiveCardWatchPercentSaver++;
      } ArchiveCardWatchPercentSaver = (ArchiveCardWatchPercentSaver/parseInt(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".EPTrueNum")))*100
      if(ArchiveCardWatchPercentSaver==100) ArchiveCardWatchPercentRightBorder='0'
      if(!sysdata.get("Settings.checkboxB.LocalStorageMediaShowProgress")){ArchiveCardWatchPercentSaver = 0} //若禁用进度条，设定长度为0

      $("#ArchivePageContent").append( "<div id='ArchiveWorkNo"+MediaBaseScanCounter.toString()+"' class='ArchiveCardHover' style='background:url(\""+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover")+"\") no-repeat top;background-size:cover;'>"+
      "<div class='ArchiveCardThumb' style='background:url(./assets/ArchiveCover.png) no-repeat center;background-size:cover;'></div>"+ //封面遮罩阴影
      "<div id='ArchiveCardProgressShowerNo"+MediaBaseScanCounter.toString()+"' class='ArchiveCardProgressShower' style='width:"+ArchiveCardWatchPercentSaver+"%;border-bottom-right-radius: "+ArchiveCardWatchPercentRightBorder+";'></div>"+ //进度指示
      "<div class='ArchiveCardTitle'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name")+"</div>"+ //名称
      "<div class='ArchiveCardRateStar'>⭐&nbsp;"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score")+"</div>"+ //评分
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:22%;left:5%;right:5%;text-align:center;font-style:italic;'>"+
      store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type")+"&nbsp;"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps")+"话&nbsp;"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year")+"</div>"+ //资料A
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:12%;left:40%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>原作 "+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol")+"</div>"+ //制作原案
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director")+"</div>"+ //制作监督
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:5%;right:50%;text-align:left;color: rgba(255, 255, 255, 0.79);'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp")+"</div>"+ //制作公司
      "<div style='border-radius: 8px;transition: all 0.5s;left:0%;right:0%;top:0%;bottom:0%;position:absolute;' onclick='ArchiveMediaDetailsPage("+MediaBaseScanCounter+")'></div>"+ // 点击触发区域
      // "<div class='ArchiveCardDirectorYearCorp' style='font-family:bgmUIHeavy;top:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);z-index:20;' onclick='ArchiveContentEditer("+MediaBaseScanCounter.toString()+");'>编辑</div>"+ //编辑按键
      "</div>" );
    }
}

//! 媒体库-计算作品进度信息
function ArchivePageMediaProgressCalc(MediaID){
    // *计算作品进度信息
    var ArchiveCardWatchPercentSaver = 0;var ArchiveCardWatchPercentRightBorder='8px'
    for(let Tempi=1;Tempi<=parseInt(store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum"));Tempi++){
      if(store.get("WorkSaveNo"+MediaID.toString()+".EPDetails.EP"+Tempi+'.Condition')=='Watched') ArchiveCardWatchPercentSaver++;
    } ArchiveCardWatchPercentSaver = (ArchiveCardWatchPercentSaver/parseInt(store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum")))*100
    if(ArchiveCardWatchPercentSaver==100) ArchiveCardWatchPercentRightBorder='0'
    document.getElementById("ArchiveCardProgressShowerNo"+MediaID.toString()).style.width=ArchiveCardWatchPercentSaver+"%";
    document.getElementById("ArchiveCardProgressShowerNo"+MediaID.toString()).style.borderBottomRightRadius=ArchiveCardWatchPercentRightBorder;
}

//! 媒体库-搜索模块
function ArchivePageMediaSearch(Key){
  if(Key == 13)
  {console.log('OK')}
  else {setTimeout(function(){
    document.getElementById('ArchivePageSearchSuggestion').innerHTML='';
    document.getElementById('ArchivePageSearchSuggestion').style.display='block';
    document.getElementById('ArchivePageSearchSuggestionBack').style.display='block';
    let MediaNumber = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");//localStorage.getItem("LocalStorageMediaBaseNumber");
    let SearchKeyWord = document.getElementById('ArchivePageSearch').value;
    let SerachResultGetted = 0;
    for(let ScanCounter=1;ScanCounter<=MediaNumber;ScanCounter++){
      let StoreGet = store.get("WorkSaveNo"+ScanCounter+".Name");
        if(StoreGet.match(eval('/'+SearchKeyWord+'/'))&&store.get("WorkSaveNo"+ScanCounter+".ExistCondition")!='Deleted'){
          SerachResultGetted = 1;
          $("#ArchivePageSearchSuggestion").append("<div class='Winui3brickContainer'>"+"<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+store.get("WorkSaveNo"+ScanCounter+".Cover")+"\") no-repeat top;background-size:cover;border-radius:8px;'></div>"+
          "<div style='position:relative;margin-left:10px;margin-right:40px;overflow:hidden'>"+StoreGet+"<br/><div style='position:relative;font-size:15px;margin-top:5px;color: #aaa;'>"+store.get("WorkSaveNo"+ScanCounter+".Year")+"/"+store.get("WorkSaveNo"+ScanCounter+".Director")+"/"+store.get("WorkSaveNo"+ScanCounter+".Type")+"</div></div>"+
          "<button type='button' value='进入' class='Winui3button' style='width:30px' onclick='ArchiveMediaDetailsPage("+ScanCounter+")'><svg t='1673884147084' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='5739' width='15' height='15'><path d='M245.034251 895.239428l383.063419-383.063419L240.001631 124.07997l0.070608-0.033769c-12.709463-13.137205-20.530592-31.024597-20.530592-50.731428 0-40.376593 32.736589-73.111135 73.115228-73.111135 19.705807 0 37.591153 7.819083 50.730405 20.528546l0.034792-0.035816 438.686251 438.681134-0.035816 0.034792c13.779841 13.281491 22.3838 31.915897 22.3838 52.586682 0 0.071631 0 0.106424 0 0.178055 0 0.072655 0 0.10847 0 0.144286 0 20.669762-8.603959 39.341007-22.3838 52.623521l0.035816 0.033769L343.426165 1003.661789l-0.180102-0.179079c-13.140275 12.565177-30.950919 20.313651-50.588165 20.313651-40.378639 0-73.115228-32.736589-73.115228-73.114205C219.544717 928.512229 229.432924 908.664182 245.034251 895.239428z' p-id='5740' fill='#ffffff'></path></svg></button>"+"</div>")
      }
    }
    if( SerachResultGetted == 0){
      $("#ArchivePageSearchSuggestion").append("<div class='Winui3brickContainer'><div style='position:relative;margin:auto;overflow:hidden;text-align:center'>在媒体库中没有找到结果</div></div>")}
  },100)}

}

//! 媒体库-作品设置模块
function ArchiveContentEditer(MediaID) {
  if(!sysdata.get("Settings.checkboxC.LocalStorageMediaShowOldSettingPage")){ //不启用旧版设置时，只显示新版设置
  let options = {data:MediaID}// 需要发送的数据
  ipcRenderer.send('MediaSettings',options);}
  else{
  document.getElementById("ArchivePageContentSettingsBody").innerHTML=""; //清空body
  $("#ArchivePageContentSettingsBody").append( 
    "<div id='ArchivePageContentSettingsCover' class='ArchiveCardHover' style='position:absolute;bottom:36%;left:3%;width:23%;height:auto;aspect-ratio:3/4'></div>"+
    "<div class='ArchiveInputLine' style='top:30%;left:35%;width:60%;height:10%'> <!-- *设置作品bgmID -->"+
    "<input type='text' id='ArchivePageContentSettingsbgmID' autocomplete='off' onkeydown='StoreSave(event.keyCode,1,"+MediaID+");' required />"+ //placeholder='BGMID可以在Bangumi作品页面URL内找到'
    "<div class='line'></div><span>请输入当前作品的BGMID</span></div>"+
    "<div class='ArchiveInputLine' style='top:50%;left:35%;width:60%;height:10%'> <!-- *设置作品URL -->"+
    "<input type='text' id='ArchivePageContentSettingsURL' autocomplete='off'  onkeydown='StoreSave(event.keyCode,2,"+MediaID+")' required />"+   //placeholder='如果作品位置转移，可以在此重设URL'
    "<div class='line'></div><span>请输入当前作品的URL</span></div>"+
    "<div class='ArchiveCardDirectorYearCorp' style='font-family:bgmUIHeavy;top:67%;left:6.5%;width:20%;text-align:center;color: rgba(255, 255, 255, 0.79);'>"+store.get("WorkSaveNo"+MediaID+".Name")+"</div>"+
    "<div style='font-family:bgmUI;color:rgba(171, 171, 171, 0.79);position:absolute;overflow:hidden;top:67%;left:30%;right:5%;text-align:right;font-size:2vmin;font-style:italic;display:-webkit-box;text-overflow:ellipsis;-webkit-box-orient:vertical;-webkit-line-clamp:2;padding-right:5px;'>原作："+store.get("WorkSaveNo"+MediaID+".Protocol")+
    " | 监督："+store.get("WorkSaveNo"+MediaID+".Director")+" | 动画制作："+store.get("WorkSaveNo"+MediaID+".Corp")+" | 类型："+store.get("WorkSaveNo"+MediaID+".Type")+"</div>"+
    "<div class='ArchivePageButton' style='top:85%;bottom: 5%;left:40%;width:20%;color:#ed5a65;border: 2px dashed rgb(145, 145, 145);' onclick='StoreDeleteWork("+MediaID+");'>删除作品</div>"
    );
  
  document.getElementById('ArchivePageContentSettingsbgmID').value=store.get("WorkSaveNo"+MediaID+".bgmID"); //填入默认数据
  document.getElementById('ArchivePageContentSettingsURL').value=store.get("WorkSaveNo"+MediaID+".URL");
  var WorkCover = store.get("WorkSaveNo"+MediaID+".Cover"); //初始化封面
  document.getElementById('ArchivePageContentSettings').style.display = "block";
  document.getElementById('ArchivePageContentSettingsCover').style.background = "block";
  document.getElementById("ArchivePageContentSettingsCover").style.background="url('"+WorkCover+"') no-repeat center";
  document.getElementById("ArchivePageContentSettingsCover").style.backgroundSize="cover";
  console.log("OKSet!");
  }
}

//! 媒体库-作品设置-存储API
//*输入输入框ID，自动提取输入框内数据并存入Storage
function StoreSave(Key,Input,WorkID){
  if(Key == 13)
  {
    if(Input == 1){var WorkbgmID = document.getElementById('ArchivePageContentSettingsbgmID').value; store.set("WorkSaveNo"+WorkID+".bgmID",WorkbgmID.toString());}
    if(Input == 2){var WorkURL = document.getElementById('ArchivePageContentSettingsURL').value; store.set("WorkSaveNo"+WorkID+".URL",WorkURL.toString());}
    LocalWorkEpsScanModule(WorkID); //扫描作品EP信息
    ArchivePageInit(); //更新媒体库页面
    OKErrorStreamer("OK","更改成功保存！",0);
  }
}

//! 媒体库作品设置-作品删除
function StoreDeleteWork(WorkID){
  var result = dialog.showMessageBoxSync({
    type:"question",
    buttons:["取消","确认"],
    title:"警告",
    message:`
    您确定要删除作品 [`+store.get("WorkSaveNo"+WorkID+".Name")+
    `] 吗？此操作将仅删除程序记录，您在磁盘上的文件不会被删除。`
  });
  if(result == 1){store.set("WorkSaveNo"+WorkID+".ExistCondition",'Deleted');
    document.getElementById('ArchivePageContentSettings').style.display='none';
    var MediaBaseDeleteNumber = parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"));
    sysdata.set("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber",MediaBaseDeleteNumber+1);
    localStorage.setItem('LocalStorageMediaBaseDeleteNumber',MediaBaseDeleteNumber+1);
    ArchivePageInit();
    OKErrorStreamer("OK","作品已从数据库删除",0);
  }
}

//! 媒体库-作品数据信息链接BGM更新模块(所有作品)
function ArchiveMediaUpdate(){
  // *Archive Get <!--联网检索ArchivePage媒体库内容-->
  OKErrorStreamer("MessageOn","作品信息更新进行中",0);
  if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")&&localStorage.getItem('LocalStorageMediaBaseDeleteNumber')){
    document.getElementById("ArchivePageSum").innerText="共 "+Number(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")-sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"))+" 部作品";}
  setTimeout(function() {
    var MediaBaseNumberGet = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");//localStorage.getItem("LocalStorageMediaBaseNumber");
    // *扫描作品bgmID获取作品信息 
    $.ajaxSettings.async = false; //关闭同步
    function ArchiveMediaUpdateOperator(MediaBaseScanCounter) {
      // *扫描作品bgmID获取作品信息
      // document.getElementById('MessageStreamer').innerText='作品信息更新进行中'+MediaBaseScanCounter+'/'+MediaBaseNumberGet;
      if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID") != '0'){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString(), function(data){
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
          if(data.name_cn!=""){store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);}
          else{store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name);}
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
        }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString()+'/persons', function(data){
        for(let MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
          if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
          if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
          if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
        } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
      } 
    }
    for(let MediaBaseScanCounter=1;MediaBaseScanCounter<=MediaBaseNumberGet;MediaBaseScanCounter++){
      // *扫描作品bgmID获取作品信息
      ArchiveMediaUpdateOperator(MediaBaseScanCounter);
      // if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID") != '0'){
      //   $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString(), function(data){
      //     store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
      //     store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
      //     store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
      //     store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);
      //     store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
      //     store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
      //   }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
      //   $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString()+'/persons', function(data){
      //   for(var MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
      //     if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
      //     if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
      //     if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
      //   } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
      // } 
    } $.ajaxSettings.async = true; //重新打开同步
    ArchivePageInit(); //更新媒体库页面
    OKErrorStreamer("MessageOff","作品信息更新进行中",0);
    OKErrorStreamer("OK","媒体库数据爬取完成",0); 
    },2000);
}

//! 媒体库-作品数据信息链接BGM更新模块(指定作品)
function ArchiveMediaUpdateSingle(MediaBaseScanCounter){
  // *Archive Get <!--联网检索ArchivePage指定媒体内容-->
  OKErrorStreamer("MessageOn","作品信息更新进行中",0);
  setTimeout(function() {
    // *扫描作品bgmID获取作品信息 
      if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID") != '0'){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString(), function(data){
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
          if(data.name_cn!=null){store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);}
          else{store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name);}
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
        }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}).done(function(){ArchivePageInit(); /*更新媒体库页面*/OKErrorStreamer("MessageOff","作品信息更新进行中",0);
        OKErrorStreamer("OK","媒体库数据爬取完成",0); }); // *错误回调
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString()+'/persons', function(data){
        for(let MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
          if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
          if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
          if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
        } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}).done(function(){ArchivePageInit(); /*更新媒体库页面OKErrorStreamer("MessageOff","作品信息更新进行中",0);
        OKErrorStreamer("OK","媒体库数据爬取完成",0); */}); // *错误回调
      } else{OKErrorStreamer("MessageOff","作品信息更新进行中",0);OKErrorStreamer("Error","作品信息刮削错误，未更新",0);}
    },2000);
}

//! 媒体库-新增作品模块
function LocalWorkManualAddAndSave(type){
  if(type == 'Add'){
    document.getElementById("ArchivePageContentAddNewBody").innerHTML=""; //清空body
    $("#ArchivePageContentAddNewBody").append( 
      "<div class='ArchiveInputLine' style='top:20%;left:5%;width:40%;height:10%'> <!-- *设置作品bgmID -->"+
      "<input type='text' id='ArchivePageContentAddNewbgmID' autocomplete='off' required />"+ //placeholder='BGMID可以在Bangumi作品页面URL内找到'
      "<div class='line'></div><span>请输入作品的BGMID</span></div>"+
      "<div class='ArchiveInputLine' style='top:20%;left:50%;width:40%;height:10%'> <!-- *设置作品URL -->"+
      "<input type='text' id='ArchivePageContentAddNewURL' autocomplete='off' required />"+   //placeholder='如果作品位置转移，可以在此重设URL'
      "<div class='line'></div><span>请输入作品的URL</span></div>"+
      "<div class='ArchiveInputLine' style='top:40%;left:5%;width:40%;height:10%'> <!-- *设置作品Name -->"+
      "<input type='text' id='ArchivePageContentAddNewName' autocomplete='off' required />"+   //placeholder='作品标题'
      "<div class='line'></div><span>请输入作品的标题</span></div>"+
      "<div class='ArchiveInputLine' style='top:40%;left:50%;width:40%;height:10%'> <!-- *设置作品Eps -->"+
      "<input type='text' id='ArchivePageContentAddNewEps' autocomplete='off' value='12' required />"+   //placeholder='作品剧集长度'
      "<div class='line'></div><span>请输入作品的话数</span></div>"+
      "<div class='ArchiveInputLine' style='top:60%;left:5%;width:40%;height:10%'> <!-- *设置作品Type -->"+
      "<input type='text' id='ArchivePageContentAddNewType' autocomplete='off' value='TV' required />"+   //placeholder='作品是什么类型'
      "<div class='line'></div><span>请输入作品的类别(可选)</span></div>"+
      "<div class='ArchiveInputLine' style='top:60%;left:50%;width:40%;height:10%'> <!-- *设置作品Year -->"+
      "<input type='text' id='ArchivePageContentAddNewYear' autocomplete='off' required />"+   //placeholder='作品年代'
      "<div class='line'></div><span>请输入作品的年份(可选)</span></div>"+
      "<div class='SaverButton' style='top:85%;bottom: 5%;left:40%;width:20%;' onclick='LocalWorkManualAddAndSave(0)'>保存作品</div>"
      );
    document.getElementById('ArchivePageContentAddNew').style.display = "block";
    console.log("OKSet!");
  }
  else {
    console.log('Saving')
    if(document.getElementById('ArchivePageContentAddNewURL').value!='' && document.getElementById('ArchivePageContentAddNewName').value!='' 
          && document.getElementById('ArchivePageContentAddNewbgmID').value!=''&& document.getElementById('ArchivePageContentAddNewType').value!=''){
    var WorkTotalNumberNew = parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))+1
    sysdata.set("Settings.checkboxC.LocalStorageMediaBaseNumber",WorkTotalNumberNew)
    localStorage.setItem("LocalStorageMediaBaseNumber",WorkTotalNumberNew); //存储新的媒体数目
    store.set("WorkSaveNo"+WorkTotalNumberNew+".URL",document.getElementById('ArchivePageContentAddNewURL').value); //媒体路径
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Name",document.getElementById('ArchivePageContentAddNewName').value); //媒体名称
    store.set("WorkSaveNo"+WorkTotalNumberNew+".bgmID",document.getElementById('ArchivePageContentAddNewbgmID').value); //媒体bgmID
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Score",'0.0'); //媒体默认评分
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Type",document.getElementById('ArchivePageContentAddNewType').value); //媒体默认类型
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Year",document.getElementById('ArchivePageContentAddNewYear').value); //媒体默认年代
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Eps",document.getElementById('ArchivePageContentAddNewEps').value); //媒体默认话数
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Protocol",'Unknown'); //媒体默认原案
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Director",'Unknown'); //媒体默认监督
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Corp",'Corp'); //媒体默认制作公司
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Cover",'./assets/banner.jpg'); //媒体默认封面(后期联网更新为base64)
    store.set("WorkSaveNo"+WorkTotalNumberNew+".ExistCondition",'Exist'); //媒体默认状态(默认存在)
    LocalWorkEpsScanModule(WorkTotalNumberNew); //扫描作品EP信息

    $.ajaxSettings.async = false; //关闭异步
    // *扫描作品bgmID获取作品信息
    if(store.get("WorkSaveNo"+WorkTotalNumberNew.toString()+".bgmID") != '0'){
      $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+WorkTotalNumberNew.toString()+".bgmID").toString(), function(data){
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Score",data.rating.score); 
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Year",data.date.substring(0,4));
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Eps",data.eps);
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Name",data.name_cn);
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Type",data.platform); 
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Cover",data.images.large); 
      }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
      $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+WorkTotalNumberNew.toString()+".bgmID").toString()+'/persons', function(data){
      for(var MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
        if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Director",data[MediaBaseElementsGet].name);}
        if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Corp",data[MediaBaseElementsGet].name);}
        if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Protocol",data[MediaBaseElementsGet].name);}
      } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
    } $.ajaxSettings.async = true; //打开异步

    ArchivePageInit(); //更新媒体库页面
    document.getElementById('ArchivePageContentAddNew').style.display = "none";
    OKErrorStreamer('OK','新作品添加完成！',0);
    }
    else {OKErrorStreamer('Error','作品信息不完整！',0);}
  }
}

/* 媒体库详情页面初始化系统 */
function ArchiveMediaDetailsPage(MediaID){
  var bgmID = store.get("WorkSaveNo"+MediaID+".bgmID");
  for (let j = 0; j < 5; j++) {document.getElementsByName('ArchivePageContentDetailsSelfRankBlockStars')[j].className = 'ArchivePageContentDetailsempty-star'} //清空SelfRankBlockStars
  document.getElementById("ArchivePageContentDetailsSelfRankBlockDate").innerHTML="收藏日期：未知"; //清空SelfRankBlockDate
  document.getElementById("ArchivePageContentDetailsSelfRankBlockComment").innerHTML="吐槽：未知"; //清空SelfRankBlockComment
  document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="未评分";//清空SelfRankBlockRates
  document.getElementById("ArchivePageContentDetailsTitleBlock").innerHTML=""; //清空TitleBlock
  document.getElementById("ArchivePageContentDetailsDetailsBlock").innerHTML=""; //清空DetailsBlock
  document.getElementById("ArchivePageContentDetailsEpisodeBlock").innerHTML=""; //清空EpisodeBlock
  document.getElementById("ArchivePageContentDetailsSpecialEpisodeBlock").innerHTML=""; //清空SpecialEpisodeBlock
  document.getElementById("ArchivePageContentDetailsTagBlock").innerHTML=""; //清空TagBlock
  document.getElementById("ArchivePageContentDetailsStaffBlock").innerHTML=""; //清空StaffBlock
  document.getElementById("ArchivePageContentDetailsCharacterBlock").innerHTML=""; //清空CharacterBlock
  document.getElementById("ArchivePageContentDetailsPersonBlock").innerHTML=""; //清空PersonBlock
  document.getElementById("ArchivePageContentDetailsRelativeBlock").innerHTML=""; //清空RelativeBlock
  document.getElementById("ArchivePageContentDetailsEpisodeExtraBlock").innerHTML=""; //清空EpisodeExtraBlock
  //?填充标题&评分条UI
  $("#ArchivePageContentDetailsTitleBlock").append(
    "<div id='ArchivePageContentDetailsCover' class='ArchiveCardHover' style='position:absolute;top:7%;height:86%;left:17%;width:auto;aspect-ratio:3/4;margin:2%' onclick='shell.openExternal(\"https://bgm.tv/subject/"+store.get("WorkSaveNo"+MediaID+".bgmID")+"\");'></div>"+
    "<div id='ArchivePageContentDetailsTitle' class='RecentViewName' style='height:auto;top:15%;font-size:3vw;right:25%;overflow: hidden;display: -webkit-box; text-overflow: ellipsis; -webkit-box-orient: vertical;-webkit-line-clamp: 2;   '>未知作品</div>"+
    "<div id='ArchivePageContentDetailsTitleJp' class='RecentViewName' style='height:auto;top:15%;font-size:1.5vw;right:25%;overflow: hidden;display: -webkit-box; text-overflow: ellipsis; -webkit-box-orient: vertical;-webkit-line-clamp: 2;   '>不明な作品</div>"+
    "<div id='ArchivePageContentDetailsFolderURL' class='ArchivePageButton' style='top:80%;bottom:0%;height:auto;font-size:2.3vmin;-webkit-app-region:unset;border-top-right-radius: 0px; border-bottom-right-radius: 0px;' onclick=\"exec('explorer "+store.get("WorkSaveNo"+MediaID+".URL").replace(/(\\)/g,"\\\\").replace(/(&)/g,"^&")+"');\"><svg t='1665333293331' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3428' height=45% style='margin-right:5px;'><path d='M506 894.2a33 32.9 0 1 0 66 0 33 32.9 0 1 0-66 0Z' fill='#ffffff' p-id='3429'></path><path d='M864 388.7v-4.4c0-70.7-57.3-128-128-128H511.8l-82.5-110.9c-7.4-12.9-18-16.2-27.3-16l-0.1-0.1H192.1c-70.7 0-128 57.3-128 128v542.1c0 70.7 57.3 128 128 128H407v-0.4c18.2 0 33-14.7 33-32.9s-14.8-32.9-33-32.9c-1 0-2.1 0.1-3.1 0.1h-181c-35.3 0-64-28.7-64-64 0-5.5 0.7-10.9 2-16L234 498.9l0.2-0.1c6.7-28.1 31.9-49 62.1-49.1l0.2-0.1h532.2c1.3-0.1 2.5-0.1 3.8-0.1 35.3 0 64 28.7 64 64 0 6.7-1.1 13.3-3 19.4v0.1L821 812.8c-0.1 0.6-0.3 1.1-0.4 1.7l-1.5 5.8-0.5 0.4c-1.5 3.9-3.4 7.5-5.5 11h-1.3c-2.6 4.7-5.8 9.1-9.5 12.9-11.4 10.6-26.7 17.1-43.4 17.1-1.3 0-2.6 0-3.8-0.1h-80.8c-1-0.1-2.1-0.1-3.1-0.1-18.2 0-33 14.7-33 32.9s14.8 32.9 33 32.9v0.2H763l0.5-0.4c59.1-0.2 108.7-40.4 123.2-95l0.2-0.2 67.8-285.5c2.9-10.8 4.5-22.1 4.5-33.8-0.1-59.5-40.5-109.5-95.2-123.9z m-571.5-4.9c-62 0-113.7 44.2-125.5 102.7l-0.5 0.4-38 160.3V257c0-35.3 28.7-64 64-64H383l82.7 111.3c6.6 11.4 19.2 17.2 31.5 15.8h238.5c35.2 0 63.8 28.5 64 63.7H292.5z' fill='#ffffff' p-id='3430'></path></svg>打开文件夹</div>"+
    "<div id='ArchivePageContentDetailsEditor' class='ArchivePageButton' style='top:80%;width:3%;bottom:0%;height:auto;font-size:2.3vmin;-webkit-app-region:unset;border-top-left-radius: 0px; border-bottom-left-radius: 0px;' onclick='ArchiveContentEditer("+MediaID.toString()+");'><svg t='1665333293331' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3428' height=40% style='margin:5px;'><path d='M943.104 216.064q-8.192 9.216-15.36 16.384l-12.288 12.288q-6.144 6.144-11.264 10.24l-138.24-139.264q8.192-8.192 20.48-19.456t20.48-17.408q20.48-16.384 44.032-14.336t37.888 9.216q15.36 8.192 34.304 28.672t29.184 43.008q5.12 14.336 6.656 33.792t-15.872 36.864zM551.936 329.728l158.72-158.72 138.24 138.24q-87.04 87.04-158.72 157.696-30.72 29.696-59.904 58.88t-53.248 52.224-39.424 38.4l-18.432 18.432q-7.168 7.168-16.384 14.336t-20.48 12.288-31.232 12.288-41.472 13.824-40.96 12.288-29.696 6.656q-19.456 2.048-20.992-3.584t1.536-25.088q1.024-10.24 5.12-30.208t8.192-40.448 8.704-38.4 7.68-25.088q5.12-11.264 10.752-19.456t15.872-18.432zM899.072 478.208q21.504 0 40.96 10.24t19.456 41.984l0 232.448q0 28.672-10.752 52.736t-29.184 41.984-41.984 27.648-48.128 9.728l-571.392 0q-24.576 0-48.128-10.752t-41.472-29.184-29.184-43.52-11.264-53.76l0-570.368q0-20.48 11.264-42.496t29.184-39.936 40.448-29.696 45.056-11.776l238.592 0q28.672 0 40.448 20.992t11.776 42.496-11.776 41.472-40.448 19.968l-187.392 0q-21.504 0-34.816 14.848t-13.312 36.352l0 481.28q0 20.48 13.312 34.304t34.816 13.824l474.112 0q21.504 0 36.864-13.824t15.36-34.304l0-190.464q0-14.336 6.656-24.576t16.384-16.384 21.504-8.704 23.04-2.56z' p-id='5923' fill='#ffffff'></path></svg></div>"+
    "<div id='ArchivePageContentDetailsRelavant' class='ArchivePageContentDetailsRelavant'><div id='ArchivePageContentDetailsRelavantCover' style='position:absolute;top:0%;height:100%;width:30%;left: 0%;border-radius:10px;border-top-right-radius: 0px; border-bottom-right-radius: 0px;' ></div>"+
    "<div id='ArchivePageContentDetailsRelavantName' style='width: 60%;overflow: hidden;-webkit-box-orient: vertical;-webkit-line-clamp: 2;display: -webkit-box;position: absolute;right: 5%;margin-top: 5px;text-align:left;font-size:15px'></div></div>"+
    
    //评分系统
    "<div id='ArchivePageContentDetailsRating' class='RecentViewRating' style='padding:0;height:95%'>"+
    "<div id='ArchivePageContentDetailsRatingScore' style='position:relative;right:0%;width:100%;font-size: 8vmin;font-family:bgmUIHeavy;text-align: right;'>"+
    "<div id='ArchivePageContentDetailsRatingRank' class='boxBlank' style='border: 1px dashed rgb(155, 155, 155);background-color: rgba(0, 0, 0, 0.292);top:15%;font-size: 1.9vmin;font-family:bgmUI;height: 25%;width:32%;left:4%;backdrop-filter: blur(10px);box-shadow:none;display: flex;justify-content: center;align-items: center;'>NO.Null</div>"+
    "<div id='ArchivePageContentDetailsRatingPos' class='boxBlank' style='border: 1px dashed rgb(155, 155, 155);background-color: rgba(0, 0, 0, 0.292);bottom:20%;font-size: 2vmin;font-family:bgmUI;height: 25%;width:32%;left:4%;backdrop-filter: blur(10px);box-shadow:none;display: flex;justify-content: center;align-items: center;'>NoRank</div>"+
    "</div>"+"<div style='position:relative;height:40%;width:100%;bottom:0%;margin-top:14%'>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo10' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>10</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo9' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>9</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo8' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>8</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo7' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>7</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo6' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>6</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo5' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>5</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo4' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>4</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo3' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>3</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo2' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>2</div></div>"+
    "<div class='LoadScoreBar'><div class='ScoreBar' id='ArchivePageContentDetailsScoreBarNo1' style='height:30%'></div><div style='position:absolute;bottom: -25%;font-size: 2vmin;text-align: center;width: 100%;'>1</div></div>"+
    "</div><div id='ArchivePageContentDetailsScoreRatePeople' style='position:relative;margin-top:-1%;width:95%;height:10%;left:10px;text-align:none;color:rgb(172, 172, 172);font-size:2.1vmin'></div></div>"
  );
  //?填充评分
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID.toString(), function(data){
    var ArchivePageContentDetailsRatingScore =document.createTextNode(data.rating.score.toFixed(1));
    document.getElementById("ArchivePageContentDetailsRatingScore").appendChild(ArchivePageContentDetailsRatingScore);
    $("#ArchivePageContentDetailsRatingScore").append("<div style='font-size:2vmin;margin-top: -10px;font-weight: normal;color: rgb(172, 172, 172);text-decoration: underline;font-family: bgmUI;' onclick=\"window.open('https://netaba.re/subject/"+bgmID.toString()+"')\">查看趋势</div>");
    $("#ArchivePageContentDetailsRatingScore").append("<div style='font-size:2vmin;margin-top: -3vmin;margin-right:8.5vmin;font-weight: normal;color: rgb(172, 172, 172);text-decoration: underline;font-family: bgmUI;' onclick=\"window.open('https://bgm.tv/subject/"+bgmID.toString()+"/stats')\">查看透视</div>");
    if(!sysdata.get("Settings.checkboxB.LocalStorageMediaShowSciMark")){document.getElementById("ArchivePageContentDetailsRatingRank").innerText="NO."+data.rating.rank;} //判断是否启用科学排名，关闭源站排名
    // 作品等级判定
    if(data.rating.score > 9.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="超神作";}
      else if(data.rating.score > 8.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="神作";}
      else if(data.rating.score > 7.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="力荐";}
      else if(data.rating.score > 6.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="推荐";}
      else if(data.rating.score > 5.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="还行";}
      else if(data.rating.score > 4.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="不过不失";}
      else if(data.rating.score > 3.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="较差";}
      else if(data.rating.score > 2.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="差";}
      else if(data.rating.score > 2.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="很差";}
      else if(data.rating.score >= 1) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="不忍直视";}
      else {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="暂无评分";}
    // 作品等级判定OVER
    // 填充一分一段表，打分信息
    var ScoreAverage = 0;var ScoreSD = 0;
    for(let Tempi = 1;Tempi<=10;Tempi++){
      document.getElementById('ArchivePageContentDetailsScoreBarNo'+Tempi.toString()).style.height=((data.rating.count[Tempi]/data.rating.total)*100).toString()+'%'
      ScoreAverage+=Tempi*data.rating.count[Tempi];
    }document.getElementById('ArchivePageContentDetailsScoreRatePeople').innerText=data.collection.wish+'想看/'+data.collection.collect+'看过/'+data.collection.doing+'在看/'+data.collection.on_hold+'搁置/'+data.collection.dropped+'抛弃'
    
    //计算标准差
    if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowStd")){ //判断是否显示标准差
    ScoreAverage/=data.rating.total;
    for(let Tempi = 1;Tempi<=10;Tempi++){ScoreSD+=data.rating.count[Tempi]*(Tempi-ScoreAverage)*(Tempi-ScoreAverage);}
    ScoreSD/=data.rating.total;ScoreSD=Math.sqrt(ScoreSD);
    $("#ArchivePageContentDetailsRatingScore").append("<div style='font-size:2vmin;margin-top: -0vmin;margin-right:0vmin;font-weight: normal;color: rgb(172, 172, 172);font-family: bgmUI;')\">标准差:"+ScoreSD.toFixed(2)+"</div>");
    //标准差过高提醒
    if(ScoreSD>2){document.getElementById('ArchivePageContentDetailsRatingScore').style.color='rgb(255 73 91)';document.getElementById('ArchivePageContentDetailsRating').title='注意：此作品的评分参考度低'}
    }
    //错误回调
    }).done(function() { OKErrorStreamer("OK","加载作品信息完成",0); }).fail(function() { document.getElementById("ArchivePageContentDetailsRatingScore").appendChild(document.createTextNode('0.0'));OKErrorStreamer("Error","无法连接Bangumi",0); });
    
  //?填充个人评分信息
  if(sysdata.get('UserData.UserToken')&&sysdata.get('UserData.UserToken')!=""){
  $("#ArchivePageContentDetailsSelfRankBlockState").attr('onchange','ArchiveMediaDetailsUserFavouriteUpdate('+bgmID+');');
  $.ajax({ //获取用户信息
    url: "https://api.bgm.tv/v0/me",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
    success: function (data) {
        $.ajax({ //获取收藏信息
          url: "https://api.bgm.tv/v0/users/"+data.username+"/collections/"+bgmID,type: 'GET',dataType: "json",headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
          success: function (data2) {
            document.getElementById('ArchivePageContentDetailsSelfRankBlockDate').innerHTML="收藏日期："+data2.updated_at.substring(0,10);
            document.getElementById('ArchivePageContentDetailsSelfRankBlockComment').innerHTML="吐槽："+data2.comment;
            document.getElementById('ArchivePageContentDetailsSelfRankBlockComment').title="吐槽："+data2.comment;
            let SelfScoreVal=data2.rate; let index = parseInt(SelfScoreVal / 2);let spans = document.getElementsByName('ArchivePageContentDetailsSelfRankBlockStars');
            for (let j = index; j < 5; j++) {spans[j].className = 'ArchivePageContentDetailsempty-star'}
            for (let k = 0; k < index; k++) {spans[k].className = 'ArchivePageContentDetailsfull-star'}
            if(index * 2 !== SelfScoreVal) {spans[index].className = 'ArchivePageContentDetailshalf-star'}

            if(SelfScoreVal > 9.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="超神作";}
            else if(SelfScoreVal > 8.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="神作";}
            else if(SelfScoreVal > 7.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="力荐";}
            else if(SelfScoreVal > 6.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="推荐";}
            else if(SelfScoreVal > 5.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="还行";}
            else if(SelfScoreVal > 4.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="不过不失";}
            else if(SelfScoreVal > 3.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="较差";}
            else if(SelfScoreVal > 2.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="差";}
            else if(SelfScoreVal > 2.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="很差";}
            else if(SelfScoreVal >= 1) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="不忍直视";}
            switch (data2.type){
              case 1: document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value='wish';break;
              case 2: document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value='collect';break;
              case 3: document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value='do';break;
              case 4: document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value='on_hold';break;
              case 5: document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value='dropped';break;
            }
          }, 
          error: function () {document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value='uncollect';}
        });
      }
    });
  } else{OKErrorStreamer("Error","您还未登录",0);}

  //?播放进度同步至本地
  if(sysdata.get("UserData.userpageProgressSyncOptions")=='Cloud'||sysdata.get("UserData.userpageProgressSyncOptions")=='Mix'){
    $.ajax({ //获取用户信息
      url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID.toString()+"/episodes?offset=0&episode_type=0",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
      success:function(data){let SyncEPNum=null;  if (parseInt(store.get("WorkSaveNo"+MediaID+".EPTrueNum"))>parseInt(store.get("WorkSaveNo"+MediaID+".Eps"))) {SyncEPNum = store.get("WorkSaveNo"+MediaID+".Eps");} 
      else {SyncEPNum = store.get("WorkSaveNo"+MediaID+".EPTrueNum");}
      console.log("总数"+SyncEPNum)
      if(data.title!='Not Found'){ //如果未收藏，不继续尝试同步
      for(let tempi = 1;tempi<=SyncEPNum;tempi++){
        if(data.data[tempi-1].type==2){
          store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+tempi+'.Condition',"Watched")
          document.getElementById('ArchivePageContentDetailsEpisodeNo'+tempi).style.boxShadow='0px 0px 0px 2px rgb(240 145 153)';}
        if(data.data[tempi-1].type==3&&sysdata.get("UserData.userpageProgressSyncOptions")=='Cloud'){
          store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+tempi+'.Condition',"Unwatched")}
      }
      if(sysdata.get("UserData.userpageProgressSyncOptions")=='Mix'){
        let SyncContentWatched = null; //Mix同步观看的动画剧集
        for(let tempi = 1;tempi<=SyncEPNum;tempi++)
          {if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+tempi+'.Condition')=="Watched"&&data.data[tempi-1].type!=2)
          {SyncContentWatched=SyncContentWatched+data.data[tempi-1].episode.id+','}}
        if(SyncContentWatched){$.ajax({
          url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID+"/episodes",
          type: 'PATCH',contentType: "application/json",dataType: "json",
          headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},
          data: '{"episode_id": ['+SyncContentWatched.slice(0, -1)+'],"type":2}',timeout : 2000,
          success: function () {;}, error: function () {;}
        })}
      }
      ArchivePageMediaProgressCalc(MediaID);OKErrorStreamer("OK","加载作品信息完成,与云端同步成功",0);
      }}
    });
  }
  //?播放进度同步至云端
  if(sysdata.get("UserData.userpageProgressSyncOptions")=='Local'){
    let SyncEPNum=null;  if (store.get("WorkSaveNo"+MediaID+".EPTrueNum")>store.get("WorkSaveNo"+MediaID+".EPs")) SyncEPNum = store.get("WorkSaveNo"+MediaID+".EPs"); else SyncEPNum = store.get("WorkSaveNo"+MediaID+".EPTrueNum");
    $.ajax({
      url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID.toString()+"/episodes?offset=0&episode_type=0",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""},timeout : 2000,
      success:function(data){
        if(data.title!='Not Found'){ //如果未收藏，不继续尝试同步
        let SyncContent = null; //同步已看过章节
        for(let tempi = 1;tempi<=SyncEPNum;tempi++){
          if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+tempi+'.Condition')=="Watched"&&data.data[tempi-1].type!=2)
          {SyncContent=SyncContent+data.data[tempi-1].episode.id+','}}
        if(SyncContent){$.ajax({
          url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID+"/episodes",
          type: 'PATCH',contentType: "application/json",dataType: "json",
          headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},
          data: '{"episode_id": ['+SyncContent.slice(0, -1)+'],"type": 2}',timeout : 2000,
          success: function () {;}, error: function () {;}
        })}
        let SyncContentUnwatched = null; //同步未观看的动画剧集
        for(let tempi = 1;tempi<=SyncEPNum;tempi++)
          {if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+tempi+'.Condition')=="Unwatched"&&data.data[tempi-1].type!=0)
          {SyncContentUnwatched=SyncContentUnwatched+data.data[tempi-1].episode.id+','}}
        if(SyncContentUnwatched){$.ajax({
          url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID+"/episodes",
          type: 'PATCH',contentType: "application/json",dataType: "json",
          headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},
          data: '{"episode_id": ['+SyncContentUnwatched.slice(0, -1)+'],"type":0}',timeout : 2000,
          success: function () {OKErrorStreamer("OK","加载作品信息完成,向云端同步成功",0);}, error: function () {;}
        })}
        }}
    });
  }

  //?填充EP选集列表
  for(let TempCounter = 1;TempCounter<=store.get("WorkSaveNo"+MediaID+".EPTrueNum");TempCounter++){
  $("#ArchivePageContentDetailsEpisodeBlock").append( "<div id='ArchivePageContentDetailsEpisodeNo"+TempCounter+"' class='ArchiveCardHover' style='width:100%;height:100%;padding:0px;font-size:3vmin;text-align:center;display:flex;justify-content:center;align-items:center;box-shadow:0px 0px 0px 2px #ffffff4a;background-color:rgb(0,0,0,0.05);/*backdrop-filter: blur(30px)*/' onclick='ArchiveMediaDetailsEpInfoCard(event,"+MediaID+","+TempCounter+",\"EP\");'>"+"EP "+TempCounter+"</div>" );
  //width:12.1%;height:4vw;padding:2px;
  //检测是否已播放过
  if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition')=='Watched'){document.getElementById('ArchivePageContentDetailsEpisodeNo'+TempCounter).style.boxShadow='0px 0px 0px 2px rgb(240 145 153)'}
  } 
  //?填充SP选集列表
  for(let TempCounter = 1;TempCounter<=store.get("WorkSaveNo"+MediaID+".SPTrueNum");TempCounter++){
    $("#ArchivePageContentDetailsSpecialEpisodeBlock").append( "<div id='ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"' class='ArchiveCardHover' style='width:100%;height:100%;padding:0px;font-size:3vmin;text-align:center;display:flex;justify-content:center;align-items:center;box-shadow:0px 0px 0px 2px #ffffff4a;background-color:#ffffff0a;backdrop-filter: blur(30px)' onclick='ArchiveMediaDetailsEpInfoCard(event,"+MediaID+","+TempCounter+",\"SP\");'>"+"SP "+TempCounter+"</div>" );
    //width:12.1%;height:4vw;padding:2px;
    //检测是否已播放过
    if(store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+'.Condition')=='Watched'){document.getElementById('ArchivePageContentDetailsSpecialEpisodeNo'+TempCounter).style.boxShadow='0px 0px 0px 2px rgb(240 145 153)'}
    } 

  //?填充Tag,中英文作品名，作品详情
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID, function(data){
    document.getElementById("ArchivePageContentDetailsDetailsBlock").innerText=data.summary;
    document.getElementById("ArchivePageContentDetailsTitleJp").innerText=data.name;

    //填充Tag
    for(let Tempj = 0;Tempj!=data.tags.length;Tempj++)
    $("#ArchivePageContentDetailsTagBlock").append("<div class='ArchivePageContentTag' onclick='window.open(\"https://bgm.tv/anime/tag/"+data.tags[Tempj].name+"\")'>"+data.tags[Tempj].name+"</div>");

    //填充作品详情
    for(var Tempj = 0;Tempj!=data.infobox.length;Tempj++){
    if(data.infobox[Tempj].key=='别名'){
      $("#ArchivePageContentDetailsStaffBlock").append("<div id='ArchivePageContentDetailsStaffNickName'style='width:100%;margin:5px;margin-top:10px'>"+data.infobox[Tempj].key+': </div>');
      for(let Tempk = 0;Tempk!=data.infobox[Tempj].value.length;Tempk++)$("#ArchivePageContentDetailsStaffNickName").append(data.infobox[Tempj].value[Tempk].v+"&nbsp;&nbsp;");}
    else $("#ArchivePageContentDetailsStaffBlock").append("<div style='width:100%;margin:5px;margin-top:10px'>"+data.infobox[Tempj].key+': '+data.infobox[Tempj].value+"</div>");}

  }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';})
  .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';});

  //?填充相关作品
  if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowRelative")){ //判断是否显示相关作品
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID+"/subjects", function(data){
    for(let Tempj = 0;Tempj!=data.length;Tempj++){
      if(data[Tempj].type==2){document.getElementById("ArchivePageContentDetailsRelavant").style.display='block';
      document.getElementById("ArchivePageContentDetailsRelavant").title=data[Tempj].name_cn;
      $("#ArchivePageContentDetailsRelavant").attr('onclick','window.open("https://bgm.tv/subject/'+data[Tempj].id+'")');
      document.getElementById("ArchivePageContentDetailsRelavantCover").style.background="url('"+data[Tempj].images.small+"') no-repeat center";
      document.getElementById("ArchivePageContentDetailsRelavantCover").style.backgroundSize="cover";
      document.getElementById("ArchivePageContentDetailsRelavantName").innerHTML=data[Tempj].relation+"<br/>"+data[Tempj].name_cn;
      for(let Temp = 1;Temp<=sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");Temp++){
        if(store.get("WorkSaveNo"+Temp+".ExistCondition")=='Exist'&&store.get("WorkSaveNo"+Temp+".bgmID")==data[Tempj].id)
        {$("#ArchivePageContentDetailsRelavant").attr('onclick','ArchiveMediaDetailsPage('+Temp+')');break;}
      }
  }}})
  }

  //?填充作品角色
  if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowCharacter")){ //判断是否显示角色信息
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID+"/characters", function(data){
    var Chara_Data = data;
    function ArchiveMediaDetailsPageCharacterFiller(Tempj){
      $.getJSON("https://api.bgm.tv/v0/characters/"+data[Tempj].id, function(data2){
        if(data2.infobox[0]&&data2.infobox[0].key=='简体中文名') var Chara_Data_NameCN = data2.infobox[0].value;else var Chara_Data_NameCN = Chara_Data[Tempj].name;
        if(Chara_Data[Tempj].actors[0]!=null) var Chara_Data_CV = ", CV: "+Chara_Data[Tempj].actors[0].name;else var Chara_Data_CV = ", CV: "+'未知';
        if(!sysdata.get("Settings.checkboxB.LocalStorageMediaShowCharacterCV")){Chara_Data_CV = ''} //判断是否显示CV
        document.getElementsByName('ArchiveMediaDetailsPageCharacterCard')[Tempj].innerHTML=( //"<div class='ArchiveCardCharacterHover' onclick='window.open(\"https://bgm.tv/character/"+Chara_Data[Tempj].id+"\");'>"+ //id='ArchivePageContentDetailsCharacterNo"+Tempj+"'
        "<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+Chara_Data[Tempj].images.medium+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
        "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;white-space:nowrap;font-size:1.5vw'><b>"+Chara_Data[Tempj].name+"<br/>("+Chara_Data_NameCN+")</b><br/>"+Chara_Data[Tempj].relation+Chara_Data_CV+"</div>");
        $(document.getElementsByName('ArchiveMediaDetailsPageCharacterCard')[Tempj]).attr('onclick','window.open(\"https://bgm.tv/character/'+Chara_Data[Tempj].id+'\");');
      }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+20).toString()+'%';});
    }
    for(let Tempj=0;Tempj!=data.length;Tempj++){
      $("#ArchivePageContentDetailsCharacterBlock").append( "<div class='ArchiveCardCharacterHover' name='ArchiveMediaDetailsPageCharacterCard'></div>");
      ArchiveMediaDetailsPageCharacterFiller(Tempj);}

  }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';})
  .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';});
  }else {$("#ArchivePageContentDetailsCharacterBlock").append("<div style='position:relative;margin:auto;margin-bottom:5%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3.5vmin'>角色信息已隐藏</div>")}

  //?填充作品相关条目
  if(1){ //判断是否显示相关条目信息
    $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID+"/subjects", function(data){
      var Chara_Data = data; function ArchiveMediaDetailsPageRelativeFiller(Tempj){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+data[Tempj].id, function(data2){
          if(data2.name_cn!='') var Chara_Data_NameCN = data2.name_cn;else var Chara_Data_NameCN = Chara_Data[Tempj].name;
          document.getElementsByName('ArchivePageContentDetailsRelativeBlockCard')[Tempj].innerHTML=( "<div id='ArchivePageContentDetailsRelativeBlockImg"+Tempj+"' style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+Chara_Data[Tempj].images.medium+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
          "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;white-space:nowrap;font-size:1.5vw'><b>"+Chara_Data[Tempj].name+"<br/>("+Chara_Data_NameCN+")</b><br/>"+Chara_Data[Tempj].relation+"</div>")
          $(document.getElementsByName('ArchivePageContentDetailsRelativeBlockCard')[Tempj]).attr('onclick','window.open(\"https://bgm.tv/subject/'+Chara_Data[Tempj].id+'\");');
          switch(Chara_Data[Tempj].relation){
            case '原声集':case '片头曲':case '片尾曲':case '角色歌':case '广播剧':case '插入歌':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;backdrop-filter: blur(30px);"><svg t="1674916796215" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11808" style="height: 75%;"><path d="M405.333333 704m-192 0a192 192 0 1 0 384 0 192 192 0 1 0-384 0Z" fill="#e6e6e6" p-id="11809"></path><path d="M512 128v576h85.333333V298.666667l234.666667 64v-149.333334z" fill="#e6e6e6" p-id="11810"></path></svg></div>');break;}
            case '书籍':case '单行本':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;backdrop-filter: blur(30px);"><svg t="1674916763560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9938" style="height: 65%;"><path d="M896 128v832H224a96 96 0 1 1 0-192h608V0H192C121.6 0 64 57.6 64 128v768c0 70.4 57.6 128 128 128h768V128h-64z" p-id="9939" fill="#e6e6e6"></path><path d="M224.064 832H224a32 32 0 0 0 0 64h607.968v-64H224.064z" p-id="9940" fill="#e6e6e6"></path></svg></div>');break;}
            case '画集':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;backdrop-filter: blur(30px);"><svg t="1674917033209" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15205" style="height: 65%;"><path d="M725.333333 938.666667H170.666667c-46.933333 0-85.333333-38.4-85.333334-85.333334V298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667v512c0 21.333333 17.066667 42.666667 42.666666 42.666666h512c21.333333 0 42.666667 17.066667 42.666667 38.4v4.266667c0 21.333333-17.066667 42.666667-42.666667 42.666667z m-366.933333-170.666667C302.933333 768 256 721.066667 256 665.6V187.733333C256 132.266667 302.933333 85.333333 358.4 85.333333h477.866667C891.733333 85.333333 938.666667 132.266667 938.666667 187.733333v477.866667c0 55.466667-46.933333 102.4-102.4 102.4H358.4z m81.066667-85.333333H810.666667c21.333333-4.266667 38.4-21.333333 42.666666-42.666667v-128l-119.466666-106.666667-294.4 277.333334zM384 298.666667c0 46.933333 38.4 85.333333 85.333333 85.333333s85.333333-38.4 85.333334-85.333333-38.4-85.333333-85.333334-85.333334-85.333333 38.4-85.333333 85.333334z" p-id="15206" fill="#e6e6e6"></path></svg></div>');break;}  
          }
        }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+20).toString()+'%';});
      }
      for(let Tempj=0;Tempj!=data.length;Tempj++){$("#ArchivePageContentDetailsRelativeBlock").append( "<div class='ArchiveCardCharacterHover' name='ArchivePageContentDetailsRelativeBlockCard'></div>");ArchiveMediaDetailsPageRelativeFiller(Tempj)}
    }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';})
    .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';});
    } else {$("#ArchivePageContentDetailsRelativeBlock").append("<div style='position:relative;margin:auto;margin-bottom:5%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3.5vmin'>相关条目信息已隐藏</div>")}

  //?填充作品制作人员
  if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowStaff")){ //判断是否显示制作人员信息
    $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID+"/persons", function(data){
      var Chara_Data = data; function ArchiveMediaDetailsPagePersonFiller(Tempj){
        $.getJSON("https://api.bgm.tv/v0/persons/"+data[Tempj].id, function(data2){
          if(Chara_Data[Tempj].images.medium!=''){
          if(data2.infobox!=''&&data2.infobox[0].key=='简体中文名') var Chara_Data_NameCN = data2.infobox[0].value;else var Chara_Data_NameCN = Chara_Data[Tempj].name;
          $("#ArchivePageContentDetailsPersonBlock").append( "<div class='ArchiveCardCharacterHover' onclick='window.open(\"https://bgm.tv/person/"+Chara_Data[Tempj].id+"\");'>"+
          "<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+Chara_Data[Tempj].images.medium+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
          "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;white-space:nowrap;font-size:1.5vw'><b>"+Chara_Data[Tempj].name+"<br/>("+Chara_Data_NameCN+")</b><br/>"+Chara_Data[Tempj].relation+"</div></div>")
        }}).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+20).toString()+'%';});
      }
      for(let Tempj=0;Tempj!=data.length;Tempj++){ArchiveMediaDetailsPagePersonFiller(Tempj)}
    }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';})
    .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=((document.getElementById('ArchivePageContentLastCard').offsetTop/$(window).height())*100+10).toString()+'%';});
    } else {$("#ArchivePageContentDetailsPersonBlock").append("<div style='position:relative;margin:auto;margin-bottom:5%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3.5vmin'>制作人员信息已隐藏</div>")}

  //?填充科学排名
  if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowSciMark")){ //判断是否显示科学排名
    document.getElementById("ArchivePageContentDetailsRatingRank").innerText="计算中...";
    $.getJSON("https://raw.githubusercontent.com/NeutrinoLiu/sciRanking_simple/master/shrank.json", function(data){
      for(let Temps = 0;Temps!=data.length;Temps++){if(data[Temps].i==bgmID) {document.getElementById("ArchivePageContentDetailsRatingRank").innerText="科排:"+data[Temps].r;break;}}
    }).fail(function() {document.getElementById("ArchivePageContentDetailsRatingRank").innerText="获取失败";})}
  
  //?扫描特典
  ArchiveMediaBonusScan(store.get("WorkSaveNo"+MediaID+".URL"),MediaID);

  //页面内容填充
  console.log(MediaID);
  document.getElementById('ArchivePageContentDetailsCover').style.background = "block";
  document.getElementById("ArchivePageContentDetailsCover").style.background="url('"+store.get("WorkSaveNo"+MediaID+".Cover")+"') no-repeat center";
  document.getElementById("ArchivePageContentDetailsCover").style.backgroundSize="cover"; // 加载封面
  document.getElementById("ArchivePageContentDetailsTitle").innerHTML=store.get("WorkSaveNo"+MediaID+".Name"); // 加载标题
  //页面可见,背景初始化
  document.getElementById('ArchivePageContentDetails').style.marginLeft = '0%';
  document.getElementById('ArchivePageContentDetails').style.display = 'block'; // 页面可见化
  document.getElementById("ArchivePageContentDetailsBlur").style.background="url('"+store.get("WorkSaveNo"+MediaID+".Cover")+"') no-repeat center";
  document.getElementById("ArchivePageContentDetailsBlur").style.backgroundSize="cover";
  document.getElementById("ArchivePageContentDetailsBlur").style.filter="blur(40px) brightness(40%)";   // 渲染模糊背景
  document.getElementById("ArchivePageContentDetails").scrollTo(0,0); //页面回顶部
  //贴边控制
  document.getElementById("ArchivePageContentDetailsTitle").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制标题贴边
  document.getElementById("ArchivePageContentDetailsTitleJp").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制日文标题贴左边
  document.getElementById("ArchivePageContentDetailsTitleJp").style.top=(22+(document.getElementById("ArchivePageContentDetailsTitle").getBoundingClientRect().height)*2/($(window).height())*100).toString()+"%"; // 控制日文标题贴上边
  document.getElementById("ArchivePageContentDetailsFolderURL").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制打开文件夹按钮贴左边
  document.getElementById("ArchivePageContentDetailsEditor").style.left=(34+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品编辑按钮贴左边
  //返回按钮显示
  document.getElementById('GoBackPage').style.display = 'block';
  setTimeout(function() {document.getElementById('GoBackPage').style.height = '45px';},100); // 返回按钮可见化

  //显示页尾一言
  $.getJSON("https://v1.hitokoto.cn/?c=a", function(data3){
    document.getElementById('ArchivePageContentLastCardHitokoto').innerText='『'+data3.hitokoto+'』';
    document.getElementById('ArchivePageContentLastCardHitokotoFrom').innerText='——'+data3.from})
  
    if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowTranslation")){ //判断是否显示翻译按钮
    document.getElementById('ArchivePageContentDetailsTranslate').style.display='block'}
}

//! 媒体库-作品详情页章节选择弹窗
function ArchiveMediaDetailsEpInfoCard(event,MediaID,TempCounter,Type){
  var ev = event || window.event;
  var scrollY = document.getElementById('ArchivePageContentDetails').scrollTop;
  document.getElementById('RecentViewEpisodePlayCard').style.left=((ev.clientX-130)/($(window).width())*100)+'%'
  document.getElementById('RecentViewEpisodePlayCard').style.top=(((ev.clientY + scrollY)-280))+'px'
  document.getElementById('RecentViewEpisodePlayCard').style.display='block'
  document.getElementById('RecentViewEpisodePlayCardBack').style.display='block'
  var bgmID = store.get("WorkSaveNo"+MediaID+".bgmID");

  if(Type == 'EP'){
  var bgmEP = TempCounter; //EP章节编号，从1开始
  // *EP信息获取
  $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
    for(var EPTemper=0;EPTemper!=data1.data.length;EPTemper++){
      if(data1.data[EPTemper].hasOwnProperty("ep")&&data1.data[EPTemper].ep==bgmEP) 
      {$.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[EPTemper].id, function(data2){
        document.getElementById("RecentViewPlayEPInfo").innerText="ep"+data2.ep+": "+data2.name;document.getElementById("RecentViewPlayEPInfo").title="ep"+data2.ep+": "+data2.name;
        document.getElementById("RecentViewPlayEPInfoCN").innerText="中文标题: "+data2.name_cn;document.getElementById("RecentViewPlayEPInfoCN").title="中文标题: "+data2.name_cn;
        document.getElementById("RecentViewPlayEPInfoLength").innerText="时长: "+data2.duration;
        $("#RecentViewPlayEPInfoDiscuss").attr('onclick','window.open("https://bgm.tv/ep/'+data2.id+'")');
        document.getElementById("RecentViewPlayEPInfoDiscuss").innerText="讨论: "+data2.comment+"条";
      }).fail(function() {document.getElementById("RecentViewPlayEPInfo").innerText="ep"+bgmEP});break;}
      else{document.getElementById("RecentViewPlayEPInfo").innerText="ep"+bgmEP;}
    }}).fail(function() { OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById("RecentViewPlayEPInfo").innerText="ep"+bgmEP;document.getElementById("RecentViewPlayEPInfoCN").innerText="中文标题: 未知";document.getElementById("RecentViewPlayEPInfoLength").innerText="时长: 未知"}); // *错误回调
  document.getElementById('RecentViewEpisodePlayCard').innerHTML="<div id='RecentViewEpisodePlayCardEpURL' style='left: 10px;right: 10px;top: 85px;width: auto;height: 25px;overflow: hidden;position: absolute;display: inline-block;white-space: nowrap;'><marquee style='/*animation: 8s wordsLoop linear infinite normal;*/'>"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".URL")+"</marquee></div>"+
  "<div style='left: 12px;top: 121px;position:absolute'>设置状态</div><div id='RecentViewEpisodePlayCardProgressWatched' class='RecentViewEpisodePlayCardProgressBtn' style='left:10px;border-top-right-radius: 0;border-bottom-right-radius: 0px;' onclick='store.set(\"WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".Condition\",\"Watched\");"+
  /*点击标注看过*/"document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\"rgb(240 145 153)\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"#000\";document.getElementById(\"ArchivePageContentDetailsEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 2px rgb(240 145 153)\";ArchivePageMediaProgressCalc("+MediaID+");ArchiveMediaDetailsEpisodeUserUpdate("+bgmID+","+bgmEP+","+(bgmEP+1)+",2);'>看过</div>"+
  /*点击标注看到此ep*/"<div id='RecentViewEpisodePlayCardProgressWatchedTill' class='RecentViewEpisodePlayCardProgressBtn' style='left: 64px;border-radius: 0px;border-left-width:0px;border-right-width:0px' onclick='for(var Tempj=1;Tempj<="+TempCounter+";Tempj++)"+
  "{store.set(\"WorkSaveNo"+MediaID+".EPDetails.EP\"+Tempj+\".Condition\",\"Watched\");document.getElementById(\"ArchivePageContentDetailsEpisodeNo\"+Tempj).style.boxShadow=\"0px 0px 0px 2px rgb(240 145 153)\"}"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatchedTill\").style.backgroundColor=\"#4897ff\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatchedTill\").style.color=\"#000\";ArchivePageMediaProgressCalc("+MediaID+");ArchiveMediaDetailsEpisodeUserUpdate("+bgmID+",1,"+(bgmEP+1)+",2);'>看到</div>"+
  /*点击撤销观看此ep*/"<div class='RecentViewEpisodePlayCardProgressBtn' style='left: 114px;border-top-left-radius: 0;border-bottom-left-radius: 0;' onclick='store.set(\"WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".Condition\",\"Unwatched\");"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\"#00000055\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"rgb(172, 172, 172)\";document.getElementById(\"ArchivePageContentDetailsEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 2px #ffffff4a\";ArchivePageMediaProgressCalc("+MediaID+");ArchiveMediaDetailsEpisodeUserUpdate("+bgmID+","+bgmEP+","+(bgmEP+1)+",0);'>撤销</div>"+
  
  "<div class='RecentViewEpisodePlayCardPlay' style='right:10px;top:122px;width:28%;height:28%;border:0px solid' onclick='ArchiveMediaDetailsEpInfoPlayer("+MediaID+","+TempCounter+",\"EP\");'>"+
  "<div style='width: 80%;height: 100%;left:10%;position: absolute;background:url(./assets/play.svg) no-repeat center;background-size: contain;'></div>"+
  /*分割线*/"<div class='rolledEpisodePlayCard'></div></div><div style='position:absolute;left:10px;right:10px;height:2px;top:113px;border-radius:5px;background:#ffffff1f'></div>"+
  "<div id='RecentViewPlayEPInfo' style='position:absolute;left:15px;right:15px;top:10px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoCN' style='position:absolute;left:15px;right:15px;top:35px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoLength' style='position:absolute;left:15px;right:15px;top:60px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoDiscuss' style='color:rgb(240, 145, 153);position:absolute;left:15px;right:15px;bottom:10px;top:195px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"
  //检测看过，自动高亮
  if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".Condition")=='Watched'){document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.backgroundColor="rgb(240 145 153)";document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.color="#000"}
  }
  if(Type == 'SP'){
  var bgmSP = TempCounter;
  // *SP信息获取
  $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
    for(var SPTemper=0;SPTemper!=data1.data.length;SPTemper++){
      if(data1.data[SPTemper].type=='1'&&data1.data[SPTemper].sort==bgmSP) {
        
        $.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[SPTemper].id, function(data2){
        document.getElementById("RecentViewPlayEPInfo").innerText="sp"+data2.type+": "+data2.name;document.getElementById("RecentViewPlayEPInfo").title="sp"+data2.type+": "+data2.name;
        document.getElementById("RecentViewPlayEPInfoCN").innerText="中文标题: "+data2.name_cn;document.getElementById("RecentViewPlayEPInfoCN").title="中文标题: "+data2.name_cn;
        document.getElementById("RecentViewPlayEPInfoLength").innerText="时长: "+data2.duration;
        $("#RecentViewPlayEPInfoDiscuss").attr('onclick','window.open("https://bgm.tv/ep/'+data2.id+'")');
        document.getElementById("RecentViewPlayEPInfoDiscuss").innerText="讨论: "+data2.comment+"条";
      }).fail(function() {document.getElementById("RecentViewPlayEPInfo").innerText="sp"+bgmSP});break;}
      
      else{document.getElementById("RecentViewPlayEPInfo").innerText="sp"+bgmSP;}
    }}).fail(function() { OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById("RecentViewPlayEPInfo").innerText="sp"+bgmSP;document.getElementById("RecentViewPlayEPInfoCN").innerText="中文标题: 未知";document.getElementById("RecentViewPlayEPInfoLength").innerText="时长: 未知"}); // *错误回调
  
    document.getElementById('RecentViewEpisodePlayCard').innerHTML="<div id='RecentViewEpisodePlayCardEpURL' style='left: 10px;right: 10px;top: 85px;width: auto;height: 25px;overflow: hidden;position: absolute;display: inline-block;white-space: nowrap;'><marquee style='/*animation: 8s wordsLoop linear infinite normal;*/'>"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".URL")+"</marquee></div>"+
  "<div style='left: 12px;top: 121px;position:absolute'>设置状态</div><div id='RecentViewEpisodePlayCardProgressWatched' class='RecentViewEpisodePlayCardProgressBtn' style='left:10px;border-top-right-radius: 0;border-bottom-right-radius: 0px;' onclick='store.set(\"WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".Condition\",\"Watched\");"+
  /*点击标注看过*/"document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\"rgb(240 145 153)\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"#000\";document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 2px rgb(240 145 153)\";'>看过</div>"+
  /*点击标注看到此ep*/"<div id='RecentViewEpisodePlayCardProgressWatchedTill' class='RecentViewEpisodePlayCardProgressBtn' style='left: 64px;border-radius: 0px;border-left-width:0px;border-right-width:0px' onclick='for(var Tempj=1;Tempj<="+TempCounter+";Tempj++)"+
  "{store.set(\"WorkSaveNo"+MediaID+".SPDetails.SP\"+Tempj+\".Condition\",\"Watched\");document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo\"+Tempj).style.boxShadow=\"0px 0px 0px 2px rgb(240 145 153)\"}"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatchedTill\").style.backgroundColor=\"#4897ff\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatchedTill\").style.color=\"#000\";'>看到</div>"+
  /*点击撤销观看此ep*/"<div class='RecentViewEpisodePlayCardProgressBtn' style='left: 114px;border-top-left-radius: 0;border-bottom-left-radius: 0;' onclick='store.set(\"WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".Condition\",\"Unwatched\");"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\"#00000055\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"rgb(172, 172, 172)\";document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 2px #ffffff4a\";'>撤销</div>"+
  
  "<div class='RecentViewEpisodePlayCardPlay' style='right:10px;top:122px;width:28%;height:28%;border:0px solid' onclick='ArchiveMediaDetailsEpInfoPlayer("+MediaID+","+TempCounter+",\"SP\");'>"+
  "<div style='width: 80%;height: 100%;left:10%;position: absolute;background:url(./assets/play.svg) no-repeat center;background-size: contain;'></div>"+
  /*分割线*/"<div class='rolledEpisodePlayCard'></div></div><div style='position:absolute;left:10px;right:10px;height:2px;top:113px;border-radius:5px;background:#ffffff1f'></div>"+
  "<div id='RecentViewPlayEPInfo' style='position:absolute;left:15px;right:15px;top:10px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoCN' style='position:absolute;left:15px;right:15px;top:35px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoLength' style='position:absolute;left:15px;right:15px;top:60px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoDiscuss' style='color:rgb(240, 145, 153);position:absolute;left:15px;right:15px;bottom:10px;top:195px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"
  //检测看过，自动高亮
  if(store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".Condition")=='Watched'){document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.backgroundColor="rgb(240 145 153)";document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.color="#000"}
  }
}

//! 媒体库-作品详情页章节选择并播放
function ArchiveMediaDetailsEpInfoPlayer(MediaID,TempCounter,Type){
  console.log(MediaID,TempCounter,Type)
  if(((store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".URL"))&&Type=='EP')||((store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".URL"))&&Type=='SP')){
    if(Type == 'EP') var EPOpenURL = store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".URL");
    if(Type == 'SP') var EPOpenURL = store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".URL");
    process.noAsar = true; //临时禁用fs对ASAR读取
    fs.access(runtimeUrl, fs.constants.F_OK,function (err) {
      if (err) {  //调试播放核心 
        fs.access(EPOpenURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            let mpvPlayer = new mpv({"binary": packUrl,},["--fps=60"]);
            mpvPlayer.load(EPOpenURL);}
        });
      } 
      else {  //打包后播放核心 
        fs.access(EPOpenURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            let mpvPlayer = new mpv({"binary": runtimeUrl,},["--fps=60"]);
            mpvPlayer.load(EPOpenURL);}
        });
      }
    })
    process.noAsar = false; //恢复fs对ASAR读取
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewID",store.get("WorkSaveNo"+MediaID+".bgmID"));
    localStorage.setItem("LocalStorageRecentViewID",store.get("WorkSaveNo"+MediaID+".bgmID"));
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewLocalID",MediaID);
    localStorage.setItem("LocalStorageRecentViewLocalID",MediaID);
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewURL",EPOpenURL);
    localStorage.setItem("LocalStorageRecentViewURL",EPOpenURL);
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisode",TempCounter);
    localStorage.setItem("LocalStorageRecentViewEpisode",TempCounter);
    if(Type == 'EP') {sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(TempCounter+1)+".URL"));localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(TempCounter+1)+".URL"));sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisodeType",'EP');localStorage.setItem("LocalStorageRecentViewEpisodeType",'EP')}
    if(Type == 'SP') {sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(TempCounter+1)+".URL"));localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(TempCounter+1)+".URL"));sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisodeType",'SP');localStorage.setItem("LocalStorageRecentViewEpisodeType",'SP')}

    // *Recent View Get <!--格式化HomePage主页继续观看内容-->
    var bgmID = sysdata.get("Settings.checkboxC.LocalStorageRecentViewID");//localStorage.getItem("LocalStorageRecentViewID");
    var bgmEP = sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisode");
    if(bgmID != '' && sysdata.get("Settings.checkboxC.LocalStorageRecentViewID")&&sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisode")){
      $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID.toString(), function(data){
      document.getElementById("RecentViewDetail").innerText=data.summary;
      document.getElementById("RecentViewName").innerText=data.name;
      document.getElementById("RecentViewTitle").innerText="继续观看: "+data.name_cn;
      document.getElementById("RecentViewRatingScore").innerHTML=
      "<div id='RecentViewRatingRank' class='boxBlank' style='border: 1px dashed rgb(155, 155, 155);background-color: rgba(0, 0, 0, 0.292);top:15%;font-size: 1.5vw;font-family:bgmUI;height: 28%;width:30%;left:10%;backdrop-filter: blur(10px);box-shadow:none;line-height: 200%;'>NO.Null</div>"+
      "<div id='RecentViewRatingPos' class='boxBlank' style='border: 1px dashed rgb(155, 155, 155);background-color: rgba(0, 0, 0, 0.292);bottom:15%;font-size: 1.5vw;font-family:bgmUI;height: 28%;width:30%;left:10%;backdrop-filter: blur(10px);box-shadow:none;line-height: 200%;'>NoRank</div>";
      var HomePageRatingScore =document.createTextNode(data.rating.score.toFixed(1));
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
      if(sysdata.get("Settings.checkboxB.LocalStorageSystemShowModifiedCover")) //判断是否使用自定义背景
      {document.getElementById("HomePage").style.background="url('"+store.get('WorkSaveNo'+MediaID+'.Cover')+"') no-repeat center";}
      document.getElementById("HomePage").style.backgroundSize="cover";
      //错误回调
      }).done(function() { OKErrorStreamer("OK","加载作品信息完成",0); }).fail(function() { document.getElementById("RecentViewTitle").innerText="继续观看: "+store.get("WorkSaveNo"+MediaID+".Name");document.getElementById("RecentViewRatingScore").appendChild(document.createTextNode('0.0'));OKErrorStreamer("Error","无法连接Bangumi",0); });
      
      // *EP信息获取
      if(Type=='EP'){
      $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
        for(var EPTemper=0;EPTemper!=data1.data.length;EPTemper++){
          if(data1.data[EPTemper].hasOwnProperty("ep")&&data1.data[EPTemper].ep==bgmEP) 
          {
            if(sysdata.get("UserData.userpageProgressSyncOptions")!='Disabled'){
              $.ajax({url: "https://api.bgm.tv/v0/users/-/collections/-/episodes/"+data1.data[EPTemper].id, //与云端同步章节看过信息
              type: 'GET',contentType: "application/json",headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
              success: function (data2) {
                if(data2.type!=2){ //判断云端是否观看
                $.ajax({url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID+"/episodes", //与云端同步章节看过信息
                type: 'PATCH',contentType: "application/json",dataType: "json",
                headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},
                data: '{"episode_id": ['+data1.data[EPTemper].id+'],"type": 2}',timeout : 2000,success: function () {;}, error: function () {;}})
              }}
            })}
            $.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[EPTemper].id, function(data2){document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+data2.ep+"-"+data2.name;}).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+bgmEP});break;}
          else{document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+bgmEP;}
        }// *错误回调
      }).done(function() { OKErrorStreamer("OK","加载作品EP信息完成,数据已同步",0); }).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"EP"+bgmEP; OKErrorStreamer("Error","无法连接Bangumi",0); }); // *错误回调
      }
      if(Type=='SP'){
        $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
          for(var SPTemper=0;SPTemper!=data1.data.length;SPTemper++){
            if(data1.data[SPTemper].type=='1'&&data1.data[SPTemper].sort==bgmEP) 
            {$.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[SPTemper].id, function(data2){document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+data2.type+"-"+data2.name;}).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+bgmEP});break;}
            else{document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+bgmEP;}
          }// *错误回调
        }).done(function() { OKErrorStreamer("OK","加载SP信息完成",0); }).fail(function() {document.getElementById("RecentViewProgress").innerText="上次看到: "+"SP"+bgmEP; OKErrorStreamer("Error","无法连接Bangumi",0); }); // *错误回调
      }
      $('#RecentViewProgress').attr('onclick',"console.log('OK');RecentViewPlayAction('Last');");
      console.log("Success");
    }
  }
}

//! 媒体库-作品详情页条目用户收藏更新
function ArchiveMediaDetailsUserFavouriteUpdate(bgmID){
  let UpdateType = null;
  switch (document.getElementById('ArchivePageContentDetailsSelfRankBlockState').value)
  { 
    case 'wish': UpdateFavouriteData = '{"type": 1,"private": false}';UpdateType = '想看';break;
    case 'do':   UpdateFavouriteData = '{"type": 3,"private": false}';UpdateType = '在看';break;
    case 'collect': UpdateFavouriteData = '{"type": 2,"private": false}';UpdateType = '看过';break;
    case 'on_hold': UpdateFavouriteData = '{"type": 4,"private": false}';UpdateType = '搁置';break;
    case 'dropped': UpdateFavouriteData = '{"type": 5,"private": false}';UpdateType = '抛弃';break;
    case 'uncollect': UpdateFavouriteData = '{"type": 0,"private": false}';UpdateType = '未收藏';break;
  }
  $.ajax({ //更新收藏信息
    url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID,
    type: 'PATCH',
    contentType: "application/json",
    dataType: "json",
    headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""},
    data: UpdateFavouriteData,
    timeout : 2000,
    success: function (data) {OKErrorStreamer("OK","更新条目状态为"+UpdateType+"成功",0);}, error: function () {;}
});
}

//! 媒体库-作品详情页章节进度云端更新
function ArchiveMediaDetailsEpisodeUserUpdate(bgmID,EPBegin,EPEnd,type){
  if(sysdata.get('UserData.userpageProgressSyncOptions')!="Disabled"){
  let SyncContent = null;
  $.ajax({
    url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID.toString()+"/episodes?offset=0&episode_type=0",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""},timeout : 2000,
    success:function(data){
      for(let tempi = EPBegin;tempi!=EPEnd;tempi++) SyncContent = SyncContent+data.data[tempi-1].episode.id+','
    $.ajax({
      url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID+"/episodes",
      type: 'PATCH',contentType: "application/json",dataType: "json",
      headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},
      data: '{"episode_id": ['+SyncContent.slice(0, -1)+'],"type":'+type+'}',timeout : 2000,
      success: function () {OKErrorStreamer("OK","章节"+EPBegin+"到"+(EPEnd-1)+"同步成功",0);}, error: function () {OKErrorStreamer("Error","章节"+EPBegin+"到"+(EPEnd-1)+"标注成功，同步失败",0);}
    })
  }})
  }
}

//! 媒体库-作品ep扫描模块
function LocalWorkEpsScanModule(MediaID){
  if(fs.existsSync(store.get("WorkSaveNo"+MediaID+".URL"))){       // *当目标媒体库目录存在
    // OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描EP信息，请稍后</div>",0);
    var TargetWorkEP = fs.readdirSync(store.get("WorkSaveNo"+MediaID+".URL")); //扫描目标媒体库目录下EP
    console.log(TargetWorkEP.length);
    var RealWorkEP = 0;
    for (var TempCounter = 0;TempCounter!=TargetWorkEP.length;TempCounter++){
      if(TargetWorkEP[TempCounter].match(/\.mp4|\.flv|\.mkv|\.rm|\.rmvb|\.avi|\.m2ts/i)){
        RealWorkEP += 1;store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".URL",TargetWorkEP[TempCounter]);
        store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".Condition",'Unwatched');}
    }
    store.set("WorkSaveNo"+MediaID+".EPTrueNum",RealWorkEP);
    // OKErrorStreamer("MessageOff","<div class='LoadingCircle'>正在扫描EP信息，请稍后</div>",0);
  }
}

//! 媒体库-作品特典扫描模块
function ArchiveMediaBonusScan(TargetMediaURL,MediaID){
  if(fs.existsSync(TargetMediaURL)){       // *当目标媒体库目录存在
    let TargetMediaDir = fs.readdirSync(TargetMediaURL); //扫描目标媒体目录
    let CardHover = store.get("WorkSaveNo"+MediaID+".Cover"); //获取封面
    let TargetMediaDirHasExtra = 0; //判断是否存在特典
    for(let ScanCounter=0;ScanCounter!=TargetMediaDir.length;ScanCounter++){ //轮询找到特典子目录
      if(fs.lstatSync(TargetMediaURL+"\\"+TargetMediaDir[ScanCounter]).isDirectory()&&/extra/i.test(TargetMediaDir[ScanCounter])){ArchiveMediaBonusScan(TargetMediaURL+"\\"+TargetMediaDir[ScanCounter],MediaID); TargetMediaDirHasExtra+=1;}
      else if(fs.lstatSync(TargetMediaURL+"\\"+TargetMediaDir[ScanCounter]).isDirectory()){
        let CoverIcon = TargetMediaType= '';
        if (/cd|music|audio/i.test(TargetMediaDir[ScanCounter])) {TargetMediaType = '特典CD、OST';
          CoverIcon = '<svg t="1678200925208" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24815" style="opacity: 0.8;background-color: #000000a1;border-top-left-radius:8px;border-bottom-left-radius:8px;padding:15%;"><path d="M819.2 205.824c-76.8-76.8-183.296-124.416-300.544-124.416-234.496 0-424.96 190.464-424.96 424.96s190.464 424.96 424.96 424.96c198.656 0 365.056-136.192 412.16-320l-197.12 197.12c-4.608 4.608-11.264 7.68-17.92 7.68H482.304v5.12c0 14.336-11.264 25.6-25.6 25.6s-25.6-11.264-25.6-25.6v-5.12h-10.24c-14.336 0-25.6-11.264-25.6-25.6s11.264-25.6 25.6-25.6h10.24v-5.12c0-14.336 11.264-25.6 25.6-25.6 7.168 0 13.312 3.072 17.92 7.68 4.608 4.608 7.68 11.264 7.68 17.92v5.12h222.208l235.008-235.008c1.024-1.024 2.56-2.048 3.584-3.072 0.512-6.656 0.512-13.824 0.512-20.48 0-117.248-47.616-223.744-124.416-300.544z m-150.016 450.56c-38.4 38.4-91.648 62.464-150.016 62.464-117.248 0-212.48-95.232-212.48-212.48s95.232-212.48 212.48-212.48 212.48 95.232 212.48 212.48c-0.512 58.368-24.064 111.616-62.464 150.016z" p-id="24816" fill="#ffffff"></path><path d="M604.16 514.56c0 47.104-38.4 85.504-85.504 85.504s-85.504-38.4-85.504-85.504 38.4-85.504 85.504-85.504c47.104 0.512 85.504 38.4 85.504 85.504z" p-id="24817" fill="#ffffff"></path></svg>';
        } else if (/sp|映像特典|ova|oad|pv|mv|menu/i.test(TargetMediaDir[ScanCounter])) { TargetMediaType = '映像特典、OVA';
          CoverIcon = '<svg t="1678202892992" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="37873" style="opacity: 0.8;background-color: #000000a1;border-top-left-radius:8px;border-bottom-left-radius:8px;padding:15%;"><path d="M768 170.667l85.333 128h-128l-85.333-128h-85.333l85.333 128H512l-85.333-128h-85.334l85.334 128h-128l-85.334-128h-42.666c-46.934 0-84.907 38.4-84.907 85.333l-0.427 512c0 46.933 38.4 85.333 85.334 85.333h682.666c46.934 0 85.334-38.4 85.334-85.333V170.667H768z m-288 480L426.667 768l-53.334-117.333L256 597.333 373.333 544l53.334-117.333L480 544l117.333 53.333L480 650.667zM722.773 509.44l-40.106 87.893-40.107-87.893-87.893-40.107 87.893-40.106 40.107-87.894 40.106 87.894 87.894 40.106-87.894 40.107z" p-id="37874" fill="#ffffff"></path></svg>';
        } else if (/scan|特典|credit/i.test(TargetMediaDir[ScanCounter])) { TargetMediaType = '光盘封装扫描';
          CoverIcon = '<svg t="1678203654197" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="43245" style="opacity: 0.8;background-color: #000000a1;border-top-left-radius:8px;border-bottom-left-radius:8px;padding:15%;"><path d="M920.22784 812.02688a22.71232 22.71232 0 0 0-22.74304 22.73792v62.80192H190.65344c-34.51904 0-62.68416-27.35616-64.07168-61.52704 0-0.57856 0.11776-1.15712 0.11776-1.8432 0-1.04448 0-2.53952-0.11776-4.62336 1.96608-33.59232 29.9008-60.36992 64.07168-60.36992h724.15744c1.84832 0 3.57376-0.2304 5.19168-0.6912h0.34816a22.71232 22.71232 0 0 0 22.73792-22.73792V103.69024a22.71232 22.71232 0 0 0-22.73792-22.74304H190.76608c-60.4928 0-109.6704 49.17248-109.6704 109.66528 0 0.80896 0.11776 1.6128 0.2304 2.42688-0.11264 55.87456-0.80896 569.00096-0.11264 636.41088 0 1.28-0.2304 2.6624-0.2304 3.93216 0 58.18368 45.48096 105.73824 102.73792 109.32224 1.15712 0.2304 2.31424 0.34304 3.46624 0.34304h733.16352a22.7072 22.7072 0 0 0 22.73792-22.73792V834.7648a22.8864 22.8864 0 0 0-22.8608-22.73792z m-406.58944-182.1184c-185.32864 0-236.20096-52.70016-236.20096-163.52768 0-30.88896 9.08288-59.96032 25.43616-83.57888l10.90048-14.53568V241.0752L402.80576 299.2128l18.16576 12.71808 19.98848-3.6352c21.81632-3.62496 47.24224-5.44768 72.6784-5.44768 25.45664 0 50.88256 1.8176 72.68352 5.44768l21.80608 3.6352 18.17088-12.71808 87.21408-58.1376V368.27136l10.9056 14.53568c18.17088 25.43616 25.4464 54.5024 25.4464 83.57888 0 110.8224-50.88256 163.52256-236.22656 163.52256z" fill="#ffffff" p-id="43246"></path></svg>';
        } else if(/sub|字幕|ass/i.test(TargetMediaDir[ScanCounter])) {TargetMediaType = '字幕文件';CoverIcon = '<svg t="1678203969360" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="50618" style="opacity: 0.8;background-color: #000000a1;border-top-left-radius:8px;border-bottom-left-radius:8px;padding:15%;"><path d="M170.67008 512v-68.27008h68.25984v-68.25984h-68.25984c-37.53984 0-68.27008 30.73024-68.27008 68.25984V512h68.27008zM853.32992 102.4h-409.6c-37.5296 0-68.25984 30.73024-68.25984 68.27008v204.8h68.25984v68.25984h-68.25984V580.1984c0 37.5296 30.73024 68.27008 68.25984 68.27008H580.3008v-68.1984h68.27008v68.1984h204.75904c37.53984 0 68.27008-30.74048 68.27008-68.27008V170.67008C921.6 133.13024 890.86976 102.4 853.32992 102.4zM648.57088 512H580.3008v-68.27008H512v-68.25984h68.3008c37.5296 0 68.27008 30.73024 68.27008 68.25984V512zM307.2 853.32992h136.52992V921.6H307.2zM580.3008 785.07008v68.25984H512V921.6h68.3008c37.5296 0 68.27008-30.73024 68.27008-68.27008v-68.25984H580.3008zM238.92992 853.32992h-68.25984v-68.25984H102.4v68.25984C102.4 890.86976 133.13024 921.6 170.67008 921.6h68.25984v-68.27008zM102.4 580.27008h68.27008V716.8H102.4z" p-id="50619" fill="#ffffff"></path></svg>';}
        else {TargetMediaType = '其他特典';CoverIcon = '<svg t="1678203969360" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="50618" style="opacity: 0.8;background-color: #000000a1;border-top-left-radius:8px;border-bottom-left-radius:8px;padding:15%;"><path d="M170.67008 512v-68.27008h68.25984v-68.25984h-68.25984c-37.53984 0-68.27008 30.73024-68.27008 68.25984V512h68.27008zM853.32992 102.4h-409.6c-37.5296 0-68.25984 30.73024-68.25984 68.27008v204.8h68.25984v68.25984h-68.25984V580.1984c0 37.5296 30.73024 68.27008 68.25984 68.27008H580.3008v-68.1984h68.27008v68.1984h204.75904c37.53984 0 68.27008-30.74048 68.27008-68.27008V170.67008C921.6 133.13024 890.86976 102.4 853.32992 102.4zM648.57088 512H580.3008v-68.27008H512v-68.25984h68.3008c37.5296 0 68.27008 30.73024 68.27008 68.25984V512zM307.2 853.32992h136.52992V921.6H307.2zM580.3008 785.07008v68.25984H512V921.6h68.3008c37.5296 0 68.27008-30.73024 68.27008-68.27008v-68.25984H580.3008zM238.92992 853.32992h-68.25984v-68.25984H102.4v68.25984C102.4 890.86976 133.13024 921.6 170.67008 921.6h68.25984v-68.27008zM102.4 580.27008h68.27008V716.8H102.4z" p-id="50619" fill="#ffffff"></path></svg>';}
        let onclickurl = "exec('explorer "+(TargetMediaURL+"\\"+TargetMediaDir[ScanCounter]).replace(/(\\)/g,"\\\\").replace(/(&)/g,"^&")+"');"
        $("#ArchivePageContentDetailsEpisodeExtraBlock").append("<div class='ArchiveCardCharacterHover' onclick=\""+onclickurl+"\">"+
        "<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url("+CardHover+") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'>"+CoverIcon+"</div>"+
        "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;white-space:nowrap;font-size:1.5vw'><b>"+TargetMediaDir[ScanCounter]+"</b><br/><p>类别："+TargetMediaType+"</p></div></div>");
        TargetMediaDirHasExtra = TargetMediaDirHasExtra+1;
      }
    } if(TargetMediaDirHasExtra==0) {$("#ArchivePageContentDetailsEpisodeExtraBlock").append('<div style="margin:auto;">未找到特典信息</div>')}
  }
}

//! 恢复出厂设置
function SettingsClear(){
  var result = dialog.showMessageBoxSync({
    type:"warning",
    buttons:["取消","确认"],
    title:"警告",
    message:`您确定要清除全部用户数据吗？此操作不可逆，您的所有设置数据将清除！`
  });
  if(result == 1){
    sysdata.clear();/*localStorage.clear();*/SysdataDefaultInit();ArchivePageInit();OKErrorStreamer("OK","设置删除完成",0);}
}