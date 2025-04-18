'use client';

import { useState } from 'react';
import Memory from '@/components/games/memory';
import SortGame from '@/components/games/sort/sort';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GamePage = () => {
  const [activeGame, setActiveGame] = useState<'memory' | 'sort'>('memory');

  return (
    <div className="flex flex-col mx-auto pt-8 max-w-md">
      <div className="mb-6">
        <Tabs 
          defaultValue="memory" 
          value={activeGame}
          onValueChange={(value) => setActiveGame(value as 'memory' | 'sort')} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="memory">Memory Game</TabsTrigger>
            <TabsTrigger value="sort">Sorting Game</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {activeGame === 'memory' ? <Memory /> : <SortGame />}
    </div>
  );
};

export default GamePage;