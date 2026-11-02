"use client";
// Local preview only (never committed): renders the real kiosk face check and success screens.
import { useEffect, useState } from "react";
import { FaceVerificationPanel } from "@/components/kiosk/FaceVerificationPanel";
import KioskSuccessScreen from "@/components/KioskSuccessScreen";

export default function States() {
  const [s, setS] = useState<string>("face");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [progress, setProgress] = useState(0.15);
  useEffect(() => {
    setS(new URLSearchParams(location.search).get("s") ?? "face");
    const p = Number(new URLSearchParams(location.search).get("p") ?? "0.15");
    setProgress(p);
    const img = new Image();
    img.src = "/zz-face.jpg";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 720; c.height = 960;
      const ctx = c.getContext("2d")!;
      const draw = () => { ctx.drawImage(img, 0, 0, 720, 960); requestAnimationFrame(draw); };
      draw();
      setStream(c.captureStream(30));
    };
  }, []);
  const at = new Date(); at.setHours(9, 0, 4, 0);
  return (
    <div data-org-theme="sepify">
      {s === "done" ? (
        <KioskSuccessScreen employeeName="Alex" action="clock_in" location={"Downtown" as never} onComplete={() => {}} durationSeconds={600} occurredAt={at.toISOString()} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal select-none kiosk-root kiosk-face-screen">
          <div className="w-full mx-auto flex flex-col items-center kiosk-face-layout h-full">
            <FaceVerificationPanel
              employeeName="Alex"
              stream={stream}
              progress={s === "ok" ? 1 : progress}
              headline={s === "ok" ? "Verified" : "Hold still"}
              ringMode={s === "ok" ? "success" : "scanning"}
              statusItems={[]}
              showSuccessOverlay={s === "ok"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
