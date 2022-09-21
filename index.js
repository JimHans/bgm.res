/* Main Progress of Kanban Desktop */

const { app ,BrowserWindow, Menu , Tray, shell, ipcRenderer,ipcMain, nativeTheme} = require('electron')
const dialog = require('electron').dialog;
const path = require('path');
var packageGet = require("./package.json");
const Store = require('electron-store'); Store.initRenderer(); //初始化electron-store

function createWindow () {
    //获取屏幕分辨率
    var screenElectron = require('electron').screen;
    // 创建主程序浏览器窗口
    const win = new BrowserWindow({
      width:  (screenElectron.getPrimaryDisplay().workAreaSize.width)*0.5,
      height: (screenElectron.getPrimaryDisplay().workAreaSize.width)*0.5*(11/16),
      // height: (screenElectron.getPrimaryDisplay().workAreaSize.height)*0.5,
      minWidth: 600,
      minHeight: 350,
      //x: screenElectron.getPrimaryDisplay().workAreaSize.width-360,
      //y: screenElectron.getPrimaryDisplay().workAreaSize.height-500,
      alwaysOnTop: false,        //不置顶显示
      transparent: false,        //底部透明
      frame: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#202020",
        symbolColor: "white", },
      // vibrancy: {             // 关闭的亚克力特效
      //   effect: 'default',    // (default) or 'blur'
      //   disableOnBlur: true,  // (default)
      // },
      maximizable: true,
      minimizable: true,
      resizable: true,           //窗口可调节大小
      icon: './assets/app.ico',
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
        zoomFactor: 1,
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    // 并且为你的应用加载index.html
    win.loadFile('index.html');

  win.webContents.openDevTools();
//系统托盘右键菜单
var trayMenuTemplate = [
    {
      label: '检查更新',
      click: function () {shell.openExternal("http://studio.zerolite.cn")} //打开相应页面
    },
    {
      label: '关于',
      click: function () {
        dialog.showMessageBox({
          title  : '关于', 
          type  : 'info', 
          message : packageGet.name+" v"+packageGet.version+' Stable Powered By Electron™.'
        })
      } //打开相应页面
    },
    {
      label: '总在最上',
      submenu: [
        {
          label: '开启总在最上',
          click: function () {win.setAlwaysOnTop(true);settings.setAlwaysOnTop(true);}, //设置总在最上
          type: 'radio'
        },
        {
          label: '关闭总在最上',
          click: function () {win.setAlwaysOnTop(false);settings.setAlwaysOnTop(false);}, //取消设置总在最上
          type: 'radio'
        },
      ],
  },
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
});//监听主程序标题栏操作最小化与关闭、刷新

//开发人员工具打开监听
ipcMain.on("dev",(event,data) => {
  console.log(data); 
  if(data == 'Open') {win.webContents.openDevTools();}
});

// // alternatively use these to
// // dynamically change vibrancy
// win.setVibrancy([options])
// // or
// setVibrancy(win, [options])

//图标的上下文菜单
trayIcon = path.join(__dirname, 'assets');//选取目录
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

// 您可以把应用程序其他的流程写在在此文件中
// 代码也可以拆分成几个文件，然后用 require 导入。