import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Modal, SafeAreaView, StyleSheet, View } from "react-native";

import { AdBanner } from "./src/monetization/AdBanner";
import { DetailScreen } from "./src/screens/DetailScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { RecordScreen } from "./src/screens/RecordScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ShareScreen } from "./src/screens/ShareScreen";
import { colors } from "./src/theme";
import { useSessions } from "./src/useSessions";

export default function App() {
  const { cumulatives, loading, addSession } = useSessions();
  const [recording, setRecording] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.ink} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <HomeScreen
        cumulatives={cumulatives}
        onAdd={() => setRecording(true)}
        onShare={(id) => setShareId(id)}
        onSettings={() => setSettingsOpen(true)}
        onOpen={(id) => setDetailId(id)}
      />

      <AdBanner />

      <Modal visible={recording} animationType="slide" presentationStyle="pageSheet">
        <RecordScreen
          onCancel={() => setRecording(false)}
          onSave={(input) => {
            addSession(input);
            setRecording(false);
          }}
        />
      </Modal>

      <Modal
        visible={shareId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShareId(null)}
      >
        {shareId && (
          <ShareScreen
            cumulative={cumulatives[shareId]}
            onClose={() => setShareId(null)}
          />
        )}
      </Modal>

      <Modal
        visible={detailId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailId(null)}
      >
        {detailId && (
          <DetailScreen
            cumulative={cumulatives[detailId]}
            onClose={() => setDetailId(null)}
            onShare={() => {
              const id = detailId;
              setDetailId(null);
              setShareId(id);
            }}
          />
        )}
      </Modal>

      <Modal
        visible={settingsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <SettingsScreen onClose={() => setSettingsOpen(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
