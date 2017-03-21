const amqp = require('amqplib');

const args = process.argv.slice(2);
const severity = (args.length > 0) ? args[0] : 'info';
const message = args.slice(1).join(' ') || 'Hello World!';

amqp.connect('amqp://rabbitmq:rabbitmq@localhost').then(conn => conn.createChannel().then((ch) => {
  const ex = 'direct_logs';
  const ok = ch.assertExchange(ex, 'direct', { durable: false });

  return ok.then(() => {
    ch.publish(ex, severity, new Buffer(message));
    console.log(" [x] Sent %s:'%s'", severity, message);
    return ch.close();
  });
}).finally(() => { conn.close(); })).catch(console.warn);
