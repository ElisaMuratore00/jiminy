export type Post = {
  id: string;
  username: string;
  text: string;
  verified: boolean;
  likes?: number;
  comments?: number;
  reposts?: number;
  views?: number;
  media?: Media[];
  urls?: string[];
  mentions?: string[];
  hashtags?: string[];
  createdAt: number;
};

export type Media =
  | {
      type: 'image';
      url?: string;
      description?: string;
    }
  | {
      type: 'video';
    };

export type Stats = {
  totalPosts: number;
  verifiedPosts: number;
  muskPosts: number;
  // IRI
  infodemicRiskIndex: number;
  totalViews: number;
};
