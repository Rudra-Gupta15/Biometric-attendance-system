const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const frontendPath = path.join(__dirname, '..', 'attendance-frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/developer', (req, res) => res.sendFile(path.join(frontendPath, 'developer.html')));

const USERS_FILE = path.join(__dirname, 'users.json');
const ATTENDANCE_FILE = path.join(__dirname, 'attendance.json');
const DEVELOPERS_FILE = path.join(__dirname, 'developers.json');

function initializeDataFiles() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(ATTENDANCE_FILE)) fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(DEVELOPERS_FILE)) {
    fs.writeFileSync(DEVELOPERS_FILE, JSON.stringify([{ id: '1', name: 'Lucifer gupta', email: 'lucifergupta@gmail.com', pin: '1234' }], null, 2));
  }
}

function readUsers() { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
function writeUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); }
function readAttendance() { return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, 'utf8')); }
function writeAttendance(att) { fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(att, null, 2)); }
function readDevelopers() { return JSON.parse(fs.readFileSync(DEVELOPERS_FILE, 'utf8')); }
function writeDevelopers(devs) { fs.writeFileSync(DEVELOPERS_FILE, JSON.stringify(devs, null, 2)); }

// Compare 128-float face descriptors using Euclidean distance
function compareDescriptors(d1, d2) {
  if (!d1 || !d2) return { match: false, distance: null, error: 'Missing descriptor' };
  if (d1.length !== 128 || d2.length !== 128) {
    return { match: false, distance: null, error: `Invalid length: d1=${d1.length}, d2=${d2.length} (expected 128)` };
  }
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  const distance = parseFloat(Math.sqrt(sum).toFixed(4));
  const threshold = 0.45;
  const match = distance < threshold;
  console.log(`🔍 Euclidean Distance: ${distance} | Threshold: ${threshold} | Match: ${match ? '✅' : '❌'}`);
  return { match, distance };
}

// ─────────────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────────────

