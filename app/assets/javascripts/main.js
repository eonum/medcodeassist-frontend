$(document).ready(function() {
  var selectedMainCodes = {};
    selectedMainCodes['388410'] = {code: '38.84.10', short_code: '388410', text_de: 'Sonstiger chirurgischer Verschluss der thorakalen Aorta'};
  var selectedSideCodes = {};
  var selectedProcedureCodes = {};
  var selectedCodes = {mainDiagnoses: selectedMainCodes, sideDiagnoses: selectedSideCodes, procedures: selectedProcedureCodes};

  var ulSelector = $("ul");
  ulSelector.on("click", ".codeItem", function() {
      var id = this.id;
      var idSelector = $("#"+id);
      var category = $(this).attr("data-category");
      if (category == "mainDiagnoses" && !jQuery.isEmptyObject(selectedMainCodes)) {
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
      selectedCodes[category][id] = suggestedCodes[category][id];
      $("#allListMask").append(this);
  });

  ulSelector.on("click", ".codeMaskItem div", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      var idSelector = $("#"+id);
      // add the code first to the appropriate list
      var category = $(thisLi).attr("data-category");
      delete selectedCodes[category][id];
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
          data: { text_field: plainText, selected_codes: selectedCodes}//: selected_main_codes: selectedMainCodes, selected_side_codes: selectedSideCodes, selected_procedure_codes: selectedProcedureCodes}
      });
  });

  $("#textArea, #synonymsList").on("click", ".showWordDetails", function() {
      var word = this.text;
      $.ajax({
          url: "/application/show_word_details",
          type: "post",
          data: { word: word, selected_codes: selectedCodes }
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


  function deleteIncompleteCodes(){
      $('#allListMask li.newCode').remove();
  }

  $("#maskTabs li a.filterTab").click(function () {
        var category = $(this).attr("data-category");
        console.log('tab category: '+category);
        $('#allListMask li').hide();
        $('#allListMask li').filter(function () {
            liCategory = $(this).attr("data-category");
            console.log("licat: "+liCategory);
            return  liCategory == category;
        }).show();
        $('#addCodeButton').hide();
        $('.editButton').show();
        deleteIncompleteCodes();
  });

  $("#maskTabs li a#allMaskLink").click(function () {
      $('#allListMask li').show();
      $('#addCodeButton').hide();
      $('.editButton').hide();
      $('#allListMask li.mainNewCode').hide();
      deleteIncompleteCodes();
  });

  $("#maskTabs li a.withAddButton").click(function () {
      $('#addCodeButton').show();
      $('#allListMask li.mainNewCode').hide();
      deleteIncompleteCodes();
  });


});