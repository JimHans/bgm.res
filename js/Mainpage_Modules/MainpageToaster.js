/**
 * @name MainpageToaster.js
 * @module MainpageToaster.js
 * @description bgm.res主界面的通知toast函数封装
 */

exports.OKErrorStreamer=function(type,text,if_reload,rootdir=".") {
    if(type=="OK") {
        Toastify({
        text: text.toString(),
        duration: 3000,
        newWindow: true,
        close: true,
        avatar: rootdir+"/assets/widgets/ok.svg",
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {background: "#20b965",borderRadius: "10px",marginTop: "25px",}
        }).showToast();
        // document.getElementById("OKStreamer").innerHTML="✅ "+text.toString();
        // document.getElementById("OKStreamer").style.display="table";
        if(if_reload == 1) {setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 4000);}
        // else{setTimeout(function() { document.getElementById("OKStreamer").style.display="none"; }, 4000);}
    }
    else if(type=="MessageOn") {
        document.getElementById("MessageStreamer").style.animation="Ascent-Streamer-Right 0.4s ease";
        document.getElementById("MessageStreamer").innerHTML="<div style='position: absolute;margin-left: 0px;/*margin-left: 5px;*/animation: Element-Rotation 1.5s linear infinite;aspect-ratio: 1;height: 70%;top: 15%;'><svg t='1674730870243' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='2939' style='width: 100%;height: 100%;'><path d='M277.333333 759.466667C213.333333 695.466667 170.666667 610.133333 170.666667 512c0-187.733333 153.6-341.333333 341.333333-341.333333v85.333333c-140.8 0-256 115.2-256 256 0 72.533333 29.866667 140.8 81.066667 187.733333l-59.733334 59.733334z' fill='#111' p-id='2940'></path></svg></div><div style='padding-left: 40px;padding-right: 10px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;'>"+text.toString()+"</div>";
        document.getElementById("MessageStreamer").style.display="block";
    }
    else if(type=="MessageOff") {
        document.getElementById("MessageStreamer").style.display="none";
    }
    else {
        Toastify({
        text: text.toString(),
        duration: 3000,
        newWindow: true,
        close: true,
        avatar: rootdir+"/assets/widgets/error.svg",
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {background: "#a4414f",borderRadius: "10px",marginTop: "25px",}
        }).showToast();
        // document.getElementById("ErrorStreamer").innerHTML="⛔ "+text.toString();
        // document.getElementById("ErrorStreamer").style.display="block";
        if(if_reload == 1) {setTimeout(function() { ipcRenderer.send('MainWindow','Refresh'); }, 4000);}
        // else{setTimeout(function() { document.getElementById("ErrorStreamer").style.display="none"; }, 4000);}
    }

}
