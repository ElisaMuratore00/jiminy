import { useCallback, useEffect, useState } from 'preact/hooks';
import { title } from '../../../../package.json';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import type { Stats } from '../../../types/entities';
import logger from '../../../utils/logger';
import { sendMessage } from '../../../utils/messaging';
import { statsPostsStorage } from '../../../utils/storage';

function App() {
  // States
  const [stats, setStats] = useState<Stats>();
  const [newTriggerWord, setNewTriggerWord] = useState('');

  // Callbacks
  const handleReset = useCallback(() => sendMessage('RESET'), []);
  const handleDataDownload = useCallback(() => sendMessage('DOWNLOAD_DATA'), []);

  // Invia solo il messaggio CHANGE_TRIGGERWORD con la nuova parola
  const handleSetTriggerWordAndReset = useCallback(() => {
    if (!newTriggerWord.trim()) return;
    sendMessage('CHANGE_TRIGGERWORD', { triggerWord: newTriggerWord.trim() });
    setNewTriggerWord('');
  }, [newTriggerWord]);

  // Effects
  useEffect(() => {
    logger.info('App mounted');

    statsPostsStorage.getValue().then(_stats => {
      logger.debug('Stats loaded', _stats);
      setStats(_stats);
    });

    const unwatchStats = statsPostsStorage.watch(stats => {
      logger.debug('Stats updated', stats);
      setStats(stats);
    });

    return () => {
      unwatchStats();
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
      <main className='flex flex-col gap-4'>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Viewed posts</h2>
              <p className='mb-4 text-sm text-gray-500'>Total number of viewed posts</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats?.totalPosts}
            </span>
          </div>
        </Card>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Verified posts</h2>
              <p className='mb-4 text-sm text-gray-500'>Total number of verified posts</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats?.totalVerifiedPosts}
            </span>
          </div>
        </Card>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Musk posts</h2>
              <p className='mb-4 text-sm text-gray-500'>Total number of Musk posts</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats?.totalMuskPosts}
            </span>
          </div>
        </Card>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>
                Posts with{' '}
                <span className='font-bold text-gray-700 italic'>"{stats?.triggerWord}"</span>
              </h2>
              <p className='mb-4 text-sm text-gray-500'>Posts containing the trigger word</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats?.totalTriggeredWordPosts}
            </span>
          </div>
        </Card>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Infodemic risk index</h2>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats && stats.totalViews === 0 ? 'N.A.' : stats?.totalInfodemicRiskIndex.toFixed(2)}
            </span>
          </div>
        </Card>
        <Button variant='secondary' className='w-full' onClick={handleDataDownload}>
          Download my data in JSON
        </Button>
        <Button variant='secondary' className='w-full' onClick={handleReset}>
          Reset
        </Button>
        {}
        <div className='mt-2 flex flex-col gap-2'>
          <Input
            variant='primary'
            className='w-full'
            type='text'
            placeholder='Insert new trigger word'
            value={newTriggerWord}
            onInput={e => setNewTriggerWord((e.target as HTMLInputElement).value)}
          />
          <Button
            variant='primary'
            className='w-full'
            onClick={handleSetTriggerWordAndReset}
            disabled={!newTriggerWord.trim()}>
            Set a new trigger word and reset data
          </Button>
        </div>
      </main>
    </div>
  );
}

export default App;
