# vintage photo booth

A vintage-inspired web photo booth built with Next.js. It uses your camera to capture three photos, applies classic film filters and darkroom effects, and composes the results into one printable photo strip.

## Features

- Requests camera access through the browser
- Captures three photos with a traditional countdown sequence
- Mirrors and center-crops the camera preview like a real booth
- Includes eight film looks:
  - Original
  - Noir
  - Sepia
  - Vintage
  - Faded
  - '70s
  - Chrome
  - Polaroid
- Includes darkroom effects:
  - Film grain
  - Vignette
  - Light leak
  - Date stamp
- Supports a custom caption on the final strip
- Exports the finished strip as a PNG
- Prints the photo strip using the browser print dialog
- Responsive layout for desktop and mobile
- No database or backend is required; processing happens in the browser

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React icons
- HTML video, canvas, and `MediaDevices.getUserMedia`

## Requirements

- Node.js 20 or newer
- A modern browser with camera support
- Camera permission for the site

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open the app at:

```text
http://localhost:3000
```

You can also use npm if preferred:

```bash
npm install
npm run dev
```


If camera access is blocked, enable it in your browser or operating system settings and click **Try Again**.

## Camera Permissions

Camera access works on `localhost` during development. In production, the app should be served over HTTPS because browsers generally block camera access on insecure origins.

## Project Structure

```text
app/
  layout.tsx             Global metadata, fonts, and viewport settings
  page.tsx               Renders the photo booth
  globals.css            Vintage theme tokens, backdrop, grain, and animations

components/
    incoming

lib/
  photobooth.ts          Filters, canvas frame drawing, effects, and strip composition
```


## Production Build

Create a production build:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```
