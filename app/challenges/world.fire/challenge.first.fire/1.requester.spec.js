var Requester = require('./lib/first.fire.requester');
var array = require('../../../utils/lib/array.utils');

describe('First fire challenge requester', function() {
	
	var requester;
	
	beforeEach(function() {
		requester = new Requester('this-server');
	});
	
	it('suppresses training slash from the given server url', function() {
        expect(new Requester('this-url/').server).toEqual('this-url');
	});
	
	describe('target url', function() {
		
		var url;
		
		beforeEach(function() {
            requester.mapWidth = function() { return 2; };
            requester.map = function() { return "AWONDERFULMAP"; };

            url = requester.url();
		});
		
		it('points to the fire fighter url', function() {
			expect(url).toEqual('this-server/fire/geek?width=2&map=AWONDERFULMAP');
		});
		
	});
	
	describe('Candidate list', function() {

        it('is not empty', function() {
            expect(requester.candidates.length).toBeGreaterThan(3);
        });

        it('is made of elements containing a map', function() {
            array.forEach(requester.candidates, function(candidate) {
                expect(candidate.map).toBeDefined();
            });
        });

        it('is made of elements containing the width of the map', function() {
            array.forEach(requester.candidates, function(candidate) {
                expect(candidate.width).toBeDefined();
            });
        });
        
        it('is made of map with correct size', function() {
            array.forEach(requester.candidates, function(candidate) {
                expect(candidate.map.length % candidate.width).toEqual(0);
            });
        });

        it('is used when choosing a candidate', function() {
            requester.candidates = [ { map: 'this map', width: 23 } ];
            requester.candidateIndex = function() { return 0; };

            expect(requester.mapWidth()).toEqual(23);
            expect(requester.map()).toEqual('this map');
        });
    });

    describe('Candidate choice', function() {

        it('is random', function() {
            var first = requester.candidateIndex();
            var different = false;
            array.forEach([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(index) {
                different = different || (requester.candidateIndex() !== first);
            });

            expect(different).toEqual(true);
        });

        it('is made in the candidate list range', function() {
            var outOfRange = false;
            array.forEach([1, 2, 3, 4, 5], function(index) {
                var candidateIndex = requester.candidateIndex();
                outOfRange = outOfRange || (candidateIndex >= requester.candidates.length);
            });

            expect(outOfRange).toBe(false);
        });
    });
	
});