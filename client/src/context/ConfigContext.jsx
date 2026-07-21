import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/system/config/public');
      setConfig(res.data);
      
      // Apply appearance settings globally
      if (res.data?.appearance) {
        if (res.data.appearance.accentColor) {
          document.documentElement.style.setProperty('--c-orange', res.data.appearance.accentColor);
          document.documentElement.style.setProperty('--c-orange-hover', res.data.appearance.accentColor + 'E6');
        }
      }
      
      if (res.data?.general?.platformName) {
        document.title = res.data.general.platformName;
      }
      
    } catch (error) {
      console.error('Failed to load public config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
