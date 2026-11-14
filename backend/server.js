require('dotenv').config();
const express   = require('express');
const http      = require('http');
const mongoose  = require('mongoose');
const cors      = require('cors');
const passport  = require('passport');
require('./config/passport');
const { initSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/courses',       require('./routes/courseRoutes'));
app.use('/api/enrollments',   require('./routes/enrollmentRoutes'));
app.use('/api/payments',      require('./routes/paymentRoutes'));
app.use('/api/progress',      require('./routes/progressRoutes'));
app.use('/api/reviews',       require('./routes/reviewRoutes'));
app.use('/api/certificates',  require('./routes/certificateRoutes'));
app.use('/api/sessions',      require('./routes/sessionRoutes'));
app.use('/api/tutor',         require('./routes/tutorRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat',          require('./routes/chatRoutes'));
app.use('/api/settings',     require('./routes/settingsRoutes'));
app.use('/api/community',    require('./routes/communityRoutes'));
app.use('/api/entry-tests',  require('./routes/entryTestRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

initSocket(server, process.env.CLIENT_URL);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server + Socket.io on port -> rocess.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('DB Error:', err); process.exit(1); });
