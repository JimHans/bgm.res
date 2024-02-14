/**
 * @name MainpageArchiveScanner.js
 * @module MainpageArchiveScanner.js
 * @description bgm.res主界面/媒体库界面的作品扫描模块封装
 */

const mediaExtensions = ['.mp4', '.flv', '.mkv', '.rm', '.rmvb', '.avi', '.m2ts', '.m4s','.mov']; //媒体文件后缀名
var MediaDirectoryStorage = new Array(); //媒体库目录存储数组
var MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组

//! 媒体库-目录扫描递归子模块
function LocalWorkScanSubModule(ScanDirectory){
  var ScanSubDir = fs.readdirSync(ScanDirectory); //扫描目标媒体库目录

  for(var ScanTemp=0;ScanTemp!=ScanSubDir.length;ScanTemp++){ //轮询找到媒体库目录下的子目录
    if(fs.lstatSync(ScanDirectory+"\\"+ScanSubDir[ScanTemp]).isDirectory()) //如果是目录
    {
      let ScanSubDirFiles = fs.readdirSync(ScanDirectory+"\\"+ScanSubDir[ScanTemp]); 
      let hasMediaFile = ScanSubDirFiles.some(ScanSubDirFiles => {
        const ext = path.extname(ScanSubDirFiles).toLowerCase();
        return mediaExtensions.includes(ext);
      }); //检测子目录下是否存在媒体文件
      
      if(hasMediaFile) //存在媒体文件
      {
        MediaDirectoryStorage.push(ScanDirectory+"\\"+ScanSubDir[ScanTemp]); //将扫描到的媒体库目录存入数组
        MediaDirectoryNameStorage.push(ScanSubDir[ScanTemp]); //将扫描到的媒体库目录文件夹名存入数组
      }
      else if(!hasMediaFile) //不存在媒体文件
      {LocalWorkScanSubModule(ScanDirectory+"\\"+ScanSubDir[ScanTemp]);} //递归扫描子目录
    }
  }
}

//! 媒体库-目录全局扫描模块
exports.LocalWorkScan=function(){
  var result = dialog.showMessageBoxSync({
    type:"question",
    buttons:["取消","确认"],
    title:"提示",
    message:`您确定要进行媒体库全局扫描吗？这将覆盖您当前的媒体库数据信息！`
  });
  if(result == 1){
    if(sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL")) //if(localStorage.getItem('LocalStorageMediaBaseURL'))
    {
      var TargetArchiveURL = sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL") //localStorage.getItem('LocalStorageMediaBaseURL');
      if(fs.existsSync(TargetArchiveURL)){       // *当目标媒体库目录存在
        OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库，请稍后</div>",0);
        setTimeout(function() {
        store.clear(); //清除旧媒体库信息
        var TargetArchiveDir = fs.readdirSync(TargetArchiveURL); //扫描目标媒体库目录
        console.log("目标媒体库根目录文件数目"+TargetArchiveDir.length);
        MediaDirectoryStorage = new Array(); //媒体库目录存储数组清零
        MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组清零
        LocalWorkScanSubModule(TargetArchiveURL); //调用递归子模块
        var ScanSaveCounter = 0; //媒体编号清零
        // for(var ScanCounter=0;ScanCounter!=TargetArchiveDir.length;ScanCounter++){ //轮询找到媒体库目录下的子目录
        for(var ScanCounter=0;ScanCounter!=MediaDirectoryStorage.length;ScanCounter++){ //轮询找到媒体库目录下的子目录
          
          if(fs.lstatSync(MediaDirectoryStorage[ScanCounter]).isDirectory()){ //TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]
            ScanSaveCounter++;
            console.log("Folder"+ScanSaveCounter+":"+MediaDirectoryNameStorage[ScanCounter]); //扫描debug输出
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".URL",MediaDirectoryStorage[ScanCounter]); //扫描到的媒体路径
            store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Name",MediaDirectoryNameStorage[ScanCounter]); //扫描到的媒体名称默认为文件夹名
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
          let WorkTempName = store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g);
          if(WorkTempName!=null&&WorkTempName!=" "){ 
            //存在双括号约束
            $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempName+"?type=2", function(data){
              store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.list[0].id); }
              ).fail(function(){ //如果搜索失败，尝试使用Google翻译为日语搜索
                $.ajax({ 
                url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+WorkTempName.toString()+'"', 
                type: 'GET',timeout : 2000,
                success: function(data2){
                  console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
                  $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
                  store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data3.list[0].id); }); //再次初始化id
                  }})});} //初始化id
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
        setTimeout(function() {ArchiveMediaUpdate();},300);
        // console.log(store.get('WorkSaveNo5'));
        },1000);
      }
      else{OKErrorStreamer("Error","路径错误！",0);}
    }
    else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
  }
}

