import React, { useId } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Rect,
  Path,
  G,
  Line,
} from 'react-native-svg';

export interface ProgressiveCoinProps {
  currentAmount: number;
  targetPrice: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgressiveCoin: React.FC<ProgressiveCoinProps> = ({
  currentAmount,
  targetPrice,
  size = 120,
  style,
}) => {
  const percent = targetPrice > 0 ? Math.min(100, Math.max(0, (currentAmount / targetPrice) * 100)) : 0;
  const isCompleted = percent >= 100;

  // React unique ID for SVG clip path to avoid ID collisions across lists
  const reactId = useId ? useId().replace(/:/g, '') : Math.random().toString(36).substring(2, 9);
  const clipId = `coinFillClip_${reactId}`;
  const shadowGradId = `shadowGrad_${reactId}`;
  const waterlineGradId = `waterlineGrad_${reactId}`;

  // Uncolored Slate Medallion Gradients (0% Base State)
  const dullRimId = `dullRimGrad_${reactId}`;
  const dullFaceId = `dullFaceGrad_${reactId}`;
  const dullSymbolId = `dullSymbolGrad_${reactId}`;

  // Radiant Emerald-Mint Bullion Gradients (>0% Liquid Progress Fill)
  const emeraldRimId = `emeraldRimGrad_${reactId}`;
  const emeraldFaceId = `emeraldFaceGrad_${reactId}`;
  const emeraldSymbolId = `emeraldSymbolGrad_${reactId}`;

  // Coin spans from y=10 to y=142 (height = 132, centered at cx=80, cy=76)
  const coinTop = 10;
  const coinHeight = 132;
  const fillHeight = isCompleted ? 160 : (coinHeight * percent) / 100;
  const fillY = isCompleted ? 0 : coinTop + coinHeight - fillHeight;

  // Exact chord calculation for waterline within the r=65 medallion face
  const coinCenterY = 76;
  const coinRadius = 65;
  const dy = Math.abs(fillY - coinCenterY);
  const dx = dy < coinRadius ? Math.sqrt(coinRadius * coinRadius - dy * dy) : 0;
  const chordLeft = Math.max(15, 80 - dx);
  const chordRight = Math.min(145, 80 + dx);
  const coinCircleClipId = `coinCircleClip_${reactId}`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Defs>
          {/* Soft Ground Drop Shadow */}
          <RadialGradient id={shadowGradId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
            <Stop offset="60%" stopColor="#000000" stopOpacity="0.20" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Liquid Rising Fill Meniscus Gradient */}
          <LinearGradient id={waterlineGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#34D399" stopOpacity="0" />
            <Stop offset="25%" stopColor="#6EE7B7" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="75%" stopColor="#6EE7B7" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </LinearGradient>

          {/* Medallion Circular Boundary Clip Path */}
          <ClipPath id={coinCircleClipId}>
            <Circle cx="80" cy="76" r="65.5" />
          </ClipPath>

          {/* Rising Liquid Fill Clip Path */}
          <ClipPath id={clipId}>
            <Rect x="0" y={fillY} width="160" height={fillHeight + 10} />
          </ClipPath>

          {/* BASE: Titanium-Slate Uncolored Medallion (0% State) */}
          <LinearGradient id={dullRimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#475569" />
            <Stop offset="30%" stopColor="#334155" />
            <Stop offset="70%" stopColor="#142F26" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>
          <RadialGradient id={dullFaceId} cx="42%" cy="38%" r="65%">
            <Stop offset="0%" stopColor="#142F26" />
            <Stop offset="65%" stopColor="#111827" />
            <Stop offset="100%" stopColor="#07130F" />
          </RadialGradient>
          <LinearGradient id={dullSymbolId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#94A3B8" />
            <Stop offset="50%" stopColor="#64748B" />
            <Stop offset="100%" stopColor="#334155" />
          </LinearGradient>

          {/* PROGRESS: Radiant Kansya Emerald-Mint Bullion (>0% State) */}
          <LinearGradient id={emeraldRimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ECFDF5" />
            <Stop offset="22%" stopColor="#6EE7B7" />
            <Stop offset="50%" stopColor="#10B981" />
            <Stop offset="80%" stopColor="#047857" />
            <Stop offset="100%" stopColor="#022C22" />
          </LinearGradient>
          <RadialGradient id={emeraldFaceId} cx="42%" cy="36%" r="64%">
            <Stop offset="0%" stopColor="#059669" />
            <Stop offset="35%" stopColor="#047857" />
            <Stop offset="75%" stopColor="#064E3B" />
            <Stop offset="100%" stopColor="#022C22" />
          </RadialGradient>
          <LinearGradient id={emeraldSymbolId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="28%" stopColor="#ECFDF5" />
            <Stop offset="65%" stopColor="#6EE7B7" />
            <Stop offset="100%" stopColor="#10B981" />
          </LinearGradient>
        </Defs>

        {/* 1. SOFT 3D GROUND DROP SHADOW */}
        <Ellipse
          cx="80"
          cy="151"
          rx="52"
          ry="7"
          fill={`url(#${shadowGradId})`}
        />

        {/* 100% Completed Ambient Emerald Halo */}
        {isCompleted && (
          <Circle
            cx="80"
            cy="76"
            r="74"
            fill="rgba(16, 185, 129, 0.22)"
          />
        )}

        {/* ============================================================ */}
        {/* 2. BASE LAYER: TITANIUM-SLATE BULLION MEDALLION (0% Baseline) */}
        {/* ============================================================ */}
        <G>
          {/* Outer Chamfered Rim */}
          <Circle
            cx="80"
            cy="76"
            r="66"
            fill={`url(#${dullRimId})`}
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Micro-milled Reeded Coin Teeth */}
          <Circle
            cx="80"
            cy="76"
            r="63.5"
            stroke="#475569"
            strokeWidth="2.5"
            strokeDasharray="2, 2.5"
            fill="none"
          />

          {/* Stepped Inner Inset Bevel */}
          <Circle
            cx="80"
            cy="76"
            r="60"
            fill="none"
            stroke="#142F26"
            strokeWidth="1.5"
          />

          {/* Recessed Medallion Inner Face */}
          <Circle
            cx="80"
            cy="76"
            r="56"
            fill={`url(#${dullFaceId})`}
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Stamped Concentric Micro-Bead Ridge */}
          <Circle
            cx="80"
            cy="76"
            r="48"
            fill="none"
            stroke="#334155"
            strokeWidth="1.2"
            strokeDasharray="3, 3"
            opacity={0.65}
          />
          <Circle
            cx="80"
            cy="76"
            r="45"
            fill="none"
            stroke="#142F26"
            strokeWidth="1"
          />

          {/* Embossed Philippine Peso (₱) Symbol — Slate Relief */}
          {/* Deep Inset Shadow */}
          <G fill="#020617" transform="translate(0, 1.8)">
            <Rect x="67" y="52" width="9" height="48" rx="2" />
            <Path d="M72 52 H85 C93 52 98 57 98 65 C98 73 93 78 85 78 H72 V52 Z M76 60 V70 H84 C88 70 90 68 90 65 C90 62 88 60 84 60 H76 Z" />
            <Rect x="59" y="61.5" width="34" height="4" rx="1.5" />
            <Rect x="59" y="69.5" width="34" height="4" rx="1.5" />
          </G>

          {/* Subtle Top Inset Glint */}
          <G fill="#FFFFFF" fillOpacity={0.12} transform="translate(0, -0.8)">
            <Rect x="67" y="52" width="9" height="48" rx="2" />
            <Path d="M72 52 H85 C93 52 98 57 98 65 C98 73 93 78 85 78 H72 V52 Z M76 60 V70 H84 C88 70 90 68 90 65 C90 62 88 60 84 60 H76 Z" />
            <Rect x="59" y="61.5" width="34" height="4" rx="1.5" />
            <Rect x="59" y="69.5" width="34" height="4" rx="1.5" />
          </G>

          {/* Main Slate Symbol Face */}
          <G fill={`url(#${dullSymbolId})`}>
            <Rect x="67" y="52" width="9" height="48" rx="2" />
            <Path d="M72 52 H85 C93 52 98 57 98 65 C98 73 93 78 85 78 H72 V52 Z M76 60 V70 H84 C88 70 90 68 90 65 C90 62 88 60 84 60 H76 Z" />
            <Rect x="59" y="61.5" width="34" height="4" rx="1.5" />
            <Rect x="59" y="69.5" width="34" height="4" rx="1.5" />
          </G>
        </G>

        {/* ============================================================ */}
        {/* 3. PROGRESS LAYER: KANSYA EMERALD-MINT BULLION (Dynamic Fill) */}
        {/* ============================================================ */}
        {percent > 0 && (
          <G clipPath={`url(#${clipId})`}>
            {/* Outer Beveled Emerald Bullion Rim */}
            <Circle
              cx="80"
              cy="76"
              r="66"
              fill={`url(#${emeraldRimId})`}
              stroke="#6EE7B7"
              strokeWidth="2"
            />

            {/* Glowing Micro-milled Reeded Coin Teeth */}
            <Circle
              cx="80"
              cy="76"
              r="63.5"
              stroke="#A7F3D0"
              strokeWidth="2.5"
              strokeDasharray="2, 2.5"
              fill="none"
            />

            {/* Stepped Inner Inset Bevel */}
            <Circle
              cx="80"
              cy="76"
              r="60"
              fill="none"
              stroke="#047857"
              strokeWidth="1.5"
            />

            {/* Recessed Jewel Emerald Coin Face */}
            <Circle
              cx="80"
              cy="76"
              r="56"
              fill={`url(#${emeraldFaceId})`}
              stroke="#064E3B"
              strokeWidth="2"
            />

            {/* Stamped Concentric Emerald Micro-Bead Ridge */}
            <Circle
              cx="80"
              cy="76"
              r="48"
              fill="none"
              stroke="#34D399"
              strokeWidth="1.2"
              strokeDasharray="3, 3"
              opacity={0.8}
            />
            <Circle
              cx="80"
              cy="76"
              r="45"
              fill="none"
              stroke="#10B981"
              strokeWidth="1"
              opacity={0.65}
            />

            {/* Embossed Philippine Peso (₱) Symbol — Emerald Bullion Relief */}
            {/* Deep Obsidian-Emerald Shadow */}
            <G fill="#022C22" transform="translate(0, 1.8)">
              <Rect x="67" y="52" width="9" height="48" rx="2" />
              <Path d="M72 52 H85 C93 52 98 57 98 65 C98 73 93 78 85 78 H72 V52 Z M76 60 V70 H84 C88 70 90 68 90 65 C90 62 88 60 84 60 H76 Z" />
              <Rect x="59" y="61.5" width="34" height="4" rx="1.5" />
              <Rect x="59" y="69.5" width="34" height="4" rx="1.5" />
            </G>

            {/* Crisp White/Mint Specular Highlight */}
            <G fill="#FFFFFF" fillOpacity={0.85} transform="translate(0, -0.8)">
              <Rect x="67" y="52" width="9" height="48" rx="2" />
              <Path d="M72 52 H85 C93 52 98 57 98 65 C98 73 93 78 85 78 H72 V52 Z M76 60 V70 H84 C88 70 90 68 90 65 C90 62 88 60 84 60 H76 Z" />
              <Rect x="59" y="61.5" width="34" height="4" rx="1.5" />
              <Rect x="59" y="69.5" width="34" height="4" rx="1.5" />
            </G>

            {/* Main Mint-Emerald Symbol Face */}
            <G fill={`url(#${emeraldSymbolId})`}>
              <Rect x="67" y="52" width="9" height="48" rx="2" />
              <Path d="M72 52 H85 C93 52 98 57 98 65 C98 73 93 78 85 78 H72 V52 Z M76 60 V70 H84 C88 70 90 68 90 65 C90 62 88 60 84 60 H76 Z" />
              <Rect x="59" y="61.5" width="34" height="4" rx="1.5" />
              <Rect x="59" y="69.5" width="34" height="4" rx="1.5" />
            </G>
          </G>
        )}

        {/* ============================================================ */}
        {/* 4. LIQUID MENISCUS & WATERLINE GLOW (Active when 1% - 99%)  */}
        {/* ============================================================ */}
        {percent > 0 && percent < 100 && dx > 2 && (
          <G clipPath={`url(#${coinCircleClipId})`}>
            {/* Ambient emerald diffuse backlight */}
            <Line
              x1={chordLeft}
              y1={fillY}
              x2={chordRight}
              y2={fillY}
              stroke="#10B981"
              strokeWidth="5"
              strokeOpacity={0.45}
              strokeLinecap="round"
            />
            {/* Crisp radiant mint specular meniscus */}
            <Line
              x1={chordLeft}
              y1={fillY}
              x2={chordRight}
              y2={fillY}
              stroke={`url(#${waterlineGradId})`}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </G>
        )}

        {/* ============================================================ */}
        {/* 5. CELEBRATORY EMERALD & MINT SPARKLES (At 100% Completed)   */}
        {/* ============================================================ */}
        {isCompleted && (
          <G>
            {/* Top Right Radiant Diamond Sparkle */}
            <Path
              d="M136 22 C136 28 140 31 146 31 C140 31 136 34 136 40 C136 34 132 31 126 31 C132 31 136 28 136 22 Z"
              fill="#FFFFFF"
            />
            <Circle cx="136" cy="31" r="2" fill="#6EE7B7" />

            {/* Bottom Left Radiant Diamond Sparkle */}
            <Path
              d="M24 118 C24 122 27 125 31 125 C27 125 24 128 24 132 C24 128 21 125 17 125 C21 125 24 122 24 118 Z"
              fill="#FFFFFF"
            />
            <Circle cx="24" cy="125" r="1.6" fill="#34D399" />

            {/* Top Left Micro-Glint */}
            <Circle cx="32" cy="40" r="1.5" fill="#ECFDF5" opacity={0.9} />
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
