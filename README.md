# Sepify ad video: source files

Real app screens and finished shots for the Sepify ad (test restaurant "Maple Street Café", employee "Alex").

- `shot1-punch-in/punch-in-real-screen.mp4`: finished punch-in shot, the real time clock screens composited onto the tablet.
- `shot1-punch-in/test-punch.mp4`: the raw Higgsfield clip (seedance_2_5, job 8417a7e4-7ac0-4914-a908-97add6f94fc3).
- `shot1-punch-in/still.jpg`: the Higgsfield still used as the start frame (gpt_image_2_5, job b65dfef0-6fd1-4ea8-9a35-4ad9392537c2).
- `shot1-punch-in/real-screens/`: real app screens (PIN 0–4, face check progress, It's you, Clocked in).
- `real-kiosk-pin.png`: real PIN screen used as the reference for the still.
- `tools/`: how it was made.
  - `render.js`: renders the real screens with Playwright from a local dev server.
  - `kiosk-preview-page.tsx` and `kiosk-states-preview.tsx`: temporary local preview routes (put under app/zz-kiosk-preview and app/zz-kiosk-states; never commit them to the app).
  - `face-crop.jpg`: the employee's face fed to the face check as the camera.
  - `comp.py`: OpenCV compositing (tracking, hand mask, glitch paint-out).
