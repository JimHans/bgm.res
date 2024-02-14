/**
 * @name MainpageArchiveAdder.js
 * @module MainpageArchiveAdder.js
 * @description bgm.res主界面/媒体库界面的作品添加模块
 */

//! 媒体库-新增作品模块
exports.LocalWorkManualAddAndSave=function(type){
  if(type == 'Add'){ipcRenderer.send('AddMediaPage',"Open");} // *打开新增作品页面
  else if(type == 'AddOld'){ // *打开新增作品页面(旧版)
    ipcRenderer.send('AddMediaPage',"Open");
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