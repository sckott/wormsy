var loopback = require('loopback');
var path = require('path');

var app = module.exports = loopback();

app.set('restApiRoot', '/api');

var ds = loopback.createDataSource('soap', {
  connector: require('../index'),
  remotingEnabled: true,
  wsdl: path.join(__dirname, './worms.wsdl')
});

// Unfortunately, the methods from the connector are mixed in asynchronously
// This is a hack to wait for the methods to be injected
ds.once('connected', function () {

  // Create the model
  var WormsService = ds.createModel('WormsService', {});

  // Helper functions
  function GetVals(x){
    var vals = {}
    Object.keys(x).forEach(function (key) {
      var value = x[key].$value
      vals[key] = value;
    });
    return(vals);
  }



  // Refine the methods
  WormsService.children = function (id, cb) {
    WormsService.getAphiaChildrenByID({AphiaID: id || '106135'}, function (err, response) {
      // console.log('children: %j', response);
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      cb(err, result2);
    });
  };

  WormsService.common = function (id, cb) {
    WormsService.getAphiaVernacularsByID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      cb(err, result2);
    });
  };

  WormsService.names = function (id, cb) {
    WormsService.getAphiaNameByID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return : [];
      var result2 = {name: result.$value}
      // var result = response;
      cb(err, result2);
    });
  };

  WormsService.synonyms = function (id, cb) {
    WormsService.getAphiaSynonymsByID({AphiaID: id || '733271'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  WormsService.sources = function (id, cb) {
    WormsService.getSourcesByAphiaID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  // WormsService.extid = function (id, type, cb) {
  //   WormsService.getExtIDbyAphiaID({AphiaID: id || '1080', type: type || 'ncbi'}, function (err, response) {
  //     console.log('extid: %j', response);
  //     // var result = !err ?
  //     //   response.return.item : [];
  //     // var result2 = result.map(GetVals)
  //     var result2 = response;
  //     cb(err, result2);
  //   });
  // };

  WormsService.recordsbyvernacular = function (vernacular, cb) {
    WormsService.getAphiaRecordsByVernacular({vernacular: vernacular || 'salmon'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  WormsService.hierarchy = function (id, cb) {
    WormsService.getAphiaClassificationByID({AphiaID: id || '733271', convert: true}, function (err, response) {
      // var result = !err ?
      //   response.return.item : [];
      // var result2 = result.map(GetVals)
      var result = response;
      cb(err, result);
    });
  };



  // Map to REST/HTTP
  loopback.remoteMethod(
    WormsService.children, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/children'}
    }
  );

  loopback.remoteMethod(
    WormsService.common, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/common'}
    }
  );

  loopback.remoteMethod(
    WormsService.names, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/names'}
    }
  );

  loopback.remoteMethod(
    WormsService.synonyms, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/synonyms'}
    }
  );

  loopback.remoteMethod(
    WormsService.sources, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/sources'}
    }
  );

  // broken right now, not sure why
  // loopback.remoteMethod(
  //   WormsService.extid, {
  //     accepts: [
  //       {arg: 'id', type: 'string', required: true,
  //         http: {source: 'query'}},
  //       {arg: 'type', type: 'string', required: true,
  //         http: {source: 'query'}}
  //     ],
  //     returns: {arg: 'result', type: 'object', root: true},
  //     http: {verb: 'get', path: '/extid'}
  //   }
  // );

  loopback.remoteMethod(
    WormsService.recordsbyvernacular, {
      accepts: [
        {arg: 'vernacular', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/recordsbyvernacular'}
    }
  );

  loopback.remoteMethod(
    WormsService.hierarchy, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/hierarchy'}
    }
  );

  // Expose to REST
  app.model(WormsService);

  // LoopBack REST interface
  app.use(app.get('restApiRoot'), loopback.rest());
  // API explorer (if present)
  try {
    var explorer = require('loopback-explorer')(app);
    app.use('/explorer', explorer);
    app.once('started', function (baseUrl) {
      console.log('Browse your REST API at %s%s', baseUrl, explorer.route);
    });
  } catch (e) {
    console.log(
      'Run `npm install loopback-explorer` to enable the LoopBack explorer'
    );
  }

  app.use(loopback.urlNotFound());
  app.use(loopback.errorHandler());

  if (require.main === module) {
    app.start();
  }

});

app.start = function () {
  return app.listen(3000, function () {
    var baseUrl = 'http://127.0.0.1:3000';
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
  });
};
// app.start = function () {
//   return app.listen(app.get('port'), function () {
//     var baseUrl = 'http://' + app.get('host') + ':' + app.get('port');
//     app.emit('started', baseUrl);
//     console.log('LoopBack server listening @ %s%s', baseUrl, '/');
//   });
// };
