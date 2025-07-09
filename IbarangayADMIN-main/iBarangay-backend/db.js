const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ibarangay', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
