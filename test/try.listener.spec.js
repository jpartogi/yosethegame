var $ = require('jquery');
var TryListener = require('../public/js/try.listener');

describe("TryListener: ", function() {

	var listener = new TryListener();
	
	describe('Request sent:', function() {
	
		beforeEach(function() {
			$('body').append('<label id="login">eric</label>');
			$('body').append('<input id="server"/>');			
		});
		
		afterEach(function() {
			$('#login').remove();
			$('#server').remove();
		});
		
		it("send a get request to the chosen server", function() {
			$('#server').val('any');
			spyOn($, 'get').andCallThrough();
			listener.try();

			expect($.get).toHaveBeenCalledWith('/try-all-up-to?login=eric&server=any');
		});
	});
	
	describe('Avatar animation', function() {

		beforeEach(function() {
			$('body').append('<img id="avatar" />');
			$('body').append('<input id="server"/>');
			$('#server').val('any');
		});
		
		afterEach(function() {
			$('#server').remove();
			$('#avatar').remove();			
		});
		
		it('starts when a try is triggered', function() {
			listener.try();
			expect($('#avatar').attr('class')).toContain('rotate');
		});
		
		it('stops when success', function() {
			$('#avatar').addClass('rotate');
			listener.displayResults('[]');
			expect($('#avatar').attr('class')).toNotContain('rotate');
		});
		
	});
	
	describe('Results display', function() {
		
		beforeEach(function() {
			$('body').append(
				'<div id="results">' +
					'<div id="result_1" class="result">' +
						'<label class="challenge">challenge</label>' +
						'<label class="status">status</label>' +
						'<label class="expected">expected</label>' +
						'<label class="got">got</label>' +
					'</div>' +
				'</div>'
			);
		});
		
		afterEach(function() {
			$('#results').remove();
		});
		
		describe('Show / hide results', function() {

			afterEach(function() {
				$('#results').remove();			
			});

			it('hides the results when a try is triggered', function() {
				listener.try();
				expect($('#results').attr('class')).toContain('hidden');
				expect($('#results').attr('class')).toNotContain('visible');
			});

			it('shows the results when success', function() {
				$('#results').removeClass('visible').addClass('hidden');
				listener.displayResults('[{}]');
				expect($('#results').attr('class')).toNotContain('hidden');
				expect($('#results').attr('class')).toContain('visible');
			})
		});

		describe('One result display', function() {

			beforeEach(function() {
				listener.displayResults(JSON.stringify([
					{
						challenge: 'this-challenge',
						code: 200,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					}
				]));	
			});

			it('displays the first result : the challenge name', function() {
				expect($('#result_1 .challenge').text()).toEqual('this-challenge');
			});
			it('displays the first result : the status', function() {
				expect($('#result_1 .status').text()).toEqual('200');
			});
			it('displays the first result : the expected', function() {
				expect($('#result_1 .expected').text()).toEqual(JSON.stringify({ question: 'any', answer: 42 }));
			});
			it('displays the first result : the actual', function() {
				expect($('#result_1 .got').text()).toEqual(JSON.stringify({ flag: true }));
			});

		});

		describe('Two results display', function() {

			beforeEach(function() {
				listener.displayResults(JSON.stringify([
					{
						challenge: 'one',
						code: 1,
						expected: { one: 1 },
						got: { oneone: 11 }
					},
					{
						challenge: 'second',
						code: 2,
						expected: { two: 2 },
						got: { twotwo: 2 }
					}
				]));	
			});

			describe('The challenges column', function() {

				it('displays the first result', function() {
					expect($('#result_1 .challenge').text()).toEqual('one');
				});

				it('displays the second result', function() {
					expect($('#result_2 .challenge').text()).toEqual('second');
				});

			});
			
			describe('Multiple calls', function() {
				
				beforeEach(function() {
					listener.displayResults(JSON.stringify([
						{
							challenge: 'one',
							code: 200,
							expected: { question: 'any', answer: 42 },
							got: { flag: true }
						},
						{
							challenge: 'one',
							code: 200,
							expected: { question: 'any', answer: 42 },
							got: { flag: true }
						}
					]));	
					listener.displayResults(JSON.stringify([
						{
							challenge: 'second',
							code: 200,
							expected: { question: 'any', answer: 42 },
							got: { flag: true }
						}
					]));	
				});

				it('displays the second result', function() {
					expect($('#result_1 .challenge').text()).toEqual('second');
				});

				it('updates the table to only display one line', function() {
					expect($('.result').length).toEqual(1);
				});
			});

		});

		describe('Invitation to continue', function() {

			beforeEach(function() {
				$('body').append('<label id="continue" class="hidden">continue</label>');
			});

			afterEach(function() {
				$('#continue').remove();
			});

			it('becomes visible when success (code == 200)', function() {
				listener.displayResults(JSON.stringify([
					{
						challenge: 'this-challenge',
						code: 200,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					}
				]));
				expect($('#continue').attr('class')).toNotContain('hidden');
				expect($('#continue').attr('class')).toContain('visible');
			});

			it('remains hidden otherwise (code != 200)', function() {
				listener.displayResults(JSON.stringify([
					{
						challenge: 'this-challenge',
						code: 404,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					}
				]));
				expect($('#continue').attr('class')).toContain('hidden');
				expect($('#continue').attr('class')).toNotContain('visible');
			});

			it('remains hidden if one result is not passing', function() {
				listener.displayResults(JSON.stringify([
					{
						challenge: 'one',
						code: 404,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					},
					{
						challenge: 'two',
						code: 200,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					}
				]));
				expect($('#continue').attr('class')).toContain('hidden');
				expect($('#continue').attr('class')).toNotContain('visible');
			});
			
			it('hides back when a second try is failing', function() {
				listener.displayResults(JSON.stringify([
					{
						challenge: 'this-challenge',
						code: 200,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					}
				]));
				listener.displayResults(JSON.stringify([
					{
						challenge: 'this-challenge',
						code: 404,
						expected: { question: 'any', answer: 42 },
						got: { flag: true }
					}
				]));
				expect($('#continue').attr('class')).toContain('hidden');
				expect($('#continue').attr('class')).toNotContain('visible');
			});
		});

	});	
	
});