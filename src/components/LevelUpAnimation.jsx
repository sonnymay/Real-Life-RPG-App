import React, { useEffect, useState } from "react";

const LevelUpAnimation = ({ level, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center animate-bounce">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-indigo-700 mb-2">Level Up!</h2>
        <p className="text-xl text-gray-700">You reached level {level}!</p>
      </div>
    </div>
  );
};

export default LevelUpAnimation;
