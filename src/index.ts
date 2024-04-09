import { ConsumeMessage, connect } from "amqplib";
import axios from 'axios';

interface IPayment {
  content: string
}

async function consumeMessages() {
  const connection = await connect('amqp://34.196.166.98/');
  const channel = await connection.createChannel();

  const queue = 'payment';
  await channel.assertQueue(queue, { durable: true });


  channel.consume(queue, async (payment) => {
    const exchangeName = 'newExchange';

    try {
      if (payment) {
        const paymentContent = payment.content.toString()

        await axios.post('http://localhost:5000/payment', JSON.parse(paymentContent));
        console.log('Pago procesado');
        await channel.publish(exchangeName, 'payment-processed', Buffer.from(payment.content.toString()));
        await channel.ack(payment);
      }
    } catch (error) {
      console.log(error);
    }
  }, { noAck: false });
}

consumeMessages().then(() => console.log('Consumer iniciado')).catch(error => console.error(error));
