
import React, { useCallback } from 'react';

interface ContentInputProps {
  content: string;
  setContent: (content: string) => void;
  image: { file: File; preview: string } | null;
  setImage: (image: { file: File; preview: string } | null) => void;
  onOcr: () => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ content, setContent, image, setImage, onOcr }) => {
  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setImage({ file, preview });
      } else {
        alert('請上傳有效的圖片檔！');
      }
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-amber-600', 'bg-amber-100');
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-amber-600', 'bg-amber-100');
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-amber-600', 'bg-amber-100');
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  }, []);
  
  const onPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
                 const preview = URL.createObjectURL(file);
                 setImage({ file, preview });
            }
            break;
        }
    }
  }, [setImage]);


  return (
    <div className="mb-6">
      <label className="block mb-2 font-bold text-gray-700 text-lg">1. 請貼上課文內容</label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onPaste={onPaste}
        tabIndex={0}
        className="relative mb-2 p-4 border-2 border-dashed border-orange-300 rounded-lg text-center text-gray-500 min-h-[8rem] flex justify-center items-center transition-colors focus:outline-none focus:border-amber-600 focus:bg-orange-50"
      >
        {!image && (
          <div>
            <p>將檔案拖曳至此</p>
            <p className="text-sm">或直接貼上圖片 (Ctrl+V)</p>
          </div>
        )}
        {image && (
          <>
            <img src={image.preview} alt="Preview" className="max-h-28 max-w-full object-contain" />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm z-10"
            >
              &times;
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="image-upload" className="btn btn-secondary cursor-pointer">選擇檔案</label>
        <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
        <button onClick={onOcr} disabled={!image} className="btn btn-secondary">開始辨識</button>
      </div>
      <textarea
        id="main-text"
        rows={10}
        className="w-full p-3 border border-orange-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
        placeholder="請在此處貼上完整的課文..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
};

export default ContentInput;
