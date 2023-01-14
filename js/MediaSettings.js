const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
const store = new Store();                                            //?创建electron-store存储资源库对象
const ipc = nodeRequire('electron').ipcRenderer;
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog 对话框弹出api
var MediaID = 0;var MediaSettingsSPNumber = 1;
ipc.on('data', (e,arg) => {MediaID = arg;console.log(MediaID);MediaPageLoad(MediaID);});

function MediaPageLoad(MediaID){
    //?标题初始化
    let MediaName = store.get("WorkSaveNo"+MediaID+".Name");
    document.getElementsByTagName("title")[0].innerText=MediaName+'-作品编辑';
    document.getElementById("Title").innerText=MediaName+'-作品编辑';
    document.getElementById("PageTitle").innerText=MediaName+'-作品编辑';

    //?作品编辑初始化
    let WorkCover = store.get("WorkSaveNo"+MediaID+".Cover"); //初始化封面
    document.getElementById("MediaSettingsCover").style.background="url('"+WorkCover+"') no-repeat center";
    document.getElementById("MediaSettingsCover").style.backgroundSize="cover";
    document.getElementsByName("checkboxA")[0].value=MediaName;
    document.getElementsByName("checkboxA")[1].value=store.get("WorkSaveNo"+MediaID+".URL");
    document.getElementsByName("checkboxA")[2].value=store.get("WorkSaveNo"+MediaID+".bgmID");
    document.getElementsByName("checkboxA")[3].value=store.get("WorkSaveNo"+MediaID+".Type");
    document.getElementsByName("checkboxA")[4].value=store.get("WorkSaveNo"+MediaID+".Year");
    document.getElementsByName("checkboxA")[5].value=store.get("WorkSaveNo"+MediaID+".Protocol");
    document.getElementsByName("checkboxA")[6].value=store.get("WorkSaveNo"+MediaID+".Director");
    document.getElementsByName("checkboxA")[7].value=store.get("WorkSaveNo"+MediaID+".Corp");
    document.getElementsByName("checkboxA")[8].value=store.get("WorkSaveNo"+MediaID+".Cover");
    $("#MediaSettingsMediaDelete").attr('onclick',"StoreDeleteWork("+MediaID+")");
    $("#MediaSettingsMediaAutoupdate").attr('onclick',"ArchiveMediaUpdateSingle("+MediaID+")");

    //?作品EP控制按钮初始化
    let WorkEPNumber = store.get("WorkSaveNo"+MediaID+".EPTrueNum");
    document.getElementById("MediaSettingsSetpageB").innerHTML='';
    $('#MediaSettingsSetpageB').append("<div class='Winui3brickContainer' style='background-color:#2b4f6c'><svg t='1669908006524' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1391' width='20' height='20'><path d='M510.032 93.09c-229.9 0-416.94 187.924-416.94 418.91 0 230.986 187.92 418.91 418.908 418.91 230.986 0 418.91-187.924 418.91-418.91 0-230.986-188.804-418.91-420.88-418.91z' fill='#5fb5fc' p-id='1392' style='--darkreader-inline-fill: #5fb5fc;' data-darkreader-inline-fill=''></path><path d='M558.546 723.78h-93.092v-93.09h93.092zM558.546 539.928h-93.092V302.546h93.092z' fill='#000' p-id='1393' style='--darkreader-inline-fill: #181a1b;' data-darkreader-inline-fill=''></path></svg><p style='margin-left:13px;font-size: 15px;font-weight: bold;'>你可以在此修改本作品的EP信息，包括纠正错误对应的章节，或者增加新的本篇章节/番外篇</p></div>"+
    "<div class='Winui3brickContainer'>添加EP章节<button type='button' value='点击添加EP' class='Winui3button' onclick='MediaSettingsESPAdder(\"EP\")'>点击添加</button></div>");
    //?作品EP列表初始化
    for(let Tempi = 1;Tempi<=WorkEPNumber;Tempi++){
    $('#MediaSettingsSetpageB').append("<div class='Winui3brickContainer' name='EPSetBrick'><div name='EPSetBrickTitle'>EP"+Tempi+"<br><a class='Winui3brickSubtitle' style='font-size: 13px;'>"+"未知作品名"+
    "</a></div><input class='Winui3inputText' type='text' name='checkboxB' style='width:50%;right: 60px;' placeholder='填写EP对应本地地址' value='"+store.get("WorkSaveNo"+MediaID+".EPDetails.EP"+Tempi+".URL")+"' required>"+
    "<button type='button' value='点击删除EP' name='delbuttonB' class='Winui3button_red' style='width:30px' onclick='MediaSettingsESPDeleter(\"EP\","+Tempi+")'><svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M202.666667 256h-42.666667a32 32 0 0 1 0-64h704a32 32 0 0 1 0 64H266.666667v565.333333a53.333333 53.333333 0 0 0 53.333333 53.333334h384a53.333333 53.333333 0 0 0 53.333333-53.333334V352a32 32 0 0 1 64 0v469.333333c0 64.8-52.533333 117.333333-117.333333 117.333334H320c-64.8 0-117.333333-52.533333-117.333333-117.333334V256z m224-106.666667a32 32 0 0 1 0-64h170.666666a32 32 0 0 1 0 64H426.666667z m-32 288a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z m170.666666 0a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z' fill='#ffffff' p-id='3568'></path></svg></button>"+
    "</div>");}
    $('#MediaSettingsSetpageB').append("<div id='MediaSettingsEPFillingPage' style='position:relative;width:100%;height:auto'></div>");


    //?作品SP控制按钮初始化
    let WorkSPNumber = store.get("WorkSaveNo"+MediaID+".SPTrueNum");
    $('#MediaSettingsSetpageB').append("<div class='Winui3brickContainer'>添加SP章节<button type='button' value='点击添加SP' class='Winui3button' onclick='MediaSettingsESPAdder(\"SP\")'>点击添加</button></div>");
    //?作品SP列表初始化
    for(let Tempi = 1;Tempi<=WorkSPNumber;Tempi++){
    $('#MediaSettingsSetpageB').append("<div class='Winui3brickContainer' name='SPSetBrick'><div name='SPSetBrickTitle'>SP"+Tempi+"<br><a class='Winui3brickSubtitle' style='font-size: 13px;'>"+"未知作品名"+
    "</a></div><input class='Winui3inputText' type='text' name='checkboxSP' style='width:50%;right: 60px;' placeholder='填写SP对应本地地址' value='"+store.get("WorkSaveNo"+MediaID+".SPDetails.SP"+Tempi+".URL")+"' required>"+
    "<button type='button' value='点击删除SP' name='delbuttonSP' class='Winui3button_red' style='width:30px' onclick='MediaSettingsESPDeleter(\"SP\","+Tempi+")'><svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M202.666667 256h-42.666667a32 32 0 0 1 0-64h704a32 32 0 0 1 0 64H266.666667v565.333333a53.333333 53.333333 0 0 0 53.333333 53.333334h384a53.333333 53.333333 0 0 0 53.333333-53.333334V352a32 32 0 0 1 64 0v469.333333c0 64.8-52.533333 117.333333-117.333333 117.333334H320c-64.8 0-117.333333-52.533333-117.333333-117.333334V256z m224-106.666667a32 32 0 0 1 0-64h170.666666a32 32 0 0 1 0 64H426.666667z m-32 288a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z m170.666666 0a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z' fill='#ffffff' p-id='3568'></path></svg></button>"+
    "</div>");}
    $('#MediaSettingsSetpageB').append("<div id='MediaSettingsSPFillingPage' style='position:relative;width:100%;height:auto'></div>"+
    "<div class='Winui3brickContainer' style='background-color:#4b5217'><svg t='1673433099656' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='18784' width='18' height='20' style='margin-right: 10px;margin-left:5px'><path d='M432 709.248l-166.624-166.624 45.248-45.248 121.376 121.376 281.376-281.376 45.248 45.248L432 709.248zM512 64C264.576 64 64 264.576 64 512s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64z' fill='#6ccb5f' p-id='18785'></path></svg>保存更改<button type='button' value='保存并应用' onclick='submitB();' class='Winui3button'>保存并应用</button></div>")
}//window.onload =MediaPageLoad(MediaIDGet);

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

