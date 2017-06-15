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
	var scrollEndTimer=null;
	var page={
		disActContent:1,
		disCountContent:1,
		unActContent:1,
		undisCountContent:1
	}
	var pageSize=6;
	var complete=true;
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
			layHTML:''
		}
		switch(type){
			case 'disActContent':
				typeData={
					url:'../JSON/ActContent.json',
					obj:$('#dis_act_content'),
					layHTML:$('#rebate_activity').html()
				}
				break;
			case 'disCountContent':
				typeData={
					url:'../JSON/CountContent.json',
					obj:$('#discountContent'),
					layHTML:$('#rebate_vouchers').html()
				}
				break;
			case 'undisCountContent':
				typeData={
					url:'../JSON/undisCountContent.json',
					obj:$('#undiscountContent'),
					layHTML:$('#rebate_vouchers').html()
				}
				break;
		}
		return typeData
	}
	//获取数据
	function getData(type,flag){
		
		var typeData=getTypeData(type);
		var url=typeData['url'];
		if(flag){
			var url=typeData['url']+1;
		}
		var obj=typeData['obj'];
		var layHTML=typeData['layHTML'];
		if(complete){
			complete=false;
			$.ajax({
				url:url,
				type:'get',
				data:{
					page:page[type],
					pageSize:pageSize
				},
				timeout:10000,
				success:function(res){
					ajaxComplete(res,function(){
						if(!flag){
							getData(type,true);
						}
					},function(){
						$(".loading").hide();
						if(page[type]==Math.ceil(res.total/pageSize)){
							obj.addClass('complete');
						}
						page[type]+=1;
						complete=true;
						laytpl(layHTML).render(res.data,function(html){
							obj.append(html);
							resetCss();
							imgError();
						})
					})
					complete=true;
				},
				error:function(jqXHR, textStatus, errorThrown){
					ajaxError();
				}
			})
		}
	}
	
	getData('disActContent');
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
//							$(".loadEffect").css({
//								top:$(".loadEffect").offset().top+scrollTop
//							})
							$(".loading").show().siblings(".middle").hide();
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
	//切换活动和返利
	function changeContent($t){
		var obj=$t.attr('content');
		var $obj=$('#'+obj);
		$('.dis_content.current').removeClass('current');
		$obj.addClass('current');
		if(!$obj.html().trim()){
			var type=getType(obj);
			getData(type);
		}
		if(obj=='dis_act_content'){
			$('.look').addClass('unshow')
		}else if(obj=='discountContent'){
			$('.look').removeClass('unshow')
		}
		$(window).scrollTop(0);
	}
	$('.act_title div').on('click',function(){
		var $t=$(this);
		if(!$t.hasClass('current')){
			$('.act_title .current').removeClass('current')
			$t.addClass('current');
			changeContent($t);
			
		}
	})
	//查看更多
	$('.look .more').on('click',function(){
		var $t=$(this);
		$('.look').addClass('unshow');
		$('.act_title').hide();
		changeContent($t);
		$('.top div').html('失效返利')
	})
	//后退
	$('#back').on('click',function(){
		if($('.look:visible').length){
			//调用app
		}else{
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
		if($t.hasClass('activity')){
			window.location.href='eventDetails.html?pid='+$t.attr('pid');
		}else{
			//调用native的toast接口
			if($t.hasClass('act_timeout')){
				alert('该活动已过期')
			}else{
				alert('该活动已取消')
			}
		}
	})
	//跳转详细返利页
	$('body').on('click','.discountBox',function(){
		var $t=$(this);
//		window.location.href='/shareRebate.html?pid='+$t.attr('pid');
//		if(!$t.hasClass('unactivity')){
//			
//		}else{
//			//调用native的toast接口
//			if($t.hasClass('act_timeout')){
//				alert('该活动已过期')
//			}else{
//				alert('该活动已取消')
//			}
//		}
	})
})