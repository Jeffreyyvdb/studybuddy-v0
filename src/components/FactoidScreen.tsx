import React from 'react';
import { QuestionMarks } from './QuestionMarks';

interface FactoidScreenProps {
  factoid: string;
  lastQuestion: string;
  onContinue: () => void;
}

export const FactoidScreen = ({ 
  factoid, 
  lastQuestion, 
  onContinue
}: FactoidScreenProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl text-center relative z-10">
        <h2 className="text-xl font-bold mb-4">Previous Question:</h2>
        <p className="mb-6 text-gray-700">{lastQuestion}</p>
        <h3 className="text-lg font-bold mb-4">Fun Fact:</h3>
        <p className="mb-8 text-gray-700">{factoid}</p>
        <button
          onClick={onContinue}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};