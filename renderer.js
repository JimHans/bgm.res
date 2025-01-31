// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Electron相关模块
const { app , Menu , Tray, shell, ipcRenderer, nativeTheme,clipboard,nativeImage} = nodeRequire('electron'); //?使用electron
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog 对话框弹出api
const path = nodeRequire("path");                                     //?引入path
const fs = nodeRequire('fs');                                         //?使用nodejs fs文件操作库
// 额外引入模块
const runtimeUrl = path.join(__dirname, './mpv/mpv.exe');             //?mpv播放核心地址-调试
const packUrl = path.join(process.cwd(), './resources/app.asar.unpacked/mpv/mpv.exe');  //?mpv播放核心地址-打包后
const ffmpegUrl = path.join(process.cwd(), './resources/app.asar.unpacked/mpv');  //?ffmpeg目录-打包后
let exec = nodeRequire('child_process').exec;                         //?引用exec用于CMD指令执行
let mpv = nodeRequire('node-mpv-2');                                  //?引入node-mpv-2接口
let cheerio = nodeRequire('cheerio');                                 //?引入cheerio用于解析html
//初始化存储资源库
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
const store = new Store();                                            //?创建electron-store存储资源库对象-媒体库
let SysdataOption={
  name:"sysdata",//文件名称,默认 config
  fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储
var IfArchivePageIsInit = 0;                                          //?是否已经初始化过Archive页面
var ArchivePageContent_scrollTop = 0;                                 //?Archive页面滚动位置
var ArchivePageContent_scrollTopFreeze = 0;                           //?Archive页面滚动位置-临时变量
var ArchivePageTimelineContentOpened = 0;                             //?Archive页面时间线内容是否打开

ipcRenderer.on('data', (e,arg) => {                                   //?接收主进程传来的数据 
  console.log(arg);
  if(arg.slice(0,18)=='RefreshArchivePage'){
    // ArchivePageInit();
    ArchiveMediaDetailsPage(arg.slice(18));
    let RefreshArchivePageTempDataSaver = store.get("WorkSaveNo"+arg.slice(18));
    // *计算作品进度信息
    var RefreshArchiveCardWatchPercent = 0;
    var RefreshArchiveCardWatchPercentBorder='8px';
    for(let Tempi=1;Tempi<=parseInt(RefreshArchivePageTempDataSaver["EPTrueNum"]);Tempi++){
      if(RefreshArchivePageTempDataSaver.EPDetails["EP"+Tempi].Condition=='Watched') RefreshArchiveCardWatchPercent++;
    } RefreshArchiveCardWatchPercent = (RefreshArchiveCardWatchPercent/parseInt(RefreshArchivePageTempDataSaver["EPTrueNum"]))*100
    if(RefreshArchiveCardWatchPercent==100) RefreshArchiveCardWatchPercentBorder='0'
    if(!sysdata.get("Settings.checkboxB.LocalStorageMediaShowProgress")){RefreshArchiveCardWatchPercent = 0} //若禁用进度条，设定长度为0

    var ArchiveCoverPNG = "ArchiveCover.png"; var ArchiveBDMVTag = "none"; //默认关闭BDMV标志
    if (RefreshArchivePageTempDataSaver["BDMV"] == "BDMV") 
      {ArchiveCoverPNG = "ArchiveCoverBDMV.png"; ArchiveBDMVTag = "block"} //BDMV封面

    if(document.getElementById("ArchiveWorkNo"+arg.slice(18)) !== null){
      $("#ArchiveWorkNo"+arg.slice(18)).html(
        "<div class='ArchiveCardThumb' style='background:url(./assets/"+ArchiveCoverPNG+") no-repeat center;background-size:cover;'></div>"+ //封面遮罩阴影
        "<div class='ArchivePageBDMVTag' style='display:"+ArchiveBDMVTag+"'>BDMV</div>"+ //BDMV标志
        "<div id='ArchiveCardProgressShowerNo"+arg.slice(18)+"' class='ArchiveCardProgressShower' style='width:"+RefreshArchiveCardWatchPercent+"%;border-bottom-right-radius: "+RefreshArchiveCardWatchPercentBorder+";background-color:"+SettingsColorPicker(0.8)+";'></div>"+ //进度指示
        "<div class='ArchiveCardTitle'>"+RefreshArchivePageTempDataSaver["Name"]+"</div>"+ //名称
        "<div class='ArchiveCardRateStar'>⭐&nbsp;"+RefreshArchivePageTempDataSaver["Score"]+"</div>"+ //评分
        "<div class='ArchiveCardDirectorYearCorp' style='bottom:22%;left:5%;right:5%;text-align:center;font-style:italic;'>"+
        RefreshArchivePageTempDataSaver["Type"]+"&nbsp;"+RefreshArchivePageTempDataSaver["Eps"]+"话&nbsp;"+RefreshArchivePageTempDataSaver["Year"]+"</div>"+ //资料A
        "<div class='ArchiveCardDirectorYearCorp' style='bottom:12%;left:40%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>原作 "+RefreshArchivePageTempDataSaver["Protocol"]+"</div>"+ //制作原案
        "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>"+RefreshArchivePageTempDataSaver["Director"]+"</div>"+ //制作监督
        "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:5%;right:50%;text-align:left;color: rgba(255, 255, 255, 0.79);'>"+RefreshArchivePageTempDataSaver["Corp"]+"</div>"+ //制作公司
        "<div style='border-radius: 8px;transition: all 0.5s;left:0%;right:0%;top:0%;bottom:0%;position:absolute;' onclick='ArchiveMediaDetailsPage("+arg.slice(18)+")'></div>") // 点击触发区域
        OKErrorStreamer("OK","媒体数据更新完成！",0);
        document.getElementById("ArchiveWorkNo"+arg.slice(18)).style.background="url(\""+RefreshArchivePageTempDataSaver["Cover"]+"\") no-repeat top";
        document.getElementById("ArchiveWorkNo"+arg.slice(18)).style.backgroundSize="cover";
    }
    else {
      $("#ArchivePageContent").append( "<div id='ArchiveWorkNo"+arg.slice(18)+"' class='ArchiveCardHover' style='background:url(\""+RefreshArchivePageTempDataSaver["Cover"]+"\") no-repeat top;background-size:cover;'>"+
      "<div class='ArchiveCardThumb' style='background:url(./assets/"+ArchiveCoverPNG+") no-repeat center;background-size:cover;'></div>"+ //封面遮罩阴影
      "<div class='ArchivePageBDMVTag' style='display:"+ArchiveBDMVTag+"'>BDMV</div>"+ //BDMV标志
      "<div id='ArchiveCardProgressShowerNo"+arg.slice(18)+"' class='ArchiveCardProgressShower' style='width:"+RefreshArchiveCardWatchPercent+"%;border-bottom-right-radius: "+RefreshArchiveCardWatchPercentBorder+";background-color:"+SettingsColorPicker(0.8)+";'></div>"+ //进度指示
      "<div class='ArchiveCardTitle'>"+RefreshArchivePageTempDataSaver["Name"]+"</div>"+ //名称
      "<div class='ArchiveCardRateStar'>⭐&nbsp;"+RefreshArchivePageTempDataSaver["Score"]+"</div>"+ //评分
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:22%;left:5%;right:5%;text-align:center;font-style:italic;'>"+
      RefreshArchivePageTempDataSaver["Type"]+"&nbsp;"+RefreshArchivePageTempDataSaver["Eps"]+"话&nbsp;"+RefreshArchivePageTempDataSaver["Year"]+"</div>"+ //资料A
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:12%;left:40%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>原作 "+RefreshArchivePageTempDataSaver["Protocol"]+"</div>"+ //制作原案
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>"+RefreshArchivePageTempDataSaver["Director"]+"</div>"+ //制作监督
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:5%;right:50%;text-align:left;color: rgba(255, 255, 255, 0.79);'>"+RefreshArchivePageTempDataSaver["Corp"]+"</div>"+ //制作公司
      "<div style='border-radius: 8px;transition: all 0.5s;left:0%;right:0%;top:0%;bottom:0%;position:absolute;' onclick='ArchiveMediaDetailsPage("+arg.slice(18)+")'></div>"+ // 点击触发区域
      "</div>" );
      OKErrorStreamer("OK","媒体数据添加完成！",0);
    }
  let archivePageContent = document.getElementById("ArchivePageContent");
  if (archivePageContent) {
    let MediaDetailsBlock = document.getElementById('ArchiveWorkNo'+arg.slice(18));
    archivePageContent.scrollTop = MediaDetailsBlock.offsetTop-20;//archivePageContent.scrollHeight;
  } //将媒体库滚到最底以显示最新添加的作品
}else if(arg.slice(0,15)=='InitArchivePage'){
  console.log("Init without update database");
  document.getElementById('ArchivePageContentDetails').style.marginLeft = '100%';
  document.getElementById('GoBackPage').style.height = '0px';
  setTimeout(function() {document.getElementById('ArchivePageContentDetails').style.display = 'none';document.getElementById('GoBackPage').style.display = 'none';},700);
  document.getElementById('RecentViewEpisodePlayCard').style.display='none';
  document.getElementById('RecentViewEpisodePlayCardBack').style.display='none';
  ArchivePageContent_scrollTopFreeze = ArchivePageContent_scrollTop;
  ArchivePageInit();
  // 滚动到上次位置
  $('#ArchivePageContent').animate({scrollTop: ArchivePageContent_scrollTopFreeze},70)
}});      

//Version Get
// window.onload = function () {
//   var package = nodeRequire("./package.json");
//   document.getElementById("Title").innerText=package.title+" v"+package.version; // Get Version
// }

// function Closer(){ipcRenderer.send('MainWindow','Close');}
// function Hider(){ipcRenderer.send('MainWindow','Hide');}

//引入各子页面初始化模组

// !成功、失败、信息横幅提示调用函数
const { OKErrorStreamer } = nodeRequire('./js/Mainpage_Modules/MainpageToaster.js'); //?引入bgm.res主界面的通知toast函数封装

// TODO MainProgram Load Data Start

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
  if(!sysdata.get("Settings.checkboxC.OOBE")){ipcRenderer.send('OOBEPage','Open')}
  // *Version Get
  var packages = nodeRequire("./package.json");
  document.getElementById("Title").innerText=packages.title+" v"+packages.version; // Get Version
  
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
    document.getElementById("RecentViewRatingScore").innerText=data.rating.score.toFixed(1);//.appendChild(HomePageRatingScore);
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
      else if(data.rating.score > 1.5) {document.getElementById("RecentViewRatingPos").innerText="很差";}
      else if(data.rating.score >= 1) {document.getElementById("RecentViewRatingPos").innerText="不忍直视";}
      else {document.getElementById("RecentViewRatingPos").innerText="暂无评分";}
    // 作品等级判定OVER
    document.getElementById("HomePage").style.background="url('"+data.images.large+"') no-repeat center";
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemShowModifiedCover")) //判断是否使用自定义背景
    {document.getElementById("HomePage").style.background="url('"+store.get('WorkSaveNo'+MediaID+'.Cover')+"') no-repeat center";}
    document.getElementById("HomePage").style.backgroundSize="cover";
    //错误回调
    }).done(function() { OKErrorStreamer("OK","加载作品信息完成",0); }).fail(function() { document.getElementById("RecentViewTitle").innerText="继续观看: "+store.get("WorkSaveNo"+MediaID+".Name");document.getElementById("RecentViewRatingScore").innerText='0.0'/*.appendChild(document.createTextNode('0.0'))*/;OKErrorStreamer("Error","无法连接Bangumi",0); });
    
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

    // *计算作品进度信息
    let RecentViewWatchPercentSaver = 0;
    for(let Tempi=1;Tempi<=parseInt(store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum"));Tempi++){
      if(store.get("WorkSaveNo"+MediaID.toString()+".EPDetails.EP"+Tempi+'.Condition')=='Watched') RecentViewWatchPercentSaver++;
    } RecentViewWatchPercentSaver = (RecentViewWatchPercentSaver/parseInt(store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum")))*100
    document.getElementById("RecentViewFullProgressNum").innerText=RecentViewWatchPercentSaver.toFixed(1)+" %";
    document.getElementById("RecentViewFullProgressLine").style.width=RecentViewWatchPercentSaver.toString()+"%";
    if(sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisodeType")=="EP"&&bgmEP/store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum")==1) {
      $("#RecentViewPlay").attr('onclick',"ipcRenderer.send('MediaShare',sysdata.get('Settings.checkboxC.LocalStorageRecentViewLocalID'));");
      document.getElementById("RecentViewPlayText").innerText="分享";
      document.getElementById("RecentViewPlayIcon").innerText="";
      document.getElementById("RecentViewPlayIcon").style.background="url(./assets/sharemedia.svg)";
      document.getElementById("RecentViewPlayIcon").style.width="20px";
      document.getElementById("RecentViewPlayIcon").style.height="30px";
    }

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
  // *透明效果启用
  if(sysdata.get("Settings.checkboxB.LocalStorageSystemOpenMicaMode")==true){
    document.body.style.background = "#1b1b1b80";
    document.getElementById('HomePage').style.background="#00000000";
    document.getElementById('ArchivePage').style.background="#00000000";
    document.getElementById('SettingsPage').style.background="#00000000";}
  
  // *自定义主题色导航栏
  let HomeIconColor = 'rgb(240 145 153)'; // 这是默认的设置图标颜色
  if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) //判断是否启用自定义主题色
  { HomeIconColor = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"); // 如果有自定义颜色，就使用自定义颜色
    // document.getElementById("Home").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    let CustomColorData = HomeIconColor
    let customcolorstyle=document.createElement('style');//创建一个<style>标签
    let customchangeText=document.createTextNode('.Winui3inputText:focus{border-bottom:2px solid '+CustomColorData+'}')//更改后伪元素的样式
    customcolorstyle.appendChild(customchangeText);//把样式添加到style标签里
    document.body.appendChild(customcolorstyle);//把内联样式表添加到html中  
  }
  document.getElementById("Home").style.color=SettingsColorPicker(1);
  document.getElementById("Home").style.backgroundColor=SettingsColorPicker(0.1);
  // 动态加载 SVG 文件
  $.get('./assets/Home-fill.svg', function(data) { // 将 SVG 内容插入到页面中
    var svg = $(data).find('svg');  $('#HomeIcon').replaceWith(svg);
    $(svg).find('path').attr('fill', HomeIconColor); // 将所有 path 的颜色改为指定颜色
  }, 'xml');
  // *自定义主题色导航栏OVER

  if(sysdata.get("Settings.checkboxA.LocalStorageAutoUpdateArchiveInfo")) //判断是否启用自动更新作品信息
  {ArchiveMediaUpdate();}

  ToggleSimpleHomePage(1) //判断是否初始化简洁首页

  // *动态跟随进度背景图片启用
  if(sysdata.get("Settings.checkboxB.LocalStorageSystemOpenLiveBackground")==true){
    const ffmpeg = nodeRequire('fluent-ffmpeg');
    fs.readdir(ffmpegUrl+"/portable_config/watch_later", function(err, files) {
      if (err || !files) {OKErrorStreamer("Error","因为未曾播放，ffmpeg无法扫描最近播放缓存",0); return console.error('Unable to scan directory: ' + err);}
      // 获取每个文件的创建时间，并找出最新的文件
      let latestFile; let latestTime = 0;
      files.forEach(function(file) {
          const filePath = path.join(ffmpegUrl+"/portable_config/watch_later", file);
          const stat = fs.statSync(filePath);
          if (stat.ctimeMs > latestTime) {latestTime = stat.ctimeMs;latestFile = file;}
      });
      const history_data = fs.readFileSync(ffmpegUrl+'/portable_config/watch_later/'+latestFile, 'UTF-8');
      const lines = history_data.split(/\r?\n/)[0].match(/start=(\d+)\.\d+/);
      ffmpeg.setFfmpegPath(ffmpegUrl+"/ffmpeg.exe");
      ffmpeg(sysdata.get("Settings.checkboxC.LocalStorageRecentViewURL"))
      .screenshots({
        count: 1,
        folder: ffmpegUrl,
        filename: 'screenshot.png',
        timestamps: [lines[1]],
        size: '1920x1080'
      }).on("end",function(){  setTimeout(function(){
        document.getElementById('HomePageLiveBackground').style.background="url('"+ffmpegUrl.replace(/\\/g, "/")+"/screenshot.png?v=" + Date.now()+"') no-repeat";
        document.getElementById('HomePageLiveBackground').style.backgroundSize='cover';
        document.getElementById('HomePageLiveBackground').style.opacity=1;console.log("完成背景更新");
      },500);})
  });
  }

}window.onload = SysOnload();

