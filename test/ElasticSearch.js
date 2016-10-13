const assert = require('chai').assert;

const env = require('../env');
const ElSearch = require('../search/elasticSearch');

const es = new ElSearch('test');

describe('ElasticSearch', () => {
  const dummyItems = [
    {
      id: 1,
      created_at: '2016-09-21T21:05:00.000Z',
      updated_at: '2016-09-27T23:19:58.922Z',
      title: 'foo bar dance',
      description: 'foo',
      category: 'appliances - by owner',
      price: '$700',
      sold: false,
      location: 'hayward / castro valley',
      mages: null
    }, {
      id: 2,
      created_at: '2016-09-17T22:37:00.000Z',
      updated_at: '2016-09-27T23:19:58.922Z',
      title: 'foo',
      description: 'chicken bar',
      category: 'antiques - by owner',
      price: '$40',
      sold: false,
      location: 'hayward / castro valley',
      images: null
    }
  ];

  before('Should be able to ping server before tests start', (done) => {
    es.ping()
      .then((r) => {
        if (r === true) {
          done();
        } else {
          throw new Error('Could not ping server');
        }
      })
      .catch(e => done(e));
  });

  // These aren't working for some reason...

  // beforeEach('Create the testing index before each test', es.init);

  // afterEach('Delete testing index after each test', es._delete);

  // after('Close server connection upon completion', es.close);

  describe('Inserting Items', () => {
    it('Should not get an error when inserting an item', (done) => {
      es.insertItem(dummyItems[0], true)
        .then(() => done())
        .catch(e => done(e));
    });

    it('Should be able to find inserted item', (done) => {
      es.getItem(dummyItems[0].id)
        .then((r) => {
          assert.isTrue(r.length > 0);
          done();
        })
        .catch(e => done(e));
    });

      it('Should have equality of inserted items', (done) => {
      es.getItem(dummyItems[0].id)
        .then((r) => {
          const item = r[0]._source;
          for (let key in item) {
            assert.equal(item[key], dummyItems[0][key]);
          }
          done();
        })
        .catch(e => done(e));
    });
  });

  describe('deleting items', () => {
    it('Should not error out when deleting an item', (done) => {
      es.deleteItem(dummyItems[0].id)
        .then(() => done())
        .catch(e => done(e));
    });

    it('Should be able to delete specific items', (done) => {
      es.insertItem(dummyItems[0], true)
        .then(() => es.deleteItem(dummyItems[0].id, true))
        .then(() => es.getItem(dummyItems[0].id))
        .then(r => assert.isTrue(r.length === 0))
        .then(() => done())
        .catch(e => done(e));
    });

    it('Should not delete the wrong items', (done) => {
      es.insertItem(dummyItems[0], true)
        .then(() => es.insertItem(dummyItems[1], true))
        .then(() => es.deleteItem(dummyItems[0].id, true))
        .then(() => es.getItem(dummyItems[1].id))
        .then(r => assert.isTrue(r.length > 0))
        .then(() => done())
        .catch(e => done(e));
    });
  });

  describe('searching items', () => {
    before('Delete, and then re-insert all items', (done) => {
      dummyItems.forEach(item => es.deleteItem(item.id, true));
      dummyItems.forEach(item => es.insertItem(item.id, true));
      done();
    });

    it('Should return items with a given phrase in the title', (done) => {
      const p1 = es.searchItems('foo')
        .then(r => assert.equal(r.length, 2))
        .catch(e => done(e));
      const p2 = es.searchItems('dance')
        .then((r) => {
          console.log(r);
          assert.equal(r.length, 1);
          assert.equal(r[0]._source.id, 1);
        }).catch(e => done(e));
      Promise.all([p1, p2]).then(() => done());
    });

    it('Should return items with a given phrase in the description', (done) => {
      const p1 = es.searchItems('bar')
        .then(r => assert.equal(r.length, 2))
        .catch(e => done(e));
      const p2 = es.searchItems('foo')
        .then((r) => {
          console.log(r);
          assert.equal(r.length, 1);
          assert.equal(r[0]._source.id, 2);
        }).catch(e => done(e));
      Promise.all([p1, p2]).then(() => done());
    });
  });
});
