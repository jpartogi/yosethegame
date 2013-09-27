var home 			 = require('../public/js/home.page');
var cheerio 		 = require('cheerio');
var InMemoryDatabase = require('./support/InMemoryDatabase');

describe('Home page building', function() {

	it('is based on player line template', function() {
		var html = '<ul id="players"><li class="player"></li></ul>';
		var page = cheerio.load(html);
		
		expect(home.extractPlayerTemplateIn(page)).toEqual('<li class="player"></li>');
	});
	
	it('bulds two lines when there are 2 players', function() {
		var players = [
				{ login: 'me' },
				{ login: 'you' }
			];
		var html = '<ul id="players"><li class="player"></li></ul>';
		var page = cheerio.load(html);		
		var list = home.buildPlayerList(page, players);
		
		expect(cheerio.load(list)('.player').length).toEqual(2);
	});
	
	it('replaces the template by the player list', function() {
		var players = [
				{ login: 'me' },
				{ login: 'you' }
			];
		var html = '<ul id="players"><li class="player"></li></ul>';
		var page = cheerio.load(html);		
		var output = home.insertPlayerList(page, players);

		expect(cheerio.load(output)('#players .player').length).toEqual(2);
	});
	
	describe('player line', function() {
	
		var template = '<li class="player"><img src=""><span class="level">Level</span></li>';
		var line;
		
		beforeEach(function() {
			line = home.buildLine(template, { avatar: 'me.png' } );
		});
	
		it('contains the avatar', function() {
			expect(cheerio.load(line)('.player img')[0].attribs.src).toEqual('me.png');
		});
		
		describe('Level mentionned', function() {
			
			beforeEach(function() {
			});

			it('is level 1 when the player is a new player', function() {
				line = home.buildLine(template, { avatar: 'me.png' } );
				
				expect(cheerio.load(line)('.player .level').text()).toEqual('Level 1');
			});
			
			it('is level 2 when player has completed level 1', function() {
				var database = { levels: [
						{ number: 1, challenges: [ { title: 'challenge 1.1' } ] },
						{ number: 2, challenges: [ { title: 'challenge 2.1' } ] }
					]}
				line = home.buildLine(template, { avatar: 'me.png' }, database );

				expect(cheerio.load(line)('.player .level').text()).toEqual('Level 2');
			});
		});
		
	});
	
});