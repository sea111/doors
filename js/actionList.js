$(function(){
	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {},function() {});
	window.aesFail = "";
	//分割原生中？后的id
	var urlRequest=getUrlRequest();
	
	$.ajax({
		type:"post",
		url:wpCommon.Url+"/wpwl/getKey",
		async:true,
		success:function(datas){
			key=datas.data;
			localStorage.setItem('key',datas.data)
			actionList(key);
		}
	});
	function actionList(key){
		var posId=urlRequest.posId;
		WPBridge.callMethod("JsInvokeNative","wpEncrypt",{
				key:key,
				params:[posId]
		},function(msg){
			codeValue=msg.data.result;
			$.ajax({
				type:"post",
				url:wpCommon.Url+"/wpwl/activity/getPosActivityList",
				async:true,
				timeout:10000,
				data:{
					posId:codeValue[0]
				},
				success:function(datas){
					if(datas.errMsg=="AES加密解密失败"){
						if(!aesFail){
							$.ajax({
								type:"post",
								url:wpCommon.Url+'/wpwl/getKey',
								success:function(datas){
									key = datas.data;
									localStorage.setItem('key',datas.data)
									actionList(key);
								}
							})
							aesFail=true;
						}
					}else if(datas.success==false){
						$("#listContent").hide();
						$(".loading").show();
						$(".middle img").attr('src',"images/error_else.png");
						$(".middle p").html("出错了，请稍后再试");
						$(".top div").html("异常页面");
						wpCommon.viewShow();
					}else{
						try{
							if(datas.success){
								var listContHtml=$("#listContHtml").html();
								var dt=datas.data;
								var bandName=dt.brandName;		
								for(var i=0;i<dt.activityList.length;i++){
									dt.activityList[i].gmtStart=dt.activityList[i].gmtStart.replace(/-/g,'.');
									dt.activityList[i].gmtEnd=dt.activityList[i].gmtEnd.replace(/-/g,'.');
								}
								//模板引擎
								laytpl(listContHtml).render(dt.activityList,function(html){
									$("#listConts").append(html);			
									imgError('images/now_error.png');
								})	
								$(".top div").html(bandName+"活动列表")	
							}
						}catch(e){
							$("#listContent").hide();
							$(".loading").show();
							$(".middle img").attr('src',"images/error_else.png");
							$(".middle p").html("出错了，请稍后再试");
							$(".top div").html("异常页面");
						}
						wpCommon.viewShow();
					}	
				},
				error:function(jqXHR, textStatus, errorThrown){
					if(textStatus=="timeout"){
						$("#listContent").hide();
						$(".loading").show();
						$(".top div").html("网络异常")
					}
					wpCommon.viewShow();
				}
			});	
		})
	}	
	actionList()
	//重新加载
	$("#wpReload").click(function(){
		actionList(key);
	})
	//跳转到活动详情
	$("body").on("click","#listConts #listCont",function(){	
		var posId=urlRequest.posId;
		var suspectId=urlRequest.suspectId;
		var actionId=$(this).attr("actionId");	
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
	        eventId:"h5_e069",
	        otherId:actionId
	 	},function() {});
	   	window.location.href="eventDetails.html?pageId=H5_C013&otherId="+actionId+"&posId="+posId+"&activityId="+actionId+"&suspectId="+suspectId;	   	
	})
	//返回上一页
	$("#back").on('click',function(){
		WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
	})
})