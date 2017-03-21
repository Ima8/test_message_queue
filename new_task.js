const amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.82.20.188').then(conn => conn.createChannel().then((ch) => {
  const q = 'task_queue';
  const ok = ch.assertQueue(q, { durable: true });

  return ok.then(() => {
    const msg = process.argv.slice(2).join(' ') || 'Hello World!';
    ch.sendToQueue(q, new Buffer(msg), { deliveryMode: true });
    console.log(" [x] Sent '%s'", msg);
    return ch.close();
  });
}).finally(() => { conn.close(); })).catch(console.warn);
