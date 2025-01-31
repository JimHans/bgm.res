/**
 * @name MainpageArchiveDetailsSelectandPlay.js
 * @module MainpageArchiveDetailsSelectandPlay.js
 * @description bgm.res主界面/媒体库界面的作品详情页章节选择并播放模块
 */

//! 媒体库-作品详情页章节选择弹窗
exports.ArchiveMediaDetailsEpInfoCard=function(event,MediaID,TempCounter,Type){
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
  "<div style='left: 12px;top: 121px;position:absolute'>设置状态</div><div id='RecentViewEpisodePlayCardProgressWatched' class='RecentViewEpisodePlayCardProgressBtn' style='left:11px;border-top-right-radius: 0;border-bottom-right-radius: 0px;' onclick='ArchiveMediaDetailsEpInfoCardWatched("+MediaID+","+TempCounter+","+bgmID+","+bgmEP+",2)'>看过</div>"+
  
  /*点击标注看到此ep*/"<div id='RecentViewEpisodePlayCardProgressWatchedTill' class='RecentViewEpisodePlayCardProgressBtn' style='left: 64px;border-radius: 0px;border-left-width:0px;border-right-width:0px' onclick='for(var Tempj=1;Tempj<="+TempCounter+";Tempj++)"+
  "{store.set(\"WorkSaveNo"+MediaID+".EPDetails.EP\"+Tempj+\".Condition\",\"Watched\");document.getElementById(\"ArchivePageContentDetailsEpisodeNo\"+Tempj).style.boxShadow=\"0px 0px 0px 2px "+SettingsColorPicker(0.4)+"\";document.getElementById(\"ArchivePageContentDetailsEpisodeNo\"+Tempj).style.backgroundColor=\""+SettingsColorPicker(0.4)+"\";}"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\""+SettingsColorPicker(0.6)+"\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"#000\";ArchivePageMediaProgressCalc("+MediaID+");ArchiveMediaDetailsEpisodeUserUpdate("+bgmID+",1,"+(bgmEP+1)+",2);'>看到</div>"+
  
  /*点击撤销观看此ep*/"<div class='RecentViewEpisodePlayCardProgressBtn' style='left: 114px;border-top-left-radius: 0;border-bottom-left-radius: 0;' onclick='store.set(\"WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".Condition\",\"Unwatched\");"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\"#00000055\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"rgb(172, 172, 172)\";document.getElementById(\"ArchivePageContentDetailsEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 0px #ffffff4a\";"+
  "document.getElementById(\"ArchivePageContentDetailsEpisodeNo"+TempCounter+"\").style.backgroundColor=\"rgb(0,0,0,0.3)\";"+
  "ArchivePageMediaProgressCalc("+MediaID+");ArchiveMediaDetailsEpisodeUserUpdate("+bgmID+","+bgmEP+","+(bgmEP+1)+",0);'>撤销</div>"+
  
  "<div class='RecentViewEpisodePlayCardPlay' style='right:10px;top:122px;width:28%;height:28%;border:0px solid' onclick='ArchiveMediaDetailsEpInfoPlayer("+MediaID+","+TempCounter+",\"EP\");'>"+
  "<div style='width: 80%;height: 100%;left:10%;position: absolute;background:url(./assets/play.svg) no-repeat center;background-size: contain;'></div>"+
  /*分割线*/"<div class='rolledEpisodePlayCard'></div></div><div style='position:absolute;left:10px;right:10px;height:2px;top:113px;border-radius:5px;background:#ffffff1f'></div>"+
  "<div id='RecentViewPlayEPInfo' style='position:absolute;left:15px;right:15px;top:10px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoCN' style='position:absolute;left:15px;right:15px;top:35px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoLength' style='position:absolute;left:15px;right:15px;top:60px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoDiscuss' style='color:"+SettingsColorPicker(1)+";position:absolute;left:15px;right:15px;bottom:10px;top:195px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"
  //检测看过，自动高亮
  if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".Condition")=='Watched'){document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.backgroundColor=SettingsColorPicker(0.6);document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.color="#000"}
  }
  if(Type == 'SP'){
  var bgmSP = TempCounter;
  // *SP信息获取
  $.getJSON("https://api.bgm.tv/v0/episodes?subject_id="+bgmID.toString(), function(data1){
    for(var SPTemper=0;SPTemper!=data1.data.length;SPTemper++){
      if(data1.data[SPTemper].type=='1'&&data1.data[SPTemper].sort==bgmSP) {
        
        $.getJSON("https://api.bgm.tv/v0/episodes/"+data1.data[SPTemper].id, function(data2){
        document.getElementById("RecentViewPlayEPInfo").innerText="sp"+data2.sort+": "+data2.name;document.getElementById("RecentViewPlayEPInfo").title="sp"+data2.sort+": "+data2.name;
        document.getElementById("RecentViewPlayEPInfoCN").innerText="中文标题: "+data2.name_cn;document.getElementById("RecentViewPlayEPInfoCN").title="中文标题: "+data2.name_cn;
        document.getElementById("RecentViewPlayEPInfoLength").innerText="时长: "+data2.duration;
        $("#RecentViewPlayEPInfoDiscuss").attr('onclick','window.open("https://bgm.tv/ep/'+data2.id+'")');
        document.getElementById("RecentViewPlayEPInfoDiscuss").innerText="讨论: "+data2.comment+"条";
      }).fail(function() {document.getElementById("RecentViewPlayEPInfo").innerText="sp"+bgmSP});break;}
      
      else{document.getElementById("RecentViewPlayEPInfo").innerText="sp"+bgmSP;}
    }}).fail(function() { OKErrorStreamer("Error","无法连接Bangumi",0); document.getElementById("RecentViewPlayEPInfo").innerText="sp"+bgmSP;document.getElementById("RecentViewPlayEPInfoCN").innerText="中文标题: 未知";document.getElementById("RecentViewPlayEPInfoLength").innerText="时长: 未知"}); // *错误回调
  
    document.getElementById('RecentViewEpisodePlayCard').innerHTML="<div id='RecentViewEpisodePlayCardEpURL' style='left: 10px;right: 10px;top: 85px;width: auto;height: 25px;overflow: hidden;position: absolute;display: inline-block;white-space: nowrap;'><marquee style='/*animation: 8s wordsLoop linear infinite normal;*/'>"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".URL")+"</marquee></div>"+
  "<div style='left: 12px;top: 121px;position:absolute'>设置状态</div><div id='RecentViewEpisodePlayCardProgressWatched' class='RecentViewEpisodePlayCardProgressBtn' style='left:11px;border-top-right-radius: 0;border-bottom-right-radius: 0px;' onclick='store.set(\"WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".Condition\",\"Watched\");"+
  /*点击标注看过*/"document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\""+SettingsColorPicker(0.6)+"\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"#000\";document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 2px "+SettingsColorPicker(0.4)+"\";"+
  "document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"\").style.backgroundColor=\""+SettingsColorPicker(0.4)+"\";'>看过</div>"+
  
  /*点击标注看到此sp*/"<div id='RecentViewEpisodePlayCardProgressWatchedTill' class='RecentViewEpisodePlayCardProgressBtn' style='left: 64px;border-radius: 0px;border-left-width:0px;border-right-width:0px' onclick='for(var Tempj=1;Tempj<="+TempCounter+";Tempj++)"+
  "{store.set(\"WorkSaveNo"+MediaID+".SPDetails.SP\"+Tempj+\".Condition\",\"Watched\");document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo\"+Tempj).style.boxShadow=\"0px 0px 0px 2px "+SettingsColorPicker(0.4)+"\";document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo\"+Tempj).style.backgroundColor=\""+SettingsColorPicker(0.4)+"\"}"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\""+SettingsColorPicker(0.6)+"\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"#000\";'>看到</div>"+
  
  /*点击撤销观看此sp*/"<div class='RecentViewEpisodePlayCardProgressBtn' style='left: 114px;border-top-left-radius: 0;border-bottom-left-radius: 0;' onclick='store.set(\"WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".Condition\",\"Unwatched\");"+
  "document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.backgroundColor=\"#00000055\";document.getElementById(\"RecentViewEpisodePlayCardProgressWatched\").style.color=\"rgb(172, 172, 172)\";document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"\").style.boxShadow=\"0px 0px 0px 0px #ffffff4a\";"+
  "document.getElementById(\"ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter+"\").style.backgroundColor=\"rgb(0,0,0,0.3)\";"+
  "'>撤销</div>"+
  
  "<div class='RecentViewEpisodePlayCardPlay' style='right:10px;top:122px;width:28%;height:28%;border:0px solid' onclick='ArchiveMediaDetailsEpInfoPlayer("+MediaID+","+TempCounter+",\"SP\");'>"+
  "<div style='width: 80%;height: 100%;left:10%;position: absolute;background:url(./assets/play.svg) no-repeat center;background-size: contain;'></div>"+
  /*分割线*/"<div class='rolledEpisodePlayCard'></div></div><div style='position:absolute;left:10px;right:10px;height:2px;top:113px;border-radius:5px;background:#ffffff1f'></div>"+
  "<div id='RecentViewPlayEPInfo' style='position:absolute;left:15px;right:15px;top:10px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoCN' style='position:absolute;left:15px;right:15px;top:35px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoLength' style='position:absolute;left:15px;right:15px;top:60px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"+
  "<div id='RecentViewPlayEPInfoDiscuss' style='color:"+SettingsColorPicker(1)+";position:absolute;left:15px;right:15px;bottom:10px;top:195px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap; '></div>"
  //检测看过，自动高亮
  if(store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".Condition")=='Watched'){document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.backgroundColor=SettingsColorPicker(0.6);document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.color="#000"}
  }
}

