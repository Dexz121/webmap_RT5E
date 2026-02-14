# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). Proyecto web para la administración del RT5E (mapa, conductores, viajes, usuarios).

## Cómo correr el Webmap (npm run web)

Requisitos: Node.js (v18 o superior) y npm.

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**  
   Crea un archivo `.env` en la raíz del proyecto (copia `.env.example` y edítalo). El mapa requiere un token de Mapbox:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y asigna tu token público de Mapbox a:
   ```
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.tu_token_aqui
   ```
   Obtén un token en [Mapbox](https://account.mapbox.com/access-tokens/). No subas `.env` al repositorio.

3. **Levantar la app en el navegador**
   ```bash
   npm run web
   ```
   Se abrirá la app en modo web. Si no se abre solo, entra en la URL que muestre la terminal (por ejemplo `http://localhost:8081`).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
