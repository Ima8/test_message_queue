
const amqp = require('amqplib');
const all = require('bluebird').all;
const basename = require('path').basename;

let severities = process.argv.slice(2);

if (severities.length < 1) {
  console.warn('Usage: %s [info] [warning] [error]',
               basename(process.argv[1]));
  process.exit(1);
}

amqp.connect('amqp://rabbitmq:rabbitmq@localhost').then((conn) => {
  process.once('SIGINT', () => { conn.close(); });
  return conn.createChannel().then((ch) => {
    const ex = 'direct_logs';

    let ok = ch.assertExchange(ex, 'direct', { durable: false });

    ok = ok.then(() => ch.assertQueue('', { exclusive: true }));

    ok = ok.then((qok) => {
      const queue = qok.queue;
      severities = ['info','error'];
      return all(severities.map((sev) => {
        ch.bindQueue(queue, ex, sev);
      })).then(() => queue) 
      // ch.bindQueue(queue, ex, severities[0]);
      // ch.bindQueue(queue, ex, "info");
      //return queue;
    });
    ok = ok.then((queue)=>{
      console.log(queue);
      return queue;
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
