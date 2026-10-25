import React from 'react';

const CostCalculatingLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <video
        src="/Print-loader.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-64 max-w-full rounded-2xl"
      />
      <h3 className="text-2xl font-bold text-black mt-6 mb-2">Crunching your cost...</h3>
      <p className="text-gray-600">Hang tight while we compute every sheet precisely.</p>
    </div>
  );
};

export default CostCalculatingLoader;
