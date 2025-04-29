/**
 * @name MediaShare.js
 * @description 本文件用于海报分享功能
 * @dependencies 本文件依赖于html-to-image库,electron-store库,canvas-txt库,Toaster.js库
 */

const ipc = nodeRequire('electron').ipcRenderer;                      //?引入ipcRenderer进程通信api
const {clipboard,nativeImage} = nodeRequire('electron');              //?引入剪贴板api
const { dialog } = nodeRequire('@electron/remote')                    //?引入remote.dialog 对话框弹出api
const Store = nodeRequire('electron-store');                          //?引入electron-store存储资源库信息
// const store = new Store();                                            //?创建electron-store存储资源库对象

//! NeDB数据库初始化
const path = nodeRequire("path");                                     //?引入path
const appDataPath = process.env.APPDATA || path.join(process.env.HOME, 'Library', 'Application Support'); // 获取appdata
const Datastore = nodeRequire('nedb');
const db = new Datastore({
    filename: path.join(path.join(appDataPath, 'bgm.res'), 'MediaData.db'),
    autoload: false
});
const ElectronStoreAdapter = nodeRequire('../js/ElectronStore2NeDB.js');
const store = new ElectronStoreAdapter();  // 创建自定义适配器实例
//! NeDB数据库初始化OVER

var htmlToImage = nodeRequire('html-to-image');                       //?引入html-to-image截图库
const { drawText } = nodeRequire('canvas-txt')                        //?canvas-txt文本绘制模块
var MediaIDStorage = null;                                          //?媒体ID

