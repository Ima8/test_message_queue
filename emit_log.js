const amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.5.5.210').then(conn => conn.createChannel().then((ch) => {
  const ex = 'logs';
  const ok = ch.assertExchange(ex, 'fanout', { durable: false });

  const message = process.argv.slice(2).join(' ') ||
      'info: Hello World!';

  return ok.then(() => {
    ch.publish(ex, '', new Buffer(message));
    console.log(" [x] Sent '%s'", message);
    return ch.close();
  });
}).finally(() => { conn.close(); })).catch(console.warn);
