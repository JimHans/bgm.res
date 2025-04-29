/* Main Progress of Kanban Desktop */

const { app ,BrowserWindow, Menu , Tray, shell, ipcRenderer,ipcMain, nativeTheme} = require('electron')
const dialog = require('electron').dialog;
const path = require('path');
var packageGet = require("./package.json");
const { PARAMS, VALUE,  MicaBrowserWindow, IS_WINDOWS_11, WIN10 } = require('mica-electron'); //导入Mica Electron
require('@electron/remote/main').initialize(); //初始化dialog renderer
const Store = require('electron-store'); Store.initRenderer(); //初始化electron-store
let SysdataOption={
  name:"sysdata",//文件名称,默认 config
  fileExtension:"json",//文件后缀,默认json
}; const sysdata = new Store(SysdataOption);                          //?创建electron-store存储资源库对象-系统设置存储
let userpage = null;/*用户页面全局对象*/
let AddMediaPage = null;/*添加媒体页面全局对象*/
let RecycleBinPage = null;/*添加已屏蔽作品页面全局对象*/
let MediaDirSetPage = null;/*添加媒体目录设置页面全局对象*/
let OOBEPage = null;/*OOBE页面全局对象*/

function createWindow () {
    //获取屏幕分辨率
    var screenElectron = require('electron').screen;
    var screenwidthcalc = Math.min(parseInt(screenElectron.getPrimaryDisplay().workAreaSize.width),parseInt(screenElectron.getPrimaryDisplay().workAreaSize.height))
    var screenscaleFactor = screenElectron.getPrimaryDisplay().scaleFactor;
    var win = null; //?主程序窗口对象
    // 创建主程序浏览器窗口
    if(sysdata.get("Settings.checkboxB.LocalStorageSystemOpenMicaMode")==true) //!启用 Acrylic window
    {
      win = new MicaBrowserWindow({
        width:  parseInt(screenwidthcalc*(1.35)*screenscaleFactor),
        height: parseInt(screenwidthcalc*(0.8)*screenscaleFactor),
        // height: (screenElectron.getPrimaryDisplay().workAreaSize.height)*0.5,
        minWidth: 1000,
        minHeight: 600,
        //x: screenElectron.getPrimaryDisplay().workAreaSize.width-360,
        //y: screenElectron.getPrimaryDisplay().workAreaSize.height-500,
        alwaysOnTop: false,        //不置顶显示
        transparent: false,        //底部透明
        autoHideMenuBar: true,
        show: false,
        frame: true,
        titleBarStyle: "hidden",
        titleBarOverlay: {
          color: "#202020",
          symbolColor: "white", },
        maximizable: true,
        minimizable: true,
        resizable: true,           //窗口可调节大小
        icon: path.join(__dirname, './assets/icons/app.ico'),
        webPreferences: {
          devTools: true,
          nodeIntegration: true,
          enableRemoteModule: true,
          contextIsolation: false,
          webviewTag: true,
          zoomFactor: 1,
          preload: path.join(__dirname, 'preload.js')
        }
      })

      win.setAcrylic();

      // if(IS_WINDOWS_11)  {win.setMicaTabbedEffect();win.setAutoTheme();} else if(WIN10) 

      // 并且为你的应用加载index.html
      win.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
      win.loadFile('index.html');

      require('@electron/remote/main').enable(win.webContents) // 启用 electron/remote web组件

      win.once('ready-to-show', () => {
        SetDockerTasks(); //设置任务栏快速任务
        win.show();
      })
      // win.webContents.openDevTools();
    }   
    else  //!不启用 Acrylic window
    {
      win = new BrowserWindow({
        width:  parseInt(screenwidthcalc*(1.35)),
        height: parseInt(screenwidthcalc*(0.8)),
        // height: (screenElectron.getPrimaryDisplay().workAreaSize.height)*0.5,
        minWidth: 1000,
        minHeight: 600,
        //x: screenElectron.getPrimaryDisplay().workAreaSize.width-360,
        //y: screenElectron.getPrimaryDisplay().workAreaSize.height-500,
        alwaysOnTop: false,        //不置顶显示
        transparent: false,        //底部透明
        autoHideMenuBar: true,
        show: false,
        frame: true,
        titleBarStyle: "hidden",
        titleBarOverlay: {
          color: "#202020",
          symbolColor: "white", },
        maximizable: true,
        minimizable: true,
        resizable: true,           //窗口可调节大小
        icon: path.join(__dirname, './assets/icons/app.ico'),
        webPreferences: {
          devTools: true,
          nodeIntegration: true,
          enableRemoteModule: true,
          contextIsolation: false,
          webviewTag: true,
          zoomFactor: 1,
          preload: path.join(__dirname, 'preload.js')
        }
      })
    
      // 并且为你的应用加载index.html
      win.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
      win.loadFile('index.html');

      require('@electron/remote/main').enable(win.webContents) // 启用 electron/remote web组件

      win.once('ready-to-show', () => {
        SetDockerTasks(); //设置任务栏快速任务
        win.show();
      })
      // win.webContents.openDevTools();
    }
    if(process.argv[1] == "--add-media"){AddMediaPageShow();} //?判断是否为快速任务启动

    win.on('closed', function() {
      app.quit();});
//系统托盘右键菜单
var trayMenuTemplate = [
    {
      label: 'bgm.res',
      enabled: false,
      icon: path.join(__dirname, './assets/icons/TrayMenu.png')
    },
    {
      type: 'separator'
    }, //分隔线
    {
      label: '首页（最近播放）',
      click: function () {win.show();win.webContents.send('MainWindow','OpenMainPage');} //打开相应页面
    },
    {
      label: '媒体库',
      click: function () {win.show();win.webContents.send('MainWindow','OpenMediaPage');} //打开相应页面
    },
    {
      label: '做种管理',
      click: function () {win.show();win.webContents.send('MainWindow','OpenTorrnetPage');} //打开相应页面
    },
    {
      label: '设置',
      submenu: [
        {
          label: '检查更新',
          click: function () {shell.openExternal("http://studio.zerolite.cn")} //打开相应页面
        },
        {
          label: '开启总在最上',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            // 处理单击事件
            if(menuItem.checked==true){win.setAlwaysOnTop(true);}//设置总在最上settings.setAlwaysOnTop(true);
            else if(menuItem.checked==false){win.setAlwaysOnTop(false);}//取消设置总在最上settings.setAlwaysOnTop(false);
          }
        }
      ]
    },
    {
      type: 'separator'
    }, //分隔线
    {
      label: '关于',
      click: function () {
        dialog.showMessageBox({
          title  : '关于', 
          type  : 'info', 
          message : packageGet.name+" v"+packageGet.version+packageGet.buildinf+' Powered By Electron™.'
        })
      } //打开相应页面
    },
    // {
      // submenu: [
      //   {
      //     label: '开启总在最上',
      //     click: function () {win.setAlwaysOnTop(true);}, //设置总在最上settings.setAlwaysOnTop(true);
      //     type: 'radio'
      //   },
      //   {
      //     label: '关闭总在最上',
      //     click: function () {win.setAlwaysOnTop(false);}, //取消设置总在最上settings.setAlwaysOnTop(false);
      //     type: 'radio'
      //   },
      // ],
    // },
    {
        label: '退出',
        click: function () {
          dialog.showMessageBox({
            type:"info",
            buttons:["告辞！","我手滑了"],
            title:"退出",
            message:`真的要退出嘛？`
          }).then((result)=>{
              if(result.response==0){
                  console.log("确定");app.quit();
              }else if(result.response==1){
                  console.log("取消")
              }
          }).catch((error)=>{
              console.log(error);
          });
        }
    }
];

