const debug = require('debug')('stepper');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const passport = require('koa-passport');
const route = require('koa-route');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const low = require('lowdb');
const FileASync = require('lowdb/adapters/FileAsync');
const proxy = require('koa-proxies');
const googleRefreshToken = require('google-refresh-token');
const adapter = new FileASync('.db.json');
const TimeCache = require('time-cache');
const tc = new TimeCache();
const request = require('request-promise-native');
const config = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  url: process.env.URL
};
let db;
low(adapter).then(_db => {
  db = _db
  return db.defaults({ users: [] }).write();
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.clientID, 
      clientSecret: config.clientSecret,
      callbackURL: config.url + '/connect/google/callback'
    },
    async function(accessToken, refreshToken, profile, cb) {
      console.log('refreshToken=', refreshToken);
      const userProps = { id: profile.id, refreshToken, name: profile.displayName, createdAt: new Date(), refreshToken };
      const user = await db.get('users').find({ id: userProps.id }).value();
      if (user) {
        // update
        console.log('update user: %s', user.id);
        await db.get('users')
          .find({ id: userProps.id })
          .assign({
            refreshToken,
            name: userProps.name
          })
          .write();
      } else {
        // create
        console.log('create new user', userProps);
        await db.get('users')
          .push(userProps)
          .write();
      }

      cb(null, userProps.id);
      
    }
  )
);
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
const app = new Koa();

app.use(bodyParser());

app.keys = ['secret'];
app.use(session({}, app));


app.use(passport.initialize());
app.use(passport.session());

app.use(
  route.get(
    '/connect/google',
    passport.authenticate('google', {
      scope: [
        'profile',
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read'
      ],
      accessType: 'offline',
      prompt: 'consent',
      includeGrantedScopes: true
    })
  )
);

app.use(
  route.get('/connect/google/callback',
    passport.authenticate('google', { failureRedirect: '/?err', successRedirect: '/' })
  )
);

app.use(
  route.get('/users', async (ctx) => {
    const users = await (db.get('users').value());
    const usersWithToken = await Promise.all(users.map(user => {
      return new Promise((resolve, reject) => {
        if (tc.has(user.id)) {
          debug('not asking for new accesstoken for user (%s), we have a cached one', user.id);
          return resolve({ id: user.id, name: user.name });
        }
        debug('asking for access token for user %s', user.id);
        googleRefreshToken(user.refreshToken, config.clientID, config.clientSecret, (err, json) => {
          // silently drop user with access token
          if (err || (json && json.err)) {
            console.error({
              err,
              json,
              statusCode: res.statusCode
            });
            return resolve();
          }
          if (!json.accessToken) {
            console.error('failed to get accesstoken!', json);
            return resolve();
          }
          tc.put(user.id, json.accessToken, json.expires_in / 1000);
          resolve({
            id: user.id,
            name: user.name
          });
        });
      });
    }));
    ctx.body = usersWithToken.filter(user => user != null);
  })
);
app.use(route.get('/users/:id/*', async (ctx, id, path, next) => {
  const user = await db.get('users').find({ id: id }).value();
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      'message': 'User is not found'
    };
    return;
  }
  // @TODO: asking for new token?
  if (tc.has(user.id) === false) {
    ctx.status = 404;
    ctx.body = {
      'message': 'token was not found for user'
    };
    return;
  }
  ctx.user = Object.assign(user, {
    accessToken: tc.get(user.id)
  });
  await next();
}));
app.use(route.get('/users/:id/steps', async (ctx) => {
  const dataSource = 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps';
  const dataSetId = ctx.query.dataSetId;
  ctx.body = await request({
    url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSource}/datasets/${dataSetId}`,
    qs: {
      access_token: ctx.user.accessToken
    },
    json: true
  });
}));
app.use(route.get('/users/:id/weights', async (ctx) => {
  const dataSource = 'derived:com.google.weight:com.google.android.gms:merge_weight';
  const dataSetId = ctx.query.dataSetId;
  ctx.body = await request({
    url: `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSource}/datasets/${dataSetId}`,
    qs: {
      access_token: ctx.user.accessToken
    },
    json: true
  });
}));
app.use(route.get('/users/:id/sessions', async ctx => {
  const dataSource = 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps';
  const dataSetId = '1520618758614100000-1521223558614100000';
  ctx.body = await request({
    url: 'https://www.googleapis.com/fitness/v1/users/me/sessions',
    qs: {
      access_token: ctx.user.accessToken,
      startTime: ctx.query.startTime,
      endTime: ctx.query.endTime,
    },
    json: true
  });
}));
// this is stolen from https://github.com/Xeoncross/javascript_server_and_frontend/blob/master/server/server.js#L68-L72
//if (process.env.NODE_ENV !== 'production') {
  // We start a proxy to the create-react-app dev server
  //app.use(proxy('/*', { target: 'http://localhost:3001', logs: true }));
//}
const server = app.listen(3000, function(err) {
  if (err) {
    throw err;
  }
  console.log('App started on port %s', this.address().port);
});
if (process.env.NODE_ENV !== 'production') {
  // We start a proxy to the create-react-app dev server
  app.use(proxy('/*', { target: 'http://localhost:3001', logs: true }));
  server.on('upgrade', function(req, socket, head) {
    proxy.proxy.ws(req, socket, head, {
      target: 'ws://localhost:3001'
    });
  });
}