function MediaSettingsSetpageAShower() { //点击显示通用设置页面A
    document.getElementById("MediaSettingsSetpageA").style.display="block";
    document.getElementById("MediaSettingsSetpageB").style.display="none";
    document.getElementById("MediaSettingsSetTabHighLight").style.right="160px";
    document.getElementById("MediaSettingsSetTabHighLight").style.width="105px";

}

function MediaSettingsSetpageBShower() { //点击显示个性化设置页面B
    document.getElementById("MediaSettingsSetpageA").style.display="none";
    document.getElementById("MediaSettingsSetpageB").style.display="block";
    document.getElementById("MediaSettingsSetTabHighLight").style.right="35px";
    document.getElementById("MediaSettingsSetTabHighLight").style.width="75px";

}

function MediaSettingsESPAdder(Type){
    if(Type=='SP'){let MediaSettingsSPNumber = Number(document.getElementsByName("checkboxSP").length+1);
    $('#MediaSettingsSPFillingPage').append("<div class='Winui3brickContainer' name='SPSetBrick'><div name='SPSetBrickTitle'>SP"+MediaSettingsSPNumber+
    "<br><a class='Winui3brickSubtitle' style='font-size: 13px;'>未知作品名</a></div><input class='Winui3inputText' type='text' name='checkboxSP' style='width:50%;right: 60px;' placeholder='填写SP对应本地地址' required>"+
    "<button type='button' value='点击删除SP' name='delbuttonSP' class='Winui3button_red' style='width:30px' onclick='MediaSettingsESPDeleter(\"SP\","+MediaSettingsSPNumber+")'><svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M202.666667 256h-42.666667a32 32 0 0 1 0-64h704a32 32 0 0 1 0 64H266.666667v565.333333a53.333333 53.333333 0 0 0 53.333333 53.333334h384a53.333333 53.333333 0 0 0 53.333333-53.333334V352a32 32 0 0 1 64 0v469.333333c0 64.8-52.533333 117.333333-117.333333 117.333334H320c-64.8 0-117.333333-52.533333-117.333333-117.333334V256z m224-106.666667a32 32 0 0 1 0-64h170.666666a32 32 0 0 1 0 64H426.666667z m-32 288a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z m170.666666 0a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z' fill='#ffffff' p-id='3568'></path></svg></button>"+
    "</div>");
    MediaSettingsSPNumber++;}
    if(Type=='EP'){let MediaSettingsEPNumber = Number(document.getElementsByName("checkboxB").length+1);
    $('#MediaSettingsEPFillingPage').append("<div class='Winui3brickContainer' name='EPSetBrick'><div name='EPSetBrickTitle'>EP"+MediaSettingsEPNumber+
    "<br><a class='Winui3brickSubtitle' style='font-size: 13px;'>未知作品名</a></div><input class='Winui3inputText' type='text' name='checkboxB' style='width:50%;right: 60px;' placeholder='填写EP对应本地地址' required>"+
    "<button type='button' value='点击删除EP' name='delbuttonB' class='Winui3button_red' style='width:30px' onclick='MediaSettingsESPDeleter(\"EP\","+MediaSettingsEPNumber+")'><svg t='1673539124397' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3567' width='20' height='20'><path d='M202.666667 256h-42.666667a32 32 0 0 1 0-64h704a32 32 0 0 1 0 64H266.666667v565.333333a53.333333 53.333333 0 0 0 53.333333 53.333334h384a53.333333 53.333333 0 0 0 53.333333-53.333334V352a32 32 0 0 1 64 0v469.333333c0 64.8-52.533333 117.333333-117.333333 117.333334H320c-64.8 0-117.333333-52.533333-117.333333-117.333334V256z m224-106.666667a32 32 0 0 1 0-64h170.666666a32 32 0 0 1 0 64H426.666667z m-32 288a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z m170.666666 0a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z' fill='#ffffff' p-id='3568'></path></svg></button>"+
    "</div>");
    }
}

