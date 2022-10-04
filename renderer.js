// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { app , Menu , Tray, shell, ipcRenderer, nativeTheme} = nodeRequire('electron'); //?使用electron
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog
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

// !页面加载完成后初始化数据函数(目前仅初始化主页)
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
    ArchivePageInit();

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

//! 播放-调用MPV播放最近播放
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

//! 媒体库-目录扫描模块[UnderConstruction]
function LocalWorkScan(){
  if(localStorage.getItem('LocalStorageMediaBaseURL'))
  {
    var TargetArchiveURL = localStorage.getItem('LocalStorageMediaBaseURL');
    if(fs.existsSync(TargetArchiveURL)){       // *当目标媒体库目录存在
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
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Score",'0.0'); //扫描到的媒体默认评分
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Type",'TV'); //扫描到的媒体默认类型
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Year",'0000'); //扫描到的媒体默认年代
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Eps",'1'); //扫描到的媒体默认话数
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Protocol",'Unknown'); //扫描到的媒体默认原案
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Director",'Unknown'); //扫描到的媒体默认监督
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Corp",'Corp'); //扫描到的媒体默认制作公司
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Cover",'./assets/banner.jpg'); //扫描到的媒体默认封面(后期联网更新为base64)
          store.set("WorkSaveNo"+ScanSaveCounter.toString()+".ExistCondition",'Exist'); //扫描到的媒体默认状态(默认存在)
        }
      }
      localStorage.setItem("LocalStorageMediaBaseNumber",ScanSaveCounter); //存储扫描到的媒体数目
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
    }
    else{OKErrorStreamer("Error","路径错误！",0);}
  }
  else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
}

//! 媒体库-页面初始化模块
function ArchivePageInit(){
  // *Archive Get <!--格式化ArchivePage媒体库内容-->
  if(localStorage.getItem("LocalStorageMediaBaseNumber")){
    document.getElementById("ArchivePageSum").innerText="共 "+(parseInt(localStorage.getItem("LocalStorageMediaBaseNumber"))-parseInt(localStorage.getItem("LocalStorageMediaBaseDeleteNumber"))).toString()+" 部作品";}
    var MediaBaseNumberGet = localStorage.getItem("LocalStorageMediaBaseNumber");
    document.getElementById('ArchivePageContent').innerHTML="";
    if(localStorage.getItem("LocalStorageMediaBaseNumber")==0 || !localStorage.getItem("LocalStorageMediaBaseNumber"))
    {document.getElementById('ArchivePageContent').innerHTML="<div style='position:absolute;left:30%;right:30%;top:30%;bottom:30%;font-family:bgmUIHeavy;color: rgba(255, 255, 255, 0.5);font-size:3vmin'>暂时没有作品，请设置正确的媒体库地址并点击“扫描作品”</div>";}
    // *扫描作品bgmID获取作品信息
    for(var MediaBaseScanCounter=1;MediaBaseScanCounter<=MediaBaseNumberGet;MediaBaseScanCounter++){

      if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".ExistCondition") == "Deleted") {continue;} //发现已删除作品，自动跳过

      $("#ArchivePageContent").append( "<div id='ArchiveWorkNo"+MediaBaseScanCounter.toString()+"' class='ArchiveCardHover' style='background:url("+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover")+") no-repeat top;background-size:cover;'>"+
      "<div class='ArchiveCardThumb' style='background:url(./assets/ArchiveCover.png) no-repeat top;background-size:cover;'></div>"+ //封面遮罩阴影
      "<div class='ArchiveCardTitle'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name")+"</div>"+ //名称
      "<div class='ArchiveCardRateStar'>⭐&nbsp;"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score")+"</div>"+ //评分
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:22%;left:5%;right:5%;text-align:center;font-style:italic;'>"+
      store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type")+"&nbsp;"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps")+"话&nbsp;"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year")+"</div>"+ //资料A
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:12%;left:40%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>原作 "+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol")+"</div>"+ //制作原案
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director")+"</div>"+ //制作监督
      "<div class='ArchiveCardDirectorYearCorp' style='bottom:2%;left:5%;right:50%;text-align:left;color: rgba(255, 255, 255, 0.79);'>"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp")+"</div>"+ //制作公司
      "<div class='ArchiveCardDirectorYearCorp' style='font-family:bgmUIHeavy;top:2%;left:45%;right:5%;text-align:right;color: rgba(255, 255, 255, 0.79);' onclick='ArchiveContentEditer("+MediaBaseScanCounter.toString()+");'>编辑</div>"+ //编辑按键
      "</div>" );
    }
}

