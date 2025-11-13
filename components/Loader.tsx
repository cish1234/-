
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center my-8">
    <div className="border-4 border-gray-200 border-t-amber-600 rounded-full w-12 h-12 animate-spin"></div>
    <p className="mt-4 text-amber-700 font-semibold">{message}</p>
  </div>
);

export default Loader;
