const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (server, {
    PlaylistsService,
    PlaylistSongsService,
    SongsService,
    PlaylistActivitiesService,
    validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      PlaylistsService,
      PlaylistSongsService,
      SongsService,
      PlaylistActivitiesService,
      validator,
    );
    server.route(routes(playlistSongsHandler));
  },
};
