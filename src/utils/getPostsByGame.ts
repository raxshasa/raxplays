import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";

// We changed '_tag' to 'game' so it matches the usage inside .includes()
const getPostsByGame = (posts: CollectionEntry<"blog">[], game: string) =>
  getSortedPosts(
    posts.filter(
      post =>
        // Ensure post.data.games exists before trying to slugify it
        post.data.games && slugifyAll(post.data.games).includes(game)
    )
  );

export default getPostsByGame;
