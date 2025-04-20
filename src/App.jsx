import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';

import './App.css';

const bingoItems = [
  "Attend a keynote",
  "Share your best proposal tip with the PIE community",
  "Join the PIE community",
  "Register for RFWin",
  "Set up your conference schedule on RingCentral",
  "Nominate someone for an AsPIEre award",
  "Get certified: take a PIE mini course",
  "Attend Session: Ingredients Track",
  "Attend Session: Bakers Track",
  "Attend Session: Recipes Track",
  "Attend Session: Kitchen Sink Track",
  "Connect with your RFWin buddy",
  "Free space: all PIE members",
  "Nominate someone for an InsPIEre award",
  "Share that you're attending RFWin on LinkedIn",
  "Attend a pre-conference event",
  "Introduce yourself in the PIE community",
  "Share your favorite kind of pie in the community",
  "Connect with an RFWin speaker on LinkedIn",
  "Join a networking session",
  "Post a question in the community",
  "Comment on a post in the community",
  "Free space: Bakers Corner members",
  "Tell a friend about PIE",
  "Share a takeaway"
];

function App() {
  const [marked, setMarked] = useState(Array(25).fill(false));
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState("");
const [tempName, setTempName] = useState("");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('👤 Firebase user state changed:', firebaseUser); // <--- ADD THIS
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
  
    return () => unsubscribe();
  }, []);  
  
  const saveNickname = async () => {
    if (!user || !tempName) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { nickname: tempName }, { merge: true });
    setNickname(tempName); // Hide the input after saving
  };
  
  // Load saved progress on start
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.marked) setMarked(data.marked);
          if (data.nickname) setNickname(data.nickname);          
        }
      }
    };
    fetchData();
  }, [user]);
  const [leaderboard, setLeaderboard] = useState([]);

useEffect(() => {
  const loadLeaderboard = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const scores = snapshot.docs.map((doc) => {
      const data = doc.data();
      const markedCount = data.marked?.filter(Boolean).length || 0;
      return {
        id: doc.id,
        count: markedCount,
      };
    });

    scores.sort((a, b) => b.count - a.count);
    setLeaderboard(scores);
  };

  loadLeaderboard();
}, []);


  // Save progress when updated
  const toggleSquare = async (index) => {
    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);

    if (user) {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, {
        marked: newMarked,
        count: newMarked.filter((m) => m).length, // ✅ Add this!
      }, { merge: true });      
    }
  };

  const isBingo = checkBingo(marked);
  const isBlackout = marked.every(Boolean);
  useEffect(() => {
    if (isBingo) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  
    if (isBlackout) {
      confetti({
        particleCount: 200,
        spread: 120,
        startVelocity: 45,
        gravity: 0.6,
        origin: { y: 0.5 }
      });
    }
  }, [isBingo, isBlackout]);

  return (
<div className="container">
  <h1>🎉 RFWin 2025 Conference Bingo 🎉</h1>

  {user && !nickname && (
  <div className="nickname-form">
    <p>Pick a nickname for the leaderboard:</p>
    <input
      type="text"
      value={tempName}
      onChange={(e) => setTempName(e.target.value)}
      placeholder="e.g. PieLover42"
    />
    <button onClick={saveNickname}>Save</button>
  </div>
)}

  <div className="layout">
    <div className="bingo-grid">
      {bingoItems.map((item, index) => (
        <div
          key={index}
          className={`square ${marked[index] ? 'marked' : ''}`}
          onClick={() => toggleSquare(index)}
        >
          {item}
        </div>
      ))}
    </div>

    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      <ol>
        {leaderboard.map((user, index) => (
  <li key={user.id}>
  {user.nickname || `User ${index + 1}`}: {user.count} squares
</li>
        ))}
      </ol>
    </div>
  </div>

  {isBingo && <p className="bingo">BINGO! 🎊</p>}
  {isBlackout && <p className="blackout">BLACKOUT! 🌟✨</p>}
</div>

  );  
}

// Simple check for rows/cols/diags
function checkBingo(marked) {
  const lines = [
    // Rows
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
    // Columns
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
    // Diagonals
    [0,6,12,18,24], [4,8,12,16,20]
  ];
  return lines.some(line => line.every(index => marked[index]));
}

export default App;
