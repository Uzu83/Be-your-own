import { RefObject } from "react";
import { View } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

/**
 * 指定した View を PNG 画像に変換し、OS の共有シートで共有する。
 * 共有不可の環境（未対応プラットフォーム）では false を返す。
 */
export async function shareCardImage(
  ref: RefObject<View | null>
): Promise<boolean> {
  if (!ref.current) return false;

  const uri = await captureRef(ref, {
    format: "png",
    quality: 1,
    // 高解像度で書き出す（Retina 相当）。
    result: "tmpfile",
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) return false;

  await Sharing.shareAsync(uri, {
    mimeType: "image/png",
    dialogTitle: "積み上げた記録を共有",
  });
  return true;
}
