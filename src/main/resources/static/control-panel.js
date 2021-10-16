$(document).ready(function() {
    $('.tab a:not(:first)').addClass('inactive');
    $('.tab-content').hide();
    $('.tab-content:first').show();

    $('.tab a').click(function(){
        var t = $(this).attr('id');
        if ($(this).hasClass('inactive')) { //this is the start of our condition
            $('.tab a').addClass('inactive');
            $(this).removeClass('inactive');

            $('.tab-content').hide();
            $('#'+ t + 'C').fadeIn('slow');
        }
    });
});
