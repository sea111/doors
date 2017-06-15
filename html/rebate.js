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
			if(res.errMsg=="AES加密解密失败"){
				if(!flag){
					getData(true);
				}
			}else if(res.success==false){
				$(".loadEffect").hide().siblings(".middle").show().find('img').attr('src','images/notFound.png').siblings('p').html("活动异常<br />关联产品或活动已下架")
			}else{
				try{
					window.actData=res.data;
					$(".loading").hide();
					$("#act_time").html(actData.activityTime);
					$("#act_place").html(actData.activityAddress);
					$("#poster").attr('src',actData.activityPicUrl);
					$(".act_content").html(actData.activityContent);
					if(actData.brandName){
						document.setTitle(actData.brandName)
					}else if(actData.productName){
						document.setTitle(actData.productName);
					}
					$("#wrap").show();
					
				}catch(e){
					$(".loadEffect").hide().siblings(".middle").show();
					$(".middle img").attr('src',"images/error_else.png");
					$(".middle p").html("出错了，请稍后再试");
				}
				
			}
			
		},
		error:function(jqXHR, textStatus, errorThrown){
			$(".content").hide();
			$(".loadEffect").hide().siblings(".middle").show()
		}
	})
}
function getList(page,flag){
	page=page || 1;
	$.ajax({
		url:"JSON/list.json",
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
			if(res.errMsg=='AES加密解密失败'){
				if(!flag){
					getList(page,true);
				}
			}else if(!res.success){
				$(".loadEffect").hide().siblings(".middle").show().find('img').attr('src','images/notFound.png').siblings('p').html("活动异常<br />关联产品或活动已下架")
			}else{
				if(res.success){
					try{
						$(".loading").hide();
						var product_list_html=$('#product_list_html').html();
						laytpl(product_list_html).render(res.list,function(html){
							$('.product_list ul').append(html)
							$('.product_list img').on('error',function(){
								$(this).attr('src','images/default_error2.png');
							})
						})
						pageIndex++;
						console.log(pageIndex)
						total=Math.ceil(res.total/pageSize);
						console.log(total)
						complete=true;
					}catch(e){
						$(".loadEffect").hide().siblings(".middle").show();
						$(".middle img").attr('src',"images/error_else.png");
						$(".middle p").html("出错了，请稍后再试");
					}
				}
			}
		},
		error:function(jqXHR, textStatus, errorThrown){
			$(".content").hide();
			$(".loadEffect").hide().siblings(".middle").show()
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
		console.log(scroll)
		console.log(scrollTop)
		console.log($(window).height())
		var len=Math.ceil($('.product_item').length/2);
		console.log(len)
		var wh=$('#wrap').height()+$('.product_item').height()*len;
		console.log(wh)
		if(scroll>(wh-10)){
			console.log(wh-10)
			if(complete && pageIndex<=total){
				$(".loadEffect").css({
					top:$(".loadEffect").offset().top+scrollTop
				})
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