// !页面大小变化时更新元素状态函数(目前仅更新作品详情与播放卡片)
window.onresize=function(){  
  if($("#ArchivePageSearchSuggestion").is(":visible")){
    document.getElementById('ArchivePageSearchSuggestion').style.left=document.getElementById("ArchivePageSearch").getBoundingClientRect().left+"px"
    document.getElementById('ArchivePageSearchSuggestion').style.width=document.getElementById("ArchivePageSearch").getBoundingClientRect().width-2+"px"
  }
  if($("#ArchivePageContentDetails").is(":visible")){
    document.getElementById("ArchivePageContentDetailsTitle").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品主标题贴左边
    document.getElementById("ArchivePageContentDetailsTitleJp").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制日文标题贴左边
    document.getElementById("ArchivePageContentDetailsTitleJp").style.top=(22+(document.getElementById("ArchivePageContentDetailsTitle").getBoundingClientRect().height)*2/($(window).height())*100).toString()+"%"; // 控制日文标题贴上边
    // document.getElementById("ArchivePageContentDetailsFolderURL").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制打开文件夹按钮贴左边
    // document.getElementById("ArchivePageContentDetailsEditor").style.left=(34+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品编辑按钮贴左边
    document.getElementById("ArchivePageContentDetailsBannerButtonContainer").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品编辑按钮贴左边

    document.getElementById('RecentViewEpisodePlayCard').style.display='none';document.getElementById('RecentViewEpisodePlayCardBack').style.display='none'; //自动关闭作品播放卡片

    setTimeout(() => {document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';}, 50);  //控制作品详情模糊背景高度自适应
  }
} 

// !页面滚动位置监听
document.getElementById('ArchivePageContent').addEventListener('scroll', (e)=>{
  ArchivePageContent_scrollTop  = e.target.scrollTop  
})

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
//! 简洁首页模式切换
function ToggleSimpleHomePage(command = 0){
  if (command == 0){ //切换简洁首页指令
    if (!sysdata.get("Settings.checkboxB.LocalStorageToggleSimpleHomePage")){ //如果未启用简洁首页则打开
      sysdata.set("Settings.checkboxB.LocalStorageToggleSimpleHomePage",true);
      document.getElementById("RecentViewRating").style.display="none";
      document.getElementsByClassName("RecentViewProgressContainer")[0].style.top="78%";
      document.getElementById("RecentViewDetail").style.display="none";
      OKErrorStreamer("OK","已启用简洁首页模式",0);
    } else {  //如果已启用简洁首页则关闭
      sysdata.set("Settings.checkboxB.LocalStorageToggleSimpleHomePage",false);
      document.getElementById("RecentViewRating").style.display="block";
      document.getElementsByClassName("RecentViewProgressContainer")[0].style.top="53%";
      document.getElementById("RecentViewDetail").style.display="block";
      OKErrorStreamer("OK","已关闭简洁首页模式",0);
    }
  } else if (command == 1){ //初始化简洁首页指令
    if (sysdata.get("Settings.checkboxB.LocalStorageToggleSimpleHomePage")){ //启用简洁首页
      document.getElementById("RecentViewRating").style.display="none";
      document.getElementsByClassName("RecentViewProgressContainer")[0].style.top="78%";
      document.getElementById("RecentViewDetail").style.display="none";
    } 
  }
}

//! 胶囊菜单-页面切换
function FloatBarAction(PageID) { //点击切换页面
  if(PageID == "Home"){
    ArchivePageContent_scrollTopFreeze = ArchivePageContent_scrollTop; //记录Archive页面滚动位置
    document.getElementById("HomePage").style.display="block";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="none";

    // *动态跟随进度背景图片启用
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemOpenLiveBackground")==true){
      document.getElementById('HomePageLiveBackground').style.opacity=0;
      const ffmpeg = nodeRequire('fluent-ffmpeg');
      fs.readdir(ffmpegUrl+"/portable_config/watch_later", function(err, files) {
        if (err) {return console.error('Unable to scan directory: ' + err);}
        // 获取每个文件的创建时间，并找出最新的文件
        let latestFile; let latestTime = 0;
        files.forEach(function(file) {
            const filePath = path.join(ffmpegUrl+"/portable_config/watch_later", file);
            const stat = fs.statSync(filePath);
            if (stat.ctimeMs > latestTime) {latestTime = stat.ctimeMs;latestFile = file;}
        });
        const history_data = fs.readFileSync(ffmpegUrl+'/portable_config/watch_later/'+latestFile, 'UTF-8');
        const lines = history_data.split(/\r?\n/)[0].match(/start=(\d+)\.\d+/);
        ffmpeg.setFfmpegPath(ffmpegUrl+"/ffmpeg.exe");
        ffmpeg(sysdata.get("Settings.checkboxC.LocalStorageRecentViewURL"))
        .screenshots({
          count: 1,
          folder: ffmpegUrl,
          filename: 'screenshot.png',
          timestamps: [lines[1]],
          size: '1920x1080'
        }).on("end",function(){
          setTimeout(function(){
          document.getElementById('HomePageLiveBackground').style.background="url('"+ffmpegUrl.replace(/\\/g, "/")+"/screenshot.png?v=" + Date.now()+"') no-repeat";
          document.getElementById('HomePageLiveBackground').style.backgroundSize='cover';
          document.getElementById('HomePageLiveBackground').style.opacity=1;},500);
          console.log("完成背景更新");
        })
      });
    }

    $('#Archive').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Archive.svg', function(data) { $('#ArchiveIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Archive原始图标
    $('#Torrnet').css({'color':'#fff',"background-color": ""});
    $.get('./assets/qbittorrent.svg', function(data) { $('#TorrentIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复torrent原始图标
    $('#Settings').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Settings.svg', function(data) { $('#SettingsIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Settings原始图标

    // document.getElementById("Home").style.border="3px solid rgb(240 145 153)";
    let HomeIconColor = 'rgb(240 145 153)'; // 这是默认的设置图标颜色
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    { HomeIconColor = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"); // 如果有自定义颜色，就使用自定义颜色
      //document.getElementById("Home").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    }
    // document.getElementById("Archive").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Torrnet").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Settings").style.border="3px solid rgb(66, 66, 66,0)";

    document.getElementById("Home").style.color=SettingsColorPicker(1);
    document.getElementById("Home").style.backgroundColor=SettingsColorPicker(0.1);
    // 动态加载 SVG 文件
    $.get('./assets/Home-fill.svg', function(data) { // 将 SVG 内容插入到页面中
      var svg = $(data).find('svg');  $('#HomeIcon').replaceWith(svg);
      $(svg).find('path').attr('fill', HomeIconColor); // 将所有 path 的颜色改为指定颜色
    }, 'xml');

  }
  else if(PageID == "Archive"){
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="block";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="none";
    if(!IfArchivePageIsInit){ArchivePageInit();IfArchivePageIsInit = true;
      if(sysdata.get("Settings.checkboxA.LocalStorageAutoUpdateArchive")){setTimeout(function(){LocalWorkScanModify()},2000)} //判断是否启用自动更新本地作品信息
      // 滚动到所有作品页
      $("#ArchivePageSwitchTab3").css('background', SettingsColorPicker(0.1));
      $("#ArchivePageSwitchTab3").css('color', SettingsColorPicker(1));
      $("#ArchivePageMainContent").css('transition', '');
      $("#ArchivePageMainContent").css('transform', 'translateX(-50%)');
      setTimeout(function() {$("#ArchivePageMainContent").css('transition', 'transform 0.5s cubic-bezier(0, 1.08, 0.58, 1)');}, 100);
      }//初始化ArchivePage同时记录打开状态

    // document.getElementById("Home").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Archive").style.border="3px solid rgb(240 145 153)";

    $('#Home').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Home.svg', function(data) { $('#HomeIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Home原始图标
    $('#Torrnet').css({'color':'#fff',"background-color": ""});
    $.get('./assets/qbittorrent.svg', function(data) { $('#TorrentIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复torrent原始图标
    $('#Settings').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Settings.svg', function(data) { $('#SettingsIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Settings原始图标

    let ArchiveIconColor = 'rgb(240 145 153)'; // 这是默认的设置图标颜色
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    { ArchiveIconColor = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"); // 如果有自定义颜色，就使用自定义颜色
      //document.getElementById("Archive").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    }
    // document.getElementById("Torrnet").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Settings").style.border="3px solid rgb(66, 66, 66,0)";

    document.getElementById("Archive").style.color=SettingsColorPicker(1);
    document.getElementById("Archive").style.backgroundColor=SettingsColorPicker(0.1);
    // 动态加载 SVG 文件
    $.get('./assets/Archive-fill.svg', function(data) { // 将 SVG 内容插入到页面中
      var svg = $(data).find('svg');  $('#ArchiveIcon').replaceWith(svg);
      $(svg).find('path').attr('fill', ArchiveIconColor); // 将所有 path 的颜色改为指定颜色
    }, 'xml');

    // 滚动到上次位置
    $('#ArchivePageContent').animate({scrollTop: ArchivePageContent_scrollTopFreeze},70)  
    // document.getElementById('ArchivePageContent').scrollTop = ArchivePageContent_scrollTopFreeze;
  }
  else if(PageID == "Torrnet"){
    ArchivePageContent_scrollTopFreeze = ArchivePageContent_scrollTop; //记录Archive页面滚动位置
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="block";
    document.getElementById("SettingsPage").style.display="none";

    // document.getElementById("Home").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Archive").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Torrnet").style.border="3px solid rgb(240 145 153)";

    $('#Home').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Home.svg', function(data) { $('#HomeIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Home原始图标
    $('#Archive').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Archive.svg', function(data) { $('#ArchiveIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Archive原始图标
    $('#Settings').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Settings.svg', function(data) { $('#SettingsIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Settings原始图标


    let qBitIconColor = 'rgb(240 145 153)'; // 这是默认的设置图标颜色
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    { qBitIconColor = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"); // 如果有自定义颜色，就使用自定义颜色
      //document.getElementById("Torrnet").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    }
    //document.getElementById("Settings").style.border="3px solid rgb(66, 66, 66,0)";

    document.getElementById("Torrnet").style.color=SettingsColorPicker(1);
    document.getElementById("Torrnet").style.backgroundColor=SettingsColorPicker(0.1);
    // 动态加载 SVG 文件
    $.get('./assets/qbittorrent-fill.svg', function(data) { // 将 SVG 内容插入到页面中
      var svg = $(data).find('svg');  $('#TorrentIcon').replaceWith(svg);
      $(svg).find('path').attr('fill', qBitIconColor); // 将所有 path 的颜色改为指定颜色
    }, 'xml');
  }
  else if(PageID == "Settings"){
    ArchivePageContent_scrollTopFreeze = ArchivePageContent_scrollTop; //记录Archive页面滚动位置
    document.getElementById("HomePage").style.display="none";
    document.getElementById("ArchivePage").style.display="none";
    document.getElementById("TorrnetPage").style.display="none";
    document.getElementById("SettingsPage").style.display="block";

    // document.getElementById("Home").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Archive").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Torrnet").style.border="3px solid rgb(66, 66, 66,0)";
    // document.getElementById("Settings").style.border="3px solid rgb(240 145 153)";
    
    $('#Home').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Home.svg', function(data) { $('#HomeIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Home原始图标
    $('#Archive').css({'color':'#fff',"background-color": ""});
    $.get('./assets/Archive.svg', function(data) { $('#ArchiveIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复Archive原始图标
    $('#Torrnet').css({'color':'#fff',"background-color": ""});
    $.get('./assets/qbittorrent.svg', function(data) { $('#TorrentIcon').replaceWith($(data).find('svg'));}, 'xml'); // 恢复torrent原始图标

    let SettingsIconColor = 'rgb(240 145 153)'; // 这是默认的设置图标颜色
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"))
    { SettingsIconColor = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"); // 如果有自定义颜色，就使用自定义颜色
      //document.getElementById("Settings").style.border="3px solid "+sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    }

    document.getElementById("Settings").style.color=SettingsColorPicker(1);
    document.getElementById("Settings").style.backgroundColor=SettingsColorPicker(0.1);
    // 动态加载 SVG 文件
    $.get('./assets/Settings.svg', function(data) { // 将 SVG 内容插入到页面中
      var svg = $(data).find('svg');  $('#SettingsIcon').replaceWith(svg);
      $(svg).find('path').attr('fill', SettingsIconColor); // 将所有 path 的颜色改为指定颜色
    }, 'xml');

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
    if(sysdata.get("Settings.checkboxA.LocalStorageUseSystemPlayer")){ //使用系统默认播放器
      // 规范化路径，确保兼容性
      DirectvideoPath = path.normalize(RecentViewURL);
      // 构建命令，使用系统默认程序打开文件
      let command = `start "" "${DirectvideoPath}"`;
      // 执行命令，拉起系统应用选择器
      exec(command, (error) => {
          if (error) {
            OKErrorStreamer("Error","无法打开视频文件",0);
          } else {
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
            OKErrorStreamer("OK","开始使用系统播放器播放，已记录进度",0);
          }
      });
    }
    else {
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
            mpvPlayer.start()
            .then(() => {
              mpvPlayer.load(RecentViewURL);// player is running
            })
            // mpvPlayer.load(RecentViewURL);
            }
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
            mpvPlayer.start()
            .then(() => {
              mpvPlayer.load(RecentViewURL);// player is running
            })
            // mpvPlayer.load(RecentViewURL);
            }
        });
      }
    })
    process.noAsar = false; //恢复fs对ASAR读取
    }
  }
}

// TODO Media Archive Relavant Function Start

//! 媒体库-目录全局扫描模块 媒体库-目录增量扫描模块
const { LocalWorkScan,LocalWorkScanModify } = nodeRequire('./js/Mainpage_Modules/MainpageArchiveScanner.js'); //?引入bgm.res主界面的本地媒体库扫描函数封装

//! 媒体库-页面初始化模块
function ArchivePageInit(){
  OKErrorStreamer("MessageOn","正在加载媒体库",0); //加载提示
  // *Archive Get <!--格式化ArchivePage媒体库内容-->
  if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")){
    document.getElementById("ArchivePageSum").innerText="共 "+(parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))-parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"))).toString()+" 部作品";}
    var MediaBaseNumberGet = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");//localStorage.getItem("LocalStorageMediaBaseNumber");
    document.getElementById('ArchivePageContent').innerHTML="";
    if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")==0 || !sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))
    {document.getElementById('ArchivePageContent').innerHTML="<div style='position:absolute;left:25%;right:25%;top:30%;bottom:30%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3vmin'>暂时没有作品，请前往「设置」选项卡设置正确的媒体库地址后点击右上角菜单中的「全局扫描」按钮来更新媒体库</div>";OKErrorStreamer("MessageOff","正在加载媒体库",0);OKErrorStreamer("Error","暂无媒体！",0);return}
    var MediaBaseScanCounter = 1;
    // requestAnimationFrame(ArchivePageInitCore);
    OKErrorStreamer("MessageOn","正在加载媒体库 0%",0);
    var MediaBaseTempDataSaver = store.get();
    ArchivePageInitCore();
    // *扫描作品bgmID获取作品信息
    function ArchivePageInitCore(){
    // for(let MediaBaseScanCounter=1;MediaBaseScanCounter<=MediaBaseNumberGet;MediaBaseScanCounter++){
      if(MediaBaseScanCounter>MediaBaseNumberGet) {OKErrorStreamer("MessageOff","媒体库加载完成！",0);OKErrorStreamer("OK","媒体库加载完成！",0);return;}
      OKErrorStreamer("MessageOn","正在加载媒体库"+parseInt(MediaBaseScanCounter*100/MediaBaseNumberGet)+"%",0); //加载提示
      if(MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["ExistCondition"] == "Deleted") {;} //发现已删除作品，自动跳过
      else{

      // *计算作品进度信息
      let ArchiveCardWatchPercentSaver = 0;let ArchiveCardWatchPercentRightBorder='4px';let ArchiveCardWatchPercentRightTopBorder = '4px';
      for(let Tempi=1;Tempi<=parseInt(MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["EPTrueNum"]);Tempi++){
        if(MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()].EPDetails["EP"+Tempi].Condition=='Watched') ArchiveCardWatchPercentSaver++;
      } ArchiveCardWatchPercentSaver = (ArchiveCardWatchPercentSaver/parseInt(MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["EPTrueNum"]))*100
      if(ArchiveCardWatchPercentSaver==100) {ArchiveCardWatchPercentRightBorder='0';ArchiveCardWatchPercentRightTopBorder = '8px';}
      if(!sysdata.get("Settings.checkboxB.LocalStorageMediaShowProgress")){ArchiveCardWatchPercentSaver = 0} //若禁用进度条，设定长度为0

      var ArchiveCoverPNG = "ArchiveCover.png"; var ArchiveBDMVTag = "none"; //默认关闭BDMV标志
      if (MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["BDMV"] == "BDMV") 
        {ArchiveCoverPNG = "ArchiveCoverBDMV.png"; ArchiveBDMVTag = "block"} //BDMV封面

      $("#ArchivePageContent").append( "<div id='ArchiveWorkNo"+MediaBaseScanCounter.toString()+"' class='ArchiveCardHover' style='background:url(\""+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Cover"]+"\") no-repeat top;background-size:cover;'>"+
      "<div class='ArchiveCardThumb' style='background:url(./assets/"+ArchiveCoverPNG+") no-repeat center;background-size:cover;'></div>"+ //封面遮罩阴影
      "<div class='ArchivePageBDMVTag' style='display:"+ArchiveBDMVTag+"'>BDMV</div>"+ //BDMV标志
      "<div id='ArchiveCardProgressShowerNo"+MediaBaseScanCounter.toString()+"' class='ArchiveCardProgressShower' style='width:"+ArchiveCardWatchPercentSaver+"%;border-top-right-radius: "+ArchiveCardWatchPercentRightTopBorder+";border-bottom-right-radius: "+ArchiveCardWatchPercentRightBorder+";background-color:"+SettingsColorPicker(0.8)+";'></div>"+ //进度指示
      "<div class='ArchiveCardTitle'>"+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Name"]+"</div>"+ //名称
      "<div class='ArchiveCardRateStar'>⭐&nbsp;"+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Score"]+"</div>"+ //评分
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:22%;left:5%;right:5%;text-align:center;font-style:italic;'>"+
      MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Type"]+"&nbsp;"+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Eps"]+"话&nbsp;"+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Year"]+"</div>"+ //资料A
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:12%;left:40%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>原作 "+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Protocol"]+"</div>"+ //制作原案
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>"+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Director"]+"</div>"+ //制作监督
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:5%;right:50%;text-align:left;color: rgba(255, 255, 255, 0.79);'>"+MediaBaseTempDataSaver["WorkSaveNo"+MediaBaseScanCounter.toString()]["Corp"]+"</div>"+ //制作公司
      "<div style='border-radius: 8px;transition: all 0.5s;left:0%;right:0%;top:0%;bottom:0%;position:absolute;' onclick='ArchiveMediaDetailsPage("+MediaBaseScanCounter+")'></div>"+ // 点击触发区域
      // "<div class='ArchiveCardDirectorYearCorp' style='font-family:bgmUIHeavy;top:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);z-index:20;' onclick='ArchiveContentEditer("+MediaBaseScanCounter.toString()+");'>编辑</div>"+ //编辑按键
      "<div class='ArchivePageQuickConfig' onclick='ArchiveContentEditer("+MediaBaseScanCounter.toString()+");' title='快速编辑'><img src='./assets/menu.png' style='width:80%'></div>"+ //快速编辑
      "</div>" );
    }MediaBaseScanCounter+=1;ArchivePageInitCore();//requestAnimationFrame(ArchivePageInitCore);
    // cancelAnimationFrame(ArchivePageInitCore);
  }
}

//! 媒体库-页面切换模块
function ArchivePageSwitch(PageID){

  for(let temp1 = 1;temp1!=5;temp1++) 
    {
      if (temp1==PageID) {$("#ArchivePageSwitchTab"+String(temp1)).css('background', SettingsColorPicker(0.1));
      $("#ArchivePageSwitchTab"+String(temp1)).css('color', SettingsColorPicker(1)) 
    } 
      else {$("#ArchivePageSwitchTab"+String(temp1)).css('background', '');$("#ArchivePageSwitchTab"+String(temp1)).css('color','aliceblue')}
    }
  switch(PageID){
    case 1:$("#ArchivePageMainContent").css('transform', 'translateX(0%)');break;
    case 2:$("#ArchivePageMainContent").css('transform', 'translateX(-25%)');break;
    case 3:$("#ArchivePageMainContent").css('transform', 'translateX(-50%)');break;
    case 4:$("#ArchivePageMainContent").css('transform', 'translateX(-75%)');break;
  }
  if(PageID==4&&ArchivePageTimelineContentOpened==0) {
    $.ajax({ //获取用户信息
      url: "https://api.bgm.tv/calendar",type: 'GET',timeout : 2000,
      success: function (data) {
        var Weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        for (let temp1 = 0; temp1 < 7; temp1++) {
          for (let temp2 = 0; temp2 < data[temp1]["items"].length; temp2++) {
            if(temp1==0 || temp1==6){ //周末周一的2号占位卡片填充，使用户永远可以看到任意日期前后的时间线
              $('#ArchivePageTimelineContent'+Weekdays[temp1]+'2Ani').append( "<div class='ArchiveCardCharacterHover'style='height: 100%;margin: 0;margin-right: 20px;flex:unset'"+
                "onclick=\"\""+"><div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+data[temp1]["items"][temp2]["images"]["large"]+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
                "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;padding-right:20px;white-space:nowrap;font-size:14.5px;'>"+
                "<b>"+data[temp1]["items"][temp2]["name"]+"<br>"+data[temp1]["items"][temp2]["name_cn"]+"</b><br>On Air: "+data[temp1]["items"][temp2]["air_date"]+"</div></div>")
            }
            $('#ArchivePageTimelineContent'+Weekdays[temp1]+'Ani').append( "<div class='ArchiveCardCharacterHover'style='height: 100%;margin: 0;margin-right: 20px;flex:unset'"+
              "onclick=\"shell.openExternal('"+data[temp1]["items"][temp2]["url"]+"');\""+"><div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+data[temp1]["items"][temp2]["images"]["large"]+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
              "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;padding-right:20px;white-space:nowrap;font-size:14.5px;'>"+
              "<b>"+data[temp1]["items"][temp2]["name"]+"<br>"+data[temp1]["items"][temp2]["name_cn"]+"</b><br>On Air: "+data[temp1]["items"][temp2]["air_date"]+"</div></div>")
          }
        }
        //获取今天星期
        var WeekToday = new Date().getDay();
        setTimeout(function(){ //延迟加载，等待动画完成
        let AnimateTargetTimelineContent = document.getElementById('ArchivePageTimelineContent'+Weekdays[WeekToday-1]).offsetTop-130;
        $('#ArchivePageTimelineContent').animate({scrollTop: AnimateTargetTimelineContent},600) //滚动到当前星期
        $('#ArchivePageTimelineContent'+Weekdays[WeekToday-1]).css({'transform':'scale(1.06) translateX(3%)',
          'color': SettingsColorPicker(1),
          'background': SettingsColorPicker(0.1) });
        // 动态加载 SVG 文件
        $.get('./assets/calendar.svg', function(data) { // 将 SVG 内容插入到页面中
          var svg = $(data).find('svg');  $('#ArchivePageTimelineContentIcon'+Weekdays[WeekToday-1]).replaceWith(svg);
          $(svg).find('path').attr('fill', SettingsColorPicker(1)); // 将所有 path 的颜色改为指定颜色
        }, 'xml');
        }, 1000);
        ArchivePageTimelineContentOpened = 1;
      }

    });
  };
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
const { ArchivePageMediaSearch } = nodeRequire('./js/Mainpage_Modules/MainpageArchiveSearch.js'); //?引入bgm.res主界面的本地媒体库搜索函数封装

//! 媒体库-作品设置模块 媒体库-作品设置-存储API 媒体库作品设置-作品删除
const { ArchiveContentEditer,StoreSave,StoreDeleteWork } = nodeRequire('./js/Mainpage_Modules/MainpageArchiveSettings.js'); //?引入bgm.res主界面的本地媒体库设置函数封装

//! 媒体库-作品数据信息链接BGM更新模块(所有作品) 媒体库-作品数据信息链接BGM更新模块(指定作品ID范围) 
const { ArchiveMediaUpdate,ArchiveMediaUpdateSingle } = nodeRequire('./js/Mainpage_Modules/MainpageArchiveInfUpdate.js'); //?引入bgm.res主界面的本地媒体库信息更新函数封装

//! 媒体库-新增作品模块
const { LocalWorkManualAddAndSave } = nodeRequire('./js/Mainpage_Modules/MainpageArchiveAdder.js'); //?引入bgm.res主界面的本地媒体库新增作品函数封装

// TODO Media Archive Details Relavant Function Start

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
  document.getElementById("ArchivePageContentDetailsContentBlock").innerHTML=""; //清空ContentBlock
  document.getElementById("ArchivePageContentDetailsFriendNum").innerHTML="还没有好友看过"; //清空FriendNum
  document.getElementById("ArchivePageContentDetailsFriendStd").innerHTML="暂无标准差"; //清空FriendStd
  document.getElementById("ArchivePageContentDetailsFriendsInfo").innerHTML=""; //清空FriendsInfo
  document.getElementById("ArchivePageContentDetailsFriendScore").innerHTML="-.-"; //清空FriendScore
  document.getElementById("ArchivePageContentDetailsFriendRank").innerHTML="暂无评价"; //清空FriendRank
  
  //?填充BDMV标志
  var ArchiveInfoCoverPNG = "display:none"; var ArchiveInfoBDMVTag = "none"; //默认关闭BDMV标志
  document.getElementById("ArchivePageContentDetailsEpisodeBlockContainer").style.display = "block"; //显示章节详情
  document.getElementById("ArchivePageContentDetailsBDMVBanner").style.display = "none"; //默认屏蔽BDMV横幅
  document.getElementById('ArchivePageContentDetailsSelfRankBlock').style.marginTop='6.5%';
  if (store.get("WorkSaveNo"+MediaID+".BDMV") == "BDMV") {
    ArchiveInfoCoverPNG = "background:url(./assets/ArchiveInfoBDMV.png) no-repeat center;background-size:cover;opacity:1"; 
    document.getElementById("ArchivePageContentDetailsEpisodeBlockContainer").style.display = "none"; //对于BDMV屏蔽章节详情
    document.getElementById("ArchivePageContentDetailsBDMVBanner").style.display = "flex"; //显示BDMV横幅
    document.getElementById('ArchivePageContentDetailsSelfRankBlock').style.marginTop='2%';
    ArchiveInfoBDMVTag = "block";} //BDMV封面

  //?填充标题&评分条UI
  $("#ArchivePageContentDetailsTitleBlock").append(
    "<div id='ArchivePageContentDetailsCover' class='ArchiveCardHover' style='position:absolute;top:7%;height:86%;left:17%;width:auto;aspect-ratio:3/4;margin:2%' onclick='shell.openExternal(\"https://bgm.tv/subject/"+store.get("WorkSaveNo"+MediaID+".bgmID")+"\");'><div class='ArchiveCardThumb' style='"+ArchiveInfoCoverPNG+"'></div></div>"+
    "<div id='ArchivePageContentDetailsTitle' class='RecentViewName' style='height:auto;top:15%;font-size:min(3vw, 45px);right:max(25%, 270px);overflow: hidden;display: -webkit-box; text-overflow: ellipsis; -webkit-box-orient: vertical;-webkit-line-clamp: 2;   '>未知作品</div>"+
    "<div id='ArchivePageContentDetailsTitleJp' class='RecentViewName' style='height:auto;top:15%;font-size:min(1.5vw,30px);right:max(25%, 270px);overflow: hidden;display: -webkit-box; text-overflow: ellipsis; -webkit-box-orient: vertical;-webkit-line-clamp: 2;   '>不明な作品</div>"+
    "<div id='ArchivePageContentDetailsBannerButtonContainer' style='position: absolute;width: 30%;height: auto;left: 38.5787%;top: 80%;bottom: 0%;max-width: 500px;display: flex;align-content: stretch;align-items: stretch;flex-direction: row;'>"+
      "<div id='ArchivePageContentDetailsFolderURL' class='ArchivePageButton' style='position:relative;top:80%;bottom:0%;height:auto;font-size:2.3vmin;-webkit-app-region:unset;border-top-right-radius: 0px; border-bottom-right-radius: 0px;border:unset;top: 0%;width: 40%;bottom: 0%;height: auto;backdrop-filter: none;' onclick=\"exec('explorer "+store.get("WorkSaveNo"+MediaID+".URL").replace(/(\\)/g,"\\\\").replace(/(&)/g,"^&").replace(/(')/g,'\\\'')+"');\"><img src='./assets/folder.svg' alt='folder' height=45% style='margin-right:5px;'/>打开文件夹</div>"+
      "<div id='ArchivePageContentDetailsEditor' class='ArchivePageButton' style='position:relative;top:80%;width:3%;bottom:0%;height:auto;font-size:2.3vmin;-webkit-app-region:unset;border-top-left-radius: 0px; border-bottom-left-radius: 0px;border:unset;top: 0%;width: 11%;bottom: 0%;height: auto;backdrop-filter: none;' onclick='ArchiveContentEditer("+MediaID.toString()+");'><img src='./assets/edit.svg' alt='edit' height=40% style='margin:5px;'/></div>"+
      "<div id='ArchivePageContentDetailsRelavant' class='ArchivePageContentDetailsRelavant'><div id='ArchivePageContentDetailsRelavantCover' style='position:absolute;top:0%;height:100%;width:30%;left: 0%;border-radius:10px;border-top-right-radius: 0px; border-bottom-right-radius: 0px;' ></div>"+
      "<div id='ArchivePageContentDetailsRelavantName' style='width: 60%;overflow: hidden;-webkit-box-orient: vertical;-webkit-line-clamp: 2;display: -webkit-box;position: absolute;right: 5%;margin-top: 5px;text-align:left;font-size:15px'></div></div>"+
    "</div>"+
    
    //评分系统
    "<div id='ArchivePageContentDetailsRating' class='RecentViewRating' style='padding:0;height:95%;max-width: 300px;min-width: 220px;'>"+
    "<div id='ArchivePageContentDetailsRatingScorePrevious' style='position:relative;right:0%;width:100%;font-size: 8vmin;font-family:bgmUIHeavy;text-align: right;'>"+
    "<div id='ArchivePageContentDetailsRatingRank' class='boxBlank' style='/*border: 1px dashed rgb(155, 155, 155);*/background-color: rgba(0, 0, 0, 0.292);top:15%;font-size: 1.9vmin;font-family:bgmUI;height: 25%;width:32%;left:4%;backdrop-filter: blur(10px);box-shadow:none;display: flex;justify-content: center;align-items: center;'>NO.Null</div>"+
    "<div id='ArchivePageContentDetailsRatingPos' class='boxBlank' style='/*border: 1px dashed rgb(155, 155, 155);*/background-color: rgba(0, 0, 0, 0.292);bottom:20%;font-size: 2vmin;font-family:bgmUI;height: 25%;width:32%;left:4%;backdrop-filter: blur(10px);box-shadow:none;display: flex;justify-content: center;align-items: center;'>NoRank</div>"+
    "<div id='ArchivePageContentDetailsRatingScore'>0.0</div></div>"+"<div style='position:relative;height:40%;width:100%;bottom:0%;margin-top:14%'>"+
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

  //?填充评分&标准差&检测是否为当季新番
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID.toString(), function(data){
    // var ArchivePageContentDetailsRatingScore =document.createTextNode(data.rating.score.toFixed(1));
    document.getElementById("ArchivePageContentDetailsRatingScore").innerText=data.rating.score.toFixed(1);//.appendChild(ArchivePageContentDetailsRatingScore);
    store.set("WorkSaveNo"+MediaID.toString()+".Score",data.rating.score); 
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
      else if(data.rating.score > 1.5) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="很差";}
      else if(data.rating.score >= 1) {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="不忍直视";}
      else {document.getElementById("ArchivePageContentDetailsRatingPos").innerText="暂无评分";}
    // 作品等级判定OVER
    // 填充一分一段表，打分信息
    var ScoreAverage = 0;var ScoreSD = 0;
    for(let Tempi = 1;Tempi<=10;Tempi++){
      document.getElementById('ArchivePageContentDetailsScoreBarNo'+Tempi.toString()).style.height=((data.rating.count[Tempi]/data.rating.total)*100).toString()+'%'
      ScoreAverage+=Tempi*data.rating.count[Tempi];
    }document.getElementById('ArchivePageContentDetailsScoreRatePeople').innerText=data.collection.wish+'想看/'+data.collection.collect+'看过/'+data.collection.doing+'在看/'+data.collection.on_hold+'搁置/'+data.collection.dropped+'抛弃'
    
    // 检查是否为当季新番
    document.getElementById('ArchivePageContentDetailsAutoEPBanner').style.display='none';
    // document.getElementById('ArchivePageContentDetailsSelfRankBlock').style.marginTop='6.5%';
    let CurrMonth = new Date().getMonth()+1;
    let CurrYear = new Date().getFullYear();
    if (data.date == null) data.date = "1368-01-23";
    let CurrSeason = Math.floor( (CurrMonth%3 == 0 ? (CurrMonth/3):(CurrMonth/3 + 1) ) )
    let AnimeSeason = Math.floor( (parseInt(data.date.substr(5,2))%3 == 0 ? (parseInt(data.date.substr(5,2))/3):(parseInt(data.date.substr(5,2))/3 + 1) ) )
    if(CurrSeason == AnimeSeason && parseInt(CurrYear) == parseInt(data.date.substr(0,4)))
    {
      document.getElementById('ArchivePageContentDetailsAutoEPBanner').style.display='flex';
      document.getElementById('ArchivePageContentDetailsSelfRankBlock').style.marginTop='2%';
      store.set("WorkSaveNo"+MediaID+".EPAutoUpdate",true);
    }
    if (store.get("WorkSaveNo"+MediaID+".BDMV") == "BDMV")  //给BDMV标头擦屁股
      {document.getElementById('ArchivePageContentDetailsSelfRankBlock').style.marginTop='2%';}

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
    }).done(function() { OKErrorStreamer("OK","加载作品信息完成",0); }).fail(function() { document.getElementById("ArchivePageContentDetailsRatingScore").innerText=('0.0'/*document.createTextNode('0.0')*/);OKErrorStreamer("Error","无法连接Bangumi",0); });
    
  //?填充EP选集列表
  if (sysdata.get("Settings.checkboxA.LocalStorageAutoUpdateMediaInfo")==true || store.get("WorkSaveNo"+MediaID+".EPAutoUpdate")==true) //判断是否自动更新EP信息
  {
    OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在更新EP信息，请稍后</div>",0);
    setTimeout(function(){
      LocalWorkEpsScanModule(MediaID);
      for(let TempCounter = 1;TempCounter<=store.get("WorkSaveNo"+MediaID+".EPTrueNum");TempCounter++){
        $("#ArchivePageContentDetailsEpisodeBlock").append( "<div id='ArchivePageContentDetailsEpisodeNo"+TempCounter+"' class='ArchiveCardHover' "+
        "style='width:100%;height:100%;padding:0px;font-family: bgmUIHeavy;font-size:25px;text-align:center;display:flex;justify-content:center;align-items:center;transition:all 0.3s cubic-bezier(0,0,0.2,1);box-shadow:0px 0px 0px 0px #ffffff4a;background-color:rgb(0,0,0,0.3);/*backdrop-filter: blur(30px)*/' onclick='ArchiveMediaDetailsEpInfoCard(event,"+MediaID+","+TempCounter+",\"EP\");'>"+"EP "+TempCounter+"</div>" );
        //width:12.1%;height:4vw;padding:2px;
        //检测是否已播放过
        if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition')=='Watched'){
          document.getElementById('ArchivePageContentDetailsEpisodeNo'+TempCounter).style.backgroundColor=SettingsColorPicker(0.4);
          document.getElementById('ArchivePageContentDetailsEpisodeNo'+TempCounter).style.boxShadow='0px 0px 0px 2px '+SettingsColorPicker(0.4)} //' rgb(240 145 153)'
      } 
      ArchivePageMediaProgressCalc(MediaID);OKErrorStreamer("MessageOff","<div class='LoadingCircle'></div>",0);OKErrorStreamer("OK","已更新EP信息",0);//刷新外部进度条
    },5);//更新EP信息
  }
  else{
    for(let TempCounter = 1;TempCounter<=store.get("WorkSaveNo"+MediaID+".EPTrueNum");TempCounter++){
      $("#ArchivePageContentDetailsEpisodeBlock").append( "<div id='ArchivePageContentDetailsEpisodeNo"+TempCounter+"' class='ArchiveCardHover' "+
      "style='width:100%;height:100%;padding:0px;font-family: bgmUIHeavy;font-size:25px;text-align:center;display:flex;justify-content:center;align-items:center;transition:all 0.3s cubic-bezier(0,0,0.2,1);box-shadow:0px 0px 0px 0px #ffffff4a;background-color:rgb(0,0,0,0.3);/*backdrop-filter: blur(30px)*/' onclick='ArchiveMediaDetailsEpInfoCard(event,"+MediaID+","+TempCounter+",\"EP\");'>"+"EP "+TempCounter+"</div>" );
      //width:12.1%;height:4vw;padding:2px;
      //检测是否已播放过
      if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition')=='Watched'){
        document.getElementById('ArchivePageContentDetailsEpisodeNo'+TempCounter).style.backgroundColor=SettingsColorPicker(0.4);
        document.getElementById('ArchivePageContentDetailsEpisodeNo'+TempCounter).style.boxShadow='0px 0px 0px 2px '+SettingsColorPicker(0.4)} //' rgb(240 145 153)'
    } 
  }
  //?填充SP选集列表
  if(!store.get("WorkSaveNo"+MediaID+".SPTrueNum") || store.get("WorkSaveNo"+MediaID+".SPTrueNum")==0){document.getElementById('ArchivePageContentDetailsSpecialEpisodeBlock').style.display='none';} //若没有SP就不显示
  else {document.getElementById('ArchivePageContentDetailsSpecialEpisodeBlock').style.display='grid';}
  for(let TempCounter = 1;TempCounter<=store.get("WorkSaveNo"+MediaID+".SPTrueNum");TempCounter++){
    $("#ArchivePageContentDetailsSpecialEpisodeBlock").append( "<div id='ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"' class='ArchiveCardHover' "+
    "style='width:100%;height:100%;padding:0px;font-family: bgmUIHeavy;font-size:25px;text-align:center;display:flex;justify-content:center;align-items:center;transition:all 0.3s cubic-bezier(0,0,0.2,1);box-shadow:0px 0px 0px 0px #ffffff4a;background-color:rgb(0,0,0,0.3);/*backdrop-filter: blur(30px)*/' onclick='ArchiveMediaDetailsEpInfoCard(event,"+MediaID+","+TempCounter+",\"SP\");'>"+"SP "+TempCounter+"</div>" );
    //width:12.1%;height:4vw;padding:2px;
    //检测是否已播放过
    if(store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+'.Condition')=='Watched'){
      document.getElementById('ArchivePageContentDetailsSpecialEpisodeNo'+TempCounter).style.backgroundColor=SettingsColorPicker(0.4);
      document.getElementById('ArchivePageContentDetailsSpecialEpisodeNo'+TempCounter).style.boxShadow='0px 0px 0px 2px '+SettingsColorPicker(0.4)} //' rgb(240 145 153)'
  } 

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
            else if(SelfScoreVal > 1.5) {document.getElementById("ArchivePageContentDetailsSelfRankBlockRate").innerText="很差";}
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
  } else{document.getElementById('ArchivePageContentDetailsSelfRankBlockComment').innerText='您还未登录，无法获取评价'/* OKErrorStreamer("Error","您还未登录",0); */}

  //?播放进度同步至本地
  if(sysdata.get("UserData.userpageProgressSyncOptions")=='Cloud'||sysdata.get("UserData.userpageProgressSyncOptions")=='Mix'){
    $.ajax({ //获取用户信息
      url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID.toString()+"/episodes?offset=0&episode_type=0",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
      success:function(data){let SyncEPNum=null;  if (parseInt(store.get("WorkSaveNo"+MediaID+".EPTrueNum"))>parseInt(store.get("WorkSaveNo"+MediaID+".Eps"))) {SyncEPNum = store.get("WorkSaveNo"+MediaID+".Eps");} 
      else {SyncEPNum = store.get("WorkSaveNo"+MediaID+".EPTrueNum");}
      console.log("总数"+SyncEPNum)
      $.ajax({ //获取用户信息
        url: "https://api.bgm.tv/v0/me",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
        success: function (data2) {
        $.ajax({ //获取收藏信息
          url: "https://api.bgm.tv/v0/users/"+data2.username+"/collections/"+bgmID,type: 'GET',dataType: "json",headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
          success: function () {
            console.log("收藏的作品-拉取云端");
            if(1){ //如果未收藏，不继续尝试同步
            for(let tempi = 1;tempi<=SyncEPNum;tempi++){
              if(data.data[tempi-1].type==2){
                store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+tempi+'.Condition',"Watched")
                document.getElementById('ArchivePageContentDetailsEpisodeNo'+tempi).style.boxShadow='0px 0px 0px 2px '+SettingsColorPicker(1)} //' rgb(240 145 153)'
              if(data.data[tempi-1].type==0&&sysdata.get("UserData.userpageProgressSyncOptions")=='Cloud'){
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
            //再次检测是否已播放过
            for(let TempCounter = 1;TempCounter<=store.get("WorkSaveNo"+MediaID+".EPTrueNum");TempCounter++){
              if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition')=='Watched'){document.getElementById('ArchivePageContentDetailsEpisodeNo'+TempCounter).style.boxShadow='0px 0px 0px 2px '+SettingsColorPicker(1)} //' rgb(240 145 153)'
            } 
            ArchivePageMediaProgressCalc(MediaID);OKErrorStreamer("OK","加载作品信息完成,与云端同步成功",0);
            }
          }});}});
        }
    });
  }
  //?播放进度同步至云端
  if(sysdata.get("UserData.userpageProgressSyncOptions")=='Local'){ //如果设置为本地同步
    let SyncEPNum=null;  if (store.get("WorkSaveNo"+MediaID+".EPTrueNum")>store.get("WorkSaveNo"+MediaID+".EPs")) SyncEPNum = store.get("WorkSaveNo"+MediaID+".EPs"); else SyncEPNum = store.get("WorkSaveNo"+MediaID+".EPTrueNum");
    $.ajax({
      url: "https://api.bgm.tv/v0/users/-/collections/"+bgmID.toString()+"/episodes?offset=0&episode_type=0",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""},timeout : 2000,
      success:function(data){
        $.ajax({ //获取用户信息
          url: "https://api.bgm.tv/v0/me",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
          success: function (data2) {
          $.ajax({ //获取收藏信息
            url: "https://api.bgm.tv/v0/users/"+data2.username+"/collections/"+bgmID,type: 'GET',dataType: "json",headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
            success: function () {
              console.log("收藏的作品-同步云端");
              if(1){ //如果未收藏，不继续尝试同步
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
              }
            }});}});
          }
    });
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
      $("#ArchivePageContentDetailsStaffBlock").append("<div id='ArchivePageContentDetailsStaffNickName'style='width:100%;margin:5px;margin-top:10px;margin-left:0px;'>"+data.infobox[Tempj].key+': </div>');
      for(let Tempk = 0;Tempk!=data.infobox[Tempj].value.length;Tempk++)$("#ArchivePageContentDetailsStaffNickName").append(data.infobox[Tempj].value[Tempk].v+"&nbsp;&nbsp;");}
    else $("#ArchivePageContentDetailsStaffBlock").append("<div style='width:100%;margin:5px;margin-top:10px;margin-left:0px;'>"+data.infobox[Tempj].key+': '+data.infobox[Tempj].value+"</div>");}

  }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';})
  .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});

  //?填充相关作品
  if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowRelative")){ //判断是否显示相关作品
  $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID+"/subjects", function(data){
    for(let Tempj = 0;Tempj!=data.length;Tempj++){
      if(data[Tempj].type==2&&!/衍生|角色|世界观|番外/i.test(data[Tempj].relation)){document.getElementById("ArchivePageContentDetailsRelavant").style.display='block';
      document.getElementById("ArchivePageContentDetailsRelavant").title=data[Tempj].name_cn;
      $("#ArchivePageContentDetailsRelavant").attr('onclick','window.open("https://bgm.tv/subject/'+data[Tempj].id+'")');
      document.getElementById("ArchivePageContentDetailsRelavantCover").style.background="url('"+data[Tempj].images.small+"') no-repeat center";
      if(data[Tempj].images.small==null) document.getElementById("ArchivePageContentDetailsRelavantCover").style.background="url('./assets/no_img.gif') no-repeat center"; //如果没有图片就用默认图片
      document.getElementById("ArchivePageContentDetailsRelavantCover").style.backgroundSize="cover";
      document.getElementById("ArchivePageContentDetailsRelavantName").innerHTML=data[Tempj].relation+"<br/>"+data[Tempj].name_cn;
      for(let Temp = 1;Temp<=sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");Temp++){
        if(store.get("WorkSaveNo"+Temp+".ExistCondition")=='Exist'&&store.get("WorkSaveNo"+Temp+".bgmID")==data[Tempj].id)
        {$("#ArchivePageContentDetailsRelavant").attr('onclick','ArchiveMediaDetailsPage('+Temp+')');break;}
      } break;
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
        "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;white-space:nowrap;font-size:1.5vw;font-size:min(1.5vw, 21px);'><b>"+Chara_Data[Tempj].name+"<br/>("+Chara_Data_NameCN+")</b><br/>"+Chara_Data[Tempj].relation+Chara_Data_CV+"</div>");
        $(document.getElementsByName('ArchiveMediaDetailsPageCharacterCard')[Tempj]).attr('onclick','window.open(\"https://bgm.tv/character/'+Chara_Data[Tempj].id+'\");');
      }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});
    }
    for(let Tempj=0;Tempj!=data.length;Tempj++){
      $("#ArchivePageContentDetailsCharacterBlock").append( "<div class='ArchiveCardCharacterHover' name='ArchiveMediaDetailsPageCharacterCard'></div>");
      ArchiveMediaDetailsPageCharacterFiller(Tempj);}

  }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';})
  .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});
  }else {$("#ArchivePageContentDetailsCharacterBlock").append("<div style='position:relative;margin:auto;margin-bottom:5%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3.5vmin'>角色信息已隐藏</div>")}

  //?填充作品相关条目
  if(1){ //判断是否显示相关条目信息
    $.getJSON("https://api.bgm.tv/v0/subjects/"+bgmID+"/subjects", function(data){
      var Chara_Data = data; function ArchiveMediaDetailsPageRelativeFiller(Tempj){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+data[Tempj].id, function(data2){
          if(data2.name_cn!='') var Chara_Data_NameCN = data2.name_cn;else var Chara_Data_NameCN = Chara_Data[Tempj].name;
          let ArchiveMediaDetailsRelativeImage = Chara_Data[Tempj].images.medium; if(!ArchiveMediaDetailsRelativeImage) ArchiveMediaDetailsRelativeImage="./assets/no_img.gif"; //如果没有图片就用默认图片
          document.getElementsByName('ArchivePageContentDetailsRelativeBlockCard')[Tempj].innerHTML=( "<div id='ArchivePageContentDetailsRelativeBlockImg"+Tempj+"' style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+ArchiveMediaDetailsRelativeImage+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
          "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;padding-right:20px;white-space:nowrap;font-size:1.5vw;font-size:min(1.5vw, 21px);'><b>"+Chara_Data[Tempj].name+"<br/>("+Chara_Data_NameCN+")</b><br/>"+Chara_Data[Tempj].relation+"</div>")
          $(document.getElementsByName('ArchivePageContentDetailsRelativeBlockCard')[Tempj]).attr('onclick','window.open(\"https://bgm.tv/subject/'+Chara_Data[Tempj].id+'\");');
          switch(Chara_Data[Tempj].relation){
            case '原声集':case '片头曲':case '片尾曲':case '角色歌':case '广播剧':case '插入歌':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;/*backdrop-filter: blur(30px);*/"><svg t="1674916796215" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11808" style="height: 75%;"><path d="M405.333333 704m-192 0a192 192 0 1 0 384 0 192 192 0 1 0-384 0Z" fill="#e6e6e6" p-id="11809"></path><path d="M512 128v576h85.333333V298.666667l234.666667 64v-149.333334z" fill="#e6e6e6" p-id="11810"></path></svg></div>');break;}
            case '书籍':case '单行本':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;/*backdrop-filter: blur(30px);*/"><svg t="1674916763560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9938" style="height: 65%;"><path d="M896 128v832H224a96 96 0 1 1 0-192h608V0H192C121.6 0 64 57.6 64 128v768c0 70.4 57.6 128 128 128h768V128h-64z" p-id="9939" fill="#e6e6e6"></path><path d="M224.064 832H224a32 32 0 0 0 0 64h607.968v-64H224.064z" p-id="9940" fill="#e6e6e6"></path></svg></div>');break;}
            case '画集':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;/*backdrop-filter: blur(30px);*/"><svg t="1674917033209" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15205" style="height: 65%;"><path d="M725.333333 938.666667H170.666667c-46.933333 0-85.333333-38.4-85.333334-85.333334V298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667v512c0 21.333333 17.066667 42.666667 42.666666 42.666666h512c21.333333 0 42.666667 17.066667 42.666667 38.4v4.266667c0 21.333333-17.066667 42.666667-42.666667 42.666667z m-366.933333-170.666667C302.933333 768 256 721.066667 256 665.6V187.733333C256 132.266667 302.933333 85.333333 358.4 85.333333h477.866667C891.733333 85.333333 938.666667 132.266667 938.666667 187.733333v477.866667c0 55.466667-46.933333 102.4-102.4 102.4H358.4z m81.066667-85.333333H810.666667c21.333333-4.266667 38.4-21.333333 42.666666-42.666667v-128l-119.466666-106.666667-294.4 277.333334zM384 298.666667c0 46.933333 38.4 85.333333 85.333333 85.333333s85.333333-38.4 85.333334-85.333333-38.4-85.333333-85.333334-85.333334-85.333333 38.4-85.333333 85.333334z" p-id="15206" fill="#e6e6e6"></path></svg></div>');break;}  
            case '游戏':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;"><svg t="1704706924167" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13423" style="height: 65%;"><path d="M639.914667 213.333333a298.666667 298.666667 0 0 1 10.24 597.162667l-10.24 0.170667H384.085333a298.666667 298.666667 0 0 1-10.24-597.162667L384.085333 213.333333h255.829334z m-10.581334 320a53.333333 53.333333 0 1 0 0 106.666667 53.333333 53.333333 0 0 0 0-106.666667zM341.333333 384a32 32 0 0 0-31.701333 27.648l-0.298667 4.352v63.914667h-64a32 32 0 0 0-4.352 63.744l4.352 0.298666 64-0.042666v64.085333a32 32 0 0 0 63.701334 4.352l0.298666-4.352v-64.085333h64a32 32 0 0 0 4.352-63.658667l-4.352-0.298667-64-0.042666V416A32 32 0 0 0 341.333333 384z m373.333334 0a53.333333 53.333333 0 1 0 0 106.666667 53.333333 53.333333 0 0 0 0-106.666667z" fill="#ffffff" p-id="13424"></path></svg></div>');break;}    
            case '衍生':case '不同版本':case '其他':case '不同演绎':case '不同世界观':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;"><img src="./assets/Star-stroke.svg" alt="Specs" style="height: 65%;"/></div>');break;}    
            case '续集':case '前传':case '主线故事':case '番外篇':case '总集篇':case '相同世界观':case '外传':
              {$("#ArchivePageContentDetailsRelativeBlockImg"+Tempj).append('<div style="position: absolute;right: 0;height: 30%;bottom: 0;background: #000000aa;border-top-left-radius: 9px;aspect-ratio: 1;display: flex;justify-content: center;align-items: center;"><img src="./assets/anime.svg" alt="Specs" style="height: 65%;"/></div>');break;}    
            }
        }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});
      }
      for(let Tempj=0;Tempj!=data.length;Tempj++){$("#ArchivePageContentDetailsRelativeBlock").append( "<div class='ArchiveCardCharacterHover' name='ArchivePageContentDetailsRelativeBlockCard'></div>");ArchiveMediaDetailsPageRelativeFiller(Tempj)}
    }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';})
    .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});
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
          "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;padding-right:20px;white-space:nowrap;font-size:1.5vw;font-size:min(1.5vw, 21px);'><b>"+Chara_Data[Tempj].name+"<br/>("+Chara_Data_NameCN+")</b><br/>"+Chara_Data[Tempj].relation+"</div></div>")
        }}).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});
      }
      for(let Tempj=0;Tempj!=data.length;Tempj++){ArchiveMediaDetailsPagePersonFiller(Tempj)}
    }).done(function(){document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';})
    .fail(function() {OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';});
    } else {$("#ArchivePageContentDetailsPersonBlock").append("<div style='position:relative;margin:auto;margin-bottom:5%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3.5vmin'>制作人员信息已隐藏</div>")}

  //?填充科学排名
  if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowSciMark")){ //判断是否显示科学排名
    document.getElementById("ArchivePageContentDetailsRatingRank").innerText="计算中...";
    $.getJSON("https://ghproxy.net/https://raw.githubusercontent.com/NeutrinoLiu/API/main/sciRank/shrank.json", function(data){
      for(let Temps = 0;Temps!=data.length;Temps++){if(data[Temps].i==bgmID) {document.getElementById("ArchivePageContentDetailsRatingRank").innerText="科排:"+data[Temps].r;break;}
        if(Temps>=data.length-1){document.getElementById("ArchivePageContentDetailsRatingRank").innerText="暂无排名"}}
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
  //?启用性能模式
  if(sysdata.get("Settings.checkboxB.LocalStorageSystemOpenSpeedMode")==true){
    document.getElementById("ArchivePageContentDetailsBlur").style.background = "#404040";
    document.getElementById("ArchivePageContentDetailsBlur").style.filter = "unset";
    for (let i = 0; i < document.getElementsByClassName("RecentViewDetail").length; i++) {
      document.getElementsByClassName("RecentViewDetail")[i].style.backdropFilter = "brightness(1)";
    }
    document.getElementsByClassName("ArchivePageContentDetailsCharacterContainer")[0].style.backdropFilter = "brightness(1)";
    document.getElementsByClassName("ArchivePageContentDetailsCharacterContainer")[1].style.backdropFilter = "brightness(1)";
  }
  //贴边控制
  document.getElementById("ArchivePageContentDetailsTitle").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制标题贴边
  document.getElementById("ArchivePageContentDetailsTitleJp").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制日文标题贴左边
  document.getElementById("ArchivePageContentDetailsTitleJp").style.top=(22+(document.getElementById("ArchivePageContentDetailsTitle").getBoundingClientRect().height)*2/($(window).height())*100).toString()+"%"; // 控制日文标题贴上边
  // document.getElementById("ArchivePageContentDetailsFolderURL").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制打开文件夹按钮贴左边
  // document.getElementById("ArchivePageContentDetailsEditor").style.left=(34+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品编辑按钮贴左边
  document.getElementById("ArchivePageContentDetailsBannerButtonContainer").style.left=(22+(document.getElementById("ArchivePageContentDetailsCover").getBoundingClientRect().width)/($(window).width())*100).toString()+"%"; // 控制作品详情按钮贴左边
  //返回按钮显示
  document.getElementById('GoBackPage').style.display = 'block';
  setTimeout(function() {document.getElementById('GoBackPage').style.height = '45px';},100); // 返回按钮可见化

  //显示页尾一言
  $.getJSON("https://v1.hitokoto.cn/?c=a", function(data3){
    document.getElementById('ArchivePageContentLastCardHitokoto').innerText='『'+data3.hitokoto+'』';
    document.getElementById('ArchivePageContentLastCardHitokotoFrom').innerText='——'+data3.from})
  
    if(sysdata.get("Settings.checkboxB.LocalStorageMediaShowTranslation")){ //判断是否显示翻译按钮
    document.getElementById('ArchivePageContentDetailsTranslate').style.display='grid'}
    else{document.getElementById('ArchivePageContentDetailsTranslate').style.display='none'}

  //?填充作品相关目录
  $.ajax({ //获取收藏信息
    url: "https://bgm.tv/subject/"+bgmID,
    type: 'GET',
    timeout : 2000,
    success: function (data) {
      let bgmTempHTML = cheerio.load(data); //加载获取的作品详情页html
      if(!bgmTempHTML('#subjectPanelIndex').length) return -1; //判断是否有目录
      bgmTempHTML = bgmTempHTML('#subjectPanelIndex')[0].children[3].children //解析目录部分
      // console.log(bgmTempHTML)
      for (let Tempi = 0;Tempi!=bgmTempHTML.length;Tempi++){
      if (Tempi%2==1){
        // console.log(bgmTempHTML[Tempi].children[2].children[0].attribs.href)
        $("#ArchivePageContentDetailsContentBlock").append( "<div class='ArchiveCardCharacterHover' onclick='window.open(\"https://bgm.tv"+bgmTempHTML[Tempi].children[2].children[0].attribs.href+"\");'>"+
        "<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\"https:"+bgmTempHTML[Tempi].children[0].children[0].attribs.style.slice(22,-2)+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
        "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;padding-right:20px;white-space:nowrap;font-size:1.5vw;font-size:min(1.5vw, 21px);'><b>"+
        bgmTempHTML[Tempi].children[2].children[0].children[0].data+"<br/>by</b><br/>"+bgmTempHTML[Tempi].children[2].children[3].children[1].children[0].data+"</div></div>")
      }
    }
    //页面背景高度更新
    document.getElementById('ArchivePageContentDetailsBlur').style.height=(Math.min(document.getElementById('ArchivePageContentDetails').scrollHeight),(document.getElementById('ArchivePageContentLastCard').offsetTop)).toString()+'px';
    }, error: function () {$("#ArchivePageContentDetailsContentBlock").append('<div style="margin:auto;margin-bottom: 30px;">抱歉，无法加载目录</div>')}
  });

  //?填充作品分享按钮
  $('#ArchivePageContentDetailsShare').attr('onclick',"ipcRenderer.send('MediaShare','"+MediaID+"')");

  //?填充作品好友评价
  $.ajax({ //获取用户信息
    url: "https://api.bgm.tv/v0/me",type: 'GET',headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken')},timeout : 2000,
    success: function (data) {
      $.ajax({ //获取好友信息
        url: "https://bgm.tv/user/"+data.username+"/friends",
        type: 'GET',
        timeout : 2000,
        success: function (data2) {
          var bgmTempHTML1 = cheerio.load(data2); //加载个人详情页html
          bgmTempHTML1 = bgmTempHTML1('#memberUserList')//解析好友列表
          var bgmTempScore = []; //定义好友评分数组
          var bgmTempCounter = 0; //定义好友计数器
          //! 定义好友填充函数
          function ArchiveMediaDetailsPageFriendFiller(Tempfriendcalc){
            $.ajax({ //获取好友收藏信息
              url: "https://api.bgm.tv/v0/users/"+bgmTempHTML1[0].children[Tempfriendcalc].children[1].children[1].children[1].attribs.href.slice(6)+"/collections/"+bgmID,
              type: 'GET',
              timeout : 2000,
              success: function (data2) {
                let rating='暂无评价';
                switch (data2.rate) {
                  case 10:rating = '超神作';break;case 9:rating = '神作';break;case 8:rating = '力荐';break;case 7:rating = '推荐';break;case 6:rating = '还行';break;
                  case 5:rating = '不过不失';break;case 4:rating = '较差';break;case 3:rating = '差';break;case 2:rating = '很差';break;case 1:rating = '不忍直视';break;
                  default:rating = '暂无评价';
                }
                $("#ArchivePageContentDetailsFriendsInfo").append( "<div class='ArchiveCardCharacterHover'style='height: 100%;margin: 0;margin-right: 20px;flex:unset'"+
                "onclick=\"ArchiveMediaDetailsFriendRankCard('"+data2.comment+"','"+data2.rate+"','"+rating+"','"+bgmTempHTML1[0].children[Tempfriendcalc].children[1].children[1].children[1].children[2].data+"','"+
                bgmTempHTML1[0].children[Tempfriendcalc].children[1].children[1].children[1].attribs.href.slice(6)+"','"+bgmTempHTML1[0].children[Tempfriendcalc].children[1].children[1].children[1].children[1].children[1].attribs.style.slice(22,-2)+"','0',"+bgmID+")\""+
                "><div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\"https:"+bgmTempHTML1[0].children[Tempfriendcalc].children[1].children[1].children[1].children[1].children[1].attribs.style.slice(22,-2)+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'></div>"+
                "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;padding-right:20px;white-space:nowrap;font-size:1.5vw;font-size: min(1.5vmin, 21px);'>"+
                "<b>"+bgmTempHTML1[0].children[Tempfriendcalc].children[1].children[1].children[1].children[2].data+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+rating+"<br>⭐ "+data2.rate+"</b><br>"+data2.updated_at.slice(0,-9).replace('T', ' ')+"</div></div>")
                bgmTempScore.push(data2.rate);bgmTempCounter+=1; //好友评分数组填充
                if(bgmTempCounter==0) $("#ArchivePageContentDetailsFriendsInfo").append('<div style="margin:auto;">暂无好友看过</div>')
                if(bgmTempCounter==bgmTempHTML1[0].children.length){
                  document.getElementById('ArchivePageContentDetailsFriendNum').innerHTML = "共"+bgmTempScore.length+"位好友看过";
                  //计算好友打分平均值
                  let bgmTempScoreNoZero = bgmTempScore.filter(function(value) {return value != 0;});
                  let bgmTempScoreAvg = ((bgmTempScoreNoZero.reduce(function(a, b) {return a + b;}, 0)/ bgmTempScoreNoZero.length).toFixed(1));
                  document.getElementById('ArchivePageContentDetailsFriendScore').innerHTML = bgmTempScoreAvg;
                  switch (parseInt(bgmTempScoreAvg+0.5)) {
                    case 10:rating = '超神作';break;case 9:rating = '神作';break;case 8:rating = '力荐';break;case 7:rating = '推荐';break;case 6:rating = '还行';break;
                    case 5:rating = '不过不失';break;case 4:rating = '较差';break;case 3:rating = '差';break;case 2:rating = '很差';break;case 1:rating = '不忍直视';break;
                    default:rating = '暂无评价';}
                  document.getElementById('ArchivePageContentDetailsFriendRank').innerHTML = rating;
                  // 计算每个数字与平均值的差的平方
                  let bgmTempScoreDiffs = bgmTempScoreNoZero.map(function(value) { let diff = value - bgmTempScoreAvg;let sqrDiff = diff * diff;return sqrDiff;});
                  // 计算平方差的平均值
                  let bgmTempScoreavgDiff = bgmTempScoreDiffs.reduce(function(a, b) {return a + b;}, 0) / bgmTempScoreDiffs.length;
                  // 计算标准差
                  document.getElementById('ArchivePageContentDetailsFriendStd').innerHTML = "标准差："+Math.sqrt(bgmTempScoreavgDiff).toFixed(2);
                }
              },
              error: function(jqXHR, textStatus, errorThrown) {bgmTempCounter+=1;
                if(bgmTempCounter==0) $("#ArchivePageContentDetailsFriendsInfo").append('<div style="margin:auto;">暂无好友看过</div>')
                if(bgmTempCounter==bgmTempHTML1[0].children.length){
                  document.getElementById('ArchivePageContentDetailsFriendNum').innerHTML = "共"+bgmTempScore.length+"位好友看过";
                  //计算好友打分平均值
                  let bgmTempScoreNoZero = bgmTempScore.filter(function(value) {return value != 0;});
                  let bgmTempScoreAvg = ((bgmTempScoreNoZero.reduce(function(a, b) {return a + b;}, 0)/ bgmTempScoreNoZero.length).toFixed(1));
                  document.getElementById('ArchivePageContentDetailsFriendScore').innerHTML = bgmTempScoreAvg;
                  switch (parseInt(bgmTempScoreAvg+0.5)) {
                    case 10:rating = '超神作';break;case 9:rating = '神作';break;case 8:rating = '力荐';break;case 7:rating = '推荐';break;case 6:rating = '还行';break;
                    case 5:rating = '不过不失';break;case 4:rating = '较差';break;case 3:rating = '差';break;case 2:rating = '很差';break;case 1:rating = '不忍直视';break;
                    default:rating = '暂无评价';}
                  document.getElementById('ArchivePageContentDetailsFriendRank').innerHTML = rating;
                  // 计算每个数字与平均值的差的平方
                  let bgmTempScoreDiffs = bgmTempScoreNoZero.map(function(value) { let diff = value - bgmTempScoreAvg;let sqrDiff = diff * diff;return sqrDiff;});
                  // 计算平方差的平均值
                  let bgmTempScoreavgDiff = bgmTempScoreDiffs.reduce(function(a, b) {return a + b;}, 0) / bgmTempScoreDiffs.length;
                  // 计算标准差
                  document.getElementById('ArchivePageContentDetailsFriendStd').innerHTML = "标准差："+Math.sqrt(bgmTempScoreavgDiff).toFixed(2);
                }
              }
            });
          }

          for (var Tempfriendcalc = 0;Tempfriendcalc!=bgmTempHTML1[0].children.length;Tempfriendcalc++) ArchiveMediaDetailsPageFriendFiller(Tempfriendcalc);
        }, error: function () {$("#ArchivePageContentDetailsFriendsInfo").append('<div style="margin:auto;">抱歉，无法加载好友</div>')}
      });
  },
  error: function(jqXHR, textStatus, errorThrown) {
    $("#ArchivePageContentDetailsFriendsInfo").append('<div style="margin:auto;">抱歉，无法加载好友</div>');
  }});

}


//! 媒体库-作品详情页好友评价卡片
function ArchiveMediaDetailsFriendRankCard(friend_comment,friend_score,friend_rank,friend_name,friend_id,friend_avatar,friend_time,bgmID_temp){
  document.getElementById('RecentViewFriendRankCard').style.display='block';
  document.getElementById('RecentViewFriendRankCardBack').style.display='block';
  // 若无评论则显示暂无评价
  if (friend_comment=="null") friend_comment = '暂无评价';
  // 更新评价卡片内容
  $("#RecentViewFriendRankCard").html("<div class='avatar' style='background: url(\"https:"+friend_avatar+"\") center center / cover no-repeat;position: absolute;height: 60px;left: 15px;top: 15px;'></div>"+
    "<div style='position: absolute;left: 95px;top: 15px;font-size: 20px;overflow: hidden;display: -webkit-box;text-overflow: ellipsis;-webkit-box-orient: vertical;-webkit-line-clamp: 1;'>"+friend_name+"<a style='font-size: 15px;margin-left: 5px;color: #8f8f8f;'>@"+friend_id+"</a></div>"+
    "<div style='position: absolute;left: 95px;top: 50px;height: 30px;'>"+
    "<span name='ArchivePageContentDetailsFriendRankCardStars' class='ArchivePageContentDetailsfull-star'></span>"+
    "<span name='ArchivePageContentDetailsFriendRankCardStars' class='ArchivePageContentDetailsfull-star'></span>"+
    "<span name='ArchivePageContentDetailsFriendRankCardStars' class='ArchivePageContentDetailsfull-star'></span>"+
    "<span name='ArchivePageContentDetailsFriendRankCardStars' class='ArchivePageContentDetailsfull-star'></span>"+
    "<span name='ArchivePageContentDetailsFriendRankCardStars' class='ArchivePageContentDetailsfull-star'></span></div><div class='boxBlank' style='font-size: 15px;"+
    "font-family: bgmUI;width: auto;height: 20px;left: 253px;top: 48px;background: #ddd;color:#000;box-shadow: none;display: flex;justify-content: center;align-items: center;position: absolute;padding: 3px;padding-left: 10px;padding-right: 10px;'>"+friend_rank+"</div>"+
    "<div class='ArchivePageContentDetailsFriendComments'>"+friend_comment+"</div>"+
    "<button type='button' value='链接' class='Winui3button' style='width:30px;border-top-right-radius: 0px;border-bottom-right-radius: 0px;bottom: 15px;right: 70px;height:35px' onclick=\"shell.openExternal('https://bgm.tv/subject/"+bgmID_temp+"/collections?filter=friends');\">"+
    "<svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M853.333333 469.333333a42.666667 42.666667 0 0 0-42.666666 42.666667v256a42.666667 42.666667 0 0 1-42.666667 42.666667H256a42.666667 42.666667 0 0 1-42.666667-42.666667V256a42.666667 42.666667 0 0 1 42.666667-42.666667h256a42.666667 42.666667 0 0 0 0-85.333333H256a128 128 0 0 0-128 128v512a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128v-256a42.666667 42.666667 0 0 0-42.666667-42.666667z' fill='#ffffff' p-id='2787'></path><path d='M682.666667 213.333333h67.413333l-268.373333 267.946667a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586666 0L810.666667 273.92V341.333333a42.666667 42.666667 0 0 0 42.666666 42.666667 42.666667 42.666667 0 0 0 42.666667-42.666667V170.666667a42.666667 42.666667 0 0 0-42.666667-42.666667h-170.666666a42.666667 42.666667 0 0 0 0 85.333333z' fill='#ffffff' p-id='2788'></path></svg>"+
    "</button><button type='button' value='关闭' class='Winui3button_red' style='width: 50px;bottom: 15px;border-top-left-radius: 0px;border-bottom-left-radius: 0px;height:35px;font-size: 15px;color: #fff;' onclick=\"document.getElementById('RecentViewFriendRankCard').style.display='none';document.getElementById('RecentViewFriendRankCardBack').style.display='none';\">关闭</button>");
  //根据评价文本长度自动设定卡片高度
  var textHeight = $(".ArchivePageContentDetailsFriendComments").prop('scrollHeight');
  $("#RecentViewFriendRankCard").height(textHeight + 170);  // 加上其他元素和边距的高度
  $("#RecentViewFriendRankCard").css('margin-top', (-1)*(textHeight + 170)/2); // 使卡片垂直居中
  //评分星星填充
  let FriendScoreVal=parseInt(friend_score); let index = parseInt(FriendScoreVal / 2);let spans = document.getElementsByName('ArchivePageContentDetailsFriendRankCardStars');
  for (let j = index; j < 5; j++) {spans[j].className = 'ArchivePageContentDetailsempty-star'}
  for (let k = 0; k < index; k++) {spans[k].className = 'ArchivePageContentDetailsfull-star'}
  if(index * 2 !== FriendScoreVal) {spans[index].className = 'ArchivePageContentDetailshalf-star'}
}

//! 媒体库-作品详情页章节选择弹窗 媒体库-作品详情页章节选择并播放
const { ArchiveMediaDetailsEpInfoCard,ArchiveMediaDetailsEpInfoPlayer,ArchiveMediaDetailsEpInfoCardWatched } 
= nodeRequire('./js/Mainpage_Modules/MainpageArchiveDetailsSelectandPlay.js'); //?引入bgm.res主界面的作品详情页章节选择播放函数封装

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

//! 媒体库-作品ep,sp特典扫描模块
const { LocalWorkEpsScanModule,ArchiveMediaBonusScan } = nodeRequire('./js/Mainpage_Modules/MediapageArchiveEPSPScanner.js'); //?引入bgm.res主界面的作品详情页作品ep,sp特典扫描模块

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

//! 自定颜色获取
function SettingsColorPicker(opacity){
  //自定颜色获取
  let CustomColor = 'rgb(240 145 153)'; // 这是默认的颜色
  if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) 
    CustomColor = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor"); // 如果有自定义颜色，就使用自定义颜色
  let rgbValues = CustomColor.match(/\d+/g);
  if (rgbValues.length !== 3) throw new Error('Invalid RGB format'); // 如果不是 RGB 格式，抛出错误
  let [r, g, b] = rgbValues; // 构建 rgba 字符串\
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

//! 接受托盘菜单指令运行指定程序
ipcRenderer.on('MainWindow', (event, arg) => {
  switch(arg){
    case 'OpenMainPage': FloatBarAction("Home");break;
    case 'OpenMediaPage': FloatBarAction("Archive");break;
    case 'OpenTorrnetPage': FloatBarAction("Torrnet");break;
  }
});

window.onerror = function(message, source, lineno, colno, error) {
  OKErrorStreamer("MessageOff", "");
  OKErrorStreamer("ErrorHandler", "发生致命错误："+message+"，请打开开发人员工具查看详情 ");
  // 在这里处理异常，例如记录日志或显示用户友好的错误消息
  return false; // 返回 true 表示阻止默认的错误处理（例如在控制台中输出错误）
};