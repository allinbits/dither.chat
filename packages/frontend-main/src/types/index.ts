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
};

export interface DisplayableAuthor {
  author: string;
  author_handle?: string;
  author_display?: string;
}

export interface DisplayableUser {
  address: string;
  handle?: string;
  display?: string;
}
