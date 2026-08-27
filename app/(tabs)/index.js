import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { VideoView } from "expo-video";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useVideoLibrary } from "@/components/video-player-context";
import { formatDuration } from "@/lib/video-utils";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

function ActionButton({ icon, label, onPress, active = false }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, active && styles.actionButtonActive, pressed && styles.pressed]}>
      <MaterialIcons color={active ? "#FFFFFF" : "#12325B"} name={icon} size={20} />
      <Text style={[styles.actionLabel, active && styles.actionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export default function WatchScreen() {
  const router = useRouter();
  const {
    addVideos,
    currentVideo,
    loadVideo,
    nextVideo,
    player,
    playback,
    preferences,
    previousVideo,
    setPreferences,
    toggleFavorite,
    togglePlayback,
    updatePosition,
    videos,
  } = useVideoLibrary();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  const duration = playback.duration || currentVideo?.duration || 0;
  const currentTime = playback.currentTime || currentVideo?.position || 0;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const seekFromPress = (event) => {
    if (!duration || !progressWidth) return;
    updatePosition((event.nativeEvent.locationX / progressWidth) * duration);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>VIN VID PLAYER</Text>
            <Text style={styles.subhead}>Watch offline. Pick up anywhere.</Text>
          </View>
          <Pressable onPress={addVideos} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <MaterialIcons color="#FFFFFF" name="add" size={20} />
            <Text style={styles.addButtonText}>Add Videos</Text>
          </Pressable>
        </View>

        <View style={styles.videoClayCard}>
          <View style={styles.videoFrame}>
            {currentVideo ? (
              <VideoView
                allowsFullscreen
                allowsPictureInPicture
                contentFit="contain"
                nativeControls
                player={player}
                style={styles.video}
              />
            ) : (
              <View style={styles.emptyVideo}>
                <View style={styles.playMark}>
                  <MaterialIcons color="#FF7A30" name="movie" size={38} />
                </View>
                <Text style={styles.emptyTitle}>Your screen is ready</Text>
                <Text style={styles.emptyCopy}>Add a video from your device to start watching offline.</Text>
                <Pressable onPress={addVideos} style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}>
                  <MaterialIcons color="#FFFFFF" name="video-library" size={19} />
                  <Text style={styles.emptyButtonText}>Choose Videos</Text>
                </Pressable>
              </View>
            )}
          </View>
          <View style={styles.videoAccent} />
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>{playback.status === "error" ? "CAN'T PLAY" : currentVideo ? "READY TO WATCH" : "OFFLINE PLAYER"}</Text></View>
            <Text numberOfLines={2} style={styles.videoTitle}>{currentVideo?.title || "Choose your next video"}</Text>
            <Text numberOfLines={1} style={styles.videoMeta}>{currentVideo?.name || "All imported videos stay on this device"}</Text>
          </View>
          {currentVideo ? (
            <Pressable onPress={() => toggleFavorite(currentVideo ? videos.indexOf(currentVideo) : -1)} style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
              <MaterialIcons color={currentVideo.favorite ? "#FF7A30" : "#6B7C92"} name={currentVideo.favorite ? "favorite" : "favorite-border"} size={24} />
            </Pressable>
          ) : null}
        </View>

        {playback.error ? <View style={styles.errorBox}><MaterialIcons color="#C6453C" name="error-outline" size={19} /><Text style={styles.errorText}>This video may use a codec your device cannot decode.</Text></View> : null}

        <View style={styles.progressBlock}>
          <View style={styles.timeRow}><Text style={styles.timeText}>{formatDuration(currentTime)}</Text><Text style={styles.timeText}>{formatDuration(duration)}</Text></View>
          <Pressable onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)} onPress={seekFromPress} style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
          </Pressable>
        </View>

        <View style={styles.mainControls}>
          <Pressable accessibilityLabel="Previous video" onPress={previousVideo} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><MaterialIcons color="#12325B" name="skip-previous" size={30} /></Pressable>
          <Pressable accessibilityLabel={playback.isPlaying ? "Pause video" : "Play video"} onPress={togglePlayback} style={({ pressed }) => [styles.playButton, pressed && styles.playPressed]}><MaterialIcons color="#FFFFFF" name={playback.isPlaying ? "pause" : "play-arrow"} size={38} /></Pressable>
          <Pressable accessibilityLabel="Next video" onPress={nextVideo} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><MaterialIcons color="#12325B" name="skip-next" size={30} /></Pressable>
        </View>

        <View style={styles.actionGrid}>
          <ActionButton active={preferences.muted} icon={preferences.muted ? "volume-off" : "volume-up"} label={preferences.muted ? "Muted" : "Sound"} onPress={() => setPreferences({ muted: !preferences.muted })} />
          <ActionButton icon="speed" label={`${preferences.speed}×`} onPress={() => setIsSettingsOpen(true)} />
          <ActionButton icon="video-library" label={`${videos.length} Videos`} onPress={() => router.push("/library")} />
        </View>

        <Pressable onPress={() => router.push("/library")} style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
          <View style={styles.continueIcon}><MaterialIcons color="#FFFFFF" name="play-circle-filled" size={25} /></View>
          <View style={styles.continueCopy}><Text style={styles.continueTitle}>{videos.length ? `${videos.length} video${videos.length === 1 ? "" : "s"} ready offline` : "Build your offline library"}</Text><Text style={styles.continueText}>{videos.length ? "Open Library to browse your collection" : "Import MP4, MOV, MKV, WebM, AVI and more"}</Text></View>
          <MaterialIcons color="#6E8097" name="chevron-right" size={25} />
        </Pressable>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isSettingsOpen} onRequestClose={() => setIsSettingsOpen(false)}>
        <Pressable onPress={() => setIsSettingsOpen(false)} style={styles.modalBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>PLAYER SETTINGS</Text><Text style={styles.sheetTitle}>Make it yours</Text></View><Pressable onPress={() => setIsSettingsOpen(false)} style={styles.closeButton}><MaterialIcons color="#12325B" name="close" size={21} /></Pressable></View>
            <Text style={styles.settingName}>Playback speed</Text>
            <View style={styles.speedRow}>{SPEEDS.map((speed) => <Pressable key={speed} onPress={() => setPreferences({ speed })} style={[styles.speedChip, preferences.speed === speed && styles.speedChipActive]}><Text style={[styles.speedText, preferences.speed === speed && styles.speedTextActive]}>{speed}×</Text></Pressable>)}</View>
            <Pressable onPress={() => setPreferences({ loop: !preferences.loop })} style={[styles.settingRow, preferences.loop && styles.settingRowActive]}><MaterialIcons color={preferences.loop ? "#FFFFFF" : "#12325B"} name="repeat" size={21} /><Text style={[styles.settingText, preferences.loop && styles.settingTextActive]}>Loop this video</Text><MaterialIcons color={preferences.loop ? "#FFFFFF" : "#9BA8B8"} name={preferences.loop ? "check-circle" : "radio-button-unchecked"} size={21} /></Pressable>
            <Pressable onPress={() => setPreferences({ autoplayNext: !preferences.autoplayNext })} style={[styles.settingRow, preferences.autoplayNext && styles.settingRowActive]}><MaterialIcons color={preferences.autoplayNext ? "#FFFFFF" : "#12325B"} name="playlist-play" size={21} /><Text style={[styles.settingText, preferences.autoplayNext && styles.settingTextActive]}>Play next automatically</Text><MaterialIcons color={preferences.autoplayNext ? "#FFFFFF" : "#9BA8B8"} name={preferences.autoplayNext ? "check-circle" : "radio-button-unchecked"} size={21} /></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.72)", borderColor: "#D7E3F0", borderRadius: 18, borderWidth: 1, flex: 1, gap: 4, justifyContent: "center", minHeight: 62 },
  actionButtonActive: { backgroundColor: "#2F80ED", borderColor: "#2F80ED" },
  actionGrid: { flexDirection: "row", gap: 9, marginTop: 22 },
  actionLabel: { color: "#4F6279", fontSize: 11, fontWeight: "800" },
  actionLabelActive: { color: "#FFFFFF" },
  addButton: { alignItems: "center", backgroundColor: "#FF7A30", borderRadius: 999, elevation: 3, flexDirection: "row", gap: 5, minHeight: 43, paddingHorizontal: 14, shadowColor: "#C94E15", shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.2, shadowRadius: 8 },
  addButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  closeButton: { alignItems: "center", backgroundColor: "#EFF5FC", borderRadius: 99, height: 40, justifyContent: "center", width: 40 },
  content: { paddingBottom: 32, paddingHorizontal: 17, paddingTop: 13 },
  continueCard: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.78)", borderColor: "#D7E3F0", borderRadius: 23, borderWidth: 1, flexDirection: "row", marginTop: 22, minHeight: 80, paddingHorizontal: 13 },
  continueCopy: { flex: 1, marginHorizontal: 12 },
  continueIcon: { alignItems: "center", backgroundColor: "#2F80ED", borderRadius: 16, height: 48, justifyContent: "center", width: 48 },
  continueText: { color: "#718198", fontSize: 12, lineHeight: 17, marginTop: 3 },
  continueTitle: { color: "#12325B", fontSize: 14, fontWeight: "900" },
  emptyButton: { alignItems: "center", backgroundColor: "#2F80ED", borderRadius: 999, flexDirection: "row", gap: 7, marginTop: 20, paddingHorizontal: 17, paddingVertical: 12 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  emptyCopy: { color: "#7A899D", fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 250, textAlign: "center" },
  emptyTitle: { color: "#F2F8FF", fontSize: 19, fontWeight: "900", marginTop: 14 },
  emptyVideo: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  errorBox: { alignItems: "center", backgroundColor: "#FFF0ED", borderColor: "#F3C9C3", borderRadius: 14, flexDirection: "row", gap: 8, marginTop: 15, padding: 11 },
  errorText: { color: "#A93D36", flex: 1, fontSize: 12, lineHeight: 17 },
  eyebrow: { color: "#2F80ED", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  favoriteButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.82)", borderColor: "#D7E3F0", borderRadius: 15, borderWidth: 1, height: 46, justifyContent: "center", width: 46 },
  liveDot: { backgroundColor: "#FF7A30", borderRadius: 99, height: 7, width: 7 },
  livePill: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 7 },
  liveText: { color: "#7C8A9B", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  mainControls: { alignItems: "center", flexDirection: "row", gap: 29, justifyContent: "center", marginTop: 20 },
  modalBackdrop: { backgroundColor: "rgba(18,40,74,0.45)", flex: 1, justifyContent: "flex-end" },
  playButton: { alignItems: "center", backgroundColor: "#FF7A30", borderRadius: 999, elevation: 5, height: 70, justifyContent: "center", shadowColor: "#C94E15", shadowOffset: { height: 5, width: 0 }, shadowOpacity: 0.25, shadowRadius: 10, width: 70 },
  playMark: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, height: 74, justifyContent: "center", shadowColor: "#FFFFFF", shadowOpacity: 0.2, shadowRadius: 12, width: 74 },
  playPressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
  pressed: { opacity: 0.72 },
  progressBlock: { marginTop: 24 },
  progressFill: { backgroundColor: "#FF7A30", borderRadius: 4, height: 6, left: 0, position: "absolute", top: 0 },
  progressThumb: { backgroundColor: "#FFFFFF", borderColor: "#FF7A30", borderRadius: 9, borderWidth: 3, height: 16, marginLeft: -8, position: "absolute", top: -5, width: 16 },
  progressTrack: { backgroundColor: "#DCE6F1", borderRadius: 4, height: 6 },
  screen: { backgroundColor: "#FFF8F1", flex: 1 },
  settingName: { color: "#12325B", fontSize: 14, fontWeight: "900", marginTop: 25 },
  settingRow: { alignItems: "center", backgroundColor: "#F3F7FC", borderColor: "#E0E9F4", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 12, minHeight: 56, paddingHorizontal: 14 },
  settingRowActive: { backgroundColor: "#2F80ED", borderColor: "#2F80ED" },
  settingText: { color: "#34506F", flex: 1, fontSize: 14, fontWeight: "800" },
  settingTextActive: { color: "#FFFFFF" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 33, paddingHorizontal: 21, paddingTop: 10 },
  sheetEyebrow: { color: "#FF7A30", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  sheetHandle: { alignSelf: "center", backgroundColor: "#CBD8E6", borderRadius: 99, height: 4, width: 43 },
  sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 19 },
  sheetTitle: { color: "#12325B", fontSize: 24, fontWeight: "900", marginTop: 3 },
  skipButton: { alignItems: "center", height: 55, justifyContent: "center", width: 55 },
  speedChip: { alignItems: "center", backgroundColor: "#F3F7FC", borderColor: "#D9E5F2", borderRadius: 13, borderWidth: 1, minWidth: 52, paddingVertical: 11 },
  speedChipActive: { backgroundColor: "#FF7A30", borderColor: "#FF7A30" },
  speedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  speedText: { color: "#45617E", fontSize: 13, fontWeight: "900" },
  speedTextActive: { color: "#FFFFFF" },
  subhead: { color: "#78879A", fontSize: 12, marginTop: 3 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  timeText: { color: "#75869B", fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "800" },
  titleCopy: { flex: 1 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", marginTop: 20 },
  video: { height: "100%", width: "100%" },
  videoAccent: { backgroundColor: "#FF7A30", borderRadius: 3, height: 5, left: 24, position: "absolute", right: 24, top: -4 },
  videoClayCard: { backgroundColor: "#FFFFFF", borderRadius: 27, elevation: 7, marginTop: 23, padding: 7, shadowColor: "#9C7D68", shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.18, shadowRadius: 16 },
  videoFrame: { backgroundColor: "#12325B", borderRadius: 21, height: 218, overflow: "hidden" },
  videoMeta: { color: "#78879A", fontSize: 12, marginTop: 7 },
  videoTitle: { color: "#12325B", fontSize: 24, fontWeight: "900", lineHeight: 30 },
});
