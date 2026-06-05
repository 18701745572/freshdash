import React, { useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuthStore } from '@/stores/authStore';
import { getPromoterCode } from '@/stores/promoterStore';
import styles from './index.module.scss';

const CANVAS_ID = 'posterCanvas';
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 450;

const PromoterPosterPage: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const code = getPromoterCode();
  const drawn = useRef(false);

  useEffect(() => {
    if (drawn.current) return;
    drawn.current = true;

    const query = Taro.createSelectorQuery();
    query.select(`#${CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = Taro.getSystemInfoSync().pixelRatio || 2;
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        ctx.scale(dpr, dpr);

        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#00b578');
        gradient.addColorStop(1, '#008f5f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('鲜达生鲜', CANVAS_WIDTH / 2, 60);

        ctx.font = '14px sans-serif';
        ctx.fillText('新鲜直达，品质生活', CANVAS_WIDTH / 2, 90);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(CANVAS_WIDTH / 2 - 60, 130, 120, 120);
        ctx.fillStyle = '#333333';
        ctx.font = '12px sans-serif';
        ctx.fillText('扫码购买', CANVAS_WIDTH / 2, 195);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText(`推广码：${code}`, CANVAS_WIDTH / 2, 290);

        if (userInfo?.nickName) {
          ctx.font = '14px sans-serif';
          ctx.fillText(`推荐人：${userInfo.nickName}`, CANVAS_WIDTH / 2, 320);
        }

        ctx.font = '12px sans-serif';
        ctx.fillText('长按识别小程序，开启生鲜之旅', CANVAS_WIDTH / 2, 380);
      });
  }, [code, userInfo]);

  const handleSave = () => {
    const query = Taro.createSelectorQuery();
    query.select(`#${CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) {
          Taro.showToast({ title: '海报生成中，请稍后', icon: 'none' });
          return;
        }
        Taro.canvasToTempFilePath({
          canvas: res[0].node,
          success: (fileRes) => {
            Taro.saveImageToPhotosAlbum({
              filePath: fileRes.tempFilePath,
              success: () => Taro.showToast({ title: '已保存到相册', icon: 'success' }),
              fail: () => Taro.showToast({ title: '保存失败，请授权相册', icon: 'none' }),
            });
          },
          fail: () => Taro.showToast({ title: '生成图片失败', icon: 'none' }),
        });
      });
  };

  return (
    <View className={styles.page}>
      <Canvas
        type="2d"
        id={CANVAS_ID}
        className={styles.canvas}
        style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
      />
      <View className={styles.preview}>
        <Text className={styles.logo}>鲜达生鲜</Text>
        <Text className={styles.slogan}>新鲜直达，品质生活</Text>
        <View className={styles.qrPlaceholder}>二维码区域</View>
        <Text className={styles.codeText}>推广码：{code}</Text>
        <Text className={styles.tip}>长按识别小程序，开启生鲜之旅</Text>
      </View>
      <View className={styles.saveBtn} onClick={handleSave}>保存海报到相册</View>
    </View>
  );
};

export default PromoterPosterPage;
