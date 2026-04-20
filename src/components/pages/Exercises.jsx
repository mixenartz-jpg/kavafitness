import { useState, useRef, useEffect } from 'react'
import Icon from '../Icons'


// ── CSS ──
const INLINE_STYLES = `
@keyframes floatUp {
  0% { opacity: 0; transform: translateY(12px) }
  100% { opacity: 1; transform: translateY(0) }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 15px rgba(255,255,255,0.1); }
  50% { box-shadow: 0 0 25px rgba(255,255,255,0.25); }
}
.magic-search-wrapper {
  position: relative; border-radius: 18px; padding: 2px;
  background: var(--surface2); overflow: hidden; transition: all .3s ease;
}
.magic-search-wrapper::before {
  content: ''; position: absolute; inset: -50%;
  background: conic-gradient(from 0deg, transparent 0%, transparent 60%, var(--accent) 100%);
  animation: spin 3s linear infinite; opacity: 0; transition: opacity .3s;
}
.magic-search-wrapper:focus-within::before { opacity: 1; }
.magic-search-inner {
  background: var(--surface); border-radius: 16px; position: relative; z-index: 1; display: flex; align-items: center; padding: 0 16px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Cards & Hover Effects */
.glass-card {
  position: relative; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
  overflow: hidden; cursor: pointer; backdrop-filter: blur(12px);
  transition: all .4s cubic-bezier(.16,1,.3,1); display: flex; align-items: center; gap: 14px; padding: 16px;
}
.glass-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255,255,255,0.08), transparent 40%);
  opacity: 0; transition: opacity .3s; pointer-events: none;
}
.glass-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 12px 30px rgba(0,0,0,0.3);
}
.glass-card:hover::before { opacity: 1; }
.glass-card:active { transform: scale(0.98); }

/* YouTube Cards */
.yt-card {
  border-radius: 16px; overflow: hidden; border: 1px solid var(--border);
  transition: all .3s; cursor: pointer; background: var(--surface2);
}
.yt-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); border-color: rgba(239, 68, 68, 0.4); }
.yt-card:hover .yt-play { transform: scale(1.15); box-shadow: 0 0 25px rgba(239, 68, 68, 0.8); }
.yt-play { transition: all .4s cubic-bezier(.16,1,.3,1); }

/* Tabs */
.magic-tabs {
  display: flex; gap: 0; background: var(--surface2); border-radius: 16px; padding: 4px; position: relative; border: 1px solid var(--border);
}
.magic-slider {
  position: absolute; height: calc(100% - 8px); top: 4px;
  background: var(--surface); border: 1px solid var(--border2); border-radius: 12px;
  transition: all .4s cubic-bezier(.16,1,.3,1); box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Modal Drawer */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  animation: fadeIn .3s ease forwards; display: flex; align-items: flex-end;
}
.modal-drawer {
  width: 100%; max-width: 640px; margin: 0 auto; background: var(--surface);
  border-radius: 32px 32px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none;
  max-height: 88vh; overflow-y: auto; overflow-x: hidden;
  padding-bottom: max(env(safe-area-inset-bottom), 32px);
  animation: slideUp .4s cubic-bezier(.16,1,.3,1) forwards;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  position: relative;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`