ipcMain.on("MainWindow",(event,data) => {
  console.log(data);
  if(data == 'Close') {event.preventDefault();app.quit();}
  if(data == 'Hide') {event.preventDefault();win.hide();}
  if(data == 'Refresh') {win.reload();}
  if(data.slice(0,18) == 'RefreshArchivePage') {win.webContents.send('data',data);}
  if(data.slice(0,15) == 'InitArchivePage') {win.webContents.send('data',data);}
});//监听主程序标题栏操作最小化与关闭、刷新

//开发人员工具打开监听
ipcMain.on("dev",(event,data) => {
  console.log(data); 
  if(data == 'Open') {win.webContents.openDevTools();}
});

//!监听作品编辑窗口打开信号
ipcMain.on('MediaSettings', (event, arg) => {
  // 创建子页面
  let setwidth = screenElectron.getPrimaryDisplay().workAreaSize.width;
  let MediaSettings = new BrowserWindow({
    width: parseInt((setwidth/2)*(6/5)),
    height: parseInt((setwidth/2)*(3/4)),
    minWidth: 500,
    minHeight: 360,
    skipTaskbar: false,//显示在任务栏
    alwaysOnTop: false,//置顶显示
    transparent: false,//底部透明
    frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
    resizable: true,
    icon: path.join(__dirname, './assets/icons/app.ico'),
    show: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });
  MediaSettings.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
  MediaSettings.loadFile('./pages/MediaSettings.html');// 并且为你的应用加载index.html
  require('@electron/remote/main').enable(MediaSettings.webContents) // 启用 electron/remote web组件
  // MediaSettings.webContents.openDevTools();
  MediaSettings.on('ready-to-show', function () {
  MediaSettings.webContents.send('data',arg.data); // 发送消息
  MediaSettings.show() // 初始化后再显示
  });
  MediaSettings.on('closed', () => { MediaSettings = null });
});

