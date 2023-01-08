// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    // Preload.js 获取软件版本信息
    var package = nodeRequire("./package.json");
    for (const versionType of['chrome', 'electron', 'node', 'v8']) {
        document.getElementById(`${versionType}-version`).innerText = process.versions[versionType]
    }
    document.getElementById("App-version").innerHTML=package.name+" v"+package.version; // Get Version
    document.getElementById("Build-version").innerHTML=package.buildinf; // Get Build

    // *更新检测
    $.getJSON("https://api.github.com/repos/jimhans/bgm.res/releases/latest", function(data1){
        document.getElementById('SettingsPageUpdateChecker_update_button').style.backgroundColor='#252525';
        if(data1.tag_name!=("v"+package.version)){
        document.getElementById('SettingsPageSetTabInfo').style.backgroundColor='#393d1b';
        document.getElementById('SettingsPageInfoIcon').style.fill='#6ccb5f';
        document.getElementById('SettingsPageUpdateChecker_update_ver_get').innerText='有新版本：版本号 '+data1.tag_name;
        document.getElementById('SettingsPageUpdateChecker_if_have_update').style.backgroundColor='#393d1b';}
    else{document.getElementById('SettingsPageUpdateChecker_update_ver_get').innerText='当前是最新版本';document.getElementById('SettingsPageUpdateChecker_if_have_update').style.backgroundColor='#2b4f6c';}
    }).fail(function() {document.getElementById('SettingsPageUpdateChecker_update_ver_get').innerText='无法检测到版本更新数据';document.getElementById('SettingsPageUpdateChecker_if_have_update').style.backgroundColor='#442726';}); 

})