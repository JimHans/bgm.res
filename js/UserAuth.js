var qs = nodeRequire('qs');
ipcRenderer.on('logincode', function(event, arg) {
$.ajax({
    type: 'POST',
    url: 'https://bgm.tv/oauth/access_token',
    data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: 'bgm252963d4985ddef20',
        client_secret: 'd7909e2a78bf913f74131feb931fe7c9',
        code: arg.split('=').slice(1)[0],
        redirect_uri: 'bgmres://logincode',
        state: Date.now()
    }),
    timeout : 2000,
    success: function(msg){ //成功,存储accesstoken
        console.log( "Data Saved: " + msg.access_token );
        sysdata.set('UserData.UserToken',msg.access_token);
        ipcRenderer.send('MainWindow','Refresh');ipcRenderer.send('userpage','Close');
        }
    });
});

function UserLogin(){
    if(sysdata.get('UserData.UserToken')&&sysdata.get('UserData.UserToken')!=''){
        $.ajax({
            url: "https://api.bgm.tv/v0/me",
            type: 'GET',
            headers: {
                "Authorization": "Bearer "+ sysdata.get('UserData.UserToken') +""
            },
            timeout : 2000,
            success: function (data) {
                document.getElementById('UserCard').style.background='url("'+data.avatar.small+'") no-repeat center'
                document.getElementById('UserCard').style.backgroundSize='cover'
                document.getElementById('UserCardID').innerText=data.nickname
                document.getElementById('UserAuthID').innerText='@'+data.username

            }, error: function () {
                document.getElementById('UserCard').style.background='url("./assets/icon.png") no-repeat center'
                document.getElementById('UserCard').style.backgroundSize='cover'
            }
        });
    } else{
        document.getElementById('UserCard').style.background='url("./assets/icon.png") no-repeat center'
        document.getElementById('UserCard').style.backgroundSize='cover'
    }
}window.onload = UserLogin();
