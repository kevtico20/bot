import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import prisma from './database';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "¡Hola! Soy tu bot de Telegram. Usa / para ver los comandos disponibles.");
});

bot.onText(/\/departamentos/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const departments = await prisma.department.findMany();
    if (departments.length > 0) {
      const departmentOptions = departments.map(dept => ({
        text: dept.dep_name,
        callback_data: `dep_${dept.dep_id}`
      }));

      bot.sendMessage(chatId, 'Seleccione un departamento:', {
        reply_markup: {
          inline_keyboard: [departmentOptions]
        }
      });
    } else {
      bot.sendMessage(chatId, 'No se encontraron departamentos.');
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Hubo un error al obtener los departamentos.');
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = msg?.chat.id;

  if (!chatId) {
    console.error('Chat ID is undefined');
    return;
  }

  if (data?.startsWith('dep_')) {
    const departmentId = parseInt(data.split('_')[1]);
    try {
      const forms = await prisma.axisform.findMany({
        where: {
          DEPARTMENT_dep_id: departmentId,
          form_status: 'A'
        }
      });

      if (forms.length > 0) {
        const formMessages = forms.map(form => 
          `Formulario: ${form.form_name}\nFecha Inicio: ${form.form_date_start}\nFecha Fin: ${form.form_date_finish}`
        ).join('\n\n');

        bot.sendMessage(chatId, `Formularios activos:\n\n${formMessages}`);
      } else {
        bot.sendMessage(chatId, 'No se encontraron formularios activos para este departamento.');
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Hubo un error al obtener los formularios.');
    }
  }

  if (data?.startsWith('qdep_')) {
    const departmentId = parseInt(data.split('_')[1]);
    try {
      const questions = await prisma.question.findMany({
        where: {
          SECTION_sect_id: departmentId // Asegúrate de usar la relación correcta aquí
        }
      });

      if (questions.length > 0) {
        const questionMessages = questions.map(question => 
          `Pregunta: ${question.quest_question}\nOrden: ${question.quest_ordern}`
        ).join('\n\n');

        bot.sendMessage(chatId, `Preguntas del departamento seleccionado:\n\n${questionMessages}`);
      } else {
        bot.sendMessage(chatId, 'No se encontraron preguntas para este departamento.');
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Hubo un error al obtener las preguntas.');
    }
  }
});

bot.onText(/\/preguntas/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const departments = await prisma.department.findMany();
    if (departments.length > 0) {
      const departmentOptions = departments.map(dept => ({
        text: dept.dep_name,
        callback_data: `qdep_${dept.dep_id}`
      }));

      bot.sendMessage(chatId, 'Seleccione un departamento para ver las preguntas:', {
        reply_markup: {
          inline_keyboard: [departmentOptions]
        }
      });
    } else {
      bot.sendMessage(chatId, 'No se encontraron departamentos.');
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Hubo un error al obtener los departamentos.');
  }
});

export default bot;
