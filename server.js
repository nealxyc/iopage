var express = require('express');

var app = express();

app.use(express.static('_site'));

var server = app.listen(4000, function() {
    console.log(new Date());
    console.log('Listening on port %d', server.address().port);
});