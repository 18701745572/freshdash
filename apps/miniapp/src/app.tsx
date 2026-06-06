import React, { useEffect } from 'react';
import Taro, { useLaunch } from '@tarojs/taro';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useAddressStore } from '@/stores/addressStore';
import { useOrderStore } from '@/stores/orderStore';
import { usePromoterStore } from '@/stores/promoterStore';
import './app.scss';

function App(props) {
  const login = useAuthStore((s) => s.login);
  const loadAuth = useAuthStore((s) => s.loadFromStorage);
  const loadCart = useCartStore((s) => s.loadFromStorage);
  const loadAddress = useAddressStore((s) => s.loadFromStorage);
  const loadOrders = useOrderStore((s) => s.loadFromStorage);
  const loadPromoter = usePromoterStore((s) => s.loadFromStorage);
  const bindPromoter = usePromoterStore((s) => s.bindPromoter);

  useLaunch((options) => {
    loadAuth();
    loadCart();
    loadAddress();
    loadOrders();
    loadPromoter();

    login();

    const promoterCode = options?.query?.promoterCode as string | undefined;
    if (promoterCode) {
      bindPromoter(promoterCode);
      Taro.showToast({ title: '推广员绑定成功', icon: 'success' });
    }
  });

  useEffect(() => {
    Taro.showShareMenu({ withShareTicket: true });
  }, []);

  return props.children;
}

export default App;