//! 媒体库-目录增量扫描模块
exports.LocalWorkScanModify=function(){
  if(sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL"))  // *检测是否已填写路径 localStorage.getItem('LocalStorageMediaBaseURL');
  {
    var TargetArchiveURL = sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL")//localStorage.getItem('LocalStorageMediaBaseURL');

    if(fs.existsSync(TargetArchiveURL)){       // *当目标媒体库目录存在
      OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库更改，请稍后</div>",0);

      setTimeout(function() {
      var TargetArchiveDir = fs.readdirSync(TargetArchiveURL); //扫描目标媒体库目录
      // console.log(TargetArchiveDir.length);
      console.log("目标媒体库根目录文件数目"+TargetArchiveDir.length);
      MediaDirectoryStorage = new Array(); //媒体库目录存储数组清零
      MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组清零
      LocalWorkScanSubModule(TargetArchiveURL); //调用递归子模块

      var ScanSaveCounter = 0; //媒体计数器清零
      if(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))
      {var LocalStorageMediaBaseNumber = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");}//localStorage.getItem("LocalStorageMediaBaseNumber")
      else {var LocalStorageMediaBaseNumber = 0;} //获取已存储的总数目,若未初始化则置零

      for(let ScanCounter=0;ScanCounter!=MediaDirectoryStorage.length;ScanCounter++){ //轮询找到媒体库目录下的子目录

        var Scan_Valid = 0; //扫描有效键值

        for(let StorageScanCounter=1;StorageScanCounter<=LocalStorageMediaBaseNumber;StorageScanCounter++){
          if((MediaDirectoryStorage[ScanCounter]) == store.get("WorkSaveNo"+StorageScanCounter.toString()+".URL"))
          {Scan_Valid = 1;break;}
        }

        if(fs.lstatSync(MediaDirectoryStorage[ScanCounter]).isDirectory() && Scan_Valid == 0){
          ScanSaveCounter++;
          let ScanStorageNumber = Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter) //媒体计数器+已有数目计算得出实际编号
          console.log("Folder"+ScanStorageNumber+":"+MediaDirectoryNameStorage[ScanCounter]); //扫描debug输出
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".URL",MediaDirectoryStorage[ScanCounter]); //扫描到的媒体路径
          store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Name",MediaDirectoryNameStorage[ScanCounter]); //扫描到的媒体名称默认为文件夹名
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
          let WorkTempName = store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().match(/(?<=\])(.+?)(?=\[)/g);
          if(WorkTempName!=null&&WorkTempName!=" "){ 
            //存在双括号约束
            $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempName+"?type=2", function(data){
              store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); }
              ).fail(function(){ //如果搜索失败，尝试使用Google翻译为日语搜索
                $.ajax({ 
                url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+WorkTempName.toString()+'"', 
                type: 'GET',timeout : 2000,
                success: function(data2){
                  console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
                  $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
                  store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data3.list[0].id); }); //再次初始化id
            }})});} //初始化id
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
      if(ScanSaveCounter!=0){ //如果扫描到媒体，延时3秒后更新媒体信息
      setTimeout(function() {ArchiveMediaUpdateSingle(LocalStorageMediaBaseNumber,ScanSaveCounter)},3000);}// console.log(store.get('WorkSaveNo5'));
      },1000);
    }
    else{OKErrorStreamer("Error","路径错误！",0);}
  }
  else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
}
