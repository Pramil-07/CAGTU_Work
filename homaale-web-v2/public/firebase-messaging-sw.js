/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging
importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyCM3MamOWM_1jCZ6IVWY1DXD4BZ-YQr_js",
    authDomain: "homaale-v2.firebaseapp.com",
    projectId: "homaale-v2",
    storageBucket: "homaale-v2.appspot.com",
    messagingSenderId: "580921870783",
    appId: "1:580921870783:web:c8b66525d0962d9636b90a",
    measurementId: "G-5335SFX29W",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: "/firebase-logo.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
