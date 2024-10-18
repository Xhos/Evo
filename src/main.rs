use std::env;
use std::sync::Arc;
use std::time::Instant;

use tokio::sync::Mutex;

use env_logger::Builder;
use log::{error, trace};

use serenity::{
    async_trait,
    all::{ChannelId, ChannelType, VoiceState},
    builder::CreateChannel,
    client::Client,
    model::prelude::GuildChannel,
    prelude::{Context, EventHandler},
    model::gateway::GatewayIntents,
};

struct Handler {
    private_channels: Arc<Mutex<Vec<ChannelId>>>,
    room_creation_channel_id: ChannelId,
    room_category_id: ChannelId,
}

impl Handler {
    fn new(room_creation_channel_id: ChannelId, room_category_id: ChannelId) -> Self {
        Handler {
            private_channels: Arc::new(Mutex::new(Vec::new())),
            room_creation_channel_id,
            room_category_id,
        }
    }
}

async fn get_member_count(channel_id: ChannelId, ctx: &Context) -> usize {
    if let Ok(channel) = channel_id.to_channel(&ctx.http).await {
        if let serenity::model::prelude::Channel::Guild(guild_channel) = channel {
            return guild_channel.members(&ctx.cache).unwrap_or_default().len();
        }
    }
    0
}

#[async_trait]
impl EventHandler for Handler {
    async fn voice_state_update(&self, ctx: Context, old: Option<VoiceState>, new: VoiceState) {
        trace!("voice_state_update triggered!");
        let mut private_channels = self.private_channels.lock().await;

        if let Some(channel_id) = new.channel_id {
            trace!("User joined a voice channel: {:?}", channel_id);

            if channel_id == self.room_creation_channel_id {
                trace!("User joined the creation channel");

                let user_name = match new.member {
                    Some(member) => member.display_name().to_string(),
                    None => "Unknown".to_string(),
                };

                let room_name = format!(" 🌌 комната {}", user_name);

                let builder: CreateChannel<'_> = CreateChannel::new(&room_name)
                    .kind(ChannelType::Voice)
                    .category(self.room_category_id);

                let guild = new.guild_id.unwrap();

                let start_time = Instant::now();
                let private_channel: GuildChannel = match guild.create_channel(&ctx.http, builder).await {
                    Ok(channel) => channel,
                    Err(why) => {
                        trace!("Failed to create private channel: {:?}", why);
                        return;
                    }
                };
                let elapsed_time = start_time.elapsed();
                trace!("Created private channel: {:?} in {:?}", private_channel, elapsed_time);

                if let Err(why) = guild.move_member(&ctx.http, new.user_id, private_channel.id).await {
                    trace!("Failed to move member: {:?}", why);
                }

                private_channels.push(private_channel.id);
                trace!("Updated private channels list: {:?}", private_channels);
            }
        }

        if let Some(channel_id) = old.and_then(|state| state.channel_id) {
            trace!("User left a voice channel: {:?}", channel_id);

            if private_channels.contains(&channel_id) {
                trace!("Channel ID is in private channels: {:?}", channel_id);

                let member_count = get_member_count(channel_id, &ctx).await;
                trace!("Member count for channel {:?}: {}", channel_id, member_count);

                if member_count == 0 {
                    let start_time = Instant::now();
                    trace!("Channel is empty, deleting channel: {:?}", channel_id);
                    if let Err(why) = channel_id.delete(&ctx.http).await {
                        trace!("Failed to delete channel {:?}: {:?}", channel_id, why);
                    } else {
                        let elapsed_time = start_time.elapsed();
                        trace!("Successfully deleted channel: {:?} in {:?}", channel_id, elapsed_time);
                    }
                } else {
                    trace!("Channel is not empty, no action taken: {:?}", channel_id);
                }
            }
        }
    }
}

#[tokio::main]
async fn main() {
    // Initialize the logger with a custom filter
    Builder::new()
        .filter(None, log::LevelFilter::Warn)         // Default level for other
        .filter(Some("evo"), log::LevelFilter::Trace) // Default level for this module
        .init();

    // Parse environment variables
    let room_creation_channel_id = ChannelId::new(
        env::var("ROOM_CREATION_CHANNEL_ID")
            .expect("Expected a channel id in the environment")
            .parse::<u64>()
            .unwrap(),
    );

    let room_category_id = ChannelId::new(
        env::var("ROOM_CATEGORY_ID")
            .expect("Expected a category id in the environment")
            .parse::<u64>()
            .unwrap(),
    );

    // Login with a bot token from the environment
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    // Set gateway intents, which decides what events the bot will be notified about
    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT
        | GatewayIntents::GUILDS
        | GatewayIntents::GUILD_VOICE_STATES;

    // Create a new instance of the Client, logging in as a bot.
    let mut client = Client::builder(&token, intents)
        .event_handler(Handler::new(room_creation_channel_id, room_category_id))
        .await
        .expect("Err creating client");

    // Start listening for events by starting a single shard
    if let Err(why) = client.start().await {
        error!("Client error: {why:?}");
    }
}