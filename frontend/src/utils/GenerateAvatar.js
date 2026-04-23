const generateDiceBearAvataaars = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

const generateDiceBearBottts = (seed) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;

const generateDiceBearGridy = (seed) =>
  `https://api.dicebear.com/7.x/gridy/svg?seed=${seed}`;

export const generateAvatar = () => {
  const data = [];

  for (let i = 0; i < 2; i++) {
    data.push(generateDiceBearAvataaars(Math.random()));
  }

  for (let i = 0; i < 2; i++) {
    data.push(generateDiceBearBottts(Math.random()));
  }

  for (let i = 0; i < 2; i++) {
    data.push(generateDiceBearGridy(Math.random()));
  }

  return data;
};