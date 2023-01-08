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