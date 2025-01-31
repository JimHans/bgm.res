/**
 * @name userpage.js
 * @param bgm.res_userpage
 * @description bgm.res用户信息界面渲染js
 */
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
const store = new Store();                                            //?创建electron-store存储资源库对象
const ipc = nodeRequire('electron').ipcRenderer;
const {shell, ipcRenderer, nativeTheme} = nodeRequire('electron');
const fs = nodeRequire('fs');                                         //?使用nodejs fs文件操作库
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog 对话框弹出api
let SysdataOption={
    name:"sysdata",//文件名称,默认 config
    fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储

//?加载用户信息
function UserpageOnload () {
    if(sysdata.get('UserData.UserToken')&&sysdata.get('UserData.UserToken')!=''){
        let UserID = 0;
        $.ajax({ //获取用户信息
            url: "https://api.bgm.tv/v0/me",
            type: 'GET',
            headers: {
                "Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""
            },timeout : 2000,
            success: function (data) {
                console.log(data.avatar)
                document.getElementById('UserCard').style.background='url("'+data.avatar.small+'") no-repeat center'
                document.getElementById('UserCard').style.backgroundSize='cover'
                document.getElementById('UserBackgroundCard').style.background='url("'+data.avatar.medium+'") no-repeat center'
                document.getElementById('UserBackgroundCard').style.backgroundSize='cover'
                document.getElementById('UserCardID').innerText=data.nickname
                document.getElementById('UserAuthID').innerText='@'+data.username
                document.getElementById('UserSign').innerText=data.sign
                $("#userpageTimeMachine").attr('onclick','shell.openExternal("https://bgm.tv/user/'+data.username+'")');
                UserID = data.username
                var UserFavouriteAPI = "https://api.bgm.tv/v0/users/"+data.username+"/collections?subject_type=2&type="

                $.ajax({ //获取收藏信息
                    url: "https://api.bgm.tv/v0/users/"+UserID+"/collections?subject_type=2&limit=1&offset=0",
                    type: 'GET',
                    dataType: "json",
                    headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""},
                    timeout : 2000,
                    success: function (data) {
                        if(data.data[0].subject.name.length>15)document.getElementById('UserRecentView').innerHTML="<marquee>"+data.data[0].subject.name+" / "+data.data[0].subject.name_cn+"</marquee>"
                        else document.getElementById('UserRecentView').innerHTML=data.data[0].subject.name+" / "+data.data[0].subject.name_cn
                        $("#userpageRecentEP").attr('onclick','shell.openExternal("https://bgm.tv/subject/'+data.data[0].subject_id+'")');
                    }, error: function () {document.getElementById('UserRecentView').innerHTML="获取失败"}
                });

                let MediaCondition = ['MediaWanted','MediaWatched','MediaWatching','MediaSuspended','MediaRejected']
                let MediaConditionbgm = ['wish','collect','do','on_hold','dropped']
                for(let calc = 1;calc!=6;calc++)
                {
                    $.ajax({ //获取想看收藏信息
                        url: UserFavouriteAPI+calc+"&limit=1&offset=0",
                        type: 'GET',
                        dataType: "json",
                        headers: {"Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""},
                        timeout : 2000,
                        success: function (data) {document.getElementById(MediaCondition[calc-1]).innerHTML=data.total
                            $("#"+MediaCondition[calc-1]+"Brick").attr('onclick','window.open("https://bgm.tv/anime/list/'+UserID+'/'+MediaConditionbgm[calc-1]+'")');}, 
                        error: function () {document.getElementById(MediaCondition[calc-1]).innerHTML='NULL'}
                    });
                }

                //?获取用户进度瓷砖
                document.getElementById('UserProgressTile').style.background='url("https://bangumi-mosaic-tile.aho.im/users/'+UserID+'/timelines/progress.svg") center center  no-repeat';
                document.getElementById('UserProgressTile').style.backgroundSize='contain';

                $.getJSON("https://api.netaba.re/user/"+UserID, function(data2){
                    am5.ready(function() {

                    // Create root element
                    var root = am5.Root.new("chartmarks");
                    // Set themes
                    root.setThemes([am5themes_Animated.new(root)]);
                    // Create chart
                    var chart = root.container.children.push(am5xy.XYChart.new(root, {
                    panX: true,panY: true,wheelX: "panX",wheelY: "zoomX",pinchZoomX: true}));
                    // Add cursor
                    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
                    cursor.lineY.set("visible", false);
    
                    // Create axes
                    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
                    var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
                    xRenderer.labels.template.setAll({fill: am5.color(0xEEEEEEE)});
    
                    xRenderer.grid.template.setAll({visible: false,})
    
                    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
                    maxDeviation: 0.3,categoryField: "marks",renderer: xRenderer,tooltip: am5.Tooltip.new(root, {})}));
    
                    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                    maxDeviation: 0.3,renderer: am5xy.AxisRendererY.new(root, {strokeOpacity: 0.1})}));
                    yAxis.get("renderer").labels.template.setAll({visible: false});
                    yAxis.get("renderer").grid.template.setAll({visible: false});
    
                    // Create series
                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                    xAxis: xAxis,yAxis: yAxis,valueYField: "value",sequencedInterpolation: true,categoryXField: "marks",
                    tooltip: am5.Tooltip.new(root, {labelText: "{valueY}"})}));
    
                    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
                    series.columns.template.adapters.add("fill", function(fill, target) {
                    return chart.get("colors").getIndex(series.columns.indexOf(target));});
    
                    series.columns.template.adapters.add("stroke", function(stroke, target) {
                    return chart.get("colors").getIndex(series.columns.indexOf(target));});
    
                    // Set data
                    var data = [{marks: "10",value: data2.count[10]}, {marks: "9",value: data2.count[9]}, {marks: "8",value: data2.count[8]}, 
                    {marks: "7",value: data2.count[7]}, {marks: "6",value: data2.count[6]}, {marks: "5",value: data2.count[5]}, 
                    {marks: "4",value: data2.count[4]}, {marks: "3",value: data2.count[3]}, {marks: "2",value: data2.count[2]}, {marks: "1",value: data2.count[1]}];
    
                    xAxis.data.setAll(data);
                    series.data.setAll(data);
                    // Make stuff animate on load
                    series.appear(1000);chart.appear(1000, 100);
                    }); // end am5.ready()

                });
            }, error: function () {
                document.getElementById('UserCard').style.background='url("../assets/icon.png") no-repeat center'
                document.getElementById('UserCard').style.backgroundSize='cover';
                //显示登录按钮与提示
                setTimeout(function(){
                document.getElementById('UserLoginBlock').style.display='flex';
                document.getElementById('UserLoginBlockTips').style.display='block';},10);
                // shell.openExternal("https://bgm.tv/oauth/authorize?response_type=code&client_id=bgm252963d4985ddef20&redirect_uri=bgmres://logincode");
            }
        });
    }
    else {
    //显示登录按钮与提示
    setTimeout(function(){
    document.getElementById('UserLoginBlock').style.display='flex';
    document.getElementById('UserLoginBlockTips').style.display='block';},10);
    // shell.openExternal("https://bgm.tv/oauth/authorize?response_type=code&client_id=bgm252963d4985ddef20&redirect_uri=bgmres://logincode");
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('userpageProgressSyncOptions').value='Disabled';
        document.getElementById('userpageProgressSyncOptions').disabled=true;});
    }   
}
window.onload = UserpageOnload();

