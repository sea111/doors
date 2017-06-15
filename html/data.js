$(function(){
	function resetCss(){
		var count=Math.ceil($('.discountBox').width()/19);
		$('.discountBox').each(function(){
			if(!$(this).hasClass('complete')){
				$(this).width(19*count);
				/*$(this).find('.intro').dotdotdot();*/
				$(this).addClass('complete');
			}
		})
	}
//	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {},function() {});	
//	window.aesFail = "";
//	$.ajax({
//		type:"post",
//		url:wpCommon.Url+"/wpwl/getKey",
//		async:true,
//		success:function(datas){
//			key=datas.data;
//			localStorage.setItem('key',datas.data)
//			getData(type,key)
//		}
//	});	
	var scrollEndTimer=null;
	var pageIndex={
		disCountContent:1,
		undisCountContent:1
	}
	var pageSize=6;
	var complete=true;
	//获取数据
	function getData(type,key){
		//var url='JSON/contC.json';
		var obj='';
		var layHTML=$('#discountCouponTpl').html();
		var couponsType="";
		switch(type){
			case 'disCountContent':
				url='JSON/CountContents.json';
				obj=$('#discountContent');
				couponsType=1;
				break;
			case 'undisCountContent':
				url='JSON/undisCountContents.json';
				obj=$('#undiscountContent');
				couponsType=0;
				break;
		}
		if(complete){
			complete=false;
//		WPBridge.callMethod("JsInvokeNative","wpEncrypt",{
//				key:key,
//				params:["zh"]
//		},function(msg){
//			codeValue=msg.data.result;			
				$.ajax({
					url:url,
					type:'get',
					data:{
						pageIndex:pageIndex[type],
						pageSize:pageSize
//						couponsType:couponsType
					},
					timeout:10000,
					success:function(res){	
						if(res.errMsg == "AES加密解密失败"){
	//						if(!aesFail){
	//							$.ajax({
	//								type:"post",
	//								url:wpCommon.Url+'/wpwl/getKey',
	//								success:function(datas){
	//									key = datas.data;
	//									localStorage.setItem('key',datas.data)
	//									getData(key);
	//								}
	//							})
	//							aesFail=true;
	//						}
						}else if(res.success==false){
							$("#box").hide();
							$(".loadEffect").hide().siblings(".middle").show();
							$(".middle img").attr('src',"images/error_else.png");
							$(".middle p").html("出错了，请稍后再试");
							$(".top div").html("异常页面");
						}else{
							try{															
								if(res.success){
									var cou=res.data.coupons;
									laytpl(layHTML).render(cou,function(html){
										obj.append(html);
										resetCss();
									})
									var arr=[];
									for(var i=0;i<cou.length;i++){
										//倒计时函数只到天为止 传入结束时间
										function countDownDay(endDate){
											var startTime=new Date().getTime();
											var endDateArray=endDate.split('.');
											var end=new Date();
											end.setFullYear(endDateArray[0],endDateArray[1]-1,endDateArray[2]);
											var endTime=end.getTime();		
											var countTime=endTime-startTime;
											var day=Math.floor(countTime/(60*60*1000*24));
											return day;
										}
										var endDate=cou[i].activityEndTime;
										var day=countDownDay(endDate);
										$(".number").eq(i).html(day)
										//获取当前时间
										var date = new Date();     
									    var year = date.getFullYear();  
									    var month = date.getMonth()+1;//js从0开始取   
									    var data = date.getDate();
									    var times = year+"."+zero(month)+"."+zero(data);
									    var timess=Number(times.replace(".","").replace(".",""));
									    //结束时间
									    var endTime=Number(cou[i].activityEndTime.replace(".","").replace(".",""));
									   	function zero(num){
											if(num > 9){
												return num;
											}else{
												return '0'+num;
											}			
										}
										if(timess>endTime){
											arr.push(i);//把第几个失效的放到arr中
										}
									}
									$(".loading").hide();
									if(pageIndex[type]==Math.ceil(res.data.total/pageSize)){
										obj.addClass('complete');
									}
									pageIndex[type]+=1;
									complete=true;
									//失效的第几个隐藏
									var ele=$(".discountBox");
									for(var j=0;j<arr.length;j++){
										ele.eq(arr[j]).hide()
									}	
								}
							}catch(e){
								$(".loadEffect").hide().siblings(".middle").show();
								$(".middle img").attr('src',"images/error_else.png");
								$(".middle p").html("出错了，请稍后再试");
								$(".top div").html("异常页面");
								$('.look').hide();
							}
//						WPBridge.callMethod("JsInvokeNative", "wpShowWebView", {},
//					    function() {});
//					    WPBridge.callMethod("JsInvokeNative", "wpDismissLoadingDialog", {},
//					    function() {});							
						}
					},
					error:function(jqXHR, textStatus, errorThrown){
	//				WPBridge.callMethod("JsInvokeNative", "wpShowWebView", {},
	//	            function() {});
	//	            WPBridge.callMethod("JsInvokeNative", "wpDismissLoadingDialog", {},
	//	            function() {});
	//	            WPBridge.callMethod("JsInvokeNative", "wpNetError", {url:wpCommon.Url+"/h5/brand.html"},
	//	            function() {});						
						if(textStatus=="timeout"){
							$("#box").hide();
							$(".loadEffect").hide().siblings(".middle").show();
							$(".top div").html("网络异常");
							$('.look').hide();
						}
					}
				})
//			})
		}
	}
	//获取类型
	function getType(name){
		var type='';
		switch(name){
			case 'discountContent':
				type='disCountContent';
				break;
			case 'undiscountContent':
				type='undisCountContent';
				break;
		}
		return type;
	}
	getData('disCountContent');
	$(window).on('scroll',function(){
		var scrollTop=$(this).scrollTop();
		clearTimeout(scrollEndTimer);
		scrollEndTimer=setTimeout(function(){
			var scroll=scrollTop+$(window).height();
			var wh=$('.dis_content.current').height()+$('.dis_content.current').offset().top;
			if(scroll>(wh-10)){
				$('.dis_content').each(function(){
					var $t=$(this);
					if($t.hasClass('current')){
						if(!$t.hasClass('complete')){
							$(".loadEffect").css({
								top:$(".loadEffect").offset().top+scrollTop
							})
							$(".loading").show().siblings(".middle").hide();
							var id=$t.attr('id');//获取的是当前优惠券还是失效的优惠券
							var type=getType(id);//获取的是当前优惠券还是失效的优惠券
							getData(type);//调用函数方法,获取数据
						}
						return false; 
					}
				})
			}
		},300)
	})
	function changeContent($t){
		var obj=$t.attr('content');
		var $obj=$('#'+obj);
		$('.dis_content.current').removeClass('current');
		$obj.addClass('current');	
		if(!$obj.html().trim()){
			var type=getType(obj);
			getData(type);
		}
		//点击查看更多显示失效的内容
		$('.look .more').attr('content','undiscountContent');
		$(window).scrollTop(0);
	}
	//重新加载
	$("#wpReload").click(function(){
		getData(key);
	})
	//查看更多
	$('.look .more').on('click',function(){
		var $t=$(this);
		$('.look').hide();
		changeContent($t);
	})
	//后退
	$('#back').on('click',function(){
		if($('.look:visible').length){
			//调用app  WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
		}else{
			$("#discountContent").addClass('current');
			$("#undiscountContent").removeClass('current');
			setTimeout(function(){
				$(".look").show();
			},100)
			
			$(window).scrollTop(0);
			window.location.reload();
		}
	})
	//进入优惠详情页
	$("#discountContent").on("click",".discountBox",function(){
		var coupId=$(this).attr("couponId");
//		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
//	        eventId:"h5_e079",
//	        otherId:""
//	   	},
//	    function() {});
		window.location.href="discountDetail.html?couponId"+coupId;
	})
})
