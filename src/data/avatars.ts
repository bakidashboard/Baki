
export const BAKI_AVATARS = Array.from({ length: 50 }).map((_, i) => ({
  id: `avatar_${i + 1}`,
  url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 42}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}));

export const getRandomAvatar = (name?: string, gender?: 'male' | 'female' | 'other') => {
  const seed = name || Math.random().toString();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
