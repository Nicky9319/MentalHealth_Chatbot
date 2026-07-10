import React from 'react';

const LeftPanel = ({ sessions, onAddSession, onSelectSession, activeSession, isLoading }) => {
    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-3">
                <h2 className="font-semibold text-lg">Sessions</h2>
                <p className="text-xs text-indigo-200">Your conversation history</p>
            </div>
            
            {/* Sessions list */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p>Loading sessions...</p>
                    </div>
                ) : sessions.length > 0 ? (
                    <ul className="space-y-2">
                        {sessions.map((session) => (
                            <li 
                                key={session.id} 
                                onClick={() => onSelectSession(session.id)}
                                className={`px-4 py-3 rounded-lg shadow-sm border cursor-pointer transition-colors
                                    ${activeSession === session.id 
                                        ? 'bg-indigo-100 border-indigo-300' 
                                        : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                            >
                                <div className="flex items-center">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3
                                        ${activeSession === session.id ? 'bg-indigo-200' : 'bg-indigo-100'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                            className={`w-4 h-4 ${activeSession === session.id ? 'text-indigo-700' : 'text-indigo-600'}`}>
                                            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className={`font-medium ${activeSession === session.id ? 'text-indigo-800' : 'text-gray-800'}`}>
                                        {session.name}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-center">No sessions yet</p>
                        <p className="text-center text-sm">Create a new session to start chatting</p>
                    </div>
                )}
            </div>
            
            {/* Add button */}
            <div className="border-t border-gray-300 p-4 bg-white">
                <button 
                    onClick={onAddSession}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                    Add Session
                </button>
            </div>
        </div>
    );
};

export default LeftPanel;