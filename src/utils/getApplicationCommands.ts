interface Guild {
  commands: any;
}

interface Client {
  guilds: {
    fetch: (guildId: string) => Promise<Guild>;
  };
  application: {
    commands: any;
  };
}

const getApplicationCommands = async (client: Client, guildId: string) => {
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = await client.application.commands;
  }

  await applicationCommands.fetch();
  return applicationCommands;
};

export default getApplicationCommands;
