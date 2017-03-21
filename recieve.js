
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://rabbitmq:rabbitmq@10.82.20.188', function(err, conn) {
  console.log(err);
  conn.createChannel(function(err, ch) {
    var q = 'hello';
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});
  });
});
