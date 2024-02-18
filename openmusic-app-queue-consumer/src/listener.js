class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    const { playlistId, targetEmail } = JSON.parse(message.content.toString());
    const playlist = await this._playlistsService.getPlaylists(playlistId);
    const songs = await this._playlistsService.getSongs(playlistId);

    await this._mailSender.sendEmail(
      targetEmail,
      JSON.stringify({
        playlist: {
          ...playlist,
          songs,
        },
      }),
    );
  }
}
module.exports = Listener;
