import { useRef, useState } from 'react';

// El selector de imagen (input file oculto + preview local vía URL.createObjectURL) se
// repetía idéntico cuatro veces: alta y edición, en AdminSite.jsx y en AdminServices.jsx.
export function useImagePicker() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return { file, preview, inputRef, handleFileChange, reset };
}
