/**
 * @name MainpageArchiveScanner.js
 * @module MainpageArchiveScanner.js
 * @description bgm.res主界面/媒体库界面的作品扫描模块封装
 */

const mediaExtensions = ['.mp4', '.flv', '.mkv', '.rm', '.rmvb', '.avi', '.m4s','.mov' ,".wmv", ".mpeg", ".mpg"]; //媒体文件后缀名， '.m2ts',BDMV单独处理
var MediaDirectoryStorage = new Array(); //媒体库目录存储数组
var MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组
var MediaDirectoryBDMVStorage = new Array(); //媒体库目录BDMV存储数组


//! 媒体库-刮削器
function cleanBracketsAdvanced(text, replaceDict, excludeDict, cleanStartText) { 

  // 1. 删除开头的中括号内容(去除字幕组前缀)
  let cleanedText = text.replace(/^\s*\[[^\]]*\]/, '');
  if (cleanStartText==false) cleanedText = text; //若不要求删除，保留开头的中括号内容 

  // 2. 清理包含关键词的括号(去除压制标签)
  const bracketsRegex = /[\[\(（【][^\]\)）】]*[\]\)）】]/g;
  cleanedText = cleanedText.replace(bracketsRegex, (match) => {
      for (let key in replaceDict) {
          let keyRegex = new RegExp(key, 'i');
          if (keyRegex.test(match)) {
              return ' ';
          }
      }
      return match;
  });

  // 3. 删除排除字典中的关键词(去除部分影响匹配的词汇)
  for (let key in excludeDict) {
      let keyRegex = new RegExp(key, 'gi');
      cleanedText = cleanedText.replace(keyRegex, ' ');
  }

  // 4. 删除括号中只有数字和-连接符的括号内容(排除集数编号)
  cleanedText = cleanedText.replace(/[\[\(（【][0-9\-]+[\]\)）】]/g, '');

  // 5. 将剩余中括号和特殊字符替换为空格
  cleanedText = cleanedText.replace(/[\[\]]/g, ' ');

  // 6. 将字符串中的数字去除前缀0(修正单集序号)
  cleanedText = cleanedText.replace(/\bS?0+(\d+)\b/g, '$1');

  // 7. 清理多余空格
  return cleanedText.replace(/\s+/g, ' ').trim();
}


//! 媒体库-Google Translate API
async function googleTranslate(text,TryLimit) {
  // var GoogleTranslateLimitTry=TryLimit+1; //尝试次数+1
  // console.log("Google翻译尝试次数:"+GoogleTranslateLimitTry);

  return new Promise((resolve, reject) => {
    // setTimeout(() => {
    //     $.ajax({
    //       url: 'https://translate.renwole.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&hl=en&q="'+text+'"',
    //       type: 'GET',
    //       timeout: 2000,
    //       success: async function(response) {
    //         if (response && response.sentences[0]) {
    setTimeout(() => {
      $.ajax({
        url: 'https://graphql.anilist.co/',
        type: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: JSON.stringify({
          query: `query ($search: String) {
            Page(page: 1, perPage: 5) {media(search: $search, format_in: [TV, MOVIE, TV_SHORT, SPECIAL, ONA], type: ANIME, sort: SEARCH_MATCH) {id}}}`,
          variables: {search: text}}),
        timeout: 2000,
        success: async function(response) {
          //if (response && response.sentences[0]) {
          if (response && response.data.Page.media[0]) {

          $.ajax({
            url: 'https://graphql.anilist.co/',
            type: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            data: JSON.stringify({
              query: `query ($id: Int) {Media(id: $id, type: ANIME) {title {native}}}`,
              variables: {id: response.data.Page.media[0].id } // 替换为实际的作品ID
            }),
            timeout: 2000,
            success: async function(response2) {

              //拼接翻译结果
              let cleanedText = response2.data.Media.title.native.replace(/[『』」「]/g, '');
              // let cleanedText = response.sentences.map(sentence => sentence.trans).join(' ').replace(/[『』」「]/g, '');
              // let GoogleOnlineModelSpec = 'online'; //google翻译是否启用了在线模型
              // if (response.sentences[0].model_specification && response.sentences[0].model_specification[0]!={}) GoogleOnlineModelSpec = response.sentences[0].model_specification[0].label; 
              // if(GoogleOnlineModelSpec == 'offline' && GoogleTranslateLimitTry<=5) 
              //   {cleanedText = await googleTranslate(text,GoogleTranslateLimitTry); resolve(cleanedText);} //若片名不包含中日文，递归继续尝试翻译直到超时或成功
              if(false) ; else{
                // 将字符串中的I表示的罗马数字1-10改为unicode(修正剧场版序号)
                const romanToArabicMap = { 'ii': 'Ⅱ',
                  'II': 'Ⅱ','III': 'Ⅲ', 'IV': 'Ⅳ','V': 'Ⅴ',
                  'VI': 'Ⅵ','VII':  'Ⅶ', 'VIII': 'Ⅷ','IX': 'Ⅸ','X': 'Ⅹ' };
                function romanToArabic(roman) {return romanToArabicMap[roman] || roman;}
                cleanedText = cleanedText.replace(/\b[IVXLCDM]+\b/g, (match) => {return romanToArabic(match);});
                resolve(cleanedText);
              }
            },error: function(xhr, status, error) {console.log("Google翻译执行失败"); resolve(text);}});
          } else {console.log("Google翻译执行失败"); resolve(text);}
        },
        error: function(xhr, status, error) {console.log("Google翻译执行失败"); resolve(text);}
      });
    }, 1); // 使用 setTimeout 避免阻塞
  });
}

