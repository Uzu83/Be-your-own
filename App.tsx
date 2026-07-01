import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Modal, SafeAreaView, StyleSheet, View } from "react-native";

import { HomeScreen } from "./src/screens/HomeScreen";
import { RecordScreen } from "./src/screens/RecordScreen";
import { colors } from "./src/theme";
import { useSessions } from "./src/useSessions";

export default function App() {
  const { cumulatives, loading, addSession } = useSessions();
  const [recording, setRecording] = useState(false);

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
      <HomeScreen cumulatives={cumulatives} onAdd={() => setRecording(true)} />

      <Modal visible={recording} animationType="slide" presentationStyle="pageSheet">
        <RecordScreen
          onCancel={() => setRecording(false)}
          onSave={(input) => {
            addSession(input);
            setRecording(false);
          }}
        />
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
