OVERLAY_API_BASE_URL = 'http://localhost:8080/api';
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NjU4ODcwNTYsIm9wYXF1ZV91c2VyX2lkIjoiVTVmV1dhVkRyaFk1RFoxTExlVHVPIiwidXNlcl9pZCI6Ijc3MDgwNjUwIiwiY2hhbm5lbF9pZCI6IjU4OTU2NzUzIiwicm9sZSI6InZpZXdlciIsImlzX3VubGlua2VkIjpmYWxzZSwicHVic3ViX3Blcm1zIjp7Imxpc3RlbiI6WyJicm9hZGNhc3QiLCJ3aGlzcGVyLVU1ZldXYVZEcmhZNURaMUxMZVR1TyIsImdsb2JhbCJdfX0.MKB4ivOw1DRwIWqJ4PLDnVMIeAPpVrObCqHmhMgmpf8";

$(function () {
   // $('body').css('background-image', 'url(debug/bg.png)');

//   $(".message").righteousToggle(true).text('type !play to join the game lorem fucking ipsum');
    $('.resource').righteousToggle(true);
   	 $('.feeding').show(); $('.feeding .value').text('san hasdDSDose'); $('.income').hide();
   	$('.gas .value').numberChange(99999); $('.minerals-income .value').numberChange(9999, '+'); $('.gas-income .value').numberChange(9999, '+');;
   	$('.supply .value').text("200/200/1000");
   	$('.workers .value').text("20");

   //	$('.resource .value').text('0').prop('Counter', '0');
   //	$('.minerals .value').numberChange(99999);
   //
   //	var data = {"ingame": null, "globalMessage":"asd"};
   //			$('.resource').righteousToggle(data.inGame);
   //			if (data.inGame) {
   //
   //				$('.gas .value').numberChange(data.inGame.gas);
   //				$('.minerals .value').numberChange(data.inGame.minerals);
   //                $('.supply .value').text(data.inGame.supply);
   //
   //                $('.feeding').righteousToggle(data.inGame.feeding);
   //                $('.resource.income').righteousToggle(!data.inGame.feeding);
   //
   //                $('.feeding .value').text(data.inGame.feeding);
   //                $('.gas-income .value').numberChange(data.inGame.gasIncome, '+');
   //                $('.minerals-income .value').numberChange(data.inGame.mineralsIncome, '+');
   //            }
   //            else
   //            {
   //                $('.feeding').righteousToggle(false);
   //            }
   //
   //            $('.message').text(data.globalMessage);
});