//! 媒体库-目录扫描BDMV-主目录溯源模块
function getParentDirectory(ScanDirectory, BaseDirectory) {
  // 获取相对路径
  const relativePath = path.relative(BaseDirectory, ScanDirectory);
  
  // 提取相对路径的第一级目录名
  const parentDirectoryName = relativePath.split(path.sep)[0];
  
  return [parentDirectoryName, BaseDirectory+"\\"+parentDirectoryName];
}

//! 媒体库-目录扫描递归子模块
async function LocalWorkScanSubModule(ScanDirectory, BaseDirectory){
  try {
    var ScanSubDir = await fs.promises.readdir(ScanDirectory); //扫描目标媒体库目录

    for(var ScanTemp=0;ScanTemp!=ScanSubDir.length;ScanTemp++){ //轮询找到媒体库目录下的子目录
      if(fs.lstatSync(ScanDirectory+"\\"+ScanSubDir[ScanTemp]).isDirectory() && ScanSubDir[ScanTemp]!='qBittorrent') //如果是目录,排除qbit文件夹
      {
        if (ScanSubDir[ScanTemp]=="CERTIFICATE" && !MediaDirectoryStorage.includes(getParentDirectory(ScanDirectory, BaseDirectory)[1])) { 
          //如果是CERTIFICATE目录且先前未被存储，存储后返回上级目录
          MediaDirectoryStorage.push(getParentDirectory(ScanDirectory, BaseDirectory)[1]); 
          MediaDirectoryNameStorage.push(getParentDirectory(ScanDirectory, BaseDirectory)[0]);
          MediaDirectoryBDMVStorage.push(getParentDirectory(ScanDirectory, BaseDirectory)[1]) //存储BDMV路径
          return;} 
        //如果是BDMV目录，返回上级目录

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
        {await LocalWorkScanSubModule(ScanDirectory+"\\"+ScanSubDir[ScanTemp], BaseDirectory);} //递归扫描子目录
      }
    }
  }catch (error) {OKErrorStreamer("Error", "读取目录失败！", 0);}
}

//! 媒体库-目录全局扫描目录遍历子模块  
async function LocalWorkScanProcessDirectory(index,ScanSaveCounter) {
  if (fs.lstatSync(MediaDirectoryStorage[index]).isDirectory()) {
    ScanSaveCounter++;
    console.log("Folder" + ScanSaveCounter + ":" + MediaDirectoryNameStorage[index]); // 扫描 debug 输出
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".URL", MediaDirectoryStorage[index]); // 扫描到的媒体路径
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Name", MediaDirectoryNameStorage[index]); // 扫描到的媒体名称默认为文件夹名
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".bgmID", '0'); // 扫描到的媒体默认 bgmID 为 0
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Score", '0.0'); // 扫描到的媒体默认评分
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Type", 'TV'); // 扫描到的媒体默认类型
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Year", '0000'); // 扫描到的媒体默认年代
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Eps", '1'); // 扫描到的媒体默认话数
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Protocol", 'Unknown'); // 扫描到的媒体默认原案
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Director", 'Unknown'); // 扫描到的媒体默认监督
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Corp", 'Corp'); // 扫描到的媒体默认制作公司
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".Cover", './assets/banner.jpg'); // 扫描到的媒体默认封面(后期联网更新为 base64)
    store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".ExistCondition", 'Exist'); // 扫描到的媒体默认状态(默认存在)
    await new Promise(resolve => setTimeout(resolve, 1)); // 确保每次迭代不会阻塞主线程
    if(MediaDirectoryBDMVStorage.includes(MediaDirectoryStorage[index])) 
      {store.set("WorkSaveNo" + ScanSaveCounter.toString() + ".BDMV", 'BDMV');} //如果是BDMV目录，标记为BDMV
    await LocalWorkEpsScanModule(ScanSaveCounter.toString());
  }
  return ScanSaveCounter;
}

