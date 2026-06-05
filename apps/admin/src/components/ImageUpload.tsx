import { useState } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import { getUploadSign } from '../services/api';

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  maxSizeMB?: number;
}

export default function ImageUpload({ value = [], onChange, maxCount = 5, maxSizeMB = 5 }: ImageUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, i) => ({ uid: String(i), name: `image-${i}`, status: 'done', url }))
  );

  const handleChange: UploadProps['onChange'] = ({ fileList: newList }) => {
    setFileList(newList);
    const urls = newList.filter((f) => f.status === 'done').map((f) => f.url || f.response?.url || '');
    onChange?.(urls.filter(Boolean));
  };

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const raw = file as File;
      if (raw.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`单张图片不能超过 ${maxSizeMB}MB`);
      }
      await getUploadSign();
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(raw);
      });
      onSuccess?.({ url });
    } catch (e) {
      message.error((e as Error).message);
      onError?.(e as Error);
    }
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      onChange={handleChange}
      customRequest={customRequest}
      accept="image/*"
      maxCount={maxCount}
    >
      {fileList.length < maxCount && (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
  );
}
