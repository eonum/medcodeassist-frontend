
  $(document).ready(function() {
    var gParent="";
      var selectedCodes = {};
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

      $("ul").on("click", "li.codeItem", function (){
          var id = this.id;
          var categoryList = this.parentNode.id;
          if (categoryList == "mainDiagnosesList" && $("#" + categoryList + "Mask").is(':has(li)')){
              alert("Nur eine Hauptdiagnose ist erlaubt");
          }
          else{
              // first add buttons and change class
              var editButton = "<button class='zbutton editButton' type='button'>Edit</button>";
              var doneButton = "<button class='zbutton doneButton' type='button'>Done</button>";
              $("#"+id).append(editButton);
              $("#"+id).append(doneButton);
              $("#"+id).toggleClass("codeItem");
              $("#"+id).toggleClass("codeMaskItem");
              // then add the code to the codemask lists
              selectedCodes[id] = suggestedCodes[id];
              selectedCodes[id].categoryList = categoryList;
              $("#" + categoryList + "Mask, #allListMask").append(this);
          }
      });

      $("ul").on("click", "li.codeMaskItem", function (){
          var id = this.id;
          // add the code first to the appropriate list
          var categoryList = selectedCodes[id].categoryList;
          delete selectedCodes[id];
          $("#" + categoryList).prepend(this);
          // remove it from all tabs in codeMask
          $(".codeMaskLists li").remove("#"+id);
          // finally change class and remove buttons
          $("#"+id).toggleClass("codeMaskItem");
          $("#"+id).toggleClass("codeItem");
          $("#"+id+" button").remove();
   
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
          alert("edit");
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
 
