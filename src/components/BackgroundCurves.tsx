import React from 'react';

export const BackgroundCurves: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#f8fbff]">
      {/* Abstract Background Blur Elements */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-100/60 opacity-50 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[600px] h-[600px] rounded-full bg-blue-50/80 opacity-70 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-50/30 opacity-40 blur-3xl" />

      {/* Subtle Vector Curves */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <circle cx="100" cy="100" r="240" stroke="#0B3B8C" fill="none" strokeWidth="1.5" />
        <circle cx="1300" cy="800" r="320" stroke="#0B3B8C" fill="none" strokeWidth="1.5" />
        <path d="M0,450 Q360,320 720,450 T1440,450" stroke="#0B3B8C" fill="none" strokeWidth="1.5" />
        <path d="M0,200 Q720,700 1440,200" stroke="#E5A100" fill="none" strokeWidth="1" strokeDasharray="6 6" />
      </svg>

      {/* Ultra-subtle dot matrix texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(#0B3B8C 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />
    </div>
  );
};

