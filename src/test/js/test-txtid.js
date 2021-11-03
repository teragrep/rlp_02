
const TxID = require("../../main/js/TxID");


    describe("Generating the TransactionID", () => {
     var  txId = new TxID();
     txId._transactionIdentifier = 999999999;

    
        it("Generating monotical TxID after 999999999", () => {
            expect(txId.getNextTransactionIdentifier()).toBe(1);
        });
    });

/* Simple test
describe('Array', () => {
    describe('#indexOf()', () => {
      it('should return -1 when the value is not present', () => {
      expect(-1, [1,2,3].indexOf(4));
      });
    });
  });
*/