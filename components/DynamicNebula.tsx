
import React from 'react';

const DynamicNebula: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden bg-[#050505]">
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-30">
        <div className="absolute top-0 left-0 w-full h-full animate-nebula-slow bg-[radial-gradient(circle_at_20%_30%,#ec4899_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full animate-nebula-reverse bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full animate-nebula-drift bg-[radial-gradient(circle_at_50%_50%,#a855f7_0%,transparent_40%)]" />
      </div>
      <style>{`
        @keyframes nebula-slow {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, 2%); }
        }
        @keyframes nebula-reverse {
          0%, 100% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1) translate(2%, -2%); }
        }
        @keyframes nebula-drift {
          0%, 100% { transform: translate(-1%, -1%); opacity: 0.2; }
          50% { transform: translate(1%, 1%); opacity: 0.4; }
        }
        .animate-nebula-slow { animation: nebula-slow 20s ease-in-out infinite; }
        .animate-nebula-reverse { animation: nebula-reverse 25s ease-in-out infinite; }
        .animate-nebula-drift { animation: nebula-drift 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default DynamicNebula;
