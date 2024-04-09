import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";
import { commentPost, getUserById } from "@/lib/appwrite/api";
import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const [userNamesMap, setUserNamesMap] = useState({});
  const [comment, setComment] = useState("");

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (comment) {
      await commentPost(id, user.id, comment);
      setComment("");
    }
  };

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  useEffect(() => {
    const fetchUserNames = async () => {
      if (post?.comments) {
        // Extract unique userIds from the serialized comments
        const uniqueUserIds = [...new Set(post.comments.map(commentStr => {
          try {
            const [userId] = JSON.parse(commentStr);
            return userId;
          } catch {
            return null;
          }
        }).filter(Boolean))]; // Filter out any parsing failures or duplicates

        // Fetch user details for each userId
        const userPromises = uniqueUserIds.map(userId => getUserById(userId));
        const users = await Promise.all(userPromises);

        // Map userId to user names
        const namesMap = users.reduce((acc, user) => {
          if (user && user.$id && user.name) {
            acc[user.$id] = user.name;
          }
          return acc;
        }, {});

        setUserNamesMap(namesMap);
      }
    };

    fetchUserNames();
  }, [post?.comments]);

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${user.id !== post?.creator.$id && "hidden"
                    }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm sm:leading-6">
              <PostStats post={post} userId={user.id} />
              <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mt-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-white transition duration-200 bg-black text-white"
                />
                <Button
                  type="submit"
                  variant="default"
                // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Submit
                </Button>
              </form>
              {/* Display the comments */}
              <div className="comments-section mt-6">
                {post?.comments?.map((commentStr, index) => {
                  try {
                    // Parse the serialized comment string
                    const [userId, commentText] = JSON.parse(commentStr);
                    // Look up the user name using the userId
                    const userName = userNamesMap[userId] || "Unknown User";

                    return (
                      <div key={index} className="my-2 p-2 bg-slate-950 rounded-md">
                        <strong className="font-semibold text-white">{userName}</strong><span className="text-white">: {commentText}</span>
                      </div>
                    );
                  } catch (error) {
                    console.error("Error parsing comment:", error);
                    return <div key={index} className="text-red-500">Invalid comment format</div>;
                  }
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
