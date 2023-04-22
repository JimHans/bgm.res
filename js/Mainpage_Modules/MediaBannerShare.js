
//* 本文件用于媒体库详情页的海报分享功能
//* 本文件依赖于html-to-image库 与 electron原生clipboard,nativeImage库
var htmlToImage = nodeRequire('html-to-image');                       //?引入html-to-image截图库

//! 媒体库详情页-分享按钮
function ArchiveMediaDetailsPageShare() {    
    htmlToImage.toPng(document.getElementById('HomePage'))
    .then(function (dataUrl) {
        const image = nativeImage.createFromDataURL(dataUrl);
        clipboard.writeImage(image);
        OKErrorStreamer("OK","海报已复制到剪贴板",0);
        }).catch(function (error) {
        OKErrorStreamer("Error","海报生成失败",0);
        console.error('oops, something went wrong!', error);
        });
}