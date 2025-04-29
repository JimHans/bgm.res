/**
 * @name AddMediaPage.js
 * @param bgm.res_AddMediaPage
 * @description bgm.res新增媒体编辑界面渲染js
 */
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
// const store = new Store();                                            //?创建electron-store存储资源库对象

//! NeDB数据库初始化
const path = nodeRequire("path");                                     //?引入path
const appDataPath = process.env.APPDATA || path.join(process.env.HOME, 'Library', 'Application Support'); // 获取appdata
const Datastore = nodeRequire('nedb');
const db = new Datastore({
  filename: path.join(path.join(appDataPath, 'bgm.res'), 'MediaData.db'),
  autoload: true
});
const ElectronStoreAdapter = nodeRequire('../js/ElectronStore2NeDB.js');
const store = new ElectronStoreAdapter();  // 创建自定义适配器实例
//! NeDB数据库初始化OVER

const ipc = nodeRequire('electron').ipcRenderer;                      //?引入ipcRenderer进程通信api
const fs = nodeRequire('fs');                                         //?使用nodejs fs文件操作库
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog 对话框弹出api
let SysdataOption={
    name:"sysdata",//文件名称,默认 config
    fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储
ipc.on('data', (e,arg) => {console.log(arg);MediaPageLoad();});       //?接收主进程传来的数据

function MediaPageLoad(){

    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) //初始化自定义颜色
    {
    let CustomColorData = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    let customcolorstyle=document.createElement('style');//创建一个<style>标签
    let customchangeText=document.createTextNode('.Winui3inputText:focus{border-bottom:2px solid '+CustomColorData+'}')//更改后伪元素的样式
    customcolorstyle.appendChild(customchangeText);//把样式添加到style标签里
    document.body.appendChild(customcolorstyle);//把内联样式表添加到html中    
    }
    document.getElementById('MediaSettingsCover').style.background="url('../assets/banner.jpg') no-repeat";
    document.getElementById('MediaSettingsCover').style.backgroundSize="cover";
}

// !页面大小变化时更新元素状态函数(目前仅更新作品详情)
window.onresize=function(){  
    if($("#AddMediaPageSearchSuggestion").is(":visible")){
        let inputBoxRect = document.getElementById('AddMediaPageSearch').getBoundingClientRect();
        document.getElementById('AddMediaPageSearchSuggestion').style.top = `${inputBoxRect.top}px`;
        document.getElementById('AddMediaPageSearchSuggestion').style.left = `${inputBoxRect.left-30}px`;
    }
} 

