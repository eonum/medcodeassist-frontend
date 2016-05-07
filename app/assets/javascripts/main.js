$(document).ready(function() {
  var selectedMainCodes = {};
  var selectedSideCodes = {};
  var selectedProcedureCodes = {};
  var selectedCodes = [selectedMainCodes, selectedSideCodes, selectedProcedureCodes];

  function getCategoryFromId (categoryId) {
      switch(categoryId) {
          case 0:
              return "mainDiagnoses";
              break;
          case 1:
              return "sideDiagnoses";
              break;
          case 2:
              return "procedures";
              break;
      }
  }

  function addSelectedCode(categoryId, id){
          selectedCodes[categoryId][id] = suggestedCodes[categoryId][id];
  }

  function deleteSelectedCode(categoryId, id){
      if(categoryId == 0){
          delete selectedMainCodes[id];
      }
      else if(categoryId == 1){
          delete selectedSideCodes[id];
      }
      else if(categoryId == 2){
          delete selectedProcedureCodes[id];
      }
  }

  var ulSelector = $("ul");
  ulSelector.on("click", ".codeItem", function() {
      var id = this.id;
      var idSelector = $("#"+id);
      var categoryId = $(this).attr("data-categoryId");
      if (categoryId == 0 && !jQuery.isEmptyObject(selectedMainCodes)) {
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
      addSelectedCode(categoryId, id);
      $("#allListMask").append(this);
  });

  ulSelector.on("click", ".codeMaskItem div", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      var idSelector = $("#"+id);
      // add the code first to the appropriate list
      var categoryId = parseInt($(thisLi).attr("data-categoryId"));
      deleteSelectedCode(categoryId, id);
      var category = getCategoryFromId(categoryId);;
      console.log("catId: "+ categoryId);
      console.log("cat: "+ category);
      $("#" + category +"List").prepend(thisLi);
      // remove it from all tabs in codeMask
      $(".allListMask li").remove("#"+id);
      // finally change class and remove buttons
      idSelector.toggleClass("codeMaskItem");
      idSelector.toggleClass("codeItem");
      $("#"+id+" button").remove();
  });

  ulSelector.on("click", "button.editButton", function() {
    var id = this.parentNode.id;
    $("#"+id).removeClass("codeMaskItem");
    $("#"+id+" .text_field").attr("contenteditable", "true");
    var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div>";
    $("#"+id).append(divDropdown);
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
          data: { text_field: plainText, selected_main_codes: selectedMainCodes, selected_side_codes: selectedSideCodes, selected_procedure_codes: selectedProcedureCodes}
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
      var divText = "<div class='text_field editing' contenteditable='true'></div>";
      $("#"+id).append(divText);
      var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'/><ul class='dropdown-menu'></ul></div>";
      $("#"+id).append(divDropdown);
      var doneButton = "<button class='zbutton doneButton' type='button'>Add</button>";
      $("#"+id).append(doneButton);
      var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
      $("#"+id).append(editButton);
      $("#"+id+" .editButton").toggle();
      $("#"+id+" .doneButton").toggle();
      $(this).toggle();
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
      $("#addCodeButton").toggle();
  });

  $('#filter').keyup(function () {
        $('.searchable tr').hide();
        $('.searchable tr').filter(function () {
            return rex.test($(this).text());
        }).show();
  });

});