
var mystyle = "position: fixed; z-index: 9999; border: 2px solid rgb(253, 207, 80); border-top-left-radius: 10px; border-radius: 5px; margin: 0px; padding: 8px 20px; top: 10px; right: 10px; color: rgb(136, 136, 136); font-size: 12px; font-weight: bold; font-family: Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif; box-shadow: rgb(150, 150, 150) 2px -2px 3px; background-color: rgb(255, 255, 255);";
$bookmarked_modal_div = $("<div>", {id: "bookmarked_modal", style: mystyle});
$bookmarked_modal_div.html(folder_title);
$(document.body).append($bookmarked_modal_div);
// $bookmarked_modal_div.slideDown(1000);
$bookmarked_modal_div.slideDown(1000).delay(1000).fadeOut(500, function(){
  $(this).remove();
});