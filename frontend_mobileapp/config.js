import Constants from 'expo-constants';

// La URL se inyecta en tiempo de build desde app.config.js → extra.apiUrl.
// Para sobreescribirla localmente: API_URL=http://192.168.x.x:3000 npx expo start
const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';

export default API_URL;
