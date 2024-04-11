import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Input } from "@/components/ui";
import { Loader, GridPostList, UserInfoDisplay } from "@/components/shared";
import useDebounce from "@/hooks/useDebounce";
import { useGetPosts, useSearchPostsByUsername, useSearchPosts } from "@/lib/react-query/queries";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
  isUserSearch: boolean;
};

const SearchResults = ({ isSearchFetching, searchedPosts, isUserSearch }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return isUserSearch ? (
      <UserInfoDisplay users={searchedPosts.documents} />
    ) : (
      <GridPostList posts={searchedPosts.documents} />
    );
  } else {
    return <p className="text-light-4 mt-10 text-center w-full">No results found</p>;
  }
};

const User = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  // Determine if search is for users based on "@" prefix
  const isUserSearch = debouncedSearch.startsWith("@");
  const searchQuery = isUserSearch ? debouncedSearch.substring(1) : debouncedSearch;

  const { data: searchedPosts, isFetching: isSearchFetching } = isUserSearch
    ? useSearchPostsByUsername(searchQuery)
    : useSearchPosts(searchQuery);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults && posts.pages.every((item) => item.documents.length === 0);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl pt-5">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
            isUserSearch={isUserSearch}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={item.documents} />
          ))
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default User;
