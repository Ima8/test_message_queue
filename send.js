const amqp = require('amqplib');

amqp.connect('amqp://rabbitmq:rabbitmq@10.82.20.188').then((conn) => conn.createChannel().then((ch) => {
    let q = 'hello';
    let msg = 'Hello ddddWorld!';

    let ok = ch.assertQueue(q, { durable: false });

    return ok.then((_qok) => {
      // NB: `sentToQueue` and `publish` both return a boolean
      // indicating whether it's OK to send again straight away, or
      // (when `false`) that you should wait for the event `'drain'`
      // to fire before writing again. We're just doing the one write,
      // so we'll ignore it.
      ch.sendToQueue(q, new Buffer(msg));
      console.log(" [x] Sent '%s'", msg);
      return ch.close();
    });
  }).finally(() => { conn.close(); })).catch(console.warn);
