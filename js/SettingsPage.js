function SettingsPageSetpageAShower() { //点击显示通用设置页面A
    document.getElementById("SettingsPageSetpageA").style.display="block";
    document.getElementById("SettingsPageSetpageB").style.display="none";
    document.getElementById("SettingsPageSetpageC").style.display="none";
    document.getElementById("SettingsPageSetpageInfo").style.display="none";
    document.getElementById("SettingsPageSetTabHighLight").style.right="293px";
    document.getElementById("SettingsPageSetTabHighLight").style.width="70px";
    document.getElementById("SettingsPageSetTab").style.height="60px";


}

function SettingsPageSetpageBShower() { //点击显示个性化设置页面B
    document.getElementById("SettingsPageSetpageA").style.display="none";
    document.getElementById("SettingsPageSetpageB").style.display="block";
    document.getElementById("SettingsPageSetpageC").style.display="none";
    document.getElementById("SettingsPageSetpageInfo").style.display="none";
    document.getElementById("SettingsPageSetTabHighLight").style.right="187px";
    document.getElementById("SettingsPageSetTabHighLight").style.width="70px";
    document.getElementById("SettingsPageSetTab").style.height="60px";

}

function SettingsPageSetpageCShower() { //点击显示实验室设置页面C
    document.getElementById("SettingsPageSetpageA").style.display="none";
    document.getElementById("SettingsPageSetpageB").style.display="none";
    document.getElementById("SettingsPageSetpageC").style.display="block";
    document.getElementById("SettingsPageSetpageInfo").style.display="none";
    document.getElementById("SettingsPageSetTabHighLight").style.right="82px";
    document.getElementById("SettingsPageSetTabHighLight").style.width="70px";
    document.getElementById("SettingsPageSetTab").style.height="60px";

}

function SettingsPageSetpageInfoShower() { //点击显示关于界面
    document.getElementById("SettingsPageSetpageA").style.display="none";
    document.getElementById("SettingsPageSetpageB").style.display="none";
    document.getElementById("SettingsPageSetpageC").style.display="none";
    document.getElementById("SettingsPageSetpageInfo").style.display="block";
    document.getElementById("SettingsPageSetTabHighLight").style.right="28px";
    document.getElementById("SettingsPageSetTabHighLight").style.width="17px";
    document.getElementById("SettingsPageSetTab").style.height="60px";

}

function SettingsPageAPIPing(ButtonID) { //网络探针
    let p = new Ping();
    let urlstore = ["https://api.bgm.tv/","https://netaba.re/","https://api.github.com/repos/jimhans/bgm.res/releases/latest","https://graphql.anilist.co/","https://v3.sg.media-imdb.com/suggestion/x/"]
    document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].innerHTML='检测中...'
    document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].style.color ="#b9b9b9";
    p.ping(urlstore[ButtonID], function(err,data) {
        if (err) {console.log("error loading resource");
            // document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].innerHTML ="检测超时，"+data+"ms "+err;
            // document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].style.color ="#ff4848";
        }
        if(Number(data)>999){
            document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].innerHTML ="检测超时，"+data+"ms "+err;
            document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].style.color ="#ff4848";}
        else if(Number(data)<6){
            document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].innerHTML ="检测超时，网络断开";
            document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].style.color ="#ff4848";}
        else{document.getElementsByName('SettingsPageAPIPingCard')[ButtonID].innerHTML =urlstore[ButtonID]+"检测正常，延时："+data+'ms';
            console.log(data);}
    });
    
}

function SettingsPageSaveConfig(checkboxName,checkboxID,key,type) { //数据保存
    if(type == 'checkbox') {
        let Value = document.getElementsByName(checkboxName)[checkboxID].checked;
        sysdata.set("Settings."+checkboxName.toString()+"."+key.toString(),Value);
        OKErrorStreamer("OK","设置完成，刷新或重启客户端生效",0);
    }
    else if(type == 'fillblank') {
        let Value = document.getElementsByName(checkboxName)[checkboxID].value;
        if(Value!=""){sysdata.set("Settings."+checkboxName.toString()+"."+key.toString(),Value);
            if(key=='LocalStorageMediaScanExpression'||key=='LocalStorageMediaScanExpressionSub'){
                let keywords = Value.split(/[,，]/); let keywordObject = {};
                keywords.forEach(keyword => {
                    keywordObject[keyword.trim()] = true;
                });
                sysdata.set("Settings."+checkboxName.toString()+"."+key.toString(), keywordObject);
            }//刮削器设定特殊保存
        OKErrorStreamer("OK","设置完成，刷新或重启客户端生效",0);}
        else {sysdata.set("Settings."+checkboxName.toString()+"."+key.toString(),Value);OKErrorStreamer("Error","输入不能为空",0);}
    }
}

function SettingsPageFolderURL(event) { //获取媒体文件夹路径
    console.log(document.getElementById('SettingsPageFolderSelectIcon').files);
    let SubFolderPath = document.getElementById('SettingsPageFolderSelectIcon').files[0].name;
    let FolderPath = document.getElementById('SettingsPageFolderSelectIcon').files[0].path.replaceAll('\\','\\')
    document.getElementsByName('checkboxA')[0].value = FolderPath.substr(0,FolderPath.length-SubFolderPath.length-1);
}

