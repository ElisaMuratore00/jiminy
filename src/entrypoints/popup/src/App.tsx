import { useCallback, useEffect, useState } from 'preact/hooks';
import { description, title, version } from '../../../../package.json';
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
  const handleDeleteAllTriggerWord = useCallback(() => sendMessage('DELETE_TRIGGERWORD'), []);

  // Invia solo il messaggio CHANGE_TRIGGERWORD con la nuova parola
  const handleSetTriggerWordAndReset = useCallback(() => {
    if (!newTriggerWord.trim()) return;
    sendMessage('CHANGE_TRIGGERWORD', { newTriggerWord: newTriggerWord.trim() });
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
        <div className='mb-4 flex items-center space-x-3'>
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
          <h1 className='text-2xl font-bold text-indigo-700'>{version}</h1>
        </div>
        <h1 className='text-xs font-medium text-indigo-700'>{description}</h1>
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
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Infodemic risk index</h2>
              <p className='mb-4 text-sm text-gray-500'>Exposure to unreliable domains</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats && stats.totalViews === 0 ? 'N.A.' : stats?.totalInfodemicRiskIndex.toFixed(2)}
            </span>
          </div>
        </Card>
        <Card>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='mb-2 text-lg font-semibold text-gray-700'>Musk's posts</h2>
              <p className='mb-4 text-sm text-gray-500'>Total number of Musk's posts</p>
            </div>
            <span className='flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800'>
              {stats?.totalMuskPosts}
            </span>
          </div>
        </Card>
        <Card>
          <div>
            <h2 className='mb-2 text-center text-lg font-semibold text-gray-700'>
              Trigger words' counters
            </h2>
          </div>
          <div className='my-2' />
          <p className='mb-6 text-center text-sm text-gray-500'>
            Track posts containing your trigger words{' '}
          </p>
          {stats &&
            Object.entries(stats.triggerWordCounters).map(([word, count]) => (
              <div key={word} className='flex items-start justify-between'>
                <div>
                  <h2 className='mb-4 text-lg font-medium text-gray-700'>
                    {' '}
                    <span className='font-medium text-gray-700'>"{word.toUpperCase()}"</span>
                  </h2>
                </div>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-800 font-bold text-white'>
                  {count}
                </span>
              </div>
            ))}
          <div className='my-4' />
          <Input
            variant='secondary'
            className='w-full'
            type='text'
            placeholder='Insert a new trigger word'
            value={newTriggerWord}
            onInput={e => setNewTriggerWord((e.target as HTMLInputElement).value)}
          />
          <div className='my-2' />
          <Button
            variant='primary'
            className='w-full'
            onClick={handleSetTriggerWordAndReset}
            disabled={!newTriggerWord.trim()}>
            Add the inserted trigger word
          </Button>
          <div className='my-2' />
          <Button variant='danger' className='w-full' onClick={handleDeleteAllTriggerWord}>
            Delete all trigger words
          </Button>
        </Card>
        <Button variant='secondary' className='w-full' onClick={handleDataDownload}>
          Download my data
        </Button>
        <Button variant='danger' className='w-full' onClick={handleReset}>
          Reset
        </Button>
        <div>
          <h6 className='text-2xs font-bold text-gray-500'>Credits</h6>
          <p className='text-xs text-gray-500'>
            Developed by Davide Pizzoli, Elisa Muratore, Veronica Orsanigo, Matteo Scianna, Anna
            Bertani and Riccardo Gallotti.
          </p>
          <img
            src='https://img.shields.io/badge/License-MIT-blue.svg'
            alt='License: MIT'
            className='mt-2'
            style={{ height: 'auto', width: '60px' }}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
