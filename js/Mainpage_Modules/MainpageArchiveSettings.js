/**
 * @name MainpageArchiveSettings.js
 * @module MainpageArchiveSettings.js
 * @description bgm.res主界面/媒体库界面的作品设置(旧版)模块封装
 */

//! 媒体库-作品设置模块
exports.ArchiveContentEditer=function(MediaID) {
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
exports.StoreSave=function(Key,Input,WorkID){
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
exports.StoreDeleteWork=function(WorkID){
  var result = dialog.showMessageBoxSync({
    type:"question",
    buttons:["取消","确认"],
    title:"警告",
    message:`您确定要从媒体库中删除作品 [`+store.get("WorkSaveNo"+WorkID+".Name")+
    `] 吗？此操作将仅在媒体库中屏蔽该作品，您在磁盘上的文件不会被删除，之后您也可以在媒体库中的已屏蔽作品目录中恢复。`
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