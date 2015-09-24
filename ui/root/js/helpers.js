
i18n.addPostProcessor("localizeEntityName", function(value, key, isFound, opts) {
   //i18n(__i18n_data.entity_display_name__, {\"self.unit_info.custom_name\":\"__i18n_data.entity_custom_name__\"})

   var nameHelperPrefix = '[name(';
   var nameHelperSuffix = ')]';
   var replacementCounter = 0;
   var maxRecursion = 4;
   opts.postProcess = null;

   function localizeName(translated, options) {
      while (translated.indexOf(nameHelperPrefix) != -1) {
         replacementCounter++;
         if (replacementCounter > maxRecursion) {
            break;
         } // safety net for too much recursion
         var index_of_opening = translated.lastIndexOf(nameHelperPrefix);
         var index_of_end_of_closing = translated.indexOf(nameHelperSuffix, index_of_opening) + nameHelperSuffix.length;

         if (index_of_end_of_closing <= index_of_opening) {
             f.error('there is an missing closing in following translation value', translated);
             return '';
         }

         var token = translated.substring(index_of_opening, index_of_end_of_closing);
         var token_without_symbols = token.replace(nameHelperPrefix, '').replace(nameHelperSuffix, '');


         // get wordCase from language-modified token
         var wordCase = (function () {
            var arr = token_without_symbols.split('|');
            
            if (arr.length == 2) {
               token_without_symbols = arr[0];
               return arr[1];
            } else {
               return false;
            }
         })();


         var customNameKey = i18n.options.interpolationPrefix + token_without_symbols + "_custom_name" + i18n.options.interpolationSuffix;
         var customName = i18n.applyReplacement(customNameKey, opts);
         var isFullEntity = false;
         if (customName == customNameKey) {
            customNameKey = i18n.options.interpolationPrefix + token_without_symbols + ".unit_info.custom_name" + i18n.options.interpolationSuffix;
            customName = i18n.applyReplacement(customNameKey, opts);
            isFullEntity = true;
         }
         
         var newToken = i18n.options.interpolationPrefix + token_without_symbols + (isFullEntity ? ".unit_info.display_name" : "_display_name") + i18n.options.interpolationSuffix;
         var replacedToken = i18n.applyReplacement(newToken, opts);
         opts['self'] = {
            'unit_info': {
               'custom_name': customName
            }
         };
         opts.defaultValue = i18n.t("stonehearth:ui.game.entities.unknown_name");


         // select word case <<
         var translatedToken = (function (token) {
            var translate;
            var defaultWordCase = 'i';
            
            // if token hasn't got a Case
            if (wordCase === false) {
               return i18n.t(token, opts);
            } 

            // choose the Case
            translate = i18n.t(token.slice(0, -1) + '.' + wordCase + ')', opts);
            if (translate !== opts.defaultValue) {
               return translate;
            } 

            // choose Default Case
            translate = i18n.t(token.slice(0, -1) + '.' + defaultWordCase + ')', opts);
            if (translate !== opts.defaultValue) {
              return translate;
            }

            // hasn't got Cases -> default Behavior 
            return i18n.t(token, opts);

         })(replacedToken);
         

         translated = translated.replace(token, translatedToken);
     }
     return translated;
   }
 
   if (value.indexOf("[name(") >= 0) {
      var newValue = localizeName(value, opts);
      newValue = i18n.applyReplacement(newValue, opts);
      return newValue;
   }
   
   if (value == key && !isFound) {
      return undefined;
   }

   return value;
});