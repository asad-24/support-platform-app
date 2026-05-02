const debug = require('@core/util/functions/debug');
const TestMeta = require('@src/models/TestMeta');

class TestController{

  hello(req, res){
    debug('controller: TestController.hello');
    res.json({
      success: true,
      message: 'Hello Test'
    });
  }

  nested(req, res){
    debug('controller: TestController.nested');
    res.json({
      success: true,
      message: 'Nested Test'
    });
  }

  async test_metas(req, res){
    try {
      debug('controller: TestController.test_metas -> models/TestMeta.findAll');
      const rows = await TestMeta.findAll();
      res.json({ success: true, data: rows });
    } catch (err) {
      debug('controller error: TestController.test_metas', err);
      res.status(500).json({ success: false, error: 'Failed to fetch test_metas' });
    }
  }

};

module.exports = new TestController();
