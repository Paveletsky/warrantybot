const { Telegraf, 
        Markup }    = require('telegraf');
const LocalSession  = require('telegraf-session-local');
const axios         = require('axios');
const CFG           = require("../config");

const bot = new Telegraf(CFG.BOT_TOKEN);

const localSession = new LocalSession({ database: 'session_db.json' });
bot.use(localSession.middleware());

function generateGeoKeyboard() {
    return CFG.GEO_OPTS.map(geo => [Markup.button.text(`${geo.flag} ${geo.code}`)]);
}

bot.start(async (ctx) => {
    ctx.session.formActive = false;
    ctx.session.geo = null;
    await ctx.reply("Выбери гео 👇", Markup.keyboard(
        generateGeoKeyboard())
         .resize()
         .oneTime()
    );
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const selectedGeo = CFG.GEO_OPTS.find(geo => text === `${geo.flag} ${geo.code}`);
    
    if (selectedGeo) {
        ctx.session.geo = selectedGeo.code; // Сохраняем выбранное гео в сессии
        ctx.session.formActive = true;
        
await ctx.replyWithPhoto("https://i.imgur.com/pPyHtGO.png", 
{
    caption: 
`💡 Введите эти параметры по очереди в ОДНОМ сообщении. Каждый параметр на новой строчке:

1. Имя Героя (пример: Johny Silverhand)
2. Дата создания договора (пример: 18.12.2023)
3. Действует до (пример: 18.12.2023)
4. Имя Героя (пример: Johny Silverhand)
5. Сумма оплаты (пример: 1120 eur)
6. Сумма заработка (пример: 1120 eur)
7. Имя Лида (пример: Adam Smasher)
8. Действует до (пример: 18.12.2023)
9. Имя Лида (пример: Adam Smasher)`,        
})

    } else if (ctx.session.formActive) {

        const data = ctx.message.text.split('\n');

        if (data.length >= 9) {
            const [
                created_on, exists_in, exists_in_2, hero_1, 
                hero_2, hero_3, client_name, to_pay, salary
            ] = data;

            try {
                const response = await axios.post(`${CFG.URL}/api/generate`, {
                    manager_id: ctx.message.from.id,
                    client_name: salary,
                    text: [
                        '40012121988',
                        created_on, 
                        exists_in, 
                        exists_in_2,
                        hero_1,
                        hero_2,
                        hero_3,
                        client_name,
                        to_pay,
                        salary,
                    ],
                    positions: [
                        { x: 737, y: 840 },

                        { x: 737, y: 900 },
                        { x: 737, y: 960 },
                        { x: 737, y: 1020 },                        

                        { x: 420, y: 1455 },
                        { x: 360, y: 1570 },
                        { x: 785, y: 1630 },

                        { x: 880, y: 1515 },
                        { x: 1025, y: 1690 },
                        { x: 370, y: 2035 },
                    ],
                    geo: ctx.session.geo
                });

                if (response.status != 200) {
                        await ctx.reply("Ошибка при отправке формы. Попробуй еще раз.");
                    return
                }
                
                await ctx.reply("Ссылка готова 👇");
                await ctx.reply(`${CFG.URL}/warranty/${response.data.url}`, Markup.keyboard(
                    generateGeoKeyboard())
                     .resize()
                     .oneTime()
                );

            } catch (error) {
                await ctx.reply("Ошибка при отправке формы. Попробуй еще раз.");
            }

            ctx.session.formActive = false;

        } else {
            await ctx.reply("Минимум 9 строк данных.");
        }

    } else {
        await ctx.reply("Сначала выбери ГЕО");
    }
}); 

exports.botInstance = bot.telegram;
bot.launch();