//! 媒体库-搜索模块
function AddMediaPageSearch(Key){
    if(Key != 13){return}
    else {
    let SearchKeyWord = document.getElementById('AddMediaPageSearch').value; if(SearchKeyWord==''){return} //?如果搜索框为空则不执行搜索
    let inputBoxRect = document.getElementById('AddMediaPageSearch').getBoundingClientRect();
    document.getElementById('AddMediaPageSearchSuggestion').style.top = `${inputBoxRect.top}px`;
    document.getElementById('AddMediaPageSearchSuggestion').style.left = `${inputBoxRect.left-30}px`;
    document.getElementById('AddMediaPageSearchSuggestion').innerHTML="<div class='Winui3brickContainer'><div style='position:relative;margin:auto;overflow:hidden;text-align:center'>正在搜索中</div></div>";
    document.getElementById('AddMediaPageSearchSuggestion').style.display='block';
    document.getElementById('AddMediaPageSearchSuggestionBack').style.display='block';
    let SerachResultGetted = 0;
    $.ajax({ 
        url: "https://api.bgm.tv/search/subject/"+SearchKeyWord+"?type=2&responseGroup=small",
        type: 'GET',dataType: "json",timeout : 2000,
        success: function(data){ //成功,存储accesstoken
            document.getElementById('AddMediaPageSearchSuggestion').innerHTML="";
            for(let ScanCounter=0;ScanCounter!=data.list.length;ScanCounter++){
                SerachResultGetted = 1;
                let coverimageurl = "../assets/banner.jpg')";
                if(data.list[ScanCounter].hasOwnProperty("images") && data.list[ScanCounter].images && data.list[ScanCounter].images.medium) {coverimageurl = data.list[ScanCounter].images.medium}
                $("#AddMediaPageSearchSuggestion").append("<div class='Winui3brickContainer'>"+"<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+coverimageurl+"\") no-repeat top;background-size:cover;border-radius:8px;'></div>"+
                "<div style='position:relative;margin-left:10px;margin-right:45px;overflow:hidden'><div style='display: -webkit-box;text-overflow: ellipsis;-webkit-box-orient: vertical;-webkit-line-clamp: 2;overflow: hidden;'>"+data.list[ScanCounter].name
                +"</div><div style='position:relative;font-size:15px;margin-top:5px;color: #aaa;text-overflow: ellipsis;white-space: nowrap;overflow:hidden'>"+data.list[ScanCounter].name_cn+"</div></div>"+
                `<button type='button' value='填入' class='Winui3button' style='width:30px;right:15px' onclick='AddMediaPageSearchFill(${data.list[ScanCounter].id})'><svg t='1673884147084' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='5739' width='15' height='15'><path d='M245.034251 895.239428l383.063419-383.063419L240.001631 124.07997l0.070608-0.033769c-12.709463-13.137205-20.530592-31.024597-20.530592-50.731428 0-40.376593 32.736589-73.111135 73.115228-73.111135 19.705807 0 37.591153 7.819083 50.730405 20.528546l0.034792-0.035816 438.686251 438.681134-0.035816 0.034792c13.779841 13.281491 22.3838 31.915897 22.3838 52.586682 0 0.071631 0 0.106424 0 0.178055 0 0.072655 0 0.10847 0 0.144286 0 20.669762-8.603959 39.341007-22.3838 52.623521l0.035816 0.033769L343.426165 1003.661789l-0.180102-0.179079c-13.140275 12.565177-30.950919 20.313651-50.588165 20.313651-40.378639 0-73.115228-32.736589-73.115228-73.114205C219.544717 928.512229 229.432924 908.664182 245.034251 895.239428z' p-id='5740' fill='#ffffff'></path></svg></button>`
                +"</div>")
            }
        },
        error: function(data){ //错误返回(没有搜索结果)
            document.getElementById('AddMediaPageSearchSuggestion').innerHTML="";
            $("#AddMediaPageSearchSuggestion").append("<div class='Winui3brickContainer'><div style='position:relative;margin:auto;overflow:hidden;text-align:center'>没有找到结果</div></div>") }
    });
}}

//! 媒体库-搜索结果填入模块
function AddMediaPageSearchFill(bgmID){
    $.ajax({ 
        url: "https://api.bgm.tv/v0/subjects/"+bgmID,
        type: 'GET',dataType: "json",timeout : 2000,
        success: function(data){ //成功,存储accesstoken
            document.getElementById('AddMediaPageSearchSuggestion').style.display='none';
            document.getElementById('AddMediaPageSearchSuggestionBack').style.display='none';
            document.getElementById('MediaSettingsCover').style.background=`url('${data.images.large}') no-repeat`;
            document.getElementById('MediaSettingsCover').style.backgroundSize="cover";
            let checkboxA = document.getElementsByName("checkboxA");
            if(data.name_cn) checkboxA[0].value=data.name_cn; else checkboxA[0].value=data.name;
            checkboxA[3].value=data.id;
            checkboxA[4].value=data.eps;
            checkboxA[5].value=data.platform;
            checkboxA[6].value=data.date.substring(0,4);
            checkboxA[8].value=data.images.large;
            for(let MediaBaseElementsGet=0;MediaBaseElementsGet!=data.infobox.length;MediaBaseElementsGet++){
                if(data.infobox[MediaBaseElementsGet].key=='原作') {checkboxA[7].value=data.infobox[MediaBaseElementsGet].value;}
            }
        }
    })
}

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

// !获取媒体文件夹路径
function triggerFolderURL(event) {
    console.log(document.getElementById('AddMediaPageURL').files);
    let SubFolderPath = document.getElementById('AddMediaPageURL').files[0].name;
    let FolderPath = document.getElementById('AddMediaPageURL').files[0].path.replaceAll('\\','/')
    document.getElementsByName('checkboxA')[1].value = FolderPath.substr(0,FolderPath.length-SubFolderPath.length-1);
}
// !获取媒体文件夹路径(NEW)
function selectFolder() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
            // 将选中的文件夹路径赋值给对应的 input 框
            document.getElementsByName('checkboxA')[1].value = result.filePaths[0];
        }
    }).catch(err => console.error(err));
}

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base'
    });
}

