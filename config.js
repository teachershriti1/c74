import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDsncilaZavvVZPWlFJXm9rltqvdfGAhFI",
    authDomain: "wily-2be0f.firebaseapp.com",
    databaseURL: "https://wily-2be0f-default-rtdb.firebaseio.com",
    projectId: "wily-2be0f",
    storageBucket: "wily-2be0f.appspot.com",
    messagingSenderId: "575976018910",
    appId: "1:575976018910:web:2c3dffd125013d0e38c34f"
  };
  // Initialize Firebase
  if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
  }
  export default firebase.firestore()