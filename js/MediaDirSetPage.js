/**
 * @name MediaDirSetPage.js
 * @param bgm.res_MediaDirSetPage
 * @description bgm.res媒体库目录编辑界面渲染js
 */
// 额外引入模块
const ipc = nodeRequire('electron').ipcRenderer;                      //?引入ipcRenderer进程通信api
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
const store = new Store();                                            //?创建electron-store存储资源库对象
let SysdataOption={
name:"sysdata",//文件名称,默认 config
fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储
const { OKErrorStreamer } = nodeRequire('../js/Mainpage_Modules/MainpageToaster.js'); //?引入bgm.res主界面的通知toast函数封装
ipc.on('data', (e,arg) => {console.log(arg);MediaDirSetPageLoad();});       //?接收主进程传来的数据

let MediaDir=sysdata.get("Settings.checkboxA.LocalStorageMediaBaseURL");              //?获取媒体库目录设置
let MediaDirCounter = 0;
function MediaDirSetPageLoad() {
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) //初始化自定义颜色
    {
    let CustomColorData = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    let customcolorstyle=document.createElement('style');//创建一个<style>标签
    let customchangeText=document.createTextNode('.Winui3inputText:focus{border-bottom:2px solid '+CustomColorData+'}')//更改后伪元素的样式
    customcolorstyle.appendChild(customchangeText);//把样式添加到style标签里
    document.body.appendChild(customcolorstyle);//把内联样式表添加到html中    
    }

if(Array.isArray(MediaDir)){
    for (let MediaDirSetTemp=0;MediaDirSetTemp!=MediaDir.length;MediaDirSetTemp++){
        $("#MediaDirSetpageA").append('<div class="Winui3brickContainer" name="FolderBrick"><input class="Winui3inputText" type="text" name="checkboxA" placeholder="填写你的媒体库目录" style="right:120px;left: 20px;width:auto" value="'+MediaDir[MediaDirSetTemp]+'" required>'+
            "<button type='button' value='选择路径' class='Winui3button' style='width:30px;right: 70px;' ><svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M853.333333 469.333333a42.666667 42.666667 0 0 0-42.666666 42.666667v256a42.666667 42.666667 0 0 1-42.666667 42.666667H256a42.666667 42.666667 0 0 1-42.666667-42.666667V256a42.666667 42.666667 0 0 1 42.666667-42.666667h256a42.666667 42.666667 0 0 0 0-85.333333H256a128 128 0 0 0-128 128v512a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128v-256a42.666667 42.666667 0 0 0-42.666667-42.666667z' fill='#ffffff' p-id='2787'></path><path d='M682.666667 213.333333h67.413333l-268.373333 267.946667a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586666 0L810.666667 273.92V341.333333a42.666667 42.666667 0 0 0 42.666666 42.666667 42.666667 42.666667 0 0 0 42.666667-42.666667V170.666667a42.666667 42.666667 0 0 0-42.666667-42.666667h-170.666666a42.666667 42.666667 0 0 0 0 85.333333z' fill='#ffffff' p-id='2788'></path></svg>"+
                '<input type="file" class="Winui3inputFile" name="FolderBrickInput"  style="width:100%" onchange="MediaDirPageFolderURL(event,'+MediaDirSetTemp+')" webkitdirectory/>'+
            "</button><button type='button' value='删除' name='FolderBrickDel' class='Winui3button' style='width:30px;right: 20px;' onclick='MediaDirPageFolderDelete("+MediaDirSetTemp+")'><img src='../assets/trashcan.svg' style='width:100%'/></button></div>");
        MediaDirCounter++;
    }
}
if(MediaDirCounter!=0){document.getElementById("MediaDirNoneFlag").style.display='none';}
}

function MediaDirPageFolderDelete(BrickID) {
    var DelBrick = document.getElementsByName('FolderBrick')[Number(BrickID)];
    DelBrick.style.transform='scale(0)';
    setTimeout(function(){
    $("div[name='FolderBrick']").eq(BrickID).remove();
    for (let Tempi = 0;Tempi!=document.getElementsByName("FolderBrick").length;Tempi++){
        document.getElementsByName("FolderBrickDel")[Tempi].setAttribute("onclick","MediaDirPageFolderDelete("+Tempi+")");
        document.getElementsByName("FolderBrickInput")[Tempi].setAttribute("onchange","MediaDirPageFolderURL(event,"+Tempi+")");
    }},500)
}

function MediaDirSetAdd() {
    document.getElementById("MediaDirNoneFlag").style.display='none';
    $("#MediaDirSetpageA").append('<div class="Winui3brickContainer" name="FolderBrick"><input class="Winui3inputText" type="text" name="checkboxA" placeholder="填写你的媒体库目录" style="right:120px;left: 20px;width:auto" required>'+
        "<button type='button' value='选择路径' class='Winui3button' style='width:30px;right: 70px;' ><svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M853.333333 469.333333a42.666667 42.666667 0 0 0-42.666666 42.666667v256a42.666667 42.666667 0 0 1-42.666667 42.666667H256a42.666667 42.666667 0 0 1-42.666667-42.666667V256a42.666667 42.666667 0 0 1 42.666667-42.666667h256a42.666667 42.666667 0 0 0 0-85.333333H256a128 128 0 0 0-128 128v512a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128v-256a42.666667 42.666667 0 0 0-42.666667-42.666667z' fill='#ffffff' p-id='2787'></path><path d='M682.666667 213.333333h67.413333l-268.373333 267.946667a42.666667 42.666667 0 0 0 0 60.586667 42.666667 42.666667 0 0 0 60.586666 0L810.666667 273.92V341.333333a42.666667 42.666667 0 0 0 42.666666 42.666667 42.666667 42.666667 0 0 0 42.666667-42.666667V170.666667a42.666667 42.666667 0 0 0-42.666667-42.666667h-170.666666a42.666667 42.666667 0 0 0 0 85.333333z' fill='#ffffff' p-id='2788'></path></svg>"+
            '<input type="file" class="Winui3inputFile" name="FolderBrickInput"  style="width:100%" onchange="MediaDirPageFolderURL(event,'+(document.getElementsByName("FolderBrick").length)+')" webkitdirectory/>'+
        "</button><button type='button' value='删除' name='FolderBrickDel' class='Winui3button' style='width:30px;right: 20px;' onclick='MediaDirPageFolderDelete("+(document.getElementsByName("FolderBrick").length)+")'><img src='../assets/trashcan.svg' style='width:100%'/></button></div>");
}

function MediaDirPageFolderURL(event,ID) { //获取媒体文件夹路径
    console.log(document.getElementsByName('FolderBrickInput')[ID].files);
    let SubFolderPath = document.getElementsByName('FolderBrickInput')[ID].files[0].name;
    let FolderPath = document.getElementsByName('FolderBrickInput')[ID].files[0].path.replaceAll('\\','\\')
    document.getElementsByName('checkboxA')[ID].value = FolderPath.substr(0,FolderPath.length-SubFolderPath.length-1);
}

function MediaDirSetSave() {
    let MediaDirSetTemp=[];
    for (let MediaDirSetTempA=0;MediaDirSetTempA!=document.getElementsByName("checkboxA").length;MediaDirSetTempA++){
        MediaDirSetTemp.push(document.getElementsByName("checkboxA")[MediaDirSetTempA].value);
    }
    sysdata.set("Settings.checkboxA.LocalStorageMediaBaseURL",MediaDirSetTemp);
    OKErrorStreamer("OK","已保存媒体库设置",0,"..");
}