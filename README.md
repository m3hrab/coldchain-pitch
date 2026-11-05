# ColdChain Pitch

This project is a Remotion-based pitch video for the ColdChain solution. It includes a local preview workflow and an export command to render the final MP4.

## Requirements

- Node.js 18+
- npm

## Install

From the project root:

```bash
npm install
```

## Run locally

Start the Remotion Studio preview:

```bash
npm run dev
```

This opens the local editor/preview where you can review the animation and make changes live.

## Export the video

Render the final MP4:

```bash
npm run render
```

This creates the video in the `out/` folder. The default output file is:

```bash
out/FASTROBOX_IOT_AlphaMatrix_R1.mp4
```

If you want to change the output filename or rendering settings, edit the `render` script in `package.json`:

```json
"render": "remotion render ColdChainPitch out/your-video-name.mp4 --codec=h264 --crf=18"
```

## Change the team name

Open `src/brand.ts` and update the `teamName` value:

```ts
export const teamName = "Your Team Name";
```

You can also change other brand text in the same file such as:

```ts
export const eventName = "FastRoboX 1.0";
export const segmentName = "IoT Segment";
export const projectName = "ColdChain";
export const tagline = "Every dose. Every degree. Proven.";
```

## Change the logo / brand image

The main logo is configured in `src/brand.ts`:

```ts
export const eventLogo: string | null = "logo.png";
```

Replace the file in `public/logo.png` with your new logo image, or point to a different file path if needed.

If you do not want a logo, set:

```ts
export const eventLogo: string | null = null;
```

## Change team member names and photos

Edit `src/team.ts`:

```ts
export const members: Member[] = [
  {
    name: "Your Name",
    role: "Your Role",
    photo: "team/your-photo.png",
  },
];
```

- `name`: team member name
- `role`: job title displayed in the video
- `photo`: path to the image file in `public/`

Place member images in the `public/team/` folder. For example:

```text
public/
  logo.png
  team/
    your-photo.png
```

## Useful project structure

```text
public/
  logo.png
  team/
src/
  brand.ts
  team.ts
  Root.tsx
  index.ts
package.json
```

## Notes

- The app uses Remotion and reads image files from the `public/` folder.
- After changing assets, restart the dev preview if the browser does not refresh automatically.
- The exported video uses the composition ID `ColdChainPitch` from `src/Root.tsx`.
