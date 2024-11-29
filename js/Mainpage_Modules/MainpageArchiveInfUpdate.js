/**
 * @name MainpageArchiveInfUpdate.js
 * @module MainpageArchiveInfUpdate.js
 * @description bgm.res主界面/媒体库界面的作品信息更新模块
 */

//! 媒体库-作品数据信息链接BGM更新模块(所有作品)
exports.ArchiveMediaUpdate=function(){
  // *Archive Get <!--联网检索ArchivePage媒体库内容-->
  var result = dialog.showMessageBoxSync({
    type:"question",
    buttons:["取消","确认"],
    title:"提示",
    message:`您确定要进行媒体库作品信息全局更新吗？这可能会覆盖您自定义的部分作品信息，包括封面、作品制作信息等！`
  });
  if(result == 1){
    OKErrorStreamer("MessageOn","作品信息更新进行中",0);
    if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")&&localStorage.getItem('LocalStorageMediaBaseDeleteNumber')){
      document.getElementById("ArchivePageSum").innerText="共 "+Number(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber")-sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"))+" 部作品";}
    setTimeout(function() {
      var MediaBaseNumberGet = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");//localStorage.getItem("LocalStorageMediaBaseNumber");
      // *扫描作品bgmID获取作品信息 
      var UpdateCounter = 0; //线程完成计数器清零
      //$.ajaxSettings.async = false; //关闭同步
      function ArchiveMediaUpdateOperator(MediaBaseScanCounter) {
        // *扫描作品bgmID获取作品信息
        // document.getElementById('MessageStreamer').innerText='作品信息更新进行中'+MediaBaseScanCounter+'/'+MediaBaseNumberGet;
        if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID") != '0'){
          $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString(), function(data){
            store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
            if(data.date) store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
            store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
            if(data.name_cn!=""){store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);}
            else{store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name);}
            store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
            store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
            UpdateCounter+=0.5;if(UpdateCounter>=MediaBaseNumberGet)UpdateEnding();
          }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);UpdateCounter+=0.5;if(UpdateCounter>=MediaBaseNumberGet)UpdateEnding();}); // *错误回调
          $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString()+'/persons', function(data){
          for(let MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
            if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
            if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
            if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
          } UpdateCounter+=0.5;if(UpdateCounter>=MediaBaseNumberGet)UpdateEnding();}).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);
            UpdateCounter+=0.5;if(UpdateCounter>=MediaBaseNumberGet)UpdateEnding();}); // *错误回调
        } else {UpdateCounter+=1;if(UpdateCounter>=MediaBaseNumberGet)UpdateEnding();}
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
      } //$.ajaxSettings.async = true; //重新打开同步
      function UpdateEnding(){
      ArchivePageInit(); //更新媒体库页面
      OKErrorStreamer("MessageOff","作品信息更新进行中",0);
      OKErrorStreamer("OK","媒体库数据爬取完成",0); 
      }
      },2000);
    }
}

//! 媒体库-作品数据信息链接BGM更新模块(指定作品ID范围) 
exports.ArchiveMediaUpdateSingle=function(LocalStorageMediaBaseNumber,ScanSaveCounter){
  // *Archive Get <!--联网检索ArchivePage指定媒体内容-->
  OKErrorStreamer("MessageOn","作品信息更新进行中",0);
  let ScanProgress = 0;
  for(let ScanCounter=1;ScanCounter<=ScanSaveCounter;ScanCounter++){
    // *Archive Get <!--联网检索ArchivePage指定媒体内容-->
    let MediaBaseScanCounter = (Number(LocalStorageMediaBaseNumber)+Number(ScanCounter))
    // *扫描作品bgmID获取作品信息 
      if(store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID") != '0'){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString(), function(data){
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
          if(data.date) store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
          if(data.name_cn!=null){store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);}
          else{store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name);}
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
          store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
        }).fail(function(){ScanProgress+=1;OKErrorStreamer("MessageOn","作品信息更新进行中"+parseInt(ScanProgress*100/ScanSaveCounter)+"%",0);OKErrorStreamer("Error","作品"+ScanCounter+"连接Bangumi更新失败",0);if(ScanProgress>=ScanSaveCounter){OKErrorStreamer("MessageOff","作品信息更新进行中",0);OKErrorStreamer("OK","媒体库数据爬取完成",0);ArchivePageInit();}}).done(function(){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID").toString()+'/persons', function(data){
          for(let MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
            if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
            if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
            if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
            else if(data[MediaBaseElementsGet].relation=='原案') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
          } }).fail(function(){ScanProgress+=1;OKErrorStreamer("MessageOn","作品信息更新进行中"+parseInt(ScanProgress*100/ScanSaveCounter)+"%",0);OKErrorStreamer("Error","作品"+ScanCounter+"连接Bangumi更新失败",0);if(ScanProgress==ScanSaveCounter){OKErrorStreamer("MessageOff","作品信息更新进行中",0);OKErrorStreamer("OK","媒体库数据爬取完成",0);ArchivePageInit();}})
          .done(function(){ScanProgress+=1;OKErrorStreamer("MessageOn","作品信息更新进行中"+parseInt(ScanProgress*100/ScanSaveCounter)+"%",0);if(ScanProgress>=ScanSaveCounter){OKErrorStreamer("MessageOff","作品信息更新进行中",0);OKErrorStreamer("OK","媒体库数据爬取完成",0);ArchivePageInit();}}); // *错误回调
      }); // *错误回调
      } else{OKErrorStreamer("Error","作品信息刮削错误，未更新",0);ScanProgress+=1;if(ScanProgress>=ScanSaveCounter){OKErrorStreamer("MessageOff","作品信息更新进行中",0);OKErrorStreamer("OK","媒体库数据爬取完成",0);ArchivePageInit();}}
  }
}