const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, songsService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);
    album.songs = await this._songsService.getSongByAlbumId(id);

    return (h, {
      status: 'success',
      data: {
        album,
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    await this._albumsService.editAlbumById(id, request.payload);

    return (h, {
      status: 'success',
      message: 'Berhasil mengubah album',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    return (h, {
      status: 'success',
      message: 'Berhasil menghapus album',
    });
  }

  async postAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._albumsService.addAlbumLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album dilike',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const data = await this._albumsService.getAlbumLike(albumId);
    const likes = data.count;

    return h.response({
      status: 'success',
      data: {
        likes,
      },
    }).header('X-Data-Source', data.source);
  }

  async deleteAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.deleteAlbumLike(userId, albumId);

    return (h, {
      status: 'success',
      message: 'Album batal dilike',
    });
  }
}
module.exports = AlbumsHandler;