// 1. SIGNUP — register user + store descriptor + base64 photo
// POST /api/signup
// Body: { name, email, department, position, photo (base64 jpeg), image (128-float array) }
app.post('/api/signup', (req, res) => {
  try {
    const { name, email, department, position, employeeId, phone, photo, image } = req.body;

    if (!name || !email || !image) {
      return res.status(400).json({ success: false, message: 'Name, email, and face descriptor (image) are required' });
    }
    if (!Array.isArray(image) || image.length !== 128) {
      return res.status(400).json({ success: false, message: 'Face descriptor must be a 128-element array' });
    }

    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department || 'General',
      position: position || 'Employee',
      employeeId: employeeId || null,
      phone: phone || null,
      photo: photo || null,      // base64 string of registered face photo
      image,                      // 128-float descriptor (used for comparison)
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({
      success: true,
      message: 'Signup successful! You can now login.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        position: newUser.position,
        employeeId: newUser.employeeId,
        phone: newUser.phone,
        photo: newUser.photo,
        registeredAt: newUser.registeredAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 2. LOGIN — verify face + log attendance
// POST /api/login
// Body: { email, image (128-float descriptor), loginPhoto (base64 jpeg of live face) }
app.post('/api/login', (req, res) => {
  try {
    const { email, image, loginPhoto } = req.body;

    if (!email || !image) {
      return res.status(400).json({ success: false, message: 'Email and face descriptor are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ success: false, status: 'NOT_FOUND', message: 'User not found. Please signup first.' });
    }

    const { match, distance, error } = compareDescriptors(user.image, image);

    if (error) {
      return res.status(400).json({ success: false, message: `Descriptor error: ${error}` });
    }

    if (!match) {
      return res.status(401).json({
        success: false,
        status: 'NOT_VERIFIED',
        message: 'Face does not match. Verification failed.',
        distance
      });
    }

    // Check duplicate attendance today
    const attendance = readAttendance();
    const today = new Date().toDateString();
    const alreadyMarked = attendance.find(
      a => a.userId === user.id && new Date(a.timestamp).toDateString() === today
    );

    if (!alreadyMarked) {
      const record = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        email: user.email,
        department: user.department || 'General',
        loginPhoto: loginPhoto || null,   // base64 of live face at login
        timestamp: new Date().toISOString(),
        date: today
      };
      attendance.push(record);
      writeAttendance(attendance);
    }

    res.status(200).json({
      success: true,
      status: 'VERIFIED',
      message: alreadyMarked
        ? 'Face verified. Attendance already marked for today.'
        : 'Face verified. Attendance marked successfully!',
      distance,
      alreadyMarkedToday: !!alreadyMarked,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department || 'General',
        position: user.position || 'Employee',
        employeeId: user.employeeId || null,
        phone: user.phone || null,
        registeredAt: user.registeredAt,
        registeredPhoto: user.photo,       // base64 from registration
        loginPhoto: loginPhoto || null      // base64 from live login capture
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 3. ALL ATTENDANCE RECORDS
// GET /api/attendance
app.get('/api/attendance', (req, res) => {
  try {
    const attendance = readAttendance();
    res.json({ success: true, count: attendance.length, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 4. ATTENDANCE BY DATE (YYYY-MM-DD format)
// GET /api/attendance/date/2026-04-13
app.get('/api/attendance/date/:date', (req, res) => {
  try {
    const { date } = req.params;
    const attendance = readAttendance();
    const filtered = attendance.filter(a => a.timestamp && a.timestamp.startsWith(date));
    res.json({ success: true, date, count: filtered.length, attendance: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 5. ALL USERS (developer dashboard — includes photo + descriptor info)
// GET /api/users
app.get('/api/users', (req, res) => {
  try {
    const users = readUsers();
    const result = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department || 'General',
      position: u.position || 'Employee',
      employeeId: u.employeeId || null,
      phone: u.phone || null,
      registeredAt: u.registeredAt,
      photo: u.photo || null,                         // full base64 string
      descriptorLength: Array.isArray(u.image) ? u.image.length : 0,
      descriptorPreview: Array.isArray(u.image) ? u.image.slice(0, 5) : []  // first 5 values
    }));
    res.json({ success: true, count: result.length, users: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 6. SINGLE USER (full info including descriptor)
// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.id || u.employeeId === req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department || 'General',
        position: user.position || 'Employee',
        employeeId: user.employeeId || null,
        phone: user.phone || null,
        registeredAt: user.registeredAt,
        photo: user.photo,             // base64 registered photo
        descriptor: user.image,        // full 128-float array
        descriptorLength: Array.isArray(user.image) ? user.image.length : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 8. DELETE USER
// DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    let users = readUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove user
    users.splice(userIndex, 1);
    writeUsers(users);

    // Clean up attendance logs for this user
    let attendance = readAttendance();
    const cleanAttendance = attendance.filter(a => a.userId !== id);
    if (cleanAttendance.length !== attendance.length) {
      writeAttendance(cleanAttendance);
    }

    res.json({ success: true, message: 'User and associated attendance logs deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 9. STATS SUMMARY (developer dashboard)
// GET /api/stats
app.get('/api/stats', (req, res) => {
  try {
    const users = readUsers();
    const attendance = readAttendance();
    const today = new Date().toDateString();
    const todayRecords = attendance.filter(a => a.timestamp && new Date(a.timestamp).toDateString() === today);
    const uniqueTodayUsers = [...new Set(todayRecords.map(a => a.userId))].length;

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalAttendanceLogs: attendance.length,
        todayLogins: todayRecords.length,
        todayUniqueUsers: uniqueTodayUsers,
        usersWithPhoto: users.filter(u => u.photo).length,
        usersWithValidDescriptor: users.filter(u => Array.isArray(u.image) && u.image.length === 128).length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 10. HEALTH CHECK
// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), port: PORT });
});

// 11. DEVELOPER LOGIN (PIN-based)
app.post('/api/dev/login', (req, res) => {
  try {
    const { id, pin } = req.body;
    const devs = readDevelopers();
    const dev = devs.find(d => d.id === id && d.pin === pin);
    if (dev) {
      res.json({ success: true, message: 'Developer login successful', developer: { name: dev.name, email: dev.email } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid PIN' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 12. GET PUBLIC DEVELOPER LIST (for login selection)
app.get('/api/dev/public', (req, res) => {
  try {
    const devs = readDevelopers();
    res.json({ success: true, developers: devs.map(d => ({ id: d.id, name: d.name, email: d.email })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 13. FULL DEVELOPER MANAGEMENT (requires some protection in a real app)
app.get('/api/dev/list', (req, res) => {
  try {
    const devs = readDevelopers();
    res.json({ success: true, developers: devs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/dev/add', (req, res) => {
  try {
    const { name, email, pin } = req.body;
    if (!name || !email || !pin) return res.status(400).json({ success: false, message: 'Missing fields' });
    const devs = readDevelopers();
    devs.push({ id: Date.now().toString(), name, email, pin });
    writeDevelopers(devs);
    res.json({ success: true, message: 'Developer added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/dev/delete/:id', (req, res) => {
  try {
    let devs = readDevelopers();
    devs = devs.filter(d => d.id !== req.params.id);
    writeDevelopers(devs);
    res.json({ success: true, message: 'Developer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/dev/update', (req, res) => {
  try {
    const { id, name, email, pin } = req.body;
    let devs = readDevelopers();
    const idx = devs.findIndex(d => d.id === id);
    if (idx !== -1) {
      devs[idx] = { ...devs[idx], name, email, pin };
      writeDevelopers(devs);
      res.json({ success: true, message: 'Developer updated' });
    } else {
      res.status(404).json({ success: false, message: 'Developer not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

initializeDataFiles();
app.listen(PORT, () => {
  console.log(`\n✅  Attendance System Running`);
  console.log(`🌐  App:        http://localhost:${PORT}`);
  console.log(`🛠️   Dev Panel:  http://localhost:${PORT}/developer`);
  console.log(`\n📋  API Endpoints:`);
  console.log(`    POST  /api/signup`);
  console.log(`    POST  /api/login`);
  console.log(`    GET   /api/users`);
  console.log(`    GET   /api/users/:id`);
  console.log(`    GET   /api/users/:id/attendance`);
  console.log(`    GET   /api/attendance`);
  console.log(`    GET   /api/attendance/date/YYYY-MM-DD`);
  console.log(`    GET   /api/stats`);
  console.log(`    GET   /api/health`);
  console.log(`    DELETE /api/users/:id\n`);
});