//!监听分享窗口打开信号
ipcMain.on('MediaShare', (event, data) => {
  // 创建子页面
  let MediaShare = new BrowserWindow({
    width: 630,
    height: 480,
    skipTaskbar: false,//显示在任务栏
    alwaysOnTop: false,//置顶显示
    transparent: false,//底部透明
    frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
    resizable: false,
    icon: path.join(__dirname, './assets/icons/app.ico'),
    show: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });
  MediaShare.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
  MediaShare.loadFile('./pages/MediaShare.html');// 并且为你的应用加载index.html
  require('@electron/remote/main').enable(MediaShare.webContents) // 启用 electron/remote web组件
  // MediaShare.webContents.openDevTools();
  MediaShare.on('ready-to-show', function () {
    MediaShare.webContents.send('data',data); // 发送消息
    MediaShare.show() // 初始化后再显示
  });
  MediaShare.on('closed', () => { MediaShare = null });
});

//!用户信息页初始化函数
function userpageShow () {
  //窗口打开监听
  var setheight = screenElectron.getPrimaryDisplay().workAreaSize.height;
  //新建窗口
  userpage = new BrowserWindow({
    width: Math.max(parseInt(setheight*0.4),470),
    height: Math.max(parseInt(setheight*0.75),320),
    minWidth: 470,
    minHeight: 320,
    skipTaskbar: false,//显示在任务栏
    alwaysOnTop: false,//置顶显示
    transparent: false,//底部透明
    frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
    resizable: true,
    icon: path.join(__dirname, './assets/icons/app.ico'),
    show: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });
  // 并且为你的应用加载index.html
  userpage.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
  userpage.loadFile('./pages/userpage.html');
  require('@electron/remote/main').enable(userpage.webContents) // 启用 electron/remote web组件
  // userpage.webContents.openDevTools();
}

//监听用户信息页打开信号
ipcMain.on("userpage",(event,data) => {
  console.log(data);
  if(data == 'Open') {
    if(userpage==null||userpage.isDestroyed()){userpageShow ();}
    else {userpage.show();}
  }
  if(data == 'Close') {event.preventDefault(); userpage.close();}
});

//!添加媒体页初始化函数
function AddMediaPageShow () {
  // 创建子页面
  let setwidth = screenElectron.getPrimaryDisplay().workAreaSize.width;
  AddMediaPage = new BrowserWindow({
    width: parseInt((setwidth/2)*(6/5)),
    height: parseInt((setwidth/2)*(3/4)),
    minWidth: 500,
    minHeight: 360,
    skipTaskbar: false,//显示在任务栏
    alwaysOnTop: false,//置顶显示
    transparent: false,//底部透明
    frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
    resizable: true,
    icon: path.join(__dirname, './assets/icons/app.ico'),
    show: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });
  AddMediaPage.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
  AddMediaPage.loadFile('./pages/AddMediaPage.html');// 并且为你的应用加载index.html
  require('@electron/remote/main').enable(AddMediaPage.webContents) // 启用 electron/remote web组件
  // AddMediaPage.webContents.openDevTools();
  AddMediaPage.on('ready-to-show', function () {
    AddMediaPage.webContents.send('data','OK'); // 发送消息
    AddMediaPage.show() // 初始化后再显示
  });
  AddMediaPage.on('closed', () => { AddMediaPage = null });
}

//监听添加作品页打开信号
ipcMain.on("AddMediaPage",(event,data) => {
  console.log(data);
  if(data == 'Open') {
    if(AddMediaPage==null||AddMediaPage.isDestroyed()){AddMediaPageShow ();}
    else {AddMediaPage.show();}
  }
  if(data == 'Close') {event.preventDefault(); AddMediaPage.close();}
});

//!已屏蔽媒体页初始化函数
function RecycleBinPageShow () {
  // 创建子页面
  let setwidth = screenElectron.getPrimaryDisplay().workAreaSize.width;
  RecycleBinPage = new BrowserWindow({
    height: parseInt((setwidth/2)*(3/4)),
    width: parseInt((setwidth/2)*(3/4)),
    minWidth: 500,
    minHeight: 360,
    skipTaskbar: false,//显示在任务栏
    alwaysOnTop: false,//置顶显示
    transparent: false,//底部透明
    frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
    resizable: true,
    icon: path.join(__dirname, './assets/icons/app.ico'),
    show: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });
  RecycleBinPage.webContents.setUserAgent(`JimHan/bgm.res/${packageGet.version} (Windows) (https://github.com/JimHans/bgm.res)`);
  RecycleBinPage.loadFile('./pages/RecycleBinPage.html');// 并且为你的应用加载index.html
  require('@electron/remote/main').enable(RecycleBinPage.webContents) // 启用 electron/remote web组件
  RecycleBinPage.on('ready-to-show', function () {
    RecycleBinPage.webContents.send('data','OK'); // 发送消息
    RecycleBinPage.show() // 初始化后再显示
  });
  RecycleBinPage.on('closed', () => { RecycleBinPage = null });
}