//! 媒体库-作品详情页章节选择并播放
exports.ArchiveMediaDetailsEpInfoPlayer=function(MediaID,TempCounter,Type){
  console.log(MediaID,TempCounter,Type)
  if(((store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".URL"))&&Type=='EP')||((store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".URL"))&&Type=='SP')){
    if(Type == 'EP') var EPOpenURL = store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".URL");
    if(Type == 'SP') var EPOpenURL = store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+".URL");

    if(sysdata.get("Settings.checkboxA.LocalStorageUseSystemPlayer")){ //使用系统默认播放器
      // 规范化路径，确保兼容性
      DirectvideoPath = path.normalize(EPOpenURL);
      // 构建命令，使用系统默认程序打开文件
      let command = `start "" "${DirectvideoPath}"`;
      // 执行命令，拉起系统应用选择器
      exec(command, (error) => {
          if (error) {
            OKErrorStreamer("Error","无法打开视频文件",0);
          } else {
            if(Type!='SP'){store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition','Watched')}
            if(Type=='SP'){store.set("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+'.Condition','Watched')}
            OKErrorStreamer("OK","开始使用系统播放器播放，已记录进度",0);
          }
      });
    }
    else{ //使用自带MPV播放器
    process.noAsar = true; //临时禁用fs对ASAR读取
    fs.access(runtimeUrl, fs.constants.F_OK,function (err) {
      if (err) {  //调试播放核心 
        fs.access(EPOpenURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            if(Type!='SP'){store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition','Watched')}
            if(Type=='SP'){store.set("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+'.Condition','Watched')}
            let mpvPlayer = new mpv({"binary": packUrl,},["--fps=60"]);
            mpvPlayer.start()
            .then(() => {
              mpvPlayer.load(EPOpenURL);// player is running
            })
            }
        });
      } 
      else {  //打包后播放核心 
        fs.access(EPOpenURL, fs.constants.F_OK,function (exist) {
          if (exist) { OKErrorStreamer("Error","指定文件不存在！",0); } 
          else {
            process.noAsar = false; //恢复fs对ASAR读取
            OKErrorStreamer("OK","开始播放，已记录进度",0);
            if(Type!='SP'){store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+'.Condition','Watched')}
            if(Type=='SP'){store.set("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter+'.Condition','Watched')}
            let mpvPlayer = new mpv({"binary": runtimeUrl,},["--fps=60"]);
            mpvPlayer.start()
            .then(() => {
              mpvPlayer.load(EPOpenURL);// player is running
            })
            // mpvPlayer.load(EPOpenURL);
            }
        });
      }
    })
    process.noAsar = false; //恢复fs对ASAR读取
    }
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewID",store.get("WorkSaveNo"+MediaID+".bgmID"));
    localStorage.setItem("LocalStorageRecentViewID",store.get("WorkSaveNo"+MediaID+".bgmID"));
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewLocalID",MediaID);
    localStorage.setItem("LocalStorageRecentViewLocalID",MediaID);
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewURL",EPOpenURL);
    localStorage.setItem("LocalStorageRecentViewURL",EPOpenURL);
    sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisode",TempCounter);
    localStorage.setItem("LocalStorageRecentViewEpisode",TempCounter);
    if(Type == 'EP') {
      sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(TempCounter+1)+".URL"));
      localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+(TempCounter+1)+".URL"));
      sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisodeType",'EP');localStorage.setItem("LocalStorageRecentViewEpisodeType",'EP');
      document.getElementById("ArchivePageContentDetailsEpisodeNo"+TempCounter).style.boxShadow="0px 0px 0px 2px "+SettingsColorPicker(0.4);
      document.getElementById("ArchivePageContentDetailsEpisodeNo"+TempCounter).style.backgroundColor=SettingsColorPicker(0.4);
    }
    if(Type == 'SP') {
      sysdata.set("Settings.checkboxC.LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(TempCounter+1)+".URL"));
      localStorage.setItem("LocalStorageRecentViewNextURL",store.get("WorkSaveNo"+MediaID+".URL")+"\\"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+(TempCounter+1)+".URL"));
      sysdata.set("Settings.checkboxC.LocalStorageRecentViewEpisodeType",'SP');localStorage.setItem("LocalStorageRecentViewEpisodeType",'SP');
      document.getElementById("ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter).style.boxShadow="0px 0px 0px 2px "+SettingsColorPicker(0.4);
      document.getElementById("ArchivePageContentDetailsSpecialEpisodeNo"+TempCounter).style.backgroundColor=SettingsColorPicker(0.4);
    }

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
      document.getElementById("RecentViewRatingScore").innerText=data.rating.score.toFixed(1);//appendChild(HomePageRatingScore);
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

      // *计算作品进度信息
      ArchivePageMediaProgressCalc(MediaID);
      let RecentViewWatchPercentSaver = 0;
      for(let Tempi=1;Tempi<=parseInt(store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum"));Tempi++){
        if(store.get("WorkSaveNo"+MediaID.toString()+".EPDetails.EP"+Tempi+'.Condition')=='Watched') RecentViewWatchPercentSaver++;
      } RecentViewWatchPercentSaver = (RecentViewWatchPercentSaver/parseInt(store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum")))*100
      document.getElementById("RecentViewFullProgressNum").innerText=RecentViewWatchPercentSaver.toFixed(1)+" %";
      document.getElementById("RecentViewFullProgressLine").style.width=RecentViewWatchPercentSaver.toString()+"%";
      if(sysdata.get("Settings.checkboxC.LocalStorageRecentViewEpisodeType")=="EP"&&bgmEP/store.get("WorkSaveNo"+MediaID.toString()+".EPTrueNum")==1) {
        $("#RecentViewPlay").attr('onclick',"ipcRenderer.send('MediaShare',sysdata.get('Settings.checkboxC.LocalStorageRecentViewLocalID'));");
        // document.getElementById("RecentViewPlayClick").onclick=function(){ipcRenderer.send('MediaShare',sysdata.get('Settings.checkboxC.LocalStorageRecentViewLocalID'))};
        document.getElementById("RecentViewPlayText").innerText="分享";
        document.getElementById("RecentViewPlayIcon").innerText="";
        document.getElementById("RecentViewPlayIcon").style.background="url(./assets/sharemedia.svg)";
        document.getElementById("RecentViewPlayIcon").style.width="20px";
        document.getElementById("RecentViewPlayIcon").style.height="30px";
      }
      console.log("Success");
    }
  }
}

exports.ArchiveMediaDetailsEpInfoCardWatched = function (MediaID,TempCounter,bgmID,bgmEP,Type){
  store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter+".Condition","Watched");
  /*点击标注看过*/
  document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.backgroundColor=SettingsColorPicker(0.6);
  document.getElementById("RecentViewEpisodePlayCardProgressWatched").style.color="#000";
  document.getElementById("ArchivePageContentDetailsEpisodeNo"+TempCounter).style.boxShadow="0px 0px 0px 2px "+SettingsColorPicker(0.4);
  document.getElementById("ArchivePageContentDetailsEpisodeNo"+TempCounter).style.backgroundColor=SettingsColorPicker(0.4);
  ArchivePageMediaProgressCalc(MediaID);ArchiveMediaDetailsEpisodeUserUpdate(bgmID,bgmEP,(bgmEP+1),2);
}