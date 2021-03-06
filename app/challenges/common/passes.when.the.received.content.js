var json200 = require('./lib/json200');

module.exports = {

	is: function(expected, matcher) {
		
        describe(matcher.name + ' > When the received content is correct,', function() {

			var status;

            beforeEach(function(done) {
                matcher.validate({}, json200, JSON.stringify(expected), function(receivedStatus) {
                    status = receivedStatus;
                    done();
                });
            });

            it('sets code to 200', function() {
                expect(status.code).toEqual(200);
            });
        
            it('sets expected', function() {
                expect(status.expected.body).toEqual(expected);
            });
        
            it('sets actual', function() {
                expect(status.got.body).toEqual(expected);
            });
        }); 
	}
};