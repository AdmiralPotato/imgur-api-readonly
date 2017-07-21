// server.js
// where your node app starts

// init project
var imgur = require('imgur');
var express = require('express');
var app = express();

imgur.setClientId(process.env.IMGUR_API_KEY);

app.engine('md', require('marked-engine').renderFile);
app.engine('ejs', require('ejs').renderFile);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  //response.sendFile();
  app.render(
    __dirname + '/README.md',
    function(err, renderedMarkdown){
      if(err){
        console.error(err);
        request.send(err);
      } else {
        response.render(
          __dirname + '/views/index.ejs',
          {markdown: renderedMarkdown}
        );
      }
  });
});


var pretty = function(json){
  return JSON.stringify(json, null, '\t');
}

var prettyResponseMaker = function(apiMethod){
  var prettyResponseHandler = function (request, response) {
    console.log('attempt: ' + request.params.id);
    response.type('text');
    apiMethod(request.params.id)
      .then(function(json) {
          response.send(pretty(json));
      })
      .catch(function (err) {
          console.error(err.message);
          response.status(404);
          response.send(pretty({
            error: err.message,
            "success": false,
            "status": 404
          }));
      });
  };
  return prettyResponseHandler;
}

app.get("/image/:id", prettyResponseMaker(imgur.getInfo));
app.get("/album/:id", prettyResponseMaker(imgur.getAlbumInfo));


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
