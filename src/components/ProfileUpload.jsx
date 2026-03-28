import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useApp } from '../context/AppContext';

export default function ProfileUpload({ open, onOpenChange }) {
  const { uid, showToast } = useApp();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Dosya boyutu 10MB\'dan küçük olmalı.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else {
      showToast('Sadece resim dosyası seçebilirsiniz.', 'error');
    }
  };

  const handleDragEvents = (e, isDragging) => {
    e.preventDefault();
    setIsDragging(isDragging);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadClick = async () => {
    if (!selectedFile || !uid) return;
    setIsUploading(true);
    
    try {
      // 1. Firebase Storage'a yükle
      const fileExt = selectedFile.name.split('.').pop();
      const storageRef = ref(storage, `avatars/${uid}_${Date.now()}.${fileExt}`);
      
      const snap = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snap.ref);

      // 2. Firestore'u güncelle (Bu sayede hem leaderboard'da hem de app genelinde görünür)
      await updateDoc(doc(db, 'users', uid), {
        photoURL: downloadURL
      });
      
      showToast('Profil fotoğrafın güncellendi! İçerik onayı devam ediyor.', 'success');
      
      // Cleanup
      onOpenChange(false);
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Yükleme hatası:', error);
      showToast('Yükleme sırasında bir hata oluştu.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-[340px] sm:max-w-md w-11/12">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Avatar Yükle
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs md:text-sm">
            Liderlik tablosunda ve profilinde görünecek fotoğrafını seç. (+18 içerik filtresi aktiftir).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div
            className={`relative mx-auto w-40 h-40 md:w-48 md:h-48 rounded-full border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                : selectedImage
                ? 'border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                : 'border-zinc-700 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]'
            }`}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-2 md:mb-3 border border-zinc-700">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                </div>
                <p className="text-xs md:text-sm font-medium text-zinc-300">Tıkla veya Sürükle</p>
                <p className="text-[10px] md:text-xs text-zinc-500 mt-1">PNG, JPG (Max 10MB)</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              disabled={isUploading}
            >
              İptal
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yükleniyor...</>
              ) : 'Kaydet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
