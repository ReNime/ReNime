'use client';

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { 

  FaUserPlus, FaUserFriends, FaSearch, FaCheck, FaTimes, 

  FaComments, FaSpinner, FaClock 

} from 'react-icons/fa';

import Image from 'next/image';

import Link from 'next/link';

export default function FriendsPageClient({ currentUser }) {

  const [activeTab, setActiveTab] = useState('friends');

  const [friends, setFriends] = useState([]);

  const [requests, setRequests] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (activeTab === 'friends') loadFriends();

    if (activeTab === 'requests') loadRequests();

  }, [activeTab]);

  async function loadFriends() {

    setLoading(true);

    try {

      const res = await fetch('/api/friends/list');

      const data = await res.json();

      setFriends(data.friends || []);

    } catch (error) {

      console.error('Error loading friends:', error);

    }

    setLoading(false);

  }

  async function loadRequests() {

    setLoading(true);

    try {

      const res = await fetch('/api/friends/requests');

      const data = await res.json();

      setRequests(data.requests || []);

    } catch (error) {

      console.error('Error loading requests:', error);

    }

    setLoading(false);

  }

  async function searchUsers() {

    if (!searchQuery.trim()) return;

    setLoading(true);

    try {

      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);

      const data = await res.json();

      setSearchResults(data.users || []);

    } catch (error) {

      console.error('Error searching users:', error);

    }

    setLoading(false);

  }

  async function sendFriendRequest(userId) {

    try {

      await fetch('/api/friends/request', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ receiverId: userId }),

      });

      searchUsers();

    } catch (error) {

      console.error('Error sending request:', error);

    }

  }

  async function acceptRequest(requestId) {

    try {

      await fetch('/api/friends/accept', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ requestId }),

      });

      loadRequests();

      loadFriends();

    } catch (error) {

      console.error('Error accepting request:', error);

    }

  }

  async function rejectRequest(requestId) {

    try {

      await fetch('/api/friends/reject', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ requestId }),

      });

      loadRequests();

    } catch (error) {

      console.error('Error rejecting request:', error);

    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-4 sm:p-6 lg:p-8">

      <div className="max-w-6xl mx-auto">

        <motion.div

          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}

          className="mb-8"

        >

          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">

            Friends & Social

          </h1>

          <p className="text-blue-300/70">Connect with anime fans worldwide</p>

        </motion.div>

        <div className="flex gap-2 mb-6 bg-slate-900/40 p-2 rounded-2xl backdrop-blur-xl border border-blue-500/20">

          {[

            { id: 'friends', label: 'Friends', icon: FaUserFriends },

            { id: 'requests', label: 'Requests', icon: FaClock },

            { id: 'search', label: 'Find Friends', icon: FaSearch },

          ].map((tab) => (

            <button

              key={tab.id}

              onClick={() => setActiveTab(tab.id)}

              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${

                activeTab === tab.id

                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'

                  : 'text-blue-300/70 hover:bg-blue-500/10'

              }`}

            >

              <tab.icon />

              <span className="hidden sm:inline">{tab.label}</span>

            </button>

          ))}

        </div>

        <AnimatePresence mode="wait">

          {activeTab === 'friends' && (

            <motion.div

              key="friends"

              initial={{ opacity: 0, x: -20 }}

              animate={{ opacity: 1, x: 0 }}

              exit={{ opacity: 0, x: 20 }}

            >

              {loading ? (

                <LoadingSpinner />

              ) : friends.length === 0 ? (

                <EmptyState message="No friends yet. Start searching!" />

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {friends.map((friend) => (

                    <FriendCard key={friend.id} friend={friend} />

                  ))}

                </div>

              )}

            </motion.div>

          )}

          {activeTab === 'requests' && (

            <motion.div

              key="requests"

              initial={{ opacity: 0, x: -20 }}

              animate={{ opacity: 1, x: 0 }}

              exit={{ opacity: 0, x: 20 }}

            >

              {loading ? (

                <LoadingSpinner />

              ) : requests.length === 0 ? (

                <EmptyState message="No pending requests" />

              ) : (

                <div className="space-y-4">

                  {requests.map((request) => (

                    <RequestCard

                      key={request.id}

                      request={request}

                      onAccept={() => acceptRequest(request.id)}

                      onReject={() => rejectRequest(request.id)}

                    />

                  ))}

                </div>

              )}

            </motion.div>

          )}

          {activeTab === 'search' && (

            <motion.div

              key="search"

              initial={{ opacity: 0, x: -20 }}

              animate={{ opacity: 1, x: 0 }}

              exit={{ opacity: 0, x: 20 }}

            >

              <div className="mb-6">

                <div className="flex gap-2">

                  <input

                    type="text"

                    placeholder="Search users by name or email..."

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}

                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"

                  />

                  <button

                    onClick={searchUsers}

                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"

                  >

                    <FaSearch />

                  </button>

                </div>

              </div>

              {loading ? (

                <LoadingSpinner />

              ) : searchResults.length === 0 ? (

                <EmptyState message="Search for users to add as friends" />

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {searchResults.map((user) => (

                    <SearchResultCard

                      key={user.id}

                      user={user}

                      onSendRequest={() => sendFriendRequest(user.id)}

                    />

                  ))}

                </div>

              )}

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>

  );

}

function FriendCard({ friend }) {

  return (

    <motion.div

      whileHover={{ scale: 1.02 }}

      className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4"

    >

      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/50">

        <Image src={friend.image || '/default-avatar.png'} alt={friend.name} fill className="object-cover" />

      </div>

      <div className="flex-1">

        <h3 className="font-bold text-white">{friend.name}</h3>

        <p className="text-sm text-blue-300/70">{friend.email}</p>

      </div>

      <Link href={`/chat/${friend.id}`}>

        <button className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all">

          <FaComments className="text-blue-400" />

        </button>

      </Link>

    </motion.div>

  );

}

function RequestCard({ request, onAccept, onReject }) {

  return (

    <motion.div

      initial={{ opacity: 0, x: -20 }}

      animate={{ opacity: 1, x: 0 }}

      className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4"

    >

      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/50">

        <Image src={request.sender.image || '/default-avatar.png'} alt={request.sender.name} fill className="object-cover" />

      </div>

      <div className="flex-1">

        <h3 className="font-bold text-white">{request.sender.name}</h3>

        <p className="text-sm text-blue-300/70">{request.sender.email}</p>

      </div>

      <div className="flex gap-2">

        <button

          onClick={onAccept}

          className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-all"

        >

          <FaCheck className="text-green-400" />

        </button>

        <button

          onClick={onReject}

          className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all"

        >

          <FaTimes className="text-red-400" />

        </button>

      </div>

    </motion.div>

  );

}

function SearchResultCard({ user, onSendRequest }) {

  return (

    <motion.div

      whileHover={{ scale: 1.02 }}

      className="bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4"

    >

      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/50">

        <Image src={user.image || '/default-avatar.png'} alt={user.name} fill className="object-cover" />

      </div>

      <div className="flex-1">

        <h3 className="font-bold text-white">{user.name}</h3>

        <p className="text-sm text-blue-300/70">{user.email}</p>

      </div>

      <button

        onClick={onSendRequest}

        disabled={user.requestSent}

        className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all disabled:opacity-50"

      >

        <FaUserPlus className="text-blue-400" />

      </button>

    </motion.div>

  );

}

function LoadingSpinner() {

  return (

    <div className="flex justify-center items-center py-12">

      <FaSpinner className="animate-spin text-4xl text-blue-400" />

    </div>

  );

}

function EmptyState({ message }) {

  return (

    <div className="text-center py-12 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/20">

      <p className="text-blue-300/70 text-lg">{message}</p>

    </div>

  );

}

