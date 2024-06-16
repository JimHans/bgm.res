/**
 * @name MainpageArchiveEPSPScanner.js
 * @module MainpageArchiveEPSPScanner.js
 * @description bgm.res主界面的EP\SP章节扫描模块
 */

//! 媒体库-作品ep扫描模块
exports.LocalWorkEpsScanModule = function(MediaID){
  if(fs.existsSync(store.get("WorkSaveNo"+MediaID+".URL"))){       // *当目标媒体库目录存在
    // OKErrorStreamer("MessageOn","<div class='LoadingCircle'>正在扫描EP信息，请稍后</div>",0);
    var TargetWorkEP = fs.readdirSync(store.get("WorkSaveNo"+MediaID+".URL")); //扫描目标媒体库目录下EP
    console.log(TargetWorkEP.length);
    //读取当前epsp数目,如果读取不到按0计算
    let EPNum = store.has("WorkSaveNo"+MediaID+".EPTrueNum") ? store.get("WorkSaveNo"+MediaID+".EPTrueNum") : 0;
    let SPNum = store.has("WorkSaveNo"+MediaID+".SPTrueNum") ? store.get("WorkSaveNo"+MediaID+".SPTrueNum") : 0;
    var RealWorkEP = parseInt(EPNum); //初始化EP计数器,初始值按照当前EP值计
    let IfEPHas = false; //判断是否是已经存在的EP
    for (let TempCounter = 0;TempCounter!=TargetWorkEP.length;TempCounter++){
      IfEPHas = false; //重置判断已经存在的EP
      if(TargetWorkEP[TempCounter].match(/\.mp4|\.flv|\.mkv|\.rm|\.rmvb|\.avi|\.m2ts|\.m4s/i)){ //判断是否是视频文件

        // 扫描检测是否已经存储在EP,SP任一位置
        for (let TempCounter2 = 1;TempCounter2!=EPNum+1;TempCounter2++){
          if(store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+TempCounter2+".URL")==TargetWorkEP[TempCounter]) IfEPHas = true;
        }
        for (let TempCounter2 = 1;TempCounter2!=SPNum+1;TempCounter2++){
          if(store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+TempCounter2+".URL")==TargetWorkEP[TempCounter]) IfEPHas = true;
        }

        if(!IfEPHas){ //如果不存在该EP则增量存储在其他EP后面
          RealWorkEP += 1;
          store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".URL",TargetWorkEP[TempCounter]);
          if(!store.has("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".Condition"))
          store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".Condition",'Unwatched');}
      }
    }
    store.set("WorkSaveNo"+MediaID+".EPTrueNum",RealWorkEP);
    console.log("新增"+(RealWorkEP-EPNum)+"个EP,共"+RealWorkEP+"个EP,共"+SPNum+"个SP");
    // OKErrorStreamer("MessageOff","<div class='LoadingCircle'>正在扫描EP信息，请稍后</div>",0);
  }
}

//! 媒体库-作品特典扫描模块
exports.ArchiveMediaBonusScan = function (TargetMediaURL,MediaID){
  fs.access(TargetMediaURL, fs.constants.R_OK, (err) => { //判断是否有读取权限
  if(!err){       // *当目标媒体库目录存在 fs.existsSync(TargetMediaURL)
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
        let onclickurl = "exec('explorer "+(TargetMediaURL+"\\"+TargetMediaDir[ScanCounter]).replace(/(\\)/g,"\\\\").replace(/(&)/g,"^&").replace(/(')/g,'\\\'')+"');"
        $("#ArchivePageContentDetailsEpisodeExtraBlock").append("<div class='ArchiveCardCharacterHover' onclick=\""+onclickurl+"\">"+
        "<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+CardHover+"\") no-repeat top;background-size:cover;border-radius:8px;border-top-right-radius:0;border-bottom-right-radius:0;'>"+CoverIcon+"</div>"+
        "<div style='position:relative;margin-right:0%;margin-left:1%;margin-top:8px;height:100%;border-radius:8px;width: 100%;text-align: left;width:fit-content;padding:10px;white-space:nowrap;font-size:1.5vw;font-size:min(1.5vw, 21px);'><b>"+TargetMediaDir[ScanCounter]+"</b><br/><p>类别："+TargetMediaType+"</p></div></div>");
        TargetMediaDirHasExtra = TargetMediaDirHasExtra+1;
      }
    } if(TargetMediaDirHasExtra==0) {$("#ArchivePageContentDetailsEpisodeExtraBlock").append('<div style="margin:auto;">未找到特典信息</div>')}
  } else {$("#ArchivePageContentDetailsEpisodeExtraBlock").append('<div style="margin:auto;">未找到特典信息</div>')}
  })
}