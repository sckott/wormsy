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
  var worms = ds.createModel('worms', {});

  // Helper functions
  function GetVals(x){
    var vals = {}
    Object.keys(x).forEach(function (key) {
      var value = x[key].$value
      vals[key] = value;
    });
    return(vals);
  }

  // API routes
  worms.children = function (id, cb) {
    worms.getAphiaChildrenByID({AphiaID: id || '106135'}, function (err, response) {
      // console.log('children: %j', response);
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      cb(err, result2);
    });
  };

  worms.common = function (id, cb) {
    worms.getAphiaVernacularsByID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      cb(err, result2);
    });
  };

  worms.names = function (id, cb) {
    worms.getAphiaNameByID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return : [];
      var result2 = {name: result.$value}
      // var result = response;
      cb(err, result2);
    });
  };

  worms.synonyms = function (id, cb) {
    worms.getAphiaSynonymsByID({AphiaID: id || '733271'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.sources = function (id, cb) {
    worms.getSourcesByAphiaID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  // worms.extid = function (id, type, cb) {
  //   worms.getExtIDbyAphiaID({AphiaID: id || '1080', type: type || 'ncbi'}, function (err, response) {
  //     console.log('extid: %j', response);
  //     // var result = !err ?
  //     //   response.return.item : [];
  //     // var result2 = result.map(GetVals)
  //     var result2 = response;
  //     cb(err, result2);
  //   });
  // };

  worms.recordsbyvernacular = function (vernacular, cb) {
    worms.getAphiaRecordsByVernacular({vernacular: vernacular || 'salmon'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.recordsbydate = function (startdate, enddate, cb) {
    worms.getAphiaRecordsByDate({startdate: startdate || '2014-06-01T00:00:00', enddate: enddate || '2014-06-02T00:00:00'}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.recordsbyextid = function (id, type, cb) {
    worms.getAphiaRecordByExtID({id: id || '6830', type: type || 'ncbi'}, function (err, response) {
      var result = !err ?
        response.return : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.recordsbyid = function (id, cb) {
    worms.getAphiaRecordByID({AphiaID: id || '1080'}, function (err, response) {
      var result = !err ?
        response.return : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.records = function (scientificname, cb) {
    worms.getAphiaRecords({scientificname: scientificname || "Holothuria edulis"}, function (err, response) {
      var result = !err ?
        response.return.item : [];
      var result2 = result.map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.matchrecords = function (scientificname, cb) {
    worms.matchAphiaRecordsByNames({scientificname: scientificname || "Holothuria edulis"}, function (err, response) {
      var result = !err ?
        response.return.item.item : [];
      var result2 = [result].map(GetVals)
      // var result2 = response;
      cb(err, result2);
    });
  };

  worms.hierarchy = function (id, cb) {
    worms.getAphiaClassificationByID({AphiaID: id || '733271', convert: true}, function (err, response) {
      // var result = !err ?
      //   response.return.item : [];
      // var result2 = result.map(GetVals)
      var result = response;
      cb(err, result);
    });
  };

// getChildren(file.return)
// var getChildren = function(obj) {
//   var out = [];
//   var tried = true;
//   var xplus = obj;
//   var nms = ["AphiaID", "rank", "scientificname"];
//   while(tried == true) {
//     var vals = xplus.child;
//     delete vals['attributes'];
//     delete vals['child'];
//     // var vals2 = {
//     //   AphiaID: vals.AphiaID['$value'],
//     //   rank: vals.rank['$value'],
//     //   scientificname: vals.scientificname['$value']
//     // };
//     out.push(vals);
//     var xplus = xplus.child;
//     var tried = xplus.AphiaID;
//     if(tried == undefined) {
//       var tried = false;
//     } else {
//       var tried = true;
//     }
//   };
//   return(out);
// };


  // Map to REST/HTTP
  loopback.remoteMethod(
    worms.children, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/children'}
    }
  );

  loopback.remoteMethod(
    worms.common, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/common'}
    }
  );

  loopback.remoteMethod(
    worms.names, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/names'}
    }
  );

  loopback.remoteMethod(
    worms.synonyms, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/synonyms'}
    }
  );

  loopback.remoteMethod(
    worms.sources, {
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
  //   worms.extid, {
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
    worms.recordsbyvernacular, {
      accepts: [
        {arg: 'vernacular', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/recordsbyvernacular'}
    }
  );

  loopback.remoteMethod(
    worms.recordsbydate, {
      accepts: [
        {arg: 'startdate', type: 'string', required: true,
          http: {source: 'query'}},
        {arg: 'enddate', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/recordsbydate'}
    }
  );

  loopback.remoteMethod(
    worms.recordsbyextid, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}},
        {arg: 'type', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/recordsbyextid'}
    }
  );

  loopback.remoteMethod(
    worms.recordsbyid, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/recordsbyid'}
    }
  );

  loopback.remoteMethod(
    worms.records, {
      accepts: [
        {arg: 'scientificname', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/records'}
    }
  );

  loopback.remoteMethod(
    worms.matchrecords, {
      accepts: [
        {arg: 'scientificname', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/matchrecords'}
    }
  );

  loopback.remoteMethod(
    worms.hierarchy, {
      accepts: [
        {arg: 'id', type: 'string', required: true,
          http: {source: 'query'}}
      ],
      returns: {arg: 'result', type: 'object', root: true},
      http: {verb: 'get', path: '/hierarchy'}
    }
  );

  // Expose to REST
  app.model(worms);

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
