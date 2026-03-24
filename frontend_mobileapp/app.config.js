// app.config.js extiende app.json dinámicamente para poder inyectar
// la URL del servidor según el entorno sin hardcodearla en el bundle.
//
// Para cambiar la URL sin tocar el código:
//   API_URL=https://mi-servidor.com npx expo start
//
// En producción (EAS Build), configura la variable en eas.json bajo
// el campo "env" del perfil correspondiente.

const appJson = require('./app.json');

export default {
    ...appJson.expo,
    extra: {
        ...appJson.expo.extra,
        apiUrl: process.env.API_URL ?? "https://appears-fan-willow-son.trycloudflare.com",
    },
    plugins: [
        "expo-secure-store",
        "expo-camera",
        "expo-image-picker",
        "expo-media-library",
    ],
};
