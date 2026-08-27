import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useVideoLibrary } from "@/components/video-player-context";
import { formatDuration } from "@/lib/video-utils";

export function VideoLibraryScreen({ onlyFavorites = false }) {
  const router = useRouter();
  const { addVideos, currentIndex, loadVideo, removeVideo, toggleFavorite, videos } = useVideoLibrary();
  const [query, setQuery] = useState("");
  const visibleVideos = useMemo(() => videos
    .map((video, index) => ({ video, index }))
    .filter(({ video }) => !onlyFavorites || video.favorite)
    .filter(({ video }) => `${video.title} ${video.name}`.toLowerCase().includes(query.trim().toLowerCase())), [onlyFavorites, query, videos]);

  const confirmRemove = (item) => {
    Alert.alert("Remove this video?", `“${item.video.title}” will be removed from your offline library.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeVideo(item.index) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={visibleVideos.length ? styles.listContent : styles.emptyContent}
        data={visibleVideos}
        keyExtractor={({ video }) => video.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}><View><Text style={styles.eyebrow}>{onlyFavorites ? "SAVED FOR LATER" : "YOUR OFFLINE LIBRARY"}</Text><Text style={styles.title}>{onlyFavorites ? "Favorites" : `${videos.length} video${videos.length === 1 ? "" : "s"}`}</Text></View><Pressable onPress={addVideos} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><MaterialIcons color="#FFFFFF" name="add" size={21} /></Pressable></View>
            <View style={styles.searchBox}><MaterialIcons color="#6C7E95" name="search" size={20} /><TextInput autoCapitalize="none" onChangeText={setQuery} placeholder={onlyFavorites ? "Search favorites" : "Search videos"} placeholderTextColor="#8A99AA" returnKeyType="done" style={styles.searchInput} value={query} />{query ? <Pressable onPress={() => setQuery("")}><MaterialIcons color="#8A99AA" name="close" size={19} /></Pressable> : null}</View>
          </>
        }
        ListEmptyComponent={<View style={styles.emptyState}><View style={styles.emptyIcon}><Image source={require("../assets/images/icon.png")} style={styles.emptyImage} /></View><Text style={styles.emptyTitle}>{query ? "No matching videos" : onlyFavorites ? "No favorites yet" : "Your shelf is empty"}</Text><Text style={styles.emptyCopy}>{query ? "Try a different title or filename." : onlyFavorites ? "Tap the heart on a video to save it here." : "Import videos once and watch them without internet."}</Text>{!query && !onlyFavorites ? <Pressable onPress={addVideos} style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}><MaterialIcons color="#FFFFFF" name="video-library" size={19} /><Text style={styles.emptyButtonText}>Add Videos</Text></Pressable> : null}</View>}
        renderItem={({ item }) => {
          const active = item.index === currentIndex;
          const completion = item.video.duration > 0 ? Math.min((item.video.position || 0) / item.video.duration, 1) : 0;
          return <Pressable onPress={() => { loadVideo(item.index, true); router.push("/"); }} style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}><View style={styles.thumbnail}><Image source={require("../assets/images/icon.png")} style={styles.thumbnailImage} /><View style={styles.thumbnailShade}><MaterialIcons color="#FFFFFF" name={active ? "play-arrow" : "movie"} size={20} /></View></View><View style={styles.rowCopy}><Text numberOfLines={1} style={[styles.rowTitle, active && styles.rowTitleActive]}>{item.video.title}</Text><Text numberOfLines={1} style={styles.rowMeta}>{item.video.name}</Text><View style={styles.rowProgress}><View style={[styles.rowProgressFill, { width: `${completion * 100}%` }]} /></View></View><View style={styles.rowActions}><Pressable onPress={() => toggleFavorite(item.index)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons color={item.video.favorite ? "#FF7A30" : "#8796A8"} name={item.video.favorite ? "favorite" : "favorite-border"} size={21} /></Pressable><Pressable onPress={() => confirmRemove(item)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons color="#8796A8" name="more-vert" size={21} /></Pressable></View></Pressable>;
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: { alignItems: "center", backgroundColor: "#FF7A30", borderRadius: 999, elevation: 3, height: 45, justifyContent: "center", shadowColor: "#C94E15", shadowOpacity: 0.2, shadowRadius: 8, width: 45 },
  emptyButton: { alignItems: "center", backgroundColor: "#2F80ED", borderRadius: 999, flexDirection: "row", gap: 7, marginTop: 19, paddingHorizontal: 18, paddingVertical: 12 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  emptyContent: { flexGrow: 1, paddingBottom: 22, paddingHorizontal: 17 },
  emptyCopy: { color: "#7C8C9F", fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 255, textAlign: "center" },
  emptyIcon: { alignItems: "center", backgroundColor: "#12325B", borderRadius: 22, height: 80, justifyContent: "center", overflow: "hidden", width: 80 },
  emptyImage: { height: 62, width: 62 },
  emptyState: { alignItems: "center", flex: 1, justifyContent: "center", marginTop: 90, paddingHorizontal: 24 },
  emptyTitle: { color: "#12325B", fontSize: 21, fontWeight: "900", marginTop: 16 },
  eyebrow: { color: "#2F80ED", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingTop: 13 },
  iconButton: { alignItems: "center", height: 36, justifyContent: "center", width: 28 },
  listContent: { paddingBottom: 28, paddingHorizontal: 17 },
  pressed: { opacity: 0.7 },
  row: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.82)", borderColor: "#D7E3F0", borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 10, minHeight: 82, padding: 9 },
  rowActive: { backgroundColor: "#EEF6FF", borderColor: "#8CB8ED" },
  rowActions: { alignItems: "center", justifyContent: "center", marginLeft: 5 },
  rowCopy: { flex: 1, marginLeft: 11, minWidth: 0 },
  rowMeta: { color: "#7C8C9F", fontSize: 11, marginTop: 4 },
  rowProgress: { backgroundColor: "#DDE7F1", borderRadius: 3, height: 4, marginTop: 9, overflow: "hidden" },
  rowProgressFill: { backgroundColor: "#FF7A30", borderRadius: 3, height: 4 },
  rowTitle: { color: "#16375F", fontSize: 14, fontWeight: "900" },
  rowTitleActive: { color: "#2F80ED" },
  screen: { backgroundColor: "#FFF8F1", flex: 1 },
  searchBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.84)", borderColor: "#D8E4F0", borderRadius: 16, borderWidth: 1, flexDirection: "row", height: 49, marginBottom: 17, paddingHorizontal: 13 },
  searchInput: { color: "#16375F", flex: 1, fontSize: 14, marginLeft: 8 },
  thumbnail: { backgroundColor: "#12325B", borderRadius: 13, height: 62, overflow: "hidden", width: 78 },
  thumbnailImage: { height: "100%", opacity: 0.48, width: "100%" },
  thumbnailShade: { alignItems: "center", backgroundColor: "rgba(18,50,91,0.44)", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 },
  title: { color: "#12325B", fontSize: 28, fontWeight: "900", marginTop: 2 },
});
