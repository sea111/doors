//图片出错处理
function imgError(src){ //出错图片路径 若经特殊设置可不传
	$('img').on('error',function(){
		var $t=$(this);
		if(src){
			$t.attr('src',src)
		}else{
			$t.attr('src','../images/'+$t.attr('errType')+'_error.png');
		}
	})
}
//ajax完成处理 resetFn为返回解密失败触发的函数 fn为返回成功时触发的函数 res为后台返回的数据
function ajaxComplete(res,resetFn,fn){
	if(res.errMsg=='AES加密解密失败'){
		resetFn();
	}else if(!res.success){
		$(".loadEffect").hide().siblings(".middle").show().find('img').attr('src','images/notFound.png').siblings('p').html("活动异常<br />关联产品或活动已下架")
	}else{
		try{
			fn && fn();
		}catch(e){
			$(".loadEffect").hide().siblings(".middle").show();
			$(".middle img").attr('src',"../images/error_else.png");
			$(".middle p").html("出错了，请稍后再试");
		}
	}
}
//ajax出错处理
function ajaxError(jqXHR, textStatus, errorThrown){
	$(".content").hide();
	$(".loadEffect").hide().siblings(".middle").show()
}
