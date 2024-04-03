import Feed from '@/Components/Home/Feed';
import { base_url } from '@/utils/base_url';
import CreateNewPostBox from '@/Components/Home/CreateNewPost/CreateNewPost';
import { IFeedPost } from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { getTokenFromLocalStorage } from '@/utils/localstorage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const navigate = useNavigate();

  const fetchMoreData = () => {
    const token = getTokenFromLocalStorage();
    if (!token) {
      toast.error('Please login');
      navigate('/login');
      return;
    }

    fetch(base_url + `/post/feed?page=${currentPage}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Please login');
            navigate('/login');
            throw new Error('Unauthorized');
          }
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPosts((prevPosts) => [...prevPosts, ...data.feed]);
        setHasMore(data.hasMore);
        setCurrentPage(data.nextPage);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchMoreData();
  }, []);

  console.log(hasMore, currentPage, posts.length);

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black w-[620px] inline">
      <CreateNewPostBox fetchHomeFeed={fetchMoreData} />
      <Feed items={posts} hasMore={hasMore} fetchMoreData={fetchMoreData} />
      {posts.length === 0 && <div className="h-[110vh]"></div>}
    </div>
  );
};

export default Home;
