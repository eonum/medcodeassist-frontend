$(document).ready(function() {
    // selected codes that are send to the controller with posts
    var selectedMainCodes = {};
    var selectedSideCodes = {};
    var selectedProcedureCodes = {};
    var selectedCodes = {mainDiagnoses: selectedMainCodes, sideDiagnoses: selectedSideCodes, procedures: selectedProcedureCodes};

    // fix buttons and newMainCode
    var editButton = "<button class='zbutton editButton' type='button'>Bearbeiten</button>";
    var doneButton = "<button class='zbutton doneButton' type='button'>Fertig</button>";
    var doneAddButton = "<button class='zbutton doneButton' type='button'>Hinzufügen</button>";
    var newMainCode = "<li class='list-group-item mainDiagnoses' id='newMainCode' data-category='mainDiagnoses'><div class='text_field editing redBackground' contenteditable='true' data-prompt='Typen Sie hier'></div><div class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div></li>";

    // assign codes from codeLists to codeMaskLists
    $("#infoRelatedCodes ul, #codeLists ul").on("click", ".codeItem", function() {
        var id = this.id;
        var liSelector = $(this);
        var category = liSelector.attr("data-category");
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
        liSelector.append(editButton);
        liSelector.append(doneButton);
        liSelector.removeClass("codeItem");
        liSelector.addClass("codeMaskItem");
        // get data that may be stored in html
        var code = liSelector.attr("data-code");
        var text = liSelector.attr("data-text");
        // find parent List name
        var parentId =  this.parentNode.parentNode.parentNode.id;
        // add code to selected codes
        // in case it was selected from the original code Lists
        if( parentId == "codeLists" && typeof suggestedCodes != "undefined" && suggestedCodes && suggestedCodes[category]) {
            selectedCodes[category][id] = suggestedCodes[category][id];
        }
        // in case it was selected from the related code Lists in the popup
        else if( parentId == "infoRelatedCodes" && typeof suggestedRelatedCodes != "undefined" && suggestedRelatedCodes && suggestedRelatedCodes[category]) {
            selectedCodes[category][id] = suggestedRelatedCodes[category][id];
        }
        // in case it was added manually or edited
        else if( code && text ) {
            selectedCodes[category][id] = {code: code, short_code: id, text_de: text};
        }
        else {
            selectedCodes[category][id] = {code: id, short_code:id}
        }
        // then add the code to the codemask list
        $("#allListMask").append(this);
        // and remove it from the original codeList
        $("#codeLists #" + category +"List"+id).remove();
        // only show the new selected code with its editButton if the appropriate tab is active
        if($("#maskTabs ."+category).hasClass("active") ) {
            liSelector.find(".editButton").show();
            liSelector.show();
        }
        // else if allTab is active only show the code without the editButton
        else if($("#maskTabs #allTab").hasClass("active")) {
            liSelector.show();
        }
        // else hide
        else{
            liSelector.hide();
        }
    });

    var index = 0;
    // deselect codes from the codeMask and take them back to codeLists
    $("#codeMaskLists ul").on("click", ".codeMaskItem div", function() {
        var parentLi = this.parentNode;
        var id = this.parentNode.id;
        var liSelector = $(parentLi);
        var category = liSelector.attr("data-category");
        // delete the code from the appropriate selectedCodes list
        delete selectedCodes[category][id];
        // add the code to the appropriate list
        $("#codeLists #" + category +"List").prepend(parentLi);
        // finally change class and remove buttons
        liSelector.removeClass("codeMaskItem");
        liSelector.addClass("codeItem");
        liSelector.find("button").remove();
        // in case of the new custon main code change its name so that it doesn;t get mixed with the new one
        if(id == "newMainCode") {
            liSelector.attr("id", "oldMainCode"+index);
            index++;
        }
    });

    // on click of a mainDiagnoses code add a new editable main code to support restriction of 1 main code
    $("#codeMaskLists ul").on("click", "li.codeMaskItem.mainDiagnoses div", function() {
        $("#allListMask").append(newMainCode);
        $("#codeMaskLists #newMainCode").append(editButton);
        $("#codeMaskLists #newMainCode").append(doneButton);
        $("#codeMaskLists #newMainCode .doneButton").show();
        // only show the newMainCode if the mainDiagnoses tab is active
        if($("#maskTabs .mainDiagnoses").hasClass("active")) {
            $("#codeMaskLists #newMainCode").show();
        }
        else {
            $("#codeMaskLists #newMainCode").hide();
        }
    });

    // on click of the editButton change code li to editable and add dropdown menu used for search post
    $("#codeMaskLists ul").on("click", "button.editButton", function() {
        var parentLi = this.parentNode;
        var id = parentLi.id;
        var liSelector = $(parentLi);
        var category = liSelector.attr("data-category");
        delete selectedCodes[category][id];
        liSelector.removeClass("codeMaskItem");
        liSelector.find(".text_field").attr("contenteditable", "true");
        var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'></a><ul class='dropdown-menu'></ul></div>";
        liSelector.append(divDropdown);
        liSelector.find(".doneButton").text("Fertig");
        liSelector.find(".doneButton").show();
        liSelector.find(".editButton").hide();
        liSelector.find("div").addClass("editing");
    });

    // on click of the done button change make code uneditable and save data to selected_codes List
    $("#codeMaskLists ul").on("click", "button.doneButton", function() {
        var parentLi = this.parentNode;
        var liSelector = $(parentLi);
        var category = liSelector.attr("data-category");
        liSelector.find(".text_field").attr("contenteditable", "false");
        liSelector.find(".doneButton").hide();
        liSelector.find(".editButton").show();
        liSelector.find("div").removeClass("editing");

        // save data from li in case of an edited or added code
        var codeId = liSelector.attr("id");
        var code = liSelector.attr("data-code");
        var text = liSelector.attr("data-text");
        // save code to selectedCodes list
        if(code && text) {
            selectedCodes[category][codeId] = {code: code, short_code: codeId, text_de: text};
        }else {
            selectedCodes[category][codeId] = {code: codeId, short_code: codeId};
        }
        setTimeout(function() {
            liSelector.addClass("codeMaskItem");
        }, 100);
        // remove it from the code list
        $("#codeLists #" + category +"List li#"+codeId).remove();
    });

    // on click of the done Button of a newly added code remove "newCode" class and hide the cancel Button and show again the add Button
    $("#codeMaskLists ul").on("click", ".newCode button.doneButton", function() {
        var parentLi = this.parentNode;
        var liSelector = $(parentLi);
        var category = liSelector.attr("data-category");
        liSelector.removeClass("newCode");
        liSelector.find("div.dropdown").remove();
        $("#addCodeButton").show();
        $("#cancelButton").hide();
    });

    // on click of the analyse/update button send post
    $("#analyse").click(function() {
        var plainText = $("#textArea").text();
        $.ajax({
            url: "/application/analyse",
            type: "post",
            data: { text_field: plainText, selected_codes: selectedCodes},
            success: function(parameters){
                var words = parameters.words;
                var suggestedCodes = parameters.suggested_codes;

                // change analyze button after first use
                $("#analyse").text('Aktualisieren');

                // function to escape all escaped characters of a regex expression
                function reg_escape(str) {
                    return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
                }

                // highlight words (case insensitive) and make them links for the popup and show_word_detaills-post
                var textArea = $("#textArea");
                var text = textArea.html();
                words.forEach(function(item) {
                    var textArray = text.match(new RegExp("("+reg_escape(item)+")",'gi'));
                    // only escaped due to problem of the API that has matched words. remove "if" when API works properly
                    if(textArray && item != "n") {
                        textArray.forEach(function(word) {
                            var highlightedWord = "<a class='highlight showWordDetails' contenteditable='true' title='click for details' data-toggle='modal' data-target='#popup' >" + word + "</a>";
                            text=text.replace(new RegExp(word, 'g'), highlightedWord);
                        });
                    }
                });
                textArea.html(text);


                /* update code lists are filled in the appropriate format */
                function updateSuggestedCodes() {
                    for(var category in suggestedCodes){
                        // empty list first
                        $("#"+category+"List").empty();
                        for(var codeId in suggestedCodes[category]){
                            var code = suggestedCodes[category][codeId].code;
                            var text = suggestedCodes[category][codeId].text_de;
                            $("#"+category+"List").append("<li class='list-group-item codeItem "+category+"' id='"+codeId+"' data-category='"+category+"' data-code='"+code+"' data-text='"+text+"'><div class='text_field'>"+code+": "+text+"</div></li>");
                        }
                    }
                }

                updateSuggestedCodes();
            }
        });
    });

    // on click of a highlighted word in the textArea or in the synonymsList send post
    $("#textArea, #synonymsList").on("click", ".showWordDetails", function() {
        var word = this.text;
        $.ajax({
            url: "/application/show_word_details",
            type: "post",
            data: { word: word, selected_codes: selectedCodes },
            success: function(parameters){
                var word = parameters.word;
                var synonyms = parameters.synonyms;
                var suggestedRelatedCodes = parameters.suggested_related_codes;

                /* clicked word is displayed */
                $("#infoWord").text(word);

                /* synonyms of the word are displayed highlighted and clickable */
                if(synonyms) {
                    $("#synonymsList").empty();
                    synonyms.forEach(function (synonym) {
                        $("#synonymsList").append("<li title='click for details'><a class='highlight showWordDetails'>" + synonym + "</a></li>");
                    });
                }

                /* update related code lists are filled in the appropriate format */
                function updateSuggestedRelatedCodes() {
                    for(var category in suggestedRelatedCodes){
                        // empty list first
                        $("#"+category+"RelatedList").empty();
                        for(var codeId in suggestedRelatedCodes[category]){
                            var code = suggestedRelatedCodes[category][codeId].code;
                            var text = suggestedRelatedCodes[category][codeId].text_de;
                            $("#"+category+"RelatedList").append("<li class='list-group-item codeItem "+category+"' id='"+codeId+"' data-category='"+category+"'><div class='text_field'>"+code+": "+text+"</div></li>");
                        }
                    }
                }

                updateSuggestedRelatedCodes();
            }
        });
    });

    // on click of the addCodeButton create a new editable code with red Background
    var key = 0;
    $("#addCodeButton").click(function() {
        key++;
        var id = "newCode"+key;
        var category = $(this).attr("data-category");
        var newLiElement = "<li class='list-group-item newCode' id='"+id+"' data-category='"+category+"'></li>";
        $("#allListMask").append(newLiElement); // codeMaskItem
        var divText = "<div class='text_field editing' contenteditable='true'></div>";
        var newLiSelector = "#codeMaskLists [data-category*='"+category+"']#"+id;
        $("#codeMaskLists [data-category*='"+category+"']#"+id).append(divText);
        var divDropdown = "<div class='dropdown' id='dropdown-"+id+"'><a data-toggle='dropdown' class='dropdown-toggle'/><ul class='dropdown-menu'></ul></div>";
        $(newLiSelector).append(divDropdown);
        $(newLiSelector).append(editButton);
        $(newLiSelector).append(doneAddButton);
        $(newLiSelector+" .doneButton").show();
        $(newLiSelector+" div.editing").addClass("redBackground");
        $(newLiSelector+" div.editing").attr("data-prompt", "Typen Sie hier");
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
        var parentLi = this.parentNode;
        var id = parentLi.id;
        var category = $(parentLi).attr("data-category");
        $(parentLi).find(".doneButton").show();
        interactiveProposals(id, category);
    });

    // function to send search post if length of search text is at least 2
    function interactiveProposals(id, category) {
        var searchText = $("#codeMaskLists [data-category*='"+category+"']#"+id+" div.text_field").text();
        if(searchText.length >= 2) {
            $.ajax({
                url: "/application/search",
                type: "post",
                data: { search_text: searchText, category: category, selected_codes: selectedCodes},
                success: function(parameters){
                    var codes = parameters.codes;
                    var code = parameters.code;
                    var text = parameters.text;
                    /* add matching codes to the temporary dropdown list in the appropriate format */
                    var codeList = "";
                    codes.forEach(function(element) {
                        var codeId = element["short_code"];
                        var code = element["code"];
                        var text = element["text_de"];
                        var listElement = "<li class='dropdown-element' id='"+codeId+"' data-code='"+code+"' data-text='"+text+"'><a>"+code+": "+text+"</a></li>";
                        codeList = codeList + listElement;
                    });

                    // no matching codes
                    if(codeList.length == 0){
                        codeList = "<li>Keine Kodes gefunden</li>";
                        $("#"+id+" div.editing").addClass("redBackground");
                        $("#"+id).removeAttr("data-code");
                        $("#"+id).removeAttr("data-text");
                        $("#"+id).attr("id", "newTempCode");
                    }
                    // one exact matching code gets stored in html and background is white
                    else if(codes.length==1 && code.match(new RegExp("\s*"+codes[0]["code"]+"\s*",'i')) && text.match(new RegExp("\s*"+codes[0]["text_de"]+"\s*",'i'))) {
                        $("#"+id+" div.editing").removeClass("redBackground");
                        $("#"+id).attr("data-code", code);
                        $("#"+id).attr("data-text", text);
                        $("#"+id).attr("id", codes[0]["short_code"]);
                    }
                    // more than one matching codes deletes stored data in html and background is red
                    else{
                        $("#"+id+" div.editing").addClass("redBackground");
                        $("#"+id).removeAttr("data-code");
                        $("#"+id).removeAttr("data-text");
                        $("#"+id).attr("id", "newTempCode");
                    }

                    // empty and fill the dropdown list with the temporary above
                    $("#"+id+" div.dropdown ul.dropdown-menu").empty().append(codeList);

                    // open dropdown
                    $("#"+id+" div.dropdown").addClass("open");
                }
            });
        }
    };

    // on click of a suggested code in the dropdown menu assign its text and data to the parent li, i.e. to the original searching code
    $("ul#allListMask").on("click","li.dropdown-element", function() {
        var parentLi = this.parentNode.parentNode.parentNode;
        var thisSelector = $(this);
        var liSelector = $(parentLi);
        var category = liSelector.attr("data-category");
        liSelector.find("div.text_field").text(thisSelector.text());
        // copy data from selected dropdown element to current editing code
        var codeId = thisSelector.attr("id");
        var code = thisSelector.attr("data-code");
        var text = thisSelector.attr("data-text");
        liSelector.addClass(category);
        liSelector.find(".doneButton").show();
        liSelector.attr("data-code", code);
        liSelector.attr("data-text", text);
        // change red background to original (white)
        liSelector.find("div.text_field").removeClass("redBackground");
        // update id
        liSelector.attr("id", codeId);
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
        $("#codeMaskLists .codeMaskItem .editButton").show();
        deleteIncompleteCodes();
    });

    // if all tab is selected show all codes (except editing ones) and hide all buttons
    $("#maskTabs li a#allMaskLink").click(function () {
        $("#allListMask li").show();
        $("#addCodeButton").removeAttr("data-category");
        $("#addCodeButton").hide();
        $("#codeMaskLists .editButton").hide();
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