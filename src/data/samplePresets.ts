export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageName: string;
  videoUrl: string;
  videoName: string;
  prompt: string;
  mockOutputUrl: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'preset-1',
    name: 'Modern Dance Motion',
    description: 'Dynamic fluid modern dance choreography with Wan 2.2 motion transfer',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    imageName: 'cyberpunk_dancer.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoName: 'dance_ref_01.mp4',
    prompt: 'Wan 2.2 motion control, fluid dance movement, neon cyberpunk aesthetic, cinematic lighting, 8k hyperdetailed',
    mockOutputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'preset-2',
    name: 'Martial Arts Kick & Spin',
    description: 'High-energy martial arts spin kick motion guidance',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    imageName: 'samurai_character.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoName: 'martial_arts_ref.mp4',
    prompt: 'Wan 2.2 motion control, martial arts action, dynamic camera movement, cinematic motion blur, realistic cloth simulation',
    mockOutputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  },
  {
    id: 'preset-3',
    name: 'Fashion Catwalk Walk',
    description: 'Elegant runway catwalk walking gait with precise motion timing',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    imageName: 'haute_couture_model.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    videoName: 'catwalk_walk.mp4',
    prompt: 'Wan 2.2 motion control, fashion runway walk, flowing golden silk dress, high fashion magazine shoot, smooth motion',
    mockOutputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  },
  {
    id: 'preset-4',
    name: 'Urban Street Style Shuffle',
    description: 'Fast footwork shuffle dance reference with Wan 2.2 pose guidance',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    imageName: 'streetwear_youth.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoName: 'shuffle_steps.mp4',
    prompt: 'Wan 2.2 motion control, urban street dance, Tokyo night lighting, realistic sneaker physics, fluid limbs',
    mockOutputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
];
