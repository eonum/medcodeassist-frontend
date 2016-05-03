$(document).ready(function() {
  var selectedCodes = {};

  var ulSelector = $("ul");
  ulSelector.on("click", ".codeItem", function() {
      var id = this.id;
      var idSelector = $("#"+id);
      var categoryList = this.parentNode.id;
      if (categoryList == "mainDiagnosesList" && $("#" + categoryList + "Mask").is(':has(li)')) {
          alert("Nur eine Hauptdiagnose ist erlaubt");
          return;
      }
      // first add buttons and change class
      var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
      var doneButton = "<button class='zbutton doneButton' type='button'>Done</button>";
      idSelector.append(editButton);
      idSelector.append(doneButton);
      idSelector.toggleClass("codeItem");
      idSelector.toggleClass("codeMaskItem");
      // then add the code to the codemask lists
      selectedCodes[id] = suggestedCodes[id];
      selectedCodes[id].categoryList = categoryList;
      $("#" + categoryList + "Mask, #allListMask").append(this);
  });

  ulSelector.on("click", ".codeMaskItem div", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      var idSelector = $("#"+id);
      // add the code first to the appropriate list
      var categoryList = selectedCodes[id].categoryList;
      delete selectedCodes[id];
      $("#" + categoryList).prepend(thisLi);
      // remove it from all tabs in codeMask
      $(".codeMaskLists li").remove("#"+id);
      // finally change class and remove buttons
      idSelector.toggleClass("codeMaskItem");
      idSelector.toggleClass("codeItem");
      $("#"+id+" button").remove();
  });

  ulSelector.on("click", "button.editButton", function() {
    var id = this.parentNode.id;
    $("#"+id).removeClass("codeMaskItem");
    $("#"+id+" .text_field").attr("contenteditable", "true");
    $("#"+id+" .doneButton").toggle();
    $("#"+id+" .editButton").toggle();
    $("#"+id+" div").toggleClass("editing");
  });

  ulSelector.on("click", "button.doneButton", function() {
    var id = this.parentNode.id;
    $("#"+id+" .text_field").attr("contenteditable", "false");
    $("#"+id+" .doneButton").toggle();
    $("#"+id+" .editButton").toggle();
    $("#"+id+" div").toggleClass("editing");
     setTimeout(function() {
       $("#"+id).toggleClass("codeMaskItem");
      }, 100);
  });


  $("#analyse").click(function() {
      var plainText = $("#textArea").text();
      $.ajax({
          url: "/application/analyse",
          type: "post",
          data: { text_field: plainText, selectedCodes: selectedCodes }
      });
  });

  $("#textArea, #synonymsList").on("click", ".showWordDetails", function() {
      var word = this.text;
      $.ajax({
          url: "/application/show_word_details",
          type: "post",
          data: { word: word }
      });
  });

  var key = 0;
  $("#addCodeButton").click(function() {
      key = key+1;
      var id = "newCode"+key;
      var newLiElement = "<li class='list-group-item newCode' id='"+id+"'></li>";
      $("#allListMask").append(newLiElement); // codeMaskItem
      var divText = "<div class='text_field editing' contenteditable='true'>anorexia</div>";
      $("#"+id).append(divText);
      var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'/><ul class='dropdown-menu'></ul></div>";
      $("#"+id).append(divDropdown);
      var doneButton = "<button class='zbutton doneButton' type='button'>Done</button>";
      $("#"+id).append(doneButton);
      var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
      $("#"+id).append(editButton);
      $("#"+id+" .editButton").toggle();
      $("#"+id+" .doneButton").toggle();
  });

  $("ul").on("keyup", "li div.editing", function() {
      var id = this.parentNode.id;
      interactiveProposals(id);
  });

  function interactiveProposals(id) {
      var searchText = $("#"+id+" div.text_field").text();
      console.log(searchText);
      if(searchText.length >= 3)
      {
          $.ajax({
              url: "/application/search",
              type: "post",
              data: { search_text: searchText, li_id: id }
          });
      }
  };

  $("ul").on("click", ".newCode button.doneButton", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      $("#"+id).toggleClass("newCode");
      $("#"+id+" div.dropdown").remove();
  });
});