function MediaSettingsESPDeleter(Type,ID){
    if(Type=='EP'){
        var DelEPBrick = document.getElementsByName('EPSetBrick')[Number(ID-1)];
        DelEPBrick.style.transform='scale(0)';
        setTimeout(function(){
            // 拿到父节点:
            let DelEPBrickparent = DelEPBrick.parentElement;
            // 删除:
            DelEPBrickparent.removeChild(DelEPBrick);
            for(let Tempi = 0;Tempi!=document.getElementsByName("checkboxB").length;Tempi++){
                document.getElementsByName('EPSetBrickTitle')[Tempi].innerHTML="EP"+Number(Tempi+1)+"<br><a class='Winui3brickSubtitle' style='font-size: 13px;'>未知作品名</a>"
                $("button[name='delbuttonB']").eq(Tempi).attr("onclick","MediaSettingsESPDeleter(\"EP\","+Number(Tempi+1)+")");
                // document.getElementsByName('delbuttonB')[Tempi].onclick=;
            }
        },500)
    }
    if(Type=='SP'){
        var DelSPBrick = document.getElementsByName('SPSetBrick')[Number(ID-1)];
        DelSPBrick.style.transform='scale(0)';
        setTimeout(function(){
            // 拿到父节点:
            let DelSPBrickparent = DelSPBrick.parentElement;
            // 删除:
            DelSPBrickparent.removeChild(DelSPBrick);
            for(let Tempi = 0;Tempi!=document.getElementsByName("checkboxSP").length;Tempi++){
                document.getElementsByName('SPSetBrickTitle')[Tempi].innerHTML="SP"+Number(Tempi+1)+"<br><a class='Winui3brickSubtitle' style='font-size: 13px;'>未知作品名</a>"
                $("button[name='delbuttonSP']").eq(Tempi).attr("onclick","MediaSettingsESPDeleter(\"SP\","+Number(Tempi+1)+")");
                // document.getElementsByName('delbuttonB')[Tempi].onclick=;
            }
        },500)
    }
}

