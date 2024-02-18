const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    songsService,
    playlistActivitiesService,
    validator,
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistSongByIdHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.getSongById(songId);
    await this._playlistSongsService.addPlaylistSongById({ playlistId, songId });

    await this._playlistActivitiesService.addActivities({
      playlistId, songId, userId: credentialId, action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistsService.getPlaylistById(credentialId, playlistId);
    const songs = await this._playlistSongsService.getPlaylistSongById(playlistId);

    return (h, {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    });
  }

  async deletePlaylistSongByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deletePlaylistSongById(playlistId, songId);

    await this._playlistActivitiesService.addActivities({
      playlistId, songId, userId: credentialId, action: 'delete',
    });

    return (h, {
      status: 'success',
      message: 'Berhasil menghapus lagu di playlist',
    });
  }
}
module.exports = PlaylistSongsHandler;
