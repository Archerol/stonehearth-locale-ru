
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
            
            // if token has a Case -> check this Case
            if (wordCase !== false) 
            {
               translate = i18n.t(token.slice(0, -1) + '_.' + wordCase + ')', opts);
               if (translate !== opts.defaultValue) {
                  return translate;
               } 
            }

            // hasn't got Cases -> default Behavior 
            return i18n.t(token, opts);

         })(replacedToken);
         

         translated = translated.replace(token, translatedToken);
     }

     return translated;
   }


   function localizeCase(translated, options) {
      var nameHelperPrefix = '[str(';
      var nameHelperSuffix = ')]';

      while (translated.indexOf(nameHelperPrefix) != -1) {

         var index_of_opening = translated.lastIndexOf(nameHelperPrefix);
         var index_of_end_of_closing = translated.indexOf(nameHelperSuffix, index_of_opening) + nameHelperSuffix.length;
         var token = translated.substring(index_of_opening, index_of_end_of_closing);
         var token_without_symbols = token.replace(nameHelperPrefix, '').replace(nameHelperSuffix, '');

         if (index_of_end_of_closing <= index_of_opening) {
            console.error('there is an missing closing in following translation value', translated);
            return '';
         }

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

         options.defaultValue = i18n.translate("stonehearth:ui.game.entities.unknown_name");


         // select word case <<
         var translatedToken = (function (token, options) {
            var translate;

            function deepFind(obj, path) {
               var paths = path.split('.')
                   , current = obj
                   , i;

               for (i = 0; i < paths.length; ++i) {
                  if (current[paths[i]] == undefined) {
                    return undefined;
                  } else {
                    current = current[paths[i]];
                  }
               }
               return current;
            }

            var optToken = deepFind(options, token);

            if (typeof optToken === 'undefined') {
               return "***";
            }

            // if token has a Case -> check this Case
            if (wordCase !== false) 
            {
               var translate = i18n.t(optToken.slice(0, -1) + '_.' + wordCase +')', options);
               if (translate !== options.defaultValue) {
                  return translate;
               }
            }

            // hasn't got Cases -> default Behavior 
            return i18n.t(optToken, options);
          
         })(token_without_symbols, options);
      
         translated = translated.replace(token, translatedToken);
      }

      return translated;
   }

   if (value.indexOf("[name(") >= 0 || value.indexOf("[str(") >= 0) {
      var newValue = localizeName(value, opts);

      newValue = localizeCase(newValue, opts);

      newValue = i18n.applyReplacement(newValue, opts);

      return newValue;
   }

   if (value == key && !isFound) {
      return undefined;
   }

   return value;
});