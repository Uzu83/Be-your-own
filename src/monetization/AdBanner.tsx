import { View } from "react-native";

import { ADMOB_BANNER_UNIT_ID, ADS_ENABLED } from "../config";
import { colors } from "../theme";

/**
 * 画面下の控えめなバナー広告。
 *
 * react-native-google-mobile-ads はネイティブモジュールなので Expo Go では動かない。
 * そこで動的 require を try/catch で包み、モジュールが無ければ何も描画しない
 * （＝ Expo Go でもアプリはそのまま動く。dev build / 本番でのみ広告が出る）。
 */
export function AdBanner() {
  if (!ADS_ENABLED) return null;

  let BannerAd: any;
  let BannerAdSize: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ads = require("react-native-google-mobile-ads");
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch {
    return null; // モジュール未導入（Expo Go 等）
  }
  if (!BannerAd) return null;

  return (
    <View style={{ alignItems: "center", backgroundColor: colors.bg }}>
      <BannerAd
        unitId={ADMOB_BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
