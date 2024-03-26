import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { Player } from '../../utils/player';
import { logLevel, log } from '../../utils/log';

module.exports = async (client: any) => {
  // Load the .proto file
  const packageDefinition = protoLoader.loadSync('evoBot.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const evoBotProto = grpc.loadPackageDefinition(packageDefinition).evoBot as any;

  // Implement the join function
  async function join(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) {
    const guildID = call.request.user_id;
    const channelID = call.request.channel_id;
    // log the request
    log(
      `Got a request to join the voice channel in guild ${guildID} and channel ${channelID}`,
      logLevel.Info
    );
    // Get the queue and player for the guild
    let player = Player.getPlayer(guildID);

    // Join the voice channel
    await player.join(channelID);

    callback(null, { result: 'Joined the voice channel' });
  }

  // Create a gRPC server
  const server = new grpc.Server();

  // Add the EvoBot service to the server
  server.addService(evoBotProto.EvoBot.service, { join: join });

  // Start the server
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server listening on 0.0.0.0:50051');
  });
};
export {};
