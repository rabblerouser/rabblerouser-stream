const AWS = require('aws-sdk');

const publisher = require('../src/publisher');

describe('publisher', () => {
  let sandbox;
  let putRecord;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    putRecord = sandbox.stub().returns({ promise: () => {} });
    sandbox.stub(AWS, 'Kinesis').returns({ putRecord });
  });

  afterEach(() => {
    sandbox.restore();
  })

  it('should require settings to be given', () => {
    expect(() => { publisher() }).to.throw(Error, /No settings defined./);
  });

  it('should require a stream name', () => {
    expect(() => { publisher({}) }).to.throw(Error, /No stream defined./);
  });

  it('returns a function that can put records to kinesis', () => {
    const publish = publisher({ stream: 'my-stream' });
    publish({ type: 'some-type', data: { some: 'data' } });

    expect(putRecord).to.have.been.calledWith({
      Data: '{"type":"some-type","data":{"some":"data"}}',
      PartitionKey: 'some-type',
      StreamName: 'my-stream',
    });
  });

  it('refuses to send events without a type', () => {
    const publish = publisher({ stream: 'my-stream' });

    expect(() => { publish({ data: {} }) }).to.throw(Error, /No event type defined./);
  });

  it('refuses to send events without data', () => {
    const publish = publisher({ stream: 'my-stream' });

    expect(() => { publish({ type: {} }) }).to.throw(Error, /No event data defined./);
  });
});
