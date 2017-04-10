/**
* A JavaScript implementation of Microdata to JSON-LD Converter
* @author Peter Kalchgruber
*
* Copyright 2017,  All rights reserved.
*/


(function(window){
  'use strict';
  function convert(){
    var _converterObject = {};

    /**
     * Remove Spaces, Linebreaks...
     * @param {String} val
     * @return {String} val
     */
    function _clean(val){
      if(typeof val == 'undefined' || typeof val === 'object')
        return val;
      return (val.replace(/(\r\n|\n|\r})/gm,'').replace(/\s\s+/g,' ')).trim();
    }

    /**
     * Retrieve values of HTML element 
     * @param {DOM object} el
     * @return {String} value
     */
    function _getval(el){
      return _clean($(el).attr('href') || $(el).prop('content') || $(el).text() || $(el).attr('src'));
    }

    /**
     * Append value to json-ld object. If property is already assigned, create array and return object
     * @param {object} el
     * @param {String} key
     * @param {String} val
     * @return {object} el
     */
    function _append(el,key,val){
      if(key in el && Array.isArray(el[key])){
        el[key].push(val);
      }else if(key in el){
        el[key] = jQuery.makeArray(el[key]);
        el[key].push(val);
      }else{
        el[key] = val;
      }
      return el;
    }

    /**
     * Convert Microdata element to JSON-LD object
     * @param {object} topel 
     * @return {object} im
     */
    function _get(topelem){
      var im={};
      im['@type'] = $(topelem).attr('itemtype');
      $(topelem).find('[itemprop]').attr('itemprop', function(i, key) {
        if ($(this).parents('[itemscope]').get(0) == topelem){
          if ($(this).is('[itemscope]') && $(this).is('[itemprop]')) {
            var subitem = _get(this);
            im = _append(im,$(this).attr('itemprop'),subitem);
          }else{
            var val = _getval(this);
            im = _append(im,key,val);
          }
        }
      });
      return im;
    }

    /**
    *  Convert all microdata elements in json-ld format.
    *  Need to filter to only convert top-itemscope elements and further to only process 
    *  itemprops that are direct child of current itemscope element and not process values
    *  that contain other itemprop elements
    *  @return {Object} item
    */
    _converterObject.convert = function(){
      var item = [];
      $('[itemscope]').map(function(i, el){
        if($(el).parents('[itemscope]').length == 0){ //only proceed with top itemscope entries
          item.push(_get(el));
        }
      });
      
      if(item.length>1){
        jsonld={};
        jsonld['@context'] = 'http://schema.org/';
        jsonld['@graph'] = item
        return jsonld;
      }else if(item.length==1){
        item[0]['@context'] = 'http://schema.org/';
        return item[0];
      }else{
        return null;
      }

    }
    return _converterObject;

  }



  if(typeof(window.converter) === 'undefined'){
    window.converter = convert();
  }
})(window); // We send the window variable withing our function

