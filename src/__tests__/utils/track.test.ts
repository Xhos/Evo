import { Track } from '../../utils/track';
import { exec } from 'child_process';
import ytdl from 'ytdl-core';
import SpotifyWebApi from 'spotify-web-api-node';

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));
jest.mock('ytdl-core');
jest.mock('spotify-web-api-node');

describe('Track', () => {
  describe('download', () => {
    it('should download a track from YouTube', async () => {
      const track = new Track(
        'Test',
        'Artist',
        'https://youtube.com/watch?v=test',
        'youtube',
        'requester'
      );
      const execMock = exec as jest.MockedFunction<typeof exec>;
      execMock.mockImplementation(
        (command, callback: any) =>
          callback && callback(null, 'Track downloaded', null)
      );

      await track.download();

      expect(execMock).toHaveBeenCalledWith(
        expect.stringContaining('youtube.com'),
        expect.any(Function)
      );
    });

    // Add more tests for different platforms and error cases...
  });

  describe('linkToName', () => {
    it('should get track info from a YouTube link', async () => {
      const link = 'https://youtube.com/watch?v=test';
      const ytdlMock = ytdl.getBasicInfo as jest.MockedFunction<
        typeof ytdl.getBasicInfo
      >;
      ytdlMock.mockResolvedValue({
        videoDetails: {
          title: 'Test',
        },
        // Add other properties as needed
      } as unknown as ytdl.videoInfo);
      const track = await Track.linkToName(link, 'requester');

      expect(ytdlMock).toHaveBeenCalledWith('test');
      expect(track.name).toBe('Test');
      expect(track.link).toBe(link);
      expect(track.platform).toBe('youtube');
    });

    // Add more tests for different platforms and error cases...
  });
});
