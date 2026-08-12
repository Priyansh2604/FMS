import React from "react";

const DIGIT_ANGLES = [-45, 45, 135, 225];

export default function OtpCircle({ digits, status = "idle" }) {
  const filled = digits.filter(Boolean).length;
  const ringRadius = 104;
  const circumference = 2 * Math.PI * ringRadius;

  return (
    <div className={`otp-circle otp-circle--${status}`}>
      {/* Ring */}
      <svg className="otp-circle__ring" viewBox="0 0 260 260" aria-hidden="true">
        <circle
          className="otp-circle__track"
          cx="130"
          cy="130"
          r={ringRadius}
        />
        <circle
          className="otp-circle__progress"
          cx="130"
          cy="130"
          r={ringRadius}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      {/* Orbiting digits */}
      <div className="otp-circle__orbit">
        {DIGIT_ANGLES.map((angle, i) => (
          <div
            key={i}
            className={`otp-circle__digit ${i < filled ? "otp-circle__digit--filled" : ""}`}
            style={{ "--angle": `${angle}deg`, "--i": i, "--orbit": "88px" }}
          >
            {digits[i] || ""}
          </div>
        ))}
      </div>

      {/* Success sparkles */}
      {DIGIT_ANGLES.map((angle, i) => (
        <span
          key={`sparkle-${i}`}
          className="otp-circle__sparkle"
          style={{ "--angle": `${angle + 45}deg`, "--i": i, "--orbit": "118px" }}
        />
      ))}

      {/* Center checkmark */}
      <div className="otp-circle__center">
        <svg className="otp-circle__check" viewBox="0 0 52 52" aria-hidden="true">
          <path d="M14 27 L22 35 L38 18" />
        </svg>
      </div>
    </div>
  );
}
