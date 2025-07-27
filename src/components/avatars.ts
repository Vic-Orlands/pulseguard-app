export const availableAvatars: string[] = [
  "None",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
  "https://api.dicebear.com/7.x/big-ears/svg?seed=user1&w=64&h=64",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer1&w=64&h=64",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer2&w=64&h=64",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy&w=64&h=64",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool&w=64&h=64",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&w=64&h=64",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&w=64&h=64",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max&w=64&h=64",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Rio&w=64&h=64",
];

export function getRandomAvatars(avatars: string[], count = 3): string[] {
  const avatarsCopy = avatars.slice(1);
  for (let i = avatarsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [avatarsCopy[i], avatarsCopy[j]] = [avatarsCopy[j], avatarsCopy[i]];
  }
  return avatarsCopy.slice(0, count);
}
