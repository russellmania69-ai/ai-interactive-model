export interface AIModel {
  id: string;
  name: string;
  image: string;
  videoUrl?: string;
  age: number;
  ethnicity: string;
  bio: string;
  interests: string[];
  subscriptionPrice: number;
  subscribers: number;
  rating: number;
  isOnline: boolean;
  height?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  languages?: string[];
  responseTime?: string;
  contentCount?: {
    photos: number;
    videos: number;
    posts: number;
  };
  lastActive?: string;
  joinedDate?: string;
  specialties?: string[];
}

