const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToAlbumsModel } = require('../../utils/albums');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, null],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan album');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return result.rows.map(mapDBToAlbumsModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
  }

  async addAlbumCover(id, { coverUrl }) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan album cover');
    }
  }

  async addAlbumLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    await this.getAlbumById(albumId);
    const alreadyLiked = await this.verifyAlbumLike(userId, albumId);

    if (alreadyLiked) {
      throw new InvariantError('User sudah like album');
    } else {
      const query = {
        text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };
      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
        throw new InvariantError('Gagal untuk like album');
      }
      await this._cacheService.delete(`likes:${albumId}`);
      return result.rows[0].id;
    }
  }

  async verifyAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return false;
    }
    return true;
  }

  async getAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      const like = {
        count: JSON.parse(result),
        source: 'cache',
      };
      return like;
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Album belum memiliki like');
      }

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rowCount));

      const like = {
        count: JSON.parse(result.rowCount),
        source: 'database',
      };
      return like;
    }
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal membatalkan like album');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }
}
module.exports = AlbumsService;