const EXERCISE_FORMS = {
  'Bench Press': { start: 'Sırt düz bankta yat. Küreği çek, göğüs hafifçe kabar. Barı gözlerin hizasından tut, kavrama omuz genişliğinden biraz daha geniş olsun.', move: '1) Barı kontrollü indirerek göğsünün ortasına doğur. 2) Dirseğin 45-75° açıyla vücuda yakın kalsın. 3) Ayaklarını yere bas, kalçanı banktan kaldırma. 4) Nefes vererek barı yukarı it.', breath: 'İnerken nefes al, iterken güçlü nefes ver.', mistakes: ['Sırtı banktan kaldırmak', 'Bileği bükmek (nötr tut)', 'Dirsekleri çok dışa açmak'], tip: 'Bar indikçe "göğsünü bara doğru itmek" hissini yaşat — bu, kürek kaslarını aktive eder ve yaralanmayı önler.' },
  'İncline Bench Press': { start: 'Bankı 30-45° eğime ayarla. Sırt bankta düz, kürekler çekilmiş. Barı üst göğüs/klavikula hizasına al.', move: '1) Barı üst göğse kontrollü indir. 2) Dirsekler 45-60° açıyla. 3) Ayakları yere bas. 4) Üst göğsü sıkıştırarak yukarı it.', breath: 'İnerken nefes al, iterken güçlü ver.', mistakes: ['Çok dik açı (60°+ omuz egzersizi olur)', 'Barı boyun hizasına indirmek', 'Sırtı banktan kaldırmak'], tip: 'Üst göğsü "sıkıştırarak" it — sadece itmek değil, sıkıştırmak üst göğsü tam aktive eder.' },
  'Decline Bench Press': { start: 'Bankı -15° ile -30° arasına ayarla. Ayaklarını ayak askısına kilitle. Bar alt göğüs hizasında.', move: '1) Barı alt göğse/üst karına indir. 2) Dirsekler geniş açıyla (60-70°). 3) Alt göğsü sıkıştırarak it.', breath: 'İnerken nefes al, iterken ver.', mistakes: ['Çok aşağı açı (baş kan basıncı artar)', 'Barı boyuna yakın indirmek', 'Dirsekleri tam içe almak'], tip: 'Alt göğüs kasını hissetmek için hareketi yavaşlat — kas-beyin bağlantısı burada kritik.' },
  'Dumbbell Fly': { start: 'Düz bankta yat. Dumbbellları göğüs hizasında tut, kollar hafif bükük (dirsek "yumuşak"). Avuçlar birbirine bakıyor.', move: '1) Kolları yanlara geniş kavis çizerek indir (göğüs açılır). 2) Dirsek açısını koru — büküp düzeltme. 3) Göğüs kasını sıkıştırarak yukarı kapan.', breath: 'Açarken nefes al, kaparken ver.', mistakes: ['Dirsekleri bükmek (row hareketi olur)', 'Çok ağır ağırlık (yırtılma riski)', 'Dumbbellları tepede çarptırmak'], tip: 'Hareket boyunca "büyük bir ağacı sarıyorum" hissini koru — bu kasın tam stretch ve kontraksiyon almasını sağlar.' },
  'Cable Crossover': { start: 'İki kablo makinesi arasında dur. Tutucular üstte, kollar açık. Hafif öne eğil.', move: '1) Kolları aşağı ve önde buluştur. 2) Göğsü sıkıştır. 3) Kontrollü geri aç — tam stretch al.', breath: 'Kaparken nefes ver, açarken al.', mistakes: ['Dirsekleri bükmek', 'Sadece kolu kullanmak (göğsü hissetmemek)', 'Sırtı döndürmek'], tip: 'Kablo gerginliği tüm hareket boyunca devam eder — bu dumbbell flye\'dan daha uzun süre kas gerilmesi sağlar.' },
  'Chest Dip': { start: 'Paralel barlara çık. Öne eğil (~30°) — bu göğsü hedefler. Dirsekler biraz dışa.', move: '1) Kontrollü in — dirsekler 90° kadar. 2) Alt noktada göğüs gerilmesini hisset. 3) Göğsü sıkıştırarak yukarı it.', breath: 'İnerken nefes al, çıkarken ver.', mistakes: ['Dik durmak (tricep egzersizi olur)', 'Çok hızlı inmek', 'Omuzları sıkıştırmak'], tip: 'Dip yaparken "öne yatık yürüyüş" hissi — bu pozisyon göğüs kasını tam aktive eder.' },
  'Push Up': { start: 'Eller omuz genişliğinden biraz daha geniş, parmaklar öne veya hafif dışa. Vücut baştan topuğa düz çizgi.', move: '1) Göğsü zemine doğru indir — neredeyse değsin. 2) Dirsekler 45° açıyla. 3) Zemine iterek yukarı çık.', breath: 'İnerken nefes al, çıkarken ver.', mistakes: ['Kalçayı yukarı kaldırmak', 'Başı öne uzatmak', 'Yarım hareket yapmak'], tip: 'Zemine itmek yerine "zemin geri itiyormuş" hissini düşün — bu aktif omuz stabilitesi sağlar.' },
  'Pec Deck': { start: 'Koltukta otur, dirsekler ped üstünde omuz hizasında. Sırt düz.', move: '1) Kolları öne doğru kapatarak göğsü sıkıştır. 2) 1 saniye tut. 3) Kontrollü aç — tam stretch.', breath: 'Kaparken nefes ver, açarken al.', mistakes: ['Ağırlığı düşürürken kontrolü kaybetmek', 'Boynu öne uzatmak', 'Dirseklerin düşmesi'], tip: 'Kapalı noktada 1-2 saniye izomasyon tut — göğüs kasının en yüksek aktivasyon noktası burasıdır.' },
  'Deadlift': { start: 'Ayaklar kalça genişliğinde, barın altında. Bar ayak ortasının üstüne gelsin. Kanca veya overhand kavrama. Sırt düz, göğüs dik.', move: '1) Bar bacağa değecek şekilde tut. 2) Bacak ve kalçayla aynı anda iter gibi kaldır. 3) Diz geçince kalçayı öne kilitle. 4) İnerken önce kalça geriye, sonra dizler bük.', breath: 'Kaldırmadan önce derin nefes al ve koru, barı yere bırakırken ver.', mistakes: ['Sırtı yuvarlama (en kritik hata)', 'Barı vücuttan uzak tutmak', 'Hızlı kilitlememe'], tip: '"Bar bacağı tıraşlıyormuş gibi" çekerek kaldır — bu sayede güç transferi en verimli şekilde olur.' },
  'Barbell Row': { start: 'Ayaklar kalça genişliğinde. Öne eğil (45-60°), sırt düz. Barı kavrama omuz genişliğinde.', move: '1) Bar göbek veya alt göğse doğru çek. 2) Dirsekler arkaya, kürekler sıkışsın. 3) Kontrollü in, kollar tam uzasın.', breath: 'Çekerken nefes ver, inerken al.', mistakes: ['Sırtı yuvarlama', 'Momentum kullanarak çekmek', 'Bar çok yükseğe çekmek'], tip: '"Dirsekleri cebin içine it" — bu imaj sırt kaslarını tam aktive eder, kol kasları değil.' },
  'Lat Pulldown': { start: 'Makineye otur, uyluğu kilitle. Barı omuz genişliğinden geniş, overhand kavra. Hafif geriye yaslan.', move: '1) Barı üst göğse/klavikulaya çek. 2) Küreği sıkıştırarak aşağı çek. 3) Kontrollü yukarı bırak — kollar tam uzasın.', breath: 'Çekerken nefes ver, bırakırken al.', mistakes: ['Bar boyuna ya da arkaya çekmek', 'Küreği kullanmamak (sadece kol)', 'Çok öne yatmak'], tip: '"Dirsekleri ceplerimin içine sürüyorum" — bu kürek aktivasyonunu maksimize eder.' },
  'Pull-Up': { start: 'Palmar kavrama, omuz genişliğinden biraz geniş. Kollar tam uzamış, omuzlar aktif (sarkma değil).', move: '1) Küreği sıkıştırarak harekete başla. 2) Çene bara gelene kadar çek. 3) Dirsekler yere doğru gelsin. 4) Kontrollü in, tam ekstansiyona dön.', breath: 'Çekerken nefes ver, inerken al.', mistakes: ['Sallanmak / momentum kullanmak', 'Boynu uzatmak', 'Tam uzanmadan tekrar başlamak'], tip: 'Her çekişte "küreği cebine koy" imajını kullan — bu omuz sağlığını korur ve sırt kaslarını tam aktivasyona sokar.' },
  'Seated Cable Row': { start: 'Ayaklar pedalde, dizler hafif bükük. Otur ve barı/tutucuyu kavra. Sırt dik.', move: '1) Göbek/alt göğse doğru çek. 2) Dirsekler arkaya, kürekler sıkışsın. 3) Kontrollü öne uzat — sırt esneyebilir, ama dön.', breath: 'Çekerken nefes ver, uzatırken al.', mistakes: ['Sırtı öne düşürmek', 'Dirsekleri geniş açmak', 'Sadece kolla çekmek'], tip: 'Hareketin başında küreği önce sıkıştır, sonra kolu çek — böylece lat ve orta sırt tam aktive olur.' },
  'T-Bar Row': { start: 'Makineye binmek gibi eğil. Barı göğüs/karın hizasında kavra. Sırt düz, hafif öne eğik.', move: '1) Barı göbek hizasına çek. 2) Dirsekler yakın ya da geniş (hedef kasa göre). 3) Kontrollü in.', breath: 'Çekerken ver, inerken al.', mistakes: ['Çok ağır yük — sırt yuvarlama', 'Baş aşağı bakmak', 'Tam uzanmamak'], tip: 'Geniş kavrama = daha fazla lat. Dar kavrama = daha fazla orta sırt. Hedefe göre seç.' },
  'Dumbbell Row': { start: 'Eli ve dizi bench üstüne koy. Diğer elle dumbbell kavra. Sırt yere paralel, düz.', move: '1) Dumbbelli göbek hizasına çek. 2) Küreği sıkıştır — dirsek arkaya. 3) Kontrollü in, kol tam uzasın.', breath: 'Çekerken ver, inerken al.', mistakes: ['Sırtı döndürmek', 'Sadece kolla çekmek', 'Yarım range of motion'], tip: 'Kolu "cebe koyar gibi" çek — bu imajla lat ve romboid kasları tam aktive olur.' },
  'Face Pull': { start: 'Kablo makinesi göz hizasında. Çift tutamaç. Dirsekler omuz hizasında.', move: '1) Tutamaçları yüze doğru çek. 2) Dirsekler yana açılır. 3) Dış rotasyon hissedilmeli. 4) Kontrollü geri.', breath: 'Çekerken ver, inerken al.', mistakes: ['Dirsekleri düşürmek', 'Boynu öne uzatmak', 'Çok ağır'], tip: 'Face pull hem arka deltoid hem de dış rotator cuff kasları için en değerli önleyici egzersizdir — yapmayanlar omuz sakatlığına davetiye çıkarır.' },
  'Rack Pull': { start: 'Barı diz hizasında rack\'e yerleştir. Deadlift duruşu, sırt düz, kavrama omuz genişliğinde.', move: '1) Sırtı düz tutarak kalk. 2) Kalçayı öne kilitle. 3) Kontrollü in.', breath: 'Kalkıştan önce derin nefes, yukarıda ver.', mistakes: ['Sırtı yuvarlama', 'Bar çok yüksek başlangıç noktası'], tip: 'Rack pull deadliftten daha fazla ağırlık kaldırmanı sağlar — üst sırt ve trapez için mükemmel.' },
  'Overhead Press': { start: 'Bar klavikul üstünde. Kavrama omuz genişliğinden biraz geniş. Dirsekler öne, omuzlar aktif.', move: '1) Barı başın önünden düz yukarı it. 2) Kafa bardan çekilir, bar geçince tekrar öne al. 3) Üst kısımda kollar tam uzasın. 4) Kontrollü in.', breath: 'İterken nefes ver, inerken al.', mistakes: ['Beli aşırı kasmak / geriye yatmak', 'Barı başın önünde tutmak', 'Dirseklerin çok açılması'], tip: 'Press yaparken "çubuğu kırmaya çalışır gibi" dışa kuvvet uygula — omuz stabilitesi artar.' },
  'Dumbbell Shoulder Press': { start: 'Otur veya dik dur. Dumbbellları omuz hizasında, avuçlar öne. Sırt dik.', move: '1) Düz yukarı it — tepede dumbbelllar neredeyse değebilir. 2) Kontrollü in — dirsekler 90° altında.', breath: 'İterken ver, inerken al.', mistakes: ['Aşırı geriye yaslanmak', 'Dumbbellları önde tutmak', 'Dirseklerin çok öne gelmesi'], tip: 'Barbell press yerine dumbbell press omuz kemiğine daha doğal hareket aralığı sağlar — sakatlık riski düşer.' },
  'Lateral Raise': { start: 'Dik dur, dumbbells yanlarda. Hafif ön kol rotasyonu (parmaklar hafifçe aşağı).', move: '1) Kolları yanlara 90°ye kaldır. 2) Dirsekler bilek seviyesinde veya biraz üstünde. 3) Kontrollü in.', breath: 'Kaldırırken nefes ver, inerken al.', mistakes: ['Momentum kullanmak', 'Dirsekleri bükmek', 'Omuzları sıkıştırmak'], tip: 'Sanki elimde su dolu bardak var ve dökmemeye çalışıyorum — bu imaj doğru rotasyonu sağlar.' },
  'Front Raise': { start: 'Dik dur, dumbbells önde. Overhand kavrama. Dirsekler çok hafif bükük.', move: '1) Kolları düz önde omuz hizasına kaldır. 2) 1 saniye tut. 3) Kontrollü in.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Momentum kullanmak', 'Gövdeyi öne-arkaya sallamak', 'Kolları çok yükseğe kaldırmak'], tip: 'Ön deltoidi izole etmek istiyorsan kablo ile yap — kablo sabit gerilim sağlar.' },
  'Rear Delt Fly': { start: 'Öne eğil (~70-80°) veya yüzüstü bench\'e uzan. Dumbbells serbest, avuçlar karşı karşıya.', move: '1) Kolları yanlara kaldır. 2) Dirsekler hafif bükük. 3) Arka deltoid sıkışsın. 4) Kontrollü in.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Çok yüksek ağırlık', 'Trapezi kullanmak (omuz sıkıştırma)', 'Hızlı yapmak'], tip: 'Arka deltoid görmezden gelinen kastır — güçlü omuz dengesi için haftada 2-3 kez direkt çalışmak şart.' },
  'Arnold Press': { start: 'Otur, dumbbells göğüs önünde avuçlar içe bakacak şekilde. Sırt dik.', move: '1) Yukarı iterken avuçları dışa döndür. 2) Tepede avuçlar tamamen öne. 3) İnerken ters rotasyon.', breath: 'İterken ver, inerken al.', mistakes: ['Çok hızlı rotasyon', 'Beli aşırı kavsetmek', 'Dirsekleri çok öne almak'], tip: 'Arnold press tüm deltoid başlarını tek egzersizde çalıştırır — tek hareketle 3 kas başı.' },
  'Shrug': { start: 'Dik dur. Barbell/dumbbell önde veya arkada. Kavrama güçlü.', move: '1) Omuzları kulak hizasına kadar kaldır. 2) 1 saniye tut. 3) Kontrollü in — tam aşağı.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Omuzları döndürmek', 'Boynu bükmek', 'Momentum kullanmak'], tip: 'Shrug\'da tam range of motion şart — yarım hareket trapezi yetersiz aktive eder.' },
  'Upright Row': { start: 'Barı/dumbbellları önde overhand kavra. Eller yakın (omuz genişliği ya da daha dar).', move: '1) Barı çeneye doğru çek. 2) Dirsekler omuz hizasına kadar çıksın. 3) Kontrollü in.', breath: 'Çekerken ver, inerken al.', mistakes: ['Dirsekleri omuz üstüne çıkarmak (AC eklem sıkışması riski)', 'Öne eğilmek', 'Çok hızlı'], tip: 'Geniş kavrama = daha fazla deltoid. Dar kavrama = daha fazla trapez. Dirsekler her zaman bilekten yukarıda.' },
  'Bicep Curl': { start: 'Dik dur, dirsekler vücudun yanında sabit. Dumbbell/bar underhand kavrama.', move: '1) Sadece ön kol hareket etsin. 2) Üst kısma tam sıkıştır. 3) Kontrollü in, kol tam uzasın.', breath: 'Kaldırırken nefes ver, inerken al.', mistakes: ['Dirsekleri öne getirmek', 'Momentum kullanmak', 'Yarım range of motion'], tip: 'En üst noktada 1 saniye dur ve bisepsi sık — kasın tam kasılmasını hissedersin.' },
  'Barbell Curl': { start: 'Dik dur, barı underhand omuz genişliğinde kavra. Dirsekler yanında sabit.', move: '1) Barı kıvırarak göğse doğru kaldır. 2) Tepede sık. 3) Kontrollü in — tam uzat.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Dirsekleri öne almak', 'Sırtı geriye atmak', 'Hızlı indirmek'], tip: 'EZ bar yerine düz bar ile yapınca uzun bisep başı daha fazla aktive olur — eğer dirseklerin izin veriyorsa tercih et.' },
  'Hammer Curl': { start: 'Dik dur, dumbbells nötr kavrama (avuçlar içe). Dirsekler sabit.', move: '1) Nötr kavramayı koru, kaldır. 2) Tepede brachialis ve brachioradialis sık. 3) Kontrollü in.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Avuçları döndürmek', 'Momentum', 'Yarım hareket'], tip: 'Hammer curl bisepsin yanı sıra ön kol kaslarını (brachioradialis) da çalıştırır — kol hacmi için şart.' },
  'Preacher Curl': { start: 'Preacher bench\'e otur, üst kol pede düz. EZ bar/dumbbell underhand kavra.', move: '1) Barı kıvır — dirsekler pedde sabit kalır. 2) Tepede sık. 3) Kontrollü in — tam uzat.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Dirsekleri pedden kaldırmak', 'Çok hızlı indirmek (yırtılma riski)', 'Gövdeyi döndürmek'], tip: 'Preacher curl cheat\'i sıfırlar — momentum imkansız, saf bisep çalışması için en etkili hareket.' },
  'Tricep Pushdown': { start: 'Kablo makinesi veya rezistans bant, göğüs hizasında. Dirsekler vücudun yanında sabit.', move: '1) Sadece ön kol hareket etsin. 2) Alt noktada tricepti tam sık. 3) Kontrollü kaldır, dirsek 90°ye kadar.', breath: 'İterken nefes ver, inerken al.', mistakes: ['Dirsekleri öne almak', 'Üst gövdeyi öne eğmek', 'Hızlı yapmak'], tip: 'Her tekrarda alt noktada 0.5 saniye dur — tricep tam kasılır.' },
  'Skull Crusher': { start: 'Düz bankta yaz. EZ bar/barı gözlerin üstünde tut, kollar dik.', move: '1) Sadece dirsekten kıvır — barı alına/kafaya doğru indir. 2) Dirsekler sabit, sadece ön kol hareket eder. 3) Tricepti sıkıştırarak düzelt.', breath: 'İnerken al, düzelterken ver.', mistakes: ['Dirsekleri öne almak', 'Omuzları kullanmak', 'Bar yüzüne düşürmek'], tip: 'Skull crusher + hemen ardından close grip bench press "triset" yaparak pompayı maksimize et.' },
  'Overhead Tricep Extension': { start: 'Otur/dik dur. Dumbbell/barı iki elle kafanın üstünde tut. Dirsekler yukarı.', move: '1) Dirsekten kıvır — ağırlığı boyun/arka kafa arkasına indir. 2) Dirsekler sabit. 3) Uzun başı sıkıştırarak yukarı düzelt.', breath: 'İnerken al, düzelterken ver.', mistakes: ['Dirsekleri açmak', 'Sırtı kavsetmek', 'Kısa range of motion'], tip: 'Kollar başın üstündeyken tricep uzun başı tam stretch alır — bu pozisyon kasın en uzun süre gerilmesini sağlar.' },
  'Dip': { start: 'Paralel barlara çık. Dik dur — bu tricep odaklı dip. Dirsekler yakın.', move: '1) Kontrollü in — dirsekler 90° kadar. 2) Dirsekler yakın kalır (göğse açma). 3) Tricepsi sıkıştırarak çık.', breath: 'İnerken al, çıkarken ver.', mistakes: ['Öne eğilmek (göğüs dipi olur)', 'Dirsekleri açmak', 'Çok hızlı inmek'], tip: 'Dik duruş + dar dirsek = tricep. Öne eğim + geniş dirsek = göğüs. Amacına göre vücut pozisyonunu ayarla.' },
  'Close Grip Bench Press': { start: 'Düz bankta yat. Barı omuz genişliğinde veya daha dar kavra. Sırt düz.', move: '1) Barı alt göğse/karına indir. 2) Dirsekler yakın, vücuda paralel. 3) Tricepsi sıkıştırarak it.', breath: 'İnerken al, iterken ver.', mistakes: ['Çok dar kavrama (bilek stresi)', 'Dirsekleri açmak', 'Barı boyuna yakın indirmek'], tip: 'Standart Bench\'te kullandığından %15-20 daha az ağırlıkla başla — bilek ve dirsek uyum zamanına ihtiyaç duyar.' },
  'Squat': { start: 'Ayaklar omuz genişliğinde, ayak parmakları 15-30° dışa. Bar trapez üstünde rahat otsun. Göğüs dik, bakış öne.', move: '1) Kalçayla geriye otur, dizler ayak parmakları yönünde aç. 2) Uyluklar yere paralele kadar in (veya daha derin). 3) Topuklar yerden kalmasın. 4) Dizleri içe düşürme, yukarı iterken güçlü nefes ver.', breath: 'İnerken derin nefes al (Valsalva), çıkarken ver.', mistakes: ['Dizleri içe düşürmek', 'Topukları kaldırmak', 'Öne eğilmek'], tip: 'Squat yaparken "yeri yırtıyormuş gibi" ayaklarla dışa kuvvet uygula — kalça kasları çok daha iyi aktive olur.' },
  'Front Squat': { start: 'Bar klavikula/ön omuzda. Kavrama geniş, dirsekler yüksek ve öne. Sırt dik.', move: '1) Kalçayı aşağıya in — torso daha dik kalır (front squat\'ın avantajı). 2) Dizler öne ve dışa. 3) Quadricepsi sıkıştırarak çık.', breath: 'İnerken al, çıkarken ver.', mistakes: ['Dirsekleri düşürmek (bar düşer)', 'Öne eğilmek', 'Topukları kaldırmak'], tip: 'Front squat barbell squat\'a göre %20 daha fazla quadriceps aktive eder — ön bacak için en etkili hareketlerden biri.' },
  'Hack Squat': { start: 'Makineye yaslan, omuzlar peddeki. Ayaklar platform alt kısmında, omuz genişliğinde.', move: '1) Kilit kolu bırak. 2) Dizler 90° ya kadar in. 3) Topukla it, diz tam açma.', breath: 'İnerken al, iterken ver.', mistakes: ['Kalçayı kaldırmak', 'Dizleri kilitlemek', 'Ayak pozisyonu çok aşağıda'], tip: 'Ayak pozisyonu kası değiştirir: altta = alt quadricep, ortada = tüm quad, üstte = glute.' },
  'Leg Press': { start: 'Sırt ve kalça sehpaya tam otur. Ayaklar platform ortasında, omuz genişliğinde.', move: '1) Diz 90° veya biraz üstüne in. 2) Topukla it, diz tam açma. 3) Dizleri kilitleme.', breath: 'İterken nefes ver, inerken al.', mistakes: ['Kalçayı kaldırmak', 'Dizleri tam kilitlemek', 'Ayakları çok aşağıya koymak'], tip: 'Topukları aktif tut — topukla itmek quadriceps ile glute daha dengeli çalıştırır.' },
  'Romanian Deadlift': { start: 'Ayaklar kalça genişliğinde. Bar kalça önünde, overhand kavrama. Dizler hafif bükük, sabit.', move: '1) Kalçayı geriye iter gibi in. 2) Sırt düz, bar bacağa yakın. 3) Hamstring gerer hissedince dur. 4) Kalçayla kalkınırken it.', breath: 'İnerken nefes al, kalkarken ver.', mistakes: ['Sırtı yuvarlama', 'Dizleri bükmek (o Squat olur)', 'Bar vücuttan uzaklaşmak'], tip: '"Duvara popo vur" hareketi gibi kalçayı geriye gönder — hamstring stretch hissini doğru yapar.' },
  'Leg Curl': { start: 'Makinede yüzüstü yat (veya otur). Parmak uçları ayak bileğinin arkasında.', move: '1) Topukları kalçaya doğru çek. 2) Tepede hamstringleri sık. 3) Kontrollü in.', breath: 'Çekerken ver, inerken al.', mistakes: ['Kalçayı kaldırmak', 'Çok hızlı inmek', 'Tam uzanmamak'], tip: 'Yavaş eksantrik (iniş) hamstring gelişimi için konsantrik (kalkış) kadar önemli — 3 saniye kontrolü dene.' },
  'Leg Extension': { start: 'Makinede otur, sırt düz. Topuklar peddin arkasında, diz kenarında.', move: '1) Dizleri tam aç. 2) Tepede quadricepsi sık. 3) Kontrollü in — diz tam büküm.', breath: 'Açarken ver, inerken al.', mistakes: ['Çok hızlı hareket', 'Sırtı kaldırmak', 'Tam açmamak'], tip: 'Leg extension diz bağlarına yük bindirdiği için ağır ağırlıktan kaçın — kontrol ve his öncelikli.' },
  'Hip Thrust': { start: 'Omuzlar bench üstünde, kalça yerde. Bar kalça kemiğinin üstünde, pad kullan. Ayaklar yere düz.', move: '1) Kalçayı yukarı it, gövde yere paralel. 2) Glute tam sık. 3) Kontrollü in.', breath: 'İterken nefes ver, inerken al.', mistakes: ['Beli aşırı kavsetmek', 'Dizleri içe düşürmek', 'Tam kasılmamak'], tip: 'Her tekrarda 1-2 saniye tutarak squeeze yap — glute aktivasyonu %40 artar.' },
  'Lunge': { start: 'Dik dur, ayaklar kalça genişliğinde. Ellerde dumbbell veya barbell omuzda.', move: '1) Büyük adım at — ön diz 90°. 2) Arka diz zemine yaklaşır. 3) Ön topukla it, geri gel.', breath: 'İnerken al, çıkarken ver.', mistakes: ['Ön dizi parmak ucunun önüne taşımak', 'Gövdeyi öne eğmek', 'Arka dizi yere çarpmak'], tip: 'Uzun adım = daha fazla glute. Kısa adım = daha fazla quadricep. Hedefine göre adım uzunluğunu ayarla.' },
  'Bulgarian Split Squat': { start: 'Ön ayak öne, arka ayak bench/yüksek yüzey üstünde. Dumbbell ellerde.', move: '1) Ön diz 90°ye in. 2) Arka diz neredeyse zemine değsin. 3) Ön topukla it, kalk.', breath: 'İnerken al, çıkarken ver.', mistakes: ['Ön dizi parmak ucunun önüne taşımak', 'Öne eğilmek', 'Dengeyi kaybetmek'], tip: 'Tek bacak egzersizleri kas dengesizliklerini düzeltir ve core stabilitesini zorunlu kılar — hafif başla, denge önce.' },
  'Calf Raise': { start: 'Parmak uçları yükseltilmiş yüzeyde. Topuklar serbest. Dik dur.', move: '1) Parmak uçlarına kadar yüksek kalk. 2) Tepede sık. 3) Topuklar tam aşağıya in — stretch al.', breath: 'Çıkarken ver, inerken al.', mistakes: ['Kısa range of motion', 'Çok hızlı', 'Diz bükmek'], tip: 'Baldır kası çok adaptasyon-dirençli bir kastır — düşük tekrar ağır, yüksek tekrar hafif her ikisi de çalışır.' },
  'Plank': { start: 'Underarm (dirsek) veya el. Omuzların altında dirsek/el. Vücut baştan topuğa düz çizgi.', move: 'Pozisyonu koru. Kalça ne yukarı ne de aşağı. Core sıkı, nefes düzenli.', breath: 'Derin ve kontrollü nefes al. Tutarak nefes alma.', mistakes: ['Kalçayı yukarı kaldırmak', 'Beli sarkıtmak', 'Boynu aşırı uzatmak'], tip: 'Tutarken "zemine delmeye çalışır gibi" dirsekleri geriye, ayakları öne çek — bu gerçek anlamda core gerilmesini sağlar.' },
  'Crunch': { start: 'Yerde sırt üstü, dizler 90°. El başın yanında veya göğüste çapraz.', move: '1) Sadece omuzları kaldır, bel yerde kalsın. 2) Üst noktada abdominal sık. 3) Kontrollü in.', breath: 'Kaldırırken nefes ver, inerken al.', mistakes: ['Boynu çekmek', 'Tam oturmak (o crunch değil)', 'Hızlı yapmak'], tip: 'Güneşi öpmeye çalışır gibi kafayı hafifçe yukarı tutarak sıkıştır — boyun stresi sıfırlanır.' },
  'Sit-Up': { start: 'Yerde sırt üstü, dizler bükük, ayaklar sabit. El başın arkasında.', move: '1) Tüm gövdeyi kaldır. 2) Dizlere doğru uzan. 3) Kontrollü in.', breath: 'Kalkışta ver, inerken al.', mistakes: ['Boynu çekmek', 'Momentum kullanmak', 'Ayakları altına yerleştirmek (hip flexor devreye girer)'], tip: 'Sit-up hip flexor\'u da çalıştırır — saf abdominal için crunch daha etkili. Ama fonksiyonel güç için sit-up tercih edilir.' },
  'Leg Raise': { start: 'Sırt üstü yat. Eller yan tarafta veya kalça altında. Bacaklar düz.', move: '1) Bacakları 90°ye kaldır. 2) Alt sırtı yerde tut. 3) Kontrollü in — bacaklar yere değmeden.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Alt sırtı kaldırmak', 'Bacakları zemine bırakmak', 'Momentum kullanmak'], tip: 'Sarkma sürümünde (hanging leg raise) alt abdominal aktivasyonu %40 artar — ilerledikçe geç.' },
  'Cable Crunch': { start: 'Kablo makinesi önünde diz üstü. Tutamaçı alnın üstünde tut. Sırt hafif öne.', move: '1) Core\'u kıvır — sadece omuzlar hareket eder. 2) Dirseğin dizine değecek kadar in. 3) Kontrollü geri.', breath: 'İnerken ver, çıkarken al.', mistakes: ['Kalçayı geriye almak', 'Boynu bükmek', 'Hafif ağırlık'], tip: 'Kablo krunç diğer core egzersizlerinden farklı olarak dirençli ağırlıkla çalıştırmanı sağlar — hipertrofi için şart.' },
  'Russian Twist': { start: 'Yerde otur, dizler bükük. Geriye yaslan (~45°). Ellerde ağırlık veya boş.', move: '1) Gövdeyi yana döndür. 2) Karşı tarafa geç. 3) Her dönüşte core\'u sık.', breath: 'Dönüşlerde kısa nefes al-ver.', mistakes: ['Kalçayı kaldırmak', 'Sadece kolları sallamak', 'Çok hızlı'], tip: 'Ayakları yerden kaldırarak yapınca zorluk artar ve hip flexor daha az katılır — ilerleme için dene.' },
  'Ab Wheel': { start: 'Diz üstünde, ab wheel önde. Eller tura sıkı.', move: '1) Çark ı öne yuvarla — vücut uzanır. 2) Core sıkı, bel sarkmasın. 3) Core ile geri çek.', breath: 'Uzanırken al, çekerken ver.', mistakes: ['Beli sarkıtmak', 'Kalçayla çekmek', 'Çok hızlı uzanmak'], tip: 'Ab wheel başlangıçta çok zordur — önce kısa mesafeden başla, bel sarkışını sıfır tut.' },
  'Hanging Leg Raise': { start: 'Pull-up barına asıl, omuzlar aktif. Bacaklar düz veya bükük.', move: '1) Bacakları 90°ye kaldır (başlangıç) veya barın seviyesine (ileri). 2) Kontrollü in.', breath: 'Kaldırırken ver, inerken al.', mistakes: ['Sallanmak', 'Momentumla kaldırmak', 'Beli bükmek'], tip: 'Hareket boyunca kasıtlı yavaşlat — momentum sıfır, core aktivasyonu maksimum olsun.' },
  'Mountain Climber': { start: 'Push-up pozisyonu. Eller omuz altında, vücut düz çizgi.', move: '1) Bir dizi göğüse doğru çek. 2) Geri. 3) Diğer diz. Hızlı veya kontrollü.', breath: 'Ritimli nefes al-ver.', mistakes: ['Kalçayı yukarı kaldırmak', 'Elleri çok öne almak', 'Beli sarkıtmak'], tip: 'Yavaş mountain climber = core. Hızlı mountain climber = kardiyo. İkisi de etkili — amaca göre seç.' },
  'Koşu Bandı': { start: 'Bandı 5-10 dakika yürüyüş ile ısıt. Dik duruş, hafif öne eğim.', move: 'Hız ve eğime göre yürü veya koş. Her 5-10 dakikada hız/eğim değişikliği düşün.', breath: 'Ritimli ve derin nefes. Konuşabiliyorsan tempo çok düşük (zone 2).', mistakes: ['Bant kenarlarına tutunmak', 'Çok küçük adımlar atmak', 'Hiç eğimsiz koşmak'], tip: 'Zone 2 kardiyosu (konuşabildiğin tempo) yağ yakımı ve aerobik kapasite için haftada 3-4 saat idealdir.' },
  'Bisiklet': { start: 'Seleyi kalça hizasına ayarla. Pedal alt konumdayken diz hafif bükük olmalı.', move: 'Sabit veya değişen direnç. Yüksek devir (80-100 rpm) eklemlere daha az yük.', breath: 'Ritimli derin nefes.', mistakes: ['Seleyi çok aşağı ayarlamak (diz stresi)', 'Sadece düz direnç kullanmak'], tip: 'HIIT bisiklet: 20 sn max + 40 sn düşük. 8-10 set. Yağ yakımı için steady state\'den 3 kat daha etkili.' },
  'Kürek Makinesi': { start: 'Ayaklar bağlı, dizler bükük. Gövde hafif öne. Kolu kavra.', move: '1) Bacakla it (80% güç). 2) Gövde geriye yaslan. 3) Kolu göbeğe çek. 4) Ters sırayla geri.', breath: 'İterken ver, dönerken al.', mistakes: ['Kolla çekmek (bacak önce)', 'Sırtı yuvarlama', 'Çok hızlı dönüş'], tip: 'Kürek makinesi full body — bacaklar %60, core %20, üst vücut %20. Doğru tekniği öğrenmeden ağır gitme.' },
  'Elliptical': { start: 'Kolları tut veya serbest (core aktivasyonu için). Dik duruş.', move: 'Düzenli elips hareketi. Direnç ve eğim değiştirerek interval yapabilirsin.', breath: 'Ritimli nefes.', mistakes: ['Çok ileri eğilmek', 'Kolları kullanmamak'], tip: 'Elliptical koşuya göre eklemlere %85 daha az yük bindirir — diz/kalça problemi olanlara idealdir.' },
  'Battle Rope': { start: 'Ayaklar kalça genişliğinde, dizler hafif bükük. Öne eğim. Halatı uçlarından tut.', move: 'Dalgalanma, çırpma veya döndürme hareketleri. 20-30 saniyelik burst\'ler.', breath: 'Ritimli nefes.', mistakes: ['Dik durmak', 'Sadece kolları kullanmak (core ve bacak da katılmalı)'], tip: 'Battle rope kalp atışını 10 saniye içinde maksimuma çıkarır — HIIT için en hızlı yüklenme araçlarından biri.' },
  'Box Jump': { start: 'Kutunun önünde dik dur, ayaklar kalça genişliğinde.', move: '1) Diz bükerek geril. 2) Kollarla momentum al, zıpla. 3) Yumuşak iniş — dizler bükük. 4) Kutudan in veya atla.', breath: 'Zıplarken ver, inerken al.', mistakes: ['Kutunun çok yüksek olması', 'Sert iniş', 'Yorgunken yapmak (tendon riski)'], tip: 'İniş her zaman zıplamadan daha önemlidir — yumuşak, kontrollü iniş tendon ve eklem sağlığını korur.' },
  'Burpee': { start: 'Dik duruş.', move: '1) Yere çök — ellerini bastır. 2) Ayakları geri at (plank). 3) Push-up (isteğe bağlı). 4) Ayakları öne çek. 5) Yukarı zıpla.', breath: 'Ritimli nefes. Nefes tutma.', mistakes: ['Sırtı yuvarlama', 'Hızı formun önüne geçirmek', 'Ağır yorgunlukta yapmak'], tip: 'Burpee full body yakıcı — 1 dakika 10 kalori civarı. Ama yüksek yaralanma riski, sağlam formu koru.' },
  'Kettlebell Swing': { start: 'Ayaklar omuz genişliğinde, kettlebell önde. Kalça menteşesi hazır.', move: '1) Kettlebell bacaklar arasından geçir. 2) Kalça patlaması ile öne fırlat. 3) Omuz hizasına kadar sallan. 4) Tekrar bacaklar arası.', breath: 'Yukarıda ver, inerken al.', mistakes: ['Squat hareketi yapmak (kalça menteşesi şart)', 'Sırtı yuvarlama', 'Kolla kaldırmak'], tip: 'Kettlebell swing kalça güç üretimini geliştirir — atletik performans ve posterior chain için çok değerli.' },
  'Jump Rope': { start: 'İp bilek seviyesinde. Hafif ayak parmak uçlarında.', move: 'Hafif sıçrama. Dirsekler yanında sabit, bileklerle döndür.', breath: 'Ritimli nefes.', mistakes: ['Çok yüksek zıplamak', 'Omuzları kullanmak', 'Çok ağır ip'], tip: 'Çift tur atlamadan önce tek tur (single under) ritmi mükemmelleştir — koordinasyon ve ritim önce gelir.' },
}
const DEFAULT_FORM = { start: 'Dik ve dengeli bir başlangıç pozisyonu al. Sırt düz, omuzlar geri ve aşağı, göğüs açık.', move: 'Hareketi kontrollü ve tam range of motion ile yap. Her tekrarda kas kasılmasını hisset.', breath: 'Güç uygularken nefes ver, geri dönerken nefes al.', mistakes: ['Momentum kullanmak', 'Yarım range of motion', 'Sırtı yuvarlama'], tip: 'Form kalitesi ağırlıktan önce gelir — doğru formla yapılan her tekrar yanlış formla yapılan 10 tekrardan değerlidir.' }
function getForm(name) { return EXERCISE_FORMS[name] || DEFAULT_FORM }

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Göğüs', color: '#ef4444', exercises: [
    { name: 'Bench Press',         photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
    { name: 'İncline Bench Press', photo: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80' },
    { name: 'Decline Bench Press', photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
    { name: 'Dumbbell Fly',        photo: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80' },
    { name: 'Cable Crossover',     photo: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80' },
    { name: 'Chest Dip',           photo: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80' },
    { name: 'Push Up',             photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    { name: 'Pec Deck',            photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  ]},
  { id: 'back', label: 'Sırt', color: '#3b82f6', exercises: [
    { name: 'Deadlift',           photo: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400&q=80' },
    { name: 'Barbell Row',        photo: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80' },
    { name: 'Lat Pulldown',       photo: 'https://images.unsplash.com/photo-1530822847156-5df684ec5933?w=400&q=80' },
    { name: 'Pull-Up',            photo: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a87?w=400&q=80' },
    { name: 'Seated Cable Row',   photo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80' },
    { name: 'T-Bar Row',          photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80' },
    { name: 'Dumbbell Row',       photo: 'https://images.unsplash.com/photo-1611745001823-34427e837f4f?w=400&q=80' },
    { name: 'Face Pull',          photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
    { name: 'Rack Pull',          photo: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80' },
  ]},
  { id: 'shoulders', label: 'Omuz', color: '#f59e0b', exercises: [
    { name: 'Overhead Press',          photo: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80' },
    { name: 'Dumbbell Shoulder Press', photo: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=400&q=80' },
    { name: 'Lateral Raise',           photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    { name: 'Front Raise',             photo: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80' },
    { name: 'Rear Delt Fly',           photo: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=80' },
    { name: 'Arnold Press',            photo: 'https://images.unsplash.com/photo-1550977616-efc580084ac5?w=400&q=80' },
    { name: 'Shrug',                   photo: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&q=80' },
    { name: 'Upright Row',             photo: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80' },
  ]},
  { id: 'arms', label: 'Kol', color: '#8b5cf6', exercises: [
    { name: 'Bicep Curl',                 photo: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80' },
    { name: 'Barbell Curl',               photo: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80' },
    { name: 'Hammer Curl',                photo: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80' },
    { name: 'Preacher Curl',              photo: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80' },
    { name: 'Tricep Pushdown',            photo: 'https://images.unsplash.com/photo-1530822847156-5df684ec5933?w=400&q=80' },
    { name: 'Skull Crusher',              photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
    { name: 'Overhead Tricep Extension',  photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
    { name: 'Dip',                        photo: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80' },
    { name: 'Close Grip Bench Press',     photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  ]},
  { id: 'legs', label: 'Bacak', color: '#22c55e', exercises: [
    { name: 'Squat',               photo: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=80' },
    { name: 'Front Squat',         photo: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80' },
    { name: 'Hack Squat',          photo: 'https://images.unsplash.com/photo-1550977616-efc580084ac5?w=400&q=80' },
    { name: 'Leg Press',           photo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80' },
    { name: 'Romanian Deadlift',   photo: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400&q=80' },
    { name: 'Leg Curl',            photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    { name: 'Leg Extension',       photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80' },
    { name: 'Hip Thrust',          photo: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=80' },
    { name: 'Lunge',               photo: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&q=80' },
    { name: 'Bulgarian Split Squat', photo: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80' },
    { name: 'Calf Raise',          photo: 'https://images.unsplash.com/photo-1587150523154-c61bb52d26e3?w=400&q=80' },
  ]},
  { id: 'core', label: 'Core', color: '#06b6d4', exercises: [
    { name: 'Plank',              photo: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=80' },
    { name: 'Crunch',             photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    { name: 'Sit-Up',             photo: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80' },
    { name: 'Leg Raise',          photo: 'https://images.unsplash.com/photo-1611745001823-34427e837f4f?w=400&q=80' },
    { name: 'Cable Crunch',       photo: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a87?w=400&q=80' },
    { name: 'Russian Twist',      photo: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80' },
    { name: 'Ab Wheel',           photo: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80' },
    { name: 'Hanging Leg Raise',  photo: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80' },
    { name: 'Mountain Climber',   photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  ]},
  { id: 'cardio', label: 'Kardiyo', color: '#f97316', exercises: [
    { name: 'Koşu Bandı',       photo: 'https://images.unsplash.com/photo-1529516222410-7e3caab0b1f1?w=400&q=80' },
    { name: 'Bisiklet',         photo: 'https://images.unsplash.com/photo-1517343985841-f8b2d66e010b?w=400&q=80' },
    { name: 'Kürek Makinesi',   photo: 'https://images.unsplash.com/photo-1593076798104-968cba8bdb3a?w=400&q=80' },
    { name: 'Elliptical',       photo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80' },
    { name: 'Battle Rope',      photo: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80' },
    { name: 'Box Jump',         photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80' },
    { name: 'Burpee',           photo: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80' },
    { name: 'Kettlebell Swing', photo: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80' },
    { name: 'Jump Rope',        photo: 'https://images.unsplash.com/photo-1598632640487-6ea4a442f8f2?w=400&q=80' },
  ]},
]

// ── UI Components ──
function Pill({ mg, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 24, cursor: 'pointer',
      border: `1px solid ${active ? mg.color : 'rgba(255,255,255,0.08)'}`,
      background: active ? `${mg.color}22` : 'rgba(255,255,255,0.03)',
      color: active ? mg.color : 'var(--text-muted)',
      fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13,
      transition: 'all .3s cubic-bezier(.16,1,.3,1)', flexShrink: 0,
      boxShadow: active ? `0 0 20px ${mg.color}40, inset 0 0 10px ${mg.color}20` : 'none',
      transform: active ? 'scale(1.05)' : 'scale(1)',
      backdropFilter: 'blur(8px)',
    }}>
      {mg.label}
    </button>
  )
}

function ExerciseCard({ ex, group, onClick }) {
  const cardRef = useRef(null)
  const [imgError, setImgError] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${e.clientX - rect.top}px`)
  }

  return (
    <div ref={cardRef} onClick={onClick} className="glass-card" onMouseMove={handleMouseMove}>
      <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, overflow: 'hidden', border: `1px solid ${group.color}40`, background: `${group.color}20` }}>
        {ex.photo && !imgError ? (
          <img src={ex.photo} alt={ex.name} onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: group.color, boxShadow: `0 0 12px ${group.color}` }} />
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{ex.name}</div>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: group.color, letterSpacing: 1.5, marginTop: 4 }}>{group.label.toUpperCase()}</div>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon name="arrowRight" size={16} color="var(--text-muted)" strokeWidth={2} />
      </div>
    </div>
  )
}

// ── SVG MAP ──
function MuscleMapSVG({ activeGroup, onSelect }) {
  const findMG = (id) => MUSCLE_GROUPS.find(m => m.id === id)
  const [side, setSide] = useState('front')
  const handleSelect = (id) => onSelect(id)
  const isA = (id) => activeGroup === id
  const col = (id) => findMG(id)?.color || '#fff'
  const es = (id) => ({
    fill: isA(id) ? col(id) + '60' : 'rgba(255,255,255,.02)',
    stroke: isA(id) ? col(id) : 'rgba(255,255,255,.1)',
    strokeWidth: isA(id) ? '2' : '1',
    cursor: 'pointer', transition: 'all .3s cubic-bezier(.16,1,.3,1)',
    filter: isA(id) ? `drop-shadow(0 0 8px ${col(id)})` : 'none',
  })

  const FRONT = {
    chest: ['M 175,100 L 168,98 L 155,97 L 140,100 L 128,107 L 118,116 L 112,130 L 110,148 L 112,162 L 118,174 L 128,183 L 142,189 L 156,192 L 168,193 L 175,190 Z', 'M 175,100 L 182,98 L 195,97 L 210,100 L 222,107 L 232,116 L 238,130 L 240,148 L 238,162 L 232,174 L 222,183 L 208,189 L 194,192 L 182,193 L 175,190 Z'],
    shoulders: ['M 118,100 L 108,104 L 98,112 L 90,124 L 86,140 L 85,155 L 88,166 L 96,172 L 104,168 L 110,155 L 112,140 L 114,126 L 118,112 Z', 'M 232,100 L 242,104 L 252,112 L 260,124 L 264,140 L 265,155 L 262,166 L 254,172 L 246,168 L 240,155 L 238,140 L 236,126 L 232,112 Z'],
    arms: ['M 88,170 L 82,184 L 76,200 L 68,218 L 60,236 L 54,252 L 50,264 L 56,270 L 64,264 L 70,248 L 76,232 L 84,214 L 90,196 L 96,180 L 98,172 Z', 'M 262,170 L 268,184 L 274,200 L 282,218 L 290,236 L 296,252 L 300,264 L 294,270 L 286,264 L 280,248 L 274,232 L 266,214 L 260,196 L 254,180 L 252,172 Z', 'M 50,264 L 46,278 L 42,292 L 38,306 L 35,318 L 33,330 L 38,334 L 44,322 L 48,308 L 52,294 L 56,280 L 58,270 Z', 'M 300,264 L 304,278 L 308,292 L 312,306 L 315,318 L 317,330 L 312,334 L 306,322 L 302,308 L 298,294 L 294,280 L 292,270 Z'],
    core: ['M 162,194 L 157,204 L 153,218 L 150,238 L 150,260 L 150,280 L 153,296 L 157,306 L 162,312 L 170,316 L 180,316 L 188,312 L 193,306 L 197,296 L 200,280 L 200,260 L 200,238 L 197,218 L 193,204 L 188,194 Z', 'M 153,196 L 142,202 L 132,212 L 124,228 L 118,250 L 116,272 L 120,292 L 126,306 L 135,314 L 144,318 L 150,312 L 150,280 L 150,248 L 150,218 L 153,204 Z', 'M 197,196 L 208,202 L 218,212 L 226,228 L 232,250 L 234,272 L 230,292 L 224,306 L 215,314 L 206,318 L 200,312 L 200,280 L 200,248 L 200,218 L 197,204 Z'],
    legs: ['M 144,320 L 136,336 L 128,356 L 122,378 L 120,400 L 120,420 L 124,438 L 130,452 L 140,460 L 150,462 L 160,456 L 166,442 L 170,424 L 172,404 L 172,382 L 170,360 L 164,340 L 156,326 L 148,320 Z', 'M 206,320 L 214,336 L 222,356 L 228,378 L 230,400 L 230,420 L 226,438 L 220,452 L 210,460 L 200,462 L 190,456 L 184,442 L 180,424 L 178,404 L 178,382 L 180,360 L 186,340 L 194,326 L 202,320 Z', 'M 132,465 L 126,482 L 122,500 L 120,516 L 120,530 L 124,544 L 130,552 L 138,556 L 146,552 L 152,542 L 154,528 L 154,512 L 152,496 L 148,480 L 142,468 Z', 'M 218,465 L 224,482 L 228,500 L 230,516 L 230,530 L 226,544 L 220,552 L 212,556 L 204,552 L 198,542 L 196,528 L 196,512 L 198,496 L 202,480 L 208,468 Z'],
  }
  const BACK = {
    back: ['M 173,76 L 155,80 L 138,88 L 125,98 L 116,112 L 114,128 L 118,142 L 128,152 L 142,157 L 155,158 L 166,154 L 173,144 L 180,154 L 191,158 L 204,157 L 218,152 L 228,142 L 232,128 L 230,112 L 221,98 L 208,88 L 191,80 L 173,76 Z', 'M 128,157 L 118,168 L 108,182 L 98,200 L 90,220 L 84,240 L 82,256 L 88,264 L 98,260 L 108,244 L 116,225 L 124,206 L 130,188 L 134,172 L 136,162 Z', 'M 218,157 L 228,168 L 238,182 L 248,200 L 256,220 L 262,240 L 264,256 L 258,264 L 248,260 L 238,244 L 230,225 L 222,206 L 216,188 L 212,172 L 210,162 Z', 'M 152,256 L 144,268 L 140,282 L 140,298 L 146,312 L 155,322 L 164,326 L 173,327 L 182,326 L 191,322 L 200,312 L 206,298 L 206,282 L 202,268 L 194,256 Z'],
    shoulders: ['M 125,98 L 112,106 L 100,118 L 94,132 L 92,148 L 96,160 L 106,164 L 114,156 L 118,142 L 120,126 L 124,112 Z', 'M 221,98 L 234,106 L 246,118 L 252,132 L 254,148 L 250,160 L 240,164 L 232,156 L 228,142 L 226,126 L 222,112 Z'],
    arms: ['M 92,166 L 84,182 L 76,200 L 66,222 L 58,242 L 52,260 L 50,272 L 58,276 L 66,262 L 74,244 L 82,224 L 90,204 L 96,186 L 100,174 Z', 'M 254,166 L 262,182 L 270,200 L 280,222 L 288,242 L 294,260 L 296,272 L 288,276 L 280,262 L 272,244 L 264,224 L 256,204 L 250,186 L 246,174 Z', 'M 50,272 L 44,288 L 40,304 L 36,318 L 34,332 L 40,336 L 46,322 L 50,306 L 54,290 L 58,278 Z', 'M 296,272 L 302,288 L 306,304 L 310,318 L 312,332 L 306,336 L 300,322 L 296,306 L 292,290 L 288,278 Z'],
    legs: ['M 150,328 L 140,344 L 132,364 L 126,386 L 126,406 L 130,424 L 138,438 L 148,444 L 158,440 L 166,428 L 170,412 L 170,392 L 168,372 L 164,354 L 158,340 L 152,330 Z', 'M 196,328 L 206,344 L 214,364 L 220,386 L 220,406 L 216,424 L 208,438 L 198,444 L 188,440 L 180,428 L 176,412 L 176,392 L 178,372 L 182,354 L 188,340 L 194,330 Z', 'M 132,448 L 126,466 L 120,486 L 116,506 L 116,524 L 120,540 L 128,552 L 138,556 L 146,550 L 150,538 L 152,522 L 150,504 L 146,484 L 140,465 L 136,454 Z', 'M 214,448 L 220,466 L 226,486 L 230,506 L 230,524 L 226,540 L 218,552 L 208,556 L 200,550 L 196,538 L 194,522 L 196,504 L 200,484 L 206,465 L 210,454 Z'],
    core: ['M 152,318 L 142,328 L 134,342 L 130,358 L 132,374 L 138,386 L 148,392 L 160,390 L 170,380 L 174,366 L 174,350 L 172,336 L 166,326 L 158,320 Z', 'M 194,318 L 204,328 L 212,342 L 216,358 L 214,374 L 208,386 L 198,392 L 186,390 L 176,380 L 172,366 L 172,350 L 174,336 L 180,326 L 188,320 Z'],
  }

  const data = side === 'front' ? FRONT : BACK
  
  return (
    <div style={{ width: '100%', maxWidth: 260, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
        {[['front', 'ÖN'], ['back', 'ARKA']].map(([s, label]) => (
          <button key={s} onClick={() => setSide(s)} style={{
            padding: '6px 24px', borderRadius: 20, cursor: 'pointer', transition: 'all .3s ease',
            background: side === s ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${side === s ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
            color: side === s ? '#000' : 'var(--text)',
            fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: typeof side === s ? 700 : 500, letterSpacing: 1.5,
            boxShadow: side === s ? '0 0 15px var(--accent)' : 'none'
          }}>{label}</button>
        ))}
      </div>
      <div style={{ position: 'relative', width: '100%', lineHeight: 0, padding: 10 }}>
        <img src={side === 'front' ? '/muscle_front.png' : '/muscle_back.png'} alt="kas" style={{
          width: '100%', display: 'block',
          filter: 'invert(1) brightness(0.8) contrast(1.2)', mixBlendMode: 'screen',
          pointerEvents: 'none', userSelect: 'none'
        }} />
        <svg viewBox={side === 'front' ? '0 0 347 581' : '0 0 346 585'} 
          style={{ position: 'absolute', inset: 10, width: 'calc(100% - 20px)', height: 'calc(100% - 20px)' }}>
          {Object.entries(data).map(([id, paths]) => (
            <g key={id} onClick={() => handleSelect(id)} style={{ cursor: 'pointer' }}>
              {paths.map((d, i) => <path key={i} d={d} style={es(id)} 
                onMouseEnter={e => { if(!isA(id)) e.currentTarget.style.fill = col(id)+'30'; e.currentTarget.style.stroke = col(id) }}
                onMouseLeave={e => { if(!isA(id)) { e.currentTarget.style.fill = 'rgba(255,255,255,.02)'; e.currentTarget.style.stroke = 'rgba(255,255,255,.1)' } }}
              />)}
            </g>
          ))}
        </svg>
      </div>
      {activeGroup && (
        <div style={{ textAlign: 'center', marginTop: 16, animation: 'floatUp .4s ease forwards' }}>
          <span style={{ 
            fontFamily: 'Space Mono,monospace', fontSize: 12, letterSpacing: 3, 
            color: col(activeGroup), fontWeight: 700, padding: '4px 12px', 
            background: `${col(activeGroup)}20`, borderRadius: 12, border: `1px solid ${col(activeGroup)}50` 
          }}>
            {findMG(activeGroup)?.label?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}

function DetailModal({ exercise, photo, group, onClose }) {
  const [activeTab, setActiveTab] = useState('form')
  const [videos, setVideos] = useState(null)
  const form = getForm(exercise)
  
  useEffect(() => {
    const ytKey = import.meta.env.VITE_YOUTUBE_KEY
    if (!ytKey) { setVideos([]); return }
    ;(async () => {
      try {
        const q = encodeURIComponent(`${exercise} egzersiz form nasıl yapılır`)
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=3&key=${ytKey}`)
        if (res.ok) { const d = await res.json(); setVideos(d.items || []) }
        else setVideos([])
      } catch { setVideos([]) }
    })()
  }, [exercise])

  const gc = group?.color || 'var(--accent)'
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-drawer" onClick={e => e.stopPropagation()}>
        {photo && (
          <div style={{ position: 'relative', height: 180, overflow: 'hidden', borderRadius: '32px 32px 0 0' }}>
            <img src={photo} alt={exercise} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 30%, rgba(20,20,20,0.95) 100%)` }} />
          </div>
        )}
        <div style={{ position: 'sticky', top: 0, background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(20px)', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10, margin: '12px auto' }} />
          <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: gc, boxShadow: `0 0 15px ${gc}` }} />
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: gc, letterSpacing: 2 }}>{group?.label.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{exercise}</div>
            </div>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
              border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <Icon name="x" size={16} />
            </button>
          </div>
          <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12 }}>
            {[ { id: 'form', l: '📋 Form & Rehber' }, { id: 'video', l: '▶ Videolar' } ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                background: activeTab === t.id ? `${gc}22` : 'rgba(255,255,255,0.03)',
                color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14,
                border: `1px solid ${activeTab === t.id ? gc : 'transparent'}`,
                transition: 'all .3s'
              }}>{t.l}</button>
            ))}
          </div>
        </div>
        
        <div style={{ padding: '24px' }}>
          {activeTab === 'form' && (
            <div style={{ animation: 'floatUp .4s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { i: '🏁', title: 'Başlangıç', desc: form.start },
                { i: '⚡', title: 'Hareket', desc: form.move },
                { i: '💨', title: 'Nefes', desc: form.breath }
              ].map(s => (
                <div key={s.title} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20, padding: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{s.i}</span>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>{s.title}</span>
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 20 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: '#f87171', marginBottom: 12 }}>⚠️ Sık Yapılan Hatalar</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(255,255,255,0.8)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, lineHeight: 1.6 }}>
                  {form.mistakes.map(m => <li key={m} style={{ marginBottom: 6 }}>{m}</li>)}
                </ul>
              </div>
              <div style={{ background: `${gc}15`, border: `1px solid ${gc}40`, borderRadius: 20, padding: 20 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: gc, marginBottom: 8 }}>💡 Pro İpucu</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: '#fff', fontStyle: 'italic', lineHeight: 1.6 }}>"{form.tip}"</div>
              </div>
            </div>
          )}
          {activeTab === 'video' && (
            <div style={{ animation: 'floatUp .4s ease' }}>
              {!videos ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: 'var(--text-muted)' }}>Videolar yükleniyor...</div>
                </div>
              ) : videos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {videos.map(v => (
                    <div key={v.id.videoId} className="yt-card" onClick={() => window.open(`https://youtube.com/watch?v=${v.id.videoId}`, '_blank')}>
                      <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                        <img src={v.snippet.thumbnails.high.url} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="yt-play" style={{ width: 56, height: 56, background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="play" size={24} color="#fff" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: 16 }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{v.snippet.title}</div>
                        <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>{v.snippet.channelTitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>▶</span>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                      YouTube API anahtarı bulunamadı. Videoları doğrudan YouTube'da izleyebilirsin.
                    </div>
                  </div>
                  {[
                    { label: `${exercise} nasıl yapılır`, query: `${exercise} nasıl yapılır form` },
                    { label: `${exercise} tutorial Türkçe`, query: `${exercise} egzersiz tutorial Türkçe` },
                    { label: `${exercise} beginner tips`, query: `${exercise} exercise form tips` },
                  ].map(item => (
                    <button
                      key={item.query}
                      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.query)}`, '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14, cursor: 'pointer', transition: 'all .2s', textAlign: 'left', width: '100%',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div style={{ width: 36, height: 36, background: '#ef4444', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="play" size={16} color="#fff" strokeWidth={3} />
                      </div>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: '#fff', fontWeight: 500 }}>{item.label}</span>
                      <Icon name="arrowRight" size={16} color="var(--text-muted)" strokeWidth={2} style={{ marginLeft: 'auto' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExercisesPage() {
  const [view, setView] = useState('map')
  const [activeGroup, setActiveGroup] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedEx, setSelectedEx] = useState(null)

  const filtered = search.trim()
    ? MUSCLE_GROUPS.flatMap(g => g.exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(e => ({ ex: e, group: g })))
    : activeGroup
      ? MUSCLE_GROUPS.find(m => m.id === activeGroup)?.exercises.map(e => ({ ex: e, group: MUSCLE_GROUPS.find(m => m.id === activeGroup) })) || []
      : MUSCLE_GROUPS.flatMap(g => g.exercises.map(e => ({ ex: e, group: g })))
      
  return (
    <>
      <style>{INLINE_STYLES}</style>
      <div className="page" style={{ maxWidth: 640, paddingBottom: 100, paddingTop: 20 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 20, background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 8px 30px rgba(239,68,68,0.2)' }}>
            🔥
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: -1 }}>Hareketler</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 4 }}>
              {MUSCLE_GROUPS.reduce((acc, g) => acc + g.exercises.length, 0)} EGZERSİZ · 7 BÖLGE
            </div>
          </div>
        </div>

        {/* Magic Search */}
        <div className="magic-search-wrapper" style={{ marginBottom: 24 }}>
          <div className="magic-search-inner" style={{ height: 56 }}>
            <Icon name="search" size={18} color="var(--accent)" strokeWidth={2.5} />
            <input 
              type="text" value={search} onChange={e => { setSearch(e.target.value); if(e.target.value) setView('list'); setActiveGroup(null); }}
              placeholder="Antrenman ara (Bench Press, Squat...)"
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 15, fontFamily: "'Space Grotesk',sans-serif", marginLeft: 12, outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="x" size={14} color="#fff" />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Tabs */}
        {!search && (
          <div className="magic-tabs" style={{ marginBottom: 30 }}>
            <div className="magic-slider" style={{ width: '50%', transform: view === 'map' ? 'translateX(0)' : 'translateX(100%)' }} />
            <button onClick={() => setView('map')} style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', color: view==='map'?'#fff':'var(--text-muted)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', zIndex: 1, transition: 'color .3s' }}>
              🧭 Kas Haritası
            </button>
            <button onClick={() => setView('list')} style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', color: view==='list'?'#fff':'var(--text-muted)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', zIndex: 1, transition: 'color .3s' }}>
              📋 Tüm Liste
            </button>
          </div>
        )}

        {/* View: Map */}
        {view === 'map' && !search && (
          <div style={{ animation: 'floatUp .5s ease' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 30 }}>
              {MUSCLE_GROUPS.map(mg => (
                <Pill key={mg.id} mg={mg} active={activeGroup === mg.id} onClick={() => setActiveGroup(p => p===mg.id ? null : mg.id)} />
              ))}
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, 
              padding: '30px 10px', marginBottom: 30, position: 'relative', overflow: 'hidden' 
            }}>
               <div style={{
                  position: 'absolute', inset: 0,
                  background: activeGroup
                    ? `radial-gradient(ellipse at 50% 50%, ${MUSCLE_GROUPS.find(m => m.id === activeGroup)?.color}20 0%, transparent 60%)`
                    : 'transparent',
                  pointerEvents: 'none', transition: 'background .4s ease',
               }} />
               <MuscleMapSVG activeGroup={activeGroup} onSelect={setActiveGroup} />
            </div>

            {activeGroup && (
              <div style={{ animation: 'floatUp .4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: MUSCLE_GROUPS.find(m=>m.id===activeGroup).color }} />
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>
                      {MUSCLE_GROUPS.find(m=>m.id===activeGroup).label} Egzersizleri
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map(item => <ExerciseCard key={item.ex.name} ex={item.ex} group={item.group} onClick={() => setSelectedEx(item.ex)} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View: List */}
        {(view === 'list' || search) && (
          <div style={{ animation: 'floatUp .5s ease' }}>
            {!search && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, marginBottom: 10, paddingLeft: 4, paddingRight: 4 }}>
                <Pill mg={{ label: 'Tümü', color: 'var(--accent)' }} active={!activeGroup} onClick={() => setActiveGroup(null)} />
                {MUSCLE_GROUPS.map(mg => <Pill key={mg.id} mg={mg} active={activeGroup === mg.id} onClick={() => setActiveGroup(mg.id)} />)}
              </div>
            )}
            {filtered.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(item => <ExerciseCard key={item.ex.name} ex={item.ex} group={item.group} onClick={() => setSelectedEx(item.ex)} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: '#fff' }}>Sonuç bulunamadı</div>
              </div>
            )}
          </div>
        )}

      </div>
      {selectedEx && <DetailModal exercise={selectedEx.name} photo={selectedEx.photo} group={MUSCLE_GROUPS.find(g => g.exercises.some(e => e.name === selectedEx.name))} onClose={() => setSelectedEx(null)} />}
    </>
  )
}
