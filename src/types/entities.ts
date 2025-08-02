export type Post = {
  id: string;
  username: string;
  text: string;
  verified: boolean;
  likes: number | undefined;
  comments: number | undefined;
  reposts: number | undefined;
  views: number | undefined;
  media: Media[];
  urls: string[];
  mentions: string[];
  hashtags: string[];
  createdAt: number;
  viewedAt: number;
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
  totalVerifiedPosts: number;
  totalMuskPosts: number;
  totalInfodemicRiskIndex: number;
  totalViews: number;
};