let SysdataOption={
    name:"sysdata",//文件名称,默认 config
    fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储

const { OKErrorStreamer } = nodeRequire('../js/Mainpage_Modules/MainpageToaster.js'); //?引入bgm.res主界面的通知toast函数封装
ipc.on('data', (e,arg) => {console.log(arg);MediaIDStorage = arg;store.update().then(() => {SharePostPreGenerate(arg);}).catch(err => {
    console.error('更新缓存时出错:', err);});});       //?接收主进程传来的数据

function SharePostPreGenerate(MediaID){
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor")) //初始化自定义颜色
    {
    let CustomColorData = sysdata.get("Settings.checkboxB.LocalStorageSystemCustomColor");
    let customcolorstyle=document.createElement('style');//创建一个<style>标签
    let customchangeText=document.createTextNode('.Winui3inputText:focus{border-bottom:2px solid '+CustomColorData+'}')//更改后伪元素的样式
    customcolorstyle.appendChild(customchangeText);//把样式添加到style标签里
    document.body.appendChild(customcolorstyle);//把内联样式表添加到html中    
    }

    document.getElementById('ShareCanvasBackGround').style.background = "url('"+store.find("WorkSaveNo"+MediaID+".Cover")+"') no-repeat center";
    document.getElementById('ShareCanvasBackGround').style.backgroundSize = "cover";
    document.getElementById('ShareCanvasCover').style.background = "url('"+store.find("WorkSaveNo"+MediaID+".Cover")+"') no-repeat center";
    document.getElementById('ShareCanvasCover').style.backgroundSize = "cover";
    document.getElementById('ShareCanvasTitle').innerText = store.find("WorkSaveNo"+MediaID+".Name");

    // 作品等级判定
    let RateScore = store.find("WorkSaveNo"+MediaID+".Score")
    if(RateScore > 9.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;超神作";}
    else if(RateScore > 8.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;神作";}
    else if(RateScore > 7.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;力荐";}
    else if(RateScore > 6.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;推荐";}
    else if(RateScore > 5.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;还行";}
    else if(RateScore > 4.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;不过不失";}
    else if(RateScore > 3.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;较差";}
    else if(RateScore > 2.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;差";}
    else if(RateScore > 2.5) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;很差";}
    else if(RateScore >= 1) {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;不忍直视";}
    else {document.getElementById('ShareCanvasRank').innerHTML = RateScore+"&nbsp;&nbsp;暂无评分";}


    document.getElementById('ShareCanvasStaff1').innerText = "原作："+store.find("WorkSaveNo"+MediaID+".Protocol")+" / 监督："+store.find("WorkSaveNo"+MediaID+".Director");
    document.getElementById('ShareCanvasStaff2').innerText = store.find("WorkSaveNo"+MediaID+".Type")+" / "+store.find("WorkSaveNo"+MediaID+".Eps")+"话 / "+store.find("WorkSaveNo"+MediaID+".Year")+"年 / 动画制作："+store.find("WorkSaveNo"+MediaID+".Corp");

    document.getElementById('ShareCanvasShareQR').style.background = "url('https://api.pwmqr.com/qrcode/create/?url=https://bgm.tv/subject/"+store.find("WorkSaveNo"+MediaID+".bgmID")+"') no-repeat center";
    document.getElementById('ShareCanvasShareQR').style.backgroundSize = "cover";

    const TitleBox = document.getElementById('ShareCanvasTitle');
    // init the fontisze
    TitleBox.style.fontSize = '12px';
    for (var i = 12; i < 60; i++) {
        if ($('#ShareCanvasTitle').height() > 90) {
            // if it's height heighter than thhe maxHeight
            TitleBox.style.fontSize = (i - 2) + 'px';
            break;
        } 
        else {
            // if it's height less then the maxHeight
            TitleBox.style.fontSize = i + 'px';
        }
    }

    const ContentBox = document.getElementById('ShareCanvasContent');
    // init the fontisze
    ContentBox.style.fontSize = '12px';
    for (var i = 12; i < 60; i++) {
        if ($('#ShareCanvasContent').height() > 120) {
            // if it's height heighter than thhe maxHeight
            ContentBox.style.fontSize = (i - 2) + 'px';
            break;
        } 
        else {
            // if it's height less then the maxHeight
            ContentBox.style.fontSize = i + 'px';
        }
    }

    // img.onload = function() { // 将图像绘制到画布上
    //     /* 虚拟画布背景模糊 */
    //     contextOff.drawImage(img, 0, 0, img.width, img.height, 0, 0, 1280, 720);
    //     contextOff.filter = 'blur(20px)';// 将图像模糊

    //     let imageData = contextOff.getImageData(0, 0, 1280, 720);
    //     contextOff.putImageData(changeLuminance(imageData, -0.6), 0, 0)// 降低图像亮度
    //     contextOff.drawImage(canvasOff, 0, 0, canvasOff.width, canvasOff.height, 0, 0, canvasOff.width, canvasOff.height);

    //     /* 虚拟画布模糊完成 */
    //     ctx.drawImage(canvasOff, 0, 0);
    //     ctx.save();
    //     roundedImage(80,60,450,600,30);
    //     ctx.clip();
    //     ctx.drawImage(img, 0, 0, img.width, img.height, 80, 60, 450, 600);
    //     ctx.restore();
    //     ctx.shadowColor = "black";
    //     ctx.shadowBlur = 6;
    //     ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    //     drawText(ctx, '『这是，既非高中生也非大学生，处在这种时期的阿良良木历所体验的，终结之继续的物语。』', {
    //         x: 610,
    //         y: 60,
    //         width: 620,
    //         height: 200,
    //         fontSize: 35,
    //         align: 'left',
    //         justify: true,
    //         lineHeight: 60,
    //         font: "bgmUIHeavy"
    //     })
    //     ctx.font = "bold 50px Arial";
    //     ctx.fillStyle="#ffc400";
    //     ctx.fillText("⭐ "+store.get("WorkSaveNo"+MediaID+".Score"), 610, 370);
    //     ctx.font = "bold 60px Arial";
    //     ctx.fillStyle="#ddd";
    //     ctx.fillText(store.get("WorkSaveNo"+MediaID+".Name"), 610, 465);
    //     ctx.font = "30px Arial";
    //     ctx.fillText("原作："+store.get("WorkSaveNo"+MediaID+".Protocol")+" / 监督："+store.get("WorkSaveNo"+MediaID+".Director"), 610, 525);
    //     ctx.fillText(store.get("WorkSaveNo"+MediaID+".Type")+" / "+store.get("WorkSaveNo"+MediaID+".Eps")+"话 / "+store.get("WorkSaveNo"+MediaID+".Year")+"年 / 动画制作："+store.get("WorkSaveNo"+MediaID+".Corp"), 610, 585);
    // }   
    
}

function SharePostGenerate(){
    document.getElementById('ShareCanvasContent').innerHTML = document.getElementsByName('ShareContextBox')[0].value;
    SharePostPreGenerate(MediaIDStorage)
    OKErrorStreamer("OK","生成成功！",0,"..");
}

function SharePostSave(){
    htmlToImage.toPng(document.getElementById('ShareCanvas'))
    .then(function (dataUrl) {
        dialog.showSaveDialog({ defaultPath: 'SharePost.png' }, (filename) => {})
        .then(res=>{
            if (res.filePath) {
                const fs = nodeRequire('fs');
                const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
                fs.writeFile(res.filePath, base64Data, 'base64', (err) => {
                if (err) throw err;
                console.log('图片已保存');
                });
            }
        }).catch(err=>{console.log(err)});
    });
}

function SharePostShare(){
    htmlToImage.toPng(document.getElementById('ShareCanvas'))
    .then(function (dataUrl) {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);
    OKErrorStreamer("OK","海报已复制到剪贴板",0,"..");
    }).catch(function (error) {
    OKErrorStreamer("Error","海报生成失败",0,"..");
    console.error('oops, something went wrong!', error);
    });
}


//! 媒体库详情页-分享按钮
// function ArchiveMediaDetailsPageShare() {  
    // ipcRenderer.send('MediaShare',sysdata.get('Settings.checkboxC.LocalStorageRecentViewLocalID'));
    // htmlToImage.toPng(document.getElementById('HomePage'))
    // .then(function (dataUrl) {
    //     const image = nativeImage.createFromDataURL(dataUrl);
    //     clipboard.writeImage(image);
    //     OKErrorStreamer("OK","海报已复制到剪贴板",0);
    //     }).catch(function (error) {
    //     OKErrorStreamer("Error","海报生成失败",0);
    //     console.error('oops, something went wrong!', error);
    //     });
// }