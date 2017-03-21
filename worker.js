const amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.5.5.210').then((conn) => {
  // process.once('SIGINT', () => { conn.close(); });
  return conn.createChannel().then((ch) => {
    let ok = ch.assertQueue('task_queue', { durable: true });

    function doWork(msg) {
      const body = msg.content.toString();
      console.log(" [x] Received '%s'", body);
      const secs = body.split('.').length - 1;
      // console.log(" [x] Task takes %d seconds", secs);
      setTimeout(() => {
        console.log(' [x] Done')
        ;

        // sendback
        const newmsg = 'return from the dark side';
        ch.sendToQueue('task_queue2', new Buffer(newmsg), { deliveryMode: true });

        ch.ack(msg);
      }, secs * 1000);
    }

    ok = ok.then(() => { ch.prefetch(1); });
    ok = ok.then(() => {
      ch.consume('task_queue', doWork, { noAck: false });
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
    return ok;
  });
}).catch(console.warn);
