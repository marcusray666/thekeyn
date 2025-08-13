export default function BackgroundGlow() {
  // IMPORTANT: -z-10 + pointer-events-none keeps this behind everything.
  return (
    <div
      className="
      pointer-events-none fixed inset-0 -z-10
      [background:
        radial-gradient(600px_240px_at_30%_20%,rgba(254,63,94,.24),transparent_60%),
        radial-gradient(700px_320px_at_80%_80%,rgba(255,210,0,.16),transparent_60%)
      ]
      dark:[background:
        radial-gradient(600px_240px_at_30%_20%,rgba(254,63,94,.08),transparent_60%),
        radial-gradient(700px_320px_at_80%_80%,rgba(255,210,0,.06),transparent_60%)
      ]"
    />
  );
}