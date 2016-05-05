$(document).ready(function() {

  $("#idMenu").accordion({collapsible:true, active:false});

  $("#idBoxToDrag").draggable().resizable();

  $(".rshButton")
    .hover( function() {
              $(this).fadeTo("fast", 1.0); },
            function() {
              $(this).fadeTo("fast", 0.5); }
    );

  $("ol").selectable();
  //$("ol").sortable(); // alternative, selectable and sortable seem exclude e o

  $("input")
    .focus(function() {
      $(this)
        .css('outline-style', 'solid')
        .css('outline-color', '#FF0000');
    });

  $("#idBtnTestApi")
    .click(function() {
      $.ajax({
        method:"GET",
        url:"/api/test"
      })
      .done(function(msg) {
        console.log("done", msg);
        var $list = msg.reduce( function(pv,cv) {
          return pv.append($("<li>").addClass("item").html(cv.name));
        }, $("#idList"));
      })
      .fail(function(jqXHR, textStatus) {
        console.log("fail", jqXHR);
      });
    });

 $(".pull-me")
   .click(function() {
     $(".panel").slideToggle("slow");
   });

 $("#idBtnAdd")
   .click( function() {
      var toAdd = $("input[name=checkListItem]").val();
      var $item = $("<li>").addClass("item").html(toAdd);
      $("#idList").append($item);
   });
});
