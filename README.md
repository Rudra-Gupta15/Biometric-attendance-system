# ⬡ Attendance System | Biometric Authentication
A premium, ready-to-use biometric attendance system with a modern glassmorphic interface, real-time face descriptor extraction, and a comprehensive Developer Management Panel.

## ✨ System Highlights

### 🛡️ Secure Biometric Auth
- **Face Descriptor Extraction**: Uses `face-api.js` to extract 128-float biometric vectors for high-precision matching.
- **Live Capture**: Real-time webcam integration with a futuristic circular scanner interface.

### 🎨 Premium UI/UX
- **Architectural Light Theme**: A clean, white-themed dashboard designed for high readability.
- **Responsive Layout**: Fluid management interface that works across desktop and mobile.

### 🛠️ Developer Dashboard (`/developer`)
- **System Stats**: Real-time monitoring of total users and attendance metrics.
- **User Management**: Search and manage registered profiles.
- **User Deletion**: Safely remove user profiles and history.

---

## 📁 Project Structure

```
attendance-system/
│
├── attendance-backend/          # Node.js API Service
│   ├── server.js               # Main server logic
│   ├── users.json              # Biometric database
│   └── attendance.json         # History logs
│
├── attendance-frontend/         # Client Application
│   └── index.html              # Main Auth UI
│   └── developer.html          # Dev Management Panel
│
└── README.md                   # System Documentation
```

---

## 🚀 Quick Start

1. **Start the Backend Service**
   ```bash
   cd attendance-backend
   npm install
   npm start
   ```

2. **Launch the Web Interface**
   - Simply open `attendance-frontend/index.html` in your browser.
   - For camera access, ensure you are running on `localhost` or a secure context.

3. **Manage via Developer Dashboard**
   - Navigate to `http://localhost:3000/developer` to view real-time stats and manage users.


---


## 🛠️ Technology Stack

**Backend:**
- Node.js
- Express.js
- File-based storage (JSON)

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript
- MediaDevices API (Camera)

---

## 🛠️ API Testing with Postman

For developers who want to test the backend logic independently of the frontend UI, a pre-configured Postman collection is included.

### How to use:
1. **Locate the Collection**: Find the file `Attendance_System_API.postman_collection.json` inside the `attendance-backend` folder.
2. **Import to Postman**: Open Postman, click **Import**, and drag & drop this JSON file.
3. **Configure Environment**: Ensure your backend is running (`npm start`) on `localhost:3000`.
4. **Test Endpoints**: You can now trigger Signups, Logins, and Data Retrievals manually to inspect raw JSON responses.

---

## 📊 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/signup` | Register new biometric profile |
| POST | `/api/login` | Verify face and log attendance |
| GET | `/api/users` | List all registered users |
| GET | `/api/users/:id` | Get full user profile & descriptor |
| DELETE | `/api/users/:id` | Permanently remove user & logs |
| GET | `/api/attendance` | Retrieve all attendance history |
| GET | `/api/stats` | System-wide statistics |
| GET | `/api/health` | Backend heartbeat check |


---

## 💡 How It Works

### Registration Flow:
1. User enters details (name, email, phone)
2. Captures photo using webcam
3. Photo converted to base64
4. Stored in `users.json`

### Attendance Flow:
1. User enters email
2. Captures photo
3. System compares with registered photo
4. If match → Attendance marked
5. Record saved in `attendance.json`

---

## 🎨 Frontend Screenshots

**Registration Page:**
- Clean form interface
- Built-in camera capture
- Real-time photo preview

**Attendance Page:**
- Quick email entry
- Camera verification
- Success/error messages

**Records Page:**
- Statistics cards
- Sortable table
- Refresh button

---

## ⚠️ Important Notes

### For Beginners:
1. **Start with the frontend** - It's easier to understand
2. **Learn Postman later** - Once you understand the flow
3. **Read QUICK_START_GUIDE.md** - Everything is explained there

### For Postman Testing:
1. **Use same image** for registration and attendance
2. **Server must be running** before testing
3. **Import the collection** - Don't create requests manually

### For Production:
⚠️ This is a **learning project**. For real production:
- Use a database (MongoDB/PostgreSQL)
- Add real face recognition (TensorFlow.js)
- Implement authentication (JWT)
- Add password encryption
- Use HTTPS

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd attendance-backend
npm install
```

### "Camera not working"
- Allow camera permissions
- Use HTTPS or localhost
- Close other apps using camera

### "Face verification failed"
- Use the **exact same image** for both registration and attendance
- In Postman, copy-paste the base64 string carefully

### "Port 3000 already in use"
- Close other applications using port 3000
- Or change the PORT in `server.js`

---

## 📖 Next Steps

### 1. Start Simple
- Use the frontend application first
- Register yourself
- Mark attendance
- View records

### 2. Learn APIs
- Install Postman
- Import the collection
- Test each endpoint
- Understand the responses

### 3. Customize
- Change the UI colors
- Add new fields
- Modify the design
- Add features

### 4. Upgrade
- Add a database
- Implement real face recognition
- Deploy online
- Add more features

---

## 🎓 Learning Resources

- **Node.js Tutorial:** https://nodejs.org/en/docs/
- **Express.js Guide:** https://expressjs.com/en/starter/installing.html
- **Postman Learning:** https://learning.postman.com/
- **JavaScript:** https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## 🤝 Support

Need help?
1. Read the `QUICK_START_GUIDE.md`
2. Check the troubleshooting section
3. Review the API documentation
4. Test with the frontend first

---

## 📝 License

Free to use for learning and educational purposes!

---

## 🌟 What You Can Build Next

- Add SMS notifications
- Email confirmations
- Report generation (PDF/Excel)
- Admin dashboard
- Mobile app version
- Multi-location support
- Role-based access

---

**Made with ❤️ for learning**

**Start with:** `QUICK_START_GUIDE.md` 🚀