//! 媒体库-作品设置模块
function ArchiveContentEditer(MediaID) {
  document.getElementById("ArchivePageContentSettingsBody").innerHTML=""; //清空body
  $("#ArchivePageContentSettingsBody").append( 
    "<div id='ArchivePageContentSettingsCover' class='ArchiveCardHover' style='position:absolute;top:21%;height:40%;left:3%;width:20%;'></div>"+
    "<div class='ArchiveInputLine' style='top:30%;left:35%;width:60%;height:10%'> <!-- *设置作品bgmID -->"+
    "<input type='text' id='ArchivePageContentSettingsbgmID' autocomplete='off' onkeydown='StoreSave(event.keyCode,1,"+MediaID+");' required />"+ //placeholder='BGMID可以在Bangumi作品页面URL内找到'
    "<div class='line'></div><span>请输入当前作品的BGMID</span></div>"+
    "<div class='ArchiveInputLine' style='top:50%;left:35%;width:60%;height:10%'> <!-- *设置作品URL -->"+
    "<input type='text' id='ArchivePageContentSettingsURL' autocomplete='off'  onkeydown='StoreSave(event.keyCode,2,"+MediaID+")' required />"+   //placeholder='如果作品位置转移，可以在此重设URL'
    "<div class='line'></div><span>请输入当前作品的URL</span></div>"+
    "<div class='ArchiveCardDirectorYearCorp' style='font-family:bgmUIHeavy;top:67%;left:5%;width:20%;text-align:center;color: rgba(255, 255, 255, 0.79);'>"+store.get("WorkSaveNo"+MediaID+".Name")+"</div>"+
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

//! 媒体库-作品设置-存储API
//*输入输入框ID，自动提取输入框内数据并存入Storage
function StoreSave(Key,Input,WorkID){
  if(Key == 13)
  {
    if(Input == 1){var WorkbgmID = document.getElementById('ArchivePageContentSettingsbgmID').value; store.set("WorkSaveNo"+WorkID+".bgmID",WorkbgmID.toString());}
    if(Input == 2){var WorkURL = document.getElementById('ArchivePageContentSettingsURL').value; store.set("WorkSaveNo"+WorkID+".URL",WorkURL.toString());}
    ArchivePageInit();
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
    var MediaBaseDeleteNumber = parseInt(localStorage.getItem('LocalStorageMediaBaseDeleteNumber'));
    localStorage.setItem('LocalStorageMediaBaseDeleteNumber',MediaBaseDeleteNumber+1);
    ArchivePageInit();
    OKErrorStreamer("OK","作品已从数据库删除",0);
  }
}

//! 媒体库-作品信息更新模块
function ArchiveMediaUpdate(){
  // *Archive Get <!--联网检索ArchivePage媒体库内容-->
  OKErrorStreamer("MessageOn","作品信息更新进行中",0);
  setTimeout(function() {
  if(localStorage.getItem("LocalStorageMediaBaseNumber")){
    document.getElementById("ArchivePageSum").innerText="共 "+localStorage.getItem("LocalStorageMediaBaseNumber")+" 部作品";}
    var MediaBaseNumberGet = localStorage.getItem("LocalStorageMediaBaseNumber");
    // *扫描作品bgmID获取作品信息 
    $.ajaxSettings.async = false; //关闭同步
    for(var MediaBaseScanCounter=1;MediaBaseScanCounter<=MediaBaseNumberGet;MediaBaseScanCounter++){
      // *扫描作品bgmID获取作品信息
      if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID") != '0'){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString(), function(data){
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
        }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString()+'/persons', function(data){
        for(var MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
          if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
          if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
          if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
        } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
      } 
    } $.ajaxSettings.async = true; //重新打开同步
    ArchivePageInit();
    OKErrorStreamer("MessageOff","作品信息更新进行中",0);
    OKErrorStreamer("OK","媒体库数据爬取完成",0); 
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
    var WorkTotalNumberNew = parseInt(localStorage.getItem("LocalStorageMediaBaseNumber"))+1
    localStorage.setItem("LocalStorageMediaBaseNumber",WorkTotalNumberNew); //存储新的媒体数目
    if(document.getElementById('ArchivePageContentAddNewURL').value!='' && document.getElementById('ArchivePageContentAddNewName').value!='' 
          && document.getElementById('ArchivePageContentAddNewbgmID').value!=''&& document.getElementById('ArchivePageContentAddNewType').value!=''){
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
    ArchivePageInit();
    document.getElementById('ArchivePageContentAddNew').style.display = "none";
    OKErrorStreamer('OK','新作品添加完成！建议点击更新按钮联网刷新一下作品详细信息',0);
    }
    else {OKErrorStreamer('Error','作品信息不完整！',0);}
  }
}