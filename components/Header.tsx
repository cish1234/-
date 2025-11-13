
import React from 'react';

const Header: React.FC = () => (
  <header className="text-center p-6 sm:p-8 bg-white">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-stone-800">
        個別化出題小幫手
      </h1>
      <p className="text-base sm:text-lg text-gray-600 mt-2">
        貼上文本或上傳圖片，自動生成選擇題、問答題、素養題，備課更輕鬆！
      </p>
    </div>
  </header>
);

export default Header;
