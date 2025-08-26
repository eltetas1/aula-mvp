# Aula MVP Starter (Next.js + Firebase)

Este proyecto es un punto de partida muy sencillo para un aula:

- Avisos públicos
- Tareas públicas
- Entregas de alumnos sin necesidad de cuenta
- Panel protegido para el docente (login con email/contraseña)
- RGPD básico y banner de cookies

## Requisitos

- Node.js 18+ (LTS) y npm
- Una cuenta de Firebase

## Pasos rápidos

1. Descarga este proyecto y descomprime.
2. Entra a la carpeta y ejecuta:
   ```bash
   npm install
   ```
3. Crea un proyecto en Firebase y habilita:
   - **Authentication** > Email/Password
   - **Firestore Database** (región europea)
4. Copia la configuración web de Firebase en un archivo `.env.local` (ver el ejemplo `.env.example`).
5. Lanza el proyecto en local:
   ```bash
   npm run dev
   ```
6. Abre http://localhost:3000

### Seguridad (Firestore rules)

En la consola de Firebase > Firestore > Reglas, pega el contenido de `firestore.rules` y publica.

Crea en Firestore la colección `admins` y añade un documento con **ID = UID** del docente (cópialo desde la pestaña Authentication). Ese usuario podrá crear/editar tareas y avisos.

### Despliegue

Puedes desplegar en Vercel: crea un proyecto nuevo desde este repositorio/carpeta y añade las variables de entorno de Firebase (prefijo `NEXT_PUBLIC_...`).
