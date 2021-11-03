const AbstractRelpFrame = require('../../main/js/AbstractRelpFrame');

describe('AbstractRelpFrame Instantiation try', () => {
    var AbstractRelpFrameInstance = new AbstractRelpFrame( 'syslog', 5);

    it('Should not be instantiated', () => {
        expect('This is an abstract, cannot be instantiated.')
    });
});