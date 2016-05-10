$(document).ready(function() {
  var selectedMainCodes = {};
    //selectedMainCodes['388420'] = {code: '38.84.20', short_code: '388420', text_de: 'Sonstiger chirurgischer Verschluss der Aorta abdominalis'};
  var selectedSideCodes = {};
  var selectedProcedureCodes = {};
    //selectedProcedureCodes['388511'] = {code: '38.85.11', short_code: '388511', text_de: 'Sonstiger chirurgischer Verschluss der A. subclavia'};
  var selectedCodes = {mainDiagnoses: selectedMainCodes, sideDiagnoses: selectedSideCodes, procedures: selectedProcedureCodes};
  var tempSelectedCodes = {mainDiagnoses: {}, sideDiagnoses: {}, procedures: {}};

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
      idSelector.removeClass("codeItem");
      idSelector.addClass("codeMaskItem");
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
      idSelector.removeClass("codeMaskItem");
      idSelector.addClass("codeItem");
      $("#"+id+" button").remove();
  });

  ulSelector.on("click", "button.editButton", function() {
    var id = this.parentNode.id;
    $("#"+id).removeClass("codeMaskItem");
    $("#"+id+" .text_field").attr("contenteditable", "true");
    var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div>";
    $("#"+id).append(divDropdown);
    $("#"+id+" .doneButton").show();
    $("#"+id+" .editButton").hide();
    $("#"+id+" div").addClass("editing");
  });

  ulSelector.on("click", "button.doneButton", function() {
    var id = this.parentNode.id;
    $("#"+id+" .text_field").attr("contenteditable", "false");
    $("#"+id+" .doneButton").hide();
    $("#"+id+" .editButton").show();
    $("#"+id+" div").removeClass("editing");
     setTimeout(function() {
       $("#"+id).addClass("codeMaskItem");
      }, 100);
  });


  $("#analyse").click(function() {
      var plainText = $("#textArea").text();
      $.ajax({
          url: "/application/analyse",
          type: "post",
          data: { text_field: plainText, selected_codes: selectedCodes}
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
      var category = $(this).attr("data-category");
      var newLiElement = "<li class='list-group-item newCode' id='"+id+"' data-category='"+category+"'></li>";
      $("#allListMask").append(newLiElement); // codeMaskItem
      var divText = "<div class='text_field editing' contenteditable='true'></div>";
      $("#"+id).append(divText);
      var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'/><ul class='dropdown-menu'></ul></div>";
      $("#"+id).append(divDropdown);
      var doneButton = "<button class='zbutton doneButton' type='button'>Add</button>";
      $("#"+id).append(doneButton);
      var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
      $("#"+id).append(editButton);
      $("#"+id+" .doneButton").show();
      $(this).hide();
  });

  ulSelector.on("keyup", "li div.editing", function() {
      var id = this.parentNode.id;
      interactiveProposals(id);
  });

  function interactiveProposals(id) {
      var searchText = $("#"+id+" div.text_field").text();
      var category = $("#"+id).attr("data-category");
      if(searchText.length >= 1)
      {
          $.ajax({
              url: "/application/search",
              type: "post",
              data: { search_text: searchText, li_id: id, category: category }
          });
      }
  };

  $("ul#allListMask").on("click","li.dropdown-element", function() {
      var liId = this.parentNode.parentNode.parentNode.id;
      $("#"+liId+" div.text_field").text($(this).text());
      var codeId = $(this).attr("id");
      var code = $(this).attr("data-code");
      var text = $(this).attr("data-text");
      var category = $("#"+liId).attr("data-category");
      $("#"+liId).attr("id", codeId);
      $("#"+codeId+" .doneButton").show();
      tempSelectedCodes[category][codeId] = {code: code, short_code: codeId, text_de: text};
  });

  ulSelector.on("click", ".newCode button.doneButton", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      $("#"+id).removeClass("newCode");
      $("#"+id+" div.dropdown").remove();
      $("#addCodeButton").show();
  });


  function deleteIncompleteCodes(){
      $('#allListMask li.newCode').remove();
  }

  $("#maskTabs li a.filterTab").click(function () {
        var category = $(this).attr("data-category");
        $('#allListMask li').hide();
        $('#allListMask li').filter(function () {
            liCategory = $(this).attr("data-category");
            return  liCategory == category;
        }).show();
        $('#addCodeButton').removeAttr("data-category");
        $('#addCodeButton').hide();
        $('.codeMaskItem .editButton').show();
        deleteIncompleteCodes();
  });

  $("#maskTabs li a#allMaskLink").click(function () {
      $('#allListMask li').show();
      $('#addCodeButton').removeAttr("data-category");
      $('#addCodeButton').hide();
      $('.editButton').hide();
      $('#allListMask li.mainNewCode').hide();
      deleteIncompleteCodes();
  });

  $("#maskTabs li a.withAddButton").click(function () {
      var category = $(this).attr("data-category");
      $('#addCodeButton').attr("data-category", category);
      $('#addCodeButton').show();
      $('#allListMask li.mainNewCode').hide();
      deleteIncompleteCodes();
  });


});