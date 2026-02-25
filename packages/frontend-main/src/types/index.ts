export interface DitherTypes {
  // Message
  Post: [string];
  // PostHash, Message
  Reply: [string, string];
  // PostHash
  Remove: [string];
  // Address
  Follow: [string];
  // Address
  Unfollow: [string];
  // PostHash
  Like: [string];
  // PostHash
  Dislike: [string];
  // PostHash
  Flag: [string];
  // PostHash
  Repost: [string];
};