//监听已屏蔽作品页打开信号
ipcMain.on("RecycleBin",(event,data) => {
  console.log(data);
  if(data == 'Open') {
    if(RecycleBinPage==null||RecycleBinPage.isDestroyed()){RecycleBinPageShow ();}
    else {RecycleBinPage.show();}
  }
  if(data == 'Close') {event.preventDefault(); RecycleBinPage.close();}
});

//!媒体库路径设置页初始化函数
function MediaDirSetPageShow () {
  // 创建子页面
  let setwidth = screenElectron.getPrimaryDisplay().workAreaSize.width;
  MediaDirSetPage = new BrowserWindow({
    height: parseInt((setwidth/2)*(3/4)),
    width: parseInt((setwidth/2)*(3/4)),
    minWidth: 500,
    minHeight: 360,
    skipTaskbar: false,//显示在任务栏
    alwaysOnTop: false,//置顶显示
    transparent: false,//底部透明
    frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
    resizable: true,
    icon: path.join(__dirname, './assets/icons/app.ico'),
    show: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  });
  MediaDirSetPage.loadFile('./pages/MediaDirSetPage.html');// 并且为你的应用加载index.html
  require('@electron/remote/main').enable(MediaDirSetPage.webContents) // 启用 electron/remote web组件
  MediaDirSetPage.on('ready-to-show', function () {
    MediaDirSetPage.webContents.send('data','OK'); // 发送消息
    MediaDirSetPage.show() // 初始化后再显示
  });
  MediaDirSetPage.on('closed', () => { MediaDirSetPage = null });
}

//监听媒体库路径设置页打开信号
ipcMain.on("MediaDirSet",(event,data) => {
  console.log(data);
  if(data == 'Open') {
    if(MediaDirSetPage==null||MediaDirSetPage.isDestroyed()){MediaDirSetPageShow ();}
    else {MediaDirSetPage.show();}
  }
  if(data == 'Close') {event.preventDefault(); MediaDirSetPage.close();}
});

//!OOBE页面初始化函数
ipcMain.on('OOBEPage', (event, data) => {
  // 创建子页面
  if (data == 'Close') {OOBEPage.close();OOBEPage = null;}
  else{
    OOBEPage = new BrowserWindow({
      width: 400,
      height: 600,
      skipTaskbar: false,//显示在任务栏
      alwaysOnTop: false,//置顶显示
      transparent: false,//底部透明
      frame: false,
      resizable: false,
      icon: path.join(__dirname, './assets/icons/app.ico'),
      show: true,
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      }
    });
    OOBEPage.loadFile('./pages/OOBEPage.html');// 并且为你的应用加载index.html
    // OOBEPage.webContents.openDevTools();
    OOBEPage.on('ready-to-show', function () {
      OOBEPage.show() // 初始化后再显示
    });
    OOBEPage.on('closed', () => { OOBEPage = null });
  }
});


// // alternatively use these to
// // dynamically change vibrancy
// win.setVibrancy([options])
// // or
// setVibrancy(win, [options])

//图标的上下文菜单
trayIcon = path.join(__dirname, 'assets/icons');//选取目录
tray = new Tray(path.join(trayIcon, 'app.ico'));
let contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

tray.on('click', function() {
  // 显示主程序
  win.show();
});//设置点击托盘显示主程序

//设置此托盘图标的悬停提示内容
tray.setToolTip(packageGet.name+" v"+packageGet.version);

app.setAppUserModelId(packageGet.name+" v"+packageGet.version);
//设置此图标的上下文菜单
tray.setContextMenu(contextMenu);

app.setAsDefaultProtocolClient('bgmres');
//注册唤醒链接，处理回调数据
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {app.quit();} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 聚焦到myWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      let commands = commandLine.slice();
      // commandLine 是一个数组， 其中最后一个数组元素为我们唤醒的链接
      activeUrl = decodeURI(commands.pop());
      win.webContents.send('logincode',activeUrl)
    }
  });
}
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

//当所有窗口都被关闭后退出
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//设置任务栏快速任务
function SetDockerTasks(){
  app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--add-media',
      iconPath: path.join(__dirname, './assets/icons/app.ico'),
      iconIndex: 0,
      title: '添加作品',
      description: '快捷添加新作品到媒体库'
    }
  ])
}
//注意，快速任务在acrylic window下单独配置
// 您可以把应用程序其他的流程写在在此文件中
// 代码也可以拆分成几个文件，然后用 require 导入。