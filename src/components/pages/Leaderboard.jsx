import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Crown, Trophy, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useApp } from "../../context/AppContext";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, getDocs, getCountFromServer, where, doc, getDoc } from "firebase/firestore";

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-400" />;
    case 2:
      return <Trophy className="h-5 w-5 text-slate-300" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return null;
  }
};

const getRankGlow = (rank) => {
  switch (rank) {
    case 1:
      return "shadow-[0_0_20px_rgba(250,204,21,0.15)] border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent";
    case 2:
      return "shadow-[0_0_15px_rgba(203,213,225,0.15)] border-slate-400/50 bg-gradient-to-r from-slate-400/10 to-transparent";
    case 3:
      return "shadow-[0_0_15px_rgba(217,119,6,0.15)] border-amber-600/50 bg-gradient-to-r from-amber-600/10 to-transparent";
    default:
      return "border-zinc-800 bg-zinc-900/50";
  }
};

const LeaderboardRow = ({ user, index, isCurrentUser }) => {
  const isTopThree = user.rank <= 3;
  const icon = getRankIcon(user.rank);
  const glowClass = getRankGlow(user.rank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`relative flex items-center gap-3 rounded-xl border p-3 backdrop-blur-sm transition-all ${glowClass} ${isCurrentUser ? "ring-1 ring-cyan-500/50" : ""}`}
    >
      <div className="flex items-center justify-center w-8 md:w-10 text-center">
        {icon ? (
          <div className="flex items-center justify-center">{icon}</div>
        ) : (
          <span className="text-sm font-bold text-zinc-500">#{user.rank}</span>
        )}
      </div>

      <Avatar className={`h-10 w-10 ${isTopThree ? "ring-1 ring-offset-1 ring-offset-black" : ""} ${
        user.rank === 1 ? "ring-yellow-400" : user.rank === 2 ? "ring-slate-300" : user.rank === 3 ? "ring-amber-600" : ""
      }`}>
        <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
          {user.name?.charAt(0)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold truncate text-sm md:text-base ${isTopThree ? "text-white" : "text-zinc-200"}`}>
          {user.name} {isCurrentUser && <span className="text-[10px] ml-1 text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded-full">SEN</span>}
        </h3>
        <p className={`text-[11px] md:text-xs ${user.leagueColor || 'text-zinc-500'}`}>{user.leagueName}</p>
      </div>

      <div className="text-right">
        <div className={`text-base font-bold ${isTopThree ? "text-white" : "text-zinc-300"}`}>
          {user.xp?.toLocaleString() || 0}
        </div>
        <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-wider">XP</div>
      </div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { uid, totalXP, getXpLevel, setActiveTab } = useApp();
  
  const [users, setUsers] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. İlk 10'u çek
        const qTop = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
        const snap = await getDocs(qTop);
        
        const topList = [];
        let r = 1;
        snap.forEach(d => {
          const data = d.data();
          const p = getXpLevel(data.xp || 0);
          topList.push({
            id: d.id,
            rank: r++,
            name: data.username || 'Gizemli Sporcu',
            avatar: data.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.username||d.id}&backgroundColor=18181b`,
            xp: data.xp || 0,
            leagueName: p.league?.name,
            leagueColor: p.league?.color,
          });
        });
        setUsers(topList);

        // 2. Kendi sıramı hesapla (getCountFromServer)
        if (uid) {
          const myProfile = getXpLevel(totalXP);
          const rankQuery = query(collection(db, 'users'), where('xp', '>', totalXP));
          const countSnap = await getCountFromServer(rankQuery);
          const myExactRank = countSnap.data().count + 1;
          
          // Kendi ismimi ve avatarımı da çek
          const myDoc = await getDoc(doc(db, 'users', uid));
          const myData = myDoc.exists() ? myDoc.data() : {};
          
          setMyRankInfo({
            id: uid,
            rank: myExactRank,
            name: myData.username || 'Ben',
            avatar: myData.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${myData.username||uid}&backgroundColor=18181b`,
            xp: totalXP,
            leagueName: myProfile.league?.name,
            leagueColor: myProfile.league?.color,
          });

          // n8n Webhook Ping'i at (Sadece ilk yüklemede ve arka planda)
          const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
          if (webhookUrl) {
            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                action: 'leaderboard_view', 
                uid, 
                username: myData.username, 
                xp: totalXP, 
                rank: myExactRank 
              })
            }).catch(() => {}); // Arka planda başaramadıysa sessizce geç
          }
        }
      } catch (err) {
        console.error("Leaderboard yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [uid, totalXP, getXpLevel]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 p-5 pt-8 flex-1 sm:max-w-md w-full mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveTab('home')} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              LEADERBOARD
            </h1>
            <p className="text-xs text-zinc-500 font-medium">Bölgendeki En İyiler</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 pb-32 overflow-y-auto custom-scrollbar pr-1 flex-1">
            {users.map((u, i) => (
              <LeaderboardRow key={u.id} user={u} index={i} isCurrentUser={u.id === uid} />
            ))}
            {users.length === 0 && (
              <div className="text-center text-zinc-500 py-10">Henüz kimse yok. İlk olan sen ol!</div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Current User */}
      {myRankInfo && !loading && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
        >
          <div className="max-w-md mx-auto p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-900/10 to-transparent p-3 shadow-[0_-10px_40px_rgba(34,211,238,0.05)]">
              <div className="flex items-center justify-center w-8 text-center">
                <span className="text-lg font-bold text-cyan-400">#{myRankInfo.rank}</span>
              </div>

              <Avatar className="h-11 w-11 ring-2 ring-cyan-500 ring-offset-2 ring-offset-zinc-950">
                <AvatarImage src={myRankInfo.avatar} alt="Me" className="object-cover" />
                <AvatarFallback className="bg-zinc-800 text-zinc-300">
                  {myRankInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm md:text-base">{myRankInfo.name}</h3>
                <p className={`text-xs ${myRankInfo.leagueColor}`}>{myRankInfo.leagueName}</p>
              </div>

              <div className="text-right">
                <div className="text-base font-bold text-white">
                  {myRankInfo.xp.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-400">XP</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
