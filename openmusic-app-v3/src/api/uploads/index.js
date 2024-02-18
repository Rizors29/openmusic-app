const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, {
    service,
    AlbumsService,
    validator,
  }) => {
    const uploadsHandler = new UploadsHandler(
      service,
      AlbumsService,
      validator,
    );
    server.route(routes(uploadsHandler));
  },
};