//! 媒体库-目录全局扫描模块
exports.LocalWorkScan=function(){
  var result = dialog.showMessageBoxSync({
    type:"question",
    buttons:["取消","确认"],
    title:"提示",
    message:`确定要进行媒体库全局扫描吗？这将覆盖您当前的媒体库数据信息！`,
    detail: "在扫描时，bgm.res将对无法识别的媒体使用Anilist API进行处理以提升匹配准确率。\n \nAnilist API存在访问频率限制，因此其匹配过程缓慢，请您在匹配过程中耐心等待。",
    // icon: "./assets/icon.png"
  });
  if(result == 1){
    if(sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL")) //if(localStorage.getItem('LocalStorageMediaBaseURL'))
    {
      var TargetArchiveURL = sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL") //localStorage.getItem('LocalStorageMediaBaseURL');
      MediaDirectoryStorage = new Array(); //媒体库目录存储数组清零
      MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组清零
      MediaDirectoryBDMVStorage = new Array(); //媒体库目录BDMV存储数组清零
      OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在遍历媒体库，请稍后</div>",0);
      setTimeout(async function() {
      for(let TempArchive=0;TempArchive!=TargetArchiveURL.length;TempArchive++) { //轮询找到媒体库目录下的子目录
      OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在遍历媒体库，请稍后 "+
        parseInt((TempArchive + 1) / TargetArchiveURL.length * 100)+"%</div>",0);
      if(fs.existsSync(TargetArchiveURL[TempArchive])){       // *当目标媒体库目录存在
        // setTimeout(function() {
        store.clear(); //清除旧媒体库信息
        var TargetArchiveDir = await fs.promises.readdir(TargetArchiveURL[TempArchive]); //扫描目标媒体库目录
        console.log("目标媒体库根目录文件数目"+TargetArchiveDir.length);
        // MediaDirectoryStorage = new Array(); //媒体库目录存储数组清零
        // MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组清零
        await LocalWorkScanSubModule(TargetArchiveURL[TempArchive],TargetArchiveURL[TempArchive]); //调用递归子模块
        // LocalWorkScanBackbone();
        }
      else{OKErrorStreamer("MessageOff","",0);OKErrorStreamer("Error","路径错误！",0);}
      }
      LocalWorkScanBackbone();},100);
    }
    else{OKErrorStreamer("MessageOff","",0);OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
  }
}

//! 媒体库-目录全局扫描后端模块
async function LocalWorkScanBackbone() {
        var ScanSaveCounter = 0; //媒体编号清零
        for (let ScanCounter = 0; ScanCounter < MediaDirectoryStorage.length; ScanCounter++) {
          await new Promise(resolve => setTimeout(resolve, 1)); // 确保每次迭代不会阻塞主线程
          ScanSaveCounter = await LocalWorkScanProcessDirectory(ScanCounter,ScanSaveCounter);
          // 使用 requestAnimationFrame 更新进度信息
          requestAnimationFrame(() => {
            OKErrorStreamer("MessageOn", "<div class='LoadingCircle'>正在扫描媒体库，请稍后 " + parseInt((ScanCounter + 1) / MediaDirectoryStorage.length * 100) + "%</div>", 0);
            if(ScanCounter == MediaDirectoryStorage.length - 1) OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后</div>",0);
          });
        }
        // for(var ScanCounter=0;ScanCounter!=TargetArchiveDir.length;ScanCounter++){ //轮询找到媒体库目录下的子目录
        // for(var ScanCounter=0;ScanCounter!=MediaDirectoryStorage.length;ScanCounter++){ //轮询找到媒体库目录下的子目录
          
        //   if(fs.lstatSync(MediaDirectoryStorage[ScanCounter]).isDirectory()){ //TargetArchiveURL+"\\"+TargetArchiveDir[ScanCounter]
        //     ScanSaveCounter++;
        //     console.log("Folder"+ScanSaveCounter+":"+MediaDirectoryNameStorage[ScanCounter]); //扫描debug输出
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".URL",MediaDirectoryStorage[ScanCounter]); //扫描到的媒体路径
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Name",MediaDirectoryNameStorage[ScanCounter]); //扫描到的媒体名称默认为文件夹名
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".bgmID",'0'); //扫描到的媒体默认bgmID为0
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Score",'0.0'); //扫描到的媒体默认评分
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Type",'TV'); //扫描到的媒体默认类型
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Year",'0000'); //扫描到的媒体默认年代
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Eps",'1'); //扫描到的媒体默认话数
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Protocol",'Unknown'); //扫描到的媒体默认原案
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Director",'Unknown'); //扫描到的媒体默认监督
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Corp",'Corp'); //扫描到的媒体默认制作公司
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".Cover",'./assets/banner.jpg'); //扫描到的媒体默认封面(后期联网更新为base64)
        //     store.set("WorkSaveNo"+ScanSaveCounter.toString()+".ExistCondition",'Exist'); //扫描到的媒体默认状态(默认存在)

        //     LocalWorkEpsScanModule(ScanSaveCounter.toString());
        //   }
        // }
        sysdata.set("Settings.checkboxC.LocalStorageMediaBaseNumber",ScanSaveCounter);
        localStorage.setItem("LocalStorageMediaBaseNumber",ScanSaveCounter); //存储扫描到的媒体数目
        sysdata.set("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber",0);
        localStorage.setItem('LocalStorageMediaBaseDeleteNumber',0) //存储删除的媒体数目(初始0)

        // *使用默认刮削器自动收集初始数据
        OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后</div>",0);
        // $.ajaxSetup({ async: false }); //关闭同步
        var ScanSliceCounter = 0; //线程完成计数器清零
        for(var ScanCounter2=1;ScanCounter2<=ScanSaveCounter;ScanCounter2++){DefaultSlicer(ScanCounter2);}//轮询找到媒体库目录下的子目录
          function DefaultSlicer(ScanCounter){
          //TODO 默认刮削器
          let replaceDict = sysdata.get("Settings.checkboxC.LocalStorageMediaScanExpression"); //括号屏蔽词库
          let excludeDict = sysdata.get("Settings.checkboxC.LocalStorageMediaScanExpressionSub"); //匹配屏蔽词库，请小心添加防止误伤

          // if(WorkScanExpression=='default' || WorkScanExpression=='') WorkScanExpression = "/(?<=\\])(.+?)(?=\\[)/g"; //默认正则表达式
          // let WorkTempName = store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().match(eval(WorkScanExpression));
          let WorkTempName = cleanBracketsAdvanced(store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString(), replaceDict, excludeDict, true);
          // console.log(WorkTempName) //当前文件名输出

          if(WorkTempName!=null&&WorkTempName!=" "&&WorkTempName!=""){  //成功匹配刮削到数据
            store.set("WorkSaveNo"+ScanCounter.toString()+".Name",WorkTempName); //更新文件名为刮削后
            setTimeout(async function() {

            const containsCJK = /[\u4e00-\u9faf\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]/.test(WorkTempName); //检测是否包含中日文
            
            let WorkTempNameJP = WorkTempName; //日语片名翻译临时存储
            if (!containsCJK) {WorkTempNameJP = await googleTranslate(WorkTempName,0);}//!若片名不包含中日文，使用google镜像api进行翻译
            
            // console.log("尝试使用原始片名搜索:"+WorkTempName);

            $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempName+"?type=2", function(data0){ //!使用原生bgm检索
              if (data0.list) store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data0.list[0].id); ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
              .fail(function(){

              console.log("尝试使用日语片名搜索:"+WorkTempNameJP+"(原始片名:"+WorkTempName+")");
              let WorkSearchResultGet = 0; //是否完成搜索以及执行后续搜索的标志

              $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+WorkTempNameJP+'","sort": "rank","filter": {"type": [2]}}',success: function(data){ //!基于日文翻译片名使用bgm新搜索匹配结果
              if (data.total) {store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.data[0].id); WorkSearchResultGet=1; ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0); if(ScanSliceCounter==ScanSaveCounter) ScannerEnding();}}
              }).always(function(){ //!如果搜索失败，尝试使用IMDB匹配英文片名

                if (WorkSearchResultGet == 1) return; //如果已经匹配成功，不再进行后续搜索

                $.ajax({ 
                url: 'https://v3.sg.media-imdb.com/suggestion/x/'+WorkTempName.toString()+'.json?includeVideos=1', 
                type: 'GET',timeout : 2000,
                success: async function(data2){

                  let imdbWorkName = WorkTempName
                  if (data2.d.length>0) {imdbWorkName = (data2.d[0].l).replace(/[\/\\]/g, ' ')} //去除斜杠防止api错误
                  
                  let WorkTempNameIMDBJP = await googleTranslate(imdbWorkName,0); //!使用google translate 镜像api翻译IMDB片名
                  console.log("尝试使用IMDB日文片名搜索:"+WorkTempNameIMDBJP+"(原始片名:"+WorkTempName+")");

                  $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempNameIMDBJP+"?type=2", function(data3){ //!使用IMDB匹配结果进行bgm检索
                  if (data3.list) store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
                  .fail(function(){

                    //!如果仍无法匹配，尝试使用bgm.tv新接口进行查询
                    $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+WorkTempNameIMDBJP+'","sort": "rank","filter": {"type": [2]}}', success: function(data4){
                      if (data4.total) {store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data4.data[0].id); WorkSearchResultGet = 1; ScanSliceCounter+=1; if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}}
                      }).always(function(){

                        if (WorkSearchResultGet == 1) return; //如果已经匹配成功，不再进行后续搜索
                        //!如果仍无法匹配，最后尝试使用bgm.tv新接口与IMDB英文进行查询
                        $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+imdbWorkName+'","sort": "rank","filter": {"type": [2]}}', success: function(data5){
                          if (data5.total) store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data5.data[0].id); ScanSliceCounter+=1; OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
                          }).fail(function(){/*不再尝试*/ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //维护线程计数器
                      
                      }); //维护线程计数器
                  }); 

                }}).fail(function(){ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
              }); });
          },ScanCounter*4000)} //初始化id

          else { //!刮削失败，尝试仅去除标点符号后搜索
            setTimeout(async function() {
              let WorkName = cleanBracketsAdvanced(store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString(), null, excludeDict, false);
              store.set("WorkSaveNo"+ScanCounter.toString()+".Name",WorkName); //使用去除符号后片名初始化文件名

              let WorkNameJP = WorkName; //日语片名翻译临时存储
              const containsCJK = /[\u4e00-\u9faf\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]/.test(WorkName); //检测是否包含中日文
              if (!containsCJK) {WorkNameJP = await googleTranslate(WorkName,0);}//!若片名不包含中日文，使用google镜像api进行翻译
              console.log("尝试使用去除标点符号后片名搜索:"+WorkNameJP);

              //!使用新API尝试搜索
              $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+WorkNameJP+'","sort": "rank","filter": {"type": [2]}}', success: function(data){
                if (data.total) store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.data[0].id); ScanSliceCounter+=1; OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
                }).fail(function(){ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();});
            },ScanCounter*4000)}  //初始化id

          
          // else if(store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]!=null&&store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]!=" "){ //存在单括号约束
          // setTimeout(function() {
          // $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]+"?type=2", function(data){
          //   store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){
          //     $.ajax({ 
          //       url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString().split(/\]/g)[1]+'"', 
          //       type: 'GET',timeout : 2000,
          //       success: function(data2){
          //         console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()]/g, ''));
          //         $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
          //         store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){
          //           //使用新API尝试搜索
          //           $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()]/g, '')+'","filter": {"type": [2]}}', success: function(data4){
          //             if (data4.total) store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data4.data[0].id); ScanSliceCounter+=1; if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
          //             }).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //再次初始化id
          //           }); //再次初始化id
          //       }}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})});},ScanCounter*150)}  //初始化id
          
          // else { var NipponNameTrans = null; //日语片名翻译临时存储
          // setTimeout(function() {
          //   $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString()+"?type=2", function(data){
          //   store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){
          //     $.ajax({ 
          //       url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+store.get("WorkSaveNo"+ScanCounter.toString()+".Name").toString()+'"', 
          //       type: 'GET',timeout : 2000,
          //       success: function(data2){
          //         console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()]/g, ''));
          //         NipponNameTrans = data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()]/g, '');
          //         $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
          //         store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){
          //           if(NipponNameTrans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()a-zA-Z0-9]/g, '')!=""){
          //           $.getJSON("https://api.bgm.tv/search/subject/"+NipponNameTrans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()a-zA-Z0-9]/g, '')+"?type=2", function(data4){
          //             store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data4.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){
          //               //使用新API尝试搜索
          //               $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+NipponNameTrans.replace(/[『』」「、\[\].,\/#!"$%\^&\*;:{}=\-_`~()a-zA-Z0-9]/g, '')+'","filter": {"type": [2]}}', success: function(data5){
          //                 if (data5.total) store.set("WorkSaveNo"+ScanCounter.toString()+".bgmID",data5.data[0].id); ScanSliceCounter+=1; if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
          //                 }).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //再次初始化id
          //               }); //再次初始化id
          //           } else {ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
          //             }); //再次初始化id
          //       }}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})});},ScanCounter*150)}  //不存在约束
          
            //TODO 默认刮削器END
        }//$.ajaxSetup({ async: true }); //重新打开同步
        function ScannerEnding(){ //扫描结束后的提示
          OKErrorStreamer("MessageOff","<div class='LoadingCircle'></div>",0); //弹出完成提示
          OKErrorStreamer("OK","扫描完成，扫描到"+ScanSaveCounter+"个媒体",0);
          document.getElementById("ArchivePageSum").innerText="共 "+ScanSaveCounter+" 部作品";
          setTimeout(function() {ArchiveMediaUpdate();},300);
        }
        // console.log(store.get('WorkSaveNo5'));
        // },1000);
