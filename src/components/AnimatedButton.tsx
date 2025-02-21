import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface AnimatedButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onClick, disabled = false }) => {
  const [isActive, setIsActive] = useState(false);
  const buttonRef = useRef<SVGSVGElement | null>(null);
  const buttonShapeRef = useRef<SVGRectElement | null>(null);
  const buttonColorRef = useRef<SVGRectElement | null>(null);
  const buttonTextRef = useRef<SVGTextElement | null>(null);
  const buttonCheckRef = useRef<SVGTextElement | null>(null);

  // GSAP Timeline for the animation
  const buttonTimeline = useRef(gsap.timeline({ paused: true }));

  useEffect(() => {
    // Inicializa a animação
    const tl = gsap.timeline({ paused: true });

    tl.to(buttonTextRef.current, { duration: 0.15, fillOpacity: 0 })
      .to(buttonShapeRef.current, { duration: 0.25, x: 63, width: 64, ease: "power2.inOut" })
      .to(buttonColorRef.current, { duration: 1.2, strokeDashoffset: 0, ease: "power2.inOut" })
      .to(buttonShapeRef.current, { duration: 0.3, fill: "rgb(30,205,151)" })
      .to(buttonCheckRef.current, { duration: 0.15, fillOpacity: 1 })
      .to(buttonShapeRef.current, { duration: 0.3, fill: "rgb(255, 255, 255)" })
      .to(buttonTextRef.current, { duration: 0.3, fill: "rgb(30,205,151)", fillOpacity: 1 });

    buttonTimeline.current = tl;
  }, []);

  const handleClick = () => {
    if (disabled) return;
    setIsActive(true);
    buttonTimeline.current.restart();
    onClick();
  };

  return (
    <div className="center-component">
      <button
        className={`colins-submit ${isActive ? "is-active" : ""}`}
        onClick={handleClick}
        disabled={disabled}
      >
        <svg
          ref={buttonRef}
          width="196"
          height="70"
          viewBox="0 0 196 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            ref={buttonShapeRef}
            className="btn-shape btn-bg"
            x="3"
            y="3"
            width="190"
            height="64"
            rx="32"
            ry="32"
            fill="#ffffff"
            fillOpacity="1"
            stroke="#ccc"
            strokeWidth="4"
          />
          <rect
            ref={buttonColorRef}
            className="btn-shape btn-color"
            x="3"
            y="3"
            width="190"
            height="64"
            rx="32"
            ry="32"
            fill="#ffffff"
            fillOpacity="0"
            stroke="rgb(30,205,151)"
            strokeWidth="4"
            strokeDasharray="453"
            strokeDashoffset="453"
          />
          <text
            ref={buttonTextRef}
            className="textNode"
            x="96"
            y="40"
            fontFamily="Montserrat"
            fontSize="22"
            fillOpacity="1"
            textAnchor="middle"
            fill="rgb(30,205,151)"
          >
            Submit
          </text>
          <text
            ref={buttonCheckRef}
            className="checkNode"
            x="96"
            y="40"
            fontFamily="Montserrat"
            fontSize="22"
            fillOpacity="0"
            textAnchor="middle"
            fill="rgb(255,255,255)"
          >
            ✔
          </text>
        </svg>
      </button>
    </div>
  );
};

export default AnimatedButton;
