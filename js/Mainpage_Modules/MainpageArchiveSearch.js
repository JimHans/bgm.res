/**
 * @name MainpageArchiveSearch.js
 * @module MainpageArchiveSearch.js
 * @description bgm.res主界面/媒体库界面的作品搜索模块封装
 */

//! 媒体库-搜索模块
exports.ArchivePageMediaSearch=function(Key){
  if(Key == 13)
  {console.log('OK')}
  else {setTimeout(function(){
    //设定搜索结果显示位置与大小，关闭搜索框下方圆角
    document.getElementById('ArchivePageSearchSuggestion').style.left=document.getElementById("ArchivePageSearch").getBoundingClientRect().left+"px"
    document.getElementById('ArchivePageSearchSuggestion').style.width=document.getElementById("ArchivePageSearch").getBoundingClientRect().width-2+"px"
    document.getElementById('ArchivePageSearch').style.borderBottomLeftRadius=0;
    document.getElementById('ArchivePageSearch').style.borderBottomRightRadius=0;

    document.getElementById('ArchivePageSearchSuggestion').innerHTML='';
    document.getElementById('ArchivePageSearchSuggestion').style.display='block';
    document.getElementById('ArchivePageSearchSuggestionBack').style.display='block';
    let MediaNumber = sysdata.get("Settings.checkboxC.LocalStorageMediaBaseNumber");//localStorage.getItem("LocalStorageMediaBaseNumber");
    let SearchKeyWord = document.getElementById('ArchivePageSearch').value;
    // 删除 SearchKeyWord 中的所有标点符号（全角和半角），并转换为小写
    SearchKeyWord = SearchKeyWord.replace(/[\p{P}\p{S}]/gu, '').toLowerCase();

    let SerachResultGetted = 0;
    for(let ScanCounter=1;ScanCounter<=MediaNumber;ScanCounter++){
      let StoreGet = store.get("WorkSaveNo"+ScanCounter+".Name");
      // 删除 StoreGet 中的所有标点符号（全角和半角），并转换为小写
      let StoreGetNormalized = StoreGet.replace(/[\p{P}\p{S}]/gu, '').toLowerCase();
      
        if(StoreGetNormalized.match(eval('/'+SearchKeyWord+'/'))&&store.get("WorkSaveNo"+ScanCounter+".ExistCondition")!='Deleted'){
          SerachResultGetted = 1;
          $("#ArchivePageSearchSuggestion").append("<div class='Winui3brickContainer'>"+"<div style='position:relative;left:0%;top:0%;height:100%;aspect-ratio:1;background:url(\""+store.get("WorkSaveNo"+ScanCounter+".Cover")+"\") no-repeat top;background-size:cover;border-radius:8px;'></div>"+
          "<div style='position:relative;margin-left:10px;margin-right:40px;overflow:hidden'><div style='display: -webkit-box;text-overflow: ellipsis;-webkit-box-orient: vertical;-webkit-line-clamp: 2;overflow: hidden;'>"+StoreGet+"</div><div style='position:relative;font-size:15px;margin-top:5px;color: #aaa;'>"+store.get("WorkSaveNo"+ScanCounter+".Year")+"/"+store.get("WorkSaveNo"+ScanCounter+".Director")+"/"+store.get("WorkSaveNo"+ScanCounter+".Type")+"</div></div>"+
          "<button type='button' value='进入' class='Winui3button' style='width:30px' onclick='ArchiveMediaDetailsPage("+ScanCounter+")'><svg t='1673884147084' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='5739' width='15' height='15'><path d='M245.034251 895.239428l383.063419-383.063419L240.001631 124.07997l0.070608-0.033769c-12.709463-13.137205-20.530592-31.024597-20.530592-50.731428 0-40.376593 32.736589-73.111135 73.115228-73.111135 19.705807 0 37.591153 7.819083 50.730405 20.528546l0.034792-0.035816 438.686251 438.681134-0.035816 0.034792c13.779841 13.281491 22.3838 31.915897 22.3838 52.586682 0 0.071631 0 0.106424 0 0.178055 0 0.072655 0 0.10847 0 0.144286 0 20.669762-8.603959 39.341007-22.3838 52.623521l0.035816 0.033769L343.426165 1003.661789l-0.180102-0.179079c-13.140275 12.565177-30.950919 20.313651-50.588165 20.313651-40.378639 0-73.115228-32.736589-73.115228-73.114205C219.544717 928.512229 229.432924 908.664182 245.034251 895.239428z' p-id='5740' fill='#ffffff'></path></svg></button>"+"</div>")
      }
    }
    if( SerachResultGetted == 0){
      $("#ArchivePageSearchSuggestion").append("<div class='Winui3brickContainer'><div style='position:relative;margin:auto;overflow:hidden;text-align:center'>在媒体库中没有找到结果</div></div>")}
  },100)}

}