//       }
//       else{OKErrorStreamer("Error","路径错误！",0);}
//     }
//     else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
//   }
}

//! 媒体库-目录增量扫描模块
exports.LocalWorkScanModify=async function(){
  if(sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL"))  // *检测是否已填写路径 localStorage.getItem('LocalStorageMediaBaseURL');
  {
    var TargetArchiveURL = sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL")//localStorage.getItem('LocalStorageMediaBaseURL');
    OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库更改，请稍后</div>",0);
    MediaDirectoryStorage = new Array(); //媒体库目录存储数组清零
    MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组清零
    MediaDirectoryBDMVStorage = new Array(); //媒体库目录BDMV存储数组清零
    setTimeout(async function() {
    for(let TempArchive=0;TempArchive!=TargetArchiveURL.length;TempArchive++) { //轮询找到媒体库目录下的子目录
    if(fs.existsSync(TargetArchiveURL[TempArchive])){       // *当目标媒体库目录存在
      // OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描媒体库更改，请稍后</div>",0);

      var TargetArchiveDir = await fs.promises.readdir(TargetArchiveURL[TempArchive]); //扫描目标媒体库目录
      // console.log(TargetArchiveDir.length);
      console.log("目标媒体库根目录文件数目"+TargetArchiveDir.length);
      MediaDirectoryStorage = new Array(); //媒体库目录存储数组清零
      MediaDirectoryNameStorage = new Array(); //媒体库目录文件夹名称存储数组清零
      await LocalWorkScanSubModule(TargetArchiveURL[TempArchive],TargetArchiveURL[TempArchive]); //调用递归子模块
      // LocalWorkScanModifyBackbone();
      
    }
    else{OKErrorStreamer("MessageOff","",0);OKErrorStreamer("Error","路径错误！",0);}}
    LocalWorkScanModifyBackbone();
  },100);
  }
  else{OKErrorStreamer("MessageOff","",0);OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
}

//! 媒体库-目录增量扫描目录遍历子模块
async function LocalWorkScanModifyProcessDirectory(ScanCounter,ScanSaveCounter,Scan_Valid,LocalStorageMediaBaseNumber){

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

    await new Promise(resolve => setTimeout(resolve, 1)); // 确保每次迭代不会阻塞主线程
    if(MediaDirectoryBDMVStorage.includes(MediaDirectoryStorage[ScanCounter])) 
      {store.set("WorkSaveNo" + ScanStorageNumber.toString() + ".BDMV", 'BDMV');} //如果是BDMV目录，标记为BDMV
    await LocalWorkEpsScanModule(ScanStorageNumber.toString());
  }
  return ScanSaveCounter;
}

//! 媒体库-目录增量扫描后端模块
async function LocalWorkScanModifyBackbone() {
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
        await new Promise(resolve => setTimeout(resolve, 1)); // 确保每次迭代不会阻塞主线程
        ScanSaveCounter = await LocalWorkScanModifyProcessDirectory(ScanCounter,ScanSaveCounter,Scan_Valid,LocalStorageMediaBaseNumber);
        // 使用 requestAnimationFrame 更新进度信息
        requestAnimationFrame(() => {
          OKErrorStreamer("MessageOn", "<div class='LoadingCircle'>正在扫描媒体库，请稍后 " + parseInt((ScanCounter + 1) / MediaDirectoryStorage.length * 100) + "%</div>", 0);
        });

        // if(fs.lstatSync(MediaDirectoryStorage[ScanCounter]).isDirectory() && Scan_Valid == 0){
        //   ScanSaveCounter++;
        //   let ScanStorageNumber = Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter) //媒体计数器+已有数目计算得出实际编号
        //   console.log("Folder"+ScanStorageNumber+":"+MediaDirectoryNameStorage[ScanCounter]); //扫描debug输出
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".URL",MediaDirectoryStorage[ScanCounter]); //扫描到的媒体路径
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Name",MediaDirectoryNameStorage[ScanCounter]); //扫描到的媒体名称默认为文件夹名
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".bgmID",'0'); //扫描到的媒体默认bgmID为0
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Score",'0.0'); //扫描到的媒体默认评分
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Type",'TV'); //扫描到的媒体默认类型
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Year",'0000'); //扫描到的媒体默认年代
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Eps",'1'); //扫描到的媒体默认话数
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Protocol",'Unknown'); //扫描到的媒体默认原案
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Director",'Unknown'); //扫描到的媒体默认监督
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Corp",'Corp'); //扫描到的媒体默认制作公司
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".Cover",'./assets/banner.jpg'); //扫描到的媒体默认封面(后期联网更新为base64)
        //   store.set("WorkSaveNo"+ScanStorageNumber.toString()+".ExistCondition",'Exist'); //扫描到的媒体默认状态(默认存在)

        //   LocalWorkEpsScanModule(ScanStorageNumber.toString());
        // }
      }
      sysdata.set("Settings.checkboxC.LocalStorageMediaBaseNumber",Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter));
      localStorage.setItem("LocalStorageMediaBaseNumber",Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter)); //存储扫描到的媒体数目
      if(!sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber"))
      {sysdata.set("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber",0);localStorage.setItem('LocalStorageMediaBaseDeleteNumber',0) }//未初始化时，存储删除的媒体数目(初始0)

      // *使用默认刮削器自动收集初始数据
      OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后</div>",0);
      if(ScanSaveCounter!=0){
        var ScanSliceCounter = 0; //线程完成计数器清零
        // $.ajaxSetup({ async: false }); //关闭同步
        for(let ScanCounter=1;ScanCounter<=ScanSaveCounter;ScanCounter++){DefaultSlicer(ScanCounter);} //轮询找到媒体库目录下的子目录
          //TODO 默认刮削器
          function DefaultSlicer(ScanCounter){
            
          let replaceDict = sysdata.get("Settings.checkboxC.LocalStorageMediaScanExpression"); //括号屏蔽词库
          let excludeDict = sysdata.get("Settings.checkboxC.LocalStorageMediaScanExpressionSub"); //匹配屏蔽词库，请小心添加防止误伤

          // if(WorkScanExpression=='default' || WorkScanExpression=='') WorkScanExpression = "/(?<=\\])(.+?)(?=\\[)/g"; //默认正则表达式
          // let WorkTempName = store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().match(eval(WorkScanExpression));
          let WorkTempName = cleanBracketsAdvanced(store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString(), replaceDict, excludeDict, true);
          // console.log(WorkTempName) //当前文件名输出

          if(WorkTempName!=null&&WorkTempName!=" "&&WorkTempName!=""){  //成功匹配刮削到数据
            store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name",WorkTempName); //更新文件名为刮削后
            setTimeout(async function() {

            const containsCJK = /[\u4e00-\u9faf\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]/.test(WorkTempName); //检测是否包含中日文
            
            let WorkTempNameJP = WorkTempName; //日语片名翻译临时存储
            if (!containsCJK) {WorkTempNameJP = await googleTranslate(WorkTempName,0);}//!若片名不包含中日文，使用google镜像api进行翻译
            
            // console.log("尝试使用原始片名搜索:"+WorkTempName);

            $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempName+"?type=2", function(data0){ //!使用原生bgm检索
              if (data0.list) store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data0.list[0].id); ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
              .fail(function(){

              console.log("尝试使用日语片名搜索:"+WorkTempNameJP+"(原始片名:"+WorkTempName+")");
              let WorkSearchResultGet = 0; //是否完成搜索以及执行后续搜索的标志

              $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+WorkTempNameJP+'","sort": "rank","filter": {"type": [2]}}',success: function(data){ //!基于日文翻译片名使用bgm新搜索匹配结果
              if (data.total) {store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.data[0].id); WorkSearchResultGet=1; ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0); if(ScanSliceCounter==ScanSaveCounter) ScannerEnding();}}
              }).always(function(){ //!如果搜索失败，尝试使用IMDB匹配英文片名

                if (WorkSearchResultGet == 1) return; //如果已经匹配成功，不再进行后续搜索

                $.ajax({ 
                url: 'https://v3.sg.media-imdb.com/suggestion/x/'+WorkTempName.toString()+'.json?includeVideos=1', 
                type: 'GET',timeout : 2000,
                success: async function(data2){

                  let imdbWorkName = WorkTempName
                  if (data2.d.length>0) {imdbWorkName = (data2.d[0].l).replace(/[\/\\]/g, ' ')} //去除斜杠防止api错误
                  
                  let WorkTempNameIMDBJP = await googleTranslate(imdbWorkName,0); //!使用google translate 镜像api翻译IMDB片名
                  console.log("尝试使用IMDB日文片名搜索:"+WorkTempNameIMDBJP+"(原始片名:"+WorkTempName+")");

                  $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempNameIMDBJP+"?type=2", function(data3){ //!使用IMDB匹配结果进行bgm检索
                  if (data3.list) store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
                  .fail(function(){

                    //!如果仍无法匹配，尝试使用bgm.tv新接口进行查询
                    $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+WorkTempNameIMDBJP+'","sort": "rank","filter": {"type": [2]}}', success: function(data4){
                      if (data4.total) {store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data4.data[0].id); WorkSearchResultGet = 1; ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0); if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}}
                      }).always(function(){

                        if (WorkSearchResultGet == 1) return; //如果已经匹配成功，不再进行后续搜索
                        //!如果仍无法匹配，最后尝试使用bgm.tv新接口与IMDB英文进行查询
                        $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+imdbWorkName+'","sort": "rank","filter": {"type": [2]}}', success: function(data5){
                          if (data5.total) store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data5.data[0].id); ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0); if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
                          }).fail(function(){/*不再尝试*/ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //维护线程计数器
                      
                      }); //维护线程计数器
                  }); 

                }}).fail(function(){ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
              }); });
          },ScanCounter*4000)} //初始化id

          else { //!刮削失败，尝试仅去除标点符号后搜索
            setTimeout(async function() {
              let WorkName = cleanBracketsAdvanced(store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString(), null, excludeDict, false);
              store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name",WorkName); //使用去除符号后片名初始化文件名

              let WorkNameJP = WorkName; //日语片名翻译临时存储
              const containsCJK = /[\u4e00-\u9faf\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]/.test(WorkName); //检测是否包含中日文
              if (!containsCJK) {WorkNameJP = await googleTranslate(WorkName,0);}//!若片名不包含中日文，使用google镜像api进行翻译
              console.log("尝试使用去除标点符号后片名搜索:"+WorkNameJP);

              //!使用新API尝试搜索
              $.ajax({url:"https://api.bgm.tv/v0/search/subjects",type:'POST',data: '{"keyword": "'+WorkNameJP+'","sort": "rank","filter": {"type": [2]}}', success: function(data){
                if (data.total) store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.data[0].id); ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0); if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
                }).fail(function(){ScanSliceCounter+=1;OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在刮削媒体库，请稍后"+parseInt((ScanSliceCounter + 1) /ScanSaveCounter * 100)+"%</div>",0);if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();});
            },ScanCounter*4000)}  //初始化id

          // let WorkScanExpression = sysdata.get("Settings.checkboxC.LocalStorageMediaScanExpression")
          // if(WorkScanExpression=='default' || WorkScanExpression=='') WorkScanExpression = "/(?<=\\])(.+?)(?=\\[)/g";
          // let WorkTempName = store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().match(eval(WorkScanExpression));
          // if(WorkTempName!=null&&WorkTempName!=" "){ 
          //   //存在双括号约束
          //   $.getJSON("https://api.bgm.tv/search/subject/"+WorkTempName+"?type=2", function(data){
          //     store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}
          //     ).fail(function(){ //如果搜索失败，尝试使用Google翻译为日语搜索
          //       $.ajax({ 
          //       url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+WorkTempName.toString()+'"', 
          //       type: 'GET',timeout : 2000,
          //       success: function(data2){
          //         console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
          //         $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
          //         store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
          //         .fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //再次初始化id
          //   }}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})});} //初始化id
          // else if(store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]!=null&&store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]!=" "){ //存在单括号约束
          // $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]+"?type=2", function(data){
          //   store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
          //   .fail(function(){
          //     $.ajax({ 
          //       url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString().split(/\]/g)[1]+'"', 
          //       type: 'GET',timeout : 2000,
          //       success: function(data2){
          //         console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
          //         $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
          //           store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //再次初始化id
          //       }}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})});}  //初始化id

          // else { $.getJSON("https://api.bgm.tv/search/subject/"+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString()+"?type=2", function(data){
          //   store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})
          //   .fail(function(){
          //     $.ajax({ 
          //       url: 'http://translate.google.com/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=ja&q="'+store.get("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".Name").toString()+'"', 
          //       type: 'GET',timeout : 2000,
          //       success: function(data2){
          //         console.log("尝试使用日语片名搜索:"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));
          //         $.getJSON("https://api.bgm.tv/search/subject/"+data2.sentences[0].trans.replace(/[『』」「、\[\].,\/#!$%\^&\*;:{}=\-_`~()]/g, '')+"?type=2", function(data3){
          //           store.set("WorkSaveNo"+(Number(LocalStorageMediaBaseNumber)+Number(ScanCounter)).toString()+".bgmID",data3.list[0].id); ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();}); //再次初始化id
          //       }}).fail(function(){ScanSliceCounter+=1;if(ScanSliceCounter==ScanSaveCounter)ScannerEnding();})});}  //不存在约束
          //TODO 默认刮削器END
        }//$.ajaxSetup({ async: true }); //重新打开同步
      }else {ScannerEnding();setTimeout(function() {OKErrorStreamer("MessageOff", "<div class='LoadingCircle'>正在扫描媒体库，请稍后%</div>", 0);},1);}
      function ScannerEnding(){ //扫描结束后的提示
      let DeleteNumberSaver= sysdata.get("Settings.checkboxC.LocalStorageMediaBaseDeleteNumber");//localStorage.getItem('LocalStorageMediaBaseDeleteNumber')
      OKErrorStreamer("MessageOff","<div class='LoadingCircle'></div>",0); //弹出完成提示
      OKErrorStreamer("OK","扫描完成，新增"+ScanSaveCounter+"个媒体",0);
      document.getElementById("ArchivePageSum").innerText="共 "+(Number(LocalStorageMediaBaseNumber)+Number(ScanSaveCounter)-Number(DeleteNumberSaver))+" 部作品";
      if(ScanSaveCounter!=0){ //如果扫描到媒体，延时3秒后更新媒体信息
      setTimeout(function() {ArchiveMediaUpdateSingle(LocalStorageMediaBaseNumber,ScanSaveCounter)},1000);}// console.log(store.get('WorkSaveNo5'));
      }
  //     },1000);
  //   }
  //   else{OKErrorStreamer("Error","路径错误！",0);}
  // }
  // else{OKErrorStreamer("Error","你还没有在设置内填写媒体库路径！",0);}
}