//! 作品ep扫描模块
function LocalWorkEpsScanModule(MediaID){
    if(fs.existsSync(store.get("WorkSaveNo"+MediaID+".URL"))){       // *当目标媒体库目录存在
        var TargetWorkEP = fs.readdirSync(store.get("WorkSaveNo"+MediaID+".URL")).sort(naturalSort); //扫描目标媒体库目录下EP
        console.log(TargetWorkEP.length);
        var RealWorkEP = 0;
        for (var TempCounter = 0;TempCounter!=TargetWorkEP.length;TempCounter++){
        if(TargetWorkEP[TempCounter].match(/\.mp4|\.flv|\.mkv|\.rm|\.rmvb|\.avi|\.m2ts/i)){
            RealWorkEP += 1;store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".URL",TargetWorkEP[TempCounter]);
            store.set("WorkSaveNo"+MediaID+".EPDetails.EP"+RealWorkEP+".Condition",'Unwatched');}
        }
        store.set("WorkSaveNo"+MediaID+".EPTrueNum",RealWorkEP);
    }
}

function submitA(){
    let checkboxA = document.getElementsByName("checkboxA");
    if(checkboxA[3].value!='' && checkboxA[0].value!='' && checkboxA[1].value!=''&& checkboxA[5].value!=''){
    OKErrorStreamer('MessageOn','添加作品中',0);
    var WorkTotalNumberNew = parseInt(sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber"))+1
    sysdata.set("Settings.checkboxC.LocalStorageMediaBaseNumber",WorkTotalNumberNew)
    localStorage.setItem("LocalStorageMediaBaseNumber",WorkTotalNumberNew); //存储新的媒体数目
    store.set("WorkSaveNo"+WorkTotalNumberNew+".URL",checkboxA[1].value.replaceAll('/','\\')); //媒体路径
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Name",checkboxA[0].value); //媒体名称
    store.set("WorkSaveNo"+WorkTotalNumberNew+".bgmID",checkboxA[3].value); //媒体bgmID
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Score",'0.0'); //媒体默认评分
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Type",checkboxA[5].value); //媒体默认类型
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Year",checkboxA[6].value); //媒体默认年代
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Eps",checkboxA[4].value); //媒体默认话数
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Protocol",checkboxA[7].value); //媒体默认原案
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Director",'Unknown'); //媒体默认监督
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Corp",'Corp'); //媒体默认制作公司
    store.set("WorkSaveNo"+WorkTotalNumberNew+".Cover",checkboxA[8].value); //媒体默认封面(后期联网更新为base64)
    store.set("WorkSaveNo"+WorkTotalNumberNew+".ExistCondition",'Exist'); //媒体默认状态(默认存在)
    store.set("WorkSaveNo"+WorkTotalNumberNew+".EPAutoUpdate",checkboxA[9].checked);//媒体EP自动更新
    LocalWorkEpsScanModule(WorkTotalNumberNew); //扫描作品EP信息

    $.ajaxSettings.async = false; //关闭异步
    // *扫描作品bgmID获取作品信息
    if(store.get("WorkSaveNo"+WorkTotalNumberNew.toString()+".bgmID") != '0'){
    $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+WorkTotalNumberNew.toString()+".bgmID").toString(), function(data){
        store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Score",data.rating.score); 
      }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
    $.getJSON("https://api.bgm.tv/v0/subjects/"+store.get("WorkSaveNo"+WorkTotalNumberNew.toString()+".bgmID").toString()+'/persons', function(data){
    for(var MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
        if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Director",data[MediaBaseElementsGet].name);}
        if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Corp",data[MediaBaseElementsGet].name);}
        if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+WorkTotalNumberNew.toString()+".Protocol",data[MediaBaseElementsGet].name);}
      } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}); // *错误回调
    } $.ajaxSettings.async = true; //打开异步

    OKErrorStreamer('MessageOff','新作品添加完成！',0);
    OKErrorStreamer('OK','新作品添加完成！',0);
    setTimeout(function(){
    ipc.send('MainWindow','RefreshArchivePage'+WorkTotalNumberNew);
    ipc.send('AddMediaPage','Close');},100);
    }
    else {OKErrorStreamer('Error','作品信息不完整！',0);}
}