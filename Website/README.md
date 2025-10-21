# Create main project folder
mkdir ai-journal-app
cd ai-journal-app

# Create client (frontend) with Vite
npm create vite@latest client -- --template react
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom recharts lucide-react date-fns
cd ..

# Create server (backend)
mkdir server
cd server
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken openai
npm install -D nodemon
cd ..

#  Github :

git init
git add .
git commit -m ""
git branch -M main -> 1st time alone
git remote add origin https:// github-link   -> 1st time alone
git push -u origin main

#  Project File Structure

Project/
├── Website/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx           # Main React component (artifact code goes here)
│   │   ├── index.css         # Tailwind styles
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                    # Backend (Node + Express)
    ├── models/
    │   ├── User.js           # User schema
    │   └── Journal.js        # Journal schema
    ├── routes/
    │   ├── auth.js           # Auth routes
    │   └── journal.js        # Journal routes
    ├── middleware/
    │   └── auth.js           # JWT authentication
    ├── .env                  # Environment variables
    ├── server.js             # Main server file
    └── package.json