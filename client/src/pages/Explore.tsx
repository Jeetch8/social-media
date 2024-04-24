import React, { useState } from 'react';
import { IFeedPost } from '@/utils/interfaces';
import { base_url } from '@/utils/base_url';
import { useFetch } from '@/hooks/useFetch';
import PostsTab from '@/Components/Explore/PostsTab';
import UsersTab from '@/Components/Explore/UsersTab';
import { IoSearch } from 'react-icons/io5';
import { twMerge } from 'tailwind-merge';

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { doFetch: fetchPosts } = useFetch<{
    posts: IFeedPost[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/post/search?page=${currentPostPage}&query=${searchQuery}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setPosts((prevPosts) =>
        currentPostPage === 1 ? data.posts : [...prevPosts, ...data.posts]
      );
      setHasMorePosts(data.hasMore);
      setCurrentPostPage(data.nextPage);
    },
  });

  const { doFetch: fetchUsers } = useFetch<{
    users: any[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/user?page=${currentUserPage}&query=${searchQuery}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setUsers((prevUsers) =>
        currentUserPage === 1 ? data.users : [...prevUsers, ...data.users]
      );
      setHasMoreUsers(data.hasMore);
      setCurrentUserPage(data.nextPage);
    },
  });

  const clearSearchStates = () => {
    setPosts([]);
    setUsers([]);
    setHasMorePosts(true);
    setHasMoreUsers(true);
    setCurrentPostPage(1);
    setCurrentUserPage(1);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      clearSearchStates();
      setHasSearched(true);
      if (activeTab === 'posts') {
        fetchPosts();
      } else {
        fetchUsers();
      }
    }
  };

  const handleTabChange = (tab: 'posts' | 'users') => {
    setActiveTab(tab);
    if (hasSearched) {
      if (tab === 'posts' && posts.length === 0) {
        fetchPosts();
      } else if (tab === 'users' && users.length === 0) {
        fetchUsers();
      }
    }
  };

  const renderTabContent = () => {
    if (!hasSearched) {
      return (
        <div className="flex justify-center items-center h-[50vh] text-gray-500">
          <p>Enter a search query and press Enter to see results</p>
        </div>
      );
    }

    if (activeTab === 'posts') {
      return (
        <PostsTab
          posts={posts}
          hasMore={hasMorePosts}
          fetchMorePosts={fetchPosts}
        />
      );
    } else {
      return (
        <UsersTab
          users={users}
          hasMore={hasMoreUsers}
          fetchMoreUsers={fetchUsers}
        />
      );
    }
  };

  return (
    <div className="w-[620px] text-white border-r-[1px] border-neutral-800">
      <div className="bg-[rgba(0,0,0,0.9)] backdrop-blur-xl sticky top-0 z-50">
        <div className="border-b border-neutral-800 p-4">
          <div className="flex items-center gap-2 w-full bg-transparent text-white border-[2px] border-zinc-900 rounded-full focus:border-blue-500 outline-none overflow-hidden px-4">
            <IoSearch className="w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
              }}
              className="bg-transparent w-full outline-none focus:outline-none"
            />
          </div>
        </div>
        <div className="flex border-b border-neutral-800">
          <div
            className={
              'pt-[15px] cursor-pointer text-gray-500 hover:bg-neutral-900 group duration-300 w-full transition-all'
            }
            onClick={() => handleTabChange('posts')}
          >
            <p
              className={twMerge(
                'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-300 transition-all',
                activeTab === 'posts' && 'border-blue-500 text-white'
              )}
            >
              Posts
            </p>
          </div>
          <div
            className={
              'pt-[15px] cursor-pointer text-gray-500 hover:bg-neutral-900 transition-all group duration-300 w-full'
            }
            onClick={() => handleTabChange('users')}
          >
            <p
              className={twMerge(
                'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-300 transition-all',
                activeTab === 'users' && 'border-blue-500 text-white'
              )}
            >
              Likes
            </p>
          </div>
        </div>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default Explore;
