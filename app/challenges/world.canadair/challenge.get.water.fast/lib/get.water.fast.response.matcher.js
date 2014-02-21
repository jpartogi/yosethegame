var urlParser           = require('url');
var error501            = require('../../../common/lib/501');
var equal               = require('deep-equal');
var array               = require('../../../../utils/lib/array.utils');
var Requester           = require('./get.water.fast.requester');

var planePositionIn     = require('../../challenge.first.fire/lib/plane.position.in.map');
var whatIsBelowPlaneIn  = require('../../challenge.first.fire/lib/what.is.below.plane');

var moveUntilWaterOrEnd = function(plane, map, moves) {
    var waterFound = false;     
    array.forEach(moves, function(offset) {
        if (!waterFound) {
            plane.move(offset);
            if (whatIsBelowPlaneIn(map, plane) == 'W') {
                waterFound = true;
            }
        }
    });    
};

module.exports = {

    hasExpectedContentType: function(response) {
        return response.headers !== undefined &&
               response.headers['content-type'] !== undefined &&
               response.headers['content-type'].indexOf('application/json') !== -1;
    },
    
    extractSentMap: function(query) {
        var mapWidth = query.width;
        var regex = new RegExp('.{' + mapWidth + '}', 'g');

        return query.map.match(regex);
    },
    
	validate: function(url, remoteResponse, content, callback) {
        var query = urlParser.parse(url, true).query;
        var sentMap = this.extractSentMap(query);

        if (remoteResponse === undefined) {
            callback(error501.withValues('A Json object', 'An empty response'));
            return;
        }

        if (! this.hasExpectedContentType(remoteResponse)) {
            callback(error501.withValues('A content-type application/json in header', 'A different content-type'));
            return;
        }
        
        var answer;
        try {
            answer = JSON.parse(content);
        }
        catch (e) {
            callback(error501.withValues('A Json object', '"' + content + '"'));
            return;
        }

        if (answer === null || answer.map === undefined) {
            callback(error501.withValues('A Json object with map and moves', 'missing field "map"'));
            return;
        }

        if (!equal(answer.map, sentMap)) {
            callback(error501.withValues('A Json object with map = ' + JSON.stringify(sentMap), 'map = ' + JSON.stringify(answer.map)));
            return;
        }

        if(answer.moves === undefined) {
            callback(error501.withValues('A Json object with map and moves', 'missing field "moves"'));
            return;
        }

        if(answer.moves.length === undefined) {
            callback(error501.withValues('moves should be in an array', 'moves = ' + answer.moves));
            return;
        }

        var stop = false;
        array.forEach(answer.moves, function(move) {
            if (move.dx === undefined || move.dy === undefined) {
                callback(error501.withValues('Each move should have fields dx and dy', 'moves = ' + JSON.stringify(answer.moves)));
                stop = true;
                return;
            }
            if (move.dx*move.dx > 1 || move.dy*move.dy > 1) {
                callback(error501.withValues('Possible values for dx and dy are -1, 0 or 1', 'one move { dx:' + move.dx + ', dy:' + move.dy + ' }'));
                stop = true;
                return;
            }
        });
        if (stop) { return; }

        var target = new Requester().candidateHavingMap(query.map).target;
        var plane = planePositionIn(sentMap); 
        
        moveUntilWaterOrEnd(plane, sentMap, answer.moves);          
        if (whatIsBelowPlaneIn(sentMap, plane) == 'W') {
            if (equal(plane, target)) {
                callback({
                    code: 200,
                    expected: 'Your plane must reach water at ' + JSON.stringify(target),
                    got: 'You did it!'
                });
                return;
            } else {
                callback(error501.withValues('Your plane must first reach water at ' + JSON.stringify(target), 
                                             'plane reached another water point. moves=' + JSON.stringify(answer.moves)));
                return;
            }
        } else {
            callback(error501.withValues('Your plane must reach water at ' + JSON.stringify(target), 
                                         'plane never reached target. moves=' + JSON.stringify(answer.moves)));
            return;
        }
	}
};