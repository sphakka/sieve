/*
 * The contents of this file are licenced. You may obtain a copy of 
 * the license at https://github.com/thsmi/sieve/ or request it via 
 * email from the author.
 *
 * Do not remove or change this comment.
 * 
 * The initial author of the code is:
 *   Thomas Schmid <schmid-thomas@gmx.net>
 *      
 */

/* global window */

"use strict";

(function(exports) {

  /* global $: false */
	/* global SieveTestDialogBoxUI */
	/* global SieveTabWidget */
	/* global SieveMatchTypeUI */
	/* global SieveComparatorUI */
	/* global SieveStringListWidget */
	/* global SieveAbstractBoxUI */
	/* global SieveDesigner */
  
  /**
   * Implements controls to edit a sieve body test
   * 
   * "body" [COMPARATOR] [MATCH-TYPE] [BODY-TRANSFORM]  <key-list: string-list>
   * 
   * @param {} elm
   */
  function SieveBodyUI(elm)
  {
    SieveTestDialogBoxUI.call(this,elm);
  }
  
  SieveBodyUI.prototype = Object.create(SieveTestDialogBoxUI.prototype);
  SieveBodyUI.prototype.constructor = SieveBodyUI;
  
  
  SieveBodyUI.prototype.onLoad
      = function()
  {
  
    (new SieveTabWidget()).init();
    
    var matchType = new SieveMatchTypeUI(this.getSieve().matchType);
    $("#sivBodyMatchTypes")
      .append(matchType.html()); 
   
    var comparator = new SieveComparatorUI(this.getSieve().comparator);
    $("#sivBodyComparator")
      .append(comparator.html());      
   
    var bodyTransform = new SieveBodyTransformUI(this.getSieve().bodyTransform);    
    $("#sivBodyTransform")
      .append(bodyTransform.html());
    
    (new SieveStringListWidget("#sivBodyKeyList"))
        .init()
        .values(this.getSieve().keyList);    
  };
  
  SieveBodyUI.prototype.onSave
      = function ()
  {
    var sieve = this.getSieve();
    
    sieve.keyList
      .clear()
      .append((new SieveStringListWidget("#sivBodyKeyList")).values());
        
    return true;    	
  };
  
  SieveBodyUI.prototype.getTemplate
      = function () 
  {
    return "./body/widgets/SieveBodyUI.html";
  };
    
  SieveBodyUI.prototype.getSummary
      = function()
  {
    // case- insensitive is the default so skip it...
    return $("<div/>")
        .html(" message body <em> "
                   + this.getSieve().matchType.matchType()+ " " 
                   + $('<div/>').text(this.getSieve().keyList.toScript()).html()+"</em>");
  };
  
  //------------------------------------------------------------------------------------------------------------/
  
  
  /**
   * A UI Element wrapper which collets all possbile transforms and renders them
   * It keeps treck of the currently selected transform.
   * 
   * @param {} elm
   */
  
  function SieveBodyTransformUI(elm)
  {
    SieveAbstractBoxUI.call(this,elm);
    
    // TODO chekc if the element is a body transform..
  }
  
  SieveBodyTransformUI.prototype = Object.create(SieveAbstractBoxUI.prototype);
  SieveBodyTransformUI.prototype.constructor = SieveBodyTransformUI;
  
  SieveBodyTransformUI.nodeName = function () {
    return "body-transform";
  };
  
  SieveBodyTransformUI.nodeType  = function () {
    return "comparison";
  };
  
  SieveBodyTransformUI.prototype.update
      = function (value)
  { 
    this.getSieve().bodyTransform(value);
  };
  
  SieveBodyTransformUI.prototype.createHtml
      = function ()
  {
    var type = this.getSieve().type;
    
    var item =  $("<div/>")
      .addClass("sivBodyTransform");
    
    var widgets = SieveDesigner.getWidgetsByClass("body-transform/",this.id());
    
    var that = this;
    
    widgets.forEach(function(element) { 
      item.append(element.html(type, function(val) { that.update(val); } ));
    });
    
    
    var value = this.getSieve().bodyTransform();
     
    return item;
  };
  
  
  //----------------------------------------------------------------------------------------------------//
  
  function SieveRawTransformUI(id)
  {
    this.id = id;
  }
  
  
  SieveRawTransformUI.nodeName = function () {
    return "body-transform/raw";
  };
  
  SieveRawTransformUI.nodeType  = function () {
    return "body-transform/";
  };
  
  SieveRawTransformUI.isCapable = function (capabilities) {
    // TODO support capabilities...
    return true;      
  };
  
  SieveRawTransformUI.prototype.html 
      = function(type, callback) {
  
    var radio = 
      $("<input/>")
        .attr("type","radio")
        .attr("name","rgBodyTransform"+this.id)
        .attr("value",":content")
        .css("float","left");
            
    if (type.nodeName() == SieveRawTransformUI.nodeName())
      radio.prop('checked', true);          	
    
    radio.change( function() { callback(":raw"); } );  
    
    return $("<div/>")
       .css("overflow","auto")
       .append(radio)
       .append($("<span/>").text("Match against the entire undecoded message body").css("float","left"));      
  };
  
  //---------------------------------------------/
  
  function SieveContentTransformUI(id)
  {
  	 this.id = id;
  }
  
  
  SieveContentTransformUI.nodeName = function () {
    return "body-transform/content";
  };
  
  SieveContentTransformUI.nodeType  = function () {
    return "body-transform/";
  };
  
  SieveContentTransformUI.isCapable = function (capabilities) {
    return true;      
  };
  
  SieveContentTransformUI.prototype.html 
      = function(type, callback) {
      
    // Create the elements
    var radio = 
      $("<input/>")
        .attr("type","radio")
        .attr("name","rgBodyTransform"+this.id)
        .attr("value",":content")
        .css("float","left");
     
    var text = 
      $("<input/>");      
      
    // in case the current element is equivalent with this element
    // we need to update the values.
    if (type.nodeName() == SieveContentTransformUI.nodeName()) {
      radio.prop('checked', true); 
      text.val(type.contentTypes.toScript());
    }
      
    // Add the changed handler. In this case it will fire when the radio button is selected and
    //  when the text was changes but only if the radio button is activated
    var handler = function() {
      if (!radio.prop("checked"))
        return;
        
     var value = text.val();
     
  
     if (value === "")
       value = '[""]';
     
      callback(":content "+value);
    };    
      
    radio.change( handler );
    text.change(handler);
  
    return $("<div/>")
        .css("overflow","auto")
        .append(radio)
        .append($("<div/>")
          .append($("<span/>").text("Match against the MIME parts that have the specified content types:"))
          .append("<br/>")
          .append(text));
          	
  };
  
  
  
  function SieveTextTransformUI(id)
  {
    this.id = id;
  }
  
  
  SieveTextTransformUI.nodeName = function () {
    return "body-transform/text";
  };
  
  SieveTextTransformUI.nodeType  = function () {
    return "body-transform/";
  };
  
  SieveTextTransformUI.isCapable = function (capabilities) {
    // TODO support capabilities...
    return true;      
  };
  
  SieveTextTransformUI.prototype.html 
      = function(type, callback) {
  
    var radio = 
      $("<input/>")
        .attr("type","radio")
        .attr("name","rgBodyTransform"+this.id)
        .attr("value",":text")
        .css("float","left");
             
    if (type.nodeName() == SieveTextTransformUI.nodeName())
      radio.prop("checked",true);             
    
    radio.change( function() { callback(":text"); } );  
    
    return $("<div/>")
       .css("overflow","auto")
       .append(radio)
       .append($("<span/>").text("Match against the decoded message body. (Default)").css("float","left"));      
  };
  
  
  //************************************************************************************
  
  if (!SieveDesigner)
    throw "Could not register Body Extension";
  
  SieveDesigner.register("body-transform", "comparison", SieveBodyTransformUI);
  
  SieveDesigner.register2(SieveTextTransformUI);
  SieveDesigner.register2(SieveRawTransformUI);
  SieveDesigner.register2(SieveContentTransformUI);
  
  
  SieveDesigner.register("test/body", SieveBodyUI);

})(window);