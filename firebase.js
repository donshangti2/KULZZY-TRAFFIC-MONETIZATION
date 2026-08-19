// Kulzzy Traffic Monetization
// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyA5-6nRFImuPDe-KkKZV9d2zRpOICB_q9M",
  authDomain: "kulzzy-radio-app.firebaseapp.com",
  databaseURL: "https://kulzzy-radio-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kulzzy-radio-app",
  storageBucket: "kulzzy-radio-app.firebasestorage.app",
  messagingSenderId: "507050318850",
  appId: "1:507050318850:web:f3ff3bd88e777ef656db1b",
  measurementId: "G-WMZSVT4L5R"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();
