(function () {
    let firebaseConfig = {
        apiKey: "AIzaSyDoz5MDN9SHpAmYvSwjj3iJj-xksTuljFU",
        authDomain: "leoram-stories.firebaseapp.com",
        projectId: "leoram-stories",
        storageBucket: "leoram-stories.appspot.com",
        messagingSenderId: "43259591710",
        appId: "1:43259591710:web:90fe7db23670e958a5820f",
        measurementId: "G-HBTX6BL12V"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    window.analytics = firebase.analytics();
})();