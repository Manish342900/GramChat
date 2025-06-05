import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { axiosInstance } from '../lib/axios';

const useGrammarCorrection = (text) => {
  const [corrected, setCorrected] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedCheckRef = useRef(null);

  const checkGrammar = async (inputText) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/grammar-check", {text:inputText})
      setCorrected(res.data.corrected);

     
    } catch (error) {
      console.error('Grammar check failed:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!debouncedCheckRef.current) {
      debouncedCheckRef.current = debounce(checkGrammar, 1000);
    }

    if (text?.trim()) {
      debouncedCheckRef.current(text);
    }

    return () => {
      debouncedCheckRef.current.cancel();
    };
  }, [text]);

  return { corrected, loading };
};

export default useGrammarCorrection;
