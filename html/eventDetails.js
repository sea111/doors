var urlRequest=getUrlRequest();
var pageIndex=1;
var pageSize=4;
var complete=true;
var total=0;
var scrollEndTimer=null
//ajax获取分享数据
function getData(flag){
	$.ajax({
		url:"JSON/data.json",
		data:{
			id:urlRequest.activityPushId,
			versionId:'27'
		},
		type:'get',
		timeout:10000,
		beforeSend:function(){
			$(".loadEffect").show().siblings(".middle").hide()
		},
		success:function(res){
			ajaxComplete(res,function(){
				if(!flag){
					getData(true);
				}
			},function(){
				var actData=res.data;
				$(".loading").hide();
				$("#act_time").html(actData.activityTime);
				$("#act_place").html(actData.activityAddress);
				$("#poster").attr('src',actData.activityPicUrl);
				$(".act_content").html(actData.activityContent);
				$('.top div').html(actData.brandName);
				$('.activity_rebate span').html(actData.activityRebate+'元');
				$('.activity_other_rebate span').html(actData.activityOtherRebate+'元');
				$("#wrap").show();
				imgError('images/default_error2.png');
			})
		},
		error:function(jqXHR, textStatus, errorThrown){
			ajaxError();
		}
	})
}
function getList(page,flag){
	page=page || 1;
	$.ajax({
		url:"JSON/lists.json",
		type:'get',
		timeout:10000,
		data:{
			id:urlRequest.activityPushId,
			versionId:'27',
			page:page,
			pageSize:pageSize
		},
		beforeSend:function(){
//			$(".loadEffect").show().siblings(".middle").hide()
		},
		success:function(res){
			ajaxComplete(res,function(){
				if(!flag){
					getList(page,true);
				}
			},function(){
				$(".loading").hide();
				var product_list_html=$('#product_list_html').html();
				laytpl(product_list_html).render(res.list,function(html){
					$('.product_list ul').append(html)
					$('.product_list img').on('error',function(){
						$(this).attr('src','images/default_error2.png');
					})
				})
				pageIndex++;
				total=Math.ceil(res.total/pageSize);
				imgError('images/default_error2.png');
			})
			complete=true;
		},
		error:function(jqXHR, textStatus, errorThrown){
			ajaxError();
		}
	})
}
getData();
getList(pageIndex)
//除去导航栏的高度
var wholeHei=document.documentElement.clientHeight-document.documentElement.clientWidth /7.5*0.88;
$('.loading').css('height',wholeHei+'px');
//重新加载
$("#wpReload").click(function(){
	complete=true;
	getData();
})
//跳转打点
$('body').on('click','.product_item',function(){
	//打点暂时不写
	window.location.href=$(this).attr('to');
})
//下拉加载

$(window).on('scroll',function(){
	var scrollTop=$(this).scrollTop();
	clearTimeout(scrollEndTimer);
	scrollEndTimer=setTimeout(function(){
		var scroll=scrollTop+$(window).height();
		var len=Math.ceil($('.product_item').length/2);
		var wh=$('#wrap').height()+$('.product_item').height()*len+$('.top').height();
		
		if(scroll>(wh-200)){
			if(complete && pageIndex<=total){
//				$(".loadEffect").css({
//					top:$(".loadEffect").offset().top+scrollTop
//				})
				$(".loading").show().siblings(".middle").hide()
				getList(pageIndex)
			}
		}
	},300)
})
//分享
$('.act_btn .share_btn').on('click',function(){
	//分享组件
})