var $ = $ || require('jquery');

function TryListener() {	
};

TryListener.prototype.try = function() {
	startAnimation();
	hideResults();
	$.get('/try-all-up-to?login=' + $('#login').text() + '&server=' + $('#server').val())
		.success(this.displayResults);
};

TryListener.prototype.displayResults = function(data) {
	stopAnimation();
	showResults();
	var results = $.parseJSON(data);
	if (results.length == 0) return;
	
	var result_n_html = $('#result_1')[0].outerHTML;
	$('.result').remove();

	var canContinue = true;
	for (var i=0; i<results.length; i++) {
		var result_i_html = result_n_html.replace('result_1', 'result_' + (i+1));
		$('#results').append(result_i_html);

		var result = results[i];
		$('#result_' + (i+1) + ' .challenge').text(result.challenge);
		$('#result_' + (i+1) + ' .status').text(result.code);
		$('#result_' + (i+1) + ' .expected').text(JSON.stringify(result.expected));
		$('#result_' + (i+1) + ' .got').text(JSON.stringify(result.got));

		if (result.code != 200) {
			canContinue = false;
		}
	}

	if (canContinue) {
		$('#continue').removeClass('hidden').addClass('visible');
	} else {
		$('#continue').removeClass('visible').addClass('hidden');
	}
};

var startAnimation = function() {
	$('#avatar').addClass('rotate');	
};
var stopAnimation = function() {
	$('#avatar').removeClass('rotate');	
};
var hideResults = function() {
	$('#results').removeClass('visible').addClass('hidden');	
};
var showResults = function() {
	$('#results').removeClass('hidden').addClass('visible');	
};

var module = module || {};
module.exports = TryListener;