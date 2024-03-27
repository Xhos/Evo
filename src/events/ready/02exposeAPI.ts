import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { Player } from '../../utils/player';
import { Queue } from '../../utils/queue';
import { logLevel, log } from '../../utils/log';
import { ReflectionService } from '@grpc/reflection';

module.exports = async (client: any) => {
  const packageDefinition = protoLoader.loadSync('evoBot.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const evoBotProto = grpc.loadPackageDefinition(packageDefinition).evoBot as any;

  async function join(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) {
    const guildID = call.request.guild_id;
    const channelID = call.request.channel_id;

    log(`join: g: ${guildID}\nc: ${channelID}`);

    let player = await Player.getPlayer(guildID);
    await player.join(channelID);

    callback(null, { result: 'Joined the voice channel' });
  }

  async function play(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) {
    const guildID = call.request.guild_id;
    log(`play: g: ${guildID}`);

    let player = await Player.getPlayer(guildID);
    await player.play();

    callback(null, { result: 'Started playing' });
  }

  async function add(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) {
    const guildID = call.request.guild_id;
    const link = call.request.link;
    const username = call.request.username;
    log(`add: l: ${link}\ng: ${guildID}\nu: ${username}`);

    const queue = Queue.getQueue(guildID);
    try {
      await queue.add(link, username);
      callback(null, { result: 'Track added to the queue!' });
    } catch (error: any) {
      log(error, logLevel.Error);
      callback(null, { result: 'There was an error adding the track to the queue.' });
    }
  }

  const server = new grpc.Server();
  const reflection = new ReflectionService(packageDefinition);
  reflection.addToServer(server);
  server.addService(evoBotProto.EvoBot.service, { join: join, add: add, play: play });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    log('API server listening on 0.0.0.0:50051');
  });
};

export {};
