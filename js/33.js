$(function(){
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
	var scrollEndTimer=null;
	var pageIndex={
		disCountContent:1,
		undisCountContent:1
	}
	var pageSize=6;
	var complete=true;
	//无优惠券数据时
	/*function setErrorText(){
		var text='您未获取优惠券';
		$(".err_text").append("<img src='images/discountCoupon.png'/>")
		$('.err_text').html(text);
		$('.err_text').show();
	}*/
	//获取数据
	function getData(type,key){
		var url="";
		var obj='';
		var layHTML=$('#discountCouponTpl').html();
		var couponsType="";
		switch(type){
			case 'disCountContent':
				obj=$('#discountContent');
				url="JSON/CountContents.json";
				couponsType=1;
				break;
			case 'undisCountContent':
				obj=$('#undiscountContent');
				url="JSON/undisCountContents.json";
				couponsType=0;
				break;
		}
		if(complete){
			complete=false;
			var suspectId=urlRequest['suspectId'];
			var pageIn=pageIndex[type];
				$.ajax({
					url:url,
					type:'get',
					timeout:10000,
					success:function(res){	
						console.log(res)
						if(res.success==false){
							$(".loadEffect").hide().siblings(".middle").show();
							$(".middle img").attr('src',"images/discountCoupon.png");
							$(".middle p").html("您未获取优惠券");
							$(".top div").html("优惠券");
							$('.look').hide();
							$("#box").hide()
							//setErrorText();
						}else{	
							try{															
								if(res.success){
									var cou=res.data.coupons;
									//无优惠券数据时
									//$('.err_text').hide();
									//优惠券类型判断
									for(var i=0;i<cou.length;i++){	
										if(type=="disCountContent"){
											cou[i]['consume']=2;
										}
									}
									for(var j=0;j<cou.length;j++){
										cou[j].activityStartTime=cou[j].activityStartTime.replace(/-/g,'.');
										cou[j].activityEndTime=cou[j].activityEndTime.replace(/-/g,'.');
									}
									$(".loading").hide();
									if(pageIndex[type]==Math.ceil(res.data.total/pageSize)){
										obj.addClass('complete');
									}
									pageIndex[type]+=1;
									complete=true;
									//无优惠券数据时
//									if(!cou.length){
//										setErrorText();
//									}else{
										laytpl(layHTML).render(cou,function(html){
											obj.append(html);
											resetCss();
											//过期时间 返回时间不变 判断只显示有效的
											if(type=="disCountContent"){
												for(var i=0;i<cou.length;i++){
													var endDate=cou[i].activityEndTime;
													var fdata=countDownDay(endDate);
													console.log(fdata)
													if(fdata.type==='day'){
														$(".number").eq(i).html(+fdata.time+'天');
													}else if(data.type==='hour'){
														$(".number").eq(i).html(+fdata.time+'小时');
													}
												}
											}
											
										})	
									//}
								}
							}catch(e){
								$(".loadEffect").hide().siblings(".middle").show();
								$(".middle img").attr('src',"images/error_else.png");
								$(".middle p").html("出错了，请稍后再试");
								$(".top div").html("异常页面");
								$('.look').hide();
								$("#box").hide()
							}
						}
					},
					error:function(jqXHR, textStatus, errorThrown){
						if(textStatus=="timeout"){
							$("#box").hide();
							$(".loadEffect").hide().siblings(".middle").show();
							$(".top div").html("网络异常");
							$('.look').hide();
						}								
					}
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
	getData('disCountContent');
	//下拉加载
	$(window).on('scroll',function(){
		var scrollTop=$(this).scrollTop();
		clearTimeout(scrollEndTimer);
		scrollEndTimer=setTimeout(function(){
			var scroll=scrollTop+$(window).height();
			var wh=$('.dis_content.current').height()+$('.dis_content.current').offset().top;
			if(scroll>(wh-100)){
				$('.dis_content').each(function(){
					var $t=$(this);
					if($t.hasClass('current')){
						if(!$t.hasClass('complete')){
							$(".loadEffect").css({
								top:$(".loadEffect").offset().top+scrollTop
							})
							//$(".loading").show().siblings(".middle").hide();
							//获取的是当前优惠券还是失效的优惠券
							var id=$t.attr('id');
							var type=getType(id);
							getData(type);
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
			getData(type);
		}
		//点击查看更多显示失效的内容
		$('.look .more').attr('content','undiscountContent');
		$(window).scrollTop(0);
	}
	//重新加载
	$("#wpReload").click(function(){
		getData(type,key);
	})
	//查看更多
	$(".more").click(function(){
		var $t=$(this);
		$('.look').hide();
		changeContent($t);
	})
		

	//后退	
	$('#back').on('click',function(){
		if($('.look:visible').length){
			console.log($('.look:visible').length)
			//调用app  
			//WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
		}else{
			window.location.reload()
			$("#discountContent").addClass('current');
			$("#undiscountContent").removeClass('current');
			$(".look").show();
			changeContent($('.current'));
			$(window).scrollTop(0);
			
		}
	})
/*	$('.more').click(function(){
		var $t=$(this);
		$('.look').hide();
		changeContent($t);
		$('.top div').html('优惠券')
	})
	$('#back').on('click',function(){
		if($('#undiscountContent:visible').length){
			//console.log($('#undiscountContent:visible'))
			$('.dis_content').each(function(){
			//	console.log($('.dis_content'))
				var $t=$(this);
				if($t.hasClass('current')){
					var id=$t.attr('id');
					console.log(id)
					$(".look").hide();
					$('.top div').html('优惠券')
					changeContent($('.current'));
					return false; 
				}
			})
		}else{
			//调用app
			WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
		}
	})*/

	//进入优惠详情页
	$("#discountContent").on("click",".discountBox",function(){
		var coupId=$(this).attr("couponId");
		var activityId=$(this).attr("activityId");
		var couponName=$(this).attr("couponName").slice(0,-3);	
		localStorage.setItem("couponName",couponName)
		window.location.href="discountDetail.html?couponId="+coupId;
	})
	$("#undiscountContent").on("click",".unactivity",function(){
		var coupId=$(this).attr("couponId");
		var activityId=$(this).attr("activityId");
		var couponName=$(this).attr("couponName").slice(0,-3);	
		localStorage.setItem("couponName",couponName)
		window.location.href="discountDetail.html?couponId="+coupId;
	})
})
