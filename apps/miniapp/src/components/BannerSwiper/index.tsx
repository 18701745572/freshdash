import React from 'react';
import { Swiper, SwiperItem, Image } from '@tarojs/components';
import { Banner } from '@/types';
import styles from './index.module.scss';

interface Props {
  banners: Banner[];
}

const BannerSwiper: React.FC<Props> = ({ banners }) => {
  return (
    <Swiper
      className={styles.swiper}
      indicatorColor="#999"
      indicatorActiveColor="#00b578"
      circular
      indicatorDots
      autoplay
    >
      {banners.map((banner) => (
        <SwiperItem key={banner.id}>
          <Image className={styles.image} src={banner.imageUrl} mode="aspectFill" />
        </SwiperItem>
      ))}
    </Swiper>
  );
};

export default BannerSwiper;
