import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { use, useEffect } from "react";

const Posts = ({ feedType }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      default:
        return "/api/posts/all";
    }
  };
  const POST_ENDPOINT = getPostEndpoint();
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"], // include feedType for cache separation
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch posts");
        }

        return data; // must return the parsed array of posts
      } catch (err) {
        throw new Error(err.message || "Unexpected error occurred");
      }
    },
  });
  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {isError && (
        <p className="text-center text-red-500 my-4">{error.message}</p>
      )}

      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}

      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
