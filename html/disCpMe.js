//	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {},function() {});		
	var urlRequest=getUrlRequest();
	function discoupon(flag){
		$.ajax({
			type:"get",
			url:"JSON/coupon.json",
			async:true,
			timeout:10000,
			data:{
				versionId:'27'
			},
			success:function(datas){
				console.log(datas.data.list)
				if(datas.errMsg=="AES加密解密失败"){
					if(!flag){
						discoupon(true);
					}
				}else if(datas.success==false){
					$("#discountContent").hide();
					$(".loading").show();
					$(".middle img").attr('src',"images/error_else.png");
					$(".middle p").html("出错了，请稍后再试");
					$(".head").html("异常页面");
				}else{
					try{
						if(datas.success){
							var discountBoxHtml=$("#discountBoxHtml").html();
							laytpl(discountBoxHtml).render(datas.data.list,function(html){
								$(".disCont").append(html)
							})
						}
					}catch(e){
						$("#listContent").hide();
						$(".loading").show();
						$(".middle img").attr('src',"images/error_else.png");
						$(".middle p").html("出错了，请稍后再试");
						$(".head").html("异常页面");
					}
				/*	WPBridge.callMethod("JsInvokeNative", "wpShowWebView", {},
				    function() {});
				    WPBridge.callMethod("JsInvokeNative", "wpDismissLoadingDialog", {},
				    function() {});*/
				}
			},
			error:function(jqXHR, textStatus, errorThrown){
				if(textStatus=="timeout"){
					$("#discountContent").hide();
					$(".loading").show();
					$(".head").html("网络异常")
				}
	//				WPBridge.callMethod("JsInvokeNative", "wpShowWebView", {},
	//	            function() {});
	//	            WPBridge.callMethod("JsInvokeNative", "wpDismissLoadingDialog", {},
	//	            function() {});
	//	            WPBridge.callMethod("JsInvokeNative", "wpNetError", {url:wpCommon.Url+"/h5/brand.html"},
	//	            function() {});
			}
		});
	}
	discoupon()
	//进入优惠详情页
	$("#discountContent").on("click",".disCont .discountBox",function(){
//		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
//	        eventId:"h5_e079",
//	        otherId:""
//	   	},
//	    function() {});
//		window.location.href="discountDetail.html?discount=true";
		window.location.href="discountDetail.html";
	})
	//点击查看更多
	$(".more").click(function(){
		$("#outDiscountContent").show();
		$("#discountContent").hide();
	})
	//返回上一页
	//	$(".back").click(function(){
	//      WPBridge.callMethod("JsInvokeNative", "wpH5Back", {},
	//      function() {})
	// });
	//重新加载
	$("#wpReload").click(function(){
		discoupon();
	})

