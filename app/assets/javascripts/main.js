$(document).ready(function() {
  var selectedMainCodes = {};
  //selectedMainCodes['388420'] = {code: '38.84.20', short_code: '388420', text_de: 'Sonstiger chirurgischer Verschluss der Aorta abdominalis'};
  var selectedSideCodes = {};
  var selectedProcedureCodes = {};
    //selectedProcedureCodes['388511'] = {code: '38.85.11', short_code: '388511', text_de: 'Sonstiger chirurgischer Verschluss der A. subclavia'};
  var selectedCodes = {mainDiagnoses: selectedMainCodes, sideDiagnoses: selectedSideCodes, procedures: selectedProcedureCodes};
  var tempSavedCodes = {mainDiagnoses: {}, sideDiagnoses: {}, procedures: {}};


  var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
  var doneButton = "<button class='zbutton doneButton' type='button'>Done</button>";
  var doneAddButton = "<button class='zbutton doneButton' type='button'>Add</button>";
  var newMainCode = "<li class='list-group-item mainDiagnoses' id='newMainCode' data-category='mainDiagnoses'><div class='text_field editing' contenteditable='true'></div><div class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div></li>";

  var ulSelector = $("ul");
  ulSelector.on("click", ".codeItem", function() {
      var id = this.id;
      var idSelector = $("#"+id);
      var category = $(this).attr("data-category");
      console.log("main keys length: "+Object.keys(selectedCodes["mainDiagnoses"]).length)
      if (category == "mainDiagnoses" && Object.keys(selectedCodes["mainDiagnoses"]).length>0) {
          alert("Nur eine Hauptdiagnose ist erlaubt");
          return;
      }
      // first add buttons and change class
      idSelector.append(editButton);
      idSelector.append(doneButton);
      idSelector.removeClass("codeItem");
      idSelector.addClass("codeMaskItem");
      // check if it was added manually and add the info to selected Codes, else it will be in the suggested Codes
      var parent =  this.parentNode.parentNode.parentNode.id;
      var code = $(this).attr("data-code");
      var text = $(this).attr("data-text");
      if(tempSavedCodes[category][id]){
          selectedCodes[category][id] = tempSavedCodes[category][id];
      }else if( parent == "codeLists" && suggestedCodes && suggestedCodes[category]){
          selectedCodes[category][id] = suggestedCodes[category][id];
      }else if( parent == "infoRelatedCodes" && suggestedRelatedCodes && suggestedRelatedCodes[category]){
          selectedCodes[category][id] = suggestedRelatedCodes[category][id];
      }else{
          selectedCodes[category][id] = {code: code, short_code: id, text_de: text};
      }
      console.log("added code: "+selectedCodes[category][id]);
      // then add the code to the codemask list
      $("#allListMask").append(this);
      $("#codeLists #"+id).remove();
      if($("#maskTabs ."+category).hasClass("active") ){
          $("#"+id+" .editButton").show();
          idSelector.show();
      }
      else if($("#maskTabs #allTab").hasClass("active")){
          idSelector.show();
      }
      else{
          idSelector.hide();
      }
  });

  $("#mainDiagnosesList, #mainDiagnosesRelatedList").on("click", "li.codeItem", function() {
      $("#newMainCode").remove();
  });

  ulSelector.on("click", ".codeMaskItem div", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      var idSelector = $("#"+id);
      // add the code first to the appropriate list
      var category = $(thisLi).attr("data-category");
      delete selectedCodes[category][id];
      $("#" + category +"List").prepend(thisLi);
      // finally change class and remove buttons
      idSelector.removeClass("codeMaskItem");
      idSelector.addClass("codeItem");
      $("#"+id+" button").remove();
  });

  ulSelector.on("click", "li.codeMaskItem.mainDiagnoses div", function() {
      $("#allListMask").append(newMainCode);
      $("#newMainCode").append(editButton);
      $("#newMainCode").append(doneButton);
      $("#newMainCode .doneButton").show();
      var id = this.parentNode.id;
      var category = $("#"+id).attr("data-category");
      if($("#maskTabs ."+category).hasClass("active")){
          $("#newMainCode").show();
      }
      else{
          $("#newMainCode").hide();
      }

  });

  ulSelector.on("click", "button.editButton", function() {
    var id = this.parentNode.id;
    var category = $("#"+id).attr("data-category");
    delete selectedCodes[category][id];
    console.log("deleted cat: "+category+" id: "+id);
    $("#"+id).removeClass("codeMaskItem");
    $("#"+id+" .text_field").attr("contenteditable", "true");
    var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div>";
    $("#"+id).append(divDropdown);
    $("#"+id+" .doneButton").text("Done");
    $("#"+id+" .doneButton").show();
    $("#"+id+" .editButton").hide();
    $("#"+id+" div").addClass("editing");
  });

  ulSelector.on("click", "button.doneButton", function() {
    var id = this.parentNode.id;
    $("#"+id+" div.editing").removeClass("whiteBackground");
    $("#"+id+" .text_field").attr("contenteditable", "false");
    $("#"+id+" .doneButton").hide();
    $("#"+id+" .editButton").show();
    $("#"+id+" div").removeClass("editing");

    idSelector =  $("#"+id);
    var codeId = idSelector.attr("id");
    var code = idSelector.attr("data-code");
    var text = idSelector.attr("data-text");
    var category = idSelector.attr("data-category");
    idSelector.attr("id", codeId);
    $("#"+codeId).attr("data-code", code);
    $("#"+codeId).attr("data-text", text);
    selectedCodes[category][codeId] = {code: code, short_code: codeId, text_de: text};
    tempSavedCodes[category][codeId] = selectedCodes[category][codeId];
    setTimeout(function() {
      $("#"+id).addClass("codeMaskItem");
    }, 100);
    // remove it from the code list
    $("#" + category +"List li#"+codeId).remove();
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
      $("#"+id).append(editButton);
      $("#"+id).append(doneAddButton);
      $("#"+id+" .doneButton").show();
      $("#"+id+" div.editing").addClass("redBackground");
      $("#cancelButton").show();
      $(this).hide();
  });

  $("#cancelButton").click(function() {
      $("#allListMask .newCode").remove();
      $(this).hide();
      $("#addCodeButton").show();
  });

  ulSelector.on("keyup", "li div.editing", function() {
      var id = this.parentNode.id;
      //remove datas
      $("#"+id+" div.editing").removeClass("whiteBackground");
      $("#"+id+" div.editing").addClass("redBackground");
      $("#"+id).removeAttr("data-code");
      $("#"+id).removeAttr("data-text");
      $("#"+id).attr("id", "newTempCode");
      $("#newTempCode .doneButton").show();
      interactiveProposals(id);
  });

  function interactiveProposals(id) {
      var searchText = $("#"+id+" div.text_field").text();
      var category = $("#"+id).attr("data-category");
      if(searchText.length >= 2)
      {
          $.ajax({
              url: "/application/search",
              type: "post",
              data: { search_text: searchText, li_id: id, category: category, selected_codes: selectedCodes}
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
      $("#"+liId).addClass(category);
      $("#"+liId).attr("id", codeId);
      $("#"+codeId+" .doneButton").show();
      $("#"+codeId).attr("data-code", code);
      $("#"+codeId).attr("data-text", text);
      $("#"+codeId+" div.text_field").removeClass("redBackground");
  });

  ulSelector.on("click", ".newCode button.doneButton", function() {
      var thisLi = this.parentNode;
      var id = this.parentNode.id;
      $("#"+id).removeClass("newCode");
      $("#"+id+" div.dropdown").remove();
      $("#addCodeButton").show();
      $("#cancelButton").hide();
  });


  function deleteIncompleteCodes(){
      $("#allListMask li.newCode").remove();
      $("#cancelButton").hide();
  }

  $("#maskTabs li a.filterTab").click(function () {
        var category = $(this).attr("data-category");
        $("#allListMask li").hide();
        $("#allListMask li").filter(function () {
            liCategory = $(this).attr("data-category");
            return  liCategory == category;
        }).show();
        $("#addCodeButton").removeAttr("data-category");
        $("#addCodeButton").hide();
        $(".codeMaskItem .editButton").show();
        deleteIncompleteCodes();
  });

  $("#maskTabs li a#allMaskLink").click(function () {
      $("#allListMask li").show();
      $("#addCodeButton").removeAttr("data-category");
      $("#addCodeButton").hide();
      $(".editButton").hide();
      $("#allListMask li#newMainCode").hide();
      deleteIncompleteCodes();
  });

  $("#maskTabs li a.withAddButton").click(function () {
      var category = $(this).attr("data-category");
      $("#addCodeButton").attr("data-category", category);
      $("#addCodeButton").show();
      $("#allListMask li#newMainCode").hide();
      deleteIncompleteCodes();
  });


});