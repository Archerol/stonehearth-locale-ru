$.getJSON('/stonehearth/locales/supported_languages.json', function(data) {
   var supportedLanguages = data.languages;
   radiant.call('radiant:get_config', 'language')
   .done(function(o) {
      // Grab the default language from our configuration settings.
      var language = o.language;
      if (!language || !(language in supportedLanguages)) {
         language = 'en'
      }

      var languageData = supportedLanguages[language];

      if (languageData.path) {
         $.getJSON(languageData.path, function(data) {
            var tmpResStore = {};
            tmpResStore[language] = {'stonehearth': data};
            init_i18n(language, tmpResStore);
         })
      } else if (languageData.paths) {
         var resource = {};
         var count = 0;

         for (var i = 0; i < languageData.paths.length; i++) {

            $.getJSON(languageData.paths[i], function(data) {
               $.extend(true, resource, data);
               count++;

               if (languageData.paths.length == count) {
                  var tmpResStore = {};
                  tmpResStore[language] = {'stonehearth': resource};
                  init_i18n(language, tmpResStore);
               }
            })
         };
      } else {
         init_i18n(language);
      }

   });
});