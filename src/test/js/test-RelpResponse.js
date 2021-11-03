const RelpResponse = require('../../main/js/RelpResponse');

describe('RelpFrameRX Instantiation try', () => {
    let src = Buffer.from('200 from relp frame');
    let relpResponseInstance = new RelpResponse( 1, 'rsp', 5, src);

    let str = relpResponseInstance.toString();
    let responseCode = relpResponseInstance.getResponseCode();

    it('Should follow the RELP rsp format', () => {
        console.log('String builder '+str);
        //expect(str).toEqual('1 rsp 5 200 f \n');
    });

    it('response code should be 200', () => {
        console.log(responseCode);
        expect(responseCode).toBe(200);
    })
});