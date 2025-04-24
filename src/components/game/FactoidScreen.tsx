import React from "react";

interface FactoidScreenProps {
    lastQuestion: string;
    factoid: string;
    onContinue: () => void;
}

const FactoidScreen: React.FC<FactoidScreenProps> = ({ lastQuestion, factoid, onContinue }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-between bg-transparent text-gray-800 p-6">
            {/* Last Question */}
            <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-600">Last Question:</h3>
                <p className="text-xl font-bold text-gray-800">{lastQuestion}</p>
            </div>

            {/* Factoid Box */}
            <div className="w-full max-w-3xl bg-blue-50/90 backdrop-blur-sm shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">Did You Know?</h2>
                <p className="text-lg text-gray-700">{factoid}</p>
            </div>

            {/* Okay Button */}
            <button
                onClick={onContinue}
                className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md"
            >
                Okay
            </button>
        </div>
    );
};

export default FactoidScreen;