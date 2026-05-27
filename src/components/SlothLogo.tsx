import { motion } from 'motion/react';

export const SlothLogo = ({ size = 56, staticMode = false, showText = false, version = "v2.0" }: { size?: number, staticMode?: boolean, showText?: boolean, version?: string }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transformOrigin: 'top center' }}>
      <defs>
        {!staticMode && (
          <style>{`
            @keyframes slothSwingLogo {
              0% { transform: rotate(0deg); }
              4% { transform: rotate(8deg); }
              8% { transform: rotate(-8deg); }
              12% { transform: rotate(5deg); }
              16% { transform: rotate(-3deg); }
              20% { transform: rotate(0deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes slothEyeBlinkLogo {
              0%, 3%, 100% { transform: scaleY(1); }
              1.5% { transform: scaleY(0.1); }
            }
            .sloth-swing-logo {
              animation: slothSwingLogo 12s infinite ease-in-out;
              transform-origin: 50% 10px;
            }
            .sloth-eye-logo {
              animation: slothEyeBlinkLogo 12s infinite ease-in-out;
              transform-origin: 50% 50%;
            }
          `}</style>
        )}
      </defs>
      {/* The Branch */}
      <path d="M10,24 Q50,32 90,24" stroke="#8E7051" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M30,24 Q32,14 25,10" stroke="#8E7051" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Cute Leaf on branch */}
      <path d="M25,10 Q20,12 25,16 Z" fill="#7CB342" />
      
      <g className={!staticMode ? "sloth-swing-logo" : ""}>
        {/* Hanging arm left */}
        <path d="M40,25 L44,45" stroke="#A78B71" strokeWidth="7" strokeLinecap="round" />
        {/* Hanging arm right */}
        <path d="M60,25 L56,45" stroke="#A78B71" strokeWidth="7" strokeLinecap="round" />
        {/* Curved Claws */}
        <path d="M38,23 A2.5,2.5 0 0 1 42,23" fill="none" stroke="#ECEFF1" strokeWidth="2" strokeLinecap="round" />
        <path d="M58,23 A2.5,2.5 0 0 1 62,23" fill="none" stroke="#ECEFF1" strokeWidth="2" strokeLinecap="round" />
        
        {/* Body */}
        <circle cx="50" cy="56" r="16" fill="#A78B71" />
        
        {/* Head */}
        <circle cx="50" cy="45" r="12" fill="#A78B71" />
        {/* Cute Face Mask */}
        <path d="M42,44 C42,40 45,39 50,42 C55,39 58,40 58,44 C58,50 53,51 50,51 C47,51 42,50 42,44 Z" fill="#EAD4BE" />
        
        {/* Left eye patch */}
        <ellipse cx="45" cy="44" rx="3" ry="4.5" fill="#8D6E63" transform="rotate(-15 45 44)" />
        {/* Right eye patch */}
        <ellipse cx="55" cy="44" rx="3" ry="4.5" fill="#8D6E63" transform="rotate(15 55 44)" />
        
        {/* Eyes with blinking animation */}
        <circle cx="44.5" cy="44" r="1.2" fill="#212121" className={!staticMode ? "sloth-eye-logo" : ""} />
        <circle cx="55.5" cy="44" r="1.2" fill="#212121" className={!staticMode ? "sloth-eye-logo" : ""} />
        
        {/* Nose */}
        <ellipse cx="50" cy="47" rx="1.8" ry="1" fill="#3E2723" />
        
        {/* Mouth */}
        <path d="M48,49 Q50,50.2 52,49" fill="none" stroke="#3E2723" strokeWidth="1" strokeLinecap="round" />
        
        {/* Cheeks */}
        <circle cx="43" cy="46" r="1.2" fill="#E57373" opacity="0.6" />
        <circle cx="57" cy="46" r="1.2" fill="#E57373" opacity="0.6" />
        
        {/* Feet */}
        <circle cx="44" cy="70" r="4" fill="#8E7051" />
        <circle cx="56" cy="70" r="4" fill="#8E7051" />
      </g>
    </svg>

    {showText && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ width: size * 1.5, height: size * 1.5, left: -size * 0.25, top: -size * 0.25 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <path id="circlePath" d="M 50, 50 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
          </defs>
          <text className="fill-[#58CC02] font-black text-[12px] uppercase tracking-[0.3em]">
            <textPath xlinkHref="#circlePath" startOffset="0%">
              BAKI • الأكاديمية • BAKI • الأكاديمية •
            </textPath>
          </text>
        </svg>
      </div>
    )}
  </div>
);
