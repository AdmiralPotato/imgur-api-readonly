require('dotenv').config()
const fs = require('node:fs');
const imgur = require('imgur');
const marked = require('marked');
const express = require('express');
const app = express();

imgur.setClientId(process.env.IMGUR_API_KEY);

app.engine('md', (filePath, options, callback) => {
  fs.readFile(
    filePath,
    {encoding: 'utf-8'},
    (err, content) => {
      if (err) return callback(err)
      return callback(null, marked.parse(content))
    },
  );
});
app.engine('ejs', require('ejs').renderFile);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  //response.sendFile();
  app.render(
    __dirname + '/README.md',
    function(err, renderedMarkdown){
      if(err){
        console.error(err);
        response.send(err);
      } else {
        response.render(
          __dirname + '/views/index.ejs',
          {markdown: renderedMarkdown}
        );
      }
  });
});


const pretty = function(json){
  return JSON.stringify(json, null, '\t');
}

const prettyResponseMaker = function(apiMethod){
  return (request, response) => {
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
}

app.get("/image/:id", prettyResponseMaker(imgur.getInfo));
app.get("/album/:id", prettyResponseMaker(imgur.getAlbumInfo));


// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
