const RelpConnectionState = require("../../main/js/RelpConnectionState");


describe('Check the enum type', () => {
    let state = RelpConnectionState.OPEN;
    it('Check with OPEN state', () => {
        console.log(state.toString());
        expect(state.toString()).toEqual('RelpConnectionState.OPEN');
    });

})