function submitA(){
    let checkboxA = document.getElementsByName("checkboxA");
    //循环多选框数组
    var checkboxA_Content = [".Name",".URL",".bgmID",".Type",".Year",".Protocol",".Director",".Corp",".Cover"]
    for (let Tempi = 0; Tempi < checkboxA.length; Tempi++) {
        store.set("WorkSaveNo"+MediaID+checkboxA_Content[Tempi],checkboxA[Tempi].value.toString());
    }
    let WorkCover = store.get("WorkSaveNo"+MediaID+".Cover"); //初始化封面
    document.getElementById("MediaSettingsCover").style.background="url('"+WorkCover+"') no-repeat center";
    document.getElementById("MediaSettingsCover").style.backgroundSize="cover";
    let MediaName = store.get("WorkSaveNo"+MediaID+".Name");
    document.getElementsByTagName("title")[0].innerText=MediaName+'-作品编辑';
    document.getElementById("Title").innerText=MediaName+'-作品编辑';
    document.getElementById("PageTitle").innerText=MediaName+'-作品编辑';
    OKErrorStreamer("OK","作品信息设置完成",0);
    ipc.send('MainWindow','Refresh');
}

function submitB(){
    let checkboxB = document.getElementsByName("checkboxB");
    store.set("WorkSaveNo"+MediaID+".EPTrueNum",checkboxB.length.toString());
    let checkboxSP = document.getElementsByName("checkboxSP");
    store.set("WorkSaveNo"+MediaID+".SPTrueNum",checkboxSP.length.toString());
    //循环读取EP文本框
    for (let Tempi = 0; Tempi != checkboxB.length; Tempi++) {
        store.set("WorkSaveNo"+MediaID+'.EPDetails.EP'+Number(Tempi+1)+'.URL',checkboxB[Tempi].value.toString());
    }
    //循环读取SP文本框
    for (let Tempi = 0; Tempi != checkboxSP.length; Tempi++) {
        store.set("WorkSaveNo"+MediaID+'.SPDetails.SP'+Number(Tempi+1)+'.URL',checkboxSP[Tempi].value.toString());
    }
    OKErrorStreamer("OK","作品信息设置完成",0);
    MediaPageLoad(MediaID);
    ipc.send('MainWindow','Refresh');
}

//! 作品设置-作品删除
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

//! 作品数据信息链接BGM更新模块(指定作品)
function ArchiveMediaUpdateSingle(MediaBaseScanCounter){
    // *Archive Get <!--联网检索ArchivePage指定媒体内容-->
    OKErrorStreamer("MessageOn","作品信息自动更新进行中",0);
    setTimeout(function() {
    var ModifiedbgmID = document.getElementsByName("checkboxA")[2].value.toString();
    // *扫描作品bgmID获取作品信息 
    if(ModifiedbgmID != '0' && ModifiedbgmID != ''){
        $.getJSON("https://api.bgm.tv/v0/subjects/"+ModifiedbgmID, function(data){
        store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".bgmID",ModifiedbgmID);
        store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Score",data.rating.score); 
        store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Year",data.date.substring(0,4));
        store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Eps",data.eps);
        if(data.name_cn!=null){store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name_cn);}
        else{store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Name",data.name);}
        store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Type",data.platform); 
        store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Cover",data.images.large); 
        }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}).done(function(){ipc.send('MainWindow','Refresh'); /*更新媒体库页面*/MediaPageLoad(MediaID);OKErrorStreamer("MessageOff","作品信息更新进行中",0);
        OKErrorStreamer("OK","媒体库数据爬取完成",0); }); // *错误回调
        $.getJSON("https://api.bgm.tv/v0/subjects/"+ModifiedbgmID+'/persons', function(data){
        for(let MediaBaseElementsGet=0;MediaBaseElementsGet!=data.length;MediaBaseElementsGet++){
        if(data[MediaBaseElementsGet].relation=='导演') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Director",data[MediaBaseElementsGet].name);}
        if(data[MediaBaseElementsGet].relation=='动画制作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Corp",data[MediaBaseElementsGet].name);}
        if(data[MediaBaseElementsGet].relation=='原作') {store.set("WorkSaveNo"+MediaBaseScanCounter.toString()+".Protocol",data[MediaBaseElementsGet].name);}
        } }).fail(function(){OKErrorStreamer("Error","无法连接Bangumi",0);}).done(function(){ipc.send('MainWindow','Refresh'); /*更新媒体库页面*/OKErrorStreamer("MessageOff","作品信息更新进行中",0);
        MediaPageLoad(MediaID);}); // *错误回调
        } else{OKErrorStreamer("MessageOff","作品信息更新进行中",0);OKErrorStreamer("Error","bgmID无效",0);}
    },2000);
}