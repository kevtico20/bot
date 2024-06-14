import bot from './bot';
import prisma from './database';

bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const data = await prisma.answer.findFirst(); // Reemplaza `answer` con el nombre de tu modelo si es necesario
    if (data) {
      bot.sendMessage(chatId, `Aquí tienes la información: ${JSON.stringify(data)}`);
    } else {
      bot.sendMessage(chatId, 'No se encontró información.');
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Hubo un error al obtener la información.');
  }
});

console.log('Bot de Telegram corriendo...');
