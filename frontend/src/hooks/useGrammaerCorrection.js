import { useState, useRef } from 'react';
import debounce from 'lodash.debounce';
import { axiosInstance } from '../lib/axios';

const useGrammarCorrection = () => {
  const [corrected, setCorrected] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedCheckRef = useRef(null);

  const checkGrammar = async (inputText) => {
    if (!inputText?.trim()) return;

    try {
      setLoading(true);
      setCorrected("")
      const res = await axiosInstance.post("/grammar-check", { text: inputText });
      setCorrected(res.data.corrected);
    } catch (error) {
      console.error('Grammar check failed:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  const clearCorrection = () => {
    setCorrected("");
  };


  if (!debouncedCheckRef.current) {
    debouncedCheckRef.current = debounce(checkGrammar, 1000);
  }

  return {
    corrected,
    loading,
    checkGrammar: debouncedCheckRef.current,
    clearCorrection
  };
};

export default useGrammarCorrection;
