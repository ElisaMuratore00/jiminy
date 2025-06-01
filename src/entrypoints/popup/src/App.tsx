import { useEffect, useState } from 'preact/hooks';
import { title } from '../../../../package.json';
import { Card } from '../../../components/card';
import logger from '../../../utils/logger';
import { viewedPostsStorage } from '../../../utils/storage';

function App() {
  // States
  const [count, setCount] = useState(0);

  // Effects
  useEffect(() => {
    logger.info('App mounted');

    viewedPostsStorage.getValue().then(posts => {
      logger.info('Posts loaded', { count: posts.length });
      setCount(posts.length);
    });

    const unwatch = viewedPostsStorage.watch(posts => {
      logger.info('Posts updated', { count: posts.length });
      setCount(posts.length);
    });

    return () => {
      unwatch();
    };
  }, []);

  // Render
  return (
    <div className='min-h-[250px] w-[400px] bg-gradient-to-br from-indigo-50 to-blue-100 p-5'>
      <header className='mb-6 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm'>
        <div className='flex items-center space-x-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-indigo-700'>{title}</h1>
        </div>
      </header>
      <main>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Viewed posts</h2>
              <p className='mb-4 text-sm text-gray-500'>Total number of viewed posts</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {count}
            </span>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default App;
