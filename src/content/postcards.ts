import type { PostcardSource } from '@/types/content';
import type { AssetCreditId } from './assets';

const postcards = [
  {
    id: 'moon-disc',
    placement: {
      after: 'ch1',
    },
    image: {
      src: '/postcards/apollo-17-moon-disc.jpg',
      creditId: 'apollo-17-moon-disc',
    },
    caption: '',
    title: 'The Moon from Apollo 17',
  },
  {
    id: 'eclipse',
    placement: {
      after: 'ch2',
    },
    image: {
      src: '/postcards/eclipse.jpg',
      creditId: 'eclipse-photo',
    },
    caption: '',
    title: 'Solar eclipse',
  },
  {
    id: 'bootprint',
    placement: {
      after: 'ch3',
    },
    image: {
      src: '/postcards/bootprint.jpg',
      creditId: 'apollo-11-bootprint',
    },
    caption: '',
    title: 'Apollo 11 bootprint',
  },
] as const satisfies readonly PostcardSource<AssetCreditId>[];

export default postcards;
