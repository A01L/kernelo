const Router = require('./core/kernel');

// Route set
Router.set('/', 'starter/index.html');
Router.set('/page/{id}/info', 'example/card.html', 'example/card.kjs');

// Starting server
Router.init();