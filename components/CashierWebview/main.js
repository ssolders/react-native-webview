'use strict';

function hasLoaded() {
  alert(1);
}

(function() {
  alert(1);
  var body = document.getElementsByTagName('BODY')[0];
  body.style.backgroundColor = 'yellow';
})();
