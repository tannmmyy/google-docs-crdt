// Authentic Google Docs collaborator color palette
export const COLLAB_COLORS = [
  { name: 'Red', hex: '#EA4335', bg: '#FCE8E6' },
  { name: 'Blue', hex: '#1A73E8', bg: '#E8F0FE' },
  { name: 'Green', hex: '#34A853', bg: '#E6F4EA' },
  { name: 'Yellow', hex: '#FBBC04', bg: '#FEF7E0' },
  { name: 'Purple', hex: '#A142F4', bg: '#F3E8FD' },
  { name: 'Teal', hex: '#12B5CB', bg: '#E4F7FB' },
  { name: 'Orange', hex: '#FA7B17', bg: '#FEF0E6' },
  { name: 'Pink', hex: '#E52592', bg: '#FCE8F3' },
];

export const GOOGLE_DOCS_NAMES = [
  'Anonymous Alligator',
  'Anonymous Beaver',
  'Anonymous Capybara',
  'Anonymous Dingo',
  'Anonymous Elephant',
  'Anonymous Ferret',
  'Anonymous Giraffe',
  'Anonymous Hedgehog',
  'Anonymous Iguana',
  'Anonymous Koala',
  'Anonymous Lemur',
  'Anonymous Meerkat',
  'Anonymous Narwhal',
  'Anonymous Otter',
  'Anonymous Penguin',
  'Anonymous Quokka',
];

export function getRandomCollaborator() {
  const colorObj = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
  const name = GOOGLE_DOCS_NAMES[Math.floor(Math.random() * GOOGLE_DOCS_NAMES.length)];
  const id = 'user_' + Math.random().toString(36).substring(2, 9);
  return {
    id,
    name,
    color: colorObj.hex,
    avatar: name.split(' ')[1]?.substring(0, 1) || 'A',
  };
}
