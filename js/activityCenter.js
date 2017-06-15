function resetCss(){
	var count=Math.ceil($('.discountBox').width()/19);
	$('.discountBox').each(function(){
		if(!$(this).hasClass('complete')){
			$(this).width(19*count);
			$(this).find('.intro').dotdotdot();
			$(this).addClass('complete');
		}
	})
}
$(function(){
	var orgUrl='http://192.168.199.14';
	var scrollEndTimer=null;
	var page={
		disActContent:1,
		disCountContent:1,
		unActContent:1,
		undisCountContent:1
	}
	var urlRequest=getUrlRequest();
	var pageSize=6;
	var complete=true;
	var key=null;
	var first=true;
	//获取加密
	function getKey(type,flag){
		$.ajax({
			url: orgUrl+'/wpwl/getKey',
			type: "post",
			success: function(res) {
				key = res.data;
				if(urlRequest['type']==1){
					type=type || 'disCountContent';
					
				}else{
					type=type || 'disActContent';
				}
				if(first){
					if(urlRequest['type']==1){
						$('.act_title .current').removeClass('current');
						$('.act_title div').eq(1).addClass('current');
						$('.look').removeClass('unshow');
						$('#discountContent').addClass('current');
						$('.dis_act_content').removeClass('current')
					}
				}
				getActivityData(type,flag)
			}
		})
	}
	getKey();
	//加密函数
	//data为需要加密的数组
	function DoEncrypt(data,fn){
		WPBridge.callMethod("JsInvokeNative","wpEncrypt", {key: key,params:data},function(msg){
			fn && fn(msg)
		})
	}
	//获取类型
	function getType(name){
		var type='';
		switch(name){
			case 'dis_act_content':
				type='disActContent';
				break;
			case 'discountContent':
				type='disCountContent';
				break;
			case 'undiscountContent':
				type='undisCountContent';
				break;
		}
		return type;
	}
	//设置对应数据
	function getTypeData(type){
		var typeData={
			url:'',
			obj:'',
			layHTML:'',
			rebatesType:0
		}
		switch(type){
			case 'disActContent':
				typeData={
					url:'/wpwl/activity/getSuspectActivityListByPage',
					obj:$('#dis_act_content'),
					layHTML:$('#rebate_activity').html(),
					rebatesType:''
				}
				break;
			case 'disCountContent':
				typeData={
					url:'/wpwl/activityDiscount/listRebateByPage',
					obj:$('#discountContent'),
					layHTML:$('#rebate_vouchers').html(),
					rebatesType:1
				}
				break;
			case 'undisCountContent':
				typeData={
					url:'/wpwl/activityDiscount/listRebateByPage',
					obj:$('#undiscountContent'),
					layHTML:$('#rebate_vouchers').html(),
					rebatesType:0
				}
				break;
		}
		return typeData
	}
	//获取数据
	var url='';
	var obj='';
	var layHTML='';
	function getActivityData(type,flag){
		var suspectId=urlRequest['suspectId'];
		var typeData=getTypeData(type);
		url=typeData['url'];
		if(flag){
			url=typeData['url'];
		}
		obj=typeData['obj'];
		layHTML=typeData['layHTML'];
		if(complete){
			complete=false;
			DoEncrypt([suspectId,page[type],pageSize,typeData['rebatesType']],function(msg){
				getData(type,msg,flag)
			})
		}
	}
	function setErrorText(type){
		var text='';
		if(type=='disActContent'){
			text="您未参加过活动，您可以：返回“首页”点击“附近门店”查找并参加活动";
		}else{
			text="您未获取返利券";
		}
		$('.err_text').html(text);
		$('.err_text').show();
	}
	function getData(type,res,flag){
		var result=res.data.result;
		var dt={
			suspectId:result[0],
			pageIndex:result[1],
			pageSize:result[2]
		};
		if(type!=='disActContent'){
			dt['rebatesType']=result[3]
		} 
		$.ajax({
			url:orgUrl+url,
			type:'post',
			data:dt,
			timeout:10000,
			success:function(res){
				ajaxComplete(res,function(){
					if(!flag){
						getKey(type,true);
					}
				},function(){
					$(".loading").hide();
					var dt=res.data;
					var data=null;
					$(".content").show();
					$('.err_text').hide();
					$('#share').show()
					if(page[type]==Math.ceil(dt.total/pageSize)){
						obj.addClass('complete');
					}
					page[type]+=1;
					complete=true;

					if(dt['list']){
						data=dt['list'];
						for(var i=0;i<data.length;i++){
							data[i].gmtStart=data[i].gmtStart.replace(/-/g,'.');
							data[i].gmtEnd=data[i].gmtEnd.replace(/-/g,'.');
						}
					}else{
						data=dt['rebates'];
						for(var i=0;i<data.length;i++){
							data[i].couponUserPhone=encryptyPhone(data[i].couponUserPhone);
							data[i].receiveStartTime=data[i].receiveStartTime.replace(/-/g,'.');
							data[i].receiveEndTime=data[i].receiveEndTime.replace(/-/g,'.');
							if(type=='disCountContent'){
								data[i]['status']=2;
							}
						}
					}
					
					if(!data.length){
						setErrorText(type)
					}else{
						laytpl(layHTML).render(data,function(html){
							obj.append(html);
							resetCss();
							imgError();
						})
					}
				},function(){
					setErrorText(type)
				})
				complete=true;
				//展示webview
				if(first){
					wpCommon.viewShow();
					first=false
				}
				
			},
			error:function(jqXHR, textStatus, errorThrown){
				ajaxError();
			}
		})
	}
	$(window).on('scroll',function(){
		var scrollTop=$(this).scrollTop();
		clearTimeout(scrollEndTimer);
		scrollEndTimer=setTimeout(function(){
			var scroll=scrollTop+$(window).height();
			var wh=$('.dis_content.current').height()+$('.dis_content.current').offset().top;
			if(scroll>(wh-200)){
				$('.dis_content').each(function(){
					var $t=$(this);
					if($t.hasClass('current')){
						if(!$t.hasClass('complete')){
							$(".loading").show().siblings(".middle").hide();
							var id=$t.attr('id');
							var type=getType(id);
							getActivityData(type);
						}
						return false; 
					}
				})
			}
		},300)
	})
	//切换活动和返利
	function changeContent($t){
		var obj=$t.attr('content');
		var $obj=$('#'+obj);
		$('.dis_content.current').removeClass('current');
		$('.err_text').hide();
		$obj.addClass('current');
		if(!$obj.html().trim()){
			var type=getType(obj);
			getActivityData(type);
		}
		if(obj=='dis_act_content'){
			$('.look').addClass('unshow')
		}else if(obj=='discountContent'){
			$('.look').removeClass('unshow')
		}
		$(window).scrollTop(0);
//		alert($('.more').width());
	}
	$('.act_title div').on('click',function(){
		var $t=$(this);
		if(!$t.hasClass('current')){
			$('.act_title .current').removeClass('current')
			$t.addClass('current');
			changeContent($t);
		}
		if($t.attr('content')=='discountContent'){
			//点击我的返利打点
			WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e083"},function(){})
		}
	})
	//查看更多

	$('.more').click(function(){
		var $t=$(this);
		$('.look').addClass('unshow');
		$('.act_title').hide();
		changeContent($t);
		$('.top div').html('失效返利')
	})
//	$('.more').click()
	//后退
	var backTimer=null;
	$('#back').on('click',function(){
		clearInterval(backTimer)
		if($('#undiscountContent:visible').length){
			backTimer=setInterval(function(){
				if(complete){
					clearInterval(backTimer)
					$('.dis_content').each(function(){
						var $t=$(this);
						if($t.hasClass('current')){
							var id=$t.attr('id');
							$('.look').removeClass('unshow');
							$('.act_title').show();
							$('.top div').html('活动中心')
							changeContent($('.act_title .current'));
							return false; 
						}
					})
				}
			},30)
		}else{
			//调用app
			WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
		}
	})
	//重新加载
	$("#wpReload").click(function(){
		complete=true;
		page={
			disActContent:1,
			disCountContent:1,
			unActContent:1,
			undisCountContent:1
		}
		$('.dis_content.current').removeClass('current')
		$('#disActContent').html('').addClass('current').removeClass('complete');
		$('.look .more').attr('content','un_act_content');
		getData('disActContent');
	})
	//跳转活动详情页
	$('body').on('click','.activity_list',function(){
		var $t=$(this);
		var uid=urlRequest['suspectId'];
		var aid=$t.attr('aid');
		WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e080",otherId:aid},function(){
			
		})
		window.location.href='eventDetails.html?pageId=H5_C013&otherId='+aid+'&posId='+$t.attr('pid')+'&activityId='+aid+'&suspectId='+uid;
	})
//	$('body').on('click',function(e){
//		alert(e.target.className);
//	})
//	$('.location a').on('click',function(){
//		var $t=$(this);
//		window.location.href=$t.attr('to');
//	})
	//跳转详细返利页
	$('body').on('click','.discountBox',function(){
		$(".icons").hide();
		var $t=$(this);
		var aid=$t.attr('aid');
		WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e081",otherId:aid},function(){
			
		})
		window.location.href='discountDetail.html?pageId=H5_C016&rebateId='+$t.attr('pid');
	})
})