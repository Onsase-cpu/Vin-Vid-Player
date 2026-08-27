import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { clearVideoCacheAsync, useVideoPlayer } from "expo-video";
import { Alert } from "react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { isVideoFile, nextIndex, previousIndex, readableVideoTitle, safeFilename } from "@/lib/video-utils";

const LIBRARY_KEY = "vin-vid-player.library.v1";
const PREFERENCES_KEY = "vin-vid-player.preferences.v1";
const VIDEO_DIRECTORY = `${FileSystem.documentDirectory}vin-vid-videos/`;

const DEFAULT_PREFERENCES = {
  autoplayNext: true,
  loop: false,
  muted: false,
  speed: 1,
};

const VideoPlayerContext = createContext(null);

async function ensureVideoDirectory() {
  const info = await FileSystem.getInfoAsync(VIDEO_DIRECTORY);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_DIRECTORY, { intermediates: true });
  }
}

async function durableCopy(asset) {
  await ensureVideoDirectory();
  const filename = safeFilename(asset.name, `video-${Date.now()}.mp4`);
  const destination = `${VIDEO_DIRECTORY}${Date.now()}-${filename}`;
  await FileSystem.copyAsync({ from: asset.uri, to: destination });
  return destination;
}

export function VideoPlayerProvider({ children }) {
  const player = useVideoPlayer(null, (instance) => {
    instance.timeUpdateEventInterval = 0.5;
    instance.staysActiveInBackground = true;
  });
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [playback, setPlayback] = useState({ currentTime: 0, duration: 0, isPlaying: false, status: "idle", error: null });
  const [hydrated, setHydrated] = useState(false);
  const currentRef = useRef(null);
  const lastPersistRef = useRef(0);

  const currentVideo = videos[currentIndex] || null;

  const persistLibrary = useCallback(async (nextVideos, nextIndex = currentIndex) => {
    await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify({ videos: nextVideos, currentId: nextVideos[nextIndex]?.id || null }));
  }, [currentIndex]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [libraryRaw, preferencesRaw] = await Promise.all([
          AsyncStorage.getItem(LIBRARY_KEY),
          AsyncStorage.getItem(PREFERENCES_KEY),
        ]);
        const savedPreferences = preferencesRaw ? JSON.parse(preferencesRaw) : {};
        const savedLibrary = libraryRaw ? JSON.parse(libraryRaw) : { videos: [], currentId: null };
        const existing = [];
        for (const video of savedLibrary.videos || []) {
          const fileInfo = await FileSystem.getInfoAsync(video.uri);
          if (fileInfo.exists) existing.push(video);
        }
        if (!mounted) return;
        setPreferences({ ...DEFAULT_PREFERENCES, ...savedPreferences });
        setVideos(existing);
        const savedIndex = existing.findIndex((video) => video.id === savedLibrary.currentId);
        setCurrentIndex(savedIndex);
      } catch {
        if (mounted) {
          setVideos([]);
          setCurrentIndex(-1);
        }
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    player.muted = preferences.muted;
    player.playbackRate = preferences.speed;
    player.loop = preferences.loop;
    if (hydrated) void AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [hydrated, player, preferences]);

  useEffect(() => {
    const timeSubscription = player.addListener("timeUpdate", ({ currentTime, bufferedPosition }) => {
      const duration = Number.isFinite(player.duration) ? player.duration : 0;
      setPlayback((previous) => ({ ...previous, currentTime, duration, bufferedPosition }));
      const now = Date.now();
      if (currentRef.current && now - lastPersistRef.current > 4000) {
        lastPersistRef.current = now;
        const updated = videos.map((video) => video.id === currentRef.current.id ? { ...video, position: currentTime } : video);
        setVideos(updated);
        void persistLibrary(updated);
      }
    });
    const playingSubscription = player.addListener("playingChange", ({ isPlaying }) => {
      setPlayback((previous) => ({ ...previous, isPlaying }));
    });
    const statusSubscription = player.addListener("statusChange", ({ status, error }) => {
      setPlayback((previous) => ({ ...previous, status, error: error || null, duration: Number.isFinite(player.duration) ? player.duration : previous.duration }));
    });
    const endSubscription = player.addListener("playToEnd", () => {
      if (!currentRef.current) return;
      if (preferences.loop) {
        player.currentTime = 0;
        player.play();
        return;
      }
      const upcoming = nextIndex(currentIndex, videos.length, false);
      if (upcoming >= 0 && preferences.autoplayNext) loadVideo(upcoming, true);
      else setPlayback((previous) => ({ ...previous, isPlaying: false }));
    });
    return () => {
      timeSubscription.remove();
      playingSubscription.remove();
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [currentIndex, persistLibrary, player, preferences.autoplayNext, preferences.loop, videos]);

  const loadVideo = useCallback((index, autoplay = false) => {
    const video = videos[index];
    if (!video) return;
    currentRef.current = video;
    setCurrentIndex(index);
    player.pause();
    player.replace({
      uri: video.uri,
      useCaching: true,
      metadata: { title: video.title, artist: "Vin Vid Player" },
    });
    player.muted = preferences.muted;
    player.playbackRate = preferences.speed;
    player.loop = preferences.loop;
    setPlayback((previous) => ({ ...previous, currentTime: video.position || 0, duration: 0 }));
    setTimeout(() => {
      if (video.position > 0) player.currentTime = video.position;
      if (autoplay) player.play();
    }, 180);
  }, [player, preferences.loop, preferences.muted, preferences.speed, videos]);

  useEffect(() => {
    if (hydrated && currentIndex >= 0 && currentVideo && currentRef.current?.id !== currentVideo.id) {
      loadVideo(currentIndex, false);
    }
  }, [currentIndex, currentVideo, hydrated, loadVideo]);

  const addVideos = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*", "application/octet-stream"],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const additions = [];
      for (const asset of result.assets || []) {
        if (!isVideoFile(asset.name, asset.mimeType)) continue;
        const uri = await durableCopy(asset);
        additions.push({
          id: `${asset.name}-${asset.size || 0}-${asset.lastModified || Date.now()}`,
          name: asset.name,
          title: readableVideoTitle(asset.name),
          uri,
          mimeType: asset.mimeType || "video/*",
          size: asset.size || 0,
          duration: 0,
          position: 0,
          favorite: false,
          addedAt: Date.now(),
        });
      }
      const unique = additions.filter((candidate) => !videos.some((video) => video.id === candidate.id));
      if (!unique.length) {
        Alert.alert("No new videos", "Choose a supported video container such as MP4, M4V, MOV, MKV, WebM, AVI, or MPEG.");
        return;
      }
      const nextVideos = [...videos, ...unique];
      setVideos(nextVideos);
      await persistLibrary(nextVideos, currentIndex);
      if (currentIndex < 0) loadVideo(0, false);
    } catch {
      Alert.alert("Import failed", "Vin Vid Player could not copy the selected video files into offline storage.");
    }
  }, [currentIndex, loadVideo, persistLibrary, videos]);

  const removeVideo = useCallback(async (index) => {
    const video = videos[index];
    if (!video) return;
    try { await FileSystem.deleteAsync(video.uri, { idempotent: true }); } catch { /* file may already be gone */ }
    const nextVideos = videos.filter((_, itemIndex) => itemIndex !== index);
    setVideos(nextVideos);
    if (index === currentIndex) {
      player.pause();
      player.replace(null);
      const replacement = Math.min(index, nextVideos.length - 1);
      setCurrentIndex(replacement);
      if (replacement >= 0) loadVideo(replacement, false);
      else currentRef.current = null;
    } else if (index < currentIndex) {
      setCurrentIndex((previous) => previous - 1);
    }
    await persistLibrary(nextVideos, index === currentIndex ? Math.min(index, nextVideos.length - 1) : currentIndex);
  }, [currentIndex, loadVideo, persistLibrary, player, videos]);

  const toggleFavorite = useCallback(async (index) => {
    const nextVideos = videos.map((video, itemIndex) => itemIndex === index ? { ...video, favorite: !video.favorite } : video);
    setVideos(nextVideos);
    await persistLibrary(nextVideos);
  }, [persistLibrary, videos]);

  const updatePosition = useCallback((seconds) => {
    if (!currentVideo) return;
    player.currentTime = Math.max(0, seconds);
    const nextVideos = videos.map((video) => video.id === currentVideo.id ? { ...video, position: seconds } : video);
    setVideos(nextVideos);
    void persistLibrary(nextVideos);
  }, [currentVideo, persistLibrary, player, videos]);

  const togglePlayback = useCallback(() => {
    if (!currentVideo) {
      if (videos[0]) loadVideo(0, true);
      return;
    }
    if (playback.isPlaying) player.pause();
    else player.play();
  }, [currentVideo, loadVideo, playback.isPlaying, player, videos]);

  const nextVideo = useCallback(() => {
    const index = nextIndex(currentIndex, videos.length, preferences.loop);
    if (index >= 0) loadVideo(index, true);
  }, [currentIndex, loadVideo, preferences.loop, videos.length]);

  const previousVideo = useCallback(() => {
    if (playback.currentTime > 4) {
      player.currentTime = 0;
      return;
    }
    const index = previousIndex(currentIndex, videos.length);
    if (index >= 0) loadVideo(index, true);
  }, [currentIndex, loadVideo, playback.currentTime, player, videos.length]);

  const value = useMemo(() => ({
    addVideos,
    clearCache: () => clearVideoCacheAsync(),
    currentIndex,
    currentVideo,
    hydrated,
    loadVideo,
    nextVideo,
    preferences,
    previousVideo,
    playback,
    player,
    removeVideo,
    setPreferences: (patch) => setPreferences((previous) => ({ ...previous, ...patch })),
    toggleFavorite,
    togglePlayback,
    updatePosition,
    videos,
  }), [addVideos, currentIndex, currentVideo, hydrated, loadVideo, nextVideo, player, preferences, previousVideo, playback, removeVideo, toggleFavorite, togglePlayback, updatePosition, videos]);

  return <VideoPlayerContext.Provider value={value}>{children}</VideoPlayerContext.Provider>;
}

export function useVideoLibrary() {
  const value = useContext(VideoPlayerContext);
  if (!value) throw new Error("useVideoLibrary must be used inside VideoPlayerProvider");
  return value;
}
