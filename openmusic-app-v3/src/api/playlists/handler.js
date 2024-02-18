const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, playlistActivitiesService, validator) {
    this._playlistsService = playlistsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return (h, {
      status: 'success',
      data: {
        playlists,
      },
    });
  }

  async deletePlaylistByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return (h, {
      status: 'success',
      message: 'Berhasil menghapus playlist',
    });
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._playlistActivitiesService.getActivities(playlistId);

    return (h, {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });
  }
}
module.exports = PlaylistsHandler;
