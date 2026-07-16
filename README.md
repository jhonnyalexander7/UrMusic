UrMusic

Aplicación móvil híbrida de streaming, grabación y descubrimiento musical, desarrollada con Ionic + Angular + Capacitor. Permite explorar y reproducir canciones a través de la API de Spotify, grabar versiones propias mezclando voz e instrumental, guardar una biblioteca personal, descubrir conciertos cercanos en un mapa interactivo y conectarse a dispositivos de audio por Bluetooth.

Tecnologías utilizadas


Framework: Ionic 8 + Angular 20 (standalone components)
Empaquetado nativo: Capacitor 8


Plugins de Capacitor:

PluginUso@capacitor/geolocationObtener la ubicación GPS del usuario para el mapa de conciertos@capacitor/networkDetectar el estado de conexión (online/offline) en tiempo real@capacitor-community/bluetooth-leEscanear y conectar dispositivos de audio Bluetooth (BLE)@capacitor-mlkit/barcode-scanningEscanear códigos QR para compartir canciones

Otras librerías:


@ionic/storage-angular — persistencia local de la biblioteca musical (IndexedDB)
leaflet — mapa interactivo de conciertos cercanos
axios — consumo de la API REST de Spotify
qrcode — generación de códigos QR para compartir canciones
Web Audio API (nativa del navegador) — grabación, mezcla y efectos de audio


Instalación

bashgit clone https://github.com/jhonnyalexander7/UrMusic.git
cd UrMusic
npm install
ionic serve

Requiere Node.js y el CLI de Ionic (npm install -g @ionic/cli) instalados previamente.

Estructura del proyecto

UrMusic/
├── src/app/
│   ├── components/       # Componentes reutilizables (mini-player, network-banner)
│   ├── pages/             # Páginas de la app (library, artist, player, concerts, etc.)
│   ├── services/          # Servicios (spotify, library, bluetooth, geolocation, network...)
│   ├── tabs/               # Navegación por pestañas
│   └── tab1, tab2, tab3/  # Pestañas principales
├── src/assets/
└── src/theme/

Capturas de pantalla

Biblioteca

Mostrar imagen

Reproductor

Mostrar imagen

Mapa de conciertos

Mostrar imagen

Grabación de audio

Mostrar imagen

Escáner QR

Mostrar imagen

Dispositivos Bluetooth

Mostrar imagen

Funcionalidades por unidad del curso

UnidadFuncionalidadUbicación en el código1-2. NavegaciónTabs + lazy loadingapp.routes.ts, tabs.routes.ts3. Interfaces y gestosSwipe para eliminar, pull-to-refreshpages/library/4. ConectividadDetección de red online/offlineservices/network.ts5. BluetoothEscaneo y conexión BLEservices/bluetooth.ts6. GeolocalizaciónGPS + mapa de conciertosservices/geolocation.ts7. MultimediaGrabación y mezcla de audioservices/audio-recorder.ts, services/audio-effects.ts8. Cámara/QREscaneo de códigos QRservices/qr-scanner.ts9. AlmacenamientoBiblioteca persistenteservices/library.ts10. Servicios webConsumo de API REST de Spotifyservices/spotify.service.ts, services/spotify-auth.ts

Equipo

Proyecto individual — Jhonny de los Santos (Matrícula: 100067208)
Asignatura: Programación de Dispositivos Móviles — ISW-307
Facilitador: Joan Manuel Gregorio Pérez
