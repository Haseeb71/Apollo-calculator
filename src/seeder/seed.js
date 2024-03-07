const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const serviceAccount = require('../controller/apollo-new-be333-firebase-adminsdk-pkue0-d1a84782a3.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://console.firebase.google.com/u/0/project/apollo-new-be333/firestore/data/~2F',
});

// Reference to Firestore database
const firestore = admin.firestore();

// Define your seed data
const seedData = [
  {
    email: 'jhonede@gmail.com',
    password: '1234'
  },
  // Add more seed data as needed
];

// Function to seed the Firestore database
const seedFirestore = async () => {
  try {
    // Loop through seed data
    for (const { email, password } of seedData) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Add data to Firestore
      await firestore.collection('user').add({
        email,
        password: hashedPassword,
      });

      console.log('Document added to Firestore:', email);
    }

    console.log('Firestore seeded successfully');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  } finally {
    admin.app().delete();
  }
};

seedFirestore();
