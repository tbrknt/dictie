
/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}


function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function putSearchResults(text){
	var loIframe = document.getElementById('tbrkntLookupIframe');
	var loDiv = loIframe.contentDocument.getElementById('tbrkntLookupDiv');
	loDiv.innerHTML = text;
	loIframe.style.visibility = 'visible';
}

function sendMyRequest(url, responseCallback){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = responseCallback;
	xhttp.open("GET", url, true);
	xhttp.send();
}

// handler functions for ajax requests' responses
var myRespText;
var responseHandlers = [
	// tureng result handling
	function (){
		if (this.readyState == 4 && this.status == 200) {
			var respText = this.responseText;
			var tableIdInd = respText.indexOf("englishResultsTable");
			var tableInd = respText.substring(0,tableIdInd).lastIndexOf("<table");
			var subResp = respText.substring(tableInd);
			subResp = subResp.substring(0,subResp.indexOf("</table")) +"</table>";
			putSearchResults(subResp);		
		}
	},
	// tdk result handling
	function (){
		if (this.readyState == 4 && this.status == 200) {
			var respText = this.responseText;
			var tableIdInd = respText.indexOf("hor-minimalist-a");
			var tableInd = respText.substring(0,tableIdInd).lastIndexOf("<table");
			var subResp = respText.substring(tableInd);
			subResp = subResp.substring(0,subResp.indexOf("</table")) +"</table>";
			putSearchResults(subResp);		
		}
	},
	// oxford result handling
	function (){
		if (this.readyState == 4 && this.status == 200) {
			var respText = this.responseText;
			var sectionIdInd = respText.indexOf("senseGroup");
			var sectionInd = respText.substring(0,sectionIdInd).lastIndexOf("<section");
			var subResp = respText.substring(sectionInd);
			subResp = subResp.substring(0,subResp.indexOf("</section")) +"</section>";
			putSearchResults(subResp);		
		}
	},
	// nisanyan result handling
	function (){
		if (this.readyState == 4 && this.status == 200) {
			var respText = this.responseText;
myRespText = respText;
			var divClassInd = respText.lastIndexOf("hghlght2");
			var divInd = respText.substring(0,divClassInd).lastIndexOf("<div"); 
			var subResp = respText.substring(divClassInd);
			var divEndInd = subResp.substring(0,subResp.indexOf("class=\"yaz ")).lastIndexOf("<div");
			divEndInd += divClassInd;
			subResp = respText.substring(divInd,divEndInd);
			console.log(subResp);
			putSearchResults(subResp);		
		}
	}
];

var requestURLs = [
	'http://tureng.com/en/turkish-english/',
	'http://www.tdk.gov.tr/index.php?option=com_gts&arama=gts&kelime=',
	'http://www.oxforddictionaries.com/search/?direct=1&multi=1&dictCode=english&q=',
	'http://www.nisanyansozluk.com/?k='
];

var buttonTexts = [
	'Tureng',
	'TDK',
	'Oxford',
	'Nisanyan'
];

var tbrkntClickFunctions = [];

for (i = 0; i < requestURLs.length; i++) {
    tbrkntClickFunctions[i] =
		(function(rURL,I){
			return function(){
				console.log(rURL+tbrkntSelectedText);
				sendMyRequest(rURL+tbrkntSelectedText, responseHandlers[I]);
			};
		})(requestURLs[i],i);
}


// creating popup iframe
var tbrkntLookupIframe = document.createElement('iframe');
tbrkntLookupIframe.id = 'tbrkntLookupIframe';
tbrkntLookupIframe.style.visibility = 'hidden';
document.body.appendChild(tbrkntLookupIframe);

// creating buttons for different sites
for(i = 0; i<tbrkntClickFunctions.length;i++){
	var tbrkntLookupButton = tbrkntLookupIframe.contentDocument.createElement('button');
	tbrkntLookupButton.addEventListener("click",tbrkntClickFunctions[i]);
	tbrkntLookupButton.innerHTML = buttonTexts[i];
	tbrkntLookupIframe.contentDocument.body.appendChild(tbrkntLookupButton);
}

// creating results div inside iframe
var tbrkntLookupDiv = tbrkntLookupIframe.contentDocument.createElement('div');
tbrkntLookupDiv.id = 'tbrkntLookupDiv';
tbrkntLookupIframe.contentDocument.body.appendChild(tbrkntLookupDiv);

var tbrkntSelectedText;
document.body.onmouseup = function(){
	tbrkntSelectedText = document.getSelection().toString();
	tbrkntClickFunctions[0]();
};



/*  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + url);

    getImageUrl(url, function(imageUrl, width, height) {

      renderStatus('Search term: ' + url + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });*/

