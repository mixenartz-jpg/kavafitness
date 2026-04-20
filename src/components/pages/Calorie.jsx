import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const FOOD_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

const FOOD_DB = [
  // 🍖 Et & Tavuk
  { cat:'🍖 Et & Tavuk', name:'Tavuk Göğsü (Haşlama)',    kcal:165, protein:31, fat:4,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk But (Izgara)',         kcal:220, protein:27, fat:12, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Kanat (Izgara)',       kcal:240, protein:25, fat:15, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Tavuk Şiş (100g)',           kcal:185, protein:28, fat:7,  carb:2  },
  { cat:'🍖 Et & Tavuk', name:'Hindi Göğsü',                kcal:135, protein:29, fat:1,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Kıyma (Dana)',                kcal:250, protein:26, fat:17, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Dana Biftek (100g)',          kcal:271, protein:26, fat:18, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Köfte (Dana, 100g)',          kcal:280, protein:24, fat:19, carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Döner Kebap (100g)',          kcal:320, protein:22, fat:24, carb:4  },
  { cat:'🍖 Et & Tavuk', name:'Adana Kebap (100g)',          kcal:290, protein:23, fat:21, carb:2  },
  { cat:'🍖 Et & Tavuk', name:'Urfa Kebap (100g)',           kcal:285, protein:22, fat:21, carb:2  },
  { cat:'🍖 Et & Tavuk', name:'Kuzu But (Fırın)',            kcal:295, protein:25, fat:21, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Kuzu Pirzola (100g)',         kcal:310, protein:24, fat:23, carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Sucuk (30g)',                 kcal:135, protein:6,  fat:12, carb:1  },
  { cat:'🍖 Et & Tavuk', name:'Pastırma (30g)',              kcal:90,  protein:12, fat:5,  carb:0  },
  { cat:'🍖 Et & Tavuk', name:'Salam (30g)',                 kcal:95,  protein:5,  fat:8,  carb:1  },
  // 🐟 Balık & Deniz
  { cat:'🐟 Balık & Deniz', name:'Somon (Izgara, 100g)',    kcal:208, protein:20, fat:13, carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Levrek (Izgara)',          kcal:124, protein:24, fat:3,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Çipura (Izgara)',          kcal:128, protein:26, fat:3,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Hamsi (Tava, 100g)',       kcal:190, protein:18, fat:12, carb:2  },
  { cat:'🐟 Balık & Deniz', name:'Ton Balığı (Konserve)',    kcal:130, protein:29, fat:1,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Karides (Haşlama)',        kcal:99,  protein:24, fat:1,  carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Midye (100g)',             kcal:172, protein:24, fat:5,  carb:7  },
  { cat:'🐟 Balık & Deniz', name:'Uskumru (Fırın)',          kcal:205, protein:19, fat:14, carb:0  },
  { cat:'🐟 Balık & Deniz', name:'Palamut (Izgara)',         kcal:180, protein:22, fat:10, carb:0  },
  // 🍲 Çorbalar
  { cat:'🍲 Çorbalar', name:'Mercimek Çorbası (1 kase)',     kcal:180, protein:10, fat:5,  carb:25 },
  { cat:'🍲 Çorbalar', name:'Ezogelin Çorbası (1 kase)',     kcal:160, protein:8,  fat:4,  carb:26 },
  { cat:'🍲 Çorbalar', name:'Yayla Çorbası (1 kase)',        kcal:130, protein:7,  fat:5,  carb:15 },
  { cat:'🍲 Çorbalar', name:'Tavuk Suyu Çorbası',            kcal:90,  protein:6,  fat:3,  carb:10 },
  { cat:'🍲 Çorbalar', name:'Domates Çorbası',               kcal:100, protein:3,  fat:3,  carb:16 },
  { cat:'🍲 Çorbalar', name:'İşkembe Çorbası (1 kase)',      kcal:150, protein:10, fat:8,  carb:10 },
  { cat:'🍲 Çorbalar', name:'Tarhana Çorbası (1 kase)',      kcal:140, protein:5,  fat:4,  carb:22 },
  { cat:'🍲 Çorbalar', name:'Paça Çorbası (1 kase)',         kcal:160, protein:14, fat:9,  carb:5  },
  // 🍚 Pilav & Makarna
  { cat:'🍚 Pilav & Makarna', name:'Pirinç Pilavı (1P)',     kcal:250, protein:5,  fat:6,  carb:44 },
  { cat:'🍚 Pilav & Makarna', name:'Bulgur Pilavı (1P)',     kcal:220, protein:7,  fat:4,  carb:42 },
  { cat:'🍚 Pilav & Makarna', name:'Şehriyeli Pilav (1P)',   kcal:260, protein:5,  fat:7,  carb:45 },
  { cat:'🍚 Pilav & Makarna', name:'Makarna (Haşlama,100g)', kcal:158, protein:6,  fat:1,  carb:31 },
  { cat:'🍚 Pilav & Makarna', name:'Makarna (Bolonez, 1P)',  kcal:380, protein:18, fat:12, carb:48 },
  { cat:'🍚 Pilav & Makarna', name:'Fettuccine Alfredo (1P)',kcal:490, protein:15, fat:22, carb:58 },
  { cat:'🍚 Pilav & Makarna', name:'Tam Buğday Makarna (1P)',kcal:330, protein:12, fat:4,  carb:65 },
  { cat:'🍚 Pilav & Makarna', name:'İç Pilav (1P)',          kcal:320, protein:8,  fat:14, carb:42 },
  // 🥗 Sebze & Bakliyat
  { cat:'🥗 Sebze & Bakliyat', name:'Mercimek (100g)',       kcal:116, protein:9,  fat:0,  carb:20 },
  { cat:'🥗 Sebze & Bakliyat', name:'Nohut (100g)',          kcal:164, protein:9,  fat:3,  carb:27 },
  { cat:'🥗 Sebze & Bakliyat', name:'Kuru Fasulye (1P)',     kcal:200, protein:13, fat:2,  carb:35 },
  { cat:'🥗 Sebze & Bakliyat', name:'Zeytinyağlı Fasulye',  kcal:180, protein:6,  fat:8,  carb:22 },
  { cat:'🥗 Sebze & Bakliyat', name:'İmam Bayıldı (1P)',     kcal:220, protein:3,  fat:14, carb:22 },
  { cat:'🥗 Sebze & Bakliyat', name:'Salata (Büyük)',        kcal:80,  protein:2,  fat:4,  carb:10 },
  { cat:'🥗 Sebze & Bakliyat', name:'Çoban Salatası (1P)',   kcal:95,  protein:2,  fat:6,  carb:10 },
  { cat:'🥗 Sebze & Bakliyat', name:'Mevsim Salatası (1P)',  kcal:70,  protein:2,  fat:3,  carb:9  },
  { cat:'🥗 Sebze & Bakliyat', name:'Tabule (100g)',         kcal:140, protein:4,  fat:6,  carb:19 },
  { cat:'🥗 Sebze & Bakliyat', name:'Haydari (100g)',        kcal:110, protein:5,  fat:8,  carb:6  },
  { cat:'🥗 Sebze & Bakliyat', name:'Cacık (100g)',          kcal:60,  protein:3,  fat:3,  carb:5  },
  { cat:'🥗 Sebze & Bakliyat', name:'Zeytinyağlı Enginar',  kcal:160, protein:4,  fat:10, carb:15 },
  { cat:'🥗 Sebze & Bakliyat', name:'Ispanak Yemeği (1P)',   kcal:140, protein:5,  fat:8,  carb:12 },
  { cat:'🥗 Sebze & Bakliyat', name:'Türlü (1P)',            kcal:175, protein:4,  fat:9,  carb:20 },
  { cat:'🥗 Sebze & Bakliyat', name:'Karnıyarık (1P)',       kcal:320, protein:14, fat:20, carb:22 },
  // 🥐 Börek & Hamur
  { cat:'🥐 Börek & Hamur', name:'Su Böreği (1 dilim)',      kcal:280, protein:10, fat:14, carb:30 },
  { cat:'🥐 Börek & Hamur', name:'Peynirli Börek (1)',       kcal:220, protein:8,  fat:12, carb:22 },
  { cat:'🥐 Börek & Hamur', name:'Kıymalı Börek (1)',        kcal:250, protein:10, fat:14, carb:24 },
  { cat:'🥐 Börek & Hamur', name:'Ispanaklı Börek (1)',      kcal:200, protein:7,  fat:10, carb:22 },
  { cat:'🥐 Börek & Hamur', name:'Simit (1 adet)',           kcal:280, protein:8,  fat:4,  carb:56 },
  { cat:'🥐 Börek & Hamur', name:'Poğaça (Peynirli)',        kcal:300, protein:9,  fat:15, carb:34 },
  { cat:'🥐 Börek & Hamur', name:'Poğaça (Zeytinli)',        kcal:280, protein:7,  fat:13, carb:34 },
  { cat:'🥐 Börek & Hamur', name:'Tam Buğday Ekmeği (1)',    kcal:80,  protein:3,  fat:1,  carb:16 },
  { cat:'🥐 Börek & Hamur', name:'Beyaz Ekmek (1 dilim)',    kcal:90,  protein:3,  fat:1,  carb:18 },
  { cat:'🥐 Börek & Hamur', name:'Pide (100g)',              kcal:260, protein:8,  fat:3,  carb:52 },
  { cat:'🥐 Börek & Hamur', name:'Lahmacun (1 adet)',        kcal:190, protein:9,  fat:5,  carb:28 },
  { cat:'🥐 Börek & Hamur', name:'Pide (Kıymalı, 1P)',      kcal:480, protein:22, fat:16, carb:62 },
  // 🥛 Süt & Yumurta
  { cat:'🥛 Süt & Yumurta', name:'Yumurta (1, haşlama)',    kcal:78,  protein:6,  fat:5,  carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Sahanda Yumurta (2)',      kcal:185, protein:12, fat:15, carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Menemen (1P)',              kcal:220, protein:12, fat:14, carb:12 },
  { cat:'🥛 Süt & Yumurta', name:'Omlet (2 yumurtalı)',      kcal:200, protein:14, fat:15, carb:2  },
  { cat:'🥛 Süt & Yumurta', name:'Süt (200ml)',              kcal:122, protein:6,  fat:7,  carb:10 },
  { cat:'🥛 Süt & Yumurta', name:'Yoğurt (150g)',            kcal:90,  protein:8,  fat:3,  carb:8  },
  { cat:'🥛 Süt & Yumurta', name:'Süzme Yoğurt (150g)',      kcal:130, protein:13, fat:5,  carb:7  },
  { cat:'🥛 Süt & Yumurta', name:'Beyaz Peynir (50g)',       kcal:135, protein:8,  fat:11, carb:1  },
  { cat:'🥛 Süt & Yumurta', name:'Kaşar Peyniri (30g)',      kcal:110, protein:7,  fat:9,  carb:0  },
  { cat:'🥛 Süt & Yumurta', name:'Lor Peyniri (100g)',       kcal:105, protein:11, fat:6,  carb:3  },
  { cat:'🥛 Süt & Yumurta', name:'Kefir (200ml)',            kcal:100, protein:6,  fat:4,  carb:10 },
  { cat:'🥛 Süt & Yumurta', name:'Çökelek (100g)',           kcal:115, protein:14, fat:6,  carb:2  },
  // 🍎 Meyveler
  { cat:'🍎 Meyveler', name:'Elma (1 orta boy)',              kcal:80,  protein:0,  fat:0,  carb:21 },
  { cat:'🍎 Meyveler', name:'Muz (1 orta boy)',               kcal:105, protein:1,  fat:0,  carb:27 },
  { cat:'🍎 Meyveler', name:'Portakal (1 orta boy)',          kcal:62,  protein:1,  fat:0,  carb:15 },
  { cat:'🍎 Meyveler', name:'Çilek (100g)',                   kcal:32,  protein:1,  fat:0,  carb:8  },
  { cat:'🍎 Meyveler', name:'Karpuz (300g)',                  kcal:90,  protein:2,  fat:0,  carb:22 },
  { cat:'🍎 Meyveler', name:'Üzüm (100g)',                   kcal:69,  protein:1,  fat:0,  carb:18 },
  { cat:'🍎 Meyveler', name:'Armut (1 orta boy)',             kcal:101, protein:1,  fat:0,  carb:27 },
  { cat:'🍎 Meyveler', name:'Şeftali (1 orta boy)',           kcal:59,  protein:1,  fat:0,  carb:14 },
  { cat:'🍎 Meyveler', name:'Kiraz (100g)',                   kcal:63,  protein:1,  fat:0,  carb:16 },
  { cat:'🍎 Meyveler', name:'Kavun (200g)',                   kcal:68,  protein:2,  fat:0,  carb:16 },
  { cat:'🍎 Meyveler', name:'Greyfurt (1/2)',                 kcal:52,  protein:1,  fat:0,  carb:13 },
  { cat:'🍎 Meyveler', name:'Avokado (1/2)',                  kcal:161, protein:2,  fat:15, carb:9  },
  // 🍫 Atıştırmalık
  { cat:'🍫 Atıştırmalık', name:'Baklava (1 dilim)',          kcal:350, protein:5,  fat:18, carb:44 },
  { cat:'🍫 Atıştırmalık', name:'Kadayıf (1 dilim)',         kcal:330, protein:5,  fat:14, carb:46 },
  { cat:'🍫 Atıştırmalık', name:'Sütlaç (1 kase)',           kcal:200, protein:5,  fat:5,  carb:34 },
  { cat:'🍫 Atıştırmalık', name:'Kazandibi (1P)',             kcal:240, protein:6,  fat:7,  carb:38 },
  { cat:'🍫 Atıştırmalık', name:'Çikolata (Sütlü, 30g)',     kcal:160, protein:2,  fat:9,  carb:19 },
  { cat:'🍫 Atıştırmalık', name:'Çikolata (Bitter, 30g)',    kcal:155, protein:2,  fat:10, carb:16 },
  { cat:'🍫 Atıştırmalık', name:'Ceviz (30g)',                kcal:196, protein:5,  fat:20, carb:4  },
  { cat:'🍫 Atıştırmalık', name:'Badem (30g)',                kcal:173, protein:6,  fat:15, carb:6  },
  { cat:'🍫 Atıştırmalık', name:'Fıstık (30g)',               kcal:176, protein:7,  fat:15, carb:5  },
  { cat:'🍫 Atıştırmalık', name:'Fındık (30g)',               kcal:188, protein:4,  fat:18, carb:5  },
  { cat:'🍫 Atıştırmalık', name:'Kaju (30g)',                 kcal:157, protein:5,  fat:12, carb:9  },
  { cat:'🍫 Atıştırmalık', name:'Hurma (2 adet)',             kcal:133, protein:1,  fat:0,  carb:36 },
  // ☕ İçecekler
  { cat:'☕ İçecekler', name:'Türk Kahvesi (şekersiz)',        kcal:5,   protein:0,  fat:0,  carb:1  },
  { cat:'☕ İçecekler', name:'Çay (şekersiz)',                kcal:2,   protein:0,  fat:0,  carb:0  },
  { cat:'☕ İçecekler', name:'Ayran (200ml)',                  kcal:60,  protein:3,  fat:3,  carb:5  },
  { cat:'☕ İçecekler', name:'Protein Shake (1 ölçek)',        kcal:120, protein:25, fat:2,  carb:5  },
  { cat:'☕ İçecekler', name:'Taze Sıkılmış Portakal (200ml)',kcal:90,  protein:1,  fat:0,  carb:21 },
  { cat:'☕ İçecekler', name:'Limonata (200ml)',               kcal:80,  protein:0,  fat:0,  carb:21 },
  { cat:'☕ İçecekler', name:'Sade Soda (200ml)',              kcal:0,   protein:0,  fat:0,  carb:0  },
  { cat:'☕ İçecekler', name:'Salep (200ml)',                  kcal:180, protein:3,  fat:4,  carb:33 },
  { cat:'☕ İçecekler', name:'Latte (200ml)',                  kcal:120, protein:6,  fat:5,  carb:13 },
  { cat:'☕ İçecekler', name:'Smoothie (Meyve, 300ml)',       kcal:180, protein:2,  fat:1,  carb:42 },
  // 🌅 Kahvaltılık
  { cat:'🌅 Kahvaltılık', name:'Bal (20g)',                   kcal:61,  protein:0,  fat:0,  carb:17 },
  { cat:'🌅 Kahvaltılık', name:'Reçel (20g)',                 kcal:56,  protein:0,  fat:0,  carb:14 },
  { cat:'🌅 Kahvaltılık', name:'Tereyağı (10g)',              kcal:72,  protein:0,  fat:8,  carb:0  },
  { cat:'🌅 Kahvaltılık', name:'Tahin (20g)',                 kcal:119, protein:4,  fat:10, carb:4  },
  { cat:'🌅 Kahvaltılık', name:'Tahin-Pekmez (30g)',          kcal:105, protein:3,  fat:6,  carb:12 },
  { cat:'🌅 Kahvaltılık', name:'Zeytin (10 adet, ~30g)',      kcal:72,  protein:0,  fat:7,  carb:2  },
  { cat:'🌅 Kahvaltılık', name:'Domates (1 orta boy)',        kcal:22,  protein:1,  fat:0,  carb:5  },
  { cat:'🌅 Kahvaltılık', name:'Salatalık (1 orta boy)',      kcal:16,  protein:1,  fat:0,  carb:4  },
  { cat:'🌅 Kahvaltılık', name:'Granola (50g)',               kcal:220, protein:5,  fat:8,  carb:32 },
  { cat:'🌅 Kahvaltılık', name:'Yulaf Ezmesi (50g, sade)',    kcal:180, protein:6,  fat:3,  carb:32 },
  { cat:'🌅 Kahvaltılık', name:'Mısır Gevreği (40g)',         kcal:150, protein:3,  fat:1,  carb:33 },
  { cat:'🌅 Kahvaltılık', name:'Fıstık Ezmesi (20g)',         kcal:120, protein:5,  fat:10, carb:4  },
  { cat:'🌅 Kahvaltılık', name:'Cream Cheese (30g)',          kcal:99,  protein:2,  fat:10, carb:1  },
  { cat:'🌅 Kahvaltılık', name:'Sucuklu Yumurta (2 yumurta)',kcal:310, protein:18, fat:24, carb:2  },
  // 🍔 Fast Food
  { cat:'🍔 Fast Food', name:'Cheeseburger (1)',               kcal:535, protein:28, fat:28, carb:44 },
  { cat:'🍔 Fast Food', name:'Big Mac (1)',                    kcal:563, protein:26, fat:33, carb:45 },
  { cat:'🍔 Fast Food', name:'Whopper (1)',                    kcal:657, protein:28, fat:40, carb:49 },
  { cat:'🍔 Fast Food', name:'Patates Kızartması (Orta)',      kcal:337, protein:4,  fat:16, carb:44 },
  { cat:'🍔 Fast Food', name:'Tavuk Burger (1)',               kcal:490, protein:27, fat:22, carb:46 },
  { cat:'🍔 Fast Food', name:'Pizza (Margarita, 2 dilim)',     kcal:540, protein:22, fat:18, carb:72 },
  { cat:'🍔 Fast Food', name:'Pizza (Pepperoni, 2 dilim)',     kcal:620, protein:26, fat:26, carb:72 },
  { cat:'🍔 Fast Food', name:'Hot Dog (1)',                    kcal:290, protein:11, fat:17, carb:24 },
  { cat:'🍔 Fast Food', name:'Wrap Tavuk (1)',                 kcal:420, protein:24, fat:16, carb:46 },
  { cat:'🍔 Fast Food', name:'Dürüm Döner (1)',                kcal:480, protein:24, fat:18, carb:54 },
  { cat:'🍔 Fast Food', name:'Iskender (1P)',                  kcal:650, protein:30, fat:35, carb:52 },
  { cat:'🍔 Fast Food', name:'Kokoreç (100g)',                 kcal:270, protein:20, fat:18, carb:8  },
  { cat:'🍔 Fast Food', name:'Midye Dolma (5 adet)',           kcal:250, protein:9,  fat:6,  carb:40 },
  { cat:'🍔 Fast Food', name:'Tantuni (1P)',                   kcal:380, protein:22, fat:14, carb:42 },
  // 💪 Spor Beslenmesi
  { cat:'💪 Spor Beslenmesi', name:'Whey Protein (1 ölçek)',  kcal:120, protein:25, fat:2,  carb:3  },
  { cat:'💪 Spor Beslenmesi', name:'Kazein Protein (1 ölçek)',kcal:130, protein:26, fat:2,  carb:5  },
  { cat:'💪 Spor Beslenmesi', name:'Mass Gainer (1 ölçek)',   kcal:400, protein:30, fat:5,  carb:60 },
  { cat:'💪 Spor Beslenmesi', name:'BCAA (1 porsiyon)',       kcal:20,  protein:5,  fat:0,  carb:0  },
  { cat:'💪 Spor Beslenmesi', name:'Kreatin (5g)',             kcal:0,   protein:0,  fat:0,  carb:0  },
  { cat:'💪 Spor Beslenmesi', name:'Enerji Barı (1 adet)',    kcal:250, protein:12, fat:8,  carb:32 },
  { cat:'💪 Spor Beslenmesi', name:'Protein Barı (1 adet)',   kcal:200, protein:20, fat:7,  carb:18 },
  { cat:'💪 Spor Beslenmesi', name:'Sporcu İçeceği (500ml)',  kcal:140, protein:0,  fat:0,  carb:35 },
  { cat:'💪 Spor Beslenmesi', name:'Pre-Workout (1 servis)',  kcal:30,  protein:2,  fat:0,  carb:5  },
  { cat:'💪 Spor Beslenmesi', name:'Yulaf (50g, sade)',       kcal:180, protein:6,  fat:3,  carb:32 },
  { cat:'💪 Spor Beslenmesi', name:'Pirinç Pilavı + Tavuk',  kcal:420, protein:38, fat:8,  carb:46 },
  { cat:'💪 Spor Beslenmesi', name:'Yumurta Beyazı (3 adet)',kcal:51,  protein:11, fat:0,  carb:1  },
  { cat:'💪 Spor Beslenmesi', name:'Cottage Cheese (100g)',   kcal:98,  protein:11, fat:4,  carb:3  },
  { cat:'💪 Spor Beslenmesi', name:'Greek Yoğurt (150g)',     kcal:130, protein:17, fat:3,  carb:8  },
  { cat:'💪 Spor Beslenmesi', name:'Kinoa (100g, haşlama)',   kcal:120, protein:4,  fat:2,  carb:22 },
]

function getFoodTags(food) {
  const tags = []
  if (food.protein >= 20)                      tags.push({ label:'💪 Yüksek Protein', color:'#47c8ff' })
  else if (food.protein >= 10)                 tags.push({ label:'🥩 Orta Protein',   color:'#47c8ffaa' })
  if (food.carb >= 30)                         tags.push({ label:'🌾 Karbonhidrat',   color:'#47ff8a' })
  else if (food.carb <= 5 && food.fat >= 10)   tags.push({ label:'🥑 Yağ Kaynağı',   color:'#ff8c47' })
  if (food.kcal <= 100)                        tags.push({ label:'🥗 Düşük Kalori',  color:'var(--accent)' })
  else if (food.kcal >= 300)                   tags.push({ label:'⚡ Yüksek Kalori', color:'#ff4747' })
  if (food.protein >= 15 && food.carb <= 5 && food.fat <= 5) tags.push({ label:'🏆 Diyet Dostu', color:'var(--accent)' })
  return tags
}

const WATER_GOAL = 2500

export default function CaloriePage() {
  const {
    foods, saveFoods, calArch, saveCalArchive, showToast, genId, todayKey, viewingDate,
    goals, water, saveWater, favFoods, saveFavFood, isFavFood,
    checkMacroXP,
  } = useApp()

  const isToday   = viewingDate === todayKey()
  const viewFoods = isToday ? foods : (calArch[viewingDate] || [])

  // Sekme state
  const [mainTab, setMainTab] = useState('today') // today | history | goals
  const [addTab,  setAddTab]  = useState('db')
  const [isAdding, setIsAdding] = useState(false)

  // DB state
  const [dbSearch,   setDbSearch]   = useState('')
  const [dbCat,      setDbCat]      = useState('Tümü')
  const [dbSelected, setDbSelected] = useState(null)
  const [dbGram,     setDbGram]     = useState('100')

  // Photo state
  const [imgB64,     setImgB64]     = useState(null)
  const [imgMime,    setImgMime]    = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [status,     setStatus]     = useState(null)
  const [modelChips, setModelChips] = useState([])
  const [resultData, setResultData] = useState(null)
  const [analyzing,  setAnalyzing]  = useState(false)

  // Barkod / etiket state
  const [labelImg,     setLabelImg]     = useState(null)
  const [labelMime,    setLabelMime]    = useState(null)
  const [labelPreview, setLabelPreview] = useState(null)
  const [labelStatus,  setLabelStatus]  = useState(null)
  const [labelResult,  setLabelResult]  = useState(null)
  const [labelLoading, setLabelLoading] = useState(false)
  const [labelGram,    setLabelGram]    = useState('100')

  // Manuel form
  const [mf, setMf] = useState({ name:'', kcal:'', protein:'', fat:'', carb:'' })

  // Grafik
  const [chartRange, setChartRange] = useState(7)
  const calChartRef  = useRef(null)
  const calChartInst = useRef(null)

  const fileRef      = useRef()
  const labelFileRef = useRef()

  // ── Totals ──
  const totals = (arr) => arr.reduce((t,f) => ({
    kcal:    t.kcal    + (+f.kcal    || 0),
    protein: t.protein + (+f.protein || 0),
    fat:     t.fat     + (+f.fat     || 0),
    carb:    t.carb    + (+f.carb    || 0),
  }), { kcal:0, protein:0, fat:0, carb:0 })

  const tot  = totals(viewFoods)
  const yest = () => {
    const d = new Date(); d.setDate(d.getDate()-1)
    return totals(calArch[d.toISOString().slice(0,10)] || [])
  }
  const yTot = isToday ? yest() : { kcal:0, protein:0, fat:0, carb:0 }

  // ── Makro XP kontrolü ──
  useEffect(() => {
    if (isToday && foods.length > 0) checkMacroXP(tot, goals)
  }, [foods.length])

  // ── Kalori grafiği ──
  useEffect(() => {
    if (mainTab !== 'history' || !calChartRef.current) return
    const labels=[], values=[], goalLine=[]
    for (let i=chartRange-1; i>=0; i--) {
      const d=new Date(); d.setDate(d.getDate()-i)
      const dk=d.toISOString().slice(0,10)
      labels.push(d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}))
      const fs=dk===todayKey()?foods:(calArch[dk]||[])
      values.push(Math.round(fs.reduce((s,f)=>s+(+f.kcal||0),0)))
      goalLine.push(goals.kcal)
    }
    if (calChartInst.current) calChartInst.current.destroy()
    calChartInst.current = new Chart(calChartRef.current, {
      type:'bar',
      data:{
        labels,
        datasets:[
          { label:'Kalori', data:values, backgroundColor:'rgba(232,255,71,.45)', borderColor:'#e8ff47', borderWidth:1, borderRadius:4 },
          { label:'Hedef',  data:goalLine, type:'line', borderColor:'rgba(255,71,71,.6)', borderWidth:1.5, borderDash:[4,4], pointRadius:0, fill:false },
        ],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ grid:{ color:'rgba(255,255,255,.05)' }, ticks:{ color:'#666', font:{ size:10 } } },
          y:{ grid:{ color:'rgba(255,255,255,.05)' }, ticks:{ color:'#666', font:{ size:10 } } },
        },
      },
    })
    return () => calChartInst.current?.destroy()
  }, [mainTab, chartRange, foods, calArch, goals])

  // ── DB helpers ──
  const cats     = ['Tümü', ...Array.from(new Set(FOOD_DB.map(f => f.cat)))]
  const filtered = FOOD_DB.filter(f => {
    const matchCat    = dbCat === 'Tümü' || f.cat === dbCat
    const matchSearch = f.name.toLowerCase().includes(dbSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const scaledFood = (food, gram) => {
    const ratio = (+gram || 100) / 100
    return {
      name:    food.name + (gram !== '100' ? ` (${gram}g)` : ''),
      kcal:    Math.round(food.kcal    * ratio),
      protein: Math.round(food.protein * ratio),
      fat:     Math.round(food.fat     * ratio),
      carb:    Math.round(food.carb    * ratio),
    }
  }

  const addFromDb = () => {
    if (!dbSelected) return
    const scaled = scaledFood(dbSelected, dbGram)
    saveFoods([...foods, { id:genId(), ...scaled }])
    showToast(`${scaled.name} eklendi ✓`)
    setDbSelected(null); setDbGram('100')
  }

  // ── Fotoğraf analizi ──
  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setImgB64(d.split(',')[1]); setImgMime(file.type)
      setPreview(d); setStatus(null); setResultData(null); setModelChips([])
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!imgB64) return
    setAnalyzing(true); setResultData(null)
    const prompt = `Analyze this image STRICTLY. Does it show food, a meal, a drink, or an edible item?
IMPORTANT: If not food/drink, respond with is_food: false.
Respond with ONLY valid JSON:
{"is_food":true,"food_name":"Tavuk Göğsü","kcal":250,"protein":45,"fat":5,"carb":0}
OR: {"is_food":false,"food_name":"","kcal":0,"protein":0,"fat":0,"carb":0}
Rules: food_name in Turkish, integers, estimate for visible portion, no markdown.`

    let res = null, usedModel = null
    const chips = FOOD_MODELS.map(m => ({ model:m, state:'pending' }))
    setModelChips([...chips])
    for (const model of FOOD_MODELS) {
      setModelChips(c => c.map(ch => ch.model===model?{...ch,state:'trying'}:ch))
      setStatus({ type:'analyzing', title:'Analiz Ediliyor', sub:`Model: ${model}` })
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ contents:[{parts:[{text:prompt},{inline_data:{mime_type:imgMime,data:imgB64}}]}], generationConfig:{temperature:.1,maxOutputTokens:256} }) })
        if (res.ok) { usedModel=model; setModelChips(c=>c.map(ch=>ch.model===model?{...ch,state:'ok'}:ch)); break }
        res=null; setModelChips(c=>c.map(ch=>ch.model===model?{...ch,state:'fail'}:ch))
      } catch { res=null; setModelChips(c=>c.map(ch=>ch.model===model?{...ch,state:'fail'}:ch)) }
    }
    setModelChips(c=>c.map(ch=>ch.state==='pending'?{...ch,state:'fail'}:ch))
    if (!res) { setStatus({type:'error',title:'⚠️ API Hatası',sub:'Tüm modeller başarısız.'}); setAnalyzing(false); return }
    const data = await res.json()
    let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
    let parsed=null; try{parsed=JSON.parse(raw)}catch{const m=raw.match(/\{[\s\S]*\}/);try{parsed=m?JSON.parse(m[0]):null}catch{}}
    if (!parsed?.is_food) setStatus({type:'error',title:'❌ Yemek Değil',sub:'Fotoğrafta yiyecek/içecek tespit edilemedi.'})
    else { setStatus({type:'success',title:`✅ ${parsed.food_name}`,sub:`· ${usedModel}`}); setResultData(parsed) }
    setAnalyzing(false)
  }

  const addFromResult = () => {
    if (!resultData) return
    saveFoods([...foods, {id:genId(),name:resultData.food_name,kcal:resultData.kcal,protein:resultData.protein,fat:resultData.fat,carb:resultData.carb}])
    setPreview(null); setImgB64(null); setStatus(null); setResultData(null); setModelChips([])
    showToast(`${resultData.food_name} eklendi ✓`)
  }

  // ── Etiket okuma ──
  const handleLabelFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const d = ev.target.result
      setLabelImg(d.split(',')[1]); setLabelMime(file.type)
      setLabelPreview(d); setLabelStatus(null); setLabelResult(null)
    }
    reader.readAsDataURL(file)
  }

  const analyzeLabel = async () => {
    if (!labelImg) return
    setLabelLoading(true); setLabelResult(null)
    setLabelStatus({type:'analyzing', title:'Etiket Okunuyor', sub:'AI besin değerlerini tespit ediyor...'})

    const prompt = `Bu görsele bak. Bir gıda ürününün besin değerleri etiketi, ambalajı veya barkodu olabilir.
Görseldeki ürünün besin değerlerini oku ve JSON formatında döndür.
Eğer besin değerleri tablosu varsa o tablodan oku.
Eğer sadece ürün ambalajı görünüyorsa, ürün adından tahmin et.
Eğer hiç gıda/ürün görseli değilse is_product: false döndür.
SADECE JSON döndür:
{"is_product":true,"product_name":"Ürün Adı","serving_g":100,"kcal":250,"protein":10,"fat":8,"carb":35}
veya: {"is_product":false}
Kurallar: Türkçe isim, tamsayılar, 100g için değerler tercih et.`

    const LABEL_MODELS = ['gemini-3.1-flash-lite-preview','gemini-2.5-flash','gemini-2.0-flash','gemini-1.5-flash']
    let parsed = null
    for (const model of LABEL_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
          { method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ contents:[{parts:[{text:prompt},{inline_data:{mime_type:labelMime,data:labelImg}}]}], generationConfig:{temperature:.1,maxOutputTokens:512} }) }
        )
        if (!res.ok) continue
        const data = await res.json()
        let raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
        try{parsed=JSON.parse(raw)}catch{const m=raw.match(/\{[\s\S]*\}/);try{parsed=m?JSON.parse(m[0]):null}catch{}}
        if (parsed) break
      } catch { continue }
    }

    if (!parsed?.is_product) {
      setLabelStatus({type:'error', title:'❌ Ürün Bulunamadı', sub:'Görselde gıda etiketi veya ürün tespit edilemedi.'})
    } else {
      setLabelStatus({type:'success', title:`✅ ${parsed.product_name}`, sub:`${parsed.serving_g||100}g için besin değerleri okundu`})
      setLabelResult(parsed)
      setLabelGram(String(parsed.serving_g || 100))
    }
    setLabelLoading(false)
  }

  const addFromLabel = () => {
    if (!labelResult) return
    const ratio = (+labelGram||100) / (labelResult.serving_g||100)
    const entry = {
      id: genId(),
      name: labelResult.product_name + (labelGram !== String(labelResult.serving_g||100) ? ` (${labelGram}g)` : ''),
      kcal:    Math.round(labelResult.kcal    * ratio),
      protein: Math.round(labelResult.protein * ratio),
      fat:     Math.round(labelResult.fat     * ratio),
      carb:    Math.round(labelResult.carb    * ratio),
    }
    saveFoods([...foods, entry])
    showToast(`${entry.name} eklendi ✓`)
    setLabelPreview(null); setLabelImg(null); setLabelStatus(null); setLabelResult(null)
  }

  const addManual = () => {
    if (!mf.name.trim()) return showToast('Yemek adı girin!', 'error')
    saveFoods([...foods, { id:genId(), name:mf.name, kcal:+mf.kcal||0, protein:+mf.protein||0, fat:+mf.fat||0, carb:+mf.carb||0 }])
    setMf({ name:'', kcal:'', protein:'', fat:'', carb:'' })
    showToast(`${mf.name} eklendi ✓`)
  }

  // ── Favori ekle/kaldır ──
  const addFromFav = (food) => {
    saveFoods([...foods, { id:genId(), name:food.name, kcal:food.kcal, protein:food.protein, fat:food.fat, carb:food.carb }])
    showToast(`${food.name} eklendi ✓`)
  }

  // ── Chip helper ──
  const chipStyle = (state) => {
    const base = { fontFamily:'Space Mono,monospace', fontSize:10, padding:'3px 9px', borderRadius:20, border:'1px solid var(--border)' }
    if (state==='ok')     return {...base, color:'var(--green)', borderColor:'rgba(71,255,138,.3)', background:'rgba(71,255,138,.07)'}
    if (state==='fail')   return {...base, color:'var(--red)',   borderColor:'rgba(255,71,71,.2)',  background:'rgba(255,71,71,.05)', textDecoration:'line-through'}
    if (state==='trying') return {...base, color:'var(--blue)',  borderColor:'rgba(71,200,255,.3)', background:'rgba(71,200,255,.07)'}
    return {...base, color:'var(--text-muted)', background:'var(--surface2)'}
  }

  const tabBtn = (id, icon, label) => (
    <button key={id} onClick={()=>setAddTab(id)} style={{
      flex:1, padding:'9px 4px', borderRadius:8, border:'none', cursor:'pointer',
      fontFamily:'Bebas Neue,sans-serif', fontSize:11, letterSpacing:1,
      background: addTab===id ? 'var(--accent)' : 'var(--surface2)',
      color: addTab===id ? '#0a0a0a' : 'var(--text-muted)',
      transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
    }}>{icon} {label}</button>
  )

  const macros = [
    { key:'kcal',    label:'KALORİ',       unit:'kcal', color:'var(--accent)' },
    { key:'protein', label:'PROTEİN',      unit:'g',    color:'#47c8ff' },
    { key:'fat',     label:'YAĞ',          unit:'g',    color:'#ff8c47' },
    { key:'carb',    label:'KARBONHİDRAT', unit:'g',    color:'#47ff8a' },
  ]

  const waterPct = Math.min(100, Math.round((water / WATER_GOAL) * 100))

  // ── Ana sekmeler ──
  const mainTabs = [
    { id:'today',   label:'📋 BUGÜN'   },
    { id:'goals',   label:'🎯 HEDEFLER'},
    { id:'history', label:'📊 GEÇMİŞ' },
  ]

  return (
    <div className="page">

      {/* Geçmiş gün banner */}
      {!isToday && (
        <div style={{ display:'flex',alignItems:'center',gap:12,background:'rgba(71,200,255,.06)',border:'1px solid rgba(71,200,255,.2)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'var(--blue)',fontFamily:'Space Mono,monospace' }}>
          📅 {new Date(viewingDate+'T00:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})} — Salt Okunur
        </div>
      )}

      {/* Makro özet kartları */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {macros.map(({ key, label, unit, color }) => {
          const cur  = Math.round(tot[key])
          const yv   = yTot[key]
          const diff = Math.round(cur - yv)
          const dir  = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
          return (
            <div key={key} className="card" style={{ padding:16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:cur>0?color:'transparent', transform:cur>0?'scaleX(1)':'scaleX(0)', transition:'transform .4s', transformOrigin:'left' }}/>
              <div style={{ fontSize:10, letterSpacing:2, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:6, fontFamily:'Space Mono,monospace' }}>{label}</div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:34, lineHeight:1 }}>
                {cur} <span style={{ fontSize:13, color:'var(--text-muted)' }}>{unit}</span>
              </div>
              {isToday && yv > 0 && (
                <div style={{ marginTop:4 }}>
                  <span className={`delta delta-${dir}`} style={{ fontSize:10, padding:'2px 7px' }}>
                    {dir==='up'?'↑':dir==='down'?'↓':'='} {diff!==0?(diff>0?'+':'')+diff+' '+unit:'aynı'} <span style={{opacity:.5}}>dünden</span>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ana sekmeler */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'var(--surface2)', borderRadius:10, padding:4 }}>
        {mainTabs.map(t => (
          <button key={t.id} onClick={()=>setMainTab(t.id)} style={{
            flex:1, padding:'9px 4px', borderRadius:8, border:'none', cursor:'pointer',
            fontFamily:'Bebas Neue,sans-serif', fontSize:11, letterSpacing:1,
            background: mainTab===t.id ? 'var(--accent)' : 'transparent',
            color: mainTab===t.id ? '#0a0a0a' : 'var(--text-muted)',
            transition:'all .2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ BUGÜN SEKMESİ ══ */}
      {mainTab === 'today' && (
        <div className="animate-fade">
          {/* Favori yemekler */}
          {isToday && favFoods.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, color:'var(--text-muted)', letterSpacing:1, marginBottom:10 }}>
                ⭐ FAVORİLER
              </div>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6, scrollbarWidth:'none' }}>
                {favFoods.slice(0, 10).map((food, i) => (
                  <button key={i} onClick={() => addFromFav(food)} style={{
                    flexShrink:0, padding:'8px 12px', borderRadius:10,
                    border:'1px solid rgba(255,215,0,.2)', background:'rgba(255,215,0,.06)',
                    cursor:'pointer', textAlign:'left',
                  }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:1, color:'var(--text)', whiteSpace:'nowrap', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>{food.name}</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--accent)', marginTop:2 }}>{food.kcal} kcal</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Yenilen yemekler */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, color:'var(--text-muted)', letterSpacing:1, marginBottom:12 }}>
              {isToday ? 'BUGÜN YENİLENLER' : 'O GÜN YENİLENLER'}
            </div>
            {viewFoods.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', border:'1px dashed var(--border)', borderRadius:12, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', fontSize:11 }}>
                Henüz bir şey eklemedin.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {viewFoods.map(food => (
                  <div key={food.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface2)', padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:1, color:'var(--text)' }}>{food.name}</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>
                        <span style={{color:'var(--accent)'}}>{food.kcal} kcal</span> · <span style={{color:'#47c8ff'}}>{food.protein}g P</span> · <span style={{color:'#ff8c47'}}>{food.fat}g Y</span> · <span style={{color:'#47ff8a'}}>{food.carb}g K</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      {isToday && (
                        <>
                          <button
                            onClick={() => { const dbFood = FOOD_DB.find(f=>f.name===food.name)||food; saveFavFood(dbFood); showToast(isFavFood(food.name)?'Favoriden kaldırıldı':'Favorilere eklendi ⭐') }}
                            style={{ background:'none', border:'none', fontSize:14, cursor:'pointer', opacity: isFavFood(food.name) ? 1 : 0.35, transition:'opacity .2s' }}
                            title={isFavFood(food.name) ? 'Favoriden kaldır' : 'Favorilere ekle'}
                          >⭐</button>
                          <button onClick={() => saveFoods(foods.filter(f => f.id !== food.id))} style={{ background:'none', border:'none', color:'var(--red)', fontSize:16, cursor:'pointer', padding:'4px' }}>✕</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Yemek ekle butonu */}
          {isToday && !isAdding && (
            <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ width:'100%', padding:'14px', borderRadius:12, fontSize:14 }}>
              ➕ YENİ YEMEK EKLE
            </button>
          )}

          {isToday && isAdding && (
            <div className="animate-fade" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'16px', position:'relative', marginBottom:24 }}>
              <button onClick={() => setIsAdding(false)} style={{ position:'absolute', top:12, right:12, background:'var(--surface2)', border:'none', color:'var(--text)', width:28, height:28, borderRadius:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:1, marginBottom:16, color:'var(--accent)' }}>YEMEK EKLE</div>

              <div style={{ display:'flex', gap:6, marginBottom:20, background:'var(--surface2)', borderRadius:10, padding:4 }}>
                {tabBtn('db',     '🗄️', 'VERİTABANI')}
                {tabBtn('photo',  '📷', 'FOTOĞRAF')}
                {tabBtn('label',  '🏷️', 'ETİKET')}
                {tabBtn('manual', '✏️', 'MANUEL')}
              </div>

              {/* VERİTABANI */}
              {addTab === 'db' && (
                <div className="animate-fade">
                  <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                    <input type="text" placeholder="🔍  Yemek ara... (Tavuk, Pilav, Baklava...)" value={dbSearch} onChange={e=>{setDbSearch(e.target.value);setDbSelected(null)}} />
                  </div>
                  <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6, marginBottom:14, scrollbarWidth:'none' }}>
                    {cats.map(cat=>(
                      <button key={cat} onClick={()=>{setDbCat(cat);setDbSelected(null)}} style={{ padding:'5px 12px',borderRadius:20,border:'1px solid var(--border)',background:dbCat===cat?'var(--accent)':'var(--surface2)',color:dbCat===cat?'#0a0a0a':'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:10,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0 }}>{cat}</button>
                    ))}
                  </div>
                  {dbSelected && (
                    <div className="animate-fade" style={{ background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.2)',borderRadius:14,padding:'16px 18px',marginBottom:16 }}>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                        <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:2,color:'var(--accent)' }}>{dbSelected.name}</div>
                        <button onClick={()=>setDbSelected(null)} style={{ background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:16 }}>✕</button>
                      </div>
                      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:12 }}>
                        {getFoodTags(dbSelected).map(tag=>(
                          <span key={tag.label} style={{ fontFamily:'Space Mono,monospace',fontSize:10,background:`${tag.color}18`,border:`1px solid ${tag.color}44`,borderRadius:20,padding:'3px 10px',color:tag.color }}>{tag.label}</span>
                        ))}
                      </div>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14 }}>
                        {[{val:dbSelected.kcal,lbl:'KCAL',col:'var(--accent)'},{val:`${dbSelected.protein}g`,lbl:'PROTEİN',col:'#47c8ff'},{val:`${dbSelected.fat}g`,lbl:'YAĞ',col:'#ff8c47'},{val:`${dbSelected.carb}g`,lbl:'KARB',col:'#47ff8a'}].map(({val,lbl,col})=>(
                          <div key={lbl} style={{ background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',textAlign:'center' }}>
                            <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:col }}>{val}</div>
                            <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',letterSpacing:1,marginTop:2 }}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',marginBottom:12 }}>↑ 100g için değerler</div>
                      <div style={{ display:'flex',gap:8,alignItems:'flex-end' }}>
                        <div className="form-group" style={{ flex:1 }}>
                          <span className="flabel">Miktar (gram)</span>
                          <input type="number" value={dbGram} onChange={e=>setDbGram(e.target.value)} min="1" max="2000" style={{ maxWidth:120 }}/>
                        </div>
                        <div style={{ display:'flex',gap:6 }}>
                          {['50','100','150','200'].map(g=>(
                            <button key={g} onClick={()=>setDbGram(g)} style={{ padding:'8px 10px',borderRadius:8,border:'1px solid var(--border)',background:dbGram===g?'var(--accent)':'var(--surface2)',color:dbGram===g?'#0a0a0a':'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:11,cursor:'pointer' }}>{g}g</button>
                          ))}
                        </div>
                      </div>
                      {dbGram && +dbGram!==100 && (
                        <div style={{ marginTop:10,padding:'8px 12px',background:'var(--surface2)',borderRadius:8,fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)' }}>
                          {dbGram}g: <b style={{color:'var(--accent)'}}>{Math.round(dbSelected.kcal*+dbGram/100)}kcal</b> · <b style={{color:'#47c8ff'}}>{Math.round(dbSelected.protein*+dbGram/100)}g P</b> · <b style={{color:'#ff8c47'}}>{Math.round(dbSelected.fat*+dbGram/100)}g Y</b> · <b style={{color:'#47ff8a'}}>{Math.round(dbSelected.carb*+dbGram/100)}g K</b>
                        </div>
                      )}
                      <button className="btn btn-primary" style={{ width:'100%',marginTop:12 }} onClick={addFromDb}>✓ Listeye Ekle</button>
                    </div>
                  )}
                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    {filtered.length===0&&<div style={{ textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:12 }}>"{dbSearch}" için sonuç bulunamadı</div>}
                    {filtered.map((food,i)=>{
                      const isSelected = dbSelected?.name===food.name
                      return (
                        <div key={i} onClick={()=>{setDbSelected(food);setDbGram('100')}}
                          style={{ background:isSelected?'rgba(255,255,255,.06)':'var(--surface)',border:`1px solid ${isSelected?'rgba(255,255,255,.25)':'var(--border)'}`,borderRadius:10,padding:'11px 14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all .15s',gap:12 }}
                          onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.borderColor='#333'}}
                          onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.borderColor='var(--border)'}}>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:14,letterSpacing:1,marginBottom:4 }}>{food.name}</div>
                            <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                              {getFoodTags(food).map(tag=><span key={tag.label} style={{ fontFamily:'Space Mono,monospace',fontSize:9,color:tag.color,opacity:.85 }}>{tag.label}</span>)}
                            </div>
                          </div>
                          <div style={{ display:'flex',gap:8,flexShrink:0 }}>
                            {[{val:food.kcal,u:'kcal',c:'var(--accent)'},{val:`${food.protein}g`,u:'P',c:'#47c8ff'},{val:`${food.carb}g`,u:'K',c:'#47ff8a'}].map(({val,u,c})=>(
                              <span key={u} style={{ fontFamily:'Space Mono,monospace',fontSize:10,padding:'2px 7px',borderRadius:20,border:'1px solid rgba(255,255,255,.07)',color:c }}>{u} {val}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* FOTOĞRAF */}
              {addTab === 'photo' && (
                <div className="animate-fade">
                  <input type="file" ref={fileRef} accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
                  <div onClick={()=>fileRef.current.click()} style={{ border:'2px dashed var(--border)',borderRadius:14,padding:preview?0:'32px 24px',textAlign:'center',cursor:'pointer',transition:'all .2s',background:'var(--surface)',marginBottom:16,overflow:'hidden' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='rgba(255,255,255,.02)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface)'}}>
                    {preview
                      ?<img src={preview} alt="preview" style={{width:'100%',maxHeight:220,objectFit:'cover',display:'block',borderRadius:12}} onClick={e=>e.stopPropagation()}/>
                      :<><div style={{fontSize:36,marginBottom:10,opacity:.5}}>🍽️</div><div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:2,marginBottom:4}}>YEMEĞİN FOTOĞRAFINI YÜKLE</div><div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'Space Mono,monospace'}}>Tıkla veya sürükle · JPG / PNG / WEBP</div></>
                    }
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8,marginBottom:16 }}>
                    <button className="btn btn-primary" onClick={analyze} disabled={!imgB64||analyzing} style={{ padding:'12px 30px',opacity:(!imgB64||analyzing)?.4:1,cursor:(!imgB64||analyzing)?'not-allowed':'pointer' }}>
                      {analyzing&&<span className="spinner" style={{width:16,height:16,borderTopColor:'#0a0a0a',marginRight:8}}/>}🔍 Besin Değerlerini Hesapla
                    </button>
                    {modelChips.length>0&&<div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>{modelChips.map(({model,state})=><span key={model} style={chipStyle(state)}>{model}</span>)}</div>}
                  </div>
                  {status&&(
                    <div className="animate-fade" style={{ background:'var(--surface)',border:`1px solid ${status.type==='success'?'rgba(71,255,138,.25)':status.type==='error'?'rgba(255,71,71,.25)':'rgba(71,200,255,.25)'}`,borderRadius:12,padding:'16px 18px',marginBottom:18,display:'flex',alignItems:'center',gap:12 }}>
                      {status.type==='analyzing'&&<span className="spinner"/>}{status.type==='success'&&<span style={{fontSize:20}}>✅</span>}{status.type==='error'&&<span style={{fontSize:20}}>❌</span>}
                      <div><div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:17,letterSpacing:1,marginBottom:2}}>{status.title}</div><div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'Space Mono,monospace'}}>{status.sub}</div></div>
                    </div>
                  )}
                  {resultData&&(
                    <div className="animate-fade" style={{ background:'var(--surface2)',border:'1px solid rgba(255,255,255,.2)',borderRadius:12,padding:'16px 18px',marginBottom:16 }}>
                      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,letterSpacing:1.5,marginBottom:12,color:'var(--accent)'}}>{resultData.food_name}</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
                        {[{val:resultData.kcal,lbl:'KCAL',col:'var(--accent)'},{val:`${resultData.protein}g`,lbl:'PROTEİN',col:'#47c8ff'},{val:`${resultData.fat}g`,lbl:'YAĞ',col:'#ff8c47'},{val:`${resultData.carb}g`,lbl:'KARB',col:'#47ff8a'}].map(({val,lbl,col})=>(
                          <div key={lbl} style={{background:'var(--surface3)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
                            <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:col}}>{val}</div>
                            <div style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',letterSpacing:1,marginTop:2}}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-primary" style={{flex:1}} onClick={addFromResult}>✓ Listeye Ekle</button>
                        <button className="btn btn-ghost" onClick={()=>setResultData(null)}>İptal</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ETİKET */}
              {addTab === 'label' && (
                <div className="animate-fade">
                  <p style={{ fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)',marginBottom:16,lineHeight:1.7 }}>
                    Ürün ambalajı, besin değerleri etiketi veya barkodunun fotoğrafını yükle — AI besin değerlerini okur ve listene ekler.
                  </p>
                  <input type="file" ref={labelFileRef} accept="image/*" style={{display:'none'}} onChange={e=>handleLabelFile(e.target.files[0])}/>
                  <div onClick={()=>labelFileRef.current.click()} style={{ border:'2px dashed var(--border)',borderRadius:14,padding:labelPreview?0:'32px 24px',textAlign:'center',cursor:'pointer',transition:'all .2s',background:'var(--surface)',marginBottom:16,overflow:'hidden' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--blue)';e.currentTarget.style.background='rgba(71,200,255,.02)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--surface)'}}>
                    {labelPreview
                      ?<img src={labelPreview} alt="label" style={{width:'100%',maxHeight:220,objectFit:'contain',display:'block',borderRadius:12,padding:8,background:'var(--surface2)'}} onClick={e=>e.stopPropagation()}/>
                      :<><div style={{fontSize:36,marginBottom:10,opacity:.5}}>🏷️</div><div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:2,marginBottom:4}}>ETİKET / AMBALAJ FOTOĞRAFI</div><div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'Space Mono,monospace'}}>Besin değerleri tablosu veya ürün ambalajı</div></>
                    }
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,marginBottom:16}}>
                    <button className="btn btn-primary" onClick={analyzeLabel} disabled={!labelImg||labelLoading} style={{padding:'12px 30px',opacity:(!labelImg||labelLoading)?.4:1,cursor:(!labelImg||labelLoading)?'not-allowed':'pointer',background:'var(--blue)',color:'#0a0a0a'}}>
                      {labelLoading&&<span className="spinner" style={{width:16,height:16,borderTopColor:'#0a0a0a',marginRight:8}}/>}🏷️ Etiketi Oku
                    </button>
                  </div>
                  {labelStatus&&(
                    <div className="animate-fade" style={{ background:'var(--surface)',border:`1px solid ${labelStatus.type==='success'?'rgba(71,255,138,.25)':labelStatus.type==='error'?'rgba(255,71,71,.25)':'rgba(71,200,255,.25)'}`,borderRadius:12,padding:'16px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12 }}>
                      {labelStatus.type==='analyzing'&&<span className="spinner"/>}{labelStatus.type==='success'&&<span style={{fontSize:20}}>✅</span>}{labelStatus.type==='error'&&<span style={{fontSize:20}}>❌</span>}
                      <div><div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:17,letterSpacing:1,marginBottom:2}}>{labelStatus.title}</div><div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'Space Mono,monospace'}}>{labelStatus.sub}</div></div>
                    </div>
                  )}
                  {labelResult&&(
                    <div className="animate-fade" style={{background:'var(--surface2)',border:'1px solid rgba(71,200,255,.2)',borderRadius:12,padding:'16px 18px',marginBottom:16}}>
                      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:1.5,marginBottom:12,color:'#47c8ff'}}>{labelResult.product_name}</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
                        {[{val:labelResult.kcal,lbl:'KCAL',col:'var(--accent)'},{val:`${labelResult.protein}g`,lbl:'PROTEİN',col:'#47c8ff'},{val:`${labelResult.fat}g`,lbl:'YAĞ',col:'#ff8c47'},{val:`${labelResult.carb}g`,lbl:'KARB',col:'#47ff8a'}].map(({val,lbl,col})=>(
                          <div key={lbl} style={{background:'var(--surface3)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
                            <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:col}}>{val}</div>
                            <div style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',letterSpacing:1,marginTop:2}}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontFamily:'Space Mono,monospace',fontSize:9,color:'var(--text-muted)',marginBottom:14}}>↑ {labelResult.serving_g||100}g için değerler</div>
                      <div style={{display:'flex',gap:8,alignItems:'flex-end',marginBottom:14}}>
                        <div className="form-group" style={{flex:1}}>
                          <span className="flabel">Miktar (gram)</span>
                          <input type="number" value={labelGram} onChange={e=>setLabelGram(e.target.value)} min="1" style={{maxWidth:120}}/>
                        </div>
                        <div style={{display:'flex',gap:6}}>
                          {['50','100','150','200'].map(g=>(
                            <button key={g} onClick={()=>setLabelGram(g)} style={{padding:'8px 10px',borderRadius:8,border:'1px solid var(--border)',background:labelGram===g?'var(--accent)':'var(--surface2)',color:labelGram===g?'#0a0a0a':'var(--text-muted)',fontFamily:'Space Mono,monospace',fontSize:11,cursor:'pointer'}}>{g}g</button>
                          ))}
                        </div>
                      </div>
                      {labelGram&&+labelGram!==(labelResult.serving_g||100)&&(
                        <div style={{marginBottom:12,padding:'8px 12px',background:'var(--surface3)',borderRadius:8,fontFamily:'Space Mono,monospace',fontSize:11,color:'var(--text-muted)'}}>
                          {labelGram}g: <b style={{color:'var(--accent)'}}>{Math.round(labelResult.kcal*(+labelGram/(labelResult.serving_g||100)))}kcal</b> · <b style={{color:'#47c8ff'}}>{Math.round(labelResult.protein*(+labelGram/(labelResult.serving_g||100)))}g P</b> · <b style={{color:'#ff8c47'}}>{Math.round(labelResult.fat*(+labelGram/(labelResult.serving_g||100)))}g Y</b> · <b style={{color:'#47ff8a'}}>{Math.round(labelResult.carb*(+labelGram/(labelResult.serving_g||100)))}g K</b>
                        </div>
                      )}
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn btn-primary" style={{flex:1}} onClick={addFromLabel}>✓ Listeye Ekle</button>
                        <button className="btn btn-ghost" onClick={()=>{setLabelResult(null);setLabelStatus(null)}}>İptal</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUEL */}
              {addTab === 'manual' && (
                <div className="animate-fade card" style={{padding:18,marginBottom:16}}>
                  <div className="section-title">MANUEL EKLE</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <span className="flabel">Yemek Adı</span>
                      <input type="text" value={mf.name} placeholder="Tavuk Göğsü" onChange={e=>setMf(p=>({...p,name:e.target.value}))}/>
                    </div>
                    {[{key:'kcal',label:'Kalori (kcal)',ph:'250'},{key:'protein',label:'Protein (g)',ph:'30'},{key:'fat',label:'Yağ (g)',ph:'5'},{key:'carb',label:'Karbonhidrat (g)',ph:'0'}].map(({key,label,ph})=>(
                      <div key={key} className="form-group">
                        <span className="flabel">{label}</span>
                        <input type="number" value={mf[key]} placeholder={ph} onChange={e=>setMf(p=>({...p,[key]:e.target.value}))}/>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{width:'100%'}} onClick={addManual}>✓ Ekle</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ HEDEFLER SEKMESİ ══ */}
      {mainTab === 'goals' && (
        <div className="animate-fade">
          {/* Makro progress barlar */}
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, color:'var(--text-muted)', letterSpacing:1, marginBottom:12 }}>GÜNLÜK MAKRO TAKİBİ</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:24 }}>
            {macros.map(({ key, label, unit, color }) => {
              const cur = Math.round(tot[key]); const tgt = goals[key]||1
              const pct = Math.min(100, Math.round((cur/tgt)*100))
              const barColor = pct >= 100 ? 'var(--green)' : pct >= 75 ? color : 'var(--border)'
              const remaining = Math.max(0, (goals[key]||0) - cur)
              return (
                <div key={key} className="card" style={{ padding:'18px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:2, color:'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)' }}>
                      <b style={{ color }}>{cur}</b> / {goals[key]} {unit}
                    </div>
                  </div>
                  <div style={{ background:'var(--surface3)', borderRadius:20, height:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:20, width:`${pct}%`, background:barColor, transition:'width .6s ease' }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)' }}>
                      {pct >= 100 ? '✓ Tamamlandı' : `${remaining} ${unit} kaldı`}
                    </div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, color:pct>=100?'var(--green)':pct>=75?color:'var(--text-muted)' }}>{pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Su takibi */}
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, color:'var(--text-muted)', letterSpacing:1, marginBottom:12 }}>SU TAKİBİ 💧</div>
          <div className="card" style={{ padding:'20px 22px', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:48, lineHeight:1, color:'#47c8ff' }}>
                  {water} <span style={{ fontSize:18, color:'var(--text-muted)' }}>ml</span>
                </div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Hedef: {WATER_GOAL} ml / gün</div>
              </div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color:waterPct>=100?'var(--green)':'var(--text-muted)' }}>{waterPct}%</div>
            </div>
            <div style={{ background:'var(--surface3)', borderRadius:20, height:10, overflow:'hidden', marginBottom:16 }}>
              <div style={{ height:'100%', borderRadius:20, width:`${waterPct}%`, background:waterPct>=100?'var(--green)':'#47c8ff', transition:'width .5s ease' }}/>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              {[150,200,300,500].map(ml=>(
                <button key={ml} onClick={()=>saveWater(Math.min(water+ml, 9999))} style={{ flex:1, minWidth:60, padding:'10px 4px', borderRadius:8, border:'1px solid rgba(71,200,255,.25)', background:'rgba(71,200,255,.07)', color:'#47c8ff', fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1, cursor:'pointer', transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(71,200,255,.15)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(71,200,255,.07)'}
                >+{ml}ml</button>
              ))}
            </div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'var(--text-muted)', lineHeight:1.6, marginBottom:10 }}>
              {waterPct>=100?'🎉 Günlük su hedefinizi tamamladınız!':waterPct>=60?`💧 İyi gidiyorsunuz! ${WATER_GOAL-water} ml daha.`:`⚠️ ${WATER_GOAL} ml hedef. Şimdiye kadar ${water} ml.`}
            </div>
            <button onClick={()=>saveWater(0)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:10, color:'var(--text-muted)', fontFamily:'Space Mono,monospace', textDecoration:'underline' }}>Sıfırla</button>
          </div>

          {/* Makro dağılım özeti */}
          {tot.kcal > 0 && (
            <div className="card" style={{ padding:'16px 18px', marginBottom:16 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:1, color:'var(--text-muted)', marginBottom:12 }}>MAKRO DAĞILIMI</div>
              <div style={{ display:'flex', height:8, borderRadius:20, overflow:'hidden', marginBottom:10 }}>
                {(() => {
                  const pKcal = tot.protein * 4
                  const fKcal = tot.fat * 9
                  const cKcal = tot.carb * 4
                  const total = pKcal + fKcal + cKcal || 1
                  return [
                    { pct: Math.round(pKcal/total*100), color:'#47c8ff' },
                    { pct: Math.round(fKcal/total*100), color:'#ff8c47' },
                    { pct: Math.round(cKcal/total*100), color:'#47ff8a' },
                  ].map((seg, i) => (
                    <div key={i} style={{ width:`${seg.pct}%`, background:seg.color, transition:'width .4s' }}/>
                  ))
                })()}
              </div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {[
                  { label:'Protein', pct: Math.round(tot.protein*4/(tot.protein*4+tot.fat*9+tot.carb*4||1)*100), color:'#47c8ff' },
                  { label:'Yağ',     pct: Math.round(tot.fat*9/(tot.protein*4+tot.fat*9+tot.carb*4||1)*100),     color:'#ff8c47' },
                  { label:'Karb',    pct: Math.round(tot.carb*4/(tot.protein*4+tot.fat*9+tot.carb*4||1)*100),    color:'#47ff8a' },
                ].map(({ label, pct, color }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:color }}/>
                    <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>{label} <b style={{ color }}>{pct}%</b></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ GEÇMİŞ SEKMESİ ══ */}
      {mainTab === 'history' && (
        <div className="animate-fade">
          {/* Grafik */}
          <div className="card" style={{ padding:'18px 20px', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, letterSpacing:1, color:'var(--text-muted)' }}>KALORİ GEÇMİŞİ</div>
              <div style={{ display:'flex', gap:6 }}>
                {[7,14,30].map(r=>(
                  <button key={r} onClick={()=>setChartRange(r)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background:chartRange===r?'var(--accent)':'var(--surface2)', color:chartRange===r?'#0a0a0a':'var(--text-muted)', fontFamily:'Space Mono,monospace', fontSize:10, cursor:'pointer' }}>{r}G</button>
                ))}
              </div>
            </div>
            <div style={{ height:180, position:'relative' }}>
              <canvas ref={calChartRef}/>
            </div>
          </div>

          {/* Son günlerin listesi */}
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, color:'var(--text-muted)', letterSpacing:1, marginBottom:12 }}>GÜNLÜK ÖZET</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {Array.from({ length: Math.min(chartRange, 14) }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate()-i)
              const dk = d.toISOString().slice(0,10)
              const fs = dk===todayKey()?foods:(calArch[dk]||[])
              const dayTot = totals(fs)
              const pct = Math.min(100, Math.round((dayTot.kcal/(goals.kcal||1))*100))
              if (i > 0 && dayTot.kcal === 0) return null
              return (
                <div key={dk} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:1 }}>
                      {i===0 ? 'Bugün' : d.toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'})}
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>
                        <b style={{color:'var(--accent)'}}>{Math.round(dayTot.kcal)}</b> kcal
                      </span>
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:9, color: pct>=100?'var(--green)':pct>=75?'var(--accent)':'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ background:'var(--surface3)', borderRadius:20, height:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:20, width:`${pct}%`, background:pct>=100?'var(--green)':'var(--accent)', transition:'width .4s' }}/>
                  </div>
                  {dayTot.kcal > 0 && (
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:9, color:'var(--text-muted)', marginTop:6 }}>
                      <span style={{color:'#47c8ff'}}>{Math.round(dayTot.protein)}g P</span> · <span style={{color:'#ff8c47'}}>{Math.round(dayTot.fat)}g Y</span> · <span style={{color:'#47ff8a'}}>{Math.round(dayTot.carb)}g K</span>
                    </div>
                  )}
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      )}

    </div>
  )
}
