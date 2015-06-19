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

  // Refine the methods
  WormsService.children = function (id, cb) {
    WormsService.getAphiaChildrenByID({AphiaID: id || '106135'}, function (err, response) {
      console.log('children: %j', response);
      // var result = response.getAphiaChildrenByID;
      var result = !err ?
        response.return.item : [];
      function GetVals(x){
        var vals = {}
        Object.keys(x).forEach(function (key) {
          var value = x[key].$value
          vals[key] = value;
        });
        return(vals);
      }
      var result2 = result.map(GetVals)
      // var result = response;
      cb(err, result2);
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

// app.start = function () {
//   return app.listen(3000, function () {
//     var baseUrl = 'http://127.0.0.1:3000';
//     app.emit('started', baseUrl);
//     console.log('LoopBack server listening @ %s%s', baseUrl, '/');
//   });
// };


app.start = function () {
  return app.listen(app.get('port'), function () {
    var baseUrl = 'http://' + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
  });
};
