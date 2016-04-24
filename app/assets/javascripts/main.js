
  $(document).ready(function() {
    var gParent="";
      var selectedCodes = {};
      //selectedCodes["388420"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003814" }, "code" : "38.84.20", "short_code" : "388420", "text_de" : "Sonstiger chirurgischer Verschluss der Aorta abdominalis"};
      //var suggestedCodes = {};
      //suggestedCodes["388410"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003813" }, "code" : "38.84.10", "short_code" : "388410", "text_de" : "Sonstiger chirurgischer Verschluss der thorakalen Aorta"};
      //suggestedCodes["388420"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003814" }, "code" : "38.84.20", "short_code" : "388420", "text_de" : "Sonstiger chirurgischer Verschluss der Aorta abdominalis"};
      //suggestedCodes["388499"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003815" }, "code" : "38.84.99", "short_code" : "388499", "text_de" : "Sonstiger chirurgischer Verschluss der Aorta, sonstige"};
      //suggestedCodes["388500"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003816" }, "code" : "38.85.00", "short_code" : "388500", "text_de" : "Sonstiger chirurgischer Verschluss von anderen thorakalen Gefässen, n.n.bez."};
      //suggestedCodes["388510"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003817" }, "code" : "38.85.10", "short_code" : "388510", "text_de" : "Sonstiger chirurgischer Verschluss von anderen thorakalen Arterien, n.n.bez."};
      //suggestedCodes["388511"] = { "_id" : { "$oid" : "56cdb0c49da27e192c003818" }, "code" : "38.85.11", "short_code" : "388511", "text_de" : "Sonstiger chirurgischer Verschluss der A. subclavia"};

      //function updateSuggestedCodes(){
      //    var categoryList;
      //    $("#mainDiagnosesList").empty();
      //    $("#sideDiagnosesList").empty();
      //    $("#proceduresList").empty();
      //    for(var key in suggestedCodes){
      //        // don't show codes that are already selected
      //        if(key in selectedCodes){
      //            continue;
      //        }
      //        else{
      //            if(key=="388410" || key=="388420"){
      //                categoryList = "mainDiagnosesList";
      //            }
      //            else if(key=="388499" || key=="388500"){
      //                categoryList = "sideDiagnosesList";
      //            }
      //            else{
      //                categoryList = "proceduresList";
      //            }
      //            $("#"+categoryList).append("<li class='list-group-item codeItem' id='"+key+"'>"+"<span class='text_field'>"+suggestedCodes[key].code+"</span>"+": "+suggestedCodes[key].text_de+"</li>");
      //        }
      //    }
      //    // var infoButton = "<button class='infoButton' type='button'><img src='http://icons.iconarchive.com/icons/danrabbit/elementary/32/Button-info-icon.png' alt='info'></img></button>";
      //    // $(".codeList li").append(infoButton);
      //};

      //updateSuggestedCodes();

      // $(".selectable").selectable();


      // $(".selectable").selectable({

      //         stop: function () {
      //             $(".ui-selected", this).each(function () {
      //                 // add the code to allListMask and the appropriate tab-list in code Mask
      //                 var id = this.id;
      //                 var category = this.parentNode.id;
      //                 var editButton = "<button class='zbutton editButton' type='button'>Edit</button><button class='zbutton doneButton' type='button'>Done</button>";
      //                 $("#"+id).append(editButton);
      //                 this.setAttribute("class", "list-group-item ui-selectee");
      //                 $("#" + category + "Mask, #allListMask").append(this);
      //                 selectedCodes[id] = suggestedCodes[id];
      //                 selectedCodes[id].category = category;
      //             });
      //         }
      // });

      $("ul").on("click", ".codeItem", function (){
          var id = this.id;
          var category = this.parentNode.id;
          var editButton = "<button class='zbutton editButton' type='button'>Edit</button><button class='zbutton doneButton' type='button'>Done</button>";
          $("#"+id).append(editButton);
          $("#" + category + "Mask, #allListMask").append(this);
          selectedCodes[id] = suggestedCodes[id];
          selectedCodes[id].category = category;      
          $("#"+id).toggleClass("codeItem");
          $("#"+id).toggleClass("codeMaskItem");
   
      });

      $("ul").on("click", ".codeMaskItem", function (){
          var id = this.id;
          // add the code first to the appropriate list
          var category = selectedCodes[id].category;
          $("#"+id+" .editButton").remove();
          $("#" + category).prepend(this);
          // remove it from all tabs in codeMask
          $(".codeMaskLists li").remove("#"+id);
          delete selectedCodes[id];
          $("#"+id).toggleClass("codeMaskItem");
          $("#"+id).toggleClass("codeItem");
   
      });

      // $(".unselectable").selectable();

      // $(".unselectable").selectable({

      //     stop: function () {
      //         $(".ui-selected", this).each(function () {
      //             var id = this.id;
      //             // add the code first to the appropriate list
      //             var category = selectedCodes[id].category;
      //             $("#"+id+" .editButton").remove();
      //             $("#" + category).prepend(this);
      //             this.setAttribute("class", "list-group-item ui-selectee");
      //             // remove it from all tabs in codeMask
      //             $(".codeMaskLists li").remove("#"+id);
      //             delete selectedCodes[id];
      //         });
      //     }
      // });
    
      // $(".infoButton").click(function (){
      //     var id = this.parentNode.id;
      //     var codeId = suggestedCodes[id].code;
      //     console.log("info id: "+codeId);
      //     $("#infoCode").empty().append(codeId);
      //     $("#infoSynonyms").empty().append("synonyms of code "+codeId);
      //     $("#infoDescription").empty().append("Description of code "+codeId+":<br>");
      //     $("#infoDescription").append(suggestedCodes[id].text_de);

      // });

      $("li").on("click", ".editButton", function (){
        var xid = this.parentNode.id;
        $("#"+xid).removeClass("codeMaskItem");
        $("#"+xid).attr("contenteditable", "true");
        $("#"+xid+" .doneButton").toggle();
        $("#"+xid+" .editButton").toggle();
        $("#"+xid).toggleClass("editing");
  
      });
      $("li").on("click", ".doneButton", function (){
        var xid = this.parentNode.id;
        $("#"+xid).attr("contenteditable", "false");
        $("#"+xid+" .doneButton").toggle();
        $("#"+xid+" .editButton").toggle();
        $("#"+xid).toggleClass("editing");
         setTimeout(function() {
           $("#"+xid).toggleClass("codeMaskItem");
      
          }, 100);
      });

      
      $("#analyse").click(function () {
          var plainText = $("#textArea").text();
          $.ajax({
              url: "/front_end/analyse",
              type: "post",
              data: {text_field: plainText, selectedCodes: selectedCodes}
          });
      });

      $("#textArea").on("click", ".showWordDetails", function () {
          var word = this.text;
          $.ajax({
              url: "/front_end/showWordDetails",
              type: "post",
              data: {word: word}
          });
      });

  });
 
