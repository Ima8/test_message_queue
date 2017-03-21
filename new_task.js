var amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.82.20.188').then(function(conn) {
  return conn.createChannel().then(function(ch) {
    var ok2 = ch.assertQueue('task_queue', {durable: true});
    var ok = ch.assertQueue('task_queue2', {durable: true});

    ok2 = ok2.then(function(){
      var msg = "Hello world";
      ch.sendToQueue("task_queue", new Buffer(msg));
      console.log(" [x] Sent '%s'", msg);
    })

    ok = ok.then(function() { ch.prefetch(1); });
    ok = ok.then(function() {
      ch.consume('task_queue2', doWork, {noAck: false});
      console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
    return ok;

    function doWork(msg) {
      var body = msg.content.toString();
      console.log(" [x] Received '%s'", body);
      var secs = body.split('.').length - 1;
      //console.log(" [x] Task takes %d seconds", secs);
      setTimeout(function() {
        console.log(" [x] Done");
        ch.ack(msg);
      }, secs * 1000);
    }
  });
}).catch(console.warn);
