/** 姓名脱敏：张三 → 张* */
export function maskName(name: string): string {
  if (!name) return '';
  return `${name.charAt(0)}*`;
}

/** 手机号脱敏：13800138000 → 138****8000 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}
