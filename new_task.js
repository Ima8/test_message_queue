let amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.82.20.188').then((conn) => {
  return conn.createChannel().then((ch) => {
    let ok2 = ch.assertQueue('task_queue', { durable: true });
    let ok = ch.assertQueue('task_queue2', { durable: true });

    ok2 = ok2.then(() =>  {
      let msg = 'Hello world';
      ch.sendToQueue('task_queue', new Buffer(msg));
      console.log(" [x] Sent '%s'", msg);
    });

    ok = ok.then(() => { ch.prefetch(1); });
    ok = ok.then(() => {
      ch.consume('task_queue2', doWork, { noAck: false });
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
    return ok;

    function doWork(msg) {
      let body = msg.content.toString();
      console.log(" [x] Received '%s'", body);
      let secs = body.split('.').length - 1;
      // console.log(" [x] Task takes %d seconds", secs);
      setTimeout(() => {
        console.log(' [x] Done');
        ch.ack(msg);
      }, secs * 1000);
    }
  });
}).catch(console.warn);

