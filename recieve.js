let amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.5.5.210').then((conn) => {
  process.once('SIGINT', () => { conn.close(); });
  return conn.createChannel().then((ch) => {
    let ok = ch.assertQueue('hello', { durable: false });

    ok = ok.then((_qok) => {
      return ch.consume('hello', (msg) => {
        console.log(" [x] Received '%s'", msg.content.toString());
      }, { noAck: true });
    });

    return ok.then((_consumeOk) => {
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  });
}).catch(console.warn);
