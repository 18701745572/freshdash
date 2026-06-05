import React, { PropsWithChildren, useEffect } from 'react';
import Taro, { useLaunch } from '@tarojs/taro';
import { useAuthStore } from '@/stores/authStore';
import { isTokenValid } from '@/utils/auth';
import './app.scss';

function App({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useLaunch(() => {
    const pages = Taro.getCurrentPages();
    const currentRoute = pages[0]?.route || '';
    const isLoginPage = currentRoute.includes('login');

    if (!isLoginPage && !isTokenValid()) {
      Taro.redirectTo({ url: '/pages/login/index' });
    } else if (isLoginPage && isTokenValid()) {
      Taro.switchTab({ url: '/pages/index/index' });
    }
  });

  return children;
}

export default App;
