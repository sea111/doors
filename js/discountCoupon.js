$(function(){
	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {},function() {});	
	window.aesFail = "";
	//分割原生中？后的id
	var urlRequest=getUrlRequest();
	//倒计时函数只到天为止 传入结束时间
	function countDownDay(endDate){
		var startTime=new Date().getTime();
		var type='day';
		var endDateArray=endDate.split('.');
		for(var i=0;i<endDateArray.length;i++){
			endDateArray[i]=endDateArray[i]*1;
		}
		var end=new Date();
		end.setFullYear(endDateArray[0],endDateArray[1]-1,endDateArray[2]+1);
		end.setHours(0,0,0);
		var endTime=end.getTime();
		var countTime=endTime-startTime;
		var day=Math.floor(countTime/(60*60*1000*24));
		if(day===0){
			day=Math.floor(countTime/(60*60*1000));
			type='hour';
		}
		return {
			time:day,
			type:type
		}
	}
	function resetCss(){
		var count=Math.ceil($('.discountBox').width()/19);
		$('.discountBox').each(function(){
			if(!$(this).hasClass('complete')){
				$(this).width(19*count);
				$(this).addClass('complete');
			}
		})
	}	
	//加密
	var key='';
	function getKey(type,flag){
		$.ajax({
			type:"post",
			url:wpCommon.Url+"/wpwl/getKey",
			async:true,
			success:function(datas){
				key=datas.data;
				localStorage.setItem('key',datas.data)
				type=type || 'disCountContent'
				getData(type,key)
			}
		});
	}
	getKey();	
	var scrollEndTimer=null;
	var pageIndex={
		disCountContent:1,
		undisCountContent:1
	}
	var pageSize=6;
	var complete=true;
	//获取数据
	function getData(type,key){
		var url=wpCommon.Url+'/wpwl/activityDiscount/listCouponByPage';
		var obj='';
		var layHTML=$('#discountCouponTpl').html();
		var couponsType="";
		switch(type){
			case 'disCountContent':
				obj=$('#discountContent');
				couponsType=1;
				break;
			case 'undisCountContent':
				obj=$('#undiscountContent');
				couponsType=0;
				break;
		}
		if(complete){
			complete=false;
			var suspectId=urlRequest['suspectId'];
			var pageIn=pageIndex[type];
			WPBridge.callMethod("JsInvokeNative","wpEncrypt",{
				key:key,
				params:[suspectId,pageIn,pageSize,couponsType]
			},function(msg){
				var codeValue=msg.data.result;
				$.ajax({
					url:url,
					type:'post',
					data:{
						suspectId:codeValue[0],
						pageIndex:codeValue[1],
						pageSize:codeValue[2],
						couponsType:codeValue[3]
					},
					timeout:10000,
					success:function(res){	
						if(res.errMsg == "AES加密解密失败"){
							if(!aesFail){
								$.ajax({
									type:"post",
									url:wpCommon.Url+'/wpwl/getKey',
									success:function(datas){
										key = datas.data;
										localStorage.setItem('key',datas.data)
										getData(type,key);
									}
								})
								aesFail=true;
							}
						}else if(res.success==false){
							$("#box").hide();
							$(".loading").show();
							$(".middle img").attr('src',"images/discountCoupon.png");
							$(".middle p").html("您未领取优惠券");
							$(".top div").html("优惠券");
							wpCommon.viewShow();
						}else{	
							try{															
								if(res.success){
									var cou=res.data.coupons;
									//优惠券类型判断
									for(var i=0;i<cou.length;i++){	
										if(type=="disCountContent"){
											cou[i]['consume']=2;
										}	
										cou[i].activityStartTime=cou[i].activityStartTime.replace(/-/g,'.');
										cou[i].activityEndTime=cou[i].activityEndTime.replace(/-/g,'.');				
									}
									if(pageIndex[type]==Math.ceil(res.data.total/pageSize)){
										obj.addClass('complete');
									}
									pageIndex[type]+=1;
									complete=true;
									//无优惠券数据时
									if(!cou.length){
										$("#box").hide();
										$(".loading").show();
										$(".middle img").attr('src',"images/discountCoupon.png");
										$(".middle p").html("您未领取优惠券");
										$(".top div").html("优惠券");
										wpCommon.viewShow();
									}else{
										laytpl(layHTML).render(cou,function(html){
											obj.append(html);
											resetCss();			
											//过期时间
											if(type=="disCountContent"){
												for(var i=0;i<cou.length;i++){
													var endDate=cou[i].activityEndTime;
													var fdata=countDownDay(endDate);
													if(fdata.type==='day'){
														$(".number").eq(i).html(+fdata.time+'天');
													}else if(fdata.type==='hour'){
														$(".number").eq(i).html(+fdata.time+'小时');
													}
												}
											}	
										})										
									}	
								}
							}catch(e){
								$(".loading").show();
								$(".middle img").attr('src',"images/error_else.png");
								$(".middle p").html("出错了，请稍后再试");
								$(".top div").html("异常页面");
								$('.look').hide();
								$("#box").hide();
							}
							wpCommon.viewShow();
						}
						complete=true;
					},
					error:function(jqXHR, textStatus, errorThrown){
						if(textStatus=="timeout"){
							$("#box").hide();
							$(".loading").show();
							$(".top div").html("网络异常");
							$('.look').hide();
						}
						wpCommon.viewShow();										
					}
				})
			})
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
	//getData('disCountContent');
	//下拉加载
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
							//$(".loading").show().siblings(".middle").hide();
							//获取的是当前优惠券还是失效的优惠券
							var id=$t.attr('id');
							var type=getType(id);
							getData(type,key);
						}
						return false; 
					}
				})
			}
		},300)
	})
	//改变内容优惠券还是失效优惠券
	function changeContent($t){
		var obj=$t.attr('content');
		var $obj=$('#'+obj);
		$('.dis_content.current').removeClass('current');
		$obj.addClass('current');	
		if(!$obj.html().trim()){
			var type=getType(obj);
			getData(type,key);
		}
		//点击查看更多显示失效的内容
		$('.look .more').attr('content','undiscountContent');
		$(window).scrollTop(0);
	}
	//重新加载
	$("#wpReload").click(function(){
		getData(type,key);
		complete=true;
		pageIndex={
			disCountContent:1,
			undisCountContent:1
		}
		$('.dis_content.current').removeClass('current')
		$('#disActContent').html('').addClass('current').removeClass('complete');
		$('.look .more').attr('content','un_act_content');
		getData('disCountContent');
	})
	//查看更多
	var unrebate=false;
	$(".more").click(function(){
		var $t=$(this);
		$('.look').hide();
		changeContent($t);
		unrebate=true;
	})
	//后退	
	WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
		back:false
	}, function() {
		$("#back").click();
	})
	$('#back').on('click',function(){
		if(unrebate){
			unrebate=false;
			$("#discountContent").addClass('current');
			$("#undiscountContent").removeClass('current');
			$(".look").show();
			changeContent($('.current'));			
			$(window).scrollTop(0);
			$(".loading").hide();
			$("#box").show();
		}else{
			WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
		}
	})	
	//进入优惠详情页
	$("#discountContent").on("click",".discountBox",function(){
		$(this).find('.icons').hide();
		var coupId=$(this).attr("couponId");
		var activityId=$(this).attr("activityId");
		var couponName=$(this).attr("couponName").slice(0,-3);	
		localStorage.setItem("couponName",couponName)
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
	        eventId:"h5_e082",
	        otherId:activityId
	   	},"");
		window.location.href="discountDetail.html?pageId=H5_C019&otherId="+activityId+"&couponId="+coupId;
	})
	$("#undiscountContent").on("click",".unactivity",function(){
		var coupId=$(this).attr("couponId");
		var activityId=$(this).attr("activityId");
		var couponName=$(this).attr("couponName").slice(0,-3);	
		localStorage.setItem("couponName",couponName)
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
	        eventId:"h5_e082",
	        otherId:activityId
	   },"");
		window.location.href="discountDetail.html?pageId=H5_C019&otherId="+activityId+"&couponId="+coupId;
	})
})