function SettingsPageConfigInit() { //数据初始化

    let CustomColorData =SettingsColorPicker(1);
    if(CustomColorData){ //初始化自定义颜色
        // let CustomColorData = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
        document.getElementById("SettingsPageSetTabHighLight").style.backgroundColor=CustomColorData;
        document.getElementById("SettingsPageSetTabHighLight").style.boxShadow="0px 0px 1px 1px "+CustomColorData;
        let customcolorstyle=document.createElement('style');//创建一个<style>标签
        let customchangeText=document.createTextNode('.Winui3inputText:focus{border-bottom:2px solid '+CustomColorData+'}')//更改后伪元素的样式
        let customchangeSwitch=document.createTextNode('input:checked + .Winui3slider {background-color: '+CustomColorData+';box-shadow: 0px 0px 0px 1px '+CustomColorData+
        ';} input:checked + .Winui3slider:before{box-shadow: 0px 0px 0px 1px '+CustomColorData+';}input:checked + .Winui3slider:hover{background:'+CustomColorData+';filter:brightness(1.2);}')//更改后伪元素的样式
        customcolorstyle.appendChild(customchangeText);customcolorstyle.appendChild(customchangeSwitch);//把样式添加到style标签里
        document.body.appendChild(customcolorstyle);//把内联样式表添加到html中
    }

    var KeyStoreA=['LocalStorageMediaBaseURL',
            "LocalStorageAutoUpdateArchive",
			"LocalStorageAutoUpdateArchiveInfo",
            "LocalStorageAutoUpdateMediaInfo",
            "LocalStorageMediaSubFolderName",
            "LocalStorageUseSystemPlayer",
			"LocalStorageqBittorrnetURL"
			]
    //初始化PageA
    for(let Temp = 0;Temp!=KeyStoreA.length;Temp++){
        if(sysdata.get("Settings.checkboxA."+KeyStoreA[Temp])!=''){
            if(document.getElementsByName('checkboxA')[Temp].type=='checkbox') 
                document.getElementsByName('checkboxA')[Temp].checked=sysdata.get("Settings.checkboxA."+KeyStoreA[Temp])
            else
                document.getElementsByName('checkboxA')[Temp].value=sysdata.get("Settings.checkboxA."+KeyStoreA[Temp])}
    }

    var KeyStoreB=['LocalStorageMediaShowSciMark',
                    'LocalStorageMediaShowStd',"LocalStorageMediaShowProgress","LocalStorageMediaShowRelative","LocalStorageMediaShowCharacter",
                    "LocalStorageMediaShowCharacterCN","LocalStorageMediaShowCharacterCV","LocalStorageMediaShowTranslation","LocalStorageMediaShowStaff",
                    "LocalStorageSystemCustomColor","LocalStorageSystemShowModifiedCover","LocalStorageSystemOpenLightMode","LocalStorageSystemOpenMicaMode","LocalStorageSystemOpenLiveBackground",
                    "LocalStorageSystemOpenSpeedMode"]
    //初始化PageB
    for(let Temp = 0;Temp!=KeyStoreB.length;Temp++){ //Object.keys(sysdata.get("Settings.checkboxB"))
        if(sysdata.get("Settings.checkboxB."+KeyStoreB[Temp])!=''){
            if(document.getElementsByName('checkboxB')[Temp].type=='checkbox') 
                document.getElementsByName('checkboxB')[Temp].checked=sysdata.get("Settings.checkboxB."+KeyStoreB[Temp])
            else
                document.getElementsByName('checkboxB')[Temp].value=sysdata.get("Settings.checkboxB."+KeyStoreB[Temp])
            if (KeyStoreB[Temp]=="LocalStorageSystemCustomColor") //为取色器设定初始化颜色
                {
                    document.getElementById('SettingsPageColorPickerInput').value=sysdata.get("Settings.checkboxB."+KeyStoreB[Temp])
                    Coloris({
                        el: document.getElementById('SettingsPageColorPickerInput'),
                        themeMode: 'dark',
                        theme: 'pill',
                        format: 'rgb',
                        onChange: (color, input) => {document.getElementsByName('checkboxB')[Temp].value=color;},
                    });
                }
            } 
    }if(sysdata.get("Settings.checkboxB.LocalStorageSystemBackgroundImage"))document.getElementById('Winui3fileInfoBubble').innerText='当前选定背景图片为：'+sysdata.get("Settings.checkboxB.LocalStorageSystemBackgroundImage")
    
    var KeyStoreC=["LocalStorageMediaShowOldSettingPage",
                "LocalStorageMediaScanExpression",
                "LocalStorageMediaScanExpressionSub",
                "LocalStorageRecentViewID",
                "LocalStorageRecentViewEpisode",
                "LocalStorageRecentViewEpisodeType",
                "LocalStorageRecentViewURL",
                "LocalStorageRecentViewNextURL",
                "LocalStorageRecentViewLocalID",
                "LocalStorageMediaBaseNumber",
                "LocalStorageMediaBaseDeleteNumber"]
    //初始化PageC
    for(let Temp = 0;Temp!=KeyStoreC.length;Temp++){
        if(sysdata.get("Settings.checkboxC."+KeyStoreC[Temp])!=''){
            if(document.getElementsByName('checkboxC')[Temp].type=='checkbox') 
                document.getElementsByName('checkboxC')[Temp].checked=sysdata.get("Settings.checkboxC."+KeyStoreC[Temp])
            else {
                document.getElementsByName('checkboxC')[Temp].value=sysdata.get("Settings.checkboxC."+KeyStoreC[Temp])
                if(KeyStoreC[Temp]=="LocalStorageMediaScanExpression"||KeyStoreC[Temp]=="LocalStorageMediaScanExpressionSub"){
                    let keywordObject = sysdata.get("Settings.checkboxC."+KeyStoreC[Temp]);
                    let keywords = Object.keys(keywordObject);
                    document.getElementsByName('checkboxC')[Temp].value = keywords.join(', ');
                }
            }
        }
    }
}