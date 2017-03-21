const amqp = require('amqplib');
const basename = require('path').basename;
const all = require('bluebird').all;

const keys = process.argv.slice(2);
if (keys.length < 1) {
  console.log('Usage: %s pattern [pattern...]',
              basename(process.argv[1]));
  process.exit(1);
}

amqp.connect('amqp://rabbitmq:rabbitmq@localhost').then((conn) => {
  process.once('SIGINT', () => { conn.close(); });
  return conn.createChannel().then((ch) => {
    const ex = 'topic_logs';
    let ok = ch.assertExchange(ex, 'topic', { durable: false });

    ok = ok.then(() => ch.assertQueue('', { exclusive: true }));

    ok = ok.then((qok) => {
      const queue = qok.queue;
      return all(keys.map((rk) => {
        ch.bindQueue(queue, ex, rk);
      })).then(() => queue);
    });

    ok = ok.then((queue) => ch.consume(queue, logMessage, { noAck: true }));
    return ok.then(() => {
      console.log(' [*] Waiting for logs. To exit press CTRL+C.');
    });

    function logMessage(msg) {
      console.log(" [x] %s:'%s'",
                  msg.fields.routingKey,
                  msg.content.toString());
    }
  });
}).catch(console.warn);