//?用户登出执行
function UserpageLogout(){
    var result = dialog.showMessageBoxSync({
        type:"info",
        buttons:["取消","确认"],
        title:"提示",
        message:`您确定要退出登录吗？`
    });
    if(result == 1){sysdata.set('UserData.UserToken','');sysdata.set('UserData.userpageProgressSyncOptions','Disabled');ipc.send('MainWindow','Refresh');ipc.send('userpage','Close');}
}

//?保存用户自定token
function SaveUserToken(){
    if(document.getElementById('UserTokenBox').value!=''){
        sysdata.set('UserData.UserToken',document.getElementById('UserTokenBox').value);
        ipc.send('MainWindow','Refresh');
        ipc.send('userpage','Close');
    }
    else dialog.showMessageBoxSync({type:"error",buttons:["确认"],title:"错误",message:`请输入Token`});
}


//?显示/隐藏用户自定token
function ShowHideUserToken(){
    if(document.getElementById('UserTokenBox').type=='password'){document.getElementById('UserTokenBox').type='text';}
    else if(document.getElementById('UserTokenBox').type=='text'){document.getElementById('UserTokenBox').type='password';}
}


//?初始化用户信息界面-进度同步设置与token信息
window.onload = function () {
    if(sysdata.get('UserData.userpageProgressSyncOptions')&&sysdata.get('UserData.userpageProgressSyncOptions')!='')
    {document.getElementById('userpageProgressSyncOptions').value=sysdata.get('UserData.userpageProgressSyncOptions');}
    //载入token信息
    if(sysdata.get('UserData.UserToken')&&sysdata.get('UserData.UserToken')!=''){
        document.getElementById('UserTokenBox').value=sysdata.get('UserData.UserToken');
    }

    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) //初始化自定义颜色
    {
    let CustomColorData = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    let customcolorstyle=document.createElement('style');//创建一个<style>标签
    let customchangeText=document.createTextNode('.Winui3inputText:focus{border-bottom:2px solid '+CustomColorData+'}')//更改后伪元素的样式
    customcolorstyle.appendChild(customchangeText);//把样式添加到style标签里
    document.body.appendChild(customcolorstyle);//把内联样式表添加到html中    
    }
}