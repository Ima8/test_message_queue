const amqp = require('amqplib');

const args = process.argv.slice(2);
const key = (args.length > 0) ? args[0] : 'info';
const message = args.slice(1).join(' ') || 'Hello World!';

amqp.connect('amqp://rabbitmq:rabbitmq@localhost').then(conn => conn.createChannel().then((ch) => {
  const ex = 'topic_logs';
  const ok = ch.assertExchange(ex, 'topic', { durable: false });
  return ok.then(() => {
    ch.publish(ex, key, new Buffer(message));
    console.log(" [x] Sent %s:'%s'", key, message);
    return ch.close();
  });
}).finally(() => { conn.close(); })).catch(console.log);
