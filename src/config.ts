import { Platform } from "react-native";

/**
 * アプリ全体の設定を 1 か所に集約する。
 * 本番のキーやユーザー名はここ（もしくは環境変数）で差し替える。
 */

/** Ko-fi の応援ページ。<your-name> を自分のユーザー名に置き換える。 */
export const KOFI_URL = "https://ko-fi.com/your-name";

/**
 * 広告を有効にするか。開発中や、将来「応援者は広告オフ」を実装する際に使う。
 * 現状は常に true（Expo Go ではネイティブ広告モジュールが無いため自動で非表示になる）。
 */
export const ADS_ENABLED = true;

/**
 * AdMob のバナー広告ユニット ID。
 * 既定は Google 公式のテスト ID。本番は自分のユニット ID に差し替えること。
 * （テスト以外の実 ID を開発中に叩くとポリシー違反になるので注意）
 */
export const ADMOB_BANNER_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3940256099942544/2934735716", // TEST（iOS）
  android: "ca-app-pub-3940256099942544/6300978111", // TEST（Android）
  default: "ca-app-pub-3940256099942544/6300978111",
}) as string;
