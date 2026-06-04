import { Category } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: '水果', icon: '🍎' },
  { id: '2', name: '蔬菜', icon: '🥬' },
  { id: '3', name: '肉禽', icon: '🍗' },
  { id: '4', name: '水产', icon: '🐟' },
  { id: '5', name: '蛋奶', icon: '🥚' },
  { id: '6', name: '粮油', icon: '🍚' },
  { id: '7', name: '熟食', icon: '🍖' },
  { id: '8', name: '速冻', icon: '🧊' },
];

export const mockCategoryTree: Category[] = [
  {
    id: '1', name: '水果',
    children: [
      { id: '11', name: '苹果' },
      { id: '12', name: '香蕉' },
      { id: '13', name: '橙子' },
      { id: '14', name: '葡萄' },
    ]
  },
  {
    id: '2', name: '蔬菜',
    children: [
      { id: '21', name: '叶菜' },
      { id: '22', name: '根茎' },
      { id: '23', name: '菌菇' },
      { id: '24', name: '豆类' },
    ]
  },
  {
    id: '3', name: '肉禽',
    children: [
      { id: '31', name: '猪肉' },
      { id: '32', name: '牛肉' },
      { id: '33', name: '羊肉' },
      { id: '34', name: '鸡肉' },
    ]
  },
  {
    id: '4', name: '水产',
    children: [
      { id: '41', name: '鱼类' },
      { id: '42', name: '虾蟹' },
      { id: '43', name: '贝类' },
    ]
  },
  {
    id: '5', name: '蛋奶',
    children: [
      { id: '51', name: '鸡蛋' },
      { id: '52', name: '牛奶' },
      { id: '53', name: '酸奶' },
    ]
  },
];
