module.exports = {
  name: 'ping',
  description: 'Pong!',
  // devOnly: Boolean,
  testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  callback: (client: any, interaction: any) => {
    interaction.reply(`Pong! ${client.ws.ping}ms`);
  },
};
