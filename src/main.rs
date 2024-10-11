use std::env;
use std::collections::HashSet;
use std::collections::HashMap;

use serenity::async_trait;
use serenity::model::channel::Message;
use serenity::prelude::*;
use serenity::all::VoiceState;
use serenity::all::UserId;
use serenity::all::ChannelId;
use serenity::builder::CreateChannel;
use serenity::model::channel::{PermissionOverwrite, PermissionOverwriteType};
use serenity::model::permissions::Permissions;
use serenity::all::ChannelType;

struct Handler;

struct VoiceChannel {
    name: String,
    channel_id: ChannelId,
    user_ids: Vec<UserId>
}

// vec of voice channels
private_channels: Vec<VoiceChannel>;

#[async_trait]
impl EventHandler for Handler {
    async fn voice_state_update(&self, ctx: Context, old: Option<VoiceState>, new: VoiceState) {
        if let Some(channel_id) = new.channel_id { // unwrap the channel_id from the VoiceState
            if channel_id == ChannelId::new(1293350052214997023) {
                println!("user joined the creation channel");

                let builder = CreateChannel::new("test").kind(ChannelType::Voice).category(ChannelId::new(789390831957573664));
                
                let guild = new.guild_id.unwrap();
                let private_channel = guild.create_channel(&ctx.http, builder).await;
                println!("{:?}", private_channel);

                if let Err(why) = guild.move_member(&ctx.http, new.user_id, private_channel.id).await {
                    println!("Failed to move member: {:?}", why);
                }
                
                private_channels.push(VoiceChannel {
                    name: "test".to_string(),
                    channel_id: private_channel.id,
                    user_ids: vec![new.user_id]
                });
                
                // add user to the list of users in the channel

                // add channel to the list of channels created and active
            }
        }
    }
}


#[tokio::main]
async fn main() {
    // Login with a bot token from the environment
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    // Set gateway intents, which decides what events the bot will be notified about
    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT
        | GatewayIntents::GUILDS
        | GatewayIntents::GUILD_VOICE_STATES;

    // Create a new instance of the Client, logging in as a bot.
    let mut client =
        Client::builder(&token, intents).event_handler(Handler).await.expect("Err creating client");

    // Start listening for events by starting a single shard
    if let Err(why) = client.start().await {
        println!("Client error: {why:?}");
    }
}