const autoBind = require('auto-bind');

class SongsHandler {
  constructor(songsService, validator) {
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._songsService.addSong(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    let songs = await this._songsService.getSongs();

    const { title, performer } = request.query;

    if (title) {
      songs = songs.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));
    } if (performer) {
      songs = songs.filter(
        (song) => song.performer.toLowerCase().includes(performer.toLowerCase()),
      );
    }

    return (h, {
      status: 'success',
      data: {
        songs,
      },
    });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._songsService.getSongById(id);

    return (h, {
      status: 'success',
      data: {
        song,
      },
    });
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;

    await this._songsService.editSongById(id, request.payload);

    return (h, {
      status: 'success',
      message: 'Berhasil mengubah lagu',
    });
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._songsService.deleteSongById(id);

    return (h, {
      status: 'success',
      message: 'Berhasil menghapus lagu',
    });
  }
}
module.exports = SongsHandler;
