$(document).ready(function() {
    // selected codes that are send to the controller with posts
    var selectedMainCodes = {};
    var selectedSideCodes = {};
    var selectedProcedureCodes = {};
    var selectedCodes = {mainDiagnoses: selectedMainCodes, sideDiagnoses: selectedSideCodes, procedures: selectedProcedureCodes};

    // fix buttons and newMainCode
    var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
    var doneButton = "<button class='zbutton doneButton' type='button'>Done</button>";
    var doneAddButton = "<button class='zbutton doneButton' type='button'>Add</button>";
    var newMainCode = "<li class='list-group-item mainDiagnoses' id='newMainCode' data-category='mainDiagnoses'><div class='text_field editing redBackground' contenteditable='true' data-prompt='Typen Sie hier'></div><div class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div></li>";

    // assign codes from codeLists to codeMaskLists
    $("#infoRelatedCodes ul, #codeLists ul").on("click", ".codeItem", function() {
        var id = this.id;
        var category = $(this).attr("data-category");
        // if category is mainDiagnoses and there is already one selected code alert user
        if (category == "mainDiagnoses" && Object.keys(selectedCodes["mainDiagnoses"]).length>0) {
            alert("Nur eine Hauptdiagnose ist erlaubt");
            return;
        }
        // else if no code is selected remove the editable newMainCode
        else if(category == "mainDiagnoses" && Object.keys(selectedCodes["mainDiagnoses"]).length==0) {
            $("#newMainCode").remove();
        }
        // first add buttons and change class
        var idSelector = $("#"+id);
        idSelector.append(editButton);
        idSelector.append(doneButton);
        idSelector.removeClass("codeItem");
        idSelector.addClass("codeMaskItem");
        // find parent List name
        var parent =  this.parentNode.parentNode.parentNode.id;
        // get data that may be stored in html
        var code = $(this).attr("data-code");
        var text = $(this).attr("data-text");
        // add code to selected codes
        // in case it was selected from the original code Lists
        if( parent == "codeLists" && typeof suggestedCodes != "undefined" && suggestedCodes && suggestedCodes[category]) {
            selectedCodes[category][id] = suggestedCodes[category][id];
        }
        // in case it was selected from the related code Lists in the popup
        else if( parent == "infoRelatedCodes" && typeof suggestedRelatedCodes != "undefined" && suggestedRelatedCodes && suggestedRelatedCodes[category]) {
            selectedCodes[category][id] = suggestedRelatedCodes[category][id];
        }
        // in case it was added manually or edited
        else if( code && text ) {
            selectedCodes[category][id] = {code: code, short_code: id, text_de: text};
        }
        // then add the code to the codemask list
        $("#allListMask").append(this);
        // and remove it from the original codeList
        $("#codeLists #"+id).remove();
        // only show the new selected code with its editButton if the appropriate tab is active
        if($("#maskTabs ."+category).hasClass("active") ) {
            $("#"+id+" .editButton").show();
            idSelector.show();
        }
        // else if allTab is active only show the code without the editButton
        else if($("#maskTabs #allTab").hasClass("active")) {
            idSelector.show();
        }
        // else hide
        else{
            idSelector.hide();
        }
    });

    // deselect codes from the codeMask and take them back to codeLists
    $("#codeMaskLists ul").on("click", ".codeMaskItem div", function() {
        var thisLi = this.parentNode;
        var id = this.parentNode.id;
        var idSelector = $("#"+id);
        var category = $(thisLi).attr("data-category");
        // delete the code from the appropriate selectedCodes list
        delete selectedCodes[category][id];
        // add the code to the appropriate list
        $("#" + category +"List").prepend(thisLi);
        // finally change class and remove buttons
        idSelector.removeClass("codeMaskItem");
        idSelector.addClass("codeItem");
        $("#"+id+" button").remove();
        // in case of the new custon main code change its name so that it doesn;t get mixed with the new one
        if(id == "newMainCode") {
            idSelector.attr("id", "oldMainCode");
        }
    });

    // on click of a mainDiagnoses code add a new editable main code to support restriction of 1 main code
    $("#codeMaskLists ul").on("click", "li.codeMaskItem.mainDiagnoses div", function() {
        $("#allListMask").append(newMainCode);
        $("#newMainCode").append(editButton);
        $("#newMainCode").append(doneButton);
        $("#newMainCode .doneButton").show();
        var id = this.parentNode.id;
        // only show the newMainCode if the mainDiagnoses tab is active
        if($("#maskTabs .mainDiagnoses").hasClass("active")) {
            $("#newMainCode").show();
        }
        else {
            $("#newMainCode").hide();
        }
    });

    // on click of the editButton change code li to editable and add dropdown menu used for search post
    $("#codeMaskLists ul").on("click", "button.editButton", function() {
        var id = this.parentNode.id;
        var category = $("#"+id).attr("data-category");
        delete selectedCodes[category][id];
        $("#"+id).removeClass("codeMaskItem");
        $("#"+id+" .text_field").attr("contenteditable", "true");
        var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div>";
        $("#"+id).append(divDropdown);
        $("#"+id+" .doneButton").text("Done");
        $("#"+id+" .doneButton").show();
        $("#"+id+" .editButton").hide();
        $("#"+id+" div").addClass("editing");
    });

    // on click of the done button change make code uneditable and save data to selected_codes List
    $("#codeMaskLists ul").on("click", "button.doneButton", function() {
        var id = this.parentNode.id;
        $("#"+id+" .text_field").attr("contenteditable", "false");
        $("#"+id+" .doneButton").hide();
        $("#"+id+" .editButton").show();
        $("#"+id+" div").removeClass("editing");

        // save data from li in case of an edited or added code
        idSelector =  $("#"+id);
        var codeId = idSelector.attr("id");
        var code = idSelector.attr("data-code");
        var text = idSelector.attr("data-text");
        var category = idSelector.attr("data-category");
        // save code to selectedCodes list
        if(code && text) {
            selectedCodes[category][codeId] = {code: code, short_code: codeId, text_de: text};
        }else {
            selectedCodes[category][codeId] = {code: codeId, short_code: codeId};
        }
        setTimeout(function() {
          $("#"+id).addClass("codeMaskItem");
        }, 100);
        // remove it from the code list
        $("#" + category +"List li#"+codeId).remove();
    });

    // on click of the done Button of a newly added code remove "newCode" class and hide the cancel Button and show again the add Button
    $("#codeMaskLists ul").on("click", ".newCode button.doneButton", function() {
        var thisLi = this.parentNode;
        var id = this.parentNode.id;
        $("#"+id).removeClass("newCode");
        $("#"+id+" div.dropdown").remove();
        $("#addCodeButton").show();
        $("#cancelButton").hide();
    });

    // on click of the analyse/update button send post
    $("#analyse").click(function() {
        var plainText = $("#textArea").text();
        $.ajax({
            url: "/application/analyse",
            type: "post",
            data: { text_field: plainText, selected_codes: selectedCodes}
        });
    });

    // on click of a highlighted word in the textArea or in the synonymsList send post
    $("#textArea, #synonymsList").on("click", ".showWordDetails", function() {
        var word = this.text;
        $.ajax({
            url: "/application/show_word_details",
            type: "post",
            data: { word: word, selected_codes: selectedCodes }
        });
    });

    // on click of the addCodeButton create a new editable code with red Background
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
        $("#"+id+" div.editing").attr("data-prompt", "Typen Sie hier");
        $("#cancelButton").show();
        $(this).hide();
    });

    // on click of the cancel Button only remove the newly added editable code if not saved
    $("#cancelButton").click(function() {
        $("#allListMask .newCode").remove();
        $(this).hide();
        $("#addCodeButton").show();
    });

    // on key release send post for search
    $("#codeMaskLists ul").on("keyup", "li div.editing", function() {
        var id = this.parentNode.id;
        $("#"+id+" .doneButton").show();
        interactiveProposals(id);
    });

    // function to send search post if length of search text is at least 2
    function interactiveProposals(id) {
        var searchText = $("#"+id+" div.text_field").text();
        var category = $("#"+id).attr("data-category");
        if(searchText.length >= 2) {
            $.ajax({
                url: "/application/search",
                type: "post",
                data: { search_text: searchText, li_id: id, category: category, selected_codes: selectedCodes}
            });
        }
    };

    // on click of a suggested code in the dropdown menu assign its text and data to the parent li, i.e. to the original searching code
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
        // change red background to original (white)
        $("#"+codeId+" div.text_field").removeClass("redBackground");
    });

    // function to delete Incomplete Codes, i,e, newly added codes via the add Button but without saving them with the add/done Button
    function deleteIncompleteCodes() {
        $("#allListMask li.newCode").remove();
        $("#cancelButton").hide();
    };

    // on changing tab filter the codes of only the selected category
    $("#maskTabs li a.filterTab").click(function () {
        var category = $(this).attr("data-category");
        $("#allListMask li").hide();
        $("#allListMask li").filter(function () {
            liCategory = $(this).attr("data-category");
            return  liCategory == category;
        }).show();
        // deactivate addCode Button
        $("#addCodeButton").removeAttr("data-category");
        $("#addCodeButton").hide();
        $(".codeMaskItem .editButton").show();
        deleteIncompleteCodes();
    });

    // if all tab is selected show all codes (except editing ones) and hide all buttons
    $("#maskTabs li a#allMaskLink").click(function () {
        $("#allListMask li").show();
        $("#addCodeButton").removeAttr("data-category");
        $("#addCodeButton").hide();
        $(".editButton").hide();
        $("#allListMask li#newMainCode").hide();
        deleteIncompleteCodes();
    });

    // if sideDiagnoses or procedures tab is selected show the addButton and give it the corresponding category
    $("#maskTabs li a.withAddButton").click(function () {
        var category = $(this).attr("data-category");
        $("#addCodeButton").attr("data-category", category);
        $("#addCodeButton").show();
        $("#allListMask li#newMainCode").hide();
    });

  });